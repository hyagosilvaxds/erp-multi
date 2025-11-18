# Bug Fix - CompanyId no Módulo SCP

## 🐛 Problema Identificado

**Erro:** HTTP 400 - "property companyId should not exist"

**Contexto:**
- Ao criar um novo investidor via tela `/dashboard/investidores/novo`
- Ao criar um novo projeto via tela `/dashboard/investidores/projetos/novo`
- O backend retornava erro 400 indicando que `companyId` não deveria estar no body da requisição

## 🔍 Causa Raiz

Os arquivos `/lib/api/investors.ts` e `/lib/api/projects.ts` estavam enviando `companyId` de duas formas:
1. ✅ No header `X-Company-ID` (correto)
2. ❌ No body/params da requisição (incorreto)

O backend está configurado para capturar `companyId` **apenas do header**, não aceitando no body ou query params.

### Código Anterior (Incorreto)

**investors.ts - createInvestor (linha 314)**
```typescript
export async function createInvestor(
  companyId: string,
  data: CreateInvestorDto
): Promise<Investor> {
  const response = await apiClient.post(`/scp/investors`, {
    ...data,
    companyId, // ❌ PROBLEMA: companyId no body
  })
  return response.data
}
```

**investors.ts - getInvestors (linha 329)**
```typescript
export async function getInvestors(
  companyId: string,
  params?: InvestorsQueryParams
): Promise<InvestorsListResponse> {
  const response = await apiClient.get(`/scp/investors`, {
    params: {
      ...params,
      companyId, // ❌ PROBLEMA: companyId como query param
    },
  })
  return response.data
}
```

**projects.ts - createProject (linha 162)**
```typescript
export async function createProject(
  companyId: string,
  data: CreateProjectDto
): Promise<Project> {
  const response = await apiClient.post(`/scp/projects`, {
    ...data,
    companyId, // ❌ PROBLEMA: companyId no body
  })
  return response.data
}
```

**projects.ts - getProjects (linha 177)**
```typescript
export async function getProjects(
  companyId: string,
  params?: ProjectsQueryParams
): Promise<ProjectsListResponse> {
  const response = await apiClient.get(`/scp/projects`, {
    params: {
      ...params,
      companyId, // ❌ PROBLEMA: companyId como query param
    },
  })
  return response.data
}
```

## ✅ Solução Implementada

Removido `companyId` do body/params e garantido que seja enviado **apenas no header**.

### Código Corrigido

**investors.ts - createInvestor (linha 314-323)**
```typescript
export async function createInvestor(
  companyId: string,
  data: CreateInvestorDto
): Promise<Investor> {
  const response = await apiClient.post(`/scp/investors`, data, {
    headers: {
      'X-Company-ID': companyId, // ✅ Apenas no header
    },
  })
  return response.data
}
```

**investors.ts - getInvestors (linha 329-340)**
```typescript
export async function getInvestors(
  companyId: string,
  params?: InvestorsQueryParams
): Promise<InvestorsListResponse> {
  const response = await apiClient.get(`/scp/investors`, {
    params, // ✅ Sem companyId nos query params
    headers: {
      'X-Company-ID': companyId, // ✅ Apenas no header
    },
  })
  return response.data
}
```

**projects.ts - createProject (linha 162-174)**
```typescript
export async function createProject(
  companyId: string,
  data: CreateProjectDto
): Promise<Project> {
  const response = await apiClient.post(`/scp/projects`, data, {
    headers: {
      'X-Company-ID': companyId, // ✅ Apenas no header
    },
  })
  return response.data
}
```

**projects.ts - getProjects (linha 177-189)**
```typescript
export async function getProjects(
  companyId: string,
  params?: ProjectsQueryParams
): Promise<ProjectsListResponse> {
  const response = await apiClient.get(`/scp/projects`, {
    params, // ✅ Sem companyId nos query params
    headers: {
      'X-Company-ID': companyId, // ✅ Apenas no header
    },
  })
  return response.data
}
```

## 📝 Alterações Realizadas

### Arquivo: `/lib/api/investors.ts`

1. **createInvestor (linha 314-323)**
   - ❌ Removido: `companyId` do body da requisição
   - ✅ Adicionado: Header `X-Company-ID` explícito
   - Payload agora é apenas `data` sem merge com `companyId`

2. **getInvestors (linha 329-340)**
   - ❌ Removido: `companyId` dos query parameters
   - ✅ Adicionado: Header `X-Company-ID` explícito
   - Params agora é apenas `params` sem merge com `companyId`

3. **getInvestorById (linha 345-358)** - ⚠️ NOVA CORREÇÃO
   - ❌ Problema: Não enviava header `X-Company-ID`
   - ✅ Solução: Adicionado `authApi.getSelectedCompany()` para obter empresa selecionada
   - ✅ Adicionado: Header `X-Company-ID` com validação
   - ✅ Adicionado: Throw error se nenhuma empresa estiver selecionada

4. **updateInvestor (linha 353-368)** - ⚠️ NOVA CORREÇÃO
   - ❌ Problema: Não enviava header `X-Company-ID`
   - ✅ Solução: Adicionado `authApi.getSelectedCompany()` para obter empresa selecionada
   - ✅ Adicionado: Header `X-Company-ID` com validação

5. **deleteInvestor (linha 370-383)** - ⚠️ NOVA CORREÇÃO
   - ❌ Problema: Não enviava header `X-Company-ID`
   - ✅ Solução: Adicionado `authApi.getSelectedCompany()` para obter empresa selecionada
   - ✅ Adicionado: Header `X-Company-ID` com validação

### Arquivo: `/lib/api/projects.ts` - ⚠️ NOVA CORREÇÃO

