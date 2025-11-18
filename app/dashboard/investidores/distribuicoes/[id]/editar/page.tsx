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
import { Loader2, ArrowLeft, Save, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/api/auth"
import { distributionsApi, type DistributionDetails } from "@/lib/api/distributions"

export default function EditarDistribuicaoPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [distribution, setDistribution] = useState<DistributionDetails | null>(null)
  
  const [formData, setFormData] = useState({
    amount: "",
    irrf: "",
    otherDeductions: "",
    notes: "",
  })

  // Cálculos automáticos
  const amount = parseFloat(formData.amount) || 0
  const irrf = parseFloat(formData.irrf) || 0
  const otherDeductions = parseFloat(formData.otherDeductions) || 0
  const netAmount = distributionsApi.helpers.calculateNetAmount(amount, irrf, otherDeductions)

  useEffect(() => {
    loadSelectedCompany()
  }, [])

  useEffect(() => {
    if (selectedCompany && params.id) {
      loadDistribution()
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

  const loadDistribution = async () => {
    if (!selectedCompany?.id || !params.id) return

    try {
      setLoading(true)
      const data = await distributionsApi.getById(
        selectedCompany.id,
        params.id as string
      )
      setDistribution(data)
      
      // Preencher formulário
      setFormData({
        amount: data.amount.toString(),
        irrf: data.irrf.toString(),
        otherDeductions: data.otherDeductions.toString(),
        notes: data.notes || "",
      })
    } catch (error: any) {
      console.error("Erro ao carregar distribuição:", error)
      toast({
        title: "Erro ao carregar distribuição",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCompany?.id || !params.id) return

    // Validações
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: "Erro",
        description: "Informe um valor válido",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)

      await distributionsApi.update(selectedCompany.id, params.id as string, {
        amount: parseFloat(formData.amount),
        irrf: parseFloat(formData.irrf || "0"),
        otherDeductions: parseFloat(formData.otherDeductions || "0"),
        notes: formData.notes || undefined,
      })

      toast({
        title: "Sucesso",
        description: "Distribuição atualizada com sucesso",
      })

      router.push(`/dashboard/investidores/distribuicoes/${params.id}`)
    } catch (error: any) {
      console.error("Erro ao atualizar distribuição:", error)
      toast({
        title: "Erro ao atualizar distribuição",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
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

  if (!distribution) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Distribuição não encontrada</h3>
            <Link href="/dashboard/investidores/distribuicoes">
              <Button className="mt-4">Voltar para listagem</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (distribution.status !== "PENDENTE") {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">
              Não é possível editar esta distribuição
            </h3>
            <p className="text-sm text-muted-foreground">
              Apenas distribuições pendentes podem ser editadas
            </p>
            <Link href={`/dashboard/investidores/distribuicoes/${params.id}`}>
              <Button className="mt-4">Voltar para detalhes</Button>
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
            <Link href={`/dashboard/investidores/distribuicoes/${params.id}`}>
              <Button variant="ghost" className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Editar Distribuição
            </h1>
            <p className="text-muted-foreground">
              Atualize os valores da distribuição
            </p>
          </div>
        </div>

        {/* Info do Projeto e Investidor (não editável) */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Projeto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{distribution.project.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Código</p>
                  <p className="font-medium">{distribution.project.code}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Investidor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">
                    {distributionsApi.helpers.getInvestorName(distribution.investor)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Documento</p>
                  <p className="font-medium">
                    {distributionsApi.helpers.getInvestorDocument(
                      distribution.investor
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Valores</CardTitle>
              <CardDescription>
                Atualize os valores da distribuição
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="irrf">IRRF</Label>
                  <Input
                    id="irrf"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.irrf}
                    onChange={e =>
                      setFormData({ ...formData, irrf: e.target.value })
                    }
                  />
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
                      setFormData({
                        ...formData,
                        otherDeductions: e.target.value,
                      })
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
              <CardTitle>Observações</CardTitle>
              <CardDescription>
                Adicione ou atualize observações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Observações adicionais..."
                  value={formData.notes}
                  onChange={e =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Link href={`/dashboard/investidores/distribuicoes/${params.id}`}>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={saving}>
              {saving ? (
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
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
