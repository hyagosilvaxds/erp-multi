"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  FileText,
  Download,
  XCircle,
  Loader2,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Building2,
  User,
  Package,
  CreditCard,
  Truck,
  FileCheck,
  Clock,
} from "lucide-react"
import { nfeApi, NFe, nfeStatusLabels, nfeStatusColors, formatChaveAcesso, getFileUrl } from "@/lib/api/nfe"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/masks"

export default function NFEDetalhesPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const nfeId = params.id as string

  const [nfe, setNfe] = useState<NFe | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Dialogs
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    loadNFe()
  }, [nfeId])

  const loadNFe = async () => {
    try {
      setLoading(true)
      const data = await nfeApi.getById(nfeId)
      setNfe(data)
    } catch (error: any) {
      toast({
        title: "Erro ao carregar NF-e",
        description: error.response?.data?.message || "NF-e não encontrada.",
        variant: "destructive",
      })
      router.push("/dashboard/nfe")
    } finally {
      setLoading(false)
    }
  }

  const handleEmitir = async () => {
    try {
      setActionLoading(true)
      const emitida = await nfeApi.emitir({ nfeId })
      setNfe(emitida)
      toast({
        title: "NF-e emitida com sucesso",
        description: "A NF-e foi enviada para a SEFAZ e está aguardando autorização.",
      })
    } catch (error: any) {
      toast({
        title: "Erro ao emitir NF-e",
        description: error.response?.data?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelar = async () => {
    if (!cancelReason.trim()) {
      toast({
        title: "Justificativa obrigatória",
        description: "Informe o motivo do cancelamento (mínimo 15 caracteres).",
        variant: "destructive",
      })
      return
    }

    if (cancelReason.trim().length < 15) {
      toast({
        title: "Justificativa muito curta",
        description: "A justificativa deve ter no mínimo 15 caracteres.",
        variant: "destructive",
      })
      return
    }

    try {
      setActionLoading(true)
      const cancelada = await nfeApi.cancelar(nfeId, { justificativa: cancelReason.trim() })
      setNfe(cancelada)
      setCancelDialogOpen(false)
      toast({
        title: "NF-e cancelada",
        description: "O evento de cancelamento foi registrado na SEFAZ.",
      })
    } catch (error: any) {
      toast({
        title: "Erro ao cancelar NF-e",
        description: error.response?.data?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setActionLoading(true)
      await nfeApi.delete(nfeId)
      toast({
        title: "NF-e excluída",
        description: "O rascunho foi excluído com sucesso.",
      })
      router.push("/dashboard/nfe")
    } catch (error: any) {
      toast({
        title: "Erro ao excluir NF-e",
        description: error.response?.data?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
      setActionLoading(false)
    }
  }

  const handleDownloadXML = async () => {
    if (!nfe) return

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

  const handleDownloadPDF = () => {
    const danfePdfUrl = (nfe as any)?.danfePdfUrl || nfe?.danfeUrl
    if (!danfePdfUrl) return

    try {
      const fileUrl = getFileUrl(danfePdfUrl)
      if (fileUrl) {
        window.open(fileUrl, '_blank')

        toast({
          title: "DANFE baixada",
          description: "O PDF da DANFE está sendo baixado.",
        })
      }
    } catch (error: any) {
      toast({
        title: "Erro ao baixar DANFE",
        description: error.message || "Tente novamente mais tarde.",
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
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  if (!nfe) {
    return null
  }

  const canEmit = nfe.status === "DRAFT" || nfe.status === "VALIDADA"
  const canCancel = nfe.status === "AUTHORIZED"
  const canEdit = nfe.status === "DRAFT"
  const canDelete = nfe.status === "DRAFT"
  const canDownload = nfe.status === "AUTHORIZED"

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
              <h1 className="text-3xl font-bold tracking-tight">
                NF-e {nfe.numero} / Série {nfe.serie}
              </h1>
              <p className="text-muted-foreground">{nfe.naturezaOperacao}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {canEdit && (
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/nfe/${nfe.id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            )}
            {canDownload && (
              <>
                <Button variant="outline" onClick={handleDownloadXML}>
                  <Download className="mr-2 h-4 w-4" />
                  XML
                </Button>
                <Button variant="outline" onClick={handleDownloadPDF}>
                  <FileText className="mr-2 h-4 w-4" />
                  DANFE
                </Button>
              </>
            )}
            {canEmit && (
              <Button onClick={handleEmitir} disabled={actionLoading}>
                {actionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Emitindo...
                  </>
                ) : (
                  <>
                    <FileCheck className="mr-2 h-4 w-4" />
                    Emitir NF-e
                  </>
                )}
              </Button>
            )}
            {canDelete && (
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={actionLoading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Gerais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Informações Gerais
                  </span>
                  <Badge className={nfeStatusColors[nfe.status]}>
                    {nfeStatusLabels[nfe.status]}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Número</p>
                    <p className="font-medium">{nfe.numero}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Série</p>
                    <p className="font-medium">{nfe.serie}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Modelo</p>
                    <p className="font-medium">{nfe.modelo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo de Operação</p>
                    <p className="font-medium">
                      {nfe.tipoOperacao === "ENTRADA" ? "Entrada" : "Saída"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Natureza da Operação</p>
                    <p className="font-medium">{nfe.naturezaOperacao}</p>
                  </div>
                </div>

                {nfe.chaveAcesso && (
                  <div>
                    <p className="text-sm text-muted-foreground">Chave de Acesso</p>
                    <p className="font-mono text-sm">{formatChaveAcesso(nfe.chaveAcesso)}</p>
                  </div>
                )}

                {nfe.protocoloAutorizacao && (
                  <div>
                    <p className="text-sm text-muted-foreground">Protocolo de Autorização</p>
                    <p className="font-medium">{nfe.protocoloAutorizacao}</p>
                  </div>
                )}

                {nfe.mensagemSefaz && (
                  <div>
                    <p className="text-sm text-muted-foreground">Mensagem SEFAZ</p>
                    <p className="text-sm">{nfe.mensagemSefaz}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Destinatário */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Destinatário
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Nome/Razão Social</p>
                  <p className="font-medium">
                    {nfe.destinatarioNome || nfe.customer?.name || nfe.customer?.companyName || "—"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">CPF/CNPJ</p>
                    <p className="font-medium">
                      {nfe.customer?.cnpj ||
                        nfe.customer?.cpf ||
                        nfe.customer?.cpfCnpj ||
                        nfe.destinatarioCnpjCpf ||
                        "—"}
                    </p>
                  </div>
                  {(nfe.destinatarioIe || nfe.customer?.stateRegistration) && (
                    <div>
                      <p className="text-sm text-muted-foreground">Inscrição Estadual</p>
                      <p className="font-medium">{nfe.destinatarioIe || nfe.customer?.stateRegistration}</p>
                    </div>
                  )}
                </div>
                {(nfe.destLogradouro || nfe.destCidade) && (
                  <div>
                    <p className="text-sm text-muted-foreground">Endereço</p>
                    <p className="text-sm">
                      {nfe.destLogradouro}, {nfe.destNumero}
                      {nfe.destComplemento && ` - ${nfe.destComplemento}`}
                      <br />
                      {nfe.destBairro} - {nfe.destCidade}/{nfe.destEstado}
                      <br />
                      CEP: {nfe.destCep}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Itens */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Produtos/Serviços
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead className="text-right">Valor Unit.</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {nfe.items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.numero}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.descricao}</p>
                            <p className="text-xs text-muted-foreground">
                              Cód: {item.codigoProduto} | NCM: {item.ncm} | CFOP: {item.cfop}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantidadeComercial} {item.unidadeComercial}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.valorUnitarioComercial)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(item.valorProduto)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-medium">
                        Total dos Produtos
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(nfe.valorProdutos)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>

            {/* Transporte */}
            {nfe.modalidadeFrete !== "SEM_FRETE" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Transporte
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Modalidade do Frete</p>
                    <p className="font-medium">
                      {nfe.modalidadeFrete === "EMITENTE"
                        ? "Por conta do Emitente"
                        : nfe.modalidadeFrete === "DESTINATARIO"
                        ? "Por conta do Destinatário"
                        : "Por conta de Terceiros"}
                    </p>
                  </div>
                  {nfe.transportadoraNome && (
                    <div>
                      <p className="text-sm text-muted-foreground">Transportadora</p>
                      <p className="font-medium">{nfe.transportadoraNome}</p>
                    </div>
                  )}
                  {nfe.veiculoPlaca && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Placa do Veículo</p>
                        <p className="font-medium">{nfe.veiculoPlaca}</p>
                      </div>
                      {nfe.veiculoUF && (
                        <div>
                          <p className="text-sm text-muted-foreground">UF</p>
                          <p className="font-medium">{nfe.veiculoUF}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {nfe.volumeQuantidade && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Volume</p>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Quantidade</p>
                          <p className="font-medium">{nfe.volumeQuantidade}</p>
                        </div>
                        {nfe.volumeEspecie && (
                          <div>
                            <p className="text-xs text-muted-foreground">Espécie</p>
                            <p className="font-medium">{nfe.volumeEspecie}</p>
                          </div>
                        )}
                        {nfe.volumePesoBruto && (
                          <div>
                            <p className="text-xs text-muted-foreground">Peso Bruto (kg)</p>
                            <p className="font-medium">{nfe.volumePesoBruto}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Informações Adicionais */}
            {(nfe.informacoesComplementares || nfe.informacoesFisco || nfe.observacoes) && (
              <Card>
                <CardHeader>
                  <CardTitle>Informações Adicionais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {nfe.informacoesComplementares && (
                    <div>
                      <p className="text-sm text-muted-foreground">Informações Complementares</p>
                      <p className="text-sm whitespace-pre-wrap">{nfe.informacoesComplementares}</p>
                    </div>
                  )}
                  {nfe.informacoesFisco && (
                    <div>
                      <p className="text-sm text-muted-foreground">Informações ao Fisco</p>
                      <p className="text-sm whitespace-pre-wrap">{nfe.informacoesFisco}</p>
                    </div>
                  )}
                  {nfe.observacoes && (
                    <div>
                      <p className="text-sm text-muted-foreground">Observações</p>
                      <p className="text-sm whitespace-pre-wrap">{nfe.observacoes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Coluna Lateral */}
          <div className="space-y-6">
            {/* Resumo Financeiro */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Valor dos Produtos</span>
                  <span className="font-medium">{formatCurrency(nfe.valorProdutos)}</span>
                </div>
                {nfe.valorFrete > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frete</span>
                    <span className="font-medium">+ {formatCurrency(nfe.valorFrete)}</span>
                  </div>
                )}
                {nfe.valorSeguro > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Seguro</span>
                    <span className="font-medium">+ {formatCurrency(nfe.valorSeguro)}</span>
                  </div>
                )}
                {nfe.valorDesconto > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Desconto</span>
                    <span className="font-medium text-destructive">
                      - {formatCurrency(nfe.valorDesconto)}
                    </span>
                  </div>
                )}
                {nfe.valorOutrasDespesas > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Outras Despesas</span>
                    <span className="font-medium">+ {formatCurrency(nfe.valorOutrasDespesas)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Valor Total da NF-e</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(nfe.valorTotal)}
                  </span>
                </div>
                {nfe.valorTributosTotal && nfe.valorTributosTotal > 0 && (
                  <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                    Tributos: {formatCurrency(nfe.valorTributosTotal)}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Datas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Datas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {nfe.dataEmissao && (
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Emissão</p>
                    <p className="font-medium">{formatDate(nfe.dataEmissao)}</p>
                  </div>
                )}
                {nfe.dataSaida && (
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Saída</p>
                    <p className="font-medium">{formatDate(nfe.dataSaida)}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Criado em</p>
                  <p className="font-medium">{formatDate(nfe.createdAt)}</p>
                </div>
                {nfe.updatedAt !== nfe.createdAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Atualizado em</p>
                    <p className="font-medium">{formatDate(nfe.updatedAt)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Eventos */}
            {nfe.events && nfe.events.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Eventos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {nfe.events.map((event) => (
                      <div key={event.id} className="flex gap-3 text-sm">
                        <div className="flex-shrink-0 mt-1">
                          {event.tipo === "CONFIRMACAO_OPERACAO" ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : event.tipo === "CANCELAMENTO" ? (
                            <XCircle className="h-4 w-4 text-red-600" />
                          ) : event.tipo === "ERRO" ? (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          ) : (
                            <FileText className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{event.descricao}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(event.dataEvento)}
                          </p>
                          {event.protocolo && (
                            <p className="text-xs text-muted-foreground">
                              Protocolo: {event.protocolo}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Dialog de Cancelamento */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar NF-e</DialogTitle>
            <DialogDescription>
              Para cancelar a NF-e é necessário informar uma justificativa. O cancelamento será
              registrado na SEFAZ e não poderá ser desfeito.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="justificativa">Justificativa do Cancelamento *</Label>
              <Textarea
                id="justificativa"
                placeholder="Mínimo de 15 caracteres..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
                maxLength={255}
              />
              <p className="text-xs text-muted-foreground">
                {cancelReason.length}/255 caracteres (mínimo 15)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={actionLoading}
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelar}
              disabled={actionLoading || cancelReason.trim().length < 15}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                "Confirmar Cancelamento"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Rascunho</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este rascunho? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir Rascunho"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
