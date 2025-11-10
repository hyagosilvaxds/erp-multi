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
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { 
  financialTransactionsApi, 
  bankAccountsApi,
  financialCategoriesApi,
  centroCustoApi,
  planoContasApi,
  type FinancialTransaction,
  type BankAccount,
  type FinancialCategory,
  type CentroCusto,
  type ContaContabil,
  type CategoryType,
  type TransactionType
} from "@/lib/api/financial"
import { authApi } from "@/lib/api/auth"
import { useToast } from "@/hooks/use-toast"

export default function EditarLancamento() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lancamento, setLancamento] = useState<FinancialTransaction | null>(null)
  const [contas, setContas] = useState<BankAccount[]>([])
  const [categorias, setCategorias] = useState<FinancialCategory[]>([])
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([])
  const [contasContabeis, setContasContabeis] = useState<ContaContabil[]>([])
  const [planoContasId, setPlanoContasId] = useState<string>("")
  const selectedCompany = authApi.getSelectedCompany()

  const [formData, setFormData] = useState({
    type: "" as CategoryType | "",
    transactionType: "" as TransactionType | "",
    bankAccountId: "",
    categoryId: "",
    centroCustoId: "",
    contaContabilId: "",
    amount: "",
    fees: "",
    description: "",
    referenceNumber: "",
    documentNumber: "",
    transactionDate: "",
    competenceDate: "",
    notes: "",
  })

  useEffect(() => {
    if (selectedCompany?.id && params.id) {
      loadData()
    }
  }, [selectedCompany?.id, params.id])

  const loadData = async () => {
    try {
      setLoading(true)
      if (!selectedCompany?.id || !params.id) {
        toast({
          title: "Erro",
          description: "Nenhuma empresa selecionada ou lançamento inválido",
          variant: "destructive",
        })
        return
      }

      // Carregar lançamento
      const lancamentoData = await financialTransactionsApi.getById(params.id as string, selectedCompany.id)
      setLancamento(lancamentoData)

      // Carregar contas bancárias e categorias
      const [contasData, categoriasData, centrosData, planoResp] = await Promise.all([
        bankAccountsApi.getAll(selectedCompany.id),
        financialCategoriesApi.getAll(selectedCompany.id),
        centroCustoApi.getByCompany(selectedCompany.id),
        planoContasApi.getPadrao(selectedCompany.id),
      ])

      setContas(contasData.filter(c => c.active))
      setCategorias(categoriasData.filter(c => c.active))
      setCentrosCusto(centrosData.filter(c => c.ativo))
      setPlanoContasId(planoResp.id)

      // Carregar contas contábeis do plano
      const contasResp = await planoContasApi.getHierarquia(planoResp.id, true)
      setContasContabeis(contasResp.contas.filter(c => c.aceitaLancamento))

      // Preencher formulário
      setFormData({
        type: lancamentoData.type,
        transactionType: lancamentoData.transactionType,
        bankAccountId: lancamentoData.bankAccountId,
        categoryId: lancamentoData.categoryId,
        centroCustoId: lancamentoData.centroCustoId || "",
        contaContabilId: lancamentoData.contaContabilId || "",
        amount: lancamentoData.amount.toString(),
        fees: lancamentoData.fees.toString(),
        description: lancamentoData.description,
        referenceNumber: lancamentoData.referenceNumber || "",
        documentNumber: lancamentoData.documentNumber || "",
        transactionDate: lancamentoData.transactionDate.split('T')[0],
        competenceDate: lancamentoData.competenceDate.split('T')[0],
        notes: lancamentoData.notes || "",
      })
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error)
      toast({
        title: "Erro ao carregar lançamento",
        description: error.response?.data?.message || error.message || "Ocorreu um erro ao carregar o lançamento",
        variant: "destructive",
      })
      router.push("/dashboard/financeiro/lancamentos")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCompany?.id || !params.id) {
      toast({
        title: "Erro",
        description: "Nenhuma empresa selecionada ou lançamento inválido",
        variant: "destructive",
      })
      return
    }

    if (!formData.type || !formData.transactionType) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      
      await financialTransactionsApi.update(params.id as string, selectedCompany.id, {
        type: formData.type as CategoryType,
        transactionType: formData.transactionType as TransactionType,
        bankAccountId: formData.bankAccountId,
        categoryId: formData.categoryId,
        centroCustoId: formData.centroCustoId || undefined,
        contaContabilId: formData.contaContabilId || undefined,
        amount: parseFloat(formData.amount),
        fees: parseFloat(formData.fees) || 0,
        description: formData.description,
        referenceNumber: formData.referenceNumber || undefined,
        documentNumber: formData.documentNumber || undefined,
        transactionDate: new Date(formData.transactionDate).toISOString(),
        competenceDate: new Date(formData.competenceDate).toISOString(),
        notes: formData.notes || undefined,
      })

      toast({
        title: "Sucesso",
        description: "Lançamento atualizado com sucesso",
      })

      router.push("/dashboard/financeiro/lancamentos")
    } catch (error: any) {
      console.error("Erro ao atualizar lançamento:", error)
      toast({
        title: "Erro ao atualizar lançamento",
        description: error.response?.data?.message || error.message || "Ocorreu um erro ao atualizar o lançamento",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const categoriasFiltradas = categorias.filter(c => 
    !formData.type || c.type === formData.type
  )

  if (loading) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (!lancamento) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Lançamento não encontrado</p>
        </div>
      </DashboardLayout>
    )
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
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Editar Lançamento</h1>
            <p className="text-muted-foreground">Atualize as informações do lançamento financeiro</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Informações do Lançamento</CardTitle>
              <CardDescription>Edite os dados do lançamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tipo e Tipo de Transação */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as CategoryType })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RECEITA">Receita</SelectItem>
                      <SelectItem value="DESPESA">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transactionType">Forma de Pagamento *</Label>
                  <Select value={formData.transactionType} onValueChange={(value) => setFormData({ ...formData, transactionType: value as TransactionType })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                      <SelectItem value="TRANSFERENCIA">Transferência</SelectItem>
                      <SelectItem value="BOLETO">Boleto</SelectItem>
                      <SelectItem value="CARTAO_CREDITO">Cartão de Crédito</SelectItem>
                      <SelectItem value="CARTAO_DEBITO">Cartão de Débito</SelectItem>
                      <SelectItem value="PIX">PIX</SelectItem>
                      <SelectItem value="CHEQUE">Cheque</SelectItem>
                      <SelectItem value="OUTROS">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Conta Bancária e Categoria */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bankAccountId">Conta Bancária *</Label>
                  <Select value={formData.bankAccountId} onValueChange={(value) => setFormData({ ...formData, bankAccountId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {contas.map((conta) => (
                        <SelectItem key={conta.id} value={conta.id}>
                          {conta.accountName} - {conta.bankName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryId">Categoria *</Label>
                  <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriasFiltradas.map((categoria) => (
                        <SelectItem key={categoria.id} value={categoria.id}>
                          {categoria.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Centro de Custo e Conta Contábil */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="centroCustoId">Centro de Custo</Label>
                  <Select 
                    value={formData.centroCustoId || "none"} 
                    onValueChange={(value) => setFormData({ ...formData, centroCustoId: value === "none" ? "" : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {centrosCusto.map((centro) => (
                        <SelectItem key={centro.id} value={centro.id}>
                          {centro.codigo} - {centro.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contaContabilId">Conta Contábil</Label>
                  <Select 
                    value={formData.contaContabilId || "none"} 
                    onValueChange={(value) => setFormData({ ...formData, contaContabilId: value === "none" ? "" : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      {contasContabeis.map((conta) => (
                        <SelectItem key={conta.id} value={conta.id}>
                          {conta.codigo} - {conta.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Input
                  id="description"
                  placeholder="Descrição do lançamento"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              {/* Valor e Taxas */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fees">Taxas</Label>
                  <Input
                    id="fees"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.fees}
                    onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
                  />
                </div>
              </div>

              {/* Número de Referência e Documento */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="referenceNumber">Número de Referência</Label>
                  <Input
                    id="referenceNumber"
                    placeholder="Ex: REF-12345"
                    value={formData.referenceNumber}
                    onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentNumber">Número do Documento</Label>
                  <Input
                    id="documentNumber"
                    placeholder="Ex: NF-001"
                    value={formData.documentNumber}
                    onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                  />
                </div>
              </div>

              {/* Datas */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="transactionDate">Data da Transação *</Label>
                  <Input
                    id="transactionDate"
                    type="date"
                    value={formData.transactionDate}
                    onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="competenceDate">Data de Competência *</Label>
                  <Input
                    id="competenceDate"
                    type="date"
                    value={formData.competenceDate}
                    onChange={(e) => setFormData({ ...formData, competenceDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Informações adicionais sobre o lançamento..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Valor Líquido */}
              {formData.amount && (
                <div className="rounded-lg border border-border bg-muted/50 p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Valor Líquido:</span>
                    <span className="text-lg font-bold">
                      {(parseFloat(formData.amount) - (parseFloat(formData.fees) || 0)).toLocaleString("pt-BR", { 
                        style: "currency", 
                        currency: "BRL" 
                      })}
                    </span>
                  </div>
                </div>
              )}

              {/* Botões */}
              <div className="flex justify-end gap-3">
                <Link href="/dashboard/financeiro/lancamentos">
                  <Button type="button" variant="outline" disabled={saving}>
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  )
}
