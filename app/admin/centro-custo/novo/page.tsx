"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Loader2, Building2 } from "lucide-react"
import { centroCustoApi, type CreateCentroCustoDto, type CentroCusto } from "@/lib/api/financial"
import { companiesApi } from "@/lib/api/auth"
import { useToast } from "@/hooks/use-toast"
import { formatApiError } from "@/lib/format-error"

export default function NovoCentroCustoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [companyName, setCompanyName] = useState("")
  const [centrosPossiveis, setCentrosPossiveis] = useState<CentroCusto[]>([])
  const [formData, setFormData] = useState<CreateCentroCustoDto>({
    companyId: "",
    codigo: "",
    nome: "",
    descricao: "",
    centroCustoPaiId: undefined,
    nivel: 1,
    responsavel: "",
    email: "",
    ativo: true,
  })

  useEffect(() => {
    const companyId = searchParams.get('companyId')
    if (companyId) {
      setFormData(prev => ({ ...prev, companyId }))
      loadData(companyId)
    } else {
      toast({
        title: "Erro",
        description: "ID da empresa não foi fornecido.",
        variant: "destructive",
      })
      router.push('/admin/empresas')
    }
  }, [searchParams])

  const loadData = async (companyId: string) => {
    try {
      setLoading(true)
      
      // Carregar dados da empresa
      const company = await companiesApi.getCompanyById(companyId)
      setCompanyName(company.razaoSocial)
      
      // Carregar centros de custo existentes (para seleção de pai)
      const centros = await centroCustoApi.getByCompany(companyId)
      setCentrosPossiveis(centros.filter(c => c.ativo))
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
    
    if (!formData.companyId || !formData.codigo || !formData.nome) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      
      const data: CreateCentroCustoDto = {
        companyId: formData.companyId,
        codigo: formData.codigo,
        nome: formData.nome,
        nivel: formData.nivel,
        ativo: formData.ativo,
      }
      
      if (formData.descricao) {
        data.descricao = formData.descricao
      }
      
      if (formData.centroCustoPaiId) {
        data.centroCustoPaiId = formData.centroCustoPaiId
      }
      
      if (formData.responsavel) {
        data.responsavel = formData.responsavel
      }
      
      if (formData.email) {
        data.email = formData.email
      }
      
      await centroCustoApi.create(data)
      
      toast({
        title: "Centro de custo criado!",
        description: "O centro de custo foi criado com sucesso.",
      })
      
      // Redirecionar para página de edição da empresa com tab ativa
      router.push(`/admin/empresas/${formData.companyId}/editar?tab=centros-custo`)
    } catch (error: any) {
      console.error('❌ Erro ao criar centro de custo:', error)
      
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

  const handleInputChange = (field: keyof CreateCentroCustoDto, value: any) => {
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
    if (formData.companyId) {
      router.push(`/admin/empresas/${formData.companyId}/editar?tab=centros-custo`)
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
                Novo Centro de Custo
              </h1>
              <p className="text-muted-foreground">{companyName}</p>
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
                Salvar Centro
              </>
            )}
          </Button>
        </div>

        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Centro de Custo</CardTitle>
            <CardDescription>
              Preencha os dados do novo centro de custo
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

            {/* Centro Pai e Nível */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="centroCustoPaiId">Centro de Custo Pai</Label>
                <Select
                  value={formData.centroCustoPaiId || undefined}
                  onValueChange={(value) => handleInputChange('centroCustoPaiId', value)}
                >
                  <SelectTrigger id="centroCustoPaiId">
                    <SelectValue placeholder="Selecione (opcional)..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum (Nível 1)</SelectItem>
                    {centrosPossiveis.map(centro => (
                      <SelectItem key={centro.id} value={centro.id}>
                        {centro.codigo} - {centro.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Deixe vazio para criar um centro de nível 1
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
                <p className="text-xs text-muted-foreground">
                  Calculado automaticamente
                </p>
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
                    Salvar Centro
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
