"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  FileText,
  Download,
  TrendingUp,
  DollarSign,
  Users,
  FileSpreadsheet,
  Loader2,
  Check,
  ChevronsUpDown,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { financialReportsApi } from "@/lib/api/financial"
import { reportsApi } from "@/lib/api/reports"
import { authApi } from "@/lib/api/auth"
import { projectsApi, type ProjectListItem } from "@/lib/api/projects"
import { investorsApi, type InvestorListItem } from "@/lib/api/investors"
import { cn } from "@/lib/utils"

export default function RelatoriosPage() {
  const { toast } = useToast()
  const [loadingFinancial, setLoadingFinancial] = useState<string | null>(null)
  const [loadingInvestors, setLoadingInvestors] = useState<string | null>(null)
  const [loadingPayroll, setLoadingPayroll] = useState<string | null>(null)

  // Dados para selects
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [investors, setInvestors] = useState<InvestorListItem[]>([])
  const [loadingData, setLoadingData] = useState(true)
  
  // Estados dos popovers
  const [openProject, setOpenProject] = useState(false)
  const [openInvestor, setOpenInvestor] = useState(false)

  // Filtros Financeiros
  const [financialFilters, setFinancialFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
  })

  // Filtros Investidores
  const [investorFilters, setInvestorFilters] = useState({
    projectId: "",
    investorId: "",
    startDate: "",
    endDate: "",
    status: "",
  })

  // Filtros Folha de Pagamento
  const [payrollFilters, setPayrollFilters] = useState({
    month: "",
    year: "",
    status: "",
  })

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const company = authApi.getSelectedCompany()
        if (!company) return

        const [projectsData, investorsData] = await Promise.all([
          projectsApi.getAll(company.id, { limit: 100 }),
          investorsApi.getAll(company.id, { limit: 100 }),
        ])

        setProjects(projectsData.data)
        setInvestors(investorsData.data)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setLoadingData(false)
      }
    }

    loadInitialData()
  }, [])

  const getCompanyId = () => {
    const company = authApi.getSelectedCompany()
    if (!company) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Nenhuma empresa selecionada",
      })
      throw new Error("No company selected")
    }
    return company.id
  }

  // ============================================
  // Relatórios Financeiros
  // ============================================

  const handleExportCashFlow = async () => {
    try {
      setLoadingFinancial("cashflow")
      const companyId = getCompanyId()
      
      const blob = await financialReportsApi.exportCashFlow({
        companyId,
        startDate: financialFilters.startDate || undefined,
        endDate: financialFilters.endDate || undefined,
        status: financialFilters.status || undefined,
      })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `fluxo-caixa_${new Date().toISOString().split("T")[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Sucesso",
        description: "Relatório de fluxo de caixa exportado com sucesso",
      })
    } catch (error: any) {
      console.error("Erro ao exportar fluxo de caixa:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao exportar relatório",
      })
    } finally {
      setLoadingFinancial(null)
    }
  }

  const handleExportAccountsPayable = async () => {
    try {
      setLoadingFinancial("payable")
      const companyId = getCompanyId()
      
      const blob = await financialReportsApi.exportAccountsPayable({
        companyId,
        startDate: financialFilters.startDate || undefined,
        endDate: financialFilters.endDate || undefined,
        status: financialFilters.status || undefined,
      })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `contas-pagar_${new Date().toISOString().split("T")[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Sucesso",
        description: "Relatório de contas a pagar exportado com sucesso",
      })
    } catch (error: any) {
      console.error("Erro ao exportar contas a pagar:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao exportar relatório",
      })
    } finally {
      setLoadingFinancial(null)
    }
  }

  const handleExportAccountsReceivable = async () => {
    try {
      setLoadingFinancial("receivable")
      const companyId = getCompanyId()
      
      const blob = await financialReportsApi.exportAccountsReceivable({
        companyId,
        startDate: financialFilters.startDate || undefined,
        endDate: financialFilters.endDate || undefined,
        status: financialFilters.status || undefined,
      })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `contas-receber_${new Date().toISOString().split("T")[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Sucesso",
        description: "Relatório de contas a receber exportado com sucesso",
      })
    } catch (error: any) {
      console.error("Erro ao exportar contas a receber:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao exportar relatório",
      })
    } finally {
      setLoadingFinancial(null)
    }
  }

  const handleExportByCentroCusto = async () => {
    try {
      setLoadingFinancial("centro-custo")
      const companyId = getCompanyId()
      
      const blob = await financialReportsApi.exportTransactionsByCentroCusto({
        companyId,
        startDate: financialFilters.startDate || undefined,
        endDate: financialFilters.endDate || undefined,
        status: financialFilters.status || undefined,
      })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `transacoes-centro-custo_${new Date().toISOString().split("T")[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Sucesso",
        description: "Relatório por centro de custo exportado com sucesso",
      })
    } catch (error: any) {
      console.error("Erro ao exportar por centro de custo:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao exportar relatório",
      })
    } finally {
      setLoadingFinancial(null)
    }
  }

  const handleExportByContaContabil = async () => {
    try {
      setLoadingFinancial("conta-contabil")
      const companyId = getCompanyId()
      
      const blob = await financialReportsApi.exportTransactionsByContaContabil({
        companyId,
        startDate: financialFilters.startDate || undefined,
        endDate: financialFilters.endDate || undefined,
        status: financialFilters.status || undefined,
      })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `transacoes-conta-contabil_${new Date().toISOString().split("T")[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Sucesso",
        description: "Relatório por conta contábil exportado com sucesso",
      })
    } catch (error: any) {
      console.error("Erro ao exportar por conta contábil:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao exportar relatório",
      })
    } finally {
      setLoadingFinancial(null)
    }
  }

  // ============================================
  // Relatórios de Investidores
  // ============================================

  const handleExportInvestments = async () => {
    try {
      setLoadingInvestors("investments")
      const companyId = getCompanyId()
      
      const blob = await reportsApi.exportInvestments(companyId, {
        projectId: investorFilters.projectId || undefined,
        investorId: investorFilters.investorId || undefined,
        startDate: investorFilters.startDate || undefined,
        endDate: investorFilters.endDate || undefined,
        status: investorFilters.status as any,
      })

      reportsApi.downloadBlob(blob, reportsApi.generateFilename("aportes"))

      toast({
        title: "Sucesso",
        description: "Relatório de aportes exportado com sucesso",
      })
    } catch (error: any) {
      console.error("Erro ao exportar aportes:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao exportar relatório",
      })
    } finally {
      setLoadingInvestors(null)
    }
  }

  const handleExportDistributions = async () => {
    try {
      setLoadingInvestors("distributions")
      const companyId = getCompanyId()
      
      const blob = await reportsApi.exportDistributions(companyId, {
        projectId: investorFilters.projectId || undefined,
        investorId: investorFilters.investorId || undefined,
        startDate: investorFilters.startDate || undefined,
        endDate: investorFilters.endDate || undefined,
        status: investorFilters.status as any,
      })

      reportsApi.downloadBlob(blob, reportsApi.generateFilename("distribuicoes"))

      toast({
        title: "Sucesso",
        description: "Relatório de distribuições exportado com sucesso",
      })
    } catch (error: any) {
      console.error("Erro ao exportar distribuições:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao exportar relatório",
      })
    } finally {
      setLoadingInvestors(null)
    }
  }

  const handleExportROI = async () => {
    try {
      setLoadingInvestors("roi")
      const companyId = getCompanyId()
      
      const blob = await reportsApi.exportROI(companyId, {
        projectId: investorFilters.projectId || undefined,
        investorId: investorFilters.investorId || undefined,
        startDate: investorFilters.startDate || undefined,
        endDate: investorFilters.endDate || undefined,
      })

      reportsApi.downloadBlob(blob, reportsApi.generateFilename("roi"))

      toast({
        title: "Sucesso",
        description: "Relatório de ROI exportado com sucesso",
      })
    } catch (error: any) {
      console.error("Erro ao exportar ROI:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao exportar relatório",
      })
    } finally {
      setLoadingInvestors(null)
    }
  }

  const handleExportInvestorsSummary = async () => {
    try {
      setLoadingInvestors("investors-summary")
      const companyId = getCompanyId()
      
      const blob = await reportsApi.exportInvestorsSummary(companyId, {})

      reportsApi.downloadBlob(blob, reportsApi.generateFilename("resumo-investidores"))

      toast({
        title: "Sucesso",
        description: "Resumo de investidores exportado com sucesso",
      })
    } catch (error: any) {
      console.error("Erro ao exportar resumo de investidores:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao exportar relatório",
      })
    } finally {
      setLoadingInvestors(null)
    }
  }

  // ============================================
  // Relatórios de Folha de Pagamento
  // ============================================

  const handleExportPayrollList = async () => {
    try {
      setLoadingPayroll("list")
      
      toast({
        title: "Em desenvolvimento",
        description: "Exportação de lista de folhas em breve",
      })
    } catch (error: any) {
      console.error("Erro ao exportar lista:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao exportar relatório",
      })
    } finally {
      setLoadingPayroll(null)
    }
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios & Exportações</h1>
          <p className="text-muted-foreground">
            Exporte relatórios financeiros, de investidores e folha de pagamento
          </p>
        </div>

        {/* ============================================
            RELATÓRIOS FINANCEIROS
            ============================================ */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-3">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <CardTitle>Relatórios Financeiros</CardTitle>
                <CardDescription>
                  Fluxo de caixa, contas a pagar/receber e transações
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filtros */}
            <div className="grid gap-4 md:grid-cols-3 rounded-lg border p-4 bg-muted/50">
              <div className="space-y-2">
                <Label>Data Início</Label>
                <Input
                  type="date"
                  value={financialFilters.startDate}
                  onChange={(e) =>
                    setFinancialFilters({ ...financialFilters, startDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Data Fim</Label>
                <Input
                  type="date"
                  value={financialFilters.endDate}
                  onChange={(e) =>
                    setFinancialFilters({ ...financialFilters, endDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={financialFilters.status}
                  onValueChange={(value) =>
                    setFinancialFilters({ ...financialFilters, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pendente</SelectItem>
                    <SelectItem value="PAID">Pago</SelectItem>
                    <SelectItem value="CANCELLED">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Botões de Exportação */}
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <Button
                variant="outline"
                className="justify-start h-auto py-4"
                onClick={handleExportCashFlow}
                disabled={loadingFinancial === "cashflow"}
              >
                {loadingFinancial === "cashflow" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                <div className="text-left">
                  <div className="font-medium">Fluxo de Caixa</div>
                  <div className="text-xs text-muted-foreground">Excel</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto py-4"
                onClick={handleExportAccountsPayable}
                disabled={loadingFinancial === "payable"}
              >
                {loadingFinancial === "payable" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                <div className="text-left">
                  <div className="font-medium">Contas a Pagar</div>
                  <div className="text-xs text-muted-foreground">Excel</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto py-4"
                onClick={handleExportAccountsReceivable}
                disabled={loadingFinancial === "receivable"}
              >
                {loadingFinancial === "receivable" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                <div className="text-left">
                  <div className="font-medium">Contas a Receber</div>
                  <div className="text-xs text-muted-foreground">Excel</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto py-4"
                onClick={handleExportByCentroCusto}
                disabled={loadingFinancial === "centro-custo"}
              >
                {loadingFinancial === "centro-custo" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                <div className="text-left">
                  <div className="font-medium">Por Centro de Custo</div>
                  <div className="text-xs text-muted-foreground">Excel</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto py-4"
                onClick={handleExportByContaContabil}
                disabled={loadingFinancial === "conta-contabil"}
              >
                {loadingFinancial === "conta-contabil" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                <div className="text-left">
                  <div className="font-medium">Por Conta Contábil</div>
                  <div className="text-xs text-muted-foreground">Excel</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ============================================
            RELATÓRIOS DE INVESTIDORES
            ============================================ */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/10 p-3">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <CardTitle>Relatórios de Investidores</CardTitle>
                <CardDescription>
                  Aportes, distribuições e ROI
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filtros */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 rounded-lg border p-4 bg-muted/50">
              <div className="space-y-2">
                <Label>Projeto</Label>
                <Popover open={openProject} onOpenChange={setOpenProject}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openProject}
                      className="w-full justify-between"
                      disabled={loadingData}
                    >
                      {investorFilters.projectId
                        ? projects.find((p) => p.id === investorFilters.projectId)?.name
                        : "Selecionar projeto..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar projeto..." />
                      <CommandEmpty>Nenhum projeto encontrado.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        <CommandItem
                          value=""
                          onSelect={() => {
                            setInvestorFilters({ ...investorFilters, projectId: "" })
                            setOpenProject(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              investorFilters.projectId === "" ? "opacity-100" : "opacity-0"
                            )}
                          />
                          Todos os projetos
                        </CommandItem>
                        {projects.map((project) => (
                          <CommandItem
                            key={project.id}
                            value={project.name}
                            onSelect={() => {
                              setInvestorFilters({ ...investorFilters, projectId: project.id })
                              setOpenProject(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                investorFilters.projectId === project.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {project.name} ({project.code})
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Investidor</Label>
                <Popover open={openInvestor} onOpenChange={setOpenInvestor}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openInvestor}
                      className="w-full justify-between"
                      disabled={loadingData}
                    >
                      {investorFilters.investorId
                        ? investors.find((i) => i.id === investorFilters.investorId)?.fullName ||
                          investors.find((i) => i.id === investorFilters.investorId)?.companyName
                        : "Selecionar investidor..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar investidor..." />
                      <CommandEmpty>Nenhum investidor encontrado.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        <CommandItem
                          value=""
                          onSelect={() => {
                            setInvestorFilters({ ...investorFilters, investorId: "" })
                            setOpenInvestor(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              investorFilters.investorId === "" ? "opacity-100" : "opacity-0"
                            )}
                          />
                          Todos os investidores
                        </CommandItem>
                        {investors.map((investor) => (
                          <CommandItem
                            key={investor.id}
                            value={investor.fullName || investor.companyName || ""}
                            onSelect={() => {
                              setInvestorFilters({ ...investorFilters, investorId: investor.id })
                              setOpenInvestor(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                investorFilters.investorId === investor.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {investor.fullName || investor.companyName}
                            {investor.cpf && ` (${investor.cpf})`}
                            {investor.cnpj && ` (${investor.cnpj})`}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Data Início</Label>
                <Input
                  type="date"
                  value={investorFilters.startDate}
                  onChange={(e) =>
                    setInvestorFilters({ ...investorFilters, startDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Data Fim</Label>
                <Input
                  type="date"
                  value={investorFilters.endDate}
                  onChange={(e) =>
                    setInvestorFilters({ ...investorFilters, endDate: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Botões de Exportação */}
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Button
                variant="outline"
                className="justify-start h-auto py-4"
                onClick={handleExportInvestments}
                disabled={loadingInvestors === "investments"}
              >
                {loadingInvestors === "investments" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                <div className="text-left">
                  <div className="font-medium">Aportes</div>
                  <div className="text-xs text-muted-foreground">Excel</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto py-4"
                onClick={handleExportDistributions}
                disabled={loadingInvestors === "distributions"}
              >
                {loadingInvestors === "distributions" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                <div className="text-left">
                  <div className="font-medium">Distribuições</div>
                  <div className="text-xs text-muted-foreground">Excel</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto py-4"
                onClick={handleExportROI}
                disabled={loadingInvestors === "roi"}
              >
                {loadingInvestors === "roi" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                <div className="text-left">
                  <div className="font-medium">ROI</div>
                  <div className="text-xs text-muted-foreground">Excel</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto py-4"
                onClick={handleExportInvestorsSummary}
                disabled={loadingInvestors === "investors-summary"}
              >
                {loadingInvestors === "investors-summary" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                <div className="text-left">
                  <div className="font-medium">Resumo Investidores</div>
                  <div className="text-xs text-muted-foreground">Excel</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ============================================
            RELATÓRIOS DE FOLHA DE PAGAMENTO
            ============================================ */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-500/10 p-3">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <CardTitle>Relatórios de Folha de Pagamento</CardTitle>
                <CardDescription>
                  Folhas consolidadas e holerites individuais
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filtros */}
            <div className="grid gap-4 md:grid-cols-3 rounded-lg border p-4 bg-muted/50">
              <div className="space-y-2">
                <Label>Mês</Label>
                <Select
                  value={payrollFilters.month}
                  onValueChange={(value) =>
                    setPayrollFilters({ ...payrollFilters, month: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar mês" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="01">Janeiro</SelectItem>
                    <SelectItem value="02">Fevereiro</SelectItem>
                    <SelectItem value="03">Março</SelectItem>
                    <SelectItem value="04">Abril</SelectItem>
                    <SelectItem value="05">Maio</SelectItem>
                    <SelectItem value="06">Junho</SelectItem>
                    <SelectItem value="07">Julho</SelectItem>
                    <SelectItem value="08">Agosto</SelectItem>
                    <SelectItem value="09">Setembro</SelectItem>
                    <SelectItem value="10">Outubro</SelectItem>
                    <SelectItem value="11">Novembro</SelectItem>
                    <SelectItem value="12">Dezembro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ano</Label>
                <Select
                  value={payrollFilters.year}
                  onValueChange={(value) =>
                    setPayrollFilters({ ...payrollFilters, year: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar ano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={payrollFilters.status}
                  onValueChange={(value) =>
                    setPayrollFilters({ ...payrollFilters, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Rascunho</SelectItem>
                    <SelectItem value="CALCULATED">Calculada</SelectItem>
                    <SelectItem value="APPROVED">Aprovada</SelectItem>
                    <SelectItem value="PAID">Paga</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Botões de Exportação */}
            <div className="grid gap-3 md:grid-cols-2">
              <Button
                variant="outline"
                className="justify-start h-auto py-4"
                onClick={handleExportPayrollList}
                disabled={loadingPayroll === "list"}
              >
                {loadingPayroll === "list" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                <div className="text-left">
                  <div className="font-medium">Lista de Folhas</div>
                  <div className="text-xs text-muted-foreground">Excel</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto py-4"
                disabled
              >
                <FileText className="mr-2 h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Folha Consolidada (PDF)</div>
                  <div className="text-xs text-muted-foreground">Selecionar na lista</div>
                </div>
              </Button>
            </div>

            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <strong>Nota:</strong> Para exportar folhas específicas em PDF ou Excel, acesse a lista
              de folhas de pagamento e use os botões de ação em cada item.
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <FileSpreadsheet className="h-5 w-5 text-blue-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">Formatos Disponíveis</h3>
                <p className="text-sm text-muted-foreground">
                  Todos os relatórios são exportados em formato Excel (.xlsx) para fácil análise.
                  Relatórios de folha de pagamento também disponíveis em PDF.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
