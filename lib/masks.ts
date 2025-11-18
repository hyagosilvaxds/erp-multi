/**
 * Funções de máscara e validação para campos de formulário
 */

// ==========================================
// MÁSCARAS DE FORMATAÇÃO
// ==========================================

/**
 * Aplica máscara de CPF (000.000.000-00)
 */
export const maskCPF = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1')
}

/**
 * Aplica máscara de CNPJ (00.000.000/0000-00)
 */
export const maskCNPJ = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1')
}

/**
 * Aplica máscara de CEP (00000-000)
 */
export const maskCEP = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1')
}

/**
 * Aplica máscara de Telefone (00) 0000-0000 ou (00) 00000-0000
 */
export const maskPhone = (value: string): string => {
  value = value.replace(/\D/g, '')
  
  if (value.length <= 10) {
    // Telefone fixo: (00) 0000-0000
    return value
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1')
  } else {
    // Celular: (00) 00000-0000
    return value
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1')
  }
}

/**
 * Aplica máscara de CNAE (0000-0/00)
 */
export const maskCNAE = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .replace(/(\d{1})(\d)/, '$1/$2')
    .replace(/(\/\d{2})\d+?$/, '$1')
}

/**
 * Formata valor numérico para moeda brasileira (R$ 0.000,00)
 */
export const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(numValue)) return 'R$ 0,00'
  
  return numValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

/**
 * Aplica máscara de moeda em um input (R$ 0.000,00)
 */
export const maskCurrency = (value: string): string => {
  // Remove tudo que não é dígito
  let numValue = value.replace(/\D/g, '')
  
  // Converte para centavos
  numValue = (parseInt(numValue) / 100).toFixed(2)
  
  // Formata
  return formatCurrency(numValue)
}

// ==========================================
// REMOÇÃO DE MÁSCARAS
// ==========================================

/**
 * Remove todos os caracteres não numéricos
 */
export const removeMask = (value: string): string => {
  return value.replace(/\D/g, '')
}

// ==========================================
// VALIDAÇÕES
// ==========================================

/**
 * Valida CPF
 */
export const validateCPF = (cpf: string): boolean => {
  cpf = removeMask(cpf)
  
  if (cpf.length !== 11) return false
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cpf)) return false
  
  // Validação do primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i)
  }
  let digit = 11 - (sum % 11)
  if (digit > 9) digit = 0
  if (digit !== parseInt(cpf.charAt(9))) return false
  
  // Validação do segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i)
  }
  digit = 11 - (sum % 11)
  if (digit > 9) digit = 0
  if (digit !== parseInt(cpf.charAt(10))) return false
  
  return true
}

/**
 * Valida CNPJ
 */
export const validateCNPJ = (cnpj: string): boolean => {
  cnpj = removeMask(cnpj)
  
  if (cnpj.length !== 14) return false
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cnpj)) return false
  
  // Validação do primeiro dígito verificador
  let length = cnpj.length - 2
  let numbers = cnpj.substring(0, length)
  const digits = cnpj.substring(length)
  let sum = 0
  let pos = length - 7
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--
    if (pos < 2) pos = 9
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(0))) return false
  
  // Validação do segundo dígito verificador
  length = length + 1
  numbers = cnpj.substring(0, length)
  sum = 0
  pos = length - 7
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--
    if (pos < 2) pos = 9
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(1))) return false
  
  return true
}

/**
 * Valida CEP
 */
export const validateCEP = (cep: string): boolean => {
  cep = removeMask(cep)
  return cep.length === 8
}

/**
 * Valida Telefone
 */
export const validatePhone = (phone: string): boolean => {
  phone = removeMask(phone)
  // Telefone fixo: 10 dígitos, Celular: 11 dígitos
  return phone.length === 10 || phone.length === 11
}

/**
 * Valida Email
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// ==========================================
// UTILITÁRIOS
// ==========================================

/**
 * Busca CEP na API ViaCEP
 */
export interface ViaCEPResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  ibge: string // Código IBGE do município
  erro?: boolean
}

export const searchCEP = async (cep: string): Promise<ViaCEPResponse | null> => {
  const cleanCEP = removeMask(cep)
  
  if (cleanCEP.length !== 8) return null
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
    const data = await response.json()
    
    if (data.erro) return null
    
    return data
  } catch (error) {
    console.error('Erro ao buscar CEP:', error)
    return null
  }
}
