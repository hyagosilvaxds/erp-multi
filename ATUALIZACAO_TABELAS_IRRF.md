# Atualização: Tabelas IRRF - Removido Mês e Adicionado Ranges

## Mudanças Implementadas

### 1. Estrutura da API Atualizada

A API de tabelas IRRF foi atualizada para:
- **Remover o mês de referência** (mantendo apenas ano)
- **Usar `ranges`** em vez de `brackets` (com minValue e maxValue explícitos)

### 2. Tipos Atualizados (lib/api/tax-tables.ts)

```typescript
export interface IRRFRange {
  id?: string
  minValue: number
  maxValue: number | null  // null = sem limite superior
  rate: number
  deduction: number
}

export interface IRRFTable {
  id: string
  companyId: string
  year: number              // Apenas ano (sem month)
  active: boolean
  dependentDeduction: number
  ranges: IRRFRange[]       // Usa ranges com min/maxValue
  createdAt: string
  updatedAt: string
}

export interface CreateIRRFTableRequest {
  year: number
  dependentDeduction: number
  active?: boolean
  ranges: IRRFRange[]
}

export interface UpdateIRRFTableRequest {
  active?: boolean
  dependentDeduction?: number
  ranges?: IRRFRange[]
}
```

### 3. Páginas Atualizadas

#### Listagem (page.tsx)
**Antes:**
```tsx
{formatMonth(table.referenceMonth)}/{table.referenceYear}
{table.brackets?.length || 0} faixas
```

**Depois:**
```tsx
{table.year}
{table.ranges?.length || 0} faixas
```

#### Criação (irrf/nova/page.tsx)
**Antes:**
- 4 campos: Ano, Mês, Dedução Dependente, Status
- 3 campos por faixa: Até, Alíquota, Dedução

**Depois:**
- 3 campos: Ano, Dedução Dependente, Status
- 4 campos por faixa: De, Até, Alíquota, Dedução
- Interface explícita com minValue e maxValue

#### Edição (irrf/[id]/editar/page.tsx)
**Antes:**
- Ano e Mês desabilitados
- Trabalhava com `brackets` (upTo)

**Depois:**
- Apenas Ano desabilitado (sem campo de mês)
- Trabalha com `ranges` (minValue/maxValue)
- Layout com 3 colunas: Ano (desabilitado), Dedução Dependente, Status

### 4. Formato das Requisições

#### Criar Tabela:
```json
{
  "year": 2025,
  "dependentDeduction": 189.59,
  "active": true,
  "ranges": [
    {
      "minValue": 0,
      "maxValue": 2259.20,
      "rate": 0,
      "deduction": 0
    },
    {
      "minValue": 2259.21,
      "maxValue": 2826.65,
      "rate": 7.5,
      "deduction": 169.44
    },
    {
      "minValue": 4664.69,
      "maxValue": null,
      "rate": 27.5,
      "deduction": 896.00
    }
  ]
}
```

#### Atualizar Tabela:
```json
{
  "active": false,
  "dependentDeduction": 189.59,
  "ranges": [...]
}
```

**Nota:** Ano (`year`) não pode ser alterado na atualização.

#### Resposta da API:
```json
{
  "id": "cm3irrf123456",
  "companyId": "cm3abc789012",
  "year": 2025,
  "dependentDeduction": 189.59,
  "active": true,
  "ranges": [
    {
      "id": "range_001",
      "minValue": 0,
      "maxValue": 2259.20,
      "rate": 0,
      "deduction": 0
    }
  ],
  "createdAt": "2025-11-09T10:00:00.000Z",
  "updatedAt": "2025-11-09T10:00:00.000Z"
}
```

### 5. Diferenças Entre INSS e IRRF

| Aspecto | INSS | IRRF |
|---------|------|------|
| **Estrutura de Faixas** | `brackets` com `upTo` (simplificado) | `ranges` com `minValue`/`maxValue` (explícito) |
| **Campos Adicionais** | employeeRate, employerRate | rate, deduction, dependentDeduction |
| **Frontend** | Converte ranges para brackets | Usa ranges diretamente |
| **Complexidade** | Mais simples (apenas upTo) | Mais explícito (min e max) |

### 6. Interface do Usuário

#### Criação de Faixa:
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ De (R$) *   │ Até (R$)    │ Alíquota(%)│ Dedução (R$)│
├─────────────┼─────────────┼─────────────┼─────────────┤
│ 0.00        │ 2259.20     │ 0.00        │ 0.00        │
│ 2259.21     │ 2826.65     │ 7.50        │ 169.44      │
│ 4664.69     │ [vazio]     │ 27.50       │ 896.00      │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

**Nota:** Última faixa pode ter `maxValue` vazio (null) = sem limite superior

### 7. Benefícios da Mudança

1. ✅ **Clareza** - minValue e maxValue explícitos evitam cálculos automáticos
2. ✅ **Flexibilidade** - Faixas não precisam ser consecutivas
3. ✅ **Precisão** - Valores exatos de início e fim de cada faixa
4. ✅ **Validação** - API valida sobreposição de faixas
5. ✅ **Conformidade** - Segue estrutura oficial das tabelas de IRRF

### 8. Validações

- ✅ Não pode haver duas tabelas ativas para o mesmo ano
- ✅ Ano não pode ser alterado após criação
- ✅ dependentDeduction pode ser atualizado
- ✅ ranges devem ter minValue < maxValue (quando maxValue não é null)
- ✅ Última faixa pode ter maxValue = null (sem limite superior)

## Resumo

A mudança traz as tabelas IRRF para uma estrutura mais explícita e alinhada com a forma como o IRRF é calculado no Brasil, usando faixas com valores mínimos e máximos bem definidos, e removendo a granularidade mensal que não é necessária para este tipo de tabela fiscal.
