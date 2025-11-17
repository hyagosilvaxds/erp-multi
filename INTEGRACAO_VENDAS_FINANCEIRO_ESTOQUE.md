# Integração de Vendas com Financeiro e Estoque ✅

## 📋 Resumo

Atualização das APIs de **Contas a Receber** e **Movimentações de Estoque** para suportar vinculação com vendas, permitindo rastreabilidade completa das operações comerciais.

---

## 🎯 O que foi Implementado

### 1. **Contas a Receber - Vinculação com Vendas**

#### Tipos Atualizados (`lib/api/financial.ts`)

```typescript
export interface AccountReceivable {
  // ... campos existentes
  saleId?: string | null // ID da venda relacionada
  sale?: { // Dados da venda relacionada
    id: string
    code: string
    status: string
    totalAmount: number
    customer?: {
      id: string
      name?: string | null
      companyName?: string | null
      personType: 'FISICA' | 'JURIDICA'
    }
  }
  // ... demais campos
}
```

#### API Atualizada

```typescript
accountsReceivableApi.getAll(params: {
  companyId: string
  status?: ReceivableStatus
  startDate?: string
  endDate?: string
  categoryId?: string
  customerId?: string
  saleId?: string // ✅ NOVO: Filtrar por venda
}): Promise<AccountReceivable[]>
```

---

### 2. **Movimentações de Estoque - Vinculação com Vendas**

#### Tipos Atualizados (`lib/api/products.ts`)

```typescript
export interface StockMovement {
  // ... campos existentes
  saleId?: string | null // ID da venda relacionada
  sale?: { // Dados da venda relacionada
    id: string
    code: string
    status: string
    totalAmount: number
    customer?: {
      id: string
      name?: string | null
      companyName?: string | null
      personType: 'FISICA' | 'JURIDICA'
    }
  }
  // ... demais campos
}

export interface ListStockMovementsParams {
  type?: StockMovementType
  locationId?: string
  saleId?: string // ✅ NOVO: Filtrar por venda
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}
```

#### APIs Atualizadas

```typescript
// Listar movimentações de um produto específico
productsApi.getStockMovements(
  productId: string,
  params?: ListStockMovementsParams // Agora com saleId
): Promise<ListStockMovementsResponse>

// ✅ NOVO: Listar todas as movimentações (sem filtro de produto)
productsApi.getAllStockMovements(
  params?: ListStockMovementsParams
): Promise<ListStockMovementsResponse>
```

---

## 📡 Endpoints da API

### Contas a Receber

#### ✅ Listar Contas a Receber da Venda

**Endpoint**: `GET /financial/accounts-receivable?saleId={saleId}`

**Query Parameters**:
- `companyId` (obrigatório): UUID da empresa
- `saleId` (opcional): UUID da venda para filtrar
- `status` (opcional): Status das contas (PENDENTE, RECEBIDO, VENCIDO, PARCIAL, CANCELADO)
- `customerId` (opcional): UUID do cliente
- `startDate` (opcional): Data inicial (formato ISO)
- `endDate` (opcional): Data final (formato ISO)

**Exemplo**:
```http
GET /financial/accounts-receivable?companyId=company-uuid&saleId=sale-uuid
Authorization: Bearer {token}
```

**Resposta**:
```json
[
  {
    "id": "receivable-uuid",
    "saleId": "sale-uuid",
    "documentNumber": "VEN-2024-0001-1",
    "description": "Venda #VEN-2024-0001 - Parcela 1/3",
    "originalAmount": 183.33,
    "receivedAmount": 0,
    "remainingAmount": 183.33,
    "dueDate": "2024-12-16T00:00:00Z",
    "status": "PENDENTE",
    "installmentNumber": 1,
    "totalInstallments": 3,
    "sale": {
      "id": "sale-uuid",
      "code": "VEN-2024-0001",
      "status": "APPROVED",
      "totalAmount": 550.00,
      "customer": {
        "id": "customer-uuid",
        "name": "João Silva",
        "companyName": null,
        "personType": "FISICA"
      }
    },
    "category": null,
    "centroCusto": null
  }
]
```

