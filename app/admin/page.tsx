"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { companiesApi, type CompanyAdmin } from "@/lib/api/auth"
import { useToast } from "@/hooks/use-toast"

export default function AdminDashboard() {
  const { toast } = useToast()
  const [companies, setCompanies] = useState<CompanyAdmin[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      const response = await companiesApi.getAllCompanies()
      
      console.log('📦 Response da API:', response)
      
      // Garantir que sempre temos um array
      const data = Array.isArray(response) ? response : (response as any)?.data || []
      setCompanies(data)
    } catch (error: any) {
      toast({
        title: "Erro ao carregar empresas",
        description: error.message,
        variant: "destructive",
      })
      setCompanies([]) // Garantir array vazio em caso de erro
    } finally {
      setLoading(false)
    }
  }

  // Calcular estatísticas
  const totalCompanies = companies.length
  const activeCompanies = companies.filter((c) => c.active).length
  const totalUsers = companies.reduce((sum, c) => sum + c._count.users, 0)
  
  // Últimas 5 empresas cadastradas
  const recentCompanies = [...companies]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const stats = [
    {
      title: "Total de Empresas",
      value: loading ? "..." : totalCompanies.toString(),
      change: `${activeCompanies} ativas`,
      trend: "up" as const,
      icon: Building2,
      description: "empresas cadastradas",
    },
    {
      title: "Usuários Ativos",
      value: loading ? "..." : totalUsers.toString(),
      change: `em ${totalCompanies} empresas`,
      trend: "up" as const,
      icon: Users,
      description: "usuários no sistema",
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
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Carregando empresas...
                  </div>
                ) : recentCompanies.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma empresa cadastrada
                  </div>
                ) : (
                  recentCompanies.map((company) => (
                    <div
                      key={company.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          {company.logoUrl ? (
                            <img
                              src={company.logoUrl}
                              alt={company.nomeFantasia}
                              className="h-full w-full rounded-lg object-cover"
                            />
                          ) : (
                            <Building2 className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{company.nomeFantasia}</p>
                          <p className="text-sm text-muted-foreground">
                            {company._count.users} {company._count.users === 1 ? "usuário" : "usuários"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">CNPJ: {company.cnpj}</p>
                        </div>
                        <Badge variant={company.active ? "default" : "secondary"}>
                          {company.situacaoCadastral}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Distribuição de planos ocultada */}
        </div>
      </div>
    </DashboardLayout>
  )
}
