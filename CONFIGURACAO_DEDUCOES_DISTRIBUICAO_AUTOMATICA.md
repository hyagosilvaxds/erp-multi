# Configuração de Deduções na Distribuição Automática

## Data
10 de novembro de 2025

## Objetivo
Permitir que o usuário configure deduções (IRRF e outras deduções) ao criar distribuições automáticas baseadas em políticas, aplicando os mesmos valores para todos os investidores.

## Funcionalidade Implementada

### Campos Adicionados

#### 1. IRRF (%)
- **Tipo**: Percentual
- **Campo**: `irrf` (opcional)
- **Formato**: Número decimal (ex: 15 = 15%)
- **Aplicação**: Calculado sobre o valor bruto de cada distribuição
- **Padrão**: 0 (sem retenção)

#### 2. Outras Deduções (R$)
- **Tipo**: Valor fixo em Reais
- **Campo**: `otherDeductions` (opcional)
- **Formato**: Número decimal (ex: 50 = R$ 50,00)
- **Aplicação**: Deduzido de cada distribuição
- **Padrão**: 0 (sem deduções)

---

## Como Funciona

### Cálculo das Distribuições

Para cada investidor com política ativa:

```typescript
// 1. Calcular valor bruto baseado no percentual da política
amount = (baseValue × percentage) / 100

// 2. Calcular IRRF se configurado
irrf = irrfRate > 0 ? (amount × irrfRate) / 100 : 0

// 3. Aplicar outras deduções
otherDeductions = otherDeductionsValue || 0

// 4. Calcular valor líquido
netAmount = amount - irrf - otherDeductions
```

### Exemplo Prático

**Configuração**:
- Valor Base: R$ 10.000,00
- IRRF: 15%
- Outras Deduções: R$ 50,00

**Políticas Ativas**:
- Investidor A: 40%
- Investidor B: 35%
- Investidor C: 25%

**Resultado**:

| Investidor | % | Bruto | IRRF (15%) | Deduções | Líquido |
|------------|---|--------|------------|----------|---------|
| A | 40% | R$ 4.000 | R$ 600 | R$ 50 | R$ 3.350 |
| B | 35% | R$ 3.500 | R$ 525 | R$ 50 | R$ 2.925 |
| C | 25% | R$ 2.500 | R$ 375 | R$ 50 | R$ 2.075 |
| **Total** | **100%** | **R$ 10.000** | **R$ 1.500** | **R$ 150** | **R$ 8.350** |

---

## Interface Implementada

### Localização
`/dashboard/investidores/distribuicoes/automatica`

### Novos Campos

```tsx
{/* Deduções */}
<div className="grid gap-4 md:grid-cols-2">
  <div className="space-y-2">
    <Label htmlFor="irrf">IRRF (%)</Label>
    <Input
      id="irrf"
      type="number"
      step="0.01"
      min="0"
      max="100"
      placeholder="0,00"
      value={formData.irrf}
      onChange={e => setFormData({ ...formData, irrf: e.target.value })}
    />
    <p className="text-xs text-muted-foreground">
      Alíquota de Imposto de Renda em percentual (ex: 15 = 15%)
    </p>
  </div>

  <div className="space-y-2">
    <Label htmlFor="otherDeductions">Outras Deduções (R$)</Label>
    <Input
      id="otherDeductions"
      type="number"
      step="0.01"
      min="0"
      placeholder="0,00"
      value={formData.otherDeductions}
      onChange={e => setFormData({ ...formData, otherDeductions: e.target.value })}
    />
    <p className="text-xs text-muted-foreground">
      Valor fixo deduzido de cada distribuição (ex: 50 = R$ 50,00)
    </p>
  </div>
</div>
```

### Preview Atualizado

A tabela de preview agora mostra uma coluna adicional:

| Investidor | Percentual | Valor Bruto | IRRF | **Outras Deduções** | Valor Líquido |
|------------|------------|-------------|------|---------------------|---------------|
| João Silva | 40% | R$ 4.000 | R$ 600 | **R$ 50** | R$ 3.350 |
| Maria | 35% | R$ 3.500 | R$ 525 | **R$ 50** | R$ 2.925 |
| Pedro | 25% | R$ 2.500 | R$ 375 | **R$ 50** | R$ 2.075 |
| **TOTAL** | **100%** | **R$ 10.000** | **R$ 1.500** | **R$ 150** | **R$ 8.350** |

---

## Arquivos Modificados

### 1. `/app/dashboard/investidores/distribuicoes/automatica/page.tsx`

#### Estado do Formulário
```typescript
const [formData, setFormData] = useState({
  projectId: "",
  baseAmount: "",
  competenceDate: "",
  distributionDate: "",
  description: "",
  irrf: "",              // NOVO
  otherDeductions: "",   // NOVO
})
```

