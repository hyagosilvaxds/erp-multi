"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Loader2,
  ArrowLeft,
  Edit,
  Trash2,
  Briefcase,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Upload,
  Download,
  Eye,
  Paperclip,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { projectsApi, type ProjectDetails } from "@/lib/api/projects"
import { projectDocumentsApi, type ProjectDocument } from "@/lib/api/project-documents"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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

export default function DetalhesProjetoPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [project, setProject] = useState<ProjectDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  // Estados para documentos
  const [documents, setDocuments] = useState<ProjectDocument[]>([])
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentForm, setDocumentForm] = useState({
    name: "",
    description: "",
    category: "OUTRO" as const,
    tags: "",
  })

  useEffect(() => {
    loadProject()
    loadDocuments()
  }, [params.id])

  const loadProject = async () => {
    try {
      setLoading(true)
      const data = await projectsApi.getById(params.id as string)
      setProject(data)
    } catch (error: any) {
      console.error("Erro ao carregar projeto:", error)
      toast({
        title: "Erro ao carregar projeto",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadDocuments = async () => {
    try {
      setLoadingDocuments(true)
      const data = await projectDocumentsApi.getAll(params.id as string)
      setDocuments(data.data || [])
    } catch (error: any) {
      console.error("Erro ao carregar documentos:", error)
      // Não mostra toast de erro para não poluir a tela
    } finally {
      setLoadingDocuments(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      if (!documentForm.name) {
        setDocumentForm({ ...documentForm, name: file.name })
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !documentForm.name) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo e informe o nome",
        variant: "destructive",
      })
      return
    }

    try {
      setUploading(true)
      await projectDocumentsApi.upload({
        file: selectedFile,
        projectId: params.id as string,
        name: documentForm.name,
        category: documentForm.category,
        description: documentForm.description || undefined,
        tags: documentForm.tags || undefined,
      })

      toast({
        title: "Sucesso",
        description: "Documento enviado com sucesso",
      })

      setUploadDialogOpen(false)
      setSelectedFile(null)
      setDocumentForm({
        name: "",
        description: "",
        category: "OUTRO",
        tags: "",
      })
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
      projectDocumentsApi.helpers.triggerDownload(blob, fileName)
      toast({
        title: "Sucesso",
        description: "Download iniciado",
      })
    } catch (error: any) {
      console.error("Erro ao baixar documento:", error)
      toast({
        title: "Erro ao baixar documento",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await projectDocumentsApi.delete(documentId)
      toast({
        title: "Sucesso",
        description: "Documento excluído com sucesso",
      })
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

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await projectsApi.delete(params.id as string)
      toast({
        title: "Sucesso",
        description: "Projeto excluído com sucesso",
      })
      router.push("/dashboard/investidores/projetos")
    } catch (error: any) {
      console.error("Erro ao excluir projeto:", error)
      toast({
        title: "Erro ao excluir projeto",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ATIVO":
        return <CheckCircle2 className="h-4 w-4" />
      case "PLANEJAMENTO":
        return <Clock className="h-4 w-4" />
      case "ENCERRADO":
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ATIVO":
        return "bg-green-500"
      case "PLANEJAMENTO":
        return "bg-blue-500"
      case "EM_ANDAMENTO":
        return "bg-yellow-500"
      case "CONCLUIDO":
        return "bg-purple-500"
      case "CANCELADO":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  if (!project) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Projeto não encontrado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              O projeto solicitado não existe ou foi removido
            </p>
            <Link href="/dashboard/investidores/projetos">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Projetos
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Cálculos
  const totalValue = project.totalValue || 0
  const investedValue = project.investedValue || 0
  const distributedValue = project.distributedValue || 0
  const expectedReturn = project.expectedReturn || 0

  const investmentProgress = totalValue > 0 
    ? (investedValue / totalValue) * 100 
    : 0

  const distributionProgress = investedValue > 0
    ? (distributedValue / investedValue) * 100
    : 0

  const remainingToInvest = totalValue - investedValue
  const availableForDistribution = investedValue - distributedValue

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard/investidores/projetos">
              <Button variant="ghost" className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {project.name}
                </h1>
                <p className="text-muted-foreground">
                  Código: {project.code}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/investidores/projetos/${project.id}/editar`}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={deleting}>
                  {deleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.
                    {project._count && (project._count.investments > 0 || project._count.distributions > 0) && (
                      <div className="mt-2 p-2 bg-destructive/10 rounded-md text-destructive">
                        ⚠️ Este projeto possui {project._count.investments} aporte(s) e {project._count.distributions} distribuição(ões).
                        A exclusão pode falhar se houver dados vinculados.
                      </div>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Status e Informações Principais */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                variant="default"
                className={getStatusColor(project.status)}
              >
                {getStatusIcon(project.status)}
                <span className="ml-1">{projectsApi.helpers.getStatusLabel(project.status)}</span>
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Investidores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{project._count?.investments || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Aportes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{project._count?.investments || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Distribuições
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{project._count?.distributions || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Valores do Projeto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Valores do Projeto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Valor Total e Retorno Esperado */}
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Valor Total do Projeto</p>
                <p className="text-2xl font-bold text-primary">
                  {projectsApi.helpers.formatCurrency(project.totalValue)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Retorno Esperado</p>
                <p className="text-2xl font-bold text-green-600">
                  {projectsApi.helpers.formatCurrency(project.expectedReturn)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {project.totalValue > 0 
                    ? `+${((project.expectedReturn / project.totalValue) * 100).toFixed(2)}%`
                    : "0%"
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Lucro Estimado</p>
                <p className="text-2xl font-bold text-blue-600">
                  {projectsApi.helpers.formatCurrency(project.expectedReturn - project.totalValue)}
                </p>
              </div>
            </div>

            <Separator />

            {/* Captação de Recursos */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Captação de Recursos</p>
                <p className="text-sm text-muted-foreground">
                  {investmentProgress.toFixed(2)}%
                </p>
              </div>
              <Progress value={investmentProgress} className="h-2 mb-2" />
              <div className="grid gap-4 md:grid-cols-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Valor Captado</p>
                  <p className="font-semibold text-green-600">
                    {projectsApi.helpers.formatCurrency(project.investedValue)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Restante a Captar</p>
                  <p className="font-semibold text-orange-600">
                    {projectsApi.helpers.formatCurrency(remainingToInvest)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Meta Total</p>
                  <p className="font-semibold">
                    {projectsApi.helpers.formatCurrency(project.totalValue)}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Distribuições */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Distribuição de Lucros</p>
                <p className="text-sm text-muted-foreground">
                  {distributionProgress.toFixed(2)}%
                </p>
              </div>
              <Progress value={distributionProgress} className="h-2 mb-2" />
              <div className="grid gap-4 md:grid-cols-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Valor Distribuído</p>
                  <p className="font-semibold text-purple-600">
                    {projectsApi.helpers.formatCurrency(project.distributedValue)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Disponível para Distribuir</p>
                  <p className="font-semibold text-blue-600">
                    {projectsApi.helpers.formatCurrency(availableForDistribution)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Investido</p>
                  <p className="font-semibold">
                    {projectsApi.helpers.formatCurrency(project.investedValue)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações do Projeto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Informações do Projeto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.description && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Descrição</p>
                <p className="text-sm whitespace-pre-wrap">{project.description}</p>
              </div>
            )}

            {project.description && project.objectives && <Separator />}

            {project.objectives && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Objetivos</p>
                <p className="text-sm whitespace-pre-wrap">{project.objectives}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Datas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Datas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {project.startDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Data de Início</p>
                  <p className="font-medium">
                    {new Date(project.startDate).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              )}
              {project.endDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Data de Término</p>
                  <p className="font-medium">
                    {new Date(project.endDate).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Criado em</p>
                <p className="font-medium">
                  {new Date(project.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Atualizado em</p>
                <p className="font-medium">
                  {new Date(project.updatedAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Observações */}
        {project.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Observações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                {project.notes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Documentos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Paperclip className="h-5 w-5" />
                Documentos do Projeto
              </CardTitle>
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Enviar Documento
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Enviar Documento</DialogTitle>
                    <DialogDescription>
                      Faça upload de um documento relacionado ao projeto
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
                        onChange={handleFileSelect}
                        disabled={uploading}
                      />
                      {selectedFile && (
                        <p className="text-xs text-muted-foreground">
                          Arquivo selecionado: {selectedFile.name} (
                          {projectDocumentsApi.helpers.formatFileSize(selectedFile.size)})
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Nome do Documento <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={documentForm.name}
                        onChange={e =>
                          setDocumentForm({ ...documentForm, name: e.target.value })
                        }
                        placeholder="Ex: Contrato de Investimento"
                        disabled={uploading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">
                        Categoria <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={documentForm.category}
                        onValueChange={(value: any) =>
                          setDocumentForm({ ...documentForm, category: value })
                        }
                        disabled={uploading}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CONTRATO">Contrato</SelectItem>
                          <SelectItem value="ESTATUTO">Estatuto</SelectItem>
                          <SelectItem value="ATA">Ata</SelectItem>
                          <SelectItem value="RELATORIO">Relatório</SelectItem>
                          <SelectItem value="COMPROVANTE">Comprovante</SelectItem>
                          <SelectItem value="LICENCA">Licença</SelectItem>
                          <SelectItem value="ALVARA">Alvará</SelectItem>
                          <SelectItem value="PROJETO_TECNICO">
                            Projeto Técnico
                          </SelectItem>
                          <SelectItem value="PLANILHA">Planilha</SelectItem>
                          <SelectItem value="OUTRO">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={documentForm.description}
                        onChange={e =>
                          setDocumentForm({
                            ...documentForm,
                            description: e.target.value,
                          })
                        }
                        placeholder="Descrição opcional do documento..."
                        rows={3}
                        disabled={uploading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags</Label>
                      <Input
                        id="tags"
                        value={documentForm.tags}
                        onChange={e =>
                          setDocumentForm({ ...documentForm, tags: e.target.value })
                        }
                        placeholder="Ex: investimento,2024,contrato (separadas por vírgula)"
                        disabled={uploading}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setUploadDialogOpen(false)}
                      disabled={uploading}
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
            <CardDescription>
              Gerencie os documentos relacionados a este projeto
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingDocuments ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8">
                <Paperclip className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">
                  Nenhum documento cadastrado
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Envie o primeiro documento deste projeto
                </p>
                <Button
                  variant="outline"
                  onClick={() => setUploadDialogOpen(true)}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Enviar Documento
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Tamanho</TableHead>
                      <TableHead>Data de Upload</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map(doc => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            {doc.description && (
                              <p className="text-xs text-muted-foreground">
                                {doc.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {projectDocumentsApi.helpers.getCategoryLabel(doc.documentType || "OUTRO")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {projectDocumentsApi.helpers.formatFileSize(doc.fileSize || 0)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(doc.createdAt).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(doc.id, doc.name)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
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
                                    onClick={() => handleDeleteDocument(doc.id)}
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link href={`/dashboard/investidores/aportes?projeto=${project.id}`}>
              <Button variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                Ver Aportes deste Projeto
              </Button>
            </Link>
            <Link href={`/dashboard/investidores/distribuicoes?projeto=${project.id}`}>
              <Button variant="outline">
                <DollarSign className="mr-2 h-4 w-4" />
                Ver Distribuições deste Projeto
              </Button>
            </Link>
            <Link href={`/dashboard/investidores/aportes/novo?projeto=${project.id}`}>
              <Button variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                Novo Aporte
              </Button>
            </Link>
            <Link href={`/dashboard/investidores/distribuicoes/nova?projeto=${project.id}`}>
              <Button variant="outline">
                <DollarSign className="mr-2 h-4 w-4" />
                Nova Distribuição
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
