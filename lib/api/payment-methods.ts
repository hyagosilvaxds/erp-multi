import { apiClient } from "./client"
import { authApi } from "./auth"

// ============================================
// Types & Interfaces
// ============================================

export type PaymentMethodType = 
  | "CASH"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "PIX"
  | "BANK_SLIP"
  | "BANK_TRANSFER"
  | "CHECK"
  | "OTHER"

export interface InstallmentTemplate {
  id: string
  paymentMethodId: string
  installmentNumber: number
  daysToPayment: number
  percentageOfTotal: number | null
  fixedAmount: number | null
  createdAt: string
  updatedAt: string
}

export interface PaymentMethod {
  id: string
  companyId: string
  name: string
  code: string
  type: PaymentMethodType
  active: boolean
  allowInstallments: boolean
  maxInstallments: number
  installmentFee: number
  requiresCreditAnalysis: boolean
  minCreditScore: number | null
  daysToReceive: number | null
  transactionFee: number
  createdAt: string
  updatedAt: string
  installmentTemplates: InstallmentTemplate[]
}

export interface CreatePaymentMethodDto {
  name: string
  code: string
  type: PaymentMethodType
  active?: boolean
  allowInstallments?: boolean
  maxInstallments?: number
  installmentFee?: number
  requiresCreditAnalysis?: boolean
  minCreditScore?: number
  daysToReceive?: number
  transactionFee?: number
  installmentTemplates?: Array<{
    installmentNumber: number
    daysToPayment: number
    percentageOfTotal?: number
    fixedAmount?: number
  }>
}

export interface UpdatePaymentMethodDto extends Partial<CreatePaymentMethodDto> {}

export interface PaymentMethodFilters {
  active?: boolean
  type?: PaymentMethodType
}

// ============================================
// API Functions
// ============================================

/**
 * Lista todos os métodos de pagamento da empresa
 */
export async function getPaymentMethods(
  filters?: PaymentMethodFilters
): Promise<PaymentMethod[]> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const params = new URLSearchParams()
    if (filters?.active !== undefined) {
      params.append("active", String(filters.active))
    }
    if (filters?.type) {
      params.append("type", filters.type)
    }

    const { data } = await apiClient.get<PaymentMethod[]>(
      `/sales/payment-methods${params.toString() ? `?${params.toString()}` : ""}`,
      {
        headers: {
          "x-company-id": selectedCompany.id,
        },
      }
    )

    return data
  } catch (error: any) {
    throw error
  }
}

/**
 * Busca método de pagamento por ID
 */
export async function getPaymentMethodById(id: string): Promise<PaymentMethod> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const { data } = await apiClient.get<PaymentMethod>(
      `/sales/payment-methods/${id}`,
      {
        headers: {
          "x-company-id": selectedCompany.id,
        },
      }
    )

    return data
  } catch (error: any) {
    throw error
  }
}

/**
 * Cria um novo método de pagamento
 */
export async function createPaymentMethod(
  dto: CreatePaymentMethodDto
): Promise<PaymentMethod> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const { data } = await apiClient.post<PaymentMethod>(
      "/sales/payment-methods",
      dto,
      {
        headers: {
          "x-company-id": selectedCompany.id,
        },
      }
    )

    return data
  } catch (error: any) {
    throw error
  }
}

/**
 * Atualiza um método de pagamento (PUT)
 * Nota: Templates de parcelas não podem ser atualizados por este endpoint
 */
export async function updatePaymentMethod(
  id: string,
  dto: UpdatePaymentMethodDto
): Promise<PaymentMethod> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const { data } = await apiClient.put<PaymentMethod>(
      `/sales/payment-methods/${id}`,
      dto,
      {
        headers: {
          "x-company-id": selectedCompany.id,
        },
      }
    )

    return data
  } catch (error: any) {
    throw error
  }
}

/**
 * Deleta um método de pagamento
 */
export async function deletePaymentMethod(id: string): Promise<void> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    await apiClient.delete(`/sales/payment-methods/${id}`, {
      headers: {
        "x-company-id": selectedCompany.id,
      },
    })
  } catch (error: any) {
    throw error
  }
}

/**
 * Ativa/Desativa um método de pagamento (toggle)
 */
