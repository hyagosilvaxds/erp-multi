'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Package, FileText, Upload } from 'lucide-react'
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
import {
  stockLocationsApi,
  stockTransfersApi,
  productsApi,
  type StockLocation,
  type Product,
  type CreateTransferItemRequest,
} from '@/lib/api/products'
import { documentsApi, type Document } from '@/lib/api/documents'
import { Badge } from '@/components/ui/badge'

interface TransferItem {
  productId: string
  product?: Product
  quantity: number
  notes: string
}

export default function NewTransferPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [locations, setLocations] = useState<StockLocation[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingDocument, setUploadingDocument] = useState(false)

  const [fromLocationId, setFromLocationId] = useState('')
  const [toLocationId, setToLocationId] = useState('')
  const [notes, setNotes] = useState('')
  const [documentId, setDocumentId] = useState<string>()
  const [uploadedDocument, setUploadedDocument] = useState<Document | null>(null)
  const [items, setItems] = useState<TransferItem[]>([
    { productId: '', quantity: 1, notes: '' },
  ])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [locationsData, productsData] = await Promise.all([
        stockLocationsApi.getAll(),
        productsApi.getAll({}),
      ])
      setLocations(locationsData.filter((l) => l.active))
      setProducts(productsData.products)
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

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1, notes: '' }])
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: keyof TransferItem, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    // Se mudou o produto, carrega os dados dele
    if (field === 'productId' && value) {
      const product = products.find((p) => p.id === value)
      if (product) {
        newItems[index].product = product
      }
    }
    
    setItems(newItems)
  }

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploadingDocument(true)

      const result = await documentsApi.upload({
        file,
        title: `Transferência - ${file.name}`,
        type: 'guia_transferencia',
        tags: 'transferencia,estoque',
        context: 'stock_transfer',
      })

      // Buscar documento completo para ter todas as informações
      const fullDocument = await documentsApi.getById(result.id)
      
      setDocumentId(result.id)
      setUploadedDocument(fullDocument)

      toast({
        title: 'Documento anexado',
        description: 'Documento enviado com sucesso e organizado automaticamente.',
      })
    } catch (error: any) {
      toast({
        title: 'Erro ao enviar documento',
        description: error.response?.data?.message || 'Não foi possível enviar o documento.',
        variant: 'destructive',
      })
    } finally {
      setUploadingDocument(false)
      // Limpar o input para permitir upload do mesmo arquivo novamente
      event.target.value = ''
    }
  }

  const handleRemoveDocument = () => {
    setDocumentId(undefined)
    setUploadedDocument(null)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const validateForm = (): boolean => {
    if (!fromLocationId) {
      toast({
        title: 'Local de origem obrigatório',
        description: 'Selecione o local de origem da transferência.',
        variant: 'destructive',
      })
      return false
    }

    if (!toLocationId) {
      toast({
        title: 'Local de destino obrigatório',
        description: 'Selecione o local de destino da transferência.',
        variant: 'destructive',
      })
      return false
    }

    if (fromLocationId === toLocationId) {
      toast({
        title: 'Locais iguais',
        description: 'O local de origem e destino devem ser diferentes.',
        variant: 'destructive',
      })
      return false
    }

    if (items.length === 0) {
      toast({
        title: 'Adicione produtos',
        description: 'Adicione pelo menos um produto à transferência.',
        variant: 'destructive',
      })
      return false
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (!item.productId) {
        toast({
          title: 'Produto não selecionado',
          description: `Selecione um produto para o item ${i + 1}.`,
          variant: 'destructive',
        })
        return false
      }
      if (item.quantity <= 0) {
        toast({
          title: 'Quantidade inválida',
          description: `A quantidade do item ${i + 1} deve ser maior que zero.`,
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

      const transferItems: CreateTransferItemRequest[] = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        notes: item.notes || undefined,
      }))

      const transfer = await stockTransfersApi.create({
        fromLocationId,
        toLocationId,
        items: transferItems,
        notes: notes || undefined,
        documentId: documentId,
      })

      toast({
        title: 'Transferência criada',
        description: `Transferência ${transfer.code} criada com sucesso!`,
      })

      router.push(`/dashboard/produtos/estoque/transferencias/${transfer.id}`)
    } catch (error: any) {
      toast({
        title: 'Erro ao criar transferência',
        description: error.response?.data?.message || 'Não foi possível criar a transferência.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
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
          <h1 className="text-3xl font-bold">Nova Transferência</h1>
          <p className="text-muted-foreground">
            Crie uma transferência de estoque entre locais
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Locais */}
          <Card>
            <CardHeader>
              <CardTitle>Locais de Estoque</CardTitle>
              <CardDescription>Selecione origem e destino da transferência</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromLocation">
                    Local de Origem <span className="text-red-500">*</span>
                  </Label>
                  <Select value={fromLocationId} onValueChange={setFromLocationId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name} ({location.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="toLocation">
                    Local de Destino <span className="text-red-500">*</span>
                  </Label>
                  <Select value={toLocationId} onValueChange={setToLocationId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations
                        .filter((l) => l.id !== fromLocationId)
                        .map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name} ({location.code})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Produtos</CardTitle>
                  <CardDescription>Adicione os produtos a transferir</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleAddItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-2">
                        <Label>
                          Produto <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={item.productId}
                          onValueChange={(value) => handleItemChange(index, 'productId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um produto" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                <div className="flex items-center gap-2">
                                  <Package className="w-4 h-4" />
                                  {product.name} ({product.sku})
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="w-32 space-y-2">
                        <Label>
                          Quantidade <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)
                          }
                        />
                      </div>

                      {items.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="mt-7"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Observações</Label>
                      <Input
                        value={item.notes}
                        onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                        placeholder="Observações sobre este item (opcional)"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Observações Gerais</CardTitle>
              <CardDescription>Observações sobre a transferência</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Digite observações gerais sobre a transferência (opcional)"
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Document Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documento
              </CardTitle>
              <CardDescription>
                Anexe um documento à transferência (nota fiscal, ordem, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!uploadedDocument ? (
                <div>
                  <Label
                    htmlFor="document-upload"
                    className="cursor-pointer"
                  >
                    <div className="border-2 border-dashed rounded-lg p-6 hover:bg-accent transition-colors">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {uploadingDocument ? 'Enviando...' : 'Clique para enviar um arquivo'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PDF, imagens, documentos (max 10MB)
                          </p>
                        </div>
                      </div>
                    </div>
                    <Input
                      id="document-upload"
                      type="file"
                      className="hidden"
                      onChange={handleDocumentUpload}
                      disabled={uploadingDocument}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    />
                  </Label>
                </div>
              ) : (
                <div className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-8 h-8 text-muted-foreground flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{uploadedDocument.fileName}</p>
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
                      {uploadedDocument.uploadedBy && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Enviado por {uploadedDocument.uploadedBy.name}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveDocument}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total de Itens:</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantidade Total:</span>
                  <span className="font-medium">
                    {items.reduce((acc, item) => acc + item.quantity, 0)}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <Button className="w-full" onClick={handleSubmit} disabled={saving}>
                  {saving ? 'Criando...' : 'Criar Transferência'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.back()}
                  disabled={saving}
                >
                  Cancelar
                </Button>
              </div>
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