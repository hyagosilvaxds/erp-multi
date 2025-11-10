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
import {
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  DollarSign,
  Calendar,
  User,
  Briefcase,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/api/auth"
import { distributionsApi, type DistributionDetails } from "@/lib/api/distributions"

export default function DistribuicaoDetalhesPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [distribution, setDistribution] = useState<DistributionDetails | null>(null)

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

  const handleMarkAsPaid = async () => {
    if (!selectedCompany?.id || !params.id || !distribution) return

    if (!confirm("Tem certeza que deseja marcar esta distribuição como PAGA?")) return

    try {
      setActionLoading(true)
      await distributionsApi.markAsPaid(selectedCompany.id, params.id as string)

      toast({
        title: "Sucesso",
        description: "Distribuição marcada como PAGA",
      })

      loadDistribution()
    } catch (error: any) {
      console.error("Erro ao marcar como paga:", error)
      toast({
        title: "Erro",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleMarkAsCanceled = async () => {
    if (!selectedCompany?.id || !params.id || !distribution) return

    if (!confirm("Tem certeza que deseja CANCELAR esta distribuição?")) return

    try {
      setActionLoading(true)
      await distributionsApi.markAsCanceled(selectedCompany.id, params.id as string)

      toast({
        title: "Sucesso",
        description: "Distribuição cancelada",
      })

      loadDistribution()
    } catch (error: any) {
      console.error("Erro ao cancelar:", error)
      toast({
        title: "Erro",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedCompany?.id || !params.id) return

    if (!confirm("Tem certeza que deseja EXCLUIR esta distribuição? Esta ação não pode ser desfeita.")) return

    try {
      setActionLoading(true)
      await distributionsApi.delete(selectedCompany.id, params.id as string)

      toast({
        title: "Sucesso",
        description: "Distribuição excluída com sucesso",
      })

      router.push("/dashboard/investidores/distribuicoes")
    } catch (error: any) {
      console.error("Erro ao excluir:", error)
      toast({
        title: "Erro",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
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

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard/investidores/distribuicoes">
              <Button variant="ghost" className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Detalhes da Distribuição
            </h1>
            <p className="text-muted-foreground">
              Visualize todos os detalhes desta distribuição
            </p>
          </div>
          <div className="flex gap-2">
            {distribution.status === "PENDENTE" && (
              <>
                <Button
                  variant="outline"
                  onClick={handleMarkAsPaid}
                  disabled={actionLoading}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Marcar como Pago
                </Button>
                <Link href={`/dashboard/investidores/distribuicoes/${params.id}/editar`}>
                  <Button variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                </Link>
              </>
            )}
            {distribution.status !== "CANCELADO" && (
              <Button
                variant="outline"
                onClick={handleMarkAsCanceled}
                disabled={actionLoading}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={actionLoading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </div>
        </div>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Status da Distribuição</CardTitle>
              <Badge
                variant={
                  distribution.status === "PAGO"
                    ? "default"
                    : distribution.status === "CANCELADO"
                    ? "destructive"
                    : "secondary"
                }
              >
                {distributionsApi.helpers.getStatusLabel(distribution.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Valor Bruto</p>
                <p className="text-2xl font-bold">
                  {distributionsApi.helpers.formatCurrency(distribution.amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">IRRF + Deduções</p>
                <p className="text-2xl font-bold text-red-600">
                  -{distributionsApi.helpers.formatCurrency(
                    distribution.irrf + distribution.otherDeductions
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Líquido</p>
                <p className="text-2xl font-bold text-green-600">
                  {distributionsApi.helpers.formatCurrency(distribution.netAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Projeto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="mr-2 h-5 w-5" />
                Projeto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{distribution.project.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Código</p>
                <p className="font-medium">{distribution.project.code}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium capitalize">{distribution.project.status}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="font-medium">
                  {distributionsApi.helpers.formatCurrency(
                    distribution.project.totalValue
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Investidor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Investidor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">
                  {distributionsApi.helpers.getInvestorName(distribution.investor)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipo</p>
                <p className="font-medium">
                  {distribution.investor.type === "PESSOA_FISICA"
                    ? "Pessoa Física"
                    : "Pessoa Jurídica"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Documento</p>
                <p className="font-medium">
                  {distributionsApi.helpers.getInvestorDocument(distribution.investor)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">E-mail</p>
                <p className="font-medium">{distribution.investor.email}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Valores Detalhados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              Detalhamento de Valores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor Base:</span>
                  <span className="font-medium">
                    {distributionsApi.helpers.formatCurrency(distribution.baseValue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Percentual:</span>
                  <span className="font-medium">
                    {distributionsApi.helpers.formatPercentage(distribution.percentage)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor Bruto:</span>
                  <span className="font-medium">
                    {distributionsApi.helpers.formatCurrency(distribution.amount)}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IRRF:</span>
                  <span className="font-medium text-red-600">
                    -{distributionsApi.helpers.formatCurrency(distribution.irrf)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Outras Deduções:</span>
                  <span className="font-medium text-red-600">
                    -{distributionsApi.helpers.formatCurrency(
                      distribution.otherDeductions
                    )}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t">
                  <span className="font-medium">Valor Líquido:</span>
                  <span className="font-bold text-green-600 text-lg">
                    {distributionsApi.helpers.formatCurrency(distribution.netAmount)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Datas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Datas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Competência</p>
                <p className="font-medium">
                  {distributionsApi.helpers.formatCompetence(
                    distribution.competenceDate
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data de Distribuição</p>
                <p className="font-medium">
                  {distributionsApi.helpers.formatDate(distribution.distributionDate)}
                </p>
              </div>
              {distribution.paymentDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Data de Pagamento</p>
                  <p className="font-medium">
                    {distributionsApi.helpers.formatDateTime(
                      distribution.paymentDate
                    )}
                  </p>
                </div>
              )}
              {distribution.paidAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Pago em</p>
                  <p className="font-medium">
                    {distributionsApi.helpers.formatDateTime(distribution.paidAt)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Criado em</p>
                <p className="font-medium">
                  {distributionsApi.helpers.formatDateTime(distribution.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Atualizado em</p>
                <p className="font-medium">
                  {distributionsApi.helpers.formatDateTime(distribution.updatedAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Observações */}
        {distribution.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {distribution.notes}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
