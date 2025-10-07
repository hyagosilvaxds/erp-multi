"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Download, FileText, TrendingUp, Users, Lock, Eye } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Dados mockados - Investidor só vê projetos autorizados
const INVESTIDOR_ATUAL = {
  id: "inv-1",
  nome: "João Silva",
  projetosAutorizados: ["alpha", "beta"], // Só pode ver Alpha e Beta
}

// Projetos disponíveis
const todosOsProjetos = [
  { id: "alpha", nome: "Projeto Alpha", status: "autorizado", investimento: 75000, retorno: 3500 },
  { id: "beta", nome: "Projeto Beta", status: "autorizado", investimento: 50000, retorno: 2500 },
  { id: "gamma", nome: "Projeto Gamma", status: "restrito", investimento: null, retorno: null },
  { id: "delta", nome: "Projeto Delta", status: "restrito", investimento: null, retorno: null },
]

// Relatórios autorizados para este investidor
const relatoriosAutorizados = [
  { id: 1, nome: "Demonstração de Resultados - Projeto Alpha", projeto: "alpha", periodo: "T1 2025", disponivel: true },
  { id: 2, nome: "Fluxo de Caixa - Projeto Alpha", projeto: "alpha", periodo: "T1 2025", disponivel: true },
  { id: 3, nome: "Demonstração de Resultados - Projeto Beta", projeto: "beta", periodo: "T1 2025", disponivel: true },
  { id: 4, nome: "Balancete - Projeto Beta", projeto: "beta", periodo: "T1 2025", disponivel: false },
]

// Aportes e Distribuições do investidor
const meuInvestimento = {
  aportes: [
    { data: "2025-01-15", projeto: "Projeto Alpha", valor: 50000, tipo: "Capital Social" },
    { data: "2025-03-10", projeto: "Projeto Alpha", valor: 25000, tipo: "Aumento de Capital" },
    { data: "2025-01-15", projeto: "Projeto Beta", valor: 50000, tipo: "Capital Social" },
  ],
  distribuicoes: [
    { data: "2025-04-01", projeto: "Projeto Alpha", valor: 2000, tipo: "Dividendos" },
    { data: "2025-04-01", projeto: "Projeto Alpha", valor: 1500, tipo: "JCP" },
    { data: "2025-04-01", projeto: "Projeto Beta", valor: 2500, tipo: "Dividendos" },
  ],
  totalAportes: 125000,
  totalDistribuicoes: 6000,
}

