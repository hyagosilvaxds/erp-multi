"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Upload, FileText, Save, X } from "lucide-react"

export default function NovoContratoPage() {
  const router = useRouter()
  const [dataInicio, setDataInicio] = useState<Date>()
  const [dataVencimento, setDataVencimento] = useState<Date>()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aqui você implementaria a lógica de salvamento
    console.log("Contrato salvo")
    router.push("/dashboard/juridico/contratos")
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Novo Contrato</h1>
            <p className="text-muted-foreground">Cadastre um novo contrato no sistema</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Informações Básicas */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>Dados principais do contrato</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="numero">Número do Contrato *</Label>
                  <Input id="numero" placeholder="Ex: CONT-2024-0001" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Contrato *</Label>
                  <Select required>
                    <SelectTrigger id="tipo">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prestacao-servicos">Prestação de Serviços</SelectItem>
                      <SelectItem value="fornecimento">Fornecimento</SelectItem>
                      <SelectItem value="locacao">Locação</SelectItem>
                      <SelectItem value="parceria">Parceria</SelectItem>
                      <SelectItem value="confidencialidade">Confidencialidade (NDA)</SelectItem>
                      <SelectItem value="compra-venda">Compra e Venda</SelectItem>
                      <SelectItem value="trabalho">Trabalho</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Input id="categoria" placeholder="Ex: Tecnologia, Fornecimento" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="objeto">Objeto do Contrato *</Label>
                  <Input id="objeto" placeholder="Ex: Desenvolvimento de Software" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição Detalhada</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva os principais pontos e objetivos do contrato..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Informações da Parte Contratada */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Parte Contratada</CardTitle>
              <CardDescription>Informações da outra parte envolvida no contrato</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="razao-social">Razão Social / Nome *</Label>
                  <Input id="razao-social" placeholder="Nome completo ou razão social" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj-cpf">CNPJ / CPF *</Label>
                  <Input id="cnpj-cpf" placeholder="00.000.000/0000-00" required />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" placeholder="contato@empresa.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" placeholder="(11) 98765-4321" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço Completo</Label>
                <Input id="endereco" placeholder="Rua, número, complemento, bairro, cidade - UF" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="representante">Representante Legal</Label>
                  <Input id="representante" placeholder="Nome do representante" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargo-representante">Cargo</Label>
                  <Input id="cargo-representante" placeholder="Ex: Diretor, Sócio" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Valores e Condições Financeiras */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Valores e Condições Financeiras</CardTitle>
              <CardDescription>Informações sobre valores e pagamentos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="valor-total">Valor Total *</Label>
                  <Input id="valor-total" placeholder="R$ 0,00" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor-mensal">Valor Mensal (se aplicável)</Label>
                  <Input id="valor-mensal" placeholder="R$ 0,00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="forma-pagamento">Forma de Pagamento</Label>
                  <Select>
                    <SelectTrigger id="forma-pagamento">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boleto">Boleto</SelectItem>
                      <SelectItem value="transferencia">Transferência</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="cartao">Cartão</SelectItem>
                      <SelectItem value="deposito">Depósito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dia-vencimento">Dia de Vencimento</Label>
                  <Select>
                    <SelectTrigger id="dia-vencimento">
                      <SelectValue placeholder="Selecione o dia" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => (
                        <SelectItem key={dia} value={dia.toString()}>
                          Dia {dia}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condicoes-pagamento">Condições de Pagamento</Label>
                  <Input id="condicoes-pagamento" placeholder="Ex: 30/60/90 dias" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes-financeiras">Observações Financeiras</Label>
                <Textarea
                  id="observacoes-financeiras"
                  placeholder="Detalhes adicionais sobre pagamentos, multas, reajustes, etc."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Vigência e Prazos */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Vigência e Prazos</CardTitle>
              <CardDescription>Datas e períodos do contrato</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Data de Início *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dataInicio && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dataInicio ? format(dataInicio, "PPP", { locale: ptBR }) : "Selecione a data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dataInicio}
                        onSelect={setDataInicio}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Data de Vencimento *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dataVencimento && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dataVencimento ? format(dataVencimento, "PPP", { locale: ptBR }) : "Selecione a data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dataVencimento}
                        onSelect={setDataVencimento}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="prazo-meses">Prazo (em meses)</Label>
                  <Input id="prazo-meses" type="number" placeholder="12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prazo-rescisao">Prazo de Rescisão (dias)</Label>
                  <Input id="prazo-rescisao" type="number" placeholder="30" />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="renovacao-automatica" />
                <Label htmlFor="renovacao-automatica" className="cursor-pointer">
                  Renovação Automática
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clausulas-renovacao">Cláusulas de Renovação</Label>
                <Textarea
                  id="clausulas-renovacao"
                  placeholder="Condições e termos para renovação automática..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Responsável e Gestão */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Responsável e Gestão</CardTitle>
              <CardDescription>Informações sobre a gestão do contrato</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="responsavel">Responsável pelo Contrato *</Label>
                  <Select required>
                    <SelectTrigger id="responsavel">
                      <SelectValue placeholder="Selecione o responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="carlos">Dr. Carlos Silva</SelectItem>
                      <SelectItem value="maria">Dra. Maria Santos</SelectItem>
                      <SelectItem value="ana">Dra. Ana Costa</SelectItem>
                      <SelectItem value="joao">Dr. João Oliveira</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departamento">Departamento</Label>
                  <Select>
                    <SelectTrigger id="departamento">
                      <SelectValue placeholder="Selecione o departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="juridico">Jurídico</SelectItem>
                      <SelectItem value="compras">Compras</SelectItem>
                      <SelectItem value="ti">TI</SelectItem>
                      <SelectItem value="rh">RH</SelectItem>
                      <SelectItem value="financeiro">Financeiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes-gestao">Observações de Gestão</Label>
                <Textarea
                  id="observacoes-gestao"
                  placeholder="Informações relevantes para a gestão do contrato..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                <Input id="tags" placeholder="tecnologia, desenvolvimento, mensal" />
              </div>
            </CardContent>
          </Card>

          {/* Upload de Documentos */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
              <CardDescription>Faça upload do contrato e documentos relacionados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="arquivo-contrato">Arquivo do Contrato (PDF)</Label>
                <div className="flex items-center gap-2">
                  <Input id="arquivo-contrato" type="file" accept=".pdf" />
                  <Button type="button" variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="anexos">Documentos Anexos</Label>
                <div className="flex items-center gap-2">
                  <Input id="anexos" type="file" multiple />
                  <Button type="button" variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Você pode fazer upload de múltiplos arquivos (propostas, aditivos, documentos das partes, etc.)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Salvar Contrato
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
