import { apiClient } from './client'
import { AxiosError } from 'axios'
import { authApi } from './auth'

export interface LegalCategory {
  id: string
  companyId: string
  name: string
  description?: string
  color?: string
  icon?: string
  active: boolean
  _count?: {
    legalDocuments: number
  }
  createdAt: string
  updatedAt: string
}

export interface CreateLegalCategoryDto {
  name: string
  description?: string
  color?: string
  icon?: string
  active?: boolean
}

export interface UpdateLegalCategoryDto {
  name?: string
  description?: string
  color?: string
  icon?: string
  active?: boolean
}

/**
 * Obtém o ID da empresa selecionada
 */
const getCompanyId = () => {
  const company = authApi.getSelectedCompany()
  if (!company?.id) {
    throw new Error('Nenhuma empresa selecionada')
  }
  return company.id
}

/**
 * Lista todas as categorias jurídicas da empresa
 */
export async function listLegalCategories(): Promise<LegalCategory[]> {
  try {
    const companyId = getCompanyId()
    const response = await apiClient.get<LegalCategory[]>('/legal/categories', {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  } catch (error) {
    console.error('Erro ao listar categorias jurídicas:', error)
    throw error
  }
}

/**
 * Busca uma categoria jurídica por ID
 */
export async function getLegalCategoryById(id: string): Promise<LegalCategory> {
  try {
    const companyId = getCompanyId()
    const response = await apiClient.get<LegalCategory>(`/legal/categories/${id}`, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  } catch (error) {
    console.error('Erro ao buscar categoria jurídica:', error)
    throw error
  }
}

/**
 * Cria uma nova categoria jurídica
 */
export async function createLegalCategory(data: CreateLegalCategoryDto): Promise<LegalCategory> {
  try {
    const companyId = getCompanyId()
    const response = await apiClient.post<LegalCategory>('/legal/categories', data, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  } catch (error) {
    console.error('Erro ao criar categoria jurídica:', error)
    throw error
  }
}

/**
 * Atualiza uma categoria jurídica
 */
export async function updateLegalCategory(
  id: string,
  data: UpdateLegalCategoryDto
): Promise<LegalCategory> {
  try {
    const companyId = getCompanyId()
    const response = await apiClient.patch<LegalCategory>(`/legal/categories/${id}`, data, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  } catch (error) {
    console.error('Erro ao atualizar categoria jurídica:', error)
    throw error
  }
}

/**
 * Exclui uma categoria jurídica
 */
export async function deleteLegalCategory(id: string): Promise<void> {
  try {
    const companyId = getCompanyId()
    await apiClient.delete(`/legal/categories/${id}`, {
      headers: {
        'x-company-id': companyId,
      },
    })
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>
    if (axiosError.response?.status === 400) {
      throw new Error(axiosError.response.data.message || 'Não é possível excluir categorias com documentos vinculados')
    }
    console.error('Erro ao excluir categoria jurídica:', error)
    throw error
  }
}
