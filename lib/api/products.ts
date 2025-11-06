import { apiClient } from './client'
import { authApi } from './auth'

// ==========================================
// TYPES - CATEGORIAS
// ==========================================

export interface Category {
  id: string
  name: string
  description?: string
  parentId?: string | null
  active: boolean
  companyId: string
  createdAt: string
  updatedAt: string
  parent?: Category | null
  subcategories?: Category[]
  _count?: {
    products: number
    subcategories: number
  }
}

export interface CreateCategoryRequest {
  name: string
  description?: string
  parentId?: string | null
  active?: boolean
}

export interface UpdateCategoryRequest {
  name?: string
  description?: string
  active?: boolean
}

// ==========================================
// TYPES - UNIDADES
// ==========================================

export interface Unit {
  id: string
  name: string
  abbreviation: string
  fractionable: boolean
  active: boolean
  companyId: string
  createdAt: string
  updatedAt: string
  _count?: {
    products: number
  }
}

export interface CreateUnitRequest {
  name: string
  abbreviation: string
  fractionable?: boolean
  active?: boolean
}

export interface UpdateUnitRequest {
  name?: string
  abbreviation?: string
  fractionable?: boolean
  active?: boolean
}

// ==========================================
// TYPES - MARCAS
// ==========================================

export interface Brand {
  id: string
  name: string
  description?: string
  active: boolean
  companyId: string
  createdAt: string
  updatedAt: string
  _count?: {
    products: number
  }
}

export interface CreateBrandRequest {
  name: string
  description?: string
  active?: boolean
}

export interface UpdateBrandRequest {
  name?: string
  description?: string
  active?: boolean
}

// ==========================================
// TYPES - PRODUTOS
// ==========================================

export type ProductType = 'SIMPLE' | 'COMPOSITE' | 'VARIABLE' | 'COMBO'
export type ProductAvailability = 'AVAILABLE' | 'OUT_OF_STOCK' | 'PRE_ORDER' | 'DISCONTINUED'
export type DimensionType = 'STANDARD' | 'DETAILED'
export type TipoProduto = 'PRODUTO' | 'SERVICO'
export type TipoItemSped = '00' | '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '10' | '99'

// Interfaces para estoque detalhado por localização
export interface StockLocation {
  id: string
  name: string
  code: string
  description?: string
  address?: string
  isDefault: boolean
  active: boolean
}

export interface StockByLocation {
  id: string
  companyId: string
  productId: string
  locationId: string
  quantity: string
  createdAt: string
  updatedAt: string
  location: StockLocation
}

export interface StockLocationSummary {
  locationId: string
  locationName: string
  locationCode: string
  quantity: number
  isDefault: boolean
  active: boolean
  address?: string
  updatedAt: string
}

export interface StockSummary {
  totalStock: number
  stockByLocations: StockLocationSummary[]
  locationsCount: number
  locationsWithStock: number
  locationsOutOfStock: number
}

export interface Product {
  id: string
  name: string
  description?: string
  sku?: string
  barcode?: string
  reference?: string
  
  categoryId?: string
  subcategoryId?: string
  brandId?: string
  unitId?: string
  
  costPrice?: string
  profitMargin?: string
  salePrice: string
  salePriceCash?: string
  salePriceInstallment?: string
  minPrice?: string
  wholesalePrice?: string
  minWholesaleQty?: number
  
  manageStock: boolean
  currentStock?: number
  minStock?: number
  maxStock?: number
  
  dimensionType?: DimensionType
  width?: string
  height?: string
  length?: string
  weight?: string
  grossWeight?: string
  
  expiryAlertDays?: number
  warrantyPeriod?: number
  
  type: ProductType
  productType?: ProductType // Alias para compatibilidade com backend
  active: boolean
  availability: ProductAvailability
  
  // Informações Fiscais
  ncm?: string
  cest?: string
  origin?: string
  
  // CFOP - Código Fiscal de Operações e Prestações
  cfopEstadual?: string
  cfopInterestadual?: string
  cfopEntradaEstadual?: string
  cfopEntradaInterestadual?: string
  
