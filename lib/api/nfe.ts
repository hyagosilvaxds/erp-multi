import { apiClient } from "./client"
import { authApi } from "./auth"

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export type NFeStatus =
  | "DRAFT"           // Rascunho
  | "VALIDADA"        // Validada (mantido para compatibilidade)
  | "ASSINADA"        // Assinada (mantido para compatibilidade)
  | "ENVIADA"         // Enviada (mantido para compatibilidade)
  | "PROCESSANDO"     // Processando (mantido para compatibilidade)
  | "AUTHORIZED"      // Autorizada (inglês)
  | "AUTORIZADA"      // Autorizada (português)
  | "REJECTED"        // Rejeitada (inglês)
  | "REJEITADA"       // Rejeitada (português)
  | "CANCELED"        // Cancelada
  | "DENEGADA"        // Denegada (mantido para compatibilidade)
  | "INUTILIZADA"     // Inutilizada (mantido para compatibilidade)

export type NFeTipoEmissao = "NORMAL" | "CONTINGENCIA_FS_IA" | "CONTINGENCIA_EPEC"
export type NFeTipoOperacao = "ENTRADA" | "SAIDA"
export type NFeFinalidade = "NORMAL" | "COMPLEMENTAR" | "AJUSTE" | "DEVOLUCAO"
export type NFeModalidadeFrete = "EMITENTE" | "DESTINATARIO" | "TERCEIROS" | "SEM_FRETE"

export interface NFe {
  id: string
  companyId: string
  saleId?: string
  
  // Identificação
  cUF?: string
  cNF?: string
  numero: number
  serie: string
  modelo: string
  chaveAcesso?: string
  cDV?: string
  
  // Status e Protocolo
  status: NFeStatus
  protocolo?: string
  protocoloAutorizacao?: string
  dataAutorizacao?: Date | string
  mensagemSefaz?: string
  
  // Tipo e Finalidade
  tipoOperacao: number | NFeTipoOperacao
  finalidade: number | NFeFinalidade
  tipoEmissao?: number | NFeTipoEmissao
  naturezaOperacao: string
  
  // Configurações
  idDest?: number
  cMunFG?: string
  tpImp?: number
  tpEmis?: number
  indFinal?: number
  indPres?: number
  indIntermed?: number
  procEmi?: number
  verProc?: string
  
  // Emitente (preenchido automaticamente)
  emitenteId?: string
  emitente?: any
  
  // Destinatário
  destinatarioId?: string
  destinatarioNome?: string
  destinatarioCnpjCpf?: string
  destinatarioIe?: string
  indIEDest?: number
  destinatarioEmail?: string
  destinatarioTelefone?: string
  
  // Endereço do Destinatário
  destLogradouro?: string
  destNumero?: string
  destComplemento?: string
  destBairro?: string
  destCidade?: string
  destCodigoMunicipio?: string
  destEstado?: string
  destCep?: string
  destCodigoPais?: string
  destPais?: string
  
  // Valores dos Produtos
  valorProdutos: number
  valorFrete: number
  valorSeguro: number
  valorDesconto: number
  valorOutrasDespesas: number
  valorTotal: number
  
  // Impostos
  valorII?: number
  valorIPI?: number
  valorIPIDevol?: number
  valorICMS?: number
  valorICMSDeson?: number
  valorFCP?: number
  valorICMSST?: number
  valorFCPST?: number
  valorFCPSTRet?: number
  valorPIS?: number
  valorCOFINS?: number
  
  // Totais de Tributos
  valorTributosFederais?: number
  valorTributosEstaduais?: number
  valorTributosMunicipais?: number
  valorTributosTotal?: number
  valorTotalTributos?: number
  
  // Transporte
  modalidadeFrete: number | NFeModalidadeFrete
  transportadoraNome?: string
  transportadoraCnpjCpf?: string
  transportadoraIE?: string
  transportadoraEndereco?: string
  transportadoraCidade?: string
  transportadoraUF?: string
  veiculoPlaca?: string
  veiculoUF?: string
  volumeQuantidade?: number
  volumeEspecie?: string
  volumeMarca?: string
  volumeNumeracao?: string
  volumePesoLiquido?: number
  volumePesoBruto?: number
  
  // Pagamento
  indicadorPagamento?: number
  meioPagamento?: string
  valorPagamento?: number
  valorTroco?: number
  formaPagamento?: string
  
