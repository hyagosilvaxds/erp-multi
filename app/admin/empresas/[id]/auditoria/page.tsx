"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  History,
  Loader2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Upload,
  Trash2,
  Edit,
  PlusCircle,
  ToggleLeft,
  User,
  Calendar,
} from "lucide-react"
import { auditApi, companiesApi, type AuditLog } from "@/lib/api/auth"
import { useToast } from "@/hooks/use-toast"
import { formatApiError } from "@/lib/format-error"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const actionLabels: Record<string, { label: string; icon: any; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  CREATE: { label: "Criação", icon: PlusCircle, variant: "default" },
  UPDATE: { label: "Atualização", icon: Edit, variant: "secondary" },
  DELETE: { label: "Exclusão", icon: Trash2, variant: "destructive" },
  UPLOAD_LOGO: { label: "Upload Logo", icon: Upload, variant: "outline" },
  REMOVE_LOGO: { label: "Remover Logo", icon: Trash2, variant: "outline" },
  UPLOAD_CERTIFICATE: { label: "Upload Certificado", icon: Upload, variant: "outline" },
  REMOVE_CERTIFICATE: { label: "Remover Certificado", icon: Trash2, variant: "outline" },
  TOGGLE_ACTIVE: { label: "Ativar/Desativar", icon: ToggleLeft, variant: "outline" },
}

const actionFilters = [
  { value: "all", label: "Todas as ações" },
  { value: "CREATE", label: "Criação" },
  { value: "UPDATE", label: "Atualização" },
  { value: "DELETE", label: "Exclusão" },
  { value: "UPLOAD_LOGO", label: "Upload de Logo" },
  { value: "REMOVE_LOGO", label: "Remoção de Logo" },
  { value: "UPLOAD_CERTIFICATE", label: "Upload de Certificado" },
  { value: "REMOVE_CERTIFICATE", label: "Remoção de Certificado" },
  { value: "TOGGLE_ACTIVE", label: "Ativação/Desativação" },
]

export default function AuditoriaEmpresaPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [companyName, setCompanyName] = useState("")
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit] = useState(50)
  const [actionFilter, setActionFilter] = useState("all")

  useEffect(() => {
    loadCompanyInfo()
  }, [params.id])

  useEffect(() => {
    loadAuditLogs()
  }, [params.id, currentPage, actionFilter])

  const loadCompanyInfo = async () => {
    try {
      const data = await companiesApi.getCompanyById(params.id as string)
      setCompanyName(data.razaoSocial)
    } catch (error: any) {
      console.error('❌ Erro ao carregar empresa:', error)
    }
  }

  const loadAuditLogs = async () => {
    try {
      setLoading(true)
      const response = await auditApi.getCompanyAudit(params.id as string, {
        page: currentPage,
        limit,
        action: actionFilter === "all" ? undefined : actionFilter,
      })

      setAuditLogs(response.data)
      setTotalPages(response.meta.totalPages)
      setTotal(response.meta.total)
    } catch (error: any) {
      console.error('❌ Erro ao carregar auditoria:', error)

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
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    } catch {
      return dateString
    }
  }

  const formatValue = (value: any) => {
    if (value === null || value === undefined) return "-"
    if (typeof value === "object") return JSON.stringify(value, null, 2)
    return String(value)
  }

  const getActionBadge = (action: string) => {
    const config = actionLabels[action] || { label: action, icon: FileText, variant: "outline" as const }
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/admin/empresas/${params.id}`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <History className="h-8 w-8" />
                Auditoria
              </h1>
              <p className="text-muted-foreground">
                {companyName || "Carregando..."}
              </p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Filtrar logs de auditoria por tipo de ação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-xs">
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de ação" />
                  </SelectTrigger>
                  <SelectContent>
                    {actionFilters.map((filter) => (
                      <SelectItem key={filter.value} value={filter.value}>
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                {total} {total === 1 ? "registro" : "registros"} encontrado{total !== 1 ? "s" : ""}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Auditoria */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Alterações</CardTitle>
            <CardDescription>
              Registro completo de todas as ações realizadas nesta empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <History className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum registro encontrado</h3>
                <p className="text-sm text-muted-foreground">
                  Não há registros de auditoria para os filtros selecionados.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Ação</TableHead>
                        <TableHead>Campo</TableHead>
                        <TableHead>Valor Anterior</TableHead>
                        <TableHead>Valor Novo</TableHead>
                        <TableHead>Descrição</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDate(log.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{log.user.name}</div>
                                <div className="text-xs text-muted-foreground">{log.user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getActionBadge(log.action)}</TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                              {log.fieldName || "-"}
                            </code>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate text-sm">
                              {formatValue(log.oldValue)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate text-sm">
                              {formatValue(log.newValue)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-sm text-sm text-muted-foreground">
                              {log.description || "-"}
                            </div>
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
