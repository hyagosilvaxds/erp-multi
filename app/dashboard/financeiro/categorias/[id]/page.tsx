"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { financialCategoriesApi, type FinancialCategory } from "@/lib/api/financial"
import { authApi } from "@/lib/api/auth"
import { useToast } from "@/hooks/use-toast"

export default function EditarCategoria() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categoria, setCategoria] = useState<FinancialCategory | null>(null)
  const [categoriasDisponiveis, setCategoriasDisponiveis] = useState<FinancialCategory[]>([])
  const selectedCompany = authApi.getSelectedCompany()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3b82f6",
    icon: "",
    parentId: "",
    active: true,
  })

  useEffect(() => {
    if (selectedCompany?.id && params.id) {
      loadCategoria()
      loadCategorias()
    }
  }, [selectedCompany?.id, params.id])

  const loadCategoria = async () => {
    try {
      setLoading(true)
      if (!selectedCompany?.id || !params.id) {
        toast({
          title: "Erro",
          description: "Nenhuma empresa selecionada ou categoria inválida",
          variant: "destructive",
        })
        return
      }

      const data = await financialCategoriesApi.getById(params.id as string, selectedCompany.id)
      setCategoria(data)
      
      setFormData({
        name: data.name,
        description: data.description || "",
        color: data.color || "#3b82f6",
        icon: data.icon || "",
        parentId: data.parentId || "",
        active: data.active,
      })
    } catch (error: any) {
      console.error("Erro ao carregar categoria:", error)
      toast({
        title: "Erro ao carregar categoria",
        description: error.response?.data?.message || error.message || "Ocorreu um erro ao carregar a categoria",
        variant: "destructive",
      })
      router.push("/dashboard/financeiro/categorias")
    } finally {
      setLoading(false)
    }
  }

  const loadCategorias = async () => {
    try {
      if (!selectedCompany?.id) return
      const data = await financialCategoriesApi.getAll(selectedCompany.id)
      // Filtrar para não permitir selecionar a própria categoria ou suas subcategorias como pai
      setCategoriasDisponiveis(
        data.filter(c => c.active && !c.parentId && c.id !== params.id)
      )
    } catch (error) {
      console.error("Erro ao carregar categorias:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCompany?.id || !params.id) {
      toast({
        title: "Erro",
        description: "Nenhuma empresa selecionada ou categoria inválida",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      
      await financialCategoriesApi.update(params.id as string, selectedCompany.id, {
        name: formData.name,
        description: formData.description || undefined,
        color: formData.color || undefined,
        icon: formData.icon || undefined,
        parentId: formData.parentId || undefined,
        active: formData.active,
      })

      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso",
      })

      router.push("/dashboard/financeiro/categorias")
    } catch (error: any) {
      console.error("Erro ao atualizar categoria:", error)
      toast({
        title: "Erro ao atualizar categoria",
        description: error.response?.data?.message || error.message || "Ocorreu um erro ao atualizar a categoria",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (!categoria) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Categoria não encontrada</p>
        </div>
      </DashboardLayout>
    )
  }

  const categoriasFiltradas = categoriasDisponiveis.filter(
    c => c.type === categoria.type
  )

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/financeiro/categorias">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Editar Categoria</h1>
            <p className="text-muted-foreground">Atualize as informações da categoria</p>
          </div>
        </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações da Categoria</CardTitle>
            <CardDescription>Campos editáveis da categoria financeira</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informações Fixas */}
            <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
              <h3 className="font-semibold text-sm">Informações Fixas (não editáveis)</h3>
              <div className="text-sm">
                <span className="text-muted-foreground">Tipo:</span>
                <p className="font-medium">
                  {categoria.type === "RECEITA" ? "Receita" : "Despesa"}
                </p>
              </div>
            </div>

            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                placeholder="Ex: Vendas, Aluguel, Fornecedores..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva o propósito desta categoria..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            {/* Categoria Pai */}
            {categoriasFiltradas.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="parentId">Categoria Pai (opcional)</Label>
                <Select
                  value={formData.parentId}
                  onValueChange={(value) => setFormData({ ...formData, parentId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhuma (categoria principal)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhuma (categoria principal)</SelectItem>
                    {categoriasFiltradas.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Crie subcategorias vinculando a uma categoria principal
                </p>
              </div>
            )}

            {/* Cor */}
            <div className="space-y-2">
              <Label htmlFor="color">Cor</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Cor para identificação visual da categoria
              </p>
            </div>

            {/* Ícone */}
            <div className="space-y-2">
              <Label htmlFor="icon">Ícone (opcional)</Label>
              <Input
                id="icon"
                placeholder="Ex: attach_money, shopping_cart, home..."
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Nome do ícone Material Icons (opcional)
              </p>
            </div>

            {/* Categoria Ativa */}
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="active">Categoria Ativa</Label>
                <p className="text-sm text-muted-foreground">
                  Categorias inativas não aparecem nos lançamentos
                </p>
              </div>
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3">
              <Link href="/dashboard/financeiro/categorias">
                <Button type="button" variant="outline" disabled={saving}>
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={saving}>
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
          </CardContent>
        </Card>
      </form>
      </div>
    </DashboardLayout>
  )
}
