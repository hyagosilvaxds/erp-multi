import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreVertical, Building2 } from "lucide-react"
import Link from "next/link"

export default function UsuariosPage() {
  const users = [
    {
      id: 1,
      name: "João Silva",
      email: "joao.silva@techsolutions.com",
      companies: [
        { name: "Tech Solutions Ltda", role: "Administrador" },
        { name: "Comércio Digital SA", role: "Gerente de Vendas" },
      ],
      status: "active",
      lastAccess: "Há 2 horas",
      createdAt: "15/01/2024",
    },
    {
      id: 2,
      name: "Maria Santos",
      email: "maria.santos@comerciodigital.com",
      companies: [{ name: "Comércio Digital SA", role: "Gerente de Vendas" }],
      status: "active",
      lastAccess: "Há 5 minutos",
      createdAt: "18/01/2024",
    },
    {
      id: 3,
      name: "Pedro Oliveira",
      email: "pedro.oliveira@industriaabc.com",
      companies: [
        { name: "Indústria ABC", role: "Vendedor" },
        { name: "Logística Express", role: "Estoque" },
      ],
      status: "active",
      lastAccess: "Há 1 dia",
      createdAt: "20/01/2024",
    },
    {
      id: 4,
      name: "Ana Costa",
      email: "ana.costa@servicosxyz.com",
      companies: [{ name: "Serviços XYZ", role: "Financeiro" }],
      status: "inactive",
      lastAccess: "Há 15 dias",
      createdAt: "22/01/2024",
    },
    {
      id: 5,
      name: "Carlos Ferreira",
      email: "carlos.ferreira@logisticaexpress.com",
      companies: [
        { name: "Logística Express", role: "Estoque" },
        { name: "Tech Solutions Ltda", role: "Vendedor" },
        { name: "Indústria ABC", role: "Vendedor" },
      ],
      status: "active",
      lastAccess: "Há 30 minutos",
      createdAt: "25/01/2024",
    },
  ]

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Usuários</h1>
            <p className="text-muted-foreground">Gerencie todos os usuários do sistema</p>
          </div>
          <Link href="/admin/usuarios/novo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Usuário
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar Usuários</CardTitle>
            <CardDescription>Encontre usuários por nome, e-mail ou empresa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar por nome ou e-mail..." className="pl-10" />
              </div>
              <Button variant="outline">Filtros</Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
            <CardDescription>Total de {users.length} usuários cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Empresas e Permissões</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Último Acesso</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        {user.companies.map((company, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm">{company.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {company.role}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === "active" ? "default" : "secondary"}>
                        {user.status === "active" ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.lastAccess}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.createdAt}</TableCell>
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
                          <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem>Gerenciar empresas</DropdownMenuItem>
                          <DropdownMenuItem>Resetar senha</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            {user.status === "active" ? "Desativar" : "Ativar"}
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
