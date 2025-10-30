"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Filter,
  FileText,
  Download,
  Eye,
  MoreVertical,
  ArrowLeft,
  X,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { documentsApi, foldersApi, type Document as DocumentType, type Folder } from "@/lib/api/documents"
import { useToast } from "@/hooks/use-toast"
import { usePermissions } from "@/hooks/use-permissions"
import { authApi } from "@/lib/api/auth"

const documentTypes = [
  { value: "invoice", label: "Nota Fiscal" },
  { value: "contract", label: "Contrato" },
  { value: "report", label: "Relatório" },
  { value: "receipt", label: "Recibo" },
  { value: "certificate", label: "Certificado" },
  { value: "license", label: "Licença" },
  { value: "other", label: "Outro" },
]

export default function BuscaAvancadaPage() {
  const router = useRouter()
  const { toast } = useToast()

  // Obter permissões reais do backend
  const selectedCompany = authApi.getSelectedCompany()
  const permissions = selectedCompany?.role?.permissions || []
  
  // Helper para verificar permissões
  const hasPermission = (resource: string, action: string) => {
    return permissions.some((p: any) => p.resource === resource && p.action === action)
  }

  // Verificar permissões (usando resource 'documents' do backend)
  const canRead = hasPermission('documents', 'read')

  // Estados dos filtros
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFolder, setSelectedFolder] = useState<string>("")
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>("")
  const [selectedExpiredFilter, setSelectedExpiredFilter] = useState<string>("")
  const [expiresInDays, setExpiresInDays] = useState<string>("")
  const [tagsInput, setTagsInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  
  // Estados de dados
  const [loading, setLoading] = useState(false)
  const [loadingFolders, setLoadingFolders] = useState(true)
  const [folders, setFolders] = useState<Folder[]>([])
  const [documents, setDocuments] = useState<DocumentType[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  
  // Paginação
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 50

  useEffect(() => {
    if (!canRead) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para visualizar documentos",
        variant: "destructive",
      })
      router.push('/dashboard/documentos')
      return
    }

    loadFolders()
  }, [canRead, router])

  const loadFolders = async () => {
    try {
      setLoadingFolders(true)
      const foldersData = await foldersApi.getAll()
      setFolders(Array.isArray(foldersData) ? foldersData : [])
    } catch (error: any) {
      console.error('❌ Erro ao carregar pastas:', error)
      toast({
        title: "Erro ao carregar pastas",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setLoadingFolders(false)
    }
  }

  const handleSearch = async () => {
    try {
      setLoading(true)
      setHasSearched(true)
      
      // Montar parâmetros de busca
      const params: any = {
        page,
        limit,
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      }

      if (selectedFolder && selectedFolder !== "all") {
        // Se "null" foi selecionado, buscar documentos sem pasta
        params.folderId = selectedFolder
      }

      if (selectedDocumentType && selectedDocumentType !== "all") {
        params.documentType = selectedDocumentType
      }

      if (selectedExpiredFilter && selectedExpiredFilter !== "all") {
        params.expired = selectedExpiredFilter === "expired"
      }

      if (expiresInDays) {
        params.expiresIn = parseInt(expiresInDays)
      }

      if (tags.length > 0) {
        params.tags = tags.join(',')
      }

      console.log('🔍 Buscando com parâmetros:', params)

      const response = await documentsApi.getAll(params)
      
      if (Array.isArray(response)) {
        setDocuments(response)
        setTotal(response.length)
        setTotalPages(1)
      } else {
        setDocuments(response.documents || [])
        setTotal(response.total || 0)
        setTotalPages(response.totalPages || 1)
      }

      toast({
        title: "✅ Busca realizada",
        description: `${Array.isArray(response) ? response.length : response.total || 0} documentos encontrados`,
      })
    } catch (error: any) {
      console.error('❌ Erro ao buscar documentos:', error)
      
      toast({
        title: "Erro ao buscar",
        description: error.response?.data?.message || error.message || "Não foi possível realizar a busca",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setSelectedFolder("")
    setSelectedDocumentType("")
    setSelectedExpiredFilter("")
    setExpiresInDays("")
    setTags([])
    setTagsInput("")
    setDocuments([])
    setHasSearched(false)
    setPage(1)
  }

  const handleAddTag = () => {
    if (tagsInput.trim() && !tags.includes(tagsInput.trim())) {
      setTags([...tags, tagsInput.trim()])
      setTagsInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleDownloadDocument = async (document: DocumentType) => {
    try {
      toast({
        title: "Iniciando download...",
        description: `Baixando ${document.name}`,
      })

      const blob = await documentsApi.download(document.id)
      
      const url = window.URL.createObjectURL(blob)
      const a = window.document.createElement('a')
      a.href = url
      a.download = document.name
      window.document.body.appendChild(a)
      a.click()
      window.document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({
        title: "✅ Download concluído",
        description: `${document.name} foi baixado com sucesso`,
      })
    } catch (error: any) {
      console.error('❌ Erro ao baixar documento:', error)

      toast({
        title: "Erro ao baixar",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  if (!canRead) {
    return null
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard/documentos">
              <Button variant="ghost" size="sm" className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Hub
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Busca Avançada</h1>
            <p className="text-muted-foreground">
              Busque documentos usando filtros avançados
            </p>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Busca
            </CardTitle>
            <CardDescription>
              Aplique filtros para refinar sua busca
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Busca por texto */}
            <div className="space-y-2">
              <Label htmlFor="search">Buscar por Nome, Descrição ou Referência</Label>
              <div className="flex gap-2">
                <Input
                  id="search"
                  placeholder="Digite para buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Buscar
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Pasta */}
              <div className="space-y-2">
                <Label htmlFor="folder">Pasta</Label>
                <Select value={selectedFolder} onValueChange={setSelectedFolder} disabled={loadingFolders}>
                  <SelectTrigger id="folder">
                    <SelectValue placeholder="Todas as pastas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as pastas</SelectItem>
                    <SelectItem value="null">Sem pasta</SelectItem>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo de Documento */}
              <div className="space-y-2">
                <Label htmlFor="documentType">Tipo de Documento</Label>
                <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
                  <SelectTrigger id="documentType">
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status de Expiração */}
              <div className="space-y-2">
                <Label htmlFor="expiredFilter">Status de Validade</Label>
                <Select value={selectedExpiredFilter} onValueChange={setSelectedExpiredFilter}>
                  <SelectTrigger id="expiredFilter">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="expired">Somente Vencidos</SelectItem>
                    <SelectItem value="valid">Somente Válidos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Expira em X dias */}
              <div className="space-y-2">
                <Label htmlFor="expiresIn">Expira em (dias)</Label>
                <Input
                  id="expiresIn"
                  type="number"
                  placeholder="Ex: 30"
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(e.target.value)}
                  min="1"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="Digite uma tag e pressione Enter"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                />
                <Button onClick={handleAddTag} variant="outline" type="button">
                  Adicionar
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Botão Limpar */}
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleClearFilters}>
                <X className="mr-2 h-4 w-4" />
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        {hasSearched && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Resultados da Busca</CardTitle>
                  <CardDescription>
                    {loading ? 'Buscando...' : `${total} documentos encontrados`}
                  </CardDescription>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1 || loading}
                    >
                      Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Página {page} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages || loading}
                    >
                      Próxima
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Nenhum documento encontrado
                  </h3>
                  <p className="text-muted-foreground">
                    Tente ajustar os filtros ou usar palavras-chave diferentes
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Documento</TableHead>
                      <TableHead>Pasta</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Tamanho</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium truncate">{doc.name}</p>
                              {doc.description && (
                                <p className="text-sm text-muted-foreground truncate">
                                  {doc.description}
                                </p>
                              )}
                              {doc.tags && doc.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {doc.tags.slice(0, 3).map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {doc.tags.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{doc.tags.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {doc.folder?.name || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {doc.documentType ? (
                            <Badge variant="outline">
                              {documentTypes.find(t => t.value === doc.documentType)?.label || doc.documentType}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(doc.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatFileSize(doc.fileSize || doc.size)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/documentos/${doc.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver Detalhes
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownloadDocument(doc)}>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
