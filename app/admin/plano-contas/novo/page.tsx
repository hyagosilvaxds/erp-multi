"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Loader2, FileText } from "lucide-react"
import { planoContasApi, type CreatePlanoContasDto } from "@/lib/api/financial"
import { useToast } from "@/hooks/use-toast"
import { formatApiError } from "@/lib/format-error"

export default function NovoPlanoContasPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<CreatePlanoContasDto>({
    nome: "",
    descricao: "",
    tipo: "Gerencial",
    ativo: true,
    padrao: false,
  })

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

      const result = await planoContasApi.create({
        nome: formData.nome,
        descricao: formData.descricao || undefined,
        tipo: formData.tipo,
        ativo: formData.ativo,
        padrao: formData.padrao,
      })

      toast({
        title: "Plano de contas criado!",
        description: "O plano de contas foi criado com sucesso.",
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

      // Fallback para listagem de planos
      router.push('/admin/plano-contas')
    } catch (error: any) {
      console.error('❌ Erro ao criar plano de contas:', error)

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

  const handleInputChange = (field: keyof CreatePlanoContasDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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

    // Fallback para listagem de planos
    router.push('/admin/plano-contas')
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
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <FileText className="h-8 w-8" />
                Novo Plano de Contas
              </h1>
              <p className="text-muted-foreground">
                Crie um novo plano de contas contábil
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
                Salvar Plano
              </>
            )}
          </Button>
        </div>

        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Plano</CardTitle>
            <CardDescription>
              Preencha as informações básicas do plano de contas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="nome">
                Nome <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Ex: Plano de Contas Comercial"
                required
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                placeholder="Descrição detalhada do plano de contas..."
                rows={3}
              />
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => handleInputChange('tipo', value as any)}
              >
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gerencial">Gerencial</SelectItem>
                  <SelectItem value="Fiscal">Fiscal</SelectItem>
                  <SelectItem value="Contabil">Contábil</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Define a finalidade do plano de contas
              </p>
            </div>

            {/* Ativo */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="ativo">Ativo</Label>
                <p className="text-xs text-muted-foreground">
                  O plano de contas estará disponível para uso
                </p>
              </div>
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => handleInputChange('ativo', checked)}
              />
            </div>

            {/* Padrão */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="padrao">Plano Padrão</Label>
                <p className="text-xs text-muted-foreground">
                  Este plano será usado como padrão para novas empresas
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
                    Salvar Plano
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
