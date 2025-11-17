import { Customer, CustomerAddress } from '@/lib/api/customers'
import type { CompanyAdmin } from '@/lib/api/auth'

export interface Product {
  id: string
  name: string
  sku?: string
  barcode?: string
  ncm?: string
  cest?: string
  origin?: string
  cfopEstadual?: string
  cfopInterestadual?: string
  icmsCst?: string
  pisCst?: string
  cofinsCst?: string
  tipoProduto?: 'PRODUTO' | 'SERVICO'
  codigoServico?: string
  itemListaServico?: string
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Valida se um cliente possui todos os dados necessários para emissão de NF-e
 */
export function validateCustomerForNFe(customer: Customer): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Validar documento
  if (customer.personType === 'FISICA') {
    if (!customer.cpf) {
      errors.push('CPF é obrigatório para emissão de NF-e')
    }
    if (!customer.name) {
      errors.push('Nome completo é obrigatório para emissão de NF-e')
    }
  } else {
    if (!customer.cnpj) {
      errors.push('CNPJ é obrigatório para emissão de NF-e')
    }
    if (!customer.companyName) {
      errors.push('Razão Social é obrigatória para emissão de NF-e')
    }
    if (!customer.stateRegistration && !customer.stateRegistrationExempt) {
      warnings.push(
        'Inscrição Estadual não informada. Marque como isento se aplicável para correto cálculo do ICMS.'
      )
    }
  }

  // Validar endereço
  const defaultAddress = customer.addresses?.find((a) => a.isDefault)
  if (!defaultAddress) {
    errors.push('Cliente deve ter um endereço padrão cadastrado')
  } else {
    const addressErrors = validateAddressForNFe(defaultAddress)
    errors.push(...addressErrors.errors)
    warnings.push(...addressErrors.warnings)
  }

  // Validar contato
  if (!customer.email && !customer.phone && !customer.mobile) {
    warnings.push(
      'Nenhum contato informado (email ou telefone). Recomendado para envio do DANFE.'
    )
  }

