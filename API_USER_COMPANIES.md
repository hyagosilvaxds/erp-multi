# API de Empresas do Usuário

## 📋 Visão Geral

Esta documentação descreve o endpoint `/users/me/companies` que retorna todas as empresas do usuário autenticado com suas roles e permissões.

## 🔗 Endpoint

```
GET /users/me/companies
```

### Headers Necessários

```
Authorization: Bearer {token}
```

## 📦 Resposta

### Status: 200 OK

```json
[
  {
    "id": "cm2r8g9h40000vy9x1a2b3c4d",
    "razaoSocial": "Empresa Alpha Comércio Ltda",
    "nomeFantasia": "Empresa Alpha",
    "cnpj": "11222333000144",
    "logoUrl": null,
    "email": "contato@alpha.com.br",
    "telefone": "(11) 3000-1000",
    "cidade": "São Paulo",
    "estado": "SP",
    "active": true,
    "role": {
      "id": "cm2r8g9h40001vy9x1a2b3c4e",
      "name": "admin",
      "description": "Administrador - Acesso total ao sistema",
      "permissions": [
        {
          "id": "cm2r8g9h40010vy9x1a2b3c4x",
          "name": "users.create",
          "description": "Criar usuários",
          "resource": "users",
          "action": "create"
        },
        {
          "id": "cm2r8g9h40011vy9x1a2b3c4y",
          "name": "users.read",
          "description": "Visualizar usuários",
          "resource": "users",
          "action": "read"
        }
        // ... mais permissões
      ]
    }
  }
]
```

## 📊 Estrutura de Dados

### Company

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | ID único da empresa |
| `razaoSocial` | string | Razão social da empresa |
| `nomeFantasia` | string | Nome fantasia da empresa |
| `cnpj` | string | CNPJ da empresa |
| `logoUrl` | string \| null | URL da logo da empresa |
| `email` | string | E-mail de contato |
| `telefone` | string | Telefone de contato |
| `cidade` | string | Cidade da empresa |
| `estado` | string | Estado (UF) |
| `active` | boolean | Se a empresa está ativa |
| `role` | Role | Role do usuário nesta empresa |

### Role

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | ID único da role |
| `name` | string | Nome da role (admin, manager, sales, viewer) |
| `description` | string | Descrição da role |
| `permissions` | Permission[] | Array de permissões |

### Permission

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | ID único da permissão |
| `name` | string | Nome da permissão (ex: users.create) |
| `description` | string | Descrição da permissão |
| `resource` | string | Recurso (users, companies, products, sales, reports) |
| `action` | string | Ação (create, read, update, delete) |

## 💻 Uso no Código

### TypeScript Types

```typescript
interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: string
}

interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
}

interface Company {
  id: string
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
  logoUrl: string | null
  email: string
  telefone: string
  cidade: string
  estado: string
  active: boolean
  role: Role
}
```

### Chamada da API

```typescript
import { authApi } from '@/lib/api/auth'

// Buscar empresas
try {
  const companies = await authApi.getUserCompanies()
  console.log('Empresas:', companies)
} catch (error) {
  console.error('Erro:', error)
}
```

### Exemplo Completo

```typescript
async function loadUserCompanies() {
  try {
    // Buscar empresas da API
    const companies = await authApi.getUserCompanies()
    
    // Filtrar empresas ativas
    const activeCompanies = companies.filter(c => c.active)
    
    // Filtrar empresas onde é admin
    const adminCompanies = companies.filter(c => c.role.name === 'admin')
    
    // Contar total de permissões
    const totalPermissions = companies.reduce(
      (sum, c) => sum + c.role.permissions.length,
      0
    )
    
    console.log('Total de empresas:', companies.length)
    console.log('Empresas ativas:', activeCompanies.length)
    console.log('Empresas admin:', adminCompanies.length)
    console.log('Total de permissões:', totalPermissions)
    
    return companies
  } catch (error) {
    console.error('Erro ao buscar empresas:', error)
    throw error
  }
}
```

## 🔍 Exemplos de Uso

### 1. Listar Empresas na UI

