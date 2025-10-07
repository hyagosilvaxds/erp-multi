"use client"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, TrendingUp, TrendingDown, Calendar, ArrowUpRight, ArrowDownRight, CreditCard } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

// Dados mockados
const contasBancarias = [
  { id: 1, banco: "Banco do Brasil", agencia: "1234-5", conta: "12345-6", saldo: 125430.5 },
  { id: 2, banco: "Itaú", agencia: "5678-9", conta: "98765-4", saldo: 87650.25 },
  { id: 3, banco: "Santander", agencia: "9012-3", conta: "54321-0", saldo: 43210.75 },
]

const contasSemana = {
  pagar: [
    { id: 1, descricao: "Fornecedor ABC Ltda", valor: 15000, vencimento: "2025-04-07", status: "pendente" },
    { id: 2, descricao: "Aluguel Escritório", valor: 8500, vencimento: "2025-04-08", status: "pendente" },
    { id: 3, descricao: "Energia Elétrica", valor: 3200, vencimento: "2025-04-09", status: "pendente" },
  ],
  receber: [
    { id: 1, descricao: "Cliente XYZ S.A.", valor: 25000, vencimento: "2025-04-07", status: "pendente" },
    { id: 2, descricao: "Cliente DEF Ltda", valor: 18500, vencimento: "2025-04-08", status: "pendente" },
    { id: 3, descricao: "Cliente GHI Corp", valor: 12300, vencimento: "2025-04-10", status: "pendente" },
  ],
}

const fluxoCaixa30Dias = [
  { data: "01/04", entradas: 45000, saidas: 32000, saldo: 13000 },
  { data: "05/04", entradas: 52000, saidas: 38000, saldo: 14000 },
  { data: "10/04", entradas: 48000, saidas: 35000, saldo: 13000 },
  { data: "15/04", entradas: 55000, saidas: 40000, saldo: 15000 },
  { data: "20/04", entradas: 60000, saidas: 42000, saldo: 18000 },
  { data: "25/04", entradas: 58000, saidas: 39000, saldo: 19000 },
  { data: "30/04", entradas: 62000, saidas: 41000, saldo: 21000 },
]

export default function DashboardFinanceiro() {
  const saldoTotal = contasBancarias.reduce((acc, conta) => acc + conta.saldo, 0)
  const totalPagar = contasSemana.pagar.reduce((acc, conta) => acc + conta.valor, 0)
  const totalReceber = contasSemana.receber.reduce((acc, conta) => acc + conta.valor, 0)

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
            <div className="text-2xl font-bold text-foreground">
              {saldoTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
            <p className="text-xs text-muted-foreground">Consolidado de {contasBancarias.length} contas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Receber (Semana)</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalReceber.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
            <p className="text-xs text-muted-foreground">{contasSemana.receber.length} títulos pendentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Pagar (Semana)</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totalPagar.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
            <p className="text-xs text-muted-foreground">{contasSemana.pagar.length} títulos pendentes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Saldo por Conta Bancária */}
        <Card>
          <CardHeader>
            <CardTitle>Saldo por Conta Bancária</CardTitle>
            <CardDescription>Saldo consolidado de todas as contas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {contasBancarias.map((conta) => (
              <div key={conta.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{conta.banco}</p>
                    <p className="text-sm text-muted-foreground">
                      Ag: {conta.agencia} | Cc: {conta.conta}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {conta.saldo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Fluxo de Caixa 30 Dias */}
        <Card>
          <CardHeader>
            <CardTitle>Fluxo de Caixa (30 dias)</CardTitle>
            <CardDescription>Entradas, saídas e saldo projetado</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={fluxoCaixa30Dias}>
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
          </CardContent>
        </Card>
      </div>

      {/* Contas a Pagar/Receber da Semana */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* A Receber */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-green-500" />
              Contas a Receber (Semana)
            </CardTitle>
            <CardDescription>Títulos com vencimento nos próximos 7 dias</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {contasSemana.receber.map((conta) => (
              <div key={conta.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{conta.descricao}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(conta.vencimento).toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    {conta.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    Pendente
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* A Pagar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownRight className="h-5 w-5 text-red-500" />
              Contas a Pagar (Semana)
            </CardTitle>
            <CardDescription>Títulos com vencimento nos próximos 7 dias</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {contasSemana.pagar.map((conta) => (
              <div key={conta.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{conta.descricao}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(conta.vencimento).toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">
                    {conta.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    Pendente
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      </div>
    </DashboardLayout>
  )
}
