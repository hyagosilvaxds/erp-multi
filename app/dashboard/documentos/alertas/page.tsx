"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertCircle,
  AlertTriangle,
  FileText,
  Download,
  Eye,
  MoreVertical,
  ArrowLeft,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { documentsApi, type Document as DocumentType } from "@/lib/api/documents"
import { useToast } from "@/hooks/use-toast"
import { usePermissions } from "@/hooks/use-permissions"
import { authApi } from "@/lib/api/auth"

export default function AlertasDocumentosPage() {
  const router = useRouter()
  const { toast } = useToast()

  // Obter permissões reais do backend
  const selectedCompany = authApi.getSelectedCompany()
  const permissions = selectedCompany?.role?.permissions || []
  
  // Helper para verificar permissões
  const hasPermission = (resource: string, action: string) => {
    return permissions.some((p: any) => p.resource === resource && p.action === action)
  }

  // Verificar permissões (usando resource 'documents' do backend)
  const canRead = hasPermission('documents', 'read')

  const [loading, setLoading] = useState(true)
  const [expiredDocuments, setExpiredDocuments] = useState<DocumentType[]>([])
  const [expiringDocuments, setExpiringDocuments] = useState<DocumentType[]>([])
  const [expiringFilter, setExpiringFilter] = useState<string>("30")
  const [activeTab, setActiveTab] = useState<"expiring" | "expired">("expiring")

  useEffect(() => {
    if (!canRead) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para visualizar documentos",
        variant: "destructive",
      })
      router.push('/dashboard/documentos')
      return
    }

    loadData()
  }, [canRead, router, expiringFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Carregar documentos vencidos e com vencimento próximo em paralelo
      const [expiredResponse, expiringResponse] = await Promise.all([
        documentsApi.getAll({ expired: true, limit: 1000 }),
        documentsApi.getAll({ expiresIn: parseInt(expiringFilter), limit: 1000 })
      ])

      setExpiredDocuments(
        Array.isArray(expiredResponse) ? expiredResponse : expiredResponse.documents || []
      )
      setExpiringDocuments(
        Array.isArray(expiringResponse) ? expiringResponse : expiringResponse.documents || []
      )
    } catch (error: any) {
      console.error('❌ Erro ao carregar alertas:', error)
      
      toast({
        title: "Erro ao carregar alertas",
        description: error.response?.data?.message || error.message || "Não foi possível carregar os alertas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadDocument = async (document: DocumentType) => {
    try {
      toast({
        title: "Iniciando download...",
        description: `Baixando ${document.name}`,
      })

      const blob = await documentsApi.download(document.id)
      
      // Criar URL temporária e fazer download
      const url = window.URL.createObjectURL(blob)
      const a = window.document.createElement('a')
      a.href = url
      a.download = document.name
      window.document.body.appendChild(a)
      a.click()
      window.document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({
        title: "✅ Download concluído",
        description: `${document.name} foi baixado com sucesso`,
      })
    } catch (error: any) {
      console.error('❌ Erro ao baixar documento:', error)

      toast({
        title: "Erro ao baixar",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getDaysUntilExpiry = (expiryDate: string): number => {
    const now = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusBadge = (document: DocumentType) => {
    if (document.isExpired) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Vencido
        </Badge>
      )
    }

    if (document.expiresAt) {
      const daysLeft = getDaysUntilExpiry(document.expiresAt)
      
      if (daysLeft <= 7) {
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            {daysLeft} dias
          </Badge>
        )
      } else if (daysLeft <= 30) {
        return (
          <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-600">
            <AlertTriangle className="h-3 w-3" />
            {daysLeft} dias
          </Badge>
        )
      } else {
        return (
          <Badge variant="secondary" className="gap-1">
            {daysLeft} dias
          </Badge>
        )
      }
    }

    return null
  }

  if (!canRead) {
    return null
  }

  if (loading) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando alertas...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard/documentos">
              <Button variant="ghost" size="sm" className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Hub
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Alertas de Documentos</h1>
            <p className="text-muted-foreground">
              Gerencie documentos vencidos e com vencimento próximo
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Documentos Vencidos
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {expiredDocuments.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Requerem atenção imediata
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Vencimento Próximo
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {expiringDocuments.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Nos próximos {expiringFilter} dias
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "expiring" | "expired")}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="expiring" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Vencimento Próximo
                {expiringDocuments.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {expiringDocuments.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="expired" className="gap-2">
                <AlertCircle className="h-4 w-4" />
                Vencidos
                {expiredDocuments.length > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {expiredDocuments.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {activeTab === "expiring" && (
              <Select value={expiringFilter} onValueChange={setExpiringFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Próximos 7 dias</SelectItem>
                  <SelectItem value="15">Próximos 15 dias</SelectItem>
                  <SelectItem value="30">Próximos 30 dias</SelectItem>
                  <SelectItem value="60">Próximos 60 dias</SelectItem>
                  <SelectItem value="90">Próximos 90 dias</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Vencimento Próximo */}
          <TabsContent value="expiring" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Documentos com Vencimento Próximo</CardTitle>
                <CardDescription>
                  Documentos que expiram nos próximos {expiringFilter} dias
                </CardDescription>
              </CardHeader>
              <CardContent>
                {expiringDocuments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Nenhum documento com vencimento próximo
                    </h3>
                    <p className="text-muted-foreground">
                      Não há documentos que expiram nos próximos {expiringFilter} dias
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Documento</TableHead>
                        <TableHead>Pasta</TableHead>
                        <TableHead>Validade</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expiringDocuments.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="font-medium truncate">{doc.name}</p>
                                {doc.description && (
                                  <p className="text-sm text-muted-foreground truncate">
                                    {doc.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {doc.folder?.name || '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {doc.expiresAt ? formatDate(doc.expiresAt) : '-'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(doc)}
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
                                  <Link href={`/dashboard/documentos/${doc.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Ver Detalhes
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownloadDocument(doc)}>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vencidos */}
          <TabsContent value="expired" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Documentos Vencidos</CardTitle>
                <CardDescription>
                  Documentos que já ultrapassaram a data de validade
                </CardDescription>
              </CardHeader>
              <CardContent>
                {expiredDocuments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Nenhum documento vencido
                    </h3>
                    <p className="text-muted-foreground">
                      Todos os documentos estão dentro da validade
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Documento</TableHead>
                        <TableHead>Pasta</TableHead>
                        <TableHead>Venceu em</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expiredDocuments.map((doc) => (
                        <TableRow key={doc.id} className="bg-destructive/5">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-destructive flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="font-medium truncate">{doc.name}</p>
                                {doc.description && (
                                  <p className="text-sm text-muted-foreground truncate">
                                    {doc.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {doc.folder?.name || '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-destructive">
                              {doc.expiresAt ? formatDate(doc.expiresAt) : '-'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(doc)}
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
                                  <Link href={`/dashboard/documentos/${doc.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Ver Detalhes
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownloadDocument(doc)}>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
