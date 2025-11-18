"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, DollarSign, TrendingUp, FileText, Plus } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { employeesDashboardApi, type EmployeesDashboardData } from "@/lib/api/employees-dashboard"
import { useToast } from "@/hooks/use-toast"
import { Spinner } from "@/components/ui/spinner"

export default function RHDashboard() {
  const [data, setData] = useState<EmployeesDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true)
        const result = await employeesDashboardApi.getDashboard()
        console.log("Dashboard data:", result) // Debug: ver estrutura real
        setData(result)
      } catch (error: any) {
        console.error("Erro ao carregar dashboard:", error)
        toast({
          title: "Erro ao carregar dashboard",
          description: error.response?.data?.message || "Ocorreu um erro ao carregar os dados.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [toast])

  if (loading) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex h-[50vh] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </DashboardLayout>
    )
  }

  if (!data) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex h-[50vh] items-center justify-center">
          <p className="text-muted-foreground">Não foi possível carregar os dados do dashboard.</p>
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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">RH - Pessoas & Folha</h1>
            <p className="text-muted-foreground">Gestão de colaboradores e folha de pagamento</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/rh/colaboradores/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Colaborador
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Colaboradores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{data.employees?.total || 0}</div>
              <p className="text-xs text-muted-foreground">{data.employees?.active || 0} ativos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Folha Mensal</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {parseFloat(data.payroll?.monthlyTotal || "0").toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
              <p className="text-xs text-muted-foreground">Soma de salários</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custo Total (+ Encargos)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {parseFloat(data.payroll?.totalCost || "0").toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Encargos:{" "}
                {parseFloat(data.charges?.total || "0").toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Encargos Estimados</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {parseFloat(data.charges?.total || "0").toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
              <p className="text-xs text-muted-foreground">{data.charges?.percentage || "0"}% sobre folha</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Button asChild variant="outline" className="h-auto flex-col gap-2 py-6 bg-transparent">
            <Link href="/dashboard/rh/colaboradores">
              <Users className="h-6 w-6" />
              <div className="text-center">
                <p className="font-semibold">Colaboradores</p>
                <p className="text-xs text-muted-foreground">Gerenciar cadastros</p>
              </div>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto flex-col gap-2 py-6 bg-transparent">
            <Link href="/dashboard/rh/proventos-descontos">
              <DollarSign className="h-6 w-6" />
              <div className="text-center">
                <p className="font-semibold">Proventos & Descontos</p>
                <p className="text-xs text-muted-foreground">Configurar padrões</p>
              </div>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto flex-col gap-2 py-6 bg-transparent">
            <Link href="/dashboard/rh/folha">
              <FileText className="h-6 w-6" />
              <div className="text-center">
                <p className="font-semibold">Folha de Pagamento</p>
                <p className="text-xs text-muted-foreground">Calcular e exportar</p>
              </div>
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Colaboradores Recentes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Admissões Recentes</CardTitle>
                  <CardDescription>Últimos colaboradores cadastrados</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/rh/colaboradores">Ver Todos</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.recentHires && data.recentHires.length > 0 ? (
                  data.recentHires.map((hire) => (
                    <div
                      key={hire.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div>
                        <p className="font-medium text-foreground">{hire.name}</p>
                        <p className="text-sm text-muted-foreground">{hire.position}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {hire.department || "Sem departamento"}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {hire.contractType}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {hire.daysInCompany} dias na empresa
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          {parseFloat(hire.salary).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(hire.admissionDate).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma admissão recente nos últimos 90 dias
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resumo por Centro de Custo */}
          <Card>
            <CardHeader>
              <CardTitle>Custo por Centro de Custo</CardTitle>
              <CardDescription>Distribuição da folha por área</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.byCostCenter && data.byCostCenter.length > 0 ? (
                  data.byCostCenter.map((center) => (
                    <div
                      key={center.costCenterId}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          <span className="font-mono text-sm">{center.code}</span> - {center.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{center.employeesCount} colaboradores</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          {parseFloat(center.totalCost).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">{center.percentageOfTotal}% do total</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum centro de custo com colaboradores
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base">Folha de Pagamento Gerencial</CardTitle>
                <CardDescription className="mt-2">
                  Este módulo calcula estimativas de encargos (INSS, FGTS, IRRF) com alíquotas paramétricas e
                  gera exportações para o contador. Não substitui o eSocial - mantém foco em visão gerencial.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </DashboardLayout>
  )
}
