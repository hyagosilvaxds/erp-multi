"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { usePermissions } from "@/hooks/use-permissions"
import { authApi } from "@/lib/api/auth"
import { type UserRole } from "@/lib/permissions"
import {
  productsApi,
  categoriesApi,
  brandsApi,
  unitsApi,
  type Product,
  type UpdateProductRequest,
  type ProductType,
  type ProductAvailability,
  type DimensionType,
  type TipoProduto,
  type TipoItemSped,
} from "@/lib/api/products"
import { ProductPhotos } from "@/components/products/product-photos"

interface EditProductPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const router = useRouter()
  const { toast } = useToast()

  const selectedCompany = authApi.getSelectedCompany()
  const userRole: UserRole = (selectedCompany?.role?.name as UserRole) || 'company'
  const { can } = usePermissions(userRole)

  const [productId, setProductId] = useState<string>('')
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [units, setUnits] = useState<any[]>([])
  const [formData, setFormData] = useState<UpdateProductRequest>({})

  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await params
      setProductId(resolvedParams.id)
    }
    initializeParams()
  }, [params])

  useEffect(() => {
    if (productId) {
      loadProduct()
      loadCategories()
      loadBrands()
      loadUnits()
    }
  }, [productId])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const data = await productsApi.getById(productId)
      setProduct(data)
      
      console.log('📦 Produto carregado:', data)
      console.log('🔍 Type do produto:', data.type)
      console.log('🔍 ProductType do produto:', data.productType)
      
      // Inicializar formData com dados do produto
      setFormData({
        name: data.name,
        description: data.description,
        sku: data.sku,
        barcode: data.barcode,
        reference: data.reference,
        categoryId: data.categoryId,
        brandId: data.brandId,
        unitId: data.unitId,
        // Preços
        costPrice: data.costPrice,
        profitMargin: data.profitMargin,
        salePrice: data.salePrice,
        salePriceCash: data.salePriceCash,
        salePriceInstallment: data.salePriceInstallment,
        minPrice: data.minPrice,
        wholesalePrice: data.wholesalePrice,
        minWholesaleQty: data.minWholesaleQty,
        // Estoque
        manageStock: data.manageStock,
        minStock: data.minStock,
        maxStock: data.maxStock,
        expiryAlertDays: data.expiryAlertDays,
        warrantyPeriod: data.warrantyPeriod,
        // Dimensões e Peso
        dimensionType: data.dimensionType,
        width: data.width,
        height: data.height,
        length: data.length,
        weight: data.weight,
        grossWeight: data.grossWeight,
        // Geral
        type: data.type || data.productType, // Usar productType se type não existir
        active: data.active,
        availability: data.availability,
        notes: data.notes,
        // Fiscal
        tipoProduto: data.tipoProduto,
        ncm: data.ncm,
        cest: data.cest,
        origin: data.origin,
        cfopEstadual: data.cfopEstadual,
        cfopInterestadual: data.cfopInterestadual,
        cfopEntradaEstadual: data.cfopEntradaEstadual,
        cfopEntradaInterestadual: data.cfopEntradaInterestadual,
        tipoItemSped: data.tipoItemSped,
        icmsCst: data.icmsCst,
        icmsRate: data.icmsRate,
        icmsModBc: data.icmsModBc,
        ipiCst: data.ipiCst,
        ipiRate: data.ipiRate,
        pisCst: data.pisCst,
        pisRate: data.pisRate,
        cofinsCst: data.cofinsCst,
        cofinsRate: data.cofinsRate,
        codigoServico: data.codigoServico,
        issRate: data.issRate,
        itemListaServico: data.itemListaServico,
      })
    } catch (error: any) {
      toast({
        title: "Erro ao carregar produto",
        description: error.response?.data?.message || "Tente novamente mais tarde",
        variant: "destructive",
      })
      router.push("/dashboard/produtos/lista")
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

  const loadUnits = async () => {
    try {
      const data = await unitsApi.getAll()
      setUnits(data)
    } catch (error) {
      console.error("Erro ao carregar unidades:", error)
    }
  }

  const handleInputChange = (field: keyof UpdateProductRequest, value: any) => {
    const newFormData = { ...formData, [field]: value }

    // Cálculo automático de preços
    if (field === 'costPrice' || field === 'profitMargin' || field === 'salePrice') {
      const costPrice = parseFloat(field === 'costPrice' ? value : (formData.costPrice || '0'))
      const profitMargin = parseFloat(field === 'profitMargin' ? value : (formData.profitMargin || '0'))
      const salePrice = parseFloat(field === 'salePrice' ? value : (formData.salePrice || '0'))

      // Se preencheu custo e margem, calcular preço de venda
      if ((field === 'costPrice' || field === 'profitMargin') && profitMargin > 0) {
        if (costPrice > 0) {
          const calculatedSalePrice = costPrice * (1 + profitMargin / 100)
          newFormData.salePrice = calculatedSalePrice.toFixed(2)
        }
      }

      // Se preencheu preço de venda (e não está vazio), calcular margem
      if (field === 'salePrice' && value && parseFloat(value) > 0) {
        if (costPrice > 0) {
          const calculatedMargin = ((parseFloat(value) - costPrice) / costPrice) * 100
          newFormData.profitMargin = calculatedMargin.toFixed(2)
        }
      }

      // Se alterou o custo e já tem preço de venda definido, recalcular margem
      if (field === 'costPrice' && formData.salePrice && parseFloat(formData.salePrice) > 0) {
        if (costPrice > 0) {
          const calculatedMargin = ((parseFloat(formData.salePrice) - costPrice) / costPrice) * 100
          newFormData.profitMargin = calculatedMargin.toFixed(2)
        }
      }
    }

    setFormData(newFormData)
  }

  const handleSave = async () => {
    if (!product) return

    try {
      setSaving(true)
      
      const updatedProduct = await productsApi.update(product.id, formData)
      setProduct(updatedProduct)
      
      toast({
        title: "Produto atualizado",
        description: "As alterações foram salvas com sucesso",
      })
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar produto",
        description: error.response?.data?.message || "Tente novamente mais tarde",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePhotosChange = () => {
    loadProduct()
  }

  if (loading) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="space-y-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando produto...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!product) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="space-y-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Produto não encontrado</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const canEdit = can('produtos', 'edit')

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/produtos/lista">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {product.name}
              </h1>
              <p className="text-muted-foreground">
                {product.sku && `SKU: ${product.sku}`}
              </p>
            </div>
          </div>
          {canEdit && (
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="photos" className="space-y-6">
          <TabsList>
            <TabsTrigger value="photos">Fotos</TabsTrigger>
            <TabsTrigger value="general">Informações Gerais</TabsTrigger>
            <TabsTrigger value="prices">Preços</TabsTrigger>
            <TabsTrigger value="stock">Estoque</TabsTrigger>
            <TabsTrigger value="dimensions">Dimensões</TabsTrigger>
            <TabsTrigger value="fiscal">Fiscal</TabsTrigger>
          </TabsList>

          {/* Tab de Fotos */}
          <TabsContent value="photos">
            <ProductPhotos
              productId={product.id}
              photos={product.photos || []}
              onPhotosChange={handlePhotosChange}
              canEdit={canEdit}
            />
          </TabsContent>

          {/* Tab de Informações Gerais */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>Dados principais do produto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!canEdit}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU / Código</Label>
                    <Input
                      id="sku"
                      value={formData.sku || ''}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      disabled={!canEdit}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barcode">Código de Barras</Label>
                    <Input
                      id="barcode"
                      value={formData.barcode || ''}
                      onChange={(e) => handleInputChange('barcode', e.target.value)}
                      disabled={!canEdit}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reference">Referência</Label>
                    <Input
                      id="reference"
                      value={formData.reference || ''}
                      onChange={(e) => handleInputChange('reference', e.target.value)}
                      disabled={!canEdit}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    disabled={!canEdit}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Categoria</Label>
                    <Select
                      value={formData.categoryId || 'none'}
                      onValueChange={(value) => handleInputChange('categoryId', value === 'none' ? undefined : value)}
                      disabled={!canEdit}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brandId">Marca</Label>
                    <Select
                      value={formData.brandId || 'none'}
                      onValueChange={(value) => handleInputChange('brandId', value === 'none' ? undefined : value)}
                      disabled={!canEdit}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unitId">Unidade</Label>
                    <Select
                      value={formData.unitId || 'none'}
                      onValueChange={(value) => handleInputChange('unitId', value === 'none' ? undefined : value)}
                      disabled={!canEdit}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        {units.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Campo Tipo de Produto - Oculto */}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={formData.active || false}
                      onCheckedChange={(checked) => handleInputChange('active', checked)}
                      disabled={!canEdit}
                    />
                    <Label htmlFor="active">Produto Ativo</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availability">Disponibilidade</Label>
                    <Select
                      value={formData.availability}
                      onValueChange={(value) => handleInputChange('availability', value as ProductAvailability)}
                      disabled={!canEdit}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AVAILABLE">Disponível</SelectItem>
                        <SelectItem value="OUT_OF_STOCK">Fora de Estoque</SelectItem>
                        <SelectItem value="PRE_ORDER">Pré-venda</SelectItem>
                        <SelectItem value="DISCONTINUED">Descontinuado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Preços */}
          <TabsContent value="prices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preços e Margens</CardTitle>
                <CardDescription>Configure os preços de venda e margens</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="costPrice">Preço de Custo</Label>
                    <Input
                      id="costPrice"
                      type="number"
                      step="0.01"
                      value={formData.costPrice || ''}
                      onChange={(e) => handleInputChange('costPrice', e.target.value)}
                      disabled={!canEdit}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profitMargin">Margem de Lucro (%)</Label>
                    <Input
                      id="profitMargin"
                      type="number"
                      step="0.01"
                      value={formData.profitMargin || ''}
                      onChange={(e) => handleInputChange('profitMargin', e.target.value)}
                      disabled={!canEdit}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salePrice">Preço de Venda *</Label>
                    <Input
                      id="salePrice"
                      type="number"
                      step="0.01"
                      value={formData.salePrice || ''}
                      onChange={(e) => handleInputChange('salePrice', e.target.value)}
                      disabled={!canEdit}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salePriceCash">Preço à Vista</Label>
                    <Input
                      id="salePriceCash"
                      type="number"
                      step="0.01"
                      value={formData.salePriceCash || ''}
                      onChange={(e) => handleInputChange('salePriceCash', e.target.value)}
                      disabled={!canEdit}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salePriceInstallment">Preço Parcelado</Label>
                    <Input
                      id="salePriceInstallment"
                      type="number"
                      step="0.01"
                      value={formData.salePriceInstallment || ''}
                      onChange={(e) => handleInputChange('salePriceInstallment', e.target.value)}
                      disabled={!canEdit}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minPrice">Preço Mínimo</Label>
                    <Input
                      id="minPrice"
                      type="number"
                      step="0.01"
                      value={formData.minPrice || ''}
                      onChange={(e) => handleInputChange('minPrice', e.target.value)}
                      disabled={!canEdit}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="wholesalePrice">Preço Atacado</Label>
                    <Input
                      id="wholesalePrice"
                      type="number"
                      step="0.01"
                      value={formData.wholesalePrice || ''}
                      onChange={(e) => handleInputChange('wholesalePrice', e.target.value)}
                      disabled={!canEdit}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minWholesaleQty">Qtd. Mínima Atacado</Label>
                    <Input
                      id="minWholesaleQty"
                      type="number"
                      value={formData.minWholesaleQty || ''}
                      onChange={(e) => handleInputChange('minWholesaleQty', parseInt(e.target.value))}
                      disabled={!canEdit}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Estoque */}
          <TabsContent value="stock" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Controle de Estoque</CardTitle>
                <CardDescription>Gerencie o estoque do produto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="manageStock"
                    checked={formData.manageStock || false}
                    onCheckedChange={(checked) => handleInputChange('manageStock', checked)}
                    disabled={!canEdit}
                  />
                  <Label htmlFor="manageStock">Controlar Estoque</Label>
                </div>

                {formData.manageStock && (
                  <>
                    {/* Resumo do Estoque Total */}
                    {product.stockSummary && (
                      <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">Resumo do Estoque</h4>
                          <div className="text-2xl font-bold">
                            {product.stockSummary.totalStock}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Total de Locais</p>
                            <p className="font-medium">{product.stockSummary.locationsCount}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Com Estoque</p>
                            <p className="font-medium text-green-600">{product.stockSummary.locationsWithStock}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Sem Estoque</p>
                            <p className="font-medium text-orange-600">{product.stockSummary.locationsOutOfStock}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Estoque por Localização */}
                    {product.stocksByLocation && product.stocksByLocation.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Estoque por Localização</h4>
                        <div className="space-y-2">
                          {product.stocksByLocation.map((stock) => (
                            <div
                              key={stock.id}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{stock.location.name}</span>
                                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                    {stock.location.code}
                                  </span>
                                  {stock.location.isDefault && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                      Padrão
                                    </span>
                                  )}
                                  {!stock.location.active && (
                                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                                      Inativo
                                    </span>
                                  )}
                                </div>
                                {stock.location.address && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {stock.location.address}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  Atualizado em: {new Date(stock.updatedAt).toLocaleString('pt-BR')}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold">
                                  {parseFloat(stock.quantity).toLocaleString('pt-BR')}
                                </div>
                                <p className="text-xs text-muted-foreground">unidades</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Estoque Total</Label>
                        <Input
                          value={product.stockSummary?.totalStock || product.currentStock || 0}
                          disabled
                          className="bg-muted font-semibold"
                        />
                        <p className="text-xs text-muted-foreground">
                          Soma de todos os locais de estoque
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="minStock">Estoque Mínimo</Label>
                        <Input
                          id="minStock"
                          type="number"
                          value={formData.minStock || ''}
                          onChange={(e) => handleInputChange('minStock', parseInt(e.target.value))}
                          disabled={!canEdit}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="maxStock">Estoque Máximo</Label>
                        <Input
                          id="maxStock"
                          type="number"
                          value={formData.maxStock || ''}
                          onChange={(e) => handleInputChange('maxStock', parseInt(e.target.value))}
                          disabled={!canEdit}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryAlertDays">Alerta de Validade (dias)</Label>
                    <Input
                      id="expiryAlertDays"
                      type="number"
                      value={formData.expiryAlertDays || ''}
                      onChange={(e) => handleInputChange('expiryAlertDays', parseInt(e.target.value))}
                      disabled={!canEdit}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="warrantyPeriod">Garantia (dias)</Label>
                    <Input
                      id="warrantyPeriod"
                      type="number"
                      value={formData.warrantyPeriod || ''}
                      onChange={(e) => handleInputChange('warrantyPeriod', parseInt(e.target.value))}
                      disabled={!canEdit}
                      placeholder="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Dimensões */}
          <TabsContent value="dimensions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dimensões e Peso</CardTitle>
                <CardDescription>Informações para transporte e logística</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dimensionType">Tipo de Dimensão</Label>
                  <Select
                    value={formData.dimensionType || 'STANDARD'}
                    onValueChange={(value) => handleInputChange('dimensionType', value as DimensionType)}
                    disabled={!canEdit}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STANDARD">Padrão</SelectItem>
                      <SelectItem value="DETAILED">Detalhado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="width">Largura (cm)</Label>
                    <Input
                      id="width"
                      type="number"
                      step="0.01"
                      value={formData.width || ''}
                      onChange={(e) => handleInputChange('width', e.target.value)}
                      disabled={!canEdit}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">Altura (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.01"
                      value={formData.height || ''}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                      disabled={!canEdit}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="length">Comprimento (cm)</Label>
                    <Input
                      id="length"
                      type="number"
                      step="0.01"
                      value={formData.length || ''}
                      onChange={(e) => handleInputChange('length', e.target.value)}
                      disabled={!canEdit}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso Líquido (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.001"
                      value={formData.weight || ''}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      disabled={!canEdit}
                      placeholder="0.000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grossWeight">Peso Bruto (kg)</Label>
                    <Input
                      id="grossWeight"
                      type="number"
                      step="0.001"
                      value={formData.grossWeight || ''}
                      onChange={(e) => handleInputChange('grossWeight', e.target.value)}
                      disabled={!canEdit}
                      placeholder="0.000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Fiscal */}
          <TabsContent value="fiscal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Fiscais</CardTitle>
                <CardDescription>Dados para emissão de notas fiscais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* NCM, CEST e Origem */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ncm">NCM</Label>
                    <Input
                      id="ncm"
                      value={formData.ncm || ''}
                      onChange={(e) => handleInputChange('ncm', e.target.value)}
                      disabled={!canEdit}
                      placeholder="00000000"
                      maxLength={8}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cest">CEST</Label>
                    <Input
                      id="cest"
                      value={formData.cest || ''}
                      onChange={(e) => handleInputChange('cest', e.target.value)}
                      disabled={!canEdit}
                      placeholder="0000000"
                      maxLength={7}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="origin">Origem</Label>
                    <Select
                      value={formData.origin || 'none'}
                      onValueChange={(value) => handleInputChange('origin', value === 'none' ? undefined : value)}
                      disabled={!canEdit}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Não informado</SelectItem>
                        <SelectItem value="0">0 - Nacional</SelectItem>
                        <SelectItem value="1">1 - Estrangeira (Importação direta)</SelectItem>
                        <SelectItem value="2">2 - Estrangeira (Mercado interno)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Tipo do Produto e Item SPED */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipoProduto">Tipo do Produto</Label>
                    <Select
                      value={formData.tipoProduto || 'PRODUTO'}
                      onValueChange={(value) => handleInputChange('tipoProduto', value as TipoProduto)}
                      disabled={!canEdit}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PRODUTO">Produto (ICMS)</SelectItem>
                        <SelectItem value="SERVICO">Serviço (ISS)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipoItemSped">Tipo do Item SPED</Label>
                    <Select
                      value={formData.tipoItemSped || 'none'}
                      onValueChange={(value) => handleInputChange('tipoItemSped', value === 'none' ? undefined : (value as TipoItemSped))}
                      disabled={!canEdit}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Não informado</SelectItem>
                        <SelectItem value="00">00 - Mercadoria para Revenda</SelectItem>
                        <SelectItem value="01">01 - Matéria-Prima</SelectItem>
                        <SelectItem value="02">02 - Embalagem</SelectItem>
                        <SelectItem value="03">03 - Produto em Processo</SelectItem>
                        <SelectItem value="04">04 - Produto Acabado</SelectItem>
                        <SelectItem value="05">05 - Subproduto</SelectItem>
                        <SelectItem value="06">06 - Produto Intermediário</SelectItem>
                        <SelectItem value="07">07 - Material de Uso e Consumo</SelectItem>
                        <SelectItem value="08">08 - Ativo Imobilizado</SelectItem>
                        <SelectItem value="09">09 - Serviços</SelectItem>
                        <SelectItem value="10">10 - Outros Insumos</SelectItem>
                        <SelectItem value="99">99 - Outras</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* CFOP */}
                <div className="space-y-4 mt-6">
                  <h4 className="font-semibold">CFOP - Código Fiscal de Operações e Prestações</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cfopEstadual">CFOP Estadual (Saída)</Label>
                      <Input
                        id="cfopEstadual"
                        value={formData.cfopEstadual || ''}
                        onChange={(e) => handleInputChange('cfopEstadual', e.target.value)}
                        disabled={!canEdit}
                        placeholder="5102"
                        maxLength={4}
                      />
                      <p className="text-xs text-muted-foreground">Ex: 5102 - Venda no estado</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cfopInterestadual">CFOP Interestadual (Saída)</Label>
                      <Input
                        id="cfopInterestadual"
                        value={formData.cfopInterestadual || ''}
                        onChange={(e) => handleInputChange('cfopInterestadual', e.target.value)}
                        disabled={!canEdit}
                        placeholder="6102"
                        maxLength={4}
                      />
                      <p className="text-xs text-muted-foreground">Ex: 6102 - Venda fora do estado</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cfopEntradaEstadual">CFOP Entrada Estadual</Label>
                      <Input
                        id="cfopEntradaEstadual"
                        value={formData.cfopEntradaEstadual || ''}
                        onChange={(e) => handleInputChange('cfopEntradaEstadual', e.target.value)}
                        disabled={!canEdit}
                        placeholder="1102"
                        maxLength={4}
                      />
                      <p className="text-xs text-muted-foreground">Ex: 1102 - Compra no estado</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cfopEntradaInterestadual">CFOP Entrada Interestadual</Label>
                      <Input
                        id="cfopEntradaInterestadual"
                        value={formData.cfopEntradaInterestadual || ''}
                        onChange={(e) => handleInputChange('cfopEntradaInterestadual', e.target.value)}
                        disabled={!canEdit}
                        placeholder="2102"
                        maxLength={4}
                      />
                      <p className="text-xs text-muted-foreground">Ex: 2102 - Compra de outro estado</p>
                    </div>
                  </div>
                </div>

                {/* ICMS */}
                <div className="space-y-4">
                  <h4 className="font-semibold">ICMS</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="icmsCst">CST</Label>
                      <Input
                        id="icmsCst"
                        value={formData.icmsCst || ''}
                        onChange={(e) => handleInputChange('icmsCst', e.target.value)}
                        disabled={!canEdit}
                        placeholder="00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="icmsRate">Alíquota (%)</Label>
                      <Input
                        id="icmsRate"
                        type="number"
                        step="0.01"
                        value={formData.icmsRate || ''}
                        onChange={(e) => handleInputChange('icmsRate', e.target.value)}
                        disabled={!canEdit}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="icmsModBc">Modalidade BC</Label>
                      <Input
                        id="icmsModBc"
                        value={formData.icmsModBc || ''}
                        onChange={(e) => handleInputChange('icmsModBc', e.target.value)}
                        disabled={!canEdit}
                        placeholder="3"
                      />
                    </div>
                  </div>
                </div>

                {/* IPI */}
                <div className="space-y-4">
                  <h4 className="font-semibold">IPI</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ipiCst">CST</Label>
                      <Input
                        id="ipiCst"
                        value={formData.ipiCst || ''}
                        onChange={(e) => handleInputChange('ipiCst', e.target.value)}
                        disabled={!canEdit}
                        placeholder="50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ipiRate">Alíquota (%)</Label>
                      <Input
                        id="ipiRate"
                        type="number"
                        step="0.01"
                        value={formData.ipiRate || ''}
                        onChange={(e) => handleInputChange('ipiRate', e.target.value)}
                        disabled={!canEdit}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* PIS */}
                <div className="space-y-4">
                  <h4 className="font-semibold">PIS</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pisCst">CST</Label>
                      <Input
                        id="pisCst"
                        value={formData.pisCst || ''}
                        onChange={(e) => handleInputChange('pisCst', e.target.value)}
                        disabled={!canEdit}
                        placeholder="01"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pisRate">Alíquota (%)</Label>
                      <Input
                        id="pisRate"
                        type="number"
                        step="0.01"
                        value={formData.pisRate || ''}
                        onChange={(e) => handleInputChange('pisRate', e.target.value)}
                        disabled={!canEdit}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* COFINS */}
                <div className="space-y-4">
                  <h4 className="font-semibold">COFINS</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cofinsCst">CST</Label>
                      <Input
                        id="cofinsCst"
                        value={formData.cofinsCst || ''}
                        onChange={(e) => handleInputChange('cofinsCst', e.target.value)}
                        disabled={!canEdit}
                        placeholder="01"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cofinsRate">Alíquota (%)</Label>
                      <Input
                        id="cofinsRate"
                        type="number"
                        step="0.01"
                        value={formData.cofinsRate || ''}
                        onChange={(e) => handleInputChange('cofinsRate', e.target.value)}
                        disabled={!canEdit}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* ISS - Apenas para Serviços */}
                {formData.tipoProduto === 'SERVICO' && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-semibold">ISS - Imposto Sobre Serviços</h4>
                    <p className="text-sm text-muted-foreground">
                      Campos aplicáveis apenas para produtos do tipo "Serviço"
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="codigoServico">Código do Serviço</Label>
                        <Input
                          id="codigoServico"
                          value={formData.codigoServico || ''}
                          onChange={(e) => handleInputChange('codigoServico', e.target.value)}
                          disabled={!canEdit}
                          placeholder="01.01"
                          maxLength={20}
                        />
                        <p className="text-xs text-muted-foreground">
                          Ex: 01.01 - Análise e desenvolvimento de sistemas
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="issRate">Alíquota ISS (%)</Label>
                        <Input
                          id="issRate"
                          type="number"
                          step="0.01"
                          value={formData.issRate || ''}
                          onChange={(e) => handleInputChange('issRate', e.target.value)}
                          disabled={!canEdit}
                          placeholder="0.00"
                        />
                        <p className="text-xs text-muted-foreground">
                          Varia de 2% a 5% conforme município
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="itemListaServico">Item da Lista LC 116/2003</Label>
                        <Input
                          id="itemListaServico"
                          value={formData.itemListaServico || ''}
                          onChange={(e) => handleInputChange('itemListaServico', e.target.value)}
                          disabled={!canEdit}
                          placeholder="1.01"
                          maxLength={20}
                        />
                        <p className="text-xs text-muted-foreground">
                          Conforme Lei Complementar 116/2003
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ''}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    disabled={!canEdit}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
