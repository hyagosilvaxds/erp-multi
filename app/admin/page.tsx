import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total de Empresas",
      value: "248",
      trend: "up",
      icon: Building2,
      description: "vs. mês anterior",
    },
    {
      title: "Usuários Ativos",
    value: "12,543",
    change: "+8.2%",
      trend: "up",
      icon: Users,
      description: "vs. mês anterior",
    },
  // Receita Mensal e Taxa de Crescimento ocultadas conforme solicitado
  ]

  const recentCompanies = [
    {
      id: 1,
      name: "Tech Solutions Ltda",
    users: 45,
    status: "active",
    },
    {
      id: 2,
      name: "Comércio Digital SA",
    users: 23,
    status: "active",
    },
    {
      id: 3,
      name: "Indústria ABC",
    users: 67,
    status: "active",
    },
    {
      id: 4,
      name: "Serviços XYZ",
    users: 8,
    status: "trial",
    },
    {
      id: 5,
      name: "Logística Express",
    users: 34,
    status: "active",
      
    },
  ]


  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Admin</h1>
          <p className="text-muted-foreground">Visão geral da plataforma SaaS</p>
        </div>

  {/* Stats Grid */}
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
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
                    <span
                      className={`flex items-center gap-0.5 font-medium ${stat.trend === "up" ? "text-primary" : "text-destructive"}`}
                    >
                      {stat.trend === "up" ? (
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

  <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Companies */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Empresas Recentes</CardTitle>
                  <CardDescription>Últimas empresas cadastradas na plataforma</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/empresas">Ver todas</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCompanies.map((company) => (
                  <div
                    key={company.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{company.name}</p>
                        <p className="text-sm text-muted-foreground">{company.users} usuários</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        {/* receita ocultada */}
                      </div>
                      <Badge variant={company.status === "active" ? "default" : "secondary"}>
                        {company.status === "active" ? "Ativo" : "Trial"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Distribuição de planos ocultada */}
        </div>
      </div>
    </DashboardLayout>
  )
}
