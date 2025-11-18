"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Loader2, ArrowLeft, FileText, Search, Upload, Folder as FolderIcon, MoreVertical, Download, Trash2, Eye, AlertCircle } from "lucide-react"
import Link from "next/link"
import { documentsApi, foldersApi, type Document as DocumentType, type Folder } from "@/lib/api/documents"
import { useToast } from "@/hooks/use-toast"
import { usePermissions } from "@/hooks/use-permissions"
import { authApi } from "@/lib/api/auth"

export default function FolderDocumentsPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  const folderId = params.folderId as string

  // Obter permissões reais do backend
  const selectedCompany = authApi.getSelectedCompany()
  const permissions = selectedCompany?.role?.permissions || []
  
  // Helper para verificar permissões
  const hasPermission = (resource: string, action: string) => {
    return permissions.some((p: any) => p.resource === resource && p.action === action)
  }

  // Verificar permissões (usando resource 'documents' do backend)
  const canRead = hasPermission('documents', 'read')
  const canCreate = hasPermission('documents', 'create')
  const canUpdate = hasPermission('documents', 'update')
  const canDelete = hasPermission('documents', 'delete')

  const [loading, setLoading] = useState(true)
  const [folder, setFolder] = useState<Folder | null>(null)
  const [documents, setDocuments] = useState<DocumentType[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [expiresInFilter, setExpiresInFilter] = useState<string>("")

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

    loadData()
  }, [folderId, canRead, router, expiresInFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Preparar parâmetros para a requisição
      const params: any = { folderId, limit: 1000 }
      
      // Adicionar filtro de expiração se selecionado e não for "all"
      if (expiresInFilter && expiresInFilter !== "all") {
        params.expiresIn = parseInt(expiresInFilter)
      }
      
      // Carregar todas as pastas e documentos da pasta específica
      const [allFolders, documentsResponse] = await Promise.all([
        foldersApi.getAll(),
        documentsApi.getAll(params)
      ])

      // Encontrar a pasta específica
      const folderData = allFolders.find(f => f.id === folderId)
      
      if (!folderData) {
        throw new Error('Pasta não encontrada')
      }

      setFolder(folderData)
      setDocuments(Array.isArray(documentsResponse) ? documentsResponse : documentsResponse.documents || [])
    } catch (error: any) {
      console.error('❌ Erro ao carregar dados:', error)
      
      toast({
        title: "Erro ao carregar dados",
        description: error.response?.data?.message || error.message || "Não foi possível carregar os dados",
        variant: "destructive",
      })

      // Redirecionar se não encontrar
      if (error.response?.status === 404) {
        setTimeout(() => {
          router.push('/dashboard/documentos')
        }, 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadDocument = async (document: DocumentType) => {
    try {
      toast({
        title: "Iniciando download...",
        description: `Baixando ${document.name}`,
      })

      const blob = await documentsApi.download(document.id)
      
      // Criar URL temporária e fazer download
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

  const handleDeleteDocument = async (document: DocumentType) => {
    if (!window.confirm(`Tem certeza que deseja excluir "${document.name}"?`)) {
      return
    }

    try {
      await documentsApi.delete(document.id)

      toast({
        title: "✅ Documento deletado",
        description: "O documento foi deletado com sucesso",
      })

      await loadData()
    } catch (error: any) {
      console.error('❌ Erro ao deletar documento:', error)

      toast({
        title: "Erro ao deletar",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  // Filtrar documentos pela busca
  const filteredDocuments = documents.filter((doc) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      doc.name.toLowerCase().includes(query) ||
      doc.description?.toLowerCase().includes(query) ||
      doc.tags?.some(tag => tag.toLowerCase().includes(query))
    )
  })

  if (!canRead) {
    return null
  }

  if (loading) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando documentos...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!folder) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <FolderIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Pasta não encontrada</p>
            <Link href="/dashboard/documentos">
              <Button className="mt-4">Voltar ao Hub</Button>
            </Link>
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
            <Link href="/dashboard/documentos">
              <Button variant="ghost" size="sm" className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Hub
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div 
                className="h-12 w-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: folder.color || '#3B82F6' }}
              >
                <FolderIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{folder.name}</h1>
                <p className="text-muted-foreground">
                  {folder.description || 'Documentos da pasta'}
                </p>
              </div>
            </div>
          </div>
          {canCreate && (
            <Link href={`/dashboard/documentos/upload?folderId=${folderId}`}>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload de Documento
              </Button>
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Documentos
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documents.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tamanho Total
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatFileSize(documents.reduce((acc, doc) => acc + (doc.fileSize || doc.size), 0))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Documentos Vencidos
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {documents.filter(doc => doc.isExpired).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar documentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={expiresInFilter} onValueChange={setExpiresInFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Expiração" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="7">Expira em 7 dias</SelectItem>
              <SelectItem value="15">Expira em 15 dias</SelectItem>
              <SelectItem value="30">Expira em 30 dias</SelectItem>
              <SelectItem value="60">Expira em 60 dias</SelectItem>
              <SelectItem value="90">Expira em 90 dias</SelectItem>
            </SelectContent>
          </Select>
          {expiresInFilter && expiresInFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              Expira em {expiresInFilter} dias
            </Badge>
          )}
        </div>

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? 'Nenhum documento encontrado' : 'Nenhum documento nesta pasta'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? 'Tente ajustar sua busca'
                    : 'Faça upload de documentos para começar'
                  }
                </p>
                {canCreate && !searchQuery && (
                  <Link href={`/dashboard/documentos/upload?folderId=${folderId}`}>
                    <Button>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload de Documento
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Versão</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
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
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {doc.tags && doc.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {doc.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {doc.tags.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{doc.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex flex-col">
                          {formatDate(doc.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatFileSize(doc.fileSize || doc.size)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">v{doc.version}</Badge>
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
                            {canDelete && (
                              <DropdownMenuItem 
                                onClick={() => handleDeleteDocument(doc)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            )}
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
      </div>
    </DashboardLayout>
  )
}
