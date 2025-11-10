"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { bankAccountsApi, type BankAccount } from "@/lib/api/financial"
import { authApi } from "@/lib/api/auth"
import { useToast } from "@/hooks/use-toast"

export default function EditarConta() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [conta, setConta] = useState<BankAccount | null>(null)
  const selectedCompany = authApi.getSelectedCompany()

  const [formData, setFormData] = useState({
    accountName: "",
    pixKey: "",
    active: true,
    isMainAccount: false,
    notes: "",
  })

  useEffect(() => {
    if (selectedCompany?.id && params.id) {
      loadConta()
    }
  }, [selectedCompany?.id, params.id])

  const loadConta = async () => {
    try {
      setLoading(true)
      if (!selectedCompany?.id || !params.id) {
        toast({
          title: "Erro",
          description: "Nenhuma empresa selecionada ou conta inválida",
          variant: "destructive",
        })
        return
      }

      const data = await bankAccountsApi.getById(params.id as string, selectedCompany.id)
      setConta(data)
      
      setFormData({
        accountName: data.accountName,
        pixKey: data.pixKey || "",
        active: data.active,
        isMainAccount: data.isMainAccount,
        notes: data.notes || "",
      })
    } catch (error: any) {
      console.error("Erro ao carregar conta:", error)
      toast({
        title: "Erro ao carregar conta",
        description: error.response?.data?.message || error.message || "Ocorreu um erro ao carregar a conta bancária",
        variant: "destructive",
      })
      router.push("/dashboard/financeiro/contas")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCompany?.id || !params.id) {
      toast({
        title: "Erro",
        description: "Nenhuma empresa selecionada ou conta inválida",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      
      await bankAccountsApi.update(params.id as string, selectedCompany.id, {
        accountName: formData.accountName,
        pixKey: formData.pixKey || undefined,
        active: formData.active,
        isMainAccount: formData.isMainAccount,
        notes: formData.notes || undefined,
      })

      toast({
        title: "Sucesso",
        description: "Conta bancária atualizada com sucesso",
      })

      router.push("/dashboard/financeiro/contas")
    } catch (error: any) {
      console.error("Erro ao atualizar conta:", error)
      toast({
        title: "Erro ao atualizar conta",
        description: error.response?.data?.message || error.message || "Ocorreu um erro ao atualizar a conta bancária",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const formatAccountType = (type: string) => {
    const types: Record<string, string> = {
      CORRENTE: "Conta Corrente",
      POUPANCA: "Conta Poupança",
      SALARIO: "Conta Salário",
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

  if (!conta) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Conta não encontrada</p>
        </div>
      </DashboardLayout>
    )
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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Editar Conta Bancária</h1>
            <p className="text-muted-foreground">Atualize as informações da conta bancária</p>
          </div>
        </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
            <CardDescription>Campos editáveis da conta bancária</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informações Fixas */}
            <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-3">
              <h3 className="font-semibold text-sm">Informações Fixas (não editáveis)</h3>
              <div className="grid gap-3 md:grid-cols-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Banco:</span>
                  <p className="font-medium">{conta.bankName} ({conta.bankCode})</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tipo:</span>
                  <p className="font-medium">{formatAccountType(conta.accountType)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Agência:</span>
                  <p className="font-medium">
                    {conta.agencyNumber}{conta.agencyDigit ? `-${conta.agencyDigit}` : ''}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Conta:</span>
                  <p className="font-medium">{conta.accountNumber}-{conta.accountDigit}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Saldo Inicial:</span>
                  <p className="font-medium">
                    {conta.initialBalance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Saldo Atual:</span>
                  <p className="font-medium">
                    {conta.currentBalance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                </div>
              </div>
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
                <Button type="button" variant="outline" disabled={saving}>
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
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
