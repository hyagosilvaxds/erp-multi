import { apiClient } from './client'
import { authApi } from './auth'

// ==========================================
// TYPES
// ==========================================

export type DocumentType = 
  | 'RG'
  | 'CPF'
  | 'CNH'
  | 'CTPS'
  | 'TITULO_ELEITOR'
  | 'CERTIFICADO_RESERVISTA'
  | 'COMPROVANTE_RESIDENCIA'
  | 'DIPLOMA'
  | 'CERTIFICADO'
  | 'CONTRATO'
  | 'EXAME_ADMISSIONAL'
  | 'ASO'
  | 'ATESTADO'
  | 'CONTRATO_SOCIAL'
  | 'CNPJ'
  | 'ALVARA'
  | 'OUTROS'

export interface UploadedBy {
  id: string
  name: string
  email: string
}

export interface EmployeeDocumentEmployee {
  id: string
  name: string
}

export interface EmployeeDocument {
  id: string
  employeeId: string
  employee?: EmployeeDocumentEmployee
  documentType: DocumentType
  name: string
  description?: string
  documentNumber?: string
  issueDate?: string
  expiryDate?: string
  fileUrl: string
  fileName: string
  fileSize: number
  mimeType: string
  verified: boolean
  active: boolean
  notes?: string
  uploadedBy?: UploadedBy
  createdAt: string
  updatedAt: string
}

export interface UploadDocumentRequest {
  file: File
  documentType: DocumentType
  name?: string
  description?: string
  documentNumber?: string
  issueDate?: string
  expiryDate?: string
  verified?: boolean
  notes?: string
}

export interface UpdateDocumentRequest {
  name?: string
  description?: string
  documentNumber?: string
  issueDate?: string
  expiryDate?: string
  verified?: boolean
  active?: boolean
  notes?: string
}

export interface ListEmployeeDocumentsParams {
  documentType?: DocumentType
  verified?: boolean
  active?: boolean
}

export interface ListEmployeeDocumentsResponse {
  data: EmployeeDocument[]
  total: number
}

// ==========================================
// DOCUMENT TYPE LABELS
// ==========================================

export const documentTypeLabels: Record<DocumentType, string> = {
  RG: 'RG - Registro Geral',
  CPF: 'CPF - Cadastro de Pessoa Física',
  CNH: 'CNH - Carteira Nacional de Habilitação',
  CTPS: 'CTPS - Carteira de Trabalho',
  TITULO_ELEITOR: 'Título de Eleitor',
  CERTIFICADO_RESERVISTA: 'Certificado de Reservista',
  COMPROVANTE_RESIDENCIA: 'Comprovante de Residência',
  DIPLOMA: 'Diploma',
  CERTIFICADO: 'Certificado',
  CONTRATO: 'Contrato de Trabalho',
  EXAME_ADMISSIONAL: 'Exame Admissional',
  ASO: 'ASO - Atestado de Saúde Ocupacional',
  ATESTADO: 'Atestado Médico',
  CONTRATO_SOCIAL: 'Contrato Social (PJ)',
  CNPJ: 'Cartão CNPJ (PJ)',
  ALVARA: 'Alvará de Funcionamento (PJ)',
  OUTROS: 'Outros Documentos',
}

export const pjDocumentTypes: DocumentType[] = [
  'CONTRATO_SOCIAL',
  'CNPJ',
  'ALVARA',
]

// ==========================================
// API
// ==========================================

const getCompanyId = () => {
  const company = authApi.getSelectedCompany()
  if (!company?.id) {
    throw new Error('Nenhuma empresa selecionada')
  }
  return company.id
}

/**
 * Upload de documento do colaborador
 */
export const uploadDocument = async (
  employeeId: string,
  data: UploadDocumentRequest
): Promise<EmployeeDocument> => {
  const companyId = getCompanyId()

  const formData = new FormData()
  formData.append('file', data.file)
  formData.append('documentType', data.documentType)
  
  if (data.name) {
    formData.append('name', data.name)
  }
  if (data.description) {
    formData.append('description', data.description)
  }
  if (data.documentNumber) {
    formData.append('documentNumber', data.documentNumber)
  }
  if (data.issueDate) {
    formData.append('issueDate', data.issueDate)
  }
  if (data.expiryDate) {
    formData.append('expiryDate', data.expiryDate)
  }
  if (data.verified !== undefined) {
    formData.append('verified', String(data.verified))
  }
  if (data.notes) {
    formData.append('notes', data.notes)
  }

  const response = await apiClient.post(
    `/employees/${employeeId}/documents`,
    formData,
    {
      headers: {
        'x-company-id': companyId,
        'Content-Type': 'multipart/form-data',
      },
    }
  )

  return response.data
}

