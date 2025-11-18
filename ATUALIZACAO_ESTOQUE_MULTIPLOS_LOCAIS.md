# Atualização: Estoque Inicial por Locais na Criação de Produtos

## 📦 Breaking Change - Múltiplos Locais de Estoque

### Visão Geral
A criação de produtos foi atualizada para suportar **estoque inicial distribuído entre múltiplos locais**. Agora, em vez de um único valor de estoque inicial, você pode especificar quantidades diferentes para cada local de armazenamento.

## 🔄 Mudança na API

### ANTES (Versão Antiga):
```json
POST /products
{
  "name": "Produto X",
  "salePrice": 100,
  "manageStock": true,
  "initialStock": 10  // ❌ Estoque único
}
```

### AGORA (Com Múltiplos Locais):
```json
POST /products
{
  "name": "Produto X",
  "salePrice": 100,
  "manageStock": true,
  "initialStockByLocations": [  // ✅ Estoque por local
    {
      "locationId": "uuid-deposito",
      "quantity": 50
    },
    {
      "locationId": "uuid-loja-1",
      "quantity": 30
    },
    {
      "locationId": "uuid-loja-2",
      "quantity": 20
    }
  ]
}
```

**Estoque Total**: 100 unidades (50 + 30 + 20)

## 🎨 Interface Atualizada

### Nova Seção na Aba "Estoque"

A tela de criação de produto agora inclui uma seção interativa para gerenciar o estoque inicial por locais:

```
┌─────────────────────────────────────────────────────────────┐
│ Estoque Inicial por Local                [+ Adicionar Local]│
│ Distribua o estoque inicial entre os locais disponíveis     │
├─────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Local: [Depósito Central ▼]  Quantidade: [50]  [🗑️]  │   │
│ └───────────────────────────────────────────────────────┘   │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Local: [Loja Shopping   ▼]  Quantidade: [30]  [🗑️]  │   │
│ └───────────────────────────────────────────────────────┘   │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Local: [Loja Centro     ▼]  Quantidade: [20]  [🗑️]  │   │
│ └───────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│ Estoque Total: 100 unidades                                 │
└─────────────────────────────────────────────────────────────┘
```

### Funcionalidades da Interface

1. **Botão "Adicionar Local"**
   - Adiciona uma nova linha para selecionar local e quantidade
   - Automaticamente seleciona o primeiro local disponível
   - Desabilita locais já adicionados

2. **Select de Locais**
   - Lista todos os locais de estoque ativos
   - Filtra locais já selecionados (não permite duplicados)
   - Permite trocar o local sem perder a quantidade

3. **Input de Quantidade**
   - Aceita valores numéricos inteiros
   - Mínimo: 0
   - Atualiza o total automaticamente

4. **Botão de Remover**
   - Remove a linha do local
   - Recalcula o estoque total
   - Ícone de lixeira (Trash2)

5. **Display de Estoque Total**
   - Mostra a soma de todas as quantidades
   - Atualiza em tempo real
   - Destacado em negrito

## 🔧 Implementação Técnica

### 1. Nova Interface TypeScript

```typescript
// lib/api/products.ts

export interface InitialStockByLocation {
  locationId: string
  quantity: number
}

export interface CreateProductRequest {
  // ... outros campos
  manageStock?: boolean
  initialStock?: number  // ⚠️ Mantido para compatibilidade
  initialStockByLocations?: InitialStockByLocation[]  // ✅ Novo campo
  minStock?: number
  maxStock?: number
}
```

### 2. Estados do React

```typescript
const [stockLocations, setStockLocations] = useState<StockLocation[]>([])
const [initialStockByLocations, setInitialStockByLocations] = useState<InitialStockByLocation[]>([])
```

### 3. Funções de Gerenciamento

#### handleAddStockLocation()
```typescript
const handleAddStockLocation = () => {
  // Valida se há locais disponíveis
  if (stockLocations.length === 0) {
    toast({ title: "Nenhum local disponível" })
    return
  }

  // Encontra primeiro local não utilizado
  const firstAvailableLocation = stockLocations.find(
    loc => !initialStockByLocations.some(stock => stock.locationId === loc.id)
  )

  // Adiciona novo item com quantidade 0
  setInitialStockByLocations([
    ...initialStockByLocations,
    { locationId: firstAvailableLocation.id, quantity: 0 }
  ])
}
```

#### handleRemoveStockLocation(index)
```typescript
const handleRemoveStockLocation = (index: number) => {
  setInitialStockByLocations(
    initialStockByLocations.filter((_, i) => i !== index)
  )
}
```

#### handleStockLocationChange(index, field, value)
```typescript
const handleStockLocationChange = (
  index: number, 
  field: keyof InitialStockByLocation, 
  value: any
) => {
  const updated = [...initialStockByLocations]
  updated[index] = { ...updated[index], [field]: value }
  setInitialStockByLocations(updated)
}
```

#### getTotalStock()
```typescript
const getTotalStock = () => {
  return initialStockByLocations.reduce(
    (sum, stock) => sum + (stock.quantity || 0), 
    0
  )
}
```

