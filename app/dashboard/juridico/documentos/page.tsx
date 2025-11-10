"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Download,
  Eye,
  FileText,
  Calendar,
  DollarSign,
} from "lucide-react"
import { useState, useEffect } from "react"
import { LegalDocumentDialog } from "@/components/legal/legal-document-dialog"
import {
  listLegalDocuments,
  deleteLegalDocument,
  getLegalDocumentDownload,
  downloadLegalDocument,
  type LegalDocument,
  type LegalDocumentType,
  type LegalDocumentStatus,
  LEGAL_DOCUMENT_TYPE_LABELS,
  LEGAL_DOCUMENT_STATUS_LABELS,
} from "@/lib/api/legal-documents"
import { listLegalCategories, type LegalCategory } from "@/lib/api/legal-categories"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"

export default function DocumentosJuridicosPage() {
  const [documents, setDocuments] = useState<LegalDocument[]>([])
  const [categories, setCategories] = useState<LegalCategory[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("todos")
  const [statusFilter, setStatusFilter] = useState<string>("todos")
  const [categoryFilter, setCategoryFilter] = useState<string>("todos")
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<LegalDocument | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalDocuments, setTotalDocuments] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadDocuments()
  }, [searchTerm, typeFilter, statusFilter, categoryFilter, currentPage])

  const loadCategories = async () => {
    try {
      const data = await listLegalCategories()
      setCategories(data.filter((c) => c.active))
    } catch (error) {
      console.error("Erro ao carregar categorias:", error)
    }
  }

  const loadDocuments = async () => {
    try {
      setIsLoading(true)
      const params: any = {
        page: currentPage,
        limit: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
      }

      if (searchTerm) params.search = searchTerm
      if (typeFilter !== "todos") params.type = typeFilter
      if (statusFilter !== "todos") params.status = statusFilter
      if (categoryFilter !== "todos") params.categoryId = categoryFilter

      const response = await listLegalDocuments(params)
      setDocuments(response.documents)
      setTotalPages(response.pagination.totalPages)
      setTotalDocuments(response.pagination.total)
    } catch (error) {
      toast({
        title: "Erro ao carregar documentos",
        description: "Não foi possível carregar os documentos jurídicos.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateDocument = () => {
    setSelectedDocument(null)
    setDialogOpen(true)
  }

  const handleEditDocument = (document: LegalDocument) => {
    setSelectedDocument(document)
    setDialogOpen(true)
  }

  const handleDeleteDocument = (document: LegalDocument) => {
    setDocumentToDelete(document)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!documentToDelete) return

    try {
      await deleteLegalDocument(documentToDelete.id)
      toast({
        title: "Documento excluído",
        description: "O documento foi excluído com sucesso.",
      })
      loadDocuments()
    } catch (error) {
      toast({
        title: "Erro ao excluir documento",
        description: "Não foi possível excluir o documento.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setDocumentToDelete(null)
    }
  }

  const handleDownload = async (document: LegalDocument) => {
    try {
      const downloadInfo = await getLegalDocumentDownload(document.id)
      const blob = await downloadLegalDocument(downloadInfo.id)
      const url = window.URL.createObjectURL(blob)
      const a = window.document.createElement("a")
      a.href = url
      a.download = downloadInfo.fileName
      window.document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      window.document.body.removeChild(a)

      toast({
        title: "Download iniciado",
        description: "O arquivo está sendo baixado.",
      })
    } catch (error) {
      toast({
        title: "Erro ao baixar documento",
        description: "Não foi possível baixar o documento.",
        variant: "destructive",
      })
    }
  }

  const handleDialogClose = (success: boolean) => {
    setDialogOpen(false)
    setSelectedDocument(null)
    if (success) {
      loadDocuments()
    }
  }

  const getStatusBadgeVariant = (
    status: LegalDocumentStatus
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "ATIVO":
      case "APROVADO":
        return "default"
      case "CONCLUIDO":
        return "secondary"
      case "REJEITADO":
      case "CANCELADO":
        return "destructive"
      default:
        return "outline"
    }
  }

  const formatCurrency = (value?: string) => {
    if (!value) return "-"
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(value))
  }

  const formatDate = (date?: string) => {
    if (!date) return "-"
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR })
  }

  const getDaysUntilDue = (dueDate?: string) => {
    if (!dueDate) return null
    const now = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Documentos Jurídicos</h1>
            <p className="text-muted-foreground">
              Gerencie contratos, processos e outros documentos jurídicos
            </p>
          </div>
          <Button onClick={handleCreateDocument}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Documento
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Documentos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDocuments}</div>
              <p className="text-xs text-muted-foreground">documentos cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
              <FileText className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {documents.filter((d) => d.status === "ATIVO").length}
              </div>
              <p className="text-xs text-muted-foreground">em vigência</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencendo</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {documents.filter((d) => {
                  const days = getDaysUntilDue(d.dueDate)
                  return days !== null && days > 0 && days <= 30
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">próximos 30 dias</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  documents
                    .filter((d) => d.status === "ATIVO" && d.value)
                    .reduce((sum, d) => sum + parseFloat(d.value || "0"), 0)
                    .toString()
                )}
              </div>
              <p className="text-xs text-muted-foreground">em contratos ativos</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Table */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos</CardTitle>
            <CardDescription>Lista de todos os documentos jurídicos cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-4 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título, referência ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Tipos</SelectItem>
                  {Object.entries(LEGAL_DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  {Object.entries(LEGAL_DOCUMENT_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : documents.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-muted-foreground">
                {searchTerm || typeFilter !== "todos" || statusFilter !== "todos"
                  ? "Nenhum documento encontrado com os filtros aplicados."
                  : "Nenhum documento cadastrado. Clique em 'Novo Documento' para começar."}
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título / Referência</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead className="w-[70px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((document) => {
                        const daysUntilDue = getDaysUntilDue(document.dueDate)
                        const isExpiringSoon =
                          daysUntilDue !== null && daysUntilDue > 0 && daysUntilDue <= 30

                        return (
                          <TableRow key={document.id}>
                            <TableCell>
                              <div>
                                <Link
                                  href={`/dashboard/juridico/documentos/${document.id}`}
                                  className="font-medium hover:underline"
                                >
                                  {document.title}
                                </Link>
                                {document.reference && (
                                  <p className="text-sm text-muted-foreground">
                                    {document.reference}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {LEGAL_DOCUMENT_TYPE_LABELS[document.type]}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {document.category ? (
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-3 w-3 rounded"
                                    style={{
                                      backgroundColor: document.category.color || "#3B82F6",
                                    }}
                                  />
                                  <span className="text-sm">{document.category.name}</span>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(document.status)}>
                                {LEGAL_DOCUMENT_STATUS_LABELS[document.status]}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {document.dueDate ? (
                                <div>
                                  <p className="text-sm">{formatDate(document.dueDate)}</p>
                                  {isExpiringSoon && (
                                    <p className="text-xs text-yellow-600">
                                      {daysUntilDue} dias restantes
                                    </p>
                                  )}
                                </div>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell>{formatCurrency(document.value)}</TableCell>
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
                                    <Link href={`/dashboard/juridico/documentos/${document.id}`}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      Visualizar
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDownload(document)}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Baixar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditDocument(document)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteDocument(document)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Página {currentPage} de {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

      {/* Document Dialog */}
      <LegalDocumentDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        document={selectedDocument}
        categories={categories}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o documento &quot;{documentToDelete?.title}&quot;?
              <span className="mt-2 block">
                Esta ação irá arquivar o documento. O arquivo permanecerá no hub de documentos.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