#### Cálculo do Preview
```typescript
const loadPreview = async () => {
  // ... busca políticas
  
  // Calcular deduções baseado nos valores configurados
  const irrfRate = parseFloat(formData.irrf) || 0
  const otherDeductionsValue = parseFloat(formData.otherDeductions) || 0

  setPreview(
    result.map(d => {
      const amount = d.amount
      const irrf = irrfRate > 0 ? (amount * irrfRate) / 100 : 0
      const netAmount = amount - irrf - otherDeductionsValue

      return {
        investorId: d.investorId,
        investorName: d.investorName,
        percentage: d.percentage,
        amount: amount,
        irrf: irrf,
        netAmount: netAmount,
      }
    })
  )
}
```

#### Recálculo Automático
```typescript
useEffect(() => {
  if (formData.projectId && formData.baseAmount) {
    loadPreview()
  } else {
    setPreview([])
    setTotalPercentage(0)
  }
}, [
  formData.projectId,
  formData.baseAmount,
  formData.irrf,              // NOVO
  formData.otherDeductions,   // NOVO
])
```

O preview é **recalculado automaticamente** quando o usuário altera IRRF ou Outras Deduções.

#### Submissão
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  // ...validações
  
  const payload: any = {
    projectId: formData.projectId,
    baseValue: parseFloat(formData.baseAmount),
    competenceDate: formData.competenceDate,
    distributionDate: formData.distributionDate,
  }

  // Adiciona IRRF se fornecido (em percentual)
  if (formData.irrf && parseFloat(formData.irrf) > 0) {
    payload.irrf = parseFloat(formData.irrf)
  }

  // Adiciona outras deduções se fornecido (valor fixo)
  if (formData.otherDeductions && parseFloat(formData.otherDeductions) > 0) {
    payload.otherDeductions = parseFloat(formData.otherDeductions)
  }

  const result = await distributionsApi.bulkCreateAutomatic(companyId, payload)
}
```

### 2. `/lib/api/distributions.ts`

#### Interface Atualizada
```typescript
export interface BulkCreateAutomaticDto {
  projectId: string
  baseValue: number
  competenceDate: string
  distributionDate: string
  irrf?: number           // Alíquota de IRRF em % (ex: 15 para 15%)
  otherDeductions?: number // Valor fixo de outras deduções em R$
}
```

---

## Fluxo de Uso

### Cenário 1: Sem Deduções (Padrão)
```
1. Acessa /dashboard/investidores/distribuicoes/automatica
2. Seleciona Projeto
3. Informa Valor Base: R$ 10.000
4. NÃO preenche IRRF
5. NÃO preenche Outras Deduções
6. Preview mostra:
   - IRRF = R$ 0,00 (todos)
   - Outras Deduções = R$ 0,00 (todos)
   - Valor Líquido = Valor Bruto
7. Cria distribuições
```

### Cenário 2: Com IRRF de 15%
```
1. Acessa tela
2. Seleciona Projeto
3. Informa Valor Base: R$ 10.000
4. Informa IRRF: 15
5. Preview atualiza automaticamente:
   - Investidor 40%: R$ 4.000 - R$ 600 = R$ 3.400
   - Investidor 35%: R$ 3.500 - R$ 525 = R$ 2.975
   - Investidor 25%: R$ 2.500 - R$ 375 = R$ 2.125
6. Cria distribuições com IRRF calculado
```

### Cenário 3: Com IRRF e Outras Deduções
```
1. Seleciona Projeto
2. Valor Base: R$ 10.000
3. IRRF: 15%
4. Outras Deduções: R$ 50,00
5. Preview atualiza:
   - Investidor 40%: R$ 4.000 - R$ 600 - R$ 50 = R$ 3.350
   - Investidor 35%: R$ 3.500 - R$ 525 - R$ 50 = R$ 2.925
   - Investidor 25%: R$ 2.500 - R$ 375 - R$ 50 = R$ 2.075
6. Total IRRF: R$ 1.500
7. Total Outras Deduções: R$ 150 (R$ 50 × 3)
8. Total Líquido: R$ 8.350
```

### Cenário 4: Alterar Deduções (Recálculo Automático)
```
1. Preenche campos básicos
2. Preview carregado
3. Informa IRRF: 10%
4. Preview recalcula automaticamente ✅
5. Altera IRRF para 15%
6. Preview recalcula novamente ✅
7. Adiciona Outras Deduções: R$ 100
8. Preview recalcula com ambas deduções ✅
```

---

## Validações

### Campos Opcionais
- ✅ IRRF e Outras Deduções são **opcionais**
- ✅ Se não preenchidos, assumem valor 0
- ✅ Backend aceita ausência desses campos

### Limites
- **IRRF**: 0 a 100% (campo com `min="0"` e `max="100"`)
- **Outras Deduções**: Mínimo 0 (campo com `min="0"`)

### Recálculo em Tempo Real
```typescript
useEffect(() => {
  // Recalcula preview quando mudar:
  // - Projeto
  // - Valor Base
  // - IRRF ✨
  // - Outras Deduções ✨
  loadPreview()
}, [formData.projectId, formData.baseAmount, formData.irrf, formData.otherDeductions])
```

---

## Endpoint Backend

### Request

```http
POST /scp/distributions/bulk-create
Authorization: Bearer {token}
x-company-id: {companyId}
Content-Type: application/json

