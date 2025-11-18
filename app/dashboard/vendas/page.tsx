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
import { customersApi } from "@/lib/api/customers"
import { paymentMethodsApi } from "@/lib/api/payment-methods"
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
  const [exportingExcel, setExportingExcel] = useState(false)
  const [exportingPDF, setExportingPDF] = useState<string | null>(null)

  // Approve Dialog
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [saleToApprove, setSaleToApprove] = useState<Sale | null>(null)
  const [requiresCreditAnalysis, setRequiresCreditAnalysis] = useState(false)
  const [creditAnalysisStatus, setCreditAnalysisStatus] = useState<"APPROVED" | "REJECTED">("APPROVED")
  const [creditAnalysisNotes, setCreditAnalysisNotes] = useState("")

  // Export Excel Dialog
  const [exportExcelDialogOpen, setExportExcelDialogOpen] = useState(false)
  const [excelFilters, setExcelFilters] = useState({
    status: "",
    customerId: "",
    paymentMethodId: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
  })
  const [customers, setCustomers] = useState<any[]>([])
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false)

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
      
      // Se for orçamento (QUOTE), usar endpoint de confirmar que baixa estoque e cria financeiro
      if (saleToApprove.status === "QUOTE") {
        await salesApi.confirm(saleToApprove.id)
        toast({
          title: "Orçamento confirmado",
          description: "O orçamento foi confirmado com sucesso. Estoque baixado e financeiro criado.",
        })
      } else {
        // Para vendas, usar endpoint de aprovar com análise de crédito se necessário
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
      }
      
      setApproveDialogOpen(false)
      loadSales()
    } catch (error: any) {
      toast({
        title: saleToApprove.status === "QUOTE" ? "Erro ao confirmar orçamento" : "Erro ao aprovar venda",
        description: error.response?.data?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleExportSalePDF = async (sale: Sale) => {
    try {
      setExportingPDF(sale.id)
      
      const blob = await salesApi.exportToPDF(sale.id)
      
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
      setExportingPDF(null)
    }
  }

  const openExportExcelDialog = async () => {
    setExportExcelDialogOpen(true)
    
    // Carregar clientes e métodos de pagamento
    if (customers.length === 0) {
      try {
        setLoadingCustomers(true)
        const data = await customersApi.getAll({ limit: 1000 })
        setCustomers(data.data)
      } catch (error) {
        console.error("Erro ao carregar clientes:", error)
      } finally {
        setLoadingCustomers(false)
      }
    }

    if (paymentMethods.length === 0) {
      try {
        setLoadingPaymentMethods(true)
        const data = await paymentMethodsApi.getAll()
        setPaymentMethods(data)
      } catch (error) {
        console.error("Erro ao carregar métodos de pagamento:", error)
      } finally {
        setLoadingPaymentMethods(false)
      }
    }
  }

  const handleExportExcel = async () => {
    try {
      setExportingExcel(true)
      
      // Construir filtros do modal
      const filters: any = {}
      
      if (excelFilters.status) {
        filters.status = excelFilters.status
      }
      
      if (excelFilters.customerId) {
        filters.customerId = excelFilters.customerId
      }

      if (excelFilters.paymentMethodId) {
        filters.paymentMethodId = excelFilters.paymentMethodId
      }

      if (excelFilters.startDate) {
        filters.startDate = excelFilters.startDate
      }

      if (excelFilters.endDate) {
        filters.endDate = excelFilters.endDate
      }

      if (excelFilters.minAmount) {
        filters.minAmount = parseFloat(excelFilters.minAmount)
      }

      if (excelFilters.maxAmount) {
        filters.maxAmount = parseFloat(excelFilters.maxAmount)
      }

      const blob = await salesApi.exportToExcel(filters)
      
      // Criar URL temporária para o blob
      const url = window.URL.createObjectURL(blob)
      
      // Criar link temporário e clicar nele
      const link = document.createElement('a')
      link.href = url
      const fileName = `vendas-${new Date().toISOString().split('T')[0]}.xlsx`
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      
      // Limpar
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast({
        title: "Excel exportado",
        description: "O arquivo foi baixado com sucesso.",
      })
      
      setExportExcelDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Erro ao exportar Excel",
        description: error.response?.data?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setExportingExcel(false)
    }
  }

  const clearExcelFilters = () => {
    setExcelFilters({
      status: "",
      customerId: "",
      paymentMethodId: "",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
    })
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
            <Button 
              variant="outline" 
              onClick={openExportExcelDialog}
              disabled={exportingExcel}
            >
              {exportingExcel ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Exportar Excel
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
                  <SelectItem value="QUOTE">Orçamento</SelectItem>
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
                          {sale.code || sale.saleNumber}
                        </TableCell>
                        <TableCell>{sale.customer?.name || "—"}</TableCell>
                        <TableCell>{sale.items?.length || 0} {sale.items?.length === 1 ? "item" : "itens"}</TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(sale.totalAmount)}
                        </TableCell>
                        <TableCell>{getStatusBadge(sale.status)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(sale.quoteDate || sale.saleDate || sale.createdAt)}
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
                              <DropdownMenuItem 
                                onClick={() => handleExportSalePDF(sale)}
                                disabled={exportingPDF === sale.id}
                              >
                                {exportingPDF === sale.id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Download className="mr-2 h-4 w-4" />
                                )}
                                Exportar PDF
                              </DropdownMenuItem>
                              {(sale.status === "QUOTE" || sale.status === "DRAFT") && (
                                <DropdownMenuItem onClick={() => router.push(`/dashboard/vendas/${sale.id}/editar`)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                              )}
                              {(sale.status !== "APPROVED" && sale.status !== "COMPLETED" && sale.status !== "CANCELED") && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => openApproveDialog(sale)}>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Aprovar {sale.status === "QUOTE" ? "orçamento" : "venda"}
                                  </DropdownMenuItem>
                                </>
                              )}
                              {(sale.status !== "COMPLETED" && sale.status !== "CANCELED") && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => openCancelDialog(sale)}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancelar {sale.status === "QUOTE" ? "orçamento" : "venda"}
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
            <DialogTitle>
              {saleToApprove?.status === "QUOTE" ? "Confirmar Orçamento" : "Aprovar Venda"}
            </DialogTitle>
            <DialogDescription>
              {saleToApprove?.status === "QUOTE" ? "Orçamento" : "Venda"} <span className="font-mono font-semibold">{saleToApprove?.code || saleToApprove?.saleNumber}</span>
              {" "}• Cliente: <span className="font-semibold">{saleToApprove?.customer?.name}</span>
              {" "}• Total: <span className="font-semibold">{saleToApprove && formatCurrency(saleToApprove.totalAmount)}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {saleToApprove?.status === "QUOTE" ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="text-sm text-green-800">
                  <strong>Confirmar Orçamento</strong>
                  <br />
                  Ao confirmar este orçamento, o estoque será baixado e o financeiro será criado automaticamente.
                  Esta ação não pode ser desfeita.
                </p>
              </div>
            ) : requiresCreditAnalysis ? (
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
                  {saleToApprove?.status === "QUOTE" ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Confirmar Orçamento
                    </>
                  ) : creditAnalysisStatus === "APPROVED" ? (
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

      {/* Export Excel Dialog */}
      <Dialog open={exportExcelDialogOpen} onOpenChange={setExportExcelDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Exportar Vendas para Excel</DialogTitle>
            <DialogDescription>
              Configure os filtros para exportar as vendas desejadas. Todos os filtros são opcionais.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="excelStatus">Status</Label>
                <div className="flex gap-2">
                  <Select
                    value={excelFilters.status}
                    onValueChange={(value) => setExcelFilters({ ...excelFilters, status: value })}
                  >
                    <SelectTrigger id="excelStatus" className="flex-1">
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="QUOTE">Orçamento</SelectItem>
                      <SelectItem value="DRAFT">Rascunho</SelectItem>
                      <SelectItem value="PENDING_APPROVAL">Pendente Aprovação</SelectItem>
                      <SelectItem value="APPROVED">Aprovada</SelectItem>
                      <SelectItem value="COMPLETED">Concluída</SelectItem>
                      <SelectItem value="CANCELED">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                  {excelFilters.status && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setExcelFilters({ ...excelFilters, status: "" })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Cliente */}
              <div className="space-y-2">
                <Label htmlFor="excelCustomer">Cliente</Label>
                <div className="flex gap-2">
                  <Select
                    value={excelFilters.customerId}
                    onValueChange={(value) => setExcelFilters({ ...excelFilters, customerId: value })}
                    disabled={loadingCustomers}
                  >
                    <SelectTrigger id="excelCustomer" className="flex-1">
                      <SelectValue placeholder={loadingCustomers ? "Carregando..." : "Todos os clientes"} />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {excelFilters.customerId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setExcelFilters({ ...excelFilters, customerId: "" })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Método de Pagamento */}
              <div className="space-y-2">
                <Label htmlFor="excelPaymentMethod">Método de Pagamento</Label>
                <div className="flex gap-2">
                  <Select
                    value={excelFilters.paymentMethodId}
                    onValueChange={(value) => setExcelFilters({ ...excelFilters, paymentMethodId: value })}
                    disabled={loadingPaymentMethods}
                  >
                    <SelectTrigger id="excelPaymentMethod" className="flex-1">
                      <SelectValue placeholder={loadingPaymentMethods ? "Carregando..." : "Todos os métodos"} />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          {method.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {excelFilters.paymentMethodId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setExcelFilters({ ...excelFilters, paymentMethodId: "" })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Data Inicial */}
              <div className="space-y-2">
                <Label htmlFor="excelStartDate">Data Inicial</Label>
                <Input
                  id="excelStartDate"
                  type="date"
                  value={excelFilters.startDate}
                  onChange={(e) => setExcelFilters({ ...excelFilters, startDate: e.target.value })}
                />
              </div>

              {/* Data Final */}
              <div className="space-y-2">
                <Label htmlFor="excelEndDate">Data Final</Label>
                <Input
                  id="excelEndDate"
                  type="date"
                  value={excelFilters.endDate}
                  onChange={(e) => setExcelFilters({ ...excelFilters, endDate: e.target.value })}
                />
              </div>

              {/* Valor Mínimo */}
              <div className="space-y-2">
                <Label htmlFor="excelMinAmount">Valor Mínimo (R$)</Label>
                <Input
                  id="excelMinAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={excelFilters.minAmount}
                  onChange={(e) => setExcelFilters({ ...excelFilters, minAmount: e.target.value })}
                />
              </div>

              {/* Valor Máximo */}
              <div className="space-y-2">
                <Label htmlFor="excelMaxAmount">Valor Máximo (R$)</Label>
                <Input
                  id="excelMaxAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={excelFilters.maxAmount}
                  onChange={(e) => setExcelFilters({ ...excelFilters, maxAmount: e.target.value })}
                />
              </div>
            </div>

            {/* Resumo dos Filtros */}
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-2">
                {Object.values(excelFilters).filter(v => v).length > 0 ? (
                  <>
                    <strong>{Object.values(excelFilters).filter(v => v).length}</strong> filtro(s) ativo(s)
                  </>
                ) : (
                  "Nenhum filtro aplicado. Todas as vendas serão exportadas."
                )}
              </p>
              {Object.values(excelFilters).filter(v => v).length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearExcelFilters}
                >
                  <X className="mr-2 h-4 w-4" />
                  Limpar Filtros
                </Button>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setExportExcelDialogOpen(false)}
              disabled={exportingExcel}
            >
              Cancelar
            </Button>
            <Button onClick={handleExportExcel} disabled={exportingExcel}>
              {exportingExcel ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Excel
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
