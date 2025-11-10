import { apiClient } from './client'
import { authApi } from './auth'

export type LegalDocumentType =
  | 'CONTRATO'
  | 'PROCESSO_TRABALHISTA'
  | 'PROCESSO_CIVIL'
  | 'PROCESSO_CRIMINAL'
  | 'OUTROS'

export type LegalDocumentStatus =
  | 'ATIVO'
  | 'PENDENTE'
  | 'EM_ANALISE'
  | 'APROVADO'
  | 'REJEITADO'
  | 'CONCLUIDO'
  | 'ARQUIVADO'
  | 'CANCELADO'

export interface LegalDocumentParty {
  name: string
  role: string
  document?: string
  email?: string
  phone?: string
}

export interface LegalDocument {
  id: string
  companyId: string
  categoryId: string | null
  documentId: string
  type: LegalDocumentType
  title: string
  description?: string
  reference?: string
  parties?: LegalDocumentParty[]
  startDate?: string
  endDate?: string
  dueDate?: string
  status: LegalDocumentStatus
  value?: string
  currency: string
  notes?: string
  tags?: string[]
  alertDays: number
  active: boolean
  createdAt: string
  updatedAt: string
  document?: {
    id: string
    name: string
    fileName: string
    filePath: string
    fileSize: number
    mimeType: string
    fileExtension: string
  }
  category?: {
    id: string
    name: string
    color?: string
    icon?: string
  }
  createdBy?: {
    id: string
    name: string
    email: string
  }
}

export interface CreateLegalDocumentDto {
  file: File
  type: LegalDocumentType
  title: string
  categoryId?: string
  description?: string
  reference?: string
  parties?: LegalDocumentParty[]
  startDate?: string
  endDate?: string
  dueDate?: string
  status?: LegalDocumentStatus
  value?: number
  currency?: string
  notes?: string
  tags?: string[]
  alertDays?: number
  documentName?: string
  documentDescription?: string
}

export interface UpdateLegalDocumentDto {
  title?: string
  categoryId?: string
  description?: string
  reference?: string
  parties?: LegalDocumentParty[]
  startDate?: string
  endDate?: string
  dueDate?: string
  status?: LegalDocumentStatus
  value?: number
  currency?: string
  notes?: string
  tags?: string[]
  alertDays?: number
}

