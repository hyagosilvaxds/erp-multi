"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileText, Calculator, DollarSign, TrendingUp } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Alíquotas paramétricas (exemplo)
const ALIQUOTAS = {
  INSS_EMPRESA: 0.20, // 20%
  FGTS: 0.08, // 8%
  INSS_COLABORADOR_MIN: 0.075, // 7.5%
  INSS_COLABORADOR_MAX: 0.14, // 14%
  IRRF_MIN: 0, // Faixa de isenção
  IRRF_MAX: 0.275, // 27.5%
}

// Dados mockados
const colaboradoresFolha = [
  {
    id: 1,
    nome: "João Silva",
    cargo: "Desenvolvedor Sênior",
    centroCusto: "TI",
    salarioBase: 8500,
    proventos: 1200, // horas extras
    descontos: 510, // vale transporte
  },
  {
    id: 2,
    nome: "Maria Santos",
    cargo: "Gerente de Vendas",
    centroCusto: "Vendas",
    salarioBase: 12000,
    proventos: 600, // comissão
    descontos: 720,
  },
  {
    id: 3,
    nome: "Pedro Costa",
    cargo: "Analista Financeiro",
    centroCusto: "Financeiro",
    salarioBase: 6500,
    proventos: 0,
    descontos: 390,
  },
  {
    id: 4,
    nome: "Ana Oliveira",
    cargo: "Designer",
    centroCusto: "Marketing",
    salarioBase: 5500,
    proventos: 500,
    descontos: 330,
  },
]

// Função de cálculo de encargos
function calcularEncargos(salarioBase: number, proventos: number) {
  const salarioBruto = salarioBase + proventos

  // INSS Colaborador (simplificado - usar faixas reais)
  const inssColaborador = salarioBruto * ALIQUOTAS.INSS_COLABORADOR_MIN

  // INSS Empresa
  const inssEmpresa = salarioBruto * ALIQUOTAS.INSS_EMPRESA

  // FGTS
  const fgts = salarioBruto * ALIQUOTAS.FGTS

  // IRRF (simplificado - aplicar tabela real)
  let irrf = 0
  if (salarioBruto > 2000) {
    irrf = (salarioBruto - inssColaborador - 2000) * 0.075
  }

  const totalEncargosEmpresa = inssEmpresa + fgts
  const custoTotal = salarioBruto + totalEncargosEmpresa

  return {
    salarioBruto,
    inssColaborador,
    irrf,
    inssEmpresa,
    fgts,
    totalEncargosEmpresa,
    custoTotal,
  }
}

