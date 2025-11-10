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
import { Loader2, ArrowLeft, Save, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/api/auth"
import { distributionsApi } from "@/lib/api/distributions"
import { projectsApi } from "@/lib/api/projects"
import { investorsApi } from "@/lib/api/investors"
import { distributionPoliciesApi, DistributionPolicy } from "@/lib/api/distribution-policies"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Info } from "lucide-react"

interface Project {
  id: string
  name: string
  code: string
}

interface Investor {
  id: string
  name?: string
  companyName?: string
  type: "PESSOA_FISICA" | "PESSOA_JURIDICA"
}

interface InvestorPolicy {
  id: string
  percentage: number
  active: boolean
  startDate: string
  endDate?: string
}

export default function NovaDistribuicaoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [loadingInvestors, setLoadingInvestors] = useState(true)
  const [loadingPolicy, setLoadingPolicy] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [investors, setInvestors] = useState<Investor[]>([])
  const [investorPolicy, setInvestorPolicy] = useState<InvestorPolicy | null>(null)
  
  const [formData, setFormData] = useState({
    projectId: "",
    investorId: "",
    amount: "",
    percentage: "",
    competenceDate: "",
    distributionDate: "",
    description: "",
    irrf: "",
    otherDeductions: "",
  })

  // Cálculos automáticos
  const amount = parseFloat(formData.amount) || 0
  const irrf = parseFloat(formData.irrf) || distributionsApi.helpers.calculateIRRF(amount)
  const otherDeductions = parseFloat(formData.otherDeductions) || 0
  const netAmount = distributionsApi.helpers.calculateNetAmount(amount, irrf, otherDeductions)

  useEffect(() => {
    loadSelectedCompany()
  }, [])

  useEffect(() => {
    if (selectedCompany) {
      loadProjects()
      loadInvestors()
    }
  }, [selectedCompany])

  useEffect(() => {
    if (formData.projectId && formData.investorId && selectedCompany?.id) {
      loadInvestorPolicy()
    } else {
      setInvestorPolicy(null)
    }
  }, [formData.projectId, formData.investorId, selectedCompany])

  // Auto-calcular IRRF quando amount mudar
  useEffect(() => {
    if (formData.amount && !formData.irrf) {
      const calculatedIrrf = distributionsApi.helpers.calculateIRRF(
        parseFloat(formData.amount)
      )
      setFormData(prev => ({
        ...prev,
        irrf: calculatedIrrf.toFixed(2),
      }))
    }
  }, [formData.amount])

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
      const result = await projectsApi.getAll(selectedCompany.id, {
        page: 1,
        limit: 100,
        active: true
      })
      setProjects(result.data.map(p => ({
        id: p.id,
        name: p.name,
        code: p.code
      })))
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
      const result = await investorsApi.getAll(selectedCompany.id, {
        page: 1,
        limit: 100,
        active: true
      })
      setInvestors(result.data.map(inv => ({
        id: inv.id,
        name: inv.fullName || undefined,
        companyName: inv.companyName || undefined,
        type: inv.type
      })))
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

  const loadInvestorPolicy = async () => {
    if (!selectedCompany?.id || !formData.projectId || !formData.investorId) return

    try {
      setLoadingPolicy(true)
      const policies = await distributionPoliciesApi.getByProject(
        selectedCompany.id,
        formData.projectId
      )
      
      const investorPolicies = policies.policies.filter(
        p => p.investor.id === formData.investorId && p.active
      )
      
      if (investorPolicies.length > 0) {
        const policy = investorPolicies[0]
        setInvestorPolicy({
          id: policy.id,
          percentage: policy.percentage,
          active: policy.active,
          startDate: new Date().toISOString(),
          endDate: undefined
        })
        
        // Auto-preencher percentual se estiver vazio
        if (!formData.percentage) {
          setFormData(prev => ({
            ...prev,
            percentage: policy.percentage.toString()
          }))
        }
      } else {
        setInvestorPolicy(null)
      }
    } catch (error: any) {
      console.error("Erro ao carregar política do investidor:", error)
      setInvestorPolicy(null)
    } finally {
      setLoadingPolicy(false)
    }
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

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: "Erro",
        description: "Informe um valor válido",
        variant: "destructive",
      })
      return
    }

    if (!formData.percentage || parseFloat(formData.percentage) <= 0 || parseFloat(formData.percentage) > 100) {
      toast({
        title: "Erro",
        description: "Informe um percentual entre 0 e 100",
        variant: "destructive",
      })
      return
    }

    if (!formData.competenceDate) {
      toast({
        title: "Erro",
        description: "Informe a competência",
        variant: "destructive",
      })
      return
    }

    if (!formData.distributionDate) {
      toast({
        title: "Erro",
        description: "Informe a data de distribuição",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      await distributionsApi.create(selectedCompany.id, {
        projectId: formData.projectId,
        investorId: formData.investorId,
        amount: parseFloat(formData.amount),
        percentage: parseFloat(formData.percentage),
        baseValue: parseFloat(formData.amount), // baseValue = amount para distribuição manual
        competenceDate: formData.competenceDate,
        distributionDate: formData.distributionDate,
        status: "PENDENTE",
        notes: formData.description || undefined,
        irrf: parseFloat(formData.irrf || "0"),
        otherDeductions: parseFloat(formData.otherDeductions || "0"),
      })

      toast({
        title: "Sucesso",
        description: "Distribuição cadastrada com sucesso",
      })

      router.push("/dashboard/investidores/distribuicoes")
    } catch (error: any) {
      console.error("Erro ao criar distribuição:", error)
      toast({
        title: "Erro ao criar distribuição",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard/investidores/distribuicoes">
              <Button variant="ghost" className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Nova Distribuição
            </h1>
            <p className="text-muted-foreground">
              Cadastre uma nova distribuição manual
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Selecione o projeto e investidor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="projectId">
                    Projeto <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.projectId}
                    onValueChange={value =>
                      setFormData({ ...formData, projectId: value })
                    }
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
                    onValueChange={value =>
                      setFormData({ ...formData, investorId: value })
                    }
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
                            {investor.name || investor.companyName} -{" "}
                            {investor.type === "PESSOA_FISICA"
                              ? "PF"
                              : "PJ"}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações da Política de Distribuição */}
          {investorPolicy && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium mb-2">Política de Distribuição Ativa</p>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-muted-foreground">Percentual configurado:</span>{" "}
                        <span className="font-semibold">
                          {distributionPoliciesApi.helpers.formatPercentage(investorPolicy.percentage)}
                        </span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Status:</span>{" "}
                        <Badge variant="default" className="ml-1">Ativa</Badge>
                      </p>
                    </div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </AlertDescription>
            </Alert>
          )}

          {loadingPolicy && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Carregando política de distribuição...
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Valores</CardTitle>
              <CardDescription>
                Informe os valores da distribuição
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    Valor Bruto <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.amount}
                    onChange={e =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                </div>

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
                    placeholder="0,00"
                    value={formData.percentage}
                    onChange={e =>
                      setFormData({ ...formData, percentage: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="irrf">IRRF (5%)</Label>
                  <Input
                    id="irrf"
                    type="number"
                    step="0.01"
                    placeholder="Calculado automaticamente"
                    value={formData.irrf}
                    onChange={e =>
                      setFormData({ ...formData, irrf: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Deixe em branco para calcular automaticamente (5%)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otherDeductions">Outras Deduções</Label>
                  <Input
                    id="otherDeductions"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.otherDeductions}
                    onChange={e =>
                      setFormData({ ...formData, otherDeductions: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Preview do valor líquido */}
              <div className="p-4 bg-muted rounded-md">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Valor Líquido:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {distributionsApi.helpers.formatCurrency(netAmount)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Valor Bruto - IRRF - Outras Deduções
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Datas</CardTitle>
              <CardDescription>
                Informe as datas da distribuição
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="competenceDate">
                    Competência <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="competenceDate"
                    type="month"
                    value={formData.competenceDate}
                    onChange={e =>
                      setFormData({ ...formData, competenceDate: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Mês/ano de referência
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="distributionDate">
                    Data de Distribuição <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="distributionDate"
                    type="date"
                    value={formData.distributionDate}
                    onChange={e =>
                      setFormData({ ...formData, distributionDate: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações Adicionais</CardTitle>
              <CardDescription>
                Descrição e observações (opcional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descrição adicional da distribuição..."
                  value={formData.description}
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Link href="/dashboard/investidores/distribuicoes">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Distribuição
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
