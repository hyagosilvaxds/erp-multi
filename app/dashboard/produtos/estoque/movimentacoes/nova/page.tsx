'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Upload, FileText, Plus } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import {
  stockLocationsApi,
  productsApi,
  type StockLocation,
  type Product,
  type StockMovementType,
  type CreateStockMovementRequest,
} from '@/lib/api/products'
import { documentsApi, type Document } from '@/lib/api/documents'

const movementTypes: { value: StockMovementType; label: string; description: string }[] = [
  {
    value: 'ENTRY',
    label: 'Entrada',
    description: 'Aumenta o estoque (ex: compra, produção)',
  },
  {
    value: 'EXIT',
    label: 'Saída',
    description: 'Diminui o estoque (ex: venda, consumo)',
  },
  {
    value: 'ADJUSTMENT',
    label: 'Ajuste',
    description: 'Ajusta o estoque (ex: inventário, correção)',
  },
  {
    value: 'RETURN',
    label: 'Devolução',
    description: 'Devolução de produto (pode aumentar ou diminuir)',
  },
  {
    value: 'LOSS',
    label: 'Perda',
    description: 'Diminui o estoque por perda (ex: vencimento, quebra)',
  },
]

export default function NewStockMovementPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [locations, setLocations] = useState<StockLocation[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Form data
  const [productId, setProductId] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [type, setType] = useState<StockMovementType>('ENTRY')
  const [quantity, setQuantity] = useState<number>(1)
  const [locationId, setLocationId] = useState('')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [reference, setReference] = useState('')
  const [documentId, setDocumentId] = useState<string | undefined>()
  const [uploadedDocument, setUploadedDocument] = useState<Document | null>(null)

  useEffect(() => {
    loadData()
    
    // Preencher dados a partir dos parâmetros da URL
    const urlProductId = searchParams.get('productId')
    const urlType = searchParams.get('type') as StockMovementType | null
    
    if (urlProductId) {
      setProductId(urlProductId)
    }
    
    if (urlType && ['ENTRY', 'EXIT', 'ADJUSTMENT', 'RETURN', 'LOSS', 'TRANSFER'].includes(urlType)) {
      setType(urlType)
    }
  }, [searchParams])

  // Selecionar produto quando os produtos estiverem carregados e houver um productId da URL
  useEffect(() => {
    if (productId && products.length > 0) {
      const product = products.find((p) => p.id === productId)
      if (product) {
        setSelectedProduct(product)
        // Se houver apenas um local com estoque, seleciona automaticamente
        if (product.stocksByLocation && product.stocksByLocation.length === 1) {
          setLocationId(product.stocksByLocation[0].locationId)
        }
      }
    }
  }, [productId, products])

  const loadData = async () => {
    try {
      setLoading(true)
      const [locationsData, productsData] = await Promise.all([
        stockLocationsApi.getAll(),
        productsApi.getAll({}),
      ])
      setLocations(locationsData.filter((l) => l.active))
      // Filtrar apenas produtos que gerenciam estoque
      setProducts(productsData.products.filter((p) => p.manageStock))
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar dados',
        description: error.response?.data?.message || 'Não foi possível carregar os dados.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProductChange = (value: string) => {
    setProductId(value)
    const product = products.find((p) => p.id === value)
    setSelectedProduct(product || null)

    // Busca estoque atual do produto
    if (product && product.stocksByLocation) {
      // Se houver apenas um local com estoque, seleciona automaticamente
      if (product.stocksByLocation.length === 1) {
        setLocationId(product.stocksByLocation[0].locationId)
      }
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)

      // Determinar o tipo de documento baseado no tipo de movimentação
      const documentTypeMap: Record<StockMovementType, string> = {
        ENTRY: 'nota_fiscal_entrada',
        EXIT: 'nota_fiscal_saida',
        ADJUSTMENT: 'termo_ajuste',
        RETURN: 'nota_devolucao',
        LOSS: 'laudo_perda',
        TRANSFER: 'guia_transferencia',
      }

      const result = await documentsApi.upload({
        file,
        title: `Movimentação ${movementTypes.find(m => m.value === type)?.label} - ${file.name}`,
        type: documentTypeMap[type],
        tags: 'movimentacao,estoque',
        context: 'stock_movement',
      })

      // Buscar documento completo
      const fullDocument = await documentsApi.getById(result.id)
      
      setDocumentId(result.id)
      setUploadedDocument(fullDocument)

      toast({
        title: 'Documento anexado',
        description: 'Documento enviado e organizado automaticamente.',
      })
    } catch (error: any) {
      toast({
        title: 'Erro ao enviar documento',
        description: error.response?.data?.message || 'Não foi possível enviar o documento.',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
      // Limpar input
      event.target.value = ''
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const validateForm = (): boolean => {
    if (!productId) {
      toast({
        title: 'Produto obrigatório',
        description: 'Selecione um produto.',
        variant: 'destructive',
      })
      return false
    }

    if (!locationId) {
      toast({
        title: 'Local obrigatório',
        description: 'Selecione um local de estoque.',
        variant: 'destructive',
      })
      return false
    }

    if (quantity <= 0) {
      toast({
        title: 'Quantidade inválida',
        description: 'A quantidade deve ser maior que zero.',
        variant: 'destructive',
      })
      return false
    }

    // Validação de estoque para saídas e perdas
    if (type === 'EXIT' || type === 'LOSS') {
      const locationStock = selectedProduct?.stocksByLocation?.find(
        (s) => s.locationId === locationId
      )
      const currentStock = locationStock ? parseFloat(locationStock.quantity) : 0

      if (quantity > currentStock) {
        toast({
          title: 'Estoque insuficiente',
          description: `O local possui apenas ${currentStock} unidades disponíveis.`,
          variant: 'destructive',
        })
        return false
      }
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      setSaving(true)

      const movementData: CreateStockMovementRequest = {
        type,
        quantity,
        locationId,
        documentId,
        reason: reason || undefined,
        notes: notes || undefined,
        reference: reference || undefined,
      }

      const movement = await productsApi.addStockMovement(productId, movementData)

      toast({
        title: 'Movimentação criada',
        description: 'A movimentação de estoque foi registrada com sucesso!',
      })

      router.push('/dashboard/produtos/estoque/movimentacoes')
    } catch (error: any) {
      toast({
        title: 'Erro ao criar movimentação',
        description: error.response?.data?.message || 'Não foi possível criar a movimentação.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const getCurrentStock = () => {
    if (!selectedProduct || !locationId) return 0
    
    const locationStock = selectedProduct.stocksByLocation?.find(
      (s) => s.locationId === locationId
    )
    return locationStock ? parseFloat(locationStock.quantity) : 0
  }

  const getNewStock = () => {
    const current = getCurrentStock()
    if (type === 'ENTRY' || type === 'RETURN') {
      return current + quantity
    } else if (type === 'EXIT' || type === 'LOSS') {
      return current - quantity
    } else if (type === 'ADJUSTMENT') {
      return quantity // No ajuste, a quantidade é o novo total
    }
    return current
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">{!loading && (
        <>
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Nova Movimentação de Estoque</h1>
            <p className="text-muted-foreground">
              Registre entradas, saídas e ajustes de estoque
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Produto e Local */}
            <Card>
              <CardHeader>
                <CardTitle>Produto e Local</CardTitle>
                <CardDescription>Selecione o produto e o local da movimentação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product">
                    Produto <span className="text-red-500">*</span>
                  </Label>
                  <Select value={productId} onValueChange={handleProductChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex flex-col">
                            <span>{product.name}</span>
                            {product.sku && (
                              <span className="text-xs text-muted-foreground">
                                SKU: {product.sku}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">
                    Local de Estoque <span className="text-red-500">*</span>
                  </Label>
                  <Select value={locationId} onValueChange={setLocationId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o local" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>
                              {location.name} ({location.code})
                            </span>
                            {selectedProduct?.stocksByLocation?.find(
                              (s) => s.locationId === location.id
                            ) && (
                              <span className="text-xs text-muted-foreground ml-2">
                                Estoque:{' '}
                                {parseFloat(
                                  selectedProduct.stocksByLocation.find(
                                    (s) => s.locationId === location.id
                                  )!.quantity
                                )}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Tipo e Quantidade */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhes da Movimentação</CardTitle>
                <CardDescription>Tipo, quantidade e informações adicionais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">
                    Tipo de Movimentação <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={type}
                    onValueChange={(value) => setType(value as StockMovementType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {movementTypes.map((mt) => (
                        <SelectItem key={mt.value} value={mt.value}>
                          <div className="flex flex-col">
                            <span>{mt.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {mt.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">
                    Quantidade <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Motivo</Label>
                  <Input
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ex: Compra de fornecedor X, Venda pedido #123"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference">Referência</Label>
                  <Input
                    id="reference"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Ex: NF 12345, Pedido #001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Informações adicionais sobre a movimentação"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Documento */}
            <Card>
              <CardHeader>
                <CardTitle>Documento Comprobatório</CardTitle>
                <CardDescription>
                  Anexe nota fiscal, recibo ou outro documento (opcional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {uploadedDocument ? (
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium">{uploadedDocument.fileName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {uploadedDocument.mimeType?.includes('pdf') ? 'PDF' :
                           uploadedDocument.mimeType?.includes('image') ? 'Imagem' :
                           'Documento'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(uploadedDocument.fileSize || uploadedDocument.size)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Organizado automaticamente em: Estoque/Movimentações
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setUploadedDocument(null)
                        setDocumentId(undefined)
                      }}
                    >
                      Remover
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Arraste um arquivo ou clique para selecionar
                    </p>
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <Button variant="outline" disabled={uploading} asChild>
                        <span>
                          {uploading ? 'Enviando...' : 'Selecionar Arquivo'}
                        </span>
                      </Button>
                    </Label>
                    <Input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept=".pdf,.jpg,.jpeg,.png,.xml"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Resumo */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
                <CardDescription>Conferência da movimentação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedProduct && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Produto</p>
                      <p className="font-medium">{selectedProduct.name}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Local</p>
                      <p className="font-medium">
                        {locations.find((l) => l.id === locationId)?.name || '-'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Tipo</p>
                      <p className="font-medium">
                        {movementTypes.find((mt) => mt.value === type)?.label}
                      </p>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Estoque Atual</span>
                        <span className="font-semibold">{getCurrentStock()}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">
                          {type === 'ENTRY' || type === 'RETURN' ? '+' : '-'} Movimentação
                        </span>
                        <span className="font-semibold">{quantity}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-sm font-medium">Estoque Final</span>
                        <span className="text-lg font-bold">{getNewStock()}</span>
                      </div>
                    </div>
                  </>
                )}

                <Button
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={saving || !productId || !locationId}
                >
                  {saving ? 'Salvando...' : 'Registrar Movimentação'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        </>
      )}
      </div>
    </DashboardLayout>
  )
}
