import { apiClient } from "./client"

// ============================================
// Types & Interfaces
// ============================================

export type DistributionPolicyType = "PROPORCIONAL" | "FIXO"

// Distribution Policy Interface
export interface DistributionPolicy {
  id: string
  companyId: string
  projectId: string
  investorId: string
  percentage: number
  type: DistributionPolicyType
  active: boolean
  startDate: string
  endDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

// Policy with relationships
export interface DistributionPolicyDetails extends DistributionPolicy {
  project: {
    id: string
    name: string
    code: string
  }
  investor: {
    id: string
    type: "PESSOA_FISICA" | "PESSOA_JURIDICA"
    fullName?: string
    companyName?: string
    cpf?: string
    cnpj?: string
  }
}

// Policy List Item
export interface DistributionPolicyListItem {
  id: string
  percentage: number
  type: DistributionPolicyType
  active: boolean
  startDate: string
  project: {
    id: string
    name: string
    code: string
  }
  investor: {
    id: string
    type: "PESSOA_FISICA" | "PESSOA_JURIDICA"
    fullName?: string
    companyName?: string
    cpf?: string
    cnpj?: string
  }
}

// DTOs
export interface CreateDistributionPolicyDto {
  projectId: string
  investorId: string
  percentage: number
  type: DistributionPolicyType
  active: boolean
  startDate: string
  endDate?: string
  notes?: string
}

export type UpdateDistributionPolicyDto = Partial<CreateDistributionPolicyDto>

// List Response
export interface DistributionPoliciesListResponse {
  data: DistributionPolicyListItem[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Query Params
export interface DistributionPoliciesQueryParams {
  page?: number
  limit?: number
  projectId?: string
  investorId?: string
  active?: boolean
}

// By Project Response
export interface PoliciesByProjectResponse {
  project: {
    id: string
    name: string
    code: string
  }
  policies: Array<{
    id: string
    percentage: number
    type: DistributionPolicyType
    active: boolean
    investor: {
      id: string
      type: "PESSOA_FISICA" | "PESSOA_JURIDICA"
      fullName?: string
      companyName?: string
      cpf?: string
      cnpj?: string
    }
  }>
  summary: {
    totalPolicies: number
    totalPercentage: number
    remainingPercentage: number
    isComplete: boolean
  }
}

// Calculate Amounts
export interface CalculateAmountsDto {
  baseValue: number
}

export interface CalculatedAmount {
  policyId: string
  investorId: string
  investorName: string
  percentage: number
  amount: number
}

// ============================================
// API Functions
// ============================================

/**
 * Cria nova política de distribuição
 */
export async function createDistributionPolicy(
  companyId: string,
  data: CreateDistributionPolicyDto
): Promise<DistributionPolicy> {
  const response = await apiClient.post<DistributionPolicy>(
    "/scp/distribution-policies",
    data,
    {
      headers: {
        "X-Company-ID": companyId,
      },
    }
  )
  return response.data
}

/**
 * Lista políticas com paginação e filtros
 */
export async function getDistributionPolicies(
  companyId: string,
  params?: DistributionPoliciesQueryParams
): Promise<DistributionPoliciesListResponse> {
  const response = await apiClient.get<DistributionPoliciesListResponse>(
    "/scp/distribution-policies",
    {
      params,
      headers: {
        "X-Company-ID": companyId,
      },
    }
  )
  return response.data
}

/**
 * Lista políticas ativas de um projeto com resumo
 */
export async function getPoliciesByProject(
  companyId: string,
  projectId: string
): Promise<PoliciesByProjectResponse> {
  const response = await apiClient.get<PoliciesByProjectResponse>(
    `/scp/distribution-policies/by-project/${projectId}`,
    {
      headers: {
        "X-Company-ID": companyId,
      },
    }
  )
  return response.data
}

/**
 * Calcula valores de distribuição (preview) com base nas políticas ativas
 */
export async function calculateDistributionAmounts(
  companyId: string,
  projectId: string,
  data: CalculateAmountsDto
): Promise<CalculatedAmount[]> {
  const response = await apiClient.post<CalculatedAmount[]>(
    `/scp/distribution-policies/calculate-amounts/${projectId}`,
    data,
    {
      headers: {
        "X-Company-ID": companyId,
      },
    }
  )
  return response.data
}

/**
 * Busca política por ID
 */
export async function getDistributionPolicyById(
  companyId: string,
  policyId: string
): Promise<DistributionPolicyDetails> {
  const response = await apiClient.get<DistributionPolicyDetails>(
    `/scp/distribution-policies/${policyId}`,
    {
      headers: {
        "X-Company-ID": companyId,
      },
    }
  )
  return response.data
}

/**
 * Atualiza política
 */
export async function updateDistributionPolicy(
  companyId: string,
  policyId: string,
  data: UpdateDistributionPolicyDto
): Promise<DistributionPolicy> {
  const response = await apiClient.put<DistributionPolicy>(
    `/scp/distribution-policies/${policyId}`,
    data,
    {
      headers: {
        "X-Company-ID": companyId,
      },
    }
  )
  return response.data
}

/**
 * Exclui política
 */
export async function deleteDistributionPolicy(
  companyId: string,
  policyId: string
): Promise<void> {
  await apiClient.delete(`/scp/distribution-policies/${policyId}`, {
    headers: {
      "X-Company-ID": companyId,
    },
  })
}

// ============================================
// Helper Functions
// ============================================

/**
 * Retorna label do tipo de política
 */
export function getTypeLabel(type: DistributionPolicyType): string {
  const labels: Record<DistributionPolicyType, string> = {
    PROPORCIONAL: "Proporcional",
    FIXO: "Fixo",
  }
  return labels[type]
}

/**
 * Retorna cor do status ativo/inativo
 */
export function getActiveColor(
  active: boolean
): "default" | "success" | "destructive" | "secondary" {
  return active ? "default" : "secondary"
}

/**
 * Retorna label do status ativo/inativo
 */
export function getActiveLabel(active: boolean): string {
  return active ? "Ativa" : "Inativa"
}

/**
 * Formata percentual
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`
}

/**
 * Formata valor monetário
 */
export function formatCurrency(value: number): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "R$ 0,00"
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

/**
 * Formata data
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("pt-BR")
}

/**
 * Retorna nome do investidor
 */
export function getInvestorName(investor: {
  type: "PESSOA_FISICA" | "PESSOA_JURIDICA"
  fullName?: string
  companyName?: string
}): string {
  return investor.type === "PESSOA_FISICA"
    ? investor.fullName || "Sem nome"
    : investor.companyName || "Sem nome"
}

/**
 * Retorna documento do investidor
 */
export function getInvestorDocument(investor: {
  type: "PESSOA_FISICA" | "PESSOA_JURIDICA"
  cpf?: string
  cnpj?: string
}): string {
  return investor.type === "PESSOA_FISICA"
    ? investor.cpf || "Sem CPF"
    : investor.cnpj || "Sem CNPJ"
}

/**
 * Valida se percentual está entre 0 e 100
 */
export function isValidPercentage(value: number): boolean {
  return value >= 0 && value <= 100
}

/**
 * Valida se soma de percentuais não excede 100
 */
export function isValidTotalPercentage(
  currentPercentage: number,
  newPercentage: number,
  excludePolicyId?: string
): boolean {
  // Esta validação seria feita no backend, mas podemos ter no frontend também
  return currentPercentage - (excludePolicyId ? 0 : 0) + newPercentage <= 100
}

/**
 * Retorna cor baseada no percentual restante
 */
export function getRemainingPercentageColor(remaining: number): string {
  if (remaining === 0) return "text-green-600"
  if (remaining < 20) return "text-yellow-600"
  return "text-red-600"
}

/**
 * Calcula valor de distribuição baseado em percentual
 */
export function calculateDistributionValue(
  baseValue: number,
  percentage: number
): number {
  return (baseValue * percentage) / 100
}

// Export de API object
export const distributionPoliciesApi = {
  create: createDistributionPolicy,
  getAll: getDistributionPolicies,
  getByProject: getPoliciesByProject,
  calculateAmounts: calculateDistributionAmounts,
  getById: getDistributionPolicyById,
  update: updateDistributionPolicy,
  delete: deleteDistributionPolicy,
  helpers: {
    getTypeLabel,
    getActiveColor,
    getActiveLabel,
    formatPercentage,
    formatCurrency,
    formatDate,
    getInvestorName,
    getInvestorDocument,
    isValidPercentage,
    isValidTotalPercentage,
    getRemainingPercentageColor,
    calculateDistributionValue,
  },
}
