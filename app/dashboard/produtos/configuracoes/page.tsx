"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Edit, Trash2, Tag, Ruler, AlertCircle, Award } from "lucide-react"
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
} from "@/components/ui/dialog"
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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { categoriesApi, unitsApi, brandsApi, type Category, type Unit, type Brand } from "@/lib/api/products"
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/api/auth"

export default function ProdutosConfiguracoesPage() {
  const router = useRouter()
  const { toast } = useToast()

  // Obter permissões reais do backend
  const selectedCompany = authApi.getSelectedCompany()
  const permissions = selectedCompany?.role?.permissions || []

  // Helper para verificar permissões
  const hasPermission = (resource: string, action: string) => {
    return permissions.some((p: any) => p.resource === resource && p.action === action)
  }

  // Verificar permissões (usando resource 'products' do backend)
  const canRead = hasPermission('products', 'read')
  const canCreate = hasPermission('products', 'create')
  const canUpdate = hasPermission('products', 'update')
  const canDelete = hasPermission('products', 'delete')

  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [brands, setBrands] = useState<Brand[]>([])

  // Estados para Categoria
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null)
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
    parentId: "",
    active: true,
  })
  const [savingCategory, setSavingCategory] = useState(false)

  // Estados para deletar categoria
  const [showDeleteCategoryDialog, setShowDeleteCategoryDialog] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState(false)

  // Estados para Unidade
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false)
  const [unitToEdit, setUnitToEdit] = useState<Unit | null>(null)
  const [unitFormData, setUnitFormData] = useState({
    name: "",
    abbreviation: "",
    fractionable: false,
    active: true,
  })
  const [savingUnit, setSavingUnit] = useState(false)

  // Estados para deletar unidade
  const [showDeleteUnitDialog, setShowDeleteUnitDialog] = useState(false)
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null)
  const [deletingUnit, setDeletingUnit] = useState(false)

  // Estados para Marca
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false)
  const [brandToEdit, setBrandToEdit] = useState<Brand | null>(null)
  const [brandFormData, setBrandFormData] = useState({
    name: "",
    description: "",
    active: true,
  })
  const [savingBrand, setSavingBrand] = useState(false)

  // Estados para deletar marca
  const [showDeleteBrandDialog, setShowDeleteBrandDialog] = useState(false)
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null)
  const [deletingBrand, setDeletingBrand] = useState(false)

  useEffect(() => {
    // Se não tiver permissão de leitura, redireciona
    if (!canRead) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar configurações de produtos",
        variant: "destructive",
      })
      router.push('/dashboard')
      return
    }

    loadData()
  }, [canRead, router])

  const loadData = async () => {
    try {
      setLoading(true)

      const [categoriesData, unitsData, brandsData] = await Promise.all([
        categoriesApi.getAll(),
        unitsApi.getAll(),
        brandsApi.getAll(),
      ])

      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
      setUnits(Array.isArray(unitsData) ? unitsData : [])
      setBrands(Array.isArray(brandsData) ? brandsData : [])
    } catch (error: any) {
      console.error('❌ Erro ao carregar dados:', error)

      toast({
        title: "Erro ao carregar dados",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // CATEGORIA - Handlers
  // ==========================================

  const openCreateCategoryDialog = () => {
    setCategoryToEdit(null)
    setCategoryFormData({
      name: "",
      description: "",
      parentId: "",
      active: true,
    })
    setIsCategoryDialogOpen(true)
  }

  const openEditCategoryDialog = (category: Category) => {
    setCategoryToEdit(category)
    setCategoryFormData({
      name: category.name,
      description: category.description || "",
      parentId: category.parentId || "",
      active: category.active,
    })
    setIsCategoryDialogOpen(true)
  }

  const handleSaveCategory = async () => {
    if (!categoryFormData.name.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O nome da categoria é obrigatório",
        variant: "destructive",
      })
      return
    }

    try {
      setSavingCategory(true)

      const data: any = {
        name: categoryFormData.name,
        description: categoryFormData.description || undefined,
        active: categoryFormData.active,
      }

      // Adicionar parentId apenas se não for string vazia
      if (categoryFormData.parentId) {
        data.parentId = categoryFormData.parentId
      }

      if (categoryToEdit) {
        // Atualizar
        await categoriesApi.update(categoryToEdit.id, data)
        toast({
          title: "✅ Categoria atualizada",
          description: "A categoria foi atualizada com sucesso",
        })
      } else {
        // Criar
        await categoriesApi.create(data)
        toast({
          title: "✅ Categoria criada",
          description: "A categoria foi criada com sucesso",
        })
      }

      await loadData()
      setIsCategoryDialogOpen(false)
    } catch (error: any) {
      console.error('❌ Erro ao salvar categoria:', error)

      toast({
        title: "Erro ao salvar categoria",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setSavingCategory(false)
    }
  }

  const openDeleteCategoryDialog = (category: Category) => {
    setCategoryToDelete(category)
    setShowDeleteCategoryDialog(true)
  }

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return

    try {
      setDeletingCategory(true)

      await categoriesApi.delete(categoryToDelete.id)

      toast({
        title: "✅ Categoria deletada",
        description: "A categoria foi deletada com sucesso",
      })

      await loadData()
      setShowDeleteCategoryDialog(false)
      setCategoryToDelete(null)
    } catch (error: any) {
      console.error('❌ Erro ao deletar categoria:', error)

      toast({
        title: "Erro ao deletar categoria",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setDeletingCategory(false)
    }
  }

  // ==========================================
  // UNIDADE - Handlers
  // ==========================================

  const openCreateUnitDialog = () => {
    setUnitToEdit(null)
    setUnitFormData({
      name: "",
      abbreviation: "",
      fractionable: false,
      active: true,
    })
    setIsUnitDialogOpen(true)
  }

  const openEditUnitDialog = (unit: Unit) => {
    setUnitToEdit(unit)
    setUnitFormData({
      name: unit.name,
      abbreviation: unit.abbreviation,
      fractionable: unit.fractionable,
      active: unit.active,
    })
    setIsUnitDialogOpen(true)
  }

  const handleSaveUnit = async () => {
    if (!unitFormData.name.trim() || !unitFormData.abbreviation.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e abreviação são obrigatórios",
        variant: "destructive",
      })
      return
    }

    try {
      setSavingUnit(true)

      const data = {
        name: unitFormData.name,
        abbreviation: unitFormData.abbreviation,
        fractionable: unitFormData.fractionable,
        active: unitFormData.active,
      }

      if (unitToEdit) {
        // Atualizar
        await unitsApi.update(unitToEdit.id, data)
        toast({
          title: "✅ Unidade atualizada",
          description: "A unidade foi atualizada com sucesso",
        })
      } else {
        // Criar
        await unitsApi.create(data)
        toast({
          title: "✅ Unidade criada",
          description: "A unidade foi criada com sucesso",
        })
      }

      await loadData()
      setIsUnitDialogOpen(false)
    } catch (error: any) {
      console.error('❌ Erro ao salvar unidade:', error)

      toast({
        title: "Erro ao salvar unidade",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setSavingUnit(false)
    }
  }

  const openDeleteUnitDialog = (unit: Unit) => {
    setUnitToDelete(unit)
    setShowDeleteUnitDialog(true)
  }

  const handleDeleteUnit = async () => {
    if (!unitToDelete) return

    try {
      setDeletingUnit(true)

      await unitsApi.delete(unitToDelete.id)

      toast({
        title: "✅ Unidade deletada",
        description: "A unidade foi deletada com sucesso",
      })

      await loadData()
      setShowDeleteUnitDialog(false)
      setUnitToDelete(null)
    } catch (error: any) {
      console.error('❌ Erro ao deletar unidade:', error)

      toast({
        title: "Erro ao deletar unidade",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setDeletingUnit(false)
    }
  }

  // ==========================================
  // MARCA - Handlers
  // ==========================================

  const openCreateBrandDialog = () => {
    setBrandToEdit(null)
    setBrandFormData({
      name: "",
      description: "",
      active: true,
    })
    setIsBrandDialogOpen(true)
  }

  const openEditBrandDialog = (brand: Brand) => {
    setBrandToEdit(brand)
    setBrandFormData({
      name: brand.name,
      description: brand.description || "",
      active: brand.active,
    })
    setIsBrandDialogOpen(true)
  }

  const handleSaveBrand = async () => {
    if (!brandFormData.name.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O nome da marca é obrigatório",
        variant: "destructive",
      })
      return
    }

    try {
      setSavingBrand(true)

      const data = {
        name: brandFormData.name,
        description: brandFormData.description || undefined,
        active: brandFormData.active,
      }

      if (brandToEdit) {
        // Atualizar
        await brandsApi.update(brandToEdit.id, data)
        toast({
          title: "✅ Marca atualizada",
          description: "A marca foi atualizada com sucesso",
        })
      } else {
        // Criar
        await brandsApi.create(data)
        toast({
          title: "✅ Marca criada",
          description: "A marca foi criada com sucesso",
        })
      }

      await loadData()
      setIsBrandDialogOpen(false)
    } catch (error: any) {
      console.error('❌ Erro ao salvar marca:', error)

      toast({
        title: "Erro ao salvar marca",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setSavingBrand(false)
    }
  }

  const openDeleteBrandDialog = (brand: Brand) => {
    setBrandToDelete(brand)
    setShowDeleteBrandDialog(true)
  }

  const handleDeleteBrand = async () => {
    if (!brandToDelete) return

    try {
      setDeletingBrand(true)

      await brandsApi.delete(brandToDelete.id)

      toast({
        title: "✅ Marca deletada",
        description: "A marca foi deletada com sucesso",
      })

      await loadData()
      setShowDeleteBrandDialog(false)
      setBrandToDelete(null)
    } catch (error: any) {
      console.error('❌ Erro ao deletar marca:', error)

      toast({
        title: "Erro ao deletar marca",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setDeletingBrand(false)
    }
  }

  // Se não tiver permissão de leitura, não renderiza nada
  if (!canRead) {
    return null
  }

  // Estado de loading
  if (loading) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando configurações...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações de Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie categorias e unidades de medida dos seus produtos
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="categories" className="space-y-4">
          <TabsList>
            <TabsTrigger value="categories">
              <Tag className="mr-2 h-4 w-4" />
              Categorias
            </TabsTrigger>
            <TabsTrigger value="units">
              <Ruler className="mr-2 h-4 w-4" />
              Unidades
            </TabsTrigger>
            <TabsTrigger value="brands">
              <Award className="mr-2 h-4 w-4" />
              Marcas
            </TabsTrigger>
          </TabsList>

          {/* TAB: CATEGORIAS */}
          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Categorias</CardTitle>
                  <CardDescription>
                    Organize seus produtos em categorias e subcategorias
                  </CardDescription>
                </div>
                {canCreate && (
                  <Button onClick={openCreateCategoryDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Categoria
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {categories.length === 0 ? (
                  <div className="text-center py-8">
                    <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma categoria cadastrada</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Categoria Pai</TableHead>
                        <TableHead>Produtos</TableHead>
                        <TableHead>Subcategorias</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {category.description || "-"}
                          </TableCell>
                          <TableCell>
                            {category.parent ? (
                              <Badge variant="outline">{category.parent.name}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>{category._count?.products || 0}</TableCell>
                          <TableCell>{category._count?.subcategories || 0}</TableCell>
                          <TableCell>
                            <Badge variant={category.active ? "default" : "secondary"}>
                              {category.active ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {canUpdate && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditCategoryDialog(category)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openDeleteCategoryDialog(category)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: UNIDADES */}
          <TabsContent value="units" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Unidades de Medida</CardTitle>
                  <CardDescription>
                    Defina as unidades de medida utilizadas nos seus produtos
                  </CardDescription>
                </div>
                {canCreate && (
                  <Button onClick={openCreateUnitDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Unidade
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {units.length === 0 ? (
                  <div className="text-center py-8">
                    <Ruler className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma unidade cadastrada</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Abreviação</TableHead>
                        <TableHead>Fracionável</TableHead>
                        <TableHead>Produtos</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {units.map((unit) => (
                        <TableRow key={unit.id}>
                          <TableCell className="font-medium">{unit.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{unit.abbreviation}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={unit.fractionable ? "default" : "secondary"}>
                              {unit.fractionable ? "Sim" : "Não"}
                            </Badge>
                          </TableCell>
                          <TableCell>{unit._count?.products || 0}</TableCell>
                          <TableCell>
                            <Badge variant={unit.active ? "default" : "secondary"}>
                              {unit.active ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {canUpdate && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditUnitDialog(unit)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openDeleteUnitDialog(unit)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: MARCAS */}
          <TabsContent value="brands" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Marcas</CardTitle>
                  <CardDescription>
                    Cadastre as marcas dos produtos comercializados
                  </CardDescription>
                </div>
                {canCreate && (
                  <Button onClick={openCreateBrandDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Marca
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {brands.length === 0 ? (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma marca cadastrada</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Produtos</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {brands.map((brand) => (
                        <TableRow key={brand.id}>
                          <TableCell className="font-medium">{brand.name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {brand.description || "-"}
                          </TableCell>
                          <TableCell>{brand._count?.products || 0}</TableCell>
                          <TableCell>
                            <Badge variant={brand.active ? "default" : "secondary"}>
                              {brand.active ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {canUpdate && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditBrandDialog(brand)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openDeleteBrandDialog(brand)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog de Categoria */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {categoryToEdit ? "Editar Categoria" : "Nova Categoria"}
            </DialogTitle>
            <DialogDescription>
              {categoryToEdit
                ? "Atualize as informações da categoria"
                : "Crie uma nova categoria para organizar seus produtos"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Nome *</Label>
              <Input
                id="category-name"
                placeholder="Ex: Eletrônicos, Alimentos..."
                value={categoryFormData.name}
                onChange={(e) =>
                  setCategoryFormData({ ...categoryFormData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-description">Descrição</Label>
              <Textarea
                id="category-description"
                placeholder="Descrição opcional da categoria..."
                value={categoryFormData.description}
                onChange={(e) =>
                  setCategoryFormData({ ...categoryFormData, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-parent">Categoria Pai (opcional)</Label>
              <Select
                value={categoryFormData.parentId}
                onValueChange={(value) =>
                  setCategoryFormData({ ...categoryFormData, parentId: value })
                }
              >
                <SelectTrigger id="category-parent">
                  <SelectValue placeholder="Nenhuma (categoria raiz)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma (categoria raiz)</SelectItem>
                  {categories
                    .filter((cat) => cat.id !== categoryToEdit?.id)
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="category-active"
                checked={categoryFormData.active}
                onCheckedChange={(checked) =>
                  setCategoryFormData({ ...categoryFormData, active: checked })
                }
              />
              <Label htmlFor="category-active">Categoria ativa</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCategoryDialogOpen(false)}
              disabled={savingCategory}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveCategory} disabled={savingCategory}>
              {savingCategory && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {categoryToEdit ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Unidade */}
      <Dialog open={isUnitDialogOpen} onOpenChange={setIsUnitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {unitToEdit ? "Editar Unidade" : "Nova Unidade"}
            </DialogTitle>
            <DialogDescription>
              {unitToEdit
                ? "Atualize as informações da unidade"
                : "Crie uma nova unidade de medida"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="unit-name">Nome *</Label>
              <Input
                id="unit-name"
                placeholder="Ex: Quilograma, Metro, Unidade..."
                value={unitFormData.name}
                onChange={(e) =>
                  setUnitFormData({ ...unitFormData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit-abbreviation">Abreviação *</Label>
              <Input
                id="unit-abbreviation"
                placeholder="Ex: KG, M, UN..."
                value={unitFormData.abbreviation}
                onChange={(e) =>
                  setUnitFormData({ ...unitFormData, abbreviation: e.target.value.toUpperCase() })
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="unit-fractionable"
                checked={unitFormData.fractionable}
                onCheckedChange={(checked) =>
                  setUnitFormData({ ...unitFormData, fractionable: checked })
                }
              />
              <Label htmlFor="unit-fractionable">Permite quantidades decimais</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="unit-active"
                checked={unitFormData.active}
                onCheckedChange={(checked) =>
                  setUnitFormData({ ...unitFormData, active: checked })
                }
              />
              <Label htmlFor="unit-active">Unidade ativa</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUnitDialogOpen(false)}
              disabled={savingUnit}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveUnit} disabled={savingUnit}>
              {savingUnit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {unitToEdit ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Deletar Categoria */}
      <AlertDialog open={showDeleteCategoryDialog} onOpenChange={setShowDeleteCategoryDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria "{categoryToDelete?.name}"?
              {categoryToDelete && (
                <>
                  {(categoryToDelete._count?.products || 0) > 0 && (
                    <span className="block mt-2 text-orange-600 font-medium">
                      <AlertCircle className="inline h-4 w-4 mr-1" />
                      Esta categoria possui {categoryToDelete._count?.products} produto(s)
                      vinculado(s).
                    </span>
                  )}
                  {(categoryToDelete._count?.subcategories || 0) > 0 && (
                    <span className="block mt-2 text-orange-600 font-medium">
                      <AlertCircle className="inline h-4 w-4 mr-1" />
                      Esta categoria possui {categoryToDelete._count?.subcategories}{" "}
                      subcategoria(s) vinculada(s).
                    </span>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingCategory}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              disabled={deletingCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingCategory && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Deletar Unidade */}
      <AlertDialog open={showDeleteUnitDialog} onOpenChange={setShowDeleteUnitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Unidade?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a unidade "{unitToDelete?.name}"?
              {unitToDelete && (unitToDelete._count?.products || 0) > 0 && (
                <span className="block mt-2 text-orange-600 font-medium">
                  <AlertCircle className="inline h-4 w-4 mr-1" />
                  Esta unidade possui {unitToDelete._count?.products} produto(s) vinculado(s).
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingUnit}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUnit}
              disabled={deletingUnit}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingUnit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Marca */}
      <Dialog open={isBrandDialogOpen} onOpenChange={setIsBrandDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {brandToEdit ? "Editar Marca" : "Nova Marca"}
            </DialogTitle>
            <DialogDescription>
              {brandToEdit
                ? "Atualize as informações da marca"
                : "Crie uma nova marca para seus produtos"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brand-name">Nome *</Label>
              <Input
                id="brand-name"
                placeholder="Ex: Samsung, Apple, Nike..."
                value={brandFormData.name}
                onChange={(e) =>
                  setBrandFormData({ ...brandFormData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand-description">Descrição</Label>
              <Textarea
                id="brand-description"
                placeholder="Descrição opcional da marca..."
                value={brandFormData.description}
                onChange={(e) =>
                  setBrandFormData({ ...brandFormData, description: e.target.value })
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="brand-active"
                checked={brandFormData.active}
                onCheckedChange={(checked) =>
                  setBrandFormData({ ...brandFormData, active: checked })
                }
              />
              <Label htmlFor="brand-active">Marca ativa</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBrandDialogOpen(false)}
              disabled={savingBrand}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveBrand} disabled={savingBrand}>
              {savingBrand && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {brandToEdit ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Deletar Marca */}
      <AlertDialog open={showDeleteBrandDialog} onOpenChange={setShowDeleteBrandDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Marca?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a marca "{brandToDelete?.name}"?
              {brandToDelete && (brandToDelete._count?.products || 0) > 0 && (
                <span className="block mt-2 text-orange-600 font-medium">
                  <AlertCircle className="inline h-4 w-4 mr-1" />
                  Esta marca possui {brandToDelete._count?.products} produto(s) vinculado(s).
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingBrand}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBrand}
              disabled={deletingBrand}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingBrand && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