---

### Movimentações de Estoque

#### ✅ Listar Movimentações de Estoque da Venda

**Endpoint**: `GET /products/stock-movements?saleId={saleId}`

**Query Parameters**:
- `companyId` (obrigatório): UUID da empresa
- `saleId` (opcional): UUID da venda para filtrar
- `productId` (opcional): UUID do produto
- `type` (opcional): Tipo de movimentação (EXIT, RETURN, ENTRY, ADJUSTMENT, TRANSFER, LOSS)
- `locationId` (opcional): UUID do local de estoque
- `startDate` (opcional): Data inicial (formato ISO)
- `endDate` (opcional): Data final (formato ISO)
- `page` (opcional): Página (padrão: 1)
- `limit` (opcional): Limite por página (padrão: 50)

**Exemplo**:
```http
GET /products/stock-movements?companyId=company-uuid&saleId=sale-uuid
Authorization: Bearer {token}
```

**Resposta**:
```json
{
  "data": [
    {
      "id": "movement-uuid",
      "saleId": "sale-uuid",
      "type": "EXIT",
      "quantity": -5,
      "previousStock": 100,
      "newStock": 95,
      "reason": "Venda aprovada",
      "notes": "Venda #VEN-2024-0001",
      "reference": "VEN-2024-0001",
      "product": {
        "id": "product-uuid",
        "name": "Produto A",
        "sku": "PROD-001",
        "barcode": "7891234567890"
      },
      "location": {
        "id": "location-uuid",
        "name": "Depósito Central",
        "code": "DEP-01",
        "address": "Rua ABC, 123"
      },
      "sale": {
        "id": "sale-uuid",
        "code": "VEN-2024-0001",
        "status": "APPROVED",
        "totalAmount": 550.00,
        "customer": {
          "id": "customer-uuid",
          "name": "João Silva",
          "companyName": null,
          "personType": "FISICA"
        }
      },
      "document": null,
      "createdAt": "2024-11-16T15:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 50,
  "totalPages": 1
}
```

---

## 💻 Exemplos de Uso

### 1. Buscar Contas a Receber de uma Venda

```typescript
import { accountsReceivableApi } from '@/lib/api/financial'

// Buscar todas as parcelas de uma venda
const receivables = await accountsReceivableApi.getAll({
  companyId: selectedCompany.id,
  saleId: 'sale-uuid'
})

console.log(`Encontradas ${receivables.length} parcelas`)
receivables.forEach(r => {
  console.log(`Parcela ${r.installmentNumber}/${r.totalInstallments}`)
  console.log(`Valor: ${r.originalAmount}`)
  console.log(`Vencimento: ${r.dueDate}`)
  console.log(`Status: ${r.status}`)
  if (r.sale) {
    console.log(`Venda: ${r.sale.code}`)
    console.log(`Cliente: ${r.sale.customer?.name || r.sale.customer?.companyName}`)
  }
})
```

---

### 2. Buscar Movimentações de Estoque de uma Venda

```typescript
import { productsApi } from '@/lib/api/products'

// Buscar todas as movimentações de estoque de uma venda
const { data: movements, total } = await productsApi.getAllStockMovements({
  saleId: 'sale-uuid'
})

console.log(`Encontradas ${total} movimentações`)
movements.forEach(m => {
  console.log(`Produto: ${m.product?.name}`)
  console.log(`Tipo: ${m.type}`)
  console.log(`Quantidade: ${m.quantity}`)
  console.log(`Local: ${m.location?.name}`)
  if (m.sale) {
    console.log(`Venda: ${m.sale.code}`)
    console.log(`Cliente: ${m.sale.customer?.name || m.sale.customer?.companyName}`)
  }
})
```

