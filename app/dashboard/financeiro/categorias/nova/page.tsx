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
import { useRouter } from "next/navigation"
import { financialCategoriesApi, type CategoryType, type FinancialCategory } from "@/lib/api/financial"
import { authApi } from "@/lib/api/auth"
import { useToast } from "@/hooks/use-toast"

export default function NovaCategoria() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [categoriasDisponiveis, setCategoriasDisponiveis] = useState<FinancialCategory[]>([])
  const selectedCompany = authApi.getSelectedCompany()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "" as CategoryType | "",
    color: "#3b82f6",
    icon: "",
    parentId: null as string | null,
    active: true,
  })

  useEffect(() => {
    if (selectedCompany?.id) {
      loadCategorias()
    }
  }, [selectedCompany?.id])

  const loadCategorias = async () => {
    try {
      if (!selectedCompany?.id) return
      const data = await financialCategoriesApi.getAll(selectedCompany.id)
      setCategoriasDisponiveis(data.filter(c => c.active && !c.parentId)) // Apenas categorias principais e ativas
    } catch (error) {
      console.error("Erro ao carregar categorias:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCompany?.id) {
      toast({
        title: "Erro",
        description: "Nenhuma empresa selecionada",
        variant: "destructive",
      })
      return
    }

    if (!formData.type) {
      toast({
        title: "Erro",
        description: "Selecione o tipo de categoria",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      
      await financialCategoriesApi.create({
        companyId: selectedCompany.id,
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type as CategoryType,
        color: formData.color || undefined,
        icon: formData.icon || undefined,
        parentId: formData.parentId || undefined,
        active: formData.active,
      })

      toast({
        title: "Sucesso",
        description: "Categoria cadastrada com sucesso",
      })

      router.push("/dashboard/financeiro/categorias")
    } catch (error: any) {
      console.error("Erro ao criar categoria:", error)
      toast({
        title: "Erro ao criar categoria",
        description: error.response?.data?.message || error.message || "Ocorreu um erro ao criar a categoria",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const categoriasFiltradas = categoriasDisponiveis.filter(
    c => !formData.type || c.type === formData.type
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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Nova Categoria</h1>
            <p className="text-muted-foreground">Cadastre uma nova categoria financeira</p>
          </div>
        </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações da Categoria</CardTitle>
            <CardDescription>Preencha os dados da categoria financeira</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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

            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as CategoryType, parentId: null })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RECEITA">Receita</SelectItem>
                  <SelectItem value="DESPESA">Despesa</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Receitas são entradas de dinheiro, despesas são saídas
              </p>
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
            {formData.type && categoriasFiltradas.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="parentId">Categoria Pai (opcional)</Label>
                <Select
                  value={formData.parentId || "NONE"}
                  onValueChange={(value) => setFormData({ ...formData, parentId: value === "NONE" ? null : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhuma (categoria principal)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Nenhuma (categoria principal)</SelectItem>
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
                <Button type="button" variant="outline" disabled={loading}>
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Categoria
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
