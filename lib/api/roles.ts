import { apiClient } from './client'

// ==========================================
// TYPES
// ==========================================

export interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: string
  createdAt?: string
  updatedAt?: string
}

export interface Role {
  id: string
  name: string
  description: string
  usersCount?: number
  createdAt?: string
  updatedAt?: string
  permissions: Permission[]
}

export interface AllPermissionsResponse {
  all: Permission[]
  byResource: Record<string, Permission[]>
}

export interface CreateRoleRequest {
  name: string
  description?: string
  permissionIds?: string[]
}

export interface UpdateRoleRequest {
  name?: string
  description?: string
}

// ==========================================
// ROLES API
// ==========================================

export const rolesApi = {
  /**
   * Listar todas as roles
   * 
   * @returns Lista de todas as roles com permissões e contagem de usuários
   * 
   * @example
   * const roles = await rolesApi.getAll()
   * console.log(roles) // [{ id, name, description, permissions, usersCount }]
   */
  getAll: async (): Promise<Role[]> => {
    try {
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

      const { data } = await apiClient.get<Role[]>('/roles', {
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
   * Buscar role por nome
   * 
   * @param name - Nome da role (admin, manager, sales, viewer, etc)
   * @returns Detalhes da role com todas as permissões
   * 
   * @example
   * // Buscar role admin
   * const adminRole = await rolesApi.getByName('admin')
   * 
   * // Buscar role manager
   * const managerRole = await rolesApi.getByName('manager')
   */
  getByName: async (name: string): Promise<Role> => {
    try {
      // Pega a empresa para o header x-company-id
      let companyId = ''
      if (typeof window !== 'undefined') {
        const selectedCompany = localStorage.getItem('selectedCompany')
        if (selectedCompany) {
          const company = JSON.parse(selectedCompany)
          companyId = company.id
        } else {
          const user = localStorage.getItem('user')
          if (user) {
            const userData = JSON.parse(user)
            if (userData.companies && userData.companies.length > 0) {
              companyId = userData.companies[0].id
            }
          }
        }
      }

      const { data } = await apiClient.get<Role>(`/roles/name/${name}`, {
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
   * Buscar role por ID
   * 
   * @param id - ID da role
   * @returns Detalhes da role com todas as permissões
   * 
   * @example
   * const role = await rolesApi.getById('role-uuid')
   */
  getById: async (id: string): Promise<Role> => {
    try {
      // Pega a empresa para o header x-company-id
      let companyId = ''
      if (typeof window !== 'undefined') {
        const selectedCompany = localStorage.getItem('selectedCompany')
        if (selectedCompany) {
          const company = JSON.parse(selectedCompany)
          companyId = company.id
        } else {
          const user = localStorage.getItem('user')
          if (user) {
            const userData = JSON.parse(user)
            if (userData.companies && userData.companies.length > 0) {
              companyId = userData.companies[0].id
            }
          }
        }
      }

      const { data } = await apiClient.get<Role>(`/roles/${id}`, {
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
   * Listar todas as permissões disponíveis
   * 
   * @returns Objeto com todas as permissões e agrupadas por recurso
   * 
   * @example
   * const permissions = await rolesApi.getAllPermissions()
   * console.log(permissions.all) // Array com todas as permissões
   * console.log(permissions.byResource.users) // Apenas permissões de users
   */
  getAllPermissions: async (): Promise<AllPermissionsResponse> => {
    try {
      // Pega a empresa para o header x-company-id
      let companyId = ''
      if (typeof window !== 'undefined') {
        const selectedCompany = localStorage.getItem('selectedCompany')
        if (selectedCompany) {
          const company = JSON.parse(selectedCompany)
          companyId = company.id
        } else {
          const user = localStorage.getItem('user')
          if (user) {
            const userData = JSON.parse(user)
            if (userData.companies && userData.companies.length > 0) {
              companyId = userData.companies[0].id
            }
          }
        }
      }

      const { data } = await apiClient.get<AllPermissionsResponse>('/roles/permissions/all', {
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
   * Criar nova role
   * 
   * @param roleData - Dados da nova role
   * @returns Role criada com permissões
   * 
   * @example
   * const newRole = await rolesApi.create({
   *   name: 'support',
   *   description: 'Suporte técnico',
   *   permissionIds: ['perm-1', 'perm-2']
   * })
   */
  create: async (roleData: CreateRoleRequest): Promise<Role> => {
    try {
      // Pega a empresa para o header x-company-id
      let companyId = ''
      if (typeof window !== 'undefined') {
        const selectedCompany = localStorage.getItem('selectedCompany')
        if (selectedCompany) {
          const company = JSON.parse(selectedCompany)
          companyId = company.id
        } else {
          const user = localStorage.getItem('user')
          if (user) {
            const userData = JSON.parse(user)
            if (userData.companies && userData.companies.length > 0) {
              companyId = userData.companies[0].id
            }
          }
        }
      }

      const { data } = await apiClient.post<Role>('/roles', roleData, {
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
   * Atualizar role existente
   * 
   * @param id - ID da role
   * @param roleData - Dados a serem atualizados
   * @returns Role atualizada
   * 
   * @example
   * const updated = await rolesApi.update('role-uuid', {
   *   name: 'super-support',
   *   description: 'Suporte avançado'
   * })
   */
  update: async (id: string, roleData: UpdateRoleRequest): Promise<Role> => {
    try {
      // Pega a empresa para o header x-company-id
      let companyId = ''
      if (typeof window !== 'undefined') {
        const selectedCompany = localStorage.getItem('selectedCompany')
        if (selectedCompany) {
          const company = JSON.parse(selectedCompany)
          companyId = company.id
        } else {
          const user = localStorage.getItem('user')
          if (user) {
            const userData = JSON.parse(user)
            if (userData.companies && userData.companies.length > 0) {
              companyId = userData.companies[0].id
            }
          }
        }
      }

      const { data } = await apiClient.patch<Role>(`/roles/${id}`, roleData, {
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
   * Deletar role
   * 
   * @param id - ID da role
   * @throws Error se houver usuários com esta role
   * 
   * @example
   * await rolesApi.delete('role-uuid')
   */
  delete: async (id: string): Promise<void> => {
    try {
      // Pega a empresa para o header x-company-id
      let companyId = ''
      if (typeof window !== 'undefined') {
        const selectedCompany = localStorage.getItem('selectedCompany')
        if (selectedCompany) {
          const company = JSON.parse(selectedCompany)
          companyId = company.id
        } else {
          const user = localStorage.getItem('user')
          if (user) {
            const userData = JSON.parse(user)
            if (userData.companies && userData.companies.length > 0) {
              companyId = userData.companies[0].id
            }
          }
        }
      }

      await apiClient.delete(`/roles/${id}`, {
        headers: companyId ? {
          'x-company-id': companyId,
        } : undefined,
      })
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Adicionar permissões a uma role
   * 
   * @param roleId - ID da role
   * @param permissionIds - IDs das permissões a adicionar
   * @returns Role atualizada com novas permissões
   * 
   * @example
   * const updated = await rolesApi.addPermissions('role-uuid', ['perm-1', 'perm-2'])
   */
  addPermissions: async (roleId: string, permissionIds: string[]): Promise<Role> => {
    try {
      // Pega a empresa para o header x-company-id
      let companyId = ''
      if (typeof window !== 'undefined') {
        const selectedCompany = localStorage.getItem('selectedCompany')
        if (selectedCompany) {
          const company = JSON.parse(selectedCompany)
          companyId = company.id
        } else {
          const user = localStorage.getItem('user')
          if (user) {
            const userData = JSON.parse(user)
            if (userData.companies && userData.companies.length > 0) {
              companyId = userData.companies[0].id
            }
          }
        }
      }

      const { data } = await apiClient.post<Role>(`/roles/${roleId}/permissions`, {
        permissionIds,
      }, {
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
   * Remover permissões de uma role
   * 
   * @param roleId - ID da role
   * @param permissionIds - IDs das permissões a remover
   * @returns Role atualizada sem as permissões removidas
   * 
   * @example
   * const updated = await rolesApi.removePermissions('role-uuid', ['perm-1', 'perm-2'])
   */
  removePermissions: async (roleId: string, permissionIds: string[]): Promise<Role> => {
    try {
      // Pega a empresa para o header x-company-id
      let companyId = ''
      if (typeof window !== 'undefined') {
        const selectedCompany = localStorage.getItem('selectedCompany')
        if (selectedCompany) {
          const company = JSON.parse(selectedCompany)
          companyId = company.id
        } else {
          const user = localStorage.getItem('user')
          if (user) {
            const userData = JSON.parse(user)
            if (userData.companies && userData.companies.length > 0) {
              companyId = userData.companies[0].id
            }
          }
        }
      }

      const { data } = await apiClient.delete<Role>(`/roles/${roleId}/permissions`, {
        data: {
          permissionIds,
        },
        headers: companyId ? {
          'x-company-id': companyId,
        } : undefined,
      })
      return data
    } catch (error: any) {
      throw error
    }
  },
}
