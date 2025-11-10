import { apiClient } from './client'
import { authApi } from './auth'

// ==========================================
// TYPES
// ==========================================

export interface EmployeesDashboardData {
  employees: {
    total: number
    active: number
    inactive: number
  }
  payroll: {
    monthlyTotal: string
    totalCost: string
    averageSalary: string
  }
  charges: {
    inss: string
    fgts: string
    thirteenthSalary: string
    vacation: string
    others: string
    total: string
    percentage: string
  }
  recentHires: Array<{
    id: string
    name: string
    position: string
    department: string
    admissionDate: string
    salary: string
    contractType: string
    daysInCompany: number
  }>
  byCostCenter: Array<{
    costCenterId: string
    code: string
    name: string
    employeesCount: number
    totalSalaries: string
    totalCost: string
    averageSalary: string
    percentageOfTotal: string
  }>
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
 * Busca dados consolidados do dashboard de RH
 */
export const getEmployeesDashboard = async (): Promise<EmployeesDashboardData> => {
  const companyId = getCompanyId()

  const response = await apiClient.get<EmployeesDashboardData>('/employees/dashboard', {
    headers: {
      'x-company-id': companyId,
    },
  })

  return response.data
}

// Exporta o objeto API
export const employeesDashboardApi = {
  getDashboard: getEmployeesDashboard,
}