export default function FolhaPagamentoPage() {
  // Calcular totais
  const folhaCalculada = colaboradoresFolha.map((colab) => {
    const encargos = calcularEncargos(colab.salarioBase, colab.proventos)
    const salarioLiquido = encargos.salarioBruto - colab.descontos - encargos.inssColaborador - encargos.irrf

    return {
      ...colab,
      ...encargos,
      salarioLiquido,
    }
  })

  const totais = folhaCalculada.reduce(
    (acc, colab) => ({
      salarioBase: acc.salarioBase + colab.salarioBase,
      proventos: acc.proventos + colab.proventos,
      salarioBruto: acc.salarioBruto + colab.salarioBruto,
      descontos: acc.descontos + colab.descontos,
      inssColaborador: acc.inssColaborador + colab.inssColaborador,
      irrf: acc.irrf + colab.irrf,
      salarioLiquido: acc.salarioLiquido + colab.salarioLiquido,
      inssEmpresa: acc.inssEmpresa + colab.inssEmpresa,
      fgts: acc.fgts + colab.fgts,
      totalEncargosEmpresa: acc.totalEncargosEmpresa + colab.totalEncargosEmpresa,
      custoTotal: acc.custoTotal + colab.custoTotal,
    }),
    {
      salarioBase: 0,
      proventos: 0,
      salarioBruto: 0,
      descontos: 0,
      inssColaborador: 0,
      irrf: 0,
      salarioLiquido: 0,
      inssEmpresa: 0,
      fgts: 0,
      totalEncargosEmpresa: 0,
      custoTotal: 0,
    }
  )

  // Resumo por Centro de Custo
  const resumoPorCentroCusto = Object.values(
    folhaCalculada.reduce((acc: any, colab) => {
      if (!acc[colab.centroCusto]) {
        acc[colab.centroCusto] = {
          centro: colab.centroCusto,
          colaboradores: 0,
          custoTotal: 0,
        }
      }
      acc[colab.centroCusto].colaboradores += 1
      acc[colab.centroCusto].custoTotal += colab.custoTotal
      return acc
    }, {})
  )

  const handleExportarCSV = () => {
    console.log("Exportando folha para CSV...")
    // Implementar exportação CSV
  }

  const handleExportarExcel = () => {
    console.log("Exportando folha para Excel...")
    // Implementar exportação Excel
  }

  const handleGerarHolerite = (colaboradorId: number) => {
    console.log("Gerando holerite PDF para colaborador", colaboradorId)
    // Implementar geração de holerite
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Folha de Pagamento</h1>
            <p className="text-muted-foreground">Cálculo de encargos e exportações</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportarCSV}>
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
            <Button variant="outline" onClick={handleExportarExcel}>
              <Download className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Período de Referência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Mês</Label>
                <Select defaultValue="04">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="01">Janeiro</SelectItem>
                    <SelectItem value="02">Fevereiro</SelectItem>
                    <SelectItem value="03">Março</SelectItem>
                    <SelectItem value="04">Abril</SelectItem>
                    <SelectItem value="05">Maio</SelectItem>
                    <SelectItem value="06">Junho</SelectItem>
                    <SelectItem value="07">Julho</SelectItem>
                    <SelectItem value="08">Agosto</SelectItem>
                    <SelectItem value="09">Setembro</SelectItem>
                    <SelectItem value="10">Outubro</SelectItem>
                    <SelectItem value="11">Novembro</SelectItem>
                    <SelectItem value="12">Dezembro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ano</Label>
                <Select defaultValue="2025">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button className="w-full">
                  <Calculator className="mr-2 h-4 w-4" />
                  Calcular Folha
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Salário Bruto Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {totais.salarioBruto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
              <p className="text-xs text-muted-foreground">{colaboradoresFolha.length} colaboradores</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Salário Líquido Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {totais.salarioLiquido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
              <p className="text-xs text-muted-foreground">Líquido a pagar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Encargos Empresa</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {totais.totalEncargosEmpresa.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
              <p className="text-xs text-muted-foreground">
                {((totais.totalEncargosEmpresa / totais.salarioBruto) * 100).toFixed(1)}% sobre folha
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {totais.custoTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
              <p className="text-xs text-muted-foreground">Salários + Encargos</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="colaboradores" className="space-y-4">
          <TabsList>
            <TabsTrigger value="colaboradores">Por Colaborador</TabsTrigger>
            <TabsTrigger value="centrocusto">Por Centro de Custo</TabsTrigger>
            <TabsTrigger value="aliquotas">Alíquotas</TabsTrigger>
          </TabsList>

          {/* Tab: Por Colaborador */}
          <TabsContent value="colaboradores" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Detalhamento por Colaborador</CardTitle>
                <CardDescription>Cálculo completo de salários e encargos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead className="text-right">Salário Base</TableHead>
                        <TableHead className="text-right">Proventos</TableHead>
                        <TableHead className="text-right">Sal. Bruto</TableHead>
                        <TableHead className="text-right">Descontos</TableHead>
                        <TableHead className="text-right">INSS</TableHead>
                        <TableHead className="text-right">IRRF</TableHead>
                        <TableHead className="text-right">Sal. Líquido</TableHead>
                        <TableHead className="text-right">Encargos Emp.</TableHead>
                        <TableHead className="text-right">Custo Total</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {folhaCalculada.map((colab) => (
                        <TableRow key={colab.id}>
                          <TableCell className="font-medium">{colab.nome}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{colab.cargo}</TableCell>
                          <TableCell className="text-right">
                            {colab.salarioBase.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </TableCell>
                          <TableCell className="text-right text-green-600">
                            {colab.proventos > 0
                              ? `+${colab.proventos.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {colab.salarioBruto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </TableCell>
                          <TableCell className="text-right text-red-600">
                            {colab.descontos > 0
                              ? `-${colab.descontos.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {colab.inssColaborador.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {colab.irrf > 0
                              ? colab.irrf.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right font-bold text-green-600">
                            {colab.salarioLiquido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </TableCell>
                          <TableCell className="text-right text-orange-600">
                            {colab.totalEncargosEmpresa.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {colab.custoTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleGerarHolerite(colab.id)}>
                              <FileText className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell colSpan={2}>TOTAIS</TableCell>
                        <TableCell className="text-right">
                          {totais.salarioBase.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          {totais.proventos.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </TableCell>
                        <TableCell className="text-right">
                          {totais.salarioBruto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </TableCell>
                        <TableCell className="text-right text-red-600">
                          {totais.descontos.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </TableCell>
                        <TableCell className="text-right">
                          {totais.inssColaborador.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </TableCell>
                        <TableCell className="text-right">
                          {totais.irrf.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          {totais.salarioLiquido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </TableCell>
                        <TableCell className="text-right text-orange-600">
                          {totais.totalEncargosEmpresa.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          {totais.custoTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Por Centro de Custo */}
          <TabsContent value="centrocusto" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Custo por Centro de Custo</CardTitle>
                <CardDescription>Distribuição da folha por área</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {resumoPorCentroCusto.map((centro: any) => (
                    <div
                      key={centro.centro}
                      className="flex items-center justify-between rounded-lg border border-border p-4"
                    >
                      <div>
                        <p className="font-semibold text-foreground">{centro.centro}</p>
                        <p className="text-sm text-muted-foreground">{centro.colaboradores} colaboradores</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">
                          {centro.custoTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {((centro.custoTotal / totais.custoTotal) * 100).toFixed(1)}% do total
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Alíquotas */}
          <TabsContent value="aliquotas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Alíquotas Paramétricas</CardTitle>
                <CardDescription>Configurações de cálculo de encargos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>INSS Empresa</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" defaultValue={ALIQUOTAS.INSS_EMPRESA * 100} disabled />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>FGTS</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" defaultValue={ALIQUOTAS.FGTS * 100} disabled />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>INSS Colaborador (Mín.)</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" defaultValue={ALIQUOTAS.INSS_COLABORADOR_MIN * 100} disabled />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>INSS Colaborador (Máx.)</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" defaultValue={ALIQUOTAS.INSS_COLABORADOR_MAX * 100} disabled />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Nota: Estes são valores estimados para cálculo gerencial. Para eSocial, utilize o sistema do
                  contador.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base">Exportações para Contador</CardTitle>
                <CardDescription className="mt-2">
                  Use os botões "Exportar CSV" ou "Exportar Excel" para gerar planilhas com todos os dados da
                  folha. Esses arquivos podem ser enviados ao escritório contábil ou importados no eSocial. Os
                  cálculos apresentados são estimativas gerenciais e não substituem o sistema oficial.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </DashboardLayout>
  )
}