  // Tipo do Item SPED e Tipo do Produto
  tipoItemSped?: TipoItemSped
  tipoProduto?: TipoProduto
  
  // ICMS
  icmsCst?: string
  icmsRate?: string
  icmsModBc?: string
  
  // IPI
  ipiCst?: string
  ipiRate?: string
  
  // PIS
  pisCst?: string
  pisRate?: string
  
  // COFINS
  cofinsCst?: string
  cofinsRate?: string
  
  // ISS (apenas para serviços)
  codigoServico?: string
  issRate?: string
  itemListaServico?: string
  
  notes?: string
  
  companyId: string
  createdAt: string
  updatedAt: string
  
  // Relações
  category?: Category
  subcategory?: Category
  brand?: Brand
  unit?: Unit
  photos?: ProductPhoto[]
  variations?: ProductVariation[]
  compositeItems?: CompositeItem[]
  comboItems?: ComboItem[]
  
  // Estoque detalhado por localização
  stocksByLocation?: StockByLocation[]
  stockSummary?: StockSummary
  
  _count?: {
    photos: number
    variations: number
    compositeItems: number
    comboItems: number
  }
}

export interface ProductPhoto {
  id: string
  productId: string
  documentId: string
  order: number
  isPrimary: boolean
  createdAt: string
}

export interface ProductVariation {
  id: string
  parentProductId: string
  variationName: string
  sku?: string
  barcode?: string
  additionalPrice: string
  stock?: number
  active: boolean
}

export interface CompositeItem {
  id: string
  compositeProductId: string
  componentProductId: string
  quantity: number
  componentProduct: Product
}

export interface ComboItem {
  id: string
  comboProductId: string
  productId: string
  quantity: number
  discountPercentage?: string
  product: Product
}

export interface InitialStockByLocation {
  locationId: string
  quantity: number
}

export interface CreateProductRequest {
  name: string
  description?: string
  sku?: string
  barcode?: string
  reference?: string
  
  categoryId?: string
  subcategoryId?: string
  brandId?: string
  unitId?: string
  
  costPrice?: string
  profitMargin?: string
  salePrice: string
  salePriceCash?: string
  salePriceInstallment?: string
  minPrice?: string
  wholesalePrice?: string
  minWholesaleQty?: number
  
  manageStock?: boolean
  initialStock?: number
  initialStockByLocations?: InitialStockByLocation[]
  minStock?: number
  maxStock?: number
  
  dimensionType?: DimensionType
  width?: string
  height?: string
  length?: string
  weight?: string
  grossWeight?: string
  
  expiryAlertDays?: number
  warrantyPeriod?: number
  
  type?: ProductType
  active?: boolean
  availability?: ProductAvailability
  
  // Informações Fiscais Básicas
  ncm?: string
  cest?: string
  origin?: string
  
  // CFOP - Código Fiscal de Operações e Prestações
  cfopEstadual?: string
  cfopInterestadual?: string
  cfopEntradaEstadual?: string
  cfopEntradaInterestadual?: string
  
  // Tipo do Item SPED e Tipo do Produto
  tipoItemSped?: TipoItemSped
  tipoProduto?: TipoProduto
  
  // ICMS
  icmsCst?: string
  icmsRate?: string
  icmsModBc?: string
  
  // IPI
  ipiCst?: string
  ipiRate?: string
  
  // PIS
  pisCst?: string
  pisRate?: string
  
  // COFINS
  cofinsCst?: string
  cofinsRate?: string
  
  // ISS (apenas para serviços)
  codigoServico?: string
  issRate?: string
  itemListaServico?: string
  
  notes?: string
}

export interface UpdateProductRequest {
  name?: string
  description?: string
  sku?: string
  barcode?: string
  reference?: string
  
  categoryId?: string
  subcategoryId?: string
  brandId?: string
  unitId?: string
  
