"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  CheckCircle, 
  XCircle, 
  LinkIcon, 
  Plus, 
  Search, 
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Filter,
  X
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/api/auth"
import { 
  ofxApi, 
  type OFXImportDetail,
  type OFXTransaction,
  type SimilarTransaction,
  type CreateTransactionFromOFXRequest,
  bankAccountsApi,
  type BankAccount,
  financialCategoriesApi,
  type FinancialCategory,
  centroCustoApi,
  type CentroCusto,
  planoContasApi,
  contasContabeisApi,
  type PlanoContas,
  type ContaContabil,
} from "@/lib/api/financial"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

export default function Conciliacao() {
  const router = useRouter()
  const { toast } = useToast()
  const selectedCompany = authApi.getSelectedCompany()

  const [imports, setImports] = useState<OFXImportDetail[]>([])
  const [selectedImport, setSelectedImport] = useState<OFXImportDetail | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<OFXTransaction | null>(null)
  const [similarTransactions, setSimilarTransactions] = useState<SimilarTransaction[]>([])
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [categories, setCategories] = useState<FinancialCategory[]>([])
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([])
  const [contasContabeis, setContasContabeis] = useState<ContaContabil[]>([])
  const [planoContasPadrao, setPlanoContasPadrao] = useState<PlanoContas | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingSimilar, setLoadingSimilar] = useState(false)
  const [reconciling, setReconciling] = useState(false)
  const [showMatchDialog, setShowMatchDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<SimilarTransaction | null>(null)
  const [creatingTransaction, setCreatingTransaction] = useState(false)

  // Form states para criar lançamento
  const [transactionType, setTransactionType] = useState<'RECEITA' | 'DESPESA'>('DESPESA')
  const [paymentMethod, setPaymentMethod] = useState<'DINHEIRO' | 'TRANSFERENCIA' | 'BOLETO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX' | 'CHEQUE' | 'OUTROS'>('PIX')
  const [categoryId, setCategoryId] = useState<string>("")
  const [centroCustoId, setCentroCustoId] = useState<string>("")
  const [contaContabilId, setContaContabilId] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [notes, setNotes] = useState<string>("")

  // Filtros
  const [filterBankAccount, setFilterBankAccount] = useState<string>("")
  const [filterType, setFilterType] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<string>("unreconciled")

  useEffect(() => {
    if (selectedCompany?.id) {
      loadBankAccounts()
      loadImports()
      loadCategories()
      loadCentrosCusto()
      loadPlanoContasAndContas()
    }
  }, [selectedCompany?.id])

  const loadBankAccounts = async () => {
    try {
      if (!selectedCompany?.id) return
      const accounts = await bankAccountsApi.getAll(selectedCompany.id)
      setBankAccounts(accounts)
    } catch (error: any) {
      console.error("Erro ao carregar contas bancárias:", error)
    }
  }

  const loadCategories = async () => {
    try {
      if (!selectedCompany?.id) return
      const data = await financialCategoriesApi.getAll(selectedCompany.id)
      setCategories(data)
    } catch (error: any) {
      console.error("Erro ao carregar categorias:", error)
    }
  }

  const loadCentrosCusto = async () => {
    try {
      if (!selectedCompany?.id) return
      const response = await centroCustoApi.getAll({ 
        companyId: selectedCompany.id,
        ativo: true,
        limit: 200,
      })
      setCentrosCusto(response.data)
    } catch (error: any) {
      console.error("Erro ao carregar centros de custo:", error)
    }
  }

  const loadPlanoContasAndContas = async () => {
    try {
      if (!selectedCompany?.id) return
      const plano = await planoContasApi.getPadrao(selectedCompany.id)
      setPlanoContasPadrao(plano)
      
      if (plano?.id) {
        const response = await contasContabeisApi.getAll(plano.id, {
          page: 1,
          limit: 200,
        })
        // Filtrar apenas contas que aceitam lançamento
        const contasAceitamLancamento = response.data.filter((c: ContaContabil) => c.aceitaLancamento)
        setContasContabeis(contasAceitamLancamento)
      }
    } catch (error: any) {
      console.error("Erro ao carregar plano de contas:", error)
    }
  }

  const loadImports = async () => {
    try {
      setLoading(true)
      if (!selectedCompany?.id) return

      const response = await ofxApi.listImports({
        companyId: selectedCompany.id,
        bankAccountId: filterBankAccount || undefined,
      })

      // Carregar detalhes de cada importação
      const detailsPromises = response.data.map(imp => 
        ofxApi.getImportDetails(selectedCompany.id, imp.id)
      )
      const details = await Promise.all(detailsPromises)
      
      setImports(details)

      // Selecionar primeiro import com transações não conciliadas
      const firstWithUnreconciled = details.find(imp => 
        imp.reconciledCount < imp.totalTransactions
      )
      if (firstWithUnreconciled) {
        setSelectedImport(firstWithUnreconciled)
      }
    } catch (error: any) {
      console.error("Erro ao carregar extratos:", error)
      toast({
        title: "Erro ao carregar extratos",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadSimilarTransactions = async (transaction: OFXTransaction) => {
    try {
      setLoadingSimilar(true)
      if (!selectedCompany?.id || !selectedImport?.bankAccountId) return

      const similar = await ofxApi.findSimilar(
        selectedCompany.id,
        selectedImport.bankAccountId,
        transaction
      )

      setSimilarTransactions(similar)
    } catch (error: any) {
      console.error("Erro ao buscar transações similares:", error)
      toast({
        title: "Erro ao buscar transações",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setLoadingSimilar(false)
    }
  }

  const handleSelectTransaction = async (transaction: OFXTransaction) => {
    setSelectedTransaction(transaction)
    setSimilarTransactions([])
    await loadSimilarTransactions(transaction)
  }

  const handleReconcile = async () => {
    if (!selectedMatch || !selectedCompany?.id) return

    try {
      setReconciling(true)

      await ofxApi.reconcile(
        selectedCompany.id,
        selectedMatch.transactionId,
        selectedTransaction!.fitId
      )

      toast({
        title: "Conciliação realizada",
        description: "A transação foi conciliada com sucesso",
      })

      setShowMatchDialog(false)
      setSelectedMatch(null)
      setSelectedTransaction(null)
      setSimilarTransactions([])
      
      // Recarregar dados
      await loadImports()
    } catch (error: any) {
      console.error("Erro ao conciliar:", error)
      toast({
        title: "Erro ao conciliar",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setReconciling(false)
    }
  }

  const handleOpenMatchDialog = (match: SimilarTransaction) => {
    setSelectedMatch(match)
    setShowMatchDialog(true)
  }

  const handleCreateNew = () => {
    // Resetar form
    setTransactionType(selectedTransaction?.type === 'CREDIT' ? 'RECEITA' : 'DESPESA')
    setPaymentMethod('PIX')
    setCategoryId("")
    setCentroCustoId("")
    setContaContabilId("")
    setDescription(selectedTransaction?.name || "")
    setNotes(selectedTransaction?.memo || "")
    setShowCreateDialog(true)
  }

  const handleCreateTransaction = async () => {
    if (!selectedCompany?.id || !selectedTransaction || !selectedImport?.bankAccountId) {
      return
    }

    try {
      setCreatingTransaction(true)

      const request: CreateTransactionFromOFXRequest = {
        ofxFitId: selectedTransaction.fitId,
        companyId: selectedCompany.id,
        bankAccountId: selectedImport.bankAccountId,
        type: transactionType,
        transactionType: paymentMethod,
        categoryId: categoryId || undefined,
        centroCustoId: centroCustoId || undefined,
        contaContabilId: contaContabilId || undefined,
        description: description || undefined,
        notes: notes || undefined,
      }

      await ofxApi.createTransactionFromOFX(request)

      toast({
        title: "Lançamento criado com sucesso",
        description: "O lançamento foi criado e conciliado automaticamente.",
      })

      // Fechar dialog e resetar
      setShowCreateDialog(false)
      setSelectedTransaction(null)
      setSimilarTransactions([])

      // Recarregar dados
      await loadImports()
    } catch (error: any) {
      console.error("Erro ao criar lançamento:", error)
      toast({
        title: "Erro ao criar lançamento",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setCreatingTransaction(false)
    }
  }

  const getScoreBadge = (score: number) => {
    if (score >= 85) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Alta ({score}%)</Badge>
    } else if (score >= 60) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Média ({score}%)</Badge>
    } else if (score >= 30) {
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Baixa ({score}%)</Badge>
    } else {
      return <Badge variant="outline" className="text-muted-foreground">Sem Match ({score}%)</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Math.abs(value))
  }

  const getTransactionIcon = (type: string) => {
    return type === 'CREDIT' ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    )
  }

  const filteredTransactions = selectedImport?.transactions.filter(txn => {
    if (filterType && txn.type !== filterType) return false
    // Aqui você precisaria verificar o status de conciliação
    // Por enquanto, assumindo que todas precisam conciliação
    return true
  }) || []

  const unreconciledCount = selectedImport 
    ? selectedImport.totalTransactions - selectedImport.reconciledCount 
    : 0

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Conciliação Bancária</h1>
          <p className="text-muted-foreground">
            Concilie transações do extrato OFX com lançamentos do sistema
          </p>
        </div>

        {/* Seletor de Extrato */}
        <Card>
          <CardHeader>
            <CardTitle>Selecionar Extrato</CardTitle>
            <CardDescription>Escolha o extrato que deseja conciliar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2 md:col-span-2">
                <Label>Extrato Importado</Label>
                <Select 
                  value={selectedImport?.id || ""} 
                  onValueChange={(value) => {
                    const imp = imports.find(i => i.id === value)
                    setSelectedImport(imp || null)
                    setSelectedTransaction(null)
                    setSimilarTransactions([])
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um extrato" />
                  </SelectTrigger>
                  <SelectContent>
                    {imports.map((imp) => (
                      <SelectItem key={imp.id} value={imp.id}>
                        {imp.fileName} - {imp.bankAccount?.accountName} ({formatDate(imp.startDate)} a {formatDate(imp.endDate)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedImport && (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">{selectedImport.reconciledCount}</span> de{" "}
                      <span className="font-medium">{selectedImport.totalTransactions}</span> conciliadas
                    </p>
                    {unreconciledCount > 0 && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        {unreconciledCount} pendentes
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !selectedImport ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Nenhum extrato selecionado</AlertTitle>
            <AlertDescription>
              Selecione um extrato acima ou{" "}
              <Button 
                variant="link" 
                className="h-auto p-0 text-sm" 
                onClick={() => router.push('/dashboard/financeiro/extratos')}
              >
                importe um novo extrato OFX
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Coluna Esquerda - Transações OFX */}
            <Card>
              <CardHeader>
                <CardTitle>Transações do Extrato</CardTitle>
                <CardDescription>
                  Clique em uma transação para buscar correspondências
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredTransactions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma transação encontrada
                    </p>
                  ) : (
                    filteredTransactions.map((txn) => (
                      <div
                        key={txn.fitId}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedTransaction?.fitId === txn.fitId
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => handleSelectTransaction(txn)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {getTransactionIcon(txn.type)}
                              <span className="text-xs text-muted-foreground">
                                {formatDate(txn.datePosted)}
                              </span>
                            </div>
                            <p className="font-medium text-sm truncate">{txn.name}</p>
                            {txn.memo && (
                              <p className="text-xs text-muted-foreground truncate">{txn.memo}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${txn.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                              {txn.type === 'CREDIT' ? '+' : '-'} {formatCurrency(txn.amount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Coluna Direita - Sugestões de Match */}
            <Card>
              <CardHeader>
                <CardTitle>Transações Similares</CardTitle>
                <CardDescription>
                  Sugestões de lançamentos que podem corresponder
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedTransaction ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Selecione uma transação do extrato para ver sugestões
                    </p>
                  </div>
                ) : loadingSimilar ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : similarTransactions.length === 0 ? (
                  <div className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Nenhuma correspondência encontrada</AlertTitle>
                      <AlertDescription>
                        Não foram encontradas transações similares no sistema.
                        Você pode criar um novo lançamento baseado nesta transação.
                      </AlertDescription>
                    </Alert>
                    <Button onClick={handleCreateNew} className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Novo Lançamento
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {similarTransactions.map((match) => (
                        <div
                          key={match.transactionId}
                          className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{match.description}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(match.transactionDate)}
                                  {match.categoryName && ` • ${match.categoryName}`}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-sm">
                                  {formatCurrency(match.amount)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {getScoreBadge(match.matchScore)}
                            </div>

                            {match.matchReasons.length > 0 && (
                              <div className="text-xs text-muted-foreground space-y-1">
                                {match.matchReasons.map((reason, idx) => (
                                  <div key={idx} className="flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3 text-green-600" />
                                    <span>{reason}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <Button
                              onClick={() => handleOpenMatchDialog(match)}
                              size="sm"
                              className="w-full"
                              variant={match.matchScore >= 85 ? "default" : "outline"}
                            >
                              <LinkIcon className="mr-2 h-4 w-4" />
                              Conciliar com esta transação
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <Button onClick={handleCreateNew} variant="outline" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Novo Lançamento
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dialog de Confirmação de Conciliação */}
        <Dialog open={showMatchDialog} onOpenChange={setShowMatchDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Conciliação</DialogTitle>
              <DialogDescription>
                Revise os dados antes de conciliar as transações
              </DialogDescription>
            </DialogHeader>

            {selectedTransaction && selectedMatch && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">TRANSAÇÃO DO EXTRATO</Label>
                  <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{selectedTransaction.name}</p>
                      <p className={`font-bold ${selectedTransaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedTransaction.type === 'CREDIT' ? '+' : '-'} {formatCurrency(selectedTransaction.amount)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(selectedTransaction.datePosted)}
                      {selectedTransaction.memo && ` • ${selectedTransaction.memo}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <LinkIcon className="h-6 w-6 text-muted-foreground" />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">LANÇAMENTO DO SISTEMA</Label>
                  <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{selectedMatch.description}</p>
                      <p className="font-bold">{formatCurrency(selectedMatch.amount)}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(selectedMatch.transactionDate)}
                      {selectedMatch.categoryName && ` • ${selectedMatch.categoryName}`}
                    </p>
                  </div>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Score de Similaridade</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 space-y-1">
                      {getScoreBadge(selectedMatch.matchScore)}
                      <div className="mt-2 space-y-1">
                        {selectedMatch.matchReasons.map((reason, idx) => (
                          <div key={idx} className="text-xs flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMatchDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleReconcile} disabled={reconciling}>
                {reconciling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Conciliando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Confirmar Conciliação
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Criar Novo Lançamento */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Lançamento</DialogTitle>
              <DialogDescription>
                Crie um novo lançamento baseado na transação do extrato OFX
              </DialogDescription>
            </DialogHeader>

            {selectedTransaction && (
              <div className="space-y-4">
                {/* Dados da transação OFX */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Dados da Transação OFX</Label>
                  <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Data:</span>
                        <p className="font-medium">{formatDate(selectedTransaction.datePosted)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Valor:</span>
                        <p className={`font-bold ${selectedTransaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedTransaction.type === 'CREDIT' ? '+' : '-'} {formatCurrency(selectedTransaction.amount)}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Descrição:</span>
                        <p className="font-medium">{selectedTransaction.name}</p>
                      </div>
                      {selectedTransaction.memo && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Observação:</span>
                          <p className="font-medium">{selectedTransaction.memo}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Formulário */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Tipo de Transação */}
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo de Lançamento *</Label>
                      <Select value={transactionType} onValueChange={(value: any) => setTransactionType(value)}>
                        <SelectTrigger id="type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RECEITA">Receita</SelectItem>
                          <SelectItem value="DESPESA">Despesa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Método de Pagamento */}
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod">Forma de Pagamento *</Label>
                      <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                        <SelectTrigger id="paymentMethod">
                          <SelectValue />
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

                  {/* Descrição */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Deixe vazio para usar a descrição do OFX"
                    />
                  </div>

                  {/* Categoria (opcional) */}
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria (Opcional)</Label>
                    <Select value={categoryId || undefined} onValueChange={(value) => setCategoryId(value || "")}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name} ({cat.type === 'RECEITA' ? 'Receita' : 'Despesa'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Centro de Custo (opcional) */}
                  <div className="space-y-2">
                    <Label htmlFor="centroCusto">Centro de Custo (Opcional)</Label>
                    <Select value={centroCustoId || undefined} onValueChange={(value) => setCentroCustoId(value || "")}>
                      <SelectTrigger id="centroCusto">
                        <SelectValue placeholder="Selecione um centro de custo" />
                      </SelectTrigger>
                      <SelectContent>
                        {centrosCusto.map((cc) => (
                          <SelectItem key={cc.id} value={cc.id}>
                            {cc.codigo} - {cc.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Conta Contábil (opcional) */}
                  <div className="space-y-2">
                    <Label htmlFor="contaContabil">Conta Contábil (Opcional)</Label>
                    <Select value={contaContabilId || undefined} onValueChange={(value) => setContaContabilId(value || "")}>
                      <SelectTrigger id="contaContabil">
                        <SelectValue placeholder="Selecione uma conta contábil" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {contasContabeis.map((conta) => (
                          <SelectItem key={conta.id} value={conta.id}>
                            {conta.codigo} - {conta.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Observações */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Input
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Observações adicionais"
                    />
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    O lançamento será criado com os dados da transação OFX (valor, data, etc) e será automaticamente conciliado.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={creatingTransaction}>
                Cancelar
              </Button>
              <Button onClick={handleCreateTransaction} disabled={creatingTransaction}>
                {creatingTransaction ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Lançamento
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
