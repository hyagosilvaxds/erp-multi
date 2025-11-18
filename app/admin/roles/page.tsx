"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Search, 
  Plus, 
  Shield, 
  Loader2, 
  X, 
  Edit,
  Users,
  Trash2
} from "lucide-react"
import { rolesApi, type Role } from "@/lib/api/roles"
import { authApi } from "@/lib/api/auth"
import { useToast } from "@/hooks/use-toast"

export default function RolesPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [roles, setRoles] = useState<Role[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  // Debounce do termo de busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Carregar roles quando filtros mudam
  useEffect(() => {
    loadRoles()
  }, [debouncedSearch])

  const loadRoles = async () => {
    try {
      setSearching(true)
      
      const data = await rolesApi.getAll()
      
      console.log('✅ Roles carregadas:', data.length)
      
      // Filtrar no client se houver busca
      const filtered = debouncedSearch
        ? data.filter(role => 
            role.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            role.description?.toLowerCase().includes(debouncedSearch.toLowerCase())
          )
        : data
      
      setRoles(filtered)
      
      if (debouncedSearch) {
        console.log(`🔍 Busca: "${debouncedSearch}" | Encontrados: ${filtered.length}`)
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar roles:', error)
      
      toast({
        title: "Erro ao carregar roles",
        description: error.response?.data?.message || error.message || "Não foi possível carregar a lista de roles",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setSearching(false)
    }
  }

  const handleClearSearch = () => {
    setSearchTerm("")
    setDebouncedSearch("")
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const openCreateDialog = () => {
    setFormData({ name: "", description: "" })
    setShowCreateDialog(true)
  }

  const openEditDialog = (role: Role) => {
    setSelectedRole(role)
    setFormData({
      name: role.name,
      description: role.description || "",
    })
    setShowEditDialog(true)
  }

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O nome da role é obrigatório",
        variant: "destructive",
      })
      return
    }

    try {
      setCreating(true)

      const newRole = await rolesApi.create({
        name: formData.name,
        description: formData.description || undefined,
      })

      toast({
        title: "✅ Role criada!",
        description: "Redirecionando para adicionar permissões...",
      })

      // Fechar dialog
      setShowCreateDialog(false)

      // Redirecionar para página de detalhes
      router.push(`/admin/roles/${newRole.id}`)
    } catch (error: any) {
      console.error('❌ Erro ao criar role:', error)

      toast({
        title: "Erro ao criar role",
        description: error.response?.data?.message || error.message || "Não foi possível criar a role",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const handleUpdate = async () => {
    if (!selectedRole) return

    if (!formData.name.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O nome da role é obrigatório",
        variant: "destructive",
      })
      return
    }

    try {
      setUpdating(true)

      await rolesApi.update(selectedRole.id, {
        name: formData.name,
        description: formData.description || undefined,
      })

      toast({
        title: "Role atualizada!",
        description: "A role foi atualizada com sucesso.",
      })

      // Recarregar lista
      await loadRoles()

      // Fechar dialog
      setShowEditDialog(false)
      setSelectedRole(null)
    } catch (error: any) {
      console.error('❌ Erro ao atualizar role:', error)

      toast({
        title: "Erro ao atualizar role",
        description: error.response?.data?.message || error.message || "Não foi possível atualizar a role",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const openDeleteDialog = (role: Role) => {
    setSelectedRole(role)
    setShowDeleteDialog(true)
  }

  const handleDelete = async () => {
    if (!selectedRole) return

    setDeleting(true)
    try {
      await rolesApi.delete(selectedRole.id)

      toast({
        title: "✅ Role deletada",
        description: "A role foi deletada com sucesso",
      })

      // Recarregar lista
      await loadRoles()

      // Fechar dialog
      setShowDeleteDialog(false)
      setSelectedRole(null)
    } catch (error: any) {
      console.error('❌ Erro ao deletar role:', error)

      const errorMessage = error.response?.data?.message || error.message || "Não foi possível deletar a role"
      
      toast({
        title: "Erro ao deletar role",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Gerenciamento de Roles
            </h1>
            <p className="text-muted-foreground">
              Gerencie as roles e suas permissões do sistema
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Role
          </Button>
        </div>

        {/* Filtros e Busca */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Roles</CardTitle>
                <CardDescription>
                  {loading ? (
                    "Carregando..."
                  ) : (
                    <>
                      {roles.length} role(s) encontrada(s)
                      {debouncedSearch && ` para "${debouncedSearch}"`}
                    </>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Campo de busca */}
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                    onClick={handleClearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {searching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>

            {/* Tabela */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !roles.length ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? "Nenhuma role encontrada" : "Nenhuma role cadastrada"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? `Não encontramos roles com "${searchTerm}"`
                    : "Crie a primeira role do sistema"}
                </p>
                {searchTerm ? (
                  <Button variant="outline" onClick={handleClearSearch}>
                    Limpar busca
                  </Button>
                ) : (
                  <Button onClick={openCreateDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Role
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Permissões</TableHead>
                    <TableHead>Usuários</TableHead>
                    <TableHead>Criada em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-md truncate">
                        {role.description || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {role.permissions?.length || 0} permissões
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{role.usersCount || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(role.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <Link href={`/admin/roles/${role.id}`}>
                              <Shield className="mr-2 h-4 w-4" />
                              Detalhes
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(role)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(role)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Deletar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Criar Role */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Criar Nova Role</DialogTitle>
            <DialogDescription>
              Defina o nome e descrição da nova role. Você poderá adicionar permissões na página de detalhes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Nome *</Label>
              <Input
                id="create-name"
                placeholder="Ex: support, manager, sales"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                Entre 2 e 50 caracteres. Deve ser único.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-description">Descrição</Label>
              <Textarea
                id="create-description"
                placeholder="Descreva as responsabilidades desta role..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                maxLength={200}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Máximo 200 caracteres (opcional)
              </p>
            </div>

            <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              💡 <strong>Dica:</strong> Após criar a role, clique em "Detalhes" para adicionar permissões específicas.
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={creating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating || !formData.name.trim()}
            >
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Role"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Editar Role */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Role</DialogTitle>
            <DialogDescription>
              Atualize o nome e descrição da role.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome *</Label>
              <Input
                id="edit-name"
                placeholder="Ex: support, manager, sales"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                Entre 2 e 50 caracteres. Deve ser único.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                placeholder="Descreva as responsabilidades desta role..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                maxLength={200}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Máximo 200 caracteres (opcional)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={updating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updating || !formData.name.trim()}
            >
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog de Deletar Role */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar a role <strong>{selectedRole?.name}</strong>?
              {selectedRole?.usersCount && selectedRole.usersCount > 0 && (
                <span className="block mt-2 text-destructive">
                  ⚠️ Esta role possui {selectedRole.usersCount} usuário(s) vinculado(s).
                </span>
              )}
              <span className="block mt-2">
                Esta ação não pode ser desfeita.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deletando...
                </>
              ) : (
                "Deletar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
