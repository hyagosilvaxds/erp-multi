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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowLeft, Plus, Trash2, Loader2, Search } from "lucide-react"
import { salesApi, CreateSaleDto } from "@/lib/api/sales"
import { customersApi, Customer } from "@/lib/api/customers"
import { paymentMethodsApi } from "@/lib/api/payment-methods"
import { productsApi, Product as ApiProduct, stockLocationsApi, StockLocation } from "@/lib/api/products"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/masks"
import { Checkbox } from "@/components/ui/checkbox"

interface PaymentMethod {
  id: string
  name: string
  type: string
  maxInstallments: number
  active: boolean
}

interface SaleItemForm {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discount: number
  stockLocationId?: string
  stockLocationName?: string
  notes?: string
  subtotal: number
  total: number
}

export default function NovaVendaPage() {
  const router = useRouter()
  const { toast } = useToast()

  // Estados principais
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [stockLocations, setStockLocations] = useState<StockLocation[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true)
  const [loadingStockLocations, setLoadingStockLocations] = useState(true)

  // Dados da venda
  const [status, setStatus] = useState<"QUOTE" | "PENDING_APPROVAL">("QUOTE")
  const [customerId, setCustomerId] = useState("")
  const [paymentMethodId, setPaymentMethodId] = useState("")
  const [installments, setInstallments] = useState(1)
  
  // Descontos
  const [discountPercent, setDiscountPercent] = useState(0)
  const [discountAmount, setDiscountAmount] = useState(0)
  
  // Valores adicionais
  const [shippingCost, setShippingCost] = useState(0)
  const [otherCharges, setOtherCharges] = useState(0)
  const [otherChargesDesc, setOtherChargesDesc] = useState("")
  
  // Observações
  const [notes, setNotes] = useState("")
  const [internalNotes, setInternalNotes] = useState("")
  
  // Validade
  const [validUntil, setValidUntil] = useState("")
  
  // Endereço de entrega
  const [useCustomerAddress, setUseCustomerAddress] = useState(true)
  const [deliveryStreet, setDeliveryStreet] = useState("")
  const [deliveryNumber, setDeliveryNumber] = useState("")
  const [deliveryComplement, setDeliveryComplement] = useState("")
  const [deliveryNeighborhood, setDeliveryNeighborhood] = useState("")
  const [deliveryCity, setDeliveryCity] = useState("")
  const [deliveryState, setDeliveryState] = useState("")
  const [deliveryZipCode, setDeliveryZipCode] = useState("")

  // Itens da venda
  const [items, setItems] = useState<SaleItemForm[]>([])

  // Dialog de adicionar produto
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false)
  const [searchProduct, setSearchProduct] = useState("")
  const [searchResults, setSearchResults] = useState<ApiProduct[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ApiProduct | null>(null)
  const [productQuantity, setProductQuantity] = useState(1)
  const [productPrice, setProductPrice] = useState(0)
  const [productDiscount, setProductDiscount] = useState(0)
  const [productStockLocationId, setProductStockLocationId] = useState("")
  const [productNotes, setProductNotes] = useState("")

  useEffect(() => {
    loadCustomers()
    loadPaymentMethods()
    loadStockLocations()
  }, [])

  // Debounce para busca de produtos
  useEffect(() => {
    if (searchProduct.length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(() => {
      searchProducts(searchProduct)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchProduct])

  const loadCustomers = async () => {
    try {
      setLoadingCustomers(true)
      const response = await customersApi.getAll({ limit: 100 })
      setCustomers(response.data)
    } catch (error: any) {
      toast({
        title: "Erro ao carregar clientes",
        description: error.response?.data?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setLoadingCustomers(false)
    }
  }

  const loadPaymentMethods = async () => {
    try {
      setLoadingPaymentMethods(true)
      const data = await paymentMethodsApi.getAll()
      setPaymentMethods(data.filter(pm => pm.active))
    } catch (error: any) {
      toast({
        title: "Erro ao carregar métodos de pagamento",
        description: error.response?.data?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setLoadingPaymentMethods(false)
    }
  }

  const loadStockLocations = async () => {
    try {
      setLoadingStockLocations(true)
      const data = await stockLocationsApi.getAll()
      setStockLocations(data.filter(loc => loc.active))
    } catch (error: any) {
      toast({
        title: "Erro ao carregar locais de estoque",
        description: error.response?.data?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setLoadingStockLocations(false)
    }
  }

  const searchProducts = async (query: string) => {
    try {
      setLoadingProducts(true)
      const response = await productsApi.getAll({
        search: query,
        active: true,
        limit: 20,
        sortBy: 'name',
        sortOrder: 'asc'
      })
      setSearchResults(response.products)
    } catch (error: any) {
      toast({
        title: "Erro ao buscar produtos",
        description: error.response?.data?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
      setSearchResults([])
    } finally {
      setLoadingProducts(false)
    }
  }

  const handleSelectProduct = (product: ApiProduct) => {
    setSelectedProduct(product)
    // Preencher com preço de venda
    const price = parseFloat(product.salePrice) || 0
    setProductPrice(price)
    setProductQuantity(1)
    setProductDiscount(0)
  }

  const handleAddProduct = () => {
    if (!selectedProduct) {
      toast({
        title: "Selecione um produto",
        description: "Você precisa selecionar um produto antes de adicionar.",
        variant: "destructive",
      })
      return
    }

    if (productQuantity <= 0) {
      toast({
        title: "Quantidade inválida",
        description: "A quantidade deve ser maior que zero.",
        variant: "destructive",
      })
      return
    }

    // Validar estoque se o produto gerencia estoque
    if (selectedProduct.manageStock) {
      const currentStock = selectedProduct.currentStock || 0
      if (productQuantity > currentStock) {
        toast({
          title: "Estoque insuficiente",
          description: `Disponível em estoque: ${currentStock} unidades.`,
          variant: "destructive",
        })
        return
      }
    }

    if (productPrice <= 0) {
      toast({
        title: "Preço inválido",
        description: "O preço deve ser maior que zero.",
        variant: "destructive",
      })
      return
    }

    // Verificar se o produto já foi adicionado
    const productExists = items.find(item => item.productId === selectedProduct.id)
    if (productExists) {
      toast({
        title: "Produto já adicionado",
        description: "Este produto já está na lista. Edite a quantidade se necessário.",
        variant: "destructive",
      })
      return
    }

    const subtotal = productQuantity * productPrice
    const total = subtotal - productDiscount

    const locationName = productStockLocationId 
      ? stockLocations.find(loc => loc.id === productStockLocationId)?.name 
      : undefined

    const newItem: SaleItemForm = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity: productQuantity,
      unitPrice: productPrice,
      discount: productDiscount,
      stockLocationId: productStockLocationId || undefined,
      stockLocationName: locationName,
      notes: productNotes || undefined,
      subtotal,
      total,
    }

    setItems([...items, newItem])
    
    // Resetar dialog
    setAddProductDialogOpen(false)
    setSelectedProduct(null)
    setSearchProduct("")
    setSearchResults([])
    setProductQuantity(1)
    setProductPrice(0)
    setProductDiscount(0)
    setProductStockLocationId("")
    setProductNotes("")

    toast({
      title: "Produto adicionado",
      description: `${selectedProduct.name} foi adicionado à venda.`,
    })
  }

  const handleRemoveItem = (productId: string) => {
    setItems(items.filter(item => item.productId !== productId))
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal()
    if (discountPercent > 0) {
      return (subtotal * discountPercent) / 100
    }
    return discountAmount
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const discount = calculateDiscount()
    return subtotal - discount + shippingCost + otherCharges
  }

  const handleSubmit = async (asQuote: boolean) => {
    // Validações
    if (!customerId) {
      toast({
        title: "Cliente obrigatório",
        description: "Selecione um cliente para continuar.",
        variant: "destructive",
      })
      return
    }

    if (items.length === 0) {
      toast({
        title: "Adicione itens",
        description: "A venda deve ter pelo menos um item.",
        variant: "destructive",
      })
      return
    }

    // Validação de local de estoque para venda confirmada
    if (!asQuote && status === "PENDING_APPROVAL") {
      const itemsWithoutLocation = items.filter(item => !item.stockLocationId)
      if (itemsWithoutLocation.length > 0) {
        toast({
          title: "Local de estoque obrigatório",
          description: "Todos os itens devem ter um local de estoque definido para confirmar a venda.",
          variant: "destructive",
        })
        return
      }
    }

    try {
      setLoading(true)

      const dto: CreateSaleDto = {
        customerId,
        status: asQuote ? "QUOTE" : status,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || undefined,
          stockLocationId: item.stockLocationId || undefined,
          notes: item.notes || undefined,
        })),
        ...(paymentMethodId && { paymentMethodId }),
        installments: installments > 1 ? installments : undefined,
        discountPercent: discountPercent > 0 ? discountPercent : undefined,
        discountAmount: discountAmount > 0 ? discountAmount : undefined,
        shippingCost: shippingCost > 0 ? shippingCost : undefined,
        otherCharges: otherCharges > 0 ? otherCharges : undefined,
        otherChargesDesc: otherChargesDesc.trim() || undefined,
        notes: notes.trim() || undefined,
        internalNotes: internalNotes.trim() || undefined,
        validUntil: validUntil.trim() ? new Date(validUntil + 'T23:59:59.999Z').toISOString() : undefined,
        useCustomerAddress,
        deliveryAddress: !useCustomerAddress && deliveryStreet.trim() ? {
          street: deliveryStreet,
          number: deliveryNumber,
          complement: deliveryComplement.trim() || undefined,
          neighborhood: deliveryNeighborhood,
          city: deliveryCity,
          state: deliveryState,
          zipCode: deliveryZipCode,
        } : undefined,
      }

      const venda = await salesApi.create(dto)

      toast({
        title: asQuote ? "Orçamento criado" : "Venda criada",
        description: `${venda.saleNumber} foi ${asQuote ? "salvo como orçamento" : "criado"} com sucesso.`,
      })

      router.push(`/dashboard/vendas/${venda.id}`)
    } catch (error: any) {
      toast({
        title: "Erro ao criar venda",
        description: error.response?.data?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const maxInstallments = paymentMethods.find(pm => pm.id === paymentMethodId)?.maxInstallments || 1

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard/vendas")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Nova Venda</h1>
              <p className="text-muted-foreground">Crie um novo orçamento ou venda</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Rascunho"
              )}
            </Button>
            <Button
              onClick={() => handleSubmit(false)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Venda"
              )}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações do Cliente */}
            <Card>
              <CardHeader>
                <CardTitle>Cliente</CardTitle>
                <CardDescription>Selecione o cliente para esta venda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Cliente *</Label>
                  <Select value={customerId} onValueChange={setCustomerId} disabled={loadingCustomers}>
                    <SelectTrigger id="customer">
                      <SelectValue placeholder={loadingCustomers ? "Carregando..." : "Selecione um cliente"} />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name || customer.tradeName || "Sem nome"} 
                          {(customer.cpf || customer.cnpj) && ` - ${customer.cpf || customer.cnpj}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Itens da Venda */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Itens da Venda</CardTitle>
                    <CardDescription>Adicione produtos a esta venda</CardDescription>
                  </div>
                  <Button onClick={() => setAddProductDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Produto
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhum item adicionado</p>
                    <p className="text-sm">Clique em "Adicionar Produto" para começar</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>Local</TableHead>
                        <TableHead className="text-right">Qtd</TableHead>
                        <TableHead className="text-right">Preço Unit.</TableHead>
                        <TableHead className="text-right">Desconto</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.productId}>
                          <TableCell>
                            <div className="font-medium">{item.productName}</div>
                            {item.notes && (
                              <div className="text-xs text-muted-foreground">{item.notes}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            {item.stockLocationName ? (
                              <span className="text-sm">{item.stockLocationName}</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">Não definido</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.discount || 0)}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(item.total)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(item.productId)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Informações Adicionais */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Adicionais</CardTitle>
                <CardDescription>Observações e notas sobre a venda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações (visível ao cliente)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Observações que serão vistas pelo cliente..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="internalNotes">Notas Internas</Label>
                  <Textarea
                    id="internalNotes"
                    placeholder="Notas internas (não visível ao cliente)..."
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                {status === "QUOTE" && (
                  <div className="space-y-2">
                    <Label htmlFor="validUntil">Válido Até (para orçamentos)</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Endereço de Entrega */}
            <Card>
              <CardHeader>
                <CardTitle>Endereço de Entrega</CardTitle>
                <CardDescription>Configure o endereço para entrega dos produtos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="useCustomerAddress"
                    checked={useCustomerAddress}
                    onCheckedChange={(checked) => setUseCustomerAddress(!!checked)}
                  />
                  <Label htmlFor="useCustomerAddress" className="cursor-pointer">
                    Usar endereço do cliente
                  </Label>
                </div>

                {!useCustomerAddress && (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="deliveryStreet">Logradouro *</Label>
                        <Input
                          id="deliveryStreet"
                          placeholder="Rua, Avenida, etc"
                          value={deliveryStreet}
                          onChange={(e) => setDeliveryStreet(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deliveryNumber">Número *</Label>
                        <Input
                          id="deliveryNumber"
                          placeholder="123"
                          value={deliveryNumber}
                          onChange={(e) => setDeliveryNumber(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="deliveryComplement">Complemento</Label>
                        <Input
                          id="deliveryComplement"
                          placeholder="Apto, bloco, etc"
                          value={deliveryComplement}
                          onChange={(e) => setDeliveryComplement(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deliveryNeighborhood">Bairro *</Label>
                        <Input
                          id="deliveryNeighborhood"
                          placeholder="Centro"
                          value={deliveryNeighborhood}
                          onChange={(e) => setDeliveryNeighborhood(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="deliveryCity">Cidade *</Label>
                        <Input
                          id="deliveryCity"
                          placeholder="São Paulo"
                          value={deliveryCity}
                          onChange={(e) => setDeliveryCity(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deliveryState">Estado *</Label>
                        <Input
                          id="deliveryState"
                          placeholder="SP"
                          maxLength={2}
                          value={deliveryState}
                          onChange={(e) => setDeliveryState(e.target.value.toUpperCase())}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deliveryZipCode">CEP *</Label>
                        <Input
                          id="deliveryZipCode"
                          placeholder="01234-567"
                          value={deliveryZipCode}
                          onChange={(e) => setDeliveryZipCode(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Coluna lateral - Resumo e Pagamento */}
          <div className="space-y-6">
            {/* Status da Venda */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
                <CardDescription>Defina o status inicial da venda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status Inicial</Label>
                  <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="QUOTE">Orçamento</SelectItem>
                      <SelectItem value="PENDING_APPROVAL">Aguardando Aprovação</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Orçamentos não afetam o estoque até serem confirmados
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle>Pagamento</CardTitle>
                <CardDescription>
                  {status === "QUOTE" ? "Opcional para orçamentos" : "Configure o pagamento"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">
                    Método de Pagamento {status !== "QUOTE" && "*"}
                  </Label>
                  <Select value={paymentMethodId} onValueChange={setPaymentMethodId}>
                    <SelectTrigger id="paymentMethod">
                      <SelectValue placeholder="Selecione um método" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          {method.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {paymentMethodId && (
                  <div className="space-y-2">
                    <Label htmlFor="installments">Parcelas</Label>
                    <Select
                      value={installments.toString()}
                      onValueChange={(value) => setInstallments(Number(value))}
                    >
                      <SelectTrigger id="installments">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(
                          { length: paymentMethods.find(pm => pm.id === paymentMethodId)?.maxInstallments || 1 },
                          (_, i) => i + 1
                        ).map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}x
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resumo Financeiro */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discountPercent">Desconto (%)</Label>
                    <Input
                      id="discountPercent"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={discountPercent}
                      onChange={(e) => {
                        setDiscountPercent(Number(e.target.value))
                        if (Number(e.target.value) > 0) setDiscountAmount(0)
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discountAmount">Desconto (R$)</Label>
                    <Input
                      id="discountAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={discountAmount}
                      onChange={(e) => {
                        setDiscountAmount(Number(e.target.value))
                        if (Number(e.target.value) > 0) setDiscountPercent(0)
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Use desconto em % OU em valor fixo
                    </p>
                  </div>

                  {calculateDiscount() > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Desconto</span>
                      <span className="font-medium text-destructive">
                        -{formatCurrency(calculateDiscount())}
                      </span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="shippingCost">Frete</Label>
                    <Input
                      id="shippingCost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={shippingCost}
                      onChange={(e) => setShippingCost(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="otherCharges">Outras Despesas</Label>
                    <Input
                      id="otherCharges"
                      type="number"
                      min="0"
                      step="0.01"
                      value={otherCharges}
                      onChange={(e) => setOtherCharges(Number(e.target.value))}
                    />
                  </div>

                  {otherCharges > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="otherChargesDesc">Descrição das Despesas</Label>
                      <Input
                        id="otherChargesDesc"
                        placeholder="Ex: Embalagem especial"
                        value={otherChargesDesc}
                        onChange={(e) => setOtherChargesDesc(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-lg font-bold text-primary">
                        {formatCurrency(calculateTotal())}
                      </span>
                    </div>
                  </div>

                  {paymentMethodId && installments > 1 && (
                    <div className="text-sm text-muted-foreground text-right">
                      {installments}x de {formatCurrency(calculateTotal() / installments)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/vendas")}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => handleSubmit(true)}
            disabled={loading}
            variant="secondary"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar como Orçamento
          </Button>
          <Button
            onClick={() => handleSubmit(false)}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {status === "QUOTE" ? "Criar Orçamento" : "Criar Venda"}
          </Button>
        </div>
      </div>

      {/* Dialog Adicionar Produto */}
      <Dialog open={addProductDialogOpen} onOpenChange={setAddProductDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Produto</DialogTitle>
            <DialogDescription>
              Busque e adicione um produto à venda
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Buscar Produto</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Digite o nome, SKU ou código de barras..."
                  className="pl-10"
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                />
                {loadingProducts && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Digite pelo menos 2 caracteres para buscar
              </p>
            </div>

            {/* Lista de resultados */}
            {!selectedProduct && searchResults.length > 0 && (
              <div className="space-y-2">
                <Label>Resultados ({searchResults.length})</Label>
                <div className="border rounded-lg divide-y max-h-[300px] overflow-y-auto">
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      className="w-full p-3 text-left hover:bg-muted/50 transition-colors"
                      onClick={() => handleSelectProduct(product)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {product.sku && `SKU: ${product.sku}`}
                            {product.sku && product.barcode && ' • '}
                            {product.barcode && `Código: ${product.barcode}`}
                          </p>
                          {product.manageStock && (
                            <p className="text-sm text-muted-foreground">
                              Estoque: {product.currentStock || 0} {product.unit?.abbreviation || 'un'}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary">
                            {formatCurrency(parseFloat(product.salePrice))}
                          </p>
                          {product.category && (
                            <p className="text-xs text-muted-foreground">
                              {product.category.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!selectedProduct && searchProduct.length >= 2 && !loadingProducts && searchResults.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum produto encontrado</p>
                <p className="text-sm">Tente buscar por outro termo</p>
              </div>
            )}

            {selectedProduct && (
              <>
                <div className="rounded-lg border p-4 bg-muted/50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium">{selectedProduct.name}</h4>
                      {selectedProduct.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedProduct.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedProduct(null)
                        setSearchProduct("")
                      }}
                    >
                      Trocar
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {selectedProduct.sku && (
                      <div>
                        <span className="text-muted-foreground">SKU: </span>
                        <span className="font-medium">{selectedProduct.sku}</span>
                      </div>
                    )}
                    {selectedProduct.barcode && (
                      <div>
                        <span className="text-muted-foreground">Código: </span>
                        <span className="font-medium">{selectedProduct.barcode}</span>
                      </div>
                    )}
                    {selectedProduct.manageStock && (
                      <div>
                        <span className="text-muted-foreground">Estoque: </span>
                        <span className="font-medium">
                          {selectedProduct.currentStock || 0} {selectedProduct.unit?.abbreviation || 'un'}
                        </span>
                      </div>
                    )}
                    {selectedProduct.category && (
                      <div>
                        <span className="text-muted-foreground">Categoria: </span>
                        <span className="font-medium">{selectedProduct.category.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-muted-foreground">Preço de venda</p>
                    <p className="text-lg font-semibold text-primary">
                      {formatCurrency(parseFloat(selectedProduct.salePrice))}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantidade *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max={selectedProduct.manageStock ? (selectedProduct.currentStock || 0) : undefined}
                      value={productQuantity}
                      onChange={(e) => setProductQuantity(Number(e.target.value))}
                    />
                    {selectedProduct.manageStock && (
                      <p className="text-xs text-muted-foreground">
                        Máx: {selectedProduct.currentStock || 0} disponíveis
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço Unitário *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={productPrice}
                      onChange={(e) => setProductPrice(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productDiscount">Desconto</Label>
                    <Input
                      id="productDiscount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={productDiscount}
                      onChange={(e) => setProductDiscount(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stockLocation">
                      Local de Estoque {status !== "QUOTE" && "*"}
                    </Label>
                    <Select value={productStockLocationId} onValueChange={setProductStockLocationId}>
                      <SelectTrigger id="stockLocation">
                        <SelectValue placeholder="Selecione o local" />
                      </SelectTrigger>
                      <SelectContent>
                        {stockLocations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name} {location.isDefault && "(Padrão)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedProduct.manageStock && productStockLocationId && (
                      <p className="text-xs text-muted-foreground">
                        {selectedProduct.stocksByLocation?.find(s => s.locationId === productStockLocationId) ? (
                          <>Estoque neste local: {selectedProduct.stocksByLocation.find(s => s.locationId === productStockLocationId)?.quantity || 0}</>
                        ) : (
                          <>Estoque neste local não disponível</>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productNotes">Observações do Item</Label>
                  <Textarea
                    id="productNotes"
                    placeholder="Observações específicas deste produto..."
                    value={productNotes}
                    onChange={(e) => setProductNotes(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Subtotal</span>
                    <span className="font-medium">
                      {formatCurrency(productQuantity * productPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Desconto</span>
                    <span className="font-medium">
                      - {formatCurrency(productDiscount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total</span>
                    <span>
                      {formatCurrency(productQuantity * productPrice - productDiscount)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddProductDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddProduct} disabled={!selectedProduct}>
              Adicionar Produto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
