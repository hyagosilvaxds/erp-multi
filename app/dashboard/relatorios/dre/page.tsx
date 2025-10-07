"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  Building2,
  Calendar,
} from "lucide-react"
import Link from "next/link"

// Mock data
const dreData = {
  receitaBruta: 1500000,
  deducoes: {
    impostos: 180000,
    devolucoes: 15000,
  },
  receitaLiquida: 1305000,
  custos: {
    cmc: 650000,
    maoDeObra: 180000,
    depreciacoes: 25000,
  },
  lucroBruto: 450000,
  despesasOperacionais: {
    vendas: 85000,
    administrativas: 120000,
    financeiras: 35000,
  },
  lucroOperacional: 210000,
  outrasReceitas: 15000,
  outrasDespesas: 8000,
  lucroAntesIR: 217000,
  impostoRenda: 54250,
  lucroLiquido: 162750,
}

const drePorCentroCusto = [
  {
    centroCusto: "Produção",
    receita: 800000,
    custos: 450000,
    despesas: 80000,
    resultado: 270000,
  },
  {
    centroCusto: "Comercial",
    receita: 500000,
    custos: 200000,
    despesas: 120000,
    resultado: 180000,
  },
  {
    centroCusto: "Administrativo",
    receita: 0,
    custos: 0,
    despesas: 40000,
    resultado: -40000,
  },
]

const drePorProjeto = [
  {
    projeto: "Projeto Alpha",
    receita: 600000,
    custos: 320000,
    despesas: 85000,
    resultado: 195000,
    margem: 32.5,
  },
  {
    projeto: "Projeto Beta",
    receita: 450000,
    custos: 230000,
    despesas: 65000,
    resultado: 155000,
    margem: 34.4,
  },
  {
    projeto: "Projeto Gamma",
    receita: 250000,
    custos: 150000,
    despesas: 35000,
    resultado: 65000,
    margem: 26.0,
  },
]

