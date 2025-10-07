"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
// ...existing code...
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Building2, User, Shield, Save, Upload } from "lucide-react"

export default function ConfiguracoesPage() {
  // 2FA e sessões ativas foram ocultadas conforme solicitado

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Configurações</h1>
          <p className="text-muted-foreground">Gerencie as configurações do sistema e da sua conta</p>
        </div>

        {/* Tabs de Configuração */}
        <Tabs defaultValue="empresa" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="empresa">
              <Building2 className="mr-2 h-4 w-4" />
              Empresa
            </TabsTrigger>
            <TabsTrigger value="perfil">
              <User className="mr-2 h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="seguranca">
              <Shield className="mr-2 h-4 w-4" />
              Segurança
            </TabsTrigger>
          </TabsList>

          {/* Empresa */}
          <TabsContent value="empresa" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Empresa</CardTitle>
                <CardDescription>Dados cadastrais e identificação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-border">
                    <div className="text-center">
                      <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                      <p className="mt-1 text-xs text-muted-foreground">Logo</p>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>Logo da Empresa</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Fazer Upload
                      </Button>
                      <Button variant="ghost" size="sm">
                        Remover
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">PNG, JPG ou SVG. Tamanho máximo: 2MB</p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="razao-social">Razão Social</Label>
                    <Input id="razao-social" defaultValue="Tech Solutions LTDA" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nome-fantasia">Nome Fantasia</Label>
                    <Input id="nome-fantasia" defaultValue="Tech Solutions" />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input id="cnpj" defaultValue="12.345.678/0001-90" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inscricao-estadual">Inscrição Estadual</Label>
                    <Input id="inscricao-estadual" defaultValue="123.456.789.000" />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email-empresa">E-mail</Label>
                    <Input id="email-empresa" type="email" defaultValue="contato@techsolutions.com.br" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone-empresa">Telefone</Label>
                    <Input id="telefone-empresa" defaultValue="(11) 3344-5566" />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Endereço</Label>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="cep">CEP</Label>
                      <Input id="cep" defaultValue="01234-567" />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="endereco">Endereço</Label>
                      <Input id="endereco" defaultValue="Av. Paulista, 1000" />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                      <Label htmlFor="numero">Número</Label>
                      <Input id="numero" defaultValue="1000" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="complemento">Complemento</Label>
                      <Input id="complemento" placeholder="Sala, Andar..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bairro">Bairro</Label>
                      <Input id="bairro" defaultValue="Bela Vista" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input id="cidade" defaultValue="São Paulo" />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="estado">Estado</Label>
                      <Select defaultValue="SP">
                        <SelectTrigger id="estado">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SP">São Paulo</SelectItem>
                          <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                          <SelectItem value="MG">Minas Gerais</SelectItem>
                          <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pais">País</Label>
                      <Input id="pais" defaultValue="Brasil" disabled />
                    </div>
                  </div>
                </div>

                <Button className="w-full md:w-auto">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Perfil */}
          <TabsContent value="perfil" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Atualize seus dados pessoais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-foreground text-3xl font-bold">
                    JS
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>Foto de Perfil</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Alterar Foto
                      </Button>
                      <Button variant="ghost" size="sm">
                        Remover
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">JPG ou PNG. Tamanho máximo: 1MB</p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input id="nome" defaultValue="João Silva" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cargo">Cargo</Label>
                    <Input id="cargo" defaultValue="Gerente Financeiro" />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email-perfil">E-mail</Label>
                    <Input id="email-perfil" type="email" defaultValue="joao.silva@techsolutions.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone-perfil">Telefone</Label>
                    <Input id="telefone-perfil" defaultValue="(11) 98765-4321" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biografia</Label>
                  <Textarea
                    id="bio"
                    placeholder="Conte um pouco sobre você..."
                    rows={4}
                    defaultValue="Profissional com mais de 10 anos de experiência em gestão financeira..."
                  />
                </div>

                <Button className="w-full md:w-auto">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* notificacoes tab removida */}

          {/* Segurança */}
          <TabsContent value="seguranca" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Segurança da Conta</CardTitle>
                <CardDescription>Proteja sua conta e dados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Alterar Senha</Label>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="senha-atual">Senha Atual</Label>
                      <Input id="senha-atual" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nova-senha">Nova Senha</Label>
                      <Input id="nova-senha" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmar-senha">Confirmar Nova Senha</Label>
                      <Input id="confirmar-senha" type="password" />
                    </div>
                    <Button variant="outline">Alterar Senha</Button>
                  </div>
                </div>

                {/* Autenticação de Dois Fatores e Sessões Ativas foram ocultadas */}
              </CardContent>
            </Card>
          </TabsContent>

          {/* aparencia tab removida */}

          {/* plano tab removida */}
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
