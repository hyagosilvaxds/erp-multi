"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  ArrowLeft,
  Upload,
  Download,
  Trash2,
  File,
  FileText,
  AlertCircle,
  Plus,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { projectsApi } from "@/lib/api/projects"
import { projectDocumentsApi, type ProjectDocument } from "@/lib/api/project-documents"

export default function DocumentosProjetoPage() {
  const params = useParams()
  const { toast } = useToast()
  const [project, setProject] = useState<any>(null)
  const [documents, setDocuments] = useState<ProjectDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [openUploadDialog, setOpenUploadDialog] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    tags: "",
  })

  useEffect(() => {
    loadProject()
    loadDocuments()
  }, [params.id])

  const loadProject = async () => {
    try {
      const data = await projectsApi.getById(params.id as string)
      setProject(data)
    } catch (error: any) {
      console.error("Erro ao carregar projeto:", error)
      toast({
        title: "Erro ao carregar projeto",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    }
  }

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const response = await projectDocumentsApi.getByProject(params.id as string)
      setDocuments(response.data)
    } catch (error: any) {
      console.error("Erro ao carregar documentos:", error)
      toast({
        title: "Erro ao carregar documentos",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      // Auto-preencher nome do documento com o nome do arquivo
      if (!formData.name) {
        setFormData({
          ...formData,
          name: e.target.files[0].name.replace(/\.[^/.]+$/, ""),
        })
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo",
        variant: "destructive",
      })
      return
    }

    if (!formData.name) {
      toast({
        title: "Erro",
        description: "Informe o nome do documento",
        variant: "destructive",
      })
      return
    }

    if (!formData.category) {
      toast({
        title: "Erro",
        description: "Selecione a categoria",
        variant: "destructive",
      })
      return
    }

    try {
      setUploading(true)

      await projectDocumentsApi.upload({
        file: selectedFile,
        projectId: params.id as string,
        name: formData.name,
        description: formData.description || undefined,
        category: formData.category as any,
        tags: formData.tags || undefined,
      })

      toast({
        title: "Sucesso",
        description: "Documento enviado com sucesso",
      })

      // Resetar form
      setSelectedFile(null)
      setFormData({
        name: "",
        description: "",
        category: "",
        tags: "",
      })
      setOpenUploadDialog(false)

      // Recarregar documentos
      loadDocuments()
    } catch (error: any) {
      console.error("Erro ao enviar documento:", error)
      toast({
        title: "Erro ao enviar documento",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (documentId: string, fileName: string) => {
    try {
      const blob = await projectDocumentsApi.download(documentId)
      
      // Criar URL temporária e fazer download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Sucesso",
        description: "Download iniciado",
      })
    } catch (error: any) {
      console.error("Erro ao fazer download:", error)
      toast({
        title: "Erro ao fazer download",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (documentId: string) => {
    try {
      await projectDocumentsApi.delete(documentId)

      toast({
        title: "Sucesso",
        description: "Documento excluído com sucesso",
      })

      // Recarregar documentos
      loadDocuments()
    } catch (error: any) {
      console.error("Erro ao excluir documento:", error)
      toast({
        title: "Erro ao excluir documento",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  if (!project) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
            <Link href={`/dashboard/investidores/projetos/${params.id}`}>
              <Button variant="ghost" className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Documentos do Projeto
            </h1>
            <p className="text-muted-foreground">
              {project.name} ({project.code})
            </p>
          </div>
          <Dialog open={openUploadDialog} onOpenChange={setOpenUploadDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Documento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Enviar Documento</DialogTitle>
                <DialogDescription>
                  Faça upload de um documento para o projeto
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file">
                    Arquivo <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nome do Documento <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ex: Contrato de Investimento"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">
                    Categoria <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectDocumentsApi.helpers.getCategoryLabels().map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Descrição detalhada do documento..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="Ex: investimento, contrato, 2024 (separadas por vírgula)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separe as tags com vírgula
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenUploadDialog(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleUpload} disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Enviar
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de Documentos */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos</CardTitle>
            <CardDescription>
              {documents.length} documento(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Nenhum documento encontrado
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Faça upload do primeiro documento deste projeto
                </p>
                <Button onClick={() => setOpenUploadDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Enviar Documento
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Enviado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            {doc.description && (
                              <p className="text-xs text-muted-foreground">
                                {doc.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {projectDocumentsApi.helpers.getCategoryLabel(
                            doc.documentType
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                      <TableCell>
                        {new Date(doc.createdAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(doc.id, doc.fileName)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Confirmar exclusão
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o documento "
                                  {doc.name}"? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(doc.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
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
