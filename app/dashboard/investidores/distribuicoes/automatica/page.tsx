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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, ArrowLeft, Zap, AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/api/auth"
import { distributionsApi } from "@/lib/api/distributions"
import { distributionPoliciesApi } from "@/lib/api/distribution-policies"
import { projectsApi } from "@/lib/api/projects"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Project {
  id: string
  name: string
  code: string
}

interface PreviewItem {
  investorId: string
  investorName: string
  percentage: number
  amount: number
  netAmount: number
  irrf: number
}

export default function DistribuicaoAutomaticaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  
  const [formData, setFormData] = useState({
    projectId: "",
    baseAmount: "",
    competenceDate: "",
    distributionDate: "",
    description: "",
  })

  const [preview, setPreview] = useState<PreviewItem[]>([])
  const [totalPercentage, setTotalPercentage] = useState(0)

  useEffect(() => {
    loadSelectedCompany()
  }, [])

  useEffect(() => {
    if (selectedCompany) {
      loadProjects()
    }
  }, [selectedCompany])

  useEffect(() => {
    if (formData.projectId && formData.baseAmount) {
      loadPreview()
    } else {
      setPreview([])
      setTotalPercentage(0)
    }
  }, [formData.projectId, formData.baseAmount])

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

  const loadPreview = async () => {
    if (!selectedCompany?.id || !formData.projectId || !formData.baseAmount) return

    try {
      setLoadingPreview(true)

      const baseAmount = parseFloat(formData.baseAmount)
      if (isNaN(baseAmount) || baseAmount <= 0) {
        setPreview([])
        setTotalPercentage(0)
        return
      }

      const result = await distributionPoliciesApi.calculateAmounts(
        selectedCompany.id,
        formData.projectId,
        { baseValue: baseAmount }
      )

      setPreview(
        result.map(d => ({
          investorId: d.investorId,
          investorName: d.investorName,
          percentage: d.percentage,
          amount: d.amount,
          netAmount: distributionsApi.helpers.calculateNetAmount(
            d.amount,
            distributionsApi.helpers.calculateIRRF(d.amount),
            0
          ),
          irrf: distributionsApi.helpers.calculateIRRF(d.amount),
        }))
      )
      
      // Calcular soma dos percentuais
      const totalPerc = result.reduce((sum, d) => sum + d.percentage, 0)
      setTotalPercentage(totalPerc)
    } catch (error: any) {
      console.error("Erro ao carregar preview:", error)
      toast({
        title: "Erro ao calcular preview",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
      setPreview([])
      setTotalPercentage(0)
    } finally {
      setLoadingPreview(false)
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

    if (!formData.baseAmount || parseFloat(formData.baseAmount) <= 0) {
      toast({
        title: "Erro",
        description: "Informe um valor base válido",
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

    if (totalPercentage !== 100) {
      toast({
        title: "Erro",
        description: `A soma dos percentuais deve ser 100%. Atualmente: ${totalPercentage}%`,
        variant: "destructive",
      })
      return
    }

    if (preview.length === 0) {
      toast({
        title: "Erro",
        description: "Não há distribuições para criar",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      // Usar o endpoint bulk-create automático (baseado em políticas)
      const result = await distributionsApi.bulkCreateAutomatic(selectedCompany.id, {
        projectId: formData.projectId,
        baseValue: parseFloat(formData.baseAmount),
        competenceDate: formData.competenceDate,
        distributionDate: formData.distributionDate,
      })

      toast({
        title: "Sucesso",
        description: result.message || `${result.distributions.length} distribuição(ões) criada(s) com sucesso`,
      })

      router.push("/dashboard/investidores/distribuicoes")
    } catch (error: any) {
      console.error("Erro ao criar distribuições:", error)
      toast({
        title: "Erro ao criar distribuições",
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
              Distribuição Automática
            </h1>
            <p className="text-muted-foreground">
              Crie distribuições automaticamente baseadas nas políticas ativas
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Distribuição</CardTitle>
              <CardDescription>
                Selecione o projeto e informe o valor base para distribuição
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <p className="text-xs text-muted-foreground">
                  Apenas projetos com políticas ativas serão listados
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="baseAmount">
                    Valor Base <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="baseAmount"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.baseAmount}
                    onChange={e =>
                      setFormData({ ...formData, baseAmount: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Valor total a ser distribuído
                  </p>
                </div>

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
                <p className="text-xs text-muted-foreground">
                  Data em que a distribuição será realizada
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição (Opcional)</Label>
                <Input
                  id="description"
                  placeholder="Descrição adicional..."
                  value={formData.description}
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {formData.projectId && formData.baseAmount && (
            <Card>
              <CardHeader>
                <CardTitle>Preview das Distribuições</CardTitle>
                <CardDescription>
                  {preview.length} distribuição(ões) será(ão) criada(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPreview ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : preview.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">
                      Nenhuma política ativa encontrada
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Configure políticas de distribuição para este projeto
                    </p>
                  </div>
                ) : (
                  <>
                    {totalPercentage === 100 ? (
                      <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <p className="text-sm text-green-700">
                          A soma dos percentuais está correta (100%)
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <p className="text-sm text-yellow-700">
                          A soma dos percentuais é {totalPercentage}%. Deve ser 100%.
                        </p>
                      </div>
                    )}

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Investidor</TableHead>
                          <TableHead>Percentual</TableHead>
                          <TableHead>Valor Bruto</TableHead>
                          <TableHead>IRRF</TableHead>
                          <TableHead>Valor Líquido</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {preview.map(item => (
                          <TableRow key={item.investorId}>
                            <TableCell className="font-medium">
                              {item.investorName}
                            </TableCell>
                            <TableCell>
                              {distributionsApi.helpers.formatPercentage(
                                item.percentage
                              )}
                            </TableCell>
                            <TableCell>
                              {distributionsApi.helpers.formatCurrency(item.amount)}
                            </TableCell>
                            <TableCell>
                              {distributionsApi.helpers.formatCurrency(item.irrf)}
                            </TableCell>
                            <TableCell className="font-medium text-green-600">
                              {distributionsApi.helpers.formatCurrency(
                                item.netAmount
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell className="font-bold">TOTAL</TableCell>
                          <TableCell className="font-bold">
                            {totalPercentage}%
                          </TableCell>
                          <TableCell className="font-bold">
                            {distributionsApi.helpers.formatCurrency(
                              preview.reduce((sum, item) => sum + item.amount, 0)
                            )}
                          </TableCell>
                          <TableCell className="font-bold">
                            {distributionsApi.helpers.formatCurrency(
                              preview.reduce((sum, item) => sum + item.irrf, 0)
                            )}
                          </TableCell>
                          <TableCell className="font-bold text-green-600">
                            {distributionsApi.helpers.formatCurrency(
                              preview.reduce((sum, item) => sum + item.netAmount, 0)
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2">
            <Link href="/dashboard/investidores/distribuicoes">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading || totalPercentage !== 100 || preview.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Criar Distribuições
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
