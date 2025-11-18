'use client'

import { useState, useEffect } from 'react'
import { MapPin, Package, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { stockLocationsApi, type StockByLocationResponse } from '@/lib/api/products'

interface ProductStockByLocationPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ProductStockByLocationPage({ params }: ProductStockByLocationPageProps) {
  const [productId, setProductId] = useState<string>('')
  const [data, setData] = useState<StockByLocationResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await params
      setProductId(resolvedParams.id)
    }
    initializeParams()
  }, [params])

  useEffect(() => {
    if (productId) {
      loadData()
    }
  }, [productId])

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await stockLocationsApi.getProductStockByLocation(productId)
      setData(response)
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar',
        description: error.response?.data?.message || 'Não foi possível carregar os dados.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Produto não encontrado</AlertDescription>
      </Alert>
    )
  }

  const activeLocations = data.stocksByLocation.filter((s) => s.location.active)
  const inactiveLocations = data.stocksByLocation.filter((s) => !s.location.active)

  return (
    <div className="space-y-6">
      {/* Header com info do produto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {data.product.name}
          </CardTitle>
          <CardDescription>
            SKU: {data.product.sku} | Total em Estoque: {data.product.totalStock} unidades
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Locais Ativos */}
      {activeLocations.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Locais Ativos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeLocations.map((stock) => (
              <Card key={stock.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {stock.location.name}
                      </CardTitle>
                      <CardDescription className="font-mono text-xs mt-1">
                        {stock.location.code}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">Ativo</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Quantidade:</span>
                      <span className="text-2xl font-bold">{stock.quantity}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {stock.quantity > 0 ? (
                        <>
                          <TrendingUp className="w-3 h-3 text-green-500" />
                          Disponível
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-3 h-3 text-red-500" />
                          Sem estoque
                        </>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Atualizado em:{' '}
                      {new Date(stock.updatedAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Locais Inativos */}
      {inactiveLocations.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-muted-foreground">Locais Inativos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
            {inactiveLocations.map((stock) => (
              <Card key={stock.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {stock.location.name}
                      </CardTitle>
                      <CardDescription className="font-mono text-xs mt-1">
                        {stock.location.code}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">Inativo</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Quantidade:</span>
                      <span className="text-2xl font-bold">{stock.quantity}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Mensagem se não houver estoque */}
      {data.stocksByLocation.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Este produto não possui estoque registrado em nenhum local.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
