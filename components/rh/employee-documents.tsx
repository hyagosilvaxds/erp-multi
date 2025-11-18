'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
import { authApi } from '@/lib/api/auth'
import {
  employeeDocumentsApi,
  documentTypeLabels,
  formatFileSize,
  isDocumentExpiringSoon,
  isDocumentExpired,
  getFileIcon,
  isValidFileType,
  isValidFileSize,
  type EmployeeDocument,
  type DocumentType,
} from '@/lib/api/employee-documents'
import {
  FileText,
  Upload,
  Download,
  Trash2,
  AlertCircle,
  Eye,
  X,
  Edit,
} from 'lucide-react'

interface EmployeeDocumentsProps {
  employeeId: string
  employeeContractType?: string
}

export function EmployeeDocuments({ employeeId, employeeContractType }: EmployeeDocumentsProps) {
  const { toast } = useToast()
  
  const [documents, setDocuments] = useState<EmployeeDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<EmployeeDocument | null>(null)
  
  // Filters
  const [filterDocumentType, setFilterDocumentType] = useState<DocumentType | 'all'>('all')
  const [filterVerified, setFilterVerified] = useState<'all' | 'true' | 'false'>('all')
  const [filterActive, setFilterActive] = useState<'all' | 'true' | 'false'>('all')
  
  // Upload form
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<DocumentType | ''>('')
  const [documentName, setDocumentName] = useState('')
  const [description, setDescription] = useState('')
  const [documentNumber, setDocumentNumber] = useState('')
  const [issueDate, setIssueDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    loadDocuments()
  }, [employeeId, filterDocumentType, filterVerified, filterActive])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      
      const params: any = {}
      if (filterDocumentType !== 'all') {
        params.documentType = filterDocumentType
      }
      if (filterVerified !== 'all') {
        params.verified = filterVerified === 'true'
      }
      if (filterActive !== 'all') {
        params.active = filterActive === 'true'
      }
      
      const response = await employeeDocumentsApi.getAll(employeeId, params)
      setDocuments(response.data)
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar documentos',
        description: error.response?.data?.message || 'Não foi possível carregar os documentos.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!isValidFileType(file)) {
      toast({
        title: 'Tipo de arquivo inválido',
        description: 'Apenas PDF, JPG, PNG, DOC e DOCX são permitidos.',
        variant: 'destructive',
      })
      return
    }

    if (!isValidFileSize(file, 10)) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O tamanho máximo permitido é 10MB.',
        variant: 'destructive',
      })
      return
    }

    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile || !documentType) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Selecione um arquivo e o tipo de documento.',
        variant: 'destructive',
      })
      return
    }

    try {
      setUploading(true)

      await employeeDocumentsApi.upload(employeeId, {
        file: selectedFile,
        documentType: documentType as DocumentType,
        name: documentName || undefined,
        description: description || undefined,
        documentNumber: documentNumber || undefined,
        issueDate: issueDate || undefined,
        expiryDate: expiryDate || undefined,
        notes: notes || undefined,
      })

      toast({
        title: 'Documento enviado',
        description: 'O documento foi enviado com sucesso.',
      })

      // Reset form
      setSelectedFile(null)
      setDocumentType('')
      setDocumentName('')
      setDescription('')
      setDocumentNumber('')
      setIssueDate('')
      setExpiryDate('')
      setNotes('')
      setUploadDialogOpen(false)

      // Reload documents
      await loadDocuments()
    } catch (error: any) {
      toast({
        title: 'Erro ao enviar documento',
        description: error.response?.data?.message || 'Não foi possível enviar o documento.',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleOpenEditDialog = (document: EmployeeDocument) => {
    setSelectedDocument(document)
    setDocumentName(document.name)
    setDescription(document.description || '')
    setDocumentNumber(document.documentNumber || '')
    setIssueDate(document.issueDate ? document.issueDate.split('T')[0] : '')
    setExpiryDate(document.expiryDate ? document.expiryDate.split('T')[0] : '')
    setNotes(document.notes || '')
    setEditDialogOpen(true)
  }

  const handleEdit = async () => {
    if (!selectedDocument) return

    try {
      setUploading(true)

      await employeeDocumentsApi.update(employeeId, selectedDocument.id, {
        name: documentName || undefined,
        description: description || undefined,
        documentNumber: documentNumber || undefined,
        issueDate: issueDate || undefined,
        expiryDate: expiryDate || undefined,
        notes: notes || undefined,
      })

      toast({
        title: 'Documento atualizado',
        description: 'O documento foi atualizado com sucesso.',
      })

      // Reset form
      setSelectedDocument(null)
      setDocumentName('')
      setDescription('')
      setDocumentNumber('')
      setIssueDate('')
      setExpiryDate('')
      setNotes('')
      setEditDialogOpen(false)

      // Reload documents
      await loadDocuments()
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar documento',
        description: error.response?.data?.message || 'Não foi possível atualizar o documento.',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedDocument) return

    try {
      await employeeDocumentsApi.delete(employeeId, selectedDocument.id)
      
      toast({
        title: 'Documento excluído',
        description: 'O documento foi excluído com sucesso.',
      })

      setDeleteDialogOpen(false)
      setSelectedDocument(null)
      await loadDocuments()
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir documento',
        description: error.response?.data?.message || 'Não foi possível excluir o documento.',
        variant: 'destructive',
      })
    }
  }

  const handleDownload = async (doc: EmployeeDocument) => {
    try {
      // Pega o token de autenticação
      const token = localStorage.getItem('token')
      const company = authApi.getSelectedCompany()
      
      if (!token || !company) {
        toast({
          title: 'Erro de autenticação',
          description: 'Não foi possível autenticar. Faça login novamente.',
          variant: 'destructive',
        })
        return
      }

      // Faz a requisição com autenticação
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/employees/${employeeId}/documents/${doc.id}/download`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-company-id': company.id,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Falha ao baixar o documento')
      }

      // Converte para blob e faz o download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.fileName || 'documento.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)

      toast({
        title: 'Download iniciado',
        description: 'O arquivo está sendo baixado.',
      })
    } catch (error: any) {
      toast({
        title: 'Erro ao baixar documento',
        description: error.message || 'Não foi possível baixar o documento.',
        variant: 'destructive',
      })
    }
  }

  const getDocumentStatusBadge = (document: EmployeeDocument) => {
    if (isDocumentExpired(document.expiryDate)) {
      return <Badge variant="destructive">Vencido</Badge>
    }
    if (isDocumentExpiringSoon(document.expiryDate)) {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Vence em breve</Badge>
    }
    if (document.verified) {
      return <Badge variant="default" className="bg-green-600">Verificado</Badge>
    }
    return <Badge variant="secondary">Pendente</Badge>
  }

  const formatDate = (date?: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="filterDocumentType">Tipo de Documento</Label>
              <Select 
                value={filterDocumentType} 
                onValueChange={(value: DocumentType | 'all') => setFilterDocumentType(value)}
              >
                <SelectTrigger id="filterDocumentType">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {Object.entries(documentTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterVerified">Status de Verificação</Label>
              <Select value={filterVerified} onValueChange={(value) => setFilterVerified(value as 'all' | 'true' | 'false')}>
                <SelectTrigger id="filterVerified">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">Verificados</SelectItem>
                  <SelectItem value="false">Não Verificados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterActive">Status</Label>
              <Select value={filterActive} onValueChange={(value) => setFilterActive(value as 'all' | 'true' | 'false')}>
                <SelectTrigger id="filterActive">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">Ativos</SelectItem>
                  <SelectItem value="false">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Documentos</CardTitle>
              <CardDescription>
                {!documents || documents.length === 0 ? '0 documentos' : `${documents.length} ${documents.length === 1 ? 'documento' : 'documentos'}`}
              </CardDescription>
            </div>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Enviar Documento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Carregando...</p>
              </div>
            </div>
          ) : !documents || documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum documento enviado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Comece enviando os documentos do colaborador.
              </p>
              <Button onClick={() => setUploadDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Enviar Primeiro Documento
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Arquivo</TableHead>
                    <TableHead>Número</TableHead>
                    <TableHead>Emissão</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{getFileIcon(document.mimeType)}</span>
                          <span className="font-medium text-sm">
                            {documentTypeLabels[document.documentType]}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">{document.fileName}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatFileSize(document.fileSize)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {document.documentNumber || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(document.issueDate)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(document.expiryDate)}
                      </TableCell>
                      <TableCell>
                        {getDocumentStatusBadge(document)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedDocument(document)
                              setViewDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownload(document)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditDialog(document)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedDocument(document)
                              setDeleteDialogOpen(true)
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

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enviar Documento</DialogTitle>
            <DialogDescription>
              Envie um novo documento do colaborador. Tipos aceitos: PDF, JPG, PNG, DOC, DOCX (máx. 10MB)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="file">Arquivo *</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileChange}
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentType">Tipo de Documento *</Label>
              <Select value={documentType} onValueChange={(value: DocumentType) => setDocumentType(value)}>
                <SelectTrigger id="documentType">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(documentTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentName">Nome do Documento</Label>
              <Input
                id="documentName"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="Nome customizado (deixe vazio para usar nome do arquivo)"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="documentNumber">Número do Documento</Label>
                <Input
                  id="documentNumber"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="Ex: 12.345.678-9"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="issueDate">Data de Emissão</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="expiryDate">Data de Validade</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Informações adicionais sobre o documento"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações adicionais"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)} disabled={uploading}>
              Cancelar
            </Button>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? 'Enviando...' : 'Enviar Documento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Documento</DialogTitle>
            <DialogDescription>
              Atualize as informações do documento (não é possível alterar o arquivo).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editDocumentName">Nome do Documento</Label>
              <Input
                id="editDocumentName"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="Nome do documento"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="editDocumentNumber">Número do Documento</Label>
                <Input
                  id="editDocumentNumber"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="Ex: 12.345.678-9"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editIssueDate">Data de Emissão</Label>
                <Input
                  id="editIssueDate"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="editExpiryDate">Data de Validade</Label>
                <Input
                  id="editExpiryDate"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editDescription">Descrição</Label>
              <Textarea
                id="editDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Informações adicionais sobre o documento"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editNotes">Observações</Label>
              <Textarea
                id="editNotes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações adicionais"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={uploading}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={uploading}>
              {uploading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Documento</DialogTitle>
          </DialogHeader>

          {selectedDocument && (
            <div className="space-y-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Tipo</Label>
                  <p className="font-medium">{documentTypeLabels[selectedDocument.documentType]}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    {getDocumentStatusBadge(selectedDocument)}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Arquivo</Label>
                  <p className="font-medium">{selectedDocument.fileName}</p>
                  <p className="text-sm text-muted-foreground">{formatFileSize(selectedDocument.fileSize)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Número</Label>
                  <p className="font-medium">{selectedDocument.documentNumber || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data de Emissão</Label>
                  <p className="font-medium">{formatDate(selectedDocument.issueDate)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data de Validade</Label>
                  <p className="font-medium">{formatDate(selectedDocument.expiryDate)}</p>
                </div>
              </div>

              {selectedDocument.description && (
                <div>
                  <Label className="text-muted-foreground">Descrição</Label>
                  <p className="mt-1">{selectedDocument.description}</p>
                </div>
              )}

              {selectedDocument.notes && (
                <div>
                  <Label className="text-muted-foreground">Observações</Label>
                  <p className="mt-1">{selectedDocument.notes}</p>
                </div>
              )}

              {selectedDocument.uploadedBy && (
                <div>
                  <Label className="text-muted-foreground">Enviado por</Label>
                  <p className="font-medium">{selectedDocument.uploadedBy.name}</p>
                  {selectedDocument.uploadedBy.email && (
                    <p className="text-sm text-muted-foreground">
                      {selectedDocument.uploadedBy.email}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedDocument.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Fechar
            </Button>
            {selectedDocument && (
              <Button onClick={() => handleDownload(selectedDocument)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
