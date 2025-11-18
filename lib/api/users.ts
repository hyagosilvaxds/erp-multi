import { apiClient } from './client'

// ==========================================
// TYPES
// ==========================================

export interface UserCompany {
  companyId: string
  roleId: string
  active: boolean
  createdAt: string
  company?: {
    id: string
    nomeFantasia: string
    razaoSocial: string
    cnpj: string
    logoUrl?: string | null
  }
  role: {
    id: string
    name: string
    description: string
    rolePermissions?: Array<{
      permission: {
        id: string
        name: string
        description: string
        resource: string
        action: string
      }
    }>
  }
}

export interface UserDetail {
  id: string
  email: string
  name: string
  active: boolean
  createdAt: string
  updatedAt: string
  companies: UserCompany[]
}

export interface UsersListResponse {
  data: UserDetail[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  company: {
    id: string
    nomeFantasia: string
    razaoSocial: string
  }
}

export interface GetCompanyUsersParams {
  page?: number
  limit?: number
  search?: string
  active?: boolean
  roleId?: string
}

export interface AllUsersListResponse {
  data: Array<UserDetail & {
    _count: {
      companies: number
    }
  }>
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface GetAllUsersParams {
  page?: number
  limit?: number
  search?: string
  active?: boolean
}

export interface Role {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

// ==========================================
// USERS API
// ==========================================

export const usersApi = {
  /**
   * Listar TODOS os usuários do sistema (independente de empresa)
   * 
   * @param params - Parâmetros de filtro e paginação
   * @returns Lista de todos os usuários do sistema
   * 
   * @permission users.read
   * 
   * @example
   * // Todos os usuários (primeira página)
   * const users = await usersApi.getAll()
   * 
   * // Buscar por termo
   * const results = await usersApi.getAll({ search: 'João' })
   * 
   * // Apenas usuários ativos
   * const active = await usersApi.getAll({ active: true })
   * 
   * // Paginação customizada
   * const page2 = await usersApi.getAll({ page: 2, limit: 20 })
   */
  getAll: async (params?: GetAllUsersParams): Promise<AllUsersListResponse> => {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.search) queryParams.append('search', params.search)
      if (params?.active !== undefined) queryParams.append('active', params.active.toString())
      
      const url = `/users/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      
      // Pega a empresa para o header x-company-id
      let companyId = ''
      if (typeof window !== 'undefined') {
        // Tenta pegar a empresa selecionada
        const selectedCompany = localStorage.getItem('selectedCompany')
        if (selectedCompany) {
          const company = JSON.parse(selectedCompany)
          companyId = company.id
        } else {
          // Se não tiver empresa selecionada, pega a primeira empresa do usuário
          const user = localStorage.getItem('user')
          if (user) {
            const userData = JSON.parse(user)
            if (userData.companies && userData.companies.length > 0) {
              companyId = userData.companies[0].id
            }
          }
        }
      }
      
      const { data } = await apiClient.get<AllUsersListResponse>(url, {
        headers: companyId ? {
          'x-company-id': companyId,
        } : undefined,
      })
      
      return data
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Listar usuários de uma empresa
   * 
   * @param companyId - ID da empresa
   * @param params - Parâmetros de filtro e paginação
   * @returns Lista de usuários da empresa
   * 
   * @example
   * // Todos os usuários da empresa
   * const users = await usersApi.getByCompany('empresa-uuid')
   * 
   * // Apenas administradores
   * const admins = await usersApi.getByCompany('empresa-uuid', { roleId: 'admin-role-uuid' })
   * 
   * // Buscar por nome
   * const results = await usersApi.getByCompany('empresa-uuid', { search: 'Maria' })
   * 
   * // Apenas ativos
   * const active = await usersApi.getByCompany('empresa-uuid', { active: true })
   */
  getByCompany: async (companyId: string, params?: GetCompanyUsersParams): Promise<UsersListResponse> => {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.search) queryParams.append('search', params.search)
      if (params?.active !== undefined) queryParams.append('active', params.active.toString())
      if (params?.roleId) queryParams.append('roleId', params.roleId)
      
      const url = `/users/company/${companyId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      
      const { data } = await apiClient.get<UsersListResponse>(url, {
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
   * Buscar usuário por ID
   * 
   * @param userId - ID do usuário
   * @param companyId - ID da empresa (obrigatório para autenticação)
   * @returns Detalhes completos do usuário incluindo todas as empresas e permissões
   * 
   * @example
   * const user = await usersApi.getById('user-uuid', 'company-uuid')
   * console.log(user.companies) // Lista de empresas do usuário
   */
  getById: async (userId: string, companyId: string): Promise<UserDetail> => {
    try {
      const { data } = await apiClient.get<UserDetail>(`/users/${userId}`, {
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
   * Criar um novo usuário
   * 
   * @param dto - Dados do novo usuário
   * @param companyId - ID da empresa (usuário será vinculado automaticamente)
   * @returns Usuário criado
   * 
   * @permission users.create
   * 
   * @example
   * const newUser = await usersApi.create({
   *   email: 'usuario@exemplo.com',
   *   name: 'João da Silva',
   *   password: 'senha123',
   *   active: true
   * }, 'company-uuid')
   */
  create: async (
    dto: { email: string; name: string; password: string; active?: boolean },
    companyId: string
  ): Promise<UserDetail> => {
    try {
      const { data } = await apiClient.post<UserDetail>('/users', dto, {
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
   * Alterar role de um usuário em uma empresa
   * 
   * @param userId - ID do usuário
   * @param companyId - ID da empresa
   * @param roleId - ID da nova role
   * @returns Usuário atualizado
   * 
   * @example
   * await usersApi.updateUserRole('user-uuid', 'company-uuid', 'new-role-uuid')
   */
  updateUserRole: async (userId: string, companyId: string, roleId: string): Promise<UserDetail> => {
    try {
      const { data } = await apiClient.patch<UserDetail>(
        `/users/${userId}/companies/${companyId}/role`,
        { roleId },
        {
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
   * Atualizar dados de um usuário
   * 
   * @param userId - ID do usuário
   * @param companyId - ID da empresa (para autenticação)
   * @param data - Dados a serem atualizados
   * @returns Usuário atualizado
   * 
   * @example
   * await usersApi.update('user-uuid', 'company-uuid', { name: 'Novo Nome', email: 'novo@email.com' })
   */
  update: async (
    userId: string,
    companyId: string,
    data: {
      email?: string
      name?: string
      password?: string
      active?: boolean
    }
  ): Promise<UserDetail> => {
    try {
      const { data: result } = await apiClient.patch<UserDetail>(
        `/users/${userId}`,
        data,
        {
          headers: {
            'x-company-id': companyId,
          },
        }
      )
      
      return result
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Ativar/Desativar usuário
   * 
   * @param userId - ID do usuário
   * @param companyId - ID da empresa (para autenticação)
   * @returns Usuário com status atualizado
   * 
   * @example
   * await usersApi.toggleActive('user-uuid', 'company-uuid')
   */
  toggleActive: async (userId: string, companyId: string): Promise<UserDetail> => {
    try {
      const { data } = await apiClient.patch<UserDetail>(
        `/users/${userId}/toggle-active`,
        {},
        {
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
   * Deletar usuário (soft delete)
   * 
   * @param userId - ID do usuário
   * @param companyId - ID da empresa (para autenticação)
   * 
   * @example
   * await usersApi.delete('user-uuid', 'company-uuid')
   */
  delete: async (userId: string, companyId: string): Promise<void> => {
    try {
      await apiClient.delete(`/users/${userId}`, {
        headers: {
          'x-company-id': companyId,
        },
      })
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Vincular usuário a uma empresa
   * 
   * @param userId - ID do usuário
   * @param companyId - ID da empresa (para autenticação e vínculo)
   * @param data - Dados do vínculo (companyId, roleId, active)
   * @returns Dados do vínculo criado
   * 
   * @example
   * const link = await usersApi.linkCompany('user-uuid', 'company-uuid', {
   *   companyId: 'company-uuid',
   *   roleId: 'role-uuid',
   *   active: true
   * })
   */
  linkCompany: async (
    userId: string,
    companyId: string,
    data: {
      companyId: string
      roleId: string
      active: boolean
    }
  ): Promise<{
    userId: string
    companyId: string
    roleId: string
    active: boolean
    createdAt: string
    company: {
      id: string
      nomeFantasia: string
      razaoSocial: string
    }
    role: {
      id: string
      name: string
      description: string
    }
  }> => {
    try {
      const { data: response } = await apiClient.post(
        `/users/${userId}/companies`,
        data,
        {
          headers: {
            'x-company-id': companyId,
          },
        }
      )
      return response
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Desvincular usuário de uma empresa
   * 
   * @param userId - ID do usuário
   * @param companyId - ID da empresa a ser desvinculada
   * @param authCompanyId - ID da empresa para autenticação (pode ser a mesma ou outra)
   * 
   * @example
   * await usersApi.unlinkCompany('user-uuid', 'company-to-remove-uuid', 'auth-company-uuid')
   */
  unlinkCompany: async (
    userId: string,
    companyId: string,
    authCompanyId: string
  ): Promise<void> => {
    try {
      await apiClient.delete(`/users/${userId}/companies/${companyId}`, {
        headers: {
          'x-company-id': authCompanyId,
        },
      })
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Listar todas as roles disponíveis no sistema
   * 
   * @returns Lista de roles
   * 
   * @example
   * const roles = await usersApi.getRoles()
   * // roles: [{ id: 'uuid', name: 'Gerente', description: '...' }, ...]
   */
  getRoles: async (): Promise<Role[]> => {
    try {
      const selectedCompany = await import('./auth').then(m => m.authApi.getSelectedCompany())
      if (!selectedCompany) {
        throw new Error('Nenhuma empresa selecionada')
      }

      const { data } = await apiClient.get('/roles', {
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