---

### 3. Exemplo Completo: Buscar Dados de uma Venda

```typescript
import { salesApi } from '@/lib/api/sales'
import { accountsReceivableApi } from '@/lib/api/financial'
import { productsApi } from '@/lib/api/products'

async function getSaleData(saleId: string, companyId: string) {
  // Buscar dados da venda
  const sale = await salesApi.getById(saleId)
  
  // Buscar contas a receber
  const receivables = await accountsReceivableApi.getAll({
    companyId,
    saleId
  })
  
  // Buscar movimentações de estoque
  const { data: stockMovements } = await productsApi.getAllStockMovements({
    saleId
  })
  
  return {
    sale,
    receivables,
    stockMovements,
    summary: {
      totalReceivable: receivables.reduce((sum, r) => sum + r.remainingAmount, 0),
      paidAmount: receivables.reduce((sum, r) => sum + r.receivedAmount, 0),
      productsCount: sale.items.length,
      stockMovementsCount: stockMovements.length
    }
  }
}

// Usar
const data = await getSaleData('sale-uuid', 'company-uuid')
console.log('Resumo da Venda:')
console.log(`Código: ${data.sale.code}`)
console.log(`Total: R$ ${data.sale.totalAmount.toFixed(2)}`)
console.log(`A Receber: R$ ${data.summary.totalReceivable.toFixed(2)}`)
console.log(`Pago: R$ ${data.summary.paidAmount.toFixed(2)}`)
console.log(`Produtos: ${data.summary.productsCount}`)
console.log(`Movimentações de Estoque: ${data.summary.stockMovementsCount}`)
```

---

## 🔄 Fluxo de Integração

### Quando uma Venda é Aprovada:

```
1. Sistema cria venda (POST /sales)
2. Backend cria contas a receber automaticamente
   - Vincula saleId em cada parcela
   - Preenche dados do cliente
   - Gera número de documento (ex: VEN-2024-0001-1)

3. Backend cria movimentações de estoque automaticamente
   - Vincula saleId
   - Tipo EXIT para cada produto vendido
   - Atualiza estoque em cada local
   - Registra referência à venda

4. Frontend pode consultar:
   - Contas a receber: GET /accounts-receivable?saleId={id}
   - Movimentações: GET /stock-movements?saleId={id}
```

---

## 🎨 Componentes UI (Sugestões)

### Componente de Contas a Receber da Venda

```typescript
'use client'

import { useState, useEffect } from 'react'
import { accountsReceivableApi, type AccountReceivable } from '@/lib/api/financial'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SaleReceivablesProps {
  saleId: string
  companyId: string
}

export function SaleReceivables({ saleId, companyId }: SaleReceivablesProps) {
  const [receivables, setReceivables] = useState<AccountReceivable[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReceivables()
  }, [saleId])

  const loadReceivables = async () => {
    try {
      const data = await accountsReceivableApi.getAll({
        companyId,
        saleId
      })
      setReceivables(data)
    } catch (error) {
      console.error('Erro ao carregar contas:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      PENDENTE: 'bg-yellow-100 text-yellow-800',
      RECEBIDO: 'bg-green-100 text-green-800',
      VENCIDO: 'bg-red-100 text-red-800',
      PARCIAL: 'bg-blue-100 text-blue-800',
      CANCELADO: 'bg-gray-100 text-gray-800',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100'
  }

  if (loading) return <div>Carregando...</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contas a Receber</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {receivables.map((r) => (
            <div key={r.id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">
                  Parcela {r.installmentNumber}/{r.totalInstallments}
                </p>
                <p className="text-sm text-muted-foreground">
                  Vencimento: {new Date(r.dueDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">
                  R$ {r.remainingAmount.toFixed(2)}
                </p>
                <Badge className={getStatusColor(r.status)}>
                  {r.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

---

### Componente de Movimentações de Estoque da Venda

```typescript
'use client'

