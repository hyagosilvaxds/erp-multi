"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Wallet,
  TrendingUp,
  FileText,
  Download,
  Calendar,
  Building2,
  ArrowUpRight,
  Eye,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

// Dados mockados do investidor
const investidor = {
  nome: "João Silva Investimentos",
  documento: "123.456.789-00",
  email: "joao.silva@email.com",
}

const resumo = {
  totalAportado: 500000,
  totalRecebido: 45000,
  rendimentoMedio: 3.0,
  ultimaDistribuicao: "2025-03-31",
}

const aportes = [
  {
    id: 1,
    data: "2025-01-15",
    valor: 500000,
    projeto: "Projeto Alpha",
  },
]

const distribuicoes = [
  {
    id: 1,
    periodo: "Q1 2025",
    data: "2025-03-31",
    valor: 15000,
    percentual: 35,
    status: "pago",
  },
  {
    id: 2,
    periodo: "Q4 2024",
    data: "2024-12-31",
    valor: 14000,
    percentual: 35,
    status: "pago",
  },
  {
    id: 3,
    periodo: "Q3 2024",
    data: "2024-09-30",
    valor: 16000,
    percentual: 35,
    status: "pago",
  },
]

const evolucaoRendimentos = [
  { mes: "Set/24", valor: 16000 },
  { mes: "Out/24", valor: 0 },
  { mes: "Nov/24", valor: 0 },
  { mes: "Dez/24", valor: 14000 },
  { mes: "Jan/25", valor: 0 },
  { mes: "Fev/25", valor: 0 },
  { mes: "Mar/25", valor: 15000 },
]

const documentos = [
  {
    id: 1,
    nome: "Contrato SCP - Projeto Alpha",
    tipo: "Contrato",
    data: "2025-01-15",
  },
  {
    id: 2,
    nome: "Informe de Rendimentos Q1 2025",
    tipo: "Informe",
    data: "2025-03-31",
  },
  {
    id: 3,
    nome: "Recibo Distribuição Q1 2025",
    tipo: "Recibo",
    data: "2025-03-31",
  },
  {
    id: 4,
    nome: "DRE Projeto Alpha - Q1 2025",
    tipo: "Relatório",
    data: "2025-03-31",
  },
]

export default function PortalInvestidorPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                E
              </div>
              <div>
                <h1 className="font-bold text-lg">Portal do Investidor</h1>
                <p className="text-xs text-muted-foreground">ERP Multi-Empresa</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-sm">{investidor.nome}</p>
              <p className="text-xs text-muted-foreground">{investidor.documento}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Welcome */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Bem-vindo, {investidor.nome.split(" ")[0]}
            </h2>
            <p className="text-muted-foreground">Acompanhe seus investimentos e rendimentos</p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo Aportado</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {resumo.totalAportado.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </div>
                <p className="text-xs text-muted-foreground">Investimento total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {resumo.totalRecebido.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </div>
                <p className="text-xs text-muted-foreground">Rendimentos acumulados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rendimento Médio</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{resumo.rendimentoMedio}%</div>
                <p className="text-xs text-muted-foreground">Por período</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Última Distribuição</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {new Date(resumo.ultimaDistribuicao).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(resumo.ultimaDistribuicao).getFullYear()}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Evolução de Rendimentos */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Evolução de Rendimentos</CardTitle>
                <CardDescription>Histórico de distribuições recebidas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={evolucaoRendimentos}>
                    <defs>
                      <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) =>
                        value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="valor"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorValor)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Meus Projetos */}
            <Card>
              <CardHeader>
                <CardTitle>Meus Projetos</CardTitle>
                <CardDescription>Projetos com participação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Projeto Alpha</p>
                      <p className="text-xs text-muted-foreground">Participação: 35%</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Aportado:</span>
                      <span className="font-semibold">R$ 500.000,00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Recebido:</span>
                      <span className="font-semibold text-green-600">R$ 45.000,00</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    <Eye className="mr-2 h-3 w-3" />
                    Ver DRE do Projeto
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Extrato de Rendimentos */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Extrato de Rendimentos</CardTitle>
                  <CardDescription>Histórico de distribuições recebidas</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Período</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-center">Participação</TableHead>
                    <TableHead className="text-right">Valor Recebido</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Documentos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {distribuicoes.map((dist) => (
                    <TableRow key={dist.id}>
                      <TableCell className="font-medium">{dist.periodo}</TableCell>
                      <TableCell>{new Date(dist.data).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{dist.percentual}%</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {dist.valor.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{dist.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Documentos */}
          <Card>
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
              <CardDescription>Contratos, informes e relatórios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documentos.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{doc.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.tipo} • {new Date(doc.data).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-6 py-6">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 ERP Multi-Empresa. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
