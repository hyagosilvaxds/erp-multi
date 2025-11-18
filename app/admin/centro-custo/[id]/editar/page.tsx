"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Loader2, Building2 } from "lucide-react"
import { centroCustoApi, type UpdateCentroCustoDto, type CentroCusto } from "@/lib/api/financial"
import { useToast } from "@/hooks/use-toast"
import { formatApiError } from "@/lib/format-error"

export default function EditarCentroCustoPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [centro, setCentro] = useState<CentroCusto | null>(null)
  const [centrosPossiveis, setCentrosPossiveis] = useState<CentroCusto[]>([])
  const [formData, setFormData] = useState({
    codigo: "",
    nome: "",
    descricao: "",
    centroCustoPaiId: "",
    nivel: 1,
    responsavel: "",
    email: "",
    ativo: true,
  })

  useEffect(() => {
    loadData()
  }, [params.id])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Carregar centro de custo
      const centroData = await centroCustoApi.getById(params.id as string)
      console.log("Centro carregado:", centroData)
      setCentro(centroData)
      
      // Preencher formulário
      setFormData({
        codigo: centroData.codigo,
        nome: centroData.nome,
        descricao: centroData.descricao || "",
        centroCustoPaiId: centroData.centroCustoPaiId || "",
        nivel: centroData.nivel,
        responsavel: centroData.responsavel || "",
        email: centroData.email || "",
        ativo: centroData.ativo,
      })
      
      // Carregar centros possíveis para seleção de pai (da mesma empresa)
      if (centroData.companyId) {
        const centros = await centroCustoApi.getByCompany(centroData.companyId)
        // Filtrar o próprio centro e seus descendentes
        setCentrosPossiveis(centros.filter(c => 
          c.id !== centroData.id && 
          c.ativo &&
          !c.centroCustoPaiId?.includes(centroData.id) // Evitar dependência circular
        ))
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar dados:', error)
      
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.codigo || !formData.nome) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      
      const data: UpdateCentroCustoDto = {
        codigo: formData.codigo,
        nome: formData.nome,
        ativo: formData.ativo,
      }
      
      if (formData.descricao) {
        data.descricao = formData.descricao
      }
      
      if (formData.responsavel) {
        data.responsavel = formData.responsavel
      }
      
      if (formData.email) {
        data.email = formData.email
      }
      
      await centroCustoApi.update(params.id as string, data)
      
      toast({
        title: "Centro de custo atualizado!",
        description: "As alterações foram salvas com sucesso.",
      })
      
      // Verificar se há empresa no localStorage
      if (typeof window !== 'undefined') {
        try {
          const selectedCompany = localStorage.getItem('selectedCompany')
          if (selectedCompany) {
            const company = JSON.parse(selectedCompany)
            router.push(`/admin/empresas/${company.id}/editar?tab=centros-custo`)
            return
          }
        } catch (error) {
          console.error('Erro ao ler selectedCompany do localStorage:', error)
        }
      }
      
      // Fallback: voltar para empresa do centro
      if (centro?.companyId) {
        router.push(`/admin/empresas/${centro.companyId}/editar?tab=centros-custo`)
      } else {
        router.push('/admin/empresas')
      }
    } catch (error: any) {
      console.error('❌ Erro ao atualizar centro de custo:', error)
      
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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Se selecionar centro pai, calcular o nível automaticamente
    if (field === 'centroCustoPaiId' && value) {
      const centroPai = centrosPossiveis.find(c => c.id === value)
      if (centroPai) {
        setFormData(prev => ({ ...prev, nivel: centroPai.nivel + 1 }))
      }
    }
    
    // Se remover centro pai, voltar para nível 1
    if (field === 'centroCustoPaiId' && !value) {
      setFormData(prev => ({ ...prev, nivel: 1 }))
    }
  }

  const handleCancel = () => {
    // Verificar se há empresa no localStorage
    if (typeof window !== 'undefined') {
      try {
        const selectedCompany = localStorage.getItem('selectedCompany')
        if (selectedCompany) {
          const company = JSON.parse(selectedCompany)
          router.push(`/admin/empresas/${company.id}/editar?tab=centros-custo`)
          return
        }
      } catch (error) {
        console.error('Erro ao ler selectedCompany do localStorage:', error)
      }
    }
    
    // Fallback: voltar para empresa do centro
    if (centro?.companyId) {
      router.push(`/admin/empresas/${centro.companyId}/editar?tab=centros-custo`)
    } else {
      router.push('/admin/empresas')
    }
  }

  if (loading) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  if (!centro) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Centro de custo não encontrado</h2>
            <Button
              onClick={() => router.push('/admin/empresas')}
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
              onClick={handleCancel}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Building2 className="h-8 w-8" />
                Editar Centro de Custo
              </h1>
              <p className="text-muted-foreground">
                {centro.company?.razaoSocial || centro.company?.nomeFantasia}
              </p>
            </div>
          </div>
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

        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Centro de Custo</CardTitle>
            <CardDescription>
              Atualize os dados do centro de custo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Código e Nome */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código *</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => handleInputChange('codigo', e.target.value)}
                  placeholder="Ex: 01, 01.01, 01.01.001"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Use formato hierárquico (ex: 01, 01.01, 01.01.001)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  placeholder="Nome do centro de custo"
                  required
                />
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                placeholder="Descrição detalhada do centro de custo"
                rows={3}
              />
            </div>

            {/* Centro Pai (somente leitura) e Nível */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="centroCustoPai">Centro de Custo Pai</Label>
                <Input
                  id="centroCustoPai"
                  value={centro.centroCustoPai ? `${centro.centroCustoPai.codigo} - ${centro.centroCustoPai.nome}` : "Nenhum (Nível 1)"}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Não é possível alterar a hierarquia após criação
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nivel">Nível na Hierarquia</Label>
                <Input
                  id="nivel"
                  type="number"
                  value={formData.nivel}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            {/* Responsável e Email */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="responsavel">Responsável</Label>
                <Input
                  id="responsavel"
                  value={formData.responsavel}
                  onChange={(e) => handleInputChange('responsavel', e.target.value)}
                  placeholder="Nome do responsável"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@empresa.com"
                />
              </div>
            </div>

            {/* Ativo */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="ativo">Centro de Custo Ativo</Label>
                <p className="text-xs text-muted-foreground">
                  Centros inativos não aparecem em lançamentos
                </p>
              </div>
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => handleInputChange('ativo', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancelar
              </Button>
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
    </DashboardLayout>
  )
}
