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
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  Info,
  Calculator,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/api/auth"
import {
  distributionPoliciesApi,
  type CreateDistributionPolicyDto,
  type DistributionPolicyType,
  type PoliciesByProjectResponse,
} from "@/lib/api/distribution-policies"
import { projectsApi, type ProjectListItem } from "@/lib/api/projects"
import { investorsApi, type InvestorListItem } from "@/lib/api/investors"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

export default function NovaPoliticaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [loadingInvestors, setLoadingInvestors] = useState(false)
  const [loadingProjectSummary, setLoadingProjectSummary] = useState(false)

  // Listas
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [investors, setInvestors] = useState<InvestorListItem[]>([])
  const [projectSummary, setProjectSummary] = useState<PoliciesByProjectResponse | null>(null)

  // Form data
  const [formData, setFormData] = useState<CreateDistributionPolicyDto>({
    projectId: "",
    investorId: "",
    percentage: 0,
    type: "PROPORCIONAL",
    active: true,
    startDate: new Date().toISOString().split("T")[0],
    endDate: undefined,
    notes: "",
  })

  useEffect(() => {
    loadSelectedCompany()
  }, [])

  useEffect(() => {
    if (selectedCompany) {
      loadProjects()
      loadInvestors()
    }
  }, [selectedCompany])

  // Carrega resumo do projeto quando projeto é selecionado
  useEffect(() => {
    if (selectedCompany && formData.projectId) {
      loadProjectSummary()
    } else {
      setProjectSummary(null)
    }
  }, [selectedCompany, formData.projectId])

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

  const loadProjectSummary = async () => {
    if (!selectedCompany?.id || !formData.projectId) return

    try {
      setLoadingProjectSummary(true)
      const data = await distributionPoliciesApi.getByProject(
        selectedCompany.id,
        formData.projectId
      )
      setProjectSummary(data)
    } catch (error: any) {
      console.error("Erro ao carregar resumo do projeto:", error)
      // Não mostra toast para não poluir - pode não ter políticas ainda
      setProjectSummary(null)
    } finally {
      setLoadingProjectSummary(false)
    }
  }

  const handleChange = (field: keyof CreateDistributionPolicyDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCompany?.id) return

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

    if (!formData.percentage || formData.percentage <= 0 || formData.percentage > 100) {
      toast({
        title: "Erro",
        description: "Informe um percentual entre 0 e 100",
        variant: "destructive",
      })
      return
    }

    if (!formData.startDate) {
      toast({
        title: "Erro",
        description: "Informe a data de início",
        variant: "destructive",
      })
      return
    }

    // Valida se soma dos percentuais não excede 100%
    if (projectSummary) {
      const totalWithNew = projectSummary.summary.totalPercentage + formData.percentage
      if (totalWithNew > 100) {
        toast({
          title: "Erro",
          description: `A soma dos percentuais (${totalWithNew.toFixed(2)}%) excederia 100%. Restante disponível: ${projectSummary.summary.remainingPercentage.toFixed(2)}%`,
          variant: "destructive",
        })
        return
      }
    }

    try {
      setIsSaving(true)

      await distributionPoliciesApi.create(selectedCompany.id, {
        ...formData,
        notes: formData.notes || undefined,
      })

      toast({
        title: "Sucesso",
        description: "Política de distribuição criada com sucesso",
      })

      router.push("/dashboard/investidores/politicas")
    } catch (error: any) {
      console.error("Erro ao criar política:", error)
      toast({
        title: "Erro ao criar política",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Calcula percentual restante considerando a nova política
  const getRemainingPercentage = () => {
    if (!projectSummary) return 100
    return Math.max(0, projectSummary.summary.remainingPercentage - (formData.percentage || 0))
  }

  const getTotalWithNew = () => {
    if (!projectSummary) return formData.percentage || 0
    return projectSummary.summary.totalPercentage + (formData.percentage || 0)
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
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard/investidores/politicas">
              <Button variant="ghost" className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Nova Política de Distribuição
            </h1>
            <p className="text-muted-foreground">
              Configure regras automáticas de distribuição de valores
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
                    Selecione o projeto e investidor
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

              {/* Resumo do Projeto */}
              {formData.projectId && projectSummary && (
                <Alert>
                  <Calculator className="h-4 w-4" />
                  <AlertTitle>Políticas Ativas no Projeto</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total de políticas ativas:</span>
                        <span className="font-medium">
                          {projectSummary.summary.totalPolicies}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Percentual distribuído:</span>
                        <span className="font-medium">
                          {distributionPoliciesApi.helpers.formatPercentage(
                            projectSummary.summary.totalPercentage
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Percentual disponível:</span>
                        <span className="font-medium text-green-600">
                          {distributionPoliciesApi.helpers.formatPercentage(
                            projectSummary.summary.remainingPercentage
                          )}
                        </span>
                      </div>
                      {projectSummary.policies.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm font-medium mb-2">
                            Investidores com políticas ativas:
                          </p>
                          <div className="space-y-1">
                            {projectSummary.policies.map(policy => (
                              <div
                                key={policy.id}
                                className="flex justify-between text-xs"
                              >
                                <span>
                                  {distributionPoliciesApi.helpers.getInvestorName(
                                    policy.investor
                                  )}
                                </span>
                                <span className="font-medium">
                                  {distributionPoliciesApi.helpers.formatPercentage(
                                    policy.percentage
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Configuração da Política</CardTitle>
                  <CardDescription>
                    Defina o percentual de distribuição proporcional
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
                      Valor entre 0 e 100
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">
                        Data de Início <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={e => handleChange("startDate", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">Data de Término</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate || ""}
                        onChange={e =>
                          handleChange("endDate", e.target.value || null)
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Deixe em branco para política sem data de término
                      </p>
                    </div>
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
                    <p className="text-sm text-muted-foreground">Percentual</p>
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
                      {distributionPoliciesApi.helpers.getActiveLabel(formData.active)}
                    </Badge>
                  </div>

                  {projectSummary && formData.percentage > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total após adicionar
                        </p>
                        <p className="text-xl font-bold">
                          {distributionPoliciesApi.helpers.formatPercentage(
                            getTotalWithNew()
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Restante após adicionar
                        </p>
                        <p
                          className={`text-xl font-bold ${
                            getRemainingPercentage() < 0
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {distributionPoliciesApi.helpers.formatPercentage(
                            getRemainingPercentage()
                          )}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    <Info className="h-4 w-4 inline mr-2" />
                    Informações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    • O investidor não pode ter outra política ativa no mesmo projeto
                  </p>
                  <p>
                    • A soma dos percentuais ativos do projeto não pode exceder 100%
                  </p>
                  <p>
                    • Políticas ativas são usadas para calcular distribuições automáticas
                  </p>
                  <p>
                    • Você pode desativar uma política sem excluí-la
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
                        Salvar Política
                      </>
                    )}
                  </Button>
                  <Link
                    href="/dashboard/investidores/politicas"
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
