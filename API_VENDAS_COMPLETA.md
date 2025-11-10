# API de Vendas - Documentação Completa

## 📋 Visão Geral

API completa para gerenciamento de vendas com suporte a orçamentos, aprovações, análise de crédito, gerenciamento de itens e estatísticas.

**Versão:** 1.0.0  
**Status:** ✅ Implementado  
**Última Atualização:** Novembro 2025

---

## 🎯 Funcionalidades Implementadas

### ✅ CRUD de Vendas
- Listar vendas com filtros avançados
- Buscar venda específica por ID
- Criar nova venda (orçamento)
- Atualizar venda (apenas DRAFT)
- Excluir venda

### ✅ Workflow de Aprovação
- Aprovar venda (com ou sem análise de crédito)
- Cancelar venda (com motivo obrigatório)
- Concluir venda (marcar como finalizada)

### ✅ Gerenciamento de Itens
- Adicionar item à venda
- Atualizar item existente
- Remover item da venda

### ✅ Estatísticas e Relatórios
- Buscar estatísticas de vendas por período
- Top clientes e produtos
- Vendas por método de pagamento
- Análise por status

---

## 📊 Tipos TypeScript

### Enums e Status

```typescript
// Status da venda
export type SaleStatus = 
  | "DRAFT"              // Orçamento/Rascunho
  | "PENDING_APPROVAL"   // Aguardando aprovação
  | "APPROVED"           // Aprovada
  | "COMPLETED"          // Concluída
  | "CANCELED"           // Cancelada

// Status de análise de crédito
export type CreditAnalysisStatus = 
  | "PENDING"    // Aguardando análise
  | "APPROVED"   // Crédito aprovado
  | "REJECTED"   // Crédito rejeitado
```

### Interfaces Principais

```typescript
// Venda completa
export interface Sale {
  id: string
  companyId: string
  customerId: string
  paymentMethodId: string
  saleNumber: string
  status: SaleStatus
  saleDate: string
  deliveryDate: string | null
  subtotal: number
  discount: number
  shipping: number
  totalAmount: number
  installments: number
  notes: string | null
  creditAnalysisStatus: CreditAnalysisStatus | null
  creditAnalysisNotes: string | null
  approvedAt: string | null
  approvedBy: string | null
  canceledAt: string | null
  canceledBy: string | null
  cancelReason: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
  
  // Relações (lazy loaded)
  items: SaleItem[]
  customer?: {
    id: string
    name: string
    email: string
    document?: string
    cpfCnpj?: string
    phone?: string
  }
  paymentMethod?: {
    id: string
    name: string
    code: string
    type: string
    allowInstallments?: boolean
    maxInstallments?: number
  }
}

// Item da venda
export interface SaleItem {
  id: string
  saleId: string
  productId: string
  quantity: number
  unitPrice: number
  subtotal: number
  discount: number
  totalPrice: number
  createdAt: string
  updatedAt: string
  
  product?: {
    id: string
    name: string
    sku: string
    price?: number
    stockQuantity?: number
  }
}

// DTO para criar venda
export interface CreateSaleDto {
  customerId: string
  paymentMethodId: string
  items: CreateSaleItemDto[]
  installments?: number
  discount?: number
  shipping?: number
  notes?: string
  deliveryDate?: string
  saleDate?: string
}

// DTO para criar item
export interface CreateSaleItemDto {
  productId: string
  quantity: number
  unitPrice: number
  discount?: number
}

// DTO para atualizar venda
export interface UpdateSaleDto {
  customerId?: string
  paymentMethodId?: string
  installments?: number
  discount?: number
  shipping?: number
  notes?: string
  deliveryDate?: string
  saleDate?: string
}

// DTO para adicionar item
export interface AddSaleItemDto {
  productId: string
  quantity: number
  unitPrice: number
  discount?: number
}

// DTO para aprovar venda
export interface ApproveSaleDto {
  creditAnalysisStatus?: "APPROVED" | "REJECTED"
  creditAnalysisNotes?: string
}

// Filtros de listagem
export interface SaleFilters {
  status?: SaleStatus
  customerId?: string
  paymentMethodId?: string
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  search?: string
  page?: number
  limit?: number
}

// Resposta de listagem
export interface SaleListResponse {
  data: Sale[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Estatísticas
export interface SaleStatistics {
  period: {
    startDate: string
    endDate: string
  }
  totalSales: number
  totalRevenue: number
  averageTicket: number
  salesByStatus: {
    DRAFT: number
    PENDING_APPROVAL: number
    APPROVED: number
    COMPLETED: number
    CANCELED: number
  }
  topCustomers: Array<{
    customerId: string
    customerName: string
    totalPurchases: number
    salesCount: number
  }>
  topProducts: Array<{
    productId: string
    productName: string
    totalSold: number
    revenue: number
  }>
  salesByPaymentMethod: Record<string, {
    count: number
    total: number
  }>
}
```

