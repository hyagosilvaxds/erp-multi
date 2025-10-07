"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Save, Calculator, FileText } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function NovaDistribuicaoPage() {
  // Dados mockados da política selecionada
  const rateioAutomatico = [
    {
      investidor: "João Silva Investimentos",
      percentual: 35,
      valor: 52500,
    },
    {
      investidor: "Maria Oliveira",
      percentual: 25,
      valor: 37500,
    },
    {
      investidor: "ABC Capital Ltda",
      percentual: 40,
      valor: 60000,
    },
  ]

  const valorTotal = 150000

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/dashboard/investidores/distribuicoes">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Nova Distribuição</h1>
              <p className="text-muted-foreground">Distribuir rendimentos aos investidores</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/investidores/distribuicoes">Cancelar</Link>
            </Button>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Processar Distribuição
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Dados da Distribuição */}
            <Card>
              <CardHeader>
                <CardTitle>Dados da Distribuição</CardTitle>
                <CardDescription>Informações gerais do período e valor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="projeto">Projeto/Empresa</Label>
                    <Select>
                      <SelectTrigger id="projeto">
                        <SelectValue placeholder="Selecione o projeto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Projeto Alpha</SelectItem>
                        <SelectItem value="2">Projeto Beta</SelectItem>
                        <SelectItem value="3">Projeto Gamma</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="periodo">Período</Label>
                    <Input id="periodo" placeholder="Ex: Q1 2025, Janeiro/2025" />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="dataReferencia">Data de Referência</Label>
                    <Input id="dataReferencia" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valorTotal">Valor Total a Distribuir</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
                      <Input id="valorTotal" type="number" placeholder="0,00" className="pl-10" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Informações adicionais sobre a distribuição..."
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Rateio por Investidor */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Rateio por Investidor</CardTitle>
                    <CardDescription>
                      Distribuição calculada automaticamente conforme política cadastrada
                    </CardDescription>
                  </div>
                  <Button size="sm" variant="outline">
                    <Calculator className="mr-2 h-4 w-4" />
                    Recalcular
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Investidor</TableHead>
                      <TableHead className="text-center">Percentual</TableHead>
                      <TableHead className="text-right">Valor a Receber</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rateioAutomatico.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.investidor}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{item.percentual}%</Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          {item.valor.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50 font-semibold">
                      <TableCell>TOTAL</TableCell>
                      <TableCell className="text-center">
                        <Badge>100%</Badge>
                      </TableCell>
                      <TableCell className="text-right text-primary">
                        {valorTotal.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Documentos Gerados */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <div className="flex gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-base">Documentos que serão gerados</CardTitle>
                    <CardDescription className="mt-2">
                      Após processar a distribuição, os seguintes documentos estarão disponíveis:
                    </CardDescription>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        Recibo individual para cada investidor
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        Informe de rendimentos (PDF com logo)
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        Relatório consolidado da distribuição
                      </li>
                    </ul>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resumo */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Valor Total:</span>
                    <span className="font-semibold">
                      {valorTotal.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Investidores:</span>
                    <span className="font-semibold">{rateioAutomatico.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Projeto:</span>
                    <span className="font-semibold">Projeto Alpha</span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="font-semibold">Média por Investidor:</span>
                    <span className="font-bold text-primary">
                      {(valorTotal / rateioAutomatico.length).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Política Aplicada */}
            <Card>
              <CardHeader>
                <CardTitle>Política Aplicada</CardTitle>
                <CardDescription>Configuração de distribuição utilizada</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Distribuição trimestral de lucros</p>
                  <p className="text-xs text-muted-foreground">Projeto Alpha • Periodicidade: Trimestral</p>
                </div>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/dashboard/investidores/politicas">Ver Política</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Forma de Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle>Forma de Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="formaPagamento">Método</Label>
                  <Select defaultValue="transferencia">
                    <SelectTrigger id="formaPagamento">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="ted">TED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataPagamento">Data do Pagamento</Label>
                  <Input id="dataPagamento" type="date" />
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Select defaultValue="pendente">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="processando">Processando</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
