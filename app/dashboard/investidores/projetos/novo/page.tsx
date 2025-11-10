"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, Loader2, AlertCircle, Upload, X, FileText, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/api/auth"
import {
  projectsApi,
  type CreateProjectDto,
  type ProjectStatus,
} from "@/lib/api/projects"
import {
  projectDocumentsApi,
  type DocumentCategory,
} from "@/lib/api/project-documents"

export default function NovoProjetoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const selectedCompany = authApi.getSelectedCompany()
  
  const [loading, setLoading] = useState(false)
  const [attachments, setAttachments] = useState<string[]>([])
  const [newAttachment, setNewAttachment] = useState("")

    const [isSaving, setIsSaving] = useState(false)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [attachmentUrl, setAttachmentUrl] = useState("")
  const [uploadingFiles, setUploadingFiles] = useState<boolean>(false)

  // Estados do formulário
  const [formData, setFormData] = useState<CreateProjectDto>({
    code: "",
    name: "",
    description: "",
    totalValue: 0,
    startDate: "",
    endDate: "",
    status: "ATIVO",
    active: true,
    attachments: [],
  })

  const [expectedReturn, setExpectedReturn] = useState(0)

  // Estados dos documentos para upload
  const [documentFiles, setDocumentFiles] = useState<
    Array<{
      file: File
      category: DocumentCategory
      name: string
      description: string
      tags: string
    }>
  >([])
  const [newDocument, setNewDocument] = useState<{
    category: DocumentCategory
    name: string
    description: string
    tags: string
  }>({
    category: "OUTRO",
    name: "",
    description: "",
    tags: "",
  })

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddAttachment = () => {
    if (attachmentUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), attachmentUrl.trim()],
      }))
      setAttachmentUrl("")
    }
  }

  const handleRemoveAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments?.filter((_, i) => i !== index) || [],
    }))
  }

  // Funções para manipular documentos
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]

    // Validar tipo de arquivo
    if (!projectDocumentsApi.helpers.isValidFileType(file)) {
      toast({
        title: "Tipo de arquivo inválido",
        description:
          "Apenas arquivos PDF, Word, Excel e imagens são permitidos",
        variant: "destructive",
      })
      return
    }

    // Validar tamanho
    if (!projectDocumentsApi.helpers.isValidFileSize(file)) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 10MB",
        variant: "destructive",
      })
      return
    }

    // Adicionar à lista de documentos pendentes
    setDocumentFiles(prev => [
      ...prev,
      {
        file,
        category: newDocument.category,
        name: newDocument.name || file.name,
        description: newDocument.description,
        tags: newDocument.tags,
      },
    ])

    // Limpar formulário de documento
    setNewDocument({
      category: "OUTRO",
      name: "",
      description: "",
      tags: "",
    })

    // Limpar input file
    e.target.value = ""
  }

  const handleRemoveDocumentFile = (index: number) => {
    setDocumentFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCompany?.id) {
      toast({
        title: "Erro",
        description: "Nenhuma empresa selecionada",
        variant: "destructive",
      })
      return
    }

    // Validações básicas
    if (
      !formData.name ||
      !formData.code ||
      !formData.totalValue ||
      !formData.startDate
    ) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, código, valor total e data de início",
        variant: "destructive",
      })
      return
    }

    const totalValue = Number(formData.totalValue)
    if (totalValue <= 0) {
      toast({
        title: "Valor inválido",
        description: "O valor total deve ser maior que zero",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)

      const payload: CreateProjectDto = {
        name: formData.name,
        code: formData.code,
        description: formData.description || undefined,
        totalValue,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        status: formData.status,
        active: formData.active,
        attachments:
          formData.attachments && formData.attachments.length > 0
            ? formData.attachments
            : undefined,
      }

      const createdProject = await projectsApi.create(selectedCompany.id, payload)

      // Upload de documentos (se houver)
      if (documentFiles.length > 0) {
        setUploadingFiles(true)
        
        for (const doc of documentFiles) {
          try {
            await projectDocumentsApi.upload({
              projectId: createdProject.id,
              file: doc.file,
              category: doc.category,
              name: doc.name,
              description: doc.description,
              tags: doc.tags || undefined,
            })
          } catch (error) {
            console.error("Erro ao fazer upload do documento:", doc.name, error)
            // Continuar com os próximos documentos mesmo se um falhar
          }
        }
        
        setUploadingFiles(false)
      }

      toast({
        title: "Sucesso",
        description: `Projeto cadastrado com sucesso${
          documentFiles.length > 0
            ? ` com ${documentFiles.length} documento(s)`
            : ""
        }`,
      })

      router.push("/dashboard/investidores/projetos")
    } catch (error: any) {
      console.error("Erro ao criar projeto:", error)
      toast({
        title: "Erro ao criar projeto",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
      setUploadingFiles(false)
    }
  }

  if (!selectedCompany) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Nenhuma empresa selecionada</h3>
            <p className="text-sm text-muted-foreground">Selecione uma empresa para continuar</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Novo Projeto</h1>
            <p className="text-muted-foreground">Cadastrar novo projeto SCP</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {/* Informações Básicas */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                  <CardDescription>Dados principais do projeto</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="name">
                        Nome do Projeto <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="Ex: Empreendimento Solar ABC"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="code">
                        Código <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="code"
                        placeholder="Ex: SOLAR-001"
                        value={formData.code}
                        onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Código único para identificação do projeto
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="totalValue">
                        Valor Total <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="totalValue"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        value={formData.totalValue}
                        onChange={(e) => handleChange("totalValue", e.target.value)}
                        required
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        placeholder="Descreva o projeto e seus objetivos..."
                        className="min-h-[100px]"
                        value={formData.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Período */}
              <Card>
                <CardHeader>
                  <CardTitle>Período do Projeto</CardTitle>
                  <CardDescription>Datas de início e término</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">
                        Data de Início <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleChange("startDate", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">Data de Término (Prevista)</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleChange("endDate", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Anexos */}
              <Card>
                <CardHeader>
                  <CardTitle>Documentos e Anexos</CardTitle>
                  <CardDescription>Links para documentos relacionados ao projeto</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Cole o link do documento (ex: https://...)"
                      value={newAttachment}
                      onChange={(e) => setNewAttachment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddAttachment()
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddAttachment}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>

                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      <Label>Documentos Adicionados</Label>
                      <div className="space-y-2">
                        {attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <a
                              href={attachment}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline truncate flex-1"
                            >
                              {attachment}
                            </a>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveAttachment(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.attachments && formData.attachments.length === 0 && (
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Nenhum documento adicionado
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Cole o link do documento acima e clique em Adicionar
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upload de Arquivos */}
              <Card>
                <CardHeader>
                  <CardTitle>Upload de Documentos</CardTitle>
                  <CardDescription>
                    Faça upload de arquivos PDF, Word, Excel ou imagens (máx. 10MB)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Formulário de Novo Documento */}
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <div className="space-y-2">
                      <Label htmlFor="doc-category">Categoria *</Label>
                      <select
                        id="doc-category"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={newDocument.category}
                        onChange={e =>
                          setNewDocument(prev => ({
                            ...prev,
                            category: e.target.value as DocumentCategory,
                          }))
                        }
                      >
                        <option value="CONTRATO">Contrato</option>
                        <option value="ESTATUTO">Estatuto</option>
                        <option value="ATA">Ata de Reunião</option>
                        <option value="RELATORIO">Relatório</option>
                        <option value="COMPROVANTE">Comprovante</option>
                        <option value="LICENCA">Licença</option>
                        <option value="ALVARA">Alvará</option>
                        <option value="PROJETO_TECNICO">Projeto Técnico</option>
                        <option value="PLANILHA">Planilha</option>
                        <option value="OUTRO">Outro</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="doc-name">Nome do Documento</Label>
                      <Input
                        id="doc-name"
                        placeholder="Ex: Contrato Social 2024"
                        value={newDocument.name}
                        onChange={e =>
                          setNewDocument(prev => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Deixe em branco para usar o nome do arquivo
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="doc-description">Descrição</Label>
                      <textarea
                        id="doc-description"
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Descreva o conteúdo do documento..."
                        value={newDocument.description}
                        onChange={e =>
                          setNewDocument(prev => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="doc-tags">Tags</Label>
                      <Input
                        id="doc-tags"
                        placeholder="Ex: importante, financeiro, 2024"
                        value={newDocument.tags}
                        onChange={e =>
                          setNewDocument(prev => ({
                            ...prev,
                            tags: e.target.value,
                          }))
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Separe as tags por vírgula
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="doc-file">Selecionar Arquivo *</Label>
                      <Input
                        id="doc-file"
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                        onChange={handleFileSelect}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground">
                        PDF, Word, Excel, ou Imagens (máx. 10MB)
                      </p>
                    </div>
                  </div>

                  {/* Lista de Documentos Pendentes */}
                  {documentFiles.length > 0 && (
                    <div className="space-y-2">
                      <Label>
                        Documentos a serem enviados ({documentFiles.length})
                      </Label>
                      <div className="space-y-2">
                        {documentFiles.map((doc, index) => {
                          return (
                            <div
                              key={index}
                              className="flex items-start gap-3 p-3 border rounded-lg bg-background"
                            >
                              <FileText className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                      {doc.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {projectDocumentsApi.helpers.getCategoryLabel(
                                        doc.category
                                      )}{" "}
                                      •{" "}
                                      {projectDocumentsApi.helpers.formatFileSize(
                                        doc.file.size
                                      )}
                                    </p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveDocumentFile(index)}
                                    className="flex-shrink-0"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                {doc.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {doc.description}
                                  </p>
                                )}
                                {doc.tags && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {doc.tags.split(",").map((tag, i) => (
                                      <span
                                        key={i}
                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground"
                                      >
                                        {tag.trim()}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {documentFiles.length === 0 && (
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Nenhum arquivo selecionado
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Preencha os campos acima e selecione um arquivo
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Status do Projeto</CardTitle>
                  <CardDescription>Estado atual do projeto</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => handleChange("status", value as ProjectStatus)}
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ATIVO">Ativo</SelectItem>
                        <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                        <SelectItem value="CANCELADO">Cancelado</SelectItem>
                        <SelectItem value="SUSPENSO">Suspenso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="active"
                      checked={formData.active}
                      onCheckedChange={(checked) => handleChange("active", checked)}
                    />
                    <Label htmlFor="active" className="text-sm font-normal cursor-pointer">
                      Projeto Ativo
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Informações Adicionais */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Investido:</span>
                    <span className="font-semibold">R$ 0,00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Distribuído:</span>
                    <span className="font-semibold">R$ 0,00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Disponível:</span>
                    <span className="font-semibold">R$ 0,00</span>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-xs">
                      Os valores serão atualizados após cadastrar aportes e distribuições
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Ações */}
              <Card>
                <CardContent className="pt-6 space-y-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSaving || uploadingFiles}
                  >
                    {uploadingFiles ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando documentos...
                      </>
                    ) : isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando projeto...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Projeto
                        {documentFiles.length > 0 &&
                          ` (+ ${documentFiles.length} doc${
                            documentFiles.length > 1 ? "s" : ""
                          })`}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.back()}
                    disabled={isSaving || uploadingFiles}
                  >
                    Cancelar
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
