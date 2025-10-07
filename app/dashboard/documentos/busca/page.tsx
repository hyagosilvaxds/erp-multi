"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Search,
  Filter,
  FileText,
  Download,
  Eye,
  MoreVertical,
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Tag as TagIcon,
  X,
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

const searchResults = [
  {
    id: 1,
    name: "Contrato Fornecedor XYZ.pdf",
    folder: "Jurídico",
    tags: ["contrato", "fornecedor", "xyz"],
    uploadedBy: "João Silva",
    uploadedAt: "2024-01-15",
    size: "2.5 MB",
    version: "v3",
    reference: "CTR-2024-001",
  },
  {
    id: 2,
    name: "Nota Fiscal 12345.xml",
    folder: "Fiscal",
    tags: ["nfe", "entrada", "fornecedor"],
    uploadedBy: "Pedro Costa",
    uploadedAt: "2024-01-14",
    size: "89 KB",
    version: "v1",
    reference: "NF-12345",
  },
  {
    id: 3,
    name: "Holerite Janeiro 2024 - João Silva.pdf",
    folder: "RH",
    tags: ["holerite", "folha", "janeiro"],
    uploadedBy: "Sistema",
    uploadedAt: "2024-01-10",
    size: "456 KB",
    version: "v1",
    reference: "HOL-2024-001",
  },
  {
    id: 4,
    name: "Contrato Prestação Serviços ABC.pdf",
    folder: "Jurídico",
    tags: ["contrato", "serviços", "abc"],
    uploadedBy: "Maria Santos",
    uploadedAt: "2024-01-09",
    size: "1.8 MB",
    version: "v2",
    reference: "CTR-2024-002",
  },
  {
    id: 5,
    name: "Boleto Pagamento Fornecedor XYZ.pdf",
    folder: "Financeiro",
    tags: ["boleto", "pagamento", "xyz"],
    uploadedBy: "João Silva",
    uploadedAt: "2024-01-08",
    size: "234 KB",
    version: "v1",
    reference: "BOL-2024-123",
  },
]

export default function BuscaDocumentosPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFolder, setSelectedFolder] = useState<string>("all")
  const [selectedTag, setSelectedTag] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [referenceSearch, setReferenceSearch] = useState("")
  const [uploadedBy, setUploadedBy] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  const allTags = Array.from(
    new Set(searchResults.flatMap((doc) => doc.tags))
  ).sort()

  const filteredResults = searchResults.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesFolder = selectedFolder === "all" || doc.folder === selectedFolder
    const matchesTag = selectedTag === "all" || doc.tags.includes(selectedTag)
    const matchesReference =
      !referenceSearch ||
      doc.reference.toLowerCase().includes(referenceSearch.toLowerCase())
    const matchesUploader =
      !uploadedBy || doc.uploadedBy.toLowerCase().includes(uploadedBy.toLowerCase())

    let matchesDateRange = true
    if (dateFrom || dateTo) {
      const docDate = new Date(doc.uploadedAt)
      if (dateFrom && docDate < new Date(dateFrom)) matchesDateRange = false
      if (dateTo && docDate > new Date(dateTo)) matchesDateRange = false
    }

    return (
      matchesSearch &&
      matchesFolder &&
      matchesTag &&
      matchesReference &&
      matchesUploader &&
      matchesDateRange
    )
  })

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedFolder("all")
    setSelectedTag("all")
    setDateFrom("")
    setDateTo("")
    setReferenceSearch("")
    setUploadedBy("")
  }

  const activeFiltersCount = [
    selectedFolder !== "all",
    selectedTag !== "all",
    dateFrom,
    dateTo,
    referenceSearch,
    uploadedBy,
  ].filter(Boolean).length

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
            <h1 className="text-3xl font-bold tracking-tight">Busca de Documentos</h1>
            <p className="text-muted-foreground">
              Busca avançada por nome, tag, referência ou metadados
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou tag..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Limpar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Advanced Filters */}
        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle>Filtros Avançados</CardTitle>
              <CardDescription>Refine sua busca com critérios específicos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="folder-filter">Pasta</Label>
                  <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                    <SelectTrigger id="folder-filter">
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tag-filter">Tag</Label>
                  <Select value={selectedTag} onValueChange={setSelectedTag}>
                    <SelectTrigger id="tag-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as tags</SelectItem>
                      {allTags.map((tag) => (
                        <SelectItem key={tag} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference">Referência</Label>
                  <Input
                    id="reference"
                    placeholder="Ex: NF-12345, CTR-2024-001"
                    value={referenceSearch}
                    onChange={(e) => setReferenceSearch(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-from">Data Inicial</Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-to">Data Final</Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uploader">Enviado por</Label>
                  <Input
                    id="uploader"
                    placeholder="Nome do usuário"
                    value={uploadedBy}
                    onChange={(e) => setUploadedBy(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Resultados da Busca</CardTitle>
                <CardDescription>
                  {filteredResults.length} {filteredResults.length === 1 ? "documento encontrado" : "documentos encontrados"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredResults.length === 0 ? (
              <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                  <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-sm font-medium">Nenhum documento encontrado</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Tente ajustar os filtros ou termo de busca
                  </p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Documento</TableHead>
                    <TableHead>Pasta</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Referência</TableHead>
                    <TableHead>Upload</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.version}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{doc.folder}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {doc.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {doc.tags.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{doc.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                          {doc.reference}
                        </code>
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
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
