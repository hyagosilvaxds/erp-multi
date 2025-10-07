"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Upload, X, AlertCircle, Lock, Building2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Configurações do sistema (viriam do backend)
const VALOR_MINIMO_ANEXO_OBRIGATORIO = 1000 // R$ 1.000,00
const PERIODO_BLOQUEADO = "2025-03" // Formato YYYY-MM
const EMPRESA_ATUAL = { id: "1", nome: "Tech Solutions LTDA" } // Mock - viria do contexto

// Regras de obrigatoriedade por conta contábil
const REGRAS_CONTA_CONTABIL: Record<string, { centroCustoObrigatorio: boolean; projetoObrigatorio: boolean }> = {
  "3.1.01": { centroCustoObrigatorio: true, projetoObrigatorio: false }, // Despesas Administrativas
  "3.1.02": { centroCustoObrigatorio: true, projetoObrigatorio: false }, // Energia Elétrica
  "3.2.01": { centroCustoObrigatorio: true, projetoObrigatorio: true }, // Despesas com Projetos
}

export default function NovoLancamento() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    empresaId: EMPRESA_ATUAL.id,
    tipo: "",
    data: new Date().toISOString().split("T")[0],
    descricao: "",
    valor: "",
    contaContabil: "",
    centroCusto: "",
    projeto: "",
    favorecido: "",
    formaPagamento: "",
    observacoes: "",
  })

  const [anexos, setAnexos] = useState<File[]>([])
  const [periodoBloqueado, setPeriodoBloqueado] = useState(false)
  const [anexoObrigatorio, setAnexoObrigatorio] = useState(false)
  const [centroCustoObrigatorio, setCentroCustoObrigatorio] = useState(false)
  const [projetoObrigatorio, setProjetoObrigatorio] = useState(false)
  const [erros, setErros] = useState<string[]>([])

  // Verifica se o período está bloqueado
  useEffect(() => {
    const mesAno = formData.data.substring(0, 7) // YYYY-MM
    setPeriodoBloqueado(mesAno === PERIODO_BLOQUEADO)
  }, [formData.data])

  // Verifica se anexo é obrigatório baseado no valor
  useEffect(() => {
    const valor = parseFloat(formData.valor)
    setAnexoObrigatorio(!isNaN(valor) && valor >= VALOR_MINIMO_ANEXO_OBRIGATORIO)
  }, [formData.valor])

  // Verifica obrigatoriedade de centro de custo e projeto baseado na conta contábil
  useEffect(() => {
    const regra = REGRAS_CONTA_CONTABIL[formData.contaContabil]
    if (regra) {
      setCentroCustoObrigatorio(regra.centroCustoObrigatorio)
      setProjetoObrigatorio(regra.projetoObrigatorio)
    } else {
      setCentroCustoObrigatorio(false)
      setProjetoObrigatorio(false)
    }
  }, [formData.contaContabil])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAnexos([...anexos, ...Array.from(e.target.files)])
    }
  }

  const handleRemoveAnexo = (index: number) => {
    setAnexos(anexos.filter((_, i) => i !== index))
  }

  const validarFormulario = (): boolean => {
    const novosErros: string[] = []

    // Validar período bloqueado
    if (periodoBloqueado) {
      novosErros.push("O período deste lançamento está bloqueado. Apenas administradores podem desbloquear.")
    }

    // Validar anexo obrigatório
    if (anexoObrigatorio && anexos.length === 0) {
      novosErros.push(
        `Anexo obrigatório para valores acima de ${VALOR_MINIMO_ANEXO_OBRIGATORIO.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`
      )
    }

    // Validar centro de custo obrigatório
    if (centroCustoObrigatorio && !formData.centroCusto) {
      novosErros.push("Centro de custo é obrigatório para esta conta contábil.")
    }

    // Validar projeto obrigatório
    if (projetoObrigatorio && !formData.projeto) {
      novosErros.push("Projeto é obrigatório para esta conta contábil.")
    }

    setErros(novosErros)
    return novosErros.length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validarFormulario()) {
      return
    }

    // Aqui seria feita a chamada à API
    // A API registraria em logs de auditoria: quem criou, quando, etc.
    console.log("[v0] Salvando lançamento:", formData, "Anexos:", anexos)
    console.log("[v0] Auditoria: Usuário XYZ criou lançamento na empresa", EMPRESA_ATUAL.nome, "em", new Date())

    router.push("/dashboard/financeiro/lancamentos")
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/financeiro/lancamentos">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Novo Lançamento</h1>
            <p className="text-muted-foreground">Registre uma nova movimentação financeira</p>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">{EMPRESA_ATUAL.nome}</span>
          </div>
        </div>

        {/* Alertas de Validação */}
        {erros.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro de Validação</AlertTitle>
            <AlertDescription>
              <ul className="ml-4 list-disc space-y-1">
                {erros.map((erro, index) => (
                  <li key={index}>{erro}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Alerta de Período Bloqueado */}
        {periodoBloqueado && (
          <Alert variant="destructive">
            <Lock className="h-4 w-4" />
            <AlertTitle>Período Bloqueado</AlertTitle>
            <AlertDescription>
              O período {PERIODO_BLOQUEADO} está bloqueado para edições. Entre em contato com o administrador para
              desbloquear.
            </AlertDescription>
          </Alert>
        )}

        {/* Alerta de Anexo Obrigatório */}
        {anexoObrigatorio && anexos.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Anexo Obrigatório</AlertTitle>
            <AlertDescription>
              Lançamentos acima de {VALOR_MINIMO_ANEXO_OBRIGATORIO.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}{" "}
              requerem pelo menos um anexo (nota fiscal, comprovante, etc.).
            </AlertDescription>
          </Alert>
        )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>Dados principais do lançamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v })} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrada">Entrada (Receita)</SelectItem>
                      <SelectItem value="saida">Saída (Despesa)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data">Data * {periodoBloqueado && <Badge variant="destructive" className="ml-2">Bloqueado</Badge>}</Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    required
                    disabled={periodoBloqueado}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição *</Label>
                <Input
                  id="descricao"
                  placeholder="Ex: Venda de produtos, Pagamento fornecedor..."
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor">Valor *</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Classificação Contábil */}
          <Card>
            <CardHeader>
              <CardTitle>Classificação Contábil</CardTitle>
              <CardDescription>Organize o lançamento por conta, centro de custo e projeto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contaContabil">Conta Contábil *</Label>
                <Select
                  value={formData.contaContabil}
                  onValueChange={(v) => setFormData({ ...formData, contaContabil: v })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1.1.01">1.1.01 - Caixa</SelectItem>
                    <SelectItem value="1.1.02">1.1.02 - Banco</SelectItem>
                    <SelectItem value="2.1.01">2.1.01 - Fornecedores</SelectItem>
                    <SelectItem value="3.1.01">3.1.01 - Despesas Administrativas</SelectItem>
                    <SelectItem value="3.1.02">3.1.02 - Energia Elétrica</SelectItem>
                    <SelectItem value="4.1.01">4.1.01 - Receita de Vendas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="centroCusto">
                    Centro de Custo {centroCustoObrigatorio && "*"}
                    {centroCustoObrigatorio && <Badge className="ml-2" variant="secondary">Obrigatório</Badge>}
                  </Label>
                  <Select
                    value={formData.centroCusto}
                    onValueChange={(v) => setFormData({ ...formData, centroCusto: v })}
                    required={centroCustoObrigatorio}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vendas">Vendas</SelectItem>
                      <SelectItem value="compras">Compras</SelectItem>
                      <SelectItem value="administrativo">Administrativo</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="producao">Produção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projeto">
                    Projeto {projetoObrigatorio && "*"}
                    {projetoObrigatorio && <Badge className="ml-2" variant="secondary">Obrigatório</Badge>}
                    {!projetoObrigatorio && " (Opcional)"}
                  </Label>
                  <Select
                    value={formData.projeto}
                    onValueChange={(v) => setFormData({ ...formData, projeto: v })}
                    required={projetoObrigatorio}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={projetoObrigatorio ? "Selecione" : "Nenhum"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alpha">Projeto Alpha</SelectItem>
                      <SelectItem value="beta">Projeto Beta</SelectItem>
                      <SelectItem value="gamma">Projeto Gamma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detalhes do Pagamento */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Pagamento</CardTitle>
              <CardDescription>Informações sobre favorecido e forma de pagamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="favorecido">Favorecido *</Label>
                <Input
                  id="favorecido"
                  placeholder="Nome do cliente, fornecedor ou beneficiário"
                  value={formData.favorecido}
                  onChange={(e) => setFormData({ ...formData, favorecido: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="formaPagamento">Forma de Pagamento *</Label>
                <Select
                  value={formData.formaPagamento}
                  onValueChange={(v) => setFormData({ ...formData, formaPagamento: v })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="ted">TED</SelectItem>
                    <SelectItem value="doc">DOC</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
                    <SelectItem value="cartao-credito">Cartão de Crédito</SelectItem>
                    <SelectItem value="cartao-debito">Cartão de Débito</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Informações adicionais sobre o lançamento..."
                  rows={3}
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Anexos */}
          <Card className={anexoObrigatorio && anexos.length === 0 ? "border-orange-500" : ""}>
            <CardHeader>
              <CardTitle>
                Anexos {anexoObrigatorio && <Badge variant="destructive" className="ml-2">Obrigatório</Badge>}
              </CardTitle>
              <CardDescription>
                {anexoObrigatorio
                  ? `Adicione comprovantes (NF, recibo, etc.). Obrigatório para valores acima de ${VALOR_MINIMO_ANEXO_OBRIGATORIO.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`
                  : "Adicione comprovantes, notas fiscais ou documentos relacionados (opcional)"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="anexos">Arquivos {anexoObrigatorio && "*"}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="anexos"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                    className="cursor-pointer"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={() => document.getElementById("anexos")?.click()}>
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Formatos aceitos: PDF, JPG, PNG, DOC, XLS (máx. 10MB por arquivo)
                </p>
              </div>

              {anexos.length > 0 && (
                <div className="space-y-2">
                  <Label>Arquivos Anexados</Label>
                  <div className="space-y-2">
                    {anexos.map((arquivo, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border border-border p-3"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{arquivo.type.split("/")[1].toUpperCase()}</Badge>
                          <span className="text-sm text-foreground">{arquivo.name}</span>
                          <span className="text-xs text-muted-foreground">({(arquivo.size / 1024).toFixed(2)} KB)</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveAnexo(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botões */}
          <div className="flex justify-end gap-3">
            <Link href="/dashboard/financeiro/lancamentos">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Salvar Lançamento
            </Button>
          </div>
        </div>
      </form>
      </div>
    </DashboardLayout>
  )
}
