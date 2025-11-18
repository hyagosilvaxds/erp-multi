import { apiClient } from "./client"
import { authApi } from "./auth"

// ============================================
// Types & Interfaces
// ============================================

export type ProjectStatus = "ATIVO" | "CONCLUIDO" | "CANCELADO" | "SUSPENSO"

// Project Interface
export interface Project {
  id: string
  companyId: string
  name: string
  code: string
  description?: string
  objectives?: string
  totalValue: number
  expectedReturn: number
  investedValue: number
  distributedValue: number
  startDate: string
  endDate?: string
  status: ProjectStatus
  active: boolean
  notes?: string
  attachments?: string[]
  createdAt: string
  updatedAt: string
}

// Project List Item (resumido)
export interface ProjectListItem {
  id: string
  name: string
  code: string
  totalValue: number
  investedValue: number
  distributedValue: number
  status: ProjectStatus
  active: boolean
  startDate: string
  _count: {
    investments: number
    distributions: number
    distributionPolicies: number
  }
}

// Project Details (com relacionamentos)
export interface ProjectDetails extends Project {
  _count?: {
    investments: number
    distributions: number
    distributionPolicies: number
  }
  investments: Array<{
    id: string
    amount: number
    status: string
    investmentDate: string
    investor: {
      id: string
      type: string
      fullName?: string
      companyName?: string
      cpf?: string
      cnpj?: string
    }
  }>
  distributions: Array<{
    id: string
    amount: number
    netAmount: number
    status: string
    distributionDate: string
    investor: {
      id: string
      type: string
      fullName?: string
      companyName?: string
    }
  }>
  distributionPolicies: Array<{
    id: string
    percentage: number
    type: string
    active: boolean
    investor: {
      id: string
      type: string
      fullName?: string
      companyName?: string
    }
  }>
  totals: {
    totalInvested: number
    totalDistributed: number
    pendingDistributions: number
    availableBalance: number
  }
}

// Project Stats
export interface ProjectStats {
  projectId: string
  projectName: string
  projectCode: string
  totalValue: number
  totalInvested: number
  totalDistributed: number
  pendingDistributions: number
  availableBalance: number
  roi: string
}

export interface ProjectsStatsResponse {
  projects: ProjectStats[]
  summary: {
    totalProjects: number
    totalInvested: number
    totalDistributed: number
    totalPending: number
    totalAvailable: number
    averageROI: string
  }
}

// DTOs
export interface CreateProjectDto {
  name: string
  code: string
  description?: string
  totalValue: number
  startDate: string
  endDate?: string
  status: ProjectStatus
  active: boolean
  attachments?: string[]
}

export type UpdateProjectDto = Partial<CreateProjectDto> & {
  notes?: string
}

// List Response
export interface ProjectsListResponse {
  data: ProjectListItem[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Query Params
export interface ProjectsQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: ProjectStatus
  active?: boolean
}

// ============================================
// API Functions
// ============================================

/**
 * Cria novo projeto
 */
export async function createProject(
  companyId: string,
  data: CreateProjectDto
): Promise<Project> {
  const response = await apiClient.post(`/scp/projects`, data, {
    headers: {
      'X-Company-ID': companyId,
    },
  })
  return response.data
}

/**
 * Lista projetos com paginação e filtros
 */
export async function getProjects(
  companyId: string,
  params?: ProjectsQueryParams
): Promise<ProjectsListResponse> {
  const response = await apiClient.get(`/scp/projects`, {
    params,
    headers: {
      'X-Company-ID': companyId,
    },
  })
  return response.data
}

/**
 * Retorna estatísticas consolidadas de todos os projetos
 */
export async function getProjectsStats(
  companyId: string
): Promise<ProjectsStatsResponse> {
  const response = await apiClient.get(`/scp/projects/stats`, {
    headers: {
      'X-Company-ID': companyId,
    },
  })
  return response.data
}

/**
 * Busca projeto por ID com detalhes completos
 */
export async function getProjectById(id: string): Promise<ProjectDetails> {
  const selectedCompany = authApi.getSelectedCompany()
  if (!selectedCompany) {
    throw new Error("Nenhuma empresa selecionada")
  }
  
  const response = await apiClient.get(`/scp/projects/${id}`, {
    headers: {
      'X-Company-ID': selectedCompany.id,
    },
  })
  return response.data
}

/**
 * Atualiza projeto
 */
export async function updateProject(
  id: string,
  data: UpdateProjectDto
): Promise<Project> {
  const selectedCompany = authApi.getSelectedCompany()
  if (!selectedCompany) {
    throw new Error("Nenhuma empresa selecionada")
  }
  
  const response = await apiClient.put(`/scp/projects/${id}`, data, {
    headers: {
      'X-Company-ID': selectedCompany.id,
    },
  })
  return response.data
}

/**
 * Exclui projeto permanentemente
 * Apenas se não tiver aportes ou distribuições
 */
export async function deleteProject(id: string): Promise<{ message: string }> {
  const selectedCompany = authApi.getSelectedCompany()
  if (!selectedCompany) {
    throw new Error("Nenhuma empresa selecionada")
  }
  
  const response = await apiClient.delete(`/scp/projects/${id}`, {
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
 * Retorna badge color baseado no status
 */
export function getStatusColor(status: ProjectStatus): string {
  const colors = {
    ATIVO: "default",
    CONCLUIDO: "secondary",
    CANCELADO: "destructive",
    SUSPENSO: "outline",
  }
  return colors[status] || "secondary"
}

/**
 * Retorna label em português do status
 */
export function getStatusLabel(status: ProjectStatus): string {
  const labels = {
    ATIVO: "Ativo",
    CONCLUIDO: "Concluído",
    CANCELADO: "Cancelado",
    SUSPENSO: "Suspenso",
  }
  return labels[status] || status
}

/**
 * Calcula ROI (%)
 */
export function calculateROI(invested: number, distributed: number): string {
  if (invested === 0) return "0.00"
  return ((distributed / invested) * 100).toFixed(2)
}

/**
 * Calcula percentual investido
 */
export function calculateInvestedPercentage(
  totalValue: number,
  investedValue: number
): number {
  if (totalValue === 0) return 0
  return Math.round((investedValue / totalValue) * 100)
}

/**
 * Formata valor em moeda
 */
export function formatCurrency(value: number): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "R$ 0,00"
  }
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

// Export de API object
export const projectsApi = {
  create: createProject,
  getAll: getProjects,
  getStats: getProjectsStats,
  getById: getProjectById,
  update: updateProject,
  delete: deleteProject,
  helpers: {
    getStatusColor,
    getStatusLabel,
    calculateROI,
    calculateInvestedPercentage,
    formatCurrency,
  },
}