export default function DREPage() {
  const [periodo] = useState("mensal")
  const [mes] = useState("01")
  const [ano] = useState("2024")
  const [visao, setVisao] = useState("consolidado")

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const handleExportPDF = () => {
    console.log("Exportando DRE para PDF...")
  }

  const handleExportExcel = () => {
    console.log("Exportando DRE para Excel...")
  }

  const margemBruta = (dreData.lucroBruto / dreData.receitaLiquida) * 100
  const margemOperacional = (dreData.lucroOperacional / dreData.receitaLiquida) * 100
  const margemLiquida = (dreData.lucroLiquido / dreData.receitaLiquida) * 100

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/relatorios">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                DRE - Demonstração do Resultado do Exercício
              </h1>
              <p className="text-muted-foreground">
                Análise de receitas, custos e despesas do período
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportPDF}>
              <FileText className="mr-2 h-4 w-4" />
              PDF
            </Button>
            <Button variant="outline" onClick={handleExportExcel}>
              <Download className="mr-2 h-4 w-4" />
              Excel
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Período</Label>
                <Select defaultValue={periodo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="trimestral">Trimestral</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mês</Label>
                <Select defaultValue={mes}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="01">Janeiro</SelectItem>
                    <SelectItem value="02">Fevereiro</SelectItem>
                    <SelectItem value="03">Março</SelectItem>
                    <SelectItem value="04">Abril</SelectItem>
                    <SelectItem value="05">Maio</SelectItem>
                    <SelectItem value="06">Junho</SelectItem>
                    <SelectItem value="07">Julho</SelectItem>
                    <SelectItem value="08">Agosto</SelectItem>
                    <SelectItem value="09">Setembro</SelectItem>
                    <SelectItem value="10">Outubro</SelectItem>
                    <SelectItem value="11">Novembro</SelectItem>
                    <SelectItem value="12">Dezembro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ano</Label>
                <Select defaultValue={ano}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Visão</Label>
                <Select value={visao} onValueChange={setVisao}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consolidado">Consolidado</SelectItem>
                    <SelectItem value="centro-custo">Por Centro de Custo</SelectItem>
                    <SelectItem value="projeto">Por Projeto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DRE Content */}
        <Tabs value={visao} onValueChange={setVisao}>
          <TabsList>
            <TabsTrigger value="consolidado">Consolidado</TabsTrigger>
            <TabsTrigger value="centro-custo">Por Centro de Custo</TabsTrigger>
            <TabsTrigger value="projeto">Por Projeto</TabsTrigger>
          </TabsList>

          {/* Consolidado */}
          <TabsContent value="consolidado" className="space-y-6">
            {/* Report Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between border-b pb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">Empresa Demo LTDA</h2>
                      <p className="text-sm text-muted-foreground">CNPJ: 00.000.000/0001-00</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Janeiro/2024
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Gerado em {new Date().toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>

                {/* DRE Table */}
                <div className="mt-6 space-y-4">
                  {/* Receitas */}
                  <div>
                    <div className="flex items-center justify-between py-2">
                      <span className="font-semibold">RECEITA BRUTA</span>
                      <span className="font-semibold">{formatCurrency(dreData.receitaBruta)}</span>
                    </div>
                    <div className="ml-4 space-y-1">
                      <div className="flex items-center justify-between py-1 text-sm">
                        <span className="text-muted-foreground">(-) Impostos sobre Vendas</span>
                        <span className="text-destructive">
                          ({formatCurrency(dreData.deducoes.impostos)})
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1 text-sm">
                        <span className="text-muted-foreground">(-) Devoluções e Abatimentos</span>
                        <span className="text-destructive">
                          ({formatCurrency(dreData.deducoes.devolucoes)})
                        </span>
                      </div>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex items-center justify-between py-2">
                      <span className="font-semibold text-primary">RECEITA LÍQUIDA</span>
                      <span className="font-semibold text-primary">
                        {formatCurrency(dreData.receitaLiquida)}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Custos */}
                  <div>
                    <div className="ml-4 space-y-1">
                      <div className="flex items-center justify-between py-1 text-sm">
                        <span className="text-muted-foreground">(-) Custo de Mercadorias/Serviços</span>
                        <span className="text-destructive">
                          ({formatCurrency(dreData.custos.cmc)})
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1 text-sm">
                        <span className="text-muted-foreground">(-) Mão de Obra Direta</span>
                        <span className="text-destructive">
                          ({formatCurrency(dreData.custos.maoDeObra)})
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1 text-sm">
                        <span className="text-muted-foreground">(-) Depreciações</span>
                        <span className="text-destructive">
                          ({formatCurrency(dreData.custos.depreciacoes)})
                        </span>
                      </div>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex items-center justify-between py-2">
                      <span className="font-semibold text-green-600">LUCRO BRUTO</span>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          {formatCurrency(dreData.lucroBruto)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Margem: {margemBruta.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Despesas Operacionais */}
                  <div>
                    <div className="flex items-center justify-between py-2">
                      <span className="font-medium">DESPESAS OPERACIONAIS</span>
                    </div>
                    <div className="ml-4 space-y-1">
                      <div className="flex items-center justify-between py-1 text-sm">
                        <span className="text-muted-foreground">(-) Despesas com Vendas</span>
                        <span className="text-destructive">
                          ({formatCurrency(dreData.despesasOperacionais.vendas)})
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1 text-sm">
                        <span className="text-muted-foreground">(-) Despesas Administrativas</span>
                        <span className="text-destructive">
                          ({formatCurrency(dreData.despesasOperacionais.administrativas)})
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1 text-sm">
                        <span className="text-muted-foreground">(-) Despesas Financeiras</span>
                        <span className="text-destructive">
                          ({formatCurrency(dreData.despesasOperacionais.financeiras)})
                        </span>
                      </div>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex items-center justify-between py-2">
                      <span className="font-semibold text-blue-600">LUCRO OPERACIONAL</span>
                      <div className="text-right">
                        <div className="font-semibold text-blue-600">
                          {formatCurrency(dreData.lucroOperacional)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Margem: {margemOperacional.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Outras Receitas/Despesas */}
                  <div>
                    <div className="ml-4 space-y-1">
                      <div className="flex items-center justify-between py-1 text-sm">
                        <span className="text-muted-foreground">(+) Outras Receitas</span>
                        <span className="text-green-600">
                          {formatCurrency(dreData.outrasReceitas)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1 text-sm">
                        <span className="text-muted-foreground">(-) Outras Despesas</span>
                        <span className="text-destructive">
                          ({formatCurrency(dreData.outrasDespesas)})
                        </span>
                      </div>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex items-center justify-between py-2">
                      <span className="font-semibold">LUCRO ANTES DO IR</span>
                      <span className="font-semibold">
                        {formatCurrency(dreData.lucroAntesIR)}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Imposto de Renda */}
                  <div>
                    <div className="ml-4">
                      <div className="flex items-center justify-between py-1 text-sm">
                        <span className="text-muted-foreground">(-) Imposto de Renda e CSLL</span>
                        <span className="text-destructive">
                          ({formatCurrency(dreData.impostoRenda)})
                        </span>
                      </div>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex items-center justify-between rounded-lg bg-primary/5 p-3">
                      <span className="text-lg font-bold">LUCRO LÍQUIDO</span>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          {formatCurrency(dreData.lucroLiquido)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Margem: {margemLiquida.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Indicators */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Margem Bruta</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{margemBruta.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(dreData.lucroBruto)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Margem Operacional</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{margemOperacional.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(dreData.lucroOperacional)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Margem Líquida</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {margemLiquida.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(dreData.lucroLiquido)}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Por Centro de Custo */}
          <TabsContent value="centro-custo">
            <Card>
              <CardHeader>
                <CardTitle>DRE por Centro de Custo</CardTitle>
                <CardDescription>Resultado detalhado por departamento</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Centro de Custo</TableHead>
                      <TableHead className="text-right">Receita</TableHead>
                      <TableHead className="text-right">Custos</TableHead>
                      <TableHead className="text-right">Despesas</TableHead>
                      <TableHead className="text-right">Resultado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drePorCentroCusto.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.centroCusto}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.receita)}
                        </TableCell>
                        <TableCell className="text-right text-destructive">
                          {formatCurrency(item.custos)}
                        </TableCell>
                        <TableCell className="text-right text-destructive">
                          {formatCurrency(item.despesas)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div
                            className={`font-semibold ${item.resultado >= 0 ? "text-green-600" : "text-destructive"}`}
                          >
                            {formatCurrency(item.resultado)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Por Projeto */}
          <TabsContent value="projeto">
            <Card>
              <CardHeader>
                <CardTitle>DRE por Projeto</CardTitle>
                <CardDescription>Resultado e margem por projeto</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Projeto</TableHead>
                      <TableHead className="text-right">Receita</TableHead>
                      <TableHead className="text-right">Custos</TableHead>
                      <TableHead className="text-right">Despesas</TableHead>
                      <TableHead className="text-right">Resultado</TableHead>
                      <TableHead className="text-right">Margem %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drePorProjeto.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.projeto}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.receita)}
                        </TableCell>
                        <TableCell className="text-right text-destructive">
                          {formatCurrency(item.custos)}
                        </TableCell>
                        <TableCell className="text-right text-destructive">
                          {formatCurrency(item.despesas)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-semibold text-green-600">
                            {formatCurrency(item.resultado)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">{item.margem.toFixed(1)}%</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
