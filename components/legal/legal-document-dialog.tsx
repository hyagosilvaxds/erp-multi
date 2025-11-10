"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { useToast } from "@/hooks/use-toast"
import {
  createLegalDocument,
  updateLegalDocument,
  type LegalDocument,
  type LegalDocumentType,
  type LegalDocumentStatus,
  LEGAL_DOCUMENT_TYPE_LABELS,
  LEGAL_DOCUMENT_STATUS_LABELS,
} from "@/lib/api/legal-documents"
import { type LegalCategory } from "@/lib/api/legal-categories"
import { Loader2, Upload, X, FileText } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface LegalDocumentDialogProps {
  open: boolean
  onOpenChange: (success: boolean) => void
  document?: LegalDocument | null
  categories: LegalCategory[]
}

export function LegalDocumentDialog({
  open,
  onOpenChange,
  document,
  categories,
}: LegalDocumentDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    type: "CONTRATO" as LegalDocumentType,
    title: "",
    categoryId: "",
    description: "",
    reference: "",
    startDate: "",
    endDate: "",
    dueDate: "",
    status: "ATIVO" as LegalDocumentStatus,
    value: "",
    currency: "BRL",
    notes: "",
    tags: "",
    alertDays: "30",
    parties: [] as Array<{ name: string; role: string; document?: string }>,
  })
  const { toast } = useToast()

  useEffect(() => {
    if (document) {
      setFormData({
        type: document.type,
        title: document.title,
        categoryId: document.categoryId || "",
        description: document.description || "",
        reference: document.reference || "",
        startDate: document.startDate ? document.startDate.split("T")[0] : "",
        endDate: document.endDate ? document.endDate.split("T")[0] : "",
        dueDate: document.dueDate ? document.dueDate.split("T")[0] : "",
        status: document.status,
        value: document.value || "",
        currency: document.currency || "BRL",
        notes: document.notes || "",
        tags: document.tags?.join(", ") || "",
        alertDays: document.alertDays?.toString() || "30",
        parties: document.parties?.map(p => ({
          name: p.name,
          role: p.role,
          document: p.document || ""
        })) || [],
      })
    } else {
      setFormData({
        type: "CONTRATO",
        title: "",
        categoryId: "",
        description: "",
        reference: "",
        startDate: "",
        endDate: "",
        dueDate: "",
        status: "ATIVO",
        value: "",
        currency: "BRL",
        notes: "",
        tags: "",
        alertDays: "30",
        parties: [],
      })
      setSelectedFile(null)
    }
  }, [document, open])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de arquivo (apenas PDFs e imagens)
      const validTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Apenas arquivos PDF, Word e imagens são permitidos.",
          variant: "destructive",
        })
        return
      }

      // Validar tamanho (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 10MB.",
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast({
        title: "Erro de validação",
        description: "O título do documento é obrigatório.",
        variant: "destructive",
      })
      return
    }

    if (!document && !selectedFile) {
      toast({
        title: "Erro de validação",
        description: "Selecione um arquivo para upload.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      if (document) {
        // Atualizar documento existente
        await updateLegalDocument(document.id, {
          title: formData.title,
          categoryId: formData.categoryId || undefined,
          description: formData.description || undefined,
          reference: formData.reference || undefined,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
          dueDate: formData.dueDate || undefined,
          status: formData.status,
          value: formData.value ? parseFloat(formData.value) : undefined,
          currency: formData.currency,
          notes: formData.notes || undefined,
          tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : undefined,
          alertDays: parseInt(formData.alertDays),
          parties: formData.parties.length > 0 ? formData.parties : undefined,
        })
        toast({
          title: "Documento atualizado",
          description: "O documento foi atualizado com sucesso.",
        })
      } else {
        // Criar novo documento
        await createLegalDocument({
          file: selectedFile!,
          type: formData.type,
          title: formData.title,
          categoryId: formData.categoryId || undefined,
          description: formData.description || undefined,
          reference: formData.reference || undefined,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
          dueDate: formData.dueDate || undefined,
          status: formData.status,
          value: formData.value ? parseFloat(formData.value) : undefined,
          currency: formData.currency,
          notes: formData.notes || undefined,
          tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : [],
          alertDays: parseInt(formData.alertDays),
          parties: formData.parties.length > 0 ? formData.parties : undefined,
          documentName: formData.title,
          documentDescription: formData.description || undefined,
        })
        toast({
          title: "Documento criado",
          description: "O documento foi criado com sucesso.",
        })
      }

      onOpenChange(true)
    } catch (error) {
      toast({
        title: "Erro ao salvar documento",
        description: "Não foi possível salvar o documento. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addParty = () => {
    setFormData({
      ...formData,
      parties: [...formData.parties, { name: "", role: "", document: "" }],
    })
  }

  const removeParty = (index: number) => {
    setFormData({
      ...formData,
      parties: formData.parties.filter((_, i) => i !== index),
    })
  }

  const updateParty = (index: number, field: string, value: string) => {
    const newParties = [...formData.parties]
    newParties[index] = { ...newParties[index], [field]: value }
    setFormData({ ...formData, parties: newParties })
  }

  return (
    <Dialog open={open} onOpenChange={() => onOpenChange(false)}>
      <DialogContent className="max-h-[90vh] max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{document ? "Editar Documento" : "Novo Documento Jurídico"}</DialogTitle>
          <DialogDescription>
            {document
              ? "Atualize as informações do documento jurídico."
              : "Faça upload e preencha as informações do documento."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Upload de Arquivo - apenas para novo documento */}
              {!document && (
                <div className="grid gap-2">
                  <Label htmlFor="file">
                    Arquivo <span className="text-destructive">*</span>
                  </Label>
                  {selectedFile ? (
                    <div className="flex items-center gap-2 rounded-lg border p-3">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedFile(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label htmlFor="file" className="cursor-pointer">
                      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 hover:border-primary">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          Clique para selecionar um arquivo
                        </p>
                        <p className="text-xs text-muted-foreground">PDF, Word ou Imagem (máx. 10MB)</p>
                      </div>
                      <input
                        id="file"
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                      />
                    </label>
                  )}
                </div>
              )}

              {/* Informações Básicas */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="type">
                    Tipo <span className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.type} onValueChange={(value: LegalDocumentType) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LEGAL_DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: LegalDocumentStatus) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LEGAL_DOCUMENT_STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="title">
                  Título <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Ex: Contrato de Prestação de Serviços - Empresa ABC"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="categoryId">Categoria</Label>
                  <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                    <SelectTrigger id="categoryId">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhuma</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="reference">Referência / Número</Label>
                  <Input
                    id="reference"
                    placeholder="Ex: CONT-2025-001"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o documento..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Datas */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Data de Início</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Vencimento</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="endDate">Data de Término</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Valor e Alerta */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="value">Valor</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="alertDays">Alerta (dias antes do vencimento)</Label>
                  <Input
                    id="alertDays"
                    type="number"
                    value={formData.alertDays}
                    onChange={(e) => setFormData({ ...formData, alertDays: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                <Input
                  id="tags"
                  placeholder="Ex: urgente, contrato, fornecedor"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Notas adicionais..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Partes Envolvidas */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Partes Envolvidas</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addParty}>
                    Adicionar Parte
                  </Button>
                </div>
                {formData.parties.map((party, index) => (
                  <div key={index} className="rounded-lg border p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">Parte {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeParty(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-2">
                      <Input
                        placeholder="Nome / Razão Social"
                        value={party.name}
                        onChange={(e) => updateParty(index, "name", e.target.value)}
                      />
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Input
                          placeholder="Papel (Ex: Contratado)"
                          value={party.role}
                          onChange={(e) => updateParty(index, "role", e.target.value)}
                        />
                        <Input
                          placeholder="CPF / CNPJ"
                          value={party.document}
                          onChange={(e) => updateParty(index, "document", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : document ? (
                  "Atualizar"
                ) : (
                  "Criar Documento"
                )}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
