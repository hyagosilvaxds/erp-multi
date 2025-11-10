'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Plus,
  Search,
  Filter,
  Eye,
  Calendar,
  DollarSign,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'
import {
  getAllPayrolls,
  getPayrollStats,
  type Payroll,
  type PayrollStatus,
  type PayrollType,
  type PayrollStatsResponse,
} from '@/lib/api/payroll'

const STATUS_CONFIG = {
  DRAFT: { label: 'Rascunho', color: 'bg-gray-500' },
  CALCULATED: { label: 'Calculada', color: 'bg-blue-500' },
  APPROVED: { label: 'Aprovada', color: 'bg-green-500' },
  PAID: { label: 'Paga', color: 'bg-purple-500' },
}

const TYPE_CONFIG = {
  MONTHLY: 'Mensal',
  WEEKLY: 'Semanal',
  DAILY: 'Diária',
  ADVANCE: 'Adiantamento',
}

export default function PayrollPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [payrolls, setPayrolls] = useState<Payroll[]>([])
  const [stats, setStats] = useState<PayrollStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Filtros
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [monthFilter, setMonthFilter] = useState<string>('all')
  const [yearFilter, setYearFilter] = useState<string>(new Date().getFullYear().toString())

  useEffect(() => {
    loadData()
  }, [page, statusFilter, typeFilter, monthFilter, yearFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      
      const params: any = {
        page,
        limit: 10,
      }
      
      if (statusFilter !== 'all') params.status = statusFilter
      if (typeFilter !== 'all') params.type = typeFilter
      if (monthFilter !== 'all') params.referenceMonth = parseInt(monthFilter)
      if (yearFilter !== 'all') params.referenceYear = parseInt(yearFilter)
      if (search) params.search = search

      const [payrollsResponse, statsResponse] = await Promise.all([
        getAllPayrolls(params),
        getPayrollStats(
          monthFilter !== 'all' ? parseInt(monthFilter) : undefined,
          yearFilter !== 'all' ? parseInt(yearFilter) : undefined
        ),
      ])

      setPayrolls(payrollsResponse.data)
      setTotalPages(payrollsResponse.meta.totalPages)
      setStats(statsResponse)
    } catch (error) {
      console.error('Erro ao carregar folhas:', error)
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar as folhas de pagamento',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    loadData()
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Folha de Pagamento</h1>
          <p className="text-muted-foreground">Gerencie as folhas de pagamento da empresa</p>
        </div>
        <Button onClick={() => router.push('/dashboard/rh/folha-pagamento/nova')}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Folha
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Folhas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPayrolls}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.byStatus.PAID || 0} pagas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Colaboradores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEmployees}</div>
              <p className="text-xs text-muted-foreground mt-1">Total ativo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(Number(stats.totalNetAmount))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Média: {formatCurrency(Number(stats.averageNetAmount))}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-xs">
                {Object.entries(stats.byStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between">
                    <span>{STATUS_CONFIG[status as PayrollStatus]?.label || status}:</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtre as folhas de pagamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="md:col-span-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Buscar por descrição..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button size="icon" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os meses</SelectItem>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <SelectItem key={month} value={month.toString()}>
                    {format(new Date(2024, month - 1), 'MMMM', { locale: ptBR })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Folhas de Pagamento</CardTitle>
          <CardDescription>
            {payrolls.length} folha{payrolls.length !== 1 ? 's' : ''} encontrada
            {payrolls.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-[200px] items-center justify-center">
              <div className="text-center">
                <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                <p className="text-muted-foreground">Carregando folhas...</p>
              </div>
            </div>
          ) : payrolls.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              Nenhuma folha de pagamento encontrada
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Período</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Colaboradores</TableHead>
                    <TableHead className="text-right">Proventos</TableHead>
                    <TableHead className="text-right">Descontos</TableHead>
                    <TableHead className="text-right">Líquido</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrolls.map((payroll) => {
                    const monthYear = `${payroll.referenceYear}-${String(payroll.referenceMonth).padStart(2, '0')}`
                    const monthName = format(
                      new Date(payroll.referenceYear, payroll.referenceMonth - 1),
                      'MMM/yyyy',
                      { locale: ptBR }
                    )

                    return (
                      <TableRow key={payroll.id}>
                        <TableCell className="font-medium">
                          {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
                        </TableCell>
                        <TableCell>{TYPE_CONFIG[payroll.type as PayrollType]}</TableCell>
                        <TableCell>
                          <Badge className={STATUS_CONFIG[payroll.status as PayrollStatus].color}>
                            {STATUS_CONFIG[payroll.status as PayrollStatus].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{payroll.itemsCount || 0}</TableCell>
                        <TableCell className="text-right text-green-600">
                          {formatCurrency(Number(payroll.totalEarnings))}
                        </TableCell>
                        <TableCell className="text-right text-red-600">
                          {formatCurrency(Number(payroll.totalDeductions))}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(Number(payroll.netAmount))}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                router.push(`/dashboard/rh/folha-pagamento/${payroll.id}`)
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
