"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Search,
  FileCheck,
  Loader2,
  ShoppingCart,
  User,
  Calendar,
} from "lucide-react"
import { salesApi, Sale, saleStatusLabels, saleStatusColors } from "@/lib/api/sales"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/masks"

export default function SelecionarVendaPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchInput, setSearchInput] = useState("")

  useEffect(() => {
    loadSales()
  }, [page, searchQuery])

  const loadSales = async () => {
    try {
      setLoading(true)
      // Buscar apenas vendas aprovadas sem NF-e
      const response = await salesApi.getAll({
        page,
        limit: 20,
        status: "APPROVED",
        search: searchQuery || undefined,
      })

      setSales(response.data)
      setTotal(response.total)
      setTotalPages(response.totalPages)
    } catch (error: any) {
      toast({
        title: "Erro ao carregar vendas",
        description: error.response?.data?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setSearchQuery(searchInput)
    setPage(1)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleSelectSale = (saleId: string) => {
    router.push(`/dashboard/nfe/from-sale/${saleId}`)
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "—"
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/nfe")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gerar NF-e da Venda</h1>
              <p className="text-muted-foreground">Selecione uma venda aprovada para gerar a NF-e</p>
            </div>
          </div>
        </div>

        {/* Busca */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar Venda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por código, cliente..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button onClick={handleSearch}>
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Vendas */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas Aprovadas ({total})</CardTitle>
            <CardDescription>
              {total === 0
                ? "Nenhuma venda encontrada"
                : `Mostrando ${(page - 1) * 20 + 1} - ${Math.min(page * 20, total)} de ${total} vendas`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : sales.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Nenhuma venda encontrada</h3>
                <p className="text-muted-foreground">
                  Não há vendas aprovadas disponíveis para gerar NF-e.
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>
                          <p className="font-medium">{sale.code}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDate(sale.saleDate || sale.createdAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{sale.customer?.name || "—"}</p>
                              <p className="text-xs text-muted-foreground">
                                {sale.customer?.cpf || sale.customer?.cnpj || "—"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-semibold">{formatCurrency(sale.totalAmount)}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className={saleStatusColors[sale.status]}>
                            {saleStatusLabels[sale.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" onClick={() => handleSelectSale(sale.id)}>
                            <FileCheck className="mr-2 h-4 w-4" />
                            Gerar NF-e
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Página {page} de {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
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
