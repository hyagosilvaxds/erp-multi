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
  Percent,
  Users,
  AlertCircle,
  Loader2,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
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
  distributionPoliciesApi,
  type DistributionPolicyListItem,
} from "@/lib/api/distribution-policies"

export default function PoliticasPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [policies, setPolicies] = useState<DistributionPolicyListItem[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState<"ALL" | "true" | "false">("ALL")

  // Stats
  const [stats, setStats] = useState({
    totalPolicies: 0,
    activePolicies: 0,
    inactivePolicies: 0,
    avgPercentage: 0,
  })

  useEffect(() => {
    loadSelectedCompany()
  }, [])

  useEffect(() => {
    if (selectedCompany) {
      loadPolicies()
    }
  }, [selectedCompany, page, activeFilter])

  const loadSelectedCompany = async () => {
    try {
      const company = await authApi.getSelectedCompany()
      setSelectedCompany(company)
    } catch (error) {
      console.error("Erro ao carregar empresa:", error)
    }
  }

  const loadPolicies = async () => {
    if (!selectedCompany?.id) return

    try {
      setLoading(true)

      const params: any = {
        page,
        limit: 10,
      }

      if (activeFilter !== "ALL") {
        params.active = activeFilter === "true"
      }

      if (search) {
        params.search = search
      }

      const response = await distributionPoliciesApi.getAll(
        selectedCompany.id,
        params
      )

      setPolicies(response.data)
      setTotal(response.meta.total)
      setTotalPages(response.meta.totalPages)

      // Calcular stats
      calculateStats(response.data)
    } catch (error: any) {
      console.error("Erro ao carregar políticas:", error)
      toast({
        title: "Erro ao carregar políticas",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data: DistributionPolicyListItem[]) => {
    const active = data.filter(p => p.active)
    const inactive = data.filter(p => !p.active)
    const avgPercentage =
      data.length > 0
        ? data.reduce((sum, p) => sum + p.percentage, 0) / data.length
        : 0

    setStats({
      totalPolicies: data.length,
      activePolicies: active.length,
      inactivePolicies: inactive.length,
      avgPercentage,
    })
  }

  const handleSearch = () => {
    setPage(1)
    loadPolicies()
  }

  const handleDelete = async (policyId: string) => {
    if (!selectedCompany?.id) return

    if (!confirm("Tem certeza que deseja excluir esta política?")) return

    try {
      await distributionPoliciesApi.delete(selectedCompany.id, policyId)

      toast({
        title: "Sucesso",
        description: "Política excluída com sucesso",
      })

      loadPolicies()
    } catch (error: any) {
      console.error("Erro ao excluir política:", error)
      toast({
        title: "Erro ao excluir política",
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
              Políticas de Distribuição
            </h1>
            <p className="text-muted-foreground">
              Gerenciamento de percentuais de distribuição por projeto
            </p>
          </div>
          <Link href="/dashboard/investidores/politicas/nova">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Política
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Políticas
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPolicies}</div>
              <p className="text-xs text-muted-foreground">
                Políticas cadastradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Políticas Ativas
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activePolicies}</div>
              <p className="text-xs text-muted-foreground">
                Em vigor atualmente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Políticas Inativas
              </CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inactivePolicies}</div>
              <p className="text-xs text-muted-foreground">
                Desativadas ou encerradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Percentual Médio
              </CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {distributionPoliciesApi.helpers.formatPercentage(
                  stats.avgPercentage
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Média por política
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
                  placeholder="Buscar por investidor ou projeto..."
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
                value={activeFilter}
                onValueChange={value =>
                  setActiveFilter(value as "ALL" | "true" | "false")
                }
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todas</SelectItem>
                  <SelectItem value="true">Ativas</SelectItem>
                  <SelectItem value="false">Inativas</SelectItem>
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
            <CardTitle>Políticas Cadastradas</CardTitle>
            <CardDescription>
              {total} política{total !== 1 ? "s" : ""} encontrada
              {total !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : policies.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Nenhuma política encontrada</h3>
                <p className="text-sm text-muted-foreground">
                  Crie sua primeira política para começar
                </p>
                <Link href="/dashboard/investidores/politicas/nova">
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Política
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Projeto</TableHead>
                      <TableHead>Investidor</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Percentual</TableHead>
                      <TableHead>Início</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policies.map(policy => (
                      <TableRow key={policy.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{policy.project.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {policy.project.code}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {distributionPoliciesApi.helpers.getInvestorName(
                                policy.investor
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {policy.investor.type === "PESSOA_FISICA"
                                ? "Pessoa Física"
                                : "Pessoa Jurídica"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {distributionPoliciesApi.helpers.getTypeLabel(
                            policy.type
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {distributionPoliciesApi.helpers.formatPercentage(
                            policy.percentage
                          )}
                        </TableCell>
                        <TableCell>
                          {distributionPoliciesApi.helpers.formatDate(
                            policy.startDate
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              policy.active ? "default" : "secondary"
                            }
                          >
                            {distributionPoliciesApi.helpers.getActiveLabel(
                              policy.active
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/dashboard/investidores/politicas/${policy.id}`}
                            >
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link
                              href={`/dashboard/investidores/politicas/${policy.id}/editar`}
                            >
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(policy.id)}
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
