'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, User, Building2, MapPin, Phone, Mail } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  customersApi,
  type PersonType,
  type Gender,
  type MaritalStatus,
  type TaxRegime,
  type CreateCustomerRequest,
} from '@/lib/api/customers'
import {
  maskCPF,
  maskCNPJ,
  maskCEP,
  maskPhone,
  maskCNAE,
  removeMask,
  validateCPF,
  validateCNPJ,
  validateCEP,
  validatePhone,
  validateEmail,
  searchCEP,
} from '@/lib/masks'

export default function NewCustomerPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  // Tipo de pessoa
  const [personType, setPersonType] = useState<PersonType>('FISICA')

  // Dados Pessoa Física
  const [name, setName] = useState('')
  const [cpf, setCpf] = useState('')
  const [rg, setRg] = useState('')
  const [rgIssuer, setRgIssuer] = useState('')
  const [rgState, setRgState] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [gender, setGender] = useState<Gender>('MALE')
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>('SINGLE')
  const [motherName, setMotherName] = useState('')
  const [profession, setProfession] = useState('')
  const [nationality, setNationality] = useState('Brasileira')

  // Dados Pessoa Jurídica
  const [companyName, setCompanyName] = useState('')
  const [tradeName, setTradeName] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [stateRegistration, setStateRegistration] = useState('')
  const [stateRegistrationExempt, setStateRegistrationExempt] = useState(false)
  const [cnae, setCnae] = useState('')
  const [taxRegime, setTaxRegime] = useState<TaxRegime>('SIMPLES_NACIONAL')
  const [responsibleName, setResponsibleName] = useState('')
  const [responsibleCpf, setResponsibleCpf] = useState('')
  const [responsibleEmail, setResponsibleEmail] = useState('')
  const [responsiblePhone, setResponsiblePhone] = useState('')

  // Dados Comuns
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [mobile, setMobile] = useState('')
  const [website, setWebsite] = useState('')
  const [creditLimit, setCreditLimit] = useState('')
  const [active, setActive] = useState(true)
  const [notes, setNotes] = useState('')

  // Endereço
  const [zipCode, setZipCode] = useState('')
  const [street, setStreet] = useState('')
  const [number, setNumber] = useState('')
  const [complement, setComplement] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [ibgeCode, setIbgeCode] = useState('')
  const [loadingCEP, setLoadingCEP] = useState(false)

  // Handlers com máscaras
  const handleCPFChange = (value: string) => {
    setCpf(maskCPF(value))
  }

  const handleCNPJChange = (value: string) => {
    setCnpj(maskCNPJ(value))
  }

  const handleCEPChange = async (value: string) => {
    const maskedValue = maskCEP(value)
    setZipCode(maskedValue)

    // Buscar endereço quando CEP estiver completo
    if (removeMask(maskedValue).length === 8) {
      setLoadingCEP(true)
      const address = await searchCEP(maskedValue)
      
      if (address) {
        setStreet(address.logradouro)
        setNeighborhood(address.bairro)
        setCity(address.localidade)
        setState(address.uf)
        if (address.complemento) {
          setComplement(address.complemento)
        }
        // ViaCEP já retorna o código IBGE
        if (address.ibge) {
          setIbgeCode(address.ibge)
        }
        
        toast({
          title: 'CEP encontrado!',
          description: 'Endereço preenchido automaticamente.',
        })
      } else {
        toast({
          title: 'CEP não encontrado',
          description: 'Verifique o CEP digitado.',
          variant: 'destructive',
        })
      }
      setLoadingCEP(false)
    }
  }

  const handlePhoneChange = (value: string) => {
    setPhone(maskPhone(value))
  }

  const handleMobileChange = (value: string) => {
    setMobile(maskPhone(value))
  }

  const handleResponsibleCPFChange = (value: string) => {
    setResponsibleCpf(maskCPF(value))
  }

  const handleResponsiblePhoneChange = (value: string) => {
    setResponsiblePhone(maskPhone(value))
  }

  const handleCNAEChange = (value: string) => {
    setCnae(maskCNAE(value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validações básicas
    if (personType === 'FISICA') {
      if (!name || !cpf) {
        toast({
          title: 'Campos obrigatórios',
          description: 'Nome e CPF são obrigatórios para Pessoa Física.',
          variant: 'destructive',
        })
        return
      }

      // Validar CPF
      if (!validateCPF(cpf)) {
        toast({
          title: 'CPF inválido',
          description: 'Por favor, verifique o CPF digitado.',
          variant: 'destructive',
        })
        return
      }
    } else {
      if (!companyName || !cnpj) {
        toast({
          title: 'Campos obrigatórios',
          description: 'Razão Social e CNPJ são obrigatórios para Pessoa Jurídica.',
          variant: 'destructive',
        })
        return
      }

      // Validar CNPJ
      if (!validateCNPJ(cnpj)) {
        toast({
          title: 'CNPJ inválido',
          description: 'Por favor, verifique o CNPJ digitado.',
          variant: 'destructive',
        })
        return
      }
    }

    // Validar email se preenchido
    if (email && !validateEmail(email)) {
      toast({
        title: 'Email inválido',
        description: 'Por favor, verifique o email digitado.',
        variant: 'destructive',
      })
      return
    }

    // Validar telefones se preenchidos
    if (phone && !validatePhone(phone)) {
      toast({
        title: 'Telefone inválido',
        description: 'Por favor, verifique o telefone digitado.',
        variant: 'destructive',
      })
      return
    }

    if (mobile && !validatePhone(mobile)) {
      toast({
        title: 'Celular inválido',
        description: 'Por favor, verifique o celular digitado.',
        variant: 'destructive',
      })
      return
    }

    // Validar CEP se preenchido
    if (zipCode && !validateCEP(zipCode)) {
      toast({
        title: 'CEP inválido',
        description: 'Por favor, verifique o CEP digitado.',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)

      const data: CreateCustomerRequest = {
        personType,
        email: email || undefined,
        phone: phone ? removeMask(phone) : undefined,
        mobile: mobile ? removeMask(mobile) : undefined,
        website: website || undefined,
        creditLimit: creditLimit ? parseFloat(creditLimit) : undefined,
        active,
        notes: notes || undefined,
      }

      // Dados específicos Pessoa Física
      if (personType === 'FISICA') {
        data.name = name
        data.cpf = removeMask(cpf)
        data.rg = rg || undefined
        data.rgIssuer = rgIssuer || undefined
        data.rgState = rgState || undefined
        data.birthDate = birthDate || undefined
        data.gender = gender
        data.maritalStatus = maritalStatus
        data.motherName = motherName || undefined
        data.profession = profession || undefined
        data.nationality = nationality || undefined
      }

      // Dados específicos Pessoa Jurídica
      if (personType === 'JURIDICA') {
        data.companyName = companyName
        data.tradeName = tradeName || undefined
        data.cnpj = removeMask(cnpj)
        data.stateRegistration = stateRegistration || undefined
        data.stateRegistrationExempt = stateRegistrationExempt
        data.cnae = cnae ? removeMask(cnae) : undefined
        data.taxRegime = taxRegime
        data.responsibleName = responsibleName || undefined
        data.responsibleCpf = responsibleCpf ? removeMask(responsibleCpf) : undefined
        data.responsibleEmail = responsibleEmail || undefined
        data.responsiblePhone = responsiblePhone ? removeMask(responsiblePhone) : undefined
      }

      // Adicionar endereço se preenchido
      if (zipCode && street && number && neighborhood && city && state) {
        data.addresses = [
          {
            type: 'MAIN',
            zipCode: removeMask(zipCode),
            street,
            number,
            complement: complement || undefined,
            neighborhood,
            city,
            state,
            ibgeCode: ibgeCode || undefined,
          },
        ]
      }

      await customersApi.create(data)

      toast({
        title: 'Cliente criado com sucesso!',
        description: 'O cliente foi cadastrado no sistema.',
      })

      router.push('/dashboard/clientes')
    } catch (error: any) {
      toast({
        title: 'Erro ao criar cliente',
        description: error.response?.data?.message || 'Não foi possível criar o cliente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Novo Cliente</h1>
            <p className="text-muted-foreground">
              Cadastre um novo cliente no sistema
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Pessoa */}
          <Card>
            <CardHeader>
              <CardTitle>Tipo de Pessoa</CardTitle>
              <CardDescription>
                Selecione se o cliente é Pessoa Física ou Jurídica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPersonType('FISICA')}
                  className={`flex items-center gap-4 p-4 border rounded-lg transition-colors ${
                    personType === 'FISICA'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <User className="h-8 w-8" />
                  <div className="text-left">
                    <div className="font-semibold">Pessoa Física</div>
                    <div className="text-sm text-muted-foreground">CPF</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPersonType('JURIDICA')}
                  className={`flex items-center gap-4 p-4 border rounded-lg transition-colors ${
                    personType === 'JURIDICA'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Building2 className="h-8 w-8" />
                  <div className="text-left">
                    <div className="font-semibold">Pessoa Jurídica</div>
                    <div className="text-sm text-muted-foreground">CNPJ</div>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="dados" className="space-y-4">
            <TabsList>
              <TabsTrigger value="dados">Dados Principais</TabsTrigger>
              <TabsTrigger value="endereco">Endereço</TabsTrigger>
              <TabsTrigger value="contato">Contato</TabsTrigger>
            </TabsList>

            {/* Dados Principais */}
            <TabsContent value="dados">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Principais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {personType === 'FISICA' ? (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome Completo *</Label>
                          <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Digite o nome completo"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cpf">CPF *</Label>
                          <Input
                            id="cpf"
                            value={cpf}
                            onChange={(e) => handleCPFChange(e.target.value)}
                            placeholder="000.000.000-00"
                            maxLength={14}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="rg">RG</Label>
                          <Input
                            id="rg"
                            value={rg}
                            onChange={(e) => setRg(e.target.value)}
                            placeholder="Digite o RG"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="rgIssuer">Órgão Emissor</Label>
                          <Input
                            id="rgIssuer"
                            value={rgIssuer}
                            onChange={(e) => setRgIssuer(e.target.value)}
                            placeholder="Ex: SSP"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="rgState">UF do RG</Label>
                          <Input
                            id="rgState"
                            value={rgState}
                            onChange={(e) => setRgState(e.target.value)}
                            placeholder="Ex: SP"
                            maxLength={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="birthDate">Data de Nascimento</Label>
                          <Input
                            id="birthDate"
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gender">Gênero</Label>
                          <Select value={gender} onValueChange={(value: Gender) => setGender(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MALE">Masculino</SelectItem>
                              <SelectItem value="FEMALE">Feminino</SelectItem>
                              <SelectItem value="OTHER">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="maritalStatus">Estado Civil</Label>
                          <Select
                            value={maritalStatus}
                            onValueChange={(value: MaritalStatus) => setMaritalStatus(value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SINGLE">Solteiro(a)</SelectItem>
                              <SelectItem value="MARRIED">Casado(a)</SelectItem>
                              <SelectItem value="DIVORCED">Divorciado(a)</SelectItem>
                              <SelectItem value="WIDOWED">Viúvo(a)</SelectItem>
                              <SelectItem value="OTHER">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="motherName">Nome da Mãe</Label>
                          <Input
                            id="motherName"
                            value={motherName}
                            onChange={(e) => setMotherName(e.target.value)}
                            placeholder="Nome completo da mãe"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="profession">Profissão</Label>
                          <Input
                            id="profession"
                            value={profession}
                            onChange={(e) => setProfession(e.target.value)}
                            placeholder="Profissão"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="nationality">Nacionalidade</Label>
                          <Input
                            id="nationality"
                            value={nationality}
                            onChange={(e) => setNationality(e.target.value)}
                            placeholder="Nacionalidade"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="companyName">Razão Social *</Label>
                          <Input
                            id="companyName"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Digite a razão social"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tradeName">Nome Fantasia</Label>
                          <Input
                            id="tradeName"
                            value={tradeName}
                            onChange={(e) => setTradeName(e.target.value)}
                            placeholder="Digite o nome fantasia"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cnpj">CNPJ *</Label>
                          <Input
                            id="cnpj"
                            value={cnpj}
                            onChange={(e) => handleCNPJChange(e.target.value)}
                            placeholder="00.000.000/0000-00"
                            maxLength={18}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="stateRegistration">Inscrição Estadual</Label>
                          <Input
                            id="stateRegistration"
                            value={stateRegistration}
                            onChange={(e) => setStateRegistration(e.target.value)}
                            placeholder="Digite a IE"
                            disabled={stateRegistrationExempt}
                          />
                          <p className="text-xs text-muted-foreground">
                            Obrigatório para emissão de NF-e se não for isento. Influencia no cálculo do ICMS.
                          </p>
                        </div>

                        <div className="space-y-2 flex items-end">
                          <div className="flex items-center space-x-2 h-10">
                            <Switch 
                              id="stateRegistrationExempt" 
                              checked={stateRegistrationExempt} 
                              onCheckedChange={setStateRegistrationExempt} 
                            />
                            <Label htmlFor="stateRegistrationExempt">Isento de IE</Label>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cnae">CNAE</Label>
                          <Input
                            id="cnae"
                            value={cnae}
                            onChange={(e) => handleCNAEChange(e.target.value)}
                            placeholder="0000-0/00"
                            maxLength={9}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="taxRegime">Regime Tributário</Label>
                          <Select
                            value={taxRegime}
                            onValueChange={(value: TaxRegime) => setTaxRegime(value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SIMPLES_NACIONAL">Simples Nacional</SelectItem>
                              <SelectItem value="LUCRO_PRESUMIDO">Lucro Presumido</SelectItem>
                              <SelectItem value="LUCRO_REAL">Lucro Real</SelectItem>
                              <SelectItem value="MEI">MEI</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Dados do Responsável */}
                      <div className="border-t pt-6">
                        <h4 className="text-sm font-semibold mb-4">Dados do Responsável (Opcional)</h4>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="responsibleName">Nome do Responsável</Label>
                            <Input
                              id="responsibleName"
                              value={responsibleName}
                              onChange={(e) => setResponsibleName(e.target.value)}
                              placeholder="Nome completo"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="responsibleCpf">CPF do Responsável</Label>
                            <Input
                              id="responsibleCpf"
                              value={responsibleCpf}
                              onChange={(e) => handleResponsibleCPFChange(e.target.value)}
                              placeholder="000.000.000-00"
                              maxLength={14}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="responsibleEmail">Email do Responsável</Label>
                            <Input
                              id="responsibleEmail"
                              type="email"
                              value={responsibleEmail}
                              onChange={(e) => setResponsibleEmail(e.target.value)}
                              placeholder="email@exemplo.com"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="responsiblePhone">Telefone do Responsável</Label>
                            <Input
                              id="responsiblePhone"
                              value={responsiblePhone}
                              onChange={(e) => handleResponsiblePhoneChange(e.target.value)}
                              placeholder="(00) 00000-0000"
                              maxLength={15}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Informações Adicionais */}
                  <div className="border-t pt-6">
                    <h4 className="text-sm font-semibold mb-4">Informações Adicionais</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="https://exemplo.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="creditLimit">Limite de Crédito (R$)</Label>
                        <Input
                          id="creditLimit"
                          type="number"
                          step="0.01"
                          min="0"
                          value={creditLimit}
                          onChange={(e) => setCreditLimit(e.target.value)}
                          placeholder="0,00"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="notes">Observações</Label>
                        <Textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Observações adicionais"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 border-t pt-4">
                    <Switch id="active" checked={active} onCheckedChange={setActive} />
                    <Label htmlFor="active">Cliente Ativo</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Endereço */}
            <TabsContent value="endereco">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Endereço Principal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">CEP</Label>
                      <Input
                        id="zipCode"
                        value={zipCode}
                        onChange={(e) => handleCEPChange(e.target.value)}
                        placeholder="00000-000"
                        maxLength={9}
                        disabled={loadingCEP}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="street">Logradouro</Label>
                      <Input
                        id="street"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="Rua, Avenida, etc."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="number">Número</Label>
                      <Input
                        id="number"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        placeholder="Nº"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="complement">Complemento</Label>
                      <Input
                        id="complement"
                        value={complement}
                        onChange={(e) => setComplement(e.target.value)}
                        placeholder="Apto, Sala, etc."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="neighborhood">Bairro</Label>
                      <Input
                        id="neighborhood"
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        placeholder="Bairro"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Cidade"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="UF"
                        maxLength={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ibgeCode">Código IBGE</Label>
                      <Input
                        id="ibgeCode"
                        value={ibgeCode}
                        onChange={(e) => setIbgeCode(e.target.value)}
                        placeholder="3550308"
                        maxLength={7}
                        disabled={loadingCEP}
                      />
                      <p className="text-xs text-muted-foreground">
                        Preenchido automaticamente ao buscar CEP. Necessário para emissão de NF-e.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contato */}
            <TabsContent value="contato">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Informações de Contato
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@exemplo.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mobile" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Celular
                      </Label>
                      <Input
                        id="mobile"
                        value={mobile}
                        onChange={(e) => handleMobileChange(e.target.value)}
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Telefone Fixo
                      </Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="(00) 0000-0000"
                        maxLength={15}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Ações */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Cliente'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
