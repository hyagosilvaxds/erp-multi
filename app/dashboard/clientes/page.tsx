"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Search,
  Plus,
  MoreVertical,
  Users,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  ShoppingCart,
  DollarSign,
} from "lucide-react"
import Link from "next/link"

export default function ClientesPage() {
  const [filtroTipo, setFiltroTipo] = useState<string>("todos")
  const [filtroStatus, setFiltroStatus] = useState<string>("todos")

  const clientes = [
    {
      id: 1,
      nome: "João Silva & Cia Ltda",
      tipo: "juridica",
      documento: "12.345.678/0001-90",
      email: "contato@joaosilva.com.br",
      telefone: "(11) 98765-4321",
      cidade: "São Paulo",
      estado: "SP",
      status: "ativo",
      totalCompras: 125890.50,
      ultimaCompra: "28/09/2025",
      quantidadeCompras: 47,
      ticketMedio: 2678.52,
      categoria: "Premium",
    },
    {
      id: 2,
      nome: "Maria Santos",
      tipo: "fisica",
      documento: "123.456.789-00",
      email: "maria.santos@email.com",
      telefone: "(11) 91234-5678",
      cidade: "Rio de Janeiro",
      estado: "RJ",
      status: "ativo",
      totalCompras: 45230.00,
      ultimaCompra: "02/10/2025",
      quantidadeCompras: 23,
      ticketMedio: 1966.52,
      categoria: "Gold",
    },
    {
      id: 3,
      nome: "TechCorp Soluções LTDA",
      tipo: "juridica",
      documento: "98.765.432/0001-10",
      email: "compras@techcorp.com.br",
      telefone: "(21) 3344-5566",
      cidade: "Curitiba",
      estado: "PR",
      status: "ativo",
      totalCompras: 289450.75,
      ultimaCompra: "01/10/2025",
      quantidadeCompras: 89,
      ticketMedio: 3252.25,
      categoria: "Premium",
    },
    {
      id: 4,
      nome: "Pedro Oliveira",
      tipo: "fisica",
      documento: "987.654.321-00",
      email: "pedro.oliveira@email.com",
      telefone: "(11) 99876-5432",
      cidade: "São Paulo",
      estado: "SP",
      status: "ativo",
      totalCompras: 12350.00,
      ultimaCompra: "15/09/2025",
      quantidadeCompras: 8,
      ticketMedio: 1543.75,
      categoria: "Silver",
    },
    {
      id: 5,
      nome: "Comércio Digital ME",
      tipo: "juridica",
      documento: "11.222.333/0001-44",
      email: "fiscal@comerciodigital.com",
      telefone: "(41) 2233-4455",
      cidade: "Belo Horizonte",
      estado: "MG",
      status: "inativo",
      totalCompras: 5890.00,
      ultimaCompra: "10/06/2025",
      quantidadeCompras: 4,
      ticketMedio: 1472.50,
      categoria: "Bronze",
    },
    {
      id: 6,
      nome: "Ana Costa",
      tipo: "fisica",
      documento: "456.789.123-00",
      email: "ana.costa@email.com",
      telefone: "(31) 98877-6655",
      cidade: "Brasília",
      estado: "DF",
      status: "ativo",
      totalCompras: 78920.00,
      ultimaCompra: "30/09/2025",
      quantidadeCompras: 34,
      ticketMedio: 2321.18,
      categoria: "Gold",
    },
    {
      id: 7,
      nome: "Indústria Moderna S.A.",
      tipo: "juridica",
      documento: "22.333.444/0001-55",
      email: "compras@industriamoderna.com.br",
      telefone: "(51) 3322-1100",
      cidade: "Porto Alegre",
      estado: "RS",
      status: "ativo",
      totalCompras: 456780.25,
      ultimaCompra: "03/10/2025",
      quantidadeCompras: 125,
      ticketMedio: 3654.24,
      categoria: "Premium",
    },
    {
      id: 8,
      nome: "Carlos Ferreira",
      tipo: "fisica",
      documento: "321.654.987-00",
      email: "carlos.ferreira@email.com",
      telefone: "(85) 99112-3344",
      cidade: "Fortaleza",
      estado: "CE",
      status: "ativo",
      totalCompras: 23450.00,
      ultimaCompra: "25/09/2025",
      quantidadeCompras: 12,
      ticketMedio: 1954.17,
      categoria: "Silver",
    },
  ]

  const clientesFiltrados = clientes.filter((cliente) => {
    const matchTipo = filtroTipo === "todos" || cliente.tipo === filtroTipo
    const matchStatus = filtroStatus === "todos" || cliente.status === filtroStatus
    return matchTipo && matchStatus
  })

  const getInitials = (nome: string) => {
    return nome
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getCategoriaColor = (categoria: string) => {
    const colors: Record<string, string> = {
      Premium: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
      Gold: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
      Silver: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
      Bronze: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
    }
    return colors[categoria] || "bg-gray-100 text-gray-700"
  }

  const totalClientesAtivos = clientes.filter((c) => c.status === "ativo").length
  const totalFaturamento = clientes.reduce((acc, c) => acc + c.totalCompras, 0)
  const ticketMedioGeral = totalFaturamento / clientes.reduce((acc, c) => acc + c.quantidadeCompras, 0)

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Clientes</h1>
            <p className="text-muted-foreground">Gerencie sua base de clientes e relacionamentos</p>
          </div>
          <Link href="/dashboard/clientes/novo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </Link>
        </div>

        {/* Cards de Resumo */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientes.length}</div>
              <p className="text-xs text-muted-foreground">{totalClientesAtivos} ativos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {totalFaturamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Lifetime value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {ticketMedioGeral.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Por transação</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Premium</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clientes.filter((c) => c.categoria === "Premium").length}
              </div>
              <p className="text-xs text-muted-foreground">Top tier</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar clientes..." className="pl-10" />
              </div>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Tipos</SelectItem>
                  <SelectItem value="fisica">Pessoa Física</SelectItem>
                  <SelectItem value="juridica">Pessoa Jurídica</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Clientes */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>{clientesFiltrados.length} cliente(s) encontrado(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead className="text-right">Total Compras</TableHead>
                  <TableHead className="text-right">Ticket Médio</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientesFiltrados.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{getInitials(cliente.nome)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{cliente.nome}</p>
                          <p className="text-xs text-muted-foreground font-mono">{cliente.documento}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {cliente.tipo === "fisica" ? "Pessoa Física" : "Pessoa Jurídica"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="truncate max-w-[180px]">{cliente.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{cliente.telefone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {cliente.cidade}/{cliente.estado}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-medium">
                          R$ {cliente.totalCompras.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-muted-foreground">{cliente.quantidadeCompras} compras</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      R$ {cliente.ticketMedio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoriaColor(cliente.categoria)} variant="secondary">
                        {cliente.categoria}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={cliente.status === "ativo" ? "default" : "secondary"}>
                        {cliente.status === "ativo" ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Perfil
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Histórico de Compras
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Enviar E-mail
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Desativar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