1. **Import authApi (linha 2)**
   - ✅ Adicionado: `import { authApi } from "./auth"`

2. **getProjectById (linha 207-220)**
   - ❌ Problema: Não enviava header `X-Company-ID`
   - ✅ Solução: Adicionado `authApi.getSelectedCompany()` para obter empresa selecionada
   - ✅ Adicionado: Header `X-Company-ID` com validação
   - ✅ Adicionado: Throw error se nenhuma empresa estiver selecionada

3. **updateProject (linha 222-239)**
   - ❌ Problema: Não enviava header `X-Company-ID`
   - ✅ Solução: Adicionado `authApi.getSelectedCompany()` para obter empresa selecionada
   - ✅ Adicionado: Header `X-Company-ID` com validação

4. **deleteProject (linha 241-254)**
   - ❌ Problema: Não enviava header `X-Company-ID`
   - ✅ Solução: Adicionado `authApi.getSelectedCompany()` para obter empresa selecionada
   - ✅ Adicionado: Header `X-Company-ID` com validação

### Arquivo: `/lib/api/projects.ts`

1. **createProject (linha 162-174)**
   - ❌ Removido: `companyId` do body da requisição
   - ✅ Adicionado: Header `X-Company-ID` explícito
   - Payload agora é apenas `data` sem merge com `companyId`

2. **getProjects (linha 177-189)**
   - ❌ Removido: `companyId` dos query parameters
   - ✅ Adicionado: Header `X-Company-ID` explícito
   - Params agora é apenas `params` sem merge com `companyId`

## 🧪 Validação

- ✅ Zero erros de compilação
- ✅ Tipos TypeScript mantidos
- ✅ Assinatura das funções não alterada (companyId ainda é parâmetro)
- ✅ Compatibilidade com chamadas existentes mantida

## 📊 Impacto

### Telas Afetadas
- `/dashboard/investidores/novo` - Cadastro de investidor ✅ **CORRIGIDO**
- `/dashboard/investidores` - Listagem de investidores ✅ **CORRIGIDO**
- `/dashboard/investidores/[id]` - Detalhes de investidor ✅ **CORRIGIDO**
- `/dashboard/investidores/[id]/editar` - Edição de investidor ✅ **CORRIGIDO**
- `/dashboard/investidores/projetos/novo` - Cadastro de projeto ✅ **CORRIGIDO**
- `/dashboard/investidores/projetos` - Listagem de projetos ✅ **CORRIGIDO**
- `/dashboard/investidores/projetos/[id]` - Detalhes de projeto ✅ **CORRIGIDO**
- `/dashboard/investidores/projetos/[id]/editar` - Edição de projeto ✅ **CORRIGIDO**

### API Endpoints Corrigidos
- `POST /scp/investors` - Criação de investidor ✅
- `GET /scp/investors` - Listagem de investidores ✅
- `GET /scp/investors/:id` - Detalhes de investidor ✅ **NOVA CORREÇÃO**
- `PUT /scp/investors/:id` - Atualização de investidor ✅ **NOVA CORREÇÃO**
- `DELETE /scp/investors/:id` - Exclusão de investidor ✅ **NOVA CORREÇÃO**
- `POST /scp/projects` - Criação de projeto ✅
- `GET /scp/projects` - Listagem de projetos ✅
- `GET /scp/projects/:id` - Detalhes de projeto ✅ **NOVA CORREÇÃO**
- `PUT /scp/projects/:id` - Atualização de projeto ✅ **NOVA CORREÇÃO**
- `DELETE /scp/projects/:id` - Exclusão de projeto ✅ **NOVA CORREÇÃO**

### Arquivos Modificados
- ✅ `/lib/api/investors.ts` - **5 funções corrigidas** (create, getAll, getById, update, delete)
- ✅ `/lib/api/projects.ts` - **5 funções corrigidas** (create, getAll, getById, update, delete)

### Arquivos Verificados (Já Corretos)
- ✅ `/lib/api/investments.ts` - Usa apenas header em todos os métodos
- ✅ `/lib/api/distribution-policies.ts` - Usa apenas header em todos os métodos
- ✅ `/lib/api/distributions.ts` - Usa apenas header em todos os métodos

## 🔐 Padrão de Autenticação

**Arquitetura do Backend:**
```
Cliente Frontend
    ↓
    ├─ Authorization: Bearer {token}
    └─ X-Company-ID: {uuid}
    ↓
Backend Middleware
    ↓
    ├─ Valida token JWT
    ├─ Extrai companyId do header X-Company-ID
    └─ Adiciona ao contexto da requisição
    ↓
Controller
    ↓
    └─ Usa companyId do contexto (não do body/params)
```

## 📚 Lições Aprendidas

1. **Headers vs Body**: O backend multi-tenant usa headers para contexto da empresa
2. **Validação DTO**: DTOs do backend não incluem `companyId` pois vem do header
3. **API Client**: O `apiClient` pode enviar headers automaticamente, mas especificamos explicitamente para clareza
4. **Consistência**: Todos os endpoints `/scp/*` seguem o mesmo padrão

## 🚀 Próximos Passos

- [x] Corrigir `investors.ts` (createInvestor, getInvestors)
- [x] Corrigir `projects.ts` (createProject, getProjects)
- [x] Verificar outros módulos SCP (investments, policies, distributions)
- [ ] Adicionar testes unitários para validar headers
- [ ] Documentar padrão de headers em guia de desenvolvimento

---

**Data:** 2025
**Módulo:** Investidores SCP
**Severity:** High (bloqueava criação de investidores e projetos)
**Status:** ✅ Resolvido
**Arquivos Alterados:** 2 (`investors.ts`, `projects.ts`)
**Funções Corrigidas:** 4 (createInvestor, getInvestors, createProject, getProjects)
