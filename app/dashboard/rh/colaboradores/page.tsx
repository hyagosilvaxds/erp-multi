"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, FileText, User } from "lucide-react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Dados mockados
const colaboradores = [
  {
    id: 1,
    nome: "João Silva",
    cargo: "Desenvolvedor Sênior",
    cpf: "123.456.789-00",
    admissao: "2024-01-15",
    salario: 8500,
    centroCusto: "TI",
    vinculo: "CLT",
    status: "ativo",
    documentos: 5,
  },
  {
    id: 2,
    nome: "Maria Santos",
    cargo: "Gerente de Vendas",
    cpf: "987.654.321-00",
    admissao: "2023-11-20",
    salario: 12000,
    centroCusto: "Vendas",
    vinculo: "CLT",
    status: "ativo",
    documentos: 6,
  },
  {
    id: 3,
    nome: "Pedro Costa",
    cargo: "Analista Financeiro",
    cpf: "456.789.123-00",
    admissao: "2024-02-01",
    salario: 6500,
    centroCusto: "Financeiro",
    vinculo: "CLT",
    status: "ativo",
    documentos: 4,
  },
  {
    id: 4,
    nome: "Ana Oliveira",
    cargo: "Designer",
    cpf: "789.123.456-00",
    admissao: "2023-08-10",
    salario: 5500,
    centroCusto: "Marketing",
    vinculo: "PJ",
    status: "ativo",
    documentos: 3,
  },
  {
    id: 5,
    nome: "Carlos Ferreira",
    cargo: "Auxiliar Administrativo",
    cpf: "321.654.987-00",
    admissao: "2022-05-15",
    salario: 3200,
    centroCusto: "Administrativo",
    vinculo: "CLT",
    status: "afastado",
    documentos: 5,
  },
]

export default function ColaboradoresPage() {
  const colaboradoresAtivos = colaboradores.filter((c) => c.status === "ativo").length
  const totalFolha = colaboradores.reduce((acc, c) => acc + c.salario, 0)

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Colaboradores</h1>
            <p className="text-muted-foreground">Gerenciar cadastro de colaboradores</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/rh/colaboradores/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Colaborador
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Colaboradores</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{colaboradores.length}</div>
              <p className="text-xs text-muted-foreground">{colaboradoresAtivos} ativos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Folha Total</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {totalFolha.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
              <p className="text-xs text-muted-foreground">Soma dos salários</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {(totalFolha / colaboradores.length).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
              <p className="text-xs text-muted-foreground">Salário médio</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar Colaboradores</CardTitle>
            <CardDescription>Encontre colaboradores por nome, cargo ou CPF</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar..." className="pl-10" />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Colaboradores</CardTitle>
            <CardDescription>Cadastro completo de colaboradores</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Admissão</TableHead>
                  <TableHead>Centro de Custo</TableHead>
                  <TableHead>Vínculo</TableHead>
                  <TableHead className="text-right">Salário</TableHead>
                  <TableHead>Docs</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colaboradores.map((colab) => (
                  <TableRow key={colab.id}>
                    <TableCell className="font-medium">{colab.nome}</TableCell>
                    <TableCell className="text-muted-foreground">{colab.cargo}</TableCell>
                    <TableCell className="font-mono text-sm">{colab.cpf}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(colab.admissao).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{colab.centroCusto}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{colab.vinculo}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {colab.salario.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <FileText className="h-3 w-3" />
                        {colab.documentos}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={colab.status === "ativo" ? "default" : "secondary"}>
                        {colab.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
