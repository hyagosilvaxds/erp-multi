import { apiClient } from "./client"

// ============================================
// Types & Interfaces
// ============================================

export type InvestmentStatus = "PENDENTE" | "CONFIRMADO" | "CANCELADO"
export type PaymentMethod =
  | "TRANSFERENCIA"
  | "TED"
  | "PIX"
  | "CHEQUE"
  | "BOLETO"
  | "DINHEIRO"

// Investment Interface
export interface Investment {
  id: string
  companyId: string
  projectId: string
  investorId: string
  amount: number
  investmentDate: string
  referenceNumber: string
  documentNumber?: string
  paymentMethod: PaymentMethod
  status: InvestmentStatus
  notes?: string
  attachments?: string[]
  createdAt: string
  updatedAt: string
}

// Investment with relationships
export interface InvestmentDetails extends Investment {
  project: {
    id: string
    name: string
    code: string
    totalValue: number
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

// Investment List Item
export interface InvestmentListItem {
  id: string
  projectId: string
  investorId: string
  amount: number
  investmentDate: string
  referenceNumber: string
  paymentMethod: PaymentMethod
  status: InvestmentStatus
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
  }
}

// DTOs
export interface CreateInvestmentDto {
  projectId: string
  investorId: string
  amount: number
  investmentDate: string
  paymentMethod: PaymentMethod
  status: InvestmentStatus
  referenceNumber: string
  documentNumber?: string
  notes?: string
  attachments?: string[]
}

export type UpdateInvestmentDto = Partial<CreateInvestmentDto>

// List Response
export interface InvestmentsListResponse {
  data: InvestmentListItem[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Query Params
export interface InvestmentsQueryParams {
  page?: number
  limit?: number
  projectId?: string
  investorId?: string
  status?: InvestmentStatus
  search?: string
}

// By Investor Response
export interface InvestmentsByInvestorResponse {
  investor: {
    id: string
    type: "PESSOA_FISICA" | "PESSOA_JURIDICA"
    name: string
    document: string
  }
  investments: Array<
    Investment & {
      project: {
        id: string
        name: string
        code: string
      }
    }
  >
  summary: {
    totalConfirmed: number
    totalPending: number
  }
}

// By Project Response
export interface InvestmentsByProjectResponse {
  project: {
    id: string
    name: string
    code: string
  }
  investments: Array<
    Investment & {
      investor: {
        id: string
        type: "PESSOA_FISICA" | "PESSOA_JURIDICA"
        fullName?: string
        companyName?: string
        cpf?: string
        cnpj?: string
      }
    }
  >
  summary: {
    totalConfirmed: number
    totalPending: number
  }
}

// ============================================
// API Functions
// ============================================

/**
 * Cria novo aporte
 */
export async function createInvestment(
  companyId: string,
  data: CreateInvestmentDto
): Promise<Investment> {
  const response = await apiClient.post<Investment>("/scp/investments", data, {
    headers: {
      "X-Company-ID": companyId,
    },
  })
  return response.data
}

/**
 * Lista aportes com paginação e filtros
 */
export async function getInvestments(
  companyId: string,
  params?: InvestmentsQueryParams
): Promise<InvestmentsListResponse> {
  const response = await apiClient.get<InvestmentsListResponse>(
    "/scp/investments",
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
 * Lista aportes por investidor
 */
export async function getInvestmentsByInvestor(
  companyId: string,
  investorId: string
): Promise<InvestmentsByInvestorResponse> {
  const response = await apiClient.get<InvestmentsByInvestorResponse>(
    `/scp/investments/by-investor/${investorId}`,
    {
      headers: {
        "X-Company-ID": companyId,
      },
    }
  )
  return response.data
}

/**
 * Lista aportes por projeto
 */
export async function getInvestmentsByProject(
  companyId: string,
  projectId: string
): Promise<InvestmentsByProjectResponse> {
  const response = await apiClient.get<InvestmentsByProjectResponse>(
    `/scp/investments/by-project/${projectId}`,
    {
      headers: {
        "X-Company-ID": companyId,
      },
    }
  )
  return response.data
}

/**
 * Busca aporte por ID
 */
export async function getInvestmentById(
  companyId: string,
  investmentId: string
): Promise<InvestmentDetails> {
  const response = await apiClient.get<InvestmentDetails>(
    `/scp/investments/${investmentId}`,
    {
      headers: {
        "X-Company-ID": companyId,
      },
    }
  )
  return response.data
}

/**
 * Atualiza aporte
 */
export async function updateInvestment(
  companyId: string,
  investmentId: string,
  data: UpdateInvestmentDto
): Promise<Investment> {
  const response = await apiClient.put<Investment>(
    `/scp/investments/${investmentId}`,
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
 * Exclui aporte
 */
export async function deleteInvestment(
  companyId: string,
  investmentId: string
): Promise<void> {
  await apiClient.delete(`/scp/investments/${investmentId}`, {
    headers: {
      "X-Company-ID": companyId,
    },
  })
}

// ============================================
// Helper Functions
// ============================================

/**
 * Retorna label do status
 */
export function getStatusLabel(status: InvestmentStatus): string {
  const labels: Record<InvestmentStatus, string> = {
    PENDENTE: "Pendente",
    CONFIRMADO: "Confirmado",
    CANCELADO: "Cancelado",
  }
  return labels[status]
}

/**
 * Retorna cor do status
 */
export function getStatusColor(
  status: InvestmentStatus
): "default" | "success" | "destructive" | "warning" {
  const colors: Record<
    InvestmentStatus,
    "default" | "success" | "destructive" | "warning"
  > = {
    PENDENTE: "warning",
    CONFIRMADO: "success",
    CANCELADO: "destructive",
  }
  return colors[status]
}

/**
 * Retorna label do método de pagamento
 */
export function getPaymentMethodLabel(method: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    TRANSFERENCIA: "Transferência",
    TED: "TED",
    PIX: "PIX",
    CHEQUE: "Cheque",
    BOLETO: "Boleto",
    DINHEIRO: "Dinheiro",
  }
  return labels[method]
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

// Export de API object
export const investmentsApi = {
  create: createInvestment,
  getAll: getInvestments,
  getByInvestor: getInvestmentsByInvestor,
  getByProject: getInvestmentsByProject,
  getById: getInvestmentById,
  update: updateInvestment,
  delete: deleteInvestment,
  helpers: {
    getStatusLabel,
    getStatusColor,
    getPaymentMethodLabel,
    formatCurrency,
    formatDate,
    formatDateTime,
    getInvestorName,
    getInvestorDocument,
  },
}
