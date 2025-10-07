"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Download,
  FileText,
  Building2,
  Calendar,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"

// Mock data - Balanço Patrimonial
const balancoData = {
  ativo: {
    circulante: {
      caixa: 250000,
      bancos: 850000,
      aplicacoesFinanceiras: 500000,
      contasReceber: 680000,
      estoques: 420000,
      despesasAntecipadas: 35000,
    },
    naoCirculante: {
      realizavelLongoPrazo: {
        contasReceberLP: 180000,
        depositosJudiciais: 95000,
      },
      investimentos: 450000,
      imobilizado: {
        terrenosEdificios: 2500000,
        maquinasEquipamentos: 1800000,
        veiculos: 350000,
        depreciacao: -850000,
      },
      intangivel: {
        software: 180000,
        marcasPatentes: 120000,
        amortizacao: -45000,
      },
    },
  },
  passivo: {
    circulante: {
      fornecedores: 520000,
      salariosPagar: 180000,
      encargosPagar: 95000,
      impostosRecolher: 145000,
      emprestimosCP: 380000,
      outrasObrigacoes: 75000,
    },
    naoCirculante: {
      emprestimosLP: 1200000,
      financiamentosLP: 950000,
      provisoes: 180000,
    },
  },
  patrimonioLiquido: {
    capitalSocial: 2000000,
    reservasCapital: 350000,
    reservasLucros: 820000,
    lucrosAcumulados: 650000,
  },
}

