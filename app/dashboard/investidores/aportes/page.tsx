"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Plus,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Loader2,
  Edit,
  Trash2,
  Eye,
  FileText,
  Calendar,
  CheckCircle2,
} from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/api/auth"
import {
  investmentsApi,
  type InvestmentStatus,
  type InvestmentListItem,
} from "@/lib/api/investments"

export default function AportesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [investments, setInvestments] = useState<InvestmentListItem[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<InvestmentStatus | "ALL">("ALL")

  // Stats
  const [stats, setStats] = useState({
    totalConfirmed: 0,
    totalPending: 0,
    totalCanceled: 0,
    countTotal: 0,
  })

  useEffect(() => {
    loadSelectedCompany()
  }, [])

  useEffect(() => {
    if (selectedCompany) {
      loadInvestments()
    }
  }, [selectedCompany, page, statusFilter])

  const loadSelectedCompany = async () => {
    try {
      const company = await authApi.getSelectedCompany()
      setSelectedCompany(company)
    } catch (error) {
      console.error("Erro ao carregar empresa:", error)
    }
  }

  const loadInvestments = async () => {
    if (!selectedCompany?.id) return

    try {
      setLoading(true)

      const params: any = {
        page,
        limit: 10,
      }

      if (statusFilter !== "ALL") {
        params.status = statusFilter
      }

      if (search) {
        params.search = search
      }

      const response = await investmentsApi.getAll(selectedCompany.id, params)

      setInvestments(response.data)
      setTotal(response.meta.total)
      setTotalPages(response.meta.totalPages)

      // Calcular stats
      calculateStats(response.data)
    } catch (error: any) {
      console.error("Erro ao carregar aportes:", error)
      toast({
        title: "Erro ao carregar aportes",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data: InvestmentListItem[]) => {
    const confirmed = data.filter(i => i.status === "CONFIRMADO")
    const pending = data.filter(i => i.status === "PENDENTE")
    const canceled = data.filter(i => i.status === "CANCELADO")

    setStats({
      totalConfirmed: confirmed.reduce((sum, i) => sum + i.amount, 0),
      totalPending: pending.reduce((sum, i) => sum + i.amount, 0),
      totalCanceled: canceled.reduce((sum, i) => sum + i.amount, 0),
      countTotal: data.length,
    })
  }

  const handleSearch = () => {
    setPage(1)
    loadInvestments()
  }

  const handleDelete = async (investmentId: string) => {
    if (!selectedCompany?.id) return

    if (!confirm("Tem certeza que deseja excluir este aporte?")) return

    try {
      await investmentsApi.delete(selectedCompany.id, investmentId)

      toast({
        title: "Sucesso",
        description: "Aporte excluído com sucesso",
      })

      loadInvestments()
    } catch (error: any) {
      console.error("Erro ao excluir aporte:", error)
      toast({
        title: "Erro ao excluir aporte",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    }
  }

  const handleConfirm = async (investmentId: string, currentStatus: InvestmentStatus) => {
    if (!selectedCompany?.id) return

    // Se já está confirmado, não faz nada
    if (currentStatus === "CONFIRMADO") {
      toast({
        title: "Informação",
        description: "Este aporte já está confirmado",
      })
      return
    }

    if (!confirm("Tem certeza que deseja confirmar este aporte?")) return

    try {
      await investmentsApi.update(selectedCompany.id, investmentId, {
        status: "CONFIRMADO",
      })

      toast({
        title: "Sucesso",
        description: "Aporte confirmado com sucesso",
      })

      loadInvestments()
    } catch (error: any) {
      console.error("Erro ao confirmar aporte:", error)
      toast({
        title: "Erro ao confirmar aporte",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Gestão de Aportes
            </h1>
            <p className="text-muted-foreground">
              Registro e controle de investimentos
            </p>
          </div>
          <Link href="/dashboard/investidores/aportes/novo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Registrar Aporte
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Aportes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.countTotal}</div>
              <p className="text-xs text-muted-foreground">
                Total de investimentos registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Confirmado</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {investmentsApi.helpers.formatCurrency(stats.totalConfirmed)}
              </div>
              <p className="text-xs text-muted-foreground">
                Aportes confirmados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Pendente</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {investmentsApi.helpers.formatCurrency(stats.totalPending)}
              </div>
              <p className="text-xs text-muted-foreground">
                Aguardando confirmação
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Cancelado</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {investmentsApi.helpers.formatCurrency(stats.totalCanceled)}
              </div>
              <p className="text-xs text-muted-foreground">
                Aportes cancelados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por investidor, projeto ou referência..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      handleSearch()
                    }
                  }}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={value =>
                  setStatusFilter(value as InvestmentStatus | "ALL")
                }
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos os status</SelectItem>
                  <SelectItem value="CONFIRMADO">Confirmado</SelectItem>
                  <SelectItem value="PENDENTE">Pendente</SelectItem>
                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} variant="secondary">
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Aportes Registrados</CardTitle>
            <CardDescription>
              {total} aporte{total !== 1 ? "s" : ""} encontrado
              {total !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : investments.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Nenhum aporte encontrado</h3>
                <p className="text-sm text-muted-foreground">
                  Registre seu primeiro aporte para começar
                </p>
                <Link href="/dashboard/investidores/aportes/novo">
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar Aporte
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Referência</TableHead>
                      <TableHead>Investidor</TableHead>
                      <TableHead>Projeto</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {investments.map(investment => (
                      <TableRow key={investment.id}>
                        <TableCell className="font-medium">
                          {investment.referenceNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {investmentsApi.helpers.getInvestorName(
                                investment.investor
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {investment.investor.type === "PESSOA_FISICA"
                                ? "Pessoa Física"
                                : "Pessoa Jurídica"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{investment.project.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {investment.project.code}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {investmentsApi.helpers.formatDate(
                            investment.investmentDate
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {investmentsApi.helpers.formatCurrency(investment.amount)}
                        </TableCell>
                        <TableCell>
                          {investmentsApi.helpers.getPaymentMethodLabel(
                            investment.paymentMethod
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              investment.status === "CONFIRMADO"
                                ? "default"
                                : investment.status === "CANCELADO"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {investmentsApi.helpers.getStatusLabel(investment.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {/* Botão Confirmar - apenas para status PENDENTE */}
                            {investment.status === "PENDENTE" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleConfirm(investment.id, investment.status)}
                                title="Confirmar aporte"
                              >
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                            <Link
                              href={`/dashboard/investidores/aportes/${investment.id}`}
                            >
                              <Button variant="ghost" size="icon" title="Ver detalhes">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link
                              href={`/dashboard/investidores/aportes/${investment.id}/editar`}
                            >
                              <Button variant="ghost" size="icon" title="Editar">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(investment.id)}
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Página {page} de {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
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
