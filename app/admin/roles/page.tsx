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
import { Search, Plus, MoreVertical, Shield } from "lucide-react"
import Link from "next/link"

export default function RolesPage() {
  const roles = [
    {
      id: 1,
      name: "Super Admin",
      description: "Acesso total ao sistema",
      permissions: 45,
      users: 3,
      type: "system",
      createdAt: "10/01/2024",
    },
    {
      id: 2,
      name: "Administrador",
      description: "Gerencia empresa e usuários",
      permissions: 32,
      users: 12,
      type: "custom",
      createdAt: "15/01/2024",
    },
    {
      id: 3,
      name: "Gerente de Vendas",
      description: "Acesso ao módulo de vendas",
      permissions: 18,
      users: 25,
      type: "custom",
      createdAt: "20/01/2024",
    },
    {
      id: 4,
      name: "Vendedor",
      description: "Registro de vendas e clientes",
      permissions: 12,
      users: 67,
      type: "custom",
      createdAt: "22/01/2024",
    },
    {
      id: 5,
      name: "Financeiro",
      description: "Gestão financeira e relatórios",
      permissions: 15,
      users: 8,
      type: "custom",
      createdAt: "25/01/2024",
    },
    {
      id: 6,
      name: "Estoque",
      description: "Controle de produtos e estoque",
      permissions: 10,
      users: 15,
      type: "custom",
      createdAt: "28/01/2024",
    },
  ]

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Roles e Permissões</h1>
            <p className="text-muted-foreground">Gerencie funções e permissões do sistema</p>
          </div>
          <Link href="/admin/roles/nova">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Role
            </Button>
          </Link>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar Roles</CardTitle>
            <CardDescription>Encontre roles por nome ou descrição</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar roles..." className="pl-10" />
            </div>
          </CardContent>
        </Card>

        {/* Roles Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Roles</CardTitle>
            <CardDescription>Total de {roles.length} roles cadastradas</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Permissões</TableHead>
                  <TableHead>Usuários</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-medium">{role.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">{role.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{role.permissions} permissões</Badge>
                    </TableCell>
                    <TableCell>{role.users} usuários</TableCell>
                    <TableCell>
                      <Badge variant={role.type === "system" ? "default" : "secondary"}>
                        {role.type === "system" ? "Sistema" : "Customizada"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{role.createdAt}</TableCell>
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
                          <DropdownMenuItem>Editar permissões</DropdownMenuItem>
                          <DropdownMenuItem>Duplicar</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" disabled={role.type === "system"}>
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