export async function togglePaymentMethodActive(id: string): Promise<PaymentMethod> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const { data } = await apiClient.patch<PaymentMethod>(
      `/sales/payment-methods/${id}/toggle-active`,
      {},
      {
        headers: {
          "x-company-id": selectedCompany.id,
        },
      }
    )

    return data
  } catch (error: any) {
    throw error
  }
}

/**
 * Ativa/Desativa um método de pagamento (manual)
 */
export async function togglePaymentMethodStatus(
  id: string,
  active: boolean
): Promise<PaymentMethod> {
  return updatePaymentMethod(id, { active })
}

// ============================================
// Installment Templates
// ============================================

/**
 * Lista templates de parcelas de um método
 */
export async function getInstallmentTemplates(
  paymentMethodId: string
): Promise<InstallmentTemplate[]> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const { data } = await apiClient.get<InstallmentTemplate[]>(
      `/sales/payment-methods/${paymentMethodId}/installment-templates`,
      {
        headers: {
          "x-company-id": selectedCompany.id,
        },
      }
    )

    return data
  } catch (error: any) {
    throw error
  }
}

/**
 * Adiciona um template de parcela
 */
export async function addInstallmentTemplate(
  paymentMethodId: string,
  template: {
    installmentNumber: number
    daysToPayment: number
    percentageOfTotal?: number
    fixedAmount?: number
  }
): Promise<InstallmentTemplate> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const { data } = await apiClient.post<InstallmentTemplate>(
      `/sales/payment-methods/${paymentMethodId}/installment-templates`,
      template,
      {
        headers: {
          "x-company-id": selectedCompany.id,
        },
      }
    )

    return data
  } catch (error: any) {
    throw error
  }
}

/**
 * Atualiza um template de parcela
 */
export async function updateInstallmentTemplate(
  paymentMethodId: string,
  installmentNumber: number,
  template: {
    daysToPayment?: number
    percentageOfTotal?: number
    fixedAmount?: number
  }
): Promise<InstallmentTemplate> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const { data } = await apiClient.patch<InstallmentTemplate>(
      `/sales/payment-methods/${paymentMethodId}/installment-templates/${installmentNumber}`,
      template,
      {
        headers: {
          "x-company-id": selectedCompany.id,
        },
      }
    )

    return data
  } catch (error: any) {
    throw error
  }
}

/**
 * Substitui todos os templates de parcelas
 */
export async function replaceAllInstallmentTemplates(
  paymentMethodId: string,
  templates: Array<{
    installmentNumber: number
    daysToPayment: number
    percentageOfTotal?: number
    fixedAmount?: number
  }>
): Promise<InstallmentTemplate[]> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const { data } = await apiClient.put<InstallmentTemplate[]>(
      `/sales/payment-methods/${paymentMethodId}/installment-templates`,
      { templates },
      {
        headers: {
          "x-company-id": selectedCompany.id,
        },
      }
    )

    return data
  } catch (error: any) {
    throw error
  }
}

/**
 * Deleta um template de parcela
 */
export async function deleteInstallmentTemplate(
  paymentMethodId: string,
  installmentNumber: number
): Promise<void> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    await apiClient.delete(
      `/sales/payment-methods/${paymentMethodId}/installment-templates/${installmentNumber}`,
      {
        headers: {
          "x-company-id": selectedCompany.id,
        },
      }
    )
  } catch (error: any) {
    throw error
  }
}

// Exportar objeto API
export const paymentMethodsApi = {
  getAll: getPaymentMethods,
  getById: getPaymentMethodById,
  create: createPaymentMethod,
  update: updatePaymentMethod,
  delete: deletePaymentMethod,
  toggleActive: togglePaymentMethodActive,
  toggleStatus: togglePaymentMethodStatus,
  
  // Templates
  getTemplates: getInstallmentTemplates,
  addTemplate: addInstallmentTemplate,
  updateTemplate: updateInstallmentTemplate,
  replaceTemplates: replaceAllInstallmentTemplates,
  deleteTemplate: deleteInstallmentTemplate,
}

// Helper: Nomes amigáveis dos tipos
export const paymentMethodTypeLabels: Record<PaymentMethodType, string> = {
  CASH: "Dinheiro",
  CREDIT_CARD: "Cartão de Crédito",
  DEBIT_CARD: "Cartão de Débito",
  PIX: "PIX",
  BANK_SLIP: "Boleto Bancário",
  BANK_TRANSFER: "Transferência Bancária",
  CHECK: "Cheque",
  OTHER: "Outro",
}
