"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Users, 
  Mail, 
  Lock,
  Building2,
  Calendar,
  Shield,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react"
import { usersApi, type UserDetail } from "@/lib/api/users"
import { rolesApi, type Role } from "@/lib/api/roles"
import { authApi } from "@/lib/api/auth"
import { apiClient } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"
import { formatApiError } from "@/lib/format-error"

export default function EditUserPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const companyId = params.id as string
  const userId = params.userId as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showUnlinkDialog, setShowUnlinkDialog] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [companyToUnlink, setCompanyToUnlink] = useState<string | null>(null)
  const [unlinking, setUnlinking] = useState(false)
  const [linking, setLinking] = useState(false)
  const [linkFormData, setLinkFormData] = useState({
    companyId: "",
    roleId: "",
    active: true,
  })
  const [availableCompanies, setAvailableCompanies] = useState<any[]>([])
  const [user, setUser] = useState<UserDetail | null>(null)
  const [roles, setRoles] = useState<Role[]>([])
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    active: true,
    roleId: "",
  })
  const [companyName, setCompanyName] = useState("")

  useEffect(() => {
    loadData()
  }, [userId, companyId])

  const loadData = async () => {
    try {
      setLoading(true)

      // Carregar usuário
      const userData = await usersApi.getById(userId, companyId)
      setUser(userData)

      // Preencher formulário
      const userCompany = userData.companies.find(c => c.companyId === companyId)
      setFormData({
        name: userData.name,
        email: userData.email,
        password: "",
        active: userData.active,
        roleId: userCompany?.roleId || "",
      })

      // Nome da empresa
      setCompanyName(userCompany?.company?.nomeFantasia || userCompany?.company?.razaoSocial || "")

      // Carregar roles da empresa específica
      // Precisamos fazer uma chamada customizada pois rolesApi.getAll() usa localStorage
      const { data: rolesData } = await apiClient.get('/roles', {
        headers: {
          'x-company-id': companyId,
        },
      })
      setRoles(rolesData)
    } catch (error: any) {
      console.error('❌ Erro ao carregar dados:', error)

      const { title, description } = formatApiError(error)

      toast({
        title,
        description,
        variant: "destructive",
      })

      router.push(`/admin/empresas/${companyId}/usuarios`)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Verificar se está tentando editar a si mesmo
    const currentUser = authApi.getUser()
    if (currentUser && currentUser.userId === userId) {
      toast({
        title: "Ação não permitida",
        description: "Você não pode editar seus próprios dados desta forma.",
        variant: "destructive",
      })
      return
    }

    if (!formData.name || !formData.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome e email.",
        variant: "destructive",
      })
      return
    }

    if (formData.password && formData.password.length < 6) {
      toast({
        title: "Senha inválida",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)

      // Atualizar dados básicos
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        active: formData.active,
      }

      if (formData.password) {
        updateData.password = formData.password
      }

      await usersApi.update(userId, companyId, updateData)

      // Atualizar role se mudou
      const currentRole = user?.companies.find(c => c.companyId === companyId)?.roleId
      if (formData.roleId && formData.roleId !== currentRole) {
        await usersApi.updateUserRole(userId, companyId, formData.roleId)
      }

      toast({
        title: "Usuário atualizado!",
        description: "As alterações foram salvas com sucesso.",
      })

      router.push(`/admin/empresas/${companyId}/usuarios`)
    } catch (error: any) {
      console.error('❌ Erro ao atualizar usuário:', error)

      const { title, description } = formatApiError(error)

      toast({
        title,
        description,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async () => {
    try {
      await usersApi.toggleActive(userId, companyId)
      
      toast({
        title: "Status atualizado!",
        description: `Usuário ${formData.active ? "desativado" : "ativado"} com sucesso.`,
      })

      // Recarregar dados
      await loadData()
    } catch (error: any) {
      console.error('❌ Erro ao alterar status:', error)

      const { title, description } = formatApiError(error)

      toast({
        title,
        description,
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)

      await usersApi.delete(userId, companyId)

      toast({
        title: "Usuário removido!",
        description: "O usuário foi desativado e removido da empresa.",
      })

      router.push(`/admin/empresas/${companyId}/usuarios`)
    } catch (error: any) {
      console.error('❌ Erro ao deletar usuário:', error)

      const { title, description } = formatApiError(error)

      toast({
        title,
        description,
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleUnlinkCompany = async () => {
    if (!companyToUnlink) return

    try {
      setUnlinking(true)

      await usersApi.unlinkCompany(userId, companyToUnlink, companyId)

      toast({
        title: "Empresa desvinculada!",
        description: "O usuário foi desvinculado da empresa com sucesso.",
      })

      // Recarregar dados
      await loadData()
    } catch (error: any) {
      console.error('❌ Erro ao desvincular empresa:', error)

      const { title, description } = formatApiError(error)

      toast({
        title,
        description,
        variant: "destructive",
      })
    } finally {
      setUnlinking(false)
      setShowUnlinkDialog(false)
      setCompanyToUnlink(null)
    }
  }

  const openUnlinkDialog = (targetCompanyId: string) => {
    setCompanyToUnlink(targetCompanyId)
    setShowUnlinkDialog(true)
  }

  const openLinkDialog = async () => {
    // Buscar empresas disponíveis via API (todas menos as já vinculadas)
    try {
      setLoading(true)
      
      // Importar companiesApi dinamicamente
      const { companiesApi } = await import('@/lib/api/auth')
      
      // Buscar todas as empresas
      const response = await companiesApi.getAllCompanies()
      const allCompanies = Array.isArray(response) ? response : (response as any)?.data || []
      
      console.log('� All Companies from API:', allCompanies)
      console.log('📋 User being edited:', user)
      
      // Filtrar empresas já vinculadas
      const linkedCompanyIds = user?.companies.map(c => c.companyId) || []
      console.log('🔗 Linked Company IDs:', linkedCompanyIds)
      
      const available = allCompanies.filter(
        (c: any) => !linkedCompanyIds.includes(c.id)
      )
      console.log('✅ Available Companies:', available)
      
      setAvailableCompanies(available)
      setShowLinkDialog(true)
    } catch (error) {
      console.error('❌ Erro ao carregar empresas disponíveis:', error)
      
      const { title, description } = formatApiError(error)
      
      toast({
        title,
        description,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLinkCompany = async () => {
    if (!linkFormData.companyId || !linkFormData.roleId) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione a empresa e a role para vincular o usuário.",
        variant: "destructive",
      })
      return
    }

    try {
      setLinking(true)

      await usersApi.linkCompany(userId, companyId, linkFormData)

      toast({
        title: "Empresa vinculada!",
        description: "O usuário foi vinculado à empresa com sucesso.",
      })

      // Recarregar dados
      await loadData()

      // Limpar formulário
      setLinkFormData({
        companyId: "",
        roleId: "",
        active: true,
      })
    } catch (error: any) {
      console.error('❌ Erro ao vincular empresa:', error)

      const { title, description } = formatApiError(error)

      toast({
        title,
        description,
        variant: "destructive",
      })
    } finally {
      setLinking(false)
      setShowLinkDialog(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Verificar se é o próprio usuário
  const currentUser = authApi.getUser()
  const isCurrentUser = !!(currentUser && currentUser.userId === userId)

  if (loading) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Usuário não encontrado</h2>
            <Button
              onClick={() => router.push(`/admin/empresas/${companyId}/usuarios`)}
              className="mt-4"
            >
              Voltar
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="admin">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/admin/empresas/${companyId}/usuarios`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                  <Users className="h-8 w-8" />
                  Editar Usuário
                </h1>
                {isCurrentUser && (
                  <Badge variant="outline" className="ml-2">Você</Badge>
                )}
              </div>
              <p className="text-muted-foreground">{companyName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={saving || isCurrentUser}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remover
            </Button>
            <Button type="submit" disabled={saving || isCurrentUser}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Aviso se for o próprio usuário */}
        {isCurrentUser && (
          <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
            <CardContent className="pt-6">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Você não pode editar seus próprios dados desta forma. Use as configurações de perfil.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>Dados pessoais do usuário</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome do usuário"
                    disabled={isCurrentUser}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@empresa.com"
                      className="pl-10"
                      disabled={isCurrentUser}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Nova senha (opcional)</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Deixe em branco para manter a atual"
                      className="pl-10 pr-10"
                      disabled={isCurrentUser}
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Mínimo 6 caracteres</p>
                </div>
              </CardContent>
            </Card>

            {/* Role e Permissões */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Role e Permissões
                </CardTitle>
                <CardDescription>
                  Função e nível de acesso do usuário nesta empresa ({companyName})
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 mb-4">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    ℹ️ <strong>Importante:</strong> Este usuário pode ter roles diferentes em outras empresas. 
                    A role selecionada aqui se aplica apenas a <strong>{companyName}</strong>.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role do usuário nesta empresa</Label>
                  <Select 
                    value={formData.roleId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, roleId: value }))}
                    disabled={isCurrentUser}
                  >
                    <SelectTrigger id="role" className="w-full">
                      <SelectValue placeholder="Escolha uma role" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id} className="w-full">
                          <div className="flex flex-col items-start w-full py-1">
                            <span className="font-medium">{role.name}</span>
                            <span className="text-xs text-muted-foreground line-clamp-2">{role.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Permissões da Role Selecionada */}
                {formData.roleId && (
                  <div className="space-y-2">
                    <Label>Permissões desta role:</Label>
                    <div className="rounded-lg border p-3 max-h-[200px] overflow-y-auto bg-muted/30">
                      {roles.find(r => r.id === formData.roleId)?.permissions.length ? (
                        <div className="flex flex-wrap gap-1.5">
                          {roles.find(r => r.id === formData.roleId)?.permissions.map((perm) => (
                            <Badge key={perm.id} variant="secondary" className="text-xs">
                              {perm.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">Nenhuma permissão</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Coluna Lateral */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
                <CardDescription>Ativar ou desativar usuário</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="active">Usuário ativo</Label>
                    <p className="text-xs text-muted-foreground">
                      {formData.active ? "Usuário pode acessar o sistema" : "Usuário bloqueado"}
                    </p>
                  </div>
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                    disabled={isCurrentUser}
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleToggleActive}
                  disabled={isCurrentUser}
                >
                  {formData.active ? "Desativar Usuário" : "Ativar Usuário"}
                </Button>
              </CardContent>
            </Card>

            {/* Metadados */}
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Criado em</p>
                    <p className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Última atualização</p>
                    <p className="text-sm text-muted-foreground">{formatDate(user.updatedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Empresas Vinculadas */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Empresas Vinculadas
                    </CardTitle>
                    <CardDescription>
                      {user.companies.length} empresa(s) vinculada(s)
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openLinkDialog}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    Vincular Empresa
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {user.companies.map((userCompany) => {
                    const isCurrentCompany = userCompany.companyId === companyId
                    return (
                      <div key={userCompany.companyId} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {userCompany.company?.nomeFantasia || userCompany.company?.razaoSocial}
                            {isCurrentCompany && (
                              <Badge variant="outline" className="ml-2">Atual</Badge>
                            )}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {userCompany.role.name}
                            </Badge>
                            {userCompany.active && (
                              <Badge variant="secondary" className="text-xs">Ativo</Badge>
                            )}
                          </div>
                        </div>
                        {!isCurrentCompany && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => openUnlinkDialog(userCompany.companyId)}
                            className="ml-2 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{user?.name}</strong>?
              <br /><br />
              O usuário será desativado e removido de todas as empresas, mas não será excluído permanentemente do banco de dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removendo...
                </>
              ) : (
                "Confirmar Remoção"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Confirmação de Desvinculação */}
      <AlertDialog open={showUnlinkDialog} onOpenChange={setShowUnlinkDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desvincular da Empresa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desvincular <strong>{user?.name}</strong> desta empresa?
              <br /><br />
              {companyToUnlink && user && (
                <>
                  O usuário será desvinculado de <strong>
                    {user.companies.find(c => c.companyId === companyToUnlink)?.company?.nomeFantasia ||
                     user.companies.find(c => c.companyId === companyToUnlink)?.company?.razaoSocial}
                  </strong> e perderá todos os acessos relacionados a esta empresa.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={unlinking}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnlinkCompany}
              disabled={unlinking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {unlinking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Desvinculando...
                </>
              ) : (
                "Confirmar Desvinculação"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Vincular Empresa */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Vincular Empresa</DialogTitle>
            <DialogDescription>
              Vincule <strong>{user?.name}</strong> a uma nova empresa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="link-company">Empresa</Label>
              <Select
                value={linkFormData.companyId}
                onValueChange={(value) => setLinkFormData({ ...linkFormData, companyId: value })}
              >
                <SelectTrigger id="link-company">
                  <SelectValue placeholder="Selecione uma empresa" />
                </SelectTrigger>
                <SelectContent>
                  {availableCompanies.length > 0 ? (
                    availableCompanies
                      .filter(company => company && company.id) // Remove empresas inválidas
                      .map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.nomeFantasia || company.razaoSocial || 'Sem nome'}
                        </SelectItem>
                      ))
                  ) : (
                    <SelectItem key="none" value="none" disabled>
                      Nenhuma empresa disponível
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="link-role">Role</Label>
              <Select
                value={linkFormData.roleId}
                onValueChange={(value) => setLinkFormData({ ...linkFormData, roleId: value })}
              >
                <SelectTrigger id="link-role">
                  <SelectValue placeholder="Selecione uma role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                      {role.description && (
                        <span className="text-xs text-muted-foreground ml-2">
                          - {role.description}
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="link-active">Usuário ativo na empresa?</Label>
              <Switch
                id="link-active"
                checked={linkFormData.active}
                onCheckedChange={(checked) => setLinkFormData({ ...linkFormData, active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLinkDialog(false)}
              disabled={linking}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleLinkCompany}
              disabled={linking || !linkFormData.companyId || !linkFormData.roleId}
            >
              {linking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Vinculando...
                </>
              ) : (
                "Vincular Empresa"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
