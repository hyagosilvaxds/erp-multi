"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Search,
  Package,
  PackageCheck,
  PackageX,
  AlertTriangle,
  TrendingUp,
  Plus,
  Minus,
  ArrowUpDown,
  RotateCcw,
  FileText,
  History,
  MapPin,
  ArrowRightLeft,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { usePermissions } from "@/hooks/use-permissions"
import { authApi } from "@/lib/api/auth"
import { type UserRole } from "@/lib/permissions"
import {
  productsApi,
  categoriesApi,
  brandsApi,
  type StockProduct,
  type StockSummary,
  type StockParams,
  type StockStatus,
  type StockMovement,
  type StockMovementType,
} from "@/lib/api/products"

export default function EstoquePage() {
  const { toast } = useToast()
  const router = useRouter()

  // Obter role do usuário
  const selectedCompany = authApi.getSelectedCompany()
  const userRole: UserRole = (selectedCompany?.role?.name as UserRole) || 'company'
  const { can } = usePermissions(userRole)

  const [products, setProducts] = useState<StockProduct[]>([])
  const [summary, setSummary] = useState<StockSummary | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filtros
  const [filters, setFilters] = useState<StockParams>({
    search: '',
  })

  // Dialog de histórico
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<StockProduct | null>(null)
  const [stockHistory, setStockHistory] = useState<StockMovement[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    loadStock()
    loadCategories()
    loadBrands()
  }, [filters])

  const loadStock = async () => {
    try {
      setLoading(true)
      const response = await productsApi.getStock(filters)
      setProducts(response.products)
      setSummary(response.summary)
    } catch (error: any) {
      toast({
        title: "Erro ao carregar estoque",
        description: error.response?.data?.message || "Tente novamente mais tarde",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getAll()
      setCategories(data)
    } catch (error) {
      console.error("Erro ao carregar categorias:", error)
    }
  }

  const loadBrands = async () => {
    try {
      const data = await brandsApi.getAll()
      setBrands(data)
    } catch (error) {
      console.error("Erro ao carregar marcas:", error)
    }
  }

  const handleSearch = (value: string) => {
    setFilters({ ...filters, search: value })
  }

  const handleFilterChange = (key: keyof StockParams, value: any) => {
    setFilters({ ...filters, [key]: value === 'all' ? undefined : value })
  }

  const handleNewMovement = (product: StockProduct, type: StockMovementType) => {
    // Redireciona para a página de nova movimentação com query params
    router.push(`/dashboard/produtos/estoque/movimentacoes/nova?productId=${product.id}&type=${type}`)
  }

  const openHistoryDialog = async (product: StockProduct) => {
    setSelectedProduct(product)
    setHistoryDialogOpen(true)
    setLoadingHistory(true)
    try {
      const history = await productsApi.getStockHistory(product.id)
      setStockHistory(history)
    } catch (error: any) {
      toast({
        title: "Erro ao carregar histórico",
        description: error.response?.data?.message || "Tente novamente mais tarde",
        variant: "destructive",
      })
    } finally {
      setLoadingHistory(false)
    }
  }

  const getStatusBadge = (status: StockStatus) => {
    const badges = {
      NORMAL: <Badge variant="default">Normal</Badge>,
      LOW_STOCK: <Badge variant="outline" className="border-orange-600 text-orange-600">Estoque Baixo</Badge>,
      OUT_OF_STOCK: <Badge variant="destructive">Sem Estoque</Badge>,
    }
    return badges[status]
  }

  const getMovementTypeBadge = (type: StockMovementType) => {
    const badges = {
      ENTRY: <Badge variant="default" className="bg-green-600">Entrada</Badge>,
      EXIT: <Badge variant="destructive">Saída</Badge>,
      ADJUSTMENT: <Badge variant="secondary">Ajuste</Badge>,
      RETURN: <Badge variant="default" className="bg-blue-600">Devolução</Badge>,
      LOSS: <Badge variant="outline" className="border-red-600 text-red-600">Perda</Badge>,
      TRANSFER: <Badge variant="outline">Transferência</Badge>,
    }
    return badges[type]
  }

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Controle de Estoque</h1>
            <p className="text-muted-foreground">
              Gerencie o estoque e movimentações de produtos
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/produtos/estoque/locais">
              <Button variant="outline">
                <MapPin className="mr-2 h-4 w-4" />
                Locais de Estoque
              </Button>
            </Link>
            <Link href="/dashboard/produtos/estoque/transferencias">
              <Button variant="outline">
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Transferências
              </Button>
            </Link>
            <Link href="/dashboard/produtos">
              <Button variant="outline">
                <Package className="mr-2 h-4 w-4" />
                Ver Produtos
              </Button>
            </Link>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.totalProducts || 0}</div>
              <p className="text-xs text-muted-foreground">Com controle de estoque</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor do Estoque</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary ? formatCurrency(summary.totalStockValue) : 'R$ 0,00'}
              </div>
              <p className="text-xs text-muted-foreground">
                Valor de venda: {summary ? formatCurrency(summary.totalSaleValue) : 'R$ 0,00'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {summary?.lowStockCount || 0}
              </div>
              <p className="text-xs text-muted-foreground">Produtos abaixo do mínimo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sem Estoque</CardTitle>
              <PackageX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {summary?.outOfStockCount || 0}
              </div>
              <p className="text-xs text-muted-foreground">Produtos zerados</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Filtre o estoque por diferentes critérios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Busca */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, SKU, código..."
                    value={filters.search || ''}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Categoria */}
              <Select
                value={filters.categoryId || 'all'}
                onValueChange={(value) => handleFilterChange('categoryId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filtros rápidos */}
              <Select
                value={
                  filters.outOfStock
                    ? 'outOfStock'
                    : filters.lowStock
                      ? 'lowStock'
                      : 'all'
                }
                onValueChange={(value) => {
                  if (value === 'lowStock') {
                    setFilters({ ...filters, lowStock: true, outOfStock: undefined })
                  } else if (value === 'outOfStock') {
                    setFilters({ ...filters, lowStock: undefined, outOfStock: true })
                  } else {
                    setFilters({ ...filters, lowStock: undefined, outOfStock: undefined })
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtro rápido" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="lowStock">Estoque Baixo</SelectItem>
                  <SelectItem value="outOfStock">Sem Estoque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Estoque */}
        <Card>
          <CardHeader>
            <CardTitle>Estoque Atual</CardTitle>
            <CardDescription>
              {products.length} produto(s) em estoque
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Carregando estoque...
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <PackageCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
                <p className="text-muted-foreground">
                  {filters.search || filters.categoryId || filters.lowStock || filters.outOfStock
                    ? 'Tente ajustar os filtros da busca'
                    : 'Não há produtos com controle de estoque'}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-center">Estoque Atual</TableHead>
                      <TableHead className="text-center">Mín / Máx</TableHead>
                      <TableHead className="text-right">Valor Estoque</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            {product.sku && (
                              <div className="text-sm text-muted-foreground">
                                SKU: {product.sku}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {product.category?.name || (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            {product.status === 'LOW_STOCK' && (
                              <AlertTriangle className="h-4 w-4 text-orange-600" />
                            )}
                            {product.status === 'OUT_OF_STOCK' && (
                              <PackageX className="h-4 w-4 text-red-600" />
                            )}
                            <span className={
                              product.status === 'LOW_STOCK' ? 'text-orange-600 font-medium' :
                              product.status === 'OUT_OF_STOCK' ? 'text-red-600 font-medium' : ''
                            }>
                              {product.currentStock} {product.unit?.abbreviation || ''}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-sm text-muted-foreground">
                          {product.minStock || '-'} / {product.maxStock || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div>
                            <div className="font-medium">
                              {formatCurrency(product.stockValue)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Venda: {formatCurrency(product.saleValue)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(product.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {can('produtos', 'edit') && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleNewMovement(product, 'ENTRY')}
                                  title="Entrada"
                                >
                                  <Plus className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleNewMovement(product, 'EXIT')}
                                  title="Saída"
                                >
                                  <Minus className="h-4 w-4 text-red-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleNewMovement(product, 'ADJUSTMENT')}
                                  title="Ajuste"
                                >
                                  <ArrowUpDown className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openHistoryDialog(product)}
                              title="Histórico"
                            >
                              <History className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog de Histórico */}
        <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Histórico de Movimentações</DialogTitle>
              <DialogDescription>
                {selectedProduct?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[500px] overflow-y-auto">
              {loadingHistory ? (
                <div className="text-center py-12 text-muted-foreground">
                  Carregando histórico...
                </div>
              ) : stockHistory.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Sem movimentações</h3>
                  <p className="text-muted-foreground">
                    Este produto ainda não possui movimentações registradas
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stockHistory.map((movement) => (
                    <Card key={movement.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getMovementTypeBadge(movement.type)}
                            <span className="text-sm font-medium">
                              {movement.quantity} {selectedProduct?.unit?.abbreviation}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(movement.createdAt)}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Estoque:</span>
                          <span>
                            {movement.previousStock} → <strong>{movement.newStock}</strong>
                          </span>
                        </div>
                        {movement.reason && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Motivo:</span>{' '}
                            {movement.reason}
                          </div>
                        )}
                        {movement.reference && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Referência:</span>{' '}
                            {movement.reference}
                          </div>
                        )}
                        {movement.notes && (
                          <div className="text-sm text-muted-foreground italic">
                            {movement.notes}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (selectedProduct) {
                    router.push(`/dashboard/produtos/estoque/movimentacoes/${selectedProduct.id}`)
                  }
                }}
              >
                Ver Histórico Completo
              </Button>
              <Button onClick={() => setHistoryDialogOpen(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
