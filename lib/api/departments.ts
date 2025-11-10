import { apiClient } from './client'
import { authApi } from './auth'

// ==========================================
// TYPES
// ==========================================

export interface Department {
  id: string
  companyId: string
  code: string
  name: string
  description?: string
  parentId?: string | null
  parent?: {
    id: string
    code: string
    name: string
  } | null
  managerId?: string | null
  manager?: {
    id: string
    name: string
    email: string
    position?: {
      name: string
    }
  } | null
  children?: Array<{
    id: string
    code: string
    name: string
    _count?: {
      employees: number
    }
  }>
  employees?: Array<{
    id: string
    name: string
    email: string
    active: boolean
    position?: {
      id: string
      code: string
      name: string
    }
  }>
  active: boolean
  _count?: {
    employees: number
    children: number
  }
  createdAt: string
  updatedAt: string
}

export interface CreateDepartmentData {
  code: string
  name: string
  description?: string
  parentId?: string
  managerId?: string
  active?: boolean
}

export interface UpdateDepartmentData {
  code?: string
  name?: string
  description?: string
  parentId?: string
  managerId?: string
  active?: boolean
}

export interface ListDepartmentsParams {
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
 * Lista todos os departamentos da empresa
 */
export const getAllDepartments = async (params?: ListDepartmentsParams): Promise<Department[]> => {
  const companyId = getCompanyId()

  const response = await apiClient.get<Department[]>('/departments', {
    params,
    headers: {
      'x-company-id': companyId,
    },
  })

  return response.data
}

/**
 * Busca um departamento por ID
 */
export const getDepartmentById = async (id: string): Promise<Department> => {
  const companyId = getCompanyId()

  const response = await apiClient.get<Department>(`/departments/${id}`, {
    headers: {
      'x-company-id': companyId,
    },
  })

  return response.data
}

/**
 * Cria um novo departamento
 */
export const createDepartment = async (data: CreateDepartmentData): Promise<Department> => {
  const companyId = getCompanyId()

  const response = await apiClient.post<Department>('/departments', data, {
    headers: {
      'x-company-id': companyId,
    },
  })

  return response.data
}

/**
 * Atualiza um departamento existente
 */
export const updateDepartment = async (id: string, data: UpdateDepartmentData): Promise<Department> => {
  const companyId = getCompanyId()

  const response = await apiClient.patch<Department>(`/departments/${id}`, data, {
    headers: {
      'x-company-id': companyId,
    },
  })

  return response.data
}

/**
 * Exclui um departamento
 */
export const deleteDepartment = async (id: string): Promise<void> => {
  const companyId = getCompanyId()

  await apiClient.delete(`/departments/${id}`, {
    headers: {
      'x-company-id': companyId,
    },
  })
}

// ==========================================
// EXPORT API OBJECT
// ==========================================

export const departmentsApi = {
  getAll: getAllDepartments,
  getById: getDepartmentById,
  create: createDepartment,
  update: updateDepartment,
  delete: deleteDepartment,
}
