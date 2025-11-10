"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, CreditCard, Edit, Trash2, Eye, EyeOff, Loader2 } from "lucide-react"
import Link from "next/link"
import { bankAccountsApi, type BankAccount } from "@/lib/api/financial"
import { authApi } from "@/lib/api/auth"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function ContasBancarias() {
  const [mostrarSaldos, setMostrarSaldos] = useState(true)
  const [contas, setContas] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  const selectedCompany = authApi.getSelectedCompany()

  useEffect(() => {
    if (selectedCompany?.id) {
      loadContas()
    }
  }, [selectedCompany?.id])

  const loadContas = async () => {
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
      const data = await bankAccountsApi.getAll(selectedCompany.id)
      setContas(data)
    } catch (error: any) {
      console.error("Erro ao carregar contas:", error)
      toast({
        title: "Erro ao carregar contas",
        description: error.response?.data?.message || error.message || "Ocorreu um erro ao carregar as contas bancárias",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta conta bancária?")) {
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

      await bankAccountsApi.delete(id, selectedCompany.id)
      
      toast({
        title: "Sucesso",
        description: "Conta bancária excluída com sucesso",
      })
      
      loadContas()
    } catch (error: any) {
      console.error("Erro ao excluir conta:", error)
      toast({
        title: "Erro ao excluir conta",
        description: error.response?.data?.message || error.message || "Ocorreu um erro ao excluir a conta bancária",
        variant: "destructive",
      })
    }
  }

  const saldoTotal = contas.filter((c) => c.active).reduce((acc, conta) => acc + conta.currentBalance, 0)
  const contasAtivas = contas.filter((c) => c.active).length

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
            <p className="text-xs text-muted-foreground">De {contas.length} contas cadastradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bancos</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {new Set(contas.map((c) => c.bankName)).size}
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
          {contas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma conta bancária cadastrada</p>
              <Link href="/dashboard/financeiro/contas/nova">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Cadastrar primeira conta
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {contas.map((conta) => (
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
                        <p className="font-semibold text-foreground">{conta.bankName}</p>
                        <Badge variant={conta.active ? "default" : "secondary"} className="text-xs">
                          {conta.active ? "Ativa" : "Inativa"}
                        </Badge>
                        {conta.isMainAccount && (
                          <Badge variant="outline" className="text-xs">
                            Principal
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Ag: {conta.agencyNumber}{conta.agencyDigit ? `-${conta.agencyDigit}` : ''} | Cc: {conta.accountNumber}-{conta.accountDigit} | {formatAccountType(conta.accountType)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Código: {conta.bankCode} | {conta.accountName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Saldo</p>
                      <p className="text-lg font-bold text-foreground">
                        {mostrarSaldos
                          ? conta.currentBalance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                          : "R$ •••••"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/financeiro/contas/${conta.id}`}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(conta.id)}
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
