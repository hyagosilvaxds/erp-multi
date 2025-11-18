# Atualização da Tela de Criação de Vendas

## 📋 Resumo

A tela de criação de vendas foi completamente atualizada para incluir **todos os campos da API** e permitir a **seleção de local de estoque** para cada produto.

**Data:** 10 de novembro de 2025  
**Arquivo:** `/app/dashboard/vendas/nova/page.tsx`  
**API:** `/lib/api/sales.ts`  
**Status:** ✅ Implementado e Funcional

---

## 🎯 Novos Campos Implementados

### 1️⃣ Status Inicial da Venda

**Campo:** `status`  
**Tipo:** Select  
**Opções:**
- `QUOTE` - Orçamento (padrão)
- `PENDING_APPROVAL` - Aguardando Aprovação

**Comportamento:**
- Orçamentos não afetam o estoque
- Pendente de aprovação exige local de estoque

### 2️⃣ Descontos Flexíveis

**Campos:**
- `discountPercent` - Desconto em porcentagem (0-100%)
- `discountAmount` - Desconto em valor fixo (R$)

**Comportamento:**
- Usar UM ou OUTRO (não ambos)
- Ao preencher um, o outro é zerado automaticamente
- Cálculo automático do desconto total

### 3️⃣ Valores Adicionais

**Frete:**
- Campo: `shippingCost`
- Tipo: Number (R$)
- Adicionado ao total

**Outras Despesas:**
- Campo: `otherCharges`
- Tipo: Number (R$)
- Campo: `otherChargesDesc`
- Tipo: Text
- Descrição obrigatória se valor > 0

### 4️⃣ Observações Separadas

**Observações Visíveis:**
- Campo: `notes`
- Exibidas ao cliente
- 3 linhas

**Notas Internas:**
- Campo: `internalNotes`
- NÃO visíveis ao cliente
- Uso interno da equipe
- 3 linhas

### 5️⃣ Validade do Orçamento

**Campo:** `validUntil`  
**Tipo:** Date  
**Visível:** Apenas quando `status === "QUOTE"`  
**Uso:** Define data de expiração do orçamento

### 6️⃣ Endereço de Entrega Customizado

**Checkbox:** `useCustomerAddress`  
**Padrão:** true (usar endereço do cliente)

**Campos do Endereço:** (visíveis se checkbox desmarcado)
- `deliveryStreet` * - Logradouro
- `deliveryNumber` * - Número
- `deliveryComplement` - Complemento (opcional)
- `deliveryNeighborhood` * - Bairro
- `deliveryCity` * - Cidade
- `deliveryState` * - Estado (2 letras, auto-uppercase)
- `deliveryZipCode` * - CEP

### 7️⃣ Local de Estoque por Item ⭐

**Campo:** `stockLocationId`  
**Tipo:** Select  
**Onde:** Dialog de adicionar produto  
**Obrigatório:** 
- ❌ Para orçamentos (QUOTE)
- ✅ Para vendas (PENDING_APPROVAL)

**Funcionalidades:**
- Lista todos os locais ativos
- Marca local padrão
- Mostra estoque disponível naquele local (se produto gerencia estoque)
- Validação de estoque ao adicionar

**Exibição:**
- Nome do local na tabela de itens
- Badge "Não definido" se não selecionado

### 8️⃣ Observações por Item

**Campo:** `notes` (por item)  
**Tipo:** Textarea  
**Onde:** Dialog de adicionar produto  
**Uso:** Observações específicas do produto

**Exibição:**
- Mostrado abaixo do nome do produto na tabela
- Texto pequeno e discreto

---

## 🏗️ Estrutura da Tela

### Layout Principal

