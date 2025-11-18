"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  Search, 
  Plus, 
  Users, 
  Loader2, 
  X, 
  Edit,
  CheckCircle2,
  XCircle,
  Building2,
  Eye,
  EyeOff
} from "lucide-react"
import { usersApi, type AllUsersListResponse } from "@/lib/api/users"
import { authApi } from "@/lib/api/auth"
import { useToast } from "@/hooks/use-toast"

export default function AllUsuariosPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [usersData, setUsersData] = useState<AllUsersListResponse | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState<string>("all")
  
  // Dialog para escolher empresa
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false)
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any>(null)

  // Dialog para criar usuário
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    password: "",
    active: true,
  })

  // Debounce do termo de busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Carregar usuários quando filtros mudam
  useEffect(() => {
    loadUsers()
  }, [debouncedSearch, activeFilter])

  const loadUsers = async () => {
    try {
      setSearching(true)
      
      const params: any = {
        search: debouncedSearch || undefined,
      }
      
      if (activeFilter !== "all") {
        params.active = activeFilter === "active"
      }
      
      const data = await usersApi.getAll(params)
      setUsersData(data)
      
      if (debouncedSearch) {
        console.log(`🔍 Busca: "${debouncedSearch}" | Encontrados: ${data.data.length}`)
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar usuários:', error)
      
      toast({
        title: "Erro ao carregar usuários",
        description: error.message || "Não foi possível carregar a lista de usuários",
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const handleEditClick = (user: any) => {
    // Se o usuário tem mais de uma empresa, abre dialog para escolher
    if (user.companies.length > 1) {
      setSelectedUserForEdit(user)
      setIsCompanyDialogOpen(true)
    } else if (user.companies.length === 1) {
      // Se tem só uma empresa, vai direto
      router.push(`/admin/empresas/${user.companies[0].companyId}/usuarios/${user.id}`)
    }
  }

  const handleCompanySelect = (companyId: string) => {
    if (selectedUserForEdit) {
      router.push(`/admin/empresas/${companyId}/usuarios/${selectedUserForEdit.id}`)
    }
    setIsCompanyDialogOpen(false)
    setSelectedUserForEdit(null)
  }

  const handleOpenCreateDialog = () => {
    setNewUserForm({
      name: "",
      email: "",
      password: "",
      active: true,
    })
    setShowPassword(false)
    setIsCreateDialogOpen(true)
  }

  const handleCreateUser = async () => {
    try {
      // Validações
      if (!newUserForm.name || !newUserForm.email || !newUserForm.password) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive",
        })
        return
      }

      if (newUserForm.password.length < 6) {
        toast({
          title: "Erro",
          description: "A senha deve ter no mínimo 6 caracteres",
          variant: "destructive",
        })
        return
      }

      const selectedCompany = authApi.getSelectedCompany()
      if (!selectedCompany) {
        toast({
          title: "Erro",
          description: "Nenhuma empresa selecionada",
          variant: "destructive",
        })
        return
      }

      setIsCreating(true)

      await usersApi.create(
        {
          name: newUserForm.name,
          email: newUserForm.email,
          password: newUserForm.password,
          active: newUserForm.active,
        },
        selectedCompany.id
      )

      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso",
      })

      setIsCreateDialogOpen(false)
      loadUsers()
    } catch (error: any) {
      console.error('❌ Erro ao criar usuário:', error)
      
      const errorMessage = error.response?.data?.message || "Não foi possível criar o usuário"
      
      toast({
        title: "Erro ao criar usuário",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-8 w-8" />
              Todos os Usuários do Sistema
            </h1>
            <p className="text-muted-foreground">
              Visualize e gerencie todos os usuários cadastrados no sistema
            </p>
          </div>
          <Button onClick={handleOpenCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Usuário
          </Button>
        </div>

        {/* Filtros e Busca */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Usuários</CardTitle>
                <CardDescription>
                  {loading ? (
                    "Carregando..."
                  ) : (
                    <>
                      {usersData?.meta.total || 0} usuário(s) encontrado(s)
                      {debouncedSearch && ` para "${debouncedSearch}"`}
                    </>
                  )}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={activeFilter} onValueChange={setActiveFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Campo de busca */}
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
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
            ) : !usersData?.data.length ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? "Nenhum usuário encontrado" : "Nenhum usuário cadastrado"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? `Não encontramos usuários com "${searchTerm}"`
                    : "Adicione o primeiro usuário do sistema"}
                </p>
                {searchTerm && (
                  <Button variant="outline" onClick={handleClearSearch}>
                    Limpar busca
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Empresas</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersData.data.map((user) => {
                    const currentUser = authApi.getUser()
                    const isCurrentUser = !!(currentUser && currentUser.userId === user.id)
                    const companiesCount = user._count.companies
                    
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name}
                          {isCurrentUser && (
                            <Badge variant="outline" className="ml-2">Você</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{companiesCount} empresa(s)</span>
                          </div>
                          {user.companies.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {user.companies.slice(0, 2).map((company) => (
                                <Badge key={company.companyId} variant="secondary" className="text-xs">
                                  {company.company?.nomeFantasia || company.company?.razaoSocial}
                                </Badge>
                              ))}
                              {user.companies.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{user.companies.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.active ? (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Ativo
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <XCircle className="mr-1 h-3 w-3" />
                              Inativo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(user)}
                            disabled={companiesCount === 0}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog para escolher empresa */}
      <Dialog open={isCompanyDialogOpen} onOpenChange={setIsCompanyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selecione uma Empresa</DialogTitle>
            <DialogDescription>
              O usuário <strong>{selectedUserForEdit?.name}</strong> está vinculado a várias empresas. 
              Escolha com qual empresa você deseja editar este usuário.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 mt-4">
            {selectedUserForEdit?.companies.map((company: any) => (
              <Button
                key={company.companyId}
                variant="outline"
                className="w-full justify-start h-auto py-4 px-4"
                onClick={() => handleCompanySelect(company.companyId)}
              >
                <div className="flex items-start gap-3 w-full">
                  <Building2 className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">
                      {company.company?.nomeFantasia || company.company?.razaoSocial}
                    </div>
                    {company.company?.razaoSocial && company.company?.nomeFantasia && (
                      <div className="text-sm text-muted-foreground mt-0.5">
                        {company.company.razaoSocial}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {company.role?.name || 'Sem role'}
                      </Badge>
                      {company.active ? (
                        <Badge variant="default" className="text-xs bg-green-500">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <XCircle className="mr-1 h-3 w-3" />
                          Inativo
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para criar usuário */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
            <DialogDescription>
              Crie um novo usuário e vincule à empresa atual
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nome Completo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={newUserForm.name}
                onChange={(e) =>
                  setNewUserForm({ ...newUserForm, name: e.target.value })
                }
                placeholder="João da Silva"
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={newUserForm.email}
                onChange={(e) =>
                  setNewUserForm({ ...newUserForm, email: e.target.value })
                }
                placeholder="usuario@exemplo.com"
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Senha <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={newUserForm.password}
                  onChange={(e) =>
                    setNewUserForm({ ...newUserForm, password: e.target.value })
                  }
                  placeholder="Mínimo 6 caracteres"
                  disabled={isCreating}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isCreating}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Senha deve ter no mínimo 6 caracteres
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={newUserForm.active}
                onCheckedChange={(checked) =>
                  setNewUserForm({ ...newUserForm, active: checked })
                }
                disabled={isCreating}
              />
              <Label htmlFor="active">Usuário ativo</Label>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="text-sm text-blue-800">
                <strong>ℹ️ Informação:</strong> O usuário será vinculado
                automaticamente à empresa atual com a role padrão (Gerente).
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateUser} disabled={isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
