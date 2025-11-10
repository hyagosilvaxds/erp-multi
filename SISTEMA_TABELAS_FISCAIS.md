# 📊 Sistema de Tabelas Fiscais

Sistema completo para gerenciamento de tabelas fiscais de INSS, FGTS e IRRF, utilizadas nos cálculos da folha de pagamento.

---

## 📁 Estrutura de Arquivos

```
lib/api/
  └── tax-tables.ts              # API client para INSS, FGTS e IRRF

app/dashboard/rh/tabelas-fiscais/
  ├── page.tsx                    # Listagem principal com tabs
  ├── loading.tsx                 # Loading state
  ├── inss/
  │   ├── nova/
  │   │   └── page.tsx           # Criar tabela INSS
  │   └── [id]/
  │       └── editar/
  │           └── page.tsx       # Editar tabela INSS
  ├── fgts/
  │   ├── nova/
  │   │   └── page.tsx           # Criar tabela FGTS
  │   └── [id]/
  │       └── editar/
  │           └── page.tsx       # Editar tabela FGTS
  └── irrf/
      ├── nova/
      │   └── page.tsx           # Criar tabela IRRF
      └── [id]/
          └── editar/
              └── page.tsx       # Editar tabela IRRF
```

---

## 🔌 API Endpoints

### INSS

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/tax-tables/inss` | Listar tabelas |
| GET | `/tax-tables/inss/{id}` | Buscar por ID |
| GET | `/tax-tables/inss/active?year=2025&month=11` | **Buscar tabela ativa** |
| POST | `/tax-tables/inss` | Criar nova tabela |
| PATCH | `/tax-tables/inss/{id}` | Atualizar tabela |
| DELETE | `/tax-tables/inss/{id}` | Excluir tabela |

### FGTS

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/tax-tables/fgts` | Listar tabelas |
| GET | `/tax-tables/fgts/{id}` | Buscar por ID |
| GET | `/tax-tables/fgts/active?year=2025&month=11` | **Buscar tabela ativa** |
| POST | `/tax-tables/fgts` | Criar nova tabela |
| PATCH | `/tax-tables/fgts/{id}` | Atualizar tabela |
| DELETE | `/tax-tables/fgts/{id}` | Excluir tabela |

### IRRF

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/tax-tables/irrf` | Listar tabelas |
| GET | `/tax-tables/irrf/{id}` | Buscar por ID |
| GET | `/tax-tables/irrf/active?year=2025&month=11` | **Buscar tabela ativa** |
| POST | `/tax-tables/irrf` | Criar nova tabela |
| PATCH | `/tax-tables/irrf/{id}` | Atualizar tabela |
| DELETE | `/tax-tables/irrf/{id}` | Excluir tabela |

---

## 📊 Estruturas de Dados

### INSS (Instituto Nacional do Seguro Social)

```typescript
interface INSSTable {
  id: string
  companyId: string
  referenceYear: number       // Ano de referência (ex: 2025)
  referenceMonth: number      // Mês de referência (1-12)
  active: boolean             // Se está ativa
  brackets: INSSBracket[]     // Faixas progressivas
  createdAt: string
  updatedAt: string
}

interface INSSBracket {
  upTo: number               // Valor máximo da faixa (R$)
  employeeRate: number       // Alíquota do empregado (%)
  employerRate: number       // Alíquota do empregador (%)
}
```

**Exemplo - INSS 2025:**
```json
{
  "referenceYear": 2025,
  "referenceMonth": 1,
  "active": true,
  "brackets": [
    { "upTo": 1412.00, "employeeRate": 7.5, "employerRate": 20.0 },
    { "upTo": 2666.68, "employeeRate": 9.0, "employerRate": 20.0 },
    { "upTo": 4000.03, "employeeRate": 12.0, "employerRate": 20.0 },
    { "upTo": 7786.02, "employeeRate": 14.0, "employerRate": 20.0 }
  ]
}
```

---

### FGTS (Fundo de Garantia do Tempo de Serviço)

```typescript
interface FGTSTable {
  id: string
  companyId: string
  referenceYear: number
  referenceMonth: number
  active: boolean
  rates: FGTSRate[]          // Alíquotas por categoria
  createdAt: string
  updatedAt: string
}

