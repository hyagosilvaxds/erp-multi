import { apiClient } from './client'
import { authApi } from './auth'

// ============================================
// Tipos de Contas Contábeis
// ============================================

export interface ContaContabil {
  id: string
  planoContasId: string
  codigo: string
  nome: string
  tipo: string // 'Ativo' | 'Passivo' | 'Receita' | 'Despesa' | 'Patrimônio Líquido'
  natureza: string // 'Devedora' | 'Credora'
  nivel: number
  contaPaiId: string | null
  aceitaLancamento: boolean
  ativo: boolean
  createdAt: string
  updatedAt: string
  planoContas?: PlanoContas
  contaPai?: ContaContabil
  subContas?: ContaContabil[]
  _count?: {
    subContas: number
  }
}

export interface ContaContabilResponse {
  data: ContaContabil[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface CreateContaContabilDto {
  codigo: string
  nome: string
  tipo: 'Ativo' | 'Passivo' | 'Receita' | 'Despesa' | 'Patrimônio Líquido'
  natureza: 'Devedora' | 'Credora'
  nivel: number
  contaPaiId?: string
  aceitaLancamento?: boolean
  ativo?: boolean
}

export interface UpdateContaContabilDto {
  codigo?: string
  nome?: string
  tipo?: 'Ativo' | 'Passivo' | 'Receita' | 'Despesa' | 'Patrimônio Líquido'
  natureza?: 'Devedora' | 'Credora'
  nivel?: number
  contaPaiId?: string
  aceitaLancamento?: boolean
  ativo?: boolean
}

// ============================================
// Tipos de Plano de Contas
// ============================================

export interface PlanoContas {
  id: string
  companyId: string | null
  nome: string
  descricao: string | null
  tipo: string
  ativo: boolean
  padrao: boolean
  createdAt: string
  updatedAt: string
  contas?: ContaContabil[]
  _count?: {
    contas: number
  }
}

export interface PlanoContasResponse {
  data: PlanoContas[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface CreatePlanoContasDto {
  companyId?: string | null
  nome: string
  descricao?: string
  tipo?: 'Gerencial' | 'Fiscal' | 'Contabil'
  ativo?: boolean
  padrao?: boolean
}

export interface UpdatePlanoContasDto {
  companyId?: string | null
  nome?: string
  descricao?: string
  tipo?: string
  ativo?: boolean
  padrao?: boolean
}

// ============================================
// API de Plano de Contas
// ============================================

export const planoContasApi = {
  /**
   * Criar novo plano de contas
   * Requer permissão accounting.create
   */
  async create(data: CreatePlanoContasDto): Promise<PlanoContas> {
    try {
      const selectedCompany = authApi.getSelectedCompany()
      
      // Se não especificou companyId no data, usar a empresa selecionada
      const payload = {
        ...data,
        companyId: data.companyId !== undefined ? data.companyId : (selectedCompany?.id || null)
      }

      const response = await apiClient.post<PlanoContas>('/plano-contas', payload, {
        headers: selectedCompany ? {
          'x-company-id': selectedCompany.id,
        } : {},
      })
      
      return response.data
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Listar planos de contas
   * Requer permissão accounting.read
   */
  async getAll(params?: {
    companyId?: string | null
    page?: number
    limit?: number
    tipo?: string
    ativo?: boolean
  }): Promise<PlanoContasResponse> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const queryParams = new URLSearchParams()
      
      // Se companyId foi especificado, usar ele; senão usar empresa selecionada
      if (params?.companyId !== undefined) {
        if (params.companyId === null) {
          queryParams.append('companyId', 'null')
        } else {
          queryParams.append('companyId', params.companyId)
        }
      } else if (selectedCompany) {
        queryParams.append('companyId', selectedCompany.id)
      }
      
      if (params?.page) {
        queryParams.append('page', params.page.toString())
      }
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString())
      }
      if (params?.tipo) {
        queryParams.append('tipo', params.tipo)
      }
      if (params?.ativo !== undefined) {
        queryParams.append('ativo', params.ativo.toString())
      }

      const queryString = queryParams.toString()
      const url = `/plano-contas${queryString ? `?${queryString}` : ''}`

      const { data } = await apiClient.get<PlanoContasResponse>(url, {
        headers: selectedCompany ? {
          'x-company-id': selectedCompany.id,
        } : {},
      })
      
      return data
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Buscar plano de contas padrão
   * Requer permissão accounting.read
   */
  async getPadrao(companyId?: string | null): Promise<PlanoContas> {
    try {
      const selectedCompany = authApi.getSelectedCompany()
      
      const queryParams = new URLSearchParams()
      
      // Se companyId foi especificado, usar ele; senão usar empresa selecionada
      if (companyId !== undefined) {
        if (companyId === null) {
          queryParams.append('companyId', 'null')
        } else {
          queryParams.append('companyId', companyId)
        }
      } else if (selectedCompany) {
        queryParams.append('companyId', selectedCompany.id)
      }

      const queryString = queryParams.toString()
      const url = `/plano-contas/padrao${queryString ? `?${queryString}` : ''}`

      const { data } = await apiClient.get<PlanoContas>(url, {
        headers: selectedCompany ? {
          'x-company-id': selectedCompany.id,
        } : {},
      })
      
      return data
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Buscar plano de contas por ID
   * Requer permissão accounting.read
   */
  async getById(id: string): Promise<PlanoContas> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.get<PlanoContas>(`/plano-contas/${id}`, {
        headers: selectedCompany ? {
          'x-company-id': selectedCompany.id,
        } : {},
      })
      
      return data
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Buscar hierarquia de contas do plano
   * Requer permissão accounting.read
   */
  async getHierarquia(id: string, ativo?: boolean): Promise<{
    planoContas: {
      id: string
      nome: string
      tipo: string
    }
    contas: ContaContabil[]
  }> {
    try {
      const selectedCompany = authApi.getSelectedCompany()
      
      const queryParams = new URLSearchParams()
      if (ativo !== undefined) {
        queryParams.append('ativo', ativo.toString())
      }

      const queryString = queryParams.toString()
      const url = `/plano-contas/${id}/hierarquia${queryString ? `?${queryString}` : ''}`

      const { data } = await apiClient.get(url, {
        headers: selectedCompany ? {
          'x-company-id': selectedCompany.id,
        } : {},
      })
      
      return data
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Atualizar plano de contas
   * Requer permissão accounting.update
   */
  /**
   * Atualizar plano de contas
   * Requer permissão accounting.update
   */
  async update(id: string, dados: UpdatePlanoContasDto): Promise<PlanoContas> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.patch<PlanoContas>(`/plano-contas/${id}`, dados, {
        headers: selectedCompany ? {
          'x-company-id': selectedCompany.id,
        } : {},
      })
      
      return data
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Duplicar plano de contas
   * Requer permissão accounting.create
   */
  async duplicar(id: string, dados: {
    companyId?: string | null
    nome: string
    descricao?: string
  }): Promise<PlanoContas> {
    try {
      const selectedCompany = authApi.getSelectedCompany()
      
      // Se não especificou companyId, usar a empresa selecionada
      const payload = {
        ...dados,
        companyId: dados.companyId !== undefined ? dados.companyId : (selectedCompany?.id || null)
      }

      const { data } = await apiClient.post<PlanoContas>(`/plano-contas/${id}/duplicar`, payload, {
        headers: selectedCompany ? {
          'x-company-id': selectedCompany.id,
        } : {},
      })
      
      return data
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Excluir plano de contas
   * Requer permissão accounting.delete
   */
  async delete(id: string): Promise<{ message: string }> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.delete<{ message: string }>(`/plano-contas/${id}`, {
        headers: selectedCompany ? {
          'x-company-id': selectedCompany.id,
        } : {},
      })
      
      return data
    } catch (error: any) {
      throw error
    }
  },
}

// ============================================
// API de Contas Contábeis
// ============================================

export const contasContabeisApi = {
  /**
   * Criar nova conta contábil
   * Requer permissão accounting.create
   */
  async create(planoContasId: string, data: CreateContaContabilDto): Promise<ContaContabil> {
    try {
      const selectedCompany = authApi.getSelectedCompany()
      
      if (!selectedCompany) {
        throw new Error('Nenhuma empresa selecionada')
      }

      const response = await apiClient.post<ContaContabil>(
        `/plano-contas/${planoContasId}/contas`, 
        data, 
        {
          headers: {
            'x-company-id': selectedCompany.id,
          },
        }
      )
      
      return response.data
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Listar contas contábeis de um plano
   * Requer permissão accounting.read
   */
  async getAll(planoContasId: string, params?: {
    page?: number
    limit?: number
    tipo?: string
    nivel?: number
    contaPaiId?: string
    search?: string
  }): Promise<ContaContabilResponse> {
    try {
      const selectedCompany = authApi.getSelectedCompany()
      
      if (!selectedCompany) {
        throw new Error('Nenhuma empresa selecionada')
      }

      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.tipo) queryParams.append('tipo', params.tipo)
      if (params?.nivel) queryParams.append('nivel', params.nivel.toString())
      if (params?.contaPaiId) queryParams.append('contaPaiId', params.contaPaiId)
      if (params?.search) queryParams.append('search', params.search)

      const queryString = queryParams.toString()
      const url = `/plano-contas/${planoContasId}/contas${queryString ? `?${queryString}` : ''}`

      const { data } = await apiClient.get<ContaContabilResponse>(url, {
        headers: {
          'x-company-id': selectedCompany.id,
        },
      })
      
      return data
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Buscar conta contábil por ID
   * Requer permissão accounting.read
   */
  async getById(id: string): Promise<ContaContabil> {
    try {
      const selectedCompany = authApi.getSelectedCompany()
      
      if (!selectedCompany) {
        throw new Error('Nenhuma empresa selecionada')
      }

      const { data } = await apiClient.get<ContaContabil>(`/plano-contas/contas/${id}`, {
        headers: {
          'x-company-id': selectedCompany.id,
        },
      })
      
      return data
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Atualizar conta contábil
   * Requer permissão accounting.update
   */
  async update(id: string, dados: UpdateContaContabilDto): Promise<ContaContabil> {
    try {
      const selectedCompany = authApi.getSelectedCompany()
      
      if (!selectedCompany) {
        throw new Error('Nenhuma empresa selecionada')
      }

      const { data } = await apiClient.patch<ContaContabil>(`/plano-contas/contas/${id}`, dados, {
        headers: {
          'x-company-id': selectedCompany.id,
        },
      })
      
      return data
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Excluir conta contábil
   * Requer permissão accounting.delete
   */
  async delete(id: string): Promise<{ message: string }> {
    try {
      const selectedCompany = authApi.getSelectedCompany()
      
      if (!selectedCompany) {
        throw new Error('Nenhuma empresa selecionada')
      }

      const { data } = await apiClient.delete<{ message: string }>(`/plano-contas/contas/${id}`, {
        headers: {
          'x-company-id': selectedCompany.id,
        },
      })
      
      return data
    } catch (error: any) {
      throw error
    }
  },
}

// ============================================
// Tipos de Centro de Custos
// ============================================

export interface CentroCusto {
  id: string
  companyId: string
  codigo: string
  nome: string
  descricao: string | null
  centroCustoPaiId: string | null
  nivel: number
  responsavel: string | null
  email: string | null
  ativo: boolean
  createdAt: string
  updatedAt: string
  company?: {
    id: string
    razaoSocial: string
    nomeFantasia: string | null
  }
  centroCustoPai?: CentroCusto
  subCentros?: CentroCusto[]
  _count?: {
    subCentros: number
  }
}

export interface CentroCustoResponse {
  data: CentroCusto[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface CreateCentroCustoDto {
  companyId: string
  codigo: string
  nome: string
  descricao?: string
  centroCustoPaiId?: string
  nivel: number
  responsavel?: string
  email?: string
  ativo?: boolean
}

export interface UpdateCentroCustoDto {
  codigo?: string
  nome?: string
  descricao?: string
  centroCustoPaiId?: string
  nivel?: number
  responsavel?: string
  email?: string
  ativo?: boolean
}

// ============================================
// API de Centro de Custos
// ============================================

export const centroCustoApi = {
  /**
   * Criar novo centro de custos
   * Requer permissão accounting.create
   */
  async create(data: CreateCentroCustoDto): Promise<CentroCusto> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const response = await apiClient.post<CentroCusto>('/centro-custo', data, {
        headers: selectedCompany ? {
          'x-company-id': selectedCompany.id,
        } : {},
      })
      
      return response.data
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Listar centros de custos
   * Requer permissão accounting.read
   */
  async getAll(params?: {
    companyId?: string
    page?: number
    limit?: number
    ativo?: boolean
    search?: string
  }): Promise<CentroCustoResponse> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const queryParams = new URLSearchParams()
      
      // Se companyId foi especificado, usar ele; senão usar empresa selecionada
      if (params?.companyId) {
        queryParams.append('companyId', params.companyId)
      } else if (selectedCompany) {
        queryParams.append('companyId', selectedCompany.id)
      }
      
      if (params?.page) {
        queryParams.append('page', params.page.toString())
      }
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString())
      }
      if (params?.ativo !== undefined) {
        queryParams.append('ativo', params.ativo.toString())
      }
      if (params?.search) {
        queryParams.append('search', params.search)
      }

      const queryString = queryParams.toString()
      const url = `/centro-custo${queryString ? `?${queryString}` : ''}`

      const { data } = await apiClient.get<CentroCustoResponse>(url, {
        headers: selectedCompany ? {
          'x-company-id': selectedCompany.id,
        } : {},
      })
      
      return data
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Buscar centro de custos por ID
   * Requer permissão accounting.read
   */
  async getById(id: string): Promise<CentroCusto> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.get<CentroCusto>(`/centro-custo/${id}`, {
        headers: selectedCompany ? {
          'x-company-id': selectedCompany.id,
        } : {},
      })
      
      return data
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Buscar centros de custo por empresa
   * Requer permissão accounting.read
   * ✅ RECOMENDADO: Lista simples de todos os centros da empresa
   */
  async getByCompany(companyId: string): Promise<CentroCusto[]> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.get<CentroCusto[]>(`/centro-custo/company/${companyId}`, {
        headers: selectedCompany ? {
          'x-company-id': selectedCompany.id,
        } : {},
      })
      
      return data
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Buscar hierarquia de centros de custos por empresa
   * Requer permissão accounting.read
   * ✅ RECOMENDADO: Estrutura hierárquica completa até 5 níveis
   */
  async getHierarquia(companyId: string, ativo?: boolean): Promise<{
    company: {
      id: string
      razaoSocial: string
      nomeFantasia: string | null
    }
    centrosCusto: CentroCusto[]
  }> {
    try {
      const selectedCompany = authApi.getSelectedCompany()
      
      const queryParams = new URLSearchParams()
      
      if (ativo !== undefined) {
        queryParams.append('ativo', ativo.toString())
      }

      const queryString = queryParams.toString()
      const url = `/centro-custo/company/${companyId}/hierarquia${queryString ? `?${queryString}` : ''}`

      const { data } = await apiClient.get(url, {
        headers: selectedCompany ? {
          'x-company-id': selectedCompany.id,
        } : {},
      })
      
      return data
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Atualizar centro de custos
   * Requer permissão accounting.update
   */
  async update(id: string, dados: UpdateCentroCustoDto): Promise<CentroCusto> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.patch<CentroCusto>(`/centro-custo/${id}`, dados, {
        headers: selectedCompany ? {
          'x-company-id': selectedCompany.id,
        } : {},
      })
      
      return data
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Alternar status ativo/inativo do centro de custos
   * Requer permissão accounting.update
   */
  async toggleActive(id: string): Promise<CentroCusto> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.patch<CentroCusto>(`/centro-custo/${id}/toggle-active`, {}, {
        headers: selectedCompany ? {
          'x-company-id': selectedCompany.id,
        } : {},
      })
      
      return data
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Excluir centro de custos
   * Requer permissão accounting.delete
   */
  async delete(id: string): Promise<{ message: string }> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.delete<{ message: string }>(`/centro-custo/${id}`, {
        headers: selectedCompany ? {
          'x-company-id': selectedCompany.id,
        } : {},
      })
      
      return data
    } catch (error: any) {
      throw error
    }
  },
}
