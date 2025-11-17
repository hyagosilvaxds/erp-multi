'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Download, FileText, Filter, Package, Search, Calendar, MapPin, User, ShoppingCart } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  productsApi,
  stockLocationsApi,
  type StockMovement,
  type StockMovementType,
  type Product,
  type StockLocation,
  type ListStockMovementsParams,
  type ProductStockStats,
} from '@/lib/api/products'
import { documentsApi } from '@/lib/api/documents'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const movementTypeLabels: Record<StockMovementType, string> = {
  ENTRY: 'Entrada',
  EXIT: 'Saída',
  ADJUSTMENT: 'Ajuste',
  RETURN: 'Devolução',
  LOSS: 'Perda',
  TRANSFER: 'Transferência',
}

const movementTypeColors: Record<StockMovementType, 'default' | 'destructive' | 'secondary' | 'outline'> = {
  ENTRY: 'default',
  EXIT: 'destructive',
  ADJUSTMENT: 'secondary',
  RETURN: 'outline',
  LOSS: 'destructive',
  TRANSFER: 'default',
}

export default function ProductMovementsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const productId = params.productId as string

  const [product, setProduct] = useState<Product | null>(null)
  const [stockStats, setStockStats] = useState<ProductStockStats | null>(null)
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [locations, setLocations] = useState<StockLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)

  // Filtros
  const [filterType, setFilterType] = useState<StockMovementType | 'all'>('all')
  const [filterLocation, setFilterLocation] = useState<string>('all')
  const [filterStartDate, setFilterStartDate] = useState<string>('')
  const [filterEndDate, setFilterEndDate] = useState<string>('')
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [limit] = useState(50)

  useEffect(() => {
    loadData()
  }, [productId, filterType, filterLocation, filterStartDate, filterEndDate, currentPage])

  const loadData = async () => {
    try {
      setLoading(true)

      // Carregar produto, estatísticas e locais em paralelo
      const [productData, statsData, locationsData] = await Promise.all([
        productsApi.getById(productId),
        productsApi.getStockStats(productId),
        stockLocationsApi.getAll(),
      ])

      setProduct(productData)
      setStockStats(statsData)
      setLocations(locationsData.filter((l) => l.active))

      // Preparar parâmetros de filtro
      const params: ListStockMovementsParams = {
        page: currentPage,
        limit,
      }

      if (filterType !== 'all') {
        params.type = filterType
      }
      if (filterLocation !== 'all') {
        params.locationId = filterLocation
      }
      if (filterStartDate) {
        params.startDate = filterStartDate
      }
      if (filterEndDate) {
        params.endDate = filterEndDate
      }

      // Carregar movimentações com filtros
      const movementsData = await productsApi.getStockMovements(productId, params)

      setMovements(movementsData.data)
      setTotalRecords(movementsData.total)
      setTotalPages(Math.ceil(movementsData.total / limit))
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

  const handleDownloadDocument = async (documentId: string, fileName: string) => {
    try {
      setDownloading(documentId)
      await documentsApi.downloadFile(documentId, fileName)
    } catch (error: any) {
      toast({
        title: 'Erro ao baixar documento',
        description: error.response?.data?.message || 'Não foi possível baixar o documento.',
        variant: 'destructive',
      })
    } finally {
      setDownloading(null)
    }
  }

  const handleClearFilters = () => {
    setFilterType('all')
    setFilterLocation('all')
    setFilterStartDate('')
    setFilterEndDate('')
    setCurrentPage(1)
  }

  const formatDate = (date: string) => {
    try {
      return format(parseISO(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    } catch {
      return date
    }
  }

  const formatQuantity = (quantity: number) => {
    return quantity > 0 ? `+${quantity}` : quantity.toString()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/dashboard/produtos/estoque')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Movimentações de Estoque
                </h1>
                {product && (
                  <p className="text-muted-foreground">
                    {product.name} {product.sku && `(SKU: ${product.sku})`}
                  </p>
                )}
              </div>
            </div>
          </div>
          <Button onClick={() => router.push(`/dashboard/produtos/estoque/movimentacoes/nova?productId=${productId}`)}>
            <Package className="h-4 w-4 mr-2" />
            Nova Movimentação
          </Button>
        </div>

        {/* Resumo do Produto */}
        {stockStats && (
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas de Estoque</CardTitle>
              <CardDescription>{stockStats.productName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Estoque Atual</p>
                  <p className="text-2xl font-bold">{stockStats.stats.currentStock}</p>
                  {stockStats.stats.stockPercentage != null && (
                    <p className="text-xs text-muted-foreground">
                      {stockStats.stats.stockPercentage.toFixed(1)}% do máximo
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estoque Mínimo</p>
                  <p className="text-2xl font-bold">{stockStats.stats.minStock}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estoque Máximo</p>
                  <p className="text-2xl font-bold">{stockStats.stats.maxStock}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {stockStats.stats.needsRestock ? (
                    <Badge variant="destructive">Necessita Reposição</Badge>
                  ) : stockStats.stats.isOverstocked ? (
                    <Badge variant="secondary">Estoque Excedente</Badge>
                  ) : (
                    <Badge variant="default">Normal</Badge>
                  )}
                </div>
              </div>
              
              {/* Estoque por Localização */}
              {stockStats.stockByLocation.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">Estoque por Localização</h4>
                  <div className="grid gap-2">
                    {stockStats.stockByLocation.map((loc) => (
                      <div key={loc.locationId} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{loc.locationName}</span>
                          <span className="text-xs text-muted-foreground">({loc.locationCode})</span>
                        </div>
                        <span className="text-sm font-bold">{loc.quantity} {stockStats.unit?.abbreviation || 'UN'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo</label>
                <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="ENTRY">Entrada</SelectItem>
                    <SelectItem value="EXIT">Saída</SelectItem>
                    <SelectItem value="ADJUSTMENT">Ajuste</SelectItem>
                    <SelectItem value="RETURN">Devolução</SelectItem>
                    <SelectItem value="LOSS">Perda</SelectItem>
                    <SelectItem value="TRANSFER">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Local</label>
                <Select value={filterLocation} onValueChange={setFilterLocation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os locais</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Data Inicial</label>
                <Input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Data Final</label>
                <Input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <Button variant="outline" onClick={handleClearFilters} className="w-full">
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Movimentações */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Movimentações</CardTitle>
            <CardDescription>
              {totalRecords} {totalRecords === 1 ? 'registro encontrado' : 'registros encontrados'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                
              </div>
            ) : movements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Nenhuma movimentação encontrada</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Não há movimentações registradas para este produto com os filtros aplicados.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Quantidade</TableHead>
                        <TableHead className="text-right">Estoque Anterior</TableHead>
                        <TableHead className="text-right">Novo Estoque</TableHead>
                        <TableHead>Local</TableHead>
                        <TableHead>Motivo</TableHead>
                        <TableHead>Venda</TableHead>
                        <TableHead>Documento</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movements.map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDate(movement.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={movementTypeColors[movement.type]}>
                              {movementTypeLabels[movement.type]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            <span className={movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatQuantity(movement.quantity)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">{movement.previousStock}</TableCell>
                          <TableCell className="text-right font-medium">{movement.newStock}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              {movement.location?.name || '-'}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="space-y-1">
                              {movement.reason && (
                                <p className="text-sm">{movement.reason}</p>
                              )}
                              {movement.notes && (
                                <p className="text-xs text-muted-foreground">{movement.notes}</p>
                              )}
                              {movement.reference && (
                                <p className="text-xs text-muted-foreground">Ref: {movement.reference}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {movement.sale ? (
                              <Badge
                                variant="outline"
                                className="cursor-pointer hover:bg-blue-50 border-blue-200 text-blue-700"
                                onClick={() => router.push(`/dashboard/vendas/${movement.sale!.id}`)}
                              >
                                <ShoppingCart className="h-3 w-3 mr-1" />
                                <div className="flex flex-col text-left">
                                  <span className="text-xs font-semibold">
                                    #{movement.sale.code}
                                  </span>
                                  {movement.sale.customer && (
                                    <span className="text-xs text-muted-foreground">
                                      {movement.sale.customer.name}
                                    </span>
                                  )}
                                </div>
                              </Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {movement.document ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDownloadDocument(movement.document!.id, movement.document!.fileName)
                                }
                                disabled={downloading === movement.document.id}
                              >
                                {downloading === movement.document.id ? (
                                  'Baixando...'
                                ) : (
                                  <>
                                    <Download className="h-4 w-4 mr-2" />
                                    {movement.document.fileName}
                                  </>
                                )}
                              </Button>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Página {currentPage} de {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Próxima
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
