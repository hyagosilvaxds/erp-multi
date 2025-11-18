"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, ArrowUpRight, ArrowDownRight, Paperclip, Edit, Trash2, Filter, Loader2, CheckCircle } from "lucide-react"
import Link from "next/link"
import { financialTransactionsApi, type FinancialTransaction, type CategoryType } from "@/lib/api/financial"
import { authApi } from "@/lib/api/auth"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function Lancamentos() {
  const [lancamentos, setLancamentos] = useState<FinancialTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState<"todos" | CategoryType | "">("todos")
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")
  const { toast } = useToast()
  const router = useRouter()
  const selectedCompany = authApi.getSelectedCompany()

  useEffect(() => {
    if (selectedCompany?.id) {
      loadLancamentos()
    }
  }, [selectedCompany?.id])

  const loadLancamentos = async () => {
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

      const params: any = { companyId: selectedCompany.id }
      
      if (filtroTipo && filtroTipo !== "todos") {
        params.type = filtroTipo
      }
      if (dataInicio) {
        params.startDate = dataInicio
      }
      if (dataFim) {
        params.endDate = dataFim
      }

      const data = await financialTransactionsApi.getAll(params)
      setLancamentos(data)
    } catch (error: any) {
      console.error("Erro ao carregar lançamentos:", error)
      toast({
        title: "Erro ao carregar lançamentos",
        description: error.response?.data?.message || error.message || "Ocorreu um erro ao carregar os lançamentos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este lançamento? O saldo da conta bancária será revertido.")) {
      return
    }

    try {
      if (!selectedCompany?.id) {
        toast({
          title: "Erro",
          description: "Nenhuma empresa selecionada",
          variant: "destructive",
        })
        return
      }

      await financialTransactionsApi.delete(id, selectedCompany.id)
      
      toast({
        title: "Sucesso",
        description: "Lançamento excluído com sucesso",
      })
      
      loadLancamentos()
    } catch (error: any) {
      console.error("Erro ao excluir lançamento:", error)
      toast({
        title: "Erro ao excluir lançamento",
        description: error.response?.data?.message || error.message || "Ocorreu um erro ao excluir o lançamento",
        variant: "destructive",
      })
    }
  }

  const handleReconcile = async (id: string, currentStatus: boolean) => {
    try {
      if (!selectedCompany?.id) {
        toast({
          title: "Erro",
          description: "Nenhuma empresa selecionada",
          variant: "destructive",
        })
        return
      }

      await financialTransactionsApi.reconcile(id, selectedCompany.id)
      
      toast({
        title: "Sucesso",
        description: currentStatus ? "Lançamento desconciliado" : "Lançamento conciliado com sucesso",
      })
      
      loadLancamentos()
    } catch (error: any) {
      console.error("Erro ao conciliar lançamento:", error)
      toast({
        title: "Erro ao conciliar lançamento",
        description: error.response?.data?.message || error.message || "Ocorreu um erro ao conciliar o lançamento",
        variant: "destructive",
      })
    }
  }

  const handleApplyFilters = () => {
    loadLancamentos()
  }

  const totalEntradas = lancamentos
    .filter((l) => l.type === "RECEITA")
    .reduce((acc, l) => acc + l.netAmount, 0)
  
  const totalSaidas = lancamentos
    .filter((l) => l.type === "DESPESA")
    .reduce((acc, l) => acc + l.netAmount, 0)
  
  const saldo = totalEntradas - totalSaidas

  const formatTransactionType = (type: string) => {
    const types: Record<string, string> = {
      DINHEIRO: "Dinheiro",
      TRANSFERENCIA: "Transferência",
      BOLETO: "Boleto",
      CARTAO_CREDITO: "Cartão Crédito",
      CARTAO_DEBITO: "Cartão Débito",
      PIX: "PIX",
      CHEQUE: "Cheque",
      OUTROS: "Outros",
    }
    return types[type] || type
  }

  if (loading) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Livro Caixa</h1>
            <p className="text-muted-foreground">Gerencie todos os lançamentos financeiros</p>
        </div>
        <Link href="/dashboard/financeiro/lancamentos/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Lançamento
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={filtroTipo} onValueChange={(value) => setFiltroTipo(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="RECEITA">Receitas</SelectItem>
                  <SelectItem value="DESPESA">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full bg-transparent" onClick={handleApplyFilters}>
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entradas</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalEntradas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
            <p className="text-xs text-muted-foreground">
              {lancamentos.filter((l) => l.type === "RECEITA").length} lançamentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saídas</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totalSaidas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
            <p className="text-xs text-muted-foreground">
              {lancamentos.filter((l) => l.type === "DESPESA").length} lançamentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Período</CardTitle>
            <ArrowUpRight className={`h-4 w-4 ${saldo >= 0 ? "text-green-500" : "text-red-500"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldo >= 0 ? "text-green-600" : "text-red-600"}`}>
              {saldo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
            <p className="text-xs text-muted-foreground">Entradas - Saídas</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Lançamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Lançamentos</CardTitle>
          <CardDescription>Histórico completo de movimentações</CardDescription>
        </CardHeader>
        <CardContent>
          {lancamentos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum lançamento encontrado</p>
              <Link href="/dashboard/financeiro/lancamentos/novo">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar primeiro lançamento
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {lancamentos.map((lancamento) => (
                <div
                  key={lancamento.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-accent/50"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-lg ${lancamento.type === "RECEITA" ? "bg-green-500/10" : "bg-red-500/10"}`}
                    >
                      {lancamento.type === "RECEITA" ? (
                        <ArrowUpRight className="h-6 w-6 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-6 w-6 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{lancamento.description}</p>
                        {lancamento.reconciled && (
                          <Badge variant="outline" className="gap-1 text-xs bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3" />
                            Conciliado
                          </Badge>
                        )}
                        {lancamento.attachments && lancamento.attachments.length > 0 && (
                          <Badge variant="outline" className="gap-1 text-xs">
                            <Paperclip className="h-3 w-3" />
                            {lancamento.attachments.length}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>{new Date(lancamento.transactionDate).toLocaleDateString("pt-BR")}</span>
                        <span>•</span>
                        <span>{formatTransactionType(lancamento.transactionType)}</span>
                        {lancamento.category && (
                          <>
                            <span>•</span>
                            <span>{lancamento.category.name}</span>
                          </>
                        )}
                        {lancamento.bankAccount && (
                          <>
                            <span>•</span>
                            <span>{lancamento.bankAccount.accountName}</span>
                          </>
                        )}
                        {lancamento.centroCusto && (
                          <>
                            <span>•</span>
                            <span>CC: {lancamento.centroCusto.codigo} - {lancamento.centroCusto.nome}</span>
                          </>
                        )}
                        {lancamento.contaContabil && (
                          <>
                            <span>•</span>
                            <span>Conta: {lancamento.contaContabil.codigo} - {lancamento.contaContabil.nome}</span>
                          </>
                        )}
                      </div>
                      {lancamento.referenceNumber && (
                        <p className="mt-1 text-xs text-muted-foreground">Ref: {lancamento.referenceNumber}</p>
                      )}
                      {lancamento.documentNumber && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          Doc: {lancamento.documentNumber}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${lancamento.type === "RECEITA" ? "text-green-600" : "text-red-600"}`}
                      >
                        {lancamento.type === "RECEITA" ? "+" : "-"}
                        {lancamento.netAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                      {lancamento.fees > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Taxas: {lancamento.fees.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleReconcile(lancamento.id, lancamento.reconciled)}
                        title={lancamento.reconciled ? "Desconciliar" : "Conciliar"}
                      >
                        <CheckCircle className={`h-4 w-4 ${lancamento.reconciled ? "text-green-600" : ""}`} />
                      </Button>
                      <Link href={`/dashboard/financeiro/lancamentos/${lancamento.id}`}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(lancamento.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  )
}
