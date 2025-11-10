"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Loader2,
  ArrowLeft,
  Edit,
  Trash2,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  TrendingUp,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { investorsApi, type InvestorDetails } from "@/lib/api/investors"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function DetalhesInvestidorPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [investor, setInvestor] = useState<InvestorDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadInvestor()
  }, [params.id])

  const loadInvestor = async () => {
    try {
      setLoading(true)
      const data = await investorsApi.getById(params.id as string)
      setInvestor(data)
    } catch (error: any) {
      console.error("Erro ao carregar investidor:", error)
      toast({
        title: "Erro ao carregar investidor",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await investorsApi.delete(params.id as string)
      toast({
        title: "Sucesso",
        description: "Investidor excluído com sucesso",
      })
      router.push("/dashboard/investidores")
    } catch (error: any) {
      console.error("Erro ao excluir investidor:", error)
      toast({
        title: "Erro ao excluir investidor",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  if (!investor) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Investidor não encontrado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              O investidor solicitado não existe ou foi removido
            </p>
            <Link href="/dashboard/investidores">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Investidores
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const isPessoaFisica = investor.type === "PESSOA_FISICA"
  const investorName = investorsApi.helpers.getName(investor)
  const investorDocument = investorsApi.helpers.getDocument(investor)

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard/investidores">
              <Button variant="ghost" className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                {isPessoaFisica ? (
                  <User className="h-6 w-6 text-primary" />
                ) : (
                  <Building2 className="h-6 w-6 text-primary" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {investorName}
                </h1>
                <p className="text-muted-foreground">
                  {investorsApi.helpers.getTypeLabel(investor.type)} • {investorDocument}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/investidores/${investor.id}/editar`}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={deleting}>
                  {deleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir este investidor? Esta ação não pode ser desfeita.
                    {investor._count && (investor._count.investments > 0 || investor._count.distributions > 0) && (
                      <div className="mt-2 p-2 bg-destructive/10 rounded-md text-destructive">
                        ⚠️ Este investidor possui {investor._count.investments} aporte(s) e {investor._count.distributions} distribuição(ões).
                        A exclusão pode falhar se houver dados vinculados.
                      </div>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Status e Informações Principais */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                variant={investor.status === "ATIVO" ? "default" : "secondary"}
                className={
                  investor.status === "ATIVO"
                    ? "bg-green-500"
                    : investor.status === "INATIVO"
                    ? "bg-gray-500"
                    : investor.status === "SUSPENSO"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }
              >
                {investorsApi.helpers.getStatusLabel(investor.status)}
              </Badge>
              {investor.statusReason && (
                <p className="text-xs text-muted-foreground mt-2">
                  {investor.statusReason}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Código</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{investor.investorCode}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Aportes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{investor._count?.investments || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Distribuições</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{investor._count?.distributions || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Dados Pessoais / Empresariais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isPessoaFisica ? <User className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
              Dados {isPessoaFisica ? "Pessoais" : "Empresariais"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {isPessoaFisica ? (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Nome Completo</p>
                    <p className="font-medium">{investor.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CPF</p>
                    <p className="font-medium">{investor.cpf}</p>
                  </div>
                  {investor.rg && (
                    <div>
                      <p className="text-sm text-muted-foreground">RG</p>
                      <p className="font-medium">{investor.rg}</p>
                    </div>
                  )}
                  {investor.birthDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                      <p className="font-medium">
                        {new Date(investor.birthDate).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  )}
                  {investor.gender && (
                    <div>
                      <p className="text-sm text-muted-foreground">Gênero</p>
                      <p className="font-medium">{investor.gender}</p>
                    </div>
                  )}
                  {investor.maritalStatus && (
                    <div>
                      <p className="text-sm text-muted-foreground">Estado Civil</p>
                      <p className="font-medium">{investor.maritalStatus}</p>
                    </div>
                  )}
                  {investor.nationality && (
                    <div>
                      <p className="text-sm text-muted-foreground">Nacionalidade</p>
                      <p className="font-medium">{investor.nationality}</p>
                    </div>
                  )}
                  {investor.profession && (
                    <div>
                      <p className="text-sm text-muted-foreground">Profissão</p>
                      <p className="font-medium">{investor.profession}</p>
                    </div>
                  )}
                  {investor.monthlyIncome && (
                    <div>
                      <p className="text-sm text-muted-foreground">Renda Mensal</p>
                      <p className="font-medium">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(investor.monthlyIncome)}
                      </p>
                    </div>
                  )}
                  {investor.patrimony && (
                    <div>
                      <p className="text-sm text-muted-foreground">Patrimônio</p>
                      <p className="font-medium">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(investor.patrimony)}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Razão Social</p>
                    <p className="font-medium">{investor.companyName}</p>
                  </div>
                  {investor.tradeName && (
                    <div>
                      <p className="text-sm text-muted-foreground">Nome Fantasia</p>
                      <p className="font-medium">{investor.tradeName}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">CNPJ</p>
                    <p className="font-medium">{investor.cnpj}</p>
                  </div>
                  {investor.stateRegistration && (
                    <div>
                      <p className="text-sm text-muted-foreground">Inscrição Estadual</p>
                      <p className="font-medium">{investor.stateRegistration}</p>
                    </div>
                  )}
                  {investor.municipalRegistration && (
                    <div>
                      <p className="text-sm text-muted-foreground">Inscrição Municipal</p>
                      <p className="font-medium">{investor.municipalRegistration}</p>
                    </div>
                  )}
                  {investor.foundedDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Data de Fundação</p>
                      <p className="font-medium">
                        {new Date(investor.foundedDate).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  )}
                  {investor.legalNature && (
                    <div>
                      <p className="text-sm text-muted-foreground">Natureza Jurídica</p>
                      <p className="font-medium">{investor.legalNature}</p>
                    </div>
                  )}
                  {investor.mainActivity && (
                    <div>
                      <p className="text-sm text-muted-foreground">Atividade Principal</p>
                      <p className="font-medium">{investor.mainActivity}</p>
                    </div>
                  )}
                  {investor.legalRepName && (
                    <div>
                      <p className="text-sm text-muted-foreground">Representante Legal</p>
                      <p className="font-medium">{investor.legalRepName}</p>
                    </div>
                  )}
                  {investor.legalRepDocument && (
                    <div>
                      <p className="text-sm text-muted-foreground">CPF do Representante</p>
                      <p className="font-medium">{investor.legalRepDocument}</p>
                    </div>
                  )}
                  {investor.legalRepRole && (
                    <div>
                      <p className="text-sm text-muted-foreground">Cargo do Representante</p>
                      <p className="font-medium">{investor.legalRepRole}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">E-mail</p>
                <p className="font-medium">{investor.email}</p>
              </div>
              {investor.alternativeEmail && (
                <div>
                  <p className="text-sm text-muted-foreground">E-mail Alternativo</p>
                  <p className="font-medium">{investor.alternativeEmail}</p>
                </div>
              )}
              {investor.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{investor.phone}</p>
                </div>
              )}
              {investor.mobilePhone && (
                <div>
                  <p className="text-sm text-muted-foreground">Celular</p>
                  <p className="font-medium">{investor.mobilePhone}</p>
                </div>
              )}
              {investor.whatsapp && (
                <div>
                  <p className="text-sm text-muted-foreground">WhatsApp</p>
                  <p className="font-medium">{investor.whatsapp}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        {investor.street && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Logradouro</p>
                  <p className="font-medium">
                    {investor.street}
                    {investor.number && `, ${investor.number}`}
                    {investor.complement && ` - ${investor.complement}`}
                  </p>
                </div>
                {investor.neighborhood && (
                  <div>
                    <p className="text-sm text-muted-foreground">Bairro</p>
                    <p className="font-medium">{investor.neighborhood}</p>
                  </div>
                )}
                {investor.city && (
                  <div>
                    <p className="text-sm text-muted-foreground">Cidade</p>
                    <p className="font-medium">{investor.city}</p>
                  </div>
                )}
                {investor.state && (
                  <div>
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <p className="font-medium">{investor.state}</p>
                  </div>
                )}
                {investor.zipCode && (
                  <div>
                    <p className="text-sm text-muted-foreground">CEP</p>
                    <p className="font-medium">{investor.zipCode}</p>
                  </div>
                )}
                {investor.country && (
                  <div>
                    <p className="text-sm text-muted-foreground">País</p>
                    <p className="font-medium">{investor.country}</p>
                  </div>
                )}
                {investor.addressType && (
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo de Endereço</p>
                    <p className="font-medium">{investor.addressType}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dados Bancários */}
        {investor.bankName && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Dados Bancários
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Banco</p>
                  <p className="font-medium">
                    {investor.bankCode} - {investor.bankName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Agência</p>
                  <p className="font-medium">
                    {investor.agencyNumber}
                    {investor.agencyDigit && `-${investor.agencyDigit}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Conta</p>
                  <p className="font-medium">
                    {investor.accountNumber}
                    {investor.accountDigit && `-${investor.accountDigit}`}
                  </p>
                </div>
                {investor.accountType && (
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo de Conta</p>
                    <p className="font-medium">{investor.accountType}</p>
                  </div>
                )}
                {investor.pixKey && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">
                      Chave PIX ({investor.pixKeyType})
                    </p>
                    <p className="font-medium">{investor.pixKey}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Perfil de Investidor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Perfil de Investidor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {investor.investorProfile && (
                <div>
                  <p className="text-sm text-muted-foreground">Perfil</p>
                  <p className="font-medium">{investor.investorProfile}</p>
                </div>
              )}
              {investor.investmentGoal && (
                <div>
                  <p className="text-sm text-muted-foreground">Objetivo de Investimento</p>
                  <p className="font-medium">{investor.investmentGoal}</p>
                </div>
              )}
              {investor.category && (
                <div>
                  <p className="text-sm text-muted-foreground">Categoria</p>
                  <p className="font-medium">{investor.category}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Investidor Qualificado</p>
                <p className="font-medium">
                  {investor.isAccreditedInvestor ? "Sim" : "Não"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Observações */}
        {(investor.notes || investor.internalNotes) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Observações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {investor.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Observações Públicas</p>
                  <p className="text-sm whitespace-pre-wrap">{investor.notes}</p>
                </div>
              )}
              {investor.internalNotes && (
                <>
                  {investor.notes && <Separator />}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Observações Internas</p>
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                      {investor.internalNotes}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Metadados */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 text-sm">
              <div>
                <p className="text-muted-foreground">Criado em</p>
                <p className="font-medium">
                  {new Date(investor.createdAt).toLocaleString("pt-BR")}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Atualizado em</p>
                <p className="font-medium">
                  {new Date(investor.updatedAt).toLocaleString("pt-BR")}
                </p>
              </div>
              {investor.termsAcceptedAt && (
                <div>
                  <p className="text-muted-foreground">Termos Aceitos em</p>
                  <p className="font-medium">
                    {new Date(investor.termsAcceptedAt).toLocaleString("pt-BR")}
                  </p>
                </div>
              )}
              {investor.lastContactDate && (
                <div>
                  <p className="text-muted-foreground">Último Contato</p>
                  <p className="font-medium">
                    {new Date(investor.lastContactDate).toLocaleString("pt-BR")}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
