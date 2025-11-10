"use client"

import { useState, useEffect } from "react"
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
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/api/auth"
import { 
  accountsReceivableApi,
  financialCategoriesApi,
  bankAccountsApi,
  centroCustoApi,
  planoContasApi,
  type CreateAccountReceivableDto,
  type FinancialCategory,
  type BankAccount,
  type CentroCusto,
  type ContaContabil
} from "@/lib/api/financial"

export default function NovaContaReceber() {
  const router = useRouter()
  const { toast } = useToast()
  const selectedCompany = authApi.getSelectedCompany()

  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<FinancialCategory[]>([])
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([])
  const [contasContabeis, setContasContabeis] = useState<ContaContabil[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const [formData, setFormData] = useState({
    description: "",
    customerName: "",
    customerDocument: "",
    originalAmount: "",
    dueDate: "",
    issueDate: new Date().toISOString().split('T')[0],
    competenceDate: new Date().toISOString().split('T')[0],
    categoryId: "",
    documentNumber: "",
    notes: "",
    centroCustoId: undefined as string | undefined,
    contaContabilId: undefined as string | undefined,
  })

  useEffect(() => {
    if (selectedCompany?.id) {
      loadFormData()
    }
  }, [selectedCompany?.id])

  const loadFormData = async () => {
    try {
      setLoadingData(true)
      if (!selectedCompany?.id) return

      const [categoriesData, bankAccountsData, centrosCustoData, planoContas] = await Promise.all([
        financialCategoriesApi.getAll(selectedCompany.id, 'RECEITA'),
        bankAccountsApi.getAll(selectedCompany.id),
        centroCustoApi.getAll({ companyId: selectedCompany.id }),
        planoContasApi.getPadrao(selectedCompany.id),
      ])

      setCategories(categoriesData)
      setBankAccounts(bankAccountsData)
      setCentrosCusto(centrosCustoData.data)
      
      // O endpoint getPadrao já retorna as contas no campo 'contas'
      // Filtrar apenas contas ativas que aceitam lançamento
      if (planoContas.contas && Array.isArray(planoContas.contas)) {
        const contasValidas = planoContas.contas.filter(c => c.aceitaLancamento && c.ativo)
        setContasContabeis(contasValidas)
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

    if (!formData.description || !formData.originalAmount || !formData.dueDate || !formData.categoryId || !formData.customerName) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const payload: CreateAccountReceivableDto = {
        companyId: selectedCompany.id,
        description: formData.description,
        customerName: formData.customerName,
        customerDocument: formData.customerDocument,
        originalAmount: Number(formData.originalAmount),
        dueDate: formData.dueDate,
        issueDate: formData.issueDate,
        competenceDate: formData.competenceDate,
        categoryId: formData.categoryId,
        documentNumber: formData.documentNumber || undefined,
        notes: formData.notes || undefined,
        centroCustoId: formData.centroCustoId,
        contaContabilId: formData.contaContabilId,
      }

      await accountsReceivableApi.create(payload)

      toast({
        title: "Sucesso",
        description: "Conta a receber criada com sucesso",
      })

      router.push("/dashboard/financeiro/contas-pagar-receber")
    } catch (error: any) {
      console.error("Erro ao criar conta a receber:", error)
      toast({
        title: "Erro ao criar conta",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (loadingData) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Nova Conta a Receber</h1>
            <p className="text-muted-foreground">Cadastre uma nova conta a receber</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Informações da Conta</CardTitle>
              <CardDescription>Preencha os dados da conta a receber</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Descrição <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="description"
                    placeholder="Ex: Cliente XYZ - Venda de produtos"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerName">
                    Cliente <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customerName"
                    placeholder="Nome do cliente"
                    value={formData.customerName}
                    onChange={(e) => handleChange("customerName", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerDocument">CNPJ/CPF do Cliente</Label>
                  <Input
                    id="customerDocument"
                    placeholder="00.000.000/0000-00"
                    value={formData.customerDocument}
                    onChange={(e) => handleChange("customerDocument", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="originalAmount">
                    Valor <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="originalAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={formData.originalAmount}
                    onChange={(e) => handleChange("originalAmount", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">
                    Data de Vencimento <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleChange("dueDate", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryId">
                    Categoria <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => handleChange("categoryId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="centroCustoId">Centro de Custo</Label>
                  <Select
                    value={formData.centroCustoId || "none"}
                    onValueChange={(value) => handleChange("centroCustoId", value === "none" ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um centro de custo (opcional)" />
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
                    onValueChange={(value) => handleChange("contaContabilId", value === "none" ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma conta contábil (opcional)" />
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

                <div className="space-y-2">
                  <Label htmlFor="documentNumber">Número do Documento</Label>
                  <Input
                    id="documentNumber"
                    placeholder="Ex: NF-12345"
                    value={formData.documentNumber}
                    onChange={(e) => handleChange("documentNumber", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issueDate">Data de Emissão</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => handleChange("issueDate", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="competenceDate">Data de Competência</Label>
                  <Input
                    id="competenceDate"
                    type="date"
                    value={formData.competenceDate}
                    onChange={(e) => handleChange("competenceDate", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Observações adicionais..."
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Conta a Receber
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
