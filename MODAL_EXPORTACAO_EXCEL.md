# Modal de Filtros para Exportação Excel

## Resumo
Implementação de modal de filtros para exportação de vendas em Excel, permitindo ao usuário selecionar critérios específicos antes de gerar o relatório.

## Data
10 de novembro de 2025

## Mudanças Implementadas

### 1. Novos Estados (`/app/dashboard/vendas/page.tsx`)

```typescript
// Export Excel Dialog
const [exportExcelDialogOpen, setExportExcelDialogOpen] = useState(false)
const [excelFilters, setExcelFilters] = useState({
  status: "",
  customerId: "",
  paymentMethodId: "",
  startDate: "",
  endDate: "",
  minAmount: "",
  maxAmount: "",
})
const [customers, setCustomers] = useState<any[]>([])
const [paymentMethods, setPaymentMethods] = useState<any[]>([])
const [loadingCustomers, setLoadingCustomers] = useState(false)
const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false)
```

### 2. Novos Imports

```typescript
import { customersApi } from "@/lib/api/customers"
import { paymentMethodsApi } from "@/lib/api/payment-methods"
```

### 3. Novas Funções

#### `openExportExcelDialog()`
```typescript
const openExportExcelDialog = async () => {
  setExportExcelDialogOpen(true)
  
  // Carregar clientes (lazy loading)
  if (customers.length === 0) {
    setLoadingCustomers(true)
    const data = await customersApi.getAll({ limit: 1000 })
    setCustomers(data.data)
    setLoadingCustomers(false)
  }

  // Carregar métodos de pagamento (lazy loading)
  if (paymentMethods.length === 0) {
    setLoadingPaymentMethods(true)
    const data = await paymentMethodsApi.getAll()
    setPaymentMethods(data)
    setLoadingPaymentMethods(false)
  }
}
```

**Características:**
- ✅ Lazy loading: Só carrega dados quando necessário
- ✅ Cache: Não recarrega se já tiver os dados
- ✅ Loading states separados para cada lista

#### `handleExportExcel()` - Atualizado
```typescript
const handleExportExcel = async () => {
  setExportingExcel(true)
  
  // Construir filtros do modal
  const filters: any = {}
  
  if (excelFilters.status) filters.status = excelFilters.status
  if (excelFilters.customerId) filters.customerId = excelFilters.customerId
  if (excelFilters.paymentMethodId) filters.paymentMethodId = excelFilters.paymentMethodId
  if (excelFilters.startDate) filters.startDate = excelFilters.startDate
  if (excelFilters.endDate) filters.endDate = excelFilters.endDate
  if (excelFilters.minAmount) filters.minAmount = parseFloat(excelFilters.minAmount)
  if (excelFilters.maxAmount) filters.maxAmount = parseFloat(excelFilters.maxAmount)

  const blob = await salesApi.exportToExcel(filters)
  
  // Download automático
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `vendas-${new Date().toISOString().split('T')[0]}.xlsx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
  
  toast({ title: "Excel exportado", description: "O arquivo foi baixado com sucesso." })
  setExportExcelDialogOpen(false)
  setExportingExcel(false)
}
```

**Mudanças:**
- ❌ **Antes**: Usava filtros da tela de busca (`statusFilter`, `searchTerm`, etc.)
- ✅ **Agora**: Usa filtros específicos do modal (`excelFilters`)

#### `clearExcelFilters()`
```typescript
const clearExcelFilters = () => {
  setExcelFilters({
    status: "",
    customerId: "",
    paymentMethodId: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
  })
}
```

### 4. Modal de Exportação Excel

#### Design do Modal:

**Header:**
- Título: "Exportar Vendas para Excel"
- Descrição: "Configure os filtros para exportar as vendas desejadas. Todos os filtros são opcionais."

**Filtros (Grid 2 Colunas):**

1. **Status** (Select)
   - Opções: Todos, QUOTE, DRAFT, PENDING_APPROVAL, APPROVED, COMPLETED, CANCELED
   - Labels traduzidos

2. **Cliente** (Select)
   - Carrega lista completa de clientes
   - Exibe "Carregando..." durante load
   - Opção "Todos os clientes"

3. **Método de Pagamento** (Select)
   - Carrega lista de métodos de pagamento
   - Exibe "Carregando..." durante load
   - Opção "Todos os métodos"

4. **Data Inicial** (Date Input)
   - Campo de data HTML5
   - Formato ISO 8601

5. **Data Final** (Date Input)
   - Campo de data HTML5
   - Formato ISO 8601

6. **Valor Mínimo** (Number Input)
   - Placeholder: "0.00"
   - Step: 0.01
   - Min: 0

7. **Valor Máximo** (Number Input)
   - Placeholder: "0.00"
   - Step: 0.01
   - Min: 0

**Resumo dos Filtros:**
```typescript
{Object.values(excelFilters).filter(v => v).length > 0 ? (
  <>
    <strong>{Object.values(excelFilters).filter(v => v).length}</strong> filtro(s) ativo(s)
  </>
) : (
  "Nenhum filtro aplicado. Todas as vendas serão exportadas."
)}
```

- ✅ Contador dinâmico de filtros ativos
- ✅ Botão "Limpar Filtros" (aparece só quando há filtros)

**Footer:**
- Botão "Cancelar" (outline)
- Botão "Exportar Excel" (primary)
  - Loading state: "Exportando..."
  - Ícone Download

### 5. Mapeamento com API

#### Endpoint: `GET /sales/export/excel`

| Filtro do Modal | Parâmetro da API | Tipo | Exemplo |
|----------------|------------------|------|---------|
| `status` | `status` | String | `COMPLETED` |
| `customerId` | `customerId` | UUID | `550e8400-...` |
| `paymentMethodId` | `paymentMethodId` | UUID | `pay-123-...` |
| `startDate` | `startDate` | Date (ISO 8601) | `2025-01-01` |
| `endDate` | `endDate` | Date (ISO 8601) | `2025-12-31` |
| `minAmount` | `minAmount` | Number | `1000` |
| `maxAmount` | `maxAmount` | Number | `10000` |

**Exemplo de Request:**
```http
GET /sales/export/excel?status=COMPLETED&startDate=2025-01-01&endDate=2025-12-31&minAmount=1000
Authorization: Bearer {token}
x-company-id: {companyId}
```

**Response:**
```http
200 OK
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="vendas-2025-11-10.xlsx"

