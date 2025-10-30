# API de Empresas Admin

## 📋 Visão Geral

Endpoint exclusivo para administradores listarem todas as empresas cadastradas no sistema.

## 🔒 Permissões Necessárias

- **`companies.read`** - Obrigatória
- **Role admin** - Apenas usuários com role admin têm acesso

## 🔗 Endpoint

```
GET /companies/admin/all
```

### Headers Obrigatórios

```
Authorization: Bearer {token}
x-company-id: {companyId}
```

> ⚠️ **Nota**: Apesar de ser um endpoint de listagem geral, o header `x-company-id` é necessário para validar que o usuário possui a permissão `companies.read` em alguma empresa.

## 📦 Resposta de Sucesso

**Status:** `200 OK`

```json
[
  {
    "id": "cm2r8g9h40000vy9x1a2b3c4d",
    "razaoSocial": "Empresa Alpha Comércio Ltda",
    "nomeFantasia": "Empresa Alpha",
    "cnpj": "11222333000144",
    "inscricaoEstadual": "123456789",
    "inscricaoMunicipal": "987654",
    "regimeTributario": "Simples Nacional",
    "email": "contato@alpha.com.br",
    "telefone": "(11) 3000-1000",
    "celular": "(11) 99000-1000",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "01310-100",
    "active": true,
    "situacaoCadastral": "Ativa",
    "logoUrl": null,
    "createdAt": "2025-10-25T10:30:00.000Z",
    "updatedAt": "2025-10-25T10:30:00.000Z",
    "_count": {
      "users": 3
    }
  }
]
```

## 📊 Estrutura de Dados

### CompanyAdmin

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | ID único da empresa |
| `razaoSocial` | string | Razão social da empresa |
| `nomeFantasia` | string | Nome fantasia da empresa |
| `cnpj` | string | CNPJ da empresa |
| `inscricaoEstadual` | string \| null | Inscrição estadual |
| `inscricaoMunicipal` | string \| null | Inscrição municipal |
| `regimeTributario` | string \| null | Regime tributário (Simples Nacional, Lucro Presumido, Lucro Real) |
| `email` | string \| null | E-mail de contato |
| `telefone` | string \| null | Telefone fixo |
| `celular` | string \| null | Celular/WhatsApp |
| `cidade` | string \| null | Cidade |
| `estado` | string \| null | Estado (UF) |
| `cep` | string \| null | CEP |
| `active` | boolean | Se a empresa está ativa |
| `situacaoCadastral` | string | Situação cadastral (Ativa, Inativa, Suspensa) |
| `logoUrl` | string \| null | URL da logo |
| `createdAt` | string | Data de criação no sistema (ISO 8601) |
| `updatedAt` | string | Data da última atualização (ISO 8601) |
| `_count.users` | number | Quantidade de usuários vinculados |

## 💻 Uso no Código

### TypeScript Type

```typescript
interface CompanyAdmin {
  id: string
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
  inscricaoEstadual: string | null
  inscricaoMunicipal: string | null
  regimeTributario: string | null
  email: string | null
  telefone: string | null
  celular: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  active: boolean
  situacaoCadastral: string
  logoUrl: string | null
  createdAt: string
  updatedAt: string
  _count: {
    users: number
  }
}
```

### Chamada da API

```typescript
import { companiesApi } from '@/lib/api/auth'

// Buscar todas as empresas
try {
  const companies = await companiesApi.getAllCompanies()
  console.log('Total de empresas:', companies.length)
} catch (error) {
  console.error('Erro:', error)
}
```

### Exemplo Completo React

```tsx
'use client'

import { useState, useEffect } from 'react'
import { companiesApi, type CompanyAdmin } from '@/lib/api/auth'

function CompaniesAdminList() {
  const [companies, setCompanies] = useState<CompanyAdmin[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      const data = await companiesApi.getAllCompanies()
      setCompanies(data)
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Carregando...</div>

  return (
    <div>
      <h2>Total de empresas: {companies.length}</h2>
      <ul>
        {companies.map((company) => (
          <li key={company.id}>
            <strong>{company.nomeFantasia}</strong>
            <p>CNPJ: {company.cnpj}</p>
            <p>Usuários: {company._count.users}</p>
            <p>Status: {company.situacaoCadastral}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## 🔍 Exemplos de Uso

### 1. Filtrar Empresas Ativas

```typescript
const activeCompanies = companies.filter(c => c.active)
console.log(`${activeCompanies.length} empresas ativas`)
```

### 2. Agrupar por Estado

```typescript
const byState = companies.reduce((acc, company) => {
  const state = company.estado || 'Sem estado'
  if (!acc[state]) acc[state] = []
  acc[state].push(company)
  return acc
}, {} as Record<string, CompanyAdmin[]>)