```
┌─────────────────────────────────────────────────────────┐
│  ← Voltar         Nova Venda / Orçamento                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  COLUNA ESQUERDA (Principal)     │  COLUNA DIREITA      │
│                                   │  (Lateral)           │
│  ┌─ Cliente ───────────────────┐ │  ┌─ Status ────────┐ │
│  │ Select de clientes          │ │  │ QUOTE/PENDING   │ │
│  └─────────────────────────────┘ │  └─────────────────┘ │
│                                   │                      │
│  ┌─ Itens ─────────────────────┐ │  ┌─ Pagamento ─────┐ │
│  │ [+ Adicionar Produto]       │ │  │ Método          │ │
│  │ Tabela:                     │ │  │ Parcelas        │ │
│  │ - Produto                   │ │  └─────────────────┘ │
│  │ - Local de Estoque ⭐       │ │                      │
│  │ - Quantidade                │ │  ┌─ Resumo ────────┐ │
│  │ - Preço                     │ │  │ Subtotal        │ │
│  │ - Desconto                  │ │  │ Desconto %      │ │
│  │ - Total                     │ │  │ Desconto R$     │ │
│  │ - [Remover]                 │ │  │ Frete           │ │
│  └─────────────────────────────┘ │  │ Outras Despesas │ │
│                                   │  │ ──────────────  │ │
│  ┌─ Observações ──────────────┐ │  │ TOTAL           │ │
│  │ Visível ao cliente         │ │  └─────────────────┘ │
│  │ Notas internas             │ │                      │
│  │ Validade (se orçamento)    │ │                      │
│  └─────────────────────────────┘ │                      │
│                                   │                      │
│  ┌─ Endereço de Entrega ─────┐ │                      │
│  │ [✓] Usar endereço cliente │ │                      │
│  │ Ou preencher manualmente  │ │                      │
│  └─────────────────────────────┘ │                      │
│                                                          │
│         [Cancelar] [Orçamento] [Criar Venda]            │
└─────────────────────────────────────────────────────────┘
```

### Dialog de Adicionar Produto

```
┌─ Adicionar Produto ──────────────────────────────┐
│                                                   │
│  🔍 [Digite o nome, SKU...]         [⟳ loading]  │
│  Digite pelo menos 2 caracteres                  │
│                                                   │
│  ┌─ Resultados (5) ───────────────────────────┐  │
│  │ [Produto 1] Nome, SKU, Estoque, Preço     │  │
│  │ [Produto 2] ...                           │  │
│  │ ...                                       │  │
│  └───────────────────────────────────────────┘  │
│                                                   │
│  ─── APÓS SELEÇÃO ───                            │
│                                                   │
│  ┌─ Produto Selecionado ─────────[Trocar]─────┐  │
│  │ Nome, Descrição                            │  │
│  │ SKU, Código, Estoque, Categoria            │  │
│  │ Preço: R$ XXXX                            │  │
│  └─────────────────────────────────────────────┘  │
│                                                   │
│  [Quantidade]         [Preço Unitário]           │
│  [Desconto]           [⭐ Local de Estoque]      │
│  [Observações do Item]                           │
│                                                   │
│  Subtotal: R$ XXX                                │
│  Desconto: R$ XXX                                │
│  Total: R$ XXX                                   │
│                                                   │
│               [Cancelar]  [Adicionar]            │
└───────────────────────────────────────────────────┘
```

---

## 🔧 Mudanças Técnicas

### 1. Estados Adicionados

```typescript
// Status e controle
const [status, setStatus] = useState<"QUOTE" | "PENDING_APPROVAL">("QUOTE")
const [stockLocations, setStockLocations] = useState<StockLocation[]>([])
const [loadingStockLocations, setLoadingStockLocations] = useState(true)

// Descontos
const [discountPercent, setDiscountPercent] = useState(0)
const [discountAmount, setDiscountAmount] = useState(0)

// Valores adicionais
const [shippingCost, setShippingCost] = useState(0)
const [otherCharges, setOtherCharges] = useState(0)
const [otherChargesDesc, setOtherChargesDesc] = useState("")

// Observações
const [internalNotes, setInternalNotes] = useState("")
const [validUntil, setValidUntil] = useState("")

// Endereço
const [useCustomerAddress, setUseCustomerAddress] = useState(true)
const [deliveryStreet, setDeliveryStreet] = useState("")
const [deliveryNumber, setDeliveryNumber] = useState("")
const [deliveryComplement, setDeliveryComplement] = useState("")
const [deliveryNeighborhood, setDeliveryNeighborhood] = useState("")
const [deliveryCity, setDeliveryCity] = useState("")
const [deliveryState, setDeliveryState] = useState("")
const [deliveryZipCode, setDeliveryZipCode] = useState("")

// Por item
const [productStockLocationId, setProductStockLocationId] = useState("")
const [productNotes, setProductNotes] = useState("")
```

### 2. Interface SaleItemForm Atualizada

```typescript
interface SaleItemForm {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discount: number
  stockLocationId?: string      // ⭐ NOVO
  stockLocationName?: string     // ⭐ NOVO
  notes?: string                 // ⭐ NOVO
  subtotal: number
  total: number
}
```

### 3. Nova Função: loadStockLocations()

