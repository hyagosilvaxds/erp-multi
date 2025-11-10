import { apiClient } from './client'
import { authApi } from './auth'

// ==========================================
// TYPES
// ==========================================

export interface EmployeeEarning {
  id: string
  employeeId: string
  earningTypeId: string
  earningType: {
    id: string
    code: string
    name: string
    description?: string
    isRecurrent: boolean
    isPercentage: boolean
  }
  isRecurrent: boolean
  value?: string
  percentage?: string
  startDate: string
  endDate?: string
  active: boolean
  createdAt: string
  updatedAt?: string
}

export interface CreateEmployeeEarningRequest {
  earningTypeId: string
  isRecurrent: boolean
  value?: number
  percentage?: number
  startDate: string
  endDate?: string
}

export interface UpdateEmployeeEarningRequest extends Partial<CreateEmployeeEarningRequest> {}

export interface ListEmployeeEarningsResponse {
  data: EmployeeEarning[]
  total: number
}

export interface ListEmployeeEarningsParams {
  month?: number
  year?: number
  active?: boolean
  isRecurrent?: boolean
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getCompanyId(): string {
  const company = authApi.getSelectedCompany()
  if (!company) {
    throw new Error('Nenhuma empresa selecionada')
  }
  return company.id
}

// ==========================================
// API FUNCTIONS
// ==========================================

/**
 * Lista todos os proventos de um colaborador
 */
export const getEmployeeEarnings = async (
  employeeId: string,
  params?: ListEmployeeEarningsParams
): Promise<ListEmployeeEarningsResponse> => {
  const companyId = getCompanyId()

  const response = await apiClient.get<EmployeeEarning[] | ListEmployeeEarningsResponse>(
    `/employees/${employeeId}/earnings`,
    {
      params,
      headers: {
        'x-company-id': companyId,
      },
    }
  )

  // A API pode retornar um array diretamente ou um objeto com data/total
  const responseData = response.data
  if (Array.isArray(responseData)) {
    return {
      data: responseData,
      total: responseData.length
    }
  }
  
  return responseData
}

/**
 * Busca um provento específico do colaborador por ID
 */
export const getEmployeeEarningById = async (
  employeeId: string,
  earningId: string
): Promise<EmployeeEarning> => {
  const companyId = getCompanyId()

  const response = await apiClient.get<EmployeeEarning>(
    `/employees/${employeeId}/earnings/${earningId}`,
    {
      headers: {
        'x-company-id': companyId,
      },
    }
  )

  return response.data
}

/**
 * Cria um novo provento para o colaborador
 */
export const createEmployeeEarning = async (
  employeeId: string,
  data: CreateEmployeeEarningRequest
): Promise<EmployeeEarning> => {
  const companyId = getCompanyId()

  const response = await apiClient.post<EmployeeEarning>(
    `/employees/${employeeId}/earnings`,
    data,
    {
      headers: {
        'x-company-id': companyId,
      },
    }
  )

  return response.data
}

/**
 * Atualiza um provento existente do colaborador
 */
export const updateEmployeeEarning = async (
  employeeId: string,
  earningId: string,
  data: UpdateEmployeeEarningRequest
): Promise<EmployeeEarning> => {
  const companyId = getCompanyId()

  const response = await apiClient.patch<EmployeeEarning>(
    `/employees/${employeeId}/earnings/${earningId}`,
    data,
    {
      headers: {
        'x-company-id': companyId,
      },
    }
  )

  return response.data
}

/**
 * Remove um provento do colaborador
 */
export const deleteEmployeeEarning = async (
  employeeId: string,
  earningId: string
): Promise<void> => {
  const companyId = getCompanyId()

  await apiClient.delete(`/employees/${employeeId}/earnings/${earningId}`, {
    headers: {
      'x-company-id': companyId,
    },
  })
}

/**
 * Ativa/desativa um provento do colaborador
 */
export const toggleEmployeeEarningActive = async (
  employeeId: string,
  earningId: string
): Promise<EmployeeEarning> => {
  const companyId = getCompanyId()

  const response = await apiClient.patch<EmployeeEarning>(
    `/employees/${employeeId}/earnings/${earningId}/toggle-active`,
    {},
    {
      headers: {
        'x-company-id': companyId,
      },
    }
  )

  return response.data
}

// Exporta o objeto API com todas as funções
export const employeeEarningsApi = {
  getAll: getEmployeeEarnings,
  getById: getEmployeeEarningById,
  create: createEmployeeEarning,
  update: updateEmployeeEarning,
  delete: deleteEmployeeEarning,
  toggleActive: toggleEmployeeEarningActive,
}