export interface ListLegalDocumentsParams {
  categoryId?: string
  type?: LegalDocumentType
  status?: LegalDocumentStatus
  search?: string
  reference?: string
  startDateFrom?: string
  startDateTo?: string
  dueDateFrom?: string
  dueDateTo?: string
  tags?: string[]
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface LegalDocumentsResponse {
  documents: LegalDocument[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface LegalDocumentStatistics {
  total: number
  byType: Array<{ type: LegalDocumentType; _count: number }>
  byStatus: Array<{ status: LegalDocumentStatus; _count: number }>
  expiringSoon: Array<{
    id: string
    title: string
    reference?: string
    dueDate: string
    type: LegalDocumentType
  }>
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
 * Cria um novo documento jurídico com upload
 */
export async function createLegalDocument(data: CreateLegalDocumentDto): Promise<LegalDocument> {
  try {
    const companyId = getCompanyId()
    const formData = new FormData()
    formData.append('file', data.file)
    formData.append('type', data.type)
    formData.append('title', data.title)

    if (data.categoryId) formData.append('categoryId', data.categoryId)
    if (data.description) formData.append('description', data.description)
    if (data.reference) formData.append('reference', data.reference)
    if (data.parties) formData.append('parties', JSON.stringify(data.parties))
    if (data.startDate) formData.append('startDate', data.startDate)
    if (data.endDate) formData.append('endDate', data.endDate)
    if (data.dueDate) formData.append('dueDate', data.dueDate)
    if (data.status) formData.append('status', data.status)
    if (data.value !== undefined) formData.append('value', data.value.toString())
    if (data.currency) formData.append('currency', data.currency)
    if (data.notes) formData.append('notes', data.notes)
    if (data.tags) formData.append('tags', data.tags.join(','))
    if (data.alertDays !== undefined) formData.append('alertDays', data.alertDays.toString())
    if (data.documentName) formData.append('documentName', data.documentName)
    if (data.documentDescription) formData.append('documentDescription', data.documentDescription)

    const response = await apiClient.post<LegalDocument>('/legal/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'x-company-id': companyId,
      },
    })
    return response.data
  } catch (error) {
    console.error('Erro ao criar documento jurídico:', error)
    throw error
  }
}

/**
 * Lista documentos jurídicos com filtros e paginação
 */
export async function listLegalDocuments(
  params?: ListLegalDocumentsParams
): Promise<LegalDocumentsResponse> {
  try {
    const companyId = getCompanyId()
    const response = await apiClient.get<LegalDocumentsResponse>('/legal/documents', {
      params,
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  } catch (error) {
    console.error('Erro ao listar documentos jurídicos:', error)
    throw error
  }
}

/**
 * Busca um documento jurídico por ID
 */
export async function getLegalDocumentById(id: string): Promise<LegalDocument> {
  try {
    const companyId = getCompanyId()
    const response = await apiClient.get<LegalDocument>(`/legal/documents/${id}`, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  } catch (error) {
    console.error('Erro ao buscar documento jurídico:', error)
    throw error
  }
}

/**
 * Atualiza um documento jurídico
 */
export async function updateLegalDocument(
  id: string,
  data: UpdateLegalDocumentDto
): Promise<LegalDocument> {
  try {
    const companyId = getCompanyId()
    const response = await apiClient.patch<LegalDocument>(`/legal/documents/${id}`, data, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  } catch (error) {
    console.error('Erro ao atualizar documento jurídico:', error)
    throw error
  }
}

/**
 * Exclui um documento jurídico (soft delete)
 */
export async function deleteLegalDocument(id: string): Promise<void> {
  try {
    const companyId = getCompanyId()
    await apiClient.delete(`/legal/documents/${id}`, {
      headers: {
        'x-company-id': companyId,
      },
    })
  } catch (error) {
    console.error('Erro ao excluir documento jurídico:', error)
    throw error
  }
}

/**
 * Obtém informações para download do documento
 */
export async function getLegalDocumentDownload(id: string): Promise<{
  id: string
  name: string
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
}> {
  try {
    const companyId = getCompanyId()
    const response = await apiClient.get(`/legal/documents/${id}/download`, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  } catch (error) {
    console.error('Erro ao obter informações de download:', error)
    throw error
  }
}

/**
 * Obtém estatísticas dos documentos jurídicos
 */
export async function getLegalDocumentStatistics(): Promise<LegalDocumentStatistics> {
  try {
    const companyId = getCompanyId()
    const response = await apiClient.get<LegalDocumentStatistics>('/legal/documents/statistics', {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error)
    throw error
  }
}

/**
 * Helper para fazer download do arquivo através do hub de documentos
 */
export async function downloadLegalDocument(documentId: string): Promise<Blob> {
  try {
    const companyId = getCompanyId()
    const response = await apiClient.get(`/documents/${documentId}/download`, {
      responseType: 'blob',
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  } catch (error) {
    console.error('Erro ao baixar documento:', error)
    throw error
  }
}

/**
 * Helper para labels de tipos de documento
 */
export const LEGAL_DOCUMENT_TYPE_LABELS: Record<LegalDocumentType, string> = {
  CONTRATO: 'Contrato',
  PROCESSO_TRABALHISTA: 'Processo Trabalhista',
  PROCESSO_CIVIL: 'Processo Civil',
  PROCESSO_CRIMINAL: 'Processo Criminal',
  OUTROS: 'Outros',
}

/**
 * Helper para labels de status
 */
export const LEGAL_DOCUMENT_STATUS_LABELS: Record<LegalDocumentStatus, string> = {
  ATIVO: 'Ativo',
  PENDENTE: 'Pendente',
  EM_ANALISE: 'Em Análise',
  APROVADO: 'Aprovado',
  REJEITADO: 'Rejeitado',
  CONCLUIDO: 'Concluído',
  ARQUIVADO: 'Arquivado',
  CANCELADO: 'Cancelado',
}
