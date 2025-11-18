import { apiClient } from "./client"
import { authApi } from "./auth"

// ============================================
// Types & Interfaces
// ============================================

export type DocumentCategory = 
  | "CONTRATO"
  | "ESTATUTO"
  | "ATA"
  | "RELATORIO"
  | "COMPROVANTE"
  | "LICENCA"
  | "ALVARA"
  | "PROJETO_TECNICO"
  | "PLANILHA"
  | "OUTRO"

// Project Document Interface
export interface ProjectDocument {
  id: string
  name: string
  description?: string
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
  folderId: string
  tags: string[]
  reference: string
  documentType: DocumentCategory
  companyId: string
  uploadedById: string
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
  projectId?: string
  projectCode?: string
  projectName?: string
}

// Upload DTO
export interface UploadProjectDocumentDto {
  file: File
  projectId: string
  name: string
  description?: string
  category: DocumentCategory
  tags?: string
}

// List Response
export interface ProjectDocumentsListResponse {
  data: ProjectDocument[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Query Params
export interface ProjectDocumentsQueryParams {
  page?: number
  limit?: number
}

// ============================================
// API Functions
// ============================================

/**
 * Faz upload de um documento para um projeto SCP
 */
export async function uploadProjectDocument(
  data: UploadProjectDocumentDto
): Promise<ProjectDocument> {
  const selectedCompany = authApi.getSelectedCompany()
  if (!selectedCompany) {
    throw new Error("Nenhuma empresa selecionada")
  }

  const formData = new FormData()
  formData.append("file", data.file)
  formData.append("projectId", data.projectId)
  formData.append("name", data.name)
  if (data.description) {
    formData.append("description", data.description)
  }
  formData.append("category", data.category)
  if (data.tags) {
    formData.append("tags", data.tags)
  }

  const response = await apiClient.post(
    `/scp/projects/documents/upload`,
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
 * Lista todos os documentos de um projeto específico
 */
export async function getProjectDocuments(
  projectId: string,
  params?: ProjectDocumentsQueryParams
): Promise<ProjectDocumentsListResponse> {
  const selectedCompany = authApi.getSelectedCompany()
  if (!selectedCompany) {
    throw new Error("Nenhuma empresa selecionada")
  }

  const response = await apiClient.get(
    `/scp/projects/documents/project/${projectId}`,
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
export async function downloadProjectDocument(
  documentId: string
): Promise<Blob> {
  const selectedCompany = authApi.getSelectedCompany()
  if (!selectedCompany) {
    throw new Error("Nenhuma empresa selecionada")
  }

  const response = await apiClient.get(
    `/scp/projects/documents/${documentId}/download`,
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
 * Remove um documento do projeto
 */
export async function deleteProjectDocument(
  documentId: string
): Promise<{ message: string }> {
  const selectedCompany = authApi.getSelectedCompany()
  if (!selectedCompany) {
    throw new Error("Nenhuma empresa selecionada")
  }

  const response = await apiClient.delete(
    `/scp/projects/documents/${documentId}`,
    {
      headers: {
        "X-Company-ID": selectedCompany.id,
      },
    }
  )
  return response.data
}

// ============================================
// Helper Functions
// ============================================

/**
 * Retorna label em português da categoria
 */
export function getCategoryLabel(category: DocumentCategory): string {
  const labels: Record<DocumentCategory, string> = {
    CONTRATO: "Contrato",
    ESTATUTO: "Estatuto",
    ATA: "Ata",
    RELATORIO: "Relatório",
    COMPROVANTE: "Comprovante",
    LICENCA: "Licença",
    ALVARA: "Alvará",
    PROJETO_TECNICO: "Projeto Técnico",
    PLANILHA: "Planilha",
    OUTRO: "Outro",
  }
  return labels[category] || category
}

/**
 * Retorna ícone da categoria
 */
export function getCategoryIcon(category: DocumentCategory): string {
  const icons: Record<DocumentCategory, string> = {
    CONTRATO: "📄",
    ESTATUTO: "📋",
    ATA: "📝",
    RELATORIO: "📊",
    COMPROVANTE: "🧾",
    LICENCA: "🎫",
    ALVARA: "✅",
    PROJETO_TECNICO: "📐",
    PLANILHA: "📈",
    OUTRO: "📎",
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
export function getCategoryColor(category: DocumentCategory): string {
  const colors: Record<DocumentCategory, string> = {
    CONTRATO: "blue",
    ESTATUTO: "purple",
    ATA: "green",
    RELATORIO: "orange",
    COMPROVANTE: "yellow",
    LICENCA: "pink",
    ALVARA: "teal",
    PROJETO_TECNICO: "indigo",
    PLANILHA: "cyan",
    OUTRO: "gray",
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
export const projectDocumentsApi = {
  upload: uploadProjectDocument,
  getAll: getProjectDocuments,
  download: downloadProjectDocument,
  delete: deleteProjectDocument,
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
