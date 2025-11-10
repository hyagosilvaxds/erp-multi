import { apiClient } from './client'

// Tipos
export interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: string
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
}

export interface Company {
  id: string
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
  logoUrl: string | null
  email: string
  telefone: string
  cidade: string
  estado: string
  active: boolean
  role: Role
}

export interface User {
  userId: string
  email: string
  name: string
  companies: Company[]
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  user: User
}

// Funções de autenticação
export const authApi = {
  /**
   * Faz login do usuário
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const { data } = await apiClient.post<LoginResponse>('/auth/login', credentials)
      
      // Salvar token no localStorage e cookies
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('companies', JSON.stringify(data.user.companies))
        
        // Salvar token no cookie para o middleware
        document.cookie = `token=${data.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
      }
      
      return data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao fazer login')
    }
  },

  /**
   * Busca o perfil do usuário autenticado
   */
  async getProfile(): Promise<User> {
    try {
      const { data } = await apiClient.get<User>('/auth/profile')
      
      // Atualizar dados no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(data))
        localStorage.setItem('companies', JSON.stringify(data.companies))
      }
      
      return data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar perfil')
    }
  },

  /**
   * Busca as empresas do usuário autenticado
   */
  async getUserCompanies(): Promise<Company[]> {
    try {
      const { data } = await apiClient.get<Company[]>('/users/me/companies')
      
      // Atualizar dados no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('companies', JSON.stringify(data))
      }
      
      return data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar empresas')
    }
  },

  /**
   * Faz logout do usuário
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('companies')
      localStorage.removeItem('selectedCompany')
      
      // Remover token do cookie
      document.cookie = 'token=; path=/; max-age=0; SameSite=Lax'
      
      window.location.href = '/login'
    }
  },

  /**
   * Altera a senha do usuário autenticado
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
    try {
      const { data } = await apiClient.patch<{ message: string }>('/auth/change-password', {
        oldPassword,
        newPassword,
      })
      
      return data
    } catch (error: any) {
      const message = error.response?.data?.message
      if (Array.isArray(message)) {
        throw new Error(message.join(', '))
      }
      throw new Error(message || 'Erro ao alterar senha')
    }
  },

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('token')
    }
    return false
  },

  /**
   * Obtém o token do localStorage
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  },

  /**
   * Obtém o usuário do localStorage
   */
  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    }
    return null
  },

  /**
   * Obtém as empresas do localStorage
   */
  getCompanies(): Company[] | null {
    if (typeof window !== 'undefined') {
      const companies = localStorage.getItem('companies')
      return companies ? JSON.parse(companies) : null
    }
    return null
  },

  /**
   * Define a empresa selecionada
   */
  setSelectedCompany(company: Company): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCompany', JSON.stringify(company))
    }
  },

  /**
   * Obtém a empresa selecionada
   */
  getSelectedCompany(): Company | null {
    if (typeof window !== 'undefined') {
      const company = localStorage.getItem('selectedCompany')
      return company ? JSON.parse(company) : null
    }
    return null
  },

  /**
   * Obtém as permissões da empresa selecionada
   */
  getSelectedCompanyPermissions(): Permission[] {
    const company = this.getSelectedCompany()
    return company?.role.permissions || []
  },
}

// ============================================
// API de Empresas (Admin)
// ============================================

export interface CompanyAdmin {
  id: string
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
  inscricaoEstadual: string | null
  inscricaoMunicipal: string | null
  regimeTributario: string | null
  email: string | null
  telefone: string | null
  celular: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  active: boolean
  situacaoCadastral: string
  logoUrl: string | null
  createdAt: string
  updatedAt: string
  _count: {
    users: number
  }
}

