"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Download,
  TrendingUp,
  BarChart3,
  DollarSign,
  Users,
  Package,
  FileSpreadsheet,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"

const reportCategories = [
  {
    title: "Relatórios Financeiros",
    description: "DRE, Balanço Patrimonial e Fluxo de Caixa",
    icon: TrendingUp,
    color: "bg-blue-500",
    reports: [
      {
        name: "DRE - Demonstração do Resultado do Exercício",
        description: "Receitas, custos e despesas (mensal, trimestral, anual)",
        href: "/dashboard/relatorios/dre",
      },
      {
        name: "Balanço Patrimonial",
        description: "Ativo, Passivo e Patrimônio Líquido",
        href: "/dashboard/relatorios/balanco",
      },
      {
        name: "DFC - Demonstração do Fluxo de Caixa",
        description: "Fluxo de caixa indireto básico",
        href: "/dashboard/relatorios/dfc",
      },
    ],
  },
  {
    title: "Relatórios Operacionais",
    description: "Custos, produção e indicadores",
    icon: BarChart3,
    color: "bg-green-500",
    reports: [
      {
        name: "Custos Operacionais",
        description: "R$/ton, R$/g, R$/cabeça, R$/arroba",
        href: "/dashboard/relatorios/custos-operacionais",
      },
      {
        name: "Custo de Pessoal",
        description: "Análise por centro de custo e departamento",
        href: "/dashboard/relatorios/custo-pessoal",
      },
    ],
  },
  {
    title: "Relatórios de Investidores",
    description: "Aportes e distribuições",
    icon: DollarSign,
    color: "bg-purple-500",
    reports: [
      {
        name: "Aportes & Distribuições",
        description: "Relatório detalhado por investidor",
        href: "/dashboard/relatorios/investidores",
      },
    ],
  },
  {
    title: "Relatórios para Auditoria",
    description: "Contas a pagar/receber e documentação",
    icon: FileText,
    color: "bg-orange-500",
    reports: [
      {
        name: "Contas a Pagar/Receber",
        description: "Relatório enxuto para auditoria",
        href: "/dashboard/relatorios/contas-pagar-receber",
      },
    ],
  },
  {
    title: "Exportações",
    description: "CSV, Excel e TXT para contador",
    icon: FileSpreadsheet,
    color: "bg-red-500",
    reports: [
      {
        name: "Exportações para Contador",
        description: "CSV/Excel de lançamentos e layouts personalizados",
        href: "/dashboard/relatorios/exportacoes",
      },
    ],
  },
]

const quickStats = [
  { label: "Relatórios Disponíveis", value: "8", icon: FileText },
  { label: "Gerados este Mês", value: "34", icon: Download },
  { label: "Formatos Suportados", value: "3", icon: FileSpreadsheet },
]

export default function RelatoriosPage() {
  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios & Exportações</h1>
          <p className="text-muted-foreground">
            Gere relatórios financeiros, operacionais e exportações para contabilidade
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Report Categories */}
        <div className="space-y-6">
          {reportCategories.map((category, index) => {
            const Icon = category.icon
            return (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-3 ${category.color}/10`}>
                      <Icon className={`h-6 w-6 ${category.color.replace("bg-", "text-")}`} />
                    </div>
                    <div>
                      <CardTitle>{category.title}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {category.reports.map((report, reportIndex) => (
                      <Link key={reportIndex} href={report.href}>
                        <Card className="h-full cursor-pointer transition-all hover:border-primary hover:shadow-md">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <h3 className="font-medium leading-tight">{report.name}</h3>
                                <p className="text-xs text-muted-foreground">
                                  {report.description}
                                </p>
                              </div>
                              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">Padrão de Relatórios</h3>
                <p className="text-sm text-muted-foreground">
                  Todos os relatórios incluem: cabeçalho com logo da empresa, nome e período;
                  rodapé com paginação e data de geração. Disponíveis em PDF e Excel.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
