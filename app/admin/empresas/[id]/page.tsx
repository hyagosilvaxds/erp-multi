"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  FileText, 
  Users, 
  Loader2,
  Calendar,
  CreditCard,
  Settings,
  Edit,
  History
} from "lucide-react"
import { companiesApi } from "@/lib/api/auth"
import { useToast } from "@/hooks/use-toast"
import { formatApiError } from "@/lib/format-error"

interface CompanyUser {
  id: string
  userId: string
  companyId: string
  roleId: string
  active: boolean
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    active: boolean
  }
  role: {
    id: string
    name: string
    description: string
  }
}

interface CompanyDetails {
  id: string
  razaoSocial: string
  nomeFantasia: string | null
  cnpj: string
  inscricaoEstadual: string | null
  inscricaoMunicipal: string | null
  regimeTributario: string | null
  cnaePrincipal: string | null
  cnaeSecundarios: string[]
  dataAbertura: string | null
  situacaoCadastral: string
  logradouro: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  pais: string
  telefone: string | null
  celular: string | null
  email: string | null
  site: string | null
  tipoContribuinte: string | null
  regimeApuracao: string | null
  codigoMunicipioIBGE: string | null
  codigoEstadoIBGE: string | null
  cfopPadrao: string | null
  certificadoDigitalPath: string | null
  certificadoDigitalSenha: string | null
  serieNFe: string | null
  ultimoNumeroNFe: number | null
  serieNFCe: string | null
  ultimoNumeroNFCe: number | null
  serieNFSe: string | null
  ultimoNumeroNFSe: number | null
  ambienteFiscal: string
  logoUrl: string | null
  logoFileName: string | null
  logoMimeType: string | null
  planoContasId: string | null
  active: boolean
  createdAt: string
  updatedAt: string
  users: CompanyUser[]
}