  costPrice?: string
  profitMargin?: string
  salePrice?: string
  salePriceCash?: string
  salePriceInstallment?: string
  minPrice?: string
  wholesalePrice?: string
  minWholesaleQty?: number
  
  manageStock?: boolean
  minStock?: number
  maxStock?: number
  
  dimensionType?: DimensionType
  width?: string
  height?: string
  length?: string
  weight?: string
  grossWeight?: string
  
  expiryAlertDays?: number
  warrantyPeriod?: number
  
  type?: ProductType
  active?: boolean
  availability?: ProductAvailability
  
  // Informações Fiscais Básicas
  ncm?: string
  cest?: string
  origin?: string
  
  // CFOP - Código Fiscal de Operações e Prestações
  cfopEstadual?: string
  cfopInterestadual?: string
  cfopEntradaEstadual?: string
  cfopEntradaInterestadual?: string
  
  // Tipo do Item SPED e Tipo do Produto
  tipoItemSped?: TipoItemSped
  tipoProduto?: TipoProduto
  
  // ICMS
  icmsCst?: string
  icmsRate?: string
  icmsModBc?: string
  
  // IPI
  ipiCst?: string
  ipiRate?: string
  
  // PIS
  pisCst?: string
  pisRate?: string
  
  // COFINS
  cofinsCst?: string
  cofinsRate?: string
  
  // ISS (apenas para serviços)
  codigoServico?: string
  issRate?: string
  itemListaServico?: string
  
  notes?: string
}

