"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  CheckCircle2,
  FileText,
  Download,
  Eye,
  MoreVertical,
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Bell,
  BellOff,
} from "lucide-react"
import Link from "next/link"

// Mock data
const documentsWithAlerts = [
  {
    id: 1,
    name: "Licença de Operação 2024.pdf",
    folder: "Operações",
    validUntil: "2024-03-30",
    daysUntilExpiry: 15,
    status: "warning" as const,
    alertEnabled: true,
    uploadedBy: "Maria Santos",
    reference: "LO-2024-001",
    size: "1.8 MB",
  },
  {
    id: 2,
    name: "Alvará de Bombeiros.pdf",
    folder: "Jurídico",
    validUntil: "2024-02-15",
    daysUntilExpiry: 5,
    status: "critical" as const,
    alertEnabled: true,
    uploadedBy: "Ana Lima",
    reference: "ALV-2024-001",
    size: "3.2 MB",
  },
  {
    id: 3,
    name: "Certificado Digital.pfx",
    folder: "Fiscal",
    validUntil: "2024-04-20",
    daysUntilExpiry: 25,
    status: "info" as const,
    alertEnabled: true,
    uploadedBy: "João Silva",
    reference: "CERT-2024-001",
    size: "12 KB",
  },
  {
    id: 4,
    name: "Contrato Locação Imóvel.pdf",
    folder: "Jurídico",
    validUntil: "2024-02-28",
    daysUntilExpiry: 10,
    status: "warning" as const,
    alertEnabled: true,
    uploadedBy: "Pedro Costa",
    reference: "CTR-2024-003",
    size: "2.1 MB",
  },
  {
    id: 5,
    name: "Seguro Empresarial.pdf",
    folder: "Jurídico",
    validUntil: "2024-02-10",
    daysUntilExpiry: 2,
    status: "critical" as const,
    alertEnabled: true,
    uploadedBy: "Maria Santos",
    reference: "SEG-2024-001",
    size: "890 KB",
  },
]

const expiredDocuments = [
  {
    id: 101,
    name: "Licença Ambiental 2023.pdf",
    folder: "Operações",
    validUntil: "2024-01-05",
    daysExpired: 10,
    alertEnabled: false,
    uploadedBy: "Ana Lima",
    reference: "LA-2023-001",
    size: "2.4 MB",
  },
  {
    id: 102,
    name: "Contrato Fornecedor ABC.pdf",
    folder: "Jurídico",
    validUntil: "2024-01-01",
    daysExpired: 14,
    alertEnabled: false,
    uploadedBy: "João Silva",
    reference: "CTR-2023-045",
    size: "1.5 MB",
  },
]

const recentlyRenewed = [
  {
    id: 201,
    name: "Alvará Sanitário 2024.pdf",
    folder: "Operações",
    previousExpiry: "2024-01-15",
    newExpiry: "2025-01-15",
    renewedAt: "2024-01-10",
    renewedBy: "Maria Santos",
    reference: "ALV-SAN-2024",
    size: "1.2 MB",
  },
  {
    id: 202,
    name: "Registro ANVISA.pdf",
    folder: "Operações",
    previousExpiry: "2024-01-20",
    newExpiry: "2025-01-20",
    renewedAt: "2024-01-12",
    renewedBy: "Pedro Costa",
    reference: "ANVISA-2024",
    size: "980 KB",
  },
]

