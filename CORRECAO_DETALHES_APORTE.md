# Correção: Página de Detalhes do Aporte

## 🐛 Problema Identificado

A página `/dashboard/investidores/aportes/[id]` estava fazendo requisição GET com `id = undefined`:

```
Request URL: http://localhost:4000/scp/investments/undefined
Request Method: GET
Status Code: 404 Not Found
```

## 🔍 Causas do Problema

### 1. **Falta de Empresa Selecionada**
A página não estava carregando a empresa selecionada através do `authApi.getSelectedCompany()`, necessária para enviar o header `X-Company-ID`.

### 2. **Função getById sem companyId**
A função `investmentsApi.getById()` requer 2 parâmetros:
- `companyId` (string)
- `investmentId` (string)

Mas estava sendo chamada apenas com 1 parâmetro.

### 3. **Função delete sem companyId**
A função `investmentsApi.delete()` também requer 2 parâmetros, mas estava sendo chamada com apenas 1.

### 4. **useEffect sem validação**
O `useEffect` estava executando as funções mesmo quando `params.id` era `undefined`.

### 5. **Campo investor.name incorreto**
A interface `InvestmentDetails` define `investor.fullName` e `investor.companyName`, mas o código estava usando `investor.name` (que não existe).

## ✅ Correções Aplicadas

### 1. Adicionado Import do authApi
```typescript
import { authApi } from "@/lib/api/auth"
```

### 2. Adicionado Estado para Empresa Selecionada
```typescript
const [selectedCompany, setSelectedCompany] = useState<any>(null)
```

### 3. Adicionado useEffect para Carregar Empresa
```typescript
useEffect(() => {
  loadSelectedCompany()
}, [])

const loadSelectedCompany = async () => {
  try {
    const company = await authApi.getSelectedCompany()
    setSelectedCompany(company)
  } catch (error) {
    console.error("Erro ao carregar empresa:", error)
  }
}
```

### 4. Modificado useEffect Principal
**Antes:**
```typescript
useEffect(() => {
  loadInvestment()
  loadDocuments()
}, [params.id])
```

**Depois:**
```typescript
useEffect(() => {
  if (params.id && selectedCompany?.id) {
    loadInvestment()
    loadDocuments()
  }
}, [params.id, selectedCompany])
```

### 5. Corrigido loadInvestment()
**Antes:**
```typescript
const loadInvestment = async () => {
  if (!params.id) return
  
  try {
    setLoading(true)
    const data = await investmentsApi.getById(params.id as string)
    setInvestment(data)
```

**Depois:**
```typescript
const loadInvestment = async () => {
  if (!params.id || !selectedCompany?.id) return
  
  try {
    setLoading(true)
    const data = await investmentsApi.getById(selectedCompany.id, params.id as string)
    setInvestment(data)
```

### 6. Corrigido loadDocuments()
**Antes:**
```typescript
const loadDocuments = async () => {
  try {
    setLoadingDocuments(true)
    const data = await investmentDocumentsApi.getAll(params.id as string)
```

**Depois:**
```typescript
const loadDocuments = async () => {
  if (!params.id) return
  
  try {
    setLoadingDocuments(true)
    const data = await investmentDocumentsApi.getAll(params.id as string)
```

### 7. Corrigido handleDelete()
**Antes:**
```typescript
const handleDelete = async () => {
  if (!params.id) return
  
  try {
    setDeleting(true)
    await investmentsApi.delete(params.id as string)
```

**Depois:**
```typescript
const handleDelete = async () => {
  if (!params.id || !selectedCompany?.id) return
  
  try {
    setDeleting(true)
    await investmentsApi.delete(selectedCompany.id, params.id as string)
```

### 8. Corrigido Nome do Investidor
**Antes:**
```typescript
<p className="font-medium">
  {investment.investor.name || investment.investor.companyName}
</p>
```

**Depois:**
```typescript
<p className="font-medium">
  {investmentsApi.helpers.getInvestorName(investment.investor)}
</p>
```

## 📊 Fluxo Corrigido

### Fluxo de Carregamento da Página

