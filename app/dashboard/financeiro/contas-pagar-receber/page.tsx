"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Paperclip,
} from "lucide-react"
import Link from "next/link"

// Dados mockados
const contasPagar = [
  {
    id: 1,
    fornecedor: "Fornecedor ABC Ltda",
    descricao: "Compra de Materiais",
    competencia: "2025-04",
    vencimento: "2025-04-10",
    valor: 5000,
    valorPago: 0,
    status: "pendente",
    parcelas: "1/1",
    anexos: 2,
  },
  {
    id: 2,
    fornecedor: "Energia Elétrica S.A.",
    descricao: "Conta de Luz - Abril/2025",
    competencia: "2025-04",
    vencimento: "2025-04-15",
    valor: 1200,
    valorPago: 0,
    status: "pendente",
    parcelas: "1/1",
    anexos: 1,
  },
  {
    id: 3,
    fornecedor: "Fornecedor XYZ Comércio",
    descricao: "Equipamentos",
    competencia: "2025-03",
    vencimento: "2025-04-05",
    valor: 8000,
    valorPago: 0,
    status: "vencido",
    parcelas: "2/3",
    anexos: 1,
  },
  {
    id: 4,
    fornecedor: "Aluguel Escritório",
    descricao: "Aluguel - Abril/2025",
    competencia: "2025-04",
    vencimento: "2025-03-28",
    valor: 3500,
    valorPago: 3500,
    status: "pago",
    parcelas: "1/1",
    anexos: 2,
  },
]

const contasReceber = [
  {
    id: 1,
    cliente: "Cliente ABC S.A.",
    descricao: "Venda #1234",
    competencia: "2025-04",
    vencimento: "2025-04-12",
    valor: 12000,
    valorRecebido: 0,
    status: "pendente",
    parcelas: "1/2",
    anexos: 1,
  },
  {
    id: 2,
    cliente: "Cliente DEF Ltda",
    descricao: "Serviços Prestados",
    competencia: "2025-04",
    vencimento: "2025-04-08",
    valor: 5500,
    valorRecebido: 0,
    status: "pendente",
    parcelas: "1/1",
    anexos: 0,
  },
  {
    id: 3,
    cliente: "Cliente GHI Corp",
    descricao: "Venda #1235",
    competencia: "2025-03",
    vencimento: "2025-04-02",
    valor: 8000,
    valorRecebido: 0,
    status: "vencido",
    parcelas: "3/3",
    anexos: 1,
  },
  {
    id: 4,
    cliente: "Cliente JKL Ltda",
    descricao: "Projeto Alpha",
    competencia: "2025-03",
    vencimento: "2025-03-25",
    valor: 15000,
    valorRecebido: 15000,
    status: "recebido",
    parcelas: "1/1",
    anexos: 2,
  },
]

export default function ContasPagarReceber() {
  const [filtroStatus, setFiltroStatus] = useState("todos")
  const [dataInicio, setDataInicio] = useState("2025-04-01")
  const [dataFim, setDataFim] = useState("2025-04-30")

  const totalPagar = contasPagar.filter((c) => c.status !== "pago").reduce((acc, c) => acc + c.valor, 0)
  const totalReceber = contasReceber.filter((c) => c.status !== "recebido").reduce((acc, c) => acc + c.valor, 0)
  const vencidosPagar = contasPagar.filter((c) => c.status === "vencido").length
  const vencidosReceber = contasReceber.filter((c) => c.status === "vencido").length

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive"; icon: any; label: string }> = {
      pendente: { variant: "secondary", icon: Clock, label: "Pendente" },
      vencido: { variant: "destructive", icon: AlertCircle, label: "Vencido" },
      pago: { variant: "default", icon: CheckCircle, label: "Pago" },
      recebido: { variant: "default", icon: CheckCircle, label: "Recebido" },
    }
    const config = variants[status]
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="gap-1 text-xs">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Contas a Pagar/Receber</h1>
            <p className="text-muted-foreground">Gerencie títulos a pagar e receber</p>
        </div>
        <Link href="/dashboard/financeiro/contas-pagar-receber/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Título
          </Button>
        </Link>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total a Pagar</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totalPagar.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
            <p className="text-xs text-muted-foreground">
              {contasPagar.filter((c) => c.status !== "pago").length} títulos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total a Receber</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalReceber.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
            <p className="text-xs text-muted-foreground">
              {contasReceber.filter((c) => c.status !== "recebido").length} títulos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos a Pagar</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{vencidosPagar}</div>
            <p className="text-xs text-muted-foreground">Títulos em atraso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos a Receber</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{vencidosReceber}</div>
            <p className="text-xs text-muted-foreground">Títulos em atraso</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendente">Pendentes</SelectItem>
                  <SelectItem value="vencido">Vencidos</SelectItem>
                  <SelectItem value="pago">Pagos/Recebidos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Vencimento Início</Label>
              <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Vencimento Fim</Label>
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

      {/* Tabs Pagar/Receber */}
      <Tabs defaultValue="pagar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pagar">Contas a Pagar</TabsTrigger>
          <TabsTrigger value="receber">Contas a Receber</TabsTrigger>
        </TabsList>

        <TabsContent value="pagar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Títulos a Pagar</CardTitle>
              <CardDescription>Compromissos financeiros com fornecedores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contasPagar.map((conta) => (
                  <div
                    key={conta.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10">
                        <ArrowDownRight className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{conta.fornecedor}</p>
                          {getStatusBadge(conta.status)}
                          {conta.anexos > 0 && (
                            <Badge variant="outline" className="gap-1 text-xs">
                              <Paperclip className="h-3 w-3" />
                              {conta.anexos}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{conta.descricao}</p>
                        <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Venc: {new Date(conta.vencimento).toLocaleDateString("pt-BR")}
                          </span>
                          <span>Parcela: {conta.parcelas}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-600">
                          {conta.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                        {conta.valorPago > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Pago: {conta.valorPago.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </p>
                        )}
                      </div>
                      {conta.status !== "pago" && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="default">
                            <DollarSign className="mr-1 h-4 w-4" />
                            Pagar Agora
                          </Button>
                          <Button size="sm" variant="outline">
                            <Clock className="mr-1 h-4 w-4" />
                            Agendar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receber" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Títulos a Receber</CardTitle>
              <CardDescription>Valores a receber de clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contasReceber.map((conta) => (
                  <div
                    key={conta.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                        <ArrowUpRight className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{conta.cliente}</p>
                          {getStatusBadge(conta.status)}
                          {conta.anexos > 0 && (
                            <Badge variant="outline" className="gap-1 text-xs">
                              <Paperclip className="h-3 w-3" />
                              {conta.anexos}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{conta.descricao}</p>
                        <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Venc: {new Date(conta.vencimento).toLocaleDateString("pt-BR")}
                          </span>
                          <span>Parcela: {conta.parcelas}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          {conta.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                        {conta.valorRecebido > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Recebido:{" "}
                            {conta.valorRecebido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </p>
                        )}
                      </div>
                      {conta.status !== "recebido" && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="default">
                            <DollarSign className="mr-1 h-4 w-4" />
                            Receber Agora
                          </Button>
                          <Button size="sm" variant="outline">
                            <Clock className="mr-1 h-4 w-4" />
                            Agendar
                          </Button>
                        </div>
                      )}
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
