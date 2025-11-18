import { apiClient } from './client'
import { authApi } from './auth'

// ==========================================
// TYPES
// ==========================================

export type PersonType = 'FISICA' | 'JURIDICA'
export type Gender = 'MALE' | 'FEMALE' | 'OTHER'
export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'OTHER'
export type TaxRegime = 'SIMPLES_NACIONAL' | 'LUCRO_PRESUMIDO' | 'LUCRO_REAL' | 'MEI'
export type AddressType = 'BILLING' | 'SHIPPING' | 'MAIN' | 'OTHER'
export type ContactType = 'MAIN' | 'FINANCIAL' | 'COMMERCIAL' | 'OTHER'

export interface CustomerAddress {
  id: string
  type: AddressType
  label?: string
  zipCode: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  country?: string
  ibgeCode?: string // Código IBGE do município (7 dígitos) - Obrigatório para NFe
  reference?: string
  isDefault: boolean
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface CustomerContact {
  id: string
  type: ContactType
  name: string
  position?: string
  department?: string
  email?: string
  phone?: string
  mobile?: string
  notes?: string
  isPrimary: boolean
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id: string
  companyId: string
  personType: PersonType
  
  // Pessoa Física
  name?: string
  cpf?: string
  rg?: string
  rgIssuer?: string
  rgState?: string
  birthDate?: string
  gender?: Gender
  maritalStatus?: MaritalStatus
  motherName?: string
  profession?: string
  nationality?: string
  
  // Pessoa Jurídica
  companyName?: string
  tradeName?: string
  cnpj?: string
  stateRegistration?: string
  stateRegistrationExempt?: boolean
  municipalRegistration?: string
  cnae?: string
  taxRegime?: TaxRegime
  responsibleName?: string
  responsibleCpf?: string
  responsibleEmail?: string
  responsiblePhone?: string
  
  // Campos Comuns
  email?: string
  phone?: string
  mobile?: string
  website?: string
  creditLimit?: string
  active: boolean
  notes?: string
  
  // Relações
  addresses?: CustomerAddress[]
  contacts?: CustomerContact[]
  
  createdAt: string
  updatedAt: string
}

export interface CreateCustomerRequest {
  personType: PersonType
  
  // Pessoa Física
  name?: string
  cpf?: string
  rg?: string
  rgIssuer?: string
  rgState?: string
  birthDate?: string
  gender?: Gender
  maritalStatus?: MaritalStatus
  motherName?: string
  profession?: string
  nationality?: string
  
  // Pessoa Jurídica
  companyName?: string
  tradeName?: string
  cnpj?: string
  stateRegistration?: string
  stateRegistrationExempt?: boolean
  municipalRegistration?: string
  cnae?: string
  taxRegime?: TaxRegime
  responsibleName?: string
  responsibleCpf?: string
  responsibleEmail?: string
  responsiblePhone?: string
  
  // Campos Comuns
  email?: string
  phone?: string
  mobile?: string
  website?: string
  creditLimit?: number
  active?: boolean
  notes?: string
  
  // Relações (para criação)
  addresses?: Array<{
    type: AddressType
    label?: string
    zipCode: string
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    country?: string
    ibgeCode?: string // Código IBGE do município
    reference?: string
  }>
  contacts?: Array<{
    type: ContactType
    name: string
    position?: string
    department?: string
    email?: string
    phone?: string
    mobile?: string
    notes?: string
  }>
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {}

export interface ListCustomersParams {
  personType?: PersonType
  active?: boolean
  search?: string
  page?: number
  limit?: number
}

export interface ListCustomersResponse {
  data: Customer[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CustomerStats {
  total: number
  active: number
  inactive: number
  byType: {
    fisica: number
    juridica: number
  }
}

export interface CreateAddressRequest {
  type: AddressType
  label?: string
  zipCode: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  country?: string
  reference?: string
  isDefault?: boolean
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {}

export interface CreateContactRequest {
  type: ContactType
  name: string
  position?: string
  department?: string
  email?: string
  phone?: string
  mobile?: string
  notes?: string
  isPrimary?: boolean
}

export interface UpdateContactRequest extends Partial<CreateContactRequest> {}

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

export const customersApi = {
  /**
   * Lista todos os clientes
   */
  getAll: async (params?: ListCustomersParams): Promise<ListCustomersResponse> => {
    const companyId = getCompanyId()
    const response = await apiClient.get('/customers', {
      params,
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Obtém um cliente por ID
   */
  getById: async (id: string): Promise<Customer> => {
    const companyId = getCompanyId()
    const response = await apiClient.get(`/customers/${id}`, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Cria um novo cliente
   */
  create: async (data: CreateCustomerRequest): Promise<Customer> => {
    const companyId = getCompanyId()
    const response = await apiClient.post('/customers', data, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Atualiza um cliente
   */
  update: async (id: string, data: UpdateCustomerRequest): Promise<Customer> => {
    const companyId = getCompanyId()
    const response = await apiClient.patch(`/customers/${id}`, data, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Deleta um cliente (soft delete)
   */
  delete: async (id: string): Promise<{ message: string }> => {
    const companyId = getCompanyId()
    const response = await apiClient.delete(`/customers/${id}`, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Ativa ou desativa um cliente
   */
  toggleActive: async (id: string): Promise<Customer> => {
    const companyId = getCompanyId()
    const response = await apiClient.patch(`/customers/${id}/toggle-active`, {}, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Obtém estatísticas dos clientes
   */
  getStats: async (): Promise<CustomerStats> => {
    const companyId = getCompanyId()
    const response = await apiClient.get('/customers/stats', {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  // ==========================================
  // ENDEREÇOS
  // ==========================================

  /**
   * Adiciona um endereço ao cliente
   */
  addAddress: async (customerId: string, data: CreateAddressRequest): Promise<CustomerAddress> => {
    const companyId = getCompanyId()
    const response = await apiClient.post(`/customers/${customerId}/addresses`, data, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Atualiza um endereço do cliente
   */
  updateAddress: async (
    customerId: string,
    addressId: string,
    data: UpdateAddressRequest
  ): Promise<CustomerAddress> => {
    const companyId = getCompanyId()
    const response = await apiClient.patch(
      `/customers/${customerId}/addresses/${addressId}`,
      data,
      {
        headers: {
          'x-company-id': companyId,
        },
      }
    )
    return response.data
  },

  /**
   * Remove um endereço do cliente
   */
  deleteAddress: async (customerId: string, addressId: string): Promise<{ message: string }> => {
    const companyId = getCompanyId()
    const response = await apiClient.delete(`/customers/${customerId}/addresses/${addressId}`, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  // ==========================================
  // CONTATOS
  // ==========================================

  /**
   * Adiciona um contato ao cliente
   */
  addContact: async (customerId: string, data: CreateContactRequest): Promise<CustomerContact> => {
    const companyId = getCompanyId()
    const response = await apiClient.post(`/customers/${customerId}/contacts`, data, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Atualiza um contato do cliente
   */
  updateContact: async (
    customerId: string,
    contactId: string,
    data: UpdateContactRequest
  ): Promise<CustomerContact> => {
    const companyId = getCompanyId()
    const response = await apiClient.patch(
      `/customers/${customerId}/contacts/${contactId}`,
      data,
      {
        headers: {
          'x-company-id': companyId,
        },
      }
    )
    return response.data
  },

  /**
   * Remove um contato do cliente
   */
  deleteContact: async (customerId: string, contactId: string): Promise<{ message: string }> => {
    const companyId = getCompanyId()
    const response = await apiClient.delete(`/customers/${customerId}/contacts/${contactId}`, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },
}
