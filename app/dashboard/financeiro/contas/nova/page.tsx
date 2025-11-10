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
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { bankAccountsApi, type AccountType } from "@/lib/api/financial"
import { authApi } from "@/lib/api/auth"
import { useToast } from "@/hooks/use-toast"

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
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const selectedCompany = authApi.getSelectedCompany()

  const [formData, setFormData] = useState({
    bankName: "",
    bankCode: "",
    agencyNumber: "",
    agencyDigit: "",
    accountNumber: "",
    accountDigit: "",
    accountType: "" as AccountType | "",
    accountName: "",
    pixKey: "",
    initialBalance: "",
    active: true,
    isMainAccount: false,
    notes: "",
  })

  const handleBancoChange = (value: string) => {
    const banco = bancosBrasileiros.find((b) => b.codigo === value)
    setFormData({
      ...formData,
      bankCode: value,
      bankName: banco?.nome || "",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCompany?.id) {
      toast({
        title: "Erro",
        description: "Nenhuma empresa selecionada",
        variant: "destructive",
      })
      return
    }

    if (!formData.accountType) {
      toast({
        title: "Erro",
        description: "Selecione o tipo de conta",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      
      await bankAccountsApi.create({
        companyId: selectedCompany.id,
        bankName: formData.bankName,
        bankCode: formData.bankCode,
        agencyNumber: formData.agencyNumber,
        agencyDigit: formData.agencyDigit || undefined,
        accountNumber: formData.accountNumber,
        accountDigit: formData.accountDigit,
        accountType: formData.accountType as AccountType,
        accountName: formData.accountName,
        pixKey: formData.pixKey || undefined,
        initialBalance: parseFloat(formData.initialBalance) || 0,
        active: formData.active,
        isMainAccount: formData.isMainAccount,
        notes: formData.notes || undefined,
      })

      toast({
        title: "Sucesso",
        description: "Conta bancária cadastrada com sucesso",
      })

      router.push("/dashboard/financeiro/contas")
    } catch (error: any) {
      console.error("Erro ao criar conta:", error)
      toast({
        title: "Erro ao criar conta",
        description: error.response?.data?.message || error.message || "Ocorreu um erro ao criar a conta bancária",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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
              <Select value={formData.bankCode} onValueChange={handleBancoChange} required>
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

            {/* Nome da Conta */}
            <div className="space-y-2">
              <Label htmlFor="accountName">Nome da Conta *</Label>
              <Input
                id="accountName"
                placeholder="Ex: Conta Principal"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">Nome para identificar a conta no sistema</p>
            </div>

            {/* Agência */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="agencia">Agência *</Label>
                <Input
                  id="agencia"
                  placeholder="1234"
                  value={formData.agencyNumber}
                  onChange={(e) => setFormData({ ...formData, agencyNumber: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="digitoAgencia">Dígito da Agência</Label>
                <Input
                  id="digitoAgencia"
                  placeholder="5"
                  maxLength={1}
                  value={formData.agencyDigit}
                  onChange={(e) => setFormData({ ...formData, agencyDigit: e.target.value })}
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
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="digitoConta">Dígito da Conta *</Label>
                <Input
                  id="digitoConta"
                  placeholder="6"
                  maxLength={2}
                  value={formData.accountDigit}
                  onChange={(e) => setFormData({ ...formData, accountDigit: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Tipo de Conta */}
            <div className="space-y-2">
              <Label htmlFor="tipoConta">Tipo de Conta *</Label>
              <Select
                value={formData.accountType}
                onValueChange={(value) => setFormData({ ...formData, accountType: value as AccountType })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CORRENTE">Conta Corrente</SelectItem>
                  <SelectItem value="POUPANCA">Conta Poupança</SelectItem>
                  <SelectItem value="SALARIO">Conta Salário</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Chave PIX */}
            <div className="space-y-2">
              <Label htmlFor="pixKey">Chave PIX</Label>
              <Input
                id="pixKey"
                placeholder="Digite a chave PIX"
                value={formData.pixKey}
                onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">CPF/CNPJ, e-mail, telefone ou chave aleatória</p>
            </div>

            {/* Saldo Inicial */}
            <div className="space-y-2">
              <Label htmlFor="saldoInicial">Saldo Inicial</Label>
              <Input
                id="saldoInicial"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.initialBalance}
                onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Informe o saldo atual da conta para iniciar o controle</p>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Informações adicionais sobre a conta..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            {/* Conta Principal */}
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="isMainAccount">Conta Principal</Label>
                <p className="text-sm text-muted-foreground">
                  Definir esta como a conta principal da empresa
                </p>
              </div>
              <Switch
                id="isMainAccount"
                checked={formData.isMainAccount}
                onCheckedChange={(checked) => setFormData({ ...formData, isMainAccount: checked })}
              />
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
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3">
              <Link href="/dashboard/financeiro/contas">
                <Button type="button" variant="outline" disabled={loading}>
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Conta
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
      </div>
    </DashboardLayout>
  )
}
