"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FileText,
  Plus,
  MoreVertical,
  Loader2,
  Eye,
  Edit,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { planoContasApi, type PlanoContas } from "@/lib/api/financial"
import { useToast } from "@/hooks/use-toast"
import { formatApiError } from "@/lib/format-error"

const tiposPlano = ["Todos", "Gerencial", "Fiscal", "Contabil"]

export default function PlanoContasPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [planos, setPlanos] = useState<PlanoContas[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit] = useState(50)
  const [tipoFilter, setTipoFilter] = useState("Todos")
  const [ativoFilter, setAtivoFilter] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    loadPlanos()
  }, [currentPage, tipoFilter, ativoFilter])

  const loadPlanos = async () => {
    try {
      setLoading(true)
      const response = await planoContasApi.getAll({
        page: currentPage,
        limit,
        tipo: tipoFilter === "Todos" ? undefined : tipoFilter,
        ativo: ativoFilter,
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
      setPlanos([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir o plano "${nome}"?`)) {
      return
    }

    try {
      await planoContasApi.delete(id)

      toast({
        title: "Plano excluído com sucesso!",
        description: "O plano de contas foi removido.",
      })

      loadPlanos()
    } catch (error: any) {
      console.error('❌ Erro ao excluir plano:', error)

      const { title, description } = formatApiError(error)

      toast({
        title,
        description,
        variant: "destructive",
      })
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Plano de Contas
            </h1>
            <p className="text-muted-foreground">
              Gerencie os planos de contas contábeis do sistema
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/plano-contas/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Plano
            </Link>
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Filtrar planos de contas por tipo e status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-xs">
                <Select value={tipoFilter} onValueChange={setTipoFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo do plano" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposPlano.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 max-w-xs">
                <Select
                  value={
                    ativoFilter === undefined
                      ? "todos"
                      : ativoFilter
                      ? "ativos"
                      : "inativos"
                  }
                  onValueChange={(value) => {
                    if (value === "todos") setAtivoFilter(undefined)
                    else if (value === "ativos") setAtivoFilter(true)
                    else setAtivoFilter(false)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ativos">Ativos</SelectItem>
                    <SelectItem value="inativos">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                {total} {total === 1 ? "plano encontrado" : "planos encontrados"}
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
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum plano cadastrado</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Comece criando seu primeiro plano de contas
                </p>
                <Button asChild>
                  <Link href="/dashboard/plano-contas/novo">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Primeiro Plano
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Contas</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[100px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {planos.map((plano) => (
                        <TableRow key={plano.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {plano.nome}
                                {plano.padrao && (
                                  <Badge variant="secondary" className="text-xs">
                                    Padrão
                                  </Badge>
                                )}
                              </div>
                              {plano.descricao && (
                                <div className="text-sm text-muted-foreground">
                                  {plano.descricao}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{plano.tipo}</Badge>
                          </TableCell>
                          <TableCell>
                            {plano._count?.contas || 0} contas
                          </TableCell>
                          <TableCell>
                            <Badge variant={plano.ativo ? "default" : "secondary"}>
                              {plano.ativo ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell>
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
                                  <Link href={`/dashboard/plano-contas/${plano.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Ver detalhes
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/plano-contas/${plano.id}/editar`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/plano-contas/${plano.id}/duplicar`}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Duplicar
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDelete(plano.id, plano.nome)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Página {currentPage} de {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Próxima
                        <ChevronRight className="h-4 w-4 ml-1" />
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
