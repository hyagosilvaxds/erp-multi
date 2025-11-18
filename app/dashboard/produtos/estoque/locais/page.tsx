'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, MapPin, Package, ArrowLeftRight, CheckCircle2, XCircle } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { usePermissions } from '@/hooks/use-permissions'
import { stockLocationsApi, type StockLocation, type CreateStockLocationRequest, type UpdateStockLocationRequest } from '@/lib/api/products'

export default function StockLocationsPage() {
  const [locations, setLocations] = useState<StockLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<StockLocation | null>(null)
  const [locationToDelete, setLocationToDelete] = useState<StockLocation | null>(null)
  const [saving, setSaving] = useState(false)

  const { toast } = useToast()
  const permissions = usePermissions('company')

  const canCreate = permissions.can('produtos', 'create')
  const canEdit = permissions.can('produtos', 'edit')
  const canDelete = permissions.can('produtos', 'delete')

  const [formData, setFormData] = useState<CreateStockLocationRequest>({
    name: '',
    code: '',
    description: '',
    address: '',
    isDefault: false,
    active: true,
  })

  useEffect(() => {
    loadLocations()
  }, [])

  const loadLocations = async () => {
    try {
      setLoading(true)
      const data = await stockLocationsApi.getAll()
      setLocations(data)
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar locais',
        description: error.response?.data?.message || 'Não foi possível carregar os locais de estoque.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (location?: StockLocation) => {
    if (location) {
      setEditingLocation(location)
      setFormData({
        name: location.name,
        code: location.code,
        description: location.description || '',
        address: location.address || '',
        isDefault: location.isDefault,
        active: location.active,
      })
    } else {
      setEditingLocation(null)
      setFormData({
        name: '',
        code: '',
        description: '',
        address: '',
        isDefault: false,
        active: true,
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingLocation(null)
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      if (!formData.name.trim() || !formData.code.trim()) {
        toast({
          title: 'Campos obrigatórios',
          description: 'Nome e código são obrigatórios.',
          variant: 'destructive',
        })
        return
      }

      if (editingLocation) {
        // Update
        const { code, ...updateData } = formData // Remove code do update
        await stockLocationsApi.update(editingLocation.id, updateData)
        toast({
          title: 'Local atualizado',
          description: 'Local de estoque atualizado com sucesso!',
        })
      } else {
        // Create
        await stockLocationsApi.create(formData)
        toast({
          title: 'Local criado',
          description: 'Local de estoque criado com sucesso!',
        })
      }

      handleCloseDialog()
      loadLocations()
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.response?.data?.message || 'Não foi possível salvar o local.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!locationToDelete) return

    try {
      await stockLocationsApi.delete(locationToDelete.id)
      toast({
        title: 'Local deletado',
        description: 'Local de estoque deletado com sucesso!',
      })
      setDeleteDialogOpen(false)
      setLocationToDelete(null)
      loadLocations()
    } catch (error: any) {
      toast({
        title: 'Erro ao deletar',
        description: error.response?.data?.message || 'Não foi possível deletar o local.',
        variant: 'destructive',
      })
    }
  }

  const openDeleteDialog = (location: StockLocation) => {
    setLocationToDelete(location)
    setDeleteDialogOpen(true)
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Locais de Estoque</h1>
          <p className="text-muted-foreground">
            Gerencie os depósitos, lojas e armazéns da empresa
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Local
          </Button>
        )}
      </div>

      {/* Lista de Locais */}
      {!loading && locations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum local cadastrado</h3>
            <p className="text-muted-foreground text-center mb-4">
              Comece criando o primeiro local de estoque da sua empresa.
            </p>
            {canCreate && (
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Local
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => (
            <Card key={location.id} className={!location.active ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{location.name}</CardTitle>
                      {location.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Padrão
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="font-mono text-sm">
                      {location.code}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    {location.active ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {location.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {location.description}
                  </p>
                )}

                {location.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {location.address}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {location._count?.productStocks || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Produtos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {location._count?.stockMovements || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Movimentações</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleOpenDialog(location)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteDialog(location)}
                      disabled={location._count && location._count.productStocks > 0}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog Create/Edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? 'Editar Local de Estoque' : 'Novo Local de Estoque'}
            </DialogTitle>
            <DialogDescription>
              {editingLocation
                ? 'Atualize as informações do local de estoque'
                : 'Preencha os dados do novo local de estoque'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nome <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Depósito Central"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">
                  Código <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  placeholder="Ex: DEP-01"
                  disabled={!!editingLocation}
                  className={editingLocation ? 'bg-muted' : ''}
                />
                {editingLocation && (
                  <p className="text-xs text-muted-foreground">
                    O código não pode ser alterado após a criação
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do local de estoque"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Endereço completo do local"
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label>Local Padrão</Label>
                <p className="text-sm text-muted-foreground">
                  Usar como local padrão para novas movimentações
                </p>
              </div>
              <Switch
                checked={formData.isDefault}
                onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label>Ativo</Label>
                <p className="text-sm text-muted-foreground">
                  Local disponível para movimentações
                </p>
              </div>
              <Switch
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : editingLocation ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar o local{' '}
              <span className="font-semibold">{locationToDelete?.name}</span>?
              <br />
              <br />
              Esta ação não pode ser desfeita. O local não pode ter produtos em estoque ou
              transferências pendentes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLocationToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </DashboardLayout>
  )
}
