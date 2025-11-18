# Página de Seleção de Empresa

## 📋 Visão Geral

A página `/selecionar-empresa` permite que usuários com acesso a múltiplas empresas escolham qual empresa desejam acessar.

## 🎯 Funcionalidades Implementadas

### 1. ✅ Exibição de Empresas do Usuário

- Carrega automaticamente as empresas do `localStorage`
- Obtém dados do login (empresas e permissões)
- Mostra informações de cada empresa:
  - Nome da empresa
  - CNPJ
  - Role do usuário (cargo)
  - Número de permissões
  - Badge "Admin" se o usuário for administrador

### 2. ✅ Busca de Empresas

- Campo de busca disponível quando há mais de 3 empresas
- Busca por nome da empresa ou CNPJ
- Filtragem em tempo real

### 3. ✅ Seleção de Empresa

Ao clicar em uma empresa:
- Salva a empresa selecionada no `localStorage`
- Redireciona baseado na role:
  - **Admin** → `/admin`
  - **Outras roles** → `/dashboard`
- Mostra toast de confirmação

### 4. ✅ Botão "Acessar como Administrador"

- **Exibido apenas se**: O usuário tiver role `admin` em pelo menos uma empresa
- **Ação**: Seleciona automaticamente a primeira empresa onde é admin e redireciona para `/admin`
- **Localização**: Canto inferior direito

### 5. ✅ Botão Sair

- Executa logout completo
- Limpa `localStorage` e cookies
- Redireciona para `/login`

## 🔒 Segurança

### Verificações Implementadas:

1. ✅ Verifica se usuário está autenticado
2. ✅ Verifica se há empresas disponíveis
3. ✅ Redireciona para login se não houver dados
4. ✅ Protegida pelo middleware

## 💻 Estrutura do Código

```typescript
// Estado do componente
const [companies, setCompanies] = useState<Company[]>([])      // Empresas do usuário
const [userName, setUserName] = useState("")                   // Nome do usuário
const [hasAdminRole, setHasAdminRole] = useState(false)        // Tem role admin?
const [loading, setLoading] = useState(true)                   // Loading inicial
const [searchTerm, setSearchTerm] = useState("")               // Termo de busca

// useEffect - Carrega dados ao montar
useEffect(() => {
  // 1. Verifica autenticação
  // 2. Carrega empresas do localStorage
  // 3. Verifica se tem role admin
}, [])

// handleSelectCompany - Seleciona empresa
const handleSelectCompany = (company: Company) => {
  authApi.setSelectedCompany(company)
  // Redireciona baseado na role
}

// handleAdminAccess - Acesso direto como admin
const handleAdminAccess = () => {
  // Seleciona primeira empresa admin
  // Redireciona para /admin
}
```

## 🎨 Interface

### Cabeçalho
```
┌─────────────────────────────────────┐
│         [Logo Building2]            │
│     Olá, [Nome do Usuário]!         │
│ Selecione uma das X empresas...     │
└─────────────────────────────────────┘
```

### Busca (se > 3 empresas)
```
┌─────────────────────────────────────┐
│ 🔍 Buscar por nome ou CNPJ...       │
└─────────────────────────────────────┘
```

### Lista de Empresas
```
┌─────────────────────────────────────────────┐
│ [🏢] Tech Solutions LTDA        [Admin] →   │
│      CNPJ: 12.345.678/0001-90              │
│      🛡️ Seu cargo: Administrador           │
│      👥 25 permissões                       │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ [🏢] Comércio Digital ME                  → │
│      CNPJ: 98.765.432/0001-10              │
│      🛡️ Seu cargo: Gerente                 │
│      👥 15 permissões                       │
└─────────────────────────────────────────────┘
```

### Rodapé
```
┌─────────────────────────────────────────────┐
│ [🚪 Sair]                [🛡️ Admin Access] │
└─────────────────────────────────────────────┘
        ↑                            ↑
  Sempre visível          Só se for admin
```

## 🔄 Fluxo de Uso

### Cenário 1: Usuário com múltiplas empresas (não admin)

```
1. Login → Redireciona para /selecionar-empresa
2. Vê lista de empresas
3. Clica em uma empresa
4. Redireciona para /dashboard
```

### Cenário 2: Usuário com múltiplas empresas (admin em alguma)

```
1. Login → Redireciona para /selecionar-empresa
2. Vê lista de empresas + botão "Acessar como Administrador"
3. Opção A: Clica em empresa específica
4. Opção B: Clica em "Acessar como Administrador"
5. Redireciona para /admin
```

### Cenário 3: Usuário com apenas 1 empresa

```
1. Login → Empresa selecionada automaticamente
2. Redireciona direto para /admin ou /dashboard
3. Não passa por /selecionar-empresa
```

## 🧪 Testando

### Teste 1: Verificar carregamento

```javascript
// Console do navegador em /selecionar-empresa
console.log(authApi.getCompanies())
// Deve mostrar array de empresas
```

### Teste 2: Verificar role admin

```javascript
const companies = authApi.getCompanies()
const hasAdmin = companies.some(c => c.role.name === 'admin')
console.log('Tem admin?', hasAdmin)
// Se true, deve mostrar botão "Acessar como Administrador"
```

### Teste 3: Selecionar empresa

```javascript
// Após clicar em uma empresa
console.log(authApi.getSelectedCompany())
// Deve mostrar a empresa selecionada
```

## 📊 Dados Utilizados

### Companies (do localStorage)

```typescript
interface Company {
  companyId: string           // ID único da empresa
  companyName: string         // Nome da empresa
  companyCnpj: string        // CNPJ formatado
  role: {
    id: string               // ID da role
    name: string            // Nome da role (ex: "admin", "manager")
    description: string     // Descrição da role
  }
  permissions: Permission[]  // Array de permissões
}
```

## 🎯 Lógica de Exibição do Botão Admin

```typescript
// Verifica se TEM role admin em ALGUMA empresa
const hasAdminRole = companies.some((company) => company.role.name === "admin")

// No JSX
{hasAdminRole && (
  <Button onClick={handleAdminAccess}>
    Acessar como Administrador
  </Button>
)}
```

## 🚨 Tratamento de Erros

### Erro 1: Usuário não autenticado
```
→ Redireciona para /login
```

### Erro 2: Sem empresas
```
→ Toast de erro
→ Redireciona para /login
```

### Erro 3: Nenhuma empresa encontrada na busca
```
→ Mostra mensagem "Nenhuma empresa encontrada"
```

## 💡 Dicas de Personalização

### Adicionar logo da empresa

```tsx
<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
  {company.logo ? (
    <img src={company.logo} alt={company.companyName} className="h-full w-full object-cover rounded-xl" />
  ) : (
    <Building2 className="h-7 w-7 text-primary" />
  )}
</div>
```

### Adicionar favorito

```tsx
// Salvar empresa favorita
localStorage.setItem('favoriteCompany', companyId)

// Ordenar com favorita primeiro
const sortedCompanies = companies.sort((a, b) => {
  const favorite = localStorage.getItem('favoriteCompany')
  if (a.companyId === favorite) return -1
  if (b.companyId === favorite) return 1
  return 0
})
```

### Adicionar último acesso

```tsx
// Salvar último acesso
const lastAccess = {
  companyId: company.companyId,
  timestamp: new Date().toISOString()
}
localStorage.setItem(`lastAccess_${company.companyId}`, JSON.stringify(lastAccess))
```

## 🔗 Navegação

**De**: `/login` (se múltiplas empresas)  
**Para**: `/dashboard` ou `/admin` (após seleção)  
**Voltar**: Botão "Sair" → `/login`