```typescript
const loadStockLocations = async () => {
  try {
    setLoadingStockLocations(true)
    const data = await stockLocationsApi.getAll()
    setStockLocations(data.filter(loc => loc.active))
  } catch (error: any) {
    toast({
      title: "Erro ao carregar locais de estoque",
      description: error.response?.data?.message || "Tente novamente mais tarde.",
      variant: "destructive",
    })
  } finally {
    setLoadingStockLocations(false)
  }
}
```

### 4. Função calculateDiscount() Atualizada

```typescript
const calculateDiscount = () => {
  const subtotal = calculateSubtotal()
  if (discountPercent > 0) {
    return (subtotal * discountPercent) / 100
  }
  return discountAmount
}
```

### 5. Função calculateTotal() Atualizada

```typescript
const calculateTotal = () => {
  const subtotal = calculateSubtotal()
  const discount = calculateDiscount()
  return subtotal - discount + shippingCost + otherCharges
}
```

### 6. CreateSaleDto Completo

```typescript
const dto: CreateSaleDto = {
  customerId,
  status: asQuote ? "QUOTE" : status,
  items: items.map(item => ({
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    discount: item.discount || undefined,
    stockLocationId: item.stockLocationId || undefined,  // ⭐
    notes: item.notes || undefined,                       // ⭐
  })),
  ...(paymentMethodId && { paymentMethodId }),
  installments: installments > 1 ? installments : undefined,
  discountPercent: discountPercent > 0 ? discountPercent : undefined,
  discountAmount: discountAmount > 0 ? discountAmount : undefined,
  shippingCost: shippingCost > 0 ? shippingCost : undefined,
  otherCharges: otherCharges > 0 ? otherCharges : undefined,
  otherChargesDesc: otherChargesDesc || undefined,
  notes: notes || undefined,
  internalNotes: internalNotes || undefined,
  validUntil: validUntil || undefined,
  useCustomerAddress,
  deliveryAddress: !useCustomerAddress && deliveryStreet ? {
    street: deliveryStreet,
    number: deliveryNumber,
    complement: deliveryComplement || undefined,
    neighborhood: deliveryNeighborhood,
    city: deliveryCity,
    state: deliveryState,
    zipCode: deliveryZipCode,
  } : undefined,
}
```

---

## 📊 Validações Implementadas

### Gerais

1. ✅ Cliente obrigatório
2. ✅ Pelo menos 1 item
3. ✅ Local de estoque obrigatório (se status !== "QUOTE")
4. ✅ Descrição obrigatória se `otherCharges` > 0
5. ✅ Endereço completo se `useCustomerAddress` === false

### Por Item

1. ✅ Quantidade > 0
2. ✅ Preço > 0
3. ✅ Estoque suficiente (se produto gerencia estoque)
4. ✅ Produto não duplicado
5. ✅ Local de estoque válido

### Desconto Exclusivo

```typescript
// Ao mudar discountPercent
onChange={(e) => {
  setDiscountPercent(Number(e.target.value))
  if (Number(e.target.value) > 0) setDiscountAmount(0)
}}

// Ao mudar discountAmount
onChange={(e) => {
  setDiscountAmount(Number(e.target.value))
  if (Number(e.target.value) > 0) setDiscountPercent(0)
}}
```

---

## 🎨 Melhorias de UX/UI

### 1. Status Visual por Tipo

**Orçamento (QUOTE):**
- 🟡 Ícone amarelo
- Texto: "Orçamentos não afetam o estoque"
- Campo "Válido Até" visível
- Local de estoque opcional

**Aguardando Aprovação:**
- 🔵 Ícone azul
- Texto: "Configure o pagamento"
- Local de estoque obrigatório

### 2. Feedback Visual na Tabela

**Coluna "Local":**
- ✅ Nome do local (se definido)
- ❌ Badge "Não definido" (texto pequeno, cinza)

**Observações do Item:**
- Exibidas abaixo do nome do produto
- Texto pequeno (text-xs)
- Cor cinza claro

### 3. Resumo Financeiro Detalhado

```
Subtotal:         R$ 1.000,00
─────────────────
Desconto (10%):  -R$   100,00
Frete:           +R$    50,00
Outras Despesas: +R$    25,00
─────────────────────────────
TOTAL:            R$   975,00

3x de R$ 325,00
```

### 4. Dialog de Produto Aprimorado

**Estoque por Local:**
```
┌─ Local de Estoque ────────────┐
│ [Depósito Principal (Padrão)] │
└───────────────────────────────┘
Estoque neste local: 50 unidades
```

**Se não gerencia estoque:**
```
Campo de local visível, mas sem validação de quantidade
```

