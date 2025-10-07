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
import { Search, Plus, MoreVertical, Building2, LogIn } from "lucide-react"
import Link from "next/link"

export default function EmpresasPage() {
  const companies = [
    {
      id: 1,
      name: "Tech Solutions Ltda",
      cnpj: "12.345.678/0001-90",
      plan: "Enterprise",
      users: 45,
      status: "active",
      createdAt: "15/01/2024",
      regimeTributario: "Lucro Presumido",
      logo: null,
    },
    {
      id: 2,
      name: "Comércio Digital SA",
      cnpj: "98.765.432/0001-10",
      plan: "Professional",
      users: 23,
      status: "active",
      createdAt: "22/01/2024",
      regimeTributario: "Simples Nacional",
      logo: null,
    },
    {
      id: 3,
      name: "Indústria ABC",
      cnpj: "11.222.333/0001-44",
      plan: "Enterprise",
      users: 67,
      status: "active",
      createdAt: "05/02/2024",
      regimeTributario: "Lucro Real",
      logo: null,
    },
    {
      id: 4,
      name: "Serviços XYZ",
      cnpj: "55.666.777/0001-88",
      plan: "Basic",
      users: 8,
      status: "trial",
      createdAt: "10/02/2024",
      regimeTributario: "Simples Nacional",
      logo: null,
    },
    {
      id: 5,
      name: "Logística Express",
      cnpj: "33.444.555/0001-22",
      plan: "Professional",
      users: 34,
      status: "active",
      createdAt: "18/02/2024",
      regimeTributario: "Lucro Presumido",
      logo: null,
    },
    {
      id: 6,
      name: "Consultoria Premium",
      cnpj: "77.888.999/0001-66",
      plan: "Enterprise",
      users: 52,
      status: "active",
      createdAt: "25/02/2024",
      regimeTributario: "Lucro Real",
      logo: null,
    },
  ]

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Empresas</h1>
            <p className="text-muted-foreground">Gerencie todas as empresas cadastradas</p>
          </div>
          <Link href="/admin/empresas/nova">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Empresa
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar Empresas</CardTitle>
            <CardDescription>Encontre empresas por nome, CNPJ ou plano</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar por nome ou CNPJ..." className="pl-10" />
              </div>
              <Button variant="outline">Filtros</Button>
            </div>
          </CardContent>
        </Card>

        {/* Companies Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Empresas</CardTitle>
            <CardDescription>Total de {companies.length} empresas cadastradas</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Regime Tributário</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Usuários</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          {company.logo ? (
                            <img src={company.logo} alt={company.name} className="h-full w-full rounded-lg object-contain" />
                          ) : (
                            <Building2 className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <span className="font-medium">{company.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{company.cnpj}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{company.regimeTributario}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{company.plan}</Badge>
                    </TableCell>
                    <TableCell>{company.users}</TableCell>
                    <TableCell>
                      <Badge variant={company.status === "active" ? "default" : "secondary"}>
                        {company.status === "active" ? "Ativo" : "Trial"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{company.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/selecionar-empresa?companyId=${company.id}`}>
                            <LogIn className="mr-2 h-4 w-4" />
                            Entrar
                          </Link>
                        </Button>
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
                              <Link href={`/admin/empresas/${company.id}`}>Ver configurações</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>Editar informações</DropdownMenuItem>
                            <DropdownMenuItem>Gerenciar usuários</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">Desativar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