### 4. Envio para API

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  const dataToSend: CreateProductRequest = {
    ...formData,
    // Adicionar locais de estoque inicial se houver
    initialStockByLocations: initialStockByLocations.length > 0 
      ? initialStockByLocations 
      : undefined,
  }
  
  await productsApi.create(dataToSend)
}
```

## ✅ Validações

### Frontend:
- ✅ Não permite selecionar o mesmo local duas vezes
- ✅ Valida se há locais disponíveis antes de adicionar
- ✅ Quantidade mínima: 0
- ✅ Mostra mensagem quando não há locais adicionados
- ✅ Filtra apenas locais ativos

### Backend (Esperado):
- ✅ Valida se todos os `locationId` existem
- ✅ Valida se todos os locais estão ativos
- ✅ Calcula estoque total automaticamente (soma das quantidades)
- ✅ Cria registros de estoque separados para cada local
- ✅ Cria movimentações de estoque separadas para cada local
- ❌ Retorna erro se algum `locationId` não existir
- ❌ Retorna erro se algum local estiver inativo

## 📝 Fluxo de Uso

### Cenário 1: Produto com Estoque em Múltiplos Locais

1. Usuário cria novo produto
2. Ativa "Gerenciar Estoque"
3. Clica em "Adicionar Local"
4. Seleciona "Depósito Central" e adiciona 50 unidades
5. Clica em "Adicionar Local" novamente
6. Seleciona "Loja 1" e adiciona 30 unidades
7. Clica em "Adicionar Local" novamente
8. Seleciona "Loja 2" e adiciona 20 unidades
9. Vê "Estoque Total: 100 unidades"
10. Salva o produto

**Resultado:** Produto criado com 100 unidades distribuídas em 3 locais

### Cenário 2: Produto sem Estoque Inicial

1. Usuário cria novo produto
2. Ativa "Gerenciar Estoque"
3. Não adiciona nenhum local
4. Salva o produto

**Resultado:** Produto criado sem estoque inicial (array vazio)

### Cenário 3: Alterar Distribuição

1. Usuário adiciona local "Depósito" com 100 unidades
2. Decide distribuir entre 2 locais
3. Altera quantidade do "Depósito" para 60
4. Adiciona "Loja 1" com 40 unidades
5. Vê "Estoque Total: 100 unidades"
6. Salva o produto

**Resultado:** Mesmo total, mas distribuído diferente

## 🎯 Compatibilidade

### Campo `initialStock` (Antigo)
- ⚠️ Mantido na interface por compatibilidade
- ❌ **NÃO é enviado** para a API se `initialStockByLocations` estiver presente
- 🔄 Recomenda-se usar apenas `initialStockByLocations`

### Retrocompatibilidade
Se o backend ainda aceitar `initialStock`:
```typescript
// Enviar initialStock como fallback
initialStock: initialStockByLocations.length === 0 ? formData.initialStock : undefined
```

## 📱 Responsividade

A interface é responsiva e adapta-se a diferentes tamanhos de tela:

- **Desktop**: Campos lado a lado com boa separação
- **Tablet**: Layout ajustado com quebras adequadas
- **Mobile**: Campos empilhados verticalmente

## 🔍 Estados da Interface

### Estado Vazio
```
┌─────────────────────────────────────────────────────┐
│ Nenhum local de estoque adicionado. Clique em      │
│ "Adicionar Local" para começar.                    │
└─────────────────────────────────────────────────────┘
```

### Com Locais Adicionados
```
┌─────────────────────────────────────────────────────┐
│ [Local ▼] [Quantidade] [🗑️]                        │
│ [Local ▼] [Quantidade] [🗑️]                        │
│ ────────────────────────────────                    │
│ Estoque Total: X unidades                          │
└─────────────────────────────────────────────────────┘
```

### Todos os Locais Usados
```
Toast: "Todos os locais já foram adicionados"
```

### Sem Locais Cadastrados
```
Toast: "Nenhum local disponível. Cadastre locais de estoque primeiro"
```

## 📦 Arquivos Modificados

1. **`lib/api/products.ts`**
   - Adicionada interface `InitialStockByLocation`
   - Adicionado campo `initialStockByLocations` em `CreateProductRequest`

2. **`app/dashboard/produtos/novo/page.tsx`**
   - Adicionados imports: `Plus`, `Trash2`, `stockLocationsApi`, `InitialStockByLocation`, `StockLocation`
   - Adicionados estados: `stockLocations`, `initialStockByLocations`
   - Adicionada função: `loadStockLocations()`
   - Adicionadas funções de gerenciamento: `handleAddStockLocation`, `handleRemoveStockLocation`, `handleStockLocationChange`, `getTotalStock`
   - Atualizada seção de estoque na aba "Estoque"
   - Atualizado `handleSubmit` para incluir `initialStockByLocations`

## 🚀 Próximos Passos

1. ✅ Implementar validação de locais no backend
2. ✅ Criar movimentações de estoque para cada local
3. ✅ Atualizar dashboard de estoque para mostrar por local
4. ⏳ Adicionar indicador visual de locais com estoque baixo
5. ⏳ Implementar transferências entre locais

## Data
04 de novembro de 2025
