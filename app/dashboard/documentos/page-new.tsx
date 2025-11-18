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
} from "lucide-react"
import Link from "next/link"
import {
  foldersApi,
  documentsApi,
  type Folder as FolderType,
  type Document as DocumentType,
  type DocumentStats,
} from "@/lib/api/documents"
import { useToast } from "@/hooks/use-toast"
import { usePermissions } from "@/hooks/use-permissions"
import { authApi } from "@/lib/api/auth"

export default function DocumentosPage() {
  const router = useRouter()
  const { toast } = useToast()

  // Obter role do usuário da empresa selecionada
  const selectedCompany = authApi.getSelectedCompany()
  const userRole = (selectedCompany?.role?.name as 'admin' | 'manager' | 'company' | 'investor') || 'company'
  const { can } = usePermissions(userRole)

  // Verificar permissões
  const canRead = can('documents', 'read')
  const canCreate = can('documents', 'create')
  const canUpdate = can('documents', 'update')
  const canDelete = can('documents', 'delete')

  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [folders, setFolders] = useState<FolderType[]>([])
  const [documents, setDocuments] = useState<DocumentType[]>([])
  const [stats, setStats] = useState<DocumentStats | null>(null)
  const [selectedFolder, setSelectedFolder] = useState<string>("all")

  // Estados para criar pasta
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [folderFormData, setFolderFormData] = useState({
    name: "",
    description: "",
    color: "#4CAF50",
    icon: "folder",
  })

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

      // Carregar pastas, documentos e estatísticas em paralelo
      const [foldersData, documentsData, statsData] = await Promise.all([
        foldersApi.getAll(),
        documentsApi.getAll(),
        documentsApi.getStats(),
      ])

      setFolders(foldersData)
      setDocuments(documentsData)
      setStats(statsData)

      console.log('✅ Dados carregados:', {
        pastas: foldersData.length,
        documentos: documentsData.length,
      })
    } catch (error: any) {
      console.error('❌ Erro ao carregar dados:', error)

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
      })

      toast({
        title: "✅ Pasta criada",
        description: "A pasta foi criada com sucesso",
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

      // Usar a URL de download da API
      const downloadUrl = documentsApi.getDownloadUrl(document.id)
      
      // Abrir em nova janela/download
      window.open(downloadUrl, '_blank')

      toast({
        title: "✅ Download iniciado",
        description: `${document.name} está sendo baixado`,
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

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.tags && doc.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    const matchesFolder = selectedFolder === "all" || doc.folderId === selectedFolder
    return matchesSearch && matchesFolder
  })

  // Se não tiver permissão de leitura, não renderiza nada
  if (!canRead) {
    return null
  }

  // Estado de loading
  if (loading) {
    return (
      <DashboardLayout userRole={userRole}>
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
    <DashboardLayout userRole={userRole}>
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
              <div className="text-2xl font-bold">{stats?.totalDocuments || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats ? formatFileSize(stats.totalSize) : '0 B'} de armazenamento
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.recentUploads?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Uploads recentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Por Tipo</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.byMimeType ? Object.keys(stats.byMimeType).length : 0}
              </div>
              <p className="text-xs text-muted-foreground">Tipos diferentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pastas</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{folders.length}</div>
              <p className="text-xs text-muted-foreground">Organizadas por área</p>
            </CardContent>
          </Card>
        </div>

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
                    <CardContent className="flex items-center justify-between gap-4 p-4">
                      <div className="flex items-center gap-4">
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
                      {canDelete && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => openDeleteFolderDialog(folder)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir Pasta
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </CardContent>
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
                        {formatFileSize(doc.size)}
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
                            {canUpdate && (
                              <DropdownMenuItem>
                                <Tag className="mr-2 h-4 w-4" />
                                Editar Tags
                              </DropdownMenuItem>
                            )}
                            {canDelete && (
                              <DropdownMenuItem className="text-destructive">
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
