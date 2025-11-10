'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Filter, Download, Package, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { usePermissions } from '@/hooks/use-permissions'
import {
  productsApi,
  stockLocationsApi,
  type Product,
  type StockLocation,
  type StockMovement,
  type StockMovementType,
} from '@/lib/api/products'
import { DocumentDownloadButton } from '@/components/documents/download-button'

const movementTypeLabels: Record<StockMovementType, string> = {
  ENTRY: 'Entrada',
  EXIT: 'Saída',
  ADJUSTMENT: 'Ajuste',
  RETURN: 'Devolução',
  LOSS: 'Perda',
  TRANSFER: 'Transferência',
}

const movementTypeColors: Record<StockMovementType, string> = {
  ENTRY: 'bg-green-100 text-green-800',
  EXIT: 'bg-red-100 text-red-800',
  ADJUSTMENT: 'bg-blue-100 text-blue-800',
  RETURN: 'bg-yellow-100 text-yellow-800',
  LOSS: 'bg-orange-100 text-orange-800',
  TRANSFER: 'bg-purple-100 text-purple-800',
}

const movementTypeIcons: Record<StockMovementType, any> = {
  ENTRY: TrendingUp,
  EXIT: TrendingDown,
  ADJUSTMENT: RefreshCw,
  RETURN: RefreshCw,
  LOSS: TrendingDown,
  TRANSFER: RefreshCw,
}

export default function StockMovementsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { can } = usePermissions('company')

  const [movements, setMovements] = useState<StockMovement[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [locations, setLocations] = useState<StockLocation[]>([])
  const [loading, setLoading] = useState(true)

  // Filtros
  const [selectedProduct, setSelectedProduct] = useState<string>('all')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  const canManageStock = can('produtos', 'edit')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [productsData, locationsData] = await Promise.all([
        productsApi.getAll({}),
        stockLocationsApi.getAll(),
      ])
      // Filtrar apenas produtos que gerenciam estoque
      setProducts(productsData.products.filter((p) => p.manageStock))
      setLocations(locationsData.filter((l) => l.active))
      
      // Carregar todas as movimentações (você precisará criar este endpoint)
      // Por enquanto, vamos deixar vazio
      setMovements([])
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar dados',
        description: error.response?.data?.message || 'Não foi possível carregar os dados.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const loadMovements = async () => {
    if (!selectedProduct || selectedProduct === 'all') return

    try {
      setLoading(true)
      const filters: any = {}
      
      if (selectedType && selectedType !== 'all') filters.type = selectedType
      if (selectedLocation && selectedLocation !== 'all') filters.locationId = selectedLocation
      if (startDate) filters.startDate = startDate
      if (endDate) filters.endDate = endDate

      const data = await productsApi.getStockMovements(selectedProduct, filters)
      setMovements(data.data || [])
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar movimentações',
        description: error.response?.data?.message || 'Não foi possível carregar as movimentações.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedProduct && selectedProduct !== 'all') {
      loadMovements()
    }
  }, [selectedProduct, selectedType, selectedLocation, startDate, endDate])

  const clearFilters = () => {
    setSelectedProduct('all')
    setSelectedLocation('all')
    setSelectedType('all')
    setStartDate('')
    setEndDate('')
    setMovements([])
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getMovementIcon = (type: StockMovementType) => {
    const Icon = movementTypeIcons[type]
    return <Icon className="w-4 h-4" />
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Movimentações de Estoque</h1>
            <p className="text-muted-foreground">
              Histórico de entradas, saídas e ajustes de estoque
            </p>
          </div>
          {canManageStock && (
            <Link href="/dashboard/produtos/estoque/movimentacoes/nova">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Movimentação
              </Button>
            </Link>
          )}
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtros
            </CardTitle>
            <CardDescription>
              Filtre as movimentações por produto, tipo, local e período
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label>Produto *</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="ENTRY">Entrada</SelectItem>
                    <SelectItem value="EXIT">Saída</SelectItem>
                    <SelectItem value="ADJUSTMENT">Ajuste</SelectItem>
                    <SelectItem value="RETURN">Devolução</SelectItem>
                    <SelectItem value="LOSS">Perda</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Local</Label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os locais" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name} ({location.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data Inicial</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Data Final</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Limpar Filtros
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Movimentações */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Movimentações</CardTitle>
            <CardDescription>
              {movements.length > 0
                ? `${movements.length} movimentação(ões) encontrada(s)`
                : 'Selecione um produto para ver as movimentações'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedProduct ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Selecione um produto
                </h3>
                <p className="text-muted-foreground">
                  Escolha um produto nos filtros acima para visualizar suas movimentações
                </p>
              </div>
            ) : movements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Nenhuma movimentação encontrada
                </h3>
                <p className="text-muted-foreground mb-4">
                  Não há movimentações para os filtros selecionados
                </p>
                {canManageStock && (
                  <Link href="/dashboard/produtos/estoque/movimentacoes/nova">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Movimentação
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Estoque Anterior</TableHead>
                      <TableHead>Estoque Novo</TableHead>
                      <TableHead>Local</TableHead>
                      <TableHead>Motivo</TableHead>
                      
                      <TableHead>Documento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(movement.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge className={movementTypeColors[movement.type]}>
                            <span className="flex items-center gap-1">
                              {getMovementIcon(movement.type)}
                              {movementTypeLabels[movement.type]}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {movement.type === 'ENTRY' || movement.type === 'RETURN' ? '+' : '-'}
                          {movement.quantity}
                        </TableCell>
                        <TableCell>{movement.previousStock}</TableCell>
                        <TableCell className="font-semibold">
                          {movement.newStock}
                        </TableCell>
                        <TableCell>
                          {movement.location?.name || '-'}
                          {movement.location?.code && (
                            <span className="text-muted-foreground ml-1">
                              ({movement.location.code})
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {movement.reason || '-'}
                        </TableCell>
                       
                        <TableCell>
                          {movement.document ? (
                            <DocumentDownloadButton
                              documentId={movement.document.id}
                              fileName={movement.document.fileName}
                            />
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
