"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Plus, Trash2, Building2, Shield, Edit } from "lucide-react"
import Link from "next/link"

interface CompanyRole {
  companyId: string
  companyName: string
  roleId: string
  roleName: string
  department?: string
  addedAt: string
}

export default function GerenciarEmpresasUsuarioPage() {
  const [companyRoles, setCompanyRoles] = useState<CompanyRole[]>([
    {
      companyId: "1",
      companyName: "Tech Solutions Ltda",
      roleId: "admin",
      roleName: "Administrador",
      department: "TI",
      addedAt: "15/01/2024",
    },
    {
      companyId: "2",
      companyName: "Comércio Digital SA",
      roleId: "manager",
      roleName: "Gerente de Vendas",
      department: "Vendas",
      addedAt: "20/01/2024",
    },
  ])

  const [selectedCompany, setSelectedCompany] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const [department, setDepartment] = useState("")

  // Mock data
  const user = {
    id: 1,
    name: "João Silva",
    email: "joao.silva@techsolutions.com",
  }

  const companies = [
    { id: "1", name: "Tech Solutions Ltda" },
    { id: "2", name: "Comércio Digital SA" },
    { id: "3", name: "Indústria ABC" },
    { id: "4", name: "Serviços XYZ" },
    { id: "5", name: "Logística Express" },
  ]

  const roles = [
    { id: "admin", name: "Administrador" },
    { id: "manager", name: "Gerente de Vendas" },
    { id: "seller", name: "Vendedor" },
    { id: "finance", name: "Financeiro" },
    { id: "stock", name: "Estoque" },
  ]

  const handleAddCompanyRole = () => {
    if (!selectedCompany || !selectedRole) return

    const company = companies.find((c) => c.id === selectedCompany)
    const role = roles.find((r) => r.id === selectedRole)

    if (!company || !role) return

    if (companyRoles.some((cr) => cr.companyId === selectedCompany)) {
      alert("Usuário já vinculado a esta empresa")
      return
    }

    setCompanyRoles([
      ...companyRoles,
      {
        companyId: company.id,
        companyName: company.name,
        roleId: role.id,
        roleName: role.name,
        department: department || undefined,
        addedAt: new Date().toLocaleDateString("pt-BR"),
      },
    ])

    setSelectedCompany("")
    setSelectedRole("")
    setDepartment("")
  }

  const handleRemoveCompanyRole = (companyId: string) => {
    if (confirm("Tem certeza que deseja remover este vínculo?")) {
      setCompanyRoles(companyRoles.filter((cr) => cr.companyId !== companyId))
    }
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/usuarios">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Gerenciar Empresas</h1>
            <p className="text-muted-foreground">Controle os vínculos e permissões do usuário</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adicionar Nova Empresa</CardTitle>
            <CardDescription>Vincule o usuário a uma nova empresa com permissões específicas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="company-select">Empresa *</Label>
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger id="company-select">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies
                      .filter((c) => !companyRoles.some((cr) => cr.companyId === c.id))
                      .map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role-select">Role *</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger id="role-select">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department-input">Departamento</Label>
                <Input
                  id="department-input"
                  placeholder="Ex: Vendas"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={handleAddCompanyRole} className="w-full" type="button">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Empresa
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Empresas Vinculadas</CardTitle>
            <CardDescription>
              {companyRoles.length} {companyRoles.length === 1 ? "empresa vinculada" : "empresas vinculadas"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {companyRoles.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Vinculado em</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companyRoles.map((cr) => (
                    <TableRow key={cr.companyId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{cr.companyName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline">{cr.roleName}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{cr.department || "-"}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{cr.addedAt}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" title="Editar permissões">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveCompanyRole(cr.companyId)}
                            title="Remover vínculo"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-muted/50 p-12 text-center">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-sm font-medium text-foreground">Nenhuma empresa vinculada</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Adicione empresas para que o usuário possa acessar o sistema
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
