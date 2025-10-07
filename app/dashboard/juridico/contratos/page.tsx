"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileText, Search, Filter, MoreVertical, Eye, Edit, Trash2, Download, Plus, AlertTriangle, Clock } from "lucide-react"
import Link from "next/link"

export default function ContratosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [tipoFilter, setTipoFilter] = useState("todos")

  const contratos = [
    {
      id: 1,
      numero: "CONT-2024-0127",
      tipo: "Prestação de Serviços",
      parte: "Tech Solutions Ltda",
      cnpj: "12.345.678/0001-90",
      valor: "R$ 45.000,00",
      valorMensal: null,
      dataInicio: "15/03/2024",
      dataVencimento: "15/03/2025",
      status: "ativo",
      diasRestantes: 162,
      responsavel: "Dr. Carlos Silva",
      categoria: "Tecnologia",
      renovacaoAutomatica: true,
    },
    {
      id: 2,
      numero: "CONT-2024-0089",
      tipo: "Fornecimento",
      parte: "Materiais ABC S.A.",
      cnpj: "98.765.432/0001-10",
      valor: "R$ 120.000,00",
      valorMensal: null,
      dataInicio: "01/01/2024",
      dataVencimento: "31/12/2024",
      status: "a-vencer",
      diasRestantes: 28,
      responsavel: "Dra. Maria Santos",
      categoria: "Fornecimento",
      renovacaoAutomatica: false,
    },
    {
      id: 3,
      numero: "CONT-2023-0245",
      tipo: "Locação",
      parte: "Imobiliária Prime",
      cnpj: "11.222.333/0001-44",
      valor: "R$ 8.500,00",
      valorMensal: "R$ 8.500,00",
      dataInicio: "10/08/2023",
      dataVencimento: "10/08/2025",
      status: "ativo",
      diasRestantes: 310,
      responsavel: "Dr. Carlos Silva",
      categoria: "Imobiliário",
      renovacaoAutomatica: true,
    },
    {
      id: 4,
      numero: "CONT-2024-0156",
      tipo: "Prestação de Serviços",
      parte: "Consultoria XYZ",
      cnpj: "55.666.777/0001-88",
      valor: "R$ 24.000,00",
      valorMensal: "R$ 2.000,00",
      dataInicio: "01/06/2024",
      dataVencimento: "31/05/2025",
      status: "ativo",
      diasRestantes: 239,
      responsavel: "Dra. Ana Costa",
      categoria: "Consultoria",
      renovacaoAutomatica: true,
    },
    {
      id: 5,
      numero: "CONT-2023-0012",
      tipo: "Fornecimento",
      parte: "Distribuidora Mega",
      cnpj: "33.444.555/0001-66",
      valor: "R$ 85.000,00",
      valorMensal: null,
      dataInicio: "15/02/2023",
      dataVencimento: "15/02/2024",
      status: "vencido",
      diasRestantes: -232,
      responsavel: "Dr. Carlos Silva",
      categoria: "Fornecimento",
      renovacaoAutomatica: false,
    },
    {
      id: 6,
      numero: "CONT-2024-0198",
      tipo: "Parceria",
      parte: "Empresa Beta Ltda",
      cnpj: "77.888.999/0001-22",
      valor: "Participação nos lucros",
      valorMensal: null,
      dataInicio: "01/09/2024",
      dataVencimento: "31/08/2026",
      status: "ativo",
      diasRestantes: 697,
      responsavel: "Dra. Maria Santos",
      categoria: "Parcerias",
      renovacaoAutomatica: false,
    },
  ]

  const getStatusBadge = (status: string, diasRestantes: number) => {
    if (status === "vencido") {
      return <Badge variant="destructive">Vencido</Badge>
    }
    if (status === "a-vencer" || diasRestantes < 60) {
      return (
        <Badge variant="destructive" className="gap-1">
          <Clock className="h-3 w-3" />
          A Vencer
        </Badge>
      )
    }
    return <Badge variant="default">Ativo</Badge>
  }

  const filteredContratos = contratos.filter((contrato) => {
    const matchesSearch =
      contrato.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contrato.parte.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contrato.tipo.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "todos" || contrato.status === statusFilter
    const matchesTipo = tipoFilter === "todos" || contrato.tipo === tipoFilter

    return matchesSearch && matchesStatus && matchesTipo
  })

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Contratos</h1>
            <p className="text-muted-foreground">Gerencie todos os contratos da empresa</p>
          </div>
          <Link href="/dashboard/juridico/contratos/novo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Contrato
            </Button>
          </Link>
        </div>

        {/* Filtros e Busca */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número, parte ou tipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="ativo">Ativos</SelectItem>
                  <SelectItem value="a-vencer">A Vencer</SelectItem>
                  <SelectItem value="vencido">Vencidos</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Tipos</SelectItem>
                  <SelectItem value="Prestação de Serviços">Prestação de Serviços</SelectItem>
                  <SelectItem value="Fornecimento">Fornecimento</SelectItem>
                  <SelectItem value="Locação">Locação</SelectItem>
                  <SelectItem value="Parceria">Parceria</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Contratos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lista de Contratos</CardTitle>
                <CardDescription>
                  {filteredContratos.length} contrato(s) encontrado(s)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Parte</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContratos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        <div className="py-8 text-muted-foreground">
                          <FileText className="mx-auto mb-2 h-8 w-8" />
                          <p>Nenhum contrato encontrado</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredContratos.map((contrato) => (
                      <TableRow key={contrato.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{contrato.numero}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{contrato.tipo}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{contrato.parte}</p>
                            <p className="text-xs text-muted-foreground">{contrato.cnpj}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{contrato.valor}</p>
                            {contrato.valorMensal && (
                              <p className="text-xs text-muted-foreground">{contrato.valorMensal}/mês</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p>{contrato.dataVencimento}</p>
                            <p className="text-xs text-muted-foreground">
                              {contrato.diasRestantes > 0 
                                ? `${contrato.diasRestantes} dias` 
                                : `Vencido há ${Math.abs(contrato.diasRestantes)} dias`}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(contrato.status, contrato.diasRestantes)}</TableCell>
                        <TableCell>
                          <p className="text-sm">{contrato.responsavel}</p>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/juridico/contratos/${contrato.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Visualizar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/juridico/contratos/${contrato.id}/editar`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Baixar PDF
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
