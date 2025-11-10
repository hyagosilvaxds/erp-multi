import { apiClient } from "./client"

// ============================================
// Types & Interfaces
// ============================================

export type DistributionStatus = "PENDENTE" | "PAGO" | "CANCELADO"

// Distribution Interface
export interface Distribution {
  id: string
  companyId: string
  projectId: string
  investorId: string
  amount: number
  percentage: number
  baseValue: number
  netAmount: number
  irrf: number
  otherDeductions: number
  distributionDate: string
  competenceDate: string
  paymentDate?: string
  status: DistributionStatus
  notes?: string
  attachments?: string[]
  paidAt?: string
  createdAt: string
  updatedAt: string
}

// Distribution with relationships
export interface DistributionDetails extends Distribution {
  project: {
    id: string
    name: string
    code: string
    status: string
    totalValue: number
    expectedReturn: number
    investedValue: number
    distributedValue: number
  }
  investor: {
    id: string
    type: "PESSOA_FISICA" | "PESSOA_JURIDICA"
    fullName?: string
    companyName?: string
    cpf?: string
    cnpj?: string
    email: string
    phone: string
  }
}

// Distribution List Item
export interface DistributionListItem {
  id: string
  projectId: string
  investorId: string
  amount: number
  percentage: number
  baseValue: number
  netAmount: number
  irrf: number
  otherDeductions: number
  distributionDate: string
  competenceDate: string
  paymentDate?: string
  status: DistributionStatus
  paidAt?: string
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
export interface CreateDistributionDto {
  projectId: string
  investorId: string
  amount: number
  percentage: number
  baseValue: number
  distributionDate: string
  competenceDate: string
  status: DistributionStatus
  irrf?: number
  otherDeductions?: number
  notes?: string
  attachments?: string[]
}

export interface BulkDistributionItem {
  investorId: string
  amount: number
  percentage: number
  irrf?: number
  otherDeductions?: number
  notes?: string
}

export interface BulkCreateDistributionsDto {
  projectId: string
  baseValue: number
  referenceNumber?: string
  distributionDate: string
  competenceDate: string
  paymentMethod?: "TED" | "PIX" | "DOC" | "DINHEIRO" | "CHEQUE"
  paymentDate?: string
  status?: DistributionStatus
  attachments?: string[]
  distributions: BulkDistributionItem[]
}

export interface BulkCreateDistributionsResponse {
  message: string
  count: number
  distributions: DistributionDetails[]
}

// Bulk Create Automatic DTO (based on policies)
export interface BulkCreateAutomaticDto {
  projectId: string
  baseValue: number
  competenceDate: string
  distributionDate: string
  irrf?: number           // Alíquota de IRRF em % (ex: 15 para 15%)
  otherDeductions?: number // Valor fixo de outras deduções em R$
}

export interface BulkCreateAutomaticResponse {
  message: string
  distributions: Array<{
    id: string
    investorId: string
    amount: number
    percentage: number
    netAmount: number
    status: DistributionStatus
  }>
}

export type UpdateDistributionDto = Partial<CreateDistributionDto> & {
  paymentDate?: string
  paidAt?: string
}

// List Response
export interface DistributionsListResponse {
  data: DistributionListItem[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Query Params
export interface DistributionsQueryParams {
  page?: number
  limit?: number
  projectId?: string
  investorId?: string
  status?: DistributionStatus
}

// By Investor Response
export interface DistributionsByInvestorResponse {
  investor: {
    id: string
    type: "PESSOA_FISICA" | "PESSOA_JURIDICA"
    name: string
    document: string
  }
  distributions: Array<{
    id: string
    amount: number
    netAmount: number
    status: DistributionStatus
    distributionDate: string
    project: {
      id: string
      name: string
      code: string
    }
  }>
  summary: {
    totalPaid: number
    totalPending: number
  }
}

// By Project Response
export interface DistributionsByProjectResponse {
  project: {
    id: string
    name: string
    code: string
  }
  distributions: Array<{
    id: string
    amount: number
    netAmount: number
    status: DistributionStatus
    distributionDate: string
    investor: {
      id: string
      type: "PESSOA_FISICA" | "PESSOA_JURIDICA"
      fullName?: string
      companyName?: string
    }
  }>
  summary: {
    totalPaid: number
    totalPending: number
  }
}

// ============================================
// API Functions
// ============================================

/**
 * Cria distribuição manual
 */
export async function createDistribution(
  companyId: string,
  data: CreateDistributionDto
): Promise<Distribution> {
  const response = await apiClient.post<Distribution>(
    "/scp/distributions",
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
 * Cria distribuições em lote (bulk)
 */
export async function bulkCreateDistributions(
  companyId: string,
  data: BulkCreateDistributionsDto
): Promise<BulkCreateDistributionsResponse> {
  const response = await apiClient.post<BulkCreateDistributionsResponse>(
    "/scp/distributions/bulk",
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
 * Cria distribuições automaticamente baseadas nas políticas ativas
 */
export async function bulkCreateAutomatic(
  companyId: string,
  data: BulkCreateAutomaticDto
): Promise<BulkCreateAutomaticResponse> {
  const response = await apiClient.post<BulkCreateAutomaticResponse>(
    "/scp/distributions/bulk-create",
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
 * Lista distribuições com paginação e filtros
 */
export async function getDistributions(
  companyId: string,
  params?: DistributionsQueryParams
): Promise<DistributionsListResponse> {
  const response = await apiClient.get<DistributionsListResponse>(
    "/scp/distributions",
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
 * Lista distribuições por investidor
 */
export async function getDistributionsByInvestor(
  companyId: string,
  investorId: string
): Promise<DistributionsByInvestorResponse> {
  const response = await apiClient.get<DistributionsByInvestorResponse>(
    `/scp/distributions/by-investor/${investorId}`,
    {
      headers: {
        "X-Company-ID": companyId,
      },
    }
  )
  return response.data
}

/**
 * Lista distribuições por projeto
 */
export async function getDistributionsByProject(
  companyId: string,
  projectId: string
): Promise<DistributionsByProjectResponse> {
  const response = await apiClient.get<DistributionsByProjectResponse>(
    `/scp/distributions/by-project/${projectId}`,
    {
      headers: {
        "X-Company-ID": companyId,
      },
    }
  )
  return response.data
}

/**
 * Busca distribuição por ID
 */
export async function getDistributionById(
  companyId: string,
  distributionId: string
): Promise<DistributionDetails> {
  const response = await apiClient.get<DistributionDetails>(
    `/scp/distributions/${distributionId}`,
    {
      headers: {
        "X-Company-ID": companyId,
      },
    }
  )
  return response.data
}

/**
 * Atualiza distribuição
 */
export async function updateDistribution(
  companyId: string,
  distributionId: string,
  data: UpdateDistributionDto
): Promise<Distribution> {
  const response = await apiClient.put<Distribution>(
    `/scp/distributions/${distributionId}`,
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
 * Exclui distribuição
 */
export async function deleteDistribution(
  companyId: string,
  distributionId: string
): Promise<void> {
  await apiClient.delete(`/scp/distributions/${distributionId}`, {
    headers: {
      "X-Company-ID": companyId,
    },
  })
}

/**
 * Marca distribuição como PAGA
 */
export async function markDistributionAsPaid(
  companyId: string,
  distributionId: string
): Promise<{
  id: string
  status: DistributionStatus
  paidAt: string
  amount: number
  netAmount: number
  irrf: number
  otherDeductions: number
}> {
  const response = await apiClient.post(
    `/scp/distributions/${distributionId}/mark-as-paid`,
    {},
    {
      headers: {
        "X-Company-ID": companyId,
      },
    }
  )
  return response.data
}

/**
 * Marca distribuição como CANCELADA
 */
export async function markDistributionAsCanceled(
  companyId: string,
  distributionId: string
): Promise<{
  id: string
  status: DistributionStatus
  amount: number
  netAmount: number
}> {
  const response = await apiClient.post(
    `/scp/distributions/${distributionId}/mark-as-canceled`,
    {},
    {
      headers: {
        "X-Company-ID": companyId,
      },
    }
  )
  return response.data
}

// ============================================
// Helper Functions
// ============================================

/**
 * Retorna label do status
 */
export function getStatusLabel(status: DistributionStatus): string {
  const labels: Record<DistributionStatus, string> = {
    PENDENTE: "Pendente",
    PAGO: "Pago",
    CANCELADO: "Cancelado",
  }
  return labels[status]
}

/**
 * Retorna cor do status
 */
export function getStatusColor(
  status: DistributionStatus
): "default" | "destructive" | "secondary" {
  const colors: Record<DistributionStatus, "default" | "destructive" | "secondary"> = {
    PENDENTE: "secondary",
    PAGO: "default",
    CANCELADO: "destructive",
  }
  return colors[status]
}

/**
 * Calcula valor líquido
 */
export function calculateNetAmount(
  amount: number,
  irrf: number = 0,
  otherDeductions: number = 0
): number {
  return amount - irrf - otherDeductions
}

/**
 * Calcula IRRF (exemplo: 5%)
 */
export function calculateIRRF(amount: number, rate: number = 0.05): number {
  return amount * rate
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
 * Formata percentual
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`
}

/**
 * Formata data
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("pt-BR")
}

/**
 * Formata data e hora
 */
export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString("pt-BR")
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
 * Formata competência (MM/YYYY)
 */
export function formatCompetence(date: string): string {
  const d = new Date(date)
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${month}/${year}`
}

/**
 * Retorna cor do valor (positivo/negativo)
 */
export function getAmountColor(amount: number): string {
  return amount >= 0 ? "text-green-600" : "text-red-600"
}

// Export de API object
export const distributionsApi = {
  create: createDistribution,
  bulkCreate: bulkCreateDistributions,
  bulkCreateAutomatic: bulkCreateAutomatic,
  getAll: getDistributions,
  getByInvestor: getDistributionsByInvestor,
  getByProject: getDistributionsByProject,
  getById: getDistributionById,
  update: updateDistribution,
  delete: deleteDistribution,
  markAsPaid: markDistributionAsPaid,
  markAsCanceled: markDistributionAsCanceled,
  helpers: {
    getStatusLabel,
    getStatusColor,
    calculateNetAmount,
    calculateIRRF,
    formatCurrency,
    formatPercentage,
    formatDate,
    formatDateTime,
    getInvestorName,
    getInvestorDocument,
    formatCompetence,
    getAmountColor,
  },
}
