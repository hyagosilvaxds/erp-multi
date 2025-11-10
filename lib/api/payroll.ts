import { apiClient } from './client'
import { authApi } from './auth'

// ==========================================
// TYPES
// ==========================================

export type PayrollStatus = 'DRAFT' | 'CALCULATED' | 'APPROVED' | 'PAID'
export type PayrollType = 'MONTHLY' | 'DAILY' | 'WEEKLY' | 'ADVANCE'

export interface PayrollEarningItem {
  typeId: string
  code: string
  name: string
  value: number
}

export interface PayrollDeductionItem {
  typeId: string
  code: string
  name: string
  value: number
}

export interface PayrollItem {
  id: string
  payrollId: string
  employeeId: string
  employee: {
    id: string
    name: string
    cpf: string
    admissionDate?: string
    position?: {
      id: string
      name: string
    }
  }
  workDays: number
  totalEarnings: string
  totalDeductions: string
  netAmount: string
  notes?: string
  earnings: Array<{
    name: string
    value: string
  }>
  deductions: Array<{
    name: string
    value: string
  }>
  createdAt?: string
  updatedAt?: string
}

export interface Payroll {
  id: string
  companyId: string
  referenceMonth: number
  referenceYear: number
  type: PayrollType
  startDate: string
  endDate: string
  paymentDate: string
  status: PayrollStatus
  totalEarnings: string
  totalDeductions: string
  netAmount: string
  notes?: string
  itemsCount?: number
  items?: PayrollItem[]
  company?: {
    id: string
    razaoSocial: string
    cnpj: string
  }
  createdBy?: {
    id: string
    name: string
  }
  createdById?: string
  approvedBy?: {
    id: string
    name: string
  }
  approvedById?: string | null
  approvedAt?: string | null
  createdAt: string
  updatedAt?: string
}

export interface CreatePayrollRequest {
  referenceMonth: number
  referenceYear: number
  type: PayrollType
  startDate: string
  endDate: string
  paymentDate: string
}

export interface UpdatePayrollRequest {
  paymentDate?: string
  notes?: string
}

