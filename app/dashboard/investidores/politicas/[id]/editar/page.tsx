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
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  Info,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/api/auth"
import {
  distributionPoliciesApi,
  type UpdateDistributionPolicyDto,
  type DistributionPolicyDetails,
} from "@/lib/api/distribution-policies"

export default function EditarPoliticaPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [policy, setPolicy] = useState<DistributionPolicyDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Form data
  const [formData, setFormData] = useState<UpdateDistributionPolicyDto>({
    percentage: 0,
    active: true,
    endDate: undefined,
    notes: "",
  })

  useEffect(() => {
    loadSelectedCompany()
  }, [])

  useEffect(() => {
    if (selectedCompany && params.id) {
      loadPolicy()
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

  const loadPolicy = async () => {
    if (!selectedCompany?.id || !params.id) return

    try {
      setLoading(true)
      const data = await distributionPoliciesApi.getById(
        selectedCompany.id,
        params.id as string
      )
      setPolicy(data)

      // Preenche o formulário com os dados da política
      setFormData({
        percentage: data.percentage,
        active: data.active,
        endDate: data.endDate || undefined,
        notes: data.notes || "",
      })
    } catch (error: any) {
      console.error("Erro ao carregar política:", error)
      toast({
        title: "Erro ao carregar política",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
      router.push("/dashboard/investidores/politicas")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof UpdateDistributionPolicyDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCompany?.id || !params.id) return

    // Validações
    if (!formData.percentage || formData.percentage <= 0 || formData.percentage > 100) {
      toast({
        title: "Erro",
        description: "Informe um percentual entre 0 e 100",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)

      await distributionPoliciesApi.update(
        selectedCompany.id,
        params.id as string,
        {
          ...formData,
          notes: formData.notes || undefined,
        }
      )

      toast({
        title: "Sucesso",
        description: "Política atualizada com sucesso",
      })

      router.push(`/dashboard/investidores/politicas/${params.id}`)
    } catch (error: any) {
      console.error("Erro ao atualizar política:", error)
      toast({
        title: "Erro ao atualizar política",
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

  if (!policy) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Política não encontrada</h3>
            <p className="text-sm text-muted-foreground">
              A política que você procura não existe
            </p>
            <Link href="/dashboard/investidores/politicas">
              <Button className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Políticas
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
        <div className="flex items-center justify-between">
          <div>
            <Link href={`/dashboard/investidores/politicas/${params.id}`}>
              <Button variant="ghost" className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Editar Política de Distribuição
            </h1>
            <p className="text-muted-foreground">
              Atualize as configurações da política
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Formulário - 2 colunas */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informações Não Editáveis */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações da Política</CardTitle>
                  <CardDescription>
                    Projeto e investidor não podem ser alterados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Projeto</Label>
                    <div className="mt-1 p-3 bg-muted rounded-md">
                      <p className="font-medium">{policy.project.name}</p>
                      <Badge variant="outline" className="mt-1">
                        {policy.project.code}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <Label>Investidor</Label>
                    <div className="mt-1 p-3 bg-muted rounded-md">
                      <p className="font-medium">
                        {distributionPoliciesApi.helpers.getInvestorName(
                          policy.investor
                        )}
                      </p>
                      <Badge variant="outline" className="mt-1">
                        {policy.investor.type === "PESSOA_FISICA"
                          ? "Pessoa Física"
                          : "Pessoa Jurídica"}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <Label>Tipo de Distribuição</Label>
                    <div className="mt-1 p-3 bg-muted rounded-md">
                      <p className="font-medium">
                        {distributionPoliciesApi.helpers.getTypeLabel(policy.type)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label>Data de Início</Label>
                    <div className="mt-1 p-3 bg-muted rounded-md">
                      <p className="font-medium">
                        {distributionPoliciesApi.helpers.formatDate(policy.startDate)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Campos Editáveis */}
              <Card>
                <CardHeader>
                  <CardTitle>Configurações Editáveis</CardTitle>
                  <CardDescription>
                    Atualize o percentual e status da política
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="percentage">
                      Percentual (%) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="percentage"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="0.00"
                      value={formData.percentage || ""}
                      onChange={e =>
                        handleChange("percentage", parseFloat(e.target.value) || 0)
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Valor entre 0 e 100. Se alterar, a soma dos percentuais do
                      projeto não pode exceder 100%.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">Data de Término</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate || ""}
                      onChange={e =>
                        handleChange("endDate", e.target.value || undefined)
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Deixe em branco para política sem data de término
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={formData.active}
                      onCheckedChange={value => handleChange("active", value)}
                    />
                    <Label htmlFor="active" className="cursor-pointer">
                      Política ativa
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Desative a política se não quiser que ela seja usada em cálculos
                    automáticos. Recomendamos desativar ao invés de excluir para
                    manter o histórico.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Observações</CardTitle>
                  <CardDescription>
                    Informações adicionais sobre a política (opcional)
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
            </div>

            {/* Sidebar - 1 coluna */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Percentual Atual</p>
                    <p className="text-2xl font-bold">
                      {distributionPoliciesApi.helpers.formatPercentage(
                        formData.percentage || 0
                      )}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={formData.active ? "default" : "secondary"}>
                      {distributionPoliciesApi.helpers.getActiveLabel(formData.active ?? false)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Término</p>
                    <p className="font-medium">
                      {formData.endDate
                        ? distributionPoliciesApi.helpers.formatDate(formData.endDate)
                        : "Sem data de término"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    <Info className="h-4 w-4 inline mr-2" />
                    Avisos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    • Projeto e investidor não podem ser alterados após criação
                  </p>
                  <p>
                    • Se alterar o percentual, a soma total do projeto não pode
                    exceder 100%
                  </p>
                  <p>
                    • Desative a política ao invés de excluir para manter histórico
                  </p>
                  <p>
                    • Políticas ativas são usadas para calcular distribuições
                    automáticas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button type="submit" className="w-full" disabled={isSaving}>
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
                    href={`/dashboard/investidores/politicas/${params.id}`}
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
