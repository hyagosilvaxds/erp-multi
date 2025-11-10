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
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/masks"

interface PaymentMethod {
  id: string
  name: string
  type: string
  maxInstallments: number
  active: boolean
}

interface Product {
  id: string
  name: string
  sku: string
  price: number
  stockQuantity: number
}

interface SaleItemForm {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discount: number
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
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true)

  // Dados da venda
  const [customerId, setCustomerId] = useState("")
  const [paymentMethodId, setPaymentMethodId] = useState("")
  const [installments, setInstallments] = useState(1)
  const [discount, setDiscount] = useState(0)
  const [shipping, setShipping] = useState(0)
  const [notes, setNotes] = useState("")
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split("T")[0])
  const [deliveryDate, setDeliveryDate] = useState("")

  // Itens da venda
  const [items, setItems] = useState<SaleItemForm[]>([])

  // Dialog de adicionar produto
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false)
  const [searchProduct, setSearchProduct] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productQuantity, setProductQuantity] = useState(1)
  const [productPrice, setProductPrice] = useState(0)
  const [productDiscount, setProductDiscount] = useState(0)

  useEffect(() => {
    loadCustomers()
    loadPaymentMethods()
  }, [])

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

    const newItem: SaleItemForm = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity: productQuantity,
      unitPrice: productPrice,
      discount: productDiscount,
      subtotal,
      total,
    }

    setItems([...items, newItem])
    
    // Resetar dialog
    setAddProductDialogOpen(false)
    setSelectedProduct(null)
    setSearchProduct("")
    setProductQuantity(1)
    setProductPrice(0)
    setProductDiscount(0)
  }

  const handleRemoveItem = (productId: string) => {
    setItems(items.filter(item => item.productId !== productId))
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    return subtotal - discount + shipping
  }

  const handleSubmit = async (asDraft: boolean) => {
    // Validações
    if (!customerId) {
      toast({
        title: "Cliente obrigatório",
        description: "Selecione um cliente para continuar.",
        variant: "destructive",
      })
      return
    }

    if (!paymentMethodId) {
      toast({
        title: "Método de pagamento obrigatório",
        description: "Selecione um método de pagamento para continuar.",
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

    try {
      setLoading(true)

      const dto: CreateSaleDto = {
        customerId,
        paymentMethodId,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
        })),
        installments,
        discount,
        shipping,
        notes: notes || undefined,
        saleDate: saleDate || undefined,
        deliveryDate: deliveryDate || undefined,
      }

      const venda = await salesApi.create(dto)

      toast({
        title: asDraft ? "Orçamento criado" : "Venda criada",
        description: `${venda.saleNumber} foi ${asDraft ? "salvo como rascunho" : "criado"} com sucesso.`,
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
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.discount)}</TableCell>
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
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="saleDate">Data da Venda</Label>
                    <Input
                      id="saleDate"
                      type="date"
                      value={saleDate}
                      onChange={(e) => setSaleDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryDate">Data de Entrega</Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Observações sobre a venda..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Lateral - Resumo */}
          <div className="space-y-6">
            {/* Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle>Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Método de Pagamento *</Label>
                  <Select 
                    value={paymentMethodId} 
                    onValueChange={setPaymentMethodId}
                    disabled={loadingPaymentMethods}
                  >
                    <SelectTrigger id="paymentMethod">
                      <SelectValue placeholder={loadingPaymentMethods ? "Carregando..." : "Selecione"} />
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
                <div className="space-y-2">
                  <Label htmlFor="installments">Parcelas</Label>
                  <Select
                    value={String(installments)}
                    onValueChange={(value) => setInstallments(Number(value))}
                    disabled={!paymentMethodId}
                  >
                    <SelectTrigger id="installments">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: maxInstallments }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={String(num)}>
                          {num}x
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Resumo */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discount">Desconto</Label>
                    <Input
                      id="discount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shipping">Frete</Label>
                    <Input
                      id="shipping"
                      type="number"
                      step="0.01"
                      min="0"
                      value={shipping}
                      onChange={(e) => setShipping(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                  {installments > 1 && (
                    <div className="mt-2 text-sm text-muted-foreground text-right">
                      {installments}x de {formatCurrency(calculateTotal() / installments)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialog Adicionar Produto */}
      <Dialog open={addProductDialogOpen} onOpenChange={setAddProductDialogOpen}>
        <DialogContent className="max-w-2xl">
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
                  placeholder="Digite o nome ou código do produto..."
                  className="pl-10"
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Nota: Integração com API de produtos pendente. Use produtos mockados.
              </p>
            </div>

            {selectedProduct && (
              <>
                <div className="rounded-lg border p-4 bg-muted/50">
                  <h4 className="font-medium mb-1">{selectedProduct.name}</h4>
                  <p className="text-sm text-muted-foreground">SKU: {selectedProduct.sku}</p>
                  <p className="text-sm text-muted-foreground">
                    Estoque: {selectedProduct.stockQuantity} unidades
                  </p>
                  <p className="text-sm font-medium mt-2">
                    Preço sugerido: {formatCurrency(selectedProduct.price)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantidade *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max={selectedProduct.stockQuantity}
                      value={productQuantity}
                      onChange={(e) => setProductQuantity(Number(e.target.value))}
                    />
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
