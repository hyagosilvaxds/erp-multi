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
import { Scale, Search, Filter, MoreVertical, Eye, Edit, Trash2, Plus, FileText, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function ProcessosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [tipoFilter, setTipoFilter] = useState("todos")
  const [riscoFilter, setRiscoFilter] = useState("todos")

  const processos = [
    {
      id: 1,
      numero: "0001234-56.2024.5.02.0001",
      tipo: "Trabalhista",
      parte: "João da Silva",
      tipoAcao: "Reclamação Trabalhista",
      polo: "passivo",
      vara: "1ª Vara do Trabalho - SP",
      comarca: "São Paulo",
      status: "em-andamento",
      ultimaMovimentacao: "Audiência agendada",
      dataUltimaMovimentacao: "28/09/2024",
      dataDistribuicao: "15/05/2024",
      valorCausa: "R$ 45.000,00",
      valorProvisionado: "R$ 30.000,00",
      risco: "médio",
      responsavel: "Dr. Carlos Silva",
      advogadoExterno: "Escritório Silva & Associados",
    },
    {
      id: 2,
      numero: "0007890-12.2024.8.26.0100",
      tipo: "Cível",
      parte: "Empresa XYZ Ltda",
      tipoAcao: "Cobrança",
      polo: "ativo",
      vara: "3ª Vara Cível - SP",
      comarca: "São Paulo",
      status: "aguardando-sentenca",
      ultimaMovimentacao: "Conclusos para sentença",
      dataUltimaMovimentacao: "25/09/2024",
      dataDistribuicao: "10/03/2024",
      valorCausa: "R$ 85.000,00",
      valorProvisionado: null,
      risco: "baixo",
      responsavel: "Dra. Maria Santos",
      advogadoExterno: null,
    },
    {
      id: 3,
      numero: "0002468-90.2023.4.03.6100",
      tipo: "Tributário",
      parte: "União Federal",
      tipoAcao: "Mandado de Segurança",
      polo: "passivo",
      vara: "2ª Vara Federal - SP",
      comarca: "São Paulo",
      status: "em-recurso",
      ultimaMovimentacao: "Apelação interposta",
      dataUltimaMovimentacao: "20/09/2024",
      dataDistribuicao: "05/08/2023",
      valorCausa: "R$ 250.000,00",
      valorProvisionado: "R$ 180.000,00",
      risco: "alto",
      responsavel: "Dra. Ana Costa",
      advogadoExterno: "Escritório Tributário Especializado",
    },
    {
      id: 4,
      numero: "0003698-47.2024.5.02.0002",
      tipo: "Trabalhista",
      parte: "Maria Oliveira",
      tipoAcao: "Horas Extras",
      polo: "passivo",
      vara: "5ª Vara do Trabalho - SP",
      comarca: "São Paulo",
      status: "em-andamento",
      ultimaMovimentacao: "Perícia técnica agendada",
      dataUltimaMovimentacao: "01/10/2024",
      dataDistribuicao: "20/06/2024",
      valorCausa: "R$ 28.000,00",
      valorProvisionado: "R$ 15.000,00",
      risco: "médio",
      responsavel: "Dr. Carlos Silva",
      advogadoExterno: null,
    },
    {
      id: 5,
      numero: "0009876-54.2024.8.26.0224",
      tipo: "Cível",
      parte: "Fornecedor ABC Ltda",
      tipoAcao: "Rescisão Contratual",
      polo: "passivo",
      vara: "2ª Vara Cível - Guarulhos",
      comarca: "Guarulhos",
      status: "acordado",
      ultimaMovimentacao: "Acordo homologado",
      dataUltimaMovimentacao: "15/09/2024",
      dataDistribuicao: "05/01/2024",
      valorCausa: "R$ 120.000,00",
      valorProvisionado: null,
      risco: "baixo",
      responsavel: "Dra. Maria Santos",
      advogadoExterno: null,
    },
    {
      id: 6,
      numero: "0001111-22.2023.5.02.0010",
      tipo: "Trabalhista",
      parte: "Pedro Santos",
      tipoAcao: "Acidente de Trabalho",
      polo: "passivo",
      vara: "10ª Vara do Trabalho - SP",
      comarca: "São Paulo",
      status: "sentenca-desfavoravel",
      ultimaMovimentacao: "Sentença proferida - Recurso necessário",
      dataUltimaMovimentacao: "10/09/2024",
      dataDistribuicao: "12/11/2023",
      valorCausa: "R$ 350.000,00",
      valorProvisionado: "R$ 280.000,00",
      risco: "alto",
      responsavel: "Dr. Carlos Silva",
      advogadoExterno: "Escritório Especializado em Acidente de Trabalho",
    },
  ]

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      "em-andamento": { label: "Em Andamento", variant: "default" },
      "aguardando-sentenca": { label: "Aguardando Sentença", variant: "secondary" },
      "em-recurso": { label: "Em Recurso", variant: "outline" },
      "acordado": { label: "Acordo", variant: "default" },
      "sentenca-favoravel": { label: "Sentença Favorável", variant: "default" },
      "sentenca-desfavoravel": { label: "Sentença Desfavorável", variant: "destructive" },
      "arquivado": { label: "Arquivado", variant: "secondary" },
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

  const getPoloBadge = (polo: string) => {
    return polo === "ativo" ? (
      <Badge variant="outline" className="text-blue-600">
        Polo Ativo
      </Badge>
    ) : (
      <Badge variant="outline" className="text-orange-600">
        Polo Passivo
      </Badge>
    )
  }

  const filteredProcessos = processos.filter((processo) => {
    const matchesSearch =
      processo.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      processo.parte.toLowerCase().includes(searchTerm.toLowerCase()) ||
      processo.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      processo.tipoAcao.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "todos" || processo.status === statusFilter
    const matchesTipo = tipoFilter === "todos" || processo.tipo === tipoFilter
    const matchesRisco = riscoFilter === "todos" || processo.risco === riscoFilter

    return matchesSearch && matchesStatus && matchesTipo && matchesRisco
  })

  // Calcular estatísticas
  const totalProvisionado = processos
    .filter((p) => p.valorProvisionado)
    .reduce((acc, p) => {
      const valor = parseFloat(p.valorProvisionado?.replace(/[R$\s.]/g, "").replace(",", ".") || "0")
      return acc + valor
    }, 0)

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Processos Judiciais</h1>
            <p className="text-muted-foreground">Gerencie todos os processos da empresa</p>
          </div>
          <Link href="/dashboard/juridico/processos/novo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Processo
            </Button>
          </Link>
        </div>

        {/* Cards de Resumo */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Processos</CardTitle>
              <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{processos.length}</div>
              <p className="text-xs text-muted-foreground">processos ativos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Provisionado</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {totalProvisionado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">total provisionado</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alto Risco</CardTitle>
              <Badge variant="destructive" className="h-4 px-1 text-xs">!</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {processos.filter((p) => p.risco === "alto").length}
              </div>
              <p className="text-xs text-muted-foreground">processos de alto risco</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Polo Passivo</CardTitle>
              <Scale className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {processos.filter((p) => p.polo === "passivo").length}
              </div>
              <p className="text-xs text-muted-foreground">empresa é ré</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número, parte, tipo ou ação..."
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
                  <SelectItem value="em-andamento">Em Andamento</SelectItem>
                  <SelectItem value="aguardando-sentenca">Aguardando Sentença</SelectItem>
                  <SelectItem value="em-recurso">Em Recurso</SelectItem>
                  <SelectItem value="acordado">Acordo</SelectItem>
                  <SelectItem value="sentenca-favoravel">Sentença Favorável</SelectItem>
                  <SelectItem value="sentenca-desfavoravel">Sentença Desfavorável</SelectItem>
                  <SelectItem value="arquivado">Arquivado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Tipos</SelectItem>
                  <SelectItem value="Trabalhista">Trabalhista</SelectItem>
                  <SelectItem value="Cível">Cível</SelectItem>
                  <SelectItem value="Tributário">Tributário</SelectItem>
                  <SelectItem value="Consumidor">Consumidor</SelectItem>
                </SelectContent>
              </Select>
              <Select value={riscoFilter} onValueChange={setRiscoFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Risco" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Riscos</SelectItem>
                  <SelectItem value="baixo">Baixo</SelectItem>
                  <SelectItem value="medio">Médio</SelectItem>
                  <SelectItem value="alto">Alto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Processos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lista de Processos</CardTitle>
                <CardDescription>
                  {filteredProcessos.length} processo(s) encontrado(s)
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
                    <TableHead>Tipo / Polo</TableHead>
                    <TableHead>Parte</TableHead>
                    <TableHead>Vara</TableHead>
                    <TableHead>Valor da Causa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Risco</TableHead>
                    <TableHead>Última Movimentação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProcessos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center">
                        <div className="py-8 text-muted-foreground">
                          <Scale className="mx-auto mb-2 h-8 w-8" />
                          <p>Nenhum processo encontrado</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProcessos.map((processo) => (
                      <TableRow key={processo.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Scale className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-xs">{processo.numero}</p>
                              <p className="text-xs text-muted-foreground">{processo.tipoAcao}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="outline">{processo.tipo}</Badge>
                            {getPoloBadge(processo.polo)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{processo.parte}</p>
                            <p className="text-xs text-muted-foreground">{processo.responsavel}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{processo.vara}</p>
                            <p className="text-xs text-muted-foreground">{processo.comarca}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{processo.valorCausa}</p>
                            {processo.valorProvisionado && (
                              <p className="text-xs text-muted-foreground">
                                Prov: {processo.valorProvisionado}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(processo.status)}</TableCell>
                        <TableCell>{getRiscoBadge(processo.risco)}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{processo.ultimaMovimentacao}</p>
                            <p className="text-xs text-muted-foreground">{processo.dataUltimaMovimentacao}</p>
                          </div>
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
                                <Link href={`/dashboard/juridico/processos/${processo.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Visualizar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/juridico/processos/${processo.id}/editar`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="mr-2 h-4 w-4" />
                                Andamentos
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
