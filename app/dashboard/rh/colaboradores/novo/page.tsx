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
import { ArrowLeft, Save, Upload, FileText } from "lucide-react"
import Link from "next/link"

export default function NovoColaboradorPage() {
  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/dashboard/rh/colaboradores">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Novo Colaborador</h1>
              <p className="text-muted-foreground">Cadastrar novo colaborador</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/rh/colaboradores">Cancelar</Link>
            </Button>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Salvar Colaborador
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Dados Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle>Dados Pessoais</CardTitle>
                <CardDescription>Informações básicas do colaborador</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input id="nome" placeholder="Digite o nome completo" />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input id="cpf" placeholder="000.000.000-00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rg">RG</Label>
                    <Input id="rg" placeholder="00.000.000-0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                    <Input id="dataNascimento" type="date" />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" placeholder="colaborador@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" placeholder="(00) 00000-0000" />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="estadoCivil">Estado Civil</Label>
                    <Select>
                      <SelectTrigger id="estadoCivil">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                        <SelectItem value="casado">Casado(a)</SelectItem>
                        <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                        <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grauInstrucao">Grau de Instrução</Label>
                    <Select>
                      <SelectTrigger id="grauInstrucao">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fundamental">Ensino Fundamental</SelectItem>
                        <SelectItem value="medio">Ensino Médio</SelectItem>
                        <SelectItem value="superior">Ensino Superior</SelectItem>
                        <SelectItem value="posgraduacao">Pós-Graduação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dados Profissionais */}
            <Card>
              <CardHeader>
                <CardTitle>Dados Profissionais</CardTitle>
                <CardDescription>Cargo, salário e vínculo empregatício</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cargo">Cargo *</Label>
                    <Input id="cargo" placeholder="Ex: Analista de Sistemas" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="departamento">Departamento</Label>
                    <Input id="departamento" placeholder="Ex: TI" />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="dataAdmissao">Data de Admissão *</Label>
                    <Input id="dataAdmissao" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vinculo">Tipo de Vínculo *</Label>
                    <Select>
                      <SelectTrigger id="vinculo">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clt">CLT</SelectItem>
                        <SelectItem value="pj">PJ</SelectItem>
                        <SelectItem value="estagio">Estágio</SelectItem>
                        <SelectItem value="temporario">Temporário</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="salario">Salário Base *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
                      <Input id="salario" type="number" placeholder="0,00" className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cargaHoraria">Carga Horária</Label>
                    <Input id="cargaHoraria" placeholder="Ex: 44h semanais" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="centroCusto">Centro de Custo *</Label>
                  <Select>
                    <SelectTrigger id="centroCusto">
                      <SelectValue placeholder="Selecione o centro de custo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ti">TI</SelectItem>
                      <SelectItem value="vendas">Vendas</SelectItem>
                      <SelectItem value="financeiro">Financeiro</SelectItem>
                      <SelectItem value="administrativo">Administrativo</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Documentos Trabalhistas */}
            <Card>
              <CardHeader>
                <CardTitle>Documentos Trabalhistas</CardTitle>
                <CardDescription>CTPS, PIS, ASO e outros documentos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ctpsNumero">CTPS - Número</Label>
                    <Input id="ctpsNumero" placeholder="0000000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ctpsSerie">CTPS - Série</Label>
                    <Input id="ctpsSerie" placeholder="0000" />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pis">PIS/PASEP</Label>
                    <Input id="pis" placeholder="000.00000.00-0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tituloEleitor">Título de Eleitor</Label>
                    <Input id="tituloEleitor" placeholder="0000 0000 0000" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reservista">Certificado de Reservista</Label>
                  <Input id="reservista" placeholder="Número do certificado" />
                </div>

                <div className="space-y-2">
                  <Label>Anexar Documentos</Label>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-2">
                      <Input type="file" accept=".pdf,.jpg,.png" className="flex-1" />
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        RG/CPF
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input type="file" accept=".pdf,.jpg,.png" className="flex-1" />
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        CTPS
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input type="file" accept=".pdf,.jpg,.png" className="flex-1" />
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        ASO
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input type="file" accept=".pdf,.jpg,.png" className="flex-1" />
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Outros
                      </Button>
                    </div>
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
                    <Input id="complemento" placeholder="Apto, Casa, etc" />
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
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Informações adicionais sobre o colaborador..."
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Dados Bancários */}
            <Card>
              <CardHeader>
                <CardTitle>Dados Bancários</CardTitle>
                <CardDescription>Para pagamento de salário</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                <div className="space-y-2">
                  <Label htmlFor="tipoConta">Tipo de Conta</Label>
                  <Select>
                    <SelectTrigger id="tipoConta">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corrente">Conta Corrente</SelectItem>
                      <SelectItem value="poupanca">Conta Poupança</SelectItem>
                      <SelectItem value="salario">Conta Salário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chavePix">Chave PIX (opcional)</Label>
                  <Input id="chavePix" placeholder="Digite a chave PIX" />
                </div>
              </CardContent>
            </Card>

            {/* Benefícios */}
            <Card>
              <CardHeader>
                <CardTitle>Benefícios</CardTitle>
                <CardDescription>Benefícios do colaborador</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="valeTransporte">Vale Transporte</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
                    <Input id="valeTransporte" type="number" placeholder="0,00" className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valeRefeicao">Vale Refeição</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
                    <Input id="valeRefeicao" type="number" placeholder="0,00" className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valeAlimentacao">Vale Alimentação</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
                    <Input id="valeAlimentacao" type="number" placeholder="0,00" className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="planoSaude">Plano de Saúde</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
                    <Input id="planoSaude" type="number" placeholder="0,00" className="pl-10" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status do Colaborador</CardTitle>
              </CardHeader>
              <CardContent>
                <Select defaultValue="ativo">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="afastado">Afastado</SelectItem>
                    <SelectItem value="ferias">Férias</SelectItem>
                    <SelectItem value="desligado">Desligado</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Documentos Anexados */}
            <Card>
              <CardHeader>
                <CardTitle>Documentos Anexados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Nenhum documento anexado ainda
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
