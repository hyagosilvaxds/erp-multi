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

// Códigos SEFAZ para formas de pagamento (NF-e)
export type SefazPaymentCode = 
  | "DINHEIRO"                            // 01
  | "CHEQUE"                              // 02
  | "CARTAO_CREDITO"                      // 03
  | "CARTAO_DEBITO"                       // 04
  | "CREDITO_LOJA"                        // 05
  | "VALE_ALIMENTACAO"                    // 10
  | "VALE_REFEICAO"                       // 11
  | "VALE_PRESENTE"                       // 12
  | "VALE_COMBUSTIVEL"                    // 13
  | "DUPLICATA_MERCANTIL"                 // 14
  | "BOLETO_BANCARIO"                     // 15
  | "DEPOSITO_BANCARIO"                   // 16
  | "PIX_DINAMICO"                        // 17
  | "TRANSFERENCIA"                       // 18
  | "PROGRAMA_FIDELIDADE"                 // 19
  | "PIX_ESTATICO"                        // 20
  | "CREDITO_EM_LOJA"                     // 21
  | "PAGAMENTO_ELETRONICO_NAO_INFORMADO"  // 22
  | "SEM_PAGAMENTO"                       // 90
  | "OUTROS"                              // 99

export interface PaymentMethod {
  id: string
  companyId: string
  name: string
  code: string
  sefazCode: SefazPaymentCode // ⚠️ OBRIGATÓRIO para emissão de NF-e
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
  sefazCode: SefazPaymentCode // ⚠️ OBRIGATÓRIO
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

// Helper: Nomes amigáveis dos tipos (mantido para compatibilidade com código existente)
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

// Helper: Descrições dos códigos SEFAZ
export const sefazPaymentCodeLabels: Record<SefazPaymentCode, { code: string; description: string }> = {
  DINHEIRO: { code: "01", description: "Dinheiro" },
  CHEQUE: { code: "02", description: "Cheque" },
  CARTAO_CREDITO: { code: "03", description: "Cartão de Crédito" },
  CARTAO_DEBITO: { code: "04", description: "Cartão de Débito" },
  CREDITO_LOJA: { code: "05", description: "Crédito Loja" },
  VALE_ALIMENTACAO: { code: "10", description: "Vale Alimentação" },
  VALE_REFEICAO: { code: "11", description: "Vale Refeição" },
  VALE_PRESENTE: { code: "12", description: "Vale Presente" },
  VALE_COMBUSTIVEL: { code: "13", description: "Vale Combustível" },
  DUPLICATA_MERCANTIL: { code: "14", description: "Duplicata Mercantil" },
  BOLETO_BANCARIO: { code: "15", description: "Boleto Bancário" },
  DEPOSITO_BANCARIO: { code: "16", description: "Depósito Bancário" },
  PIX_DINAMICO: { code: "17", description: "PIX Dinâmico (QR Code gerado na hora)" },
  TRANSFERENCIA: { code: "18", description: "Transferência / Carteira Digital" },
  PROGRAMA_FIDELIDADE: { code: "19", description: "Programa de Fidelidade / Cashback" },
  PIX_ESTATICO: { code: "20", description: "PIX Estático (QR Code fixo / Chave PIX)" },
  CREDITO_EM_LOJA: { code: "21", description: "Crédito em Loja (Private Label)" },
  PAGAMENTO_ELETRONICO_NAO_INFORMADO: { code: "22", description: "Pagamento Eletrônico não Informado" },
  SEM_PAGAMENTO: { code: "90", description: "Sem pagamento (Bonificação / Amostra)" },
  OUTROS: { code: "99", description: "Outros" },
}
