"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Upload, 
  FileText, 
  Trash2, 
  Eye, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Filter,
  X
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/api/auth"
import { ofxApi, type OFXImport, type OFXImportResponse, bankAccountsApi, type BankAccount } from "@/lib/api/financial"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

export default function ExtratosOFX() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const selectedCompany = authApi.getSelectedCompany()

  const [imports, setImports] = useState<OFXImport[]>([])
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedBankAccount, setSelectedBankAccount] = useState<string>("")
  const [importResult, setImportResult] = useState<OFXImportResponse | null>(null)
  const [showResultDialog, setShowResultDialog] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  
  // Filtros
  const [filterBankAccount, setFilterBankAccount] = useState<string>("all")
  const [filterStartDate, setFilterStartDate] = useState("")
  const [filterEndDate, setFilterEndDate] = useState("")

  useEffect(() => {
    if (selectedCompany?.id) {
      loadBankAccounts()
      loadImports()
    }
  }, [selectedCompany?.id])

  const loadBankAccounts = async () => {
    try {
      if (!selectedCompany?.id) return
      const accounts = await bankAccountsApi.getAll(selectedCompany.id)
      setBankAccounts(accounts)
    } catch (error: any) {
      console.error("Erro ao carregar contas bancárias:", error)
    }
  }

  const loadImports = async () => {
    try {
      setLoading(true)
      if (!selectedCompany?.id) return

      const response = await ofxApi.listImports({
        companyId: selectedCompany.id,
        bankAccountId: filterBankAccount !== "all" ? filterBankAccount : undefined,
        startDate: filterStartDate || undefined,
        endDate: filterEndDate || undefined,
      })

      setImports(response.data)
    } catch (error: any) {
      console.error("Erro ao carregar extratos:", error)
      toast({
        title: "Erro ao carregar extratos",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.name.toLowerCase().endsWith('.ofx')) {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione um arquivo .ofx",
          variant: "destructive",
        })
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !selectedBankAccount || !selectedCompany?.id) {
      toast({
        title: "Dados incompletos",
        description: "Selecione um arquivo OFX e uma conta bancária",
        variant: "destructive",
      })
      return
    }

    try {
      setUploading(true)
      const result = await ofxApi.importOFX(
        selectedCompany.id,
        selectedBankAccount,
        selectedFile
      )

      setImportResult(result)
      setShowResultDialog(true)
      setSelectedFile(null)
      setSelectedBankAccount("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Recarregar lista de extratos
      await loadImports()

      toast({
        title: "Extrato importado com sucesso",
        description: `${result.totalTransactions} transações processadas`,
      })
    } catch (error: any) {
      console.error("Erro ao importar extrato:", error)
      toast({
        title: "Erro ao importar extrato",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId || !selectedCompany?.id) return

    try {
      await ofxApi.deleteImport(selectedCompany.id, deleteId)
      
      toast({
        title: "Extrato deletado",
        description: "O extrato foi removido com sucesso",
      })

      setShowDeleteDialog(false)
      setDeleteId(null)
      await loadImports()
    } catch (error: any) {
      console.error("Erro ao deletar extrato:", error)
      toast({
        title: "Erro ao deletar extrato",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    }
  }

  const handleGoToConciliation = () => {
    setShowResultDialog(false)
    router.push('/dashboard/financeiro/conciliacao')
  }

  const clearFilters = () => {
    setFilterBankAccount("all")
    setFilterStartDate("")
    setFilterEndDate("")
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      COMPLETED: { variant: "default", label: "Concluído" },
      PROCESSING: { variant: "secondary", label: "Processando" },
      ERROR: { variant: "destructive", label: "Erro" },
      PENDING: { variant: "outline", label: "Pendente" },
    }
    const config = variants[status] || variants.PENDING
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Extratos Bancários (OFX)</h1>
          <p className="text-muted-foreground">Importe e gerencie extratos bancários em formato OFX</p>
        </div>

        {/* Upload de Arquivo */}
        <Card>
          <CardHeader>
            <CardTitle>Importar Extrato OFX</CardTitle>
            <CardDescription>
              Faça upload de um arquivo OFX para importar transações bancárias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="file">Arquivo OFX</Label>
                <Input
                  ref={fileInputRef}
                  id="file"
                  type="file"
                  accept=".ofx"
                  onChange={handleFileSelect}
                  disabled={uploading}
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAccount">Conta Bancária</Label>
                <Select
                  value={selectedBankAccount}
                  onValueChange={setSelectedBankAccount}
                  disabled={uploading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.accountName} - {account.bankName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={handleUpload} 
                  disabled={!selectedFile || !selectedBankAccount || uploading}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Importar Extrato
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Filtros</span>
              {(filterBankAccount !== "all" || filterStartDate || filterEndDate) && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Limpar Filtros
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Conta Bancária</Label>
                <Select value={filterBankAccount} onValueChange={setFilterBankAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as contas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as contas</SelectItem>
                    {bankAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.accountName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data Inicial</Label>
                <Input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Data Final</Label>
                <Input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <Button onClick={loadImports} className="w-full" disabled={loading}>
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Filter className="mr-2 h-4 w-4" />
                  )}
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Extratos */}
        <Card>
          <CardHeader>
            <CardTitle>Extratos Importados</CardTitle>
            <CardDescription>Histórico de extratos OFX importados</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : imports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum extrato importado ainda</p>
                <p className="text-sm text-muted-foreground">
                  Faça upload de um arquivo OFX para começar
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data Importação</TableHead>
                      <TableHead>Arquivo</TableHead>
                      <TableHead>Conta Bancária</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead className="text-right">Transações</TableHead>
                      <TableHead className="text-right">Conciliadas</TableHead>
                      <TableHead className="text-right">Duplicadas</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {imports.map((importItem) => (
                      <TableRow key={importItem.id}>
                        <TableCell>{formatDate(importItem.importedAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{importItem.fileName}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(importItem.fileSize)}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{importItem.bankAccount?.accountName}</p>
                            <p className="text-xs text-muted-foreground">
                              {importItem.bankAccount?.bankName}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">
                            {formatDate(importItem.startDate)} - {formatDate(importItem.endDate)}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">{importItem.totalTransactions}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {importItem.reconciledCount}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {importItem.duplicateCount > 0 ? (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              {importItem.duplicateCount}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(importItem.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/dashboard/financeiro/extratos/${importItem.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeleteId(importItem.id)
                                setShowDeleteDialog(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog de Resultado da Importação */}
        <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Resultado da Importação</DialogTitle>
              <DialogDescription>
                Resumo das transações processadas do arquivo OFX
              </DialogDescription>
            </DialogHeader>

            {importResult && (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Importação Concluída</AlertTitle>
                  <AlertDescription>
                    O extrato foi importado com sucesso. Agora você pode conciliar as transações.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Total de Transações</CardDescription>
                      <CardTitle className="text-3xl">{importResult.totalTransactions}</CardTitle>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Precisam Revisão</CardDescription>
                      <CardTitle className="text-3xl text-amber-600">
                        {importResult.needsReview}
                      </CardTitle>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Já Importadas</CardDescription>
                      <CardTitle className="text-3xl text-muted-foreground">
                        {importResult.alreadyImported}
                      </CardTitle>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Auto Conciliadas</CardDescription>
                      <CardTitle className="text-3xl text-green-600">
                        {importResult.autoMatched}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                {importResult.needsReview > 0 && (
                  <Alert variant="default" className="border-amber-200 bg-amber-50">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-900">Ação Necessária</AlertTitle>
                    <AlertDescription className="text-amber-800">
                      Existem {importResult.needsReview} transações que precisam de revisão manual.
                      Vá para a tela de conciliação para revisar e conciliar essas transações.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowResultDialog(false)}>
                Fechar
              </Button>
              <Button onClick={handleGoToConciliation}>
                Ir para Conciliação
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmação de Exclusão */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja deletar este extrato? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>

            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Atenção</AlertTitle>
              <AlertDescription>
                Deletar um extrato OFX remove apenas o registro da importação.
                As transações que foram conciliadas permanecem conciliadas no sistema.
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Deletar Extrato
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
