"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft,
  Shield, 
  Loader2, 
  Save,
  Users,
  Key,
  CheckCircle2,
  XCircle
} from "lucide-react"
import { rolesApi, type Role, type Permission, type AllPermissionsResponse } from "@/lib/api/roles"
import { useToast } from "@/hooks/use-toast"

export default function RoleDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const roleId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [role, setRole] = useState<Role | null>(null)
  const [allPermissions, setAllPermissions] = useState<AllPermissionsResponse | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set())
  const [initialPermissions, setInitialPermissions] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadData()
  }, [roleId])

  const loadData = async () => {
    try {
      setLoading(true)

      // Buscar role e permissões em paralelo
      const [roleData, permissionsData] = await Promise.all([
        rolesApi.getById(roleId),
        rolesApi.getAllPermissions(),
      ])

      setRole(roleData)
      setAllPermissions(permissionsData)
      setFormData({
        name: roleData.name,
        description: roleData.description || "",
      })

      // Inicializar permissões selecionadas
      const currentPermissions = new Set(roleData.permissions.map(p => p.id))
      setSelectedPermissions(currentPermissions)
      setInitialPermissions(new Set(currentPermissions))

      console.log('✅ Role carregada:', roleData)
      console.log('✅ Permissões disponíveis:', permissionsData.all.length)
    } catch (error: any) {
      console.error('❌ Erro ao carregar dados:', error)
      
      toast({
        title: "Erro ao carregar role",
        description: error.response?.data?.message || error.message || "Não foi possível carregar os dados da role",
        variant: "destructive",
      })

      // Voltar para listagem se não encontrar a role
      if (error.response?.status === 404) {
        router.push('/admin/roles')
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionToggle = (permissionId: string) => {
    const newSelected = new Set(selectedPermissions)
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId)
    } else {
      newSelected.add(permissionId)
    }
    setSelectedPermissions(newSelected)
  }

  const handleSave = async () => {
    if (!role) return

    if (!formData.name.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O nome da role é obrigatório",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)

      // 1. Atualizar nome e descrição
      if (formData.name !== role.name || formData.description !== role.description) {
        await rolesApi.update(roleId, {
          name: formData.name,
          description: formData.description || undefined,
        })
      }

      // 2. Calcular permissões adicionadas e removidas
      const permissionsToAdd = Array.from(selectedPermissions).filter(
        id => !initialPermissions.has(id)
      )
      const permissionsToRemove = Array.from(initialPermissions).filter(
        id => !selectedPermissions.has(id)
      )

      // 3. Adicionar novas permissões
      if (permissionsToAdd.length > 0) {
        await rolesApi.addPermissions(roleId, permissionsToAdd)
        console.log('✅ Permissões adicionadas:', permissionsToAdd.length)
      }

      // 4. Remover permissões
      if (permissionsToRemove.length > 0) {
        await rolesApi.removePermissions(roleId, permissionsToRemove)
        console.log('✅ Permissões removidas:', permissionsToRemove.length)
      }

      toast({
        title: "✅ Role atualizada",
        description: "A role e suas permissões foram atualizadas com sucesso",
      })

      // Recarregar dados
      await loadData()
    } catch (error: any) {
      console.error('❌ Erro ao salvar role:', error)

      toast({
        title: "Erro ao salvar",
        description: error.response?.data?.message || error.message || "Não foi possível salvar as alterações",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = () => {
    if (!role) return false
    
    const nameChanged = formData.name !== role.name
    const descriptionChanged = formData.description !== (role.description || "")
    const permissionsChanged = selectedPermissions.size !== initialPermissions.size ||
      Array.from(selectedPermissions).some(id => !initialPermissions.has(id))
    
    return nameChanged || descriptionChanged || permissionsChanged
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando role...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!role || !allPermissions) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Role não encontrada</h2>
            <p className="text-muted-foreground mb-4">A role que você procura não existe</p>
            <Button asChild>
              <Link href="/admin/roles">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Roles
              </Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/roles">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Shield className="h-8 w-8" />
                {role.name}
              </h1>
              <p className="text-muted-foreground">
                Gerencie as informações e permissões desta role
              </p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges()}
          >
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

        <div className="grid gap-6 md:grid-cols-3">
          {/* Informações Básicas */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Informações da Role</CardTitle>
              <CardDescription>
                Edite o nome e descrição desta role
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
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
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva as responsabilidades desta role..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  maxLength={200}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Máximo 200 caracteres.
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Criada em</p>
                  <p className="font-medium">{formatDate(role.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Atualizada em</p>
                  <p className="font-medium">{formatDate(role.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Usuários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{role.usersCount || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  usuário(s) com esta role
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Permissões
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{selectedPermissions.size}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  de {allPermissions.all.length} permissões
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Gestão de Permissões */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Permissões
            </CardTitle>
            <CardDescription>
              Selecione as permissões que esta role deve ter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(allPermissions.byResource).map(([resource, permissions]) => (
                <div key={resource} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg capitalize">{resource}</h3>
                    <Badge variant="outline">
                      {permissions.filter(p => selectedPermissions.has(p.id)).length} / {permissions.length}
                    </Badge>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer"
                        onClick={() => handlePermissionToggle(permission.id)}
                      >
                        <Checkbox
                          id={permission.id}
                          checked={selectedPermissions.has(permission.id)}
                          onCheckedChange={() => handlePermissionToggle(permission.id)}
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={permission.id}
                            className="text-sm font-medium leading-none cursor-pointer"
                          >
                            {permission.name}
                          </label>
                          <p className="text-xs text-muted-foreground mt-1">
                            {permission.description}
                          </p>
                        </div>
                        {selectedPermissions.has(permission.id) && (
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                  <Separator />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