export default function BalancoPage() {
  const [mes] = useState("01")
  const [ano] = useState("2024")

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const handleExportPDF = () => {
    console.log("Exportando Balanço para PDF...")
  }

  const handleExportExcel = () => {
    console.log("Exportando Balanço para Excel...")
  }

  // Cálculos
  const ativoCirculanteTotal = Object.values(balancoData.ativo.circulante).reduce(
    (a, b) => a + b,
    0
  )
  const realizavelLPTotal = Object.values(
    balancoData.ativo.naoCirculante.realizavelLongoPrazo
  ).reduce((a, b) => a + b, 0)
  const imobilizadoTotal = Object.values(balancoData.ativo.naoCirculante.imobilizado).reduce(
    (a, b) => a + b,
    0
  )
  const intangivelTotal = Object.values(balancoData.ativo.naoCirculante.intangivel).reduce(
    (a, b) => a + b,
    0
  )
  const ativoNaoCirculanteTotal =
    realizavelLPTotal +
    balancoData.ativo.naoCirculante.investimentos +
    imobilizadoTotal +
    intangivelTotal
  const ativoTotal = ativoCirculanteTotal + ativoNaoCirculanteTotal

  const passivoCirculanteTotal = Object.values(balancoData.passivo.circulante).reduce(
    (a, b) => a + b,
    0
  )
  const passivoNaoCirculanteTotal = Object.values(balancoData.passivo.naoCirculante).reduce(
    (a, b) => a + b,
    0
  )
  const patrimonioLiquidoTotal = Object.values(balancoData.patrimonioLiquido).reduce(
    (a, b) => a + b,
    0
  )
  const passivoTotal = passivoCirculanteTotal + passivoNaoCirculanteTotal + patrimonioLiquidoTotal

  // Indicadores
  const liquidezCorrente = ativoCirculanteTotal / passivoCirculanteTotal
  const liquidezSeca =
    (ativoCirculanteTotal - balancoData.ativo.circulante.estoques) / passivoCirculanteTotal
  const endividamentoTotal = (passivoCirculanteTotal + passivoNaoCirculanteTotal) / ativoTotal

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
              <h1 className="text-3xl font-bold tracking-tight">Balanço Patrimonial</h1>
              <p className="text-muted-foreground">
                Ativo, Passivo e Patrimônio Líquido
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
            <div className="grid gap-4 md:grid-cols-3">
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
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* ATIVO */}
          <Card>
            <CardContent className="p-6">
              {/* Header */}
              <div className="mb-6 border-b pb-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Empresa Demo LTDA</h2>
                    <p className="text-sm text-muted-foreground">
                      Balanço Patrimonial - Janeiro/2024
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg bg-blue-50 p-3">
                  <h3 className="text-lg font-bold text-blue-900">ATIVO</h3>
                </div>

                {/* Ativo Circulante */}
                <div>
                  <div className="mb-2 font-semibold text-blue-700">ATIVO CIRCULANTE</div>
                  <div className="ml-4 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Caixa</span>
                      <span>{formatCurrency(balancoData.ativo.circulante.caixa)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bancos</span>
                      <span>{formatCurrency(balancoData.ativo.circulante.bancos)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Aplicações Financeiras</span>
                      <span>
                        {formatCurrency(balancoData.ativo.circulante.aplicacoesFinanceiras)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contas a Receber</span>
                      <span>{formatCurrency(balancoData.ativo.circulante.contasReceber)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estoques</span>
                      <span>{formatCurrency(balancoData.ativo.circulante.estoques)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Despesas Antecipadas</span>
                      <span>
                        {formatCurrency(balancoData.ativo.circulante.despesasAntecipadas)}
                      </span>
                    </div>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold text-blue-600">
                    <span>Total do Ativo Circulante</span>
                    <span>{formatCurrency(ativoCirculanteTotal)}</span>
                  </div>
                </div>

                {/* Ativo Não Circulante */}
                <div>
                  <div className="mb-2 font-semibold text-blue-700">ATIVO NÃO CIRCULANTE</div>

                  {/* Realizável a Longo Prazo */}
                  <div className="ml-4 space-y-1 text-sm">
                    <div className="font-medium">Realizável a Longo Prazo</div>
                    <div className="ml-4 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Contas a Receber LP</span>
                        <span>
                          {formatCurrency(
                            balancoData.ativo.naoCirculante.realizavelLongoPrazo.contasReceberLP
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Depósitos Judiciais</span>
                        <span>
                          {formatCurrency(
                            balancoData.ativo.naoCirculante.realizavelLongoPrazo.depositosJudiciais
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Investimentos */}
                    <div className="mt-2 flex justify-between font-medium">
                      <span>Investimentos</span>
                      <span>
                        {formatCurrency(balancoData.ativo.naoCirculante.investimentos)}
                      </span>
                    </div>

                    {/* Imobilizado */}
                    <div className="mt-2 font-medium">Imobilizado</div>
                    <div className="ml-4 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Terrenos e Edifícios</span>
                        <span>
                          {formatCurrency(
                            balancoData.ativo.naoCirculante.imobilizado.terrenosEdificios
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Máquinas e Equipamentos</span>
                        <span>
                          {formatCurrency(
                            balancoData.ativo.naoCirculante.imobilizado.maquinasEquipamentos
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Veículos</span>
                        <span>
                          {formatCurrency(balancoData.ativo.naoCirculante.imobilizado.veiculos)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">(-) Depreciação Acumulada</span>
                        <span className="text-destructive">
                          {formatCurrency(balancoData.ativo.naoCirculante.imobilizado.depreciacao)}
                        </span>
                      </div>
                    </div>

                    {/* Intangível */}
                    <div className="mt-2 font-medium">Intangível</div>
                    <div className="ml-4 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Software</span>
                        <span>
                          {formatCurrency(balancoData.ativo.naoCirculante.intangivel.software)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Marcas e Patentes</span>
                        <span>
                          {formatCurrency(
                            balancoData.ativo.naoCirculante.intangivel.marcasPatentes
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">(-) Amortização Acumulada</span>
                        <span className="text-destructive">
                          {formatCurrency(balancoData.ativo.naoCirculante.intangivel.amortizacao)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold text-blue-600">
                    <span>Total do Ativo Não Circulante</span>
                    <span>{formatCurrency(ativoNaoCirculanteTotal)}</span>
                  </div>
                </div>

                {/* Total Ativo */}
                <div className="rounded-lg bg-blue-600 p-3 text-white">
                  <div className="flex justify-between text-lg font-bold">
                    <span>TOTAL DO ATIVO</span>
                    <span>{formatCurrency(ativoTotal)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PASSIVO E PATRIMÔNIO LÍQUIDO */}
          <Card>
            <CardContent className="p-6">
              {/* Header */}
              <div className="mb-6 border-b pb-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Gerado em {new Date().toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg bg-orange-50 p-3">
                  <h3 className="text-lg font-bold text-orange-900">PASSIVO</h3>
                </div>

                {/* Passivo Circulante */}
                <div>
                  <div className="mb-2 font-semibold text-orange-700">PASSIVO CIRCULANTE</div>
                  <div className="ml-4 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fornecedores</span>
                      <span>{formatCurrency(balancoData.passivo.circulante.fornecedores)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Salários a Pagar</span>
                      <span>{formatCurrency(balancoData.passivo.circulante.salariosPagar)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Encargos a Pagar</span>
                      <span>{formatCurrency(balancoData.passivo.circulante.encargosPagar)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Impostos a Recolher</span>
                      <span>
                        {formatCurrency(balancoData.passivo.circulante.impostosRecolher)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Empréstimos CP</span>
                      <span>{formatCurrency(balancoData.passivo.circulante.emprestimosCP)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Outras Obrigações</span>
                      <span>
                        {formatCurrency(balancoData.passivo.circulante.outrasObrigacoes)}
                      </span>
                    </div>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold text-orange-600">
                    <span>Total do Passivo Circulante</span>
                    <span>{formatCurrency(passivoCirculanteTotal)}</span>
                  </div>
                </div>

                {/* Passivo Não Circulante */}
                <div>
                  <div className="mb-2 font-semibold text-orange-700">PASSIVO NÃO CIRCULANTE</div>
                  <div className="ml-4 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Empréstimos LP</span>
                      <span>
                        {formatCurrency(balancoData.passivo.naoCirculante.emprestimosLP)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Financiamentos LP</span>
                      <span>
                        {formatCurrency(balancoData.passivo.naoCirculante.financiamentosLP)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Provisões</span>
                      <span>{formatCurrency(balancoData.passivo.naoCirculante.provisoes)}</span>
                    </div>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold text-orange-600">
                    <span>Total do Passivo Não Circulante</span>
                    <span>{formatCurrency(passivoNaoCirculanteTotal)}</span>
                  </div>
                </div>

                {/* Patrimônio Líquido */}
                <div>
                  <div className="mb-2 font-semibold text-green-700">PATRIMÔNIO LÍQUIDO</div>
                  <div className="ml-4 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Capital Social</span>
                      <span>{formatCurrency(balancoData.patrimonioLiquido.capitalSocial)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reservas de Capital</span>
                      <span>
                        {formatCurrency(balancoData.patrimonioLiquido.reservasCapital)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reservas de Lucros</span>
                      <span>{formatCurrency(balancoData.patrimonioLiquido.reservasLucros)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lucros Acumulados</span>
                      <span>
                        {formatCurrency(balancoData.patrimonioLiquido.lucrosAcumulados)}
                      </span>
                    </div>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold text-green-600">
                    <span>Total do Patrimônio Líquido</span>
                    <span>{formatCurrency(patrimonioLiquidoTotal)}</span>
                  </div>
                </div>

                {/* Total Passivo */}
                <div className="rounded-lg bg-orange-600 p-3 text-white">
                  <div className="flex justify-between text-lg font-bold">
                    <span>TOTAL DO PASSIVO + PL</span>
                    <span>{formatCurrency(passivoTotal)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Indicadores */}
        <Card>
          <CardHeader>
            <CardTitle>Indicadores Financeiros</CardTitle>
            <CardDescription>Análise de liquidez e endividamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Liquidez Corrente</span>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {liquidezCorrente.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ativo Circulante / Passivo Circulante
                </p>
              </div>
              <div className="space-y-2 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Liquidez Seca</span>
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-blue-600">{liquidezSeca.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  (Ativo Circ. - Estoques) / Passivo Circ.
                </p>
              </div>
              <div className="space-y-2 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Endividamento Total</span>
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {(endividamentoTotal * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  (Passivo Circ. + Não Circ.) / Ativo Total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
