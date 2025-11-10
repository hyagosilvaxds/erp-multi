"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Search, MoreVertical, Edit, Trash2, Folder, Eye } from "lucide-react"
import { useState, useEffect } from "react"
import { CategoryDialog } from "@/components/legal/category-dialog"
import {
  listLegalCategories,
  deleteLegalCategory,
  type LegalCategory,
} from "@/lib/api/legal-categories"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export default function CategoriasJuridicasPage() {
  const [categories, setCategories] = useState<LegalCategory[]>([])
  const [filteredCategories, setFilteredCategories] = useState<LegalCategory[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<LegalCategory | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<LegalCategory | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    filterCategories()
  }, [searchTerm, categories])

  const loadCategories = async () => {
    try {
      setIsLoading(true)
      const data = await listLegalCategories()
      setCategories(data)
    } catch (error) {
      toast({
        title: "Erro ao carregar categorias",
        description: "Não foi possível carregar as categorias jurídicas.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterCategories = () => {
    let filtered = categories

    if (searchTerm) {
      filtered = filtered.filter(
        (cat) =>
          cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredCategories(filtered)
  }

  const handleCreateCategory = () => {
    setSelectedCategory(null)
    setDialogOpen(true)
  }

  const handleEditCategory = (category: LegalCategory) => {
    setSelectedCategory(category)
    setDialogOpen(true)
  }

  const handleDeleteCategory = (category: LegalCategory) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!categoryToDelete) return

    try {
      await deleteLegalCategory(categoryToDelete.id)
      toast({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso.",
      })
      loadCategories()
    } catch (error) {
      toast({
        title: "Erro ao excluir categoria",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível excluir a categoria. Verifique se não há documentos vinculados.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
    }
  }

  const handleDialogClose = (success: boolean) => {
    setDialogOpen(false)
    setSelectedCategory(null)
    if (success) {
      loadCategories()
    }
  }

  const activeCategories = categories.filter((c) => c.active).length
  const totalDocuments = categories.reduce((sum, c) => sum + (c._count?.legalDocuments || 0), 0)

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Categorias Jurídicas</h1>
            <p className="text-muted-foreground">
              Gerencie as categorias de documentos jurídicos
            </p>
          </div>
          <Button onClick={handleCreateCategory}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Categorias</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
              <p className="text-xs text-muted-foreground">{activeCategories} ativas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documentos Vinculados</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDocuments}</div>
              <p className="text-xs text-muted-foreground">em todas as categorias</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Média por Categoria</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {categories.length > 0 ? Math.round(totalDocuments / categories.length) : 0}
              </div>
              <p className="text-xs text-muted-foreground">documentos por categoria</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Categorias</CardTitle>
            <CardDescription>Lista de todas as categorias cadastradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-muted-foreground">
                {searchTerm
                  ? "Nenhuma categoria encontrada com os filtros aplicados."
                  : "Nenhuma categoria cadastrada. Clique em 'Nova Categoria' para começar."}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Documentos</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-lg"
                              style={{
                                backgroundColor: category.color
                                  ? `${category.color}20`
                                  : "#3B82F620",
                              }}
                            >
                              <Folder
                                className="h-5 w-5"
                                style={{ color: category.color || "#3B82F6" }}
                              />
                            </div>
                            <div>
                              <p className="font-medium">{category.name}</p>
                              {category.icon && (
                                <p className="text-xs text-muted-foreground">{category.icon}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-muted-foreground">
                            {category.description || "-"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {category._count?.legalDocuments || 0} documentos
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {category.active ? (
                            <Badge variant="default">Ativa</Badge>
                          ) : (
                            <Badge variant="outline">Inativa</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteCategory(category)}
                                className="text-destructive"
                              >
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Dialog */}
      <CategoryDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        category={selectedCategory}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria &quot;{categoryToDelete?.name}&quot;?
              {categoryToDelete?._count?.legalDocuments ? (
                <span className="mt-2 block font-semibold text-destructive">
                  Atenção: Esta categoria possui {categoryToDelete._count.legalDocuments}{" "}
                  documento(s) vinculado(s) e não poderá ser excluída.
                </span>
              ) : (
                <span className="mt-2 block">Esta ação não pode ser desfeita.</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
