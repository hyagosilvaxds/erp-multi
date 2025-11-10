"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Loader2, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"
import { financialCategoriesApi, type FinancialCategory, type CategoryType } from "@/lib/api/financial"
import { authApi } from "@/lib/api/auth"
import { useToast } from "@/hooks/use-toast"

export default function Categorias() {
  const [categorias, setCategorias] = useState<FinancialCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<CategoryType | "TODAS">("TODAS")
  const { toast } = useToast()
  const selectedCompany = authApi.getSelectedCompany()

  useEffect(() => {
    if (selectedCompany?.id) {
      loadCategorias()
    }
  }, [selectedCompany?.id])

  const loadCategorias = async () => {
    try {
      setLoading(true)
      if (!selectedCompany?.id) {
        toast({
          title: "Erro",
          description: "Nenhuma empresa selecionada",
          variant: "destructive",
        })
        return
      }
      const data = await financialCategoriesApi.getAll(selectedCompany.id)
      setCategorias(data)
    } catch (error: any) {
      console.error("Erro ao carregar categorias:", error)
      toast({
        title: "Erro ao carregar categorias",
        description: error.response?.data?.message || error.message || "Ocorreu um erro ao carregar as categorias",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) {
      return
    }

    try {
      if (!selectedCompany?.id) {
        toast({
          title: "Erro",
          description: "Nenhuma empresa selecionada",
          variant: "destructive",
        })
        return
      }

      await financialCategoriesApi.delete(id, selectedCompany.id)
      
      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso",
      })
      
      loadCategorias()
    } catch (error: any) {
      console.error("Erro ao excluir categoria:", error)
      toast({
        title: "Erro ao excluir categoria",
        description: error.response?.data?.message || error.message || "Ocorreu um erro ao excluir a categoria",
        variant: "destructive",
      })
    }
  }

  const filteredCategorias = activeTab === "TODAS" 
    ? categorias 
    : categorias.filter(c => c.type === activeTab)

  const categoriasReceita = categorias.filter(c => c.type === "RECEITA" && c.active)
  const categoriasDespesa = categorias.filter(c => c.type === "DESPESA" && c.active)

  if (loading) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Categorias Financeiras</h1>
            <p className="text-muted-foreground">Gerencie as categorias de receitas e despesas</p>
          </div>
          <Link href="/dashboard/financeiro/categorias/nova">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Categoria
            </Button>
          </Link>
        </div>

        {/* Cards de Resumo */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Categorias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{categorias.length}</div>
              <p className="text-xs text-muted-foreground">
                {categorias.filter(c => c.active).length} ativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorias de Receita</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{categoriasReceita.length}</div>
              <p className="text-xs text-muted-foreground">Entradas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorias de Despesa</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{categoriasDespesa.length}</div>
              <p className="text-xs text-muted-foreground">Saídas</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs e Lista de Categorias */}
        <Card>
          <CardHeader>
            <CardTitle>Todas as Categorias</CardTitle>
            <CardDescription>Lista completa de categorias cadastradas</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CategoryType | "TODAS")}>
              <TabsList className="mb-4">
                <TabsTrigger value="TODAS">Todas</TabsTrigger>
                <TabsTrigger value="RECEITA">Receitas</TabsTrigger>
                <TabsTrigger value="DESPESA">Despesas</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-3">
                {filteredCategorias.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhuma categoria cadastrada</p>
                    <Link href="/dashboard/financeiro/categorias/nova">
                      <Button className="mt-4">
                        <Plus className="mr-2 h-4 w-4" />
                        Cadastrar primeira categoria
                      </Button>
                    </Link>
                  </div>
                ) : (
                  filteredCategorias.map((categoria) => (
                    <div
                      key={categoria.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-accent/50"
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="flex h-12 w-12 items-center justify-center rounded-lg"
                          style={{ 
                            backgroundColor: categoria.color ? `${categoria.color}20` : undefined 
                          }}
                        >
                          {categoria.type === "RECEITA" ? (
                            <TrendingUp className="h-6 w-6" style={{ color: categoria.color || undefined }} />
                          ) : (
                            <TrendingDown className="h-6 w-6" style={{ color: categoria.color || undefined }} />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">{categoria.name}</p>
                            <Badge 
                              variant={categoria.type === "RECEITA" ? "default" : "destructive"} 
                              className="text-xs"
                            >
                              {categoria.type === "RECEITA" ? "Receita" : "Despesa"}
                            </Badge>
                            <Badge variant={categoria.active ? "default" : "secondary"} className="text-xs">
                              {categoria.active ? "Ativa" : "Inativa"}
                            </Badge>
                          </div>
                          {categoria.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {categoria.description}
                            </p>
                          )}
                          {categoria.parent && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Subcategoria de: {categoria.parent.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/dashboard/financeiro/categorias/${categoria.id}`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(categoria.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
