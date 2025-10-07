"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, DollarSign, TrendingUp, FileText, Plus } from "lucide-react"
import Link from "next/link"

// Dados mockados
const stats = {
  totalColaboradores: 45,
  colaboradoresAtivos: 42,
  folhaMensal: 185000,
  custoTotal: 245000, // com encargos
}

const colaboradoresRecentes = [
  {
    id: 1,
    nome: "João Silva",
    cargo: "Desenvolvedor Sênior",
    admissao: "2025-01-15",
    salario: 8500,
    centroCusto: "TI",
  },
  {
    id: 2,
    nome: "Maria Santos",
    cargo: "Gerente de Vendas",
    admissao: "2024-11-20",
    salario: 12000,
    centroCusto: "Vendas",
  },
  {
    id: 3,
    nome: "Pedro Costa",
    cargo: "Analista Financeiro",
    admissao: "2025-02-01",
    salario: 6500,
    centroCusto: "Financeiro",
  },
]

const resumoPorCentroCusto = [
  { centro: "TI", colaboradores: 12, custoTotal: 95000 },
  { centro: "Vendas", colaboradores: 15, custoTotal: 78000 },
  { centro: "Financeiro", colaboradores: 8, custoTotal: 42000 },
  { centro: "Administrativo", colaboradores: 10, custoTotal: 30000 },
]

export default function RHDashboard() {
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
              <div className="text-2xl font-bold text-foreground">{stats.totalColaboradores}</div>
              <p className="text-xs text-muted-foreground">{stats.colaboradoresAtivos} ativos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Folha Mensal</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.folhaMensal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
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
                {stats.custoTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
              <p className="text-xs text-muted-foreground">INSS + FGTS + IRRF</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Encargos Estimados</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {(stats.custoTotal - stats.folhaMensal).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                {(((stats.custoTotal - stats.folhaMensal) / stats.folhaMensal) * 100).toFixed(1)}% sobre folha
              </p>
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
                {colaboradoresRecentes.map((colab) => (
                  <div
                    key={colab.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="font-medium text-foreground">{colab.nome}</p>
                      <p className="text-sm text-muted-foreground">{colab.cargo}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {colab.centroCusto}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Admissão: {new Date(colab.admissao).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {colab.salario.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                    </div>
                  </div>
                ))}
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
                {resumoPorCentroCusto.map((centro) => (
                  <div
                    key={centro.centro}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="font-medium text-foreground">{centro.centro}</p>
                      <p className="text-sm text-muted-foreground">{centro.colaboradores} colaboradores</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {centro.custoTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {((centro.custoTotal / stats.custoTotal) * 100).toFixed(1)}% do total
                      </p>
                    </div>
                  </div>
                ))}
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
