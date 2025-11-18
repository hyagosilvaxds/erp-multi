"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileSpreadsheet, TrendingUp, TrendingDown, Loader2, Calendar } from "lucide-react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  financialReportsApi, 
  type CashFlowItem,
  type DashboardFinancialData 
} from "@/lib/api/financial"
import { authApi } from "@/lib/api/auth"
import { useToast } from "@/hooks/use-toast"

export default function RelatoriosFinanceiros() {
  const [cashFlowData, setCashFlowData] = useState<CashFlowItem[]>([])
  const [dashboardData, setDashboardData] = useState<DashboardFinancialData | null>(null)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState<string | null>(null)
  const [dataInicio, setDataInicio] = useState(() => {
    const date = new Date()
    date.setMonth(date.getMonth() - 1)
    return date.toISOString().split('T')[0]
  })
  const [dataFim, setDataFim] = useState(() => new Date().toISOString().split('T')[0])
  const { toast } = useToast()
  const selectedCompany = authApi.getSelectedCompany()

  useEffect(() => {
    if (selectedCompany?.id) {
      loadReportData()
    }
  }, [selectedCompany?.id, dataInicio, dataFim])

  const loadReportData = async () => {
    try {
      setLoading(true)
      if (!selectedCompany?.id) {
        toast({
          title: "Erro",
          description: "Nenhuma empresa selecionada",
          variant: "destructive",
        })
        return
      }

      const [cashFlow, dashboard] = await Promise.all([
        financialReportsApi.getCashFlow({
          companyId: selectedCompany.id,
          startDate: dataInicio,
          endDate: dataFim,
        }),
        financialReportsApi.getDashboard({
          companyId: selectedCompany.id,
          startDate: dataInicio,
          endDate: dataFim,
        }),
      ])

      setCashFlowData(cashFlow)
      setDashboardData(dashboard)
    } catch (error: any) {
      console.error("Erro ao carregar relatórios:", error)
      toast({
        title: "Erro ao carregar relatórios",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const handleExportCashFlow = async () => {
    try {
      setExporting("cashflow")
      if (!selectedCompany?.id) return

      const blob = await financialReportsApi.exportCashFlow({
        companyId: selectedCompany.id,
        startDate: dataInicio,
        endDate: dataFim,
      })

      downloadBlob(blob, `fluxo-caixa-${dataInicio}-${dataFim}.xlsx`)

      toast({
        title: "Sucesso",
        description: "Relatório de fluxo de caixa exportado com sucesso",
      })
    } catch (error: any) {
      console.error("Erro ao exportar:", error)
      toast({
        title: "Erro ao exportar",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setExporting(null)
    }
  }

  const handleExportAccountsPayable = async () => {
    try {
      setExporting("payable")
      if (!selectedCompany?.id) return

      const blob = await financialReportsApi.exportAccountsPayable({
        companyId: selectedCompany.id,
        startDate: dataInicio,
        endDate: dataFim,
      })

      downloadBlob(blob, `contas-pagar-${dataInicio}-${dataFim}.xlsx`)

      toast({
        title: "Sucesso",
        description: "Contas a pagar exportadas com sucesso",
      })
    } catch (error: any) {
      console.error("Erro ao exportar:", error)
      toast({
        title: "Erro ao exportar",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setExporting(null)
    }
  }

  const handleExportAccountsReceivable = async () => {
    try {
      setExporting("receivable")
      if (!selectedCompany?.id) return

      const blob = await financialReportsApi.exportAccountsReceivable({
        companyId: selectedCompany.id,
        startDate: dataInicio,
        endDate: dataFim,
      })

      downloadBlob(blob, `contas-receber-${dataInicio}-${dataFim}.xlsx`)

      toast({
        title: "Sucesso",
        description: "Contas a receber exportadas com sucesso",
      })
    } catch (error: any) {
      console.error("Erro ao exportar:", error)
      toast({
        title: "Erro ao exportar",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setExporting(null)
    }
  }

  const handleExportByCentroCusto = async () => {
    try {
      setExporting("centrocusto")
      if (!selectedCompany?.id) return

      const blob = await financialReportsApi.exportTransactionsByCentroCusto({
        companyId: selectedCompany.id,
        startDate: dataInicio,
        endDate: dataFim,
      })

      downloadBlob(blob, `transacoes-centro-custo-${dataInicio}-${dataFim}.xlsx`)

      toast({
        title: "Sucesso",
        description: "Transações por centro de custo exportadas com sucesso",
      })
    } catch (error: any) {
      console.error("Erro ao exportar:", error)
      toast({
        title: "Erro ao exportar",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setExporting(null)
    }
  }

  const handleExportByContaContabil = async () => {
    try {
      setExporting("contacontabil")
      if (!selectedCompany?.id) return

      const blob = await financialReportsApi.exportTransactionsByContaContabil({
        companyId: selectedCompany.id,
        startDate: dataInicio,
        endDate: dataFim,
      })

      downloadBlob(blob, `transacoes-conta-contabil-${dataInicio}-${dataFim}.xlsx`)

      toast({
        title: "Sucesso",
        description: "Transações por conta contábil exportadas com sucesso",
      })
    } catch (error: any) {
      console.error("Erro ao exportar:", error)
      toast({
        title: "Erro ao exportar",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setExporting(null)
    }
  }

  const totalReceitas = dashboardData?.transactions
    .filter(t => t.type === "RECEITA")
    .reduce((acc, t) => acc + (t._sum.netAmount || 0), 0) || 0

  const totalDespesas = dashboardData?.transactions
    .filter(t => t.type === "DESPESA")
    .reduce((acc, t) => acc + (t._sum.netAmount || 0), 0) || 0

  const saldoPeriodo = totalReceitas - totalDespesas

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Relatórios Financeiros</h1>
          <p className="text-muted-foreground">Análises e exportações de dados financeiros</p>
        </div>

        {/* Filtros de Período */}
        <Card>
          <CardHeader>
            <CardTitle>Período de Análise</CardTitle>
            <CardDescription>Selecione o período para gerar os relatórios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="dataInicio">Data Inicial</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataFim">Data Final</Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <Button onClick={loadReportData} className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Atualizar Relatórios
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo Financeiro do Período */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receitas</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground">Total no período</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Despesas</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground">Total no período</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Saldo do Período</CardTitle>
                  {saldoPeriodo >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${saldoPeriodo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {saldoPeriodo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground">Receitas - Despesas</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="cashflow" className="space-y-4">
              <TabsList>
                <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
                <TabsTrigger value="payable">Contas a Pagar</TabsTrigger>
                <TabsTrigger value="receivable">Contas a Receber</TabsTrigger>
                <TabsTrigger value="centrocusto">Por Centro de Custo</TabsTrigger>
                <TabsTrigger value="contacontabil">Por Conta Contábil</TabsTrigger>
              </TabsList>

              {/* Fluxo de Caixa */}
              <TabsContent value="cashflow" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Fluxo de Caixa</CardTitle>
                        <CardDescription>Entradas e saídas no período</CardDescription>
                      </div>
                      <Button 
                        onClick={handleExportCashFlow} 
                        disabled={exporting === "cashflow"}
                      >
                        {exporting === "cashflow" ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <FileSpreadsheet className="mr-2 h-4 w-4" />
                        )}
                        Exportar Excel
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {cashFlowData.length > 0 ? (
                      <>
                        <ResponsiveContainer width="100%" height={350}>
                          <LineChart data={cashFlowData}>
                            <XAxis 
                              dataKey="date" 
                              stroke="#888888"
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis
                              stroke="#888888"
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                              tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
                            />
                            <Tooltip 
                              formatter={(value: any) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                              labelStyle={{ color: '#000' }}
                            />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="receitas" 
                              name="Receitas"
                              stroke="hsl(142, 76%, 36%)" 
                              strokeWidth={2}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="despesas" 
                              name="Despesas"
                              stroke="hsl(0, 84%, 60%)" 
                              strokeWidth={2}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="saldo" 
                              name="Saldo"
                              stroke="hsl(221, 83%, 53%)" 
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>

                        <div className="mt-6">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead className="text-right">Receitas</TableHead>
                                <TableHead className="text-right">Despesas</TableHead>
                                <TableHead className="text-right">Saldo</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {cashFlowData.slice(0, 10).map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell>{item.date}</TableCell>
                                  <TableCell className="text-right text-green-600">
                                    R$ {item.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </TableCell>
                                  <TableCell className="text-right text-red-600">
                                    R$ {item.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </TableCell>
                                  <TableCell className={`text-right font-medium ${item.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    R$ {item.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          {cashFlowData.length > 10 && (
                            <p className="mt-2 text-sm text-muted-foreground text-center">
                              Exibindo 10 de {cashFlowData.length} registros. Exporte para ver todos.
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Nenhum dado de fluxo de caixa no período selecionado</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Contas a Pagar */}
              <TabsContent value="payable" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Contas a Pagar</CardTitle>
                        <CardDescription>Todas as contas a pagar no período</CardDescription>
                      </div>
                      <Button 
                        onClick={handleExportAccountsPayable} 
                        disabled={exporting === "payable"}
                      >
                        {exporting === "payable" ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <FileSpreadsheet className="mr-2 h-4 w-4" />
                        )}
                        Exportar Excel
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Clique no botão acima para exportar o relatório completo de contas a pagar com todas as informações detalhadas.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Contas a Receber */}
              <TabsContent value="receivable" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Contas a Receber</CardTitle>
                        <CardDescription>Todas as contas a receber no período</CardDescription>
                      </div>
                      <Button 
                        onClick={handleExportAccountsReceivable} 
                        disabled={exporting === "receivable"}
                      >
                        {exporting === "receivable" ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <FileSpreadsheet className="mr-2 h-4 w-4" />
                        )}
                        Exportar Excel
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Clique no botão acima para exportar o relatório completo de contas a receber com todas as informações detalhadas.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Por Centro de Custo */}
              <TabsContent value="centrocusto" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Transações por Centro de Custo</CardTitle>
                        <CardDescription>Análise detalhada por centro de custo</CardDescription>
                      </div>
                      <Button 
                        onClick={handleExportByCentroCusto} 
                        disabled={exporting === "centrocusto"}
                      >
                        {exporting === "centrocusto" ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <FileSpreadsheet className="mr-2 h-4 w-4" />
                        )}
                        Exportar Excel
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Clique no botão acima para exportar o relatório de transações agrupadas por centro de custo com todas as informações detalhadas.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Por Conta Contábil */}
              <TabsContent value="contacontabil" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Transações por Conta Contábil</CardTitle>
                        <CardDescription>Análise detalhada por conta contábil</CardDescription>
                      </div>
                      <Button 
                        onClick={handleExportByContaContabil} 
                        disabled={exporting === "contacontabil"}
                      >
                        {exporting === "contacontabil" ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <FileSpreadsheet className="mr-2 h-4 w-4" />
                        )}
                        Exportar Excel
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Clique no botão acima para exportar o relatório de transações agrupadas por conta contábil com todas as informações detalhadas.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
