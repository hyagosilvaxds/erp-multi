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
  X,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/api/auth"
import {
  investmentsApi,
  type UpdateInvestmentDto,
  type PaymentMethod,
  type InvestmentStatus,
  type InvestmentDetails,
} from "@/lib/api/investments"
import { projectsApi, type ProjectListItem } from "@/lib/api/projects"
import { investorsApi, type InvestorListItem } from "@/lib/api/investors"
import { Separator } from "@/components/ui/separator"

export default function EditarAportePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [investment, setInvestment] = useState<InvestmentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [loadingInvestors, setLoadingInvestors] = useState(false)

  // Listas
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [investors, setInvestors] = useState<InvestorListItem[]>([])

  // Form data
  const [formData, setFormData] = useState<UpdateInvestmentDto>({
    projectId: "",
    investorId: "",
    amount: 0,
    investmentDate: "",
    paymentMethod: "PIX",
    status: "PENDENTE",
    referenceNumber: "",
    documentNumber: "",
    notes: "",
    attachments: [],
  })

  const [attachmentUrl, setAttachmentUrl] = useState("")

  useEffect(() => {
    loadSelectedCompany()
  }, [])

  useEffect(() => {
    if (selectedCompany && params.id) {
      loadInvestment()
      loadProjects()
      loadInvestors()
    }
  }, [selectedCompany, params.id])

  const loadSelectedCompany = async () => {
    try {
      const company = await authApi.getSelectedCompany()
      setSelectedCompany(company)
    } catch (error) {
      console.error("Erro ao carregar empresa:", error)
    }
  }

  const loadInvestment = async () => {
    if (!selectedCompany?.id || !params.id) return

    try {
      setLoading(true)
      const data = await investmentsApi.getById(
        selectedCompany.id,
        params.id as string
      )
      setInvestment(data)

      // Preenche o formulário com os dados do aporte
      setFormData({
        projectId: data.projectId,
        investorId: data.investorId,
        amount: data.amount,
        investmentDate: data.investmentDate,
        paymentMethod: data.paymentMethod,
        status: data.status,
        referenceNumber: data.referenceNumber,
        documentNumber: data.documentNumber || "",
        notes: data.notes || "",
        attachments: data.attachments || [],
      })
    } catch (error: any) {
      console.error("Erro ao carregar aporte:", error)
      toast({
        title: "Erro ao carregar aporte",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
      router.push("/dashboard/investidores/aportes")
    } finally {
      setLoading(false)
    }
  }

  const loadProjects = async () => {
    if (!selectedCompany?.id) return

    try {
      setLoadingProjects(true)
      const response = await projectsApi.getAll(selectedCompany.id)
      setProjects(response.data)
    } catch (error: any) {
      console.error("Erro ao carregar projetos:", error)
      toast({
        title: "Erro ao carregar projetos",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setLoadingProjects(false)
    }
  }

  const loadInvestors = async () => {
    if (!selectedCompany?.id) return

    try {
      setLoadingInvestors(true)
      const response = await investorsApi.getAll(selectedCompany.id)
      setInvestors(response.data)
    } catch (error: any) {
      console.error("Erro ao carregar investidores:", error)
      toast({
        title: "Erro ao carregar investidores",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setLoadingInvestors(false)
    }
  }

  const handleChange = (field: keyof UpdateInvestmentDto, value: any) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCompany?.id || !params.id) return

    // Validações
    if (!formData.projectId) {
      toast({
        title: "Erro",
        description: "Selecione um projeto",
        variant: "destructive",
      })
      return
    }

    if (!formData.investorId) {
      toast({
        title: "Erro",
        description: "Selecione um investidor",
        variant: "destructive",
      })
      return
    }

    if (!formData.amount || formData.amount <= 0) {
      toast({
        title: "Erro",
        description: "Informe um valor válido",
        variant: "destructive",
      })
      return
    }

    if (!formData.investmentDate) {
      toast({
        title: "Erro",
        description: "Informe a data do aporte",
        variant: "destructive",
      })
      return
    }

    if (!formData.referenceNumber) {
      toast({
        title: "Erro",
        description: "Informe o número de referência",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)

      await investmentsApi.update(
        selectedCompany.id,
        params.id as string,
        formData
      )

      toast({
        title: "Sucesso",
        description: "Aporte atualizado com sucesso",
      })

      router.push(`/dashboard/investidores/aportes/${params.id}`)
    } catch (error: any) {
      console.error("Erro ao atualizar aporte:", error)
      toast({
        title: "Erro ao atualizar aporte",
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

  if (loading) {
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
        <div className="flex items-center justify-between">
          <div>
            <Link href={`/dashboard/investidores/aportes/${params.id}`}>
              <Button variant="ghost" className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Editar Aporte
            </h1>
            <p className="text-muted-foreground">
              Atualize as informações do aporte
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Formulário - 2 colunas */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                  <CardDescription>
                    Projeto e investidor do aporte
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectId">
                      Projeto <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.projectId}
                      onValueChange={value => handleChange("projectId", value)}
                      disabled={loadingProjects}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um projeto" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.length === 0 ? (
                          <SelectItem value="_empty" disabled>
                            Nenhum projeto encontrado
                          </SelectItem>
                        ) : (
                          projects.map(project => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name} ({project.code})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="investorId">
                      Investidor <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.investorId}
                      onValueChange={value => handleChange("investorId", value)}
                      disabled={loadingInvestors}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um investidor" />
                      </SelectTrigger>
                      <SelectContent>
                        {investors.length === 0 ? (
                          <SelectItem value="_empty" disabled>
                            Nenhum investidor encontrado
                          </SelectItem>
                        ) : (
                          investors.map(investor => (
                            <SelectItem key={investor.id} value={investor.id}>
                              {investorsApi.helpers.getName(investor)} -{" "}
                              {investor.type === "PESSOA_FISICA" ? "PF" : "PJ"}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Detalhes do Aporte</CardTitle>
                  <CardDescription>
                    Valor, data e método de pagamento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="amount">
                        Valor <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={formData.amount}
                        onChange={e =>
                          handleChange("amount", parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="investmentDate">
                        Data do Aporte <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="investmentDate"
                        type="date"
                        value={formData.investmentDate}
                        onChange={e =>
                          handleChange("investmentDate", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod">
                        Método de Pagamento <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.paymentMethod}
                        onValueChange={value =>
                          handleChange("paymentMethod", value as PaymentMethod)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PIX">PIX</SelectItem>
                          <SelectItem value="TED">TED</SelectItem>
                          <SelectItem value="TRANSFERENCIA">
                            Transferência
                          </SelectItem>
                          <SelectItem value="BOLETO">Boleto</SelectItem>
                          <SelectItem value="CHEQUE">Cheque</SelectItem>
                          <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">
                        Status <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.status}
                        onValueChange={value =>
                          handleChange("status", value as InvestmentStatus)
                        }
                      >
                        <SelectTrigger>
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

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="referenceNumber">
                        Número de Referência <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="referenceNumber"
                        placeholder="Ex: APT-001"
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
                        placeholder="Ex: NF-001, Recibo-001"
                        value={formData.documentNumber}
                        onChange={e =>
                          handleChange("documentNumber", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Observações</CardTitle>
                  <CardDescription>
                    Informações adicionais sobre o aporte
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    id="notes"
                    placeholder="Digite observações adicionais..."
                    value={formData.notes}
                    onChange={e => handleChange("notes", e.target.value)}
                    rows={4}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Links de Anexos (Legado)</CardTitle>
                  <CardDescription>
                    URLs de documentos relacionados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://exemplo.com/documento.pdf"
                      value={attachmentUrl}
                      onChange={e => setAttachmentUrl(e.target.value)}
                      onKeyPress={e => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddAttachment()
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleAddAttachment}
                      disabled={!attachmentUrl.trim()}
                    >
                      Adicionar
                    </Button>
                  </div>

                  {formData.attachments && formData.attachments.length > 0 && (
                    <div className="space-y-2">
                      {formData.attachments.map((url, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border rounded-md"
                        >
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline truncate flex-1"
                          >
                            {url}
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
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - 1 coluna */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Valor do Aporte</p>
                    <p className="text-2xl font-bold">
                      {investmentsApi.helpers.formatCurrency(formData.amount || 0)}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium">
                      {investmentsApi.helpers.getStatusLabel(
                        formData.status as InvestmentStatus
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Método de Pagamento</p>
                    <p className="font-medium">
                      {investmentsApi.helpers.getPaymentMethodLabel(
                        formData.paymentMethod as PaymentMethod
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSaving}
                  >
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
                  <Link
                    href={`/dashboard/investidores/aportes/${params.id}`}
                    className="w-full"
                  >
                    <Button type="button" variant="outline" className="w-full">
                      Cancelar
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
