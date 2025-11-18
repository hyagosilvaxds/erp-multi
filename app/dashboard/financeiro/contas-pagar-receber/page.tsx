"use client"

import { useState, useEffect } from "react"
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
  Loader2,
  Edit,
  Trash2,
  ShoppingCart,
} from "lucide-react"
import Link from "next/link"
import { 
  accountsPayableApi, 
  accountsReceivableApi,
  type AccountPayable,
  type AccountReceivable,
  type PayableStatus,
  type ReceivableStatus
} from "@/lib/api/financial"
import { authApi } from "@/lib/api/auth"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function ContasPagarReceber() {
  const [contasPagar, setContasPagar] = useState<AccountPayable[]>([])
  const [contasReceber, setContasReceber] = useState<AccountReceivable[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState<string>("todos")
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")
  const { toast } = useToast()
  const router = useRouter()
  const selectedCompany = authApi.getSelectedCompany()

  useEffect(() => {
    if (selectedCompany?.id) {
      loadData()
    }
  }, [selectedCompany?.id])

  const loadData = async () => {
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
      
      if (dataInicio) params.startDate = dataInicio
      if (dataFim) params.endDate = dataFim
      if (filtroStatus && filtroStatus !== "todos") {
        params.status = filtroStatus.toUpperCase()
      }

      const [pagarData, receberData] = await Promise.all([
        accountsPayableApi.getAll(params),
        accountsReceivableApi.getAll(params),
      ])

      setContasPagar(pagarData)
      setContasReceber(receberData)
    } catch (error: any) {
      console.error("Erro ao carregar contas:", error)
      toast({
        title: "Erro ao carregar contas",
        description: error.response?.data?.message || error.message || "Ocorreu um erro ao carregar as contas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePagar = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta conta a pagar?")) return

    try {
      if (!selectedCompany?.id) return
      await accountsPayableApi.delete(id, selectedCompany.id)
      toast({
        title: "Sucesso",
        description: "Conta a pagar excluída com sucesso",
      })
      loadData()
    } catch (error: any) {
      toast({
        title: "Erro ao excluir conta",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    }
  }

  const handleDeleteReceber = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta conta a receber?")) return

    try {
      if (!selectedCompany?.id) return
      await accountsReceivableApi.delete(id, selectedCompany.id)
      toast({
        title: "Sucesso",
        description: "Conta a receber excluída com sucesso",
      })
      loadData()
    } catch (error: any) {
      toast({
        title: "Erro ao excluir conta",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    }
  }

  const totalPagar = contasPagar
    .filter((c) => c.status !== "PAGO")
    .reduce((acc, c) => acc + c.remainingAmount, 0)
  
  const totalReceber = contasReceber
    .filter((c) => c.status !== "RECEBIDO")
    .reduce((acc, c) => acc + c.remainingAmount, 0)
  
  const vencidosPagar = contasPagar.filter((c) => c.status === "VENCIDO").length
  const vencidosReceber = contasReceber.filter((c) => c.status === "VENCIDO").length

  const getStatusBadge = (status: PayableStatus | ReceivableStatus) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any; label: string }> = {
      PENDENTE: { variant: "secondary", icon: Clock, label: "Pendente" },
      VENCIDO: { variant: "destructive", icon: AlertCircle, label: "Vencido" },
      PAGO: { variant: "default", icon: CheckCircle, label: "Pago" },
      RECEBIDO: { variant: "default", icon: CheckCircle, label: "Recebido" },
      PARCIAL: { variant: "outline", icon: Clock, label: "Parcial" },
      CANCELADO: { variant: "outline", icon: AlertCircle, label: "Cancelado" },
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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Contas a Pagar/Receber</h1>
            <p className="text-muted-foreground">Gerencie títulos a pagar e receber</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/financeiro/contas-pagar-receber/nova-pagar">
              <Button variant="outline" className="gap-2">
                <ArrowDownRight className="h-4 w-4 text-red-500" />
                Nova Conta a Pagar
              </Button>
            </Link>
            <Link href="/dashboard/financeiro/contas-pagar-receber/nova-receber">
              <Button className="gap-2">
                <ArrowUpRight className="h-4 w-4" />
                Nova Conta a Receber
              </Button>
            </Link>
          </div>
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
              {contasPagar.filter((c) => c.status !== "PAGO").length} títulos
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
              {contasReceber.filter((c) => c.status !== "RECEBIDO").length} títulos
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
              <Button onClick={loadData} variant="outline" className="w-full bg-transparent">
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
              {contasPagar.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma conta a pagar encontrada
                </div>
              ) : (
                <div className="space-y-3">
                  {contasPagar.map((conta) => (
                    <div
                      key={conta.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-accent/50"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10">
                          <ArrowDownRight className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">{conta.supplierName}</p>
                            {getStatusBadge(conta.status)}
                            {conta.attachments && conta.attachments.length > 0 && (
                              <Badge variant="outline" className="gap-1 text-xs">
                                <Paperclip className="h-3 w-3" />
                                {conta.attachments.length}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{conta.description}</p>
                          <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Venc: {new Date(conta.dueDate).toLocaleDateString("pt-BR")}
                            </span>
                            <span>Parcela: {conta.installmentNumber}/{conta.totalInstallments}</span>
                            {conta.documentNumber && <span>Doc: {conta.documentNumber}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-600">
                            {conta.remainingAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </p>
                          {conta.paidAmount > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Pago: {conta.paidAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {conta.status !== "PAGO" && conta.status !== "CANCELADO" && (
                            <Button size="sm" variant="default">
                              <DollarSign className="mr-1 h-4 w-4" />
                              Pagar
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => router.push(`/dashboard/financeiro/contas-pagar-receber/${conta.id}`)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeletePagar(conta.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              {contasReceber.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma conta a receber encontrada
                </div>
              ) : (
                <div className="space-y-3">
                  {contasReceber.map((conta) => (
                    <div
                      key={conta.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-accent/50"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                          <ArrowUpRight className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">{conta.customerName}</p>
                            {getStatusBadge(conta.status)}
                            {conta.sale && (
                              <Badge variant="outline" className="gap-1 text-xs bg-blue-50 text-blue-700 border-blue-200">
                                <ShoppingCart className="h-3 w-3" />
                                Venda #{conta.sale.code}
                              </Badge>
                            )}
                            {conta.attachments && conta.attachments.length > 0 && (
                              <Badge variant="outline" className="gap-1 text-xs">
                                <Paperclip className="h-3 w-3" />
                                {conta.attachments.length}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{conta.description}</p>
                          <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Venc: {new Date(conta.dueDate).toLocaleDateString("pt-BR")}
                            </span>
                            <span>Parcela: {conta.installmentNumber}/{conta.totalInstallments}</span>
                            {conta.documentNumber && <span>Doc: {conta.documentNumber}</span>}
                            {conta.sale && (
                              <span className="text-blue-600 font-medium">
                                Venda Total: {conta.sale.totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            {conta.remainingAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </p>
                          {conta.receivedAmount > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Recebido: {conta.receivedAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {conta.sale && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => conta.sale && router.push(`/dashboard/vendas/${conta.sale.id}`)}
                              className="gap-1"
                            >
                              <ShoppingCart className="h-3 w-3" />
                              Ver Venda
                            </Button>
                          )}
                          {conta.status !== "RECEBIDO" && conta.status !== "CANCELADO" && (
                            <Button size="sm" variant="default">
                              <DollarSign className="mr-1 h-4 w-4" />
                              Receber
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => router.push(`/dashboard/financeiro/contas-pagar-receber/${conta.id}`)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteReceber(conta.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </DashboardLayout>
  )
}
