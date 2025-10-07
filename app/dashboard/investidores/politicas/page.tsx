"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Settings, Plus, Edit, Trash2, Check } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

// Dados mockados
const politicas = [
  {
    id: 1,
    projeto: "Projeto Alpha",
    descricao: "Distribuição trimestral de lucros",
    distribuicoes: [
      { investidor: "João Silva Investimentos", percentual: 35 },
      { investidor: "Maria Oliveira", percentual: 25 },
      { investidor: "ABC Capital Ltda", percentual: 40 },
    ],
    status: "ativa",
    periodicidade: "Trimestral",
  },
  {
    id: 2,
    projeto: "Projeto Beta",
    descricao: "Distribuição mensal de rendimentos",
    distribuicoes: [
      { investidor: "ABC Capital Ltda", percentual: 60 },
      { investidor: "XYZ Participações S.A.", percentual: 40 },
    ],
    status: "ativa",
    periodicidade: "Mensal",
  },
  {
    id: 3,
    projeto: "Projeto Gamma",
    descricao: "Distribuição semestral",
    distribuicoes: [
      { investidor: "XYZ Participações S.A.", percentual: 100 },
    ],
    status: "inativa",
    periodicidade: "Semestral",
  },
]

export default function PoliticasPage() {
  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Políticas de Distribuição
            </h1>
            <p className="text-muted-foreground">Configure o percentual de distribuição por investidor</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Política
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nova Política de Distribuição</DialogTitle>
                <DialogDescription>Defina os percentuais de distribuição por investidor</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
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
                    <Label htmlFor="periodicidade">Periodicidade</Label>
                    <Select>
                      <SelectTrigger id="periodicidade">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mensal">Mensal</SelectItem>
                        <SelectItem value="bimestral">Bimestral</SelectItem>
                        <SelectItem value="trimestral">Trimestral</SelectItem>
                        <SelectItem value="semestral">Semestral</SelectItem>
                        <SelectItem value="anual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Descreva a política de distribuição..."
                    className="min-h-[60px]"
                  />
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-base">Distribuição por Investidor</Label>
                    <Button size="sm" variant="outline">
                      <Plus className="mr-1 h-3 w-3" />
                      Adicionar Investidor
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="md:col-span-2 space-y-2">
                            <Label>Investidor</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o investidor" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">João Silva Investimentos</SelectItem>
                                <SelectItem value="2">ABC Capital Ltda</SelectItem>
                                <SelectItem value="3">Maria Oliveira</SelectItem>
                                <SelectItem value="4">XYZ Participações S.A.</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Percentual (%)</Label>
                            <div className="flex gap-2">
                              <Input type="number" placeholder="0" min="0" max="100" />
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">Total Distribuído:</span>
                      <span className="text-lg font-bold">0%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      O total deve somar 100% para ativar a política
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancelar</Button>
                <Button>Salvar Política</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Políticas List */}
        {politicas.map((politica) => (
          <Card key={politica.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle>{politica.projeto}</CardTitle>
                    <Badge variant={politica.status === "ativa" ? "default" : "secondary"}>
                      {politica.status}
                    </Badge>
                    <Badge variant="outline">{politica.periodicidade}</Badge>
                  </div>
                  <CardDescription>{politica.descricao}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Investidor</TableHead>
                    <TableHead className="text-right">Percentual</TableHead>
                    <TableHead className="text-right">Representação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {politica.distribuicoes.map((dist, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{dist.investidor}</TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-primary">{dist.percentual}%</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${dist.percentual}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell>TOTAL</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-primary">
                          {politica.distribuicoes.reduce((acc, d) => acc + d.percentual, 0)}%
                        </span>
                        {politica.distribuicoes.reduce((acc, d) => acc + d.percentual, 0) === 100 && (
                          <Check className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}

        {/* Info Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex gap-3">
              <Settings className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base">Como funciona?</CardTitle>
                <CardDescription className="mt-2">
                  As políticas de distribuição definem automaticamente como os rendimentos serão divididos entre
                  os investidores. Ao criar uma nova distribuição, o sistema calculará os valores
                  proporcionalmente conforme configurado aqui.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </DashboardLayout>
  )
}