export interface ListProductsParams {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
  brandId?: string
  active?: boolean
  availability?: ProductAvailability
  type?: ProductType
  lowStock?: boolean
  outOfStock?: boolean
  sortBy?: 'name' | 'sku' | 'salePrice' | 'currentStock' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface ListProductsResponse {
  products: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ProductStats {
  totalProducts: number
  activeProducts: number
  inactiveProducts: number
  lowStockProducts: number
  outOfStockProducts: number
  productsByCategory: number
  productsByBrand: number
  totalStockValue: number
}

// ==========================================
// TYPES - ESTOQUE E MOVIMENTAÇÕES
// ==========================================

export type StockStatus = 'NORMAL' | 'LOW_STOCK' | 'OUT_OF_STOCK'
export type StockMovementType = 'ENTRY' | 'EXIT' | 'ADJUSTMENT' | 'RETURN' | 'LOSS' | 'TRANSFER'

export interface StockProduct {
  id: string
  name: string
  sku?: string
  barcode?: string
  currentStock: number
  minStock?: number
  maxStock?: number
  costPrice?: string
  salePrice: string
  stockValue: number
  saleValue: number
  status: StockStatus
  category?: {
    id: string
    name: string
  }
  brand?: {
    id: string
    name: string
  }
  unit?: {
    id: string
    name: string
    abbreviation: string
  }
}

export interface StockSummary {
  totalProducts: number
  lowStockCount: number
  outOfStockCount: number
  totalStockValue: string
  totalSaleValue: string
}

export interface StockResponse {
  products: StockProduct[]
  summary: StockSummary
}

export interface CreateStockMovementRequest {
  type: StockMovementType
  quantity: number
  locationId: string
  documentId?: string
  reason?: string
  notes?: string
  reference?: string
}

export interface StockMovement {
  id: string
  companyId: string
  productId: string
  type: StockMovementType
  quantity: number
  previousStock: number
  newStock: number
  locationId: string
  location?: {
    id: string
    name: string
    code: string
  }
  documentId?: string
  document?: {
    id: string
    fileName: string
    fileUrl: string
    title?: string
    type?: string
    tags?: string[]
    fileSize: number
    mimeType: string
    folder?: {
      id: string
      name: string
      parentId?: string
      parent?: {
        name: string
        parent?: {
          name: string
          parent?: {
            name: string
          }
        }
      }
    }
    uploadedBy?: {
      id: string
      name: string
      email: string
    }
    createdAt: string
  }
  reason?: string
  notes?: string
  reference?: string
  userId: string
  user?: {
    id: string
    name: string
    email: string
  }
  createdAt: string
}

export interface ListStockMovementsParams {
  type?: StockMovementType
  locationId?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface ListStockMovementsResponse {
  data: StockMovement[]
  total: number
  page: number
  limit: number
}

export interface StockParams {
  search?: string
  categoryId?: string
  brandId?: string
  lowStock?: boolean
  outOfStock?: boolean
}

export interface StockStats {
  currentStock: number
  minStock: number
  maxStock: number
  totalStock: number
  needsRestock: boolean
  isOverstocked: boolean
  stockPercentage: number
}

export interface StockByLocation {
  locationId: string
  locationName: string
  locationCode: string
  quantity: number
}

export interface ProductStockStats {
  productId: string
  productName: string
  sku?: string
  barcode?: string
  manageStock: boolean
  stats: StockStats
  stockByLocation: StockByLocation[]
  unit?: {
    id: string
    name: string
    abbreviation: string
  }
}

// ==========================================
// TYPES - FOTOS DE PRODUTOS
// ==========================================

export interface ProductPhoto {
  id: string
  productId: string
  documentId: string
  order: number
  isPrimary: boolean
  createdAt: string
  document?: {
    id: string
    name: string
    originalName: string
    url: string
    mimeType: string
    size: number
  }
}

export interface AddProductPhotoRequest {
  documentId: string
  order?: number
  isPrimary?: boolean
}

export interface ReorderPhotosRequest {
  photoOrders: Array<{
    id: string
    order: number
  }>
}

// ==========================================
// TYPES - LOCAIS DE ESTOQUE
// ==========================================

export interface StockLocation {
  id: string
  companyId: string
  name: string
  code: string
  description?: string
  address?: string
  isDefault: boolean
  active: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    productStocks: number
    stockMovements: number
  }
}

export interface CreateStockLocationRequest {
  name: string
  code: string
  description?: string
  address?: string
  isDefault?: boolean
  active?: boolean
}

export interface UpdateStockLocationRequest {
  name?: string
  description?: string
  address?: string
  isDefault?: boolean
  active?: boolean
}

export interface ProductStockByLocation {
  id: string
  productId: string
  locationId: string
  quantity: number
  location: {
    id: string
    name: string
    code: string
    active: boolean
  }
  updatedAt: string
}

export interface StockByLocationResponse {
  product: {
    id: string
    name: string
    sku: string
    totalStock: number
  }
  stocksByLocation: ProductStockByLocation[]
}

export interface AllStockByLocation {
  id: string
  productId: string
  locationId: string
  quantity: number
  product: {
    id: string
    name: string
    sku: string
    barcode?: string
    unit: {
      abbreviation: string
    }
  }
  location: {
    id: string
    name: string
    code: string
  }
  updatedAt: string
}

// ==========================================
// TYPES - TRANSFERÊNCIAS DE ESTOQUE
// ==========================================

export type TransferStatus = 'PENDING' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED'

export interface TransferItem {
  id: string
  transferId: string
  productId: string
  quantity: number
  notes?: string
  product: {
    id: string
    name: string
    sku: string
  }
}

export interface StockTransfer {
  id: string
  companyId: string
  code: string
  fromLocationId: string
  toLocationId: string
  status: TransferStatus
  notes?: string
  documentId?: string
  document?: {
    id: string
    fileName: string
    fileUrl: string
    title?: string
    type?: string
    tags?: string[]
    fileSize: number
    mimeType: string
    folder?: {
      id: string
      name: string
      parentId?: string
      parent?: {
        name: string
        parent?: {
          name: string
          parent?: {
            name: string
          }
        }
      }
    }
    uploadedBy?: {
      id: string
      name: string
      email: string
    }
    createdAt: string
  }
  requestedBy: string
  requestedAt: string
  approvedBy?: string
  approvedAt?: string
  completedBy?: string
  completedAt?: string
  fromLocation: {
    id: string
    name: string
    code: string
  }
  toLocation: {
    id: string
    name: string
    code: string
  }
  items: TransferItem[]
  createdAt: string
  updatedAt: string
}

export interface CreateTransferItemRequest {
  productId: string
  quantity: number
  notes?: string
}

export interface CreateStockTransferRequest {
  fromLocationId: string
  toLocationId: string
  items: CreateTransferItemRequest[]
  notes?: string
  documentId?: string
}

// ==========================================
// HELPER - Obter Company ID
// ==========================================

const getCompanyId = (): string => {
  const selectedCompany = authApi.getSelectedCompany()
  return selectedCompany?.id || ''
}

// ==========================================
// API - CATEGORIAS
// ==========================================

export const categoriesApi = {
  /**
   * Cria uma nova categoria
   */
  create: async (data: CreateCategoryRequest): Promise<Category> => {
    const companyId = getCompanyId()
    const response = await apiClient.post('/products/categories', data, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Lista todas as categorias
   */
  getAll: async (parentId?: string | null): Promise<Category[]> => {
    const companyId = getCompanyId()
    const params: any = {}
    if (parentId !== undefined) {
      params.parentId = parentId === null ? 'null' : parentId
    }
    const response = await apiClient.get('/products/categories', {
      params,
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Busca uma categoria por ID
   */
  getById: async (id: string): Promise<Category> => {
    const companyId = getCompanyId()
    const response = await apiClient.get(`/products/categories/${id}`, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Atualiza uma categoria
   */
  update: async (id: string, data: UpdateCategoryRequest): Promise<Category> => {
    const companyId = getCompanyId()
    const response = await apiClient.patch(`/products/categories/${id}`, data, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Deleta uma categoria
   */
  delete: async (id: string): Promise<void> => {
    const companyId = getCompanyId()
    await apiClient.delete(`/products/categories/${id}`, {
      headers: {
        'x-company-id': companyId,
      },
    })
  },
}

// ==========================================
// API - UNIDADES
// ==========================================

export const unitsApi = {
  /**
   * Cria uma nova unidade
   */
  create: async (data: CreateUnitRequest): Promise<Unit> => {
    const companyId = getCompanyId()
    const response = await apiClient.post('/products/units', data, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Lista todas as unidades
   */
  getAll: async (): Promise<Unit[]> => {
    const companyId = getCompanyId()
    const response = await apiClient.get('/products/units', {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Busca uma unidade por ID
   */
  getById: async (id: string): Promise<Unit> => {
    const companyId = getCompanyId()
    const response = await apiClient.get(`/products/units/${id}`, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Atualiza uma unidade
   */
  update: async (id: string, data: UpdateUnitRequest): Promise<Unit> => {
    const companyId = getCompanyId()
    const response = await apiClient.patch(`/products/units/${id}`, data, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Deleta uma unidade
   */
  delete: async (id: string): Promise<void> => {
    const companyId = getCompanyId()
    await apiClient.delete(`/products/units/${id}`, {
      headers: {
        'x-company-id': companyId,
      },
    })
  },
}

// ==========================================
// API - MARCAS
// ==========================================

export const brandsApi = {
  /**
   * Cria uma nova marca
   */
  create: async (data: CreateBrandRequest): Promise<Brand> => {
    const companyId = getCompanyId()
    const response = await apiClient.post('/products/brands', data, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Lista todas as marcas
   */
  getAll: async (): Promise<Brand[]> => {
    const companyId = getCompanyId()
    const response = await apiClient.get('/products/brands', {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Busca uma marca por ID
   */
  getById: async (id: string): Promise<Brand> => {
    const companyId = getCompanyId()
    const response = await apiClient.get(`/products/brands/${id}`, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Atualiza uma marca
   */
  update: async (id: string, data: UpdateBrandRequest): Promise<Brand> => {
    const companyId = getCompanyId()
    const response = await apiClient.patch(`/products/brands/${id}`, data, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Deleta uma marca
   */
  delete: async (id: string): Promise<void> => {
    const companyId = getCompanyId()
    await apiClient.delete(`/products/brands/${id}`, {
      headers: {
        'x-company-id': companyId,
      },
    })
  },
}

// ==========================================
// API - PRODUTOS
// ==========================================

export const productsApi = {
  /**
   * Cria um novo produto
   */
  create: async (data: CreateProductRequest): Promise<Product> => {
    const companyId = getCompanyId()
    const response = await apiClient.post('/products', data, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Lista produtos com filtros e paginação
   */
  getAll: async (params?: ListProductsParams): Promise<ListProductsResponse> => {
    const companyId = getCompanyId()
    const response = await apiClient.get('/products', {
      params,
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Busca um produto por ID com todos os detalhes
   */
  getById: async (id: string): Promise<Product> => {
    const companyId = getCompanyId()
    const response = await apiClient.get(`/products/${id}`, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Atualiza um produto
   */
  update: async (id: string, data: UpdateProductRequest): Promise<Product> => {
    const companyId = getCompanyId()
    const response = await apiClient.patch(`/products/${id}`, data, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Deleta um produto
   */
  delete: async (id: string): Promise<void> => {
    const companyId = getCompanyId()
    await apiClient.delete(`/products/${id}`, {
      headers: {
        'x-company-id': companyId,
      },
    })
  },

  /**
   * Lista produtos com estoque baixo
   */
  getLowStock: async (): Promise<Product[]> => {
    const companyId = getCompanyId()
    const response = await apiClient.get('/products/low-stock', {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Obtém estatísticas dos produtos
   */
  getStats: async (): Promise<ProductStats> => {
    const companyId = getCompanyId()
    const response = await apiClient.get('/products/stats', {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Lista estoque de produtos
   */
  getStock: async (params?: StockParams): Promise<StockResponse> => {
    const companyId = getCompanyId()
    const response = await apiClient.get('/products/stock', {
      params,
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Adiciona movimentação de estoque
   */
  addStockMovement: async (
    productId: string,
    data: CreateStockMovementRequest
  ): Promise<StockMovement> => {
    const companyId = getCompanyId()
    const response = await apiClient.post(`/products/${productId}/stock-movement`, data, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Lista movimentações de estoque de um produto
   */
  getStockMovements: async (
    productId: string,
    params?: ListStockMovementsParams
  ): Promise<ListStockMovementsResponse> => {
    const companyId = getCompanyId()
    const response = await apiClient.get(`/products/${productId}/stock-movements`, {
      params,
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Obtém histórico de movimentações de estoque
   */
  getStockHistory: async (productId: string, limit = 50): Promise<StockMovement[]> => {
    const companyId = getCompanyId()
    const response = await apiClient.get(`/products/${productId}/stock-history`, {
      params: { limit },
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Obtém estatísticas de estoque do produto
   */
  getStockStats: async (productId: string): Promise<ProductStockStats> => {
    const companyId = getCompanyId()
    const response = await apiClient.get(`/products/${productId}/stock-stats`, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Adiciona foto ao produto
   */
  addPhoto: async (
    productId: string,
    data: AddProductPhotoRequest
  ): Promise<ProductPhoto> => {
    const companyId = getCompanyId()
    const response = await apiClient.post(`/products/${productId}/photos`, data, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Remove foto do produto
   */
  removePhoto: async (productId: string, photoId: string): Promise<{ message: string }> => {
    const companyId = getCompanyId()
    const response = await apiClient.delete(`/products/${productId}/photos/${photoId}`, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Define foto como principal
   */
  setPrimaryPhoto: async (productId: string, photoId: string): Promise<ProductPhoto> => {
    const companyId = getCompanyId()
    const response = await apiClient.patch(
      `/products/${productId}/photos/${photoId}/primary`,
      {},
      {
        headers: {
          'x-company-id': companyId,
        },
      }
    )
    return response.data
  },

  /**
   * Reordena fotos do produto
   */
  reorderPhotos: async (
    productId: string,
    data: ReorderPhotosRequest
  ): Promise<Array<{ id: string; order: number; isPrimary: boolean }>> => {
    const companyId = getCompanyId()
    const response = await apiClient.patch(`/products/${productId}/photos/reorder`, data, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },
}

// ==========================================
// API - LOCAIS DE ESTOQUE
// ==========================================

export const stockLocationsApi = {
  /**
   * Cria um novo local de estoque
   */
  create: async (data: CreateStockLocationRequest): Promise<StockLocation> => {
    const companyId = getCompanyId()
    const response = await apiClient.post('/products/stock-locations', data, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Lista todos os locais de estoque
   */
  getAll: async (): Promise<StockLocation[]> => {
    const companyId = getCompanyId()
    const response = await apiClient.get('/products/stock-locations', {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Busca local por ID
   */
  getById: async (id: string): Promise<StockLocation> => {
    const companyId = getCompanyId()
    const response = await apiClient.get(`/products/stock-locations/${id}`, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Atualiza local de estoque
   */
  update: async (id: string, data: UpdateStockLocationRequest): Promise<StockLocation> => {
    const companyId = getCompanyId()
    const response = await apiClient.patch(`/products/stock-locations/${id}`, data, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Deleta local de estoque
   */
  delete: async (id: string): Promise<{ message: string }> => {
    const companyId = getCompanyId()
    const response = await apiClient.delete(`/products/stock-locations/${id}`, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Ver estoque de um produto por local
   */
  getProductStockByLocation: async (productId: string): Promise<StockByLocationResponse> => {
    const companyId = getCompanyId()
    const response = await apiClient.get(`/products/${productId}/stock-by-location`, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Ver todo o estoque agrupado por local
   */
  getAllStockByLocation: async (locationId?: string): Promise<AllStockByLocation[]> => {
    const companyId = getCompanyId()
    const params = locationId ? { locationId } : {}
    const response = await apiClient.get('/products/stock/by-location', {
      params,
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },
}

// ==========================================
// API - TRANSFERÊNCIAS DE ESTOQUE
// ==========================================

// Parâmetros para listar transferências
export interface ListStockTransfersParams {
  status?: TransferStatus
  fromLocationId?: string
  toLocationId?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface ListStockTransfersResponse {
  data: StockTransfer[]
  total: number
  page: number
  limit: number
}

export const stockTransfersApi = {
  /**
   * Cria uma nova transferência
   */
  create: async (data: CreateStockTransferRequest): Promise<StockTransfer> => {
    const companyId = getCompanyId()
    const response = await apiClient.post('/products/stock-transfers', data, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Lista todas as transferências com filtros e paginação
   */
  getAll: async (params?: ListStockTransfersParams): Promise<ListStockTransfersResponse | StockTransfer[]> => {
    const companyId = getCompanyId()
    const response = await apiClient.get('/products/stock-transfers', {
      params,
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Busca transferência por ID
   */
  getById: async (id: string): Promise<StockTransfer> => {
    const companyId = getCompanyId()
    const response = await apiClient.get(`/products/stock-transfers/${id}`, {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  },

  /**
   * Aprova uma transferência
   */
  approve: async (id: string): Promise<StockTransfer> => {
    const companyId = getCompanyId()
    const response = await apiClient.patch(
      `/products/stock-transfers/${id}/approve`,
      {},
      {
        headers: {
          'x-company-id': companyId,
        },
      }
    )
    return response.data
  },

  /**
   * Completa uma transferência
   */
  complete: async (id: string): Promise<StockTransfer> => {
    const companyId = getCompanyId()
    const response = await apiClient.patch(
      `/products/stock-transfers/${id}/complete`,
      {},
      {
        headers: {
          'x-company-id': companyId,
        },
      }
    )
    return response.data
  },

  /**
   * Cancela uma transferência
   */
  cancel: async (id: string, reason?: string): Promise<StockTransfer> => {
    const companyId = getCompanyId()
    const response = await apiClient.patch(
      `/products/stock-transfers/${id}/cancel`,
      reason ? { reason } : {},
      {
        headers: {
          'x-company-id': companyId,
        },
      }
    )
    return response.data
  },
}
