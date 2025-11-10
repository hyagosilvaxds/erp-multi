"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Calendar,
  User,
  CreditCard,
  Package,
  FileText,
  Download,
} from "lucide-react"
import { salesApi, Sale, saleStatusLabels, saleStatusColors } from "@/lib/api/sales"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/masks"

export default function DetalhesVendaPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const saleId = params.id as string

  const [sale, setSale] = useState<Sale | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [exportingPDF, setExportingPDF] = useState(false)

  // Dialog de aprovação
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [requiresCreditAnalysis, setRequiresCreditAnalysis] = useState(false)
  const [creditAnalysisStatus, setCreditAnalysisStatus] = useState<"APPROVED" | "REJECTED">("APPROVED")
  const [creditAnalysisNotes, setCreditAnalysisNotes] = useState("")

  // Dialog de cancelamento
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState("")

  // Dialog de exclusão
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    loadSale()
  }, [saleId])

  const loadSale = async () => {
    try {
      setLoading(true)
      const data = await salesApi.getById(saleId)
      setSale(data)
      
      // Verificar se requer análise de crédito
      if (data.paymentMethod?.type === "CREDIT_CARD" || data.paymentMethod?.type === "BANK_SLIP") {
        setRequiresCreditAnalysis(true)
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar venda",
        description: error.response?.data?.message || "Venda não encontrada.",
        variant: "destructive",
      })
      router.push("/dashboard/vendas")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (requiresCreditAnalysis && !creditAnalysisNotes.trim()) {
      toast({
        title: "Observações obrigatórias",
        description: "Informe as observações da análise de crédito.",
        variant: "destructive",
      })
      return
    }

    try {
      setActionLoading(true)
      
      // Se for orçamento (QUOTE), usar endpoint de confirmar que baixa estoque e cria financeiro
      if (sale?.status === "QUOTE") {
        await salesApi.confirm(saleId)
        toast({
          title: "Orçamento confirmado",
          description: "O orçamento foi confirmado com sucesso. Estoque baixado e financeiro criado.",
        })
      } else if (requiresCreditAnalysis) {
        // Se requer análise de crédito, usar endpoint específico
        if (creditAnalysisStatus === "APPROVED") {
          await salesApi.approveCreditAnalysis(saleId, creditAnalysisNotes.trim())
          toast({
            title: "Crédito aprovado",
            description: "A análise de crédito foi aprovada e a venda avançou.",
          })
        } else {
          await salesApi.rejectCreditAnalysis(saleId, creditAnalysisNotes.trim())
          toast({
            title: "Crédito reprovado",
            description: "A análise de crédito foi reprovada e a venda foi cancelada.",
            variant: "destructive",
          })
        }
      } else {
        // Aprovação simples sem análise de crédito
        await salesApi.approve(saleId)
        toast({
          title: "Venda aprovada",
          description: "A venda foi aprovada com sucesso.",
        })
      }

      setApproveDialogOpen(false)
      loadSale()
    } catch (error: any) {
      toast({
        title: sale?.status === "QUOTE" ? "Erro ao confirmar orçamento" : "Erro ao processar aprovação",
        description: error.response?.data?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast({
        title: "Motivo obrigatório",
        description: "Informe o motivo do cancelamento.",
        variant: "destructive",
      })
      return
    }

    try {
      setActionLoading(true)
      await salesApi.cancel(saleId, cancelReason)

      toast({
        title: "Venda cancelada",
        description: "A venda foi cancelada com sucesso.",
      })

      setCancelDialogOpen(false)
      loadSale()
    } catch (error: any) {
      toast({
        title: "Erro ao cancelar venda",
        description: error.response?.data?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleExportPDF = async () => {
    if (!sale) return
    
    try {
      setExportingPDF(true)
      const blob = await salesApi.exportToPDF(saleId)
      
      // Criar URL temporária para o blob
      const url = window.URL.createObjectURL(blob)
      
      // Criar link temporário e clicar nele
      const link = document.createElement('a')
      link.href = url
      const fileName = sale.status === "QUOTE" ? `orcamento-${sale.code}.pdf` : `venda-${sale.code}.pdf`
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      
      // Limpar
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast({
        title: "PDF exportado",
        description: "O arquivo foi baixado com sucesso.",
      })
    } catch (error: any) {
      toast({
        title: "Erro ao exportar PDF",
        description: error.response?.data?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setExportingPDF(false)
    }
  }

  const handleComplete = async () => {
    try {
      setActionLoading(true)
      await salesApi.complete(saleId)

      toast({
        title: "Venda concluída",
        description: "A venda foi marcada como concluída.",
      })

      loadSale()
    } catch (error: any) {
      toast({
        title: "Erro ao concluir venda",
        description: error.response?.data?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setActionLoading(true)
      await salesApi.delete(saleId)

      toast({
        title: "Venda excluída",
        description: "A venda foi excluída com sucesso.",
      })

      router.push("/dashboard/vendas")
    } catch (error: any) {
      toast({
        title: "Erro ao excluir venda",
        description: error.response?.data?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
      setDeleteDialogOpen(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleString("pt-BR")
  }

  if (loading) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  if (!sale) {
    return null
  }

  const canEdit = sale.status === "QUOTE" || sale.status === "DRAFT"
  const canApprove = sale.status === "QUOTE" || sale.status === "DRAFT" || sale.status === "PENDING_APPROVAL"
  const canComplete = sale.status === "APPROVED"
  const canCancel = sale.status !== "COMPLETED" && sale.status !== "CANCELED"
  const canDelete = sale.status === "QUOTE" || sale.status === "DRAFT"

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard/vendas")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {sale.code || sale.saleNumber}
                </h1>
                <Badge className={saleStatusColors[sale.status]}>
                  {saleStatusLabels[sale.status]}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {sale.status === "QUOTE" ? "Detalhes do orçamento" : "Detalhes da venda"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportPDF}
              disabled={exportingPDF}
            >
              {exportingPDF ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Exportar PDF
            </Button>
            {canEdit && (
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/vendas/${saleId}/editar`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            )}
            {canApprove && (
              <Button onClick={() => setApproveDialogOpen(true)} disabled={actionLoading}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {sale.status === "QUOTE" ? "Confirmar Orçamento" : "Aprovar"}
              </Button>
            )}
            {canComplete && (
              <Button onClick={handleComplete} disabled={actionLoading}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Concluir
              </Button>
            )}
            {canCancel && (
              <Button
                variant="destructive"
                onClick={() => setCancelDialogOpen(true)}
                disabled={actionLoading}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            )}
            {canDelete && (
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={actionLoading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações do Cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">{sale.customer?.name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Documento</p>
                    <p className="font-medium">
                      {sale.customer?.cpf || sale.customer?.cnpj || sale.customer?.cpfCnpj || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{sale.customer?.email || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">
                      {sale.customer?.mobile || sale.customer?.phone || "—"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Itens da Venda */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Itens da Venda
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead className="text-right">Preço Unit.</TableHead>
                      <TableHead className="text-right">Desconto</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sale.items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.productName || item.product?.name || "—"}</p>
                            <p className="text-sm text-muted-foreground">
                              SKU: {item.product?.sku || item.productCode || "—"}
                            </p>
                            {item.notes && (
                              <p className="text-xs text-muted-foreground mt-1">Obs: {item.notes}</p>
                            )}
                            {item.stockLocation && (
                              <p className="text-xs text-muted-foreground">
                                Local: {item.stockLocation.name}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.discount)}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(item.total || item.totalPrice || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-medium">
                        Subtotal
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(sale.subtotal)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>

            {/* Observações */}
            {sale.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Observações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{sale.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Observações Internas */}
            {sale.internalNotes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Observações Internas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">{sale.internalNotes}</p>
                </CardContent>
              </Card>
            )}

            {/* Endereço de Entrega */}
            {sale.deliveryAddress && !sale.useCustomerAddress && (
              <Card>
                <CardHeader>
                  <CardTitle>Endereço de Entrega</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    {sale.deliveryAddress.street}, {sale.deliveryAddress.number}
                    {sale.deliveryAddress.complement && ` - ${sale.deliveryAddress.complement}`}
                  </p>
                  <p className="text-sm">
                    {sale.deliveryAddress.neighborhood} - {sale.deliveryAddress.city}/{sale.deliveryAddress.state}
                  </p>
                  <p className="text-sm">CEP: {sale.deliveryAddress.zipCode}</p>
                </CardContent>
              </Card>
            )}

            {/* Análise de Crédito */}
            {sale.creditAnalysisStatus && (
              <Card>
                <CardHeader>
                  <CardTitle>Análise de Crédito</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge
                      variant={
                        sale.creditAnalysisStatus === "APPROVED"
                          ? "default"
                          : sale.creditAnalysisStatus === "REJECTED"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {sale.creditAnalysisStatus === "APPROVED"
                        ? "Aprovado"
                        : sale.creditAnalysisStatus === "REJECTED"
                        ? "Reprovado"
                        : "Pendente"}
                    </Badge>
                  </div>
                  {sale.creditAnalysisNotes && (
                    <div>
                      <p className="text-sm text-muted-foreground">Observações</p>
                      <p className="text-sm whitespace-pre-wrap">{sale.creditAnalysisNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Motivo do Cancelamento */}
            {sale.status === "CANCELED" && (sale.cancellationReason || sale.cancelReason) && (
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">Motivo do Cancelamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{sale.cancellationReason || sale.cancelReason}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Cancelado em: {formatDateTime(sale.canceledAt)}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Coluna Lateral */}
          <div className="space-y-6">
            {/* Resumo Financeiro */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(sale.subtotal)}</span>
                </div>
                {(sale.discountAmount > 0 || sale.discountPercent > 0) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Desconto {sale.discountPercent > 0 ? `(${sale.discountPercent}%)` : ""}
                    </span>
                    <span className="font-medium text-destructive">
                      - {formatCurrency(sale.discountAmount || sale.discount || 0)}
                    </span>
                  </div>
                )}
                {sale.shippingCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frete</span>
                    <span className="font-medium">+ {formatCurrency(sale.shippingCost || sale.shipping || 0)}</span>
                  </div>
                )}
                {sale.otherCharges > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Outras Despesas {sale.otherChargesDesc ? `(${sale.otherChargesDesc})` : ""}
                    </span>
                    <span className="font-medium">+ {formatCurrency(sale.otherCharges)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(sale.totalAmount)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Método</p>
                  <p className="font-medium">{sale.paymentMethod?.name || "—"}</p>
                </div>
                {sale.installments > 1 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Parcelas</p>
                    <p className="font-medium">
                      {sale.installments}x de {formatCurrency(sale.installmentValue || sale.totalAmount / sale.installments)}
                    </p>
                  </div>
                )}
                {sale.paymentMethod?.requiresCreditAnalysis && (
                  <div>
                    <p className="text-sm text-muted-foreground">Análise de Crédito</p>
                    <p className="font-medium text-yellow-600">Requerida</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Datas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Datas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sale.status === "QUOTE" && sale.quoteDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Data do Orçamento</p>
                    <p className="font-medium">{formatDate(sale.quoteDate)}</p>
                  </div>
                )}
                {sale.status === "QUOTE" && sale.validUntil && (
                  <div>
                    <p className="text-sm text-muted-foreground">Válido Até</p>
                    <p className="font-medium">{formatDate(sale.validUntil)}</p>
                  </div>
                )}
                {sale.saleDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Data da Venda</p>
                    <p className="font-medium">{formatDate(sale.saleDate)}</p>
                  </div>
                )}
                {sale.deliveryDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Entrega</p>
                    <p className="font-medium">{formatDate(sale.deliveryDate)}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Criado em</p>
                  <p className="text-sm">{formatDateTime(sale.createdAt)}</p>
                </div>
                {sale.confirmedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Confirmado em</p>
                    <p className="text-sm">{formatDateTime(sale.confirmedAt)}</p>
                  </div>
                )}
                {sale.approvedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Aprovado em</p>
                    <p className="text-sm">{formatDateTime(sale.approvedAt)}</p>
                  </div>
                )}
                {sale.completedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Concluído em</p>
                    <p className="text-sm">{formatDateTime(sale.completedAt)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialog de Aprovação */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {sale?.status === "QUOTE" ? "Confirmar Orçamento" : "Aprovar Venda"}
            </DialogTitle>
            <DialogDescription>
              {sale?.status === "QUOTE" 
                ? "Ao confirmar este orçamento, o estoque será baixado e o financeiro será criado automaticamente."
                : requiresCreditAnalysis
                ? "Esta venda requer análise de crédito. Informe o resultado da análise."
                : "Deseja aprovar esta venda?"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {sale?.status === "QUOTE" ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="text-sm text-green-800">
                  <strong>Confirmar Orçamento</strong>
                  <br />
                  Esta ação irá:
                </p>
                <ul className="mt-2 ml-4 list-disc text-sm text-green-800">
                  <li>Baixar estoque dos produtos</li>
                  <li>Criar lançamentos financeiros</li>
                  <li>Mudar status para APROVADO</li>
                </ul>
                <p className="mt-2 text-xs text-green-700">
                  Esta ação não pode ser desfeita.
                </p>
              </div>
            ) : requiresCreditAnalysis ? (
              <>
                <div className="space-y-3">
                  <Label>Resultado da Análise de Crédito *</Label>
                  <RadioGroup
                    value={creditAnalysisStatus}
                    onValueChange={(value: any) => setCreditAnalysisStatus(value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="APPROVED" id="approved" />
                      <Label htmlFor="approved" className="font-normal cursor-pointer">
                        Aprovar Crédito (venda será aprovada)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="REJECTED" id="rejected" />
                      <Label htmlFor="rejected" className="font-normal cursor-pointer">
                        Reprovar Crédito (venda será cancelada)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditNotes">Observações da Análise *</Label>
                  <Textarea
                    id="creditNotes"
                    placeholder="Ex: Cliente aprovado com score 850..."
                    value={creditAnalysisNotes}
                    onChange={(e) => setCreditAnalysisNotes(e.target.value)}
                    rows={4}
                  />
                </div>
              </>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApproveDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancelar
            </Button>
            <Button onClick={handleApprove} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : sale?.status === "QUOTE" ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirmar Orçamento
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirmar Aprovação
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Cancelamento */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Venda</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar esta venda? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancelReason">Motivo do cancelamento *</Label>
              <Textarea
                id="cancelReason"
                placeholder="Informe o motivo do cancelamento..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={actionLoading}
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={actionLoading || !cancelReason.trim()}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                "Confirmar Cancelamento"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Venda</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta venda? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir Venda"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
