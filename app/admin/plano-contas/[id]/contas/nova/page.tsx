"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Loader2, FileText } from "lucide-react"
import { contasContabeisApi, planoContasApi, type ContaContabil } from "@/lib/api/financial"
import { useToast } from "@/hooks/use-toast"
import { formatApiError } from "@/lib/format-error"

const tiposConta = [
  "Ativo",
  "Passivo",
  "Receita",
  "Despesa",
  "Patrimônio Líquido"
]

const naturezas = [
  "Devedora",
  "Credora"
]

export default function NovaContaContabilPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [planoContasNome, setPlanoContasNome] = useState("")
  const [contasPossiveis, setContasPossiveis] = useState<ContaContabil[]>([])
  const [formData, setFormData] = useState({
    codigo: "",
    nome: "",
    tipo: "",
    natureza: "",
    nivel: 1,
    contaPaiId: "",
    aceitaLancamento: true,
    ativo: true,
  })

  useEffect(() => {
    loadData()
  }, [params.id])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Carregar plano de contas
      const plano = await planoContasApi.getById(params.id as string)
      setPlanoContasNome(plano.nome)
      
      // Carregar contas existentes (para seleção de conta pai)
      const response = await contasContabeisApi.getAll(params.id as string, {
        limit: 1000,
      })
      setContasPossiveis(response.data)
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
    
    if (!formData.codigo || !formData.nome || !formData.tipo || !formData.natureza) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      
      const data: any = {
        codigo: formData.codigo,
        nome: formData.nome,
        tipo: formData.tipo,
        natureza: formData.natureza,
        nivel: formData.nivel,
        aceitaLancamento: formData.aceitaLancamento,
        ativo: formData.ativo,
      }
      
      if (formData.contaPaiId) {
        data.contaPaiId = formData.contaPaiId
      }
      
      await contasContabeisApi.create(params.id as string, data)
      
      toast({
        title: "Conta criada com sucesso!",
        description: "A conta contábil foi criada.",
      })
      
      // Verificar se há empresa selecionada no localStorage
      if (typeof window !== 'undefined') {
        try {
          const selectedCompany = localStorage.getItem('selectedCompany')
          if (selectedCompany) {
            const company = JSON.parse(selectedCompany)
            router.push(`/admin/empresas/${company.id}/editar?tab=plano-contas`)
            return
          }
        } catch (error) {
          console.error('Erro ao ler selectedCompany do localStorage:', error)
        }
      }

      // Fallback: validar se planoContasId é válido
      const planoContasId = params.id as string
      if (planoContasId && planoContasId.length > 20) {
        router.push(`/admin/plano-contas/${planoContasId}`)
        return
      }

      // Fallback final para listagem
      router.push('/admin/plano-contas')
    } catch (error: any) {
      console.error('❌ Erro ao criar conta:', error)
      
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
    
    // Se selecionar conta pai, calcular o nível automaticamente
    if (field === 'contaPaiId' && value) {
      const contaPai = contasPossiveis.find(c => c.id === value)
      if (contaPai) {
        setFormData(prev => ({ ...prev, nivel: contaPai.nivel + 1 }))
      }
    }
    
    // Se remover conta pai, voltar para nível 1
    if (field === 'contaPaiId' && !value) {
      setFormData(prev => ({ ...prev, nivel: 1 }))
    }
  }

  const handleCancel = () => {
    // Verificar se há empresa selecionada no localStorage
    if (typeof window !== 'undefined') {
      try {
        const selectedCompany = localStorage.getItem('selectedCompany')
        if (selectedCompany) {
          const company = JSON.parse(selectedCompany)
          router.push(`/admin/empresas/${company.id}/editar?tab=plano-contas`)
          return
        }
      } catch (error) {
        console.error('Erro ao ler selectedCompany do localStorage:', error)
      }
    }

    // Fallback: validar se planoContasId é válido
    const planoContasId = params.id as string
    if (planoContasId && planoContasId.length > 20) {
      router.push(`/admin/plano-contas/${planoContasId}`)
      return
    }

    // Fallback final para listagem
    router.push('/admin/plano-contas')
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
                <FileText className="h-8 w-8" />
                Nova Conta Contábil
              </h1>
              <p className="text-muted-foreground">{planoContasNome}</p>
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
                Salvar Conta
              </>
            )}
          </Button>
        </div>

        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
            <CardDescription>
              Preencha os dados da nova conta contábil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código *</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => handleInputChange('codigo', e.target.value)}
                  placeholder="Ex: 1.1.01.001"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Código único da conta no plano
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  placeholder="Ex: Caixa Geral"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select
                  value={formData.tipo || undefined}
                  onValueChange={(value) => handleInputChange('tipo', value)}
                >
                  <SelectTrigger id="tipo">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposConta.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="natureza">Natureza *</Label>
                <Select
                  value={formData.natureza || undefined}
                  onValueChange={(value) => handleInputChange('natureza', value)}
                >
                  <SelectTrigger id="natureza">
                    <SelectValue placeholder="Selecione a natureza" />
                  </SelectTrigger>
                  <SelectContent>
                    {naturezas.map((natureza) => (
                      <SelectItem key={natureza} value={natureza}>
                        {natureza}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contaPai">Conta Pai (opcional)</Label>
                <Select
                  value={formData.contaPaiId || undefined}
                  onValueChange={(value) => handleInputChange('contaPaiId', value)}
                >
                  <SelectTrigger id="contaPai">
                    <SelectValue placeholder="Nenhuma (conta raiz)" />
                  </SelectTrigger>
                  <SelectContent>
                    {contasPossiveis.map((conta) => (
                      <SelectItem key={conta.id} value={conta.id}>
                        {conta.codigo} - {conta.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Deixe vazio para criar uma conta raiz (nível 1)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nivel">Nível</Label>
                <Input
                  id="nivel"
                  type="number"
                  value={formData.nivel}
                  onChange={(e) => handleInputChange('nivel', parseInt(e.target.value))}
                  min={1}
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  Calculado automaticamente baseado na conta pai
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="aceitaLancamento">Aceita Lançamento</Label>
                <p className="text-xs text-muted-foreground">
                  Se esta conta pode receber lançamentos diretos
                </p>
              </div>
              <Switch
                id="aceitaLancamento"
                checked={formData.aceitaLancamento}
                onCheckedChange={(checked) => handleInputChange('aceitaLancamento', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="ativo">Conta Ativa</Label>
                <p className="text-xs text-muted-foreground">
                  Se esta conta está disponível para uso
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
                    Salvar Conta
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
