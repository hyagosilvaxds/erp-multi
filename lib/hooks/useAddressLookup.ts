import { useState } from 'react'

export interface ViaCEPResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
  erro?: boolean
}

export interface IBGEMunicipality {
  id: number
  nome: string
  microrregiao: {
    id: number
    nome: string
    mesorregiao: {
      id: number
      nome: string
      UF: {
        id: number
        sigla: string
        nome: string
        regiao: {
          id: number
          sigla: string
          nome: string
        }
      }
    }
  }
  'regiao-imediata': {
    id: number
    nome: string
    'regiao-intermediaria': {
      id: number
      nome: string
      UF: {
        id: number
        sigla: string
        nome: string
        regiao: {
          id: number
          sigla: string
          nome: string
        }
      }
    }
  }
}

export function useAddressLookup() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Busca endereço pelo CEP usando ViaCEP
   */
  const fetchAddressByCEP = async (cep: string): Promise<ViaCEPResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const cleanCep = cep.replace(/\D/g, '')

      if (cleanCep.length !== 8) {
        throw new Error('CEP deve conter 8 dígitos')
      }

      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`
      )

      if (!response.ok) {
        throw new Error('Erro ao buscar CEP')
      }

      const data: ViaCEPResponse = await response.json()

      if (data.erro) {
        throw new Error('CEP não encontrado')
      }

      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar CEP'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Busca código IBGE do município
   */
  const fetchIBGECode = async (
    city: string,
    state: string
  ): Promise<string | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios`
      )

      if (!response.ok) {
        throw new Error('Erro ao buscar código IBGE')
      }

      const municipalities: IBGEMunicipality[] = await response.json()

      const found = municipalities.find(
        (m) => m.nome.toLowerCase() === city.toLowerCase()
      )

      if (!found) {
        throw new Error(`Município ${city} não encontrado no estado ${state}`)
      }

      return found.id.toString()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao buscar código IBGE'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Busca endereço completo incluindo código IBGE
   */
  const fetchCompleteAddress = async (cep: string) => {
    const addressData = await fetchAddressByCEP(cep)

    if (!addressData) {
      return null
    }

    // O ViaCEP já retorna o código IBGE no campo 'ibge'
    return {
      zipCode: addressData.cep,
      street: addressData.logradouro,
      neighborhood: addressData.bairro,
      city: addressData.localidade,
      state: addressData.uf,
      ibgeCode: addressData.ibge,
    }
  }

  return {
    loading,
    error,
    fetchAddressByCEP,
    fetchIBGECode,
    fetchCompleteAddress,
  }
}