  if (!customer.email) {
    warnings.push(
      'Email não informado. O DANFE será gerado mas não poderá ser enviado automaticamente.'
    )
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Valida se um endereço possui todos os dados necessários para emissão de NF-e
 */
export function validateAddressForNFe(
  address: CustomerAddress
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!address.zipCode) {
    errors.push('CEP é obrigatório para emissão de NF-e')
  }

  if (!address.street) {
    errors.push('Logradouro é obrigatório para emissão de NF-e')
  }

  if (!address.number) {
    errors.push('Número é obrigatório para emissão de NF-e')
  }

  if (!address.neighborhood) {
    errors.push('Bairro é obrigatório para emissão de NF-e')
  }

  if (!address.city) {
    errors.push('Cidade é obrigatória para emissão de NF-e')
  }

  if (!address.state) {
    errors.push('UF é obrigatório para emissão de NF-e')
  }

  if (!address.ibgeCode) {
    warnings.push(
      'Código IBGE do município não informado. Será necessário para autorização da NF-e na SEFAZ.'
    )
  } else {
    // Validar formato do código IBGE (7 dígitos)
    if (!/^\d{7}$/.test(address.ibgeCode)) {
      errors.push('Código IBGE deve conter exatamente 7 dígitos numéricos')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Valida CPF (formato básico)
 */
export function validateCPF(cpf: string): boolean {
  if (!cpf) return false
  
  // Remove caracteres não numéricos
  const cleanCpf = cpf.replace(/\D/g, '')
  
  // Verifica se tem 11 dígitos
  if (cleanCpf.length !== 11) return false
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false
  
  return true
}

/**
 * Valida CNPJ (formato básico)
 */
export function validateCNPJ(cnpj: string): boolean {
  if (!cnpj) return false
  
  // Remove caracteres não numéricos
  const cleanCnpj = cnpj.replace(/\D/g, '')
  
  // Verifica se tem 14 dígitos
  if (cleanCnpj.length !== 14) return false
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleanCnpj)) return false
  
  return true
}

/**
 * Valida CEP (formato básico)
 */
export function validateCEP(cep: string): boolean {
  if (!cep) return false
  
  // Remove caracteres não numéricos
  const cleanCep = cep.replace(/\D/g, '')
  
  // Verifica se tem 8 dígitos
  return cleanCep.length === 8
}

/**
 * Valida Email
 */
export function validateEmail(email: string): boolean {
  if (!email) return false
  
  // Regex básico para validação de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Formata CPF
 */
export function formatCPF(cpf: string): string {
  const cleanCpf = cpf.replace(/\D/g, '')
  return cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

/**
 * Formata CNPJ
 */
export function formatCNPJ(cnpj: string): string {
  const cleanCnpj = cnpj.replace(/\D/g, '')
  return cleanCnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

/**
 * Formata CEP
 */
export function formatCEP(cep: string): string {
  const cleanCep = cep.replace(/\D/g, '')
  return cleanCep.replace(/(\d{5})(\d{3})/, '$1-$2')
}

/**
 * Determina o indicador de IE do destinatário
 * 1 - Contribuinte ICMS
 * 2 - Contribuinte isento de Inscrição no cadastro de Contribuintes
 * 9 - Não Contribuinte
 */
export function getIndIEDest(customer: Customer): 1 | 2 | 9 {
  if (customer.personType === 'FISICA') {
    return 9 // Pessoa física é não contribuinte
  }

  if (customer.stateRegistrationExempt) {
    return 2 // Isento
  }

  if (customer.stateRegistration) {
    return 1 // Contribuinte
  }

  return 9 // Não contribuinte (sem IE)
}

/**
 * Valida se um produto possui todos os dados necessários para emissão de NF-e
 */
export function validateProductForNFe(product: Product): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Validar tipo de produto
  if (product.tipoProduto === 'SERVICO') {
    // Validações específicas para serviços (NFS-e)
    if (!product.codigoServico) {
      warnings.push('Código de serviço não informado (necessário para NFS-e)')
    }
    if (!product.itemListaServico) {
      warnings.push('Item da lista de serviços não informado (necessário para NFS-e)')
    }
    // Serviços não precisam de NCM, CFOP, etc
    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  // Validações para produtos (NF-e)

  // NCM é obrigatório
  if (!product.ncm) {
    errors.push('NCM é obrigatório para emissão de NF-e')
  } else if (product.ncm.replace(/\D/g, '').length !== 8) {
    errors.push('NCM deve ter exatamente 8 dígitos')
  }

  // CFOP Estadual é obrigatório
  if (!product.cfopEstadual) {
    errors.push('CFOP Estadual é obrigatório para emissão de NF-e')
  } else if (product.cfopEstadual.replace(/\D/g, '').length !== 4) {
    errors.push('CFOP Estadual deve ter exatamente 4 dígitos')
  }

  // Código de barras (EAN/GTIN) não é obrigatório mas é recomendado
  if (!product.barcode) {
    warnings.push(
      'Código de barras (EAN/GTIN) não informado. Será enviado como "SEM GTIN" na NF-e.'
    )
  }

  // Origem da mercadoria é obrigatório
  if (!product.origin) {
    errors.push('Origem da mercadoria não informada')
  } else {
    const validOrigins = ['0', '1', '2', '3', '4', '5', '6', '7', '8']
    if (!validOrigins.includes(product.origin)) {
      errors.push(
        'Origem da mercadoria inválida. Deve ser: 0-Nacional, 1-Estrangeira (importação direta), 2-Estrangeira (adquirida no mercado interno), 3-Nacional (>40% conteúdo importado), 4-Nacional (processos básicos), 5-Nacional (<40% conteúdo importado), 6-Estrangeira (sem similar nacional), 7-Estrangeira (importação direta sem similar), 8-Nacional (>70% conteúdo importado)'
      )
    }
  }

  // CST/CSOSN do ICMS é obrigatório
  if (!product.icmsCst) {
    errors.push('CST/CSOSN do ICMS não informado')
  }

  // CST do PIS não é obrigatório mas é altamente recomendado
  if (!product.pisCst) {
    warnings.push(
      'CST do PIS não informado. Recomendado para correto cálculo de tributos.'
    )
  }

  // CST do COFINS não é obrigatório mas é altamente recomendado
  if (!product.cofinsCst) {
    warnings.push(
      'CST do COFINS não informado. Recomendado para correto cálculo de tributos.'
    )
  }

  // Se tiver Substituição Tributária, CEST é recomendado
  if (product.icmsCst) {
    const stCsts = ['10', '30', '60', '70', '201', '202', '203', '500']
    if (stCsts.includes(product.icmsCst) && !product.cest) {
      warnings.push(
        'CEST é obrigatório para produtos com Substituição Tributária (ST). Algumas SEFAZ podem rejeitar a NF-e sem CEST.'
      )
    }
  }

  // CFOP Interestadual é recomendado
  if (!product.cfopInterestadual) {
    warnings.push(
      'CFOP Interestadual não informado. Será usado o CFOP Estadual em operações interestaduais.'
    )
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Valida NCM (formato básico)
 */
export function validateNCM(ncm: string): boolean {
  if (!ncm) return false
  const cleanNcm = ncm.replace(/\D/g, '')
  return cleanNcm.length === 8
}

/**
 * Valida CFOP (formato básico)
 */
export function validateCFOP(cfop: string): boolean {
  if (!cfop) return false
  const cleanCfop = cfop.replace(/\D/g, '')
  return cleanCfop.length === 4
}

/**
 * Valida CEST (formato básico)
 */
export function validateCEST(cest: string): boolean {
  if (!cest) return false
  const cleanCest = cest.replace(/\D/g, '')
  return cleanCest.length === 7
}

/**
 * Formata NCM
 */
export function formatNCM(ncm: string): string {
  const cleanNcm = ncm.replace(/\D/g, '')
  return cleanNcm.replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3')
}

/**
 * Formata CFOP
 */
export function formatCFOP(cfop: string): string {
  const cleanCfop = cfop.replace(/\D/g, '')
  return cleanCfop.replace(/(\d{1})(\d{3})/, '$1.$2')
}

/**
 * Formata CEST
 */
export function formatCEST(cest: string): string {
  const cleanCest = cest.replace(/\D/g, '')
  return cleanCest.replace(/(\d{2})(\d{3})(\d{2})/, '$1.$2.$3')
}

/**
 * Retorna descrição da origem da mercadoria
 */
export function getOriginDescription(origin: string): string {
  const origins: { [key: string]: string } = {
    '0': '0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8',
    '1': '1 - Estrangeira - Importação direta, exceto a indicada no código 6',
    '2': '2 - Estrangeira - Adquirida no mercado interno, exceto a indicada no código 7',
    '3': '3 - Nacional, mercadoria ou bem com Conteúdo de Importação superior a 40% e inferior ou igual a 70%',
    '4': '4 - Nacional, cuja produção tenha sido feita em conformidade com os processos produtivos básicos',
    '5': '5 - Nacional, mercadoria ou bem com Conteúdo de Importação inferior ou igual a 40%',
    '6': '6 - Estrangeira - Importação direta, sem similar nacional, constante em lista CAMEX',
    '7': '7 - Estrangeira - Adquirida no mercado interno, sem similar nacional, constante em lista CAMEX',
    '8': '8 - Nacional, mercadoria ou bem com Conteúdo de Importação superior a 70%',
  }
  return origins[origin] || 'Origem inválida'
}

/**
 * Valida se uma empresa possui todos os dados necessários para emissão de NF-e
 */
export function validateCompanyForNFe(company: CompanyAdmin): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // 1. Dados Cadastrais Básicos (OBRIGATÓRIOS)
  if (!company.razaoSocial || company.razaoSocial.length < 3) {
    errors.push('Razão Social é obrigatória (mínimo 3 caracteres)')
  } else if (company.razaoSocial.length > 60) {
    errors.push('Razão Social deve ter no máximo 60 caracteres')
  }

  if (!company.cnpj) {
    errors.push('CNPJ é obrigatório')
  } else if (!validateCNPJ(company.cnpj)) {
    errors.push('CNPJ inválido')
  }

  if (!company.inscricaoEstadual) {
    errors.push('Inscrição Estadual é obrigatória (ou informar "ISENTO")')
  }

  // 2. Endereço Completo (OBRIGATÓRIO)
  if (!company.logradouro) {
    errors.push('Logradouro é obrigatório')
  } else if (company.logradouro.length > 60) {
    errors.push('Logradouro deve ter no máximo 60 caracteres')
  }

  if (!company.numero) {
    errors.push('Número do endereço é obrigatório')
  }

  if (!company.bairro) {
    errors.push('Bairro é obrigatório')
  } else if (company.bairro.length > 60) {
    errors.push('Bairro deve ter no máximo 60 caracteres')
  }

  if (!company.cidade) {
    errors.push('Cidade é obrigatória')
  } else if (company.cidade.length > 60) {
    errors.push('Cidade deve ter no máximo 60 caracteres')
  }

  if (!company.estado) {
    errors.push('Estado (UF) é obrigatório')
  } else if (!VALID_UFS.includes(company.estado)) {
    errors.push('Estado (UF) inválido')
  }

  if (!company.cep) {
    errors.push('CEP é obrigatório')
  } else if (!validateCEP(company.cep)) {
    errors.push('CEP inválido (deve ter 8 dígitos)')
  }

  if (!company.codigoMunicipioIBGE) {
    errors.push('Código IBGE do município é obrigatório')
  } else if (!/^\d{7}$/.test(company.codigoMunicipioIBGE)) {
    errors.push('Código IBGE deve ter exatamente 7 dígitos')
  }

  // 3. Regime Tributário (OBRIGATÓRIO)
  if (!company.regimeTributario) {
    errors.push('Regime Tributário é obrigatório')
  } else {
    const validRegimes = ['SIMPLES_NACIONAL', 'SIMPLES_NACIONAL_EXCESSO', 'REGIME_NORMAL']
    if (!validRegimes.includes(company.regimeTributario)) {
      errors.push('Regime Tributário inválido')
    }
  }

  // 4. Certificado Digital
  if (company.ambienteFiscal === 'PRODUCAO') {
    if (!company.certificadoDigitalPath) {
      errors.push('Certificado Digital é obrigatório para ambiente de produção')
    }
    if (!company.certificadoDigitalSenha) {
      errors.push('Senha do Certificado Digital é obrigatória')
    }
    if (company.certificadoDigitalVencimento) {
      const vencimento = new Date(company.certificadoDigitalVencimento)
      const hoje = new Date()
      if (vencimento < hoje) {
        errors.push('Certificado Digital está vencido')
      } else if ((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24) < 30) {
        warnings.push('Certificado Digital vence em menos de 30 dias')
      }
    }
  }

  // 5. Ambiente Fiscal (OBRIGATÓRIO)
  if (!company.ambienteFiscal) {
    errors.push('Ambiente Fiscal é obrigatório (Homologação ou Produção)')
  } else {
    const validAmbientes = ['HOMOLOGACAO', 'PRODUCAO']
    if (!validAmbientes.includes(company.ambienteFiscal)) {
      errors.push('Ambiente Fiscal inválido')
    }
  }

  // 6. Série da NFe (OBRIGATÓRIO)
  if (!company.serieNFe) {
    errors.push('Série da NF-e é obrigatória')
  } else {
    const serie = parseInt(company.serieNFe)
    if (isNaN(serie) || serie < 1 || serie > 999) {
      errors.push('Série da NF-e deve ser um número entre 1 e 999')
    }
  }

  // 7. CNAE Principal (OBRIGATÓRIO)
  if (!company.cnaePrincipal) {
    errors.push('CNAE Principal é obrigatório')
  } else if (!/^\d{7}$/.test(company.cnaePrincipal.replace(/\D/g, ''))) {
    errors.push('CNAE deve ter 7 dígitos')
  }

  // 8. Responsável Técnico (OBRIGATÓRIO a partir de 2024)
  if (!company.respTecCNPJ) {
    warnings.push(
      'Responsável Técnico (CNPJ) não informado. Obrigatório a partir de 01/04/2024.'
    )
  } else if (!validateCNPJ(company.respTecCNPJ)) {
    warnings.push('CNPJ do Responsável Técnico inválido')
  }

  if (!company.respTecContato) {
    warnings.push('Nome do Responsável Técnico não informado')
  } else if (company.respTecContato.length < 3 || company.respTecContato.length > 60) {
    warnings.push('Nome do Responsável Técnico deve ter entre 3 e 60 caracteres')
  }

  if (!company.respTecEmail) {
    warnings.push('Email do Responsável Técnico não informado')
  } else if (!validateEmail(company.respTecEmail)) {
    warnings.push('Email do Responsável Técnico inválido')
  }

  if (!company.respTecFone) {
    warnings.push('Telefone do Responsável Técnico não informado')
  } else if (!/^\d{10,11}$/.test(company.respTecFone.replace(/\D/g, ''))) {
    warnings.push('Telefone do Responsável Técnico deve ter 10 ou 11 dígitos')
  }

  // 9. Contatos (RECOMENDADOS)
  if (!company.email) {
    warnings.push(
      'Email da empresa não informado. Recomendado para comunicações fiscais.'
    )
  } else if (!validateEmail(company.email)) {
    warnings.push('Email da empresa inválido')
  }

  if (!company.telefone && !company.celular) {
    warnings.push('Nenhum telefone informado. Recomendado ter pelo menos um contato.')
  }

  // 10. CFOP Padrão (RECOMENDADO)
  if (!company.cfopPadrao) {
    warnings.push(
      'CFOP Padrão não informado. Será necessário informar em cada produto/venda.'
    )
  } else if (!validateCFOP(company.cfopPadrao)) {
    warnings.push('CFOP Padrão inválido (deve ter 4 dígitos)')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Lista de UFs válidas
 */
export const VALID_UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

/**
 * Valida CNAE (formato básico)
 */
export function validateCNAE(cnae: string): boolean {
  if (!cnae) return false
  const cleanCnae = cnae.replace(/\D/g, '')
  return cleanCnae.length === 7
}

/**
 * Formata CNAE
 */
export function formatCNAE(cnae: string): string {
  const cleanCnae = cnae.replace(/\D/g, '')
  return cleanCnae.replace(/(\d{4})(\d{1})(\d{2})/, '$1-$2/$3')
}

/**
 * Verifica se a empresa pode usar ambiente de produção
 */
export function canUseProduction(company: CompanyAdmin): boolean {
  return !!(
    company.certificadoDigitalPath &&
    company.certificadoDigitalSenha &&
    company.inscricaoEstadual
  )
}
