"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Building2, ChevronRight, Search, Users, Shield, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { authApi, type Company } from "@/lib/api/auth"
import { useToast } from "@/hooks/use-toast"

export default function SelectCompanyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [companies, setCompanies] = useState<Company[]>([])
  const [userName, setUserName] = useState("")
  const [hasAdminRole, setHasAdminRole] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar autenticação
    if (!authApi.isAuthenticated()) {
      router.push("/login")
      return
    }

    // Função para carregar empresas
    const loadCompanies = async () => {
      try {
        // Buscar empresas da API
        const userCompanies = await authApi.getUserCompanies()

        if (!userCompanies || userCompanies.length === 0) {
          toast({
            title: "Erro",
            description: "Você não está associado a nenhuma empresa",
            variant: "destructive",
          })
          authApi.logout()
          return
        }

        // Obter nome do usuário
        const user = authApi.getUser()
        if (user) {
          setUserName(user.name)
        }

        setCompanies(userCompanies)

        // Verificar se tem role admin em alguma empresa
        const isAdmin = userCompanies.some((company) => company.role.name === "admin")
        setHasAdminRole(isAdmin)

        setLoading(false)
      } catch (error: any) {
        toast({
          title: "Erro ao carregar empresas",
          description: error.message || "Não foi possível carregar suas empresas",
          variant: "destructive",
        })
        setLoading(false)
        // Aguardar um pouco antes de redirecionar para o usuário ver o erro
        setTimeout(() => {
          authApi.logout()
        }, 2000)
      }
    }

    loadCompanies()
  }, [router, toast])

  const filteredCompanies = companies.filter(
    (company) =>
      company.nomeFantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.cnpj.includes(searchTerm)
  )

  const handleSelectCompany = (company: Company) => {
    // Salvar empresa selecionada
    authApi.setSelectedCompany(company)

    toast({
      title: "Empresa selecionada!",
      description: `Acessando ${company.nomeFantasia}...`,
    })

    // Sempre redirecionar para /dashboard independente da role
    router.push("/dashboard")
  }

  const handleAdminAccess = () => {
    // Buscar a primeira empresa onde o usuário é admin
    const adminCompany = companies.find((company) => company.role.name === "admin")

    if (adminCompany) {
      authApi.setSelectedCompany(adminCompany)
      router.push("/admin")
    }
  }

  const handleLogout = () => {
    authApi.logout()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Carregando empresas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Olá, {userName}!</h1>
          <p className="mt-2 text-muted-foreground">
            Selecione uma das {companies.length} {companies.length === 1 ? "empresa" : "empresas"} disponíveis
          </p>
        </div>

        {/* Search */}
        {companies.length > 3 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome ou CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 pl-10 text-base"
            />
          </div>
        )}

        {/* Companies List */}
        <div className="space-y-3">
          {filteredCompanies.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Nenhuma empresa encontrada</p>
            </Card>
          ) : (
            filteredCompanies.map((company) => (
              <Card
                key={company.id}
                className="group cursor-pointer transition-all hover:border-primary hover:shadow-lg"
                onClick={() => handleSelectCompany(company)}
              >
                <div className="flex items-center gap-4 p-6">
                  {/* Logo */}
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {company.logoUrl ? (
                      <img
                        src={company.logoUrl}
                        alt={company.nomeFantasia}
                        className="h-full w-full rounded-xl object-cover"
                      />
                    ) : (
                      <Building2 className="h-7 w-7" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-foreground">{company.nomeFantasia}</h3>
                      {company.role.name === "admin" && (
                        <Badge variant="default" className="text-xs">
                          Admin
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">CNPJ: {company.cnpj}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Seu cargo:{" "}
                        <span className="font-medium text-foreground">{company.role.description || company.role.name}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {company.role.permissions.length} {company.role.permissions.length === 1 ? "permissão" : "permissões"}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 pt-4">
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>

          {/* Botão Admin - apenas se tiver role admin em alguma empresa */}
          {hasAdminRole && (
            <Button variant="default" onClick={handleAdminAccess} className="gap-2">
              <Shield className="h-4 w-4" />
              Acessar como Administrador
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

