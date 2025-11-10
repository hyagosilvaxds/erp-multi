import { apiClient } from "./client"
import { authApi } from "./auth"

// ============================================
// Types & Interfaces
// ============================================

export type InvestorType = "PESSOA_FISICA" | "PESSOA_JURIDICA"
export type Gender = "MASCULINO" | "FEMININO" | "OUTRO"
export type MaritalStatus = "SOLTEIRO" | "CASADO" | "DIVORCIADO" | "VIUVO" | "UNIAO_ESTAVEL"
export type AddressType = "RESIDENCIAL" | "COMERCIAL" | "CORRESPONDENCIA"
export type AccountType = "CORRENTE" | "POUPANCA" | "PAGAMENTO"
export type PixKeyType = "CPF" | "CNPJ" | "EMAIL" | "TELEFONE" | "CHAVE_ALEATORIA"
export type InvestorProfile = "CONSERVADOR" | "MODERADO" | "ARROJADO"
export type InvestorStatus = "ATIVO" | "INATIVO" | "SUSPENSO" | "BLOQUEADO"

// Base Investor Interface (campos comuns)
interface BaseInvestor {
  id: string
  type: InvestorType
  email: string
  alternativeEmail?: string
  phone?: string
  mobilePhone?: string
  whatsapp?: string
  
  // Endereço
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  addressType?: AddressType
  
  // Dados Bancários
  bankName?: string
  bankCode?: string
  agencyNumber?: string
  agencyDigit?: string
  accountNumber?: string
  accountDigit?: string
  accountType?: AccountType
  pixKeyType?: PixKeyType
  pixKey?: string
  
  // Investidor
  investorProfile?: InvestorProfile
  investmentGoal?: string
  investorCode: string
  category?: string
  isAccreditedInvestor: boolean
  status: InvestorStatus
  statusReason?: string
  active: boolean
  notes?: string
  internalNotes?: string
  
  // Termos
  termsAcceptedAt?: string
  privacyPolicyAcceptedAt?: string
  lastContactDate?: string
  
  companyId: string
  createdAt: string
  updatedAt: string
}

// Pessoa Física
export interface PessoaFisicaInvestor extends BaseInvestor {
  type: "PESSOA_FISICA"
  fullName: string
  cpf: string
  rg?: string
  birthDate?: string
  gender?: Gender
  maritalStatus?: MaritalStatus
  nationality?: string
  profession?: string
  motherName?: string
  fatherName?: string
  monthlyIncome?: number
  patrimony?: number
  
  // Campos PJ devem ser null
  companyName?: never
  tradeName?: never
  cnpj?: never
  stateRegistration?: never
  municipalRegistration?: never
  foundedDate?: never
  legalNature?: never
  mainActivity?: never
  legalRepName?: never
  legalRepDocument?: never
  legalRepRole?: never
}

// Pessoa Jurídica
export interface PessoaJuridicaInvestor extends BaseInvestor {
  type: "PESSOA_JURIDICA"
  companyName: string
  tradeName?: string
  cnpj: string
  stateRegistration?: string
  municipalRegistration?: string
  foundedDate?: string
  legalNature?: string
  mainActivity?: string
  legalRepName?: string
  legalRepDocument?: string
  legalRepRole?: string
  
  // Campos PF devem ser null
  fullName?: never
  cpf?: never
  rg?: never
  birthDate?: never
  gender?: never
  maritalStatus?: never
  nationality?: never
  profession?: never
  motherName?: never
  fatherName?: never
  monthlyIncome?: never
  patrimony?: never
}

export type Investor = PessoaFisicaInvestor | PessoaJuridicaInvestor

// Investor List Item (resumido)
export interface InvestorListItem {
  id: string
  type: InvestorType
  fullName: string | null
  companyName: string | null
  cpf: string | null
  cnpj: string | null
  email: string
  mobilePhone?: string
  investorCode: string
  status: InvestorStatus
  active: boolean
  _count: {
    investments: number
    distributions: number
  }
}

// Investor com relacionamentos
export interface InvestorDetails {
  id: string
  type: InvestorType
  email: string
  alternativeEmail?: string
  phone?: string
  mobilePhone?: string
  whatsapp?: string
  
  // Pessoa Física fields (pode ser undefined se for PJ)
  fullName?: string
  cpf?: string
  rg?: string
  birthDate?: string
  gender?: Gender
  maritalStatus?: MaritalStatus
  nationality?: string
  profession?: string
  motherName?: string
  fatherName?: string
  monthlyIncome?: number
  patrimony?: number
  
  // Pessoa Jurídica fields (pode ser undefined se for PF)
  companyName?: string
  tradeName?: string
  cnpj?: string
  stateRegistration?: string
  municipalRegistration?: string
  foundedDate?: string
  legalNature?: string
  mainActivity?: string
  legalRepName?: string
  legalRepDocument?: string
  legalRepRole?: string
  
  // Endereço
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  addressType?: AddressType
  
  // Dados Bancários
  bankName?: string
  bankCode?: string
  agencyNumber?: string
  agencyDigit?: string
  accountNumber?: string
  accountDigit?: string
  accountType?: AccountType
  pixKeyType?: PixKeyType
  pixKey?: string
  
  // Investidor
  investorProfile?: InvestorProfile
  investmentGoal?: string
  investorCode: string
  category?: string
  isAccreditedInvestor: boolean
  status: InvestorStatus
  statusReason?: string
  active: boolean
  notes?: string
  internalNotes?: string
  
  // Termos
  termsAcceptedAt?: string
  privacyPolicyAcceptedAt?: string
  lastContactDate?: string
  