console.log('Empresas em SP:', byState['SP']?.length || 0)
```

### 3. Contar Total de Usuários

```typescript
const totalUsers = companies.reduce(
  (sum, company) => sum + company._count.users,
  0
)
console.log('Total de usuários:', totalUsers)
```

### 4. Buscar por CNPJ

```typescript
function findByCNPJ(cnpj: string): CompanyAdmin | undefined {
  return companies.find(c => c.cnpj === cnpj)
}

const company = findByCNPJ('11222333000144')
```

### 5. Empresas por Regime Tributário

```typescript
const byRegime = companies.reduce((acc, company) => {
  const regime = company.regimeTributario || 'Não informado'
  acc[regime] = (acc[regime] || 0) + 1
  return acc
}, {} as Record<string, number>)

console.log('Simples Nacional:', byRegime['Simples Nacional'] || 0)
console.log('Lucro Presumido:', byRegime['Lucro Presumido'] || 0)
console.log('Lucro Real:', byRegime['Lucro Real'] || 0)
```

### 6. Ordenar por Data de Cadastro

```typescript
const sortedByDate = [...companies].sort(
  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
)

console.log('Empresa mais recente:', sortedByDate[0].nomeFantasia)
```

## 🚨 Tratamento de Erros

### Erro 401 - Não Autorizado

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Causa**: Token inválido ou expirado  
**Ação**: Redirecionar para login

### Erro 403 - Forbidden

```json
{
  "statusCode": 403,
  "message": "Acesso negado. Apenas administradores podem acessar este recurso."
}
```

**Causa**: Usuário não é admin ou não tem permissão `companies.read`  
**Ação**: Mostrar mensagem de erro

### Erro 400 - Bad Request

```json
{
  "statusCode": 400,
  "message": "x-company-id header é obrigatório"
}
```

**Causa**: Header `x-company-id` não foi enviado  
**Ação**: Verificar se empresa está selecionada

### Exemplo de Tratamento

```typescript
try {
  const companies = await companiesApi.getAllCompanies()
  return companies
} catch (error: any) {
  if (error.message.includes('401')) {
    // Token inválido
    authApi.logout()
  } else if (error.message.includes('403')) {
    // Sem permissão
    toast.error('Você não tem permissão para acessar este recurso')
  } else if (error.message.includes('x-company-id')) {
    // Empresa não selecionada
    toast.error('Selecione uma empresa primeiro')
    router.push('/selecionar-empresa')
  } else {
    // Erro genérico
    toast.error('Erro ao carregar empresas')
  }
}
```

## 🧪 Testando

### Via cURL

```bash
curl -X GET http://localhost:4000/companies/admin/all \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "x-company-id: ID_DA_EMPRESA_SELECIONADA"
```

### Via Postman

```
GET http://localhost:4000/companies/admin/all

Headers:
  Authorization: Bearer SEU_TOKEN
  x-company-id: ID_DA_EMPRESA_SELECIONADA
```

### Via Código

```typescript
// Console do navegador (após login e seleção de empresa)
const companies = await companiesApi.getAllCompanies()
console.table(companies)
```

## 📝 Notas Importantes

1. ✅ Requer autenticação (token JWT)
2. ✅ Requer permissão `companies.read`
3. ✅ Requer role `admin`
4. ✅ Requer header `x-company-id`
5. ✅ Retorna todas as empresas do sistema (não apenas as do usuário)
6. ✅ Inclui contador de usuários (`_count.users`)
7. ✅ Campos opcionais podem ser `null`

## 🔗 Integração

Este endpoint é usado em:

- ✅ `/admin` - Dashboard admin (últimas 5 empresas)
- ✅ `/admin/empresas` - Lista completa de empresas
- ✅ `companiesApi.getAllCompanies()` - Função helper

## 📊 Diferenças vs `/users/me/companies`

| Aspecto | `/users/me/companies` | `/companies/admin/all` |
|---------|----------------------|------------------------|
| **Acesso** | Qualquer usuário autenticado | Apenas admins |
| **Retorna** | Empresas do usuário | Todas as empresas |
| **Inclui** | Role e permissões do usuário | Dados completos da empresa |
| **Uso** | Seleção de empresa | Gerenciamento admin |
| **Header** | Não requer `x-company-id` | Requer `x-company-id` |
