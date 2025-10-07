"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileText, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Line, LineChart } from "recharts"

// Dados mockados para DRE
const dadosDRE = {
  receitaBruta: 150000,
  deducoes: 15000,
  receitaLiquida: 135000,
  custoVendas: 60000,
  lucroBruto: 75000,
  despesasOperacionais: {
    administrativas: 20000,
    vendas: 15000,
    financeiras: 5000,
    total: 40000,
  },
  lucroOperacional: 35000,
  lucroLiquido: 30000,
}

// Dados mockados para Balanço
const dadosBalanco = {
  ativo: {
    circulante: {
      caixa: 50000,
      bancos: 120000,
      contasReceber: 80000,
      estoque: 45000,
      total: 295000,
    },
    naoCirculante: {
      imobilizado: 200000,
      intangivel: 50000,
      total: 250000,
    },
    total: 545000,
  },
  passivo: {
    circulante: {
      fornecedores: 60000,
      contasPagar: 40000,
      total: 100000,
    },
    naoCirculante: {
      emprestimos: 150000,
      total: 150000,
    },
    total: 250000,
  },
  patrimonioLiquido: {
    capital: 200000,
    lucros: 95000,
    total: 295000,
  },
}

// Dados mockados para DFC
const dadosDFC = [
  { mes: "Jan", operacional: 25000, investimento: -15000, financiamento: 10000 },
  { mes: "Fev", operacional: 30000, investimento: -5000, financiamento: 0 },
  { mes: "Mar", operacional: 28000, investimento: -20000, financiamento: 15000 },
  { mes: "Abr", operacional: 35000, investimento: -10000, financiamento: 5000 },
]

// Dados mockados para Centros de Custo
const dadosCentroCusto = [
  { centro: "Vendas", custo: 45000, receita: 135000, margem: 66.7 },
  { centro: "Produção", custo: 60000, receita: 0, margem: 0 },
  { centro: "Administrativo", custo: 20000, receita: 0, margem: 0 },
  { centro: "Marketing", custo: 15000, receita: 0, margem: 0 },
]

