import { apiClient } from './client'

// ==========================================
// TYPES
// ==========================================

export interface User {
  id: string
  name: string
  email: string
}

export interface Folder {
  id: string
  companyId: string
  name: string
  description?: string
  color?: string
  icon?: string
  parentId?: string | null
  isPublic: boolean
  createdById: string
  createdAt: string
  updatedAt: string
  createdBy?: User
  documentsCount?: number
  subfoldersCount?: number
}

export interface Document {
  id: string
  companyId: string
  folderId?: string | null
  name: string
  fileName: string
  description?: string
  fileUrl: string
  mimeType: string
  size: number
  fileSize: number
  version: number
  expiresAt?: string | null
  isExpired?: boolean
  tags?: string[]
  metadata?: Record<string, any>
  isPublic: boolean
  uploadedById: string
  reference?: string
  documentType?: string
  previousVersionId?: string | null
  createdAt: string
  updatedAt: string
  uploadedBy?: User
  folder?: Folder
  previousVersion?: {
    id: string
    name: string
    version: number
    createdAt: string
    uploadedBy?: User
  }
  nextVersions?: Array<{
    id: string
    name: string
    version: number
    createdAt: string
    uploadedBy?: User
  }>
  allVersions?: Array<{
    id: string
    name: string
    fileName: string
    fileSize: number
    version: number
    isLatest: boolean
    createdAt: string
    uploadedBy?: User
  }>
}

export interface DocumentStats {
  total: number
  totalSize: number
  totalSizeFormatted: string
  uploadsThisMonth: number
  differentFileTypes: number
  differentMimeTypes: number
  differentDocumentTypes: number
  byDocumentType: Record<string, number>
  byFileExtension: Record<string, number>
  byMimeType: Record<string, number>
  byFolder: Record<string, number>
  expired: number
  expiringSoon: number
  recentUploads: number
}

export interface DocumentListParams {
  folderId?: string
  documentType?: string
  tags?: string
  expired?: boolean
  expiresIn?: number
  search?: string
  page?: number
  limit?: number
}

export interface DocumentListResponse {
  total: number
  page: number
  limit: number
  totalPages: number
  documents: Document[]
}

export interface CreateFolderRequest {
  name: string
  description?: string
  color?: string
  icon?: string
  parentId?: string | null
  isPublic?: boolean
  allowedRoleIds?: string[]
}

export interface UpdateFolderRequest {
  name?: string
  description?: string
  color?: string
  icon?: string
  isPublic?: boolean
  allowedRoleIds?: string[]
}

export interface UploadDocumentRequest {
  file: File
  title?: string
  name?: string
  description?: string
  folderId?: string
  reference?: string
  type?: string
  documentType?: string
  tags?: string
  context?: 'stock_movement' | 'stock_transfer' | 'other'
  expiresAt?: string
  isPublic?: boolean
}

export interface UpdateDocumentRequest {
  name?: string
  description?: string
  folderId?: string
  expiresAt?: string
  tags?: string[]
  isPublic?: boolean
}

// ==========================================
// FOLDERS API
// ==========================================

