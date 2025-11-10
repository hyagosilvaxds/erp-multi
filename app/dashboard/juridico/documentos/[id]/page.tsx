"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  Download,
  Edit,
  FileText,
  Calendar,
  DollarSign,
  Users,
  Tag,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import { useState, useEffect } from "react"
import {
  getLegalDocumentById,
  getLegalDocumentDownload,
  downloadLegalDocument,
  type LegalDocument,
  LEGAL_DOCUMENT_TYPE_LABELS,
  LEGAL_DOCUMENT_STATUS_LABELS,
} from "@/lib/api/legal-documents"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

export default function DocumentoDetalhesPage() {
  const params = useParams()
  const router = useRouter()
  const [document, setDocument] = useState<LegalDocument | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (params.id) {
      loadDocument(params.id as string)
    }
  }, [params.id])

  const loadDocument = async (id: string) => {
    try {
      setIsLoading(true)
      const data = await getLegalDocumentById(id)
      setDocument(data)
    } catch (error) {
      toast({
        title: "Erro ao carregar documento",
        description: "Não foi possível carregar as informações do documento.",
        variant: "destructive",
      })
      router.push("/dashboard/juridico/documentos")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!document) return

    try {
      const downloadInfo = await getLegalDocumentDownload(document.id)
      const blob = await downloadLegalDocument(downloadInfo.id)
      const url = window.URL.createObjectURL(blob)
      const a = window.document.createElement("a")
      a.href = url
      a.download = downloadInfo.fileName
      window.document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      window.document.body.removeChild(a)

      toast({
        title: "Download iniciado",
        description: "O arquivo está sendo baixado.",
      })
    } catch (error) {
      toast({
        title: "Erro ao baixar documento",
        description: "Não foi possível baixar o documento.",
        variant: "destructive",
      })
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
    return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  }

  const formatDateTime = (date?: string) => {
    if (!date) return "-"
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  }

  const getDaysUntilDue = (dueDate?: string) => {
    if (!dueDate) return null
    const now = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    )
  }

  if (!document) {
    return null
  }

  const daysUntilDue = getDaysUntilDue(document.dueDate)
  const isExpiringSoon = daysUntilDue !== null && daysUntilDue > 0 && daysUntilDue <= 30
  const isExpired = daysUntilDue !== null && daysUntilDue < 0

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/juridico/documentos">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{document.title}</h1>
              <p className="text-muted-foreground">Detalhes do documento jurídico</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Baixar
            </Button>
            <Button asChild>
              <Link href={`/dashboard/juridico/documentos/${document.id}/editar`}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </Button>
          </div>
        </div>

        {/* Status e Alertas */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{LEGAL_DOCUMENT_TYPE_LABELS[document.type]}</Badge>
          <Badge
            variant={
              document.status === "ATIVO" || document.status === "APROVADO"
                ? "default"
                : document.status === "CONCLUIDO"
                  ? "secondary"
                  : "destructive"
            }
          >
            {LEGAL_DOCUMENT_STATUS_LABELS[document.status]}
          </Badge>
          {document.category && (
            <Badge variant="outline" style={{ borderColor: document.category.color }}>
              {document.category.name}
            </Badge>
          )}
          {isExpiringSoon && (
            <Badge variant="outline" className="border-yellow-500 text-yellow-700">
              <AlertCircle className="mr-1 h-3 w-3" />
              Vence em {daysUntilDue} dias
            </Badge>
          )}
          {isExpired && (
            <Badge variant="destructive">
              <AlertCircle className="mr-1 h-3 w-3" />
              Vencido há {Math.abs(daysUntilDue!)} dias
            </Badge>
          )}
        </div>

        {/* Informações Principais */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Documento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {document.reference && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Referência / Número</p>
                    <p className="text-lg">{document.reference}</p>
                  </div>
                )}

                {document.description && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Descrição</p>
                    <p className="text-base">{document.description}</p>
                  </div>
                )}

                <Separator />

                {/* Datas */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Data de Início</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p>{formatDate(document.startDate)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Vencimento</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p>{formatDate(document.dueDate)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Data de Término</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p>{formatDate(document.endDate)}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Valor */}
                {document.value && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Valor</p>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <p className="text-lg font-semibold">{formatCurrency(document.value)}</p>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {document.tags && document.tags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tags</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {document.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          <Tag className="mr-1 h-3 w-3" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Observações */}
                {document.notes && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Observações</p>
                    <p className="mt-1 text-base">{document.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Partes Envolvidas */}
            {document.parties && document.parties.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Partes Envolvidas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {document.parties.map((party, index) => (
                      <div key={index} className="rounded-lg border p-4">
                        <p className="font-medium">{party.name}</p>
                        <p className="text-sm text-muted-foreground">{party.role}</p>
                        {party.document && (
                          <p className="mt-1 text-sm">CPF/CNPJ: {party.document}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Arquivo */}
            {document.document && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Arquivo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="rounded-lg border p-3">
                      <div className="flex items-start gap-3">
                        <FileText className="h-8 w-8 text-blue-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{document.document.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            {(document.document.fileSize / 1024).toFixed(2)} KB
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {document.document.mimeType}
                          </p>
                        </div>
                      </div>
                      <Button className="mt-3 w-full" onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Baixar Arquivo
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Configurações */}
            <Card>
              <CardHeader>
                <CardTitle>Configurações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Alerta de Vencimento</p>
                  <p className="text-base">{document.alertDays} dias antes</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Moeda</p>
                  <p className="text-base">{document.currency}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status do Documento</p>
                  <div className="mt-1 flex items-center gap-2">
                    {document.active ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Ativo</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span>Inativo</span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metadados */}
            <Card>
              <CardHeader>
                <CardTitle>Informações do Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {document.createdBy && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Criado por</p>
                    <p className="text-base">{document.createdBy.name}</p>
                    <p className="text-xs text-muted-foreground">{document.createdBy.email}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data de Criação</p>
                  <p className="text-base">{formatDateTime(document.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Última Atualização</p>
                  <p className="text-base">{formatDateTime(document.updatedAt)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
