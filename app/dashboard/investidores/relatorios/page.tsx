"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FileSpreadsheet,
  Download,
  Loader2,
  Filter,
  TrendingUp,
  Users,
  FolderKanban,
  DollarSign,
  BarChart3,
  AlertCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/api/auth"
import { reportsApi, type InvestmentStatus, type DistributionStatus, type ProjectStatus, type InvestorStatus, type InvestorType } from "@/lib/api/reports"
import { projectsApi } from "@/lib/api/projects"
import { investorsApi } from "@/lib/api/investors"

interface Project {
  id: string
  name: string
  code: string
}

interface Investor {
  id: string
  name?: string
  companyName?: string
  type: InvestorType
}

export default function RelatoriosInvestidoresPage() {
  const { toast } = useToast()
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [loadingInvestors, setLoadingInvestors] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [investors, setInvestors] = useState<Investor[]>([])

  // Filtros para Aportes
  const [investmentFilters, setInvestmentFilters] = useState({
    projectId: "",
    investorId: "",
    startDate: "",
    endDate: "",
    status: "" as InvestmentStatus | "",
  })

  // Filtros para Distribuições
  const [distributionFilters, setDistributionFilters] = useState({
    projectId: "",
    investorId: "",
    startDate: "",
    endDate: "",
    status: "" as DistributionStatus | "",
  })

  // Filtros para ROI
  const [roiFilters, setRoiFilters] = useState({
    projectId: "",
    investorId: "",
    startDate: "",
    endDate: "",
  })

  // Filtros para Investidores
  const [investorReportFilters, setInvestorReportFilters] = useState({
    type: "" as InvestorType | "",
    status: "" as InvestorStatus | "",
    category: "",
  })

  // Filtros para Projetos
  const [projectReportFilters, setProjectReportFilters] = useState({
    status: "" as ProjectStatus | "",
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    loadSelectedCompany()
  }, [])

  useEffect(() => {
    if (selectedCompany) {
      loadProjects()
      loadInvestors()
    }
  }, [selectedCompany])

  const loadSelectedCompany = async () => {
    try {
      const company = await authApi.getSelectedCompany()
      setSelectedCompany(company)
    } catch (error) {
      console.error("Erro ao carregar empresa:", error)
    }
  }

  const loadProjects = async () => {
    if (!selectedCompany?.id) return

    try {
      setLoadingProjects(true)
      const result = await projectsApi.getAll(selectedCompany.id, {
        page: 1,
        limit: 100,
      })
      setProjects(
        result.data.map(p => ({
          id: p.id,
          name: p.name,
          code: p.code,
        }))
      )
    } catch (error: any) {
      console.error("Erro ao carregar projetos:", error)
      toast({
        title: "Erro ao carregar projetos",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setLoadingProjects(false)
    }
  }

  const loadInvestors = async () => {
    if (!selectedCompany?.id) return

    try {
      setLoadingInvestors(true)
      const result = await investorsApi.getAll(selectedCompany.id, {
        page: 1,
        limit: 100,
      })
      setInvestors(
        result.data.map(i => ({
          id: i.id,
          name: (i.type === "PESSOA_FISICA" ? i.fullName : undefined) || undefined,
          companyName: i.companyName || undefined,
          type: i.type,
        }))
      )
    } catch (error: any) {
      console.error("Erro ao carregar investidores:", error)
      toast({
        title: "Erro ao carregar investidores",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setLoadingInvestors(false)
    }
  }

  const handleExportInvestments = async () => {
    if (!selectedCompany?.id) return

    try {
      setLoading("investments")

      const filters = {
        projectId: investmentFilters.projectId || undefined,
        investorId: investmentFilters.investorId || undefined,
        startDate: investmentFilters.startDate || undefined,
        endDate: investmentFilters.endDate || undefined,
        status: investmentFilters.status || undefined,
      }

      const blob = await reportsApi.exportInvestments(selectedCompany.id, filters)
      reportsApi.downloadBlob(blob, reportsApi.generateFilename("aportes"))

      toast({
        title: "Sucesso",
        description: "Relatório de aportes exportado com sucesso",
      })
    } catch (error: any) {
      console.error("Erro ao exportar relatório:", error)
      toast({
        title: "Erro ao exportar relatório",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const handleExportInvestmentsByInvestor = async () => {
    if (!selectedCompany?.id) return

    try {
      setLoading("investments-by-investor")

      const filters = {
        projectId: investmentFilters.projectId || undefined,
        investorId: investmentFilters.investorId || undefined,
        startDate: investmentFilters.startDate || undefined,
        endDate: investmentFilters.endDate || undefined,
        status: investmentFilters.status || undefined,
      }

      const blob = await reportsApi.exportInvestmentsByInvestor(selectedCompany.id, filters)
      reportsApi.downloadBlob(blob, reportsApi.generateFilename("aportes_por_investidor"))

      toast({
        title: "Sucesso",
        description: "Relatório exportado com sucesso",
      })
    } catch (error: any) {
      console.error("Erro ao exportar relatório:", error)
      toast({
        title: "Erro ao exportar relatório",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const handleExportInvestmentsByProject = async () => {
    if (!selectedCompany?.id) return

    try {
      setLoading("investments-by-project")

      const filters = {
        projectId: investmentFilters.projectId || undefined,
        investorId: investmentFilters.investorId || undefined,
        startDate: investmentFilters.startDate || undefined,
        endDate: investmentFilters.endDate || undefined,
        status: investmentFilters.status || undefined,
      }

      const blob = await reportsApi.exportInvestmentsByProject(selectedCompany.id, filters)
      reportsApi.downloadBlob(blob, reportsApi.generateFilename("aportes_por_projeto"))

      toast({
        title: "Sucesso",
        description: "Relatório exportado com sucesso",
      })
    } catch (error: any) {
      console.error("Erro ao exportar relatório:", error)
      toast({
        title: "Erro ao exportar relatório",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const handleExportDistributions = async () => {
    if (!selectedCompany?.id) return

    try {
      setLoading("distributions")

      const filters = {
        projectId: distributionFilters.projectId || undefined,
        investorId: distributionFilters.investorId || undefined,
        startDate: distributionFilters.startDate || undefined,
        endDate: distributionFilters.endDate || undefined,
        status: distributionFilters.status || undefined,
      }

      const blob = await reportsApi.exportDistributions(selectedCompany.id, filters)
      reportsApi.downloadBlob(blob, reportsApi.generateFilename("distribuicoes"))

      toast({
        title: "Sucesso",
        description: "Relatório de distribuições exportado com sucesso",
      })
    } catch (error: any) {
      console.error("Erro ao exportar relatório:", error)
      toast({
        title: "Erro ao exportar relatório",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const handleExportROI = async () => {
    if (!selectedCompany?.id) return

    try {
      setLoading("roi")

      const filters = {
        projectId: roiFilters.projectId || undefined,
        investorId: roiFilters.investorId || undefined,
        startDate: roiFilters.startDate || undefined,
        endDate: roiFilters.endDate || undefined,
      }

      const blob = await reportsApi.exportROI(selectedCompany.id, filters)
      reportsApi.downloadBlob(blob, reportsApi.generateFilename("roi"))

      toast({
        title: "Sucesso",
        description: "Relatório de ROI exportado com sucesso",
      })
    } catch (error: any) {
      console.error("Erro ao exportar relatório:", error)
      toast({
        title: "Erro ao exportar relatório",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const handleExportInvestorsSummary = async () => {
    if (!selectedCompany?.id) return

    try {
      setLoading("investors-summary")

      const filters = {
        type: investorReportFilters.type || undefined,
        status: investorReportFilters.status || undefined,
        category: investorReportFilters.category || undefined,
      }

      const blob = await reportsApi.exportInvestorsSummary(selectedCompany.id, filters)
      reportsApi.downloadBlob(blob, reportsApi.generateFilename("resumo_investidores"))

      toast({
        title: "Sucesso",
        description: "Resumo de investidores exportado com sucesso",
      })
    } catch (error: any) {
      console.error("Erro ao exportar relatório:", error)
      toast({
        title: "Erro ao exportar relatório",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const handleExportProjectsSummary = async () => {
    if (!selectedCompany?.id) return

    try {
      setLoading("projects-summary")

      const filters = {
        status: projectReportFilters.status || undefined,
        startDate: projectReportFilters.startDate || undefined,
        endDate: projectReportFilters.endDate || undefined,
      }

      const blob = await reportsApi.exportProjectsSummary(selectedCompany.id, filters)
      reportsApi.downloadBlob(blob, reportsApi.generateFilename("resumo_projetos"))

      toast({
        title: "Sucesso",
        description: "Resumo de projetos exportado com sucesso",
      })
    } catch (error: any) {
      console.error("Erro ao exportar relatório:", error)
      toast({
        title: "Erro ao exportar relatório",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  if (!selectedCompany) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Nenhuma empresa selecionada</h3>
            <p className="text-sm text-muted-foreground">
              Selecione uma empresa para continuar
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Relatórios de Investidores
          </h1>
          <p className="text-muted-foreground">
            Exporte relatórios de aportes, distribuições, ROI e resumos em formato Excel
          </p>
        </div>

        {/* Relatórios de Aportes */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <CardTitle>Relatórios de Aportes</CardTitle>
            </div>
            <CardDescription>
              Exporte dados de investimentos com diferentes agrupamentos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filtros Comuns */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Filter className="h-4 w-4" />
                Filtros
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="investment-project">Projeto</Label>
                  <Select
                    value={investmentFilters.projectId}
                    onValueChange={value =>
                      setInvestmentFilters({ ...investmentFilters, projectId: value })
                    }
                    disabled={loadingProjects}
                  >
                    <SelectTrigger id="investment-project">
                      <SelectValue placeholder="Todos os projetos" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name} ({project.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="investment-investor">Investidor</Label>
                  <Select
                    value={investmentFilters.investorId}
                    onValueChange={value =>
                      setInvestmentFilters({ ...investmentFilters, investorId: value })
                    }
                    disabled={loadingInvestors}
                  >
                    <SelectTrigger id="investment-investor">
                      <SelectValue placeholder="Todos os investidores" />
                    </SelectTrigger>
                    <SelectContent>
                      {investors.map(investor => (
                        <SelectItem key={investor.id} value={investor.id}>
                          {investor.name || investor.companyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="investment-status">Status</Label>
                  <Select
                    value={investmentFilters.status}
                    onValueChange={value =>
                      setInvestmentFilters({
                        ...investmentFilters,
                        status: value as InvestmentStatus | "",
                      })
                    }
                  >
                    <SelectTrigger id="investment-status">
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDENTE">Pendente</SelectItem>
                      <SelectItem value="CONFIRMADO">Confirmado</SelectItem>
                      <SelectItem value="CANCELADO">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="investment-start-date">Data Inicial</Label>
                  <Input
                    id="investment-start-date"
                    type="date"
                    value={investmentFilters.startDate}
                    onChange={e =>
                      setInvestmentFilters({
                        ...investmentFilters,
                        startDate: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="investment-end-date">Data Final</Label>
                  <Input
                    id="investment-end-date"
                    type="date"
                    value={investmentFilters.endDate}
                    onChange={e =>
                      setInvestmentFilters({
                        ...investmentFilters,
                        endDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Botões de Exportação */}
            <div className="grid gap-4 md:grid-cols-3">
              <Button
                onClick={handleExportInvestments}
                disabled={loading === "investments"}
                className="w-full"
              >
                {loading === "investments" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Aportes Geral
                  </>
                )}
              </Button>

              <Button
                onClick={handleExportInvestmentsByInvestor}
                disabled={loading === "investments-by-investor"}
                variant="outline"
                className="w-full"
              >
                {loading === "investments-by-investor" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Por Investidor
                  </>
                )}
              </Button>

              <Button
                onClick={handleExportInvestmentsByProject}
                disabled={loading === "investments-by-project"}
                variant="outline"
                className="w-full"
              >
                {loading === "investments-by-project" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <FolderKanban className="mr-2 h-4 w-4" />
                    Por Projeto
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Relatórios de Distribuições */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-green-600" />
              <CardTitle>Relatórios de Distribuições</CardTitle>
            </div>
            <CardDescription>
              Exporte dados de pagamentos aos investidores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filtros */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Filter className="h-4 w-4" />
                Filtros
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="distribution-project">Projeto</Label>
                  <Select
                    value={distributionFilters.projectId}
                    onValueChange={value =>
                      setDistributionFilters({ ...distributionFilters, projectId: value })
                    }
                    disabled={loadingProjects}
                  >
                    <SelectTrigger id="distribution-project">
                      <SelectValue placeholder="Todos os projetos" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name} ({project.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="distribution-investor">Investidor</Label>
                  <Select
                    value={distributionFilters.investorId}
                    onValueChange={value =>
                      setDistributionFilters({ ...distributionFilters, investorId: value })
                    }
                    disabled={loadingInvestors}
                  >
                    <SelectTrigger id="distribution-investor">
                      <SelectValue placeholder="Todos os investidores" />
                    </SelectTrigger>
                    <SelectContent>
                      {investors.map(investor => (
                        <SelectItem key={investor.id} value={investor.id}>
                          {investor.name || investor.companyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="distribution-status">Status</Label>
                  <Select
                    value={distributionFilters.status}
                    onValueChange={value =>
                      setDistributionFilters({
                        ...distributionFilters,
                        status: value as DistributionStatus | "",
                      })
                    }
                  >
                    <SelectTrigger id="distribution-status">
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDENTE">Pendente</SelectItem>
                      <SelectItem value="PAGO">Pago</SelectItem>
                      <SelectItem value="CANCELADO">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="distribution-start-date">Data Inicial</Label>
                  <Input
                    id="distribution-start-date"
                    type="date"
                    value={distributionFilters.startDate}
                    onChange={e =>
                      setDistributionFilters({
                        ...distributionFilters,
                        startDate: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="distribution-end-date">Data Final</Label>
                  <Input
                    id="distribution-end-date"
                    type="date"
                    value={distributionFilters.endDate}
                    onChange={e =>
                      setDistributionFilters({
                        ...distributionFilters,
                        endDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Botão de Exportação */}
            <Button
              onClick={handleExportDistributions}
              disabled={loading === "distributions"}
              className="w-full md:w-auto"
            >
              {loading === "distributions" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Exportar Distribuições
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Relatório de ROI */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <CardTitle>Relatório de ROI</CardTitle>
            </div>
            <CardDescription>
              Retorno sobre investimento por investidor e projeto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filtros */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Filter className="h-4 w-4" />
                Filtros
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="roi-project">Projeto</Label>
                  <Select
                    value={roiFilters.projectId}
                    onValueChange={value =>
                      setRoiFilters({ ...roiFilters, projectId: value })
                    }
                    disabled={loadingProjects}
                  >
                    <SelectTrigger id="roi-project">
                      <SelectValue placeholder="Todos os projetos" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name} ({project.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roi-investor">Investidor</Label>
                  <Select
                    value={roiFilters.investorId}
                    onValueChange={value =>
                      setRoiFilters({ ...roiFilters, investorId: value })
                    }
                    disabled={loadingInvestors}
                  >
                    <SelectTrigger id="roi-investor">
                      <SelectValue placeholder="Todos os investidores" />
                    </SelectTrigger>
                    <SelectContent>
                      {investors.map(investor => (
                        <SelectItem key={investor.id} value={investor.id}>
                          {investor.name || investor.companyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roi-start-date">Data Inicial</Label>
                  <Input
                    id="roi-start-date"
                    type="date"
                    value={roiFilters.startDate}
                    onChange={e =>
                      setRoiFilters({ ...roiFilters, startDate: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roi-end-date">Data Final</Label>
                  <Input
                    id="roi-end-date"
                    type="date"
                    value={roiFilters.endDate}
                    onChange={e =>
                      setRoiFilters({ ...roiFilters, endDate: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Botão de Exportação */}
            <Button
              onClick={handleExportROI}
              disabled={loading === "roi"}
              className="w-full md:w-auto"
            >
              {loading === "roi" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Exportar ROI
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Resumos */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Resumo de Investidores */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                <CardTitle>Resumo de Investidores</CardTitle>
              </div>
              <CardDescription>
                Consolidação de dados de todos os investidores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="investor-type">Tipo</Label>
                  <Select
                    value={investorReportFilters.type}
                    onValueChange={value =>
                      setInvestorReportFilters({
                        ...investorReportFilters,
                        type: value as InvestorType | "",
                      })
                    }
                  >
                    <SelectTrigger id="investor-type">
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PESSOA_FISICA">Pessoa Física</SelectItem>
                      <SelectItem value="PESSOA_JURIDICA">Pessoa Jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="investor-status-report">Status</Label>
                  <Select
                    value={investorReportFilters.status}
                    onValueChange={value =>
                      setInvestorReportFilters({
                        ...investorReportFilters,
                        status: value as InvestorStatus | "",
                      })
                    }
                  >
                    <SelectTrigger id="investor-status-report">
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ATIVO">Ativo</SelectItem>
                      <SelectItem value="INATIVO">Inativo</SelectItem>
                      <SelectItem value="SUSPENSO">Suspenso</SelectItem>
                      <SelectItem value="BLOQUEADO">Bloqueado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleExportInvestorsSummary}
                disabled={loading === "investors-summary"}
                className="w-full"
              >
                {loading === "investors-summary" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Exportar Resumo
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Resumo de Projetos */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-teal-600" />
                <CardTitle>Resumo de Projetos</CardTitle>
              </div>
              <CardDescription>
                Consolidação de dados de todos os projetos SCP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project-status-report">Status</Label>
                  <Select
                    value={projectReportFilters.status}
                    onValueChange={value =>
                      setProjectReportFilters({
                        ...projectReportFilters,
                        status: value as ProjectStatus | "",
                      })
                    }
                  >
                    <SelectTrigger id="project-status-report">
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLANEJAMENTO">Planejamento</SelectItem>
                      <SelectItem value="EM_CAPTACAO">Em Captação</SelectItem>
                      <SelectItem value="ATIVO">Ativo</SelectItem>
                      <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                      <SelectItem value="CANCELADO">Cancelado</SelectItem>
                      <SelectItem value="SUSPENSO">Suspenso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="project-start-date-report">Data Início</Label>
                    <Input
                      id="project-start-date-report"
                      type="date"
                      value={projectReportFilters.startDate}
                      onChange={e =>
                        setProjectReportFilters({
                          ...projectReportFilters,
                          startDate: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project-end-date-report">Data Fim</Label>
                    <Input
                      id="project-end-date-report"
                      type="date"
                      value={projectReportFilters.endDate}
                      onChange={e =>
                        setProjectReportFilters({
                          ...projectReportFilters,
                          endDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleExportProjectsSummary}
                disabled={loading === "projects-summary"}
                className="w-full"
              >
                {loading === "projects-summary" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Exportar Resumo
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
