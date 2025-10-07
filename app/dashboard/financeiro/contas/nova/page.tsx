"use client"

import type React from "react"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const bancosBrasileiros = [
  { codigo: "001", nome: "Banco do Brasil" },
  { codigo: "033", nome: "Santander" },
  { codigo: "104", nome: "Caixa Econômica Federal" },
  { codigo: "237", nome: "Bradesco" },
  { codigo: "341", nome: "Itaú Unibanco" },
  { codigo: "077", nome: "Banco Inter" },
  { codigo: "260", nome: "Nubank" },
  { codigo: "290", nome: "PagSeguro" },
  { codigo: "323", nome: "Mercado Pago" },
  { codigo: "336", nome: "C6 Bank" },
]

export default function NovaConta() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    banco: "",
    codigoBanco: "",
    agencia: "",
    digitoAgencia: "",
    conta: "",
    digitoConta: "",
    tipoConta: "",
    saldoInicial: "",
    ativa: true,
  })

  const handleBancoChange = (value: string) => {
    const banco = bancosBrasileiros.find((b) => b.codigo === value)
    setFormData({
      ...formData,
      codigoBanco: value,
      banco: banco?.nome || "",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Salvando conta bancária:", formData)
    // Aqui você faria a chamada à API
    router.push("/dashboard/financeiro/contas")
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/financeiro/contas">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Nova Conta Bancária</h1>
            <p className="text-muted-foreground">Cadastre uma nova conta bancária para a empresa</p>
          </div>
        </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
            <CardDescription>Preencha os dados da conta bancária</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Banco */}
            <div className="space-y-2">
              <Label htmlFor="banco">Banco *</Label>
              <Select value={formData.codigoBanco} onValueChange={handleBancoChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o banco" />
                </SelectTrigger>
                <SelectContent>
                  {bancosBrasileiros.map((banco) => (
                    <SelectItem key={banco.codigo} value={banco.codigo}>
                      {banco.codigo} - {banco.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Agência */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="agencia">Agência *</Label>
                <Input
                  id="agencia"
                  placeholder="1234"
                  value={formData.agencia}
                  onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="digitoAgencia">Dígito da Agência</Label>
                <Input
                  id="digitoAgencia"
                  placeholder="5"
                  maxLength={1}
                  value={formData.digitoAgencia}
                  onChange={(e) => setFormData({ ...formData, digitoAgencia: e.target.value })}
                />
              </div>
            </div>

            {/* Conta */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="conta">Número da Conta *</Label>
                <Input
                  id="conta"
                  placeholder="12345"
                  value={formData.conta}
                  onChange={(e) => setFormData({ ...formData, conta: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="digitoConta">Dígito da Conta *</Label>
                <Input
                  id="digitoConta"
                  placeholder="6"
                  maxLength={2}
                  value={formData.digitoConta}
                  onChange={(e) => setFormData({ ...formData, digitoConta: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Tipo de Conta */}
            <div className="space-y-2">
              <Label htmlFor="tipoConta">Tipo de Conta *</Label>
              <Select
                value={formData.tipoConta}
                onValueChange={(value) => setFormData({ ...formData, tipoConta: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corrente">Conta Corrente</SelectItem>
                  <SelectItem value="poupanca">Conta Poupança</SelectItem>
                  <SelectItem value="investimento">Conta Investimento</SelectItem>
                  <SelectItem value="pagamento">Conta Pagamento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Saldo Inicial */}
            <div className="space-y-2">
              <Label htmlFor="saldoInicial">Saldo Inicial</Label>
              <Input
                id="saldoInicial"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.saldoInicial}
                onChange={(e) => setFormData({ ...formData, saldoInicial: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Informe o saldo atual da conta para iniciar o controle</p>
            </div>

            {/* Conta Ativa */}
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="ativa">Conta Ativa</Label>
                <p className="text-sm text-muted-foreground">
                  Contas inativas não aparecem nos lançamentos e relatórios
                </p>
              </div>
              <Switch
                id="ativa"
                checked={formData.ativa}
                onCheckedChange={(checked) => setFormData({ ...formData, ativa: checked })}
              />
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3">
              <Link href="/dashboard/financeiro/contas">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Salvar Conta
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
      </div>
    </DashboardLayout>
  )
}
