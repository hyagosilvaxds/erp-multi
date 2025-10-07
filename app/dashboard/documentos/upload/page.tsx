"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  FileText,
  X,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"

// Mock data
const folders = [
  { id: 1, name: "Financeiro" },
  { id: 2, name: "RH" },
  { id: 3, name: "Jurídico" },
  { id: 4, name: "Operações" },
  { id: 5, name: "Contratos" },
  { id: 6, name: "Fiscal" },
]

const linkTypes = [
  { value: "lancamento", label: "Lançamento Financeiro" },
  { value: "projeto", label: "Projeto" },
  { value: "colaborador", label: "Colaborador" },
  { value: "contrato", label: "Contrato" },
  { value: "nf", label: "Nota Fiscal" },
]

interface UploadedFile {
  name: string
  size: number
  progress: number
  status: "uploading" | "success" | "error"
  error?: string
}

export default function UploadDocumentosPage() {
  const [selectedFolder, setSelectedFolder] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [description, setDescription] = useState("")
  const [validUntil, setValidUntil] = useState("")
  const [enableAlert, setEnableAlert] = useState(false)
  const [alertDays, setAlertDays] = useState("30")
  const [linkType, setLinkType] = useState("")
  const [linkReference, setLinkReference] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    // Handle dropped files
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFiles(files)
    }
  }

  const handleFiles = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file) => ({
      name: file.name,
      size: file.size,
      progress: 0,
      status: "uploading" as const,
    }))

    setUploadedFiles([...uploadedFiles, ...newFiles])

    // Simulate upload progress
    newFiles.forEach((file, index) => {
      const totalIndex = uploadedFiles.length + index
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 30
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
          setUploadedFiles((prev) =>
            prev.map((f, i) =>
              i === totalIndex ? { ...f, progress: 100, status: "success" as const } : f
            )
          )
        } else {
          setUploadedFiles((prev) =>
            prev.map((f, i) => (i === totalIndex ? { ...f, progress } : f))
          )
        }
      }, 300)
    })
  }

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  const handleSubmit = () => {
    console.log("Submitting documents with metadata:", {
      folder: selectedFolder,
      tags,
      description,
      validUntil,
      enableAlert,
      alertDays,
      linkType,
      linkReference,
      files: uploadedFiles,
    })
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
            <h1 className="text-3xl font-bold tracking-tight">Upload de Documentos</h1>
            <p className="text-muted-foreground">
              Faça upload de novos documentos e configure os metadados
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Upload Area */}
            <Card>
              <CardHeader>
                <CardTitle>Selecionar Arquivos</CardTitle>
                <CardDescription>Arraste e solte ou clique para selecionar</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative flex h-64 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-muted-foreground/50"
                  }`}
                >
                  <input
                    type="file"
                    multiple
                    onChange={handleFileInput}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-sm font-medium">
                      Arraste arquivos aqui ou clique para selecionar
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Suporta PDF, DOC, DOCX, XLS, XLSX, PNG, JPG (máx. 10MB por arquivo)
                    </p>
                  </div>
                </div>

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h3 className="text-sm font-medium">
                      Arquivos ({uploadedFiles.length})
                    </h3>
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 rounded-lg border p-3"
                      >
                        <FileText className="h-8 w-8 shrink-0 text-muted-foreground" />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{file.name}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)}
                              </span>
                              {file.status === "success" && (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              )}
                              {file.status === "error" && (
                                <AlertCircle className="h-4 w-4 text-destructive" />
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleRemoveFile(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {file.status === "uploading" && (
                            <Progress value={file.progress} className="h-1" />
                          )}
                          {file.status === "error" && (
                            <p className="text-xs text-destructive">{file.error}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Informações do Documento</CardTitle>
                <CardDescription>Adicione metadados para organização</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descrição opcional do documento..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Adicionar tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                    />
                    <Button onClick={handleAddTag}>Adicionar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organization */}
            <Card>
              <CardHeader>
                <CardTitle>Organização</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="folder">Pasta *</Label>
                  <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a pasta" />
                    </SelectTrigger>
                    <SelectContent>
                      {folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.name}>
                          {folder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Validity */}
            <Card>
              <CardHeader>
                <CardTitle>Validade e Alertas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="validUntil">Data de Validade</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enableAlert"
                    checked={enableAlert}
                    onCheckedChange={(checked) => setEnableAlert(checked as boolean)}
                  />
                  <Label htmlFor="enableAlert" className="text-sm font-normal">
                    Ativar alerta de vencimento
                  </Label>
                </div>

                {enableAlert && (
                  <div className="space-y-2">
                    <Label htmlFor="alertDays">Alertar com antecedência de (dias)</Label>
                    <Select value={alertDays} onValueChange={setAlertDays}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 dias</SelectItem>
                        <SelectItem value="15">15 dias</SelectItem>
                        <SelectItem value="30">30 dias</SelectItem>
                        <SelectItem value="60">60 dias</SelectItem>
                        <SelectItem value="90">90 dias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Linking */}
            <Card>
              <CardHeader>
                <CardTitle>Vínculos (Opcional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="linkType">Tipo de Vínculo</Label>
                  <Select value={linkType} onValueChange={setLinkType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {linkTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {linkType && (
                  <div className="space-y-2">
                    <Label htmlFor="linkReference">Referência</Label>
                    <Input
                      id="linkReference"
                      placeholder="Ex: LAN-2024-0123"
                      value={linkReference}
                      onChange={(e) => setLinkReference(e.target.value)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Link href="/dashboard/documentos" className="flex-1">
                <Button variant="outline" className="w-full">
                  Cancelar
                </Button>
              </Link>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={!selectedFolder || uploadedFiles.length === 0}
              >
                Finalizar Upload
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
