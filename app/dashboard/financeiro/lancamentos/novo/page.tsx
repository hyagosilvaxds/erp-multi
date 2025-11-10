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
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  financialTransactionsApi, 
  bankAccountsApi, 
  financialCategoriesApi,
  type TransactionType,
  type CategoryType 
} from "@/lib/api/financial"
import { centroCustoApi, planoContasApi, type CentroCusto, type ContaContabil } from "@/lib/api/financial"
import { authApi } from "@/lib/api/auth"
import { useToast } from "@/hooks/use-toast"

export default function NovoLancamento() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const selectedCompany = authApi.getSelectedCompany()

  // Dados para os selects
  const [contasBancarias, setContasBancarias] = useState<any[]>([])
  const [categorias, setCategorias] = useState<any[]>([])
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([])
  const [contasContabeis, setContasContabeis] = useState<ContaContabil[]>([])
  const [planoContasId, setPlanoContasId] = useState<string>("")

  const [formData, setFormData] = useState({
    bankAccountId: "",
    categoryId: "",
    type: "" as CategoryType | "",
    transactionType: "" as TransactionType | "",
    amount: "",
    fees: "",
    description: "",
    referenceNumber: "",
    documentNumber: "",
    transactionDate: new Date().toISOString().split("T")[0],
    competenceDate: new Date().toISOString().split("T")[0],
    notes: "",
    centroCustoId: "",
    contaContabilId: "",
  })

  useEffect(() => {
    if (selectedCompany?.id) {
      loadInitialData()
    }
  }, [selectedCompany?.id])

  const loadInitialData = async () => {
    try {
      setLoadingData(true)
      if (!selectedCompany?.id) return

      // Carregar dados em paralelo
      const [contasResp, categoriasResp, centrosResp] = await Promise.all([
        bankAccountsApi.getAll(selectedCompany.id),
        financialCategoriesApi.getAll(selectedCompany.id),
        centroCustoApi.getByCompany(selectedCompany.id),
      ])

      setContasBancarias(contasResp.filter(c => c.active))
      setCategorias(categoriasResp.filter(c => c.active))
      setCentrosCusto(centrosResp.filter(c => c.ativo))

      // Buscar plano de contas padrão (já vem com as contas)
      try {
        const planoResp = await planoContasApi.getPadrao(selectedCompany.id)
        setPlanoContasId(planoResp.id)
        
        // O endpoint getPadrao já retorna as contas no campo 'contas'
        if (planoResp.contas && Array.isArray(planoResp.contas)) {
          const contasValidas = planoResp.contas.filter(c => c.aceitaLancamento && c.ativo)
          setContasContabeis(contasValidas)
        }
      } catch (error) {
        console.error("Erro ao carregar plano de contas:", error)
      }

    } catch (error: any) {
      console.error("Erro ao carregar dados:", error)
      toast({
        title: "Erro ao carregar dados",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setLoadingData(false)
    }
  }

  // Atualizar categorias quando mudar o tipo
  useEffect(() => {
    if (selectedCompany?.id && formData.type) {
      loadCategoriasPorTipo(formData.type as CategoryType)
    }
  }, [formData.type, selectedCompany?.id])

  const loadCategoriasPorTipo = async (type: CategoryType) => {
    try {
      if (!selectedCompany?.id) return
      const data = await financialCategoriesApi.getAll(selectedCompany.id, type)
      setCategorias(data.filter(c => c.active))
    } catch (error) {
      console.error("Erro ao carregar categorias:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCompany?.id) {
      toast({
        title: "Erro",
        description: "Nenhuma empresa selecionada",
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
      setLoading(true)

      const amount = parseFloat(formData.amount)
      const fees = parseFloat(formData.fees) || 0

      await financialTransactionsApi.create({
        companyId: selectedCompany.id,
        bankAccountId: formData.bankAccountId,
        categoryId: formData.categoryId,
        type: formData.type as CategoryType,
        transactionType: formData.transactionType as TransactionType,
        amount,
        fees,
        description: formData.description,
        referenceNumber: formData.referenceNumber || undefined,
        documentNumber: formData.documentNumber || undefined,
        transactionDate: new Date(formData.transactionDate).toISOString(),
        competenceDate: new Date(formData.competenceDate).toISOString(),
        notes: formData.notes || undefined,
        centroCustoId: formData.centroCustoId || undefined,
        contaContabilId: formData.contaContabilId || undefined,
      })

      toast({
        title: "Sucesso",
        description: "Lançamento criado com sucesso",
      })

      router.push("/dashboard/financeiro/lancamentos")
    } catch (error: any) {
      console.error("Erro ao criar lançamento:", error)
      toast({
        title: "Erro ao criar lançamento",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatAccountType = (type: string) => {
    const types: Record<string, string> = {
      CORRENTE: "Conta Corrente",
      POUPANCA: "Conta Poupança",
      SALARIO: "Conta Salário",
    }
    return types[type] || type
  }

  if (loadingData) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Novo Lançamento</h1>
            <p className="text-muted-foreground">Registre uma nova movimentação financeira</p>
          </div>
        </div>

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
                    <Label htmlFor="type">Tipo *</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(v) => setFormData({ ...formData, type: v as CategoryType, categoryId: "" })} 
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RECEITA">Receita</SelectItem>
                        <SelectItem value="DESPESA">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transactionType">Forma de Pagamento *</Label>
                    <Select 
                      value={formData.transactionType} 
                      onValueChange={(v) => setFormData({ ...formData, transactionType: v as TransactionType })} 
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                        <SelectItem value="PIX">PIX</SelectItem>
                        <SelectItem value="TRANSFERENCIA">Transferência</SelectItem>
                        <SelectItem value="BOLETO">Boleto</SelectItem>
                        <SelectItem value="CARTAO_CREDITO">Cartão de Crédito</SelectItem>
                        <SelectItem value="CARTAO_DEBITO">Cartão de Débito</SelectItem>
                        <SelectItem value="CHEQUE">Cheque</SelectItem>
                        <SelectItem value="OUTROS">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

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

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Input
                    id="description"
                    placeholder="Ex: Venda de produtos, Pagamento fornecedor..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

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
                    <p className="text-xs text-muted-foreground">
                      Valor líquido: {(parseFloat(formData.amount) - parseFloat(formData.fees || "0")).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="referenceNumber">Nº Referência</Label>
                    <Input
                      id="referenceNumber"
                      placeholder="Ex: REF123"
                      value={formData.referenceNumber}
                      onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documentNumber">Nº Documento</Label>
                    <Input
                      id="documentNumber"
                      placeholder="Ex: NF-001"
                      value={formData.documentNumber}
                      onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Classificação */}
            <Card>
              <CardHeader>
                <CardTitle>Classificação</CardTitle>
                <CardDescription>Vincule a contas e categorias</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bankAccountId">Conta Bancária *</Label>
                  <Select 
                    value={formData.bankAccountId} 
                    onValueChange={(v) => setFormData({ ...formData, bankAccountId: v })} 
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {contasBancarias.map((conta) => (
                        <SelectItem key={conta.id} value={conta.id}>
                          {conta.bankName} - {conta.accountName} ({formatAccountType(conta.accountType)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryId">Categoria Financeira *</Label>
                  <Select 
                    value={formData.categoryId} 
                    onValueChange={(v) => setFormData({ ...formData, categoryId: v })} 
                    required
                    disabled={!formData.type}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.type ? "Selecione a categoria" : "Selecione primeiro o tipo"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            {cat.color && (
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: cat.color }}
                              />
                            )}
                            {cat.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contaContabilId">Conta Contábil</Label>
                  <Select 
                    value={formData.contaContabilId || undefined} 
                    onValueChange={(v) => setFormData({ ...formData, contaContabilId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {contasContabeis.map((conta) => (
                        <SelectItem key={conta.id} value={conta.id}>
                          {conta.codigo} - {conta.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="centroCustoId">Centro de Custo</Label>
                  <Select 
                    value={formData.centroCustoId || undefined} 
                    onValueChange={(v) => setFormData({ ...formData, centroCustoId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {centrosCusto.map((centro) => (
                        <SelectItem key={centro.id} value={centro.id}>
                          {centro.codigo} - {centro.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Observações */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Adicionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Informações adicionais sobre este lançamento..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Botões */}
            <div className="flex justify-end gap-3">
              <Link href="/dashboard/financeiro/lancamentos">
                <Button type="button" variant="outline" disabled={loading}>
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Lançamento
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