{
  "projectId": "uuid",
  "baseValue": 10000,
  "competenceDate": "2025-11",
  "distributionDate": "2025-11-10",
  "irrf": 15,              // Opcional: 15%
  "otherDeductions": 50    // Opcional: R$ 50,00
}
```

### Response

```json
{
  "distributions": [
    {
      "id": "uuid-1",
      "investorId": "inv-1",
      "amount": 4000,
      "percentage": 40,
      "irrf": 600,
      "otherDeductions": 50,
      "netAmount": 3350,
      "status": "PENDENTE"
    },
    // ... outras distribuições
  ],
  "summary": {
    "totalDistributions": 3,
    "totalAmount": 10000,
    "totalIRRF": 1500,
    "totalOtherDeductions": 150,
    "totalNetAmount": 8350
  }
}
```

---

## Diferenças: IRRF vs Outras Deduções

| Característica | IRRF | Outras Deduções |
|----------------|------|-----------------|
| **Tipo** | Percentual (%) | Valor Fixo (R$) |
| **Base de Cálculo** | Valor Bruto | - |
| **Aplicação** | Multiplicativo | Aditivo |
| **Exemplo** | 15% de R$ 4.000 = R$ 600 | R$ 50,00 fixo |
| **Variação** | Varia por investidor | Igual para todos |
| **Uso Comum** | Imposto de Renda | Taxas, tarifas |

### Exemplo Comparativo

**Configuração**: Valor Base R$ 10.000

#### Cenário A: IRRF 15%
```
Investidor 40%: R$ 4.000 × 15% = R$ 600
Investidor 35%: R$ 3.500 × 15% = R$ 525
Investidor 25%: R$ 2.500 × 15% = R$ 375
Total IRRF: R$ 1.500 (15% de R$ 10.000)
```

#### Cenário B: Outras Deduções R$ 50
```
Investidor 40%: R$ 50,00
Investidor 35%: R$ 50,00
Investidor 25%: R$ 50,00
Total Deduções: R$ 150 (R$ 50 × 3 investidores)
```

---

## Benefícios da Implementação

### 1. Flexibilidade
- ✅ Permite configurar ambas deduções
- ✅ Permite configurar apenas uma
- ✅ Permite não configurar nenhuma

### 2. Feedback Visual
- ✅ Preview atualiza em tempo real
- ✅ Totalizadores mostram impacto
- ✅ Valores líquidos visíveis antes de criar

### 3. Simplicidade
- ✅ Configuração única para todos investidores
- ✅ Não precisa configurar individual
- ✅ Menos erros de digitação

### 4. Transparência
- ✅ Todos os cálculos visíveis
- ✅ Tabela mostra detalhamento completo
- ✅ Fácil conferência antes de confirmar

---

## Casos de Uso

### 1. Distribuição com IR
**Situação**: Distribuir lucros com retenção de IR
```
IRRF: 15%
Outras Deduções: (vazio)
```

### 2. Distribuição com IR + Taxa Administrativa
**Situação**: Distribuir com IR e descontar taxa fixa
```
IRRF: 15%
Outras Deduções: R$ 100,00
```

### 3. Distribuição com Taxa Única
**Situação**: Descontar apenas uma taxa fixa
```
IRRF: (vazio)
Outras Deduções: R$ 50,00
```

### 4. Distribuição sem Deduções
**Situação**: Distribuir valor integral
```
IRRF: (vazio)
Outras Deduções: (vazio)
```

---

## Melhorias Futuras Sugeridas

### 1. Deduções Personalizadas por Investidor
- Permitir configurar IRRF diferente por investidor
- Alíquotas progressivas baseadas em faixa
- Isenções específicas

### 2. Biblioteca de Deduções
- Salvar perfis de deduções
- Reutilizar configurações comuns
- Templates por tipo de projeto

### 3. Cálculo Automático de IRRF
- Buscar alíquota baseada em legislação
- Atualização automática de tabelas
- Considerar faixa de valores

### 4. Relatório de Deduções
- Exportar resumo de IRRF
- Relatório para declaração de IR
- Histórico de retenções

---

## Status
✅ **Concluído**
- Campos de IRRF e Outras Deduções adicionados
- Preview com recálculo automático
- Tabela com coluna de deduções
- Totalizadores atualizados
- API atualizada com novos campos opcionais
- Zero erros de compilação
- Documentação completa

## Resumo

### Antes
- ❌ IRRF calculado automaticamente (5% fixo)
- ❌ Sem possibilidade de outras deduções
- ❌ Sem controle pelo usuário

### Depois
- ✅ IRRF configurável (0-100%)
- ✅ Outras deduções configuráveis (valor fixo)
- ✅ Preview atualizado em tempo real
- ✅ Totalizadores corretos
- ✅ Controle total pelo usuário
- ✅ Campos opcionais (padrão = 0)
