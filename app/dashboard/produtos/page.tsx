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
import { Search, Plus, MoreVertical, Package, Edit, Trash2, Eye, AlertCircle, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"

export default function ProdutosPage() {
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas")
  const [filtroStatus, setFiltroStatus] = useState<string>("todos")

  const produtos = [
    {
      id: 1,
      codigo: "PROD-001",
      nome: "Notebook Dell Inspiron 15",
      categoria: "Informática",
      preco: 3299.90,
      custo: 2500.00,
      estoque: 45,
      estoqueMinimo: 10,
      status: "ativo",
      unidade: "UN",
      fornecedor: "Dell Brasil",
      ultimaCompra: "15/09/2025",
      imagem: "/placeholder.jpg",
    },
    {
      id: 2,
      codigo: "PROD-002",
      nome: "Mouse Logitech MX Master 3",
      categoria: "Periféricos",
      preco: 499.90,
      custo: 350.00,
      estoque: 8,
      estoqueMinimo: 15,
      status: "ativo",
      unidade: "UN",
      fornecedor: "Logitech",
      ultimaCompra: "20/09/2025",
      imagem: "/placeholder.jpg",
    },
    {
      id: 3,
      codigo: "PROD-003",
      nome: "Cadeira Ergonômica Premium",
      categoria: "Móveis",
      preco: 1899.00,
      custo: 1200.00,
      estoque: 25,
      estoqueMinimo: 5,
      status: "ativo",
      unidade: "UN",
      fornecedor: "Mobly",
      ultimaCompra: "10/09/2025",
      imagem: "/placeholder.jpg",
    },
    {
      id: 4,
      codigo: "PROD-004",
      nome: "Monitor LG 27\" 4K",
      categoria: "Informática",
      preco: 2199.00,
      custo: 1650.00,
      estoque: 12,
      estoqueMinimo: 8,
      status: "ativo",
      unidade: "UN",
      fornecedor: "LG Electronics",
      ultimaCompra: "18/09/2025",
      imagem: "/placeholder.jpg",
    },
    {
      id: 5,
      codigo: "PROD-005",
      nome: "Teclado Mecânico RGB",
      categoria: "Periféricos",
      preco: 599.90,
      custo: 400.00,
      estoque: 3,
      estoqueMinimo: 10,
      status: "ativo",
      unidade: "UN",
      fornecedor: "Redragon",
      ultimaCompra: "22/09/2025",
      imagem: "/placeholder.jpg",
    },
    {
      id: 6,
      codigo: "PROD-006",
      nome: "Webcam Logitech C920",
      categoria: "Periféricos",
      preco: 449.00,
      custo: 320.00,
      estoque: 0,
      estoqueMinimo: 5,
      status: "inativo",
      unidade: "UN",
      fornecedor: "Logitech",
      ultimaCompra: "05/09/2025",
      imagem: "/placeholder.jpg",
    },
    {
      id: 7,
      codigo: "PROD-007",
      nome: "Mesa Executiva 1.60m",
      categoria: "Móveis",
      preco: 899.00,
      custo: 600.00,
      estoque: 18,
      estoqueMinimo: 3,
      status: "ativo",
      unidade: "UN",
      fornecedor: "Tok&Stok",
      ultimaCompra: "12/09/2025",
      imagem: "/placeholder.jpg",
    },
    {
      id: 8,
      codigo: "PROD-008",
      nome: "Impressora HP LaserJet",
      categoria: "Informática",
      preco: 1299.00,
      custo: 950.00,
      estoque: 6,
      estoqueMinimo: 4,
      status: "ativo",
      unidade: "UN",
      fornecedor: "HP Brasil",
      ultimaCompra: "25/09/2025",
      imagem: "/placeholder.jpg",
    },
  ]

  const produtosFiltrados = produtos.filter((produto) => {
    const matchCategoria = filtroCategoria === "todas" || produto.categoria === filtroCategoria
    const matchStatus = filtroStatus === "todos" || produto.status === filtroStatus
    return matchCategoria && matchStatus
  })

  const calcularMargem = (preco: number, custo: number) => {
    return (((preco - custo) / preco) * 100).toFixed(1)
  }

  const categorias = Array.from(new Set(produtos.map((p) => p.categoria)))

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Produtos</h1>
            <p className="text-muted-foreground">Gerencie seu catálogo de produtos e estoque</p>
          </div>
          <Link href="/dashboard/produtos/novo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </Link>
        </div>

        {/* Cards de Resumo */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{produtos.length}</div>
              <p className="text-xs text-muted-foreground">
                {produtos.filter((p) => p.status === "ativo").length} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor em Estoque</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R${" "}
                {produtos
                  .reduce((acc, p) => acc + p.custo * p.estoque, 0)
                  .toFixed(2)
                  .replace(".", ",")}
              </div>
              <p className="text-xs text-muted-foreground">Custo total do inventário</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {produtos.filter((p) => p.estoque < p.estoqueMinimo).length}
              </div>
              <p className="text-xs text-muted-foreground">Produtos abaixo do mínimo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sem Estoque</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {produtos.filter((p) => p.estoque === 0).length}
              </div>
              <p className="text-xs text-muted-foreground">Produtos zerados</p>
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
                <Input placeholder="Buscar produtos..." className="pl-10" />
              </div>
              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Categorias</SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
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

        {/* Tabela de Produtos */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Produtos</CardTitle>
            <CardDescription>
              {produtosFiltrados.length} produto(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="text-right">Custo</TableHead>
                  <TableHead className="text-right">Margem</TableHead>
                  <TableHead className="text-center">Estoque</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtosFiltrados.map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell className="font-mono text-sm">{produto.codigo}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{produto.nome}</p>
                          <p className="text-xs text-muted-foreground">{produto.fornecedor}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{produto.categoria}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      R$ {produto.preco.toFixed(2).replace(".", ",")}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      R$ {produto.custo.toFixed(2).replace(".", ",")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">
                        {calcularMargem(produto.preco, produto.custo)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Badge
                          variant={
                            produto.estoque === 0
                              ? "destructive"
                              : produto.estoque < produto.estoqueMinimo
                                ? "outline"
                                : "secondary"
                          }
                          className={
                            produto.estoque < produto.estoqueMinimo && produto.estoque > 0
                              ? "border-orange-600 text-orange-600"
                              : ""
                          }
                        >
                          {produto.estoque} {produto.unidade}
                        </Badge>
                        {produto.estoque < produto.estoqueMinimo && (
                          <span className="text-xs text-muted-foreground">
                            Mín: {produto.estoqueMinimo}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={produto.status === "ativo" ? "default" : "secondary"}>
                        {produto.status === "ativo" ? "Ativo" : "Inativo"}
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
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Package className="mr-2 h-4 w-4" />
                            Ajustar Estoque
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
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
