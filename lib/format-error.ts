/**
 * Formata erros da API para exibição em toast
 * Suporta diferentes formatos de erro retornados pela API
 */
export function formatApiError(error: any): { title: string; description: string } {
  // Se o erro tem uma estrutura de resposta do axios
  if (error.response?.data) {
    const errorData = error.response.data
    
    // Caso 1: Array de mensagens - {"message":["CEP deve conter 8 dígitos"],"error":"Bad Request","statusCode":400}
    if (Array.isArray(errorData.message)) {
      const description = errorData.message.length === 1 
        ? errorData.message[0]
        : errorData.message.map((msg: string) => `• ${msg}`).join('\n')
      
      return {
        title: errorData.error || "Erro de validação",
        description
      }
    }
    
    // Caso 2: String única - {"message":"Empresa não encontrada","error":"Not Found","statusCode":404}
    if (typeof errorData.message === 'string') {
      return {
        title: errorData.error || "Erro",
        description: errorData.message
      }
    }
    
    // Caso 3: Objeto com error e message
    if (errorData.error && errorData.message) {
      return {
        title: errorData.error,
        description: typeof errorData.message === 'string' 
          ? errorData.message 
          : JSON.stringify(errorData.message)
      }
    }
  }
  
  // Caso 4: Erro com mensagem direta (do nosso wrapper na API)
  if (error.message) {
    return {
      title: "Erro",
      description: error.message
    }
  }
  
  // Caso 5: Erro desconhecido
  return {
    title: "Erro",
    description: "Ocorreu um erro inesperado. Tente novamente."
  }
}

/**
 * Formata erros de validação em uma lista
 */
export function formatValidationErrors(errors: string[]): string {
  if (errors.length === 1) {
    return errors[0]
  }
  
  return `• ${errors.join('\n• ')}`
}
