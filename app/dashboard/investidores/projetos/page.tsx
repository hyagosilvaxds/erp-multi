"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  FolderKanban, 
  Search, 
  Plus, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Loader2, 
  AlertCircle,
  CalendarDays 
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/api/auth"
import {
  projectsApi,
  type ProjectListItem,
  type ProjectsQueryParams,
  type ProjectsStatsResponse,
} from "@/lib/api/projects"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function ProjetosPage() {
  const { toast } = useToast()
  const selectedCompany = authApi.getSelectedCompany()
  
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [stats, setStats] = useState<ProjectsStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProjects, setTotalProjects] = useState(0)

  useEffect(() => {
    if (selectedCompany?.id) {
      loadProjects()
      loadStats()
    }
  }, [selectedCompany?.id, currentPage, statusFilter])

  // Debounce search
  useEffect(() => {
    if (!selectedCompany?.id) return
    
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        loadProjects()
      } else {
        setCurrentPage(1)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const loadProjects = async () => {
    try {
      setLoading(true)
      if (!selectedCompany?.id) return

      const params: ProjectsQueryParams = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        status: statusFilter !== "all" ? (statusFilter as any) : undefined,
      }

      const response = await projectsApi.getAll(selectedCompany.id, params)
      setProjects(response.data)
      setTotalPages(response.meta.totalPages)
      setTotalProjects(response.meta.total)
    } catch (error: any) {
      console.error("Erro ao carregar projetos:", error)
      toast({
        title: "Erro ao carregar projetos",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      if (!selectedCompany?.id) return
      const statsData = await projectsApi.getStats(selectedCompany.id)
      setStats(statsData)
    } catch (error: any) {
      console.error("Erro ao carregar estatísticas:", error)
    }
  }

  if (!selectedCompany) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Nenhuma empresa selecionada</h3>
            <p className="text-sm text-muted-foreground">Selecione uma empresa para continuar</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Projetos SCP</h1>
            <p className="text-muted-foreground">Gestão de projetos e empreendimentos</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/investidores/projetos/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Projeto
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stats.summary.totalProjects}
                </div>
                <p className="text-xs text-muted-foreground">
                  Projetos cadastrados
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {projectsApi.helpers.formatCurrency(stats.summary.totalInvested)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Capital total aportado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Distribuído</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {projectsApi.helpers.formatCurrency(stats.summary.totalDistributed)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Rendimentos pagos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ROI Médio</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stats.summary.averageROI}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Retorno sobre investimento
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Projects Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lista de Projetos</CardTitle>
                <CardDescription>Todos os projetos e empreendimentos cadastrados</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="ATIVO">Ativo</SelectItem>
                    <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                    <SelectItem value="CANCELADO">Cancelado</SelectItem>
                    <SelectItem value="SUSPENSO">Suspenso</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar projeto..." 
                    className="pl-8 w-[300px]" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <FolderKanban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum projeto encontrado</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm ? "Tente ajustar os filtros de busca" : "Comece cadastrando seu primeiro projeto"}
                </p>
                {!searchTerm && (
                  <Button asChild>
                    <Link href="/dashboard/investidores/projetos/novo">
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Projeto
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Nome do Projeto</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                      <TableHead className="text-right">Investido</TableHead>
                      <TableHead className="text-right">Distribuído</TableHead>
                      <TableHead>Progresso</TableHead>
                      <TableHead className="text-center">Investidores</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project) => {
                      const investedPercentage = projectsApi.helpers.calculateInvestedPercentage(
                        project.totalValue,
                        project.investedValue
                      )
                      
                      return (
                        <TableRow key={project.id}>
                          <TableCell className="font-mono text-sm">
                            {project.code}
                          </TableCell>
                          <TableCell className="font-medium">
                            <div>
                              <p>{project.name}</p>
                              <p className="text-xs text-muted-foreground">
                                <CalendarDays className="inline h-3 w-3 mr-1" />
                                {new Date(project.startDate).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {projectsApi.helpers.formatCurrency(project.totalValue)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-green-600">
                            {projectsApi.helpers.formatCurrency(project.investedValue)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-blue-600">
                            {projectsApi.helpers.formatCurrency(project.distributedValue)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={investedPercentage} className="w-[60px]" />
                              <span className="text-xs text-muted-foreground w-[35px]">
                                {investedPercentage}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center gap-1">
                              <Badge variant="secondary">
                                <Users className="h-3 w-3 mr-1" />
                                {project._count.investments}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={projectsApi.helpers.getStatusColor(project.status) as any}>
                              {projectsApi.helpers.getStatusLabel(project.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button asChild variant="ghost" size="sm">
                              <Link href={`/dashboard/investidores/projetos/${project.id}`}>
                                Ver Detalhes
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Página {currentPage} de {totalPages} ({totalProjects} projetos)
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
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
    </DashboardLayout>
  )
}
