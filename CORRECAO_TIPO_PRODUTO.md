# Correção: Campo "Tipo de Produto" Vazio na Edição

## Problema
O campo "Tipo" (select) estava ficando vazio na tela de edição de produto, mesmo quando o produto tinha um tipo definido.

## Causa Raiz
**Incompatibilidade entre API e Interface TypeScript:**
- A **API retorna**: `productType: "SIMPLE"`
- A **Interface TypeScript esperava**: `type: ProductType`
- O código carregava: `type: data.type` (que era `undefined`)
- O select ficava vazio porque não encontrava o valor

### Exemplo do JSON da API:
```json
{
  "id": "07bc1207-7176-49e0-be7a-13c6ed9f22fd",
  "name": "Dell 2025",
  "productType": "SIMPLE",  // ← API usa productType
  ...
}
```

### Interface TypeScript (antes):
```typescript
export interface Product {
  type: ProductType  // ← Interface esperava type
  ...
}
```

## Solução Implementada

### 1. Atualização da Interface Product
Adicionada propriedade alternativa `productType` para compatibilidade:

```typescript
// lib/api/products.ts
export interface Product {
  type: ProductType
  productType?: ProductType // Alias para compatibilidade com backend
  active: boolean
  availability: ProductAvailability
  ...
}
```

### 2. Mapeamento no Carregamento
Atualizada a função `loadProduct` para usar `productType` como fallback:

```typescript
// app/dashboard/produtos/[id]/page.tsx
const loadProduct = async () => {
  const data = await productsApi.getById(productId)
  
  console.log('📦 Produto carregado:', data)
  console.log('🔍 Type do produto:', data.type)
  console.log('🔍 ProductType do produto:', data.productType)
  
  setFormData({
    ...
    type: data.type || data.productType, // ✅ Usar productType se type não existir
    ...
  })
}
```

### 3. Logs de Debug
Adicionados logs para facilitar diagnóstico:
- `📦 Produto carregado:` - Mostra o objeto completo
- `🔍 Type do produto:` - Mostra o valor de `data.type`
- `🔍 ProductType do produto:` - Mostra o valor de `data.productType`

## Como Funciona Agora

### Lógica de Fallback:
```typescript
type: data.type || data.productType
```

**Comportamento:**
1. Tenta usar `data.type` primeiro (padrão esperado)
2. Se `data.type` for `undefined`, usa `data.productType` (compatibilidade com backend)
3. Garante que o campo sempre será preenchido se algum dos dois existir

## Valores Possíveis

O campo "Tipo" aceita os seguintes valores:

| Valor no Backend | Label no Frontend |
|------------------|-------------------|
| `SIMPLE`         | Simples           |
| `COMPOSITE`      | Composto          |
| `VARIABLE`       | Variação          |
| `COMBO`          | Combo             |

## Select na Interface

```tsx
<Select
  value={formData.type}
  onValueChange={(value) => handleInputChange('type', value as ProductType)}
  disabled={!canEdit}
>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="SIMPLE">Simples</SelectItem>
    <SelectItem value="COMPOSITE">Composto</SelectItem>
    <SelectItem value="VARIABLE">Variação</SelectItem>
    <SelectItem value="COMBO">Combo</SelectItem>
  </SelectContent>
</Select>
```

## Teste

### Antes da Correção:
1. Editar produto com `productType: "SIMPLE"`
2. Campo "Tipo" aparecia vazio ❌
3. Console: `data.type = undefined`

### Depois da Correção:
1. Editar produto com `productType: "SIMPLE"`
2. Campo "Tipo" mostra "Simples" ✅
3. Console mostra:
   ```
   📦 Produto carregado: {...}
   🔍 Type do produto: undefined
   🔍 ProductType do produto: SIMPLE
   ```

## Compatibilidade

A solução é **100% retrocompatível**:

✅ Se a API enviar `type` → Funciona  
✅ Se a API enviar `productType` → Funciona  
✅ Se a API enviar ambos → Usa `type` (prioridade)  
❌ Se a API não enviar nenhum → Campo fica vazio (comportamento esperado)

## Arquivos Modificados

1. **`lib/api/products.ts`**
   - Adicionada propriedade `productType?: ProductType` na interface `Product`

2. **`app/dashboard/produtos/[id]/page.tsx`**
   - Atualizado `loadProduct()` para usar `data.type || data.productType`
   - Adicionados logs de debug

## Recomendações Futuras

### Opção 1: Padronizar no Backend (Ideal)
Alterar a API para retornar `type` em vez de `productType` para seguir a convenção do frontend.

### Opção 2: Manter Compatibilidade (Atual)
Manter ambos os campos na interface e sempre usar o fallback `data.type || data.productType`.

### Opção 3: Transformer na API Client
Criar um transformer que mapeia `productType → type` automaticamente ao receber dados da API.

## Data
04 de novembro de 2025
