import { apiClient } from './client'
import { authApi } from './auth'

// ==========================================
// TYPES
// ==========================================

export interface DeductionType {
  id: string
  companyId: string
  code: string
  name: string
  description?: string
  isRecurrent: boolean
  isPercentage: boolean
  baseValue?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateDeductionTypeRequest {
  code: string
  name: string
  description?: string
  isRecurrent: boolean
  isPercentage: boolean
  baseValue?: number
}

export interface UpdateDeductionTypeRequest extends Partial<CreateDeductionTypeRequest> {}

export interface ListDeductionTypesParams {
  active?: boolean
  isRecurrent?: boolean
  search?: string
}

export interface ListDeductionTypesResponse {
  data: DeductionType[]
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
 * Lista todos os tipos de descontos
 */
const getAll = async (params?: ListDeductionTypesParams): Promise<ListDeductionTypesResponse> => {
  const companyId = getCompanyId()
  const response = await apiClient.get('/deduction-types', {
    params,
    headers: {
      'x-company-id': companyId,
    },
  })
  return response.data
}

/**
 * Obtém um tipo de desconto por ID
 */
const getById = async (id: string): Promise<DeductionType> => {
  const companyId = getCompanyId()
  const response = await apiClient.get(`/deduction-types/${id}`, {
    headers: {
      'x-company-id': companyId,
    },
  })
  return response.data
}

/**
 * Cria um novo tipo de desconto
 */
const create = async (data: CreateDeductionTypeRequest): Promise<DeductionType> => {
  const companyId = getCompanyId()
  const response = await apiClient.post('/deduction-types', data, {
    headers: {
      'x-company-id': companyId,
    },
  })
  return response.data
}

/**
 * Atualiza um tipo de desconto
 */
const update = async (id: string, data: UpdateDeductionTypeRequest): Promise<DeductionType> => {
  const companyId = getCompanyId()
  const response = await apiClient.patch(`/deduction-types/${id}`, data, {
    headers: {
      'x-company-id': companyId,
    },
  })
  return response.data
}

/**
 * Deleta um tipo de desconto
 */
const deleteDeductionType = async (id: string): Promise<void> => {
  const companyId = getCompanyId()
  await apiClient.delete(`/deduction-types/${id}`, {
    headers: {
      'x-company-id': companyId,
    },
  })
}

/**
 * Ativa/Desativa um tipo de desconto
 */
const toggleActive = async (id: string): Promise<DeductionType> => {
  const companyId = getCompanyId()
  const response = await apiClient.patch(
    `/deduction-types/${id}/toggle-active`,
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

export const deductionTypesApi = {
  getAll,
  getById,
  create,
  update,
  delete: deleteDeductionType,
  toggleActive,
}
