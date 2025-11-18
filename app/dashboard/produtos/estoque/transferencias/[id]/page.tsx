'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Package,
  MapPin,
  User,
  Calendar,
  FileText,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { usePermissions } from '@/hooks/use-permissions'
import { stockTransfersApi, type StockTransfer } from '@/lib/api/products'
import { documentsApi, type Document } from '@/lib/api/documents'
import { DocumentDownloadButton } from '@/components/documents/download-button'

const statusConfig = {
  PENDING: {
    label: 'Pendente',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  IN_TRANSIT: {
    label: 'Em Trânsito',
    icon: Truck,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  COMPLETED: {
    label: 'Concluída',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  CANCELLED: {
    label: 'Cancelada',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
}

export default function TransferDetailPage() {
  const params = useParams()
  const router = useRouter()
  const transferId = params.id as string

  const [transfer, setTransfer] = useState<StockTransfer | null>(null)
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingDocument, setLoadingDocument] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const { toast } = useToast()
  const permissions = usePermissions('company')

  const canManage = permissions.can('produtos', 'edit')

  useEffect(() => {
    loadTransfer()
  }, [transferId])

  const loadTransfer = async () => {
    try {
      setLoading(true)
      const data = await stockTransfersApi.getById(transferId)
      setTransfer(data)
      
      // Se houver documentId, buscar os detalhes do documento
      if (data.documentId) {
        loadDocument(data.documentId)
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar',
        description: error.response?.data?.message || 'Não foi possível carregar a transferência.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const loadDocument = async (documentId: string) => {
    try {
      setLoadingDocument(true)
      const doc = await documentsApi.getById(documentId)
      setDocument(doc)
    } catch (error: any) {
      console.error('Erro ao carregar documento:', error)
      // Não mostrar toast de erro para não poluir a UI
      // O documento simplesmente não será exibido
    } finally {
      setLoadingDocument(false)
    }
  }

  const handleApprove = async () => {
    if (!transfer) return

    try {
      setActionLoading(true)
      await stockTransfersApi.approve(transfer.id)
      toast({
        title: 'Transferência aprovada',
        description: 'A transferência foi aprovada e está em trânsito.',
      })
      loadTransfer()
      setShowApproveDialog(false)
    } catch (error: any) {
      toast({
        title: 'Erro ao aprovar',
        description: error.response?.data?.message || 'Não foi possível aprovar a transferência.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!transfer) return

    try {
      setActionLoading(true)
      await stockTransfersApi.complete(transfer.id)
      toast({
        title: 'Transferência concluída',
        description: 'Os estoques foram movimentados com sucesso.',
      })
      loadTransfer()
      setShowCompleteDialog(false)
    } catch (error: any) {
      toast({
        title: 'Erro ao concluir',
        description: error.response?.data?.message || 'Não foi possível concluir a transferência.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!transfer) return

    try {
      setActionLoading(true)
      await stockTransfersApi.cancel(transfer.id)
      toast({
        title: 'Transferência cancelada',
        description: 'A transferência foi cancelada.',
      })
      loadTransfer()
      setShowCancelDialog(false)
    } catch (error: any) {
      toast({
        title: 'Erro ao cancelar',
        description: error.response?.data?.message || 'Não foi possível cancelar a transferência.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!transfer) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>Transferência não encontrada</AlertDescription>
      </Alert>
    )
  }

  const config = statusConfig[transfer.status]
  const StatusIcon = config.icon

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold font-mono">{transfer.code}</h1>
              <Badge className={`${config.color} ${config.bgColor}`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {config.label}
              </Badge>
            </div>
            <p className="text-muted-foreground">Detalhes da transferência</p>
          </div>
        </div>

        {/* Actions */}
        {canManage && (
          <div className="flex gap-2">
            {transfer.status === 'PENDING' && (
              <>
                <Button onClick={() => setShowApproveDialog(true)}>
                  <Truck className="w-4 h-4 mr-2" />
                  Aprovar
                </Button>
                <Button variant="outline" onClick={() => setShowCompleteDialog(true)}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Concluir Direto
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowCancelDialog(true)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </>
            )}

            {transfer.status === 'IN_TRANSIT' && (
              <>
                <Button onClick={() => setShowCompleteDialog(true)}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Concluir
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowCancelDialog(true)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Origin */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Local de Origem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-lg font-semibold">{transfer.fromLocation.name}</p>
              <p className="text-sm text-muted-foreground font-mono">
                {transfer.fromLocation.code}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Destination */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Local de Destino
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-lg font-semibold">{transfer.toLocation.name}</p>
              <p className="text-sm text-muted-foreground font-mono">
                {transfer.toLocation.code}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Linha do Tempo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Solicitada</p>
              <p className="text-sm text-muted-foreground">
                {new Date(transfer.requestedAt).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>

          {transfer.approvedAt && (
            <>
              <Separator />
              <div className="flex items-start gap-4">
                <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Aprovada</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(transfer.approvedAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </>
          )}

          {transfer.completedAt && (
            <>
              <Separator />
              <div className="flex items-start gap-4">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Concluída</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(transfer.completedAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Produtos ({transfer.items.length})
          </CardTitle>
          <CardDescription>Lista de produtos na transferência</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead>Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfer.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.product.name}</TableCell>
                  <TableCell className="font-mono text-sm">{item.product.sku}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {item.notes || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Notes */}
      {transfer.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Observações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{transfer.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Document */}
      {loadingDocument && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documento Anexado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      )}

      {!loadingDocument && document && (
        <DocumentDownloadButton
          documentId={document.id}
          variant="card"
          document={{
            fileName: document.fileName,
            fileSize: document.fileSize || document.size,
            mimeType: document.mimeType,
            uploadedBy: document.uploadedBy,
            createdAt: document.createdAt,
          }}
        />
      )}

      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aprovar Transferência</AlertDialogTitle>
            <AlertDialogDescription>
              Confirma a aprovação desta transferência? O status mudará para "Em Trânsito".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} disabled={actionLoading}>
              {actionLoading ? 'Aprovando...' : 'Aprovar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Dialog */}
      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Concluir Transferência</AlertDialogTitle>
            <AlertDialogDescription>
              Confirma a conclusão desta transferência? Os estoques serão movimentados entre os
              locais.
              <br />
              <br />
              <strong>Esta ação não pode ser desfeita.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleComplete} disabled={actionLoading}>
              {actionLoading ? 'Concluindo...' : 'Concluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Transferência</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar esta transferência? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? 'Cancelando...' : 'Cancelar Transferência'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </DashboardLayout>
  )
}