```
1. Componente monta
   └── useEffect #1 executa
       └── loadSelectedCompany()
           └── authApi.getSelectedCompany()
               └── Armazena em selectedCompany state

2. selectedCompany state atualiza
   └── useEffect #2 executa (dependência: selectedCompany)
       └── if (params.id && selectedCompany?.id)
           ├── loadInvestment()
           │   └── investmentsApi.getById(companyId, investmentId)
           │       └── GET /scp/investments/{id}
           │           └── Headers: X-Company-ID: {companyId}
           │
           └── loadDocuments()
               └── investmentDocumentsApi.getAll(investmentId)
                   └── GET /scp/investments/documents/investment/{id}
                       └── Headers: X-Company-ID: {companyId}

3. Dados carregados
   └── Página renderizada com informações completas
```

## 🎯 Validações Implementadas

### Em Todas as Funções Críticas:

1. **loadInvestment()**:
   - ✅ Verifica `params.id`
   - ✅ Verifica `selectedCompany?.id`
   - ✅ Envia `companyId` e `investmentId`

2. **loadDocuments()**:
   - ✅ Verifica `params.id`
   - ✅ Envia `investmentId`

3. **handleDelete()**:
   - ✅ Verifica `params.id`
   - ✅ Verifica `selectedCompany?.id`
   - ✅ Envia `companyId` e `investmentId`

4. **useEffect Principal**:
   - ✅ Verifica `params.id`
   - ✅ Verifica `selectedCompany?.id`
   - ✅ Aguarda ambos antes de executar

## 🔧 Assinaturas das Funções API

### investmentsApi.getById()
```typescript
export async function getInvestmentById(
  companyId: string,
  investmentId: string
): Promise<InvestmentDetails>
```

### investmentsApi.delete()
```typescript
export async function deleteInvestment(
  companyId: string,
  investmentId: string
): Promise<void>
```

### investmentDocumentsApi.getAll()
```typescript
export async function getInvestmentDocuments(
  investmentId: string,
  params?: PaginationParams
): Promise<InvestmentDocumentsListResponse>
```

## 📝 Interface InvestmentDetails

```typescript
export interface InvestmentDetails extends Investment {
  project: {
    id: string
    name: string
    code: string
    totalValue: number
  }
  investor: {
    id: string
    type: "PESSOA_FISICA" | "PESSOA_JURIDICA"
    fullName?: string      // ✅ PF - usar este campo
    companyName?: string   // ✅ PJ - usar este campo
    cpf?: string
    cnpj?: string
  }
}
```

### Helper para Nome do Investidor
```typescript
investmentsApi.helpers.getInvestorName(investor)
// Retorna:
// - investor.fullName (se PF)
// - investor.companyName (se PJ)
// - "Sem nome" (fallback)
```

## ✅ Resultado

Após as correções:
- ✅ Página carrega corretamente o aporte com ID válido
- ✅ Requisição GET enviada com ID correto
- ✅ Header X-Company-ID enviado em todas as requisições
- ✅ Nome do investidor exibido corretamente
- ✅ Função de exclusão funcionando
- ✅ Documentos carregados corretamente
- ✅ Zero erros de compilação

## 🚀 Status

**✅ CORRIGIDO E FUNCIONAL**

A página `/dashboard/investidores/aportes/[id]` agora:
- Carrega a empresa selecionada
- Valida todos os parâmetros antes de fazer requisições
- Envia `companyId` em todas as funções que requerem
- Exibe informações corretas do investidor
- Funciona perfeitamente com o sistema de documentos

## 📊 Estatísticas

- **Arquivo Corrigido**: 1 (`/app/dashboard/investidores/aportes/[id]/page.tsx`)
- **Imports Adicionados**: 1 (`authApi`)
- **Estados Adicionados**: 1 (`selectedCompany`)
- **Funções Adicionadas**: 1 (`loadSelectedCompany`)
- **Funções Modificadas**: 3 (`loadInvestment`, `loadDocuments`, `handleDelete`)
- **useEffects Modificados**: 1 (adicionada validação de empresa)
- **Campos Corrigidos**: 1 (`investor.name` → `getInvestorName()`)
- **Erros de Compilação**: 0 ✅
