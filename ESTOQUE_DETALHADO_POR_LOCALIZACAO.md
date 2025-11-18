# Estoque Detalhado por Localização

## Visão Geral
A tela de edição de produtos foi atualizada para exibir informações detalhadas de estoque por localização. A API agora retorna dados completos sobre onde cada produto está armazenado, incluindo informações sobre cada local de estoque.

## Estrutura de Dados

### StockByLocation
Informações sobre o estoque em um local específico:
```typescript
interface StockByLocation {
  id: string
  companyId: string
  productId: string
  locationId: string
  quantity: string
  createdAt: string
  updatedAt: string
  location: StockLocation
}
```

### StockLocation
Detalhes do local de armazenamento:
```typescript
interface StockLocation {
  id: string
  name: string
  code: string
  description?: string
  address?: string
  isDefault: boolean
  active: boolean
}
```

### StockSummary
Resumo consolidado do estoque:
```typescript
interface StockSummary {
  totalStock: number
  stockByLocations: StockLocationSummary[]
  locationsCount: number
  locationsWithStock: number
  locationsOutOfStock: number
}

interface StockLocationSummary {
  locationId: string
  locationName: string
  locationCode: string
  quantity: number
  isDefault: boolean
  active: boolean
  address?: string
  updatedAt: string
}
```

## Interface do Produto Atualizada

A interface `Product` agora inclui:
```typescript
interface Product {
  // ... campos existentes
  
  // Estoque detalhado por localização
  stocksByLocation?: StockByLocation[]
  stockSummary?: StockSummary
}
```

## Exemplo de Resposta da API

```json
{
  "id": "805aaa35-dd81-488d-abf7-de42ef5e1ab5",
  "name": "Produto Exemplo",
  "stocksByLocation": [
    {
      "id": "1902a76a-a724-4cb7-9a02-691be5128aa2",
      "companyId": "2b6cd68c-c882-44a9-bd59-5a99a07d5d4c",
      "productId": "805aaa35-dd81-488d-abf7-de42ef5e1ab5",
      "locationId": "06bee86f-d58a-484a-9b99-29d36091c2fb",
      "quantity": "2000",
      "createdAt": "2025-11-05T01:03:18.728Z",
      "updatedAt": "2025-11-05T01:03:18.728Z",
      "location": {
        "id": "06bee86f-d58a-484a-9b99-29d36091c2fb",
        "name": "Depósito 1",
        "code": "DEP-01",
        "description": "bão",
        "address": "rua das froris",
        "isDefault": true,
        "active": true
      }
    }
  ],
  "stockSummary": {
    "totalStock": 2000,
    "stockByLocations": [
      {
        "locationId": "06bee86f-d58a-484a-9b99-29d36091c2fb",
        "locationName": "Depósito 1",
        "locationCode": "DEP-01",
        "quantity": 2000,
        "isDefault": true,
        "active": true,
        "address": "rua das froris",
        "updatedAt": "2025-11-05T01:03:18.728Z"
      }
    ],
    "locationsCount": 1,
    "locationsWithStock": 1,
    "locationsOutOfStock": 0
  }
}
```

## Visualização na Interface

### 1. Resumo do Estoque Total
Exibe um card destacado com:
- **Estoque Total**: Soma de todas as quantidades
- **Total de Locais**: Número total de locais cadastrados
- **Com Estoque**: Locais que possuem quantidade > 0 (em verde)
- **Sem Estoque**: Locais com quantidade = 0 (em laranja)

### 2. Lista de Estoque por Localização
Para cada local de estoque, exibe:
- **Nome e Código**: Nome do local com código entre parênteses
- **Badges Informativos**:
  - "Padrão" (azul): Se `isDefault = true`
  - "Inativo" (laranja): Se `active = false`
- **Endereço**: Se disponível
- **Data de Atualização**: Última vez que o estoque foi modificado
- **Quantidade**: Destacada em tamanho grande, formatada com locale pt-BR

### 3. Controles de Estoque Mínimo/Máximo
Mantém os campos existentes para configuração de:
- Estoque mínimo (alerta de reposição)
- Estoque máximo (limite de armazenamento)

## Layout Visual

```
┌─────────────────────────────────────────────┐
│ Controle de Estoque                         │
├─────────────────────────────────────────────┤
│ [ ] Controlar Estoque                       │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Resumo do Estoque              2000     │ │
│ │                                         │ │
│ │ Total de Locais    Com Estoque   Sem    │ │
│ │        1                1         0     │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Estoque por Localização                     │
│ ┌─────────────────────────────────────────┐ │
│ │ Depósito 1 [DEP-01] [Padrão]            │ │
│ │ rua das froris                    2,000 │ │
│ │ Atualizado em: 05/11/2025 01:03  unidades│ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [Estoque Total]  [Mín]  [Máx]              │
│      2000         -      -                  │
└─────────────────────────────────────────────┘
```

## Comportamento

### Exibição Condicional
- O resumo do estoque só aparece se `product.stockSummary` existir
- A lista de localizações só aparece se `product.stocksByLocation` tiver itens
- Todo o conteúdo só é exibido se `manageStock = true`

### Formatação
- Quantidades formatadas com `toLocaleString('pt-BR')`
- Datas formatadas com `toLocaleString('pt-BR')` incluindo hora
- Números decimais do `quantity` convertidos com `parseFloat()`

### Interatividade
- Cards de localização com efeito hover (`hover:bg-muted/50`)
- Transições suaves (`transition-colors`)
- Bordas arredondadas para melhor visual

## Arquivos Modificados

### 1. `/lib/api/products.ts`
- Adicionadas interfaces: `StockLocation`, `StockByLocation`, `StockLocationSummary`, `StockSummary`
- Interface `Product` atualizada com campos `stocksByLocation` e `stockSummary`

### 2. `/app/dashboard/produtos/[id]/page.tsx`
- Tab "Estoque" completamente redesenhada
- Adicionado card de resumo do estoque
- Adicionada lista detalhada de estoque por localização
- Melhorias visuais com badges e formatação

## Benefícios

✅ **Visibilidade Total**: Usuários podem ver exatamente onde cada produto está armazenado

✅ **Informações Contextuais**: Endereço, código e status de cada local

✅ **Resumo Rápido**: Card destacado mostra totais e estatísticas importantes

✅ **Histórico**: Data de última atualização para cada localização

✅ **Identificação Visual**: Badges para locais padrão e inativos

✅ **Formatação Profissional**: Números e datas no padrão brasileiro

## Próximos Passos Sugeridos

1. **Movimentação de Estoque**: Adicionar botões para transferir estoque entre locais
2. **Histórico de Movimentações**: Link para ver histórico de cada local
3. **Alertas Visuais**: Destacar locais com estoque abaixo do mínimo
4. **Gráficos**: Visualização gráfica da distribuição de estoque
5. **Exportação**: Botão para exportar relatório de estoque por localização
