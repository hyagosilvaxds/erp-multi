"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  FileText,
  X,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { foldersApi, documentsApi, type Folder as FolderType } from "@/lib/api/documents"
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

interface UploadedFile {
  file: File
  name: string
  size: number
  progress: number
  status: "pending" | "uploading" | "success" | "error"
  error?: string
  documentId?: string
}

export default function UploadDocumentosPage() {
  const router = useRouter()
  const { toast } = useToast()

  // Obter role do usuário da empresa selecionada para permissões
  const selectedCompany = authApi.getSelectedCompany()
  const userRoleForPermissions = (selectedCompany?.role?.name as 'admin' | 'financeiro' | 'rh' | 'juridico' | 'contador' | 'investidor' | 'company') || 'company'
  const { can } = usePermissions(userRoleForPermissions)

  // Verificar permissões
  const canCreate = can('documentos', 'create')

  const [loading, setLoading] = useState(true)
  const [folders, setFolders] = useState<FolderType[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [description, setDescription] = useState("")
  const [expiresAt, setExpiresAt] = useState("")
  const [documentType, setDocumentType] = useState("")
  const [reference, setReference] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    // Se não tiver permissão de criar, redireciona
    if (!canCreate) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para fazer upload de documentos",
        variant: "destructive",
      })
      router.push('/dashboard/documentos')
      return
    }

    loadFolders()
  }, [canCreate, router])

  const loadFolders = async () => {
    try {
      setLoading(true)
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
      setLoading(false)
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    handleFilesSelected(files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFilesSelected(files)
    }
  }

  const handleFilesSelected = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file) => ({
      file,
      name: file.name,
      size: file.size,
      progress: 0,
      status: "pending" as const,
    }))

    setUploadedFiles([...uploadedFiles, ...newFiles])
  }

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "Nenhum arquivo",
        description: "Selecione pelo menos um arquivo para fazer upload",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    // Upload cada arquivo individualmente
    for (let i = 0; i < uploadedFiles.length; i++) {
      const fileData = uploadedFiles[i]
      
      if (fileData.status === "success") {
        continue // Pular arquivos já enviados
      }

      try {
        // Atualizar status para uploading
        setUploadedFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "uploading" as const, progress: 0 } : f
          )
        )

        // Simular progresso (na prática, você pode usar axios com onUploadProgress)
        const progressInterval = setInterval(() => {
          setUploadedFiles((prev) =>
            prev.map((f, idx) => {
              if (idx === i && f.progress < 90) {
                return { ...f, progress: f.progress + 10 }
              }
              return f
            })
          )
        }, 200)

        // Fazer upload
        const uploadedDoc = await documentsApi.upload({
          file: fileData.file,
          name: fileData.name,
          description: description || undefined,
          folderId: selectedFolderId || undefined,
          reference: reference || undefined,
          documentType: documentType || undefined,
          tags: tags.length > 0 ? tags.join(',') : undefined,
          expiresAt: expiresAt || undefined,
          isPublic: false,
        })

        clearInterval(progressInterval)

        // Atualizar status para success
        setUploadedFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? {
                  ...f,
                  status: "success" as const,
                  progress: 100,
                  documentId: uploadedDoc.id,
                }
              : f
          )
        )

        toast({
          title: "✅ Upload concluído",
          description: `${fileData.name} foi enviado com sucesso`,
        })
      } catch (error: any) {
        console.error(`❌ Erro ao fazer upload de ${fileData.name}:`, error)

        // Atualizar status para error
        setUploadedFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? {
                  ...f,
                  status: "error" as const,
                  error: error.response?.data?.message || error.message || "Erro ao fazer upload",
                }
              : f
          )
        )

        toast({
          title: "Erro no upload",
          description: `${fileData.name}: ${error.response?.data?.message || error.message}`,
          variant: "destructive",
        })
      }
    }

    setUploading(false)

    // Verificar se todos foram enviados com sucesso
    const allSuccess = uploadedFiles.every((f) => f.status === "success")
    if (allSuccess) {
      toast({
        title: "✅ Todos os arquivos foram enviados",
        description: "Redirecionando para o hub de documentos...",
      })
      
      setTimeout(() => {
        router.push('/dashboard/documentos')
      }, 2000)
    }
  }

  // Se não tiver permissão, não renderiza
  if (!canCreate) {
    return null
  }

  if (loading) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando...</p>
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
                Voltar
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Upload de Documentos</h1>
            <p className="text-muted-foreground">Envie e organize seus documentos</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Upload Area */}
          <div className="md:col-span-2 space-y-6">
            {/* Drag and Drop */}
            <Card>
              <CardHeader>
                <CardTitle>Selecionar Arquivos</CardTitle>
                <CardDescription>
                  Arraste arquivos ou clique para selecionar (máx. 50MB por arquivo)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-primary/50"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">
                    Arraste seus arquivos aqui
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    ou clique no botão abaixo para selecionar
                  </p>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileInput}
                  />
                  <Button asChild>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      Selecionar Arquivos
                    </label>
                  </Button>
                  <p className="text-xs text-muted-foreground mt-4">
                    Tipos aceitos: PDF, Imagens, Word, Excel, PowerPoint, Texto, ZIP
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Arquivos Selecionados ({uploadedFiles.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 border rounded-lg"
                      >
                        <FileText className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium truncate">{file.name}</p>
                            <div className="flex items-center gap-2">
                              {file.status === "success" && (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              )}
                              {file.status === "error" && (
                                <AlertCircle className="h-5 w-5 text-red-500" />
                              )}
                              {file.status === "pending" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveFile(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {formatFileSize(file.size)}
                          </p>
                          {file.status === "uploading" && (
                            <Progress value={file.progress} className="h-2" />
                          )}
                          {file.status === "error" && (
                            <p className="text-sm text-red-500">{file.error}</p>
                          )}
                          {file.status === "success" && (
                            <p className="text-sm text-green-600">Upload concluído!</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Metadata Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Documento</CardTitle>
                <CardDescription>
                  Adicione metadados para facilitar a organização
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pasta */}
                <div className="space-y-2">
                  <Label htmlFor="folder">Pasta</Label>
                  <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
                    <SelectTrigger id="folder">
                      <SelectValue placeholder="Selecione uma pasta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sem pasta</SelectItem>
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
                  <Label htmlFor="docType">Tipo de Documento</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger id="docType">
                      <SelectValue placeholder="Selecione o tipo" />
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

                {/* Referência */}
                <div className="space-y-2">
                  <Label htmlFor="reference">Referência (opcional)</Label>
                  <Input
                    id="reference"
                    placeholder="Ex: NF-2024-001"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                  />
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Adicione uma descrição..."
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Adicionar tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddTag()
                        }
                      }}
                    />
                    <Button type="button" size="sm" onClick={handleAddTag}>
                      Adicionar
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          {tag}
                          <X className="ml-1 h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Data de Validade */}
                <div className="space-y-2">
                  <Label htmlFor="expires">Data de Validade (opcional)</Label>
                  <Input
                    id="expires"
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <Button
                className="w-full"
                size="lg"
                onClick={handleUpload}
                disabled={uploadedFiles.length === 0 || uploading}
              >
                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {uploading ? "Enviando..." : `Fazer Upload (${uploadedFiles.length})`}
              </Button>
              <Button
                className="w-full"
                variant="outline"
                size="lg"
                onClick={() => router.push('/dashboard/documentos')}
                disabled={uploading}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
