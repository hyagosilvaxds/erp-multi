"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Building2, 
  Save, 
  Loader2,
  MapPin,
  Phone,
  FileText,
  CreditCard,
  Upload,
  X,
  Image as ImageIcon,
  BookOpen,
  Plus,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2
} from "lucide-react"
import { companiesApi } from "@/lib/api/auth"
import { planoContasApi, centroCustoApi, type PlanoContas, type ContaContabil, type CentroCusto } from "@/lib/api/financial"
import { useToast } from "@/hooks/use-toast"
import { formatApiError } from "@/lib/format-error"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

const regimesTributarios = [
  "Simples Nacional",
  "Lucro Presumido",
  "Lucro Real"
]

const tiposContribuinte = [
  "Contribuinte ICMS",
  "Contribuinte ICMS e ISS",
  "Isento",
  "Não Contribuinte"
]

const regimesApuracao = [
  "Simples Nacional",
  "Lucro Presumido",
  "Lucro Real"
]

const situacoesCadastrais = [
  "Ativa",
  "Inativa",
  "Suspensa",
  "Inapta",
  "Baixada"
]

const ambientesFiscais = [
  "Homologacao",
  "Producao"
]

const estados = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
]

export default function EditarEmpresaPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [uploadingCertificate, setUploadingCertificate] = useState(false)
  const [certificateFile, setCertificateFile] = useState<File | null>(null)
  const [certificatePassword, setCertificatePassword] = useState("")
  const [hasCertificate, setHasCertificate] = useState(false)
  const [planosContas, setPlanosContas] = useState<PlanoContas[]>([])
  const [loadingPlanos, setLoadingPlanos] = useState(false)
  const [expandedPlanos, setExpandedPlanos] = useState<Set<string>>(new Set())
  const [planosComHierarquia, setPlanosComHierarquia] = useState<Record<string, ContaContabil[]>>({})
  const [loadingHierarquia, setLoadingHierarquia] = useState<Set<string>>(new Set())
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([])
  const [loadingCentros, setLoadingCentros] = useState(false)
  const [expandedCentros, setExpandedCentros] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState("basico")
  const [formData, setFormData] = useState({
    // Dados Básicos
    razaoSocial: "",
    nomeFantasia: "",
    cnpj: "",
    inscricaoEstadual: "",
    inscricaoMunicipal: "",
    regimeTributario: "",
    cnaePrincipal: "",
    cnaeSecundarios: [] as string[],
    dataAbertura: "",
    situacaoCadastral: "",
    
    // Endereço
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
    pais: "Brasil",
    
    // Contatos
    telefone: "",
    celular: "",
    email: "",
    site: "",
    
    // Configurações Fiscais
    tipoContribuinte: "",
    regimeApuracao: "",
    codigoMunicipioIBGE: "",
    codigoEstadoIBGE: "",
    cfopPadrao: "",
    serieNFe: "",
    serieNFCe: "",
    serieNFSe: "",
    ambienteFiscal: "",
  })

  useEffect(() => {
    loadCompany()
    loadPlanosContas()
    loadCentrosCusto()
  }, [params.id])

  // Ler query parameter para definir tab ativa
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const loadPlanosContas = async () => {
    try {
      setLoadingPlanos(true)
      const response = await planoContasApi.getAll({ limit: 100, ativo: true })
      setPlanosContas(response.data)
    } catch (error: any) {
      console.error("Erro ao carregar planos de contas:", error)
    } finally {
      setLoadingPlanos(false)
    }
  }

  const loadCentrosCusto = async () => {
    try {
      setLoadingCentros(true)
      const companyId = params.id as string
      // Usando novo endpoint recomendado
      const centros = await centroCustoApi.getByCompany(companyId)
      // Filtrar apenas ativos
      setCentrosCusto(centros.filter(c => c.ativo))
    } catch (error: any) {
      console.error("Erro ao carregar centros de custo:", error)
    } finally {
      setLoadingCentros(false)
    }
  }

  const togglePlano = async (planoId: string) => {
    const newExpanded = new Set(expandedPlanos)
    
    if (newExpanded.has(planoId)) {
      // Colapsar
      newExpanded.delete(planoId)
      setExpandedPlanos(newExpanded)
    } else {
      // Expandir - carregar hierarquia se ainda não carregou
      newExpanded.add(planoId)
      setExpandedPlanos(newExpanded)
      
      if (!planosComHierarquia[planoId]) {
        try {
          setLoadingHierarquia(prev => new Set(prev).add(planoId))
          const hierarquia = await planoContasApi.getHierarquia(planoId)
          setPlanosComHierarquia(prev => ({
            ...prev,
            [planoId]: hierarquia.contas
          }))
        } catch (error: any) {
          console.error("Erro ao carregar hierarquia:", error)
          toast({
            title: "Erro ao carregar contas",
            description: "Erro ao carregar hierarquia de contas",
            variant: "destructive"
          })
        } finally {
          setLoadingHierarquia(prev => {
            const newSet = new Set(prev)
            newSet.delete(planoId)
            return newSet
          })
        }
      }
    }
  }

  const getInitialLetter = (tipo: string) => {
    const letters: Record<string, string> = {
      'Ativo': 'A',
      'Passivo': 'P',
      'Receita': 'R',
      'Despesa': 'D',
      'Patrimônio Líquido': 'PL'
    }
    return letters[tipo] || tipo[0]
  }

  const getColorByTipo = (tipo: string) => {
    const colors: Record<string, string> = {
      'Ativo': 'bg-green-100 text-green-700 border-green-200',
      'Passivo': 'bg-red-100 text-red-700 border-red-200',
      'Receita': 'bg-blue-100 text-blue-700 border-blue-200',
      'Despesa': 'bg-orange-100 text-orange-700 border-orange-200',
      'Patrimônio Líquido': 'bg-purple-100 text-purple-700 border-purple-200'
    }
    return colors[tipo] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const toggleCentro = (centroId: string) => {
    const newExpanded = new Set(expandedCentros)
    
    if (newExpanded.has(centroId)) {
      newExpanded.delete(centroId)
    } else {
      newExpanded.add(centroId)
    }
    
    setExpandedCentros(newExpanded)
  }

  const loadCompany = async () => {
    try {
      setLoading(true)
      const data = await companiesApi.getCompanyById(params.id as string)
      
      // Preencher formulário com dados da empresa
      setFormData({
        razaoSocial: data.razaoSocial || "",
        nomeFantasia: data.nomeFantasia || "",
        cnpj: data.cnpj || "",
        inscricaoEstadual: data.inscricaoEstadual || "",
        inscricaoMunicipal: data.inscricaoMunicipal || "",
        regimeTributario: data.regimeTributario || "",
        cnaePrincipal: data.cnaePrincipal || "",
        cnaeSecundarios: data.cnaeSecundarios || [],
        dataAbertura: data.dataAbertura ? data.dataAbertura.split('T')[0] : "",
        situacaoCadastral: data.situacaoCadastral || "",
        
        logradouro: data.logradouro || "",
        numero: data.numero || "",
        complemento: data.complemento || "",
        bairro: data.bairro || "",
        cidade: data.cidade || "",
        estado: data.estado || "",
        cep: data.cep || "",
        pais: data.pais || "Brasil",
        
        telefone: data.telefone || "",
        celular: data.celular || "",
        email: data.email || "",
        site: data.site || "",
        
        tipoContribuinte: data.tipoContribuinte || "",
        regimeApuracao: data.regimeApuracao || "",
        codigoMunicipioIBGE: data.codigoMunicipioIBGE || "",
        codigoEstadoIBGE: data.codigoEstadoIBGE || "",
        cfopPadrao: data.cfopPadrao || "",
        serieNFe: data.serieNFe || "",
        serieNFCe: data.serieNFCe || "",
        serieNFSe: data.serieNFSe || "",
        ambienteFiscal: data.ambienteFiscal || "",
      })
      
      // Definir preview da logo se existir
      if (data.logoUrl) {
        setLogoPreview(data.logoUrl)
      }

      // Verificar se tem certificado A1
      if ((data as any).hasCertificadoA1) {
        setHasCertificate(true)
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar empresa:', error)
      
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      
      // Preparar dados para envio (remover campos vazios e formatar)
      const updateData: any = {}
      
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          if (Array.isArray(value) && value.length > 0) {
            updateData[key] = value
          } else if (!Array.isArray(value)) {
            // Remover máscara do CEP (apenas dígitos)
            if (key === 'cep') {
              updateData[key] = value.replace(/\D/g, '')
            }
            // Remover máscara do CNPJ (apenas dígitos)
            else if (key === 'cnpj') {
              updateData[key] = value.replace(/\D/g, '')
            }
            // Remover máscara dos telefones (apenas dígitos)
            else if (key === 'telefone' || key === 'celular') {
              updateData[key] = value.replace(/\D/g, '')
            }
            // Converter datas para ISO-8601
            else if (key === 'dataAbertura' && value) {
              updateData[key] = new Date(value).toISOString()
            }
            else {
              updateData[key] = value
            }
          }
        }
      })

      console.log('📤 Dados para atualização:', updateData)
      
      const result = await companiesApi.updateCompany(params.id as string, updateData)
      
      toast({
        title: "Empresa atualizada com sucesso!",
        description: `${result.nomeFantasia || result.razaoSocial} foi atualizada.`,
      })
      
      router.push(`/admin/empresas/${params.id}`)
    } catch (error: any) {
      console.error('❌ Erro ao atualizar empresa:', error)
      console.log('📋 Estrutura do erro:', {
        error: error,
        response: error.response,
        data: error.response?.data,
        message: error.response?.data?.message
      })
      
      const { title, description } = formatApiError(error)
      
      console.log('📋 Erro formatado:', { title, description })
      
      toast({
        title,
        description,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    // Remove tudo que não é dígito
    value = value.replace(/\D/g, '')
    // Limita a 8 dígitos
    value = value.slice(0, 8)
    // Aplica máscara: 00000-000
    if (value.length > 5) {
      value = value.slice(0, 5) + '-' + value.slice(5)
    }
    handleInputChange('cep', value)
  }

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    // Remove tudo que não é dígito
    value = value.replace(/\D/g, '')
    // Limita a 14 dígitos
    value = value.slice(0, 14)
    // Aplica máscara: 00.000.000/0000-00
    if (value.length <= 14) {
      value = value.replace(/(\d{2})(\d)/, '$1.$2')
      value = value.replace(/(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      value = value.replace(/(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
      value = value.replace(/(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5')
    }
    handleInputChange('cnpj', value)
  }

  const handleTelefoneChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    // Remove tudo que não é dígito
    value = value.replace(/\D/g, '')
    // Limita a 11 dígitos
    value = value.slice(0, 11)
    // Aplica máscara: (00) 00000-0000 ou (00) 0000-0000
    if (value.length <= 10) {
      value = value.replace(/(\d{2})(\d)/, '($1) $2')
      value = value.replace(/(\d{4})(\d)/, '$1-$2')
    } else {
      value = value.replace(/(\d{2})(\d)/, '($1) $2')
      value = value.replace(/(\d{5})(\d)/, '$1-$2')
    }
    handleInputChange(field, value)
  }

  const handleCNAESecundariosChange = (value: string) => {
    // Converter string separada por vírgula em array
    const cnaes = value.split(',').map(c => c.trim()).filter(c => c)
    handleInputChange('cnaeSecundarios', cnaes)
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Formato inválido",
        description: "Apenas arquivos .jpg, .jpeg, .png, .gif e .webp são aceitos.",
        variant: "destructive",
      })
      return
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo é 5MB.",
        variant: "destructive",
      })
      return
    }

    // Criar preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
    
    setLogoFile(file)
  }

  const handleUploadLogo = async () => {
    if (!logoFile) return

    try {
      setUploadingLogo(true)
      
      const result = await companiesApi.uploadLogo(params.id as string, logoFile)
      
      toast({
        title: "Logo atualizada com sucesso!",
        description: "A logo da empresa foi atualizada.",
      })
      
      // Atualizar preview com URL da API
      setLogoPreview(result.logoUrl)
      setLogoFile(null)
    } catch (error: any) {
      console.error('❌ Erro ao fazer upload da logo:', error)
      
      const { title, description } = formatApiError(error)
      
      toast({
        title,
        description,
        variant: "destructive",
      })
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleRemoveLogo = async () => {
    // Se é apenas preview local (arquivo ainda não enviado), apenas limpa
    if (logoFile && !formData.razaoSocial) {
      setLogoPreview(null)
      setLogoFile(null)
      return
    }

    // Se existe logo no servidor, chamar API para remover
    if (logoPreview) {
      try {
        setUploadingLogo(true)
        
        await companiesApi.removeLogo(params.id as string)
        
        toast({
          title: "Logo removida com sucesso!",
          description: "A logo da empresa foi removida.",
        })
        
        setLogoPreview(null)
        setLogoFile(null)
      } catch (error: any) {
        console.error('❌ Erro ao remover logo:', error)
        
        const { title, description } = formatApiError(error)
        
        toast({
          title,
          description,
          variant: "destructive",
        })
      } finally {
        setUploadingLogo(false)
      }
    }
  }

  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    const validExtensions = ['.pfx', '.p12']
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
    
    if (!validExtensions.includes(fileExtension)) {
      toast({
        title: "Formato inválido",
        description: "Apenas arquivos .pfx ou .p12 são aceitos.",
        variant: "destructive",
      })
      return
    }

    // Validar tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo é 10MB.",
        variant: "destructive",
      })
      return
    }

    setCertificateFile(file)
  }

  const handleUploadCertificate = async () => {
    if (!certificateFile || !certificatePassword) {
      toast({
        title: "Dados incompletos",
        description: "Selecione o arquivo do certificado e informe a senha.",
        variant: "destructive",
      })
      return
    }

    try {
      setUploadingCertificate(true)
      
      await companiesApi.uploadCertificate(params.id as string, certificateFile, certificatePassword)
      
      toast({
        title: "Certificado enviado com sucesso!",
        description: "O certificado digital foi armazenado com segurança.",
      })
      
      setHasCertificate(true)
      setCertificateFile(null)
      setCertificatePassword("")
    } catch (error: any) {
      console.error('❌ Erro ao fazer upload do certificado:', error)
      
      const { title, description } = formatApiError(error)
      
      toast({
        title,
        description,
        variant: "destructive",
      })
    } finally {
      setUploadingCertificate(false)
    }
  }

  const handleRemoveCertificate = async () => {
    try {
      setUploadingCertificate(true)
      
      await companiesApi.removeCertificate(params.id as string)
      
      toast({
        title: "Certificado removido com sucesso!",
        description: "O certificado digital foi removido.",
      })
      
      setHasCertificate(false)
      setCertificateFile(null)
      setCertificatePassword("")
    } catch (error: any) {
      console.error('❌ Erro ao remover certificado:', error)
      
      const { title, description } = formatApiError(error)
      
      toast({
        title,
        description,
        variant: "destructive",
      })
    } finally {
      setUploadingCertificate(false)
    }
  }

  // Componente para renderizar uma conta e suas subcontas
  // Componente para renderizar hierarquia de centros de custo
  const CentroCustoItem = ({ 
    centro, 
    allCentros,
    nivel,
    expandedCentros,
    toggleCentro
  }: { 
    centro: CentroCusto
    allCentros: CentroCusto[]
    nivel: number
    expandedCentros: Set<string>
    toggleCentro: (id: string) => void
  }) => {
    const paddingLeft = `${(nivel + 1) * 1.5}rem`
    const subCentros = allCentros.filter(c => c.centroCustoPaiId === centro.id)
    const hasSubCentros = subCentros.length > 0
    const isExpanded = expandedCentros.has(centro.id)
    
    return (
      <>
        <div 
          className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors border rounded-lg"
          style={{ paddingLeft }}
        >
          {/* Botão expandir/colapsar */}
          {hasSubCentros && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={() => toggleCentro(centro.id)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
          
          {/* Ícone */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 border border-blue-200">
            <Building2 className="h-4 w-4 text-blue-700" />
          </div>

          {/* Código e Nome */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold">{centro.codigo}</span>
              <span className="text-sm font-medium">{centro.nome}</span>
            </div>
            {centro.responsavel && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  Responsável: {centro.responsavel}
                </span>
                {centro.email && (
                  <span className="text-xs text-muted-foreground">• {centro.email}</span>
                )}
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className="text-xs">
              Nível {centro.nivel}
            </Badge>
            {hasSubCentros && (
              <Badge variant="secondary" className="text-xs">
                {subCentros.length} {subCentros.length === 1 ? 'subcentro' : 'subcentros'}
              </Badge>
            )}
            <Badge 
              variant={centro.ativo ? "default" : "destructive"}
              className="text-xs"
            >
              {centro.ativo ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-1 shrink-0">
            <Link href={`/admin/centro-custo/${centro.id}/editar`}>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Edit className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Subcentros */}
        {hasSubCentros && isExpanded && (
          <div className="ml-4 space-y-2 mt-2">
            {subCentros.map(subCentro => (
              <CentroCustoItem
                key={subCentro.id}
                centro={subCentro}
                allCentros={allCentros}
                nivel={nivel + 1}
                expandedCentros={expandedCentros}
                toggleCentro={toggleCentro}
              />
            ))}
          </div>
        )}
      </>
    )
  }

  // Componente para renderizar hierarquia de contas
  const ContaItem = ({ conta, nivel }: { conta: ContaContabil; nivel: number }) => {
    const paddingLeft = `${(nivel + 1) * 1.5}rem`
    const isSintetica = conta.subContas && conta.subContas.length > 0
    
    return (
      <>
        <div 
          className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
          style={{ paddingLeft }}
        >
          {/* Ícone com letra do tipo */}
          <div 
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded border font-semibold text-sm ${getColorByTipo(conta.tipo)}`}
          >
            {getInitialLetter(conta.tipo)}
          </div>

          {/* Código e Nome */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-medium">{conta.codigo}</span>
              <span className="text-sm truncate">{conta.nome}</span>
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 shrink-0">
            <Badge 
              variant={isSintetica ? "secondary" : "outline"}
              className="text-xs"
            >
              {isSintetica ? 'Sintética' : 'Analítica'}
            </Badge>
            <Badge 
              variant={conta.ativo ? "default" : "destructive"}
              className="text-xs"
            >
              {conta.ativo ? 'Ativa' : 'Inativa'}
            </Badge>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-1 shrink-0">
            <Link href={`/admin/plano-contas/contas/${conta.id}/editar`}>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Edit className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Renderizar subcontas recursivamente */}
        {conta.subContas && conta.subContas.map((subConta) => (
          <ContaItem key={subConta.id} conta={subConta} nivel={nivel + 1} />
        ))}
      </>
    )
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

  return (
    <DashboardLayout userRole="admin">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              type="button"
              variant="ghost" 
              size="icon" 
              onClick={() => router.push(`/admin/empresas/${params.id}`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Editar Empresa</h1>
              <p className="text-muted-foreground">
                Atualize as informações da empresa
              </p>
            </div>
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="basico">
              <Building2 className="mr-2 h-4 w-4" />
              Dados Básicos
            </TabsTrigger>
            <TabsTrigger value="endereco">
              <MapPin className="mr-2 h-4 w-4" />
              Endereço
            </TabsTrigger>
            <TabsTrigger value="contatos">
              <Phone className="mr-2 h-4 w-4" />
              Contatos
            </TabsTrigger>
            <TabsTrigger value="cnae">
              <FileText className="mr-2 h-4 w-4" />
              CNAE
            </TabsTrigger>
            <TabsTrigger value="fiscal">
              <CreditCard className="mr-2 h-4 w-4" />
              Fiscal
            </TabsTrigger>
            <TabsTrigger value="plano-contas">
              <BookOpen className="mr-2 h-4 w-4" />
              Plano de Contas
            </TabsTrigger>
            <TabsTrigger value="centros-custo">
              <Building2 className="mr-2 h-4 w-4" />
              Centros de Custo
            </TabsTrigger>
          </TabsList>

          {/* Dados Básicos */}
          <TabsContent value="basico" className="space-y-4">
            {/* Upload de Logo */}
            <Card>
              <CardHeader>
                <CardTitle>Logo da Empresa</CardTitle>
                <CardDescription>Formatos aceitos: .jpg, .jpeg, .png, .gif, .webp (máx. 5MB)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-6">
                  {/* Preview da Logo */}
                  <div className="flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed bg-muted">
                    {logoPreview ? (
                      <div className="relative h-full w-full">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="h-full w-full rounded-lg object-contain p-2"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -right-2 -top-2 h-6 w-6"
                          onClick={handleRemoveLogo}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <Input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleLogoChange}
                        disabled={uploadingLogo}
                        className="cursor-pointer"
                      />
                    </div>
                    {logoFile && (
                      <Button
                        type="button"
                        onClick={handleUploadLogo}
                        disabled={uploadingLogo}
                        size="sm"
                      >
                        {uploadingLogo ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Fazer Upload
                          </>
                        )}
                      </Button>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Selecione uma imagem e clique em "Fazer Upload" para atualizar a logo.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>Dados cadastrais da empresa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="razaoSocial">Razão Social *</Label>
                    <Input
                      id="razaoSocial"
                      value={formData.razaoSocial}
                      onChange={(e) => handleInputChange('razaoSocial', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                    <Input
                      id="nomeFantasia"
                      value={formData.nomeFantasia}
                      onChange={(e) => handleInputChange('nomeFantasia', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <Input
                      id="cnpj"
                      value={formData.cnpj}
                      onChange={handleCnpjChange}
                      placeholder="00.000.000/0000-00"
                      maxLength={18}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
                    <Input
                      id="inscricaoEstadual"
                      value={formData.inscricaoEstadual}
                      onChange={(e) => handleInputChange('inscricaoEstadual', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inscricaoMunicipal">Inscrição Municipal</Label>
                    <Input
                      id="inscricaoMunicipal"
                      value={formData.inscricaoMunicipal}
                      onChange={(e) => handleInputChange('inscricaoMunicipal', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="regimeTributario">Regime Tributário</Label>
                    <Select
                      value={formData.regimeTributario || undefined}
                      onValueChange={(value) => handleInputChange('regimeTributario', value)}
                    >
                      <SelectTrigger id="regimeTributario">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {regimesTributarios.map(regime => (
                          <SelectItem key={regime} value={regime}>{regime}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="situacaoCadastral">Situação Cadastral</Label>
                    <Select
                      value={formData.situacaoCadastral || undefined}
                      onValueChange={(value) => handleInputChange('situacaoCadastral', value)}
                    >
                      <SelectTrigger id="situacaoCadastral">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {situacoesCadastrais.map(situacao => (
                          <SelectItem key={situacao} value={situacao}>{situacao}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataAbertura">Data de Abertura</Label>
                    <Input
                      id="dataAbertura"
                      type="date"
                      value={formData.dataAbertura}
                      onChange={(e) => handleInputChange('dataAbertura', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Endereço */}
          <TabsContent value="endereco" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Endereço</CardTitle>
                <CardDescription>Localização da empresa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2 md:col-span-3">
                    <Label htmlFor="logradouro">Logradouro</Label>
                    <Input
                      id="logradouro"
                      value={formData.logradouro}
                      onChange={(e) => handleInputChange('logradouro', e.target.value)}
                      placeholder="Rua, Avenida, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numero">Número</Label>
                    <Input
                      id="numero"
                      value={formData.numero}
                      onChange={(e) => handleInputChange('numero', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input
                      id="complemento"
                      value={formData.complemento}
                      onChange={(e) => handleInputChange('complemento', e.target.value)}
                      placeholder="Sala, Andar, Bloco, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      value={formData.bairro}
                      onChange={(e) => handleInputChange('bairro', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={formData.cidade}
                      onChange={(e) => handleInputChange('cidade', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado (UF)</Label>
                    <Select
                      value={formData.estado || undefined}
                      onValueChange={(value) => handleInputChange('estado', value)}
                    >
                      <SelectTrigger id="estado">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {estados.map(uf => (
                          <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      value={formData.cep}
                      onChange={handleCepChange}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pais">País</Label>
                  <Input
                    id="pais"
                    value={formData.pais}
                    onChange={(e) => handleInputChange('pais', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contatos */}
          <TabsContent value="contatos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
                <CardDescription>Telefones, e-mail e website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={handleTelefoneChange('telefone')}
                      placeholder="(00) 0000-0000"
                      maxLength={15}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="celular">Celular</Label>
                    <Input
                      id="celular"
                      value={formData.celular}
                      onChange={handleTelefoneChange('celular')}
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="contato@empresa.com.br"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site">Website</Label>
                    <Input
                      id="site"
                      type="url"
                      value={formData.site}
                      onChange={(e) => handleInputChange('site', e.target.value)}
                      placeholder="https://www.empresa.com.br"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CNAE */}
          <TabsContent value="cnae" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Atividades Econômicas (CNAE)</CardTitle>
                <CardDescription>Classificação Nacional de Atividades Econômicas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cnaePrincipal">CNAE Principal</Label>
                  <Input
                    id="cnaePrincipal"
                    value={formData.cnaePrincipal}
                    onChange={(e) => handleInputChange('cnaePrincipal', e.target.value)}
                    placeholder="0000-0/00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnaeSecundarios">CNAEs Secundários</Label>
                  <Textarea
                    id="cnaeSecundarios"
                    value={formData.cnaeSecundarios.join(', ')}
                    onChange={(e) => handleCNAESecundariosChange(e.target.value)}
                    placeholder="Separe múltiplos CNAEs por vírgula. Ex: 0000-0/00, 1111-1/11"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Digite os CNAEs separados por vírgula
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações Fiscais */}
          <TabsContent value="fiscal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Fiscais</CardTitle>
                <CardDescription>Parâmetros fiscais e tributários</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tipoContribuinte">Tipo de Contribuinte</Label>
                    <Select
                      value={formData.tipoContribuinte || undefined}
                      onValueChange={(value) => handleInputChange('tipoContribuinte', value)}
                    >
                      <SelectTrigger id="tipoContribuinte">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposContribuinte.map(tipo => (
                          <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="regimeApuracao">Regime de Apuração</Label>
                    <Select
                      value={formData.regimeApuracao || undefined}
                      onValueChange={(value) => handleInputChange('regimeApuracao', value)}
                    >
                      <SelectTrigger id="regimeApuracao">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {regimesApuracao.map(regime => (
                          <SelectItem key={regime} value={regime}>{regime}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="codigoMunicipioIBGE">Código IBGE Município</Label>
                    <Input
                      id="codigoMunicipioIBGE"
                      value={formData.codigoMunicipioIBGE}
                      onChange={(e) => handleInputChange('codigoMunicipioIBGE', e.target.value)}
                      placeholder="0000000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="codigoEstadoIBGE">Código IBGE Estado</Label>
                    <Input
                      id="codigoEstadoIBGE"
                      value={formData.codigoEstadoIBGE}
                      onChange={(e) => handleInputChange('codigoEstadoIBGE', e.target.value)}
                      placeholder="00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cfopPadrao">CFOP Padrão</Label>
                    <Input
                      id="cfopPadrao"
                      value={formData.cfopPadrao}
                      onChange={(e) => handleInputChange('cfopPadrao', e.target.value)}
                      placeholder="0000"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="ambienteFiscal">Ambiente Fiscal</Label>
                  <Select
                    value={formData.ambienteFiscal || undefined}
                    onValueChange={(value) => handleInputChange('ambienteFiscal', value)}
                  >
                    <SelectTrigger id="ambienteFiscal">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ambientesFiscais.map(ambiente => (
                        <SelectItem key={ambiente} value={ambiente}>{ambiente}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Homologação para testes, Produção para uso real
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-4">Numeração de Notas Fiscais</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="serieNFe">Série NF-e</Label>
                      <Input
                        id="serieNFe"
                        value={formData.serieNFe}
                        onChange={(e) => handleInputChange('serieNFe', e.target.value)}
                        placeholder="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serieNFCe">Série NFC-e</Label>
                      <Input
                        id="serieNFCe"
                        value={formData.serieNFCe}
                        onChange={(e) => handleInputChange('serieNFCe', e.target.value)}
                        placeholder="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serieNFSe">Série NFS-e</Label>
                      <Input
                        id="serieNFSe"
                        value={formData.serieNFSe}
                        onChange={(e) => handleInputChange('serieNFSe', e.target.value)}
                        placeholder="1"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Upload de Certificado Digital */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Certificado Digital A1</h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    Upload do certificado digital para emissão de notas fiscais eletrônicas
                  </p>
                  
                  {hasCertificate ? (
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                          <FileText className="h-5 w-5 text-green-600 dark:text-green-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Certificado instalado</p>
                          <p className="text-xs text-muted-foreground">Certificado digital configurado</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleRemoveCertificate}
                        disabled={uploadingCertificate}
                      >
                        {uploadingCertificate ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Removendo...
                          </>
                        ) : (
                          <>
                            <X className="mr-2 h-4 w-4" />
                            Remover
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="certificate">Arquivo do Certificado (.pfx ou .p12)</Label>
                        <Input
                          id="certificate"
                          type="file"
                          accept=".pfx,.p12"
                          onChange={handleCertificateChange}
                          disabled={uploadingCertificate}
                          className="cursor-pointer"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="certificatePassword">Senha do Certificado</Label>
                        <Input
                          id="certificatePassword"
                          type="password"
                          value={certificatePassword}
                          onChange={(e) => setCertificatePassword(e.target.value)}
                          disabled={uploadingCertificate}
                          placeholder="Digite a senha do certificado"
                        />
                      </div>
                      {certificateFile && certificatePassword && (
                        <Button
                          type="button"
                          onClick={handleUploadCertificate}
                          disabled={uploadingCertificate}
                          size="sm"
                        >
                          {uploadingCertificate ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Enviar Certificado
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plano de Contas */}
          <TabsContent value="plano-contas" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Planos de Contas</CardTitle>
                    <CardDescription>
                      Gerencie os planos de contas disponíveis para esta empresa
                    </CardDescription>
                  </div>
                  <Link href="/admin/plano-contas/novo">
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Plano
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loadingPlanos ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : planosContas.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum plano de contas encontrado</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Crie um novo plano de contas para começar
                    </p>
                    <Link href="/admin/plano-contas/novo">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Criar Primeiro Plano
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {planosContas.map((plano) => (
                      <div key={plano.id} className="border rounded-lg overflow-hidden">
                        {/* Header do Plano */}
                        <div 
                          className="flex items-center justify-between p-4 bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                          onClick={() => togglePlano(plano.id)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              type="button"
                            >
                              {expandedPlanos.has(plano.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-base">{plano.nome}</h3>
                                {plano.padrao && (
                                  <Badge variant="secondary" className="text-xs">
                                    Padrão
                                  </Badge>
                                )}
                                {plano.companyId ? (
                                  <Badge variant="default" className="text-xs">
                                    Empresa
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">
                                    Sistema
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {plano.tipo}
                                </Badge>
                                <Badge 
                                  variant={plano.ativo ? "default" : "destructive"} 
                                  className="text-xs"
                                >
                                  {plano.ativo ? 'Ativa' : 'Inativa'}
                                </Badge>
                              </div>
                              {plano.descricao && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {plano.descricao}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {plano._count?.contas || 0} contas
                              </span>
                              <Link href={`/admin/plano-contas/${plano.id}`} onClick={(e) => e.stopPropagation()}>
                                <Button variant="outline" size="sm">
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>

                        {/* Contas do Plano */}
                        {expandedPlanos.has(plano.id) && (
                          <div className="bg-background">
                            {loadingHierarquia.has(plano.id) ? (
                              <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                              </div>
                            ) : planosComHierarquia[plano.id]?.length > 0 ? (
                              <div className="divide-y">
                                {planosComHierarquia[plano.id].map((conta) => (
                                  <ContaItem key={conta.id} conta={conta} nivel={0} />
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-sm text-muted-foreground">
                                <p>Nenhuma conta cadastrada neste plano</p>
                                <Link href={`/admin/plano-contas/${plano.id}/contas/nova`}>
                                  <Button variant="link" size="sm" className="mt-2">
                                    <Plus className="mr-2 h-3 w-3" />
                                    Adicionar primeira conta
                                  </Button>
                                </Link>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Centros de Custo */}
          <TabsContent value="centros-custo" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Centros de Custo</CardTitle>
                    <CardDescription>
                      Gerencie os centros de custo da empresa
                    </CardDescription>
                  </div>
                  <Link href={`/admin/centro-custo/novo?companyId=${params.id}`}>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Centro de Custo
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loadingCentros ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : centrosCusto.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Nenhum centro de custo cadastrado</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Crie o primeiro centro de custo para começar a organizar seus custos
                    </p>
                    <Link href={`/admin/centro-custo/novo?companyId=${params.id}`}>
                      <Button className="mt-4" variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Criar Primeiro Centro de Custo
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {centrosCusto
                      .filter(centro => centro.nivel === 1)
                      .map(centro => (
                        <CentroCustoItem 
                          key={centro.id} 
                          centro={centro}
                          allCentros={centrosCusto}
                          nivel={0}
                          expandedCentros={expandedCentros}
                          toggleCentro={toggleCentro}
                        />
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer com botões */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/admin/empresas/${params.id}`)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </DashboardLayout>
  )
}
