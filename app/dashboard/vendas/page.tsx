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
import { Search, Plus, MoreVertical, Download } from "lucide-react"

export default function VendasPage() {
  const sales = [
    {
      id: "#VND-001",
      customer: "João Silva",
      product: "Notebook Dell Inspiron",
      quantity: 1,
      value: "R$ 3.499,00",
      status: "completed",
      date: "10/03/2025",
    },
    {
      id: "#VND-002",
      customer: "Maria Santos",
      product: "Mouse Logitech MX",
      quantity: 2,
      value: "R$ 179,80",
      status: "completed",
      date: "10/03/2025",
    },
    {
      id: "#VND-003",
      customer: "Pedro Costa",
      product: "Teclado Mecânico RGB",
      quantity: 1,
      value: "R$ 459,00",
      status: "pending",
      date: "10/03/2025",
    },
    {
      id: "#VND-004",
      customer: "Ana Oliveira",
      product: "Monitor LG UltraWide",
      quantity: 1,
      value: "R$ 1.299,00",
      status: "completed",
      date: "09/03/2025",
    },
    {
      id: "#VND-005",
      customer: "Carlos Mendes",
      product: "Webcam Logitech C920",
      quantity: 3,
      value: "R$ 1.197,00",
      status: "completed",
      date: "09/03/2025",
    },
    {
      id: "#VND-006",
      customer: "Juliana Rocha",
      product: "Headset HyperX Cloud",
      quantity: 1,
      value: "R$ 399,00",
      status: "cancelled",
      date: "09/03/2025",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">Concluída</Badge>
      case "pending":
        return <Badge variant="secondary">Pendente</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelada</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Vendas</h1>
            <p className="text-muted-foreground">Gerencie todas as vendas da sua empresa</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Venda
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar Vendas</CardTitle>
            <CardDescription>Encontre vendas por ID, cliente ou produto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar vendas..." className="pl-10" />
              </div>
              <Button variant="outline">Filtros</Button>
            </div>
          </CardContent>
        </Card>

        {/* Sales Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Vendas</CardTitle>
            <CardDescription>Total de {sales.length} vendas registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Qtd</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-mono text-sm font-medium">{sale.id}</TableCell>
                    <TableCell>{sale.customer}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{sale.product}</TableCell>
                    <TableCell>{sale.quantity}</TableCell>
                    <TableCell className="font-semibold">{sale.value}</TableCell>
                    <TableCell>{getStatusBadge(sale.status)}</TableCell>
                    <TableCell className="text-muted-foreground">{sale.date}</TableCell>
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
                          <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem>Imprimir nota</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">Cancelar venda</DropdownMenuItem>
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
