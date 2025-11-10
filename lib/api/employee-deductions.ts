import { apiClient } from './client'
import { authApi } from './auth'

// ==========================================
// TYPES
// ==========================================

export interface EmployeeDeduction {
  id: string
  employeeId: string
  deductionTypeId: string
  deductionType: {
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

export interface CreateEmployeeDeductionRequest {
  deductionTypeId: string
  isRecurrent: boolean
  value?: number
  percentage?: number
  startDate: string
  endDate?: string
}

export interface UpdateEmployeeDeductionRequest extends Partial<CreateEmployeeDeductionRequest> {}

export interface ListEmployeeDeductionsResponse {
  data: EmployeeDeduction[]
  total: number
}

export interface ListEmployeeDeductionsParams {
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
 * Lista todos os descontos de um colaborador
 */
export const getEmployeeDeductions = async (
  employeeId: string,
  params?: ListEmployeeDeductionsParams
): Promise<ListEmployeeDeductionsResponse> => {
  const companyId = getCompanyId()

  const response = await apiClient.get<EmployeeDeduction[] | ListEmployeeDeductionsResponse>(
    `/employees/${employeeId}/deductions`,
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
 * Busca um desconto específico do colaborador por ID
 */
export const getEmployeeDeductionById = async (
  employeeId: string,
  deductionId: string
): Promise<EmployeeDeduction> => {
  const companyId = getCompanyId()

  const response = await apiClient.get<EmployeeDeduction>(
    `/employees/${employeeId}/deductions/${deductionId}`,
    {
      headers: {
        'x-company-id': companyId,
      },
    }
  )

  return response.data
}

/**
 * Adiciona um novo desconto ao colaborador
 */
export const createEmployeeDeduction = async (
  employeeId: string,
  data: CreateEmployeeDeductionRequest
): Promise<EmployeeDeduction> => {
  const companyId = getCompanyId()

  const response = await apiClient.post<EmployeeDeduction>(
    `/employees/${employeeId}/deductions`,
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
 * Atualiza um desconto do colaborador
 */
export const updateEmployeeDeduction = async (
  employeeId: string,
  deductionId: string,
  data: UpdateEmployeeDeductionRequest
): Promise<EmployeeDeduction> => {
  const companyId = getCompanyId()

  const response = await apiClient.patch<EmployeeDeduction>(
    `/employees/${employeeId}/deductions/${deductionId}`,
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
 * Remove um desconto do colaborador
 */
export const deleteEmployeeDeduction = async (
  employeeId: string,
  deductionId: string
): Promise<void> => {
  const companyId = getCompanyId()

  await apiClient.delete(`/employees/${employeeId}/deductions/${deductionId}`, {
    headers: {
      'x-company-id': companyId,
    },
  })
}

/**
 * Ativa/desativa um desconto do colaborador
 */
export const toggleEmployeeDeductionActive = async (
  employeeId: string,
  deductionId: string
): Promise<EmployeeDeduction> => {
  const companyId = getCompanyId()

  const response = await apiClient.patch<EmployeeDeduction>(
    `/employees/${employeeId}/deductions/${deductionId}/toggle-active`,
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
export const employeeDeductionsApi = {
  getAll: getEmployeeDeductions,
  getById: getEmployeeDeductionById,
  create: createEmployeeDeduction,
  update: updateEmployeeDeduction,
  delete: deleteEmployeeDeduction,
  toggleActive: toggleEmployeeDeductionActive,
}
