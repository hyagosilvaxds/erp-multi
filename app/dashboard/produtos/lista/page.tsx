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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Package, Settings, Search, Plus, MoreVertical, Edit, Trash2, Eye, AlertTriangle } from "lucide-react"
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
  type ListProductsParams,
  type ProductAvailability,
  type ProductType
} from "@/lib/api/products"

export default function ProdutosListaPage() {
  const { toast } = useToast()
  
  // Obter role do usuário da empresa selecionada
  const selectedCompany = authApi.getSelectedCompany()
  const userRole: UserRole = (selectedCompany?.role?.name as UserRole) || 'company'
  const { can } = usePermissions(userRole)
  
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Filtros e paginação
  const [filters, setFilters] = useState<ListProductsParams>({
    page: 1,
    limit: 20,
    search: '',
    sortBy: 'name',
    sortOrder: 'asc',
  })
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  })

  // Carregar dados iniciais
  useEffect(() => {
    loadProducts()
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

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return

    try {
      setDeleting(true)
      await productsApi.delete(productToDelete.id)
      toast({
        title: "Produto deletado",
        description: "O produto foi removido com sucesso",
      })
      setDeleteDialogOpen(false)
      setProductToDelete(null)
      loadProducts()
    } catch (error: any) {
      toast({
        title: "Erro ao deletar produto",
        description: error.response?.data?.message || "Tente novamente mais tarde",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
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

  const getTypeBadge = (type: ProductType) => {
    const badges = {
      SIMPLE: <Badge variant="outline">Simples</Badge>,
      COMPOSITE: <Badge variant="secondary">Composto</Badge>,
      VARIABLE: <Badge variant="default">Variação</Badge>,
      COMBO: <Badge variant="secondary">Combo</Badge>,
    }
    return badges[type]
  }

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(price))
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
            <h1 className="text-3xl font-bold tracking-tight">Lista de Produtos</h1>
            <p className="text-muted-foreground">Visualize e gerencie todos os produtos cadastrados</p>
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

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Filtre produtos por diferentes critérios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Busca */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, SKU, código de barras..."
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

              {/* Marca */}
              <Select
                value={filters.brandId || 'all'}
                onValueChange={(value) => handleFilterChange('brandId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Marca" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as marcas</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status */}
              <Select
                value={filters.active === undefined ? 'all' : filters.active ? 'true' : 'false'}
                onValueChange={(value) => handleFilterChange('active', value === 'all' ? undefined : value === 'true')}
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
                <CardTitle>Produtos</CardTitle>
                <CardDescription>
                  {pagination.total} produto{pagination.total !== 1 ? 's' : ''} encontrado{pagination.total !== 1 ? 's' : ''}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Carregando produtos...
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
                <p className="text-muted-foreground mb-6">
                  {filters.search || filters.categoryId || filters.brandId
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
                        <TableHead>SKU / Código</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Marca</TableHead>
                        <TableHead className="text-right">Preço</TableHead>
                        <TableHead className="text-center">Estoque</TableHead>
                        <TableHead>Tipo</TableHead>
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
                            <div className="text-sm">
                              {product.sku && <div>SKU: {product.sku}</div>}
                              {product.barcode && (
                                <div className="text-muted-foreground">
                                  {product.barcode}
                                </div>
                              )}
                              {!product.sku && !product.barcode && (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {product.category?.name || (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {product.brand?.name || (
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
                                <span className={isLowStock(product) ? 'text-yellow-600 font-medium' : ''}>
                                  {product.currentStock || 0} {product.unit?.abbreviation || ''}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>{getTypeBadge(product.type)}</TableCell>
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
                                    <Link href={`/dashboard/produtos/${product.id}`}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Editar
                                    </Link>
                                  </DropdownMenuItem>
                                )}
                                {can('produtos', 'delete') && (
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteClick(product)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Deletar
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
                      Página {pagination.page} de {pagination.totalPages} ({pagination.total} registros)
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

        {/* Dialog de Confirmação de Exclusão */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja deletar o produto <strong>{productToDelete?.name}</strong>?
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleting}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? 'Deletando...' : 'Deletar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
