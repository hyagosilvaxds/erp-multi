"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, LinkIcon, Plus, Search, FileText } from "lucide-react"
import { Separator } from "@/components/ui/separator"

// Dados mockados
const linhasExtrato = [
  {
    id: 1,
    data: "2025-04-01",
    descricao: "PIX RECEBIDO - CLIENTE ABC LTDA",
    valor: 5000,
    tipo: "credito",
    conciliado: false,
    sugestoes: [
      { id: 101, descricao: "Venda #1234 - Cliente ABC", valor: 5000, similaridade: 95 },
      { id: 102, descricao: "Recebimento Cliente ABC", valor: 5000, similaridade: 85 },
    ],
  },
  {
    id: 2,
    data: "2025-04-02",
    descricao: "TED ENVIADO - FORNECEDOR XYZ COMERCIO",
    valor: -3500,
    tipo: "debito",
    conciliado: false,
    sugestoes: [
      { id: 201, descricao: "Pagamento Fornecedor XYZ", valor: 3500, similaridade: 90 },
      { id: 202, descricao: "Compra #5678 - XYZ", valor: 3500, similaridade: 80 },
    ],
  },
  {
    id: 3,
    data: "2025-04-03",
    descricao: "PAGAMENTO BOLETO ENERGIA ELETRICA",
    valor: -1200,
    tipo: "debito",
    conciliado: true,
    lancamentoVinculado: { id: 301, descricao: "Conta de Luz - Março/2025" },
  },
  {
    id: 4,
    data: "2025-04-04",
    descricao: "PIX RECEBIDO - JOAO SILVA",
    valor: 850,
    tipo: "credito",
    conciliado: false,
    sugestoes: [],
  },
]

export default function Conciliacao() {
  const [contaSelecionada, setContaSelecionada] = useState("")
  const [periodoInicio, setPeriodoInicio] = useState("2025-04-01")
  const [periodoFim, setPeriodoFim] = useState("2025-04-30")
  const [filtro, setFiltro] = useState("todos")
  const [linhaSelecionada, setLinhaSelecionada] = useState<number | null>(null)

  const linhasFiltradas = linhasExtrato.filter((linha) => {
    if (filtro === "conciliados") return linha.conciliado
    if (filtro === "pendentes") return !linha.conciliado
    return true
  })

  const totalPendentes = linhasExtrato.filter((l) => !l.conciliado).length
  const totalConciliados = linhasExtrato.filter((l) => l.conciliado).length
  const taxaConciliacao = Math.round((totalConciliados / linhasExtrato.length) * 100)

  const handleConciliar = (linhaId: number, lancamentoId: number) => {
    console.log("[v0] Conciliando linha", linhaId, "com lançamento", lancamentoId)
    // Aqui você faria a chamada à API
  }

  const handleDesconciliar = (linhaId: number) => {
    console.log("[v0] Desconciliando linha", linhaId)
    // Aqui você faria a chamada à API
  }

  const handleCriarLancamento = (linhaId: number | null) => {
    console.log("[v0] Criando lançamento para linha", linhaId)
    // Aqui você redirecionaria para o formulário de novo lançamento
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Conciliação Bancária</h1>
          <p className="text-muted-foreground">Concilie extratos bancários com lançamentos financeiros</p>
        </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Conta Bancária</Label>
              <Select value={contaSelecionada} onValueChange={setContaSelecionada}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bb-1234">Banco do Brasil - 1234-5</SelectItem>
                  <SelectItem value="itau-5678">Itaú - 5678-9</SelectItem>
                  <SelectItem value="santander-9012">Santander - 9012-3</SelectItem>
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
              <Label>Status</Label>
              <Select value={filtro} onValueChange={setFiltro}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendentes">Pendentes</SelectItem>
                  <SelectItem value="conciliados">Conciliados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conciliação</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{taxaConciliacao}%</div>
            <p className="text-xs text-muted-foreground">
              {totalConciliados} de {linhasExtrato.length} linhas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalPendentes}</div>
            <p className="text-xs text-muted-foreground">Linhas aguardando conciliação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conciliados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalConciliados}</div>
            <p className="text-xs text-muted-foreground">Linhas já conciliadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Área de Conciliação */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Linhas do Extrato */}
        <Card>
          <CardHeader>
            <CardTitle>Linhas do Extrato</CardTitle>
            <CardDescription>Selecione uma linha para ver sugestões de conciliação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {linhasFiltradas.map((linha) => (
                <button
                  key={linha.id}
                  onClick={() => setLinhaSelecionada(linha.id)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    linhaSelecionada === linha.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-accent/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={linha.conciliado ? "default" : "secondary"} className="text-xs">
                          {linha.conciliado ? (
                            <>
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Conciliado
                            </>
                          ) : (
                            <>
                              <XCircle className="mr-1 h-3 w-3" />
                              Pendente
                            </>
                          )}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(linha.data).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-foreground">{linha.descricao}</p>
                      {linha.conciliado && linha.lancamentoVinculado && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <LinkIcon className="h-3 w-3" />
                          {linha.lancamentoVinculado.descricao}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-bold ${linha.tipo === "credito" ? "text-green-600" : "text-red-600"}`}
                      >
                        {Math.abs(linha.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sugestões de Lançamentos */}
        <Card>
          <CardHeader>
            <CardTitle>Lançamentos Sugeridos</CardTitle>
            <CardDescription>
              {linhaSelecionada
                ? "Selecione um lançamento para conciliar ou crie um novo"
                : "Selecione uma linha do extrato"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {linhaSelecionada ? (
              <div className="space-y-3">
                {linhasExtrato
                  .find((l) => l.id === linhaSelecionada)
                  ?.sugestoes?.map((sugestao) => (
                    <div
                      key={sugestao.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-accent/50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">{sugestao.descricao}</p>
                          <Badge variant="outline" className="text-xs">
                            {sugestao.similaridade}% match
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {sugestao.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                      </div>
                      <Button size="sm" onClick={() => handleConciliar(linhaSelecionada, sugestao.id)}>
                        <LinkIcon className="mr-2 h-4 w-4" />
                        Conciliar
                      </Button>
                    </div>
                  ))}

                {(linhasExtrato.find((l) => l.id === linhaSelecionada)?.sugestoes?.length ?? 0) === 0 && (
                  <div className="rounded-lg border border-dashed border-border p-6 text-center">
                    <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Nenhum lançamento sugerido</p>
                    <p className="text-xs text-muted-foreground">Crie um novo lançamento para esta transação</p>
                  </div>
                )}

                <Separator />

                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => handleCriarLancamento(linhaSelecionada)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Novo Lançamento
                </Button>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border">
                <div className="text-center">
                  <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-sm text-muted-foreground">Selecione uma linha do extrato</p>
                  <p className="text-xs text-muted-foreground">para ver as sugestões de conciliação</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </DashboardLayout>
  )
}
