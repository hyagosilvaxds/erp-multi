import { apiClient } from './client'
import { authApi } from './auth'

// ==========================================
// TYPES
// ==========================================

export interface EarningType {
  id: string
  companyId: string
  code: string
  name: string
  description?: string
  isRecurrent: boolean
  isPercentage: boolean
  baseValue?: string
  hasINSS: boolean
  hasFGTS: boolean
  hasIRRF: boolean
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateEarningTypeRequest {
  code: string
  name: string
  description?: string
  isRecurrent: boolean
  isPercentage: boolean
  baseValue?: number
  hasINSS: boolean
  hasFGTS: boolean
  hasIRRF: boolean
}

export interface UpdateEarningTypeRequest extends Partial<CreateEarningTypeRequest> {}

export interface ListEarningTypesParams {
  active?: boolean
  isRecurrent?: boolean
  search?: string
}

export interface ListEarningTypesResponse {
  data: EarningType[]
  total: number
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

/**
 * Lista todos os tipos de proventos
 */
const getAll = async (params?: ListEarningTypesParams): Promise<ListEarningTypesResponse> => {
  const companyId = getCompanyId()
  const response = await apiClient.get('/earning-types', {
    params,
    headers: {
      'x-company-id': companyId,
    },
  })
  return response.data
}

/**
 * Obtém um tipo de provento por ID
 */
const getById = async (id: string): Promise<EarningType> => {
  const companyId = getCompanyId()
  const response = await apiClient.get(`/earning-types/${id}`, {
    headers: {
      'x-company-id': companyId,
    },
  })
  return response.data
}

/**
 * Cria um novo tipo de provento
 */
const create = async (data: CreateEarningTypeRequest): Promise<EarningType> => {
  const companyId = getCompanyId()
  const response = await apiClient.post('/earning-types', data, {
    headers: {
      'x-company-id': companyId,
    },
  })
  return response.data
}

/**
 * Atualiza um tipo de provento
 */
const update = async (id: string, data: UpdateEarningTypeRequest): Promise<EarningType> => {
  const companyId = getCompanyId()
  const response = await apiClient.patch(`/earning-types/${id}`, data, {
    headers: {
      'x-company-id': companyId,
    },
  })
  return response.data
}

/**
 * Deleta um tipo de provento
 */
const deleteEarningType = async (id: string): Promise<void> => {
  const companyId = getCompanyId()
  await apiClient.delete(`/earning-types/${id}`, {
    headers: {
      'x-company-id': companyId,
    },
  })
}

/**
 * Ativa/Desativa um tipo de provento
 */
const toggleActive = async (id: string): Promise<EarningType> => {
  const companyId = getCompanyId()
  const response = await apiClient.patch(
    `/earning-types/${id}/toggle-active`,
    {},
    {
      headers: {
        'x-company-id': companyId,
      },
    }
  )
  return response.data
}

// ==========================================
// EXPORTS
// ==========================================

export const earningTypesApi = {
  getAll,
  getById,
  create,
  update,
  delete: deleteEarningType,
  toggleActive,
}
