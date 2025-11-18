"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { authApi } from "@/lib/api/auth"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ConfiguracoesPage() {
  const { toast } = useToast()
  const [senhaAtual, setSenhaAtual] = useState("")
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const validateForm = (): boolean => {
    setError("")

    if (!senhaAtual.trim()) {
      setError("A senha atual é obrigatória")
      return false
    }

    if (!novaSenha.trim()) {
      setError("A nova senha é obrigatória")
      return false
    }

    if (novaSenha.length < 6) {
      setError("A nova senha deve ter no mínimo 6 caracteres")
      return false
    }

    if (novaSenha === senhaAtual) {
      setError("A nova senha deve ser diferente da senha atual")
      return false
    }

    if (novaSenha !== confirmarSenha) {
      setError("As senhas não coincidem")
      return false
    }

    return true
  }

  const handleAlterarSenha = async () => {
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setError("")
      
      await authApi.changePassword(senhaAtual, novaSenha)
      
      toast({
        title: "Senha alterada com sucesso",
        description: "Sua senha foi atualizada.",
      })

      // Limpar campos
      setSenhaAtual("")
      setNovaSenha("")
      setConfirmarSenha("")
    } catch (error: any) {
      const errorMessage = error.message || "Erro ao alterar senha"
      setError(errorMessage)
      toast({
        title: "Erro ao alterar senha",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleAlterarSenha()
    }
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Configurações</h1>
          <p className="text-muted-foreground">Altere sua senha de acesso</p>
        </div>

        {/* Card de Segurança */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>Mantenha sua conta segura alterando sua senha periodicamente</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="senha-atual">Senha Atual *</Label>
                <Input
                  id="senha-atual"
                  type="password"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua senha atual"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nova-senha">Nova Senha *</Label>
                <Input
                  id="nova-senha"
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite a nova senha"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  A senha deve ter no mínimo 6 caracteres
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmar-senha">Confirmar Nova Senha *</Label>
                <Input
                  id="confirmar-senha"
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite a nova senha novamente"
                  disabled={loading}
                />
              </div>
            </div>

            <Button onClick={handleAlterarSenha} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Alterando senha...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Alterar Senha
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Card informativo */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <Shield className="h-5 w-5 text-blue-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">Dicas de Segurança</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Use uma senha forte com letras, números e caracteres especiais</li>
                  <li>Não compartilhe sua senha com outras pessoas</li>
                  <li>Altere sua senha periodicamente</li>
                  <li>Não use a mesma senha em diferentes serviços</li>
                  <li>A senha deve ter no mínimo 6 caracteres</li>
                  <li>A nova senha deve ser diferente da senha antiga</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
