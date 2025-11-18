"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { planoContasApi } from "@/lib/api/financial"
import { useToast } from "@/hooks/use-toast"
import { formatApiError } from "@/lib/format-error"

const tiposPlano = ["Gerencial", "Fiscal", "Contabil"]

export default function EditarPlanoContasPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    tipo: "Gerencial",
    ativo: true,
    padrao: false,
  })

  useEffect(() => {
    loadPlanoContas()
  }, [params.id])

  const loadPlanoContas = async () => {
    try {
      setLoading(true)
      const data = await planoContasApi.getById(params.id as string)
      setFormData({
        nome: data.nome,
        descricao: data.descricao || "",
        tipo: data.tipo,
        ativo: data.ativo,
        padrao: data.padrao,
      })
    } catch (error: any) {
      console.error('❌ Erro ao carregar plano de contas:', error)

      const { title, description } = formatApiError(error)

      toast({
        title,
        description,
        variant: "destructive",
      })
      router.push('/dashboard/plano-contas')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome.trim()) {
      toast({
        title: "Erro de validação",
        description: "O nome do plano de contas é obrigatório.",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)

      await planoContasApi.update(params.id as string, {
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim() || undefined,
        tipo: formData.tipo,
        ativo: formData.ativo,
        padrao: formData.padrao,
      })

      toast({
        title: "Plano de contas atualizado!",
        description: "As alterações foram salvas com sucesso.",
      })

      router.push(`/dashboard/plano-contas/${params.id}`)
    } catch (error: any) {
      console.error('❌ Erro ao atualizar plano de contas:', error)

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
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/dashboard/plano-contas/${params.id}`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Editar Plano de Contas</h1>
              <p className="text-muted-foreground">Atualize as informações do plano</p>
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
            <CardTitle>Informações do Plano</CardTitle>
            <CardDescription>Atualize os dados do plano de contas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Plano *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Ex: Plano de Contas Comercial"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                placeholder="Descrição detalhada do plano de contas"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo do Plano *</Label>
              <Select value={formData.tipo} onValueChange={(value) => handleInputChange('tipo', value)}>
                <SelectTrigger id="tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tiposPlano.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Gerencial: para controle interno | Fiscal: para obrigações fiscais | Contábil: padrão contábil
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="ativo">Plano Ativo</Label>
                <p className="text-sm text-muted-foreground">
                  Desative para ocultar este plano das listagens
                </p>
              </div>
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => handleInputChange('ativo', checked)}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="padrao">Plano Padrão</Label>
                <p className="text-sm text-muted-foreground">
                  Define como plano padrão do sistema (apenas um pode ser padrão)
                </p>
              </div>
              <Switch
                id="padrao"
                checked={formData.padrao}
                onCheckedChange={(checked) => handleInputChange('padrao', checked)}
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
                onClick={() => router.push(`/dashboard/plano-contas/${params.id}`)}
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
