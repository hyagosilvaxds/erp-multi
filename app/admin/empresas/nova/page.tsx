import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NovaEmpresaPage() {
  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin/empresas">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Nova Empresa</h1>
            <p className="text-muted-foreground">Cadastre uma nova empresa no sistema</p>
          </div>
        </div>

        {/* Form */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Empresa</CardTitle>
                <CardDescription>Preencha os dados básicos da empresa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="name">Razão Social *</Label>
                    <Input id="name" placeholder="Nome completo da empresa" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <Input id="cnpj" placeholder="00.000.000/0000-00" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ie">Inscrição Estadual</Label>
                    <Input id="ie" placeholder="000.000.000.000" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input id="email" type="email" placeholder="contato@empresa.com" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input id="phone" placeholder="(00) 0000-0000" />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="regimeTributario">Regime Tributário *</Label>
                    <Select>
                      <SelectTrigger id="regimeTributario">
                        <SelectValue placeholder="Selecione o regime tributário" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simples-nacional">Simples Nacional</SelectItem>
                        <SelectItem value="lucro-presumido">Lucro Presumido</SelectItem>
                        <SelectItem value="lucro-real">Lucro Real</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Endereço Completo</Label>
                  <Textarea id="address" placeholder="Rua, número, bairro, cidade, estado, CEP" rows={3} />
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Configurações Iniciais</CardTitle>
                <CardDescription>Defina as configurações de acesso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="admin-name">Nome do Administrador *</Label>
                    <Input id="admin-name" placeholder="Nome completo" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-email">E-mail do Administrador *</Label>
                    <Input id="admin-email" type="email" placeholder="admin@empresa.com" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Senha Temporária *</Label>
                    <Input id="admin-password" type="password" placeholder="Mínimo 8 caracteres" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-phone">Telefone do Administrador</Label>
                    <Input id="admin-phone" placeholder="(00) 00000-0000" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Plano e Assinatura removidos */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="status">Status Inicial *</Label>
                  <Select defaultValue="trial">
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button size="lg" className="w-full">
                Cadastrar Empresa
              </Button>
              <Link href="/admin/empresas" className="w-full">
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
