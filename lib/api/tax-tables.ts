import { apiClient } from './client'
import { authApi } from './auth'

// ==========================================
// TYPES - INSS
// ==========================================

export interface INSSBracket {
  upTo: number
  employeeRate: number
  employerRate: number
}

export interface INSSTable {
  id: string
  companyId: string
  referenceYear: number
  referenceMonth: number
  active: boolean
  brackets: INSSBracket[]
  createdAt: string
  updatedAt: string
}

export interface CreateINSSTableRequest {
  referenceYear: number
  referenceMonth: number
  active: boolean
  brackets: INSSBracket[]
}

export interface UpdateINSSTableRequest extends Partial<CreateINSSTableRequest> {}

export interface ListINSSTablesParams {
  active?: boolean
  year?: number
  month?: number
}

// ==========================================
// TYPES - FGTS
// ==========================================

export type FGTSCategory = 'CLT' | 'APRENDIZ' | 'DOMESTICO'

export interface FGTSRate {
  category: FGTSCategory
  monthlyRate: number
  rescissionRate: number
}

export interface FGTSTable {
  id: string
  companyId: string
  referenceYear: number
  referenceMonth: number
  active: boolean
  rates: FGTSRate[]
  createdAt: string
  updatedAt: string
}

export interface CreateFGTSTableRequest {
  referenceYear: number
  referenceMonth: number
  active: boolean
  rates: FGTSRate[]
}

export interface UpdateFGTSTableRequest extends Partial<CreateFGTSTableRequest> {}

export interface ListFGTSTablesParams {
  active?: boolean
  year?: number
  month?: number
}

// ==========================================
// TYPES - IRRF
// ==========================================

export interface IRRFBracket {
  upTo: number | null
  rate: number
  deduction: number
}

export interface IRRFTable {
  id: string
  companyId: string
  referenceYear: number
  referenceMonth: number
  active: boolean
  brackets: IRRFBracket[]
  dependentDeduction: number
  createdAt: string
  updatedAt: string
}

export interface CreateIRRFTableRequest {
  referenceYear: number
  referenceMonth: number
  active: boolean
  brackets: IRRFBracket[]
  dependentDeduction: number
}

export interface UpdateIRRFTableRequest extends Partial<CreateIRRFTableRequest> {}

export interface ListIRRFTablesParams {
  active?: boolean
  year?: number
  month?: number
}

// ==========================================
// HELPERS
// ==========================================

const getCompanyId = () => {
  const company = authApi.getSelectedCompany()
  if (!company?.id) {
    throw new Error('Nenhuma empresa selecionada')
  }
  return company.id
}

// ==========================================
// API - INSS
// ==========================================

export const inssTablesApi = {
  /**
   * Lista todas as tabelas de INSS
   */
  async getAll(params?: ListINSSTablesParams): Promise<INSSTable[]> {
    const companyId = getCompanyId()
    const response = await apiClient.get('/tax-tables/inss', {
      params,
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Busca uma tabela de INSS por ID
   */
  async getById(id: string): Promise<INSSTable> {
    const companyId = getCompanyId()
    const response = await apiClient.get(`/tax-tables/inss/${id}`, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Busca a tabela de INSS ativa para um período
   */
  async getActive(year: number, month: number): Promise<INSSTable> {
    const companyId = getCompanyId()
    const response = await apiClient.get('/tax-tables/inss/active', {
      params: { year, month },
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Cria uma nova tabela de INSS
   */
  async create(data: CreateINSSTableRequest): Promise<INSSTable> {
    const companyId = getCompanyId()
    const response = await apiClient.post('/tax-tables/inss', data, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Atualiza uma tabela de INSS
   */
  async update(id: string, data: UpdateINSSTableRequest): Promise<INSSTable> {
    const companyId = getCompanyId()
    const response = await apiClient.patch(`/tax-tables/inss/${id}`, data, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Deleta uma tabela de INSS
   */
  async delete(id: string): Promise<void> {
    const companyId = getCompanyId()
    await apiClient.delete(`/tax-tables/inss/${id}`, {
      headers: {
        'x-company-id': companyId,
      },
    })
  },
}

// ==========================================
// API - FGTS
// ==========================================

export const fgtsTablesApi = {
  /**
   * Lista todas as tabelas de FGTS
   */
  async getAll(params?: ListFGTSTablesParams): Promise<FGTSTable[]> {
    const companyId = getCompanyId()
    const response = await apiClient.get('/tax-tables/fgts', {
      params,
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Busca uma tabela de FGTS por ID
   */
  async getById(id: string): Promise<FGTSTable> {
    const companyId = getCompanyId()
    const response = await apiClient.get(`/tax-tables/fgts/${id}`, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Busca a tabela de FGTS ativa para um período
   */
  async getActive(year: number, month: number): Promise<FGTSTable> {
    const companyId = getCompanyId()
    const response = await apiClient.get('/tax-tables/fgts/active', {
      params: { year, month },
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Cria uma nova tabela de FGTS
   */
  async create(data: CreateFGTSTableRequest): Promise<FGTSTable> {
    const companyId = getCompanyId()
    const response = await apiClient.post('/tax-tables/fgts', data, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Atualiza uma tabela de FGTS
   */
  async update(id: string, data: UpdateFGTSTableRequest): Promise<FGTSTable> {
    const companyId = getCompanyId()
    const response = await apiClient.patch(`/tax-tables/fgts/${id}`, data, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Deleta uma tabela de FGTS
   */
  async delete(id: string): Promise<void> {
    const companyId = getCompanyId()
    await apiClient.delete(`/tax-tables/fgts/${id}`, {
      headers: {
        'x-company-id': companyId,
      },
    })
  },
}

// ==========================================
// API - IRRF
// ==========================================

export const irrfTablesApi = {
  /**
   * Lista todas as tabelas de IRRF
   */
  async getAll(params?: ListIRRFTablesParams): Promise<IRRFTable[]> {
    const companyId = getCompanyId()
    const response = await apiClient.get('/tax-tables/irrf', {
      params,
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Busca uma tabela de IRRF por ID
   */
  async getById(id: string): Promise<IRRFTable> {
    const companyId = getCompanyId()
    const response = await apiClient.get(`/tax-tables/irrf/${id}`, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Busca a tabela de IRRF ativa para um período
   */
  async getActive(year: number, month: number): Promise<IRRFTable> {
    const companyId = getCompanyId()
    const response = await apiClient.get('/tax-tables/irrf/active', {
      params: { year, month },
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Cria uma nova tabela de IRRF
   */
  async create(data: CreateIRRFTableRequest): Promise<IRRFTable> {
    const companyId = getCompanyId()
    const response = await apiClient.post('/tax-tables/irrf', data, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Atualiza uma tabela de IRRF
   */
  async update(id: string, data: UpdateIRRFTableRequest): Promise<IRRFTable> {
    const companyId = getCompanyId()
    const response = await apiClient.patch(`/tax-tables/irrf/${id}`, data, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Deleta uma tabela de IRRF
   */
  async delete(id: string): Promise<void> {
    const companyId = getCompanyId()
    await apiClient.delete(`/tax-tables/irrf/${id}`, {
      headers: {
        'x-company-id': companyId,
      },
    })
  },
}
