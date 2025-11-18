import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

// Criar instância do axios
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://back.otimizeagenda.com',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar o token em todas as requisições
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratar erros de resposta
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('companies')
        
        // Remover token do cookie
        document.cookie = 'token=; path=/; max-age=0; SameSite=Lax'
        
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)
