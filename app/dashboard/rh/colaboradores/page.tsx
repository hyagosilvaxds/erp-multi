"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, FileText, User, Filter, Users } from "lucide-react"
import Link from "next/link"
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
import { useToast } from '@/hooks/use-toast'
import {
  employeesApi,
  type Employee,
  type ContractType,
  type ListEmployeesParams,
  type EmployeeStats,
} from '@/lib/api/employees'
import { maskCPF, maskPhone } from '@/lib/masks'

export default function ColaboradoresPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [employees, setEmployees] = useState<Employee[]>([])
  const [stats, setStats] = useState<EmployeeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)

  // Filtros
  const [search, setSearch] = useState('')
  const [filterContractType, setFilterContractType] = useState<ContractType | 'all'>('all')
  const [filterDepartment, setFilterDepartment] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')

  // Paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [limit] = useState(50)

  useEffect(() => {
    loadStats()
  }, [])

  useEffect(() => {
    loadEmployees()
  }, [search, filterContractType, filterDepartment, filterStatus, currentPage])

  const loadStats = async () => {
    try {
      setLoadingStats(true)
      const data = await employeesApi.getStats()
      setStats(data)
    } catch (error: any) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const loadEmployees = async () => {
    try {
      setLoading(true)

      const params: ListEmployeesParams = {
        page: currentPage,
        limit,
      }

      if (search) {
        params.search = search
      }
      if (filterContractType !== 'all') {
        params.contractType = filterContractType
      }
      if (filterDepartment !== 'all') {
        params.departmentId = filterDepartment
      }
      if (filterStatus !== 'all') {
        params.active = filterStatus === 'active'
      }

      const response = await employeesApi.getAll(params)

      setEmployees(response.data)
      setTotalRecords(response.total)
      setTotalPages(response.totalPages)
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar colaboradores',
        description: error.response?.data?.message || 'Não foi possível carregar os colaboradores.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClearFilters = () => {
    setSearch('')
    setFilterContractType('all')
    setFilterDepartment('all')
    setFilterStatus('all')
    setCurrentPage(1)
  }

  const uniqueDepartments = stats?.byDepartment 
    ? Object.keys(stats.byDepartment).sort() 
    : []

  const formatSalary = (salary: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(salary))
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const contractTypeLabels: Record<ContractType, string> = {
    CLT: 'CLT',
    PJ: 'PJ',
    ESTAGIO: 'Estágio',
    TEMPORARIO: 'Temporário',
    AUTONOMO: 'Autônomo',
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Colaboradores</h1>
            <p className="text-muted-foreground">Gerenciar cadastro de colaboradores</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/rh/colaboradores/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Colaborador
            </Link>
          </Button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Colaboradores</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.active} ativos, {stats.inactive} inativos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Folha Total</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {formatSalary(stats.totalPayroll)}
                </div>
                <p className="text-xs text-muted-foreground">Soma dos salários</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Salário Médio</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {formatSalary(stats.averageSalary)}
                </div>
                <p className="text-xs text-muted-foreground">Ticket médio</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CLT</CardTitle>
                <User className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.byContractType.CLT}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.byContractType.PJ} PJ, {stats.byContractType.ESTAGIO} estágio
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Nome, CPF, cargo..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Contrato</label>
                <Select value={filterContractType} onValueChange={(value: any) => setFilterContractType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="CLT">CLT</SelectItem>
                    <SelectItem value="PJ">PJ</SelectItem>
                    <SelectItem value="ESTAGIO">Estágio</SelectItem>
                    <SelectItem value="TEMPORARIO">Temporário</SelectItem>
                    <SelectItem value="AUTONOMO">Autônomo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Departamento</label>
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {uniqueDepartments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button variant="outline" onClick={handleClearFilters} className="w-full">
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Colaboradores</CardTitle>
            <CardDescription>
              {totalRecords} {totalRecords === 1 ? 'colaborador encontrado' : 'colaboradores encontrados'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Carregando...</p>
                </div>
              </div>
            ) : employees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum colaborador encontrado</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {search || filterContractType !== 'all' || filterDepartment !== 'all' || filterStatus !== 'all'
                    ? 'Tente ajustar os filtros de busca.'
                    : 'Comece cadastrando seu primeiro colaborador.'}
                </p>
                <Button asChild>
                  <Link href="/dashboard/rh/colaboradores/novo">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Colaborador
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>CPF</TableHead>
                        <TableHead>Admissão</TableHead>
                        <TableHead>Departamento</TableHead>
                        <TableHead>Centro de Custo</TableHead>
                        <TableHead>Vínculo</TableHead>
                        <TableHead className="text-right">Salário</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employees.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell className="font-medium">{employee.name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {employee.position?.name || '-'}
                          </TableCell>
                          <TableCell className="font-mono text-sm">{maskCPF(employee.cpf)}</TableCell>
                          <TableCell className="text-sm">
                            {formatDate(employee.admissionDate)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{employee.department?.name || '-'}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {employee.costCenter?.nome || employee.costCenter?.name || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{contractTypeLabels[employee.contractType]}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatSalary(employee.salary)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={employee.active ? "default" : "secondary"}>
                              {employee.active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => router.push(`/dashboard/rh/colaboradores/${employee.id}`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Página {currentPage} de {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Próxima
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
