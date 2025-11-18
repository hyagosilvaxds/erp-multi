'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useToast } from '@/hooks/use-toast'
import {
  employeesApi,
  type Gender,
  type MaritalStatus,
  type ContractType,
  type AccountType,
  type WorkSchedule,
  type DaySchedule,
} from '@/lib/api/employees'
import { costCentersApi, type CostCenter } from '@/lib/api/cost-centers'
import { positionsApi, type Position } from '@/lib/api/positions'
import { departmentsApi, type Department } from '@/lib/api/departments'
import {
  maskCPF,
  maskCNPJ,
  maskPhone,
  maskCEP,
  validateCPF,
  validateCNPJ,
  validateEmail,
  removeMask,
  searchCEP,
} from '@/lib/masks'

export default function NovoColaboradorPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [loadingCEP, setLoadingCEP] = useState(false)
  const [costCenters, setCostCenters] = useState<CostCenter[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [departments, setDepartments] = useState<Department[]>([])

  // Dados Pessoais
  const [name, setName] = useState('')
  const [cpf, setCpf] = useState('')
  const [rg, setRg] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [gender, setGender] = useState<Gender | ''>('')
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus | ''>('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [mobile, setMobile] = useState('')

  // Endereço
  const [zipCode, setZipCode] = useState('')
  const [street, setStreet] = useState('')
  const [number, setNumber] = useState('')
  const [complement, setComplement] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')

  // Dados Profissionais
  const [costCenterId, setCostCenterId] = useState('')
  const [positionId, setPositionId] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [admissionDate, setAdmissionDate] = useState('')
  const [contractType, setContractType] = useState<ContractType | ''>('')
  const [workSchedule, setWorkSchedule] = useState<WorkSchedule>({
    monday: { isWorkDay: true, startTime: '08:00', endTime: '18:00', breakStartTime: '12:00', breakEndTime: '13:00' },
    tuesday: { isWorkDay: true, startTime: '08:00', endTime: '18:00', breakStartTime: '12:00', breakEndTime: '13:00' },
    wednesday: { isWorkDay: true, startTime: '08:00', endTime: '18:00', breakStartTime: '12:00', breakEndTime: '13:00' },
    thursday: { isWorkDay: true, startTime: '08:00', endTime: '18:00', breakStartTime: '12:00', breakEndTime: '13:00' },
    friday: { isWorkDay: true, startTime: '08:00', endTime: '18:00', breakStartTime: '12:00', breakEndTime: '13:00' },
    saturday: { isWorkDay: false },
    sunday: { isWorkDay: false },
    weeklyHours: 44,
    generalNotes: '',
  })
  const [salary, setSalary] = useState('')

  // Dados Bancários
  const [bankCode, setBankCode] = useState('')
  const [bankName, setBankName] = useState('')
  const [agency, setAgency] = useState('')
  const [account, setAccount] = useState('')
  const [accountType, setAccountType] = useState<AccountType | ''>('')
  const [pixKey, setPixKey] = useState('')

  // Dados da Empresa (PJ)
  const [companyDocument, setCompanyDocument] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyTradeName, setCompanyTradeName] = useState('')
  const [companyStateRegistration, setCompanyStateRegistration] = useState('')
  const [companyMunicipalRegistration, setCompanyMunicipalRegistration] = useState('')
  const [companyEmail, setCompanyEmail] = useState('')
  const [companyPhone, setCompanyPhone] = useState('')
  const [companyZipCode, setCompanyZipCode] = useState('')
  const [companyStreet, setCompanyStreet] = useState('')
  const [companyNumber, setCompanyNumber] = useState('')
  const [companyComplement, setCompanyComplement] = useState('')
  const [companyNeighborhood, setCompanyNeighborhood] = useState('')
  const [companyCity, setCompanyCity] = useState('')
  const [companyState, setCompanyState] = useState('')

  // Outros
  const [notes, setNotes] = useState('')

  useEffect(() => {
    loadCostCenters()
    loadPositions()
    loadDepartments()
  }, [])

  const loadCostCenters = async () => {
    try {
      const centers = await costCentersApi.getAll({ active: true, limit: 1000 })
      setCostCenters(centers)
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar centros de custo',
        description: error.response?.data?.message || 'Não foi possível carregar os centros de custo.',
        variant: 'destructive',
      })
    }
  }

  const loadPositions = async () => {
    try {
      const data = await positionsApi.getAll({ active: true })
      setPositions(data)
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar cargos',
        description: error.response?.data?.message || 'Não foi possível carregar os cargos.',
        variant: 'destructive',
      })
    }
  }

  const loadDepartments = async () => {
    try {
      const data = await departmentsApi.getAll({ active: true })
      setDepartments(data)
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar departamentos',
        description: error.response?.data?.message || 'Não foi possível carregar os departamentos.',
        variant: 'destructive',
      })
    }
  }

  const handleCPFChange = (value: string) => {
    setCpf(maskCPF(value))
  }

  const handleCompanyDocumentChange = (value: string) => {
    setCompanyDocument(maskCNPJ(value))
  }

  const handlePhoneChange = (value: string) => {
    setPhone(maskPhone(value))
  }

  const handleMobileChange = (value: string) => {
    setMobile(maskPhone(value))
  }

  const handleCompanyPhoneChange = (value: string) => {
    setCompanyPhone(maskPhone(value))
  }

  const handleCEPChange = async (value: string) => {
    const maskedValue = maskCEP(value)
    setZipCode(maskedValue)

    const cleanCEP = removeMask(maskedValue)
    if (cleanCEP.length === 8) {
      setLoadingCEP(true)
      try {
        const address = await searchCEP(cleanCEP)
        if (address) {
          setStreet(address.logradouro)
          setNeighborhood(address.bairro)
          setCity(address.localidade)
          setState(address.uf)
          toast({
            title: 'CEP encontrado',
            description: 'Endereço preenchido automaticamente.',
          })
        } else {
          toast({
            title: 'CEP não encontrado',
            description: 'Preencha o endereço manualmente.',
            variant: 'destructive',
          })
        }
      } catch (error) {
        toast({
          title: 'Erro ao buscar CEP',
          description: 'Não foi possível buscar o endereço.',
          variant: 'destructive',
        })
      } finally {
        setLoadingCEP(false)
      }
    }
  }

  const handleCompanyCEPChange = async (value: string) => {
    const maskedValue = maskCEP(value)
    setCompanyZipCode(maskedValue)

    const cleanCEP = removeMask(maskedValue)
    if (cleanCEP.length === 8) {
      setLoadingCEP(true)
      try {
        const address = await searchCEP(cleanCEP)
        if (address) {
          setCompanyStreet(address.logradouro)
          setCompanyNeighborhood(address.bairro)
          setCompanyCity(address.localidade)
          setCompanyState(address.uf)
          toast({
            title: 'CEP da empresa encontrado',
            description: 'Endereço da empresa preenchido automaticamente.',
          })
        } else {
          toast({
            title: 'CEP não encontrado',
            description: 'Preencha o endereço manualmente.',
            variant: 'destructive',
          })
        }
      } catch (error) {
        toast({
          title: 'Erro ao buscar CEP',
          description: 'Não foi possível buscar o endereço.',
          variant: 'destructive',
        })
      } finally {
        setLoadingCEP(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validações
    if (!name || !cpf || !positionId || !departmentId || !admissionDate || !contractType || !salary || !costCenterId) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      })
      return
    }

    if (!validateCPF(removeMask(cpf))) {
      toast({
        title: 'CPF inválido',
        description: 'Por favor, verifique o CPF informado.',
        variant: 'destructive',
      })
      return
    }

    if (email && !validateEmail(email)) {
      toast({
        title: 'E-mail inválido',
        description: 'Por favor, verifique o e-mail informado.',
        variant: 'destructive',
      })
      return
    }

    // Validação específica para PJ
    if (contractType === 'PJ') {
      if (!companyDocument || !companyName) {
        toast({
          title: 'Dados da empresa obrigatórios',
          description: 'Para colaboradores PJ, informe o CNPJ e Nome da Empresa.',
          variant: 'destructive',
        })
        return
      }

      if (!validateCNPJ(removeMask(companyDocument))) {
        toast({
          title: 'CNPJ inválido',
          description: 'Por favor, verifique o CNPJ da empresa informado.',
          variant: 'destructive',
        })
        return
      }

      if (companyEmail && !validateEmail(companyEmail)) {
        toast({
          title: 'E-mail da empresa inválido',
          description: 'Por favor, verifique o e-mail da empresa informado.',
          variant: 'destructive',
        })
        return
      }
    }

    try {
      setLoading(true)

      const data = {
        costCenterId,
        positionId,
        departmentId,
        name,
        cpf: removeMask(cpf),
        rg: rg || undefined,
        birthDate: birthDate || undefined,
        gender: gender || undefined,
        maritalStatus: maritalStatus || undefined,
        email: email || undefined,
        phone: phone ? removeMask(phone) : undefined,
        mobile: mobile ? removeMask(mobile) : undefined,
        zipCode: zipCode ? removeMask(zipCode) : undefined,
        street: street || undefined,
        number: number || undefined,
        complement: complement || undefined,
        neighborhood: neighborhood || undefined,
        city: city || undefined,
        state: state || undefined,
        admissionDate,
        contractType: contractType as ContractType,
        workSchedule,
        salary: parseFloat(salary),
        bankCode: bankCode || undefined,
        bankName: bankName || undefined,
        agency: agency || undefined,
        account: account || undefined,
        accountType: accountType || undefined,
        pixKey: pixKey || undefined,
        // Dados da Empresa (PJ)
        companyDocument: companyDocument ? removeMask(companyDocument) : undefined,
        companyName: companyName || undefined,
        companyTradeName: companyTradeName || undefined,
        companyStateRegistration: companyStateRegistration || undefined,
        companyMunicipalRegistration: companyMunicipalRegistration || undefined,
        companyEmail: companyEmail || undefined,
        companyPhone: companyPhone ? removeMask(companyPhone) : undefined,
        companyZipCode: companyZipCode ? removeMask(companyZipCode) : undefined,
        companyStreet: companyStreet || undefined,
        companyNumber: companyNumber || undefined,
        companyComplement: companyComplement || undefined,
        companyNeighborhood: companyNeighborhood || undefined,
        companyCity: companyCity || undefined,
        companyState: companyState || undefined,
        notes: notes || undefined,
      }

      await employeesApi.create(data)

      toast({
        title: 'Colaborador cadastrado',
        description: 'O colaborador foi cadastrado com sucesso.',
      })

      router.push('/dashboard/rh/colaboradores')
    } catch (error: any) {
      toast({
        title: 'Erro ao cadastrar colaborador',
        description: error.response?.data?.message || 'Não foi possível cadastrar o colaborador.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout userRole="company">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="icon" type="button">
                <Link href="/dashboard/rh/colaboradores">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Novo Colaborador</h1>
                <p className="text-muted-foreground">Cadastrar novo colaborador</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild type="button">
                <Link href="/dashboard/rh/colaboradores">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Salvando...' : 'Salvar Colaborador'}
              </Button>
            </div>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Colaborador</CardTitle>
              <CardDescription>Preencha os dados do novo colaborador</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pessoais" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="pessoais">Dados Pessoais</TabsTrigger>
                  <TabsTrigger value="endereco">Endereço</TabsTrigger>
                  <TabsTrigger value="profissionais">Dados Profissionais</TabsTrigger>
                  <TabsTrigger value="bancarios">Dados Bancários</TabsTrigger>
                  <TabsTrigger value="empresa" disabled={contractType !== 'PJ'}>
                    Dados da Empresa {contractType === 'PJ' && '*'}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pessoais" className="space-y-4">
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
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Selecione" />
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
                      <Select value={maritalStatus} onValueChange={(value: MaritalStatus) => setMaritalStatus(value)}>
                        <SelectTrigger id="maritalStatus">
                          <SelectValue placeholder="Selecione" />
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
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="(00) 0000-0000"
                        maxLength={15}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobile">Celular</Label>
                      <Input
                        id="mobile"
                        value={mobile}
                        onChange={(e) => handleMobileChange(e.target.value)}
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="endereco" className="space-y-4">
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
                        placeholder="Digite o endereço"
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
                    <div className="space-y-2">
                      <Label htmlFor="complement">Complemento</Label>
                      <Input
                        id="complement"
                        value={complement}
                        onChange={(e) => setComplement(e.target.value)}
                        placeholder="Apto, sala, etc"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="neighborhood">Bairro</Label>
                      <Input
                        id="neighborhood"
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        placeholder="Digite o bairro"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Digite a cidade"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value.toUpperCase())}
                        placeholder="UF"
                        maxLength={2}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="profissionais" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="costCenterId">Centro de Custo *</Label>
                      <Select value={costCenterId} onValueChange={setCostCenterId} required>
                        <SelectTrigger id="costCenterId">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {costCenters
                            .filter(cc => cc.ativo)
                            .map((cc) => (
                              <SelectItem key={cc.id} value={cc.id}>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs">{cc.codigo}</span>
                                  <span>{cc.nome}</span>
                                  {cc.nivel > 1 && (
                                    <span className="text-xs text-muted-foreground">
                                      (Nível {cc.nivel})
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="positionId">Cargo *</Label>
                      <Select value={positionId} onValueChange={setPositionId} required>
                        <SelectTrigger id="positionId">
                          <SelectValue placeholder="Selecione o cargo" />
                        </SelectTrigger>
                        <SelectContent>
                          {positions.map((pos) => (
                            <SelectItem key={pos.id} value={pos.id}>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs">{pos.code}</span>
                                <span>{pos.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="departmentId">Departamento *</Label>
                      <Select value={departmentId} onValueChange={setDepartmentId} required>
                        <SelectTrigger id="departmentId">
                          <SelectValue placeholder="Selecione o departamento" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs">{dept.code}</span>
                                <span>{dept.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admissionDate">Data de Admissão *</Label>
                      <Input
                        id="admissionDate"
                        type="date"
                        value={admissionDate}
                        onChange={(e) => setAdmissionDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contractType">Tipo de Contrato *</Label>
                      <Select value={contractType} onValueChange={(value: ContractType) => setContractType(value)} required>
                        <SelectTrigger id="contractType">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CLT">CLT</SelectItem>
                          <SelectItem value="PJ">PJ</SelectItem>
                          <SelectItem value="ESTAGIO">Estágio</SelectItem>
                          <SelectItem value="TEMPORARIO">Temporário</SelectItem>
                          <SelectItem value="AUTONOMO">Autônomo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="salary">Salário *</Label>
                      <Input
                        id="salary"
                        type="number"
                        step="0.01"
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  {/* Horário de Trabalho */}
                  <div className="space-y-4 mt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Horário de Trabalho</h3>
                        <p className="text-sm text-muted-foreground">
                          Configure o horário de trabalho semanal do colaborador
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 rounded-lg border p-4">
                      {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => {
                        const dayNames = {
                          monday: 'Segunda-feira',
                          tuesday: 'Terça-feira',
                          wednesday: 'Quarta-feira',
                          thursday: 'Quinta-feira',
                          friday: 'Sexta-feira',
                          saturday: 'Sábado',
                          sunday: 'Domingo',
                        }
                        
                        const daySchedule = workSchedule[day]
                        
                        return (
                          <div key={day} className="flex flex-col gap-3 p-3 rounded-md border bg-muted/30">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                id={`${day}-isWorkDay`}
                                checked={daySchedule.isWorkDay}
                                onChange={(e) => {
                                  setWorkSchedule({
                                    ...workSchedule,
                                    [day]: {
                                      ...daySchedule,
                                      isWorkDay: e.target.checked,
                                      startTime: e.target.checked ? '08:00' : undefined,
                                      endTime: e.target.checked ? '18:00' : undefined,
                                      breakStartTime: e.target.checked ? '12:00' : undefined,
                                      breakEndTime: e.target.checked ? '13:00' : undefined,
                                    }
                                  })
                                }}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                              <Label htmlFor={`${day}-isWorkDay`} className="font-medium cursor-pointer">
                                {dayNames[day]}
                              </Label>
                            </div>
                            
                            {daySchedule.isWorkDay && (
                              <div className="grid gap-3 md:grid-cols-4 pl-7">
                                <div className="space-y-1">
                                  <Label htmlFor={`${day}-start`} className="text-xs">Entrada</Label>
                                  <Input
                                    id={`${day}-start`}
                                    type="time"
                                    value={daySchedule.startTime || ''}
                                    onChange={(e) => {
                                      setWorkSchedule({
                                        ...workSchedule,
                                        [day]: { ...daySchedule, startTime: e.target.value }
                                      })
                                    }}
                                    className="h-9"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor={`${day}-end`} className="text-xs">Saída</Label>
                                  <Input
                                    id={`${day}-end`}
                                    type="time"
                                    value={daySchedule.endTime || ''}
                                    onChange={(e) => {
                                      setWorkSchedule({
                                        ...workSchedule,
                                        [day]: { ...daySchedule, endTime: e.target.value }
                                      })
                                    }}
                                    className="h-9"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor={`${day}-break-start`} className="text-xs">Início Intervalo</Label>
                                  <Input
                                    id={`${day}-break-start`}
                                    type="time"
                                    value={daySchedule.breakStartTime || ''}
                                    onChange={(e) => {
                                      setWorkSchedule({
                                        ...workSchedule,
                                        [day]: { ...daySchedule, breakStartTime: e.target.value }
                                      })
                                    }}
                                    className="h-9"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor={`${day}-break-end`} className="text-xs">Fim Intervalo</Label>
                                  <Input
                                    id={`${day}-break-end`}
                                    type="time"
                                    value={daySchedule.breakEndTime || ''}
                                    onChange={(e) => {
                                      setWorkSchedule({
                                        ...workSchedule,
                                        [day]: { ...daySchedule, breakEndTime: e.target.value }
                                      })
                                    }}
                                    className="h-9"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}

                      <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
                        <div className="space-y-2">
                          <Label htmlFor="weeklyHours">Carga Horária Semanal</Label>
                          <Input
                            id="weeklyHours"
                            type="number"
                            step="0.5"
                            value={workSchedule.weeklyHours}
                            onChange={(e) => {
                              setWorkSchedule({
                                ...workSchedule,
                                weeklyHours: parseFloat(e.target.value) || 0
                              })
                            }}
                            placeholder="44"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="generalNotes">Observações Gerais</Label>
                          <Input
                            id="generalNotes"
                            value={workSchedule.generalNotes || ''}
                            onChange={(e) => {
                              setWorkSchedule({
                                ...workSchedule,
                                generalNotes: e.target.value
                              })
                            }}
                            placeholder="Ex: Jornada comercial padrão"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="bancarios" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="bankCode">Código do Banco</Label>
                      <Input
                        id="bankCode"
                        value={bankCode}
                        onChange={(e) => setBankCode(e.target.value)}
                        placeholder="Ex: 001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Nome do Banco</Label>
                      <Input
                        id="bankName"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="Ex: Banco do Brasil"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agency">Agência</Label>
                      <Input
                        id="agency"
                        value={agency}
                        onChange={(e) => setAgency(e.target.value)}
                        placeholder="Digite a agência"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account">Conta</Label>
                      <Input
                        id="account"
                        value={account}
                        onChange={(e) => setAccount(e.target.value)}
                        placeholder="Digite a conta"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountType">Tipo de Conta</Label>
                      <Select value={accountType} onValueChange={(value: AccountType) => setAccountType(value)}>
                        <SelectTrigger id="accountType">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CORRENTE">Corrente</SelectItem>
                          <SelectItem value="POUPANCA">Poupança</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pixKey">Chave PIX</Label>
                      <Input
                        id="pixKey"
                        value={pixKey}
                        onChange={(e) => setPixKey(e.target.value)}
                        placeholder="CPF, e-mail, celular, etc"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="empresa" className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Preencha os dados da empresa para colaboradores com tipo de contrato <strong>PJ (Pessoa Jurídica)</strong>.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="companyDocument">CNPJ da Empresa *</Label>
                      <Input
                        id="companyDocument"
                        value={companyDocument}
                        onChange={(e) => handleCompanyDocumentChange(e.target.value)}
                        placeholder="00.000.000/0000-00"
                        maxLength={18}
                        required={contractType === 'PJ'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Razão Social *</Label>
                      <Input
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Digite a razão social"
                        required={contractType === 'PJ'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyTradeName">Nome Fantasia</Label>
                      <Input
                        id="companyTradeName"
                        value={companyTradeName}
                        onChange={(e) => setCompanyTradeName(e.target.value)}
                        placeholder="Digite o nome fantasia"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyStateRegistration">Inscrição Estadual</Label>
                      <Input
                        id="companyStateRegistration"
                        value={companyStateRegistration}
                        onChange={(e) => setCompanyStateRegistration(e.target.value)}
                        placeholder="Digite a IE"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyMunicipalRegistration">Inscrição Municipal</Label>
                      <Input
                        id="companyMunicipalRegistration"
                        value={companyMunicipalRegistration}
                        onChange={(e) => setCompanyMunicipalRegistration(e.target.value)}
                        placeholder="Digite a IM"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyEmail">E-mail da Empresa</Label>
                      <Input
                        id="companyEmail"
                        type="email"
                        value={companyEmail}
                        onChange={(e) => setCompanyEmail(e.target.value)}
                        placeholder="contato@empresa.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyPhone">Telefone da Empresa</Label>
                      <Input
                        id="companyPhone"
                        value={companyPhone}
                        onChange={(e) => handleCompanyPhoneChange(e.target.value)}
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-lg font-semibold mb-4">Endereço da Empresa</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="companyZipCode">CEP</Label>
                        <Input
                          id="companyZipCode"
                          value={companyZipCode}
                          onChange={(e) => handleCompanyCEPChange(e.target.value)}
                          placeholder="00000-000"
                          maxLength={9}
                          disabled={loadingCEP}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyStreet">Logradouro</Label>
                        <Input
                          id="companyStreet"
                          value={companyStreet}
                          onChange={(e) => setCompanyStreet(e.target.value)}
                          placeholder="Digite o logradouro"
                          disabled={loadingCEP}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyNumber">Número</Label>
                        <Input
                          id="companyNumber"
                          value={companyNumber}
                          onChange={(e) => setCompanyNumber(e.target.value)}
                          placeholder="Digite o número"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyComplement">Complemento</Label>
                        <Input
                          id="companyComplement"
                          value={companyComplement}
                          onChange={(e) => setCompanyComplement(e.target.value)}
                          placeholder="Sala, andar, etc"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyNeighborhood">Bairro</Label>
                        <Input
                          id="companyNeighborhood"
                          value={companyNeighborhood}
                          onChange={(e) => setCompanyNeighborhood(e.target.value)}
                          placeholder="Digite o bairro"
                          disabled={loadingCEP}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyCity">Cidade</Label>
                        <Input
                          id="companyCity"
                          value={companyCity}
                          onChange={(e) => setCompanyCity(e.target.value)}
                          placeholder="Digite a cidade"
                          disabled={loadingCEP}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyState">Estado</Label>
                        <Input
                          id="companyState"
                          value={companyState}
                          onChange={(e) => setCompanyState(e.target.value)}
                          placeholder="UF"
                          maxLength={2}
                          disabled={loadingCEP}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="space-y-2 mt-6">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Informações adicionais sobre o colaborador"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </DashboardLayout>
  )
}
