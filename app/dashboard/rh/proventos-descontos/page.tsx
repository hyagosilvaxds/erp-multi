"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, TrendingUp, TrendingDown } from "lucide-react"
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

// Dados mockados
const proventos = [
  { id: 1, codigo: "PROV-001", descricao: "Horas Extras 50%", tipo: "percentual", valor: 50, ativo: true },
  { id: 2, codigo: "PROV-002", descricao: "Horas Extras 100%", tipo: "percentual", valor: 100, ativo: true },
  { id: 3, codigo: "PROV-003", descricao: "Adicional Noturno", tipo: "percentual", valor: 20, ativo: true },
  { id: 4, codigo: "PROV-004", descricao: "Comissão", tipo: "percentual", valor: 5, ativo: true },
  { id: 5, codigo: "PROV-005", descricao: "Gratificação", tipo: "fixo", valor: 500, ativo: true },
]

const descontos = [
  { id: 1, codigo: "DESC-001", descricao: "Vale Transporte (6%)", tipo: "percentual", valor: 6, ativo: true },
  { id: 2, codigo: "DESC-002", descricao: "Vale Refeição", tipo: "fixo", valor: 150, ativo: true },
  { id: 3, codigo: "DESC-003", descricao: "Plano de Saúde", tipo: "fixo", valor: 200, ativo: true },
  { id: 4, codigo: "DESC-004", descricao: "Plano Odontológico", tipo: "fixo", valor: 80, ativo: true },
  { id: 5, codigo: "DESC-005", descricao: "Adiantamento Salarial", tipo: "fixo", valor: 0, ativo: true },
  { id: 6, codigo: "DESC-006", descricao: "Falta Injustificada", tipo: "fixo", valor: 0, ativo: true },
]

export default function ProventosDescontosPage() {
  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Proventos & Descontos</h1>
          <p className="text-muted-foreground">Configure proventos e descontos padrão da folha</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Proventos</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{proventos.length}</div>
              <p className="text-xs text-muted-foreground">
                {proventos.filter((p) => p.ativo).length} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Descontos</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{descontos.length}</div>
              <p className="text-xs text-muted-foreground">
                {descontos.filter((d) => d.ativo).length} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Configurado</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {proventos.length + descontos.length}
              </div>
              <p className="text-xs text-muted-foreground">Regras cadastradas</p>
            </CardContent>
          </Card>
        </div>

        {/* Proventos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Proventos
                </CardTitle>
                <CardDescription>Adicionais e gratificações</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Provento
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Provento</DialogTitle>
                    <DialogDescription>Cadastre um novo provento padrão</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="codigo">Código</Label>
                      <Input id="codigo" placeholder="Ex: PROV-006" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="descricao">Descrição</Label>
                      <Input id="descricao" placeholder="Ex: Adicional de Periculosidade" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo</Label>
                      <Select>
                        <SelectTrigger id="tipo">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentual">Percentual (%)</SelectItem>
                          <SelectItem value="fixo">Valor Fixo (R$)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valor">Valor</Label>
                      <Input id="valor" type="number" placeholder="0" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancelar</Button>
                    <Button>Salvar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {proventos.map((provento) => (
                <div
                  key={provento.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">{provento.codigo}</code>
                        <p className="font-medium text-foreground">{provento.descricao}</p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {provento.tipo === "percentual" ? `${provento.valor}%` : `R$ ${provento.valor.toFixed(2)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={provento.ativo ? "default" : "secondary"}>
                      {provento.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Descontos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  Descontos
                </CardTitle>
                <CardDescription>Vales, benefícios e descontos fixos</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Desconto
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Desconto</DialogTitle>
                    <DialogDescription>Cadastre um novo desconto padrão</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="codigoDesc">Código</Label>
                      <Input id="codigoDesc" placeholder="Ex: DESC-007" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="descricaoDesc">Descrição</Label>
                      <Input id="descricaoDesc" placeholder="Ex: Desconto Uniforme" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tipoDesc">Tipo</Label>
                      <Select>
                        <SelectTrigger id="tipoDesc">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentual">Percentual (%)</SelectItem>
                          <SelectItem value="fixo">Valor Fixo (R$)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valorDesc">Valor</Label>
                      <Input id="valorDesc" type="number" placeholder="0" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancelar</Button>
                    <Button>Salvar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {descontos.map((desconto) => (
                <div
                  key={desconto.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">{desconto.codigo}</code>
                        <p className="font-medium text-foreground">{desconto.descricao}</p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {desconto.tipo === "percentual" ? `${desconto.valor}%` : `R$ ${desconto.valor.toFixed(2)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={desconto.ativo ? "default" : "secondary"}>
                      {desconto.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">Como funciona?</CardTitle>
            <CardDescription className="mt-2">
              Proventos e descontos configurados aqui são usados como padrão na folha de pagamento. Você pode
              aplicá-los automaticamente ou manualmente para cada colaborador. Valores percentuais são
              calculados sobre o salário base.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </DashboardLayout>
  )
}
