"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Folder,
  FolderOpen,
  FileText,
  Upload,
  Search,
  MoreVertical,
  Download,
  Eye,
  Trash2,
  Tag,
  AlertCircle,
  Clock,
  User,
  Filter,
  FolderPlus,
  Edit,
} from "lucide-react"
import Link from "next/link"
import {
  foldersApi,
  documentsApi,
  type Folder as FolderType,
  type Document as DocumentType,
  type DocumentStats,
} from "@/lib/api/documents"
import { rolesApi, type Role } from "@/lib/api/roles"
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/api/auth"
import { Checkbox } from "@/components/ui/checkbox"

export default function DocumentosPage() {
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
  const canCreate = hasPermission('documents', 'create')
  const canUpdate = hasPermission('documents', 'update')
  const canDelete = hasPermission('documents', 'delete')

  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [folders, setFolders] = useState<FolderType[]>([])
  const [documents, setDocuments] = useState<DocumentType[]>([])
  const [stats, setStats] = useState<DocumentStats | null>(null)
  const [selectedFolder, setSelectedFolder] = useState<string>("all")
  const [roles, setRoles] = useState<Role[]>([])

  // Estados para criar pasta
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [folderFormData, setFolderFormData] = useState({
    name: "",
    description: "",
    color: "#4CAF50",
    icon: "folder",
  })
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])

  // Estados para editar pasta
  const [isEditFolderDialogOpen, setIsEditFolderDialogOpen] = useState(false)
  const [folderToEdit, setFolderToEdit] = useState<FolderType | null>(null)
  const [editing, setEditing] = useState(false)
  const [editFolderFormData, setEditFolderFormData] = useState({
    name: "",
    description: "",
    color: "#4CAF50",
    icon: "folder",
  })
  const [editSelectedRoleIds, setEditSelectedRoleIds] = useState<string[]>([])

  // Estados para deletar pasta
  const [showDeleteFolderDialog, setShowDeleteFolderDialog] = useState(false)
  const [folderToDelete, setFolderToDelete] = useState<FolderType | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    // Se não tiver permissão de leitura, redireciona
    if (!canRead) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar documentos",
        variant: "destructive",
      })
      router.push('/dashboard')
      return
    }

    loadData()
  }, [canRead, router])

  const loadData = async () => {
    try {
      setLoading(true)

      // Carregar pastas, documentos, estatísticas e roles em paralelo
      const [foldersData, documentsResponse, statsData, rolesData] = await Promise.all([
        foldersApi.getAll(),
        documentsApi.getAll({ page: 1, limit: 100 }), // Carregar até 100 documentos
        documentsApi.getStats(),
        rolesApi.getAll(),
      ])

      setFolders(Array.isArray(foldersData) ? foldersData : [])
      
      // documentsApi.getAll agora retorna um objeto com { documents, total, page, ... }
      const documentsArray = documentsResponse?.documents || []
      setDocuments(Array.isArray(documentsArray) ? documentsArray : [])
      setStats(statsData)
      setRoles(Array.isArray(rolesData) ? rolesData : [])

      console.log('✅ Dados carregados:', {
        pastas: Array.isArray(foldersData) ? foldersData.length : 0,
        documentos: documentsArray.length,
        totalDocumentos: documentsResponse?.total || 0,
        roles: Array.isArray(rolesData) ? rolesData.length : 0,
      })
    } catch (error: any) {
      console.error('❌ Erro ao carregar dados:', error)

      // Inicializar com arrays vazios em caso de erro
      setFolders([])
      setDocuments([])
      setStats(null)
      setRoles([])

      toast({
        title: "Erro ao carregar documentos",
        description: error.response?.data?.message || error.message || "Não foi possível carregar os documentos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFolder = async () => {
    if (!folderFormData.name.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O nome da pasta é obrigatório",
        variant: "destructive",
      })
      return
    }

    try {
      setCreating(true)

      await foldersApi.create({
        name: folderFormData.name,
        description: folderFormData.description || undefined,
        color: folderFormData.color,
        icon: folderFormData.icon,
        isPublic: false,
        allowedRoleIds: selectedRoleIds.length > 0 ? selectedRoleIds : [],
      })

      toast({
        title: "✅ Pasta criada",
        description: selectedRoleIds.length > 0
          ? `A pasta foi criada com acesso para ${selectedRoleIds.length} role(s)`
          : "A pasta foi criada com acesso para todos os usuários",
      })

      // Recarregar dados
      await loadData()

      // Fechar dialog e limpar form
      setIsCreateFolderDialogOpen(false)
      setFolderFormData({
        name: "",
        description: "",
        color: "#4CAF50",
        icon: "folder",
      })
      setSelectedRoleIds([])
    } catch (error: any) {
      console.error('❌ Erro ao criar pasta:', error)

      toast({
        title: "Erro ao criar pasta",
        description: error.response?.data?.message || error.message || "Não foi possível criar a pasta",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const openDeleteFolderDialog = (folder: FolderType) => {
    setFolderToDelete(folder)
    setShowDeleteFolderDialog(true)
  }

  const openEditFolderDialog = (folder: FolderType) => {
    setFolderToEdit(folder)
    setEditFolderFormData({
      name: folder.name,
      description: folder.description || "",
      color: folder.color || "#4CAF50",
      icon: folder.icon || "folder",
    })
    // Carregar roles da pasta (se existir no objeto)
    setEditSelectedRoleIds((folder as any).allowedRoleIds || [])
    setIsEditFolderDialogOpen(true)
  }

  const handleEditFolder = async () => {
    if (!folderToEdit || !editFolderFormData.name.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O nome da pasta é obrigatório",
        variant: "destructive",
      })
      return
    }

    try {
      setEditing(true)

      await foldersApi.update(folderToEdit.id, {
        name: editFolderFormData.name,
        description: editFolderFormData.description || undefined,
        color: editFolderFormData.color,
        icon: editFolderFormData.icon,
        allowedRoleIds: editSelectedRoleIds.length > 0 ? editSelectedRoleIds : [],
      })

      toast({
        title: "✅ Pasta atualizada",
        description: editSelectedRoleIds.length > 0
          ? `A pasta foi atualizada com acesso para ${editSelectedRoleIds.length} role(s)`
          : "A pasta foi atualizada com acesso para todos os usuários",
      })

      // Recarregar dados
      await loadData()

      // Fechar dialog e limpar
      setIsEditFolderDialogOpen(false)
      setFolderToEdit(null)
      setEditFolderFormData({
        name: "",
        description: "",
        color: "#4CAF50",
        icon: "folder",
      })
      setEditSelectedRoleIds([])
    } catch (error: any) {
      console.error('❌ Erro ao atualizar pasta:', error)

      toast({
        title: "Erro ao atualizar pasta",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setEditing(false)
    }
  }

  const handleDeleteFolder = async () => {
    if (!folderToDelete) return

    try {
      setDeleting(true)

      const hasContent =
        (folderToDelete.documentsCount || 0) > 0 || (folderToDelete.subfoldersCount || 0) > 0

      await foldersApi.delete(folderToDelete.id, hasContent)

      toast({
        title: "✅ Pasta deletada",
        description: "A pasta foi deletada com sucesso",
      })

      // Recarregar dados
      await loadData()

      // Fechar dialog
      setShowDeleteFolderDialog(false)
      setFolderToDelete(null)
    } catch (error: any) {
      console.error('❌ Erro ao deletar pasta:', error)

      toast({
        title: "Erro ao deletar pasta",
        description: error.response?.data?.message || error.message || "Não foi possível deletar a pasta",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleDownloadDocument = async (document: DocumentType) => {
    try {
      toast({
        title: "Iniciando download...",
        description: `Baixando ${document.name}`,
      })

      // Fazer download do blob
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
        description: error.response?.data?.message || error.message || "Não foi possível baixar o documento",
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

      // Recarregar dados
      await loadData()
    } catch (error: any) {
      console.error('❌ Erro ao deletar documento:', error)

      toast({
        title: "Erro ao deletar documento",
        description: error.response?.data?.message || error.message || "Não foi possível deletar o documento",
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

  const filteredDocuments = Array.isArray(documents) 
    ? documents.filter((doc) => {
        const matchesSearch =
          doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (doc.tags && doc.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
        const matchesFolder = selectedFolder === "all" || doc.folderId === selectedFolder
        return matchesSearch && matchesFolder
      })
    : []

  // Se não tiver permissão de leitura, não renderiza nada
  if (!canRead) {
    return null
  }

  // Estado de loading
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

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hub de Documentos</h1>
            <p className="text-muted-foreground">Gerencie todos os documentos da empresa</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/documentos/busca">
              <Button variant="outline">
                <Search className="mr-2 h-4 w-4" />
                Busca Avançada
              </Button>
            </Link>
            <Link href="/dashboard/documentos/alertas">
              <Button variant="outline">
                <AlertCircle className="mr-2 h-4 w-4" />
                Alertas
              </Button>
            </Link>
            {canCreate && (
              <>
                <Button variant="outline" onClick={() => setIsCreateFolderDialogOpen(true)}>
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Nova Pasta
                </Button>
                <Link href="/dashboard/documentos/upload">
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Documentos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalSizeFormatted || '0 B'} de armazenamento
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.uploadsThisMonth || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.recentUploads || 0} nos últimos 7 dias
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tipos de Arquivo</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.differentFileTypes || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.differentMimeTypes || 0} tipos MIME
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pastas</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{folders.length}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.byFolder ? Object.keys(stats.byFolder).length : 0} com documentos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alertas de Documentos */}
        {stats && (stats.expired > 0 || stats.expiringSoon > 0) && (
          <div className={`grid gap-4 ${stats.expired > 0 && stats.expiringSoon > 0 ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
            {stats.expired > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-red-700">Documentos Vencidos</CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-700">{stats.expired}</div>
                  <p className="text-xs text-red-600">Necessitam atenção imediata</p>
                  <Link href="/dashboard/documentos/alertas">
                    <Button variant="link" className="h-auto p-0 text-red-700 mt-2">
                      Ver detalhes →
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
            {stats.expiringSoon > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-700">Vencendo em Breve</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-700">{stats.expiringSoon}</div>
                  <p className="text-xs text-yellow-600">Vencem nos próximos 30 dias</p>
                  <Link href="/dashboard/documentos/alertas">
                    <Button variant="link" className="h-auto p-0 text-yellow-700 mt-2">
                      Ver detalhes →
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        

        {/* Folders */}
        <Card>
          <CardHeader>
            <CardTitle>Pastas por Área</CardTitle>
            <CardDescription>Navegue pelos documentos organizados por departamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {folders.length === 0 ? (
                <p className="text-muted-foreground col-span-3 text-center py-8">
                  Nenhuma pasta criada ainda
                </p>
              ) : (
                folders.map((folder) => (
                  <Card
                    key={folder.id}
                    className="cursor-pointer transition-colors hover:bg-accent"
                  >
                    <Link href={`/dashboard/documentos/pasta/${folder.id}`}>
                      <CardContent className="flex items-center justify-between gap-4 p-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div
                            className="rounded-lg p-3"
                            style={{
                              backgroundColor: folder.color
                                ? `${folder.color}20`
                                : '#4CAF5020',
                            }}
                          >
                            <FolderOpen
                              className="h-6 w-6"
                              style={{ color: folder.color || '#4CAF50' }}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{folder.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {folder.documentsCount || 0} documentos
                            </p>
                          </div>
                        </div>
                        {(canUpdate || canDelete) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {canUpdate && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.preventDefault()
                                    openEditFolderDialog(folder)
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar Pasta
                                </DropdownMenuItem>
                              )}
                              {canDelete && (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    openDeleteFolderDialog(folder)
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir Pasta
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </CardContent>
                    </Link>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Documentos Recentes</CardTitle>
                <CardDescription>Últimos documentos adicionados ao sistema</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Todas as pastas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as pastas</SelectItem>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar documentos..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum documento encontrado</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Documento</TableHead>
                    <TableHead>Pasta</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Upload</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Versão</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            {doc.expiresAt && (
                              <div className="flex items-center gap-1 text-xs text-orange-500">
                                <AlertCircle className="h-3 w-3" />
                                Vence em {formatDate(doc.expiresAt)}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{doc.folder?.name || 'Sem pasta'}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {doc.tags && doc.tags.length > 0 ? (
                            doc.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {doc.uploadedBy?.name || 'Desconhecido'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
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
                                Visualizar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadDocument(doc)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            {canDelete && (
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDeleteDocument(doc)}
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

      {/* Dialog para criar pasta */}
      <Dialog open={isCreateFolderDialogOpen} onOpenChange={setIsCreateFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Pasta</DialogTitle>
            <DialogDescription>
              Crie uma nova pasta para organizar seus documentos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="folderName">Nome da Pasta *</Label>
              <Input
                id="folderName"
                placeholder="Ex: Contratos, Notas Fiscais..."
                value={folderFormData.name}
                onChange={(e) =>
                  setFolderFormData({ ...folderFormData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="folderDescription">Descrição</Label>
              <Textarea
                id="folderDescription"
                placeholder="Descrição opcional da pasta..."
                value={folderFormData.description}
                onChange={(e) =>
                  setFolderFormData({ ...folderFormData, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Controle de Acesso</Label>
              <p className="text-sm text-muted-foreground">
                Selecione as roles que podem visualizar esta pasta. Se nenhuma for selecionada, todos os usuários terão acesso.
              </p>
              <div className="border rounded-lg p-4 space-y-3 max-h-48 overflow-y-auto">
                {roles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Carregando roles...</p>
                ) : (
                  roles.map((role) => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`role-${role.id}`}
                        checked={selectedRoleIds.includes(role.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRoleIds([...selectedRoleIds, role.id])
                          } else {
                            setSelectedRoleIds(selectedRoleIds.filter(id => id !== role.id))
                          }
                        }}
                      />
                      <label
                        htmlFor={`role-${role.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {role.name}
                        {role.description && (
                          <span className="block text-xs text-muted-foreground font-normal">
                            {role.description}
                          </span>
                        )}
                      </label>
                    </div>
                  ))
                )}
              </div>
              {selectedRoleIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedRoleIds.map((roleId) => {
                    const role = roles.find(r => r.id === roleId)
                    return role ? (
                      <Badge key={roleId} variant="secondary">
                        {role.name}
                      </Badge>
                    ) : null
                  })}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="folderColor">Cor</Label>
              <Input
                id="folderColor"
                type="color"
                value={folderFormData.color}
                onChange={(e) =>
                  setFolderFormData({ ...folderFormData, color: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateFolderDialogOpen(false)}
              disabled={creating}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateFolder} disabled={creating}>
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Pasta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar pasta */}
      <Dialog open={isEditFolderDialogOpen} onOpenChange={setIsEditFolderDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Pasta</DialogTitle>
            <DialogDescription>
              Altere as informações e permissões da pasta
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editFolderName">Nome da Pasta *</Label>
              <Input
                id="editFolderName"
                placeholder="Ex: Contratos, Notas Fiscais..."
                value={editFolderFormData.name}
                onChange={(e) =>
                  setEditFolderFormData({ ...editFolderFormData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editFolderDescription">Descrição</Label>
              <Textarea
                id="editFolderDescription"
                placeholder="Descrição opcional da pasta..."
                value={editFolderFormData.description}
                onChange={(e) =>
                  setEditFolderFormData({ ...editFolderFormData, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Controle de Acesso</Label>
              <p className="text-sm text-muted-foreground">
                Selecione as roles que podem visualizar esta pasta. Se nenhuma for selecionada, todos os usuários terão acesso.
              </p>
              <div className="border rounded-lg p-4 space-y-3 max-h-48 overflow-y-auto">
                {roles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Carregando roles...</p>
                ) : (
                  roles.map((role) => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-role-${role.id}`}
                        checked={editSelectedRoleIds.includes(role.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEditSelectedRoleIds([...editSelectedRoleIds, role.id])
                          } else {
                            setEditSelectedRoleIds(editSelectedRoleIds.filter(id => id !== role.id))
                          }
                        }}
                      />
                      <label
                        htmlFor={`edit-role-${role.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {role.name}
                        {role.description && (
                          <span className="block text-xs text-muted-foreground font-normal">
                            {role.description}
                          </span>
                        )}
                      </label>
                    </div>
                  ))
                )}
              </div>
              {editSelectedRoleIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {editSelectedRoleIds.map((roleId) => {
                    const role = roles.find(r => r.id === roleId)
                    return role ? (
                      <Badge key={roleId} variant="secondary">
                        {role.name}
                      </Badge>
                    ) : null
                  })}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="editFolderColor">Cor</Label>
              <Input
                id="editFolderColor"
                type="color"
                value={editFolderFormData.color}
                onChange={(e) =>
                  setEditFolderFormData({ ...editFolderFormData, color: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditFolderDialogOpen(false)}
              disabled={editing}
            >
              Cancelar
            </Button>
            <Button onClick={handleEditFolder} disabled={editing}>
              {editing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmar exclusão de pasta */}
      <AlertDialog open={showDeleteFolderDialog} onOpenChange={setShowDeleteFolderDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Pasta?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a pasta "{folderToDelete?.name}"?
              {folderToDelete && (folderToDelete.documentsCount || 0) > 0 && (
                <span className="block mt-2 text-orange-600 font-medium">
                  ⚠️ Esta pasta contém {folderToDelete.documentsCount} documento(s). Todos
                  serão movidos para "Sem pasta".
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFolder}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
