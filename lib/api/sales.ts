import { apiClient } from "./client"
import { authApi } from "./auth"

// ============================================
// Types & Interfaces
// ============================================

export type SaleStatus = "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "COMPLETED" | "CANCELED"
export type CreditAnalysisStatus = "PENDING" | "APPROVED" | "REJECTED"

export interface SaleItem {
  id: string
  saleId: string
  productId: string
  quantity: number
  unitPrice: number
  subtotal: number
  discount: number
  totalPrice: number
  createdAt: string
  updatedAt: string
  product?: {
    id: string
    name: string
    sku: string
    price?: number
    stockQuantity?: number
  }
}

export interface Sale {
  id: string
  companyId: string
  customerId: string
  paymentMethodId: string
  saleNumber: string
  status: SaleStatus
  saleDate: string
  deliveryDate: string | null
  subtotal: number
  discount: number
  shipping: number
  totalAmount: number
  installments: number
  notes: string | null
  creditAnalysisStatus: CreditAnalysisStatus | null
  creditAnalysisNotes: string | null
  approvedAt: string | null
  approvedBy: string | null
  canceledAt: string | null
  canceledBy: string | null
  cancelReason: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
  items: SaleItem[]
  customer?: {
    id: string
    name: string
    email: string
    document?: string
    cpfCnpj?: string
    phone?: string
  }
  paymentMethod?: {
    id: string
    name: string
    code: string
    type: string
    allowInstallments?: boolean
    maxInstallments?: number
  }
}

export interface CreateSaleItemDto {
  productId: string
  quantity: number
  unitPrice: number
  discount?: number
}

export interface AddSaleItemDto {
  productId: string
  quantity: number
  unitPrice: number
  discount?: number
}

export interface CreateSaleDto {
  customerId: string
  paymentMethodId: string
  items: CreateSaleItemDto[]
  installments?: number
  discount?: number
  shipping?: number
  notes?: string
  deliveryDate?: string
  saleDate?: string
}

export interface UpdateSaleDto {
  customerId?: string
  paymentMethodId?: string
  installments?: number
  discount?: number
  shipping?: number
  notes?: string
  deliveryDate?: string
  saleDate?: string
}

export interface ApproveSaleDto {
  creditAnalysisStatus?: "APPROVED" | "REJECTED"
  creditAnalysisNotes?: string
}

export interface SaleStatistics {
  period: {
    startDate: string
    endDate: string
  }
  totalSales: number
  totalRevenue: number
  averageTicket: number
  salesByStatus: {
    DRAFT: number
    PENDING_APPROVAL: number
    APPROVED: number
    COMPLETED: number
    CANCELED: number
  }
  topCustomers: Array<{
    customerId: string
    customerName: string
    totalPurchases: number
    salesCount: number
  }>
  topProducts: Array<{
    productId: string
    productName: string
    totalSold: number
    revenue: number
  }>
  salesByPaymentMethod: Record<string, {
    count: number
    total: number
  }>
}

export interface SaleFilters {
  status?: SaleStatus
  customerId?: string
  paymentMethodId?: string
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  search?: string
  page?: number
  limit?: number
}

export interface SaleListResponse {
  data: Sale[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ============================================
// API Functions
// ============================================

/**
 * Lista todas as vendas da empresa
 */
export async function getSales(filters?: SaleFilters): Promise<SaleListResponse> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const params = new URLSearchParams()
    if (filters?.status) params.append("status", filters.status)
    if (filters?.customerId) params.append("customerId", filters.customerId)
    if (filters?.paymentMethodId) params.append("paymentMethodId", filters.paymentMethodId)
    if (filters?.startDate) params.append("startDate", filters.startDate)
    if (filters?.endDate) params.append("endDate", filters.endDate)
    if (filters?.minAmount !== undefined) params.append("minAmount", String(filters.minAmount))
    if (filters?.maxAmount !== undefined) params.append("maxAmount", String(filters.maxAmount))
    if (filters?.search) params.append("search", filters.search)
    if (filters?.page) params.append("page", String(filters.page))
    if (filters?.limit) params.append("limit", String(filters.limit))

    const { data } = await apiClient.get<SaleListResponse>(
      `/sales${params.toString() ? `?${params.toString()}` : ""}`,
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
 * Busca venda por ID
 */
export async function getSaleById(id: string): Promise<Sale> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const { data } = await apiClient.get<Sale>(`/sales/${id}`, {
      headers: {
        "x-company-id": selectedCompany.id,
      },
    })

    return data
  } catch (error: any) {
    throw error
  }
}

/**
 * Cria uma nova venda (orçamento)
 */
export async function createSale(dto: CreateSaleDto): Promise<Sale> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const { data } = await apiClient.post<Sale>("/sales", dto, {
      headers: {
        "x-company-id": selectedCompany.id,
      },
    })

