import { formatApiError } from './format-error'

// Teste do formatador de erros
console.log('🧪 Testando formatApiError...\n')

// Teste 1: Array de mensagens (caso da API)
const error1 = {
  response: {
    data: {
      message: [
        "Data de abertura deve ser uma data válida",
        "CEP deve conter 8 dígitos"
      ],
      error: "Bad Request",
      statusCode: 400
    }
  }
}

console.log('Teste 1: Array de mensagens')
const result1 = formatApiError(error1)
console.log('Resultado:', result1)
console.log('Esperado:', {
  title: "Bad Request",
  description: "• Data de abertura deve ser uma data válida\n• CEP deve conter 8 dígitos"
})
console.log('✅ Passou?\n')

// Teste 2: Mensagem única
const error2 = {
  response: {
    data: {
      message: "Empresa não encontrada",
      error: "Not Found",
      statusCode: 404
    }
  }
}

console.log('Teste 2: Mensagem única')
const result2 = formatApiError(error2)
console.log('Resultado:', result2)
console.log('Esperado:', {
  title: "Not Found",
  description: "Empresa não encontrada"
})
console.log('✅ Passou?\n')

// Teste 3: Erro genérico
const error3 = {
  message: "Erro de rede"
}

console.log('Teste 3: Erro genérico')
const result3 = formatApiError(error3)
console.log('Resultado:', result3)
console.log('Esperado:', {
  title: "Erro",
  description: "Erro de rede"
})
console.log('✅ Passou?\n')