interface FGTSRate {
  category: 'CLT' | 'APRENDIZ' | 'DOMESTICO'
  monthlyRate: number        // Alíquota mensal (%)
  rescissionRate: number     // Alíquota de rescisão (%)
}
```

**Exemplo - FGTS 2025:**
```json
{
  "referenceYear": 2025,
  "referenceMonth": 1,
  "active": true,
  "rates": [
    { "category": "CLT", "monthlyRate": 8.0, "rescissionRate": 0.0 },
    { "category": "APRENDIZ", "monthlyRate": 2.0, "rescissionRate": 0.0 },
    { "category": "DOMESTICO", "monthlyRate": 8.0, "rescissionRate": 3.2 }
  ]
}
```

---

### IRRF (Imposto de Renda Retido na Fonte)

```typescript
interface IRRFTable {
  id: string
  companyId: string
  referenceYear: number
  referenceMonth: number
  active: boolean
  brackets: IRRFBracket[]
  dependentDeduction: number  // Dedução por dependente (R$)
  createdAt: string
  updatedAt: string
}

interface IRRFBracket {
  upTo: number | null        // Valor máximo da faixa (null = sem limite)
  rate: number               // Alíquota (%)
  deduction: number          // Dedução em R$
}
```

**Exemplo - IRRF 2025:**
```json
{
  "referenceYear": 2025,
  "referenceMonth": 1,
  "active": true,
  "dependentDeduction": 189.59,
  "brackets": [
    { "upTo": 2259.20, "rate": 0.0, "deduction": 0.0 },
    { "upTo": 2826.65, "rate": 7.5, "deduction": 169.44 },
    { "upTo": 3751.05, "rate": 15.0, "deduction": 381.44 },
    { "upTo": 4664.68, "rate": 22.5, "deduction": 662.77 },
    { "upTo": null, "rate": 27.5, "deduction": 896.00 }
  ]
}
```

---

## 💡 Exemplos de Cálculo

### 1️⃣ Cálculo de INSS (Progressivo)

O INSS é calculado **progressivamente** por faixas. Cada faixa aplica sua alíquota apenas sobre o valor dentro dela.

**Exemplo: Salário de R$ 3.000,00**

```
Faixa 1: Até R$ 1.412,00
  → R$ 1.412,00 × 7,5% = R$ 105,90

Faixa 2: De R$ 1.412,01 até R$ 2.666,68
  → (R$ 2.666,68 - R$ 1.412,00) × 9,0% = R$ 1.254,68 × 9,0% = R$ 112,92

Faixa 3: De R$ 2.666,69 até R$ 4.000,03
  → (R$ 3.000,00 - R$ 2.666,68) × 12,0% = R$ 333,32 × 12,0% = R$ 39,99

INSS Empregado Total = R$ 105,90 + R$ 112,92 + R$ 39,99 = R$ 258,81
INSS Empregador = R$ 3.000,00 × 20% = R$ 600,00
```

**Código de Exemplo:**
```typescript
function calcularINSS(salario: number, brackets: INSSBracket[]): number {
  let inssTotal = 0
  let salarioRestante = salario

  for (const bracket of brackets) {
    if (salarioRestante <= 0) break

    const faixaValor = bracket.upTo
    const valorNaFaixa = Math.min(salarioRestante, faixaValor)
    const inssNaFaixa = valorNaFaixa * (bracket.employeeRate / 100)

    inssTotal += inssNaFaixa
    salarioRestante -= valorNaFaixa
  }

  return inssTotal
}
```

---

### 2️⃣ Cálculo de FGTS

O FGTS é calculado sobre o **salário bruto** total.

**Exemplo: Salário de R$ 3.000,00 (CLT)**

```
FGTS = R$ 3.000,00 × 8% = R$ 240,00
```

**Código de Exemplo:**
```typescript
function calcularFGTS(salario: number, category: string, rates: FGTSRate[]): number {
  const rate = rates.find(r => r.category === category)
  if (!rate) return 0

  return salario * (rate.monthlyRate / 100)
}
```

---

### 3️⃣ Cálculo de IRRF (Progressivo com Deduções)

O IRRF é calculado sobre a **base tributável**, que é o salário bruto menos INSS e dependentes.

**Exemplo: Salário de R$ 3.000,00 com 2 dependentes**

```
1. Base de Cálculo:
   Salário Bruto:           R$ 3.000,00
   (-) INSS:                R$   258,81
   (-) Dependentes (2):     R$   379,18  (2 × R$ 189,59)
   ─────────────────────────────────────
   Base Tributável:         R$ 2.362,01

2. Aplicar Alíquota (faixa de R$ 2.259,21 até R$ 2.826,65 = 7,5%):
   IRRF = (R$ 2.362,01 × 7,5%) - R$ 169,44
   IRRF = R$ 177,15 - R$ 169,44
   IRRF = R$ 7,71