export default function AlertasDocumentosPage() {
  const [selectedTab, setSelectedTab] = useState("active")

  const criticalCount = documentsWithAlerts.filter((d) => d.status === "critical").length
  const warningCount = documentsWithAlerts.filter((d) => d.status === "warning").length
  const expiredCount = expiredDocuments.length

  const getStatusBadge = (status: "critical" | "warning" | "info") => {
    const variants = {
      critical: { variant: "destructive" as const, icon: AlertTriangle, label: "Crítico" },
      warning: { variant: "default" as const, icon: AlertCircle, label: "Atenção" },
      info: { variant: "secondary" as const, icon: Bell, label: "Informativo" },
    }
    const config = variants[status]
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getDaysText = (days: number, type: "until" | "expired") => {
    if (type === "until") {
      if (days === 0) return "Vence hoje"
      if (days === 1) return "Vence amanhã"
      return `Vence em ${days} dias`
    } else {
      if (days === 0) return "Venceu hoje"
      if (days === 1) return "Venceu ontem"
      return `Venceu há ${days} dias`
    }
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/documentos">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Alertas de Validade</h1>
            <p className="text-muted-foreground">
              Gerencie documentos com prazo de validade
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Críticos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{criticalCount}</div>
              <p className="text-xs text-muted-foreground">Vencem em até 7 dias</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atenção</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{warningCount}</div>
              <p className="text-xs text-muted-foreground">Vencem em até 30 dias</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expiredCount}</div>
              <p className="text-xs text-muted-foreground">Precisam de renovação</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Renovados</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentlyRenewed.length}</div>
              <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="active">
              Alertas Ativos
              {documentsWithAlerts.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {documentsWithAlerts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="expired">
              Vencidos
              {expiredCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {expiredCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="renewed">Renovados Recentemente</TabsTrigger>
          </TabsList>

          {/* Active Alerts */}
          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Documentos com Vencimento Próximo</CardTitle>
                <CardDescription>
                  Documentos que requerem atenção por estarem próximos da data de validade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead>Pasta</TableHead>
                      <TableHead>Validade</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Enviado por</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documentsWithAlerts.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>{getStatusBadge(doc.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <code className="text-xs text-muted-foreground">
                                {doc.reference}
                              </code>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{doc.folder}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {new Date(doc.validUntil).toLocaleDateString("pt-BR")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div
                            className={`text-sm font-medium ${
                              doc.status === "critical"
                                ? "text-destructive"
                                : doc.status === "warning"
                                  ? "text-orange-500"
                                  : ""
                            }`}
                          >
                            {getDaysText(doc.daysUntilExpiry, "until")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{doc.uploadedBy}</span>
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
                              <DropdownMenuItem>
                                <Link
                                  href={`/dashboard/documentos/${doc.id}`}
                                  className="flex w-full items-center"
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  Visualizar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="mr-2 h-4 w-4" />
                                Renovar Documento
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <BellOff className="mr-2 h-4 w-4" />
                                Desativar Alerta
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Expired Documents */}
          <TabsContent value="expired" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Documentos Vencidos</CardTitle>
                <CardDescription>
                  Documentos que já ultrapassaram a data de validade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Documento</TableHead>
                      <TableHead>Pasta</TableHead>
                      <TableHead>Venceu em</TableHead>
                      <TableHead>Tempo Vencido</TableHead>
                      <TableHead>Enviado por</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiredDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <code className="text-xs text-muted-foreground">
                                {doc.reference}
                              </code>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{doc.folder}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {new Date(doc.validUntil).toLocaleDateString("pt-BR")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium text-destructive">
                            {getDaysText(doc.daysExpired, "expired")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{doc.uploadedBy}</span>
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
                              <DropdownMenuItem>
                                <Link
                                  href={`/dashboard/documentos/${doc.id}`}
                                  className="flex w-full items-center"
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  Visualizar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="mr-2 h-4 w-4" />
                                Renovar Documento
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recently Renewed */}
          <TabsContent value="renewed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Documentos Renovados</CardTitle>
                <CardDescription>
                  Documentos que foram renovados nos últimos 30 dias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Documento</TableHead>
                      <TableHead>Pasta</TableHead>
                      <TableHead>Validade Anterior</TableHead>
                      <TableHead>Nova Validade</TableHead>
                      <TableHead>Renovado em</TableHead>
                      <TableHead>Renovado por</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentlyRenewed.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <code className="text-xs text-muted-foreground">
                                {doc.reference}
                              </code>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{doc.folder}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground line-through">
                            {new Date(doc.previousExpiry).toLocaleDateString("pt-BR")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                            <Calendar className="h-3 w-3" />
                            {new Date(doc.newExpiry).toLocaleDateString("pt-BR")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {new Date(doc.renewedAt).toLocaleDateString("pt-BR")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{doc.renewedBy}</span>
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
                              <DropdownMenuItem>
                                <Link
                                  href={`/dashboard/documentos/${doc.id}`}
                                  className="flex w-full items-center"
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  Visualizar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