export default function EmpresaDetalhesPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [company, setCompany] = useState<CompanyDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCompanyDetails()
  }, [params.id])

  const loadCompanyDetails = async () => {
    try {
      setLoading(true)
      const data = await companiesApi.getCompanyById(params.id as string)
      console.log('📦 Detalhes da empresa:', data)
      setCompany(data)
    } catch (error: any) {
      console.error('❌ Erro ao carregar detalhes:', error)
      
      const { title, description } = formatApiError(error)
      
      toast({
        title,
        description,
        variant: "destructive",
      })
      router.push('/admin/empresas')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
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

  if (!company) {
    return (
      <DashboardLayout userRole="admin">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Empresa não encontrada</h3>
          <Button onClick={() => router.push('/admin/empresas')}>
            Voltar para lista
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/admin/empresas')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Detalhes da Empresa</h1>
              <p className="text-muted-foreground">
                Visualize todas as informações da empresa
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              onClick={() => router.push(`/admin/empresas/${params.id}/auditoria`)}
            >
              <History className="mr-2 h-4 w-4" />
              Auditoria
            </Button>
            <Button onClick={() => router.push(`/admin/empresas/${params.id}/editar`)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar Empresa
            </Button>
            <Badge variant={company.active ? "default" : "secondary"} className="text-sm">
              {company.situacaoCadastral}
            </Badge>
          </div>
        </div>

        {/* Dados Básicos */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                {company.logoUrl ? (
                  <img
                    src={company.logoUrl}
                    alt={company.nomeFantasia || company.razaoSocial}
                    className="h-full w-full rounded-lg object-cover"
                  />
                ) : (
                  <Building2 className="h-6 w-6 text-primary" />
                )}
              </div>
              <div>
                <CardTitle className="text-2xl">{company.nomeFantasia || company.razaoSocial}</CardTitle>
                <CardDescription>{company.razaoSocial}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">CNPJ</p>
                <p className="font-mono">{company.cnpj}</p>
              </div>
              {company.inscricaoEstadual && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Inscrição Estadual</p>
                  <p>{company.inscricaoEstadual}</p>
                </div>
              )}
              {company.inscricaoMunicipal && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Inscrição Municipal</p>
                  <p>{company.inscricaoMunicipal}</p>
                </div>
              )}
              {company.regimeTributario && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Regime Tributário</p>
                  <Badge variant="outline">{company.regimeTributario}</Badge>
                </div>
              )}
              {company.dataAbertura && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Data de Abertura</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>{formatDate(company.dataAbertura)}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Endereço */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <CardTitle>Endereço</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {company.logradouro && (
                <div>
                  <p className="text-sm text-muted-foreground">Logradouro</p>
                  <p className="font-medium">
                    {company.logradouro}
                    {company.numero && `, ${company.numero}`}
                  </p>
                  {company.complemento && (
                    <p className="text-sm text-muted-foreground">{company.complemento}</p>
                  )}
                </div>
              )}
              {company.bairro && (
                <div>
                  <p className="text-sm text-muted-foreground">Bairro</p>
                  <p className="font-medium">{company.bairro}</p>
                </div>
              )}
              {company.cidade && company.estado && (
                <div>
                  <p className="text-sm text-muted-foreground">Cidade/Estado</p>
                  <p className="font-medium">{company.cidade}/{company.estado}</p>
                </div>
              )}
              {company.cep && (
                <div>
                  <p className="text-sm text-muted-foreground">CEP</p>
                  <p className="font-medium font-mono">{company.cep}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">País</p>
                <p className="font-medium">{company.pais}</p>
              </div>
            </CardContent>
          </Card>

          {/* Contatos */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                <CardTitle>Contatos</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {company.telefone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">{company.telefone}</p>
                  </div>
                </div>
              )}
              {company.celular && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Celular</p>
                    <p className="font-medium">{company.celular}</p>
                  </div>
                </div>
              )}
              {company.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">E-mail</p>
                    <p className="font-medium">{company.email}</p>
                  </div>
                </div>
              )}
              {company.site && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Website</p>
                    <a 
                      href={company.site} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      {company.site}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* CNAE */}
        {(company.cnaePrincipal || company.cnaeSecundarios.length > 0) && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <CardTitle>Atividades Econômicas (CNAE)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {company.cnaePrincipal && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">CNAE Principal</p>
                  <Badge variant="default">{company.cnaePrincipal}</Badge>
                </div>
              )}
              {company.cnaeSecundarios.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">CNAEs Secundários</p>
                  <div className="flex flex-wrap gap-2">
                    {company.cnaeSecundarios.map((cnae, index) => (
                      <Badge key={index} variant="outline">{cnae}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Configurações Fiscais */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <CardTitle>Configurações Fiscais</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {company.tipoContribuinte && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Tipo de Contribuinte</p>
                  <p>{company.tipoContribuinte}</p>
                </div>
              )}
              {company.regimeApuracao && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Regime de Apuração</p>
                  <p>{company.regimeApuracao}</p>
                </div>
              )}
              {company.cfopPadrao && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">CFOP Padrão</p>
                  <p className="font-mono">{company.cfopPadrao}</p>
                </div>
              )}
              {company.codigoMunicipioIBGE && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Código IBGE Município</p>
                  <p className="font-mono">{company.codigoMunicipioIBGE}</p>
                </div>
              )}
              {company.codigoEstadoIBGE && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Código IBGE Estado</p>
                  <p className="font-mono">{company.codigoEstadoIBGE}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Ambiente Fiscal</p>
                <Badge variant={company.ambienteFiscal === "Producao" ? "default" : "secondary"}>
                  {company.ambienteFiscal}
                </Badge>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid gap-4 md:grid-cols-3">
              {company.serieNFe && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">NF-e</p>
                  <p>Série: {company.serieNFe}</p>
                  <p className="text-sm text-muted-foreground">
                    Último número: {company.ultimoNumeroNFe || 0}
                  </p>
                </div>
              )}
              {company.serieNFCe && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">NFC-e</p>
                  <p>Série: {company.serieNFCe}</p>
                  <p className="text-sm text-muted-foreground">
                    Último número: {company.ultimoNumeroNFCe || 0}
                  </p>
                </div>
              )}
              {company.serieNFSe && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">NFS-e</p>
                  <p>Série: {company.serieNFSe}</p>
                  <p className="text-sm text-muted-foreground">
                    Último número: {company.ultimoNumeroNFSe || 0}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Usuários Vinculados */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <div>
                  <CardTitle>Usuários Vinculados</CardTitle>
                  <CardDescription>
                    {company.users.length} {company.users.length === 1 ? "usuário vinculado" : "usuários vinculados"}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {company.users.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum usuário vinculado a esta empresa
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Vinculado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {company.users.map((userCompany) => (
                    <TableRow key={userCompany.id}>
                      <TableCell className="font-medium">{userCompany.user.name}</TableCell>
                      <TableCell>{userCompany.user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {userCompany.role.name}
                        </Badge>
                        {userCompany.role.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {userCompany.role.description}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={userCompany.active && userCompany.user.active ? "default" : "secondary"}>
                          {userCompany.active && userCompany.user.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateTime(userCompany.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Metadados */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <CardTitle>Metadados</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Cadastrado em</p>
                <p>{formatDateTime(company.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Última atualização</p>
                <p>{formatDateTime(company.updatedAt)}</p>
              </div>
              {company.planoContasId && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Plano de Contas ID</p>
                  <p className="font-mono text-sm">{company.planoContasId}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