    return data
  } catch (error: any) {
    throw error
  }
}

/**
 * Atualiza uma venda
 */
export async function updateSale(id: string, dto: UpdateSaleDto): Promise<Sale> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const { data } = await apiClient.put<Sale>(`/sales/${id}`, dto, {
      headers: {
        "x-company-id": selectedCompany.id,
      },
    })

    return data
  } catch (error: any) {
    throw error
  }
}

/**
 * Deleta uma venda
 */
export async function deleteSale(id: string): Promise<void> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    await apiClient.delete(`/sales/${id}`, {
      headers: {
        "x-company-id": selectedCompany.id,
      },
    })
  } catch (error: any) {
    throw error
  }
}

/**
 * Aprova uma venda (com ou sem análise de crédito)
 */
export async function approveSale(id: string, dto?: ApproveSaleDto): Promise<Sale> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const { data } = await apiClient.post<Sale>(
      `/sales/${id}/approve`, 
      dto || {},
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
 * Cancela uma venda
 */
export async function cancelSale(id: string, reason: string): Promise<Sale> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const { data } = await apiClient.post<Sale>(
      `/sales/${id}/cancel`,
      { reason },
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
 * Completa uma venda
 */
export async function completeSale(id: string): Promise<Sale> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const { data } = await apiClient.post<Sale>(`/sales/${id}/complete`, {}, {
      headers: {
        "x-company-id": selectedCompany.id,
      },
    })

    return data
  } catch (error: any) {
    throw error
  }
}

/**
 * Adiciona um item à venda (apenas DRAFT)
 */
export async function addSaleItem(saleId: string, dto: AddSaleItemDto): Promise<SaleItem> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const { data } = await apiClient.post<SaleItem>(
      `/sales/${saleId}/items`,
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
 * Atualiza um item da venda (apenas DRAFT)
 */
export async function updateSaleItem(
  saleId: string, 
  itemId: string, 
  dto: Partial<AddSaleItemDto>
): Promise<SaleItem> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const { data } = await apiClient.put<SaleItem>(
      `/sales/${saleId}/items/${itemId}`,
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
 * Remove um item da venda (apenas DRAFT)
 */
export async function removeSaleItem(saleId: string, itemId: string): Promise<void> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    await apiClient.delete(`/sales/${saleId}/items/${itemId}`, {
      headers: {
        "x-company-id": selectedCompany.id,
      },
    })
  } catch (error: any) {
    throw error
  }
}

/**
 * Busca estatísticas de vendas
 */
export async function getSaleStatistics(
  startDate?: string,
  endDate?: string
): Promise<SaleStatistics> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const params = new URLSearchParams()
    if (startDate) params.append("startDate", startDate)
    if (endDate) params.append("endDate", endDate)

    const { data } = await apiClient.get<SaleStatistics>(
      `/sales/statistics/summary${params.toString() ? `?${params.toString()}` : ""}`,
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

// Exportar objeto API
export const salesApi = {
  getAll: getSales,
  getById: getSaleById,
  create: createSale,
  update: updateSale,
  delete: deleteSale,
  approve: approveSale,
  cancel: cancelSale,
  complete: completeSale,
  addItem: addSaleItem,
  updateItem: updateSaleItem,
  removeItem: removeSaleItem,
  getStatistics: getSaleStatistics,
}

// Helper: Labels de status
export const saleStatusLabels: Record<SaleStatus, string> = {
  DRAFT: "Orçamento",
  PENDING_APPROVAL: "Aguardando Aprovação",
  APPROVED: "Aprovado",
  COMPLETED: "Concluído",
  CANCELED: "Cancelado",
}

// Helper: Cores de status
export const saleStatusColors: Record<SaleStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  PENDING_APPROVAL: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELED: "bg-red-100 text-red-800",
}
