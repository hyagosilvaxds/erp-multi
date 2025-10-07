"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, CreditCard, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

// Dados mockados
const contasBancarias = [
  {
    id: 1,
    banco: "Banco do Brasil",
    codigoBanco: "001",
    agencia: "1234-5",
    conta: "12345-6",
    tipoConta: "Conta Corrente",
    saldo: 125430.5,
    ativa: true,
  },
  {
    id: 2,
    banco: "Itaú Unibanco",
    codigoBanco: "341",
    agencia: "5678-9",
    conta: "98765-4",
    tipoConta: "Conta Corrente",
    saldo: 87650.25,
    ativa: true,
  },
  {
    id: 3,
    banco: "Santander",
    codigoBanco: "033",
    agencia: "9012-3",
    conta: "54321-0",
    tipoConta: "Conta Poupança",
    saldo: 43210.75,
    ativa: true,
  },
  {
    id: 4,
    banco: "Caixa Econômica Federal",
    codigoBanco: "104",
    agencia: "4567-8",
    conta: "11111-2",
    tipoConta: "Conta Corrente",
    saldo: 0,
    ativa: false,
  },
]

export default function ContasBancarias() {
  const [mostrarSaldos, setMostrarSaldos] = useState(true)

  const saldoTotal = contasBancarias.filter((c) => c.ativa).reduce((acc, conta) => acc + conta.saldo, 0)
  const contasAtivas = contasBancarias.filter((c) => c.ativa).length

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Contas Bancárias</h1>
            <p className="text-muted-foreground">Gerencie as contas bancárias da empresa</p>
          </div>
        <Link href="/dashboard/financeiro/contas/nova">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Conta
          </Button>
        </Link>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMostrarSaldos(!mostrarSaldos)}>
              {mostrarSaldos ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {mostrarSaldos ? saldoTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "R$ •••••"}
            </div>
            <p className="text-xs text-muted-foreground">Consolidado de contas ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas Ativas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{contasAtivas}</div>
            <p className="text-xs text-muted-foreground">De {contasBancarias.length} contas cadastradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bancos</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {new Set(contasBancarias.map((c) => c.banco)).size}
            </div>
            <p className="text-xs text-muted-foreground">Instituições diferentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Contas */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Contas</CardTitle>
          <CardDescription>Lista completa de contas bancárias cadastradas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {contasBancarias.map((conta) => (
              <div
                key={conta.id}
                className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-accent/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{conta.banco}</p>
                      <Badge variant={conta.ativa ? "default" : "secondary"} className="text-xs">
                        {conta.ativa ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Ag: {conta.agencia} | Cc: {conta.conta} | {conta.tipoConta}
                    </p>
                    <p className="text-xs text-muted-foreground">Código: {conta.codigoBanco}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Saldo</p>
                    <p className="text-lg font-bold text-foreground">
                      {mostrarSaldos
                        ? conta.saldo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                        : "R$ •••••"}
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
