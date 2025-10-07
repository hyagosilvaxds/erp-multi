"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Folder,
  FolderOpen,
  FileText,
  Upload,
  Search,
  MoreVertical,
  Download,
  Eye,
  Trash2,
  Tag,
  AlertCircle,
  Clock,
  User,
  Filter,
} from "lucide-react"
import Link from "next/link"

// Mock data
const folders = [
  { id: 1, name: "Financeiro", count: 45, color: "bg-blue-500" },
  { id: 2, name: "RH", count: 32, color: "bg-green-500" },
  { id: 3, name: "Jurídico", count: 28, color: "bg-purple-500" },
  { id: 4, name: "Operações", count: 56, color: "bg-orange-500" },
  { id: 5, name: "Contratos", count: 18, color: "bg-red-500" },
  { id: 6, name: "Fiscal", count: 67, color: "bg-yellow-500" },
]

const recentDocuments = [
  {
    id: 1,
    name: "Contrato Fornecedor XYZ.pdf",
    folder: "Jurídico",
    tags: ["contrato", "fornecedor"],
    uploadedBy: "João Silva",
    uploadedAt: "2024-01-15",
    size: "2.5 MB",
    version: "v3",
    hasAlert: false,
  },
  {
    id: 2,
    name: "Licença Operação 2024.pdf",
    folder: "Operações",
    tags: ["licença", "validade"],
    uploadedBy: "Maria Santos",
    uploadedAt: "2024-01-14",
    size: "1.8 MB",
    version: "v1",
    hasAlert: true,
    alertDate: "2024-03-30",
  },
  {
    id: 3,
    name: "Holerite Janeiro 2024.pdf",
    folder: "RH",
    tags: ["holerite", "folha"],
    uploadedBy: "Sistema",
    uploadedAt: "2024-01-10",
    size: "456 KB",
    version: "v1",
    hasAlert: false,
  },
  {
    id: 4,
    name: "Nota Fiscal 12345.xml",
    folder: "Fiscal",
    tags: ["nfe", "entrada"],
    uploadedBy: "Pedro Costa",
    uploadedAt: "2024-01-09",
    size: "89 KB",
    version: "v1",
    hasAlert: false,
  },
  {
    id: 5,
    name: "Alvará Bombeiros.pdf",
    folder: "Jurídico",
    tags: ["alvará", "validade"],
    uploadedBy: "Ana Lima",
    uploadedAt: "2024-01-08",
    size: "3.2 MB",
    version: "v2",
    hasAlert: true,
    alertDate: "2024-02-15",
  },
]

const stats = {
  totalDocuments: 246,
  totalSize: "1.2 GB",
  documentsThisMonth: 23,
  expiringDocuments: 5,
}

export default function DocumentosPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFolder, setSelectedFolder] = useState<string>("all")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  const filteredDocuments = recentDocuments.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesFolder = selectedFolder === "all" || doc.folder === selectedFolder
    return matchesSearch && matchesFolder
  })

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hub de Documentos</h1>
            <p className="text-muted-foreground">Gerencie todos os documentos da empresa</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/documentos/busca">
              <Button variant="outline">
                <Search className="mr-2 h-4 w-4" />
                Busca Avançada
              </Button>
            </Link>
            <Link href="/dashboard/documentos/alertas">
              <Button variant="outline">
                <AlertCircle className="mr-2 h-4 w-4" />
                Alertas ({stats.expiringDocuments})
              </Button>
            </Link>
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload de Documento</DialogTitle>
                  <DialogDescription>
                    Faça upload de um novo documento ou arraste e solte aqui
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="file">Arquivo</Label>
                    <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50">
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          Clique ou arraste arquivos aqui
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="folder">Pasta</Label>
                    <Select>
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
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                    <Input id="tags" placeholder="ex: contrato, fornecedor, 2024" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validade">Data de Validade (opcional)</Label>
                    <Input id="validade" type="date" />
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
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Documentos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDocuments}</div>
              <p className="text-xs text-muted-foreground">{stats.totalSize} de armazenamento</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.documentsThisMonth}</div>
              <p className="text-xs text-muted-foreground">+12% vs mês anterior</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencendo em Breve</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.expiringDocuments}</div>
              <p className="text-xs text-muted-foreground">Próximos 30 dias</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pastas</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{folders.length}</div>
              <p className="text-xs text-muted-foreground">Organizadas por área</p>
            </CardContent>
          </Card>
        </div>

        {/* Folders */}
        <Card>
          <CardHeader>
            <CardTitle>Pastas por Área</CardTitle>
            <CardDescription>Navegue pelos documentos organizados por departamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {folders.map((folder) => (
                <Link key={folder.id} href={`/dashboard/documentos/pasta/${folder.id}`}>
                  <Card className="cursor-pointer transition-colors hover:bg-accent">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className={`rounded-lg p-3 ${folder.color}/10`}>
                        <FolderOpen className={`h-6 w-6 ${folder.color.replace("bg-", "text-")}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{folder.name}</p>
                        <p className="text-sm text-muted-foreground">{folder.count} documentos</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Documentos Recentes</CardTitle>
                <CardDescription>Últimos documentos adicionados ao sistema</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as pastas</SelectItem>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.name}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar documentos..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Documento</TableHead>
                  <TableHead>Pasta</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Upload</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Versão</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          {doc.hasAlert && (
                            <div className="flex items-center gap-1 text-xs text-orange-500">
                              <AlertCircle className="h-3 w-3" />
                              Vence em {doc.alertDate}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{doc.folder}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {doc.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{doc.uploadedBy}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(doc.uploadedAt).toLocaleDateString("pt-BR")}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{doc.size}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{doc.version}</Badge>
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
                            <Tag className="mr-2 h-4 w-4" />
                            Editar Tags
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
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
      </div>
    </DashboardLayout>
  )
}
