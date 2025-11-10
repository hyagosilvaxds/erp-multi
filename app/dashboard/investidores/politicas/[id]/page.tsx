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
  Briefcase,
  User,
  Calendar,
  Percent,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/api/auth"
import {
  distributionPoliciesApi,
  type DistributionPolicyDetails,
} from "@/lib/api/distribution-policies"
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

export default function DetalhesPoliticaPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [policy, setPolicy] = useState<DistributionPolicyDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

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

  const handleDelete = async () => {
    if (!selectedCompany?.id || !params.id) return

    try {
      setDeleting(true)
      await distributionPoliciesApi.delete(
        selectedCompany.id,
        params.id as string
      )

      toast({
        title: "Sucesso",
        description: "Política excluída com sucesso",
      })

      router.push("/dashboard/investidores/politicas")
    } catch (error: any) {
      console.error("Erro ao excluir política:", error)
      toast({
        title: "Erro ao excluir política",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const getStatusIcon = (active: boolean) => {
    return active ? (
      <CheckCircle2 className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-gray-400" />
    )
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard/investidores/politicas">
              <Button variant="ghost" className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Detalhes da Política
              </h1>
              {getStatusIcon(policy.active)}
            </div>
            <p className="text-muted-foreground">
              Informações completas da política de distribuição
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/investidores/politicas/${params.id}/editar`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={deleting}>
                  {deleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir esta política de distribuição?
                    Esta ação não pode ser desfeita.
                    <br />
                    <br />
                    <strong>Recomendação:</strong> Considere desativar a política ao
                    invés de excluí-la para manter o histórico.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Percentual</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {distributionPoliciesApi.helpers.formatPercentage(policy.percentage)}
              </div>
              <p className="text-xs text-muted-foreground">
                Do valor a distribuir
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              {getStatusIcon(policy.active)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {distributionPoliciesApi.helpers.getActiveLabel(policy.active)}
              </div>
              <p className="text-xs text-muted-foreground">
                {policy.active ? "Usada em cálculos" : "Não usada"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tipo</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {distributionPoliciesApi.helpers.getTypeLabel(policy.type)}
              </div>
              <p className="text-xs text-muted-foreground">
                Método de cálculo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Início</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {distributionPoliciesApi.helpers.formatDate(policy.startDate)}
              </div>
              <p className="text-xs text-muted-foreground">
                Início da vigência
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Informações do Projeto */}
        {policy.project && (
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
                  <p className="font-medium">{policy.project.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Código</p>
                  <Badge variant="outline">{policy.project.code}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informações do Investidor */}
        {policy.investor && (
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
                    {distributionPoliciesApi.helpers.getInvestorName(policy.investor)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <Badge variant="outline">
                    {policy.investor.type === "PESSOA_FISICA"
                      ? "Pessoa Física"
                      : "Pessoa Jurídica"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Documento</p>
                  <p className="font-medium">
                    {policy.investor.type === "PESSOA_FISICA"
                      ? policy.investor.cpf
                      : policy.investor.cnpj}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detalhes da Política */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes da Política</CardTitle>
            <CardDescription>
              Configurações e datas de vigência
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Percentual</p>
                <p className="text-xl font-bold">
                  {distributionPoliciesApi.helpers.formatPercentage(policy.percentage)}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Tipo de Distribuição</p>
                <p className="text-xl font-bold">
                  {distributionPoliciesApi.helpers.getTypeLabel(policy.type)}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Data de Início</p>
                <p className="font-medium">
                  {distributionPoliciesApi.helpers.formatDate(policy.startDate)}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Data de Término</p>
                <p className="font-medium">
                  {policy.endDate
                    ? distributionPoliciesApi.helpers.formatDate(policy.endDate)
                    : "Sem data de término"}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="flex items-center gap-2 mt-1">
                {getStatusIcon(policy.active)}
                <Badge variant={policy.active ? "default" : "secondary"}>
                  {distributionPoliciesApi.helpers.getActiveLabel(policy.active)}
                </Badge>
              </div>
            </div>

            {policy.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Observações</p>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{policy.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Informações do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
            <CardDescription>
              Dados de criação e atualização
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Criado em</p>
              <p className="font-medium">
                {new Date(policy.createdAt).toLocaleString("pt-BR")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Última atualização</p>
              <p className="font-medium">
                {new Date(policy.updatedAt).toLocaleString("pt-BR")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ID da Política</p>
              <p className="font-mono text-xs">{policy.id}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