  // Informações Adicionais
  informacoesComplementares?: string
  informacoesFisco?: string
  observacoes?: string
  
  // Datas
  dataEmissao?: Date | string
  dataSaida?: Date | string
  
  // XML e Arquivos
  xmlEnviado?: string
  xmlRetorno?: string
  xmlAutorizado?: string
  xmlAutorizadoUrl?: string
  danfePdfPath?: string
  danfeUrl?: string
  danfePdfUrl?: string
  xmlGerado?: string
  xmlGeradoUrl?: string
  xmlAssinado?: string
  xmlAssinadoUrl?: string
  xmlErro?: string
  xmlErroUrl?: string
  
  // Resposta SEFAZ
  respostaSefaz?: any
  codigoStatus?: string
  motivoRejeicao?: string
  
  // Cancelamento
  canceladaEm?: Date | string
  motivoCancelamento?: string
  protocoloCancelamento?: string
  
  // Contingência
  emContingencia?: boolean
  tipoContingencia?: string
  justificativaContingencia?: string
  
  // Responsável Técnico
  respTecCNPJ?: string
  respTecContato?: string
  respTecEmail?: string
  respTecFone?: string
  
  // Metadados
  createdAt: Date | string
  updatedAt: Date | string
  createdBy?: string
  
  // Relacionamentos
  sale?: any
  company?: any
  customer?: any
  items?: NFeItem[]
  events?: NFeEvent[]
}

export interface NFeItem {
  id: string
  nfeId: string
  numero: number
  
  // Produto
  productId?: string
  codigoProduto: string
  codigoEAN?: string
  codigoEANTrib?: string
  descricao: string
  ncm: string
  cest?: string
  cfop: string
  
  // Unidades e Quantidades
  unidadeComercial: string
  quantidadeComercial: number
  valorUnitarioComercial: number
  unidadeTributavel: string
  quantidadeTributavel: number
  valorUnitarioTributavel: number
  
  // Valores
  valorProduto: number
  valorDesconto: number
  valorFrete: number
  valorSeguro: number
  valorOutros: number
  indicadorTotal: number
  
  // ICMS
  icmsOrigem?: number
  icmsCst?: string
  icmsCSOSN?: string
  icmsModalidadeBC?: number
  icmsBase?: number
  icmsAliquota?: number
  icmsValor?: number
  icmsFCPBase?: number
  icmsFCPAliquota?: number
  icmsFCPValor?: number
  icmsStModalidadeBC?: number
  icmsStBase?: number
  icmsStAliquota?: number
  icmsStValor?: number
  icmsStMVA?: number
  icmsStReducaoBC?: number
  icmsUFDestBase?: number
  icmsUFDestAliquota?: number
  icmsUFDestValor?: number
  icmsUFRemetAliquota?: number
  icmsUFRemetValor?: number
  
  // IPI
  ipiCst?: string
  ipiBase?: number
  ipiAliquota?: number
  ipiValor?: number
  
  // II
  iiBase?: number
  iiDespAdu?: number
  iiValor?: number
  iiIOF?: number
  
  // PIS
  pisCst?: string
  pisBase?: number
  pisAliquota?: number
  pisValor?: number
  pisQuantidade?: number
  pisAliqValor?: number
  
  // COFINS
  cofinsCst?: string
  cofinsBase?: number
  cofinsAliquota?: number
  cofinsValor?: number
  cofinsQuantidade?: number
  cofinsAliqValor?: number
  
  // IBS/CBS
  ibsCbsCst?: string
  ibsCbsClassTrib?: string
  ibsBase?: number
  ibsUFAliquota?: number
  ibsUFValor?: number
  ibsMunAliquota?: number
  ibsMunValor?: number
  ibsValor?: number
  cbsAliquota?: number
  cbsValor?: number
  
  // Informações Adicionais
  informacoesAdicionais?: string
  
  // Metadados
  createdAt?: Date | string
  updatedAt?: Date | string
  
  // Relacionamentos
  product?: any
}

export interface NFeEvent {
  id: string
  nfeId: string
  tipo: "CONFIRMACAO_OPERACAO" | "CIENCIA_OPERACAO" | "DESCONHECIMENTO_OPERACAO" | "OPERACAO_NAO_REALIZADA" | "CANCELAMENTO" | "CARTA_CORRECAO" | "CONSULTA" | "ERRO"
  sequencia?: number
  descricao: string
  justificativa?: string
  protocolo?: string
  dataEvento: Date | string
  xmlEnviado?: string
  xmlRetorno?: string
  status?: "PROCESSADO" | "REJEITADO" | "ERRO"
  createdAt?: Date | string
}

