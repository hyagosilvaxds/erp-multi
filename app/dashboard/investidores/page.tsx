"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, Search, Plus, DollarSign, TrendingUp, Building2, FileText, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/api/auth"
import {
  investorsApi,
  type InvestorListItem,
  type InvestorsQueryParams,
} from "@/lib/api/investors"
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

export default function InvestidoresPage() {
  const { toast } = useToast()
  const selectedCompany = authApi.getSelectedCompany()
  
  const [investors, setInvestors] = useState<InvestorListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalInvestors, setTotalInvestors] = useState(0)

  useEffect(() => {
    if (selectedCompany?.id) {
      loadInvestors()
    }
  }, [selectedCompany?.id, currentPage, typeFilter, statusFilter])

  // Debounce search
  useEffect(() => {
    if (!selectedCompany?.id) return
    
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        loadInvestors()
      } else {
        setCurrentPage(1)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const loadInvestors = async () => {
    try {
      setLoading(true)
      if (!selectedCompany?.id) return

      const params: InvestorsQueryParams = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        type: typeFilter !== "all" ? (typeFilter as any) : undefined,
        status: statusFilter !== "all" ? (statusFilter as any) : undefined,
      }

      const response = await investorsApi.getAll(selectedCompany.id, params)
      setInvestors(response.data)
      setTotalPages(response.meta.totalPages)
      setTotalInvestors(response.meta.total)
    } catch (error: any) {
      console.error("Erro ao carregar investidores:", error)
      toast({
        title: "Erro ao carregar investidores",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const totalInvested = investors.reduce((acc, inv) => {
    // Você pode adicionar campo totalInvested na API ou calcular do _count
    return acc
  }, 0)

  const totalDistributed = investors.reduce((acc, inv) => {
    // Você pode adicionar campo totalDistributed na API ou calcular do _count
    return acc
  }, 0)

  const activeInvestors = investors.filter(i => i.active).length

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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Investidores SCP</h1>
            <p className="text-muted-foreground">Gestão de investidores e participações</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard/investidores/distribuicoes">
                <FileText className="mr-2 h-4 w-4" />
                Distribuições
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/investidores/novo">
                <Plus className="mr-2 h-4 w-4" />
                Novo Investidor
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Investidores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalInvestors}</div>
              <p className="text-xs text-muted-foreground">{activeInvestors} ativos</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Aportado</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {totalInvested.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
              <p className="text-xs text-muted-foreground">Capital total investido</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Distribuído</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {totalDistributed.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
              <p className="text-xs text-muted-foreground">Rendimentos pagos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">-</div>
              <p className="text-xs text-muted-foreground">Com investimentos SCP</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Button asChild variant="outline" className="h-auto flex-col gap-2 py-6 bg-transparent">
            <Link href="/dashboard/investidores/aportes">
              <DollarSign className="h-6 w-6" />
              <div className="text-center">
                <p className="font-semibold">Registrar Aporte</p>
                <p className="text-xs text-muted-foreground">Novo investimento</p>
              </div>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto flex-col gap-2 py-6 bg-transparent">
            <Link href="/dashboard/investidores/distribuicoes/nova">
              <TrendingUp className="h-6 w-6" />
              <div className="text-center">
                <p className="font-semibold">Nova Distribuição</p>
                <p className="text-xs text-muted-foreground">Distribuir rendimentos</p>
              </div>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto flex-col gap-2 py-6 bg-transparent">
            <Link href="/dashboard/investidores/politicas">
              <FileText className="h-6 w-6" />
              <div className="text-center">
                <p className="font-semibold">Políticas</p>
                <p className="text-xs text-muted-foreground">Configurar distribuições</p>
              </div>
            </Link>
          </Button>
        </div>

        {/* Investors Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lista de Investidores</CardTitle>
                <CardDescription>Cadastro completo de investidores SCP</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="PESSOA_FISICA">Pessoa Física</SelectItem>
                    <SelectItem value="PESSOA_JURIDICA">Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="ATIVO">Ativo</SelectItem>
                    <SelectItem value="INATIVO">Inativo</SelectItem>
                    <SelectItem value="SUSPENSO">Suspenso</SelectItem>
                    <SelectItem value="BLOQUEADO">Bloqueado</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar investidor..." 
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
            ) : investors.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum investidor encontrado</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm ? "Tente ajustar os filtros de busca" : "Comece cadastrando seu primeiro investidor"}
                </p>
                {!searchTerm && (
                  <Button asChild>
                    <Link href="/dashboard/investidores/novo">
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Investidor
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
                      <TableHead>Nome/Razão Social</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-center">Aportes</TableHead>
                      <TableHead className="text-center">Distribuições</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {investors.map((investor) => (
                      <TableRow key={investor.id}>
                        <TableCell className="font-mono text-sm">
                          {investor.investorCode}
                        </TableCell>
                        <TableCell className="font-medium">
                          {investorsApi.helpers.getName(investor)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {investorsApi.helpers.getTypeAbbreviation(investor.type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {investorsApi.helpers.getDocument(investor)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {investor.email}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">
                            {investor._count.investments}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">
                            {investor._count.distributions}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={investorsApi.helpers.getStatusColor(investor.status) as any}>
                            {investorsApi.helpers.getStatusLabel(investor.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/dashboard/investidores/${investor.id}`}>
                              Ver Detalhes
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Página {currentPage} de {totalPages} ({totalInvestors} investidores)
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
