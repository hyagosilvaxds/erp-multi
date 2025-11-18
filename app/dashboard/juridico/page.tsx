"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, AlertTriangle, CheckCircle2, Calendar, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"
import {
  getLegalDocumentStatistics,
  listLegalDocuments,
  type LegalDocument,
  type LegalDocumentStatistics,
  LEGAL_DOCUMENT_TYPE_LABELS,
  LEGAL_DOCUMENT_STATUS_LABELS,
} from "@/lib/api/legal-documents"
import { listLegalCategories, type LegalCategory } from "@/lib/api/legal-categories"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function JuridicoDashboard() {
  const [statistics, setStatistics] = useState<LegalDocumentStatistics | null>(null)
  const [recentDocuments, setRecentDocuments] = useState<LegalDocument[]>([])
  const [categories, setCategories] = useState<LegalCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Carregar estatísticas e documentos recentes em paralelo
      const [statsData, docsData, categoriesData] = await Promise.all([
        getLegalDocumentStatistics(),
        listLegalDocuments({ limit: 10, sortBy: "createdAt", sortOrder: "desc" }),
        listLegalCategories(),
      ])

      setStatistics(statsData)
      setRecentDocuments(docsData.documents)
      setCategories(categoriesData)
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as informações do dashboard.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (value?: string) => {
    if (!value) return "-"
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(value))
  }

  const formatDate = (date?: string) => {
    if (!date) return "-"
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR })
  }

  const getDaysUntilDue = (dueDate?: string) => {
    if (!dueDate) return null
    const now = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "ATIVO":
      case "APROVADO":
        return "default"
      case "CONCLUIDO":
        return "secondary"
      case "REJEITADO":
      case "CANCELADO":
        return "destructive"
      default:
        return "outline"
    }
  }

  // Calcular estatísticas agregadas
  const totalActive = statistics?.byStatus.find((s) => s.status === "ATIVO")?._count || 0
  const totalCompleted = statistics?.byStatus.find((s) => s.status === "CONCLUIDO")?._count || 0
  const expiringSoonCount = statistics?.expiringSoon.length || 0

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Jurídico</h1>
            <p className="text-muted-foreground">Gestão de documentos jurídicos, contratos e processos</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/juridico/documentos">
              <Button>
                <FileText className="mr-2 h-4 w-4" />
                Ver Documentos
              </Button>
            </Link>
            <Link href="/dashboard/juridico/categorias">
              <Button variant="outline">
                <FolderOpen className="mr-2 h-4 w-4" />
                Categorias
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Documentos</CardTitle>
                <FileText className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics?.total || 0}</div>
                <p className="text-xs text-muted-foreground">documentos cadastrados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documentos Ativos</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalActive}</div>
                <p className="text-xs text-muted-foreground">em vigência</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vencendo em Breve</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{expiringSoonCount}</div>
                <p className="text-xs text-muted-foreground">próximos 30 dias</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCompleted}</div>
                <p className="text-xs text-muted-foreground">documentos finalizados</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Documentos Vencendo em Breve */}
        {!isLoading && statistics && statistics.expiringSoon.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    Documentos Vencendo em Breve
                  </CardTitle>
                  <CardDescription>Documentos que vencem nos próximos 30 dias</CardDescription>
                </div>
                <Link href="/dashboard/juridico/documentos?status=ATIVO">
                  <Button variant="outline" size="sm">
                    Ver todos
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statistics.expiringSoon.slice(0, 5).map((doc) => {
                  const daysUntil = getDaysUntilDue(doc.dueDate)
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-lg border bg-background p-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                          <Calendar className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <Link
                            href={`/dashboard/juridico/documentos/${doc.id}`}
                            className="font-medium hover:underline"
                          >
                            {doc.title}
                          </Link>
                          {doc.reference && (
                            <p className="text-sm text-muted-foreground">{doc.reference}</p>
                          )}
                          <div className="mt-1 flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {LEGAL_DOCUMENT_TYPE_LABELS[doc.type]}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Vence em {formatDate(doc.dueDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-yellow-700">
                          {daysUntil !== null && daysUntil > 0 ? `${daysUntil} dias` : "Vencido"}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Documentos Recentes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Documentos Recentes</CardTitle>
                  <CardDescription>Últimos documentos cadastrados</CardDescription>
                </div>
                <Link href="/dashboard/juridico/documentos">
                  <Button variant="outline" size="sm">
                    Ver todos
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : recentDocuments.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-2">Nenhum documento cadastrado</p>
                    <Link href="/dashboard/juridico/documentos">
                      <Button variant="link" size="sm" className="mt-2">
                        Cadastrar primeiro documento
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentDocuments.slice(0, 5).map((doc) => {
                    const daysUntilDue = getDaysUntilDue(doc.dueDate)
                    const isExpiringSoon =
                      daysUntilDue !== null && daysUntilDue > 0 && daysUntilDue <= 30

                    return (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-lg"
                            style={{
                              backgroundColor: doc.category?.color
                                ? `${doc.category.color}20`
                                : "#3B82F620",
                            }}
                          >
                            <FileText
                              className="h-5 w-5"
                              style={{ color: doc.category?.color || "#3B82F6" }}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/dashboard/juridico/documentos/${doc.id}`}
                                className="font-medium hover:underline"
                              >
                                {doc.title}
                              </Link>
                              {isExpiringSoon && (
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                            {doc.reference && (
                              <p className="text-sm text-muted-foreground">{doc.reference}</p>
                            )}
                            <div className="mt-2 flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {LEGAL_DOCUMENT_TYPE_LABELS[doc.type]}
                              </Badge>
                              <Badge variant={getStatusBadgeVariant(doc.status)} className="text-xs">
                                {LEGAL_DOCUMENT_STATUS_LABELS[doc.status]}
                              </Badge>
                              {doc.value && (
                                <span className="text-xs text-muted-foreground">
                                  {formatCurrency(doc.value)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {doc.dueDate && (
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {isExpiringSoon
                                ? `${daysUntilDue} dias`
                                : formatDate(doc.dueDate)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {isExpiringSoon ? "para vencer" : "vencimento"}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Distribuição por Tipo e Status */}
          <div className="space-y-6">
            {/* Documentos por Tipo */}
            <Card>
              <CardHeader>
                <CardTitle>Documentos por Tipo</CardTitle>
                <CardDescription>Distribuição dos documentos cadastrados</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-10" />
                    ))}
                  </div>
                ) : statistics && statistics.byType.length > 0 ? (
                  <div className="space-y-4">
                    {statistics.byType.map((item) => {
                      const percentage =
                        statistics.total > 0 ? (item._count / statistics.total) * 100 : 0
                      return (
                        <div key={item.type}>
                          <div className="mb-2 flex items-center justify-between text-sm">
                            <span>{LEGAL_DOCUMENT_TYPE_LABELS[item.type]}</span>
                            <span className="font-medium">
                              {item._count} ({percentage.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
                )}
              </CardContent>
            </Card>

            {/* Documentos por Status */}
            <Card>
              <CardHeader>
                <CardTitle>Documentos por Status</CardTitle>
                <CardDescription>Status dos documentos</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-10" />
                    ))}
                  </div>
                ) : statistics && statistics.byStatus.length > 0 ? (
                  <div className="space-y-4">
                    {statistics.byStatus.map((item) => {
                      const percentage =
                        statistics.total > 0 ? (item._count / statistics.total) * 100 : 0
                      return (
                        <div key={item.status}>
                          <div className="mb-2 flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Badge variant={getStatusBadgeVariant(item.status)} className="text-xs">
                                {LEGAL_DOCUMENT_STATUS_LABELS[item.status]}
                              </Badge>
                            </div>
                            <span className="font-medium">
                              {item._count} ({percentage.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Categorias */}
        {!isLoading && categories.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Categorias</CardTitle>
                  <CardDescription>
                    Categorias ativas cadastradas ({categories.filter((c) => c.active).length})
                  </CardDescription>
                </div>
                <Link href="/dashboard/juridico/categorias">
                  <Button variant="outline" size="sm">
                    Gerenciar
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {categories
                  .filter((c) => c.active)
                  .slice(0, 10)
                  .map((category) => (
                    <Link
                      key={category.id}
                      href={`/dashboard/juridico/documentos?categoryId=${category.id}`}
                    >
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-accent"
                        style={{ borderColor: category.color }}
                      >
                        <div
                          className="mr-2 h-2 w-2 rounded-full"
                          style={{ backgroundColor: category.color || "#3B82F6" }}
                        />
                        {category.name}
                        {category._count && category._count.legalDocuments > 0 && (
                          <span className="ml-1.5 text-xs text-muted-foreground">
                            ({category._count.legalDocuments})
                          </span>
                        )}
                      </Badge>
                    </Link>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
