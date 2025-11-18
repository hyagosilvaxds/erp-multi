'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  ArrowRightLeft,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Eye,
  Package,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { usePermissions } from '@/hooks/use-permissions'
import {
  stockTransfersApi,
  type StockTransfer,
  type TransferStatus,
} from '@/lib/api/products'

const statusConfig = {
  PENDING: {
    label: 'Pendente',
    icon: Clock,
    variant: 'secondary' as const,
    color: 'text-yellow-600',
  },
  IN_TRANSIT: {
    label: 'Em Trânsito',
    icon: Truck,
    variant: 'default' as const,
    color: 'text-blue-600',
  },
  COMPLETED: {
    label: 'Concluída',
    icon: CheckCircle2,
    variant: 'default' as const,
    color: 'text-green-600',
  },
  CANCELLED: {
    label: 'Cancelada',
    icon: XCircle,
    variant: 'destructive' as const,
    color: 'text-red-600',
  },
}

export default function StockTransfersPage() {
  const router = useRouter()
  const [transfers, setTransfers] = useState<StockTransfer[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TransferStatus | 'all'>('all')

  const { toast } = useToast()
  const permissions = usePermissions('company')

  const canCreate = permissions.can('produtos', 'create')
  const canView = permissions.can('produtos', 'view')

  useEffect(() => {
    loadTransfers()
  }, [activeTab])

  const loadTransfers = async () => {
    try {
      setLoading(true)
      const params = activeTab === 'all' ? {} : { status: activeTab as TransferStatus }
      const response = await stockTransfersApi.getAll(params)
      
      // A API pode retornar um array direto ou um objeto paginado
      if (Array.isArray(response)) {
        setTransfers(response)
      } else {
        setTransfers(response.data || [])
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar',
        description: error.response?.data?.message || 'Não foi possível carregar as transferências.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: TransferStatus) => {
    const config = statusConfig[status]
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const handleViewTransfer = (id: string) => {
    router.push(`/dashboard/produtos/estoque/transferencias/${id}`)
  }

  const handleNewTransfer = () => {
    router.push('/dashboard/produtos/estoque/transferencias/nova')
  }

  const handleApprove = async (id: string) => {
    if (!confirm('Deseja aprovar esta transferência?')) return

    try {
      await stockTransfersApi.approve(id)
      toast({
        title: 'Transferência aprovada',
        description: 'A transferência foi aprovada e está em trânsito.',
      })
      loadTransfers()
    } catch (error: any) {
      toast({
        title: 'Erro ao aprovar',
        description: error.response?.data?.message || 'Não foi possível aprovar a transferência.',
        variant: 'destructive',
      })
    }
  }

  const handleComplete = async (id: string) => {
    if (!confirm('Deseja concluir esta transferência? Os estoques serão atualizados.')) return

    try {
      await stockTransfersApi.complete(id)
      toast({
        title: 'Transferência concluída',
        description: 'Os estoques foram atualizados com sucesso.',
      })
      loadTransfers()
    } catch (error: any) {
      toast({
        title: 'Erro ao concluir',
        description: error.response?.data?.message || 'Não foi possível concluir a transferência.',
        variant: 'destructive',
      })
    }
  }

  const handleCancel = async (id: string) => {
    const reason = prompt('Motivo do cancelamento:')
    if (!reason) return

    try {
      await stockTransfersApi.cancel(id, reason)
      toast({
        title: 'Transferência cancelada',
        description: 'A transferência foi cancelada com sucesso.',
      })
      loadTransfers()
    } catch (error: any) {
      toast({
        title: 'Erro ao cancelar',
        description: error.response?.data?.message || 'Não foi possível cancelar a transferência.',
        variant: 'destructive',
      })
    }
  }

  const countByStatus = (status: TransferStatus) => {
    return transfers.filter((t) => t.status === status).length
  }

  const filteredTransfers = activeTab === 'all' 
    ? transfers 
    : transfers.filter((t) => t.status === activeTab)

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Transferências de Estoque</h1>
          <p className="text-muted-foreground">
            Gerencie transferências entre locais de estoque
          </p>
        </div>
        {canCreate && (
          <Button onClick={handleNewTransfer}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Transferência
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="w-4 h-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{countByStatus('PENDING')}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Em Trânsito</CardTitle>
              <Truck className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{countByStatus('IN_TRANSIT')}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{countByStatus('COMPLETED')}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
              <XCircle className="w-4 h-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{countByStatus('CANCELLED')}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="PENDING">Pendentes</TabsTrigger>
          <TabsTrigger value="IN_TRANSIT">Em Trânsito</TabsTrigger>
          <TabsTrigger value="COMPLETED">Concluídas</TabsTrigger>
          <TabsTrigger value="CANCELLED">Canceladas</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Transferências</CardTitle>
              <CardDescription>
                {activeTab === 'all' 
                  ? 'Lista de todas as transferências' 
                  : `Lista de transferências ${statusConfig[activeTab as TransferStatus]?.label.toLowerCase()}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!loading && filteredTransfers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <ArrowRightLeft className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma transferência encontrada</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {activeTab === 'all' 
                      ? 'Comece criando a primeira transferência.' 
                      : 'Não há transferências com este status.'}
                  </p>
                  {canCreate && activeTab === 'all' && (
                    <Button onClick={handleNewTransfer}>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeira Transferência
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Origem</TableHead>
                      <TableHead>Destino</TableHead>
                      <TableHead>Itens</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransfers.map((transfer) => (
                      <TableRow key={transfer.id}>
                        <TableCell className="font-mono font-medium">
                          {transfer.code}
                        </TableCell>
                        <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{transfer.fromLocation.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {transfer.fromLocation.code}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{transfer.toLocation.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {transfer.toLocation.code}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Package className="w-4 h-4 text-muted-foreground" />
                            <span>{transfer.items.length}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(transfer.requestedAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            {/* Botão Ver */}
                            {canView && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewTransfer(transfer.id)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                            
                            {/* Botão Aprovar (somente PENDING) */}
                            {transfer.status === 'PENDING' && canCreate && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApprove(transfer.id)}
                              >
                                Aprovar
                              </Button>
                            )}
                            
                            {/* Botão Concluir (somente IN_TRANSIT) */}
                            {transfer.status === 'IN_TRANSIT' && canCreate && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleComplete(transfer.id)}
                              >
                                Concluir
                              </Button>
                            )}
                            
                            {/* Botão Cancelar (PENDING ou IN_TRANSIT) */}
                            {(transfer.status === 'PENDING' || transfer.status === 'IN_TRANSIT') &&
                              canCreate && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleCancel(transfer.id)}
                                >
                                  Cancelar
                                </Button>
                              )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </DashboardLayout>
  )
}
