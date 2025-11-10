import { apiClient } from "./client"

// ============================================
// Types & Interfaces
// ============================================

export type InvestmentStatus = "PENDENTE" | "CONFIRMADO" | "CANCELADO"
export type DistributionStatus = "PENDENTE" | "PAGO" | "CANCELADO"
export type ProjectStatus = "PLANEJAMENTO" | "EM_CAPTACAO" | "ATIVO" | "CONCLUIDO" | "CANCELADO" | "SUSPENSO"
export type InvestorStatus = "ATIVO" | "INATIVO" | "SUSPENSO" | "BLOQUEADO"
export type InvestorType = "PESSOA_FISICA" | "PESSOA_JURIDICA"

// Filtros de Relatórios
export interface InvestmentReportFilters {
  projectId?: string
  investorId?: string
  startDate?: string
  endDate?: string
  status?: InvestmentStatus
}

export interface DistributionReportFilters {
  projectId?: string
  investorId?: string
  startDate?: string
  endDate?: string
  status?: DistributionStatus
}

export interface ROIReportFilters {
  projectId?: string
  investorId?: string
  startDate?: string
  endDate?: string
}

export interface InvestorReportFilters {
  type?: InvestorType
  status?: InvestorStatus
  category?: string
}

export interface ProjectReportFilters {
  status?: ProjectStatus
  startDate?: string
  endDate?: string
}

// ============================================
// API Functions
// ============================================

class ReportsApi {
  /**
   * Exportar relatório de aportes
   */
  async exportInvestments(
    companyId: string,
    filters?: InvestmentReportFilters
  ): Promise<Blob> {
    const params = new URLSearchParams()
    
    if (filters?.projectId) params.append("projectId", filters.projectId)
    if (filters?.investorId) params.append("investorId", filters.investorId)
    if (filters?.startDate) params.append("startDate", filters.startDate)
    if (filters?.endDate) params.append("endDate", filters.endDate)
    if (filters?.status) params.append("status", filters.status)

    const response = await apiClient.get(
      `/scp/reports/investments/export?${params.toString()}`,
      {
        headers: { "x-company-id": companyId },
        responseType: "blob",
      }
    )

    return response.data
  }

  /**
   * Exportar relatório de aportes por investidor
   */
  async exportInvestmentsByInvestor(
    companyId: string,
    filters?: InvestmentReportFilters
  ): Promise<Blob> {
    const params = new URLSearchParams()
    
    if (filters?.projectId) params.append("projectId", filters.projectId)
    if (filters?.investorId) params.append("investorId", filters.investorId)
    if (filters?.startDate) params.append("startDate", filters.startDate)
    if (filters?.endDate) params.append("endDate", filters.endDate)
    if (filters?.status) params.append("status", filters.status)

    const response = await apiClient.get(
      `/scp/reports/investments/by-investor/export?${params.toString()}`,
      {
        headers: { "x-company-id": companyId },
        responseType: "blob",
      }
    )

    return response.data
  }

  /**
   * Exportar relatório de aportes por projeto
   */
  async exportInvestmentsByProject(
    companyId: string,
    filters?: InvestmentReportFilters
  ): Promise<Blob> {
    const params = new URLSearchParams()
    
    if (filters?.projectId) params.append("projectId", filters.projectId)
    if (filters?.investorId) params.append("investorId", filters.investorId)
    if (filters?.startDate) params.append("startDate", filters.startDate)
    if (filters?.endDate) params.append("endDate", filters.endDate)
    if (filters?.status) params.append("status", filters.status)

    const response = await apiClient.get(
      `/scp/reports/investments/by-project/export?${params.toString()}`,
      {
        headers: { "x-company-id": companyId },
        responseType: "blob",
      }
    )

    return response.data
  }

  /**
   * Exportar relatório de distribuições
   */
  async exportDistributions(
    companyId: string,
    filters?: DistributionReportFilters
  ): Promise<Blob> {
    const params = new URLSearchParams()
    
    if (filters?.projectId) params.append("projectId", filters.projectId)
    if (filters?.investorId) params.append("investorId", filters.investorId)
    if (filters?.startDate) params.append("startDate", filters.startDate)
    if (filters?.endDate) params.append("endDate", filters.endDate)
    if (filters?.status) params.append("status", filters.status)

    const response = await apiClient.get(
      `/scp/reports/distributions/export?${params.toString()}`,
      {
        headers: { "x-company-id": companyId },
        responseType: "blob",
      }
    )

    return response.data
  }

  /**
   * Exportar relatório de ROI
   */
  async exportROI(
    companyId: string,
    filters?: ROIReportFilters
  ): Promise<Blob> {
    const params = new URLSearchParams()
    
    if (filters?.projectId) params.append("projectId", filters.projectId)
    if (filters?.investorId) params.append("investorId", filters.investorId)
    if (filters?.startDate) params.append("startDate", filters.startDate)
    if (filters?.endDate) params.append("endDate", filters.endDate)

    const response = await apiClient.get(
      `/scp/reports/roi/export?${params.toString()}`,
      {
        headers: { "x-company-id": companyId },
        responseType: "blob",
      }
    )

    return response.data
  }

  /**
   * Exportar resumo de investidores
   */
  async exportInvestorsSummary(
    companyId: string,
    filters?: InvestorReportFilters
  ): Promise<Blob> {
    const params = new URLSearchParams()
    
    if (filters?.type) params.append("type", filters.type)
    if (filters?.status) params.append("status", filters.status)
    if (filters?.category) params.append("category", filters.category)

    const response = await apiClient.get(
      `/scp/reports/investors/export?${params.toString()}`,
      {
        headers: { "x-company-id": companyId },
        responseType: "blob",
      }
    )

    return response.data
  }

  /**
   * Exportar resumo de projetos
   */
  async exportProjectsSummary(
    companyId: string,
    filters?: ProjectReportFilters
  ): Promise<Blob> {
    const params = new URLSearchParams()
    
    if (filters?.status) params.append("status", filters.status)
    if (filters?.startDate) params.append("startDate", filters.startDate)
    if (filters?.endDate) params.append("endDate", filters.endDate)

    const response = await apiClient.get(
      `/scp/reports/projects/export?${params.toString()}`,
      {
        headers: { "x-company-id": companyId },
        responseType: "blob",
      }
    )

    return response.data
  }

  /**
   * Helper para fazer download do blob
   */
  downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  /**
   * Gerar nome de arquivo com data
   */
  generateFilename(reportType: string): string {
    const date = new Date().toISOString().split("T")[0]
    return `${reportType}_${date}.xlsx`
  }
}

export const reportsApi = new ReportsApi()
