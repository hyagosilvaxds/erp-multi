'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Building2, MapPin, FileText, Settings, Shield, Plus, X } from 'lucide-react'
import Link from 'next/link'
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
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { adminApi } from '@/lib/api/auth'
import { useAddressLookup } from '@/lib/hooks/useAddressLookup'
import {
  maskCNPJ,
  maskCEP,
  maskPhone,
  removeMask,
} from '@/lib/masks'
import { validateCNPJ } from '@/lib/validations/nfe-validations'

type RegimeTributario = 'SIMPLES_NACIONAL' | 'SIMPLES_NACIONAL_EXCESSO' | 'REGIME_NORMAL'
type AmbienteFiscal = 'HOMOLOGACAO' | 'PRODUCAO'

// Função para formatar CNAE (apenas visual)
const formatCNAE = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 7)
  if (numbers.length <= 4) return numbers
  if (numbers.length <= 5) return `${numbers.slice(0, 4)}-${numbers.slice(4)}`
  return `${numbers.slice(0, 4)}-${numbers.slice(4, 5)}/${numbers.slice(5)}`
}

// Função para remover formatação do CNAE
const unformatCNAE = (value: string): string => {
  return value.replace(/\D/g, '').slice(0, 7)
}

export default function NovaEmpresaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { loading: loadingCEP, fetchCompleteAddress } = useAddressLookup()
  const [loading, setLoading] = useState(false)

  // Dados Básicos
  const [razaoSocial, setRazaoSocial] = useState('')
  const [nomeFantasia, setNomeFantasia] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [cnpjError, setCnpjError] = useState('')
  const [inscricaoEstadual, setInscricaoEstadual] = useState('')
  const [cnaePrincipal, setCnaePrincipal] = useState('')
  const [cnaeSecundarios, setCnaeSecundarios] = useState<string[]>([])
  const [newCnaeSecundario, setNewCnaeSecundario] = useState('')
  const [regimeTributario, setRegimeTributario] = useState<RegimeTributario>('SIMPLES_NACIONAL')
  const [email, setEmail] = useState('')
  const [site, setSite] = useState('')

  // Endereço
  const [cep, setCep] = useState('')
  const [logradouro, setLogradouro] = useState('')
  const [numero, setNumero] = useState('')
  const [complemento, setComplemento] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [codigoMunicipioIBGE, setCodigoMunicipioIBGE] = useState('')

  // Contatos
  const [telefone, setTelefone] = useState('')
  const [celular, setCelular] = useState('')

  // Fiscal
  const [cfopPadrao, setCfopPadrao] = useState('5102')
  const [serieNFe, setSerieNFe] = useState('1')
  const [ambienteFiscal, setAmbienteFiscal] = useState<AmbienteFiscal>('HOMOLOGACAO')

  // Responsável Técnico
  const [respTecCNPJ, setRespTecCNPJ] = useState('')
  const [respTecContato, setRespTecContato] = useState('')
  const [respTecEmail, setRespTecEmail] = useState('')
  const [respTecFone, setRespTecFone] = useState('')

  // Status
  const [active, setActive] = useState(true)

  // Validação de CNPJ em tempo real
  const handleCNPJChange = (value: string) => {
    const masked = maskCNPJ(value)
    setCnpj(masked)
    
    const unmasked = removeMask(masked)
    if (unmasked.length === 14) {
      if (!validateCNPJ(unmasked)) {
        setCnpjError('CNPJ inválido')
      } else {
        setCnpjError('')
      }
    } else {
      setCnpjError('')
    }
  }

  // Adicionar CNAE secundário
  const handleAddCnaeSecundario = () => {
    const cleanCnae = unformatCNAE(newCnaeSecundario)
    
    if (cleanCnae.length !== 7) {
      toast({
        title: 'CNAE inválido',
        description: 'O CNAE deve ter exatamente 7 dígitos.',
        variant: 'destructive',
      })
      return
    }

    if (cleanCnae === unformatCNAE(cnaePrincipal)) {
      toast({
        title: 'CNAE duplicado',
        description: 'Este CNAE já está cadastrado como principal.',
        variant: 'destructive',
      })
      return
    }

    if (cnaeSecundarios.includes(cleanCnae)) {
      toast({
        title: 'CNAE duplicado',
        description: 'Este CNAE já está na lista de secundários.',
        variant: 'destructive',
      })
      return
    }

    setCnaeSecundarios([...cnaeSecundarios, cleanCnae])
    setNewCnaeSecundario('')
  }

  // Remover CNAE secundário
  const handleRemoveCnaeSecundario = (cnae: string) => {
    setCnaeSecundarios(cnaeSecundarios.filter(c => c !== cnae))
  }

  const handleCEPChange = async (value: string) => {
    const maskedValue = maskCEP(value)
    setCep(maskedValue)

    if (removeMask(maskedValue).length === 8) {
      const address = await fetchCompleteAddress(maskedValue)

      if (address) {
        setLogradouro(address.street)
        setBairro(address.neighborhood)
        setCidade(address.city)
        setEstado(address.state)
        setCodigoMunicipioIBGE(address.ibgeCode)

        toast({
          title: 'CEP encontrado!',
          description: 'Endereço preenchido automaticamente.',
        })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validações básicas
      if (!razaoSocial || !cnpj) {
        toast({
          title: 'Campos obrigatórios',
          description: 'Razão Social e CNPJ são obrigatórios.',
          variant: 'destructive',
        })
        return
      }

      // Validar CNPJ
      const cnpjUnmasked = removeMask(cnpj)
      if (!validateCNPJ(cnpjUnmasked)) {
        toast({
          title: 'CNPJ inválido',
          description: 'Por favor, verifique o CNPJ informado.',
          variant: 'destructive',
        })
        return
      }

      // Montar payload
      const payload: any = {
        razaoSocial,
        cnpj: cnpjUnmasked,
        regimeTributario,
        active,
      }

      // Campos opcionais
      if (nomeFantasia) payload.nomeFantasia = nomeFantasia
      if (inscricaoEstadual) payload.inscricaoEstadual = removeMask(inscricaoEstadual)
      if (cnaePrincipal) payload.cnaePrincipal = unformatCNAE(cnaePrincipal)
      if (cnaeSecundarios.length > 0) payload.cnaeSecundarios = cnaeSecundarios
      if (email) payload.email = email
      if (site) payload.site = site

      // Endereço
      if (cep) payload.cep = removeMask(cep)
      if (logradouro) payload.logradouro = logradouro
      if (numero) payload.numero = numero
      if (complemento) payload.complemento = complemento
      if (bairro) payload.bairro = bairro
      if (cidade) payload.cidade = cidade
      if (estado) payload.estado = estado
      if (codigoMunicipioIBGE) payload.codigoMunicipioIBGE = codigoMunicipioIBGE

      // Contatos
      if (telefone) payload.telefone = removeMask(telefone)
      if (celular) payload.celular = removeMask(celular)

      // Fiscal
      if (cfopPadrao) payload.cfopPadrao = cfopPadrao
      if (serieNFe) payload.serieNFe = serieNFe
      payload.ambienteFiscal = ambienteFiscal

      // Responsável Técnico
      if (respTecCNPJ) payload.respTecCNPJ = removeMask(respTecCNPJ)
      if (respTecContato) payload.respTecContato = respTecContato
      if (respTecEmail) payload.respTecEmail = respTecEmail
      if (respTecFone) payload.respTecFone = removeMask(respTecFone)

      const company = await adminApi.createCompany(payload)

      toast({
        title: 'Empresa criada com sucesso!',
        description: `${company.razaoSocial} foi cadastrada no sistema.`,
      })

      router.push(`/admin/empresas/${company.id}`)
    } catch (error: any) {
      console.error('Erro ao criar empresa:', error)
      toast({
        title: 'Erro ao criar empresa',
        description: error.response?.data?.message || error.message || 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout userRole="admin">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/empresas">
              <Button type="button" variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Nova Empresa</h1>
              <p className="text-muted-foreground">
                Cadastre uma nova empresa no sistema
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/empresas">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Empresa'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="dados-basicos" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dados-basicos">
              <Building2 className="h-4 w-4 mr-2" />
              Dados Básicos
            </TabsTrigger>
            <TabsTrigger value="endereco">
              <MapPin className="h-4 w-4 mr-2" />
              Endereço
            </TabsTrigger>
            <TabsTrigger value="fiscal">
              <FileText className="h-4 w-4 mr-2" />
              Dados Fiscais
            </TabsTrigger>
            <TabsTrigger value="responsavel-tecnico">
              <Shield className="h-4 w-4 mr-2" />
              Responsável Técnico
            </TabsTrigger>
            <TabsTrigger value="configuracoes">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Dados Básicos */}
          <TabsContent value="dados-basicos">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Empresa</CardTitle>
                <CardDescription>
                  Dados cadastrais básicos da empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="razaoSocial">
                      Razão Social <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="razaoSocial"
                      value={razaoSocial}
                      onChange={(e) => setRazaoSocial(e.target.value)}
                      placeholder="EMPRESA EXEMPLO LTDA"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Nome jurídico completo da empresa
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                    <Input
                      id="nomeFantasia"
                      value={nomeFantasia}
                      onChange={(e) => setNomeFantasia(e.target.value)}
                      placeholder="Empresa Exemplo"
                    />
                    <p className="text-xs text-muted-foreground">
                      Nome comercial da empresa
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cnpj">
                      CNPJ <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="cnpj"
                      value={cnpj}
                      onChange={(e) => handleCNPJChange(e.target.value)}
                      placeholder="00.000.000/0000-00"
                      maxLength={18}
                      required
                      className={cnpjError ? 'border-red-500' : ''}
                    />
                    {cnpjError && (
                      <p className="text-xs text-red-500">{cnpjError}</p>
                    )}
                    {!cnpjError && cnpj && removeMask(cnpj).length === 14 && (
                      <p className="text-xs text-green-600">✓ CNPJ válido</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
                    <Input
                      id="inscricaoEstadual"
                      value={inscricaoEstadual}
                      onChange={(e) => setInscricaoEstadual(e.target.value)}
                      placeholder="123456789 ou ISENTO"
                    />
                    <p className="text-xs text-muted-foreground">
                      Obrigatório para emissão de NF-e. Digite "ISENTO" se aplicável.
                    </p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="cnaePrincipal">
                      CNAE Principal <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="cnaePrincipal"
                      value={cnaePrincipal}
                      onChange={(e) => setCnaePrincipal(formatCNAE(e.target.value))}
                      placeholder="4712-1/00 (7 dígitos)"
                      maxLength={10}
                    />
                    <p className="text-xs text-muted-foreground">
                      Código da atividade econômica principal (formato: 0000-0/00)
                    </p>
                  </div>

                  {/* CNAEs Secundários */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="cnaeSecundario">CNAEs Secundários (Opcional)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="cnaeSecundario"
                        value={newCnaeSecundario}
                        onChange={(e) => setNewCnaeSecundario(formatCNAE(e.target.value))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddCnaeSecundario()
                          }
                        }}
                        placeholder="0000-0/00"
                        maxLength={10}
                      />
                      <Button
                        type="button"
                        onClick={handleAddCnaeSecundario}
                        variant="outline"
                        size="icon"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {cnaeSecundarios.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {cnaeSecundarios.map((cnae) => (
                          <Badge key={cnae} variant="secondary" className="gap-1">
                            {formatCNAE(cnae)}
                            <button
                              type="button"
                              onClick={() => handleRemoveCnaeSecundario(cnae)}
                              className="ml-1 hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Adicione múltiplas atividades econômicas secundárias. Pressione Enter ou clique em + para adicionar.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="regimeTributario">
                      Regime Tributário <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={regimeTributario}
                      onValueChange={(value) => setRegimeTributario(value as RegimeTributario)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SIMPLES_NACIONAL">
                          1 - Simples Nacional
                        </SelectItem>
                        <SelectItem value="SIMPLES_NACIONAL_EXCESSO">
                          2 - Simples Nacional - Excesso
                        </SelectItem>
                        <SelectItem value="REGIME_NORMAL">
                          3 - Regime Normal
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contato@empresa.com.br"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={telefone}
                      onChange={(e) => setTelefone(maskPhone(e.target.value))}
                      placeholder="(11) 3456-7890"
                      maxLength={15}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="celular">Celular</Label>
                    <Input
                      id="celular"
                      value={celular}
                      onChange={(e) => setCelular(maskPhone(e.target.value))}
                      placeholder="(11) 98765-4321"
                      maxLength={15}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="site">Website</Label>
                    <Input
                      id="site"
                      type="url"
                      value={site}
                      onChange={(e) => setSite(e.target.value)}
                      placeholder="https://www.empresa.com.br"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Endereço */}
          <TabsContent value="endereco">
            <Card>
              <CardHeader>
                <CardTitle>Endereço da Empresa</CardTitle>
                <CardDescription>
                  Endereço completo para emissão de NF-e
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      value={cep}
                      onChange={(e) => handleCEPChange(e.target.value)}
                      placeholder="00000-000"
                      maxLength={9}
                      disabled={loadingCEP}
                    />
                    {loadingCEP && (
                      <p className="text-xs text-muted-foreground">Buscando...</p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="logradouro">Logradouro</Label>
                    <Input
                      id="logradouro"
                      value={logradouro}
                      onChange={(e) => setLogradouro(e.target.value)}
                      placeholder="Avenida Paulista"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numero">Número</Label>
                    <Input
                      id="numero"
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                      placeholder="1000"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input
                      id="complemento"
                      value={complemento}
                      onChange={(e) => setComplemento(e.target.value)}
                      placeholder="Sala 200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                      placeholder="Bela Vista"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      placeholder="São Paulo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado (UF)</Label>
                    <Input
                      id="estado"
                      value={estado}
                      onChange={(e) => setEstado(e.target.value.toUpperCase())}
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="codigoMunicipioIBGE">Código IBGE</Label>
                    <Input
                      id="codigoMunicipioIBGE"
                      value={codigoMunicipioIBGE}
                      onChange={(e) => setCodigoMunicipioIBGE(e.target.value)}
                      placeholder="3550308"
                      maxLength={7}
                      disabled={loadingCEP}
                    />
                    <p className="text-xs text-muted-foreground">
                      Preenchido automaticamente ao buscar CEP. Obrigatório para NF-e.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dados Fiscais */}
          <TabsContent value="fiscal">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Fiscais</CardTitle>
                <CardDescription>
                  Parâmetros para emissão de notas fiscais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="cfopPadrao">CFOP Padrão</Label>
                    <Input
                      id="cfopPadrao"
                      value={cfopPadrao}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                        setCfopPadrao(value)
                      }}
                      placeholder="5102"
                      maxLength={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      CFOP padrão para vendas (4 dígitos). Ex: 5102, 6102, 5405
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serieNFe">Série NF-e</Label>
                    <Input
                      id="serieNFe"
                      value={serieNFe}
                      onChange={(e) => setSerieNFe(e.target.value)}
                      placeholder="1"
                      maxLength={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Série da Nota Fiscal Eletrônica (geralmente "1")
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ambienteFiscal">Ambiente Fiscal</Label>
                    <Select
                      value={ambienteFiscal}
                      onValueChange={(value) => setAmbienteFiscal(value as AmbienteFiscal)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HOMOLOGACAO">
                          Homologação (Testes)
                        </SelectItem>
                        <SelectItem value="PRODUCAO">
                          Produção (Real)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Use Homologação para testes iniciais
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-amber-800">
                    <strong>⚠️ Atenção:</strong> Para emitir NF-e em ambiente de{' '}
                    <strong>Produção</strong>, será necessário fazer upload do
                    Certificado Digital A1 nas configurações da empresa.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Responsável Técnico */}
          <TabsContent value="responsavel-tecnico">
            <Card>
              <CardHeader>
                <CardTitle>Responsável Técnico</CardTitle>
                <CardDescription>
                  Dados do responsável técnico pelo sistema (obrigatório desde 01/04/2024)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="respTecCNPJ">CNPJ</Label>
                    <Input
                      id="respTecCNPJ"
                      value={respTecCNPJ}
                      onChange={(e) => setRespTecCNPJ(maskCNPJ(e.target.value))}
                      placeholder="00.000.000/0000-00"
                      maxLength={18}
                    />
                    <p className="text-xs text-muted-foreground">
                      CNPJ da empresa desenvolvedora do software
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="respTecContato">Nome do Contato</Label>
                    <Input
                      id="respTecContato"
                      value={respTecContato}
                      onChange={(e) => setRespTecContato(e.target.value)}
                      placeholder="João Silva"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="respTecEmail">Email</Label>
                    <Input
                      id="respTecEmail"
                      type="email"
                      value={respTecEmail}
                      onChange={(e) => setRespTecEmail(e.target.value)}
                      placeholder="contato@software.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="respTecFone">Telefone</Label>
                    <Input
                      id="respTecFone"
                      value={respTecFone}
                      onChange={(e) => setRespTecFone(maskPhone(e.target.value))}
                      placeholder="(11) 98765-4321"
                      maxLength={15}
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm text-blue-800">
                    <strong>ℹ️ Informação:</strong> A SEFAZ exige o preenchimento
                    destes dados em todas as NF-e emitidas desde abril de 2024.
                    Informe os dados da empresa responsável pelo desenvolvimento
                    ou suporte do sistema.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações */}
          <TabsContent value="configuracoes">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>
                  Configurações adicionais da empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="active">Empresa Ativa</Label>
                    <p className="text-sm text-muted-foreground">
                      Empresas inativas não podem acessar o sistema
                    </p>
                  </div>
                  <Switch
                    id="active"
                    checked={active}
                    onCheckedChange={setActive}
                  />
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm text-gray-800">
                    <strong>📋 Próximos passos após criar a empresa:</strong>
                  </p>
                  <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 space-y-1">
                    <li>Fazer upload do Certificado Digital A1 (para produção)</li>
                    <li>Configurar impostos e alíquotas padrão</li>
                    <li>Cadastrar usuários e definir permissões</li>
                    <li>Testar emissão de NF-e em homologação</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </DashboardLayout>
  )
}