// DTOs
export interface CreateNFeFromSaleDto {
  saleId: string
  serie: string
  modelo: string
  naturezaOperacao: string
  tipoOperacao: number
  finalidade: number
  modalidadeFrete: number
  informacoesComplementares?: string
  informacoesFisco?: string
  observacoes?: string
}

export interface CreateNFeDto {
  saleId?: string
  serie: string
  naturezaOperacao: string
  tipoOperacao: NFeTipoOperacao
  finalidade: NFeFinalidade
  
  // Destinatário
  destinatarioId?: string
  destinatarioTipo?: "PESSOA_FISICA" | "PESSOA_JURIDICA"
  destinatarioNome?: string
  destinatarioCnpjCpf?: string
  destinatarioIe?: string
  destinatarioEndereco?: any
  
  // Itens
  items: Omit<NFeItem, "id" | "nfeId">[]
  
  // Transporte
  modalidadeFrete: NFeModalidadeFrete
  transportadoraId?: string
  veiculoPlaca?: string
  veiculoUf?: string
  volumeQuantidade?: number
  volumeEspecie?: string
  volumeMarca?: string
  volumeNumeracao?: string
  volumePesoLiquido?: number
  volumePesoBruto?: number
  
  // Pagamento
  formaPagamento?: string
  meioPagamento?: string
  
  // Informações Adicionais
  informacoesComplementares?: string
  informacoesFisco?: string
  observacoes?: string
}

export interface UpdateNFeDto extends Partial<CreateNFeDto> {}

export interface EmitirNFeDto {
  saleId: string
  enviarSefaz?: boolean // Default: true
  modelo?: string // Default: "55" (NF-e) ou "65" (NFC-e)
  serie?: string // Default: "1"
  numero?: number // Se não informado, gera automaticamente
  naturezaOperacao?: string // Default: "VENDA"
  tipoOperacao?: string // "0" = Entrada, "1" = Saída (Default: "1")
  finalidade?: string // "1" = Normal, "2" = Complementar, "3" = Ajuste, "4" = Devolução (Default: "1")
  consumidorFinal?: string // "0" = Não, "1" = Sim (Default: "1")
  presencaComprador?: string // "0" = Não se aplica, "1" = Presencial, "2" = Internet, etc. (Default: "1")
  modalidadeFrete?: string // "0" = Emitente, "1" = Destinatário, "9" = Sem frete (Default: "9")
}

export interface CancelarNFeDto {
  justificativa: string
}

export interface NFeFilters {
  status?: NFeStatus
  saleId?: string
  destinatarioId?: string
  chaveAcesso?: string
  search?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
  numero?: string
  serie?: string
  customerName?: string
  dataInicio?: string
  dataFim?: string
}