  companyId: string
  createdAt: string
  updatedAt: string
  
  investments: Array<{
    id: string
    amount: number
    investmentDate: string
    status: string
    project: {
      id: string
      name: string
      code: string
    }
  }>
  distributions: Array<{
    id: string
    amount: number
    netAmount: number
    distributionDate: string
    status: string
    project: {
      id: string
      name: string
      code: string
    }
  }>
  distributionPolicies: Array<{
    id: string
    percentage: number
    type: string
    active: boolean
    project: {
      id: string
      name: string
      code: string
    }
  }>
  totals: {
    invested: number
    distributed: number
  }
}

// DTOs
export type CreatePessoaFisicaDto = Omit<
  PessoaFisicaInvestor,
  "id" | "companyId" | "createdAt" | "updatedAt"
>

export type CreatePessoaJuridicaDto = Omit<
  PessoaJuridicaInvestor,
  "id" | "companyId" | "createdAt" | "updatedAt"
>

export type CreateInvestorDto = CreatePessoaFisicaDto | CreatePessoaJuridicaDto

export type UpdateInvestorDto = Partial<CreateInvestorDto>

// List Response
export interface InvestorsListResponse {
  data: InvestorListItem[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Query Params
export interface InvestorsQueryParams {
  page?: number
  limit?: number
  search?: string
  type?: InvestorType
  active?: boolean
  status?: InvestorStatus
}

// ============================================
// API Functions
// ============================================

/**
 * Cria novo investidor
 */
export async function createInvestor(
  companyId: string,
  data: CreateInvestorDto
): Promise<Investor> {
  const response = await apiClient.post(`/scp/investors`, data, {
    headers: {
      'X-Company-ID': companyId,
    },
  })
  return response.data
}

/**
 * Lista investidores com paginação e filtros
 */
export async function getInvestors(
  companyId: string,
  params?: InvestorsQueryParams
): Promise<InvestorsListResponse> {
  const response = await apiClient.get(`/scp/investors`, {
    params,
    headers: {
      'X-Company-ID': companyId,
    },
  })
  return response.data
}

/**
 * Busca investidor por ID com detalhes completos
 */
export async function getInvestorById(id: string): Promise<InvestorDetails> {
  const selectedCompany = authApi.getSelectedCompany()
  if (!selectedCompany) {
    throw new Error("Nenhuma empresa selecionada")
  }
  
  const response = await apiClient.get(`/scp/investors/${id}`, {
    headers: {
      'X-Company-ID': selectedCompany.id,
    },
  })
  return response.data
}

/**
 * Atualiza investidor
 */
export async function updateInvestor(
  id: string,
  data: UpdateInvestorDto
): Promise<Investor> {
  const selectedCompany = authApi.getSelectedCompany()
  if (!selectedCompany) {
    throw new Error("Nenhuma empresa selecionada")
  }
  
  const response = await apiClient.put(`/scp/investors/${id}`, data, {
    headers: {
      'X-Company-ID': selectedCompany.id,
    },
  })
  return response.data
}

/**
 * Exclui investidor permanentemente
 * Apenas se não tiver aportes ou distribuições
 */
export async function deleteInvestor(id: string): Promise<{ message: string }> {
  const selectedCompany = authApi.getSelectedCompany()
  if (!selectedCompany) {
    throw new Error("Nenhuma empresa selecionada")
  }
  
  const response = await apiClient.delete(`/scp/investors/${id}`, {
    headers: {
      'X-Company-ID': selectedCompany.id,
    },
  })
  return response.data
}

// ============================================
// Helper Functions
// ============================================

/**
 * Formata nome do investidor (PF ou PJ)
 */
export function getInvestorName(investor: InvestorListItem | Investor): string {
  return investor.type === "PESSOA_FISICA" 
    ? investor.fullName || "" 
    : investor.companyName || ""
}

/**
 * Formata documento do investidor (CPF ou CNPJ)
 */
export function getInvestorDocument(investor: InvestorListItem | Investor): string {
  return investor.type === "PESSOA_FISICA" 
    ? investor.cpf || "" 
    : investor.cnpj || ""
}

/**
 * Retorna badge color baseado no status
 */
export function getStatusColor(status: InvestorStatus): string {
  const colors = {
    ATIVO: "default",
    INATIVO: "secondary",
    SUSPENSO: "outline",
    BLOQUEADO: "destructive",
  }
  return colors[status] || "secondary"
}

/**
 * Retorna label em português do status
 */
export function getStatusLabel(status: InvestorStatus): string {
  const labels = {
    ATIVO: "Ativo",
    INATIVO: "Inativo",
    SUSPENSO: "Suspenso",
    BLOQUEADO: "Bloqueado",
  }
  return labels[status] || status
}

/**
 * Retorna label em português do tipo
 */
export function getTypeLabel(type: InvestorType): string {
  return type === "PESSOA_FISICA" ? "Pessoa Física" : "Pessoa Jurídica"
}

/**
 * Retorna abreviação do tipo
 */
export function getTypeAbbreviation(type: InvestorType): string {
  return type === "PESSOA_FISICA" ? "PF" : "PJ"
}

// Export de API object
export const investorsApi = {
  create: createInvestor,
  getAll: getInvestors,
  getById: getInvestorById,
  update: updateInvestor,
  delete: deleteInvestor,
  helpers: {
    getName: getInvestorName,
    getDocument: getInvestorDocument,
    getStatusColor,
    getStatusLabel,
    getTypeLabel,
    getTypeAbbreviation,
  },
}
