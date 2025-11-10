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
    position: string
  }
  baseSalary: string
  workDays: number
  earnings: PayrollEarningItem[]
  totalEarnings: string
  deductions: PayrollDeductionItem[]
  totalDeductions: string
  netAmount: string
  notes?: string
  createdAt: string
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
  itemsCount?: number
  items?: PayrollItem[]
  createdBy?: {
    id: string
    name: string
  }
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

export interface UpdatePayrollRequest extends Partial<CreatePayrollRequest> {
  status?: PayrollStatus
}

export interface ListPayrollParams {
  status?: PayrollStatus
  type?: PayrollType
  referenceMonth?: number
  referenceYear?: number
  page?: number
  limit?: number
}

export interface ListPayrollResponse {
  data: Payroll[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CreatePayrollItemRequest {
  employeeId: string
  baseSalary: number
  workDays: number
  earnings: Array<{
    typeId: string
    code: string
    name: string
    value: number
  }>
  deductions: Array<{
    typeId: string
    code: string
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
  approvedBy: {
    id: string
    name: string
  }
  approvedAt: string
  message: string
}

export interface PayPayrollResponse {
  id: string
  status: PayrollStatus
  message: string
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
export const getPayrollStats = async (year?: number): Promise<PayrollStats> => {
  const companyId = getCompanyId()

  const response = await apiClient.get<PayrollStats>('/payroll/stats', {
    params: { year },
    headers: {
      'x-company-id': companyId,
    },
  })

  return response.data
}

/**
 * Exporta folha de pagamento em PDF
 */
export const exportPayrollPDF = async (id: string): Promise<Blob> => {
  const companyId = getCompanyId()

  const response = await apiClient.get(`/payroll/${id}/export/pdf`, {
    responseType: 'blob',
    headers: {
      'x-company-id': companyId,
    },
  })

  return response.data
}

/**
 * Exporta folha de pagamento em Excel
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
 * Gera holerite individual em PDF
 */
export const generatePayslipPDF = async (
  payrollId: string,
  employeeId: string
): Promise<Blob> => {
  const companyId = getCompanyId()

  const response = await apiClient.get(
    `/payroll/${payrollId}/employees/${employeeId}/payslip`,
    {
      responseType: 'blob',
      headers: {
        'x-company-id': companyId,
      },
    }
  )

  return response.data
}

/**
 * Helper para baixar arquivo Blob
 */
export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
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
  exportPDF: exportPayrollPDF,
  exportExcel: exportPayrollExcel,
  generatePayslip: generatePayslipPDF,
  downloadFile,
}