---

## 🚀 Fluxos de Uso

### Fluxo 1: Criar Orçamento Simples

```
1. Selecionar cliente
2. Adicionar produtos (sem local de estoque)
3. Preencher observações
4. Definir data de validade
5. Clicar em "Salvar como Orçamento"
```

### Fluxo 2: Criar Venda Confirmada

```
1. Selecionar status "Aguardando Aprovação"
2. Selecionar cliente
3. Adicionar produtos + SELECIONAR LOCAL DE ESTOQUE
4. Definir método de pagamento
5. Preencher descontos/frete
6. Clicar em "Criar Venda"
```

### Fluxo 3: Endereço Customizado

```
1. Desmarcar "Usar endereço do cliente"
2. Formulário de endereço aparece
3. Preencher todos os campos obrigatórios
4. Continuar com a criação
```

### Fluxo 4: Desconto Complexo

```
1. Adicionar itens (subtotal: R$ 1.000)
2. Aplicar 10% de desconto (-R$ 100)
3. Adicionar frete (+R$ 50)
4. Adicionar embalagem especial (+R$ 25)
5. Total: R$ 975
```

---

## 📝 Atualizações na API

### Interface CreateSaleDto

Adicionados os seguintes campos:

```typescript
export interface CreateSaleDto {
  // Obrigatórios
  customerId: string
  items: CreateSaleItemDto[]
  
  // ⭐ NOVOS OPCIONAIS ⭐
  status?: "QUOTE" | "PENDING_APPROVAL"
  paymentMethodId?: string
  installments?: number
  
  // Descontos
  discountPercent?: number
  discountAmount?: number
  
  // Valores adicionais
  shippingCost?: number
  otherCharges?: number
  otherChargesDesc?: string
  
  // Endereço de entrega
  useCustomerAddress?: boolean
  deliveryAddress?: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
  
  // Observações
  notes?: string
  internalNotes?: string
  
  // Validade
  validUntil?: string
  
  // Compatibilidade (deprecated)
  discount?: number
  shipping?: number
  deliveryDate?: string
  saleDate?: string
}
```

### Interface CreateSaleItemDto

```typescript
export interface CreateSaleItemDto {
  productId: string
  quantity: number
  unitPrice: number
  discount?: number
  stockLocationId?: string  // ⭐ NOVO
  notes?: string            // ⭐ NOVO
}
```

---

## ✅ Checklist de Implementação

### Backend (API)
- [x] Atualizar CreateSaleDto
- [x] Atualizar CreateSaleItemDto
- [x] Adicionar campos opcionais

### Frontend (Tela)
- [x] Adicionar campo de status
- [x] Adicionar desconto % e R$
- [x] Adicionar frete e outras despesas
- [x] Adicionar observações separadas
- [x] Adicionar validade do orçamento
- [x] Adicionar endereço de entrega customizado
- [x] Adicionar local de estoque no dialog
- [x] Adicionar observações por item
- [x] Atualizar tabela de itens
- [x] Atualizar resumo financeiro
- [x] Atualizar validações
- [x] Atualizar função de submissão
- [x] Carregar locais de estoque
- [x] Testar todos os fluxos

### Validações
- [x] Local obrigatório para vendas
- [x] Desconto exclusivo (% OU R$)
- [x] Estoque por local
- [x] Endereço completo se customizado
- [x] Descrição se outras despesas > 0

### UX/UI
- [x] Layout 2 colunas responsivo
- [x] Cards organizados
- [x] Feedback visual claro
- [x] Loading states
- [x] Toast notifications
- [x] Campos condicionais

---

## 🎉 Resultado Final

✅ **Todos os campos da API implementados**  
✅ **Seleção de local de estoque funcional**  
✅ **Validações completas**  
✅ **UX/UI intuitiva**  
✅ **Fluxos de orçamento e venda separados**  
✅ **Zero erros de compilação**  
✅ **Type-safe com TypeScript**

---

## 📚 Documentação Relacionada

1. **`MODULO_VENDAS.md`** - Documentação geral do módulo
2. **`API_VENDAS_COMPLETA.md`** - Documentação da API
3. **`INTEGRACAO_BUSCA_PRODUTOS.md`** - Busca de produtos
4. **`RESUMO_IMPLEMENTACAO_VENDAS.md`** - Resumo da implementação

---

**Desenvolvedor:** GitHub Copilot  
**Data:** 10 de novembro de 2025  
**Status:** ✅ Implementação Completa  
**Versão:** 2.0.0
