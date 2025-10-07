"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Plus, Trash2, Building2 } from "lucide-react"
import Link from "next/link"

interface CompanyRole {
  companyId: string
  companyName: string
  roleId: string
  roleName: string
  department?: string
}

export default function NovoUsuarioPage() {
  const [companyRoles, setCompanyRoles] = useState<CompanyRole[]>([])
  const [selectedCompany, setSelectedCompany] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const [department, setDepartment] = useState("")

  // Mock data
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

    // Verifica se já existe vínculo com essa empresa
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
      },
    ])

    // Limpa os campos
    setSelectedCompany("")
    setSelectedRole("")
    setDepartment("")
  }

  const handleRemoveCompanyRole = (companyId: string) => {
    setCompanyRoles(companyRoles.filter((cr) => cr.companyId !== companyId))
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin/usuarios">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Novo Usuário</h1>
            <p className="text-muted-foreground">Cadastre um novo usuário no sistema</p>
          </div>
        </div>

        {/* Form */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Dados básicos do usuário</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input id="name" placeholder="Nome do usuário" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input id="email" type="email" placeholder="usuario@empresa.com" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" placeholder="(00) 00000-0000" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input id="cpf" placeholder="000.000.000-00" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acesso ao Sistema</CardTitle>
                <CardDescription>Configure as credenciais de acesso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha Temporária *</Label>
                    <Input id="password" type="password" placeholder="Mínimo 8 caracteres" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Senha *</Label>
                    <Input id="confirm-password" type="password" placeholder="Repita a senha" />
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">
                    O usuário receberá um e-mail com instruções para criar uma nova senha no primeiro acesso.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Empresas e Permissões</CardTitle>
                <CardDescription>Vincule o usuário a empresas com permissões específicas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Formulário para adicionar vínculo */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="company-select">Empresa *</Label>
                    <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                      <SelectTrigger id="company-select">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
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

                <Button
                  onClick={handleAddCompanyRole}
                  variant="outline"
                  className="w-full bg-transparent"
                  type="button"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Empresa
                </Button>

                {/* Lista de vínculos */}
                {companyRoles.length > 0 && (
                  <div className="rounded-lg border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Empresa</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Departamento</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
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
                              <Badge variant="outline">{cr.roleName}</Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">{cr.department || "-"}</span>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveCompanyRole(cr.companyId)}
                                type="button"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {companyRoles.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border bg-muted/50 p-8 text-center">
                    <Building2 className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Nenhuma empresa vinculada. Adicione pelo menos uma empresa.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="status">Status Inicial *</Label>
                  <Select defaultValue="active">
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button size="lg" className="w-full">
                Cadastrar Usuário
              </Button>
              <Link href="/admin/usuarios" className="w-full">
                <Button variant="outline" size="lg" className="w-full bg-transparent">
                  Cancelar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
