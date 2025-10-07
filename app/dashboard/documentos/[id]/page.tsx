"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FileText,
  Download,
  Upload,
  Trash2,
  Tag,
  Link as LinkIcon,
  Clock,
  User,
  ArrowLeft,
  AlertCircle,
  Edit,
  Save,
  X,
} from "lucide-react"
import Link from "next/link"

// Mock data
const document = {
  id: 1,
  name: "Contrato Fornecedor XYZ.pdf",
  folder: "Jurídico",
  tags: ["contrato", "fornecedor", "xyz"],
  uploadedBy: "João Silva",
  uploadedAt: "2024-01-15T10:30:00",
  size: "2.5 MB",
  currentVersion: 3,
  description: "Contrato de prestação de serviços com fornecedor XYZ, vigência de 12 meses.",
  validUntil: "2024-12-31",
  linkedTo: [
    { type: "Lançamento", reference: "LAN-2024-0123", name: "Pagamento Fornecedor XYZ" },
    { type: "Projeto", reference: "PRJ-001", name: "Implementação Sistema ERP" },
  ],
}

const versions = [
  {
    version: 3,
    uploadedBy: "João Silva",
    uploadedAt: "2024-01-15T10:30:00",
    size: "2.5 MB",
    changes: "Ajuste no valor total do contrato",
    isCurrent: true,
  },
  {
    version: 2,
    uploadedBy: "Maria Santos",
    uploadedAt: "2024-01-10T14:20:00",
    size: "2.4 MB",
    changes: "Inclusão de cláusula de rescisão",
    isCurrent: false,
  },
  {
    version: 1,
    uploadedBy: "João Silva",
    uploadedAt: "2024-01-05T09:15:00",
    size: "2.3 MB",
    changes: "Versão inicial do contrato",
    isCurrent: false,
  },
]

const activityLog = [
  {
    id: 1,
    action: "Upload de nova versão",
    user: "João Silva",
    timestamp: "2024-01-15T10:30:00",
    details: "v3 - Ajuste no valor total do contrato",
  },
  {
    id: 2,
    action: "Tag adicionada",
    user: "João Silva",
    timestamp: "2024-01-15T10:31:00",
    details: "Tag: xyz",
  },
  {
    id: 3,
    action: "Documento vinculado",
    user: "Maria Santos",
    timestamp: "2024-01-12T16:45:00",
    details: "Vinculado ao Projeto PRJ-001",
  },
  {
    id: 4,
    action: "Upload de nova versão",
    user: "Maria Santos",
    timestamp: "2024-01-10T14:20:00",
    details: "v2 - Inclusão de cláusula de rescisão",
  },
  {
    id: 5,
    action: "Documento criado",
    user: "João Silva",
    timestamp: "2024-01-05T09:15:00",
    details: "v1 - Versão inicial",
  },
]

export default function DocumentoPage() {
  const [isEditingTags, setIsEditingTags] = useState(false)
  const [tags, setTags] = useState(document.tags)
  const [newTag, setNewTag] = useState("")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/documentos">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight">{document.name}</h1>
                <Badge>{document.folder}</Badge>
              </div>
              <p className="text-muted-foreground">{document.description}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Visualização do Documento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex h-96 items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
                  <div className="text-center">
                    <FileText className="mx-auto h-16 w-16 text-muted-foreground" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      Preview do documento apareceria aqui
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Versions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Histórico de Versões</CardTitle>
                    <CardDescription>Todas as versões do documento</CardDescription>
                  </div>
                  <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Nova Versão
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload de Nova Versão</DialogTitle>
                        <DialogDescription>
                          Faça upload de uma nova versão deste documento
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="file">Arquivo</Label>
                          <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50">
                            <div className="text-center">
                              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                              <p className="mt-2 text-sm text-muted-foreground">
                                Clique ou arraste o arquivo aqui
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="changes">Descrição das Alterações</Label>
                          <Textarea
                            id="changes"
                            placeholder="Descreva as mudanças nesta versão..."
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={() => setIsUploadDialogOpen(false)}>Fazer Upload</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Versão</TableHead>
                      <TableHead>Enviado por</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Tamanho</TableHead>
                      <TableHead>Alterações</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {versions.map((version) => (
                      <TableRow key={version.version}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">v{version.version}</span>
                            {version.isCurrent && <Badge variant="default">Atual</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <User className="h-3 w-3 text-muted-foreground" />
                            {version.uploadedBy}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {new Date(version.uploadedAt).toLocaleString("pt-BR")}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{version.size}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {version.changes}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Activity Log */}
            <Card>
              <CardHeader>
                <CardTitle>Registro de Atividades</CardTitle>
                <CardDescription>Histórico de ações realizadas neste documento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityLog.map((activity) => (
                    <div key={activity.id} className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.details}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          {activity.user}
                          <span>•</span>
                          <Clock className="h-3 w-3" />
                          {new Date(activity.timestamp).toLocaleString("pt-BR")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Pasta</Label>
                  <p className="text-sm font-medium">{document.folder}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-xs text-muted-foreground">Tamanho</Label>
                  <p className="text-sm font-medium">{document.size}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-xs text-muted-foreground">Versão Atual</Label>
                  <p className="text-sm font-medium">v{document.currentVersion}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-xs text-muted-foreground">Enviado por</Label>
                  <p className="text-sm font-medium">{document.uploadedBy}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-xs text-muted-foreground">Data de Upload</Label>
                  <p className="text-sm font-medium">
                    {new Date(document.uploadedAt).toLocaleString("pt-BR")}
                  </p>
                </div>
                <Separator />
                <div>
                  <Label className="text-xs text-muted-foreground">Validade</Label>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {new Date(document.validUntil).toLocaleDateString("pt-BR")}
                    </p>
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Tags</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingTags(!isEditingTags)}
                  >
                    {isEditingTags ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {tag}
                      {isEditingTags && (
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditingTags && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nova tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                    />
                    <Button size="sm" onClick={handleAddTag}>
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {isEditingTags && (
                  <Button size="sm" className="w-full" onClick={() => setIsEditingTags(false)}>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Tags
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Linked Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Vínculos</CardTitle>
                  <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Vincular Documento</DialogTitle>
                        <DialogDescription>
                          Vincule este documento a lançamentos, projetos, colaboradores, etc.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="link-type">Tipo de Vínculo</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="lancamento">Lançamento Financeiro</SelectItem>
                              <SelectItem value="projeto">Projeto</SelectItem>
                              <SelectItem value="colaborador">Colaborador</SelectItem>
                              <SelectItem value="contrato">Contrato</SelectItem>
                              <SelectItem value="nf">Nota Fiscal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="link-reference">Referência</Label>
                          <Input id="link-reference" placeholder="Ex: LAN-2024-0123" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={() => setIsLinkDialogOpen(false)}>Vincular</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {document.linkedTo.map((link, index) => (
                  <div key={index} className="flex items-start gap-2 rounded-lg border p-3">
                    <LinkIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">{link.type}</p>
                      <p className="text-sm font-medium">{link.name}</p>
                      <p className="text-xs text-muted-foreground">{link.reference}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
