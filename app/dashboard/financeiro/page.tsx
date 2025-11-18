"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, TrendingUp, TrendingDown, Calendar, ArrowUpRight, ArrowDownRight, CreditCard, Loader2 } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { financialReportsApi, type DashboardFinancialData, type CashFlowItem } from "@/lib/api/financial"
import { authApi } from "@/lib/api/auth"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function DashboardFinanceiro() {
  const [dashboardData, setDashboardData] = useState<DashboardFinancialData | null>(null)
  const [cashFlowData, setCashFlowData] = useState<CashFlowItem[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const selectedCompany = authApi.getSelectedCompany()

  useEffect(() => {
    if (selectedCompany?.id) {
      loadDashboardData()
    }
  }, [selectedCompany?.id])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      if (!selectedCompany?.id) {
        return
      }

      // Calcular período: últimos 30 dias e próximos 7 dias
      const today = new Date()
      const thirtyDaysAgo = new Date(today)
      thirtyDaysAgo.setDate(today.getDate() - 30)
      const sevenDaysAhead = new Date(today)
      sevenDaysAhead.setDate(today.getDate() + 7)

      const [dashboard, cashFlow] = await Promise.all([
        financialReportsApi.getDashboard({
          companyId: selectedCompany.id,
          startDate: thirtyDaysAgo.toISOString().split('T')[0],
          endDate: sevenDaysAhead.toISOString().split('T')[0],
        }),
        financialReportsApi.getCashFlow({
          companyId: selectedCompany.id,
          startDate: thirtyDaysAgo.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
        }),
      ])

      setDashboardData(dashboard)
      setCashFlowData(cashFlow)
    } catch (error: any) {
      console.error("Erro ao carregar dashboard:", error)
      toast({
        title: "Erro ao carregar dashboard",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const saldoTotal = dashboardData?.bankAccounts.totalBalance || 0
  
  const totalPagarPendente = dashboardData?.accountsPayable
    .filter(ap => ap.status === "PENDENTE")
    .reduce((acc, ap) => acc + (ap._sum.remainingAmount || 0), 0) || 0
  
  const totalReceberPendente = dashboardData?.accountsReceivable
    .filter(ar => ar.status === "PENDENTE")
    .reduce((acc, ar) => acc + (ar._sum.remainingAmount || 0), 0) || 0

  const countPagarPendente = dashboardData?.accountsPayable
    .filter(ap => ap.status === "PENDENTE")
    .reduce((acc, ap) => acc + (ap._count || 0), 0) || 0

  const countReceberPendente = dashboardData?.accountsReceivable
    .filter(ar => ar.status === "PENDENTE")
    .reduce((acc, ar) => acc + (ar._count || 0), 0) || 0

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Financeiro</h1>
        <p className="text-muted-foreground">Visão consolidada das finanças da empresa</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Carregando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">
                  {saldoTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Consolidado de {dashboardData?.bankAccounts.accounts.length || 0} contas
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Receber (Pendente)</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalReceberPendente.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
            <p className="text-xs text-muted-foreground">{countReceberPendente} títulos pendentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Pagar (Pendente)</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totalPagarPendente.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
            <p className="text-xs text-muted-foreground">{countPagarPendente} títulos pendentes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Saldo por Conta Bancária */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Saldo por Conta Bancária</CardTitle>
              <CardDescription>Saldo consolidado de todas as contas</CardDescription>
            </div>
            <Link href="/dashboard/financeiro/contas">
              <span className="text-sm text-primary hover:underline cursor-pointer">Ver todas</span>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : !dashboardData || dashboardData.bankAccounts.accounts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma conta bancária cadastrada</p>
                <Link href="/dashboard/financeiro/contas/nova">
                  <span className="text-sm text-primary hover:underline cursor-pointer mt-2 block">
                    Cadastrar primeira conta
                  </span>
                </Link>
              </div>
            ) : (
              dashboardData.bankAccounts.accounts.map((conta) => (
                <div key={conta.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{conta.accountName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {conta.currentBalance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Fluxo de Caixa 30 Dias */}
        <Card>
          <CardHeader>
            <CardTitle>Fluxo de Caixa (30 dias)</CardTitle>
            <CardDescription>Saldo diário consolidado</CardDescription>
          </CardHeader>
          <CardContent>
            {cashFlowData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Sem dados de fluxo de caixa
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={cashFlowData.map(item => ({
                  data: new Date(item.date).toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit' }),
                  saldo: item.saldo,
                }))}>
                  <defs>
                    <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="data" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  />
                  <Area
                    type="monotone"
                    dataKey="saldo"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorSaldo)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contas a Pagar/Receber - Resumo */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* A Receber */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-green-500" />
                  Contas a Receber
                </CardTitle>
                <CardDescription>Status consolidado</CardDescription>
              </div>
              <Link href="/dashboard/financeiro/contas-pagar-receber?tab=receber">
                <span className="text-sm text-primary hover:underline cursor-pointer">Ver todas</span>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardData?.accountsReceivable.map((status) => (
              <div key={status.status} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="font-medium text-foreground">
                    {status.status === "PENDENTE" ? "Pendentes" : 
                     status.status === "VENCIDO" ? "Vencidos" :
                     status.status === "PARCIAL" ? "Parcial" : "Outros"}
                  </p>
                  <p className="text-sm text-muted-foreground">{status._count} títulos</p>
                </div>
                <p className="font-semibold text-green-600">
                  {(status._sum.remainingAmount || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
              </div>
            ))}
            {(!dashboardData || dashboardData.accountsReceivable.length === 0) && (
              <div className="text-center py-4 text-muted-foreground">
                Nenhuma conta a receber
              </div>
            )}
          </CardContent>
        </Card>

        {/* A Pagar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ArrowDownRight className="h-5 w-5 text-red-500" />
                  Contas a Pagar
                </CardTitle>
                <CardDescription>Status consolidado</CardDescription>
              </div>
              <Link href="/dashboard/financeiro/contas-pagar-receber?tab=pagar">
                <span className="text-sm text-primary hover:underline cursor-pointer">Ver todas</span>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardData?.accountsPayable.map((status) => (
              <div key={status.status} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="font-medium text-foreground">
                    {status.status === "PENDENTE" ? "Pendentes" : 
                     status.status === "VENCIDO" ? "Vencidos" :
                     status.status === "PARCIAL" ? "Parcial" : "Outros"}
                  </p>
                  <p className="text-sm text-muted-foreground">{status._count} títulos</p>
                </div>
                <p className="font-semibold text-red-600">
                  {(status._sum.remainingAmount || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
              </div>
            ))}
            {(!dashboardData || dashboardData.accountsPayable.length === 0) && (
              <div className="text-center py-4 text-muted-foreground">
                Nenhuma conta a pagar
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </DashboardLayout>
  )
}