export default function RelatoriosInvestidor() {
  const [tentativaAcessoNegado, setTentativaAcessoNegado] = useState(false)

  const handleBaixarRelatorio = (relatorio: any) => {
    if (!relatorio.disponivel) {
      setTentativaAcessoNegado(true)
      setTimeout(() => setTentativaAcessoNegado(false), 3000)
      return
    }
    console.log("[v0] Investidor", INVESTIDOR_ATUAL.nome, "baixando relatório:", relatorio.nome)
    // Implementação real faria download
  }

  const handleTentarAcessarProjeto = (projetoId: string) => {
    if (!INVESTIDOR_ATUAL.projetosAutorizados.includes(projetoId)) {
      setTentativaAcessoNegado(true)
      setTimeout(() => setTentativaAcessoNegado(false), 3000)
      return
    }
    console.log("[v0] Acessando projeto:", projetoId)
  }

  const projetosVisiveis = todosOsProjetos.filter((p) => INVESTIDOR_ATUAL.projetosAutorizados.includes(p.id))
  const projetosRestritos = todosOsProjetos.filter((p) => !INVESTIDOR_ATUAL.projetosAutorizados.includes(p.id))

  return (
    <DashboardLayout userRole="investor">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Portal do Investidor</h1>
          <p className="text-muted-foreground">Bem-vindo, {INVESTIDOR_ATUAL.nome}</p>
        </div>

        {/* Alerta de Acesso Negado */}
        {tentativaAcessoNegado && (
          <Alert variant="destructive">
            <Lock className="h-4 w-4" />
            <AlertTitle>Acesso Negado</AlertTitle>
            <AlertDescription>
              Você não tem permissão para acessar este recurso. Entre em contato com o administrador se achar que
              deveria ter acesso.
            </AlertDescription>
          </Alert>
        )}

        {/* Meus Projetos */}
        <Card>
          <CardHeader>
            <CardTitle>Meus Projetos</CardTitle>
            <CardDescription>Projetos em que você possui participação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {projetosVisiveis.map((projeto) => (
                <Card key={projeto.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{projeto.nome}</h3>
                          <Badge variant="default" className="gap-1">
                            <Eye className="h-3 w-3" />
                            Autorizado
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Investimento: {projeto.investimento?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                        <p className="text-sm text-green-600">
                          Retorno: {projeto.retorno?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                      </div>
                      <Button size="sm" onClick={() => handleTentarAcessarProjeto(projeto.id)}>
                        Ver Detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Projetos Restritos - Apenas indica que existem mas não pode acessar */}
            {projetosRestritos.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-muted-foreground">Outros projetos da empresa:</p>
                <div className="space-y-2">
                  {projetosRestritos.map((projeto) => (
                    <div
                      key={projeto.id}
                      className="flex items-center justify-between rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{projeto.nome}</span>
                        <Badge variant="secondary">Acesso Restrito</Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled
                        onClick={() => handleTentarAcessarProjeto(projeto.id)}
                      >
                        Sem Acesso
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Meu Investimento */}
        <Card>
          <CardHeader>
            <CardTitle>Meu Investimento</CardTitle>
            <CardDescription>Resumo dos seus aportes e distribuições</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-sm text-muted-foreground">Total Investido</div>
                  <div className="text-2xl font-bold text-foreground">
                    {meuInvestimento.totalAportes.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-sm text-muted-foreground">Total Recebido</div>
                  <div className="text-2xl font-bold text-green-600">
                    {meuInvestimento.totalDistribuicoes.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-sm text-muted-foreground">ROI</div>
                  <div className="text-2xl font-bold text-primary">
                    {((meuInvestimento.totalDistribuicoes / meuInvestimento.totalAportes) * 100).toFixed(2)}%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Histórico de Movimentações */}
            <div className="mt-6 space-y-4">
              <div>
                <h4 className="mb-3 font-semibold">Aportes Realizados</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Projeto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {meuInvestimento.aportes.map((aporte, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{new Date(aporte.data).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell>{aporte.projeto}</TableCell>
                        <TableCell>{aporte.tipo}</TableCell>
                        <TableCell className="text-right font-medium">
                          {aporte.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div>
                <h4 className="mb-3 font-semibold">Distribuições Recebidas</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Projeto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {meuInvestimento.distribuicoes.map((dist, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{new Date(dist.data).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell>{dist.projeto}</TableCell>
                        <TableCell>{dist.tipo}</TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {dist.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Relatórios Disponíveis */}
        <Card>
          <CardHeader>
            <CardTitle>Relatórios Liberados</CardTitle>
            <CardDescription>Documentos financeiros disponíveis para download</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Relatório</TableHead>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatoriosAutorizados.map((relatorio) => (
                  <TableRow key={relatorio.id}>
                    <TableCell className="font-medium">{relatorio.nome}</TableCell>
                    <TableCell>{relatorio.projeto}</TableCell>
                    <TableCell>{relatorio.periodo}</TableCell>
                    <TableCell>
                      {relatorio.disponivel ? (
                        <Badge variant="default" className="gap-1">
                          <Eye className="h-3 w-3" />
                          Disponível
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <Lock className="h-3 w-3" />
                          Em Aprovação
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={relatorio.disponivel ? "default" : "secondary"}
                        onClick={() => handleBaixarRelatorio(relatorio)}
                        disabled={!relatorio.disponivel}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Baixar PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Informações de Compliance */}
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertTitle>Privacidade e Segurança</AlertTitle>
          <AlertDescription>
            Você tem acesso apenas aos projetos nos quais possui participação. Todos os acessos são registrados em log
            de auditoria para garantir a conformidade e segurança das informações.
          </AlertDescription>
        </Alert>
      </div>
    </DashboardLayout>
  )
}