[Binary Excel File]
```

### 6. Fluxo de Uso

```
1. Usuário clica em "Exportar Excel" no header
   ↓
2. Modal abre com todos os campos vazios
   ↓
3. Sistema carrega clientes e métodos de pagamento (lazy loading)
   ↓
4. Usuário seleciona filtros desejados (opcional)
   ↓
5. Contador mostra quantos filtros estão ativos
   ↓
6. Usuário pode limpar todos os filtros com um clique
   ↓
7. Usuário clica em "Exportar Excel"
   ↓
8. Sistema monta query string com filtros
   ↓
9. Chama API: GET /sales/export/excel?{params}
   ↓
10. Recebe arquivo Excel (Blob)
    ↓
11. Download automático: vendas-2025-11-10.xlsx
    ↓
12. Toast de sucesso
    ↓
13. Modal fecha automaticamente
```

### 7. Validações e UX

**✅ Validações:**
- Todos os filtros são opcionais
- Valores numéricos validados (min: 0, step: 0.01)
- Datas no formato ISO 8601
- Loading states durante carregamento de listas

**✅ UX Melhorias:**
- Lazy loading para otimizar performance
- Cache de clientes e métodos de pagamento
- Contador dinâmico de filtros ativos
- Botão "Limpar Filtros" contextual
- Loading states em botões
- Mensagens de feedback (toast)
- Modal fecha automaticamente após exportação bem-sucedida

**✅ Acessibilidade:**
- Labels corretos em todos os campos
- Placeholders informativos
- Estados disabled apropriados
- IDs únicos para campos

### 8. Exemplo de Uso

**Cenário 1: Exportar Todas as Vendas**
```
1. Clica em "Exportar Excel"
2. Não seleciona nenhum filtro
3. Clica em "Exportar Excel"
→ Resultado: Todas as vendas são exportadas
```

**Cenário 2: Exportar Vendas de um Cliente Específico**
```
1. Clica em "Exportar Excel"
2. Seleciona cliente "João Silva"
3. Clica em "Exportar Excel"
→ Resultado: Apenas vendas do João Silva
```

**Cenário 3: Exportar Vendas Concluídas do Mês**
```
1. Clica em "Exportar Excel"
2. Status: "Concluída"
3. Data Inicial: "2025-11-01"
4. Data Final: "2025-11-30"
5. Clica em "Exportar Excel"
→ Resultado: Vendas concluídas de novembro/2025
```

**Cenário 4: Exportar Vendas Acima de R$ 5.000**
```
1. Clica em "Exportar Excel"
2. Valor Mínimo: "5000"
3. Clica em "Exportar Excel"
→ Resultado: Vendas com valor >= R$ 5.000,00
```

**Cenário 5: Filtros Combinados**
```
1. Clica em "Exportar Excel"
2. Status: "Concluída"
3. Método de Pagamento: "Cartão de Crédito"
4. Data Inicial: "2025-01-01"
5. Valor Mínimo: "1000"
6. Clica em "Exportar Excel"
→ Resultado: Vendas concluídas, pagas com cartão, desde janeiro, acima de R$ 1.000
```

## Diferenças entre Antes e Depois

| Aspecto | ❌ Antes | ✅ Agora |
|---------|---------|---------|
| **Filtros** | Usava filtros da tela de busca | Filtros independentes no modal |
| **Cliente** | Não permitia filtrar | Seleciona cliente específico |
| **Método Pagamento** | Não permitia filtrar | Seleciona método específico |
| **UX** | Exportação direta | Modal com preview de filtros |
| **Feedback** | Apenas toast | Contador + botão limpar + toast |
| **Performance** | N/A | Lazy loading de listas |

## Status
✅ **Implementado e Validado**
- Zero erros de compilação
- Modal completo com 7 filtros
- Lazy loading implementado
- Cache de listas funcionando
- Download automático
- UX polida com feedback visual

## Arquivos Modificados
- ✅ `/app/dashboard/vendas/page.tsx` - Modal de exportação Excel adicionado
