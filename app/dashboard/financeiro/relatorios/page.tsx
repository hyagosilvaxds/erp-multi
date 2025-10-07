"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileText, TrendingUp, TrendingDown, DollarSign, Users, Package } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Line, LineChart } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

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

// Dados mockados para DFC Indireto
const dadosDFCIndireto = {
  lucroLiquido: 30000,
  ajustes: {
    depreciacaoAmortizacao: 5000,
    provisoes: 2000,
    juros: 3000,
    total: 10000,
  },
  variacoesCapitalGiro: {
    contasReceber: -8000,
    estoques: -5000,
    contasPagar: 6000,
    total: -7000,
  },
  fluxoOperacional: 33000,
  fluxoInvestimento: -25000,
  fluxoFinanciamento: 15000,
  variacaoCaixa: 23000,
}

// Dados mockados para Custos Operacionais
const dadosCustosOperacionais = [
  { unidade: "Tonelada (ton)", volume: 1200, custoTotal: 240000, custoUnitario: 200 },
  { unidade: "Grama (g)", volume: 500000, custoTotal: 125000, custoUnitario: 0.25 },
  { unidade: "Cabeça", volume: 850, custoTotal: 425000, custoUnitario: 500 },
  { unidade: "Arroba (@)", volume: 320, custoTotal: 192000, custoUnitario: 600 },
]

// Dados mockados para Aportes e Distribuições
const dadosInvestidores = [
  {
    id: 1,
    investidor: "João Silva",
    aportes: [
      { data: "2025-01-15", valor: 50000, tipo: "Capital Social" },
      { data: "2025-03-10", valor: 25000, tipo: "Aumento de Capital" },
    ],
    distribuicoes: [{ data: "2025-04-01", valor: 3500, tipo: "Dividendos" }],
    totalAportes: 75000,
    totalDistribuicoes: 3500,
    saldo: 71500,
  },
  {
    id: 2,
    investidor: "Maria Santos",
    aportes: [{ data: "2025-01-15", valor: 50000, tipo: "Capital Social" }],
    distribuicoes: [{ data: "2025-04-01", valor: 3500, tipo: "Dividendos" }],
    totalAportes: 50000,
    totalDistribuicoes: 3500,
    saldo: 46500,
  },
  {
    id: 3,
    investidor: "Fundo Investimentos XYZ",
    aportes: [{ data: "2025-02-20", valor: 100000, tipo: "Capital Social" }],
    distribuicoes: [{ data: "2025-04-01", valor: 7000, tipo: "Dividendos" }],
    totalAportes: 100000,
    totalDistribuicoes: 7000,
    saldo: 93000,
  },
]

// Dados mockados para Contas a Pagar/Receber (Auditoria)
const contasAuditoriaData = {
  pagar: [
    { id: 1, vencimento: "2025-04-10", fornecedor: "Fornecedor ABC Ltda", descricao: "Compra de Materiais", valor: 5000, status: "pendente" },
    { id: 2, vencimento: "2025-04-15", fornecedor: "Energia Elétrica S.A.", descricao: "Conta de Luz - Abril/2025", valor: 1200, status: "pendente" },
    { id: 3, vencimento: "2025-03-28", fornecedor: "Aluguel Escritório", descricao: "Aluguel - Abril/2025", valor: 3500, status: "pago" },
  ],
  receber: [
    { id: 1, vencimento: "2025-04-07", cliente: "Cliente ABC S.A.", descricao: "Venda #1234", valor: 25000, status: "pendente" },
    { id: 2, vencimento: "2025-04-08", cliente: "Cliente DEF Ltda", descricao: "Venda #1235", valor: 18500, status: "pendente" },
    { id: 3, vencimento: "2025-03-25", cliente: "Cliente GHI Corp", descricao: "Venda #1198", valor: 12300, status: "recebido" },
  ],
}

