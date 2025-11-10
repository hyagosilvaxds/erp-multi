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

// ============================================
// Tipos de Contas Bancárias
// ============================================

export type AccountType = 'CORRENTE' | 'POUPANCA' | 'SALARIO'

export interface BankAccount {
  id: string
  companyId: string
  bankName: string
  bankCode: string
  agencyNumber: string
  agencyDigit?: string | null
  accountNumber: string
  accountDigit: string
  accountType: AccountType
  accountName: string
  pixKey?: string | null
  initialBalance: number
  currentBalance: number
  active: boolean
  isMainAccount: boolean
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateBankAccountDto {
  companyId: string
  bankName: string
  bankCode: string
  agencyNumber: string
  agencyDigit?: string
  accountNumber: string
  accountDigit: string
  accountType: AccountType
  accountName: string
  pixKey?: string
  initialBalance: number
  active?: boolean
  isMainAccount?: boolean
  notes?: string
}

export interface UpdateBankAccountDto {
  accountName?: string
  pixKey?: string
  active?: boolean
  isMainAccount?: boolean
  notes?: string
}

export interface BankAccountBalance {
  accountId: string
  accountName: string
  currentBalance: number
  initialBalance: number
}

// ============================================
// API de Contas Bancárias
// ============================================

export const bankAccountsApi = {
  /**
   * Listar contas bancárias
   */
  async getAll(companyId: string): Promise<BankAccount[]> {
    try {
      const selectedCompany = authApi.getSelectedCompany()
      
      const { data } = await apiClient.get<BankAccount[]>(`/financial/bank-accounts`, {
        params: { companyId },
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
   * Criar conta bancária
   */
  async create(dados: CreateBankAccountDto): Promise<BankAccount> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.post<BankAccount>('/financial/bank-accounts', dados, {
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
   * Obter conta bancária por ID
   */
  async getById(id: string, companyId: string): Promise<BankAccount> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.get<BankAccount>(`/financial/bank-accounts/${id}`, {
        params: { companyId },
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
   * Obter saldo da conta bancária
   */
  async getBalance(id: string, companyId: string): Promise<BankAccountBalance> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.get<BankAccountBalance>(`/financial/bank-accounts/${id}/balance`, {
        params: { companyId },
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
   * Atualizar conta bancária
   */
  async update(id: string, companyId: string, dados: UpdateBankAccountDto): Promise<BankAccount> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.patch<BankAccount>(`/financial/bank-accounts/${id}`, dados, {
        params: { companyId },
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
   * Deletar conta bancária
   */
  async delete(id: string, companyId: string): Promise<{ message: string }> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.delete<{ message: string }>(`/financial/bank-accounts/${id}`, {
        params: { companyId },
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
// Tipos de Categorias Financeiras
// ============================================

export type CategoryType = 'RECEITA' | 'DESPESA'

export interface FinancialCategory {
  id: string
  companyId: string
  name: string
  description?: string | null
  type: CategoryType
  color?: string | null
  icon?: string | null
  parentId?: string | null
  active: boolean
  parent?: FinancialCategory | null
  children?: FinancialCategory[]
  createdAt: string
  updatedAt: string
}

export interface CreateFinancialCategoryDto {
  companyId: string
  name: string
  description?: string
  type: CategoryType
  color?: string
  icon?: string
  parentId?: string
  active?: boolean
}

export interface UpdateFinancialCategoryDto {
  name?: string
  description?: string
  type?: CategoryType
  color?: string
  icon?: string
  parentId?: string
  active?: boolean
}

// ============================================
// API de Categorias Financeiras
// ============================================

export const financialCategoriesApi = {
  /**
   * Listar categorias financeiras
   */
  async getAll(companyId: string, type?: CategoryType): Promise<FinancialCategory[]> {
    try {
      const selectedCompany = authApi.getSelectedCompany()
      
      const params: any = { companyId }
      if (type) {
        params.type = type
      }

      const { data } = await apiClient.get<FinancialCategory[]>(`/financial/categories`, {
        params,
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
   * Criar categoria financeira
   */
  async create(dados: CreateFinancialCategoryDto): Promise<FinancialCategory> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.post<FinancialCategory>('/financial/categories', dados, {
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
   * Obter categoria financeira por ID
   */
  async getById(id: string, companyId: string): Promise<FinancialCategory> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.get<FinancialCategory>(`/financial/categories/${id}`, {
        params: { companyId },
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
   * Atualizar categoria financeira
   */
  async update(id: string, companyId: string, dados: UpdateFinancialCategoryDto): Promise<FinancialCategory> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.patch<FinancialCategory>(`/financial/categories/${id}`, dados, {
        params: { companyId },
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
   * Deletar categoria financeira
   */
  async delete(id: string, companyId: string): Promise<{ message: string }> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.delete<{ message: string }>(`/financial/categories/${id}`, {
        params: { companyId },
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
// Tipos de Lançamentos Financeiros
// ============================================

export type TransactionType = 'DINHEIRO' | 'TRANSFERENCIA' | 'BOLETO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX' | 'CHEQUE' | 'OUTROS'

export interface FinancialTransaction {
  id: string
  companyId: string
  bankAccountId: string
  categoryId: string
  centroCustoId?: string | null
  contaContabilId?: string | null
  type: CategoryType
  transactionType: TransactionType
  amount: number
  fees: number
  netAmount: number
  description: string
  referenceNumber?: string | null
  documentNumber?: string | null
  transactionDate: string
  competenceDate: string
  reconciled: boolean
  reconciledAt?: string | null
  notes?: string | null
  attachments?: string[] | null
  bankAccount?: BankAccount
  category?: FinancialCategory
  centroCusto?: CentroCusto
  contaContabil?: ContaContabil
  createdAt: string
  updatedAt: string
}

export interface CreateFinancialTransactionDto {
  companyId: string
  bankAccountId: string
  categoryId: string
  centroCustoId?: string
  contaContabilId?: string
  type: CategoryType
  transactionType: TransactionType
  amount: number
  fees?: number
  description: string
  referenceNumber?: string
  documentNumber?: string
  transactionDate: string
  competenceDate: string
  notes?: string
  attachments?: string[]
}

export interface UpdateFinancialTransactionDto {
  bankAccountId?: string
  categoryId?: string
  centroCustoId?: string
  contaContabilId?: string
  type?: CategoryType
  transactionType?: TransactionType
  amount?: number
  fees?: number
  description?: string
  referenceNumber?: string
  documentNumber?: string
  transactionDate?: string
  competenceDate?: string
  notes?: string
  attachments?: string[]
}

export interface TransactionFilters {
  companyId: string
  type?: CategoryType
  bankAccountId?: string
  categoryId?: string
  startDate?: string
  endDate?: string
}

// ============================================
// API de Lançamentos Financeiros
// ============================================

export const financialTransactionsApi = {
  /**
   * Listar lançamentos financeiros
   */
  async getAll(filters: TransactionFilters): Promise<FinancialTransaction[]> {
    try {
      const selectedCompany = authApi.getSelectedCompany()
      
      const params: any = { companyId: filters.companyId }
      
      if (filters.type) params.type = filters.type
      if (filters.bankAccountId) params.bankAccountId = filters.bankAccountId
      if (filters.categoryId) params.categoryId = filters.categoryId
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate

      const { data } = await apiClient.get<FinancialTransaction[]>(`/financial/transactions`, {
        params,
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
   * Criar lançamento financeiro
   * Nota: O saldo da conta bancária é atualizado automaticamente
   */
  async create(dados: CreateFinancialTransactionDto): Promise<FinancialTransaction> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.post<FinancialTransaction>('/financial/transactions', dados, {
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
   * Obter lançamento financeiro por ID
   */
  async getById(id: string, companyId: string): Promise<FinancialTransaction> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.get<FinancialTransaction>(`/financial/transactions/${id}`, {
        params: { companyId },
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
   * Atualizar lançamento financeiro
   * Nota: O saldo da conta bancária é recalculado automaticamente
   */
  async update(id: string, companyId: string, dados: UpdateFinancialTransactionDto): Promise<FinancialTransaction> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.patch<FinancialTransaction>(`/financial/transactions/${id}`, dados, {
        params: { companyId },
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
   * Conciliar lançamento financeiro
   */
  async reconcile(id: string, companyId: string): Promise<FinancialTransaction> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.patch<FinancialTransaction>(`/financial/transactions/${id}/reconcile`, {}, {
        params: { companyId },
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
   * Deletar lançamento financeiro
   * Nota: O saldo da conta bancária é revertido automaticamente
   */
  async delete(id: string, companyId: string): Promise<{ message: string }> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.delete<{ message: string }>(`/financial/transactions/${id}`, {
        params: { companyId },
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
// Tipos de Contas a Pagar
// ============================================

export type PayableStatus = 'PENDENTE' | 'PAGO' | 'VENCIDO' | 'PARCIAL' | 'CANCELADO'
export type RecurringPattern = 'MENSAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL'

export interface AccountPayable {
  id: string
  companyId: string
  categoryId: string
  supplierName: string
  supplierDocument: string
  description: string
  documentNumber?: string | null
  originalAmount: number
  paidAmount: number
  remainingAmount: number
  discountAmount: number
  interestAmount: number
  fineAmount: number
  issueDate: string
  dueDate: string
  competenceDate: string
  paymentDate?: string | null
  installmentNumber: number
  totalInstallments: number
  status: PayableStatus
  paymentMethod?: string | null
  bankAccountId?: string | null
  centroCustoId?: string | null
  contaContabilId?: string | null
  notes?: string | null
  attachments: string[]
  isRecurring: boolean
  recurringPattern?: RecurringPattern | null
  category?: FinancialCategory
  centroCusto?: CentroCusto
  contaContabil?: ContaContabil
  createdAt: string
  updatedAt: string
}

export interface CreateAccountPayableDto {
  companyId: string
  categoryId: string
  supplierName: string
  supplierDocument: string
  description: string
  documentNumber?: string
  originalAmount: number
  discountAmount?: number
  interestAmount?: number
  fineAmount?: number
  issueDate: string
  dueDate: string
  competenceDate: string
  installmentNumber?: number
  totalInstallments?: number
  status?: PayableStatus
  centroCustoId?: string
  contaContabilId?: string
  notes?: string
  isRecurring?: boolean
  recurringPattern?: RecurringPattern
}

export interface UpdateAccountPayableDto {
  categoryId?: string
  supplierName?: string
  supplierDocument?: string
  description?: string
  documentNumber?: string
  originalAmount?: number
  discountAmount?: number
  interestAmount?: number
  fineAmount?: number
  issueDate?: string
  dueDate?: string
  competenceDate?: string
  status?: PayableStatus
  centroCustoId?: string
  contaContabilId?: string
  notes?: string
}

export interface PayAccountPayableDto {
  amount: number
  paymentDate: string
  bankAccountId: string
  paymentMethod?: string
}

// ============================================
// API de Contas a Pagar
// ============================================

export const accountsPayableApi = {
  /**
   * Listar contas a pagar
   */
  async getAll(params: {
    companyId: string
    status?: PayableStatus
    startDate?: string
    endDate?: string
    categoryId?: string
  }): Promise<AccountPayable[]> {
    try {
      const selectedCompany = authApi.getSelectedCompany()
      
      const { data } = await apiClient.get<AccountPayable[]>(`/financial/accounts-payable`, {
        params,
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
   * Criar conta a pagar
   */
  async create(dados: CreateAccountPayableDto): Promise<AccountPayable> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.post<AccountPayable>('/financial/accounts-payable', dados, {
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
   * Obter conta a pagar por ID
   */
  async getById(id: string, companyId: string): Promise<AccountPayable> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.get<AccountPayable>(`/financial/accounts-payable/${id}`, {
        params: { companyId },
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
   * Listar contas vencidas
   */
  async getOverdue(companyId: string): Promise<AccountPayable[]> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.get<AccountPayable[]>(`/financial/accounts-payable/overdue`, {
        params: { companyId },
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
   * Pagar conta
   * Nota: O status é atualizado automaticamente (PAGO ou PARCIAL)
   */
  async pay(id: string, companyId: string, dados: PayAccountPayableDto): Promise<AccountPayable> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.patch<AccountPayable>(`/financial/accounts-payable/${id}/pay`, dados, {
        params: { companyId },
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
   * Atualizar conta a pagar
   */
  async update(id: string, companyId: string, dados: UpdateAccountPayableDto): Promise<AccountPayable> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.patch<AccountPayable>(`/financial/accounts-payable/${id}`, dados, {
        params: { companyId },
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
   * Deletar conta a pagar
   */
  async delete(id: string, companyId: string): Promise<{ message: string }> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.delete<{ message: string }>(`/financial/accounts-payable/${id}`, {
        params: { companyId },
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
// Tipos de Contas a Receber
// ============================================

export type ReceivableStatus = 'PENDENTE' | 'RECEBIDO' | 'VENCIDO' | 'PARCIAL' | 'CANCELADO'

export interface AccountReceivable {
  id: string
  companyId: string
  categoryId: string
  customerName: string
  customerDocument: string
  customerId?: string | null
  description: string
  documentNumber?: string | null
  originalAmount: number
  receivedAmount: number
  remainingAmount: number
  discountAmount: number
  interestAmount: number
  fineAmount: number
  issueDate: string
  dueDate: string
  competenceDate: string
  receiptDate?: string | null
  installmentNumber: number
  totalInstallments: number
  status: ReceivableStatus
  paymentMethod?: string | null
  bankAccountId?: string | null
  centroCustoId?: string | null
  contaContabilId?: string | null
  notes?: string | null
  attachments: string[]
  isRecurring: boolean
  recurringPattern?: RecurringPattern | null
  category?: FinancialCategory
  centroCusto?: CentroCusto
  contaContabil?: ContaContabil
  createdAt: string
  updatedAt: string
}

export interface CreateAccountReceivableDto {
  companyId: string
  categoryId: string
  customerName: string
  customerDocument: string
  customerId?: string
  description: string
  documentNumber?: string
  originalAmount: number
  discountAmount?: number
  interestAmount?: number
  fineAmount?: number
  issueDate: string
  dueDate: string
  competenceDate: string
  installmentNumber?: number
  totalInstallments?: number
  status?: ReceivableStatus
  centroCustoId?: string
  contaContabilId?: string
  notes?: string
  isRecurring?: boolean
  recurringPattern?: RecurringPattern
}

export interface UpdateAccountReceivableDto {
  categoryId?: string
  customerName?: string
  customerDocument?: string
  customerId?: string
  description?: string
  documentNumber?: string
  originalAmount?: number
  discountAmount?: number
  interestAmount?: number
  fineAmount?: number
  issueDate?: string
  dueDate?: string
  competenceDate?: string
  status?: ReceivableStatus
  centroCustoId?: string
  contaContabilId?: string
  notes?: string
}

export interface ReceiveAccountReceivableDto {
  amount: number
  receiptDate: string
  bankAccountId: string
  paymentMethod?: string
}

// ============================================
// API de Contas a Receber
// ============================================

export const accountsReceivableApi = {
  /**
   * Listar contas a receber
   */
  async getAll(params: {
    companyId: string
    status?: ReceivableStatus
    startDate?: string
    endDate?: string
    categoryId?: string
    customerId?: string
  }): Promise<AccountReceivable[]> {
    try {
      const selectedCompany = authApi.getSelectedCompany()
      
      const { data } = await apiClient.get<AccountReceivable[]>(`/financial/accounts-receivable`, {
        params,
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
   * Criar conta a receber
   */
  async create(dados: CreateAccountReceivableDto): Promise<AccountReceivable> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.post<AccountReceivable>('/financial/accounts-receivable', dados, {
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
   * Obter conta a receber por ID
   */
  async getById(id: string, companyId: string): Promise<AccountReceivable> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.get<AccountReceivable>(`/financial/accounts-receivable/${id}`, {
        params: { companyId },
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
   * Listar contas vencidas
   */
  async getOverdue(companyId: string): Promise<AccountReceivable[]> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.get<AccountReceivable[]>(`/financial/accounts-receivable/overdue`, {
        params: { companyId },
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
   * Receber pagamento
   * Nota: O status é atualizado automaticamente (RECEBIDO ou PARCIAL)
   */
  async receive(id: string, companyId: string, dados: ReceiveAccountReceivableDto): Promise<AccountReceivable> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.patch<AccountReceivable>(`/financial/accounts-receivable/${id}/receive`, dados, {
        params: { companyId },
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
   * Atualizar conta a receber
   */
  async update(id: string, companyId: string, dados: UpdateAccountReceivableDto): Promise<AccountReceivable> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.patch<AccountReceivable>(`/financial/accounts-receivable/${id}`, dados, {
        params: { companyId },
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
   * Deletar conta a receber
   */
  async delete(id: string, companyId: string): Promise<{ message: string }> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.delete<{ message: string }>(`/financial/accounts-receivable/${id}`, {
        params: { companyId },
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
// Tipos de Relatórios
// ============================================

export interface DashboardFinancialData {
  bankAccounts: {
    accounts: Array<{
      id: string
      accountName: string
      currentBalance: number
    }>
    totalBalance: number
  }
  accountsPayable: Array<{
    status: PayableStatus
    _sum: {
      remainingAmount: number
    }
    _count: number
  }>
  accountsReceivable: Array<{
    status: ReceivableStatus
    _sum: {
      remainingAmount: number
    }
    _count: number
  }>
  transactions: Array<{
    type: CategoryType
    _sum: {
      netAmount: number
    }
    _count: number
  }>
}

export interface CashFlowItem {
  date: string
  receitas: number
  despesas: number
  saldo: number
}

export interface ReportFilters {
  companyId: string
  startDate?: string
  endDate?: string
  status?: string
}

// ============================================
// API de Relatórios Financeiros
// ============================================

export const financialReportsApi = {
  /**
   * Obter dados do dashboard financeiro
   */
  async getDashboard(filters: ReportFilters): Promise<DashboardFinancialData> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.get<DashboardFinancialData>('/financial/reports/dashboard', {
        params: filters,
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
   * Obter fluxo de caixa
   */
  async getCashFlow(filters: ReportFilters): Promise<CashFlowItem[]> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.get<CashFlowItem[]>('/financial/reports/cash-flow', {
        params: filters,
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
   * Exportar fluxo de caixa (Excel)
   */
  async exportCashFlow(filters: ReportFilters): Promise<Blob> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.get('/financial/reports/cash-flow/export', {
        params: filters,
        headers: selectedCompany ? {
          'x-company-id': selectedCompany.id,
        } : {},
        responseType: 'blob',
      })
      
      return data
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Exportar contas a pagar (Excel)
   */
  async exportAccountsPayable(filters: ReportFilters): Promise<Blob> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.get('/financial/reports/accounts-payable/export', {
        params: filters,
        headers: selectedCompany ? {
          'x-company-id': selectedCompany.id,
        } : {},
        responseType: 'blob',
      })
      
      return data
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Exportar contas a receber (Excel)
   */
  async exportAccountsReceivable(filters: ReportFilters): Promise<Blob> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.get('/financial/reports/accounts-receivable/export', {
        params: filters,
        headers: selectedCompany ? {
          'x-company-id': selectedCompany.id,
        } : {},
        responseType: 'blob',
      })
      
      return data
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Exportar transações por centro de custo (Excel)
   */
  async exportTransactionsByCentroCusto(filters: ReportFilters): Promise<Blob> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.get('/financial/reports/transactions/by-centro-custo/export', {
        params: filters,
        headers: selectedCompany ? {
          'x-company-id': selectedCompany.id,
        } : {},
        responseType: 'blob',
      })
      
      return data
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Exportar transações por conta contábil (Excel)
   */
  async exportTransactionsByContaContabil(filters: ReportFilters): Promise<Blob> {
    try {
      const selectedCompany = authApi.getSelectedCompany()

      const { data } = await apiClient.get('/financial/reports/transactions/by-conta-contabil/export', {
        params: filters,
        headers: selectedCompany ? {
          'x-company-id': selectedCompany.id,
        } : {},
        responseType: 'blob',
      })
      
      return data
    } catch (error: any) {
      throw error
    }
  },
}

// ============================================
// Tipos OFX
// ============================================

export interface OFXTransaction {
  fitId: string
  type: 'CREDIT' | 'DEBIT'
  datePosted: string
  amount: number
  name: string
  memo: string
}

export interface OFXMatch {
  ofxTransactionId: string
  systemTransactionId?: string
  matchScore: number
  matchReasons: string[]
  autoMatched: boolean
}

export interface OFXImportResponse {
  totalTransactions: number
  autoMatched: number
  needsReview: number
  alreadyImported: number
  matches: OFXMatch[]
}

export interface SimilarTransaction {
  transactionId: string
  description: string
  amount: number
  transactionDate: string
  type: 'RECEITA' | 'DESPESA' | 'TRANSFERENCIA'
  categoryName?: string
  matchScore: number
  matchReasons: string[]
}

export interface OFXImport {
  id: string
  companyId: string
  bankAccountId: string
  fileName: string
  fileSize: number
  bankId: string
  accountId: string
  accountType: string
  startDate: string
  endDate: string
  balance: number
  balanceDate: string
  totalTransactions: number
  importedCount: number
  duplicateCount: number
  reconciledCount: number
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR'
  importedAt: string
  bankAccount?: {
    id: string
    accountName: string
    bankName: string
    bankCode?: string
    accountNumber?: string
  }
}

export interface OFXImportDetail extends OFXImport {
  transactions: OFXTransaction[]
}

export interface OFXImportsResponse {
  data: OFXImport[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ReconcileRequest {
  ofxFitId: string
}

// ============================================
// API OFX
// ============================================

export const ofxApi = {
  /**
   * Importar arquivo OFX
   */
  async importOFX(companyId: string, bankAccountId: string, file: File): Promise<OFXImportResponse> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const { data } = await apiClient.post('/financial/ofx/import', formData, {
        params: { companyId, bankAccountId },
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-company-id': companyId,
        },
      })

      return data
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Buscar transações similares
   */
  async findSimilar(
    companyId: string, 
    bankAccountId: string, 
    transaction: OFXTransaction
  ): Promise<SimilarTransaction[]> {
    try {
      const { data } = await apiClient.post('/financial/ofx/find-similar', transaction, {
        params: { companyId, bankAccountId },
        headers: {
          'x-company-id': companyId,
        },
      })

      return data
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Conciliar manualmente
   */
  async reconcile(
    companyId: string,
    systemTransactionId: string,
    ofxFitId: string
  ): Promise<FinancialTransaction> {
    try {
      const { data } = await apiClient.patch(
        `/financial/ofx/reconcile/${systemTransactionId}`,
        { ofxFitId },
        {
          params: { companyId },
          headers: {
            'x-company-id': companyId,
          },
        }
      )

      return data
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Listar extratos OFX importados
   */
  async listImports(params: {
    companyId: string
    bankAccountId?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }): Promise<OFXImportsResponse> {
    try {
      const { data } = await apiClient.get('/financial/ofx/imports', {
        params,
        headers: {
          'x-company-id': params.companyId,
        },
      })

      return data
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Buscar detalhes de um extrato OFX
   */
  async getImportDetails(companyId: string, id: string): Promise<OFXImportDetail> {
    try {
      const { data } = await apiClient.get(`/financial/ofx/imports/${id}`, {
        params: { companyId },
        headers: {
          'x-company-id': companyId,
        },
      })

      return data
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Deletar extrato OFX
   */
  async deleteImport(companyId: string, id: string): Promise<void> {
    try {
      await apiClient.delete(`/financial/ofx/imports/${id}`, {
        params: { companyId },
        headers: {
          'x-company-id': companyId,
        },
      })
    } catch (error: any) {
      throw error
    }
  },
}
