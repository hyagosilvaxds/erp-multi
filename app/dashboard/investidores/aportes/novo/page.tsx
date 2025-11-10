"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  Upload as UploadIcon,
  X,
  Paperclip,
  FileText,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/api/auth"
import {
  investmentsApi,
  type CreateInvestmentDto,
  type PaymentMethod,
  type InvestmentStatus,
} from "@/lib/api/investments"
import { projectsApi, type ProjectListItem } from "@/lib/api/projects"
import { investorsApi, type InvestorListItem } from "@/lib/api/investors"
import { investmentDocumentsApi, type InvestmentDocumentCategory } from "@/lib/api/investment-documents"

export default function NovoAportePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [loadingInvestors, setLoadingInvestors] = useState(false)

  // Listas
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [investors, setInvestors] = useState<InvestorListItem[]>([])

  // Form data
  const [formData, setFormData] = useState<CreateInvestmentDto>({
    projectId: "",
    investorId: "",
    amount: 0,
    investmentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "PIX",
    status: "PENDENTE",
    referenceNumber: "",
    documentNumber: "",
    notes: "",
    attachments: [],
  })

  const [attachmentUrl, setAttachmentUrl] = useState("")
  
  // Estados para upload de documentos
  const [filesToUpload, setFilesToUpload] = useState<Array<{
    file: File
    name: string
    category: InvestmentDocumentCategory
    description: string
  }>>([])
  const [uploadingDocuments, setUploadingDocuments] = useState(false)

  useEffect(() => {
    loadSelectedCompany()
  }, [])

  useEffect(() => {
    if (selectedCompany) {
      loadProjects()
      loadInvestors()
      // Gerar número de referência automático
      generateReferenceNumber()
    }
  }, [selectedCompany])

  const loadSelectedCompany = async () => {
    try {
      const company = await authApi.getSelectedCompany()
      setSelectedCompany(company)
    } catch (error) {
      console.error("Erro ao carregar empresa:", error)
    }
  }

  const loadProjects = async () => {
    if (!selectedCompany?.id) return

    try {
      setLoadingProjects(true)
      const response = await projectsApi.getAll(selectedCompany.id, {
        page: 1,
        limit: 100,
      })
      setProjects(response.data)
    } catch (error) {
      console.error("Erro ao carregar projetos:", error)
    } finally {
      setLoadingProjects(false)
    }
  }

  const loadInvestors = async () => {
    if (!selectedCompany?.id) return

    try {
      setLoadingInvestors(true)
      const response = await investorsApi.getAll(selectedCompany.id, {
        page: 1,
        limit: 100,
      })
      setInvestors(response.data)
    } catch (error) {
      console.error("Erro ao carregar investidores:", error)
    } finally {
      setLoadingInvestors(false)
    }
  }

  const generateReferenceNumber = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    setFormData(prev => ({
      ...prev,
      referenceNumber: `AP-${year}${month}-${random}`,
    }))
  }

  const handleChange = (field: keyof CreateInvestmentDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddAttachment = () => {
    if (attachmentUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), attachmentUrl.trim()],
      }))
      setAttachmentUrl("")
    }
  }

  const handleRemoveAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments?.filter((_, i) => i !== index) || [],
    }))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      const newFiles = files.map(file => ({
        file,
        name: file.name,
        category: "Comprovantes" as InvestmentDocumentCategory,
        description: "",
      }))
      setFilesToUpload(prev => [...prev, ...newFiles])
    }
    // Limpa o input
    e.target.value = ""
  }

  const handleRemoveFile = (index: number) => {
    setFilesToUpload(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpdateFileMetadata = (
    index: number,
    field: "name" | "category" | "description",
    value: string
  ) => {
    setFilesToUpload(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    )
  }

  const uploadDocuments = async (investmentId: string) => {
    if (filesToUpload.length === 0) return

    setUploadingDocuments(true)
    let successCount = 0
    let errorCount = 0

    for (const fileData of filesToUpload) {
      try {
        await investmentDocumentsApi.upload({
          file: fileData.file,
          investmentId: investmentId,
          name: fileData.name,
          category: fileData.category,
          description: fileData.description || undefined,
        })
        successCount++
      } catch (error: any) {
        console.error("Erro ao fazer upload de documento:", error)
        errorCount++
      }
    }

    setUploadingDocuments(false)

    if (successCount > 0) {
      toast({
        title: "Documentos enviados",
        description: `${successCount} documento(s) enviado(s) com sucesso${
          errorCount > 0 ? `. ${errorCount} falhou(aram)` : ""
        }`,
      })
    }

    if (errorCount > 0 && successCount === 0) {
      toast({
        title: "Erro ao enviar documentos",
        description: `Falha ao enviar ${errorCount} documento(s)`,
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCompany?.id) {
      toast({
        title: "Erro",
        description: "Nenhuma empresa selecionada",
        variant: "destructive",
      })
      return
    }

    // Validações
    if (!formData.projectId || !formData.investorId) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione o projeto e o investidor",
        variant: "destructive",
      })
      return
    }

    if (!formData.amount || formData.amount <= 0) {
      toast({
        title: "Valor inválido",
        description: "O valor do aporte deve ser maior que zero",
        variant: "destructive",
      })
      return
    }

    if (!formData.referenceNumber) {
      toast({
        title: "Campo obrigatório",
        description: "Informe o número de referência",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)

      const payload: CreateInvestmentDto = {
        projectId: formData.projectId,
        investorId: formData.investorId,
        amount: Number(formData.amount),
        investmentDate: formData.investmentDate,
        paymentMethod: formData.paymentMethod,
        status: formData.status,
        referenceNumber: formData.referenceNumber,
        documentNumber: formData.documentNumber || undefined,
        notes: formData.notes || undefined,
        attachments:
          formData.attachments && formData.attachments.length > 0
            ? formData.attachments
            : undefined,
      }

      const createdInvestment = await investmentsApi.create(selectedCompany.id, payload)

      toast({
        title: "Sucesso",
        description: "Aporte registrado com sucesso",
      })

      // Upload de documentos após criar o aporte
      if (filesToUpload.length > 0) {
        await uploadDocuments(createdInvestment.id)
      }

      router.push("/dashboard/investidores/aportes")
    } catch (error: any) {
      console.error("Erro ao criar aporte:", error)
      toast({
        title: "Erro ao criar aporte",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!selectedCompany) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Nenhuma empresa selecionada</h3>
            <p className="text-sm text-muted-foreground">
              Selecione uma empresa para continuar
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Registrar Aporte
            </h1>
            <p className="text-muted-foreground">Cadastrar novo investimento</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {/* Informações Básicas */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Aporte</CardTitle>
                  <CardDescription>Dados principais do investimento</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="project">Projeto *</Label>
                      {loadingProjects ? (
                        <div className="flex items-center justify-center h-10">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        <Select
                          value={formData.projectId}
                          onValueChange={value => handleChange("projectId", value)}
                        >
                          <SelectTrigger id="project">
                            <SelectValue placeholder="Selecione o projeto" />
                          </SelectTrigger>
                          <SelectContent>
                            {projects.map(project => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.code} - {project.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="investor">Investidor *</Label>
                      {loadingInvestors ? (
                        <div className="flex items-center justify-center h-10">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        <Select
                          value={formData.investorId}
                          onValueChange={value => handleChange("investorId", value)}
                        >
                          <SelectTrigger id="investor">
                            <SelectValue placeholder="Selecione o investidor" />
                          </SelectTrigger>
                          <SelectContent>
                            {investors.map(investor => (
                              <SelectItem key={investor.id} value={investor.id}>
                                {investorsApi.helpers.getName(investor)} (
                                {investorsApi.helpers.getDocument(investor)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Valor do Aporte *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        value={formData.amount || ""}
                        onChange={e =>
                          handleChange("amount", parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="investmentDate">Data do Aporte *</Label>
                      <Input
                        id="investmentDate"
                        type="date"
                        value={formData.investmentDate}
                        onChange={e => handleChange("investmentDate", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="referenceNumber">Número de Referência *</Label>
                      <Input
                        id="referenceNumber"
                        placeholder="AP-2024-001"
                        value={formData.referenceNumber}
                        onChange={e =>
                          handleChange("referenceNumber", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="documentNumber">Número do Documento</Label>
                      <Input
                        id="documentNumber"
                        placeholder="Ex: 123456"
                        value={formData.documentNumber}
                        onChange={e =>
                          handleChange("documentNumber", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod">Método de Pagamento *</Label>
                      <Select
                        value={formData.paymentMethod}
                        onValueChange={value =>
                          handleChange("paymentMethod", value as PaymentMethod)
                        }
                      >
                        <SelectTrigger id="paymentMethod">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PIX">PIX</SelectItem>
                          <SelectItem value="TED">TED</SelectItem>
                          <SelectItem value="TRANSFERENCIA">Transferência</SelectItem>
                          <SelectItem value="CHEQUE">Cheque</SelectItem>
                          <SelectItem value="BOLETO">Boleto</SelectItem>
                          <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
                      <Select
                        value={formData.status}
                        onValueChange={value =>
                          handleChange("status", value as InvestmentStatus)
                        }
                      >
                        <SelectTrigger id="status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDENTE">Pendente</SelectItem>
                          <SelectItem value="CONFIRMADO">Confirmado</SelectItem>
                          <SelectItem value="CANCELADO">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      placeholder="Adicione observações sobre o aporte..."
                      rows={4}
                      value={formData.notes}
                      onChange={e => handleChange("notes", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Upload de Documentos */}
              <Card>
                <CardHeader>
                  <CardTitle>Documentos e Comprovantes</CardTitle>
                  <CardDescription>
                    Faça upload dos documentos relacionados ao aporte
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Input de arquivo */}
                  <div>
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                        <input
                          id="file-upload"
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <UploadIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          Clique para selecionar arquivos
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF, Word, Excel, Imagens (até 10MB cada)
                        </p>
                      </div>
                    </Label>
                  </div>

                  {/* Lista de arquivos selecionados */}
                  {filesToUpload.length > 0 && (
                    <div className="space-y-3">
                      <Label>Arquivos Selecionados ({filesToUpload.length})</Label>
                      <div className="space-y-3">
                        {filesToUpload.map((fileData, index) => (
                          <div
                            key={index}
                            className="border rounded-lg p-4 space-y-3"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-2 flex-1">
                                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {fileData.file.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {investmentDocumentsApi.helpers.formatFileSize(
                                      fileData.file.size
                                    )}
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveFile(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="space-y-2">
                              <div className="space-y-1">
                                <Label className="text-xs">Nome do Documento</Label>
                                <Input
                                  value={fileData.name}
                                  onChange={e =>
                                    handleUpdateFileMetadata(index, "name", e.target.value)
                                  }
                                  placeholder="Ex: Comprovante de TED"
                                  className="h-8 text-sm"
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs">Categoria</Label>
                                <Select
                                  value={fileData.category}
                                  onValueChange={(value: InvestmentDocumentCategory) =>
                                    handleUpdateFileMetadata(index, "category", value)
                                  }
                                >
                                  <SelectTrigger className="h-8 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Comprovantes">
                                      Comprovantes
                                    </SelectItem>
                                    <SelectItem value="Contratos">
                                      Contratos
                                    </SelectItem>
                                    <SelectItem value="Recibos">
                                      Recibos
                                    </SelectItem>
                                    <SelectItem value="Termos">
                                      Termos
                                    </SelectItem>
                                    <SelectItem value="Documentos Bancários">
                                      Documentos Bancários
                                    </SelectItem>
                                    <SelectItem value="Outros">
                                      Outros
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs">Descrição (opcional)</Label>
                                <Textarea
                                  value={fileData.description}
                                  onChange={e =>
                                    handleUpdateFileMetadata(
                                      index,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Descrição do documento..."
                                  className="text-sm resize-none"
                                  rows={2}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Links para documentos (mantido para compatibilidade) */}
                  {formData.attachments && formData.attachments.length > 0 && (
                    <div className="space-y-2">
                      <Label>Links de Documentos</Label>
                      <div className="space-y-2">
                        {formData.attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 border rounded-lg"
                          >
                            <a
                              href={attachment}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline truncate flex-1"
                            >
                              {attachment}
                            </a>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveAttachment(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Ações */}
              <Card>
                <CardContent className="pt-6 space-y-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSaving || uploadingDocuments}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {uploadingDocuments ? "Enviando documentos..." : "Salvando..."}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Aporte
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.back()}
                    disabled={isSaving || uploadingDocuments}
                  >
                    Cancelar
                  </Button>
                </CardContent>
              </Card>

              {/* Informações */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium">Status do Aporte</p>
                    <p className="text-muted-foreground">
                      {formData.status === "CONFIRMADO"
                        ? "Será contabilizado no projeto"
                        : formData.status === "PENDENTE"
                        ? "Aguardando confirmação"
                        : "Não será contabilizado"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Método de Pagamento</p>
                    <p className="text-muted-foreground">
                      {investmentsApi.helpers.getPaymentMethodLabel(
                        formData.paymentMethod
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Valor</p>
                    <p className="text-muted-foreground">
                      {investmentsApi.helpers.formatCurrency(formData.amount)}
                    </p>
                  </div>
                  {filesToUpload.length > 0 && (
                    <div>
                      <p className="font-medium">Documentos</p>
                      <p className="text-muted-foreground">
                        {filesToUpload.length} arquivo(s) será(ão) enviado(s) após salvar
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
