import { apiClient } from "./client"
import { authApi } from "./auth"

// ============================================
// Types & Interfaces
// ============================================

export type InvestmentDocumentCategory = 
  | "Comprovantes"
  | "Contratos"
  | "Recibos"
  | "Termos"
  | "Documentos Bancários"
  | "Outros"

// Investment Document Interface
export interface InvestmentDocument {
  id: string
  companyId: string
  folderId: string
  name: string
  description?: string
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
  fileExtension: string
  reference: string
  documentType: InvestmentDocumentCategory
  tags: string[]
  isPublic: boolean
  version: number
  isLatest: boolean
  createdAt: string
  updatedAt: string
  folder?: {
    id: string
    name: string
  }
  uploadedBy?: {
    id: string
    name: string
    email: string
  }
  investmentId?: string
  projectCode?: string
  projectName?: string
  investorName?: string
  amount?: number
  investmentDate?: string
}

// Upload DTO
export interface UploadInvestmentDocumentDto {
  file: File
  investmentId: string
  name?: string
  description?: string
  category?: InvestmentDocumentCategory
  tags?: string
}

// List Response
export interface InvestmentDocumentsListResponse {
  data: InvestmentDocument[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Query Params
export interface InvestmentDocumentsQueryParams {
  page?: number
  limit?: number
}

// ============================================
// API Functions
// ============================================

/**
 * Faz upload de um documento para um aporte
 */
export async function uploadInvestmentDocument(
  data: UploadInvestmentDocumentDto
): Promise<InvestmentDocument> {
  const selectedCompany = authApi.getSelectedCompany()
  if (!selectedCompany) {
    throw new Error("Nenhuma empresa selecionada")
  }

  const formData = new FormData()
  formData.append("file", data.file)
  formData.append("investmentId", data.investmentId)
  
  if (data.name) {
    formData.append("name", data.name)
  }
  if (data.description) {
    formData.append("description", data.description)
  }
  if (data.category) {
    formData.append("category", data.category)
  }
  if (data.tags) {
    formData.append("tags", data.tags)
  }

  const response = await apiClient.post(
    `/scp/investments/documents/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        "X-Company-ID": selectedCompany.id,
      },
    }
  )
  return response.data
}

/**
 * Lista todos os documentos de um aporte específico
 */
export async function getInvestmentDocuments(
  investmentId: string,
  params?: InvestmentDocumentsQueryParams
): Promise<InvestmentDocumentsListResponse> {
  const selectedCompany = authApi.getSelectedCompany()
  if (!selectedCompany) {
    throw new Error("Nenhuma empresa selecionada")
  }

  const response = await apiClient.get(
    `/scp/investments/documents/${investmentId}`,
    {
      params,
      headers: {
        "X-Company-ID": selectedCompany.id,
      },
    }
  )
  return response.data
}

/**
 * Faz download de um documento específico
 */
export async function downloadInvestmentDocument(
  documentId: string
): Promise<Blob> {
  const selectedCompany = authApi.getSelectedCompany()
  if (!selectedCompany) {
    throw new Error("Nenhuma empresa selecionada")
  }

  const response = await apiClient.get(
    `/scp/investments/documents/${documentId}/download`,
    {
      responseType: "blob",
      headers: {
        "X-Company-ID": selectedCompany.id,
      },
    }
  )
  return response.data
}

/**
 * Remove um documento do aporte
 */
export async function deleteInvestmentDocument(
  documentId: string
): Promise<void> {
  const selectedCompany = authApi.getSelectedCompany()
  if (!selectedCompany) {
    throw new Error("Nenhuma empresa selecionada")
  }

  await apiClient.delete(
    `/scp/investments/documents/${documentId}`,
    {
      headers: {
        "X-Company-ID": selectedCompany.id,
      },
    }
  )
}

// ============================================
// Helper Functions
// ============================================

/**
 * Retorna label em português da categoria
 */
export function getCategoryLabel(category: InvestmentDocumentCategory): string {
  return category
}

/**
 * Retorna ícone da categoria
 */
export function getCategoryIcon(category: InvestmentDocumentCategory): string {
  const icons: Record<InvestmentDocumentCategory, string> = {
    "Comprovantes": "🧾",
    "Contratos": "📄",
    "Recibos": "🧾",
    "Termos": "📋",
    "Documentos Bancários": "🏦",
    "Outros": "📎",
  }
  return icons[category] || "📄"
}

/**
 * Formata tamanho do arquivo
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}

/**
 * Extrai extensão do arquivo
 */
export function getFileExtension(fileName: string): string {
  const parts = fileName.split(".")
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : ""
}

/**
 * Retorna cor da categoria
 */
export function getCategoryColor(category: InvestmentDocumentCategory): string {
  const colors: Record<InvestmentDocumentCategory, string> = {
    "Comprovantes": "blue",
    "Contratos": "purple",
    "Recibos": "green",
    "Termos": "orange",
    "Documentos Bancários": "cyan",
    "Outros": "gray",
  }
  return colors[category] || "gray"
}

/**
 * Trigger download no navegador
 */
export function triggerDownload(blob: Blob, fileName: string): void {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", fileName)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

/**
 * Valida tipo de arquivo (MIME type)
 */
export function isValidFileType(file: File): boolean {
  const validTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/jpeg",
    "image/png",
    "image/jpg",
  ]
  return validTypes.includes(file.type)
}

/**
 * Valida tamanho do arquivo (max 10MB)
 */
export function isValidFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

// Export de API object
export const investmentDocumentsApi = {
  upload: uploadInvestmentDocument,
  getAll: getInvestmentDocuments,
  download: downloadInvestmentDocument,
  delete: deleteInvestmentDocument,
  helpers: {
    getCategoryLabel,
    getCategoryIcon,
    formatFileSize,
    getFileExtension,
    getCategoryColor,
    triggerDownload,
    isValidFileType,
    isValidFileSize,
  },
}
