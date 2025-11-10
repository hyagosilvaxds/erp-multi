import { apiClient } from './client'
import { authApi } from './auth'

// ==========================================
// TYPES
// ==========================================

export interface Position {
  id: string
  companyId: string
  code: string
  name: string
  description?: string
  minSalary?: number
  maxSalary?: number
  cbo?: string
  active: boolean
  _count?: {
    employees: number
  }
  employees?: Array<{
    id: string
    name: string
    email: string
    salary: number
    admissionDate: string
    active: boolean
  }>
  createdAt: string
  updatedAt: string
}

export interface CreatePositionData {
  code: string
  name: string
  description?: string
  minSalary?: number
  maxSalary?: number
  cbo?: string
  active?: boolean
}

export interface UpdatePositionData {
  code?: string
  name?: string
  description?: string
  minSalary?: number
  maxSalary?: number
  cbo?: string
  active?: boolean
}

export interface ListPositionsParams {
  active?: boolean
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
 * Lista todos os cargos da empresa
 */
export const getAllPositions = async (params?: ListPositionsParams): Promise<Position[]> => {
  const companyId = getCompanyId()

  const response = await apiClient.get<Position[]>('/positions', {
    params,
    headers: {
      'x-company-id': companyId,
    },
  })

  return response.data
}

/**
 * Busca um cargo por ID
 */
export const getPositionById = async (id: string): Promise<Position> => {
  const companyId = getCompanyId()

  const response = await apiClient.get<Position>(`/positions/${id}`, {
    headers: {
      'x-company-id': companyId,
    },
  })

  return response.data
}

/**
 * Cria um novo cargo
 */
export const createPosition = async (data: CreatePositionData): Promise<Position> => {
  const companyId = getCompanyId()

  const response = await apiClient.post<Position>('/positions', data, {
    headers: {
      'x-company-id': companyId,
    },
  })

  return response.data
}

/**
 * Atualiza um cargo existente
 */
export const updatePosition = async (id: string, data: UpdatePositionData): Promise<Position> => {
  const companyId = getCompanyId()

  const response = await apiClient.patch<Position>(`/positions/${id}`, data, {
    headers: {
      'x-company-id': companyId,
    },
  })

  return response.data
}

/**
 * Exclui um cargo
 */
export const deletePosition = async (id: string): Promise<void> => {
  const companyId = getCompanyId()

  await apiClient.delete(`/positions/${id}`, {
    headers: {
      'x-company-id': companyId,
    },
  })
}

// ==========================================
// EXPORT API OBJECT
// ==========================================

export const positionsApi = {
  getAll: getAllPositions,
  getById: getPositionById,
  create: createPosition,
  update: updatePosition,
  delete: deletePosition,
}
