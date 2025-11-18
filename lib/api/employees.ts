import { apiClient } from './client'
import { authApi } from './auth'

// ==========================================
// TYPES
// ==========================================

export type Gender = 'MALE' | 'FEMALE' | 'OTHER'
export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'OTHER'
export type ContractType = 'CLT' | 'PJ' | 'ESTAGIO' | 'TEMPORARIO' | 'AUTONOMO'
export type AccountType = 'CORRENTE' | 'POUPANCA'

export interface DaySchedule {
  isWorkDay: boolean
  startTime?: string
  endTime?: string
  breakStartTime?: string
  breakEndTime?: string
}

export interface WorkSchedule {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
  weeklyHours: number
  generalNotes?: string
}

export interface CostCenter {
  id: string
  code?: string
  codigo?: string  // API retorna em português
  name?: string
  nome?: string    // API retorna em português
}

export interface Position {
  id: string
  code: string
  name: string
}

export interface Department {
  id: string
  code: string
  name: string
}

export interface Employee {
  id: string
  companyId: string
  costCenterId: string
  costCenter?: CostCenter
  positionId?: string
  position?: Position
  departmentId?: string
  department?: Department
  
  // Dados Pessoais
  name: string
  cpf: string
  rg?: string
  birthDate?: string
  gender?: Gender
  maritalStatus?: MaritalStatus
  email?: string
  phone?: string
  mobile?: string
  
  // Endereço
  zipCode?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  
  // Dados Profissionais
  admissionDate: string
  dismissalDate?: string
  contractType: ContractType
  workSchedule?: WorkSchedule
  salary: string
  
  // Dados Bancários
  bankCode?: string
  bankName?: string
  agency?: string
  account?: string
  accountType?: AccountType
  pixKey?: string
  
  // Dados da Empresa (PJ)
  companyDocument?: string
  companyName?: string
  companyTradeName?: string
  companyStateRegistration?: string
  companyMunicipalRegistration?: string
  companyEmail?: string
  companyPhone?: string
  companyZipCode?: string
  companyStreet?: string
  companyNumber?: string
  companyComplement?: string
  companyNeighborhood?: string
  companyCity?: string
  companyState?: string
  
  // Outros
  notes?: string
  active: boolean
  
  createdAt: string
  updatedAt: string
}

export interface CreateEmployeeRequest {
  costCenterId: string
  positionId: string
  departmentId: string
  
  // Dados Pessoais
  name: string
  cpf: string
  rg?: string
  birthDate?: string
  gender?: Gender
  maritalStatus?: MaritalStatus
  email?: string
  phone?: string
  mobile?: string
  
  // Endereço
  zipCode?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  
  // Dados Profissionais
  admissionDate: string
  contractType: ContractType
  workSchedule?: WorkSchedule
  salary: number
  
  // Dados Bancários
  bankCode?: string
  bankName?: string
  agency?: string
  account?: string
  accountType?: AccountType
  pixKey?: string
  
  // Dados da Empresa (PJ)
  companyDocument?: string
  companyName?: string
  companyTradeName?: string
  companyStateRegistration?: string
  companyMunicipalRegistration?: string
  companyEmail?: string
  companyPhone?: string
  companyZipCode?: string
  companyStreet?: string
  companyNumber?: string
  companyComplement?: string
  companyNeighborhood?: string
  companyCity?: string
  companyState?: string
  
  notes?: string
}

export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {}

export interface DismissEmployeeRequest {
  dismissalDate: string
  notes?: string
}

export interface ListEmployeesParams {
  active?: boolean
  costCenterId?: string
  departmentId?: string
  positionId?: string
  contractType?: ContractType
  search?: string
  page?: number
  limit?: number
}

export interface ListEmployeesResponse {
  data: Employee[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface EmployeeStats {
  total: number
  active: number
  inactive: number
  byContractType: {
    CLT: number
    PJ: number
    ESTAGIO: number
    TEMPORARIO: number
    AUTONOMO: number
  }
  byDepartment: Record<string, number>
  totalPayroll: string
  averageSalary: string
}

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

export const employeesApi = {
  /**
   * Lista todos os colaboradores
   */
  getAll: async (params?: ListEmployeesParams): Promise<ListEmployeesResponse> => {
    const companyId = getCompanyId()
    const response = await apiClient.get('/employees', {
      params,
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Obtém um colaborador por ID
   */
  getById: async (id: string): Promise<Employee> => {
    const companyId = getCompanyId()
    const response = await apiClient.get(`/employees/${id}`, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Cria um novo colaborador
   */
  create: async (data: CreateEmployeeRequest): Promise<Employee> => {
    const companyId = getCompanyId()
    const response = await apiClient.post('/employees', data, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Atualiza um colaborador
   */
  update: async (id: string, data: UpdateEmployeeRequest): Promise<Employee> => {
    const companyId = getCompanyId()
    const response = await apiClient.patch(`/employees/${id}`, data, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Deleta um colaborador (soft delete)
   */
  delete: async (id: string): Promise<{ message: string }> => {
    const companyId = getCompanyId()
    const response = await apiClient.delete(`/employees/${id}`, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Ativa ou desativa um colaborador
   */
  toggleActive: async (id: string): Promise<Employee> => {
    const companyId = getCompanyId()
    const response = await apiClient.patch(`/employees/${id}/toggle-active`, {}, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Demite um colaborador
   */
  dismiss: async (id: string, data: DismissEmployeeRequest): Promise<Employee> => {
    const companyId = getCompanyId()
    const response = await apiClient.patch(`/employees/${id}/dismiss`, data, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Obtém estatísticas dos colaboradores
   */
  getStats: async (): Promise<EmployeeStats> => {
    const companyId = getCompanyId()
    const response = await apiClient.get('/employees/stats', {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },
}
