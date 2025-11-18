"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Copy, Loader2 } from "lucide-react"
import { planoContasApi } from "@/lib/api/financial"
import { useToast } from "@/hooks/use-toast"
import { formatApiError } from "@/lib/format-error"

export default function DuplicarPlanoContasPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [duplicating, setDuplicating] = useState(false)
  const [originalName, setOriginalName] = useState("")
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
  })

  useEffect(() => {
    loadPlanoContas()
  }, [params.id])

  const loadPlanoContas = async () => {
    try {
      setLoading(true)
      const data = await planoContasApi.getById(params.id as string)
      setOriginalName(data.nome)
      setFormData({
        nome: `${data.nome} - Cópia`,
        descricao: data.descricao ? `Cópia de: ${data.descricao}` : "",
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
        description: "O nome do novo plano de contas é obrigatório.",
        variant: "destructive",
      })
      return
    }

    try {
      setDuplicating(true)

      const novoPlano = await planoContasApi.duplicar(params.id as string, {
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim() || undefined,
      })

      toast({
        title: "Plano de contas duplicado!",
        description: "O plano foi copiado com todas as suas contas.",
      })

      router.push(`/dashboard/plano-contas/${novoPlano.id}`)
    } catch (error: any) {
      console.error('❌ Erro ao duplicar plano de contas:', error)

      const { title, description } = formatApiError(error)

      toast({
        title,
        description,
        variant: "destructive",
      })
    } finally {
      setDuplicating(false)
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
              <h1 className="text-3xl font-bold tracking-tight">Duplicar Plano de Contas</h1>
              <p className="text-muted-foreground">
                Criar cópia de: {originalName}
              </p>
            </div>
          </div>
          <Button type="submit" disabled={duplicating}>
            {duplicating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Duplicando...
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Duplicar Plano
              </>
            )}
          </Button>
        </div>

        {/* Informações */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-900">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Copy className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Esta ação irá criar uma cópia completa do plano de contas
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Todas as contas contábeis e sua hierarquia serão copiadas para o novo plano.
                  A numeração e estrutura serão mantidas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Novo Plano</CardTitle>
            <CardDescription>
              Defina o nome e descrição para a cópia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Novo Plano *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Ex: Plano de Contas Comercial - Cópia"
                required
              />
              <p className="text-xs text-muted-foreground">
                Escolha um nome diferente do original para identificar a cópia
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                placeholder="Descrição do novo plano de contas"
                rows={3}
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
                disabled={duplicating}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={duplicating}>
                {duplicating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Duplicando...
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicar Plano
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
