import { apiClient } from "./client"
import { authApi } from "./auth"

// ============================================
// Types & Interfaces
// ============================================

export type SaleStatus = "QUOTE" | "DRAFT" | "PENDING_APPROVAL" | "CONFIRMED" | "APPROVED" | "COMPLETED" | "CANCELED"
export type CreditAnalysisStatus = "PENDING" | "APPROVED" | "REJECTED"

// Modalidade de Frete SEFAZ
export type ShippingModality = 0 | 1 | 2 | 3 | 4 | 9

export const shippingModalityLabels: Record<ShippingModality, string> = {
  0: "Por conta do Emitente (CIF)",
  1: "Por conta do Destinatário (FOB)",
  2: "Por conta de Terceiros",
  3: "Transporte Próprio do Emitente",
  4: "Transporte Próprio do Destinatário",
  9: "Sem Frete",
}

export const shippingModalityDescriptions: Record<ShippingModality, string> = {
  0: "Vendedor responsável pelo frete (CIF)",
  1: "Comprador responsável pelo frete (FOB)",
  2: "Transportadora contratada por terceiros",
  3: "Frota própria do vendedor",
  4: "Frota própria do comprador",
  9: "Venda sem transporte (ex: retirada no local)",
}

export interface SaleItem {
  id: string
  saleId: string
  productId: string
  stockLocationId?: string
  productCode?: string
  productName?: string
  productUnit?: string
  quantity: number
  unitPrice: number
  subtotal: number
  discount: number
  total: number
  totalPrice?: number // Mantido para compatibilidade
  notes?: string
  createdAt: string
  updatedAt: string
  product?: {
    id: string
    name: string
    sku?: string
    price?: number
    stockQuantity?: number
    description?: string
    barcode?: string
    reference?: string
    costPrice?: string
    salePrice?: string
    currentStock?: string
  }
  stockLocation?: {
    id: string
    name: string
    code: string
    description?: string
  }
}

export interface Sale {
  id: string
  companyId: string
  customerId: string
  paymentMethodId: string
  code: string // Código da venda (VDA-000001)
  saleNumber?: string // Mantido para compatibilidade
  status: SaleStatus
  subtotal: number
  discountAmount: number
  discountPercent: number
  discount?: number // Mantido para compatibilidade
  shippingCost: number
  shippingModality: ShippingModality
  shipping?: number // Mantido para compatibilidade
  otherCharges: number
  otherChargesDesc: string | null
  totalAmount: number
  installments: number
  installmentValue: number
  creditAnalysisRequired: boolean
  creditAnalysisStatus: CreditAnalysisStatus | null
  creditAnalysisDate: string | null
  creditAnalysisNotes: string | null
  creditScore: number | null
  useCustomerAddress: boolean
  deliveryAddress: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  } | null
  notes: string | null
  internalNotes: string | null
  quoteDate: string | null
  validUntil: string | null
  saleDate?: string | null // Mantido para compatibilidade
  deliveryDate?: string | null
  confirmedAt: string | null
  canceledAt: string | null
  cancellationReason: string | null
  cancelReason?: string | null // Mantido para compatibilidade
  approvedAt: string | null
  approvedBy?: string | null
  canceledBy?: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
  items: SaleItem[]
  nfes?: Array<{
    id: string
    numero: number
    serie: string
    status: string
    chaveAcesso?: string
  }>
  accountsReceivable?: Array<{
    id: string
    originalAmount: number
    receivedAmount: number
    remainingAmount: number
    dueDate: string
    receiptDate?: string
    status: string
    paymentMethod?: string
  }>
  stockMovements?: Array<{
    id: string
    type: string
    quantity: string | number
    previousStock: string | number
    newStock: string | number
    reason?: string
    notes?: string
    product?: {
      name: string
      sku?: string
    }
    location?: {
      name: string
    }
  }>
  installmentDetails?: Array<{
    installmentNumber: number
    dueDate: string
    amount: number
  }>
  customer?: {
    id: string
    personType: "FISICA" | "JURIDICA"
    name: string
    cpf?: string
    cnpj?: string
    companyName?: string
    tradeName?: string
    stateRegistration?: string
    stateRegistrationExempt?: boolean
    email: string | null
    phone: string | null
    mobile: string | null
    document?: string // Mantido para compatibilidade
    cpfCnpj?: string // Mantido para compatibilidade
    creditLimit?: string
    active: boolean
    addresses?: Array<{
      id: string
      type: string
      street: string
      number: string
      complement?: string
      neighborhood: string
      city: string
      state: string
      zipCode: string
      country?: string
    }>
  }
  paymentMethod?: {
    id: string
    name: string
    code: string
    type: string
    active: boolean
    allowInstallments?: boolean
    maxInstallments?: number
    installmentFee?: number
    requiresCreditAnalysis?: boolean
    minCreditScore?: number
    daysToReceive?: number
    transactionFee?: number
  }
}

export interface CreateSaleItemDto {
  productId: string
  quantity: number
  unitPrice: number
  discount?: number
  stockLocationId?: string
  notes?: string
}

export interface AddSaleItemDto {
  productId: string
  quantity: number
  unitPrice: number
  discount?: number
  stockLocationId?: string
  notes?: string
}

export interface CreateSaleDto {
  // Obrigatórios
  customerId: string
  items: CreateSaleItemDto[]
  
