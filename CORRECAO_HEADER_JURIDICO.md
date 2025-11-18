# Correção: Header x-company-id no Módulo Jurídico

## 🔧 Problema Identificado

Todas as funções do módulo jurídico estavam retornando erro **403 Forbidden** com a mensagem:
```
Empresa não especificada no cabeçalho x-company-id
```

## ✅ Solução Implementada

Adicionado o header `x-company-id` em todas as requisições dos arquivos:
- `lib/api/legal-categories.ts`
- `lib/api/legal-documents.ts`

### Mudanças Realizadas

#### 1. Adicionado Import
```typescript
import { authApi } from './auth'
```

#### 2. Criado Helper `getCompanyId()`
```typescript
const getCompanyId = () => {
  const company = authApi.getSelectedCompany()
  if (!company?.id) {
    throw new Error('Nenhuma empresa selecionada')
  }
  return company.id
}
```

#### 3. Atualizado Todas as Funções

**Exemplo - legal-categories.ts:**
```typescript
export async function listLegalCategories(): Promise<LegalCategory[]> {
  try {
    const companyId = getCompanyId()
    const response = await apiClient.get<LegalCategory[]>('/legal/categories', {
      headers: {
        'x-company-id': companyId,
      },
    })
    return response.data
  } catch (error) {
    console.error('Erro ao listar categorias jurídicas:', error)
    throw error
  }
}
```

### Funções Atualizadas

#### legal-categories.ts (5 funções)
- ✅ `listLegalCategories()`
- ✅ `getLegalCategoryById(id)`
- ✅ `createLegalCategory(data)`
- ✅ `updateLegalCategory(id, data)`
- ✅ `deleteLegalCategory(id)`

#### legal-documents.ts (8 funções)
- ✅ `createLegalDocument(data)` - com FormData
- ✅ `listLegalDocuments(params)`
- ✅ `getLegalDocumentById(id)`
- ✅ `updateLegalDocument(id, data)`
- ✅ `deleteLegalDocument(id)`
- ✅ `getLegalDocumentDownload(id)`
- ✅ `getLegalDocumentStatistics()`
- ✅ `downloadLegalDocument(documentId)`

## 📝 Padrão Seguido

O padrão implementado segue o mesmo utilizado em outros módulos do sistema, como `cost-centers.ts`, garantindo consistência na autenticação e autorização de todas as requisições.

## 🎯 Resultado

Agora todas as requisições do módulo jurídico:
1. ✅ Validam se há uma empresa selecionada
2. ✅ Incluem automaticamente o header `x-company-id`
3. ✅ Funcionam corretamente sem erros 403
4. ✅ Respeitam o contexto multi-empresa do sistema

## 📚 Documentação Atualizada

O arquivo `MODULO_JURIDICO_API.md` foi atualizado com informações sobre a autenticação obrigatória e o uso do header `x-company-id`.
