import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NovaRolePage() {
  const permissionGroups = [
    {
      name: "Dashboard",
      permissions: [
        { id: "dashboard.view", label: "Visualizar Dashboard" },
        { id: "dashboard.export", label: "Exportar Relatórios" },
      ],
    },
    {
      name: "Empresas",
      permissions: [
        { id: "companies.view", label: "Visualizar Empresas" },
        { id: "companies.create", label: "Criar Empresas" },
        { id: "companies.edit", label: "Editar Empresas" },
        { id: "companies.delete", label: "Excluir Empresas" },
      ],
    },
    {
      name: "Usuários",
      permissions: [
        { id: "users.view", label: "Visualizar Usuários" },
        { id: "users.create", label: "Criar Usuários" },
        { id: "users.edit", label: "Editar Usuários" },
        { id: "users.delete", label: "Excluir Usuários" },
        { id: "users.manage_roles", label: "Gerenciar Roles" },
      ],
    },
    {
      name: "Vendas",
      permissions: [
        { id: "sales.view", label: "Visualizar Vendas" },
        { id: "sales.create", label: "Criar Vendas" },
        { id: "sales.edit", label: "Editar Vendas" },
        { id: "sales.delete", label: "Excluir Vendas" },
        { id: "sales.approve", label: "Aprovar Vendas" },
      ],
    },
    {
      name: "Produtos",
      permissions: [
        { id: "products.view", label: "Visualizar Produtos" },
        { id: "products.create", label: "Criar Produtos" },
        { id: "products.edit", label: "Editar Produtos" },
        { id: "products.delete", label: "Excluir Produtos" },
      ],
    },
    {
      name: "Clientes",
      permissions: [
        { id: "customers.view", label: "Visualizar Clientes" },
        { id: "customers.create", label: "Criar Clientes" },
        { id: "customers.edit", label: "Editar Clientes" },
        { id: "customers.delete", label: "Excluir Clientes" },
      ],
    },
    {
      name: "Financeiro",
      permissions: [
        { id: "finance.view", label: "Visualizar Financeiro" },
        { id: "finance.create", label: "Criar Lançamentos" },
        { id: "finance.edit", label: "Editar Lançamentos" },
        { id: "finance.delete", label: "Excluir Lançamentos" },
        { id: "finance.approve", label: "Aprovar Pagamentos" },
      ],
    },
    {
      name: "Relatórios",
      permissions: [
        { id: "reports.view", label: "Visualizar Relatórios" },
        { id: "reports.export", label: "Exportar Relatórios" },
        { id: "reports.advanced", label: "Relatórios Avançados" },
      ],
    },
    {
      name: "Configurações",
      permissions: [
        { id: "settings.view", label: "Visualizar Configurações" },
        { id: "settings.edit", label: "Editar Configurações" },
        { id: "settings.system", label: "Configurações do Sistema" },
      ],
    },
  ]

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin/roles">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Nova Role</h1>
            <p className="text-muted-foreground">Crie uma nova função com permissões personalizadas</p>
          </div>
        </div>

        {/* Form */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Role</CardTitle>
                <CardDescription>Defina o nome e descrição da função</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Role *</Label>
                  <Input id="name" placeholder="Ex: Gerente de Vendas" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea id="description" placeholder="Descreva as responsabilidades desta função..." rows={3} />
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Permissões</CardTitle>
                <CardDescription>Selecione as permissões para esta role</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {permissionGroups.map((group) => (
                  <div key={group.name} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-foreground">{group.name}</h4>
                      <Button variant="ghost" size="sm">
                        Selecionar todos
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {group.permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox id={permission.id} />
                          <label
                            htmlFor={permission.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {permission.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Permissões selecionadas</p>
                  <p className="text-2xl font-bold text-foreground">0</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Módulos com acesso</p>
                  <p className="text-2xl font-bold text-foreground">0</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button size="lg" className="w-full">
                Criar Role
              </Button>
              <Link href="/admin/roles" className="w-full">
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
