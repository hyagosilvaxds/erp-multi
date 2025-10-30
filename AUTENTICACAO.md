# Sistema de Autenticação - ERP Multi

## 📋 Visão Geral

Este sistema implementa autenticação JWT com suporte a múltiplas empresas e permissões por empresa.

## 🔧 Estrutura

```
lib/api/
├── client.ts          # Cliente Axios configurado
├── auth.ts            # Funções de autenticação
└── auth-examples.tsx  # Exemplos de uso

middleware.ts          # Middleware de proteção de rotas
```

## 🛡️ Middleware de Proteção

O sistema inclui um middleware que protege automaticamente todas as rotas, exceto `/login`.

### Funcionamento:

1. **Rotas Públicas**: Apenas `/login` é acessível sem autenticação
2. **Rotas Protegidas**: `/admin`, `/dashboard`, `/selecionar-empresa`, `/portal-investidor`
3. **Verificação**: O middleware verifica se existe token nos cookies
4. **Redirecionamento**:
   - Sem token + rota protegida → redireciona para `/login`
   - Com token + `/login` → redireciona para `/dashboard`
   - Raiz `/` sem token → redireciona para `/login`
   - Raiz `/` com token → redireciona para `/dashboard`

### Cookies:

O sistema agora salva o token tanto no **localStorage** quanto em **cookies**:
- **localStorage**: Para uso no cliente (JavaScript)
- **Cookies**: Para o middleware verificar no servidor

```typescript
// Ao fazer login
document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`

// Ao fazer logout
document.cookie = 'token=; path=/; max-age=0; SameSite=Lax'
```

## 🚀 Como Usar

### 1. Login

O login é feito automaticamente no componente `LoginForm`. Quando o usuário faz login:

1. As credenciais são enviadas para `/auth/login`
2. O token JWT é salvo no `localStorage` como `token`
3. Os dados do usuário são salvos como `user`
4. As empresas e permissões são salvas como `companies`
5. O usuário é redirecionado:
   - Para `/selecionar-empresa` se tiver múltiplas empresas
   - Para `/admin` ou `/dashboard` se tiver apenas uma empresa

### 2. Dados Salvos no localStorage

Após o login, os seguintes dados ficam disponíveis no `localStorage`:

```javascript
// Token JWT
localStorage.getItem('token')

// Dados do usuário
{
  "userId": "uuid",
  "email": "user@example.com",
  "name": "Nome do Usuário",
  "companies": [...]
}

// Empresas com permissões
[
  {
    "id": "uuid-da-empresa-1",
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
      "id": "uuid-da-role",
      "name": "admin",
      "description": "Administrador do sistema",
      "permissions": [
        {
          "id": "uuid-da-permissao",
          "name": "users.create",
          "description": "Criar usuários",
          "resource": "users",
          "action": "create"
        },
        {
          "id": "uuid-da-permissao-2",
          "name": "users.read",
          "description": "Visualizar usuários",
          "resource": "users",
          "action": "read"
        }
        // ... todas as outras permissões
      ]
    }
  },
  {
    "id": "uuid-da-empresa-2",
    "razaoSocial": "Empresa Beta Serviços e Comércio Ltda",
    "nomeFantasia": "Empresa Beta",
    "cnpj": "55666777000188",
    "logoUrl": null,
    "email": "contato@beta.com.br",
    "telefone": "(11) 3000-2000",
    "cidade": "São Paulo",
    "estado": "SP",
    "active": true,
    "role": {
      "id": "uuid-da-role-2",
      "name": "manager",
      "description": "Gerente",
      "permissions": [
        // permissões específicas do gerente
      ]
    }
  }
]

// Empresa selecionada (após seleção)
{
  "companyId": "uuid",
  "companyName": "Empresa Alpha",
  ...
}
```

### 3. Funções Disponíveis

```typescript
import { authApi } from '@/lib/api/auth'

// Login
await authApi.login({ email, password })

// Obter perfil atualizado
await authApi.getProfile()

// Logout
authApi.logout()

// Verificar se está autenticado
const isAuth = authApi.isAuthenticated()

// Obter token
const token = authApi.getToken()

// Obter usuário
const user = authApi.getUser()

// Obter empresas
const companies = authApi.getCompanies()