/**
 * Listar documentos do colaborador
 */
export const getDocuments = async (
  employeeId: string,
  params?: ListEmployeeDocumentsParams
): Promise<ListEmployeeDocumentsResponse> => {
  const companyId = getCompanyId()

  const response = await apiClient.get(`/employees/${employeeId}/documents`, {
    params,
    headers: {
      'x-company-id': companyId,
    },
  })

  // A API retorna um array diretamente
  const data = Array.isArray(response.data) ? response.data : response.data.data || []
  
  return {
    data,
    total: data.length
  }
}

/**
 * Buscar documento por ID
 */
export const getDocumentById = async (
  employeeId: string,
  documentId: string
): Promise<EmployeeDocument> => {
  const companyId = getCompanyId()

  const response = await apiClient.get(
    `/employees/${employeeId}/documents/${documentId}`,
    {
      headers: {
        'x-company-id': companyId,
      },
    }
  )

  return response.data
}

/**
 * Atualizar documento
 */
export const updateDocument = async (
  employeeId: string,
  documentId: string,
  data: UpdateDocumentRequest
): Promise<EmployeeDocument> => {
  const companyId = getCompanyId()

  const response = await apiClient.patch(
    `/employees/${employeeId}/documents/${documentId}`,
    data,
    {
      headers: {
        'x-company-id': companyId,
      },
    }
  )

  return response.data
}

/**
 * Marcar documento como verificado
 */
export const verifyDocument = async (
  employeeId: string,
  documentId: string
): Promise<EmployeeDocument> => {
  const companyId = getCompanyId()

  const response = await apiClient.patch(
    `/employees/${employeeId}/documents/${documentId}/verify`,
    {},
    {
      headers: {
        'x-company-id': companyId,
      },
    }
  )

  return response.data
}

/**
 * Deletar documento
 */
export const deleteDocument = async (
  employeeId: string,
  documentId: string
): Promise<void> => {
  const companyId = getCompanyId()

  await apiClient.delete(`/employees/${employeeId}/documents/${documentId}`, {
    headers: {
      'x-company-id': companyId,
    },
  })
}

/**
 * Obter URL de download do documento
 */
export const getDocumentDownloadUrl = (
  employeeId: string,
  documentId: string
): string => {
  const company = authApi.getSelectedCompany()
  const companyId = company?.id || ''
  const baseURL = apiClient.defaults.baseURL || ''
  return `${baseURL}/employees/${employeeId}/documents/${documentId}/download?companyId=${companyId}`
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Formata o tamanho do arquivo
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Verifica se o documento está próximo do vencimento (30 dias)
 */
export const isDocumentExpiringSoon = (expiryDate?: string): boolean => {
  if (!expiryDate) return false

  const expiry = new Date(expiryDate)
  const today = new Date()
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(today.getDate() + 30)

  return expiry <= thirtyDaysFromNow && expiry > today
}

/**
 * Verifica se o documento está vencido
 */
export const isDocumentExpired = (expiryDate?: string): boolean => {
  if (!expiryDate) return false

  const expiry = new Date(expiryDate)
  const today = new Date()

  return expiry < today
}

/**
 * Obtém o ícone de acordo com o tipo MIME
 */
export const getFileIcon = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return '🖼️'
  if (mimeType === 'application/pdf') return '📄'
  if (mimeType.includes('word')) return '📝'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊'
  return '📎'
}

/**
 * Valida tipo de arquivo
 */
export const isValidFileType = (file: File): boolean => {
  const validTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]

  return validTypes.includes(file.type)
}

/**
 * Valida tamanho do arquivo (máximo 10MB)
 */
export const isValidFileSize = (file: File, maxSizeMB: number = 10): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

// ==========================================
// EXPORTS
// ==========================================

export const employeeDocumentsApi = {
  upload: uploadDocument,
  getAll: getDocuments,
  getById: getDocumentById,
  update: updateDocument,
  verify: verifyDocument,
  delete: deleteDocument,
  getDownloadUrl: getDocumentDownloadUrl,
}