export interface NFeListResponse {
  data: NFe[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface NFeStats {
  total: number
  emitidas: number
  canceladas: number
  rascunhos: number
  valorTotalEmitidas: number
}

// ============================================================================
// FUNÇÕES DA API
// ============================================================================

/**
 * Busca estatísticas de NFes
 */
export async function getNFeStats(): Promise<NFeStats> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const { data } = await apiClient.get<NFeStats>("/nfe/stats", {
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
 * Lista todas as NFes
 */
export async function getNFes(filters?: NFeFilters): Promise<NFeListResponse> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const params = new URLSearchParams()
    if (filters?.status) params.append("status", filters.status)
    if (filters?.saleId) params.append("saleId", filters.saleId)
    if (filters?.destinatarioId) params.append("destinatarioId", filters.destinatarioId)
    if (filters?.chaveAcesso) params.append("chaveAcesso", filters.chaveAcesso)
    if (filters?.search) params.append("search", filters.search)
    if (filters?.startDate) params.append("startDate", filters.startDate)
    if (filters?.endDate) params.append("endDate", filters.endDate)
    if (filters?.page) params.append("page", String(filters.page))
    if (filters?.limit) params.append("limit", String(filters.limit))

    const { data } = await apiClient.get<NFeListResponse>(
      `/nfe${params.toString() ? `?${params.toString()}` : ""}`,
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
 * Busca uma NFe por ID
 */
export async function getNFeById(id: string): Promise<NFe> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const { data } = await apiClient.get<NFe>(`/nfe/${id}`, {
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
 * Cria uma NFe a partir de uma venda
 */
export async function createNFeFromSale(dto: CreateNFeFromSaleDto): Promise<NFe> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const { data } = await apiClient.post<NFe>("/nfe/from-sale", dto, {
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
 * Cria uma nova NFe
 */
export async function createNFe(dto: CreateNFeDto): Promise<NFe> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const { data } = await apiClient.post<NFe>("/nfe", dto, {
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
 * Atualiza uma NFe (somente rascunho)
 */
export async function updateNFe(id: string, dto: UpdateNFeDto): Promise<NFe> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const { data } = await apiClient.put<NFe>(`/nfe/${id}`, dto, {
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
 * Deleta uma NFe (somente rascunho)
 */
export async function deleteNFe(id: string): Promise<void> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    await apiClient.delete(`/nfe/${id}`, {
      headers: {
        "x-company-id": selectedCompany.id,
      },
    })
  } catch (error: any) {
    throw error
  }
}

/**
 * Emite uma NFe
 */
export async function emitirNFe(dto: EmitirNFeDto): Promise<NFe> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const { data } = await apiClient.post<NFe>("/fiscal/nfe/emitir", dto, {
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
 * Cancela uma NFe
 */
export async function cancelarNFe(id: string, dto: CancelarNFeDto): Promise<NFe> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const { data } = await apiClient.post<NFe>(`/nfe/${id}/cancelar`, dto, {
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
 * Download do XML da NFe
 */
export async function downloadNFeXML(id: string): Promise<Blob> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const { data } = await apiClient.get(`/nfe/${id}/xml`, {
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
 * Download do PDF (DANFE) da NFe
 */
export async function downloadNFePDF(id: string): Promise<Blob> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const { data } = await apiClient.get(`/nfe/${id}/pdf`, {
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
 * Consulta situação da NFe na SEFAZ
 */
export async function consultarNFe(id: string): Promise<NFe> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const { data } = await apiClient.post<NFe>(`/nfe/${id}/consultar`, null, {
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
export const nfeApi = {
  getStats: getNFeStats,
  getAll: getNFes,
  getById: getNFeById,
  create: createNFe,
  createFromSale: createNFeFromSale,
  update: updateNFe,
  delete: deleteNFe,
  emitir: emitirNFe,
  cancelar: cancelarNFe,
  downloadXML: downloadNFeXML,
  downloadPDF: downloadNFePDF,
  consultar: consultarNFe,
}

// ============================================================================
// HELPERS
// ============================================================================

export const nfeStatusLabels: Record<NFeStatus, string> = {
  DRAFT: "Rascunho",
  VALIDADA: "Validada",
  ASSINADA: "Assinada",
  ENVIADA: "Enviada",
  PROCESSANDO: "Processando",
  AUTHORIZED: "Autorizada",
  AUTORIZADA: "Autorizada",
  REJECTED: "Rejeitada",
  REJEITADA: "Rejeitada",
  CANCELED: "Cancelada",
  DENEGADA: "Denegada",
  INUTILIZADA: "Inutilizada",
}

export const nfeStatusColors: Record<NFeStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  VALIDADA: "bg-blue-100 text-blue-800",
  ASSINADA: "bg-indigo-100 text-indigo-800",
  ENVIADA: "bg-yellow-100 text-yellow-800",
  PROCESSANDO: "bg-orange-100 text-orange-800",
  AUTHORIZED: "bg-green-100 text-green-800",
  AUTORIZADA: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  REJEITADA: "bg-red-100 text-red-800",
  CANCELED: "bg-gray-100 text-gray-800",
  DENEGADA: "bg-red-100 text-red-800",
  INUTILIZADA: "bg-yellow-100 text-yellow-800",
}

export const formatChaveAcesso = (chave: string): string => {
  if (!chave || chave.length !== 44) return chave
  return chave.match(/.{1,4}/g)?.join(" ") || chave
}

export const getFileUrl = (path?: string): string | null => {
  if (!path) return null
  const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://back.otimizeagenda.com'
  // Se já for uma URL completa, retorna como está
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  // Se começar com /, concatena direto
  if (path.startsWith('/')) {
    return `${baseURL}${path}`
  }
  // Senão, adiciona / antes
  return `${baseURL}/${path}`
}
