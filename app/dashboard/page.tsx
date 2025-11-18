"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Package, Users, TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { salesApi, DashboardStats } from "@/lib/api/sales"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/masks"

export default function CompanyDashboard() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      setLoading(true)
      const data = await salesApi.getDashboardStats()
      setStats(data)
    } catch (error: any) {
      toast({
        title: "Erro ao carregar estatísticas",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "agora"
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h atrás`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d atrás`
  }

  if (loading) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  if (!stats) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Não foi possível carregar as estatísticas</p>
        </div>
      </DashboardLayout>
    )
  }

  const dashboardCards = [
    {
      title: "Vendas do Mês",
      value: formatCurrency(stats.metrics.sales.current),
      change: stats.metrics.sales.changePercent,
      changeValue: stats.metrics.sales.change,
      icon: ShoppingCart,
      description: "vs. mês anterior",
    },
    {
      title: "Produtos Ativos",
      value: stats.metrics.products.current.toString(),
      change: stats.metrics.products.changePercent,
      changeValue: stats.metrics.products.change,
      icon: Package,
      description: "vs. mês anterior",
    },
    {
      title: "Clientes",
      value: stats.metrics.customers.current.toString(),
      change: stats.metrics.customers.changePercent,
      changeValue: stats.metrics.customers.change,
      icon: Users,
      description: "vs. mês anterior",
    },
    {
      title: "Ticket Médio",
      value: formatCurrency(stats.metrics.averageTicket.current),
      change: stats.metrics.averageTicket.changePercent,
      changeValue: stats.metrics.averageTicket.change,
      icon: DollarSign,
      description: "vs. mês anterior",
    },
  ]

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Bem-vindo de volta! Aqui está o resumo do seu negócio.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {dashboardCards.map((stat) => {
            const Icon = stat.icon
            const isPositive = stat.changeValue >= 0
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className={`flex items-center gap-0.5 font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {stat.change}
                    </span>
                    <span>{stat.description}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Sales */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Vendas Recentes</CardTitle>
                  <CardDescription>Últimas vendas confirmadas</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/vendas">Ver todas</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentSales.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma venda confirmada ainda
                  </p>
                ) : (
                  stats.recentSales.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <ShoppingCart className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{sale.customer.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {sale.code} • {sale.paymentMethod.name}
                            {sale.installments > 1 && ` • ${sale.installments}x`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">{formatCurrency(sale.totalAmount)}</p>
                        <p className="text-sm text-muted-foreground">{getTimeAgo(sale.confirmedAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Produtos em Destaque</CardTitle>
              <CardDescription>Mais vendidos do mês</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {stats.topProducts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum produto vendido ainda
                </p>
              ) : (
                stats.topProducts.map((item, index) => {
                  const maxQuantity = Math.max(...stats.topProducts.map(p => p.quantitySold))
                  const progressPercentage = (item.quantitySold / maxQuantity) * 100
                  
                  return (
                    <div key={item.product.id} className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                              {index + 1}
                            </span>
                            <p className="text-sm font-medium text-foreground">{item.product.name}</p>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {item.quantitySold} unidades • {item.salesCount} vendas
                          </p>
                        </div>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesse rapidamente as funcionalidades mais usadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent">
                <Link href="/dashboard/vendas/nova">
                  <ShoppingCart className="h-6 w-6" />
                  <span>Nova Venda</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent">
                <Link href="/dashboard/produtos/novo">
                  <Package className="h-6 w-6" />
                  <span>Novo Produto</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent">
                <Link href="/dashboard/clientes/novo">
                  <Users className="h-6 w-6" />
                  <span>Novo Cliente</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent">
                <Link href="/dashboard/relatorios">
                  <TrendingUp className="h-6 w-6" />
                  <span>Relatórios</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