---

## 🔌 Funções da API

### Objeto Exportado

```typescript
export const salesApi = {
  // CRUD
  getAll: getSales,
  getById: getSaleById,
  create: createSale,
  update: updateSale,
  delete: deleteSale,
  
  // Ações de Workflow
  approve: approveSale,
  cancel: cancelSale,
  complete: completeSale,
  
  // Gerenciamento de Itens
  addItem: addSaleItem,
  updateItem: updateSaleItem,
  removeItem: removeSaleItem,
  
  // Estatísticas
  getStatistics: getSaleStatistics,
}
```

### 1. Listar Vendas

```typescript
async function getSales(filters?: SaleFilters): Promise<SaleListResponse>
```

**Uso:**
```typescript
// Listar todas
const vendas = await salesApi.getAll()

// Com filtros
const vendas = await salesApi.getAll({
  status: "APPROVED",
  startDate: "2024-01-01",
  endDate: "2024-12-31",
  minAmount: 1000,
  maxAmount: 5000,
  page: 1,
  limit: 20,
})
```

### 2. Buscar Venda por ID

```typescript
async function getSaleById(id: string): Promise<Sale>
```

**Uso:**
```typescript
const venda = await salesApi.getById("uuid")
```

### 3. Criar Venda

```typescript
async function createSale(dto: CreateSaleDto): Promise<Sale>
```

**Uso:**
```typescript
const novaVenda = await salesApi.create({
  customerId: "uuid-cliente",
  paymentMethodId: "uuid-pagamento",
  items: [
    {
      productId: "uuid-produto",
      quantity: 2,
      unitPrice: 150.00,
      discount: 10.00,
    }
  ],
  discount: 50.00,
  shipping: 25.00,
  notes: "Cliente preferencial",
  deliveryDate: "2024-11-20",
})
```

### 4. Atualizar Venda

```typescript
async function updateSale(id: string, dto: UpdateSaleDto): Promise<Sale>
```

**Uso:**
```typescript
const vendaAtualizada = await salesApi.update("uuid", {
  discount: 100.00,
  notes: "Desconto adicional aplicado",
})
```

### 5. Excluir Venda

```typescript
async function deleteSale(id: string): Promise<void>
```

**Uso:**
```typescript
await salesApi.delete("uuid")
```

### 6. Aprovar Venda

```typescript
async function approveSale(id: string, dto?: ApproveSaleDto): Promise<Sale>
```

**Uso:**
```typescript
// Aprovação simples (sem análise de crédito)
const vendaAprovada = await salesApi.approve("uuid")

// Aprovação com análise de crédito
const vendaAprovada = await salesApi.approve("uuid", {
  creditAnalysisStatus: "APPROVED",
  creditAnalysisNotes: "Cliente com ótimo histórico. Score: 850",
})

// Reprovação de crédito (cancela automaticamente)
const vendaCancelada = await salesApi.approve("uuid", {
  creditAnalysisStatus: "REJECTED",
  creditAnalysisNotes: "Score abaixo do mínimo (450 < 600)",
})
```

### 7. Cancelar Venda

