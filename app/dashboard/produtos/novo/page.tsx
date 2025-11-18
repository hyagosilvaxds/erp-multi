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
import { Package, ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { 
  productsApi, 
  categoriesApi, 
  brandsApi,
  unitsApi,
  stockLocationsApi,
  type CreateProductRequest,
  type ProductType,
  type ProductAvailability,
  type DimensionType,
  type TipoProduto,
  type TipoItemSped,
  type InitialStockByLocation,
  type StockLocation
} from "@/lib/api/products"

export default function NovoProdutoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [units, setUnits] = useState<any[]>([])
  const [stockLocations, setStockLocations] = useState<StockLocation[]>([])
  const [initialStockByLocations, setInitialStockByLocations] = useState<InitialStockByLocation[]>([])

  const [formData, setFormData] = useState<CreateProductRequest>({
    name: '',
    description: '',
    sku: '',
    barcode: '',
    reference: '',
    salePrice: '',
    type: 'SIMPLE',
    active: true,
    availability: 'AVAILABLE',
    manageStock: true,
    tipoProduto: 'PRODUTO',
  })

  useEffect(() => {
    loadCategories()
    loadBrands()
    loadUnits()
    loadStockLocations()
  }, [])

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

  const loadStockLocations = async () => {
    try {
      const data = await stockLocationsApi.getAll()
      setStockLocations(data.filter(loc => loc.active))
    } catch (error) {
      console.error("Erro ao carregar locais de estoque:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.salePrice) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome e o preço de venda",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
        // Corrige type caso esteja como VARIATION
        const dataToSend: CreateProductRequest = {
          ...formData,
          type: formData.type === 'VARIATION' ? 'VARIABLE' : formData.type,
          // Adicionar locais de estoque inicial se houver
          initialStockByLocations: initialStockByLocations.length > 0 ? initialStockByLocations : undefined,
        }
        await productsApi.create(dataToSend)
      toast({
        title: "Produto criado",
        description: "O produto foi cadastrado com sucesso",
      })
      router.push('/dashboard/produtos/lista')
    } catch (error: any) {
      toast({
        title: "Erro ao criar produto",
        description: error.response?.data?.message || "Tente novamente mais tarde",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateProductRequest, value: any) => {
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

  const handleAddStockLocation = () => {
    if (stockLocations.length === 0) {
      toast({
        title: "Nenhum local disponível",
        description: "Cadastre locais de estoque primeiro",
        variant: "destructive",
      })
      return
    }

    const firstAvailableLocation = stockLocations.find(
      loc => !initialStockByLocations.some(stock => stock.locationId === loc.id)
    )

    if (!firstAvailableLocation) {
      toast({
        title: "Todos os locais já foram adicionados",
        description: "Não há mais locais disponíveis",
        variant: "destructive",
      })
      return
    }

    setInitialStockByLocations([
      ...initialStockByLocations,
      { locationId: firstAvailableLocation.id, quantity: 0 }
    ])
  }

  const handleRemoveStockLocation = (index: number) => {
    setInitialStockByLocations(initialStockByLocations.filter((_, i) => i !== index))
  }

  const handleStockLocationChange = (index: number, field: keyof InitialStockByLocation, value: any) => {
    const updated = [...initialStockByLocations]
    updated[index] = { ...updated[index], [field]: value }
    setInitialStockByLocations(updated)
  }

  const getTotalStock = () => {
    return initialStockByLocations.reduce((sum, stock) => sum + (stock.quantity || 0), 0)
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/produtos/lista">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Novo Produto</h1>
              <p className="text-muted-foreground">Cadastre um novo produto no sistema</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="geral" className="space-y-6">
            <TabsList>
              <TabsTrigger value="geral">Informações Gerais</TabsTrigger>
              <TabsTrigger value="precos">Preços</TabsTrigger>
              <TabsTrigger value="estoque">Estoque</TabsTrigger>
              <TabsTrigger value="dimensoes">Dimensões</TabsTrigger>
              <TabsTrigger value="fiscal">Fiscal</TabsTrigger>
            </TabsList>

            {/* ABA: Informações Gerais */}
            <TabsContent value="geral" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                  <CardDescription>Dados principais do produto</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome do Produto *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Ex: Notebook Dell Inspiron 15"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU</Label>
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) => handleInputChange('sku', e.target.value)}
                        placeholder="Ex: DELL-NB-001"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="barcode">Código de Barras</Label>
                      <Input
                        id="barcode"
                        value={formData.barcode}
                        onChange={(e) => handleInputChange('barcode', e.target.value)}
                        placeholder="Ex: 7891234567890"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reference">Referência</Label>
                      <Input
                        id="reference"
                        value={formData.reference}
                        onChange={(e) => handleInputChange('reference', e.target.value)}
                        placeholder="Ex: INS15-I7-16-512"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Descreva o produto..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="categoryId">Categoria</Label>
                      <Select
                        value={formData.categoryId || 'none'}
                        onValueChange={(value) => handleInputChange('categoryId', value === 'none' ? undefined : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
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
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
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
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhuma</SelectItem>
                          {units.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              {unit.name} ({unit.abbreviation})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Campo Tipo de Produto - Oculto, valor padrão: SIMPLE */}
                  </div>

                  <div className="flex items-center space-x-8">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="active"
                        checked={formData.active}
                        onCheckedChange={(checked) => handleInputChange('active', checked)}
                      />
                      <Label htmlFor="active">Produto Ativo</Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="availability">Disponibilidade</Label>
                      <Select
                        value={formData.availability}
                        onValueChange={(value) => handleInputChange('availability', value as ProductAvailability)}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AVAILABLE">Disponível</SelectItem>
                          <SelectItem value="OUT_OF_STOCK">Sem Estoque</SelectItem>
                          <SelectItem value="PRE_ORDER">Pré-venda</SelectItem>
                          <SelectItem value="DISCONTINUED">Descontinuado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ABA: Preços */}
            <TabsContent value="precos" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preços e Margens</CardTitle>
                  <CardDescription>Configure os valores de venda</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="costPrice">Preço de Custo</Label>
                      <Input
                        id="costPrice"
                        type="number"
                        step="0.01"
                        value={formData.costPrice}
                        onChange={(e) => handleInputChange('costPrice', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profitMargin">Margem de Lucro (%)</Label>
                      <Input
                        id="profitMargin"
                        type="number"
                        step="0.01"
                        value={formData.profitMargin}
                        onChange={(e) => handleInputChange('profitMargin', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salePrice">Preço de Venda *</Label>
                      <Input
                        id="salePrice"
                        type="number"
                        step="0.01"
                        value={formData.salePrice}
                        onChange={(e) => handleInputChange('salePrice', e.target.value)}
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salePriceCash">Preço à Vista</Label>
                      <Input
                        id="salePriceCash"
                        type="number"
                        step="0.01"
                        value={formData.salePriceCash}
                        onChange={(e) => handleInputChange('salePriceCash', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salePriceInstallment">Preço Parcelado</Label>
                      <Input
                        id="salePriceInstallment"
                        type="number"
                        step="0.01"
                        value={formData.salePriceInstallment}
                        onChange={(e) => handleInputChange('salePriceInstallment', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="minPrice">Preço Mínimo</Label>
                      <Input
                        id="minPrice"
                        type="number"
                        step="0.01"
                        value={formData.minPrice}
                        onChange={(e) => handleInputChange('minPrice', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="wholesalePrice">Preço Atacado</Label>
                      <Input
                        id="wholesalePrice"
                        type="number"
                        step="0.01"
                        value={formData.wholesalePrice}
                        onChange={(e) => handleInputChange('wholesalePrice', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="minWholesaleQty">Qtd Mínima Atacado</Label>
                      <Input
                        id="minWholesaleQty"
                        type="number"
                        value={formData.minWholesaleQty}
                        onChange={(e) => handleInputChange('minWholesaleQty', parseInt(e.target.value))}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ABA: Estoque */}
            <TabsContent value="estoque" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Controle de Estoque</CardTitle>
                  <CardDescription>Configure o gerenciamento de estoque</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Switch
                      id="manageStock"
                      checked={formData.manageStock}
                      onCheckedChange={(checked) => handleInputChange('manageStock', checked)}
                    />
                    <Label htmlFor="manageStock">Gerenciar Estoque</Label>
                  </div>

                  {formData.manageStock && (
                    <>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Estoque Inicial por Local</Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              Distribua o estoque inicial entre os locais disponíveis
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddStockLocation}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Local
                          </Button>
                        </div>

                        {initialStockByLocations.length > 0 && (
                          <div className="space-y-3">
                            {initialStockByLocations.map((stock, index) => (
                              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                                <div className="flex-1">
                                  <Label htmlFor={`location-${index}`}>Local de Estoque</Label>
                                  <Select
                                    value={stock.locationId}
                                    onValueChange={(value) => handleStockLocationChange(index, 'locationId', value)}
                                  >
                                    <SelectTrigger id={`location-${index}`}>
                                      <SelectValue placeholder="Selecione o local" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {stockLocations
                                        .filter(loc => 
                                          loc.id === stock.locationId || 
                                          !initialStockByLocations.some(s => s.locationId === loc.id)
                                        )
                                        .map((location) => (
                                          <SelectItem key={location.id} value={location.id}>
                                            {location.name}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="w-32">
                                  <Label htmlFor={`quantity-${index}`}>Quantidade</Label>
                                  <Input
                                    id={`quantity-${index}`}
                                    type="number"
                                    min="0"
                                    value={stock.quantity}
                                    onChange={(e) => handleStockLocationChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                  />
                                </div>

                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveStockLocation(index)}
                                  className="mt-6"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            ))}

                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <span className="font-medium">Estoque Total:</span>
                              <span className="text-lg font-bold">{getTotalStock()} unidades</span>
                            </div>
                          </div>
                        )}

                        {initialStockByLocations.length === 0 && (
                          <div className="text-center p-6 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">
                              Nenhum local de estoque adicionado. Clique em "Adicionar Local" para começar.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="minStock">Estoque Mínimo</Label>
                          <Input
                            id="minStock"
                            type="number"
                            value={formData.minStock}
                            onChange={(e) => handleInputChange('minStock', parseInt(e.target.value))}
                            placeholder="0"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="maxStock">Estoque Máximo</Label>
                          <Input
                            id="maxStock"
                            type="number"
                            value={formData.maxStock}
                            onChange={(e) => handleInputChange('maxStock', parseInt(e.target.value))}
                            placeholder="0"
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
                        value={formData.expiryAlertDays}
                        onChange={(e) => handleInputChange('expiryAlertDays', parseInt(e.target.value))}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="warrantyPeriod">Garantia (dias)</Label>
                      <Input
                        id="warrantyPeriod"
                        type="number"
                        value={formData.warrantyPeriod}
                        onChange={(e) => handleInputChange('warrantyPeriod', parseInt(e.target.value))}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ABA: Dimensões */}
            <TabsContent value="dimensoes" className="space-y-6">
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
                        value={formData.width}
                        onChange={(e) => handleInputChange('width', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="height">Altura (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        step="0.01"
                        value={formData.height}
                        onChange={(e) => handleInputChange('height', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="length">Comprimento (cm)</Label>
                      <Input
                        id="length"
                        type="number"
                        step="0.01"
                        value={formData.length}
                        onChange={(e) => handleInputChange('length', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weight">Peso Líquido (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.001"
                        value={formData.weight}
                        onChange={(e) => handleInputChange('weight', e.target.value)}
                        placeholder="0.000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="grossWeight">Peso Bruto (kg)</Label>
                      <Input
                        id="grossWeight"
                        type="number"
                        step="0.001"
                        value={formData.grossWeight}
                        onChange={(e) => handleInputChange('grossWeight', e.target.value)}
                        placeholder="0.000"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ABA: Fiscal */}
            <TabsContent value="fiscal" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Fiscais</CardTitle>
                  <CardDescription>Dados para emissão de notas fiscais</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ncm">NCM</Label>
                      <Input
                        id="ncm"
                        value={formData.ncm}
                        onChange={(e) => handleInputChange('ncm', e.target.value)}
                        placeholder="00000000"
                        maxLength={8}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cest">CEST</Label>
                      <Input
                        id="cest"
                        value={formData.cest}
                        onChange={(e) => handleInputChange('cest', e.target.value)}
                        placeholder="0000000"
                        maxLength={7}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="origin">Origem</Label>
                      <Select
                        value={formData.origin || 'none'}
                        onValueChange={(value) => handleInputChange('origin', value === 'none' ? undefined : value)}
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
                        onValueChange={(value) => handleInputChange('tipoProduto', value)}
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
                        onValueChange={(value) => handleInputChange('tipoItemSped', value === 'none' ? undefined : value)}
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
                          value={formData.cfopEstadual}
                          onChange={(e) => handleInputChange('cfopEstadual', e.target.value)}
                          placeholder="5102"
                          maxLength={4}
                        />
                        <p className="text-xs text-muted-foreground">Ex: 5102 - Venda dentro do estado</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cfopInterestadual">CFOP Interestadual (Saída)</Label>
                        <Input
                          id="cfopInterestadual"
                          value={formData.cfopInterestadual}
                          onChange={(e) => handleInputChange('cfopInterestadual', e.target.value)}
                          placeholder="6102"
                          maxLength={4}
                        />
                        <p className="text-xs text-muted-foreground">Ex: 6102 - Venda fora do estado</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cfopEntradaEstadual">CFOP Entrada Estadual</Label>
                        <Input
                          id="cfopEntradaEstadual"
                          value={formData.cfopEntradaEstadual}
                          onChange={(e) => handleInputChange('cfopEntradaEstadual', e.target.value)}
                          placeholder="1102"
                          maxLength={4}
                        />
                        <p className="text-xs text-muted-foreground">Ex: 1102 - Compra no estado</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cfopEntradaInterestadual">CFOP Entrada Interestadual</Label>
                        <Input
                          id="cfopEntradaInterestadual"
                          value={formData.cfopEntradaInterestadual}
                          onChange={(e) => handleInputChange('cfopEntradaInterestadual', e.target.value)}
                          placeholder="2102"
                          maxLength={4}
                        />
                        <p className="text-xs text-muted-foreground">Ex: 2102 - Compra de outro estado</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">ICMS</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="icmsCst">CST</Label>
                        <Input
                          id="icmsCst"
                          value={formData.icmsCst}
                          onChange={(e) => handleInputChange('icmsCst', e.target.value)}
                          placeholder="00"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="icmsRate">Alíquota (%)</Label>
                        <Input
                          id="icmsRate"
                          type="number"
                          step="0.01"
                          value={formData.icmsRate}
                          onChange={(e) => handleInputChange('icmsRate', e.target.value)}
                          placeholder="0.00"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="icmsModBc">Modalidade BC</Label>
                        <Input
                          id="icmsModBc"
                          value={formData.icmsModBc}
                          onChange={(e) => handleInputChange('icmsModBc', e.target.value)}
                          placeholder="3"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">IPI</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ipiCst">CST</Label>
                        <Input
                          id="ipiCst"
                          value={formData.ipiCst}
                          onChange={(e) => handleInputChange('ipiCst', e.target.value)}
                          placeholder="50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ipiRate">Alíquota (%)</Label>
                        <Input
                          id="ipiRate"
                          type="number"
                          step="0.01"
                          value={formData.ipiRate}
                          onChange={(e) => handleInputChange('ipiRate', e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">PIS</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pisCst">CST</Label>
                        <Input
                          id="pisCst"
                          value={formData.pisCst}
                          onChange={(e) => handleInputChange('pisCst', e.target.value)}
                          placeholder="01"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pisRate">Alíquota (%)</Label>
                        <Input
                          id="pisRate"
                          type="number"
                          step="0.01"
                          value={formData.pisRate}
                          onChange={(e) => handleInputChange('pisRate', e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">COFINS</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cofinsCst">CST</Label>
                        <Input
                          id="cofinsCst"
                          value={formData.cofinsCst}
                          onChange={(e) => handleInputChange('cofinsCst', e.target.value)}
                          placeholder="01"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cofinsRate">Alíquota (%)</Label>
                        <Input
                          id="cofinsRate"
                          type="number"
                          step="0.01"
                          value={formData.cofinsRate}
                          onChange={(e) => handleInputChange('cofinsRate', e.target.value)}
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
                            value={formData.codigoServico}
                            onChange={(e) => handleInputChange('codigoServico', e.target.value)}
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
                            value={formData.issRate}
                            onChange={(e) => handleInputChange('issRate', e.target.value)}
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
                            value={formData.itemListaServico}
                            onChange={(e) => handleInputChange('itemListaServico', e.target.value)}
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
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Observações e Ações */}
          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Observações adicionais sobre o produto..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-4">
            <Link href="/dashboard/produtos/lista">
              <Button type="button" variant="outline" disabled={loading}>
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Produto'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
