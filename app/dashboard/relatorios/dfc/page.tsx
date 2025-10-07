"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Download, FileText, Building2, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"

const dfcData = {
  operacional: {
    lucroLiquido: 162750,
    ajustes: {
      depreciacaoAmortizacao: 70000,
      provisoes: 25000,
    },
    variacoesCapitalGiro: {
      contasReceber: -45000,
      estoques: 18000,
      fornecedores: 32000,
      impostos: -12000,
    },
  },
  investimento: {
    aquisicaoImobilizado: -180000,
    vendasAtivos: 35000,
  },
  financiamento: {
    novasContratacoes: 250000,
    amortizacoes: -85000,
    dividendosPagos: -120000,
  },
}

export default function DFCPage() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
  }

  const fluxoOperacional =
    dfcData.operacional.lucroLiquido +
    Object.values(dfcData.operacional.ajustes).reduce((a, b) => a + b, 0) +
    Object.values(dfcData.operacional.variacoesCapitalGiro).reduce((a, b) => a + b, 0)

  const fluxoInvestimento = Object.values(dfcData.investimento).reduce((a, b) => a + b, 0)
  const fluxoFinanciamento = Object.values(dfcData.financiamento).reduce((a, b) => a + b, 0)
  const fluxoCaixaTotal = fluxoOperacional + fluxoInvestimento + fluxoFinanciamento

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/relatorios">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">DFC - Demonstração do Fluxo de Caixa</h1>
              <p className="text-muted-foreground">Método indireto</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline"><FileText className="mr-2 h-4 w-4" />PDF</Button>
            <Button variant="outline"><Download className="mr-2 h-4 w-4" />Excel</Button>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle>Filtros</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Mês</Label>
                <Select defaultValue="01">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="01">Janeiro</SelectItem>
                    <SelectItem value="02">Fevereiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ano</Label>
                <Select defaultValue="2024">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-6 border-b pb-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Empresa Demo LTDA</h2>
                  <p className="text-sm text-muted-foreground">DFC - Janeiro/2024</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Atividades Operacionais */}
              <div>
                <div className="mb-2 font-semibold text-blue-700">ATIVIDADES OPERACIONAIS</div>
                <div className="ml-4 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Lucro Líquido do Exercício</span>
                    <span>{formatCurrency(dfcData.operacional.lucroLiquido)}</span>
                  </div>
                  <div className="mt-2 font-medium">Ajustes:</div>
                  <div className="ml-4 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Depreciação e Amortização</span>
                      <span>{formatCurrency(dfcData.operacional.ajustes.depreciacaoAmortizacao)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Provisões</span>
                      <span>{formatCurrency(dfcData.operacional.ajustes.provisoes)}</span>
                    </div>
                  </div>
                  <div className="mt-2 font-medium">Variações no Capital de Giro:</div>
                  <div className="ml-4 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contas a Receber</span>
                      <span className={dfcData.operacional.variacoesCapitalGiro.contasReceber < 0 ? "text-destructive" : ""}>
                        {formatCurrency(dfcData.operacional.variacoesCapitalGiro.contasReceber)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estoques</span>
                      <span>{formatCurrency(dfcData.operacional.variacoesCapitalGiro.estoques)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fornecedores</span>
                      <span>{formatCurrency(dfcData.operacional.variacoesCapitalGiro.fornecedores)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Impostos a Recolher</span>
                      <span className={dfcData.operacional.variacoesCapitalGiro.impostos < 0 ? "text-destructive" : ""}>
                        {formatCurrency(dfcData.operacional.variacoesCapitalGiro.impostos)}
                      </span>
                    </div>
                  </div>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold text-blue-600">
                  <span>Caixa Gerado pelas Operações</span>
                  <span>{formatCurrency(fluxoOperacional)}</span>
                </div>
              </div>

              <Separator />

              {/* Atividades de Investimento */}
              <div>
                <div className="mb-2 font-semibold text-purple-700">ATIVIDADES DE INVESTIMENTO</div>
                <div className="ml-4 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Aquisição de Imobilizado</span>
                    <span className="text-destructive">{formatCurrency(dfcData.investimento.aquisicaoImobilizado)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Venda de Ativos</span>
                    <span>{formatCurrency(dfcData.investimento.vendasAtivos)}</span>
                  </div>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold text-purple-600">
                  <span>Caixa Usado em Investimentos</span>
                  <span className={fluxoInvestimento < 0 ? "text-destructive" : ""}>{formatCurrency(fluxoInvestimento)}</span>
                </div>
              </div>

              <Separator />

              {/* Atividades de Financiamento */}
              <div>
                <div className="mb-2 font-semibold text-orange-700">ATIVIDADES DE FINANCIAMENTO</div>
                <div className="ml-4 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Novas Contratações</span>
                    <span>{formatCurrency(dfcData.financiamento.novasContratacoes)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amortizações</span>
                    <span className="text-destructive">{formatCurrency(dfcData.financiamento.amortizacoes)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dividendos Pagos</span>
                    <span className="text-destructive">{formatCurrency(dfcData.financiamento.dividendosPagos)}</span>
                  </div>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold text-orange-600">
                  <span>Caixa de Financiamentos</span>
                  <span>{formatCurrency(fluxoFinanciamento)}</span>
                </div>
              </div>

              <Separator className="border-2" />

              {/* Variação Total */}
              <div className="rounded-lg bg-primary/5 p-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>VARIAÇÃO LÍQUIDA DE CAIXA</span>
                  <span className={fluxoCaixaTotal >= 0 ? "text-green-600" : "text-destructive"}>
                    {formatCurrency(fluxoCaixaTotal)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Operacional</span>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <div className="mt-2 text-2xl font-bold text-green-600">{formatCurrency(fluxoOperacional)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Investimento</span>
                <TrendingDown className="h-4 w-4 text-purple-500" />
              </div>
              <div className="mt-2 text-2xl font-bold text-purple-600">{formatCurrency(fluxoInvestimento)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Financiamento</span>
                <TrendingUp className="h-4 w-4 text-orange-500" />
              </div>
              <div className="mt-2 text-2xl font-bold text-orange-600">{formatCurrency(fluxoFinanciamento)}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
