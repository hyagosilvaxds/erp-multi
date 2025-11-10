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
import { Separator } from "@/components/ui/separator"
import {
  Loader2,
  ArrowLeft,
  Edit,
  Trash2,
  TrendingUp,
  Calendar,
  User,
  Briefcase,
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Upload,
  Download,
  Paperclip,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/api/auth"
import { investmentsApi, type InvestmentDetails } from "@/lib/api/investments"
import { investmentDocumentsApi, type InvestmentDocument } from "@/lib/api/investment-documents"
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

export default function DetalhesAportePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [investment, setInvestment] = useState<InvestmentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  // Estados para documentos
  const [documents, setDocuments] = useState<InvestmentDocument[]>([])
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentForm, setDocumentForm] = useState({
    name: "",
    description: "",
    category: "Comprovantes" as const,
    tags: "",
  })

  useEffect(() => {
    loadSelectedCompany()
  }, [])

  useEffect(() => {
    if (params.id && selectedCompany?.id) {
      loadInvestment()
      loadDocuments()
    }
  }, [params.id, selectedCompany])

  const loadSelectedCompany = async () => {
    try {
      const company = await authApi.getSelectedCompany()
      setSelectedCompany(company)
    } catch (error) {
      console.error("Erro ao carregar empresa:", error)
    }
  }

  const loadInvestment = async () => {
    if (!params.id || !selectedCompany?.id) return
    
    try {
      setLoading(true)
      const data = await investmentsApi.getById(selectedCompany.id, params.id as string)
      setInvestment(data)
    } catch (error: any) {
      console.error("Erro ao carregar aporte:", error)
      toast({
        title: "Erro ao carregar aporte",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadDocuments = async () => {
    if (!params.id) return
    
    try {
      setLoadingDocuments(true)
      const data = await investmentDocumentsApi.getAll(params.id as string)
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
      await investmentDocumentsApi.upload({
        file: selectedFile,
        investmentId: params.id as string,
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
        category: "Comprovantes",
        tags: "",
      })
      loadDocuments()
      loadInvestment() // Recarrega para atualizar attachments
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
      const blob = await investmentDocumentsApi.download(documentId)
      investmentDocumentsApi.helpers.triggerDownload(blob, fileName)
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
      await investmentDocumentsApi.delete(documentId)
      toast({
        title: "Sucesso",
        description: "Documento excluído com sucesso",
      })
      loadDocuments()
      loadInvestment() // Recarrega para atualizar attachments
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
    if (!params.id || !selectedCompany?.id) return
    
    try {
      setDeleting(true)
      await investmentsApi.delete(selectedCompany.id, params.id as string)
      toast({
        title: "Sucesso",
        description: "Aporte excluído com sucesso",
      })
      router.push("/dashboard/investidores/aportes")
    } catch (error: any) {
      console.error("Erro ao excluir aporte:", error)
      toast({
        title: "Erro ao excluir aporte",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMADO":
        return <CheckCircle2 className="h-5 w-5" />
      case "PENDENTE":
        return <Clock className="h-5 w-5" />
      case "CANCELADO":
        return <XCircle className="h-5 w-5" />
      default:
        return <AlertCircle className="h-5 w-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMADO":
        return "bg-green-500"
      case "PENDENTE":
        return "bg-yellow-500"
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

  if (!investment) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Aporte não encontrado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              O aporte que você está procurando não existe ou foi removido.
            </p>
            <Link href="/dashboard/investidores/aportes">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Aportes
              </Button>
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
          <div className="space-y-1">
            <Link href="/dashboard/investidores/aportes">
              <Button variant="ghost" className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${getStatusColor(investment.status)}`}>
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {investment.referenceNumber || `Aporte #${investment.id.substring(0, 8)}`}
                </h1>
                <p className="text-muted-foreground">
                  Detalhes do aporte
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/investidores/aportes/${investment.id}/editar`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir este aporte? Esta ação não pode ser desfeita
                    e todos os documentos relacionados também serão removidos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Excluindo...
                      </>
                    ) : (
                      "Excluir"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              {getStatusIcon(investment.status)}
            </CardHeader>
            <CardContent>
              <Badge className={getStatusColor(investment.status)}>
                {investment.status}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {investmentsApi.helpers.formatCurrency(investment.amount)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(investment.investmentDate).toLocaleDateString("pt-BR")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documentos</CardTitle>
              <Paperclip className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {documents.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações do Projeto */}
        {investment.project && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Projeto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{investment.project.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Código</p>
                  <p className="font-medium">{investment.project.code}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informações do Investidor */}
        {investment.investor && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Investidor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">
                    {investmentsApi.helpers.getInvestorName(investment.investor)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <Badge variant="outline">
                    {investment.investor.type === "PESSOA_FISICA" ? "Pessoa Física" : "Pessoa Jurídica"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detalhes do Aporte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Detalhes do Aporte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {investment.referenceNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">Número de Referência</p>
                  <p className="font-medium">{investment.referenceNumber}</p>
                </div>
              )}
              {investment.documentNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">Número do Documento</p>
                  <p className="font-medium">{investment.documentNumber}</p>
                </div>
              )}
              {investment.paymentMethod && (
                <div>
                  <p className="text-sm text-muted-foreground">Método de Pagamento</p>
                  <p className="font-medium">{investment.paymentMethod}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Criado em</p>
                <p className="font-medium">
                  {new Date(investment.createdAt).toLocaleDateString("pt-BR")} às{" "}
                  {new Date(investment.createdAt).toLocaleTimeString("pt-BR")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Observações */}
        {investment.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Observações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                {investment.notes}
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
                Documentos do Aporte
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
                      Faça upload de um documento relacionado ao aporte
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
                          {investmentDocumentsApi.helpers.formatFileSize(selectedFile.size)})
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
                        placeholder="Ex: Comprovante de TED"
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
                          <SelectItem value="Comprovantes">Comprovantes</SelectItem>
                          <SelectItem value="Contratos">Contratos</SelectItem>
                          <SelectItem value="Recibos">Recibos</SelectItem>
                          <SelectItem value="Termos">Termos</SelectItem>
                          <SelectItem value="Documentos Bancários">
                            Documentos Bancários
                          </SelectItem>
                          <SelectItem value="Outros">Outros</SelectItem>
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
                        placeholder="Ex: ted,pagamento,2024 (separadas por vírgula)"
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
              Gerencie os documentos relacionados a este aporte
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
                  Envie o primeiro documento deste aporte
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
                            {investmentDocumentsApi.helpers.getCategoryLabel(doc.documentType)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {investmentDocumentsApi.helpers.formatFileSize(doc.fileSize || 0)}
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
      </div>
    </DashboardLayout>
  )
}
