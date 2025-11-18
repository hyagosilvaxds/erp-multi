"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Users, 
  Loader2, 
  X, 
  Edit,
  CheckCircle2,
  XCircle,
  UserPlus
} from "lucide-react"
import { usersApi, type UserDetail, type UsersListResponse, type Role } from "@/lib/api/users"
import { authApi } from "@/lib/api/auth"
import { useToast } from "@/hooks/use-toast"

export default function UsuariosEmpresaPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const companyId = params.id as string

  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [usersData, setUsersData] = useState<UsersListResponse | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState<string>("all")

  // Dados adicionais
  const [allUsers, setAllUsers] = useState<UserDetail[]>([])
  const [roles, setRoles] = useState<Role[]>([])

  // Dialogs
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [linkSubmitting, setLinkSubmitting] = useState(false)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [roleSubmitting, setRoleSubmitting] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null)

  // Link form
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [selectedRoleId, setSelectedRoleId] = useState<string>('')
  const [linkActive, setLinkActive] = useState(true)

  // Change role form
  const [newRoleId, setNewRoleId] = useState<string>('')

  // Debounce do termo de busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Carregar usuários quando filtros mudam
  useEffect(() => {
    if (companyId) {
      loadUsers()
    }
  }, [companyId, debouncedSearch, activeFilter])

  // Carregar roles e todos usuários uma vez
  useEffect(() => {
    loadRolesAndAllUsers()
  }, [])

  const loadRolesAndAllUsers = async () => {
    try {
      const [rolesData, allUsersData] = await Promise.all([
        usersApi.getRoles(),
        usersApi.getAll(),
      ])
      setRoles(rolesData)
      setAllUsers(allUsersData.data)
    } catch (error: any) {
      console.error('❌ Erro ao carregar dados:', error)
    }
  }

  const loadUsers = async () => {
    try {
      setSearching(true)
      
      const params: any = {
        search: debouncedSearch || undefined,
      }
      
      if (activeFilter !== "all") {
        params.active = activeFilter === "active"
      }
      
      const data = await usersApi.getByCompany(companyId, params)
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

  const getUserCompanyRole = (user: UserDetail) => {
    const userCompany = user.companies.find(c => c.companyId === companyId)
    return userCompany?.role.name || "Sem role"
  }

  const getUserCompanyStatus = (user: UserDetail) => {
    const userCompany = user.companies.find(c => c.companyId === companyId)
    return userCompany?.active && user.active
  }

  const handleOpenLinkDialog = () => {
    setSelectedUserId('')
    const defaultRole = roles.find(r => r.name === 'Gerente')
    setSelectedRoleId(defaultRole?.id || '')
    setLinkActive(true)
    setLinkDialogOpen(true)
  }

  const handleLinkUser = async () => {
    try {
      setLinkSubmitting(true)

      if (!selectedUserId || !selectedRoleId) {
        toast({
          title: "Erro",
          description: "Selecione um usuário e uma role",
          variant: "destructive",
        })
        return
      }

      await usersApi.linkCompany(selectedUserId, companyId, {
        companyId,
        roleId: selectedRoleId,
        active: linkActive,
      })

      toast({
        title: "Sucesso",
        description: "Usuário vinculado à empresa",
      })

      setLinkDialogOpen(false)
      loadUsers()
      loadRolesAndAllUsers() // Atualizar lista de usuários disponíveis
    } catch (error: any) {
      console.error('❌ Erro ao vincular usuário:', error)
      
      const errorMessage = error.response?.data?.message || "Não foi possível vincular o usuário"
      
      toast({
        title: "Erro ao vincular usuário",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLinkSubmitting(false)
    }
  }

  const handleUnlinkUser = async (userId: string, userName: string) => {
    if (!confirm(`Deseja realmente desvincular ${userName} desta empresa?`)) {
      return
    }

    try {
      await usersApi.unlinkCompany(userId, companyId, companyId)

      toast({
        title: "Sucesso",
        description: "Usuário desvinculado da empresa",
      })

      loadUsers()
      loadRolesAndAllUsers() // Atualizar lista de usuários disponíveis
    } catch (error: any) {
      console.error('❌ Erro ao desvincular usuário:', error)
      
      toast({
        title: "Erro ao desvincular usuário",
        description: error.response?.data?.message || "Não foi possível desvincular o usuário",
        variant: "destructive",
      })
    }
  }

  const handleOpenRoleDialog = (user: UserDetail) => {
    setSelectedUser(user)
    const userCompany = user.companies.find((c) => c.companyId === companyId)
    setNewRoleId(userCompany?.roleId || '')
    setRoleDialogOpen(true)
  }

  const handleChangeRole = async () => {
    if (!selectedUser) return

    try {
      setRoleSubmitting(true)

      await usersApi.updateUserRole(selectedUser.id, companyId, newRoleId)

      toast({
        title: "Sucesso",
        description: "Role atualizada com sucesso",
      })

      setRoleDialogOpen(false)
      setSelectedUser(null)
      loadUsers()
    } catch (error: any) {
      console.error('❌ Erro ao atualizar role:', error)
      
      toast({
        title: "Erro ao atualizar role",
        description: error.response?.data?.message || "Não foi possível atualizar a role",
        variant: "destructive",
      })
    } finally {
      setRoleSubmitting(false)
    }
  }

  const handleToggleUserActive = async (userId: string) => {
    try {
      await usersApi.toggleActive(userId, companyId)

      toast({
        title: "Sucesso",
        description: "Status do usuário atualizado",
      })

      loadUsers()
    } catch (error: any) {
      console.error('❌ Erro ao alterar status:', error)
      
      toast({
        title: "Erro ao alterar status",
        description: error.response?.data?.message || "Não foi possível alterar o status",
        variant: "destructive",
      })
    }
  }

  // Usuários disponíveis para vincular (que não estão nesta empresa)
  const availableUsers = allUsers.filter(
    (user) => !usersData?.data.some((u) => u.id === user.id)
  )

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/admin/empresas')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Users className="h-8 w-8" />
                Usuários da Empresa
              </h1>
              {usersData?.company && (
                <p className="text-muted-foreground">
                  {usersData.company.nomeFantasia || usersData.company.razaoSocial}
                </p>
              )}
            </div>
          </div>
          <Button onClick={handleOpenLinkDialog}>
            <UserPlus className="mr-2 h-4 w-4" />
            Vincular Usuário
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
                    : "Adicione o primeiro usuário desta empresa"}
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
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersData.data.map((user) => {
                    const isActive = getUserCompanyStatus(user)
                    const role = getUserCompanyRole(user)
                    const currentUser = authApi.getUser()
                    const isCurrentUser = !!(currentUser && currentUser.userId === user.id)
                    
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
                          <Badge variant="outline">{role}</Badge>
                        </TableCell>
                        <TableCell>
                          {isActive ? (
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
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenRoleDialog(user)}
                            >
                              Alterar Role
                            </Button>
                            <Switch
                              checked={isActive}
                              onCheckedChange={() => handleToggleUserActive(user.id)}
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleUnlinkUser(user.id, user.name)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialog de Vincular Usuário */}
        <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Vincular Usuário à Empresa</DialogTitle>
              <DialogDescription>
                Selecione um usuário existente para vincular a esta empresa
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {availableUsers.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Users className="mx-auto h-12 w-12 mb-2 opacity-20" />
                  <p>Todos os usuários já estão vinculados a esta empresa</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="user">
                      Usuário <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={selectedUserId}
                      onValueChange={setSelectedUserId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um usuário" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">
                      Role <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={selectedRoleId}
                      onValueChange={setSelectedRoleId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="linkActive"
                      checked={linkActive}
                      onCheckedChange={setLinkActive}
                    />
                    <Label htmlFor="linkActive">Usuário ativo</Label>
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setLinkDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleLinkUser}
                disabled={linkSubmitting || availableUsers.length === 0}
              >
                {linkSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Vincular
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Alterar Role */}
        <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Alterar Role do Usuário</DialogTitle>
              <DialogDescription>
                Altere a role de <strong>{selectedUser?.name}</strong> nesta empresa
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="newRole">
                  Nova Role <span className="text-red-500">*</span>
                </Label>
                <Select value={newRoleId} onValueChange={setNewRoleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRoleDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleChangeRole} disabled={roleSubmitting}>
                {roleSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
