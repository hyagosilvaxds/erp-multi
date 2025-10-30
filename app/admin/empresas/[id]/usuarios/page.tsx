"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Users, 
  Loader2, 
  X, 
  Edit,
  CheckCircle2,
  XCircle
} from "lucide-react"
import { usersApi, type UserDetail, type UsersListResponse } from "@/lib/api/users"
import { authApi } from "@/lib/api/auth"
import { useToast } from "@/hooks/use-toast"

export default function UsuariosEmpresaPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const companyId = params.id as string

  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [usersData, setUsersData] = useState<UsersListResponse | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState<string>("all")

  // Debounce do termo de busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Carregar usuários quando filtros mudam
  useEffect(() => {
    if (companyId) {
      loadUsers()
    }
  }, [companyId, debouncedSearch, activeFilter])

  const loadUsers = async () => {
    try {
      setSearching(true)
      
      const params: any = {
        search: debouncedSearch || undefined,
      }
      
      if (activeFilter !== "all") {
        params.active = activeFilter === "active"
      }
      
      const data = await usersApi.getByCompany(companyId, params)
      setUsersData(data)
      
      if (debouncedSearch) {
        console.log(`🔍 Busca: "${debouncedSearch}" | Encontrados: ${data.data.length}`)
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar usuários:', error)
      
      toast({
        title: "Erro ao carregar usuários",
        description: error.message || "Não foi possível carregar a lista de usuários",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setSearching(false)
    }
  }

  const handleClearSearch = () => {
    setSearchTerm("")
    setDebouncedSearch("")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getUserCompanyRole = (user: UserDetail) => {
    const userCompany = user.companies.find(c => c.companyId === companyId)
    return userCompany?.role.name || "Sem role"
  }

  const getUserCompanyStatus = (user: UserDetail) => {
    const userCompany = user.companies.find(c => c.companyId === companyId)
    return userCompany?.active && user.active
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/admin/empresas')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Users className="h-8 w-8" />
                Usuários da Empresa
              </h1>
              {usersData?.company && (
                <p className="text-muted-foreground">
                  {usersData.company.nomeFantasia || usersData.company.razaoSocial}
                </p>
              )}
            </div>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Usuário
          </Button>
        </div>

        {/* Filtros e Busca */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Usuários</CardTitle>
                <CardDescription>
                  {loading ? (
                    "Carregando..."
                  ) : (
                    <>
                      {usersData?.meta.total || 0} usuário(s) encontrado(s)
                      {debouncedSearch && ` para "${debouncedSearch}"`}
                    </>
                  )}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={activeFilter} onValueChange={setActiveFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Campo de busca */}
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                    onClick={handleClearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {searching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>

            {/* Tabela */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !usersData?.data.length ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? "Nenhum usuário encontrado" : "Nenhum usuário cadastrado"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? `Não encontramos usuários com "${searchTerm}"`
                    : "Adicione o primeiro usuário desta empresa"}
                </p>
                {searchTerm && (
                  <Button variant="outline" onClick={handleClearSearch}>
                    Limpar busca
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersData.data.map((user) => {
                    const isActive = getUserCompanyStatus(user)
                    const role = getUserCompanyRole(user)
                    const currentUser = authApi.getUser()
                    const isCurrentUser = !!(currentUser && currentUser.userId === user.id)
                    
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name}
                          {isCurrentUser && (
                            <Badge variant="outline" className="ml-2">Você</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{role}</Badge>
                        </TableCell>
                        <TableCell>
                          {isActive ? (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Ativo
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <XCircle className="mr-1 h-3 w-3" />
                              Inativo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <Link href={`/admin/empresas/${companyId}/usuarios/${user.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

