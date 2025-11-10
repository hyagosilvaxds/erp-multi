"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Search, Plus, MoreVertical, Download, CheckCircle2, XCircle, Eye, Edit, Loader2, Filter, X, Settings } from "lucide-react"
import { salesApi, Sale, SaleStatus, saleStatusLabels, saleStatusColors } from "@/lib/api/sales"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/masks"
import { useRouter } from "next/navigation"

export default function VendasPage() {
  const router = useRouter()
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<SaleStatus | "ALL">("ALL")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [minAmount, setMinAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()

  // Cancel Dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [saleToCancel, setSaleToCancel] = useState<Sale | null>(null)
  const [cancelReason, setCancelReason] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  // Approve Dialog
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [saleToApprove, setSaleToApprove] = useState<Sale | null>(null)
  const [requiresCreditAnalysis, setRequiresCreditAnalysis] = useState(false)
  const [creditAnalysisStatus, setCreditAnalysisStatus] = useState<"APPROVED" | "REJECTED">("APPROVED")
  const [creditAnalysisNotes, setCreditAnalysisNotes] = useState("")

  useEffect(() => {
    loadSales()
  }, [page, statusFilter])

  const loadSales = async () => {
    try {
      setLoading(true)
      const filters: any = {
        page,
        limit: 10,
      }
      
      if (statusFilter !== "ALL") {
        filters.status = statusFilter
      }
      
      if (searchTerm) {
        filters.search = searchTerm
      }

      if (startDate) {
        filters.startDate = startDate
      }

      if (endDate) {
        filters.endDate = endDate
      }

      if (minAmount) {
        filters.minAmount = parseFloat(minAmount)
      }

      if (maxAmount) {
        filters.maxAmount = parseFloat(maxAmount)
      }

      const response = await salesApi.getAll(filters)
      setSales(response.data)
      setTotalPages(response.totalPages)
    } catch (error: any) {
      toast({
        title: "Erro ao carregar vendas",
        description: error.response?.data?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    loadSales()
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setStatusFilter("ALL")
    setStartDate("")
    setEndDate("")
    setMinAmount("")
    setMaxAmount("")
    setPage(1)
  }

  const openApproveDialog = (sale: Sale) => {
    setSaleToApprove(sale)
    // Verificar se o método de pagamento requer análise de crédito
    const requiresAnalysis = sale.paymentMethod?.allowInstallments && (sale.installments || 1) > 1
    setRequiresCreditAnalysis(!!requiresAnalysis)
    setCreditAnalysisStatus("APPROVED")
    setCreditAnalysisNotes("")
    setApproveDialogOpen(true)
  }

  const handleApproveSale = async () => {
    if (!saleToApprove) return

    // Validação: se requer análise de crédito e notas estão vazias
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
      
      const approveDto = requiresCreditAnalysis 
        ? {
            creditAnalysisStatus,
            creditAnalysisNotes,
          }
        : undefined

      const result = await salesApi.approve(saleToApprove.id, approveDto)
      
      if (result.status === "CANCELED") {
        toast({
          title: "Crédito reprovado",
          description: "A venda foi cancelada devido à reprovação da análise de crédito.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Venda aprovada",
          description: "A venda foi aprovada com sucesso.",
        })
      }
      
      setApproveDialogOpen(false)
      loadSales()
    } catch (error: any) {
      toast({
        title: "Erro ao aprovar venda",
        description: error.response?.data?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleCompleteSale = async (saleId: string) => {
    try {
      setActionLoading(true)
      await salesApi.complete(saleId)
      toast({
        title: "Venda concluída",
        description: "A venda foi marcada como concluída.",
      })
      loadSales()
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

  const openCancelDialog = (sale: Sale) => {
    setSaleToCancel(sale)
    setCancelReason("")
    setCancelDialogOpen(true)
  }

  const handleCancelSale = async () => {
    if (!saleToCancel || !cancelReason.trim()) {
      toast({
        title: "Motivo obrigatório",
        description: "Informe o motivo do cancelamento.",
        variant: "destructive",
      })
      return
    }

    try {
      setActionLoading(true)
      await salesApi.cancel(saleToCancel.id, cancelReason)
      toast({
        title: "Venda cancelada",
        description: "A venda foi cancelada com sucesso.",
      })
      setCancelDialogOpen(false)
      loadSales()
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

  const getStatusBadge = (status: SaleStatus) => {
    const colorClass = saleStatusColors[status]
    const label = saleStatusLabels[status]
    return <Badge className={colorClass}>{label}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Vendas</h1>
            <p className="text-muted-foreground">Gerencie todas as vendas da sua empresa</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => router.push("/dashboard/vendas/configuracoes")}
            >
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </Button>
            <Button variant="outline" disabled>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button onClick={() => router.push("/dashboard/vendas/nova")}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Venda
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar Vendas</CardTitle>
            <CardDescription>Encontre vendas por número, cliente ou produto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Main Filters */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Buscar vendas..." 
                  className="pl-10" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos os Status</SelectItem>
                  <SelectItem value="DRAFT">Rascunho</SelectItem>
                  <SelectItem value="PENDING_APPROVAL">Pendente Aprovação</SelectItem>
                  <SelectItem value="APPROVED">Aprovada</SelectItem>
                  <SelectItem value="COMPLETED">Concluída</SelectItem>
                  <SelectItem value="CANCELED">Cancelada</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filtros Avançados
              </Button>
              <Button onClick={handleSearch}>Buscar</Button>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Filtros Avançados</h4>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleClearFilters}
                  >
                    <X className="mr-2 h-3 w-3" />
                    Limpar Filtros
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Date Range */}
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-sm">Data Inicial</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-sm">Data Final</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>

                  {/* Amount Range */}
                  <div className="space-y-2">
                    <Label htmlFor="minAmount" className="text-sm">Valor Mínimo</Label>
                    <Input
                      id="minAmount"
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      value={minAmount}
                      onChange={(e) => setMinAmount(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxAmount" className="text-sm">Valor Máximo</Label>
                    <Input
                      id="maxAmount"
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      value={maxAmount}
                      onChange={(e) => setMaxAmount(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sales Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Vendas</CardTitle>
            <CardDescription>
              {loading ? "Carregando..." : `Total de ${sales.length} vendas nesta página`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : sales.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground">Nenhuma venda encontrada.</p>
                <p className="text-sm text-muted-foreground">Tente ajustar os filtros ou crie uma nova venda.</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Itens</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-mono text-sm font-medium">
                          {sale.saleNumber}
                        </TableCell>
                        <TableCell>{sale.customer?.name || "—"}</TableCell>
                        <TableCell>{sale.items?.length || 0} {sale.items?.length === 1 ? "item" : "itens"}</TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(sale.totalAmount)}
                        </TableCell>
                        <TableCell>{getStatusBadge(sale.status)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(sale.saleDate || sale.createdAt)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={actionLoading}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/vendas/${sale.id}`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver detalhes
                              </DropdownMenuItem>
                              {sale.status === "DRAFT" && (
                                <DropdownMenuItem onClick={() => router.push(`/dashboard/vendas/${sale.id}/editar`)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                              )}
                              {sale.status === "PENDING_APPROVAL" && (
                                <DropdownMenuItem onClick={() => openApproveDialog(sale)}>
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Aprovar venda
                                </DropdownMenuItem>
                              )}
                              {sale.status === "APPROVED" && (
                                <DropdownMenuItem onClick={() => handleCompleteSale(sale.id)}>
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Marcar como concluída
                                </DropdownMenuItem>
                              )}
                              {(sale.status === "DRAFT" || sale.status === "PENDING_APPROVAL" || sale.status === "APPROVED") && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => openCancelDialog(sale)}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancelar venda
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-muted-foreground">
                      Página {page} de {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1 || loading}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages || loading}
                      >
                        Próxima
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Venda</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar a venda <span className="font-mono font-semibold">{saleToCancel?.saleNumber}</span>?
              Esta ação não pode ser desfeita.
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
              onClick={handleCancelSale}
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

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Aprovar Venda</DialogTitle>
            <DialogDescription>
              Venda <span className="font-mono font-semibold">{saleToApprove?.saleNumber}</span>
              {" "}• Cliente: <span className="font-semibold">{saleToApprove?.customer?.name}</span>
              {" "}• Total: <span className="font-semibold">{saleToApprove && formatCurrency(saleToApprove.totalAmount)}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {requiresCreditAnalysis ? (
              <>
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Análise de Crédito Requerida</strong>
                    <br />
                    Este método de pagamento com parcelamento requer análise de crédito do cliente.
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>Resultado da Análise de Crédito *</Label>
                  <RadioGroup 
                    value={creditAnalysisStatus} 
                    onValueChange={(value: any) => setCreditAnalysisStatus(value)}
                  >
                    <div className="flex items-center space-x-2 rounded-lg border border-green-200 bg-green-50 p-3">
                      <RadioGroupItem value="APPROVED" id="approved" />
                      <Label htmlFor="approved" className="flex-1 cursor-pointer font-normal">
                        <div className="font-semibold text-green-800">Aprovar Crédito</div>
                        <div className="text-sm text-green-600">
                          Cliente possui crédito aprovado. A venda será aprovada.
                        </div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 rounded-lg border border-red-200 bg-red-50 p-3">
                      <RadioGroupItem value="REJECTED" id="rejected" />
                      <Label htmlFor="rejected" className="flex-1 cursor-pointer font-normal">
                        <div className="font-semibold text-red-800">Reprovar Crédito</div>
                        <div className="text-sm text-red-600">
                          Cliente não possui crédito suficiente. A venda será cancelada automaticamente.
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="creditNotes">
                    Observações da Análise *
                    {creditAnalysisStatus === "APPROVED" && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (Ex: Score de crédito, histórico, limite aprovado)
                      </span>
                    )}
                    {creditAnalysisStatus === "REJECTED" && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (Ex: Score baixo, inadimplência, restrições)
                      </span>
                    )}
                  </Label>
                  <Textarea
                    id="creditNotes"
                    placeholder={
                      creditAnalysisStatus === "APPROVED"
                        ? "Ex: Cliente com ótimo histórico. Score de crédito: 850"
                        : "Ex: Score de crédito abaixo do mínimo exigido (450 < 600)"
                    }
                    value={creditAnalysisNotes}
                    onChange={(e) => setCreditAnalysisNotes(e.target.value)}
                    rows={4}
                  />
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  <strong>Aprovação Simples</strong>
                  <br />
                  Esta venda não requer análise de crédito. Confirme para aprovar.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setApproveDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleApproveSale}
              disabled={actionLoading || (requiresCreditAnalysis && !creditAnalysisNotes.trim())}
              variant={creditAnalysisStatus === "REJECTED" ? "destructive" : "default"}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  {creditAnalysisStatus === "APPROVED" ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Aprovar Venda
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Reprovar Crédito
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
