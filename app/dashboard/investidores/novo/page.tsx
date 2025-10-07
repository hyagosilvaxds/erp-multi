"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Upload, Save } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function NovoInvestidorPage() {
  const [tipoDocumento, setTipoDocumento] = useState<"PF" | "PJ">("PF")

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/dashboard/investidores">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Novo Investidor</h1>
              <p className="text-muted-foreground">Cadastrar novo investidor SCP</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/investidores">Cancelar</Link>
            </Button>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Salvar Investidor
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Dados Básicos */}
            <Card>
              <CardHeader>
                <CardTitle>Dados Básicos</CardTitle>
                <CardDescription>Informações principais do investidor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Pessoa</Label>
                    <Select value={tipoDocumento} onValueChange={(value: "PF" | "PJ") => setTipoDocumento(value)}>
                      <SelectTrigger id="tipo">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PF">Pessoa Física</SelectItem>
                        <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="documento">{tipoDocumento === "PF" ? "CPF" : "CNPJ"}</Label>
                    <Input
                      id="documento"
                      placeholder={tipoDocumento === "PF" ? "000.000.000-00" : "00.000.000/0000-00"}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome">{tipoDocumento === "PF" ? "Nome Completo" : "Razão Social"}</Label>
                  <Input id="nome" placeholder="Digite o nome completo" />
                </div>

                {tipoDocumento === "PJ" && (
                  <div className="space-y-2">
                    <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                    <Input id="nomeFantasia" placeholder="Digite o nome fantasia" />
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" placeholder="investidor@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" placeholder="(00) 00000-0000" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dados Bancários */}
            <Card>
              <CardHeader>
                <CardTitle>Dados Bancários</CardTitle>
                <CardDescription>Para distribuição de rendimentos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="banco">Banco</Label>
                    <Input id="banco" placeholder="Ex: 001 - Banco do Brasil" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agencia">Agência</Label>
                    <Input id="agencia" placeholder="0000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="conta">Conta</Label>
                    <Input id="conta" placeholder="00000-0" />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tipoConta">Tipo de Conta</Label>
                    <Select>
                      <SelectTrigger id="tipoConta">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="corrente">Conta Corrente</SelectItem>
                        <SelectItem value="poupanca">Conta Poupança</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chavePix">Chave PIX (opcional)</Label>
                    <Input id="chavePix" placeholder="Digite a chave PIX" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Endereço */}
            <Card>
              <CardHeader>
                <CardTitle>Endereço</CardTitle>
                <CardDescription>Dados de localização</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="logradouro">Logradouro</Label>
                    <Input id="logradouro" placeholder="Rua, Avenida, etc" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numero">Número</Label>
                    <Input id="numero" placeholder="000" />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input id="complemento" placeholder="Apto, Sala, etc" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input id="bairro" placeholder="Digite o bairro" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input id="cep" placeholder="00000-000" />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input id="cidade" placeholder="Digite a cidade" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Select>
                      <SelectTrigger id="estado">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SP">São Paulo</SelectItem>
                        <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                        <SelectItem value="MG">Minas Gerais</SelectItem>
                        {/* Adicionar outros estados */}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Observações */}
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
                <CardDescription>Informações adicionais</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Digite observações relevantes sobre o investidor..."
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Projeto/Empresa */}
            <Card>
              <CardHeader>
                <CardTitle>Vínculo</CardTitle>
                <CardDescription>Empresa ou projeto associado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="empresa">Empresa</Label>
                  <Select>
                    <SelectTrigger id="empresa">
                      <SelectValue placeholder="Selecione a empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Empresa Principal</SelectItem>
                      <SelectItem value="2">Empresa Filial A</SelectItem>
                      <SelectItem value="3">Projeto Especial X</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projeto">Projeto (opcional)</Label>
                  <Select>
                    <SelectTrigger id="projeto">
                      <SelectValue placeholder="Selecione o projeto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Projeto Alpha</SelectItem>
                      <SelectItem value="2">Projeto Beta</SelectItem>
                      <SelectItem value="3">Projeto Gamma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Contrato */}
            <Card>
              <CardHeader>
                <CardTitle>Contrato SCP</CardTitle>
                <CardDescription>Documento do contrato de participação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dataContrato">Data do Contrato</Label>
                  <Input id="dataContrato" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numeroContrato">Número do Contrato</Label>
                  <Input id="numeroContrato" placeholder="Ex: SCP-2025-001" />
                </div>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Arraste o arquivo ou clique para fazer upload
                  </p>
                  <p className="text-xs text-muted-foreground">PDF até 10MB</p>
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Select defaultValue="ativo">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="suspenso">Suspenso</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
