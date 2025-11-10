# Correção das Tabelas INSS

## Mudanças Implementadas

### 1. Atualização dos Tipos (lib/api/tax-tables.ts)

Atualizados os tipos para corresponder à estrutura da API:

**Antes:**
```typescript
export interface INSSTable {
  referenceYear: number
  referenceMonth: number
  brackets: INSSBracket[]
}
```

**Depois:**
```typescript
export interface INSSRange {
  id?: string
  minValue: number
  maxValue: number
  employeeRate: number
  employerRate: number
}

export interface INSSBracket {
  upTo: number
  employeeRate: number
  employerRate: number
}

export interface INSSTable {
  year: number
  month: number
  ranges: INSSRange[]
}
```

### 2. Suporte aos Dois Formatos de Requisição

A API aceita dois formatos de envio:

#### Formato 1 - Brackets (mais simples)
```json
{
  "referenceYear": 2025,
  "referenceMonth": 11,
  "brackets": [
    { "upTo": 1412.00, "employeeRate": 7.5, "employerRate": 20 }
  ]
}
```

#### Formato 2 - Ranges (com minValue/maxValue)
```json
{
  "year": 2025,
  "month": 11,
  "ranges": [
    { "minValue": 0, "maxValue": 1412.00, "employeeRate": 7.5, "employerRate": 20 }
  ]
}
```

### 3. Resposta da API

A API sempre retorna no formato com `ranges`:

```json
{
  "id": "cm3xyz123456",
  "year": 2025,
  "month": 11,
  "ranges": [
    {
      "id": "range_001",
      "minValue": 0,
      "maxValue": 1412.00,
      "employeeRate": 7.5,
      "employerRate": 20
    }
  ]
}
```

### 4. Páginas Atualizadas

#### Listagem (page.tsx)
- Alterado de `table.referenceYear/referenceMonth` para `table.year/month`
- Alterado de `table.brackets` para `table.ranges`

#### Criação (inss/nova/page.tsx)
- Mantém o uso de `brackets` no frontend (mais simples)
- Envia `referenceYear/referenceMonth` e `brackets` para API

#### Edição (inss/[id]/editar/page.tsx)
- Converte `ranges` recebidas da API para `brackets` no frontend
- Ano e mês são exibidos como campos desabilitados (não podem ser alterados)
- Envia apenas `active` e `brackets` na atualização
- Usa o formato `brackets` para simplificar a edição

## Como Funciona

### Criação
1. Usuário preenche faixas usando o formato simples (upTo, employeeRate, employerRate)
2. Frontend envia para API usando `referenceYear`, `referenceMonth` e `brackets`
3. API calcula automaticamente os `minValue` de cada faixa
4. API retorna a tabela criada com `ranges` completas

### Visualização
1. API retorna tabelas com campos `year`, `month` e `ranges`
2. Frontend exibe essas informações diretamente

### Edição
1. API retorna tabela com `ranges` (minValue, maxValue)
2. Frontend converte `ranges` para `brackets` (upTo) para facilitar edição
3. Usuário edita usando o formato simples
4. Frontend envia atualização com `brackets`
5. API atualiza e retorna com `ranges` atualizadas

## Benefícios

1. **Flexibilidade**: Aceita dois formatos de entrada
2. **Simplicidade**: Frontend trabalha com formato mais simples (`brackets`)
3. **Precisão**: API retorna formato completo com todas as informações (`ranges`)
4. **Validação**: API garante que não há sobreposição de faixas
5. **Manutenibilidade**: Código mais claro e fácil de entender

## Campos que Não Podem Ser Alterados na Edição

Segundo a documentação da API, no PATCH não é possível alterar:
- `year` / `referenceYear`
- `month` / `referenceMonth`

Apenas podem ser alterados:
- `active`
- `brackets` / `ranges`

Por isso, na tela de edição, o ano e mês são exibidos como campos desabilitados.
