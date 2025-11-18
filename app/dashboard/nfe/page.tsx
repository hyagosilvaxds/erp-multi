"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  FileText,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Download,
  FileCheck,
  XCircle,
  Loader2,
  ShoppingCart,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  FileX,
} from "lucide-react"
import { nfeApi, NFe, NFeStatus, nfeStatusLabels, nfeStatusColors, formatChaveAcesso, NFeStats } from "@/lib/api/nfe"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/masks"

export default function NFePage() {
  const router = useRouter()
  const { toast } = useToast()

  const [nfes, setNfes] = useState<NFe[]>([])
  const [stats, setStats] = useState<NFeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Filtros
  const [statusFilter, setStatusFilter] = useState<NFeStatus | "ALL">("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [numeroFilter, setNumeroFilter] = useState("")
  const [serieFilter, setSerieFilter] = useState("")
  const [customerNameFilter, setCustomerNameFilter] = useState("")
  const [chaveAcessoFilter, setChaveAcessoFilter] = useState("")
  const [dataInicioFilter, setDataInicioFilter] = useState("")
  const [dataFimFilter, setDataFimFilter] = useState("")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  useEffect(() => {
    loadNFes()
    loadStats()
  }, [page, statusFilter, searchQuery, numeroFilter, serieFilter, customerNameFilter, chaveAcessoFilter, dataInicioFilter, dataFimFilter])

  const loadNFes = async () => {
    try {
      setLoading(true)
      const response = await nfeApi.getAll({
        page,
        limit: 20,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        search: searchQuery || undefined,
        numero: numeroFilter || undefined,
        serie: serieFilter || undefined,
        customerName: customerNameFilter || undefined,
        chaveAcesso: chaveAcessoFilter || undefined,
        dataInicio: dataInicioFilter || undefined,
        dataFim: dataFimFilter || undefined,
      })

      setNfes(response.data)
      setTotal(response.meta.total)
      setTotalPages(response.meta.totalPages)
    } catch (error: any) {
      toast({
        title: "Erro ao carregar NFes",
        description: error.response?.data?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await nfeApi.getStats()
      setStats(data)
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
    }
  }

  const handleSearch = () => {
    setSearchQuery(searchInput)
    setPage(1)
  }

  const handleClearFilters = () => {
    setSearchInput("")
    setSearchQuery("")
    setNumeroFilter("")
    setSerieFilter("")
    setCustomerNameFilter("")
    setChaveAcessoFilter("")
    setDataInicioFilter("")
    setDataFimFilter("")
    setStatusFilter("ALL")
    setPage(1)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleDownloadXML = async (nfe: NFe) => {
    try {
      const blob = await nfeApi.downloadXML(nfe.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `NFe-${nfe.numero}-${nfe.serie}.xml`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "XML baixado",
        description: "O arquivo XML foi baixado com sucesso.",
      })
    } catch (error: any) {
      toast({
        title: "Erro ao baixar XML",
        description: error.response?.data?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
    }
  }

  const handleDownloadPDF = async (nfe: NFe) => {
    try {
      const blob = await nfeApi.downloadPDF(nfe.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `DANFE-${nfe.numero}-${nfe.serie}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "DANFE baixada",
        description: "O PDF da DANFE foi baixado com sucesso.",
      })
    } catch (error: any) {
      toast({
        title: "Erro ao baixar DANFE",
        description: error.response?.data?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "—"
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const getStatusIcon = (status: NFeStatus) => {
    switch (status) {
      case "AUTHORIZED":
        return <CheckCircle className="h-4 w-4" />
      case "CANCELED":
        return <XCircle className="h-4 w-4" />
      case "REJECTED":
        return <AlertCircle className="h-4 w-4" />
      case "DENEGADA":
        return <FileX className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notas Fiscais Eletrônicas</h1>
            <p className="text-muted-foreground">Gerencie as NF-es da sua empresa</p>
          </div>
          <div className="flex gap-2">
            
          </div>
        </div>

        {/* Estatísticas */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">NF-es emitidas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Autorizadas</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.emitidas}</div>
                <p className="text-xs text-muted-foreground">Aprovadas pela SEFAZ</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.valorTotalEmitidas)}</div>
                <p className="text-xs text-muted-foreground">Em NF-es autorizadas</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                {showAdvancedFilters ? "Filtros Simples" : "Filtros Avançados"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!showAdvancedFilters ? (
              // Filtros Simples
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por número, chave, cliente..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value as NFeStatus | "ALL")
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos os Status</SelectItem>
                    <SelectItem value="DRAFT">Rascunho</SelectItem>
                    <SelectItem value="AUTHORIZED">Autorizada</SelectItem>
                    <SelectItem value="CANCELED">Cancelada</SelectItem>
                    <SelectItem value="REJECTED">Rejeitada</SelectItem>
                    <SelectItem value="PROCESSANDO">Processando</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleSearch}>
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </Button>
              </div>
            ) : (
              // Filtros Avançados
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Número */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Número</label>
                    <Input
                      placeholder="Ex: 123"
                      value={numeroFilter}
                      onChange={(e) => setNumeroFilter(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                  </div>

                  {/* Série */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Série</label>
                    <Input
                      placeholder="Ex: 1"
                      value={serieFilter}
                      onChange={(e) => setSerieFilter(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={statusFilter}
                      onValueChange={(value) => {
                        setStatusFilter(value as NFeStatus | "ALL")
                        setPage(1)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Todos</SelectItem>
                        <SelectItem value="DRAFT">Rascunho</SelectItem>
                        <SelectItem value="AUTHORIZED">Autorizada</SelectItem>
                        <SelectItem value="CANCELED">Cancelada</SelectItem>
                        <SelectItem value="REJECTED">Rejeitada</SelectItem>
                        <SelectItem value="PROCESSANDO">Processando</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cliente */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome do Cliente</label>
                    <Input
                      placeholder="Ex: João Silva"
                      value={customerNameFilter}
                      onChange={(e) => setCustomerNameFilter(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                  </div>

                  {/* Chave de Acesso */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Chave de Acesso</label>
                    <Input
                      placeholder="Ex: 35240 (parcial)"
                      value={chaveAcessoFilter}
                      onChange={(e) => setChaveAcessoFilter(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                  </div>

                  {/* Data Início */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data Início</label>
                    <Input
                      type="date"
                      value={dataInicioFilter}
                      onChange={(e) => setDataInicioFilter(e.target.value)}
                    />
                  </div>

                  {/* Data Fim */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data Fim</label>
                    <Input
                      type="date"
                      value={dataFimFilter}
                      onChange={(e) => setDataFimFilter(e.target.value)}
                    />
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex gap-2">
                  <Button onClick={() => setPage(1)} className="flex-1 sm:flex-none">
                    <Search className="mr-2 h-4 w-4" />
                    Aplicar Filtros
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleClearFilters}
                    className="flex-1 sm:flex-none"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de NF-es ({total})</CardTitle>
            <CardDescription>
              {total === 0
                ? "Nenhuma NF-e encontrada"
                : `Mostrando ${(page - 1) * 20 + 1} - ${Math.min(page * 20, total)} de ${total} NF-es`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : nfes.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Nenhuma NF-e encontrada</h3>
                <p className="text-muted-foreground">
                  Comece criando uma nova NF-e ou gerando da venda.
                </p>
                <div className="mt-6 flex gap-2 justify-center">
                  
                </div>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número/Série</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Destinatário</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {nfes.map((nfe) => (
                      <TableRow
                        key={nfe.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/dashboard/nfe/${nfe.id}`)}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              NF-e {nfe.numero} / {nfe.serie}
                            </p>
                            {nfe.chaveAcesso && (
                              <p className="text-xs text-muted-foreground font-mono">
                                {formatChaveAcesso(nfe.chaveAcesso).substring(0, 20)}...
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{formatDate(nfe.dataEmissao)}</p>
                            {nfe.dataSaida && (
                              <p className="text-xs text-muted-foreground">
                                Saída: {formatDate(nfe.dataSaida)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {nfe.destinatarioNome || nfe.customer?.name || nfe.customer?.companyName || "—"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {nfe.destinatarioCnpjCpf || nfe.customer?.cpf || nfe.customer?.cnpj || "—"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-semibold">{formatCurrency(nfe.valorTotal)}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className={nfeStatusColors[nfe.status]}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(nfe.status)}
                              {nfeStatusLabels[nfe.status]}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  router.push(`/dashboard/nfe/${nfe.id}`)
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Visualizar
                              </DropdownMenuItem>
                              {nfe.status === "DRAFT" && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    router.push(`/dashboard/nfe/${nfe.id}/edit`)
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                              )}
                              {nfe.status === "AUTHORIZED" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDownloadXML(nfe)
                                    }}
                                  >
                                    <Download className="mr-2 h-4 w-4" />
                                    Baixar XML
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDownloadPDF(nfe)
                                    }}
                                  >
                                    <FileText className="mr-2 h-4 w-4" />
                                    Baixar DANFE
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
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