```typescript
async function cancelSale(id: string, reason: string): Promise<Sale>
```

**Uso:**
```typescript
const vendaCancelada = await salesApi.cancel(
  "uuid",
  "Cliente desistiu da compra"
)
```

### 8. Concluir Venda

```typescript
async function completeSale(id: string): Promise<Sale>
```

**Uso:**
```typescript
const vendaConcluida = await salesApi.complete("uuid")
```

### 9. Adicionar Item

```typescript
async function addSaleItem(saleId: string, dto: AddSaleItemDto): Promise<SaleItem>
```

**Uso:**
```typescript
const novoItem = await salesApi.addItem("uuid-venda", {
  productId: "uuid-produto",
  quantity: 3,
  unitPrice: 75.50,
  discount: 10.00,
})
```

### 10. Atualizar Item

```typescript
async function updateSaleItem(
  saleId: string,
  itemId: string,
  dto: Partial<AddSaleItemDto>
): Promise<SaleItem>
```

**Uso:**
```typescript
const itemAtualizado = await salesApi.updateItem(
  "uuid-venda",
  "uuid-item",
  {
    quantity: 5,
    discount: 25.00,
  }
)
```

### 11. Remover Item

```typescript
async function removeSaleItem(saleId: string, itemId: string): Promise<void>
```

**Uso:**
```typescript
await salesApi.removeItem("uuid-venda", "uuid-item")
```

### 12. Buscar Estatísticas

```typescript
async function getSaleStatistics(
  startDate?: string,
  endDate?: string
): Promise<SaleStatistics>
```

**Uso:**
```typescript
// Estatísticas do mês atual
const stats = await salesApi.getStatistics()

// Estatísticas de período específico
const stats = await salesApi.getStatistics(
  "2024-01-01",
  "2024-12-31"
)
```

---

## 🔄 Fluxo de Status

```
┌─────────────┐
│   DRAFT     │ (Orçamento/Rascunho)
│             │ - Pode adicionar/editar/remover itens
│             │ - Pode atualizar dados da venda
│             │ - Pode excluir
└──────┬──────┘
       │ Enviar para aprovação
       ▼
┌─────────────────┐
│ PENDING_APPROVAL│ (Aguardando Aprovação)
│                 │ - Requer análise de crédito (se configurado)
│                 │ - Pode cancelar
└────┬────────┬───┘
     │        │
     │        │ Rejeitar crédito
     │        ▼
     │   ┌──────────┐
     │   │ CANCELED │
     │   │Cancelado │
     │   └──────────┘
     │
     │ Aprovar (crédito OK)
     ▼
┌─────────────┐
│  APPROVED   │ (Aprovada)
│             │ - Aguarda conclusão
│             │ - Pode cancelar
└──────┬──────┘
       │ Marcar como concluída
       ▼
┌─────────────┐
│ COMPLETED   │ (Concluída)
│             │ - Estado final
│             │ - Não pode ser alterada
└─────────────┘
```

**Regras:**
- Apenas vendas `DRAFT` podem ter itens adicionados/editados/removidos
- Apenas vendas `DRAFT` podem ser atualizadas
- Vendas `COMPLETED` não podem ser canceladas
- Cancelamento requer motivo obrigatório
- Reprovação de crédito cancela automaticamente a venda

---

## 📐 Cálculos Automáticos

### Item da Venda

```typescript
// Subtotal do item
subtotal = quantity × unitPrice

// Total do item (com desconto)
totalPrice = subtotal - discount
```

**Exemplo:**
```
Quantidade: 3
Preço Unitário: R$ 100,00
Desconto: R$ 20,00

Subtotal = 3 × 100 = R$ 300,00
Total = 300 - 20 = R$ 280,00
```

### Venda Completa

```typescript
// Subtotal da venda
subtotal = soma de todos os items.totalPrice

// Total da venda
totalAmount = subtotal - discount + shipping
```