export default function RelatoriosFinanceiros() {
  const [periodoInicio, setPeriodoInicio] = useState("2025-01-01")
  const [periodoFim, setPeriodoFim] = useState("2025-04-30")
  const [centroCusto, setCentroCusto] = useState("todos")
  const [projeto, setProjeto] = useState("todos")

  const handleExportarPDF = (relatorio: string) => {
    console.log("[v0] Exportando", relatorio, "para PDF")
  }

  const handleExportarExcel = (relatorio: string) => {
    console.log("[v0] Exportando", relatorio, "para Excel")
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Relatórios Financeiros</h1>
          <p className="text-muted-foreground">Análises e demonstrativos contábeis</p>
        </div>

      {/* Filtros Globais */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Aplique filtros para todos os relatórios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Período Início</Label>
              <Input type="date" value={periodoInicio} onChange={(e) => setPeriodoInicio(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Período Fim</Label>
              <Input type="date" value={periodoFim} onChange={(e) => setPeriodoFim(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Centro de Custo</Label>
              <Select value={centroCusto} onValueChange={setCentroCusto}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="vendas">Vendas</SelectItem>
                  <SelectItem value="producao">Produção</SelectItem>
                  <SelectItem value="administrativo">Administrativo</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Projeto</Label>
              <Select value={projeto} onValueChange={setProjeto}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="alpha">Projeto Alpha</SelectItem>
                  <SelectItem value="beta">Projeto Beta</SelectItem>
                  <SelectItem value="gamma">Projeto Gamma</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Relatórios */}
      <Tabs defaultValue="dre" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dre">DRE</TabsTrigger>
          <TabsTrigger value="balanco">Balanço</TabsTrigger>
          <TabsTrigger value="dfc">DFC</TabsTrigger>
          <TabsTrigger value="centros">Centros de Custo</TabsTrigger>
        </TabsList>

        {/* DRE Gerencial */}
        <TabsContent value="dre" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>DRE - Demonstração do Resultado do Exercício</CardTitle>
                  <CardDescription>
                    Período: {new Date(periodoInicio).toLocaleDateString("pt-BR")} a{" "}
                    {new Date(periodoFim).toLocaleDateString("pt-BR")}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExportarPDF("DRE")}>
                    <FileText className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportarExcel("DRE")}>
                    <Download className="mr-2 h-4 w-4" />
                    Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Receitas */}
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="font-semibold text-foreground">RECEITA BRUTA</span>
                    <span className="font-semibold text-foreground">
                      {dadosDRE.receitaBruta.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  </div>
                  <div className="flex justify-between pl-4 text-sm">
                    <span className="text-muted-foreground">(-) Deduções e Abatimentos</span>
                    <span className="text-red-600">
                      ({dadosDRE.deducoes.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2 font-medium">
                    <span className="text-foreground">RECEITA LÍQUIDA</span>
                    <span className="text-foreground">
                      {dadosDRE.receitaLiquida.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  </div>
                </div>

                {/* Custos */}
                <div className="space-y-2">
                  <div className="flex justify-between pl-4 text-sm">
                    <span className="text-muted-foreground">(-) Custo das Vendas</span>
                    <span className="text-red-600">
                      ({dadosDRE.custoVendas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2 font-medium">
                    <span className="text-green-600">LUCRO BRUTO</span>
                    <span className="text-green-600">
                      {dadosDRE.lucroBruto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  </div>
                </div>

                {/* Despesas Operacionais */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">(-) DESPESAS OPERACIONAIS</span>
                    <span className="font-medium text-red-600">
                      (
                      {dadosDRE.despesasOperacionais.total.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                      )
                    </span>
                  </div>
                  <div className="flex justify-between pl-4 text-sm">
                    <span className="text-muted-foreground">Despesas Administrativas</span>
                    <span className="text-muted-foreground">
                      {dadosDRE.despesasOperacionais.administrativas.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between pl-4 text-sm">
                    <span className="text-muted-foreground">Despesas com Vendas</span>
                    <span className="text-muted-foreground">
                      {dadosDRE.despesasOperacionais.vendas.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between pl-4 text-sm">
                    <span className="text-muted-foreground">Despesas Financeiras</span>
                    <span className="text-muted-foreground">
                      {dadosDRE.despesasOperacionais.financeiras.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2 font-medium">
                    <span className="text-green-600">LUCRO OPERACIONAL</span>
                    <span className="text-green-600">
                      {dadosDRE.lucroOperacional.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  </div>
                </div>

                {/* Resultado Final */}
                <div className="rounded-lg bg-primary/5 p-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-foreground">LUCRO LÍQUIDO</span>
                    <span className="text-lg font-bold text-green-600">
                      {dadosDRE.lucroLiquido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Margem Líquida: {((dadosDRE.lucroLiquido / dadosDRE.receitaLiquida) * 100).toFixed(2)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Balanço Patrimonial */}
        <TabsContent value="balanco" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Balanço Patrimonial</CardTitle>
                  <CardDescription>Posição em {new Date(periodoFim).toLocaleDateString("pt-BR")}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExportarPDF("Balanço")}>
                    <FileText className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportarExcel("Balanço")}>
                    <Download className="mr-2 h-4 w-4" />
                    Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                {/* ATIVO */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">ATIVO</h3>

                  <div className="space-y-2">
                    <div className="flex justify-between font-medium">
                      <span className="text-foreground">Ativo Circulante</span>
                      <span className="text-foreground">
                        {dadosBalanco.ativo.circulante.total.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between pl-4 text-sm">
                      <span className="text-muted-foreground">Caixa</span>
                      <span className="text-muted-foreground">
                        {dadosBalanco.ativo.circulante.caixa.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between pl-4 text-sm">
                      <span className="text-muted-foreground">Bancos</span>
                      <span className="text-muted-foreground">
                        {dadosBalanco.ativo.circulante.bancos.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between pl-4 text-sm">
                      <span className="text-muted-foreground">Contas a Receber</span>
                      <span className="text-muted-foreground">
                        {dadosBalanco.ativo.circulante.contasReceber.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between pl-4 text-sm">
                      <span className="text-muted-foreground">Estoque</span>
                      <span className="text-muted-foreground">
                        {dadosBalanco.ativo.circulante.estoque.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-border pt-2">
                    <div className="flex justify-between font-medium">
                      <span className="text-foreground">Ativo Não Circulante</span>
                      <span className="text-foreground">
                        {dadosBalanco.ativo.naoCirculante.total.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between pl-4 text-sm">
                      <span className="text-muted-foreground">Imobilizado</span>
                      <span className="text-muted-foreground">
                        {dadosBalanco.ativo.naoCirculante.imobilizado.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between pl-4 text-sm">
                      <span className="text-muted-foreground">Intangível</span>
                      <span className="text-muted-foreground">
                        {dadosBalanco.ativo.naoCirculante.intangivel.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg bg-primary/5 p-3">
                    <div className="flex justify-between font-bold">
                      <span className="text-foreground">TOTAL DO ATIVO</span>
                      <span className="text-foreground">
                        {dadosBalanco.ativo.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* PASSIVO + PL */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">PASSIVO + PATRIMÔNIO LÍQUIDO</h3>

                  <div className="space-y-2">
                    <div className="flex justify-between font-medium">
                      <span className="text-foreground">Passivo Circulante</span>
                      <span className="text-foreground">
                        {dadosBalanco.passivo.circulante.total.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between pl-4 text-sm">
                      <span className="text-muted-foreground">Fornecedores</span>
                      <span className="text-muted-foreground">
                        {dadosBalanco.passivo.circulante.fornecedores.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between pl-4 text-sm">
                      <span className="text-muted-foreground">Contas a Pagar</span>
                      <span className="text-muted-foreground">
                        {dadosBalanco.passivo.circulante.contasPagar.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-border pt-2">
                    <div className="flex justify-between font-medium">
                      <span className="text-foreground">Passivo Não Circulante</span>
                      <span className="text-foreground">
                        {dadosBalanco.passivo.naoCirculante.total.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between pl-4 text-sm">
                      <span className="text-muted-foreground">Empréstimos</span>
                      <span className="text-muted-foreground">
                        {dadosBalanco.passivo.naoCirculante.emprestimos.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-border pt-2">
                    <div className="flex justify-between font-medium">
                      <span className="text-foreground">Patrimônio Líquido</span>
                      <span className="text-foreground">
                        {dadosBalanco.patrimonioLiquido.total.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between pl-4 text-sm">
                      <span className="text-muted-foreground">Capital Social</span>
                      <span className="text-muted-foreground">
                        {dadosBalanco.patrimonioLiquido.capital.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between pl-4 text-sm">
                      <span className="text-muted-foreground">Lucros Acumulados</span>
                      <span className="text-muted-foreground">
                        {dadosBalanco.patrimonioLiquido.lucros.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg bg-primary/5 p-3">
                    <div className="flex justify-between font-bold">
                      <span className="text-foreground">TOTAL DO PASSIVO + PL</span>
                      <span className="text-foreground">
                        {(dadosBalanco.passivo.total + dadosBalanco.patrimonioLiquido.total).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DFC - Demonstração de Fluxo de Caixa */}
        <TabsContent value="dfc" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>DFC - Demonstração do Fluxo de Caixa</CardTitle>
                  <CardDescription>Método Indireto</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExportarPDF("DFC")}>
                    <FileText className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportarExcel("DFC")}>
                    <Download className="mr-2 h-4 w-4" />
                    Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={dadosDFC}>
                  <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="operacional"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Operacional"
                  />
                  <Line type="monotone" dataKey="investimento" stroke="#ef4444" strokeWidth={2} name="Investimento" />
                  <Line type="monotone" dataKey="financiamento" stroke="#10b981" strokeWidth={2} name="Financiamento" />
                </LineChart>
              </ResponsiveContainer>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Fluxo Operacional</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-2xl font-bold text-foreground">
                        {dadosDFC
                          .reduce((acc, d) => acc + d.operacional, 0)
                          .toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Atividades operacionais</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Fluxo de Investimento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <span className="text-2xl font-bold text-red-600">
                        {dadosDFC
                          .reduce((acc, d) => acc + d.investimento, 0)
                          .toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Investimentos realizados</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Fluxo de Financiamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="text-2xl font-bold text-green-600">
                        {dadosDFC
                          .reduce((acc, d) => acc + d.financiamento, 0)
                          .toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Captações e pagamentos</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Análise de Centros de Custo */}
        <TabsContent value="centros" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Análise de Centros de Custo</CardTitle>
                  <CardDescription>Custos e margens por centro de custo</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExportarPDF("Centros de Custo")}>
                    <FileText className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportarExcel("Centros de Custo")}>
                    <Download className="mr-2 h-4 w-4" />
                    Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosCentroCusto}>
                  <XAxis dataKey="centro" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  />
                  <Legend />
                  <Bar dataKey="custo" fill="#ef4444" name="Custo" />
                  <Bar dataKey="receita" fill="#10b981" name="Receita" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 space-y-3">
                {dadosCentroCusto.map((centro) => (
                  <div
                    key={centro.centro}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{centro.centro}</p>
                      <p className="text-sm text-muted-foreground">
                        Custo: {centro.custo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} | Receita:{" "}
                        {centro.receita.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">{centro.margem.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">Margem</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </DashboardLayout>
  )
}
