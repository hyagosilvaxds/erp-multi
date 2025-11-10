"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/api/auth"
import {
  investorsApi,
  type CreateInvestorDto,
  type InvestorType,
} from "@/lib/api/investors"

export default function NovoInvestidorPage() {
  const router = useRouter()
  const { toast } = useToast()
  const selectedCompany = authApi.getSelectedCompany()
  
  const [loading, setLoading] = useState(false)
  const [tipoInvestidor, setTipoInvestidor] = useState<InvestorType>("PESSOA_FISICA")

  // Estados do formulário organizados por seções
  const [formData, setFormData] = useState({
    // Pessoa Física
    fullName: "",
    cpf: "",
    rg: "",
    birthDate: "",
    gender: "",
    maritalStatus: "",
    nationality: "Brasileira",
    profession: "",
    motherName: "",
    fatherName: "",
    monthlyIncome: "",
    patrimony: "",
    
    // Pessoa Jurídica
    companyName: "",
    tradeName: "",
    cnpj: "",
    stateRegistration: "",
    municipalRegistration: "",
    foundedDate: "",
    legalNature: "",
    mainActivity: "",
    legalRepName: "",
    legalRepDocument: "",
    legalRepRole: "",
    
    // Contato (comum)
    email: "",
    alternativeEmail: "",
    phone: "",
    mobilePhone: "",
    whatsapp: "",
    
    // Endereço (comum)
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Brasil",
    addressType: "RESIDENCIAL",
    
    // Dados Bancários (comum)
    bankName: "",
    bankCode: "",
    agencyNumber: "",
    agencyDigit: "",
    accountNumber: "",
    accountDigit: "",
    accountType: "CORRENTE",
    pixKeyType: "",
    pixKey: "",
    
    // Investidor (comum)
    investorProfile: "MODERADO",
    investmentGoal: "",
    investorCode: "",
    category: "",
    isAccreditedInvestor: false,
    status: "ATIVO",
    active: true,
    notes: "",
    internalNotes: "",
  })

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCompany?.id) {
      toast({
        title: "Erro",
        description: "Nenhuma empresa selecionada",
        variant: "destructive",
      })
      return
    }

    // Validações básicas
    if (tipoInvestidor === "PESSOA_FISICA") {
      if (!formData.fullName || !formData.cpf || !formData.email) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha nome completo, CPF e e-mail",
          variant: "destructive",
        })
        return
      }
    } else {
      if (!formData.companyName || !formData.cnpj || !formData.email) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha razão social, CNPJ e e-mail",
          variant: "destructive",
        })
        return
      }
    }

    try {
      setLoading(true)

      let payload: CreateInvestorDto

      if (tipoInvestidor === "PESSOA_FISICA") {
        payload = {
          type: "PESSOA_FISICA",
          fullName: formData.fullName,
          cpf: formData.cpf,
          rg: formData.rg || undefined,
          birthDate: formData.birthDate || undefined,
          gender: formData.gender as any || undefined,
          maritalStatus: formData.maritalStatus as any || undefined,
          nationality: formData.nationality || undefined,
          profession: formData.profession || undefined,
          motherName: formData.motherName || undefined,
          fatherName: formData.fatherName || undefined,
          monthlyIncome: formData.monthlyIncome ? Number(formData.monthlyIncome) : undefined,
          patrimony: formData.patrimony ? Number(formData.patrimony) : undefined,
          email: formData.email,
          alternativeEmail: formData.alternativeEmail || undefined,
          phone: formData.phone || undefined,
          mobilePhone: formData.mobilePhone || undefined,
          whatsapp: formData.whatsapp || undefined,
          street: formData.street || undefined,
          number: formData.number || undefined,
          complement: formData.complement || undefined,
          neighborhood: formData.neighborhood || undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
          zipCode: formData.zipCode || undefined,
          country: formData.country || undefined,
          addressType: formData.addressType as any || undefined,
          bankName: formData.bankName || undefined,
          bankCode: formData.bankCode || undefined,
          agencyNumber: formData.agencyNumber || undefined,
          agencyDigit: formData.agencyDigit || undefined,
          accountNumber: formData.accountNumber || undefined,
          accountDigit: formData.accountDigit || undefined,
          accountType: formData.accountType as any || undefined,
          pixKeyType: formData.pixKeyType as any || undefined,
          pixKey: formData.pixKey || undefined,
          investorProfile: formData.investorProfile as any || undefined,
          investmentGoal: formData.investmentGoal || undefined,
          investorCode: formData.investorCode,
          category: formData.category || undefined,
          isAccreditedInvestor: formData.isAccreditedInvestor,
          status: formData.status as any,
          active: formData.active,
          notes: formData.notes || undefined,
          internalNotes: formData.internalNotes || undefined,
          termsAcceptedAt: new Date().toISOString(),
          privacyPolicyAcceptedAt: new Date().toISOString(),
        } as any
      } else {
        payload = {
          type: "PESSOA_JURIDICA",
          companyName: formData.companyName,
          tradeName: formData.tradeName || undefined,
          cnpj: formData.cnpj,
          stateRegistration: formData.stateRegistration || undefined,
          municipalRegistration: formData.municipalRegistration || undefined,
          foundedDate: formData.foundedDate || undefined,
          legalNature: formData.legalNature || undefined,
          mainActivity: formData.mainActivity || undefined,
          legalRepName: formData.legalRepName || undefined,
          legalRepDocument: formData.legalRepDocument || undefined,
          legalRepRole: formData.legalRepRole || undefined,
          email: formData.email,
          alternativeEmail: formData.alternativeEmail || undefined,
          phone: formData.phone || undefined,
          mobilePhone: formData.mobilePhone || undefined,
          whatsapp: formData.whatsapp || undefined,
          street: formData.street || undefined,
          number: formData.number || undefined,
          complement: formData.complement || undefined,
          neighborhood: formData.neighborhood || undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
          zipCode: formData.zipCode || undefined,
          country: formData.country || undefined,
          addressType: formData.addressType as any || undefined,
          bankName: formData.bankName || undefined,
          bankCode: formData.bankCode || undefined,
          agencyNumber: formData.agencyNumber || undefined,
          agencyDigit: formData.agencyDigit || undefined,
          accountNumber: formData.accountNumber || undefined,
          accountDigit: formData.accountDigit || undefined,
          accountType: formData.accountType as any || undefined,
          pixKeyType: formData.pixKeyType as any || undefined,
          pixKey: formData.pixKey || undefined,
          investorProfile: formData.investorProfile as any || undefined,
          investmentGoal: formData.investmentGoal || undefined,
          investorCode: formData.investorCode,
          category: formData.category || undefined,
          isAccreditedInvestor: formData.isAccreditedInvestor,
          status: formData.status as any,
          active: formData.active,
          notes: formData.notes || undefined,
          internalNotes: formData.internalNotes || undefined,
          termsAcceptedAt: new Date().toISOString(),
          privacyPolicyAcceptedAt: new Date().toISOString(),
        } as any
      }

      await investorsApi.create(selectedCompany.id, payload)

      toast({
        title: "Sucesso",
        description: "Investidor cadastrado com sucesso",
      })

      router.push("/dashboard/investidores")
    } catch (error: any) {
      console.error("Erro ao criar investidor:", error)
      toast({
        title: "Erro ao criar investidor",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!selectedCompany) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Nenhuma empresa selecionada</h3>
            <p className="text-sm text-muted-foreground">Selecione uma empresa para continuar</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Novo Investidor</h1>
            <p className="text-muted-foreground">Cadastrar novo investidor SCP</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {/* Tipo de Pessoa */}
              <Card>
                <CardHeader>
                  <CardTitle>Tipo de Investidor</CardTitle>
                  <CardDescription>Selecione se é pessoa física ou jurídica</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select 
                    value={tipoInvestidor} 
                    onValueChange={(value) => setTipoInvestidor(value as InvestorType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PESSOA_FISICA">Pessoa Física</SelectItem>
                      <SelectItem value="PESSOA_JURIDICA">Pessoa Jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Dados Básicos - Pessoa Física */}
              {tipoInvestidor === "PESSOA_FISICA" && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Dados Pessoais</CardTitle>
                      <CardDescription>Informações da pessoa física</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2 space-y-2">
                          <Label htmlFor="fullName">
                            Nome Completo <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="fullName"
                            placeholder="Digite o nome completo"
                            value={formData.fullName}
                            onChange={(e) => handleChange("fullName", e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cpf">
                            CPF <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="cpf"
                            placeholder="000.000.000-00"
                            value={formData.cpf}
                            onChange={(e) => handleChange("cpf", e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="rg">RG</Label>
                          <Input
                            id="rg"
                            placeholder="00.000.000-0"
                            value={formData.rg}
                            onChange={(e) => handleChange("rg", e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="birthDate">Data de Nascimento</Label>
                          <Input
                            id="birthDate"
                            type="date"
                            value={formData.birthDate}
                            onChange={(e) => handleChange("birthDate", e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gender">Gênero</Label>
                          <Select 
                            value={formData.gender} 
                            onValueChange={(value) => handleChange("gender", value)}
                          >
                            <SelectTrigger id="gender">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MASCULINO">Masculino</SelectItem>
                              <SelectItem value="FEMININO">Feminino</SelectItem>
                              <SelectItem value="OUTRO">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="maritalStatus">Estado Civil</Label>
                          <Select 
                            value={formData.maritalStatus} 
                            onValueChange={(value) => handleChange("maritalStatus", value)}
                          >
                            <SelectTrigger id="maritalStatus">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SOLTEIRO">Solteiro(a)</SelectItem>
                              <SelectItem value="CASADO">Casado(a)</SelectItem>
                              <SelectItem value="DIVORCIADO">Divorciado(a)</SelectItem>
                              <SelectItem value="VIUVO">Viúvo(a)</SelectItem>
                              <SelectItem value="UNIAO_ESTAVEL">União Estável</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="profession">Profissão</Label>
                          <Input
                            id="profession"
                            placeholder="Ex: Engenheiro Civil"
                            value={formData.profession}
                            onChange={(e) => handleChange("profession", e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="nationality">Nacionalidade</Label>
                          <Input
                            id="nationality"
                            placeholder="Ex: Brasileira"
                            value={formData.nationality}
                            onChange={(e) => handleChange("nationality", e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="motherName">Nome da Mãe</Label>
                          <Input
                            id="motherName"
                            placeholder="Nome completo da mãe"
                            value={formData.motherName}
                            onChange={(e) => handleChange("motherName", e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="fatherName">Nome do Pai</Label>
                          <Input
                            id="fatherName"
                            placeholder="Nome completo do pai"
                            value={formData.fatherName}
                            onChange={(e) => handleChange("fatherName", e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="monthlyIncome">Renda Mensal</Label>
                          <Input
                            id="monthlyIncome"
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            value={formData.monthlyIncome}
                            onChange={(e) => handleChange("monthlyIncome", e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="patrimony">Patrimônio</Label>
                          <Input
                            id="patrimony"
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            value={formData.patrimony}
                            onChange={(e) => handleChange("patrimony", e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Dados Básicos - Pessoa Jurídica */}
              {tipoInvestidor === "PESSOA_JURIDICA" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Dados da Empresa</CardTitle>
                    <CardDescription>Informações da pessoa jurídica</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="companyName">
                          Razão Social <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="companyName"
                          placeholder="Digite a razão social"
                          value={formData.companyName}
                          onChange={(e) => handleChange("companyName", e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tradeName">Nome Fantasia</Label>
                        <Input
                          id="tradeName"
                          placeholder="Digite o nome fantasia"
                          value={formData.tradeName}
                          onChange={(e) => handleChange("tradeName", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cnpj">
                          CNPJ <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="cnpj"
                          placeholder="00.000.000/0000-00"
                          value={formData.cnpj}
                          onChange={(e) => handleChange("cnpj", e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stateRegistration">Inscrição Estadual</Label>
                        <Input
                          id="stateRegistration"
                          placeholder="000.000.000.000"
                          value={formData.stateRegistration}
                          onChange={(e) => handleChange("stateRegistration", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="municipalRegistration">Inscrição Municipal</Label>
                        <Input
                          id="municipalRegistration"
                          placeholder="00000000"
                          value={formData.municipalRegistration}
                          onChange={(e) => handleChange("municipalRegistration", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="foundedDate">Data de Fundação</Label>
                        <Input
                          id="foundedDate"
                          type="date"
                          value={formData.foundedDate}
                          onChange={(e) => handleChange("foundedDate", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="legalNature">Natureza Jurídica</Label>
                        <Input
                          id="legalNature"
                          placeholder="Ex: Sociedade Limitada"
                          value={formData.legalNature}
                          onChange={(e) => handleChange("legalNature", e.target.value)}
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="mainActivity">Atividade Principal</Label>
                        <Input
                          id="mainActivity"
                          placeholder="Ex: Desenvolvimento de Software"
                          value={formData.mainActivity}
                          onChange={(e) => handleChange("mainActivity", e.target.value)}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <h4 className="font-semibold mb-3">Representante Legal</h4>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="legalRepName">Nome do Representante</Label>
                        <Input
                          id="legalRepName"
                          placeholder="Nome completo"
                          value={formData.legalRepName}
                          onChange={(e) => handleChange("legalRepName", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="legalRepDocument">CPF do Representante</Label>
                        <Input
                          id="legalRepDocument"
                          placeholder="000.000.000-00"
                          value={formData.legalRepDocument}
                          onChange={(e) => handleChange("legalRepDocument", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="legalRepRole">Cargo</Label>
                        <Input
                          id="legalRepRole"
                          placeholder="Ex: Sócio-Administrador"
                          value={formData.legalRepRole}
                          onChange={(e) => handleChange("legalRepRole", e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Contato */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações de Contato</CardTitle>
                  <CardDescription>E-mails e telefones</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        E-mail <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="investidor@email.com"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="alternativeEmail">E-mail Alternativo</Label>
                      <Input
                        id="alternativeEmail"
                        type="email"
                        placeholder="outro@email.com"
                        value={formData.alternativeEmail}
                        onChange={(e) => handleChange("alternativeEmail", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mobilePhone">Celular</Label>
                      <Input
                        id="mobilePhone"
                        placeholder="(00) 00000-0000"
                        value={formData.mobilePhone}
                        onChange={(e) => handleChange("mobilePhone", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">WhatsApp</Label>
                      <Input
                        id="whatsapp"
                        placeholder="(00) 00000-0000"
                        value={formData.whatsapp}
                        onChange={(e) => handleChange("whatsapp", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone Fixo</Label>
                      <Input
                        id="phone"
                        placeholder="(00) 0000-0000"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Endereço */}
              <Card>
                <CardHeader>
                  <CardTitle>Endereço</CardTitle>
                  <CardDescription>Dados de localização</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">CEP</Label>
                      <Input
                        id="zipCode"
                        placeholder="00000-000"
                        value={formData.zipCode}
                        onChange={(e) => handleChange("zipCode", e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="street">Logradouro</Label>
                      <Input
                        id="street"
                        placeholder="Rua, Avenida, etc"
                        value={formData.street}
                        onChange={(e) => handleChange("street", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                      <Label htmlFor="number">Número</Label>
                      <Input
                        id="number"
                        placeholder="000"
                        value={formData.number}
                        onChange={(e) => handleChange("number", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="complement">Complemento</Label>
                      <Input
                        id="complement"
                        placeholder="Apto, Sala"
                        value={formData.complement}
                        onChange={(e) => handleChange("complement", e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="neighborhood">Bairro</Label>
                      <Input
                        id="neighborhood"
                        placeholder="Digite o bairro"
                        value={formData.neighborhood}
                        onChange={(e) => handleChange("neighborhood", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        placeholder="Digite a cidade"
                        value={formData.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        placeholder="UF"
                        maxLength={2}
                        value={formData.state}
                        onChange={(e) => handleChange("state", e.target.value.toUpperCase())}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="addressType">Tipo de Endereço</Label>
                      <Select 
                        value={formData.addressType} 
                        onValueChange={(value) => handleChange("addressType", value)}
                      >
                        <SelectTrigger id="addressType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RESIDENCIAL">Residencial</SelectItem>
                          <SelectItem value="COMERCIAL">Comercial</SelectItem>
                          <SelectItem value="CORRESPONDENCIA">Correspondência</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dados Bancários */}
              <Card>
                <CardHeader>
                  <CardTitle>Dados Bancários</CardTitle>
                  <CardDescription>Para distribuição de rendimentos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Banco</Label>
                      <Input
                        id="bankName"
                        placeholder="Ex: Banco do Brasil"
                        value={formData.bankName}
                        onChange={(e) => handleChange("bankName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankCode">Código do Banco</Label>
                      <Input
                        id="bankCode"
                        placeholder="001"
                        value={formData.bankCode}
                        onChange={(e) => handleChange("bankCode", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                      <Label htmlFor="agencyNumber">Agência</Label>
                      <Input
                        id="agencyNumber"
                        placeholder="0000"
                        value={formData.agencyNumber}
                        onChange={(e) => handleChange("agencyNumber", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agencyDigit">Dígito</Label>
                      <Input
                        id="agencyDigit"
                        placeholder="0"
                        maxLength={1}
                        value={formData.agencyDigit}
                        onChange={(e) => handleChange("agencyDigit", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Conta</Label>
                      <Input
                        id="accountNumber"
                        placeholder="00000"
                        value={formData.accountNumber}
                        onChange={(e) => handleChange("accountNumber", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountDigit">Dígito</Label>
                      <Input
                        id="accountDigit"
                        placeholder="0"
                        maxLength={1}
                        value={formData.accountDigit}
                        onChange={(e) => handleChange("accountDigit", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="accountType">Tipo de Conta</Label>
                      <Select 
                        value={formData.accountType} 
                        onValueChange={(value) => handleChange("accountType", value)}
                      >
                        <SelectTrigger id="accountType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CORRENTE">Conta Corrente</SelectItem>
                          <SelectItem value="POUPANCA">Conta Poupança</SelectItem>
                          <SelectItem value="PAGAMENTO">Conta Pagamento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pixKeyType">Tipo de Chave PIX</Label>
                      <Select 
                        value={formData.pixKeyType} 
                        onValueChange={(value) => handleChange("pixKeyType", value)}
                      >
                        <SelectTrigger id="pixKeyType">
                          <SelectValue placeholder="Selecione (opcional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CPF">CPF</SelectItem>
                          <SelectItem value="CNPJ">CNPJ</SelectItem>
                          <SelectItem value="EMAIL">E-mail</SelectItem>
                          <SelectItem value="TELEFONE">Telefone</SelectItem>
                          <SelectItem value="CHAVE_ALEATORIA">Chave Aleatória</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="pixKey">Chave PIX</Label>
                      <Input
                        id="pixKey"
                        placeholder="Digite a chave PIX"
                        value={formData.pixKey}
                        onChange={(e) => handleChange("pixKey", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Observações */}
              <Card>
                <CardHeader>
                  <CardTitle>Observações</CardTitle>
                  <CardDescription>Informações adicionais sobre o investidor</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações Públicas</Label>
                    <Textarea
                      id="notes"
                      placeholder="Observações que podem ser visualizadas..."
                      className="min-h-[80px]"
                      value={formData.notes}
                      onChange={(e) => handleChange("notes", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="internalNotes">Observações Internas</Label>
                    <Textarea
                      id="internalNotes"
                      placeholder="Observações de uso interno..."
                      className="min-h-[80px]"
                      value={formData.internalNotes}
                      onChange={(e) => handleChange("internalNotes", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Código do Investidor */}
              <Card>
                <CardHeader>
                  <CardTitle>Código do Investidor</CardTitle>
                  <CardDescription>Identificação única</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="investorCode">
                      Código <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="investorCode"
                      placeholder="Ex: INV-001"
                      value={formData.investorCode}
                      onChange={(e) => handleChange("investorCode", e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Código único para identificação do investidor
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Perfil de Investidor */}
              <Card>
                <CardHeader>
                  <CardTitle>Perfil de Investidor</CardTitle>
                  <CardDescription>Características de investimento</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="investorProfile">Perfil de Risco</Label>
                    <Select 
                      value={formData.investorProfile} 
                      onValueChange={(value) => handleChange("investorProfile", value)}
                    >
                      <SelectTrigger id="investorProfile">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CONSERVADOR">Conservador</SelectItem>
                        <SelectItem value="MODERADO">Moderado</SelectItem>
                        <SelectItem value="ARROJADO">Arrojado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="investmentGoal">Objetivo de Investimento</Label>
                    <Textarea
                      id="investmentGoal"
                      placeholder="Ex: Crescimento patrimonial de longo prazo"
                      className="min-h-[80px]"
                      value={formData.investmentGoal}
                      onChange={(e) => handleChange("investmentGoal", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Input
                      id="category"
                      placeholder="Ex: Premium, VIP, etc"
                      value={formData.category}
                      onChange={(e) => handleChange("category", e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isAccreditedInvestor"
                      checked={formData.isAccreditedInvestor}
                      onCheckedChange={(checked) => handleChange("isAccreditedInvestor", checked)}
                    />
                    <Label htmlFor="isAccreditedInvestor" className="text-sm font-normal cursor-pointer">
                      Investidor Qualificado
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                  <CardDescription>Estado atual do investidor</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => handleChange("status", value)}
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ATIVO">Ativo</SelectItem>
                        <SelectItem value="INATIVO">Inativo</SelectItem>
                        <SelectItem value="SUSPENSO">Suspenso</SelectItem>
                        <SelectItem value="BLOQUEADO">Bloqueado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="active"
                      checked={formData.active}
                      onCheckedChange={(checked) => handleChange("active", checked)}
                    />
                    <Label htmlFor="active" className="text-sm font-normal cursor-pointer">
                      Investidor Ativo
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Ações */}
              <Card>
                <CardContent className="pt-6 space-y-2">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Investidor
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => router.back()}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
