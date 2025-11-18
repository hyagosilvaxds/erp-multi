# Atualização: Tabelas INSS - Removido Mês de Referência

## Mudanças Implementadas

### 1. Estrutura da API Atualizada

A API de tabelas INSS foi atualizada para **remover o mês de referência**, mantendo apenas o **ano de referência**.

### 2. Tipos Atualizados (lib/api/tax-tables.ts)

```typescript
export interface INSSTable {
  id: string
  companyId: string
  year: number          // Apenas ano (sem month)
  active: boolean
  ranges: INSSRange[]
  createdAt: string
  updatedAt: string
}

export interface CreateINSSTableRequest {
  year?: number
  referenceYear?: number
  active?: boolean
  brackets?: INSSBracket[]
  ranges?: INSSRange[]
}
```

### 3. Páginas Atualizadas

#### Listagem (page.tsx)
**Antes:**
```tsx
{formatMonth(table.month)}/{table.year}
```

**Depois:**
```tsx
{table.year}
```

#### Criação (inss/nova/page.tsx)
**Antes:**
- 3 campos: Ano, Mês e Status

**Depois:**
- 2 campos: Ano e Status
- Removido completamente o campo de seleção de mês
- Layout ajustado para `md:grid-cols-2`

#### Edição (inss/[id]/editar/page.tsx)
**Antes:**
- 3 campos: Ano (desabilitado), Mês (desabilitado) e Status

**Depois:**
- 2 campos: Ano (desabilitado) e Status
- Removido campo de mês
- Layout ajustado para `md:grid-cols-2`

### 4. Formato das Requisições

#### Criar Tabela:
```json
{
  "referenceYear": 2025,
  "active": true,
  "brackets": [
    {
      "upTo": 1412.00,
      "employeeRate": 7.5,
      "employerRate": 20
    }
  ]
}
```

#### Resposta da API:
```json
{
  "id": "cm3xyz123456",
  "companyId": "cm3abc789012",
  "year": 2025,
  "active": true,
  "ranges": [
    {
      "id": "range_001",
      "minValue": 0,
      "maxValue": 1412.00,
      "employeeRate": 7.5,
      "employerRate": 20
    }
  ],
  "createdAt": "2025-11-09T10:00:00.000Z",
  "updatedAt": "2025-11-09T10:00:00.000Z"
}
```

### 5. Benefícios da Mudança

1. ✅ **Simplificação** - Uma tabela por ano (não precisa gerenciar mês)
2. ✅ **Interface mais limpa** - Menos campos para preencher
3. ✅ **Lógica mais simples** - Sem necessidade de validar combinação ano/mês
4. ✅ **Conformidade com legislação** - Tabelas INSS geralmente mudam anualmente

### 6. Impacto nas Telas

| Tela | Campo Removido | Novo Layout |
|------|----------------|-------------|
| Listagem | Mês/Ano → Ano | Exibe apenas o ano |
| Criação | Seletor de mês | 2 colunas (Ano + Status) |
| Edição | Mês desabilitado | 2 colunas (Ano + Status) |

### 7. Validação

- ✅ Não pode haver duas tabelas ativas para o mesmo ano
- ✅ Ano não pode ser alterado após criação
- ✅ Apenas `active` e `ranges/brackets` podem ser atualizados

## Resumo

A mudança remove a granularidade mensal das tabelas INSS, simplificando o sistema para trabalhar apenas com referência anual, o que está mais alinhado com a forma como as tabelas de INSS são atualizadas na legislação brasileira (geralmente uma vez por ano).