```

**Código de Exemplo:**
```typescript
function calcularIRRF(
  salario: number,
  inss: number,
  dependentes: number,
  table: IRRFTable
): number {
  // 1. Calcular base tributável
  const deducaoDependentes = dependentes * table.dependentDeduction
  const baseTributavel = salario - inss - deducaoDependentes

  if (baseTributavel <= 0) return 0

  // 2. Encontrar faixa aplicável
  let bracket: IRRFBracket | undefined
  for (const b of table.brackets) {
    if (b.upTo === null || baseTributavel <= b.upTo) {
      bracket = b
      break
    }
  }

  if (!bracket) return 0

  // 3. Calcular IRRF
  const irrfBruto = baseTributavel * (bracket.rate / 100)
  const irrfLiquido = irrfBruto - bracket.deduction

  return Math.max(irrfLiquido, 0)
}
```

---

## 🔄 Fluxo de Uso

### 1. Cadastrar Tabelas
```typescript
// Buscar tabela ativa atual ou criar nova
const currentTable = await inssTablesApi.getActive(2025, 11)

// Se não existir, criar nova
if (!currentTable) {
  await inssTablesApi.create({
    referenceYear: 2025,
    referenceMonth: 11,
    active: true,
    brackets: [...]
  })
}
```

### 2. Calcular Folha de Pagamento
```typescript
// 1. Buscar tabelas ativas
const inssTable = await inssTablesApi.getActive(year, month)
const fgtsTable = await fgtsTablesApi.getActive(year, month)
const irrfTable = await irrfTablesApi.getActive(year, month)

// 2. Calcular descontos
const inss = calcularINSS(salario, inssTable.brackets)
const fgts = calcularFGTS(salario, 'CLT', fgtsTable.rates)
const irrf = calcularIRRF(salario, inss, dependentes, irrfTable)

// 3. Salário líquido
const salarioLiquido = salario - inss - irrf
```

### 3. Atualizar Tabela
```typescript
// Desativar tabela antiga
await inssTablesApi.update(oldTableId, { active: false })

// Criar nova tabela ativa
await inssTablesApi.create({
  referenceYear: 2026,
  referenceMonth: 1,
  active: true,
  brackets: [...]
})
```

---

## ✨ Funcionalidades Implementadas

- ✅ **CRUD Completo**: Criar, listar, editar e excluir tabelas
- ✅ **Busca de Tabela Ativa**: Endpoint `/active` para pegar tabela vigente
- ✅ **Histórico**: Múltiplas tabelas por período para auditoria
- ✅ **Validações**: Não permite salvar sem faixas/categorias
- ✅ **Interface Amigável**: Adicionar/remover faixas dinamicamente
- ✅ **Valores Padrão**: Pré-preenchido com valores de 2025
- ✅ **Loading States**: Indicadores de carregamento
- ✅ **Empty States**: Mensagens quando não há dados

---

## 🎯 Rotas

| Rota | Descrição |
|------|-----------|
| `/dashboard/rh/tabelas-fiscais` | Listagem principal com tabs |
| `/dashboard/rh/tabelas-fiscais/inss/nova` | Criar INSS |
| `/dashboard/rh/tabelas-fiscais/inss/{id}/editar` | Editar INSS |
| `/dashboard/rh/tabelas-fiscais/fgts/nova` | Criar FGTS |
| `/dashboard/rh/tabelas-fiscais/fgts/{id}/editar` | Editar FGTS |
| `/dashboard/rh/tabelas-fiscais/irrf/nova` | Criar IRRF |
| `/dashboard/rh/tabelas-fiscais/irrf/{id}/editar` | Editar IRRF |

---

## 📝 Notas Importantes

1. **INSS Progressivo**: Cada faixa aplica apenas sobre o valor dentro dela, não sobre o total
2. **FGTS Simples**: Aplica alíquota sobre o salário bruto total
3. **IRRF com Deduções**: Calcula sobre base tributável (salário - INSS - dependentes)
4. **Última Faixa IRRF**: `upTo: null` significa sem limite superior
5. **Histórico**: Manter tabelas antigas inativas para consultas históricas
6. **Uma Tabela Ativa**: Por período, ter apenas uma tabela ativa de cada tipo

---

## 🚀 Próximas Melhorias

- [ ] Duplicar tabela do mês anterior
- [ ] Import/Export de tabelas (JSON/CSV)
- [ ] Visualização de faixas em gráfico
- [ ] Comparação entre tabelas
- [ ] Simulador de cálculo
- [ ] Notificações quando tabela for expirar
- [ ] Histórico de alterações

---

**Status:** ✅ **Módulo Completo e Funcional**
