"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, MoreVertical, FileText, Loader2, Eye, Edit, Star } from "lucide-react"
import Link from "next/link"
import { planoContasApi, type PlanoContas } from "@/lib/api/financial"
import { useToast } from "@/hooks/use-toast"
import { formatApiError } from "@/lib/format-error"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const tiposPlano = [
  { value: "all", label: "Todos os tipos" },
  { value: "Gerencial", label: "Gerencial" },
  { value: "Fiscal", label: "Fiscal" },
  { value: "Contabil", label: "Contábil" },
]

const statusOptions = [
  { value: "all", label: "Todos os status" },
  { value: "true", label: "Ativos" },
  { value: "false", label: "Inativos" },
]

export default function PlanoContasPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [planos, setPlanos] = useState<PlanoContas[]>([])
  const [loading, setLoading] = useState(true)
  const [tipoFilter, setTipoFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    loadPlanos()
  }, [currentPage, tipoFilter, statusFilter])

  const loadPlanos = async () => {
    try {
      setLoading(true)
      const response = await planoContasApi.getAll({
        page: currentPage,
        limit: 50,
        tipo: tipoFilter === "all" ? undefined : tipoFilter,
        ativo: statusFilter === "all" ? undefined : statusFilter === "true",
      })

      setPlanos(response.data)
      setTotalPages(response.meta.totalPages)
      setTotal(response.meta.total)
    } catch (error: any) {
      console.error('❌ Erro ao carregar planos de contas:', error)

      const { title, description } = formatApiError(error)

      toast({
        title,
        description,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR })
    } catch {
      return dateString
    }
  }

  const getTipoBadge = (tipo: string) => {
    const colors: Record<string, "default" | "secondary" | "outline"> = {
      Gerencial: "default",
      Fiscal: "secondary",
      Contabil: "outline",
    }
    return <Badge variant={colors[tipo] || "outline"}>{tipo}</Badge>
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Plano de Contas
            </h1>
            <p className="text-muted-foreground">
              Gerencie os planos de contas contábeis
            </p>
          </div>
          <Button onClick={() => router.push('/admin/plano-contas/novo')}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Plano
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Filtrar planos de contas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-xs">
                <Select value={tipoFilter} onValueChange={setTipoFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de plano" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposPlano.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 max-w-xs">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                {total} {total === 1 ? "plano" : "planos"} encontrado{total !== 1 ? "s" : ""}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>Planos de Contas</CardTitle>
            <CardDescription>
              Lista de todos os planos de contas cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : planos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum plano encontrado</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Crie seu primeiro plano de contas para começar.
                </p>
                <Button onClick={() => router.push('/admin/plano-contas/novo')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Plano de Contas
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Contas</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {planos.map((plano) => (
                      <TableRow key={plano.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {plano.padrao && (
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            )}
                            <div>
                              <div className="font-medium">{plano.nome}</div>
                              {plano.descricao && (
                                <div className="text-xs text-muted-foreground">
                                  {plano.descricao}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getTipoBadge(plano.tipo)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {plano._count?.contas || 0} contas
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={plano.ativo ? "default" : "secondary"}>
                            {plano.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(plano.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/plano-contas/${plano.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver detalhes
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/plano-contas/${plano.id}/editar`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
