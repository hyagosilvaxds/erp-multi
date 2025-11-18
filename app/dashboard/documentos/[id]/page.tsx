"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, ArrowLeft, Download, Edit, Trash2, FileText, AlertCircle, Clock, User, FolderIcon, Tag as TagIcon, Calendar, Upload, X, Save, Eye } from "lucide-react"
import Link from "next/link"
import { documentsApi, foldersApi, type Document as DocumentType, type Folder } from "@/lib/api/documents"
import { useToast } from "@/hooks/use-toast"
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

export default function DocumentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  const documentId = params.id as string

  // Obter permissões reais do backend
  const selectedCompany = authApi.getSelectedCompany()
  const permissions = selectedCompany?.role?.permissions || []
  
  // Helper para verificar permissões
  const hasPermission = (resource: string, action: string) => {
    return permissions.some((p: any) => p.resource === resource && p.action === action)
  }

  // Verificar permissões (usando resource 'documents' do backend)
  const canRead = hasPermission('documents', 'read')
  const canUpdate = hasPermission('documents', 'update')
  const canCreate = hasPermission('documents', 'create')
  const canDelete = hasPermission('documents', 'delete')

  const [loading, setLoading] = useState(true)
  const [document, setDocument] = useState<DocumentType | null>(null)
  const [folders, setFolders] = useState<Folder[]>([])
  
  // Estados de edição
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  
  // Dados do formulário de edição
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editFolderId, setEditFolderId] = useState("")
  const [editDocumentType, setEditDocumentType] = useState("")
  const [editTags, setEditTags] = useState<string[]>([])
  const [editTagInput, setEditTagInput] = useState("")
  const [editExpiresAt, setEditExpiresAt] = useState("")
  const [editIsPublic, setEditIsPublic] = useState(false)
  
  // Upload de nova versão
  const [versionFile, setVersionFile] = useState<File | null>(null)
  const [versionDescription, setVersionDescription] = useState("")

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
  }, [documentId, canRead, router])

  const loadData = async () => {
    try {
      setLoading(true)
      
      const [documentData, foldersData] = await Promise.all([
        documentsApi.getById(documentId),
        foldersApi.getAll()
      ])
      
      setDocument(documentData)
      setFolders(Array.isArray(foldersData) ? foldersData : [])
    } catch (error: any) {
      console.error('❌ Erro ao carregar documento:', error)
      
      toast({
        title: "Erro ao carregar documento",
        description: error.response?.data?.message || error.message || "Não foi possível carregar o documento",
        variant: "destructive",
      })

      if (error.response?.status === 404) {
        setTimeout(() => {
          router.push('/dashboard/documentos')
        }, 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOpenEditDialog = () => {
    if (!document) return
    
    setEditName(document.name)
    setEditDescription(document.description || "")
    setEditFolderId(document.folderId || "none")
    setEditDocumentType(document.documentType || "")
    setEditTags(document.tags || [])
    setEditExpiresAt(document.expiresAt ? document.expiresAt.split('T')[0] : "")
    setEditIsPublic(document.isPublic)
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!document) return
    
    try {
      setIsSaving(true)
      
      const updateData: any = {
        name: editName,
        description: editDescription || undefined,
        folderId: editFolderId === "none" ? null : editFolderId,
        documentType: editDocumentType || undefined,
        tags: editTags.length > 0 ? editTags : undefined,
        expiresAt: editExpiresAt || undefined,
        isPublic: editIsPublic,
      }
      
      const updatedDoc = await documentsApi.update(document.id, updateData)
      setDocument(updatedDoc)
      setIsEditDialogOpen(false)
      
      toast({
        title: "✅ Documento atualizado",
        description: "Os metadados do documento foram atualizados com sucesso",
      })
    } catch (error: any) {
      console.error('❌ Erro ao atualizar documento:', error)
      
      toast({
        title: "Erro ao atualizar",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleUploadVersion = async () => {
    if (!document || !versionFile) return
    
    try {
      setIsUploading(true)
      
      const newVersion = await documentsApi.uploadVersion(
        document.id,
        versionFile,
        versionDescription || undefined
      )
      
      setDocument(newVersion)
      setIsVersionDialogOpen(false)
      setVersionFile(null)
      setVersionDescription("")
      
      toast({
        title: "✅ Nova versão carregada",
        description: `Versão ${newVersion.version} foi criada com sucesso`,
      })
    } catch (error: any) {
      console.error('❌ Erro ao fazer upload da versão:', error)
      
      toast({
        title: "Erro ao fazer upload",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownload = async () => {
    if (!document) return

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

  const handleDelete = async () => {
    if (!document) return

    if (!window.confirm(`Tem certeza que deseja excluir "${document.name}"?`)) {
      return
    }

    try {
      await documentsApi.delete(document.id)

      toast({
        title: "✅ Documento deletado",
        description: "O documento foi deletado com sucesso",
      })

      router.push('/dashboard/documentos')
    } catch (error: any) {
      console.error('❌ Erro ao deletar documento:', error)

      toast({
        title: "Erro ao deletar",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    }
  }

  const handleAddTag = () => {
    if (editTagInput.trim() && !editTags.includes(editTagInput.trim())) {
      setEditTags([...editTags, editTagInput.trim()])
      setEditTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setEditTags(editTags.filter(tag => tag !== tagToRemove))
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
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!canRead) {
    return null
  }

  if (loading) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando documento...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!document) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Documento não encontrado</p>
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
            <h1 className="text-3xl font-bold tracking-tight">{document.name}</h1>
            <p className="text-muted-foreground">Detalhes e informações do documento</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            {canUpdate && (
              <Button variant="outline" onClick={handleOpenEditDialog}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            )}
            {canCreate && (
              <Button variant="outline" onClick={() => setIsVersionDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Nova Versão
              </Button>
            )}
            {canDelete && (
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Documento Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informações do Documento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Nome */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome</label>
                  <p className="text-lg font-medium">{document.name}</p>
                </div>

                {/* Nome do Arquivo */}
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome do Arquivo</label>
                  <p className="mt-1 font-mono text-sm">{document.fileName}</p>
                </div>

                {/* Descrição */}
                {document.description && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Descrição</label>
                      <p className="mt-1">{document.description}</p>
                    </div>
                  </>
                )}

                {/* Referência */}
                {document.reference && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Referência</label>
                      <p className="mt-1 font-mono">{document.reference}</p>
                    </div>
                  </>
                )}

                {/* Pasta */}
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Pasta</label>
                  <div className="flex items-center gap-2 mt-1">
                    <FolderIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{document.folder?.name || 'Sem pasta'}</span>
                  </div>
                </div>

                {/* Tipo de Documento */}
                {document.documentType && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tipo de Documento</label>
                      <div className="mt-2">
                        <Badge variant="outline">
                          {documentTypes.find(t => t.value === document.documentType)?.label || document.documentType}
                        </Badge>
                      </div>
                    </div>
                  </>
                )}

                {/* Tags */}
                {document.tags && document.tags.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tags</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {document.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            <TagIcon className="mr-1 h-3 w-3" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Validade */}
            {document.expiresAt && (
              <Card>
                <CardHeader>
                  <CardTitle>Validade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {document.isExpired ? (
                      <>
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="font-medium text-red-500">Documento Vencido</p>
                          <p className="text-sm text-muted-foreground">
                            Venceu em {formatDate(document.expiresAt)}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Válido até {formatDate(document.expiresAt)}</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Detalhes Técnicos */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhes Técnicos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipo MIME</label>
                  <p className="text-sm">{document.mimeType}</p>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Extensão</label>
                  <p className="text-sm">{document.fileName.split('.').pop()?.toUpperCase() || '-'}</p>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tamanho</label>
                  <p className="text-sm">{formatFileSize(document.fileSize || document.size)}</p>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Versão</label>
                  <p className="text-sm">v{document.version}</p>
                </div>
                {document.previousVersionId && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Versão Anterior</label>
                      <Link href={`/dashboard/documentos/${document.previousVersionId}`}>
                        <Button variant="link" className="h-auto p-0 text-blue-600 mt-1">
                          Ver v{(document as any).previousVersion?.version || (document.version - 1)} →
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
                {(document as any).nextVersions && (document as any).nextVersions.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        {(document as any).nextVersions.length === 1 ? 'Versão Posterior' : 'Versões Posteriores'}
                      </label>
                      <div className="space-y-1 mt-1">
                        {(document as any).nextVersions.map((nextVersion: any) => (
                          <Link key={nextVersion.id} href={`/dashboard/documentos/${nextVersion.id}`}>
                            <Button variant="link" className="h-auto p-0 text-blue-600">
                              Ver v{nextVersion.version} →
                            </Button>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Upload Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informações de Upload</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Enviado por</label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{document.uploadedBy?.name || 'Desconhecido'}</span>
                  </div>
                  {document.uploadedBy?.email && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {document.uploadedBy.email}
                    </p>
                  )}
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Data de Upload</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{formatDate(document.createdAt)}</span>
                  </div>
                </div>
                {document.updatedAt !== document.createdAt && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Última Atualização</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatDate(document.updatedAt)}</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Visibilidade */}
            <Card>
              <CardHeader>
                <CardTitle>Visibilidade</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={document.isPublic ? "default" : "secondary"}>
                  {document.isPublic ? "Público" : "Privado"}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  {document.isPublic
                    ? "Este documento está visível para todos os usuários"
                    : "Este documento está visível apenas para usuários autorizados"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Histórico de Versões */}
        {(document as any).allVersions && (document as any).allVersions.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Versões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(document as any).allVersions.map((version: any) => {
                  const isCurrentVersion = version.id === document.id
                  return (
                    <div
                      key={version.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        isCurrentVersion ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={version.isLatest ? "default" : "outline"}>
                            v{version.version}
                          </Badge>
                          {version.isLatest && (
                            <Badge variant="secondary">Mais Recente</Badge>
                          )}
                          {isCurrentVersion && (
                            <Badge variant="secondary">Versão Atual</Badge>
                          )}
                        </div>
                        <p className="text-sm mt-1">
                          <strong>{version.name}</strong>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Arquivo: {version.fileName} ({formatFileSize(version.fileSize)})
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <User className="h-3 w-3" />
                          {version.uploadedBy?.name || 'Desconhecido'}
                          <span className="mx-1">•</span>
                          <Clock className="h-3 w-3" />
                          {formatDate(version.createdAt)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!isCurrentVersion && (
                          <Link href={`/dashboard/documentos/${version.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Versão
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dialog de Edição */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Metadados do Documento</DialogTitle>
              <DialogDescription>
                Atualize as informações do documento sem alterar o arquivo
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome do Documento</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Pasta */}
              <div className="space-y-2">
                <Label htmlFor="edit-folder">Pasta</Label>
                <Select value={editFolderId} onValueChange={setEditFolderId}>
                  <SelectTrigger id="edit-folder">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem pasta</SelectItem>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo */}
              <div className="space-y-2">
                <Label htmlFor="edit-type">Tipo de Documento</Label>
                <Select value={editDocumentType} onValueChange={setEditDocumentType}>
                  <SelectTrigger id="edit-type">
                    <SelectValue placeholder="Selecione um tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite uma tag"
                    value={editTagInput}
                    onChange={(e) => setEditTagInput(e.target.value)}
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
                {editTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editTags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Data de Expiração */}
              <div className="space-y-2">
                <Label htmlFor="edit-expires">Data de Validade</Label>
                <Input
                  id="edit-expires"
                  type="date"
                  value={editExpiresAt}
                  onChange={(e) => setEditExpiresAt(e.target.value)}
                />
              </div>

              {/* Visibilidade */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-public"
                  checked={editIsPublic}
                  onChange={(e) => setEditIsPublic(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="edit-public">Documento Público</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Nova Versão */}
        <Dialog open={isVersionDialogOpen} onOpenChange={setIsVersionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload de Nova Versão</DialogTitle>
              <DialogDescription>
                Faça upload de uma nova versão deste documento
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Upload de Arquivo */}
              <div className="space-y-2">
                <Label htmlFor="version-file">Arquivo</Label>
                <Input
                  id="version-file"
                  type="file"
                  onChange={(e) => setVersionFile(e.target.files?.[0] || null)}
                />
                {versionFile && (
                  <p className="text-sm text-muted-foreground">
                    Arquivo selecionado: {versionFile.name} ({formatFileSize(versionFile.size)})
                  </p>
                )}
              </div>

              {/* Descrição da Versão */}
              <div className="space-y-2">
                <Label htmlFor="version-description">Descrição das Alterações</Label>
                <Textarea
                  id="version-description"
                  placeholder="O que mudou nesta versão?"
                  value={versionDescription}
                  onChange={(e) => setVersionDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsVersionDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleUploadVersion} 
                disabled={!versionFile || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Fazer Upload
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
