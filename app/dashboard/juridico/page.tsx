import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Scale, FileText, AlertTriangle, CheckCircle2, Clock, TrendingUp, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function JuridicoDashboard() {
  const stats = [
    {
      title: "Contratos Ativos",
      value: "127",
      change: "+12",
      icon: FileText,
      description: "contratos vigentes",
      color: "text-blue-500",
    },
    {
      title: "Processos em Andamento",
      value: "23",
      change: "-3",
      icon: Scale,
      description: "processos ativos",
      color: "text-orange-500",
    },
    {
      title: "Contratos a Vencer",
      value: "8",
      change: "próximos 30 dias",
      icon: AlertTriangle,
      description: "necessitam renovação",
      color: "text-yellow-500",
    },
    {
      title: "Processos Ganhos",
      value: "15",
      change: "+5 este ano",
      icon: CheckCircle2,
      description: "decisões favoráveis",
      color: "text-green-500",
    },
  ]

  const contratosRecentes = [
    {
      id: 1,
      numero: "CONT-2024-0127",
      tipo: "Prestação de Serviços",
      parte: "Tech Solutions Ltda",
      valor: "R$ 45.000,00",
      dataInicio: "15/03/2024",
      dataVencimento: "15/03/2025",
      status: "ativo",
      diasRestantes: 162,
    },
    {
      id: 2,
      numero: "CONT-2024-0089",
      tipo: "Fornecimento",
      parte: "Materiais ABC S.A.",
      valor: "R$ 120.000,00",
      dataInicio: "01/01/2024",
      dataVencimento: "31/12/2024",
      status: "a-vencer",
      diasRestantes: 28,
    },
    {
      id: 3,
      numero: "CONT-2023-0245",
      tipo: "Locação",
      parte: "Imobiliária Prime",
      valor: "R$ 8.500,00/mês",
      dataInicio: "10/08/2023",
      dataVencimento: "10/08/2025",
      status: "ativo",
      diasRestantes: 310,
    },
  ]

  const processosRecentes = [
    {
      id: 1,
      numero: "0001234-56.2024.5.02.0001",
      tipo: "Trabalhista",
      parte: "João da Silva",
      vara: "1ª Vara do Trabalho - SP",
      status: "em-andamento",
      ultimaMovimentacao: "Audiência agendada",
      data: "28/09/2024",
      risco: "médio",
    },
    {
      id: 2,
      numero: "0007890-12.2024.8.26.0100",
      tipo: "Cível",
      parte: "Empresa XYZ Ltda",
      vara: "3ª Vara Cível - SP",
      status: "aguardando-sentenca",
      ultimaMovimentacao: "Conclusos para sentença",
      data: "25/09/2024",
      risco: "baixo",
    },
    {
      id: 3,
      numero: "0002468-90.2023.4.03.6100",
      tipo: "Tributário",
      parte: "União Federal",
      vara: "2ª Vara Federal - SP",
      status: "em-recurso",
      ultimaMovimentacao: "Apelação interposta",
      data: "20/09/2024",
      risco: "alto",
    },
  ]

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      ativo: { label: "Ativo", variant: "default" },
      "a-vencer": { label: "A Vencer", variant: "destructive" },
      vencido: { label: "Vencido", variant: "destructive" },
      "em-andamento": { label: "Em Andamento", variant: "default" },
      "aguardando-sentenca": { label: "Aguardando Sentença", variant: "secondary" },
      "em-recurso": { label: "Em Recurso", variant: "outline" },
    }
    const config = statusConfig[status] || { label: status, variant: "outline" as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getRiscoBadge = (risco: string) => {
    const riscoConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      baixo: { label: "Baixo", variant: "default" },
      medio: { label: "Médio", variant: "secondary" },
      alto: { label: "Alto", variant: "destructive" },
    }
    const config = riscoConfig[risco] || { label: risco, variant: "outline" as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Jurídico</h1>
            <p className="text-muted-foreground">Gestão de contratos e processos</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/juridico/contratos/novo">
              <Button>
                <FileText className="mr-2 h-4 w-4" />
                Novo Contrato
              </Button>
            </Link>
            <Link href="/dashboard/juridico/processos/novo">
              <Button variant="outline">
                <Scale className="mr-2 h-4 w-4" />
                Novo Processo
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.change && <span className="font-medium">{stat.change}</span>} {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contratos Recentes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Contratos Recentes</CardTitle>
                <CardDescription>Últimos contratos cadastrados e contratos próximos ao vencimento</CardDescription>
              </div>
              <Link href="/dashboard/juridico/contratos">
                <Button variant="outline" size="sm">
                  Ver todos
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contratosRecentes.map((contrato) => (
                <div key={contrato.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{contrato.numero}</p>
                        {getStatusBadge(contrato.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{contrato.tipo} - {contrato.parte}</p>
                      <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Valor: {contrato.valor}</span>
                        <span>Vencimento: {contrato.dataVencimento}</span>
                        <span className={contrato.diasRestantes < 60 ? "text-orange-500 font-medium" : ""}>
                          {contrato.diasRestantes} dias restantes
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {contrato.diasRestantes < 60 && (
                      <Badge variant="outline" className="text-orange-500">
                        <Clock className="mr-1 h-3 w-3" />
                        Renovar em breve
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/juridico/contratos/${contrato.id}`}>Detalhes</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Processos Recentes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Processos em Andamento</CardTitle>
                <CardDescription>Últimas movimentações e processos que requerem atenção</CardDescription>
              </div>
              <Link href="/dashboard/juridico/processos">
                <Button variant="outline" size="sm">
                  Ver todos
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {processosRecentes.map((processo) => (
                <div key={processo.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                      <Scale className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{processo.numero}</p>
                        {getStatusBadge(processo.status)}
                        {getRiscoBadge(processo.risco)}
                      </div>
                      <p className="text-sm text-muted-foreground">{processo.tipo} - {processo.parte}</p>
                      <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{processo.vara}</span>
                        <span>•</span>
                        <span>{processo.ultimaMovimentacao}</span>
                        <span>•</span>
                        <span>{processo.data}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/juridico/processos/${processo.id}`}>Detalhes</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resumo Mensal */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Contratos por Tipo</CardTitle>
              <CardDescription>Distribuição de contratos ativos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>Prestação de Serviços</span>
                  <span className="font-medium">45 (35%)</span>
                </div>
                <Progress value={35} className="h-2" />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>Fornecimento</span>
                  <span className="font-medium">38 (30%)</span>
                </div>
                <Progress value={30} className="h-2" />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>Locação</span>
                  <span className="font-medium">25 (20%)</span>
                </div>
                <Progress value={20} className="h-2" />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>Outros</span>
                  <span className="font-medium">19 (15%)</span>
                </div>
                <Progress value={15} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Processos por Tipo</CardTitle>
              <CardDescription>Distribuição de processos ativos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>Trabalhista</span>
                  <span className="font-medium">10 (43%)</span>
                </div>
                <Progress value={43} className="h-2" />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>Cível</span>
                  <span className="font-medium">7 (30%)</span>
                </div>
                <Progress value={30} className="h-2" />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>Tributário</span>
                  <span className="font-medium">4 (18%)</span>
                </div>
                <Progress value={18} className="h-2" />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>Outros</span>
                  <span className="font-medium">2 (9%)</span>
                </div>
                <Progress value={9} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
