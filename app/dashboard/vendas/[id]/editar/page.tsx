"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Plus, Search, Trash2, Loader2, X, Package } from "lucide-react"
import { salesApi, Sale } from "@/lib/api/sales"
import { customersApi, Customer } from "@/lib/api/customers"
import { productsApi, Product } from "@/lib/api/products"
import { paymentMethodsApi, PaymentMethod } from "@/lib/api/payment-methods"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/masks"

interface StockLocation {
  id: string
  name: string
  code: string
  description?: string
  active: boolean
}

interface SaleItemForm {
  productId: string
  productName: string
  productCode: string
  quantity: number
  unitPrice: number
  discount: number
  subtotal: number
  total: number
  stockLocationId?: string
  stockLocationName?: string
  notes?: string
}

export default function EditarVendaPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const saleId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sale, setSale] = useState<Sale | null>(null)

  // Estados do formulário
  const [status, setStatus] = useState<"QUOTE" | "PENDING_APPROVAL">("QUOTE")
  const [customerId, setCustomerId] = useState("")
  const [paymentMethodId, setPaymentMethodId] = useState("")
  const [installments, setInstallments] = useState(1)
  const [notes, setNotes] = useState("")
  const [internalNotes, setInternalNotes] = useState("")
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

  // Listas
  const [customers, setCustomers] = useState<Customer[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [stockLocations, setStockLocations] = useState<StockLocation[]>([])
  const [loadingStockLocations, setLoadingStockLocations] = useState(false)

  // Itens da venda
  const [items, setItems] = useState<SaleItemForm[]>([])

  // Dialog de adicionar produto
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false)
  const [searchProduct, setSearchProduct] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productQuantity, setProductQuantity] = useState("1")
  const [productDiscount, setProductDiscount] = useState("")
  const [productStockLocationId, setProductStockLocationId] = useState("")
  const [productNotes, setProductNotes] = useState("")

  useEffect(() => {
    loadInitialData()
  }, [saleId])

  useEffect(() => {
    if (status === "QUOTE") {
      // Orçamento não precisa de local de estoque
      setProductStockLocationId("")
    }
  }, [status])

  // Debounce para busca de produtos
  useEffect(() => {
    if (searchProduct.length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(() => {
      searchProducts()
    }, 500)

    return () => clearTimeout(timer)
  }, [searchProduct])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      
      // Carregar venda
      const saleData = await salesApi.getById(saleId)
      setSale(saleData)

      // Preencher formulário
      setStatus(saleData.status === "QUOTE" ? "QUOTE" : "PENDING_APPROVAL")
      setCustomerId(saleData.customerId)
      setPaymentMethodId(saleData.paymentMethodId || "")
      setInstallments(saleData.installments || 1)
      setNotes(saleData.notes || "")
      setInternalNotes(saleData.internalNotes || "")
      
      if (saleData.validUntil) {
        setValidUntil(saleData.validUntil.split('T')[0])
      }

      setUseCustomerAddress(saleData.useCustomerAddress)
      if (saleData.deliveryAddress) {
        setDeliveryStreet(saleData.deliveryAddress.street || "")
        setDeliveryNumber(saleData.deliveryAddress.number || "")
        setDeliveryComplement(saleData.deliveryAddress.complement || "")
        setDeliveryNeighborhood(saleData.deliveryAddress.neighborhood || "")
        setDeliveryCity(saleData.deliveryAddress.city || "")
        setDeliveryState(saleData.deliveryAddress.state || "")
        setDeliveryZipCode(saleData.deliveryAddress.zipCode || "")
      }

      // Carregar itens
      const loadedItems: SaleItemForm[] = saleData.items.map(item => ({
        productId: item.productId,
        productName: item.productName || item.product?.name || "",
        productCode: item.productCode || item.product?.sku || "",
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        subtotal: item.subtotal,
        total: item.total || item.totalPrice || 0,
        stockLocationId: item.stockLocationId,
        stockLocationName: item.stockLocation?.name,
        notes: item.notes,
      }))
      setItems(loadedItems)

      // Carregar dados auxiliares
      await Promise.all([
        loadCustomers(),
        loadPaymentMethods(),
        loadStockLocations(),
      ])
    } catch (error: any) {
      toast({
        title: "Erro ao carregar venda",
        description: error.response?.data?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
      router.push("/dashboard/vendas")
    } finally {
      setLoading(false)
    }
  }

  const loadCustomers = async () => {
    try {
      const data = await customersApi.getAll({ limit: 1000 })
      setCustomers(data.data)
    } catch (error) {
      console.error("Erro ao carregar clientes:", error)
    }
  }

  const loadPaymentMethods = async () => {
    try {
      const data = await paymentMethodsApi.getAll()
      setPaymentMethods(data)
    } catch (error) {
      console.error("Erro ao carregar formas de pagamento:", error)
    }
  }

  const loadStockLocations = async () => {
    try {
      setLoadingStockLocations(true)
      // Buscar locais de estoque pela API de produtos (endpoint /stock-locations)
      const response = await fetch('/api/stock-locations', {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const data = await response.json()
        setStockLocations(data)
      }
    } catch (error) {
      console.error("Erro ao carregar locais de estoque:", error)
    } finally {
      setLoadingStockLocations(false)
    }
  }

  const searchProducts = async () => {
    if (!searchProduct.trim()) return

    try {
      setLoadingProducts(true)
      const response = await productsApi.getAll({ 
        search: searchProduct, 
        active: true,
        limit: 20,
        sortBy: 'name',
        sortOrder: 'asc'
      })
      setSearchResults(response.products)
    } catch (error) {
      toast({
        title: "Erro ao buscar produtos",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      })
      setSearchResults([])
    } finally {
      setLoadingProducts(false)
    }
  }

  const selectProduct = (product: Product) => {
    setSelectedProduct(product)
    setSearchResults([])
    setSearchProduct("")
    // Preencher com preço de venda
    setProductQuantity("1")
    setProductDiscount("")
  }

  const addProductToSale = () => {
    if (!selectedProduct) {
      toast({
        title: "Selecione um produto",
        description: "Você precisa selecionar um produto antes de adicionar.",
        variant: "destructive",
      })
      return
    }

    const quantity = parseFloat(productQuantity) || 0
    if (quantity <= 0) {
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
      if (quantity > currentStock) {
        toast({
          title: "Estoque insuficiente",
          description: `Disponível em estoque: ${currentStock} unidades.`,
          variant: "destructive",
        })
        return
      }
    }

    const unitPrice = parseFloat(selectedProduct.salePrice) || 0
    if (unitPrice <= 0) {
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

    const discount = parseFloat(productDiscount) || 0
    const subtotal = quantity * unitPrice
    const total = subtotal - discount

    const locationName = productStockLocationId 
      ? stockLocations.find(loc => loc.id === productStockLocationId)?.name 
      : undefined

    const newItem: SaleItemForm = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productCode: selectedProduct.sku || selectedProduct.id,
      quantity,
      unitPrice,
      discount,
      subtotal,
      total,
      stockLocationId: productStockLocationId || undefined,
      stockLocationName: locationName,
      notes: productNotes || undefined,
    }

    setItems([...items, newItem])
    
    // Limpar formulário
    setSelectedProduct(null)
    setProductQuantity("1")
    setProductDiscount("")
    setProductStockLocationId("")
    setProductNotes("")
    setAddProductDialogOpen(false)

    toast({
      title: "Produto adicionado",
      description: `${selectedProduct.name} foi adicionado à venda.`,
    })
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItemQuantity = (index: number, quantity: string) => {
    const qty = parseFloat(quantity) || 0
    const updatedItems = [...items]
    const item = updatedItems[index]
    item.quantity = qty
    item.subtotal = qty * item.unitPrice
    item.total = item.subtotal - item.discount
    setItems(updatedItems)
  }

  const updateItemPrice = (index: number, price: string) => {
    const unitPrice = parseFloat(price) || 0
    const updatedItems = [...items]
    const item = updatedItems[index]
    item.unitPrice = unitPrice
    item.subtotal = item.quantity * unitPrice
    item.total = item.subtotal - item.discount
    setItems(updatedItems)
  }

  const updateItemDiscount = (index: number, discount: string) => {
    const disc = parseFloat(discount) || 0
    const updatedItems = [...items]
    const item = updatedItems[index]
    item.discount = disc
    item.total = item.subtotal - disc
    setItems(updatedItems)
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.subtotal, 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    
    return subtotal
  }

  const handleSubmit = async () => {
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
        title: "Itens obrigatórios",
        description: "Adicione pelo menos um produto à venda.",
        variant: "destructive",
      })
      return
    }

    // Validar local de estoque para vendas (não orçamentos)
    if (status !== "QUOTE") {
      const hasItemWithoutLocation = items.some(item => !item.stockLocationId)
      if (hasItemWithoutLocation) {
        toast({
          title: "Local de estoque obrigatório",
          description: "Todos os itens devem ter um local de estoque definido.",
          variant: "destructive",
        })
        return
      }
    }

    try {
      setSaving(true)

      const updateDto: any = {
        customerId,
        status,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          stockLocationId: item.stockLocationId || undefined,
          notes: item.notes || undefined,
        })),
      }

      if (paymentMethodId) {
        updateDto.paymentMethodId = paymentMethodId
        updateDto.installments = installments
      }

      updateDto.notes = notes.trim() || undefined
      updateDto.internalNotes = internalNotes.trim() || undefined

      if (status === "QUOTE" && validUntil) {
        updateDto.validUntil = new Date(validUntil + 'T23:59:59.999Z').toISOString()
      }

      updateDto.useCustomerAddress = useCustomerAddress

      if (!useCustomerAddress && deliveryStreet && deliveryNumber) {
        updateDto.deliveryAddress = {
          street: deliveryStreet,
          number: deliveryNumber,
          complement: deliveryComplement || undefined,
          neighborhood: deliveryNeighborhood,
          city: deliveryCity,
          state: deliveryState,
          zipCode: deliveryZipCode,
        }
      }

      await salesApi.update(saleId, updateDto)

      toast({
        title: "Venda atualizada",
        description: "A venda foi atualizada com sucesso.",
      })

      router.push(`/dashboard/vendas/${saleId}`)
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar venda",
        description: error.response?.data?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  if (!sale) {
    return null
  }

  // Só permite editar QUOTE ou DRAFT
  if (sale.status !== "QUOTE" && sale.status !== "DRAFT") {
    return (
      <DashboardLayout userRole="company">
        <Card>
          <CardHeader>
            <CardTitle>Edição não permitida</CardTitle>
            <CardDescription>
              Esta venda não pode ser editada pois já foi {sale.status === "APPROVED" ? "aprovada" : "processada"}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push(`/dashboard/vendas/${saleId}`)}>
              Voltar para detalhes
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  const selectedCustomer = customers.find(c => c.id === customerId)
  const selectedPaymentMethod = paymentMethods.find(pm => pm.id === paymentMethodId)

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/dashboard/vendas/${saleId}`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Editar {sale.status === "QUOTE" ? "Orçamento" : "Venda"}
              </h1>
              <p className="text-muted-foreground">
                Código: {sale.code}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/vendas/${saleId}`)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>
                  Dados principais da {sale.status === "QUOTE" ? "orçamento" : "venda"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status Inicial *</Label>
                    <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="QUOTE">Orçamento</SelectItem>
                        <SelectItem value="PENDING_APPROVAL">Venda (Pendente Aprovação)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerId">Cliente *</Label>
                    <Select value={customerId} onValueChange={setCustomerId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {status === "QUOTE" && (
                  <div className="space-y-2">
                    <Label htmlFor="validUntil">Válido Até</Label>
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

            {/* Produtos */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Produtos</CardTitle>
                    <CardDescription>Itens desta venda</CardDescription>
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
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum produto adicionado</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-right w-[120px]">Quantidade</TableHead>
                        <TableHead className="text-right w-[140px]">Preço Unit.</TableHead>
                        <TableHead className="text-right w-[120px]">Desconto</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-sm text-muted-foreground">
                                SKU: {item.productCode}
                              </p>
                              {item.stockLocationName && (
                                <p className="text-xs text-muted-foreground">
                                  Local: {item.stockLocationName}
                                </p>
                              )}
                              {item.notes && (
                                <p className="text-xs text-muted-foreground">
                                  Obs: {item.notes}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(index, e.target.value)}
                              className="text-right"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => updateItemPrice(index, e.target.value)}
                              className="text-right"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.discount}
                              onChange={(e) => updateItemDiscount(index, e.target.value)}
                              className="text-right"
                            />
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(item.total)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-medium">
                          Subtotal
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(calculateSubtotal())}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Observações */}
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações (visível para o cliente)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Informações adicionais sobre a venda..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="internalNotes">Observações Internas (uso interno)</Label>
                  <Textarea
                    id="internalNotes"
                    placeholder="Notas internas sobre a venda..."
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Endereço de Entrega */}
            <Card>
              <CardHeader>
                <CardTitle>Endereço de Entrega</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="useCustomerAddress"
                    checked={useCustomerAddress}
                    onCheckedChange={(checked) => setUseCustomerAddress(checked as boolean)}
                  />
                  <Label htmlFor="useCustomerAddress" className="cursor-pointer">
                    Usar endereço do cliente
                  </Label>
                </div>

                {!useCustomerAddress && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="deliveryStreet">Rua *</Label>
                      <Input
                        id="deliveryStreet"
                        value={deliveryStreet}
                        onChange={(e) => setDeliveryStreet(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deliveryNumber">Número *</Label>
                      <Input
                        id="deliveryNumber"
                        value={deliveryNumber}
                        onChange={(e) => setDeliveryNumber(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deliveryComplement">Complemento</Label>
                      <Input
                        id="deliveryComplement"
                        value={deliveryComplement}
                        onChange={(e) => setDeliveryComplement(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deliveryNeighborhood">Bairro *</Label>
                      <Input
                        id="deliveryNeighborhood"
                        value={deliveryNeighborhood}
                        onChange={(e) => setDeliveryNeighborhood(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deliveryCity">Cidade *</Label>
                      <Input
                        id="deliveryCity"
                        value={deliveryCity}
                        onChange={(e) => setDeliveryCity(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deliveryState">Estado *</Label>
                      <Input
                        id="deliveryState"
                        value={deliveryState}
                        onChange={(e) => setDeliveryState(e.target.value)}
                        maxLength={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deliveryZipCode">CEP *</Label>
                      <Input
                        id="deliveryZipCode"
                        value={deliveryZipCode}
                        onChange={(e) => setDeliveryZipCode(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Coluna Lateral */}
          <div className="space-y-6">
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

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Forma de Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle>Forma de Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentMethodId">Método</Label>
                  <Select value={paymentMethodId} onValueChange={setPaymentMethodId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
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

                {selectedPaymentMethod?.allowInstallments && (
                  <div className="space-y-2">
                    <Label htmlFor="installments">Parcelas</Label>
                    <Select
                      value={String(installments)}
                      onValueChange={(value) => setInstallments(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: selectedPaymentMethod.maxInstallments || 12 }, (_, i) => i + 1).map((num) => (
                          <SelectItem key={num} value={String(num)}>
                            {num}x de {formatCurrency(calculateTotal() / num)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialog de Adicionar Produto */}
      <Dialog open={addProductDialogOpen} onOpenChange={setAddProductDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Produto</DialogTitle>
            <DialogDescription>
              Busque e selecione um produto para adicionar à venda
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {!selectedProduct ? (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, SKU ou código... (mín. 2 caracteres)"
                    className="pl-10"
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                  />
                </div>

                {loadingProducts && (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  </div>
                )}

                {!loadingProducts && searchProduct.length >= 2 && searchResults.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum produto encontrado</p>
                  </div>
                )}

                {!loadingProducts && searchResults.length > 0 && (
                  <div className="border rounded-lg max-h-[400px] overflow-y-auto">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        className="p-4 hover:bg-accent cursor-pointer border-b last:border-b-0"
                        onClick={() => selectProduct(product)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              SKU: {product.sku || "—"} | Código: {product.barcode || "—"}
                            </p>
                            {product.manageStock && (
                              <p className="text-sm text-muted-foreground">
                                Estoque: {product.currentStock || 0}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary">
                              {formatCurrency(parseFloat(product.salePrice) || 0)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-medium">{selectedProduct.name}</p>
                        <p className="text-sm text-muted-foreground">
                          SKU: {selectedProduct.sku || "—"}
                        </p>
                        {selectedProduct.manageStock && (
                          <p className="text-sm text-muted-foreground">
                            Estoque disponível: {selectedProduct.currentStock || 0}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedProduct(null)
                          setSearchProduct("")
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="productQuantity">Quantidade *</Label>
                          <Input
                            id="productQuantity"
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={productQuantity}
                            onChange={(e) => setProductQuantity(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Preço Unitário</Label>
                          <Input
                            value={formatCurrency(parseFloat(selectedProduct.salePrice) || 0)}
                            disabled
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="productDiscount">Desconto (R$)</Label>
                        <Input
                          id="productDiscount"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={productDiscount}
                          onChange={(e) => setProductDiscount(e.target.value)}
                        />
                      </div>

                      {status !== "QUOTE" && (
                        <div className="space-y-2">
                          <Label htmlFor="productStockLocationId">Local de Estoque *</Label>
                          <Select
                            value={productStockLocationId}
                            onValueChange={setProductStockLocationId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o local..." />
                            </SelectTrigger>
                            <SelectContent>
                              {stockLocations.map((location) => (
                                <SelectItem key={location.id} value={location.id}>
                                  {location.name} ({location.code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="productNotes">Observações</Label>
                        <Textarea
                          id="productNotes"
                          placeholder="Informações adicionais sobre este item..."
                          value={productNotes}
                          onChange={(e) => setProductNotes(e.target.value)}
                          rows={2}
                        />
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total do Item:</span>
                          <span className="text-xl font-bold">
                            {formatCurrency(
                              (parseFloat(productQuantity) || 0) * (parseFloat(selectedProduct.salePrice) || 0) -
                              (parseFloat(productDiscount) || 0)
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAddProductDialogOpen(false)
              setSelectedProduct(null)
              setSearchProduct("")
              setSearchResults([])
            }}>
              Cancelar
            </Button>
            {selectedProduct && (
              <Button onClick={addProductToSale}>
                Adicionar à Venda
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
