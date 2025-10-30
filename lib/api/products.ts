import { apiClient } from './client'

// ==========================================
// TYPES - CATEGORIAS
// ==========================================

export interface Category {
  id: string
  name: string
  description?: string
  parentId?: string | null
  active: boolean
  companyId: string
  createdAt: string
  updatedAt: string
  parent?: Category | null
  subcategories?: Category[]
  _count?: {
    products: number
    subcategories: number
  }
}

export interface CreateCategoryRequest {
  name: string
  description?: string
  parentId?: string | null
  active?: boolean
}

export interface UpdateCategoryRequest {
  name?: string
  description?: string
  active?: boolean
}

// ==========================================
// TYPES - UNIDADES
// ==========================================

export interface Unit {
  id: string
  name: string
  abbreviation: string
  fractionable: boolean
  active: boolean
  companyId: string
  createdAt: string
  updatedAt: string
  _count?: {
    products: number
  }
}

export interface CreateUnitRequest {
  name: string
  abbreviation: string
  fractionable?: boolean
  active?: boolean
}

export interface UpdateUnitRequest {
  name?: string
  abbreviation?: string
  fractionable?: boolean
  active?: boolean
}

// ==========================================
// TYPES - MARCAS
// ==========================================

export interface Brand {
  id: string
  name: string
  description?: string
  active: boolean
  companyId: string
  createdAt: string
  updatedAt: string
  _count?: {
    products: number
  }
}

export interface CreateBrandRequest {
  name: string
  description?: string
  active?: boolean
}

export interface UpdateBrandRequest {
  name?: string
  description?: string
  active?: boolean
}

// ==========================================
// API - CATEGORIAS
// ==========================================

export const categoriesApi = {
  /**
   * Cria uma nova categoria
   */
  create: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await apiClient.post('/products/categories', data)
    return response.data
  },

  /**
   * Lista todas as categorias
   */
  getAll: async (parentId?: string | null): Promise<Category[]> => {
    const params: any = {}
    if (parentId !== undefined) {
      params.parentId = parentId === null ? 'null' : parentId
    }
    const response = await apiClient.get('/products/categories', { params })
    return response.data
  },

  /**
   * Busca uma categoria por ID
   */
  getById: async (id: string): Promise<Category> => {
    const response = await apiClient.get(`/products/categories/${id}`)
    return response.data
  },

  /**
   * Atualiza uma categoria
   */
  update: async (id: string, data: UpdateCategoryRequest): Promise<Category> => {
    const response = await apiClient.patch(`/products/categories/${id}`, data)
    return response.data
  },

  /**
   * Deleta uma categoria
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/categories/${id}`)
  },
}

// ==========================================
// API - UNIDADES
// ==========================================

export const unitsApi = {
  /**
   * Cria uma nova unidade
   */
  create: async (data: CreateUnitRequest): Promise<Unit> => {
    const response = await apiClient.post('/products/units', data)
    return response.data
  },

  /**
   * Lista todas as unidades
   */
  getAll: async (): Promise<Unit[]> => {
    const response = await apiClient.get('/products/units')
    return response.data
  },

  /**
   * Busca uma unidade por ID
   */
  getById: async (id: string): Promise<Unit> => {
    const response = await apiClient.get(`/products/units/${id}`)
    return response.data
  },

  /**
   * Atualiza uma unidade
   */
  update: async (id: string, data: UpdateUnitRequest): Promise<Unit> => {
    const response = await apiClient.patch(`/products/units/${id}`, data)
    return response.data
  },

  /**
   * Deleta uma unidade
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/units/${id}`)
  },
}

// ==========================================
// API - MARCAS
// ==========================================

export const brandsApi = {
  /**
   * Cria uma nova marca
   */
  create: async (data: CreateBrandRequest): Promise<Brand> => {
    const response = await apiClient.post('/products/brands', data)
    return response.data
  },

  /**
   * Lista todas as marcas
   */
  getAll: async (): Promise<Brand[]> => {
    const response = await apiClient.get('/products/brands')
    return response.data
  },

  /**
   * Busca uma marca por ID
   */
  getById: async (id: string): Promise<Brand> => {
    const response = await apiClient.get(`/products/brands/${id}`)
    return response.data
  },

  /**
   * Atualiza uma marca
   */
  update: async (id: string, data: UpdateBrandRequest): Promise<Brand> => {
    const response = await apiClient.patch(`/products/brands/${id}`, data)
    return response.data
  },

  /**
   * Deleta uma marca
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/brands/${id}`)
  },
}