**Exemplo:**
```
Item 1: R$ 280,00
Item 2: R$ 150,00
Subtotal = 280 + 150 = R$ 430,00

Desconto da venda: R$ 30,00
Frete: R$ 25,00

Total = 430 - 30 + 25 = R$ 425,00
```

---

## 🛡️ Validações e Regras de Negócio

### Criação de Venda
- ✅ Cliente obrigatório e deve existir
- ✅ Método de pagamento obrigatório e deve estar ativo
- ✅ Pelo menos 1 item obrigatório
- ✅ Produtos devem existir
- ✅ Quantidade > 0
- ✅ Preço unitário > 0
- ✅ Desconto >= 0
- ✅ Verificar estoque disponível
- ✅ Número de parcelas <= máximo do método de pagamento

### Atualização de Venda
- ✅ Apenas vendas com status `DRAFT` podem ser editadas
- ✅ Mesmas validações da criação

### Aprovação
- ✅ Apenas `DRAFT` ou `PENDING_APPROVAL` podem ser aprovadas
- ✅ Se método requer análise: `creditAnalysisStatus` obrigatório
- ✅ Se aprovado: status -> `APPROVED`
- ✅ Se rejeitado: status -> `CANCELED` automaticamente
- ✅ Verificar estoque novamente antes de aprovar

### Cancelamento
- ✅ Vendas `COMPLETED` não podem ser canceladas
- ✅ Motivo obrigatório (string não vazia)
- ✅ Registra data e usuário que cancelou
- ✅ Estorna estoque (se já reservado)

### Conclusão
- ✅ Apenas vendas `APPROVED` podem ser concluídas
- ✅ Registra data de conclusão
- ✅ Baixa definitiva no estoque

### Gerenciamento de Itens
- ✅ Apenas vendas `DRAFT` permitem alterações
- ✅ Produto não pode ser duplicado na venda
- ✅ Venda deve ter pelo menos 1 item
- ✅ Verificar estoque ao adicionar/atualizar

---

## 🎨 Helpers e Utilidades

### Labels de Status (PT-BR)

```typescript
export const saleStatusLabels: Record<SaleStatus, string> = {
  DRAFT: "Orçamento",
  PENDING_APPROVAL: "Aguardando Aprovação",
  APPROVED: "Aprovado",
  COMPLETED: "Concluído",
  CANCELED: "Cancelado",
}
```

### Cores de Status (Tailwind CSS)

```typescript
export const saleStatusColors: Record<SaleStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  PENDING_APPROVAL: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELED: "bg-red-100 text-red-800",
}
```

**Uso:**
```typescript
<Badge className={saleStatusColors[venda.status]}>
  {saleStatusLabels[venda.status]}
</Badge>
```

---

## 🌐 Endpoints da API REST

Todos os endpoints requerem autenticação via Bearer Token e header `x-company-id`.

### Vendas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/sales` | Listar vendas com filtros |
| `GET` | `/sales/:id` | Buscar venda por ID |
| `POST` | `/sales` | Criar nova venda |
| `PUT` | `/sales/:id` | Atualizar venda (DRAFT) |
| `DELETE` | `/sales/:id` | Excluir venda |
| `POST` | `/sales/:id/approve` | Aprovar venda |
| `POST` | `/sales/:id/cancel` | Cancelar venda |
| `POST` | `/sales/:id/complete` | Concluir venda |

### Itens

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/sales/:id/items` | Adicionar item |
| `PUT` | `/sales/:id/items/:itemId` | Atualizar item |
| `DELETE` | `/sales/:id/items/:itemId` | Remover item |

### Estatísticas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/sales/statistics/summary` | Buscar estatísticas |

---

## 📱 Exemplo de Uso Completo

### Cenário: Criar e Aprovar uma Venda