  // Opcionais
  status?: "QUOTE" | "PENDING_APPROVAL"
  paymentMethodId?: string
  installments?: number
  
  // Descontos
  discountPercent?: number
  discountAmount?: number
  
  // Valores adicionais
  shippingCost?: number
  shippingModality?: ShippingModality
  otherCharges?: number
  otherChargesDesc?: string
  
  // Endereço de entrega
  useCustomerAddress?: boolean
  deliveryAddress?: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
  
  // Observações
  notes?: string
  internalNotes?: string
  
  // Validade
  validUntil?: string
  
  // Compatibilidade (deprecated)
  discount?: number
  shipping?: number
  deliveryDate?: string
  saleDate?: string
}

export interface UpdateSaleDto {
  customerId?: string
  paymentMethodId?: string
  installments?: number
  discount?: number
  shipping?: number
  shippingModality?: ShippingModality
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
      { cancellationReason: reason },
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
 * Confirma uma venda (baixa estoque + cria financeiro)
 */
export async function confirmSale(id: string): Promise<Sale> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const { data } = await apiClient.post<Sale>(`/sales/${id}/confirm`, {}, {
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
 * Aprova análise de crédito
 */
export async function approveCreditAnalysis(id: string, notes?: string): Promise<Sale> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const { data } = await apiClient.post<Sale>(
      `/sales/${id}/credit-analysis/approve`, 
      { notes: notes || '' },
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
 * Rejeita análise de crédito
 */
export async function rejectCreditAnalysis(id: string, notes: string): Promise<Sale> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const { data } = await apiClient.post<Sale>(
      `/sales/${id}/credit-analysis/reject`, 
      { notes },
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
 * Altera status da venda manualmente
 */
export async function changeSaleStatus(id: string, status: SaleStatus): Promise<Sale> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const { data } = await apiClient.patch<Sale>(
      `/sales/${id}/status`, 
      { status },
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

/**
 * Exporta uma venda em PDF
 */
async function exportSaleToPDF(id: string): Promise<Blob> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const { data } = await apiClient.get(`/sales/${id}/pdf`, {
      headers: {
        "x-company-id": selectedCompany.id,
      },
      responseType: "blob",
    })

    return data
  } catch (error: any) {
    throw error
  }
}

/**
 * Exporta todas as vendas em Excel
 */
async function exportSalesToExcel(filters?: SaleFilters): Promise<Blob> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const { data } = await apiClient.get("/sales/export/excel", {
      params: filters,
      headers: {
        "x-company-id": selectedCompany.id,
      },
      responseType: "blob",
    })

    return data
  } catch (error: any) {
    throw error
  }
}

/**
 * Dashboard Statistics Interfaces
 */
export interface DashboardPeriod {
  currentMonth: {
    start: string
    end: string
  }
  previousMonth: {
    start: string
    end: string
  }
}

export interface DashboardMetric {
  current: number
  previous: number
  change: number
  changePercent: string
}

export interface DashboardMetrics {
  sales: DashboardMetric
  products: DashboardMetric
  customers: DashboardMetric
  averageTicket: DashboardMetric
}

export interface DashboardRecentSale {
  id: string
  code: string
  customer: {
    id: string
    name: string
    cpf: string | null
    cnpj: string | null
  }
  totalAmount: number
  installments: number
  paymentMethod: {
    id: string
    name: string
  }
  confirmedAt: string
  status: string
}

export interface DashboardTopProduct {
  product: {
    id: string
    name: string
    sku: string
    salePrice: number
    currentStock: number
  }
  quantitySold: number
  salesCount: number
}

export interface DashboardStats {
  period: DashboardPeriod
  metrics: DashboardMetrics
  recentSales: DashboardRecentSale[]
  topProducts: DashboardTopProduct[]
}

/**
 * Busca estatísticas consolidadas para o dashboard
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const { data } = await apiClient.get<DashboardStats>("/sales/dashboard/stats", {
      headers: {
        "x-company-id": selectedCompany.id,
      },
    })

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
  confirm: confirmSale,
  approveCreditAnalysis: approveCreditAnalysis,
  rejectCreditAnalysis: rejectCreditAnalysis,
  changeStatus: changeSaleStatus,
  addItem: addSaleItem,
  updateItem: updateSaleItem,
  removeItem: removeSaleItem,
  getStatistics: getSaleStatistics,
  getDashboardStats: getDashboardStats,
  exportToPDF: exportSaleToPDF,
  exportToExcel: exportSalesToExcel,
}

// Helper: Labels de status
export const saleStatusLabels: Record<SaleStatus, string> = {
  QUOTE: "Orçamento",
  DRAFT: "Rascunho",
  PENDING_APPROVAL: "Aguardando Aprovação",
  CONFIRMED: "Confirmado",
  APPROVED: "Aprovado",
  COMPLETED: "Concluído",
  CANCELED: "Cancelado",
}

// Helper: Cores de status
export const saleStatusColors: Record<SaleStatus, string> = {
  QUOTE: "bg-blue-100 text-blue-800",
  DRAFT: "bg-gray-100 text-gray-800",
  PENDING_APPROVAL: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-cyan-100 text-cyan-800",
  APPROVED: "bg-green-100 text-green-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELED: "bg-red-100 text-red-800",
}
