"use client"

import { useEffect, useState, useCallback } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreVertical, Building2, LogIn, Loader2, X, History } from "lucide-react"
import Link from "next/link"
import { companiesApi, type CompanyAdmin, authApi } from "@/lib/api/auth"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { formatApiError } from "@/lib/format-error"

export default function EmpresasPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [companies, setCompanies] = useState<CompanyAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [searching, setSearching] = useState(false)

  // Debounce do termo de busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 500) // Aguarda 500ms após parar de digitar

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Carregar empresas quando o termo de busca muda
  useEffect(() => {
    loadCompanies(debouncedSearch)
  }, [debouncedSearch])

  const loadCompanies = async (search?: string) => {
    try {
      setSearching(true)
      const response = await companiesApi.getAllCompanies({
        search: search || undefined,
        // page: 1, // Implementar paginação depois se necessário
        // limit: 100, // Limite alto para pegar todas
      })
      
      console.log('📦 Response da API:', response)
      
      // Garantir que sempre temos um array
      const data = Array.isArray(response) ? response : (response as any)?.data || []
      setCompanies(data)
      
      if (search) {
        console.log(`🔍 Busca API: "${search}" | Encontradas: ${data.length}`)
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar empresas:', error)
      
      const { title, description } = formatApiError(error)
      
      toast({
        title,
        description,
        variant: "destructive",
      })
      setCompanies([]) // Garantir array vazio em caso de erro
    } finally {
      setLoading(false)
      setSearching(false)
    }
  }

  const handleLoginAsCompany = (company: CompanyAdmin) => {
    // Converter CompanyAdmin para Company format
    const userCompanies = authApi.getCompanies()
    const matchingCompany = userCompanies?.find((c) => c.id === company.id)

    if (matchingCompany) {
      authApi.setSelectedCompany(matchingCompany)
      router.push("/admin")
    } else {
      toast({
        title: "Erro",
        description: "Você não tem acesso a esta empresa",
        variant: "destructive",
      })
    }
  }

  const handleRefresh = () => {
    loadCompanies(debouncedSearch)
  }

  const handleClearSearch = () => {
    setSearchTerm("")
    // debouncedSearch será atualizado automaticamente
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Empresas</h1>
            <p className="text-muted-foreground">Gerencie todas as empresas cadastradas</p>
          </div>
          <Link href="/admin/empresas/nova">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Empresa
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar Empresas</CardTitle>
            <CardDescription>
              {loading ? (
                "Carregando empresas..."
              ) : searchTerm ? (
                <>
                  <span className="font-semibold text-foreground">
                    {companies.length}
                  </span>{" "}
                  {companies.length === 1 ? "empresa encontrada" : "empresas encontradas"} para "{searchTerm}"
                </>
              ) : (
                `Pesquise entre ${companies.length} ${companies.length === 1 ? "empresa" : "empresas"} cadastradas`
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, razão social, CNPJ, cidade ou estado..."
                  className="pl-10 pr-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={loading}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    title="Limpar busca"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button variant="outline" onClick={() => handleRefresh()} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Atualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Companies Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Empresas</CardTitle>
            <CardDescription>
              {loading
                ? "Carregando..."
                : `Total de ${companies.length} ${companies.length === 1 ? "empresa encontrada" : "empresas encontradas"}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !Array.isArray(companies) || companies.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
                  <Search className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? "Nenhuma empresa encontrada" : "Nenhuma empresa cadastrada"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm 
                    ? `Não encontramos empresas com o termo "${searchTerm}"`
                    : "Comece cadastrando uma nova empresa"}
                </p>
                {searchTerm && (
                  <Button variant="outline" onClick={() => handleClearSearch()}>
                    Limpar busca
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Regime Tributário</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Usuários</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company: CompanyAdmin) => (
                    <TableRow key={company.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            {company.logoUrl ? (
                              <img
                                src={company.logoUrl}
                                alt={company.nomeFantasia}
                                className="h-full w-full rounded-lg object-cover"
                              />
                            ) : (
                              <Building2 className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {company.nomeFantasia}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {company.razaoSocial}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {company.cnpj}
                      </TableCell>
                      <TableCell>
                        {company.regimeTributario ? (
                          <Badge variant="outline">{company.regimeTributario}</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {company.cidade && company.estado ? (
                          <span className="text-sm">
                            {company.cidade}/{company.estado}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{company._count.users}</TableCell>
                      <TableCell>
                        <Badge variant={company.active ? "default" : "secondary"}>
                          {company.situacaoCadastral}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(company.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLoginAsCompany(company)}
                          >
                            <LogIn className="mr-2 h-4 w-4" />
                            Entrar
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/empresas/${company.id}`}>Ver detalhes</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/empresas/${company.id}/editar`}>Editar informações</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/empresas/${company.id}/auditoria`} className="flex items-center gap-2">
                                  <History className="h-4 w-4" />
                                  Ver auditoria
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/empresas/${company.id}/usuarios`}>Gerenciar usuários</Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                {company.active ? "Desativar" : "Ativar"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