import { useState, useEffect } from 'react'
import { productsApi, type StockMovement } from '@/lib/api/products'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowDownRight } from 'lucide-react'

interface SaleStockMovementsProps {
  saleId: string
}

export function SaleStockMovements({ saleId }: SaleStockMovementsProps) {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMovements()
  }, [saleId])

  const loadMovements = async () => {
    try {
      const { data } = await productsApi.getAllStockMovements({ saleId })
      setMovements(data)
    } catch (error) {
      console.error('Erro ao carregar movimentações:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Carregando...</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Movimentações de Estoque</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {movements.map((m) => (
            <div key={m.id} className="flex items-center gap-4 p-3 border rounded">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <ArrowDownRight className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  {m.product?.name || 'Produto'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {m.location?.name} ({m.location?.code})
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-red-600">
                  {m.quantity} un
                </p>
                <p className="text-xs text-muted-foreground">
                  Estoque: {m.previousStock} → {m.newStock}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## ✅ Checklist de Implementação

### Backend (API):
- [ ] Criar campo `saleId` na tabela `accounts_receivable`
- [ ] Criar campo `saleId` na tabela `stock_movements`
- [ ] Adicionar relação `sale` nos endpoints GET
- [ ] Implementar filtro `?saleId=` em `/financial/accounts-receivable`
- [ ] Implementar filtro `?saleId=` em `/products/stock-movements`
- [ ] Atualizar lógica de criação de venda para vincular automaticamente
- [ ] Incluir dados do cliente no objeto `sale`

### Frontend (Tipos):
- [x] Atualizar interface `AccountReceivable` com `saleId` e `sale`
- [x] Atualizar interface `StockMovement` com `saleId` e `sale`
- [x] Adicionar `saleId` em `ListStockMovementsParams`
- [x] Adicionar `saleId` em params de `accountsReceivableApi.getAll()`
- [x] Criar método `productsApi.getAllStockMovements()`

### Frontend (UI):
- [ ] Adicionar filtro por venda na listagem de contas a receber
- [ ] Adicionar filtro por venda na listagem de movimentações
- [ ] Criar componente `SaleReceivables` para exibir parcelas
- [ ] Criar componente `SaleStockMovements` para exibir movimentações
- [ ] Adicionar seção na página de detalhes da venda
- [ ] Adicionar badges indicando vínculo com venda

### Testes:
- [ ] Testar criação de venda com geração automática de contas
- [ ] Testar criação de venda com movimentações de estoque
- [ ] Testar filtro por `saleId` em contas a receber
- [ ] Testar filtro por `saleId` em movimentações
- [ ] Testar resposta incluindo dados da venda e cliente

---

## 📚 Documentação Relacionada

- `API_VENDAS_COMPLETA.md` - Documentação completa da API de vendas
- `MODULO_VENDAS.md` - Módulo de vendas implementado
- `LANCAMENTOS_FINANCEIROS_IMPLEMENTADO.md` - Contas a pagar e receber
- `SISTEMA_MOVIMENTACOES_ESTOQUE.md` - Sistema de movimentações

---

## 🔗 Benefícios da Integração

### 1. **Rastreabilidade Completa**
- Ver todas as parcelas de uma venda específica
- Ver todas as movimentações de estoque de uma venda
- Histórico completo de operações comerciais

### 2. **Análises Financeiras**
- Calcular inadimplência por venda
- Analisar lucratividade real (considerando recebimentos)
- Relatórios de vendas X recebimentos

### 3. **Gestão de Estoque**
- Rastrear saídas por venda
- Vincular devoluções à venda original
- Auditoria de movimentações

### 4. **Experiência do Usuário**
- Visão unificada da venda
- Menos cliques para obter informações
- Dados contextualizados

---

**Data**: 16 de novembro de 2025  
**Status**: ✅ Tipos TypeScript Atualizados (Backend pendente)