export const foldersApi = {
  /**
   * Listar todas as pastas
   * 
   * @param parentId - ID da pasta pai (opcional, omitir para pastas raiz)
   * @returns Lista de pastas
   */
  getAll: async (parentId?: string): Promise<Folder[]> => {
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

      const params = new URLSearchParams()
      if (parentId) {
        params.append('parentId', parentId)
      }

      const url = `/documents/folders${params.toString() ? `?${params.toString()}` : ''}`

      const { data } = await apiClient.get<Folder[]>(url, {
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
   * Criar nova pasta
   * 
   * @param folderData - Dados da pasta
   * @returns Pasta criada
   */
  create: async (folderData: CreateFolderRequest): Promise<Folder> => {
    try {
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

      const { data } = await apiClient.post<Folder>('/documents/folders', folderData, {
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
   * Atualizar pasta
   * 
   * @param id - ID da pasta
   * @param folderData - Dados a atualizar
   * @returns Pasta atualizada
   */
  update: async (id: string, folderData: UpdateFolderRequest): Promise<Folder> => {
    try {
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

      const { data } = await apiClient.patch<Folder>(`/documents/folders/${id}`, folderData, {
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
   * Deletar pasta
   * 
   * @param id - ID da pasta
   * @param force - Forçar deleção mesmo com conteúdo
   */
  delete: async (id: string, force: boolean = false): Promise<void> => {
    try {
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

      const params = new URLSearchParams()
      if (force) {
        params.append('force', 'true')
      }

      const url = `/documents/folders/${id}${params.toString() ? `?${params.toString()}` : ''}`

      await apiClient.delete(url, {
        headers: companyId ? {
          'x-company-id': companyId,
        } : undefined,
      })
    } catch (error: any) {
      throw error
    }
  },
}

// ==========================================
// DOCUMENTS API
// ==========================================

export const documentsApi = {
  /**
   * Listar documentos com filtros e paginação
   * 
   * @param params - Parâmetros de filtro e paginação
   * @returns Lista paginada de documentos
   */
  getAll: async (params?: DocumentListParams): Promise<DocumentListResponse> => {
    try {
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

      const queryParams = new URLSearchParams()
      if (params?.folderId) queryParams.append('folderId', params.folderId)
      if (params?.documentType) queryParams.append('documentType', params.documentType)
      if (params?.tags) queryParams.append('tags', params.tags)
      if (params?.expired !== undefined) queryParams.append('expired', String(params.expired))
      if (params?.expiresIn) queryParams.append('expiresIn', String(params.expiresIn))
      if (params?.search) queryParams.append('search', params.search)
      if (params?.page) queryParams.append('page', String(params.page))
      if (params?.limit) queryParams.append('limit', String(params.limit))

      const url = `/documents${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

      const { data } = await apiClient.get<DocumentListResponse>(url, {
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
   * Buscar documento por ID
   */
  getById: async (id: string): Promise<Document> => {
    try {
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

      const { data } = await apiClient.get<Document>(`/documents/${id}`, {
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
   * Obter estatísticas
   */
  getStats: async (): Promise<DocumentStats> => {
    try {
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

      const { data } = await apiClient.get<DocumentStats>('/documents/stats', {
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
   * Documentos expirados ou próximos de expirar
   */
  getExpired: async (): Promise<Document[]> => {
    try {
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

      const { data } = await apiClient.get<Document[]>('/documents/expired', {
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
   * Fazer upload de documento
   * 
   * @param uploadData - Dados do upload (arquivo + metadados)
   * @returns Documento criado
   */
  upload: async (uploadData: UploadDocumentRequest): Promise<Document> => {
    try {
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

      // Criar FormData para upload multipart
      const formData = new FormData()
      formData.append('file', uploadData.file)
      
      if (uploadData.name) formData.append('name', uploadData.name)
      if (uploadData.description) formData.append('description', uploadData.description)
      if (uploadData.folderId) formData.append('folderId', uploadData.folderId)
      if (uploadData.reference) formData.append('reference', uploadData.reference)
      if (uploadData.documentType) formData.append('documentType', uploadData.documentType)
      if (uploadData.tags) formData.append('tags', uploadData.tags)
      if (uploadData.expiresAt) formData.append('expiresAt', uploadData.expiresAt)
      if (uploadData.isPublic !== undefined) formData.append('isPublic', String(uploadData.isPublic))

      const { data } = await apiClient.post<Document>('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(companyId ? { 'x-company-id': companyId } : {}),
        },
      })

      return data
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Download de documento (retorna o blob do arquivo)
   */
  download: async (id: string): Promise<Blob> => {
    try {
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

      const { data } = await apiClient.get(`/documents/${id}/download`, {
        headers: companyId ? {
          'x-company-id': companyId,
        } : undefined,
        responseType: 'blob',
      })

      return data
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Obter URL de download (para abrir em nova aba)
   */
  getDownloadUrl: (id: string): string => {
    return `/documents/${id}/download`
  },

  /**
   * Helper para fazer download direto no navegador
   * Faz download do arquivo e salva automaticamente
   */
  downloadFile: async (id: string, fileName?: string): Promise<void> => {
    try {
      const blob = await documentsApi.download(id)
      
      // Se não foi passado um nome, buscar do documento
      if (!fileName) {
        const doc = await documentsApi.getById(id)
        fileName = doc.fileName || doc.name || 'documento'
      }
      
      // Criar URL temporária e fazer download
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      
      // Cleanup
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      console.error('Erro ao fazer download:', error)
      throw error
    }
  },

  /**
   * Atualizar documento
   */
  update: async (id: string, documentData: UpdateDocumentRequest): Promise<Document> => {
    try {
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

      const { data } = await apiClient.patch<Document>(`/documents/${id}`, documentData, {
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
   * Fazer upload de nova versão do documento
   * 
   * @param id - ID do documento original
   * @param file - Novo arquivo
   * @param description - Descrição da nova versão (opcional)
   * @returns Nova versão do documento
   */
  uploadVersion: async (id: string, file: File, description?: string): Promise<Document> => {
    try {
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

      // Criar FormData para upload multipart
      const formData = new FormData()
      formData.append('file', file)
      if (description) formData.append('description', description)

      const { data } = await apiClient.post<Document>(`/documents/${id}/version`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(companyId ? { 'x-company-id': companyId } : {}),
        },
      })

      return data
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Deletar documento
   * 
   * @param id - ID do documento
   * @param deleteAllVersions - Se true, deleta todas as versões (default: false)
   */
  delete: async (id: string, deleteAllVersions: boolean = false): Promise<void> => {
    try {
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

      const params = new URLSearchParams()
      if (deleteAllVersions) {
        params.append('deleteAllVersions', 'true')
      }

      const url = `/documents/${id}${params.toString() ? `?${params.toString()}` : ''}`

      await apiClient.delete(url, {
        headers: companyId ? {
          'x-company-id': companyId,
        } : undefined,
      })
    } catch (error: any) {
      throw error
    }
  },
}