```tsx
function CompanyList() {
  const [companies, setCompanies] = useState<Company[]>([])
  
  useEffect(() => {
    authApi.getUserCompanies()
      .then(setCompanies)
      .catch(console.error)
  }, [])
  
  return (
    <div>
      {companies.map(company => (
        <div key={company.id}>
          <h3>{company.nomeFantasia}</h3>
          <p>CNPJ: {company.cnpj}</p>
          <p>Cargo: {company.role.description}</p>
          <p>Permissões: {company.role.permissions.length}</p>
        </div>
      ))}
    </div>
  )
}
```

### 2. Verificar Permissões

```typescript
function hasPermission(
  company: Company,
  resource: string,
  action: string
): boolean {
  return company.role.permissions.some(
    p => p.resource === resource && p.action === action
  )
}

// Uso
const company = companies[0]
const canCreateUsers = hasPermission(company, 'users', 'create')
const canDeleteProducts = hasPermission(company, 'products', 'delete')
```

### 3. Buscar Empresa Específica

```typescript
function findCompanyByCNPJ(companies: Company[], cnpj: string): Company | undefined {
  return companies.find(c => c.cnpj === cnpj)
}

function findAdminCompany(companies: Company[]): Company | undefined {
  return companies.find(c => c.role.name === 'admin')
}

// Uso
const myCompany = findCompanyByCNPJ(companies, '11222333000144')
const adminCompany = findAdminCompany(companies)
```

### 4. Agrupar por Estado

```typescript
function groupCompaniesByState(companies: Company[]): Record<string, Company[]> {
  return companies.reduce((acc, company) => {
    if (!acc[company.estado]) {
      acc[company.estado] = []
    }
    acc[company.estado].push(company)
    return acc
  }, {} as Record<string, Company[]>)
}

// Uso
const byState = groupCompaniesByState(companies)
console.log('Empresas em SP:', byState['SP'])
console.log('Empresas em RJ:', byState['RJ'])
```

## 🔄 Atualização de Dados

### Quando Atualizar

A API deve ser chamada para atualizar as empresas:

1. **Após login** - Automático (feito no login)
2. **Na página de seleção** - Ao montar o componente
3. **Após mudanças de permissões** - Manualmente
4. **Periodicamente** - Se necessário

### Forçar Atualização

```typescript
// Recarregar empresas do servidor
async function refreshCompanies() {
  try {
    const companies = await authApi.getUserCompanies()
    // Atualiza automaticamente o localStorage
    return companies
  } catch (error) {
    console.error('Erro ao atualizar empresas:', error)
  }
}
```

## 🚨 Tratamento de Erros

### Erro 401 - Não Autorizado

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Ação**: Token inválido ou expirado → Redirecionar para login

### Erro 404 - Sem Empresas

Se o usuário não tiver empresas, retorna array vazio: `[]`

### Exemplo de Tratamento

```typescript
try {
  const companies = await authApi.getUserCompanies()
  
  if (companies.length === 0) {
    // Usuário sem empresas
    toast.error('Você não está associado a nenhuma empresa')
    return
  }
  
  // Sucesso
  setCompanies(companies)
} catch (error: any) {
  if (error.message.includes('401')) {
    // Token inválido
    authApi.logout()
  } else {
    // Outro erro
    toast.error('Erro ao carregar empresas')
  }
}
```

## 🧪 Testando

### 1. Via cURL

```bash
curl -X GET http://localhost:4000/users/me/companies \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 2. Via Postman

```
GET http://localhost:4000/users/me/companies
Headers:
  Authorization: Bearer SEU_TOKEN_AQUI
```

### 3. Via Código

```typescript
// Console do navegador
const companies = await authApi.getUserCompanies()
console.log(companies)
```

## 📝 Notas Importantes

1. ✅ O endpoint requer autenticação (token JWT)
2. ✅ Retorna apenas empresas do usuário autenticado
3. ✅ Inclui todas as permissões de cada role
4. ✅ Empresas inativas também são retornadas (campo `active`)
5. ✅ Os dados são salvos automaticamente no localStorage
6. ✅ O interceptor do Axios adiciona o token automaticamente

## 🔗 Integração

Este endpoint é usado em:

- ✅ `/selecionar-empresa` - Lista empresas para seleção
- ✅ `authApi.getUserCompanies()` - Função helper
- ✅ Sistema de permissões - Verifica acesso
