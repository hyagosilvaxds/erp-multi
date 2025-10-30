"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  FileText,
  Edit,
  Copy,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronRight,
  Plus,
  Check,
  X,
} from "lucide-react"
import { planoContasApi, type ContaContabil } from "@/lib/api/financial"
import { useToast } from "@/hooks/use-toast"
import { formatApiError } from "@/lib/format-error"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function PlanoContasDetalhesPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [planoContas, setPlanoContas] = useState<any>(null)
  const [contas, setContas] = useState<ContaContabil[]>([])
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    loadPlanoContas()
  }, [params.id])

  const loadPlanoContas = async () => {
    try {
      setLoading(true)
      const data = await planoContasApi.getHierarquia(params.id as string)
      setPlanoContas(data.planoContas)
      setContas(data.contas)
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

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedIds(newExpanded)
  }

  const expandAll = () => {
    const allIds = new Set<string>()
    const collectIds = (contas: ContaContabil[]) => {
      contas.forEach((conta) => {
        if (conta.subContas && conta.subContas.length > 0) {
          allIds.add(conta.id)
          collectIds(conta.subContas)
        }
      })
    }
    collectIds(contas)
    setExpandedIds(allIds)
  }

  const collapseAll = () => {
    setExpandedIds(new Set())
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await planoContasApi.delete(params.id as string)

      toast({
        title: "Plano de contas excluído com sucesso!",
        description: "O plano de contas foi removido do sistema.",
      })

      router.push('/dashboard/plano-contas')
    } catch (error: any) {
      console.error('❌ Erro ao excluir plano de contas:', error)

      const { title, description } = formatApiError(error)

      toast({
        title,
        description,
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const renderConta = (conta: ContaContabil, depth: number = 0) => {
    const hasSubContas = conta.subContas && conta.subContas.length > 0
    const isExpanded = expandedIds.has(conta.id)
    const paddingLeft = depth * 24

    return (
      <div key={conta.id}>
        <div
          className="flex items-center gap-2 py-2 px-3 hover:bg-muted/50 rounded-md cursor-pointer group"
          style={{ paddingLeft: `${paddingLeft + 12}px` }}
          onClick={() => hasSubContas && toggleExpand(conta.id)}
        >
          <div className="flex items-center gap-2 flex-1">
            {hasSubContas ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )
            ) : (
              <div className="w-4" />
            )}
            <code className="text-sm font-mono text-muted-foreground">{conta.codigo}</code>
            <span className="font-medium">{conta.nome}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Nível {conta.nivel}
            </Badge>
            <Badge variant={conta.natureza === "Devedora" ? "default" : "secondary"} className="text-xs">
              {conta.natureza}
            </Badge>
            {conta.aceitaLancamento && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Check className="h-3 w-3" />
                Lançamento
              </Badge>
            )}
            {!conta.ativo && (
              <Badge variant="destructive" className="text-xs flex items-center gap-1">
                <X className="h-3 w-3" />
                Inativo
              </Badge>
            )}
          </div>
        </div>
        {hasSubContas && isExpanded && (
          <div>
            {conta.subContas!.map((subConta) => renderConta(subConta, depth + 1))}
          </div>
        )}
      </div>
    )
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

  if (!planoContas) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Plano de contas não encontrado</h3>
          <Button onClick={() => router.push('/dashboard/plano-contas')}>
            Voltar para lista
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard/plano-contas')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <FileText className="h-8 w-8" />
                {planoContas.nome}
              </h1>
              <p className="text-muted-foreground">
                Visualize a hierarquia completa de contas contábeis
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/plano-contas/${params.id}/editar`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/plano-contas/${params.id}/duplicar`)}
            >
              <Copy className="mr-2 h-4 w-4" />
              Duplicar
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </div>
        </div>

        {/* Informações do Plano */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Plano</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                <p className="text-base">{planoContas.tipo}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Contas</p>
                <p className="text-base">{contas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hierarquia de Contas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Hierarquia de Contas</CardTitle>
                <CardDescription>
                  Estrutura completa de contas contábeis até 5 níveis
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={expandAll}>
                  Expandir Tudo
                </Button>
                <Button variant="outline" size="sm" onClick={collapseAll}>
                  Recolher Tudo
                </Button>
                <Button size="sm" onClick={() => router.push(`/dashboard/plano-contas/${params.id}/contas/nova`)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Conta
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {contas.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma conta cadastrada</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Comece criando a primeira conta deste plano
                </p>
                <Button onClick={() => router.push(`/dashboard/plano-contas/${params.id}/contas/nova`)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeira Conta
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                {contas.map((conta) => renderConta(conta))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o plano de contas "{planoContas.nome}"?
                Esta ação não pode ser desfeita e só é possível se não houver contas cadastradas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  "Excluir"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  )
}