// Buscar empresas da API (atualiza do servidor)
const companies = await authApi.getUserCompanies()

// Selecionar empresa
authApi.setSelectedCompany(company)

// Obter empresa selecionada
const company = authApi.getSelectedCompany()

// Obter permissões da empresa selecionada
const permissions = authApi.getSelectedCompanyPermissions()
```

### 4. Hook Personalizado

```typescript
import { useAuth } from '@/lib/api/auth-examples'

function MeuComponente() {
  const {
    isAuthenticated,
    user,
    selectedCompany,
    selectCompany,
    logout,
    hasPermission
  } = useAuth()

  const canCreateUsers = hasPermission('users', 'create')

  return (
    <div>
      {isAuthenticated && (
        <>
          <h1>Bem-vindo, {user?.name}</h1>
          {canCreateUsers && <button>Criar Usuário</button>}
          <button onClick={logout}>Sair</button>
        </>
      )}
    </div>
  )
}
```

### 5. Verificar Permissões

```typescript
// Obter permissões da empresa selecionada
const permissions = authApi.getSelectedCompanyPermissions()

// Verificar permissão específica
const canCreate = permissions.some(
  p => p.resource === 'users' && p.action === 'create'
)

// Ou usar a função auxiliar
function hasPermission(resource: string, action: string): boolean {
  const permissions = authApi.getSelectedCompanyPermissions()
  return permissions.some(
    p => p.resource === resource && p.action === action
  )
}

// Uso
if (hasPermission('users', 'create')) {
  // Mostrar botão de criar usuário
}
```

### 6. Proteger Rotas

```typescript
'use client'

import { useEffect } from 'react'
import { authApi } from '@/lib/api/auth'
import { useRouter } from 'next/navigation'

export default function PaginaProtegida() {
  const router = useRouter()

  useEffect(() => {
    if (!authApi.isAuthenticated()) {
      router.push('/login')
    }
  }, [router])

  return (
    <div>Conteúdo protegido</div>
  )
}
```

### 7. Interceptor Axios

O cliente Axios (`apiClient`) já está configurado com interceptors que:

1. **Request Interceptor**: Adiciona automaticamente o token JWT em todas as requisições
2. **Response Interceptor**: Redireciona para `/login` se receber erro 401 (não autorizado)

```typescript
import { apiClient } from '@/lib/api/client'

// Exemplo de uso
async function buscarDados() {
  try {
    const { data } = await apiClient.get('/algum-endpoint')
    return data
  } catch (error) {
    console.error(error)
  }
}
```

## 🔐 Segurança

- ✅ Token JWT armazenado no localStorage e cookies
- ✅ Middleware protegendo todas as rotas (exceto login)
- ✅ Token enviado automaticamente em todas as requisições
- ✅ Redirecionamento automático em caso de token inválido/expirado
- ✅ Limpeza de dados ao fazer logout (localStorage + cookies)
- ✅ Verificações de autenticação no lado do cliente e servidor
- ✅ Cookies com SameSite=Lax para proteção CSRF
- ✅ Expiração de cookie de 7 dias

## 📝 Tipos TypeScript

Todos os tipos estão definidos em `lib/api/auth.ts`:

- `Role` - Papel do usuário na empresa
- `Permission` - Permissão específica
- `Company` - Empresa com role e permissões
- `User` - Usuário com suas empresas
- `LoginRequest` - Payload de login
- `LoginResponse` - Resposta do login

## 🌍 Variáveis de Ambiente

Certifique-se de ter no arquivo `.env`:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

## 🔄 Fluxo de Autenticação

```
1. Usuário acessa /login
2. Preenche email e senha
3. LoginForm chama authApi.login()
4. Token e dados são salvos no localStorage
5. Usuário é redirecionado baseado em:
   - Múltiplas empresas → /selecionar-empresa
   - Uma empresa + admin → /admin
   - Uma empresa + não admin → /dashboard
6. Em /selecionar-empresa, usuário escolhe empresa
7. Empresa é salva com authApi.setSelectedCompany()
8. Usuário é redirecionado para dashboard
```

## 📚 Exemplos Completos

Veja o arquivo `lib/api/auth-examples.tsx` para exemplos completos de uso.
