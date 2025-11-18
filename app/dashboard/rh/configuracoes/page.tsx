'use client'

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Building2, 
  UserPlus, 
  Receipt, 
  Users, 
  DollarSign, 
  FileText,
  Settings,
  ArrowRight,
  Calculator,
  Briefcase,
  Network
} from "lucide-react"
import Link from "next/link"

export default function ConfiguracoesRHPage() {
  const sections = [
    {
      title: "Estrutura Organizacional",
      description: "Configure a estrutura da empresa e organize os colaboradores",
      icon: Network,
      items: [
        {
          icon: Building2,
          title: "Departamentos",
          description: "Organize a empresa em departamentos hierárquicos com gerentes responsáveis",
          href: "/dashboard/rh/departamentos",
          stats: "Estrutura hierárquica",
          color: "text-blue-600"
        },
        {
          icon: UserPlus,
          title: "Cargos",
          description: "Defina cargos com descrições, faixas salariais e códigos CBO",
          href: "/dashboard/rh/cargos",
          stats: "Com faixas salariais",
          color: "text-purple-600"
        },
      ]
    },
    {
      title: "Tabelas Fiscais",
      description: "Configure alíquotas e faixas para cálculo da folha de pagamento",
      icon: Calculator,
      items: [
        {
          icon: Receipt,
          title: "Tabelas Fiscais",
          description: "Gerencie tabelas de INSS, FGTS e IRRF atualizadas por período",
          href: "/dashboard/rh/tabelas-fiscais",
          stats: "INSS, FGTS, IRRF",
          color: "text-green-600"
        },
      ]
    },
    {
      title: "Cadastros",
      description: "Gerencie colaboradores e informações relacionadas",
      icon: Briefcase,
      items: [
        {
          icon: Users,
          title: "Colaboradores",
          description: "Cadastro completo de colaboradores com dados pessoais, profissionais e bancários",
          href: "/dashboard/rh/colaboradores",
          stats: "Cadastro completo",
          color: "text-indigo-600"
        },
        {
          icon: DollarSign,
          title: "Proventos & Descontos",
          description: "Configure proventos (adicionais) e descontos aplicados na folha",
          href: "/dashboard/rh/proventos-descontos",
          stats: "Personalizáveis",
          color: "text-yellow-600"
        },
      ]
    },
    {
      title: "Processamento",
      description: "Processe e gerencie a folha de pagamento",
      icon: FileText,
      items: [
        {
          icon: FileText,
          title: "Folha de Pagamento",
          description: "Processe, calcule e gerencie folhas de pagamento mensais",
          href: "/dashboard/rh/folha",
          stats: "Cálculo automático",
          color: "text-red-600"
        },
      ]
    },
  ]

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações do RH</h1>
          <p className="text-muted-foreground">
            Acesse todas as configurações e cadastros do módulo de Recursos Humanos
          </p>
        </div>

        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <section.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{section.title}</h2>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {section.items.map((item, itemIndex) => (
                <Link key={itemIndex} href={item.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-lg bg-background", item.color)}>
                            <item.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{item.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">{item.stats}</span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}

        <Card className="border-dashed">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Configurações Avançadas</CardTitle>
                <CardDescription>
                  Recursos e configurações adicionais do módulo de RH
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg border">
                <h3 className="font-semibold mb-2">Centro de Custo</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Organize custos por centros e projetos
                </p>
                <Link href="/dashboard/financeiro">
                  <Button variant="outline" size="sm">
                    Acessar
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>

              <div className="p-4 rounded-lg border">
                <h3 className="font-semibold mb-2">Políticas</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Configure políticas de RH e compliance
                </p>
                <Button variant="outline" size="sm" disabled>
                  Em breve
                </Button>
              </div>

              <div className="p-4 rounded-lg border">
                <h3 className="font-semibold mb-2">Integrações</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Conecte com sistemas externos de RH
                </p>
                <Button variant="outline" size="sm" disabled>
                  Em breve
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">Fluxo de Trabalho Recomendado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Configure a Estrutura</p>
                  <p className="text-sm text-muted-foreground">
                    Comece criando os departamentos e cargos da sua empresa
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Configure as Tabelas Fiscais</p>
                  <p className="text-sm text-muted-foreground">
                    Cadastre as tabelas de INSS, FGTS e IRRF vigentes
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Cadastre Proventos e Descontos</p>
                  <p className="text-sm text-muted-foreground">
                    Defina os proventos e descontos que serão usados na folha
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  4
                </div>
                <div>
                  <p className="font-medium">Cadastre os Colaboradores</p>
                  <p className="text-sm text-muted-foreground">
                    Adicione os colaboradores vinculando-os aos departamentos e cargos
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  5
                </div>
                <div>
                  <p className="font-medium">Processe a Folha de Pagamento</p>
                  <p className="text-sm text-muted-foreground">
                    Gere e processe as folhas de pagamento mensais
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
