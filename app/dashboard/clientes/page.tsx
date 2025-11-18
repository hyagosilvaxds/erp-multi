'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Filter, Users, Building2, User, Mail, Phone } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import { useToast } from '@/hooks/use-toast'
import { usePermissions } from '@/hooks/use-permissions'
import {
  customersApi,
  type Customer,
  type PersonType,
  type ListCustomersParams,
  type CustomerStats,
} from '@/lib/api/customers'

export default function CustomersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { can } = usePermissions('company')

  const [customers, setCustomers] = useState<Customer[]>([])
  const [stats, setStats] = useState<CustomerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)
  
  // Filtros
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<PersonType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [limit] = useState(50)

  const canCreate = can('clientes', 'create')

  useEffect(() => {
    loadStats()
  }, [])

  useEffect(() => {
    loadCustomers()
  }, [search, filterType, filterStatus, currentPage])

  const loadStats = async () => {
    try {
      setLoadingStats(true)
      const data = await customersApi.getStats()
      setStats(data)
    } catch (error: any) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const loadCustomers = async () => {
    try {
      setLoading(true)

      const params: ListCustomersParams = {
        page: currentPage,
        limit,
      }

      if (search) {
        params.search = search
      }
      if (filterType !== 'all') {
        params.personType = filterType
      }
      if (filterStatus !== 'all') {
        params.active = filterStatus === 'active'
      }

      const response = await customersApi.getAll(params)

      setCustomers(response.data)
      setTotalRecords(response.total)
      setTotalPages(response.totalPages)
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar clientes',
        description: error.response?.data?.message || 'Não foi possível carregar os clientes.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClearFilters = () => {
    setSearch('')
    setFilterType('all')
    setFilterStatus('all')
    setCurrentPage(1)
  }

  const getCustomerName = (customer: Customer) => {
    if (customer.personType === 'FISICA') {
      return customer.name || '-'
    }
    return customer.tradeName || customer.companyName || '-'
  }

  const getCustomerDocument = (customer: Customer) => {
    if (customer.personType === 'FISICA') {
      return customer.cpf ? formatCPF(customer.cpf) : '-'
    }
    return customer.cnpj ? formatCNPJ(customer.cnpj) : '-'
  }

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }

  const formatPhone = (phone?: string) => {
    if (!phone) return '-'
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
            <p className="text-muted-foreground">
              Gerencie os clientes da sua empresa
            </p>
          </div>
          {canCreate && (
            <Button onClick={() => router.push('/dashboard/clientes/novo')}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          )}
        </div>

        {/* Estatísticas */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.active} ativos, {stats.inactive} inativos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pessoas Físicas</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.byType.fisica}</div>
                <p className="text-xs text-muted-foreground">
                  {((stats.byType.fisica / stats.total) * 100).toFixed(1)}% do total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pessoas Jurídicas</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.byType.juridica}</div>
                <p className="text-xs text-muted-foreground">
                  {((stats.byType.juridica / stats.total) * 100).toFixed(1)}% do total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active}</div>
                <p className="text-xs text-muted-foreground">
                  {((stats.active / stats.total) * 100).toFixed(1)}% de ativação
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
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nome, CPF, CNPJ, Email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo</label>
                <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="FISICA">Pessoa Física</SelectItem>
                    <SelectItem value="JURIDICA">Pessoa Jurídica</SelectItem>
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

        {/* Lista de Clientes */}
        <Card>
          <CardHeader>
            <CardTitle>Clientes Cadastrados</CardTitle>
            <CardDescription>
              {totalRecords} {totalRecords === 1 ? 'cliente encontrado' : 'clientes encontrados'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {customers.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum cliente encontrado</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {search || filterType !== 'all' || filterStatus !== 'all'
                    ? 'Tente ajustar os filtros de busca.'
                    : 'Comece criando seu primeiro cliente.'}
                </p>
                {canCreate && (
                  <Button onClick={() => router.push('/dashboard/clientes/novo')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Cliente
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Nome/Razão Social</TableHead>
                        <TableHead>CPF/CNPJ</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Cidade</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow 
                          key={customer.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => router.push(`/dashboard/clientes/${customer.id}`)}
                        >
                          <TableCell>
                            {customer.personType === 'FISICA' ? (
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs">PF</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs">PJ</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {getCustomerName(customer)}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {getCustomerDocument(customer)}
                          </TableCell>
                          <TableCell>
                            {customer.email ? (
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{customer.email}</span>
                              </div>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            {customer.mobile || customer.phone ? (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {formatPhone(customer.mobile || customer.phone)}
                                </span>
                              </div>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            {customer.addresses && customer.addresses.length > 0
                              ? `${customer.addresses[0].city}/${customer.addresses[0].state}`
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={customer.active ? 'default' : 'secondary'}>
                              {customer.active ? 'Ativo' : 'Inativo'}
                            </Badge>
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
