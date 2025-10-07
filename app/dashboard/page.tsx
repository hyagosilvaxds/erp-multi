import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Package, Users, TrendingUp, ArrowUpRight, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

export default function CompanyDashboard() {
  const stats = [
    {
      title: "Vendas do Mês",
      value: "R$ 45.2k",
      change: "+20.1%",
      icon: ShoppingCart,
      description: "vs. mês anterior",
    },
    {
      title: "Produtos Ativos",
      value: "1,234",
      change: "+12",
      icon: Package,
      description: "novos este mês",
    },
    {
      title: "Clientes",
      value: "892",
      change: "+48",
      icon: Users,
      description: "novos este mês",
    },
    {
      title: "Ticket Médio",
      value: "R$ 156",
      change: "+8.3%",
      icon: DollarSign,
      description: "vs. mês anterior",
    },
  ]

  const recentSales = [
    {
      id: 1,
      customer: "João Silva",
      product: "Notebook Dell",
      value: "R$ 3.499,00",
      status: "completed",
      time: "2 min atrás",
    },
    {
      id: 2,
      customer: "Maria Santos",
      product: "Mouse Logitech",
      value: "R$ 89,90",
      status: "completed",
      time: "15 min atrás",
    },
    {
      id: 3,
      customer: "Pedro Costa",
      product: "Teclado Mecânico",
      value: "R$ 459,00",
      status: "pending",
      time: "1 hora atrás",
    },
    {
      id: 4,
      customer: "Ana Oliveira",
      product: "Monitor LG 27",
      value: "R$ 1.299,00",
      status: "completed",
      time: "2 horas atrás",
    },
  ]

  const topProducts = [
    { name: "Notebook Dell Inspiron", sales: 145, revenue: "R$ 507k", growth: 85 },
    { name: "Mouse Logitech MX", sales: 289, revenue: "R$ 26k", growth: 72 },
    { name: "Teclado Mecânico RGB", sales: 178, revenue: "R$ 82k", growth: 65 },
    { name: "Monitor LG UltraWide", sales: 92, revenue: "R$ 120k", growth: 58 },
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
          {/* 
          <Button>
            <TrendingUp className="mr-2 h-4 w-4" />
            Ver Relatório Completo
          </Button>*/}
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-0.5 font-medium text-primary">
                      <ArrowUpRight className="h-3 w-3" />
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
                  <CardDescription>Últimas transações realizadas</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/vendas">Ver todas</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{sale.customer}</p>
                        <p className="text-sm text-muted-foreground">{sale.product}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{sale.value}</p>
                      <p className="text-xs text-muted-foreground">{sale.time}</p>
                    </div>
                  </div>
                ))}
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
              {topProducts.map((product, index) => (
                <div key={product.name} className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {index + 1}
                        </span>
                        <p className="text-sm font-medium text-foreground">{product.name}</p>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {product.sales} vendas • {product.revenue}
                      </p>
                    </div>
                  </div>
                  <Progress value={product.growth} className="h-1.5" />
                </div>
              ))}
              <Button className="w-full bg-transparent" variant="outline" asChild>
                <Link href="/dashboard/produtos">Ver Todos os Produtos</Link>
              </Button>
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
