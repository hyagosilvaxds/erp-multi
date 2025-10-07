"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, ArrowUpRight, ArrowDownRight, Paperclip, Edit, Trash2, Filter } from "lucide-react"
import Link from "next/link"

// Dados mockados
const lancamentos = [
  {
    id: 1,
    tipo: "entrada",
    data: "2025-04-01",
    descricao: "Venda de Produtos - Cliente ABC",
    valor: 5000,
    contaContabil: "1.1.01 - Caixa",
    centroCusto: "Vendas",
    projeto: "Projeto Alpha",
    favorecido: "Cliente ABC Ltda",
    formaPagamento: "PIX",
    anexos: 2,
  },
  {
    id: 2,
    tipo: "saida",
    data: "2025-04-02",
    descricao: "Pagamento Fornecedor XYZ",
    valor: 3500,
    contaContabil: "2.1.01 - Fornecedores",
    centroCusto: "Compras",
    projeto: null,
    favorecido: "Fornecedor XYZ Comércio",
    formaPagamento: "TED",
    anexos: 1,
  },
  {
    id: 3,
    tipo: "saida",
    data: "2025-04-03",
    descricao: "Conta de Luz - Março/2025",
    valor: 1200,
    contaContabil: "3.1.02 - Energia Elétrica",
    centroCusto: "Administrativo",
    projeto: null,
    favorecido: "Companhia de Energia",
    formaPagamento: "Boleto",
    anexos: 1,
  },
  {
    id: 4,
    tipo: "entrada",
    data: "2025-04-04",
    descricao: "Recebimento Cliente DEF",
    valor: 2800,
    contaContabil: "1.1.02 - Banco",
    centroCusto: "Vendas",
    projeto: "Projeto Beta",
    favorecido: "Cliente DEF S.A.",
    formaPagamento: "Transferência",
    anexos: 0,
  },
]

export default function Lancamentos() {
  const [filtroTipo, setFiltroTipo] = useState("todos")
  const [dataInicio, setDataInicio] = useState("2025-04-01")
  const [dataFim, setDataFim] = useState("2025-04-30")

  const lancamentosFiltrados = lancamentos.filter((l) => {
    if (filtroTipo === "entradas") return l.tipo === "entrada"
    if (filtroTipo === "saidas") return l.tipo === "saida"
    return true
  })

  const totalEntradas = lancamentos.filter((l) => l.tipo === "entrada").reduce((acc, l) => acc + l.valor, 0)
  const totalSaidas = lancamentos.filter((l) => l.tipo === "saida").reduce((acc, l) => acc + l.valor, 0)
  const saldo = totalEntradas - totalSaidas

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
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="entradas">Entradas</SelectItem>
                  <SelectItem value="saidas">Saídas</SelectItem>
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
              <Button variant="outline" className="w-full bg-transparent">
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
              {lancamentos.filter((l) => l.tipo === "entrada").length} lançamentos
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
              {lancamentos.filter((l) => l.tipo === "saida").length} lançamentos
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
          <div className="space-y-2">
            {lancamentosFiltrados.map((lancamento) => (
              <div
                key={lancamento.id}
                className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-accent/50"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg ${lancamento.tipo === "entrada" ? "bg-green-500/10" : "bg-red-500/10"}`}
                  >
                    {lancamento.tipo === "entrada" ? (
                      <ArrowUpRight className="h-6 w-6 text-green-600" />
                    ) : (
                      <ArrowDownRight className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{lancamento.descricao}</p>
                      {lancamento.anexos > 0 && (
                        <Badge variant="outline" className="gap-1 text-xs">
                          <Paperclip className="h-3 w-3" />
                          {lancamento.anexos}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>{new Date(lancamento.data).toLocaleDateString("pt-BR")}</span>
                      <span>•</span>
                      <span>{lancamento.favorecido}</span>
                      <span>•</span>
                      <span>{lancamento.formaPagamento}</span>
                      <span>•</span>
                      <span>{lancamento.centroCusto}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{lancamento.contaContabil}</p>
                    {lancamento.projeto && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {lancamento.projeto}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${lancamento.tipo === "entrada" ? "text-green-600" : "text-red-600"}`}
                    >
                      {lancamento.tipo === "entrada" ? "+" : "-"}
                      {lancamento.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  )
}