// Dados mockados para Custo de Pessoal
const dadosCustoPessoal = [
  {
    centroCusto: "Produção",
    funcionarios: 15,
    salarios: 45000,
    encargos: 18000,
    beneficios: 7500,
    total: 70500,
    mediaFuncionario: 4700,
  },
  {
    centroCusto: "Vendas",
    funcionarios: 8,
    salarios: 32000,
    encargos: 12800,
    beneficios: 5600,
    total: 50400,
    mediaFuncionario: 6300,
  },
  {
    centroCusto: "Administrativo",
    funcionarios: 5,
    salarios: 25000,
    encargos: 10000,
    beneficios: 4000,
    total: 39000,
    mediaFuncionario: 7800,
  },
  {
    centroCusto: "Marketing",
    funcionarios: 3,
    salarios: 18000,
    encargos: 7200,
    beneficios: 3000,
    total: 28200,
    mediaFuncionario: 9400,
  },
]

export default function RelatoriosFinanceiros() {
  const [periodoInicio, setPeriodoInicio] = useState("2025-01-01")
  const [periodoFim, setPeriodoFim] = useState("2025-04-30")
  const [centroCusto, setCentroCusto] = useState("todos")
  const [projeto, setProjeto] = useState("todos")
  const [formatoExportacao, setFormatoExportacao] = useState<"csv" | "excel" | "txt">("excel")
  const [empresaSelecionada, setEmpresaSelecionada] = useState("1") // Empresa individual
  const [modoConsolidado, setModoConsolidado] = useState(false) // Modo holding/consolidado

  const handleExportarPDF = (relatorio: string) => {
    console.log("[v0] Exportando", relatorio, "para PDF")
    console.log("[v0] Empresa:", empresaSelecionada, "Consolidado:", modoConsolidado)
    // Implementação real faria download do PDF
  }

  const handleExportarExcel = (relatorio: string) => {
    console.log("[v0] Exportando", relatorio, "para Excel")
    console.log("[v0] Empresa:", empresaSelecionada, "Consolidado:", modoConsolidado)
    // Implementação real faria download do Excel
  }

  const handleExportarCSV = (relatorio: string) => {
    console.log("[v0] Exportando", relatorio, "para CSV")
    console.log("[v0] Empresa:", empresaSelecionada, "Consolidado:", modoConsolidado)
    // Implementação real faria download do CSV
  }

  const handleExportarTXT = (relatorio: string, layout: string) => {
    console.log("[v0] Exportando", relatorio, "para TXT com layout", layout)
    console.log("[v0] Empresa:", empresaSelecionada, "Consolidado:", modoConsolidado)
    // Implementação real faria download do TXT formatado
  }

  const handleExportarContador = () => {
    console.log("[v0] Exportando dados para contador no formato", formatoExportacao)
    console.log("[v0] Empresa:", empresaSelecionada, "Consolidado:", modoConsolidado)
    // Implementação real faria download do arquivo formatado para o contador
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Relatórios Financeiros</h1>
          <p className="text-muted-foreground">Análises, demonstrativos contábeis e exportações</p>
        </div>

        {/* Filtros Globais */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Aplique filtros para todos os relatórios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-6">
              {/* Seletor de Empresa */}
              <div className="space-y-2">
                <Label>Empresa</Label>
                <Select value={empresaSelecionada} onValueChange={setEmpresaSelecionada}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Tech Solutions LTDA</SelectItem>
                    <SelectItem value="2">Comércio Digital ME</SelectItem>
                    <SelectItem value="3">Indústria Moderna S.A.</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Modo Consolidado (Holding) */}
              <div className="space-y-2">
                <Label>Modo</Label>
                <Select value={modoConsolidado ? "consolidado" : "individual"} onValueChange={(v) => setModoConsolidado(v === "consolidado")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="consolidado">Consolidado (Holding)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
        <Tabs defaultValue="dfc-indireto" className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="dfc-indireto">DFC</TabsTrigger>
            <TabsTrigger value="custos-op">Custos Op.</TabsTrigger>
            <TabsTrigger value="investidores">Investidores</TabsTrigger>
            <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
            <TabsTrigger value="pessoal">Pessoal</TabsTrigger>
            <TabsTrigger value="exportacoes">Exportações</TabsTrigger>
            <TabsTrigger value="contador">Contador</TabsTrigger>
          </TabsList>

          {/* DFC Indireto */}
          <TabsContent value="dfc-indireto" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>DFC - Demonstração dos Fluxos de Caixa (Método Indireto)</CardTitle>
                    <CardDescription>
                      Período: {new Date(periodoInicio).toLocaleDateString("pt-BR")} a{" "}
                      {new Date(periodoFim).toLocaleDateString("pt-BR")}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleExportarPDF("DFC-Indireto")}>
                      <FileText className="mr-2 h-4 w-4" />
                      PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExportarExcel("DFC-Indireto")}>
                      <Download className="mr-2 h-4 w-4" />
                      Excel
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Fluxo Operacional */}
                  <div className="space-y-2">
                    <div className="flex justify-between border-b border-border pb-2">
                      <span className="font-semibold text-foreground">FLUXO DE CAIXA DAS ATIVIDADES OPERACIONAIS</span>
                    </div>
                    <div className="flex justify-between pl-4 text-sm">
                      <span className="text-foreground">Lucro Líquido do Período</span>
                      <span className="text-foreground">
                        {dadosDFCIndireto.lucroLiquido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                    
                    <div className="flex justify-between pl-4 pt-2">
                      <span className="text-sm font-medium text-foreground">Ajustes para Conciliar o Lucro:</span>
                    </div>
                    <div className="flex justify-between pl-8 text-sm">
                      <span className="text-muted-foreground">Depreciação e Amortização</span>
                      <span className="text-foreground">
                        {dadosDFCIndireto.ajustes.depreciacaoAmortizacao.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                    <div className="flex justify-between pl-8 text-sm">
                      <span className="text-muted-foreground">Provisões</span>
                      <span className="text-foreground">
                        {dadosDFCIndireto.ajustes.provisoes.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                    <div className="flex justify-between pl-8 text-sm">
                      <span className="text-muted-foreground">Despesas Financeiras</span>
                      <span className="text-foreground">
                        {dadosDFCIndireto.ajustes.juros.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>

                    <div className="flex justify-between pl-4 pt-2">
                      <span className="text-sm font-medium text-foreground">Variações no Capital de Giro:</span>
                    </div>
                    <div className="flex justify-between pl-8 text-sm">
                      <span className="text-muted-foreground">Contas a Receber</span>
                      <span className="text-red-600">
                        ({Math.abs(dadosDFCIndireto.variacoesCapitalGiro.contasReceber).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})
                      </span>
                    </div>
                    <div className="flex justify-between pl-8 text-sm">
                      <span className="text-muted-foreground">Estoques</span>
                      <span className="text-red-600">
                        ({Math.abs(dadosDFCIndireto.variacoesCapitalGiro.estoques).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})
                      </span>
                    </div>
                    <div className="flex justify-between pl-8 text-sm">
                      <span className="text-muted-foreground">Contas a Pagar</span>
                      <span className="text-foreground">
                        {dadosDFCIndireto.variacoesCapitalGiro.contasPagar.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>

                    <div className="flex justify-between border-t border-border pt-2 font-semibold">
                      <span className="text-green-600">Caixa Líquido Gerado pelas Atividades Operacionais</span>
                      <span className="text-green-600">
                        {dadosDFCIndireto.fluxoOperacional.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                  </div>

                  {/* Fluxo de Investimento */}
                  <div className="space-y-2">
                    <div className="flex justify-between border-b border-border pb-2">
                      <span className="font-semibold text-foreground">FLUXO DE CAIXA DAS ATIVIDADES DE INVESTIMENTO</span>
                    </div>
                    <div className="flex justify-between pl-4 text-sm">
                      <span className="text-muted-foreground">Aquisição de Imobilizado e Intangível</span>
                      <span className="text-red-600">
                        ({Math.abs(dadosDFCIndireto.fluxoInvestimento).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2 font-semibold">
                      <span className="text-red-600">Caixa Líquido Usado nas Atividades de Investimento</span>
                      <span className="text-red-600">
                        ({Math.abs(dadosDFCIndireto.fluxoInvestimento).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})
                      </span>
                    </div>
                  </div>

                  {/* Fluxo de Financiamento */}
                  <div className="space-y-2">
                    <div className="flex justify-between border-b border-border pb-2">
                      <span className="font-semibold text-foreground">FLUXO DE CAIXA DAS ATIVIDADES DE FINANCIAMENTO</span>
                    </div>
                    <div className="flex justify-between pl-4 text-sm">
                      <span className="text-muted-foreground">Captação de Empréstimos / Aporte de Capital</span>
                      <span className="text-foreground">
                        {dadosDFCIndireto.fluxoFinanciamento.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2 font-semibold">
                      <span className="text-green-600">Caixa Líquido Gerado pelas Atividades de Financiamento</span>
                      <span className="text-green-600">
                        {dadosDFCIndireto.fluxoFinanciamento.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                  </div>

                  {/* Variação Total */}
                  <div className="space-y-2">
                    <div className="flex justify-between border-t-2 border-border pt-3 text-lg font-bold">
                      <span className="text-primary">AUMENTO/DIMINUIÇÃO LÍQUIDA DE CAIXA</span>
                      <span className="text-primary">
                        {dadosDFCIndireto.variacaoCaixa.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Custos Operacionais */}
          <TabsContent value="custos-op" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Custos Operacionais por Unidade</CardTitle>
                    <CardDescription>Análise de custos unitários por tipo de medida</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleExportarPDF("Custos-Operacionais")}>
                      <FileText className="mr-2 h-4 w-4" />
                      PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExportarExcel("Custos-Operacionais")}>
                      <Download className="mr-2 h-4 w-4" />
                      Excel
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unidade de Medida</TableHead>
                      <TableHead className="text-right">Volume Produzido</TableHead>
                      <TableHead className="text-right">Custo Total</TableHead>
                      <TableHead className="text-right">Custo Unitário</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dadosCustosOperacionais.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            {item.unidade}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{item.volume.toLocaleString("pt-BR")}</TableCell>
                        <TableCell className="text-right">
                          {item.custoTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-primary">
                          {item.custoUnitario.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t-2 font-semibold">
                      <TableCell>TOTAL</TableCell>
                      <TableCell className="text-right">
                        {dadosCustosOperacionais.reduce((acc, item) => acc + item.volume, 0).toLocaleString("pt-BR")} un.
                      </TableCell>
                      <TableCell className="text-right">
                        {dadosCustosOperacionais
                          .reduce((acc, item) => acc + item.custoTotal, 0)
                          .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                {/* Gráfico de Custos */}
                <div className="mt-6">
                  <h3 className="mb-4 text-sm font-medium">Comparativo de Custos Unitários</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dadosCustosOperacionais}>
                      <XAxis dataKey="unidade" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      />
                      <Bar dataKey="custoUnitario" fill="hsl(var(--primary))" name="Custo Unitário" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aportes e Distribuições */}
          <TabsContent value="investidores" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Aportes e Distribuições por Investidor</CardTitle>
                    <CardDescription>Controle de capital investido e retornos distribuídos</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleExportarPDF("Investidores")}>
                      <FileText className="mr-2 h-4 w-4" />
                      PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExportarExcel("Investidores")}>
                      <Download className="mr-2 h-4 w-4" />
                      Excel
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {dadosInvestidores.map((investidor) => (
                    <Card key={investidor.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{investidor.investidor}</CardTitle>
                              <CardDescription>
                                Saldo: {investidor.saldo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">ROI</div>
                            <div className="text-lg font-semibold text-foreground">
                              {((investidor.totalDistribuicoes / investidor.totalAportes) * 100).toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                          {/* Aportes */}
                          <div>
                            <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                              <TrendingDown className="h-4 w-4 text-red-600" />
                              Aportes
                            </h4>
                            <div className="space-y-2">
                              {investidor.aportes.map((aporte, idx) => (
                                <div key={idx} className="rounded-lg border border-border p-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">{aporte.tipo}</span>
                                    <span className="font-medium text-foreground">
                                      {aporte.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                    </span>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(aporte.data).toLocaleDateString("pt-BR")}
                                  </div>
                                </div>
                              ))}
                              <div className="rounded-lg bg-accent p-2 text-sm font-semibold">
                                <div className="flex justify-between">
                                  <span>Total Aportes</span>
                                  <span>{investidor.totalAportes.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Distribuições */}
                          <div>
                            <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              Distribuições
                            </h4>
                            <div className="space-y-2">
                              {investidor.distribuicoes.map((dist, idx) => (
                                <div key={idx} className="rounded-lg border border-border p-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">{dist.tipo}</span>
                                    <span className="font-medium text-green-600">
                                      {dist.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                    </span>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(dist.data).toLocaleDateString("pt-BR")}
                                  </div>
                                </div>
                              ))}
                              <div className="rounded-lg bg-accent p-2 text-sm font-semibold">
                                <div className="flex justify-between">
                                  <span>Total Distribuições</span>
                                  <span className="text-green-600">
                                    {investidor.totalDistribuicoes.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Totalizador Geral */}
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Total de Aportes</div>
                          <div className="text-2xl font-bold text-foreground">
                            {dadosInvestidores
                              .reduce((acc, inv) => acc + inv.totalAportes, 0)
                              .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Total de Distribuições</div>
                          <div className="text-2xl font-bold text-green-600">
                            {dadosInvestidores
                              .reduce((acc, inv) => acc + inv.totalDistribuicoes, 0)
                              .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Saldo Total</div>
                          <div className="text-2xl font-bold text-primary">
                            {dadosInvestidores
                              .reduce((acc, inv) => acc + inv.saldo, 0)
                              .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Relatório de Auditoria */}
          <TabsContent value="auditoria" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Contas a Pagar e Receber - Relatório de Auditoria</CardTitle>
                    <CardDescription>Visão consolidada para análise e auditoria</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleExportarPDF("Auditoria")}>
                      <FileText className="mr-2 h-4 w-4" />
                      PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExportarExcel("Auditoria")}>
                      <Download className="mr-2 h-4 w-4" />
                      Excel
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Contas a Pagar */}
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-foreground">Contas a Pagar</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Fornecedor</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contasAuditoriaData.pagar.map((conta) => (
                        <TableRow key={conta.id}>
                          <TableCell>{new Date(conta.vencimento).toLocaleDateString("pt-BR")}</TableCell>
                          <TableCell className="font-medium">{conta.fornecedor}</TableCell>
                          <TableCell>{conta.descricao}</TableCell>
                          <TableCell className="text-right">
                            {conta.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </TableCell>
                          <TableCell>
                            <Badge variant={conta.status === "pago" ? "default" : "secondary"}>
                              {conta.status === "pago" ? "Pago" : "Pendente"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="border-t-2 font-semibold">
                        <TableCell colSpan={3}>TOTAL A PAGAR</TableCell>
                        <TableCell className="text-right">
                          {contasAuditoriaData.pagar
                            .reduce((acc, c) => acc + c.valor, 0)
                            .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Contas a Receber */}
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-foreground">Contas a Receber</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contasAuditoriaData.receber.map((conta) => (
                        <TableRow key={conta.id}>
                          <TableCell>{new Date(conta.vencimento).toLocaleDateString("pt-BR")}</TableCell>
                          <TableCell className="font-medium">{conta.cliente}</TableCell>
                          <TableCell>{conta.descricao}</TableCell>
                          <TableCell className="text-right">
                            {conta.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </TableCell>
                          <TableCell>
                            <Badge variant={conta.status === "recebido" ? "default" : "secondary"}>
                              {conta.status === "recebido" ? "Recebido" : "Pendente"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="border-t-2 font-semibold">
                        <TableCell colSpan={3}>TOTAL A RECEBER</TableCell>
                        <TableCell className="text-right">
                          {contasAuditoriaData.receber
                            .reduce((acc, c) => acc + c.valor, 0)
                            .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Resumo */}
                <Card className="border-primary/20">
                  <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Total a Pagar</div>
                        <div className="text-xl font-bold text-red-600">
                          {contasAuditoriaData.pagar
                            .reduce((acc, c) => acc + c.valor, 0)
                            .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Total a Receber</div>
                        <div className="text-xl font-bold text-green-600">
                          {contasAuditoriaData.receber
                            .reduce((acc, c) => acc + c.valor, 0)
                            .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Saldo Líquido</div>
                        <div className="text-xl font-bold text-primary">
                          {(
                            contasAuditoriaData.receber.reduce((acc, c) => acc + c.valor, 0) -
                            contasAuditoriaData.pagar.reduce((acc, c) => acc + c.valor, 0)
                          ).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Custo de Pessoal */}
          <TabsContent value="pessoal" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Custo de Pessoal por Centro de Custo</CardTitle>
                    <CardDescription>Análise detalhada de custos com pessoal</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleExportarPDF("Custo-Pessoal")}>
                      <FileText className="mr-2 h-4 w-4" />
                      PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExportarExcel("Custo-Pessoal")}>
                      <Download className="mr-2 h-4 w-4" />
                      Excel
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Centro de Custo</TableHead>
                      <TableHead className="text-right">Funcionários</TableHead>
                      <TableHead className="text-right">Salários</TableHead>
                      <TableHead className="text-right">Encargos</TableHead>
                      <TableHead className="text-right">Benefícios</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Média/Func.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dadosCustoPessoal.map((centro, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{centro.centroCusto}</TableCell>
                        <TableCell className="text-right">{centro.funcionarios}</TableCell>
                        <TableCell className="text-right">
                          {centro.salarios.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </TableCell>
                        <TableCell className="text-right">
                          {centro.encargos.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </TableCell>
                        <TableCell className="text-right">
                          {centro.beneficios.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {centro.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </TableCell>
                        <TableCell className="text-right text-primary">
                          {centro.mediaFuncionario.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t-2 font-semibold">
                      <TableCell>TOTAL</TableCell>
                      <TableCell className="text-right">
                        {dadosCustoPessoal.reduce((acc, c) => acc + c.funcionarios, 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {dadosCustoPessoal
                          .reduce((acc, c) => acc + c.salarios, 0)
                          .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </TableCell>
                      <TableCell className="text-right">
                        {dadosCustoPessoal
                          .reduce((acc, c) => acc + c.encargos, 0)
                          .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </TableCell>
                      <TableCell className="text-right">
                        {dadosCustoPessoal
                          .reduce((acc, c) => acc + c.beneficios, 0)
                          .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </TableCell>
                      <TableCell className="text-right">
                        {dadosCustoPessoal
                          .reduce((acc, c) => acc + c.total, 0)
                          .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </TableCell>
                      <TableCell className="text-right">
                        {(
                          dadosCustoPessoal.reduce((acc, c) => acc + c.total, 0) /
                          dadosCustoPessoal.reduce((acc, c) => acc + c.funcionarios, 0)
                        ).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                {/* Gráfico */}
                <div className="mt-6">
                  <h3 className="mb-4 text-sm font-medium">Distribuição de Custos por Centro</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dadosCustoPessoal}>
                      <XAxis dataKey="centroCusto" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      />
                      <Legend />
                      <Bar dataKey="salarios" fill="hsl(var(--primary))" name="Salários" />
                      <Bar dataKey="encargos" fill="hsl(var(--chart-2))" name="Encargos" />
                      <Bar dataKey="beneficios" fill="hsl(var(--chart-3))" name="Benefícios" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exportações Gerais */}
          <TabsContent value="exportacoes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Exportações de Dados</CardTitle>
                <CardDescription>Exporte lançamentos e relatórios em diversos formatos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Exportar Lançamentos com Plano de Contas */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Lançamentos com Plano de Contas</CardTitle>
                      <CardDescription>Exportação completa incluindo classificação contábil</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Label>Formato</Label>
                        <Select defaultValue="excel">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                            <SelectItem value="csv">CSV</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button className="w-full" onClick={() => handleExportarExcel("Lancamentos-Plano-Contas")}>
                        <Download className="mr-2 h-4 w-4" />
                        Exportar Lançamentos
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Inclui: Data, Descrição, Valor, Conta Contábil, Centro de Custo, Projeto, Favorecido
                      </p>
                    </CardContent>
                  </Card>

                  {/* Exportar DRE */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Demonstração de Resultados</CardTitle>
                      <CardDescription>DRE formatado para análise</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Label>Formato</Label>
                        <Select defaultValue="excel">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="csv">CSV</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button className="w-full" onClick={() => handleExportarExcel("DRE-Completo")}>
                        <Download className="mr-2 h-4 w-4" />
                        Exportar DRE
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Inclui: Receitas, Custos, Despesas, Lucros com comparativo mensal
                      </p>
                    </CardContent>
                  </Card>

                  {/* Exportar Balanço */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Balanço Patrimonial</CardTitle>
                      <CardDescription>Ativo, Passivo e Patrimônio Líquido</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Label>Formato</Label>
                        <Select defaultValue="excel">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                            <SelectItem value="pdf">PDF</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button className="w-full" onClick={() => handleExportarExcel("Balanco")}>
                        <Download className="mr-2 h-4 w-4" />
                        Exportar Balanço
                      </Button>
                      <p className="text-xs text-muted-foreground">Inclui: Classificação completa de contas patrimoniais</p>
                    </CardContent>
                  </Card>

                  {/* Exportar Fluxo de Caixa */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Fluxo de Caixa</CardTitle>
                      <CardDescription>DFC Método Indireto</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Label>Formato</Label>
                        <Select defaultValue="excel">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="csv">CSV</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button className="w-full" onClick={() => handleExportarExcel("DFC")}>
                        <Download className="mr-2 h-4 w-4" />
                        Exportar DFC
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Inclui: Atividades Operacionais, Investimento e Financiamento
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exportações para Contador */}
          <TabsContent value="contador" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Exportação para Contador</CardTitle>
                <CardDescription>Gere arquivos no formato específico para seu contador</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Seletor de Layout */}
                <div className="space-y-2">
                  <Label>Layout do Arquivo</Label>
                  <Select defaultValue="padrao">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="padrao">Padrão ERP Multi-Empresa</SelectItem>
                      <SelectItem value="sped">SPED Contábil</SelectItem>
                      <SelectItem value="dominio">Sistema Domínio</SelectItem>
                      <SelectItem value="sage">Sage Contabilidade</SelectItem>
                      <SelectItem value="personalizado">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Selecione o layout compatível com o sistema do seu contador
                  </p>
                </div>

                {/* Opções de Exportação */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Formato</Label>
                    <Select value={formatoExportacao} onValueChange={(value: any) => setFormatoExportacao(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="txt">TXT (Texto)</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Período Início</Label>
                    <Input type="date" value={periodoInicio} onChange={(e) => setPeriodoInicio(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Período Fim</Label>
                    <Input type="date" value={periodoFim} onChange={(e) => setPeriodoFim(e.target.value)} />
                  </div>
                </div>

                {/* Arquivos para Exportar */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Selecione os dados para exportar:</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="lancamentos" defaultChecked className="h-4 w-4" />
                      <label htmlFor="lancamentos" className="text-sm">
                        Lançamentos Contábeis (com plano de contas)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="razao" defaultChecked className="h-4 w-4" />
                      <label htmlFor="razao" className="text-sm">
                        Livro Razão
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="diario" defaultChecked className="h-4 w-4" />
                      <label htmlFor="diario" className="text-sm">
                        Livro Diário
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="balancete" defaultChecked className="h-4 w-4" />
                      <label htmlFor="balancete" className="text-sm">
                        Balancete de Verificação
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="dre" className="h-4 w-4" />
                      <label htmlFor="dre" className="text-sm">
                        DRE
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="balanco" className="h-4 w-4" />
                      <label htmlFor="balanco" className="text-sm">
                        Balanço Patrimonial
                      </label>
                    </div>
                  </div>
                </div>

                {/* Botão de Exportação */}
                <Button size="lg" className="w-full" onClick={handleExportarContador}>
                  <Download className="mr-2 h-5 w-5" />
                  Gerar Arquivo para Contador
                </Button>

                {/* Instruções */}
                <Card className="bg-accent/50">
                  <CardContent className="pt-4">
                    <h4 className="mb-2 text-sm font-semibold">Instruções:</h4>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      <li>• O arquivo será gerado no formato selecionado com a codificação UTF-8</li>
                      <li>• Para layout SPED, o arquivo incluirá os blocos 0, I, J e 9</li>
                      <li>• Layout personalizado pode ser configurado em Configurações → Integrações</li>
                      <li>• Os lançamentos incluem data, histórico, conta débito/crédito e valor</li>
                      <li>• Arquivos TXT seguem largura fixa conforme layout selecionado</li>
                    </ul>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
