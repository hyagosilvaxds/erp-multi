import { apiClient } from './client'
import { authApi } from './auth'

// ==========================================
// TYPES
// ==========================================

export interface CostCenter {
  id: string
  companyId: string
  codigo: string
  nome: string
  descricao?: string
  centroCustoPaiId?: string | null
  nivel: number
  responsavel?: string | null
  email?: string | null
  ativo: boolean
  createdAt: string
  updatedAt: string
  centroCustoPai?: {
    id: string
    codigo: string
    nome: string
  } | null
  _count?: {
    subCentros: number
  }
}

export interface ListCostCentersParams {
  active?: boolean
  search?: string
  page?: number
  limit?: number
}

export interface ListCostCentersResponse {
  data: CostCenter[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ==========================================
// API
// ==========================================

const getCompanyId = () => {
  const company = authApi.getSelectedCompany()
  if (!company?.id) {
    throw new Error('Nenhuma empresa selecionada')
  }
  return company.id
}

export const costCentersApi = {
  /**
   * Lista todos os centros de custo
   */
  getAll: async (params?: ListCostCentersParams): Promise<CostCenter[]> => {
    const companyId = getCompanyId()
    const response = await apiClient.get(`/centro-custo/company/${companyId}`, {
      params,
      headers: {
        'x-company-id': companyId,
      },
    })
    // Se a API retornar um array direto, retorna como está
    // Se retornar um objeto com data, adapta para o formato esperado
    return Array.isArray(response.data) ? response.data : response.data.data || []
  },

  /**
   * Obtém um centro de custo por ID
   */
  getById: async (id: string): Promise<CostCenter> => {
    const companyId = getCompanyId()
    const response = await apiClient.get(`/centro-custo/${id}`, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },
}
