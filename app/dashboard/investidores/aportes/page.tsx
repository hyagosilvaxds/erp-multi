"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, DollarSign, TrendingUp, Calendar, Download, FileText } from "lucide-react"
import Link from "next/link"
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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

// Dados mockados
const aportes = [
  {
    id: 1,
    investidor: "João Silva Investimentos",
    data: "2025-01-15",
    valor: 500000,
    projeto: "Projeto Alpha",
    comprovante: "comprovante-001.pdf",
    status: "confirmado",
  },
  {
    id: 2,
    investidor: "ABC Capital Ltda",
    data: "2025-02-10",
    valor: 800000,
    projeto: "Projeto Beta",
    comprovante: "comprovante-002.pdf",
    status: "confirmado",
  },
  {
    id: 3,
    investidor: "Maria Oliveira",
    data: "2025-03-05",
    valor: 300000,
    projeto: "Projeto Alpha",
    comprovante: "comprovante-003.pdf",
    status: "pendente",
  },
  {
    id: 4,
    investidor: "XYZ Participações S.A.",
    data: "2025-03-20",
    valor: 600000,
    projeto: "Projeto Gamma",
    comprovante: "comprovante-004.pdf",
    status: "confirmado",
  },
  {
    id: 5,
    investidor: "ABC Capital Ltda",
    data: "2025-04-01",
    valor: 400000,
    projeto: "Projeto Beta",
    comprovante: "comprovante-005.pdf",
    status: "pendente",
  },
]

const stats = [
  {
    title: "Total de Aportes",
    value: aportes.length,
    icon: FileText,
    description: `${aportes.filter(a => a.status === "confirmado").length} confirmados`,
  },
  {
    title: "Valor Total Aportado",
    value: aportes
      .filter(a => a.status === "confirmado")
      .reduce((acc, aporte) => acc + aporte.valor, 0)
      .toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
    icon: DollarSign,
    description: "Aportes confirmados",
  },
  {
    title: "Aportes Pendentes",
    value: aportes
      .filter(a => a.status === "pendente")
      .reduce((acc, aporte) => acc + aporte.valor, 0)
      .toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
    icon: TrendingUp,
    description: `${aportes.filter(a => a.status === "pendente").length} aguardando confirmação`,
  },
  {
    title: "Último Aporte",
    value: new Date(aportes[aportes.length - 1].data).toLocaleDateString("pt-BR"),
    icon: Calendar,
    description: aportes[aportes.length - 1].investidor,
  },
]

export default function AportesPage() {
  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestão de Aportes</h1>
            <p className="text-muted-foreground">Registro e controle de investimentos</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Registrar Aporte
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registrar Novo Aporte</DialogTitle>
                <DialogDescription>Cadastre um novo investimento recebido</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="investidor">Investidor</Label>
                    <Select>
                      <SelectTrigger id="investidor">
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
                    <Label htmlFor="projeto">Projeto</Label>
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
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="data">Data do Aporte</Label>
                    <Input id="data" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valor">Valor</Label>
                    <Input id="valor" type="number" placeholder="0,00" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="centroCusto">Centro de Custo (opcional)</Label>
                  <Select>
                    <SelectTrigger id="centroCusto">
                      <SelectValue placeholder="Selecione o centro de custo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Desenvolvimento</SelectItem>
                      <SelectItem value="2">Marketing</SelectItem>
                      <SelectItem value="3">Infraestrutura</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comprovante">Comprovante</Label>
                  <Input id="comprovante" type="file" accept=".pdf,.jpg,.png" />
                  <p className="text-xs text-muted-foreground">
                    Anexe o comprovante de transferência (PDF, JPG ou PNG)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Informações adicionais sobre o aporte..."
                    className="min-h-[80px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancelar</Button>
                <Button>Salvar Aporte</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Aportes Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Histórico de Aportes</CardTitle>
                <CardDescription>Todos os investimentos registrados</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar aporte..." className="pl-8 w-[250px]" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Investidor</TableHead>
                  <TableHead>Projeto</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Comprovante</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aportes.map((aporte) => (
                  <TableRow key={aporte.id}>
                    <TableCell className="font-medium">
                      {new Date(aporte.data).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>{aporte.investidor}</TableCell>
                    <TableCell className="text-muted-foreground">{aporte.projeto}</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      {aporte.valor.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <FileText className="h-3 w-3" />
                        Ver
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Badge variant={aporte.status === "confirmado" ? "default" : "secondary"}>
                        {aporte.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