export const companiesApi = {
  /**
   * Lista todas as empresas (Admin only)
   * Requer permissão companies.read e role admin
   */
  async getAllCompanies(params?: {
    search?: string
    page?: number
    limit?: number
  }): Promise<CompanyAdmin[]> {
    try {
      const selectedCompany = authApi.getSelectedCompany()
      
      if (!selectedCompany) {
        throw new Error('Nenhuma empresa selecionada')
      }

      // Construir query params
      const queryParams = new URLSearchParams()
      if (params?.search) {
        queryParams.append('search', params.search)
      }
      if (params?.page) {
        queryParams.append('page', params.page.toString())
      }
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString())
      }

      const queryString = queryParams.toString()
      const url = `/companies/admin/all${queryString ? `?${queryString}` : ''}`

      const { data } = await apiClient.get<CompanyAdmin[]>(url, {
        headers: {
          'x-company-id': selectedCompany.id,
        },
      })
      
      return data
    } catch (error: any) {
      // Re-lançar o erro original para preservar a estrutura da API
      throw error
    }
  },

  /**
   * Busca detalhes de uma empresa específica (Admin only)
   * Requer permissão companies.read e role admin
   */
  async getCompanyById(companyId: string): Promise<any> {
    try {
      const selectedCompany = authApi.getSelectedCompany()
      
      if (!selectedCompany) {
        throw new Error('Nenhuma empresa selecionada')
      }

      const { data } = await apiClient.get(`/companies/admin/${companyId}`, {
        headers: {
          'x-company-id': selectedCompany.id,
        },
      })
      
      return data
    } catch (error: any) {
      // Re-lançar o erro original para preservar a estrutura da API
      throw error
    }
  },

  /**
   * Atualiza uma empresa (Admin only)
   * Requer permissão companies.update e role admin
   */
  async updateCompany(companyId: string, data: any): Promise<any> {
    try {
      const selectedCompany = authApi.getSelectedCompany()
      
      if (!selectedCompany) {
        throw new Error('Nenhuma empresa selecionada')
      }

      const response = await apiClient.patch(`/companies/admin/${companyId}`, data, {
        headers: {
          'x-company-id': selectedCompany.id,
        },
      })
      
      return response.data
    } catch (error: any) {
      // Re-lançar o erro original para preservar a estrutura da API
      throw error
    }
  },

  /**
   * Faz upload da logo da empresa (Admin only)
   * Requer permissão companies.update e role admin
   */
  async uploadLogo(companyId: string, file: File): Promise<any> {
    try {
      const selectedCompany = authApi.getSelectedCompany()
      
      if (!selectedCompany) {
        throw new Error('Nenhuma empresa selecionada')
      }

      const formData = new FormData()
      formData.append('logo', file)

      const response = await apiClient.post(`/companies/admin/${companyId}/logo`, formData, {
        headers: {
          'x-company-id': selectedCompany.id,
          'Content-Type': 'multipart/form-data',
        },
      })
      
      return response.data
    } catch (error: any) {
      // Re-lançar o erro original para preservar a estrutura da API
      throw error
    }
  },

  /**
   * Remove a logo da empresa (Admin only)
   * Requer permissão companies.update e role admin
   */
  async removeLogo(companyId: string): Promise<any> {
    try {
      const selectedCompany = authApi.getSelectedCompany()
      
      if (!selectedCompany) {
        throw new Error('Nenhuma empresa selecionada')
      }

      const response = await apiClient.delete(`/companies/admin/${companyId}/logo`, {
        headers: {
          'x-company-id': selectedCompany.id,
        },
      })
      
      return response.data
    } catch (error: any) {
      // Re-lançar o erro original para preservar a estrutura da API
      throw error
    }
  },

  /**
   * Faz upload do certificado digital A1 da empresa (Admin only)
   * Requer permissão companies.update e role admin
   */
  async uploadCertificate(companyId: string, file: File, senha: string): Promise<any> {
    try {
      const selectedCompany = authApi.getSelectedCompany()
      
      if (!selectedCompany) {
        throw new Error('Nenhuma empresa selecionada')
      }

      const formData = new FormData()
      formData.append('certificate', file)
      formData.append('senha', senha)

      const response = await apiClient.post(`/companies/admin/${companyId}/certificate`, formData, {
        headers: {
          'x-company-id': selectedCompany.id,
          'Content-Type': 'multipart/form-data',
        },
      })
      
      return response.data
    } catch (error: any) {
      // Re-lançar o erro original para preservar a estrutura da API
      throw error
    }
  },

  /**
   * Remove o certificado digital da empresa (Admin only)
   * Requer permissão companies.update e role admin
   */
  async removeCertificate(companyId: string): Promise<any> {
    try {
      const selectedCompany = authApi.getSelectedCompany()
      
      if (!selectedCompany) {
        throw new Error('Nenhuma empresa selecionada')
      }

      const response = await apiClient.delete(`/companies/admin/${companyId}/certificate`, {
        headers: {
          'x-company-id': selectedCompany.id,
        },
      })
      
      return response.data
    } catch (error: any) {
      // Re-lançar o erro original para preservar a estrutura da API
      throw error
    }
  },
}

// ============================================
// Tipos de Auditoria
// ============================================

export interface AuditUser {
  id: string
  name: string
  email: string
}

export interface AuditLog {
  id: string
  companyId: string
  userId: string
  user: AuditUser
  action: string
  entityType: string
  fieldName: string | null
  oldValue: any | null
  newValue: any | null
  ipAddress: string | null
  userAgent: string | null
  description: string | null
  createdAt: string
}

export interface AuditResponse {
  data: AuditLog[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export const auditApi = {
  /**
   * Busca o histórico de auditoria de uma empresa (Admin only)
   * Requer permissão MANAGE_COMPANIES
   */
  async getCompanyAudit(companyId: string, params?: {
    page?: number
    limit?: number
    action?: string
  }): Promise<AuditResponse> {
    try {
      const selectedCompany = authApi.getSelectedCompany()
      
      if (!selectedCompany) {
        throw new Error('Nenhuma empresa selecionada')
      }

      // Construir query params
      const queryParams = new URLSearchParams()
      if (params?.page) {
        queryParams.append('page', params.page.toString())
      }
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString())
      }
      if (params?.action) {
        queryParams.append('action', params.action)
      }

      const queryString = queryParams.toString()
      const url = `/audit/company/${companyId}${queryString ? `?${queryString}` : ''}`

      const { data } = await apiClient.get<AuditResponse>(url, {
        headers: {
          'x-company-id': selectedCompany.id,
        },
      })
      
      return data
    } catch (error: any) {
      // Re-lançar o erro original para preservar a estrutura da API
      throw error
    }
  },
}
