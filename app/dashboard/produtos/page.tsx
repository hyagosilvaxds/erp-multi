"use client"

import { useState, useEffect } from "react"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Plus,
  MoreVertical,
  Package,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Settings,
  PackageOpen,
  PackageCheck,
  PackageX,
  DollarSign,
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
  type Product,
  type ProductStats,
  type ListProductsParams,
  type ProductAvailability,
} from "@/lib/api/products"

export default function ProdutosPage() {
  const { toast } = useToast()

  // Obter role do usuário
  const selectedCompany = authApi.getSelectedCompany()
  const userRole: UserRole = (selectedCompany?.role?.name as UserRole) || 'company'
  const { can } = usePermissions(userRole)

  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<ProductStats | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)

  // Filtros
  const [filters, setFilters] = useState<ListProductsParams>({
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'name',
    sortOrder: 'asc',
  })

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })

  useEffect(() => {
    loadProducts()
    loadStats()
    loadCategories()
    loadBrands()
  }, [filters])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const response = await productsApi.getAll(filters)
      setProducts(response.products)
      setPagination({
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      })
    } catch (error: any) {
      toast({
        title: "Erro ao carregar produtos",
        description: error.response?.data?.message || "Tente novamente mais tarde",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      setStatsLoading(true)
      const data = await productsApi.getStats()
      setStats(data)
    } catch (error: any) {
      console.error("Erro ao carregar estatísticas:", error)
    } finally {
      setStatsLoading(false)
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
    setFilters({ ...filters, search: value, page: 1 })
  }

  const handleFilterChange = (key: keyof ListProductsParams, value: any) => {
    setFilters({ ...filters, [key]: value === 'all' ? undefined : value, page: 1 })
  }

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage })
  }

  const getAvailabilityBadge = (availability: ProductAvailability) => {
    const badges = {
      AVAILABLE: <Badge variant="default">Disponível</Badge>,
      OUT_OF_STOCK: <Badge variant="destructive">Sem Estoque</Badge>,
      PRE_ORDER: <Badge variant="secondary">Pré-venda</Badge>,
      DISCONTINUED: <Badge variant="outline">Descontinuado</Badge>,
    }
    return badges[availability]
  }

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(price))
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const isLowStock = (product: Product) => {
    if (!product.manageStock || !product.minStock) return false
    return (product.currentStock || 0) <= product.minStock
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
            <p className="text-muted-foreground">Gerencie seu catálogo de produtos e estoque</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/produtos/configuracoes">
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </Button>
            </Link>
            {can('produtos', 'create') && (
              <Link href="/dashboard/produtos/novo">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Produto
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-2xl font-bold">...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.activeProducts || 0} ativos
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor em Estoque</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-2xl font-bold">...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {formatCurrency(stats?.totalStockValue || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Valor total do inventário</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorias</CardTitle>
              <PackageCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-2xl font-bold">...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.productsByCategory || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.productsByBrand || 0} marcas
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-2xl font-bold">...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-orange-600">
                    {stats?.lowStockProducts || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Produtos abaixo do mínimo</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sem Estoque</CardTitle>
              <PackageX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-2xl font-bold">...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-red-600">
                    {stats?.outOfStockProducts || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Produtos zerados</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Filtre produtos por diferentes critérios</CardDescription>
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

              {/* Status */}
              <Select
                value={filters.active === undefined ? 'all' : filters.active ? 'true' : 'false'}
                onValueChange={(value) =>
                  handleFilterChange('active', value === 'all' ? undefined : value === 'true')
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">Ativos</SelectItem>
                  <SelectItem value="false">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Produtos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Produtos Recentes</CardTitle>
                <CardDescription>
                  Exibindo {products.length} de {pagination.total} produto(s)
                </CardDescription>
              </div>
              <Link href="/dashboard/produtos/lista">
                <Button variant="outline" size="sm">
                  Ver Todos
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Carregando produtos...
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <PackageOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
                <p className="text-muted-foreground mb-6">
                  {filters.search || filters.categoryId
                    ? 'Tente ajustar os filtros da busca'
                    : 'Comece cadastrando seu primeiro produto'}
                </p>
                {can('produtos', 'create') && (
                  <Link href="/dashboard/produtos/novo">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Produto
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-right">Preço</TableHead>
                        <TableHead className="text-center">Estoque</TableHead>
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
                              {product.reference && (
                                <div className="text-sm text-muted-foreground">
                                  Ref: {product.reference}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {product.sku || <span className="text-muted-foreground">-</span>}
                          </TableCell>
                          <TableCell>
                            {product.category?.name || (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatPrice(product.salePrice)}
                          </TableCell>
                          <TableCell className="text-center">
                            {product.manageStock ? (
                              <div className="flex items-center justify-center gap-1">
                                {isLowStock(product) && (
                                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                )}
                                <span
                                  className={
                                    isLowStock(product) ? 'text-yellow-600 font-medium' : ''
                                  }
                                >
                                  {product.currentStock || 0} {product.unit?.abbreviation || ''}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {getAvailabilityBadge(product.availability)}
                              {!product.active && (
                                <Badge variant="outline" className="text-xs">
                                  Inativo
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/produtos/${product.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Ver Detalhes
                                  </Link>
                                </DropdownMenuItem>
                                {can('produtos', 'edit') && (
                                  <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/produtos/${product.id}/editar`}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Editar
                                    </Link>
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginação */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Página {pagination.page} de {pagination.totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                      >
                        Próxima
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

