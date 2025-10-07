"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, Search, Plus, DollarSign, TrendingUp, Building2, FileText } from "lucide-react"
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
const investidores = [
  {
    id: 1,
    nome: "João Silva Investimentos",
    tipo: "PF",
    documento: "123.456.789-00",
    email: "joao.silva@email.com",
    totalAportado: 500000,
    totalRecebido: 45000,
    projetos: 2,
    status: "ativo",
  },
  {
    id: 2,
    nome: "ABC Capital Ltda",
    tipo: "PJ",
    documento: "12.345.678/0001-90",
    email: "contato@abccapital.com.br",
    totalAportado: 1200000,
    totalRecebido: 98000,
    projetos: 3,
    status: "ativo",
  },
  {
    id: 3,
    nome: "Maria Oliveira",
    tipo: "PF",
    documento: "987.654.321-00",
    email: "maria.oliveira@email.com",
    totalAportado: 300000,
    totalRecebido: 22500,
    projetos: 1,
    status: "ativo",
  },
  {
    id: 4,
    nome: "XYZ Participações S.A.",
    tipo: "PJ",
    documento: "98.765.432/0001-10",
    email: "investimentos@xyz.com.br",
    totalAportado: 800000,
    totalRecebido: 64000,
    projetos: 2,
    status: "inativo",
  },
]

const stats = [
  {
    title: "Total de Investidores",
    value: investidores.length,
    icon: Users,
    description: `${investidores.filter(i => i.status === "ativo").length} ativos`,
  },
  {
    title: "Total Aportado",
    value: investidores.reduce((acc, inv) => acc + inv.totalAportado, 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    }),
    icon: DollarSign,
    description: "Capital total investido",
  },
  {
    title: "Total Distribuído",
    value: investidores.reduce((acc, inv) => acc + inv.totalRecebido, 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    }),
    icon: TrendingUp,
    description: "Rendimentos pagos",
  },
  {
    title: "Projetos Ativos",
    value: "5",
    icon: Building2,
    description: "Com investimentos SCP",
  },
]

export default function InvestidoresPage() {
  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Investidores SCP</h1>
            <p className="text-muted-foreground">Gestão de investidores e participações</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard/investidores/distribuicoes">
                <FileText className="mr-2 h-4 w-4" />
                Distribuições
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/investidores/novo">
                <Plus className="mr-2 h-4 w-4" />
                Novo Investidor
              </Link>
            </Button>
          </div>
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

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Button asChild variant="outline" className="h-auto flex-col gap-2 py-6 bg-transparent">
            <Link href="/dashboard/investidores/aportes">
              <DollarSign className="h-6 w-6" />
              <div className="text-center">
                <p className="font-semibold">Registrar Aporte</p>
                <p className="text-xs text-muted-foreground">Novo investimento</p>
              </div>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto flex-col gap-2 py-6 bg-transparent">
            <Link href="/dashboard/investidores/distribuicoes/nova">
              <TrendingUp className="h-6 w-6" />
              <div className="text-center">
                <p className="font-semibold">Nova Distribuição</p>
                <p className="text-xs text-muted-foreground">Distribuir rendimentos</p>
              </div>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto flex-col gap-2 py-6 bg-transparent">
            <Link href="/dashboard/investidores/politicas">
              <FileText className="h-6 w-6" />
              <div className="text-center">
                <p className="font-semibold">Políticas</p>
                <p className="text-xs text-muted-foreground">Configurar distribuições</p>
              </div>
            </Link>
          </Button>
        </div>

        {/* Investors Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lista de Investidores</CardTitle>
                <CardDescription>Cadastro completo de investidores SCP</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar investidor..." className="pl-8 w-[300px]" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome/Razão Social</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Total Aportado</TableHead>
                  <TableHead className="text-right">Total Recebido</TableHead>
                  <TableHead className="text-center">Projetos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investidores.map((investidor) => (
                  <TableRow key={investidor.id}>
                    <TableCell className="font-medium">{investidor.nome}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{investidor.tipo}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{investidor.documento}</TableCell>
                    <TableCell className="text-muted-foreground">{investidor.email}</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      {investidor.totalAportado.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-blue-600">
                      {investidor.totalRecebido.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </TableCell>
                    <TableCell className="text-center">{investidor.projetos}</TableCell>
                    <TableCell>
                      <Badge variant={investidor.status === "ativo" ? "default" : "secondary"}>
                        {investidor.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/investidores/${investidor.id}`}>Ver Detalhes</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
