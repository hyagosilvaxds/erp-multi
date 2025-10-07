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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Upload, Save, X } from "lucide-react"

export default function NovoProcessoPage() {
  const router = useRouter()
  const [dataDistribuicao, setDataDistribuicao] = useState<Date>()
  const [polo, setPolo] = useState("passivo")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aqui você implementaria a lógica de salvamento
    console.log("Processo salvo")
    router.push("/dashboard/juridico/processos")
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Novo Processo</h1>
            <p className="text-muted-foreground">Cadastre um novo processo judicial no sistema</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Informações Básicas do Processo */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Informações Básicas do Processo</CardTitle>
              <CardDescription>Dados principais do processo judicial</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="numero-processo">Número do Processo *</Label>
                  <Input
                    id="numero-processo"
                    placeholder="0000000-00.0000.0.00.0000"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Formato CNJ: NNNNNNN-DD.AAAA.J.TR.OOOO
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo-processo">Tipo de Processo *</Label>
                  <Select required>
                    <SelectTrigger id="tipo-processo">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trabalhista">Trabalhista</SelectItem>
                      <SelectItem value="civel">Cível</SelectItem>
                      <SelectItem value="tributario">Tributário</SelectItem>
                      <SelectItem value="consumidor">Consumidor</SelectItem>
                      <SelectItem value="administrativo">Administrativo</SelectItem>
                      <SelectItem value="previdenciario">Previdenciário</SelectItem>
                      <SelectItem value="criminal">Criminal</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tipo-acao">Tipo de Ação *</Label>
                  <Input
                    id="tipo-acao"
                    placeholder="Ex: Reclamação Trabalhista, Cobrança, Mandado de Segurança"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Polo *</Label>
                  <RadioGroup value={polo} onValueChange={setPolo} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ativo" id="polo-ativo" />
                      <Label htmlFor="polo-ativo" className="cursor-pointer font-normal">
                        Polo Ativo (Autor)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="passivo" id="polo-passivo" />
                      <Label htmlFor="polo-passivo" className="cursor-pointer font-normal">
                        Polo Passivo (Réu)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="objeto">Objeto do Processo *</Label>
                <Textarea
                  id="objeto"
                  placeholder="Descreva o objeto da ação, pedidos principais e contexto..."
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Informações da Parte Contrária */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Parte Contrária</CardTitle>
              <CardDescription>
                {polo === "ativo" ? "Informações do(s) réu(s)" : "Informações do(s) autor(es)"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nome-parte">Nome / Razão Social *</Label>
                  <Input id="nome-parte" placeholder="Nome completo ou razão social" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf-cnpj-parte">CPF / CNPJ</Label>
                  <Input id="cpf-cnpj-parte" placeholder="000.000.000-00" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="advogado-parte">Advogado da Parte</Label>
                  <Input id="advogado-parte" placeholder="Nome do advogado" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oab-parte">OAB</Label>
                  <Input id="oab-parte" placeholder="OAB/UF 000000" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco-parte">Endereço da Parte</Label>
                <Input id="endereco-parte" placeholder="Endereço completo" />
              </div>
            </CardContent>
          </Card>

          {/* Informações do Tribunal */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Tribunal e Vara</CardTitle>
              <CardDescription>Informações sobre o órgão julgador</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tribunal">Tribunal *</Label>
                  <Select required>
                    <SelectTrigger id="tribunal">
                      <SelectValue placeholder="Selecione o tribunal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trt-sp">TRT - São Paulo</SelectItem>
                      <SelectItem value="tjsp">TJSP - Tribunal de Justiça de SP</SelectItem>
                      <SelectItem value="trf3">TRF3 - Tribunal Regional Federal 3ª Região</SelectItem>
                      <SelectItem value="stj">STJ - Superior Tribunal de Justiça</SelectItem>
                      <SelectItem value="stf">STF - Supremo Tribunal Federal</SelectItem>
                      <SelectItem value="tst">TST - Tribunal Superior do Trabalho</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vara">Vara *</Label>
                  <Input id="vara" placeholder="Ex: 1ª Vara do Trabalho - SP" required />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="comarca">Comarca *</Label>
                  <Input id="comarca" placeholder="Ex: São Paulo" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uf">UF *</Label>
                  <Select required>
                    <SelectTrigger id="uf">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SP">São Paulo</SelectItem>
                      <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                      <SelectItem value="MG">Minas Gerais</SelectItem>
                      <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                      {/* Adicione outros estados conforme necessário */}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="juiz">Juiz/Desembargador</Label>
                  <Input id="juiz" placeholder="Nome do julgador" />
                </div>
                <div className="space-y-2">
                  <Label>Data de Distribuição *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dataDistribuicao && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dataDistribuicao ? format(dataDistribuicao, "PPP", { locale: ptBR }) : "Selecione a data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dataDistribuicao}
                        onSelect={setDataDistribuicao}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Valores e Risco */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Valores e Análise de Risco</CardTitle>
              <CardDescription>Informações financeiras e avaliação do processo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="valor-causa">Valor da Causa *</Label>
                  <Input id="valor-causa" placeholder="R$ 0,00" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor-provisionado">Valor Provisionado</Label>
                  <Input id="valor-provisionado" placeholder="R$ 0,00" />
                  <p className="text-xs text-muted-foreground">
                    Valor estimado de perda
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor-condenacao">Valor de Condenação</Label>
                  <Input id="valor-condenacao" placeholder="R$ 0,00" />
                  <p className="text-xs text-muted-foreground">
                    Se já houver sentença
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="probabilidade-perda">Probabilidade de Perda *</Label>
                  <Select required>
                    <SelectTrigger id="probabilidade-perda">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remota">Remota (0-25%)</SelectItem>
                      <SelectItem value="possivel">Possível (25-50%)</SelectItem>
                      <SelectItem value="provavel">Provável (50-75%)</SelectItem>
                      <SelectItem value="certa">Certa (75-100%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="risco">Classificação de Risco *</Label>
                  <Select required>
                    <SelectTrigger id="risco">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixo">Baixo</SelectItem>
                      <SelectItem value="medio">Médio</SelectItem>
                      <SelectItem value="alto">Alto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fundamentacao-risco">Fundamentação da Análise de Risco</Label>
                <Textarea
                  id="fundamentacao-risco"
                  placeholder="Descreva os fundamentos jurídicos, precedentes, provas e demais fatores que justificam a classificação de risco..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Status e Andamento */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Status e Andamento</CardTitle>
              <CardDescription>Situação atual do processo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="status">Status Atual *</Label>
                  <Select required>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="em-andamento">Em Andamento</SelectItem>
                      <SelectItem value="aguardando-sentenca">Aguardando Sentença</SelectItem>
                      <SelectItem value="em-recurso">Em Recurso</SelectItem>
                      <SelectItem value="acordado">Acordo</SelectItem>
                      <SelectItem value="sentenca-favoravel">Sentença Favorável</SelectItem>
                      <SelectItem value="sentenca-desfavoravel">Sentença Desfavorável</SelectItem>
                      <SelectItem value="transitado-em-julgado">Trânsito em Julgado</SelectItem>
                      <SelectItem value="arquivado">Arquivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fase-processual">Fase Processual</Label>
                  <Select>
                    <SelectTrigger id="fase-processual">
                      <SelectValue placeholder="Selecione a fase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inicial">Petição Inicial</SelectItem>
                      <SelectItem value="citacao">Citação</SelectItem>
                      <SelectItem value="contestacao">Contestação</SelectItem>
                      <SelectItem value="instrucao">Instrução</SelectItem>
                      <SelectItem value="sentenca">Sentença</SelectItem>
                      <SelectItem value="recurso">Recurso</SelectItem>
                      <SelectItem value="execucao">Execução</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ultima-movimentacao">Última Movimentação</Label>
                <Textarea
                  id="ultima-movimentacao"
                  placeholder="Descreva a última movimentação do processo..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proximas-acoes">Próximas Ações / Prazos</Label>
                <Textarea
                  id="proximas-acoes"
                  placeholder="Descreva as próximas ações necessárias, audiências agendadas, prazos para manifestação, etc..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Responsáveis */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Responsáveis</CardTitle>
              <CardDescription>Advogados e profissionais responsáveis pelo processo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="responsavel-interno">Responsável Interno *</Label>
                  <Select required>
                    <SelectTrigger id="responsavel-interno">
                      <SelectValue placeholder="Selecione" />
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
                  <Label htmlFor="oab-responsavel">OAB do Responsável</Label>
                  <Input id="oab-responsavel" placeholder="OAB/UF 000000" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="escritorio-externo">Escritório Externo</Label>
                  <Input id="escritorio-externo" placeholder="Nome do escritório" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="advogado-externo">Advogado Externo</Label>
                  <Input id="advogado-externo" placeholder="Nome do advogado" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="oab-externo">OAB Externo</Label>
                  <Input id="oab-externo" placeholder="OAB/UF 000000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contato-externo">Contato Externo</Label>
                  <Input id="contato-externo" placeholder="E-mail ou telefone" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documentos */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
              <CardDescription>Faça upload de petições, sentenças e documentos do processo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="peticao-inicial">Petição Inicial</Label>
                <div className="flex items-center gap-2">
                  <Input id="peticao-inicial" type="file" accept=".pdf" />
                  <Button type="button" variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentos-processo">Outros Documentos</Label>
                <div className="flex items-center gap-2">
                  <Input id="documentos-processo" type="file" multiple />
                  <Button type="button" variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Você pode fazer upload de múltiplos arquivos (contestação, provas, sentenças, recursos, etc.)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Observações</CardTitle>
              <CardDescription>Informações adicionais relevantes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações Gerais</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Informações adicionais, estratégias, histórico, etc..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags-processo">Tags (separadas por vírgula)</Label>
                <Input id="tags-processo" placeholder="urgente, alto valor, cliente vip" />
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
              Salvar Processo
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
