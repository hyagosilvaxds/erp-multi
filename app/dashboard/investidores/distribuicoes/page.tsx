"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Download, FileText, Calendar, DollarSign, TrendingUp } from "lucide-react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Dados mockados
const distribuicoes = [
  {
    id: 1,
    periodo: "Q1 2025",
    data: "2025-03-31",
    projeto: "Projeto Alpha",
    valorTotal: 150000,
    investidores: 3,
    status: "pago",
  },
  {
    id: 2,
    periodo: "Fevereiro/2025",
    data: "2025-02-28",
    projeto: "Projeto Beta",
    valorTotal: 85000,
    investidores: 2,
    status: "pago",
  },
  {
    id: 3,
    periodo: "Janeiro/2025",
    data: "2025-01-31",
    projeto: "Projeto Beta",
    valorTotal: 92000,
    investidores: 2,
    status: "pago",
  },
  {
    id: 4,
    periodo: "Março/2025",
    data: "2025-03-31",
    projeto: "Projeto Beta",
    valorTotal: 98000,
    investidores: 2,
    status: "processando",
  },
  {
    id: 5,
    periodo: "Q1 2025",
    data: "2025-03-31",
    projeto: "Projeto Gamma",
    valorTotal: 45000,
    investidores: 1,
    status: "pendente",
  },
]

const stats = [
  {
    title: "Total Distribuído (2025)",
    value: distribuicoes
      .filter(d => d.status === "pago")
      .reduce((acc, dist) => acc + dist.valorTotal, 0)
      .toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
    icon: DollarSign,
    description: `${distribuicoes.filter(d => d.status === "pago").length} distribuições pagas`,
  },
  {
    title: "Em Processamento",
    value: distribuicoes
      .filter(d => d.status === "processando")
      .reduce((acc, dist) => acc + dist.valorTotal, 0)
      .toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
    icon: TrendingUp,
    description: `${distribuicoes.filter(d => d.status === "processando").length} aguardando pagamento`,
  },
  {
    title: "Pendentes",
    value: distribuicoes
      .filter(d => d.status === "pendente")
      .reduce((acc, dist) => acc + dist.valorTotal, 0)
      .toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
    icon: Calendar,
    description: `${distribuicoes.filter(d => d.status === "pendente").length} a processar`,
  },
  {
    title: "Total de Distribuições",
    value: distribuicoes.length,
    icon: FileText,
    description: "Histórico completo",
  },
]

export default function DistribuicoesPage() {
  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Distribuições de Rendimentos
            </h1>
            <p className="text-muted-foreground">Histórico e gestão de distribuições aos investidores</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/investidores/distribuicoes/nova">
              <Plus className="mr-2 h-4 w-4" />
              Nova Distribuição
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Distribuições Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Histórico de Distribuições</CardTitle>
                <CardDescription>Todas as distribuições realizadas e pendentes</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar distribuição..." className="pl-8 w-[250px]" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Projeto</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead className="text-center">Investidores</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {distribuicoes.map((dist) => (
                  <TableRow key={dist.id}>
                    <TableCell className="font-medium">{dist.periodo}</TableCell>
                    <TableCell>{new Date(dist.data).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="text-muted-foreground">{dist.projeto}</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      {dist.valorTotal.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </TableCell>
                    <TableCell className="text-center">{dist.investidores}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          dist.status === "pago"
                            ? "default"
                            : dist.status === "processando"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {dist.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/dashboard/investidores/distribuicoes/${dist.id}`}>
                            Ver Detalhes
                          </Link>
                        </Button>
                        {dist.status === "pago" && (
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base">Gerar Informes de Rendimentos</CardTitle>
                <CardDescription className="mt-2">
                  Para cada distribuição paga, você pode gerar recibos individuais e informes de rendimentos em
                  PDF com o logo da empresa. Acesse os detalhes da distribuição para baixar os documentos.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </DashboardLayout>
  )
}