export interface ListPayrollParams {
  status?: PayrollStatus
  type?: PayrollType
  referenceMonth?: number
  referenceYear?: number
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ListPayrollResponse {
  data: Payroll[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface CreatePayrollItemRequest {
  employeeId: string
  workDays?: number
  earnings?: Array<{
    name: string
    value: number
  }>
  deductions?: Array<{
    name: string
    value: number
  }>
  notes?: string
}

export interface CalculatePayrollResponse {
  id: string
  status: PayrollStatus
  totalEarnings: string
  totalDeductions: string
  netAmount: string
  itemsCount: number
  message: string
}

export interface ApprovePayrollResponse {
  id: string
  status: PayrollStatus
  approvedById: string
  approvedAt: string
  updatedAt: string
}

export interface PayPayrollResponse {
  id: string
  status: PayrollStatus
  updatedAt: string
}

export interface PayrollMonthStats {
  month: number
  monthName: string
  totalEarnings: string
  totalDeductions: string
  netAmount: string
  employeesCount: number
}

export interface PayrollStats {
  year: number
  totalPaid: string
  averageMonthly: string
  byMonth: PayrollMonthStats[]
  byStatus: {
    DRAFT: number
    CALCULATED: number
    APPROVED: number
    PAID: number
  }
}

export interface PayrollStatsResponse {
  totalPayrolls: number
  totalEmployees: number
  totalEarnings: string
  totalDeductions: string
  totalNetAmount: string
  averageNetAmount: string
  byStatus: {
    DRAFT: number
    CALCULATED: number
    APPROVED: number
    PAID: number
  }
  byType: {
    MONTHLY: number
    WEEKLY: number
    DAILY: number
    ADVANCE: number
  }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getCompanyId(): string {
  const company = authApi.getSelectedCompany()
  if (!company) {
    throw new Error('Nenhuma empresa selecionada')
  }
  return company.id
}

// ==========================================
// API FUNCTIONS
// ==========================================

/**
 * Lista todas as folhas de pagamento
 */
export const getAllPayrolls = async (params?: ListPayrollParams): Promise<ListPayrollResponse> => {
  const companyId = getCompanyId()

  const response = await apiClient.get<ListPayrollResponse>('/payroll', {
    params,
    headers: {
      'x-company-id': companyId,
    },
  })

  return response.data
}

/**
 * Busca uma folha de pagamento por ID
 */
export const getPayrollById = async (id: string): Promise<Payroll> => {
  const companyId = getCompanyId()

  const response = await apiClient.get<Payroll>(`/payroll/${id}`, {
    headers: {
      'x-company-id': companyId,
    },
  })

  return response.data
}

/**
 * Cria uma nova folha de pagamento
 */
export const createPayroll = async (data: CreatePayrollRequest): Promise<Payroll> => {
  const companyId = getCompanyId()

  const response = await apiClient.post<Payroll>('/payroll', data, {
    headers: {
      'x-company-id': companyId,
    },
  })

  return response.data
}

/**
 * Atualiza uma folha de pagamento
 */
export const updatePayroll = async (id: string, data: UpdatePayrollRequest): Promise<Payroll> => {
  const companyId = getCompanyId()

  const response = await apiClient.patch<Payroll>(`/payroll/${id}`, data, {
    headers: {
      'x-company-id': companyId,
    },
  })

  return response.data
}

/**
 * Deleta uma folha de pagamento
 */
export const deletePayroll = async (id: string): Promise<void> => {
  const companyId = getCompanyId()

  await apiClient.delete(`/payroll/${id}`, {
    headers: {
      'x-company-id': companyId,
    },
  })
}

/**
 * Calcula automaticamente a folha de pagamento
 */
export const calculatePayroll = async (id: string): Promise<CalculatePayrollResponse> => {
  const companyId = getCompanyId()

  const response = await apiClient.post<CalculatePayrollResponse>(
    `/payroll/${id}/calculate`,
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
 * Adiciona ou atualiza um item da folha manualmente
 */
export const createOrUpdatePayrollItem = async (
  payrollId: string,
  data: CreatePayrollItemRequest
): Promise<PayrollItem> => {
  const companyId = getCompanyId()

  const response = await apiClient.post<PayrollItem>(`/payroll/${payrollId}/items`, data, {
    headers: {
      'x-company-id': companyId,
    },
  })

  return response.data
}

/**
 * Remove um item da folha
 */
export const deletePayrollItem = async (payrollId: string, itemId: string): Promise<void> => {
  const companyId = getCompanyId()

  await apiClient.delete(`/payroll/${payrollId}/items/${itemId}`, {
    headers: {
      'x-company-id': companyId,
    },
  })
}

/**
 * Aprova uma folha de pagamento
 */
export const approvePayroll = async (id: string): Promise<ApprovePayrollResponse> => {
  const companyId = getCompanyId()

  const response = await apiClient.post<ApprovePayrollResponse>(
    `/payroll/${id}/approve`,
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
 * Marca uma folha como paga
 */
export const markPayrollAsPaid = async (id: string): Promise<PayPayrollResponse> => {
  const companyId = getCompanyId()

  const response = await apiClient.post<PayPayrollResponse>(
    `/payroll/${id}/pay`,
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
 * Busca estatísticas de folhas de pagamento
 */
export const getPayrollStats = async (
  referenceMonth?: number,
  referenceYear?: number
): Promise<PayrollStatsResponse> => {
  const companyId = getCompanyId()

  const response = await apiClient.get<PayrollStatsResponse>('/payroll/stats', {
    params: { referenceMonth, referenceYear },
    headers: {
      'x-company-id': companyId,
    },
  })

  return response.data
}

/**
 * Baixa folha consolidada em PDF
 * GET /payroll/:id/pdf
 */
export const downloadPayrollPDF = async (id: string): Promise<Blob> => {
  try {
    console.log('downloadPayrollPDF - iniciando download:', id)
    const companyId = getCompanyId()
    console.log('downloadPayrollPDF - companyId:', companyId)

    const response = await apiClient.get(`/payroll/${id}/pdf`, {
      responseType: 'blob',
      headers: {
        'x-company-id': companyId,
      },
    })

    console.log('downloadPayrollPDF - resposta recebida:', {
      status: response.status,
      contentType: response.headers['content-type'],
      dataType: typeof response.data,
      dataSize: response.data?.size || 0,
    })

    return response.data
  } catch (error: any) {
    console.error('downloadPayrollPDF - erro:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    })
    throw error
  }
}

/**
 * Baixa holerite individual em PDF
 * GET /payroll/:id/items/:itemId/payslip
 */
export const downloadPayslipPDF = async (
  payrollId: string,
  itemId: string
): Promise<Blob> => {
  try {
    console.log('downloadPayslipPDF - iniciando download:', { payrollId, itemId })
    const companyId = getCompanyId()
    console.log('downloadPayslipPDF - companyId:', companyId)

    const response = await apiClient.get(
      `/payroll/${payrollId}/items/${itemId}/payslip`,
      {
        responseType: 'blob',
        headers: {
          'x-company-id': companyId,
        },
      }
    )

    console.log('downloadPayslipPDF - resposta recebida:', {
      status: response.status,
      contentType: response.headers['content-type'],
      dataType: typeof response.data,
      dataSize: response.data?.size || 0,
    })

    return response.data
  } catch (error: any) {
    console.error('downloadPayslipPDF - erro:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    })
    throw error
  }
}

/**
 * Exporta folha de pagamento em Excel (legado - manter compatibilidade)
 */
export const exportPayrollExcel = async (id: string): Promise<Blob> => {
  const companyId = getCompanyId()

  const response = await apiClient.get(`/payroll/${id}/export/excel`, {
    responseType: 'blob',
    headers: {
      'x-company-id': companyId,
    },
  })

  return response.data
}

/**
 * Helper para baixar arquivo Blob
 */
export const downloadFile = (blob: Blob, filename: string) => {
  try {
    console.log('downloadFile chamado:', { blobSize: blob.size, filename })
    
    if (!blob || blob.size === 0) {
      throw new Error('Blob inválido ou vazio')
    }
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    console.log('Download iniciado com sucesso')
  } catch (error) {
    console.error('Erro ao fazer download do arquivo:', error)
    throw error
  }
}

// Exporta o objeto API com todas as funções
export const payrollApi = {
  getAll: getAllPayrolls,
  getById: getPayrollById,
  create: createPayroll,
  update: updatePayroll,
  delete: deletePayroll,
  calculate: calculatePayroll,
  createOrUpdateItem: createOrUpdatePayrollItem,
  deleteItem: deletePayrollItem,
  approve: approvePayroll,
  markAsPaid: markPayrollAsPaid,
  getStats: getPayrollStats,
  downloadPDF: downloadPayrollPDF,
  downloadPayslip: downloadPayslipPDF,
  exportExcel: exportPayrollExcel,
  downloadFile,
}