```typescript
// 1. Criar orçamento (DRAFT)
const venda = await salesApi.create({
  customerId: "uuid-cliente",
  paymentMethodId: "uuid-pix",
  items: [
    {
      productId: "uuid-notebook",
      quantity: 1,
      unitPrice: 3500.00,
    },
    {
      productId: "uuid-mouse",
      quantity: 2,
      unitPrice: 89.90,
      discount: 10.00,
    }
  ],
  discount: 200.00,
  shipping: 50.00,
  notes: "Cliente corporativo - desconto especial",
})

console.log(venda.status) // "DRAFT"
console.log(venda.totalAmount) // 3529.80

// 2. Adicionar mais um item
await salesApi.addItem(venda.id, {
  productId: "uuid-teclado",
  quantity: 1,
  unitPrice: 450.00,
})

// 3. Atualizar desconto
const vendaAtualizada = await salesApi.update(venda.id, {
  discount: 300.00,
})

console.log(vendaAtualizada.totalAmount) // 3779.80

// 4. Aprovar venda (com análise de crédito)
const vendaAprovada = await salesApi.approve(venda.id, {
  creditAnalysisStatus: "APPROVED",
  creditAnalysisNotes: "Cliente aprovado - Score 820",
})

console.log(vendaAprovada.status) // "APPROVED"

// 5. Concluir venda
const vendaConcluida = await salesApi.complete(venda.id)

console.log(vendaConcluida.status) // "COMPLETED"
console.log(vendaConcluida.completedAt) // "2024-11-10T22:00:00.000Z"
```

---

## 🔍 Busca e Filtros Avançados

### Exemplo: Dashboard de Vendas

```typescript
// Buscar vendas pendentes de aprovação
const pendentes = await salesApi.getAll({
  status: "PENDING_APPROVAL",
  page: 1,
  limit: 10,
})

// Buscar vendas de um cliente específico
const vendasCliente = await salesApi.getAll({
  customerId: "uuid-cliente",
})

// Buscar vendas do mês atual acima de R$ 1000
const vendasMes = await salesApi.getAll({
  startDate: "2024-11-01",
  endDate: "2024-11-30",
  minAmount: 1000,
})

// Buscar estatísticas do trimestre
const stats = await salesApi.getStatistics(
  "2024-10-01",
  "2024-12-31"
)

console.log(`Total de vendas: ${stats.totalSales}`)
console.log(`Receita total: R$ ${stats.totalRevenue.toFixed(2)}`)
console.log(`Ticket médio: R$ ${stats.averageTicket.toFixed(2)}`)
console.log(`Top cliente: ${stats.topCustomers[0].customerName}`)
```

---

## ⚠️ Tratamento de Erros

### Erros Comuns

```typescript
try {
  await salesApi.create(dto)
} catch (error: any) {
  if (error.response?.status === 400) {
    // Validação falhou
    console.error(error.response.data.message)
  } else if (error.response?.status === 404) {
    // Recurso não encontrado
    console.error("Cliente ou produto não encontrado")
  } else if (error.response?.status === 409) {
    // Conflito (estoque, duplicata, etc.)
    console.error(error.response.data.message)
  }
}
```

### Status HTTP

| Status | Significado | Exemplo |
|--------|-------------|---------|
| `200` | Sucesso | Venda atualizada |
| `201` | Criado | Nova venda criada |
| `400` | Bad Request | Validação falhou |
| `404` | Not Found | Venda não existe |
| `409` | Conflict | Estoque insuficiente |

---

## 📝 Notas de Desenvolvimento

### Performance
- Paginação padrão: 10 itens
- Máximo por página: 100 itens
- Relações carregadas lazy (customer, paymentMethod, items)
- Índices no banco: saleNumber, status, customerId, saleDate

### Segurança
- Token JWT obrigatório
- Empresa validada via header `x-company-id`
- Usuário registrado em ações (approvedBy, canceledBy)
- Logs de auditoria para alterações críticas

### Observações
- Números de venda são gerados automaticamente (SALE-2024-00001)
- Datas no formato ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
- Valores monetários em número decimal (2 casas)
- Estoque é reservado ao aprovar, baixado ao concluir
- Cancelamento estorna estoque reservado

---

**Desenvolvedor:** GitHub Copilot  
**Data:** Novembro 2025  
**Versão do Documento:** 1.0.0
