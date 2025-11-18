# Cálculo Automático de Preços

## Funcionalidade
O sistema agora calcula automaticamente preços e margens de lucro nas telas de criação e edição de produtos.

## Regras de Cálculo

### 1. Cálculo do Preço de Venda
**Quando:** Usuário preenche **Preço de Custo** e **Margem de Lucro**

**Fórmula:**
```
Preço de Venda = Preço de Custo × (1 + Margem de Lucro / 100)
```

**Exemplo:**
- Preço de Custo: R$ 100,00
- Margem de Lucro: 50%
- **Preço de Venda calculado: R$ 150,00**

### 2. Cálculo da Margem de Lucro
**Quando:** Usuário preenche **Preço de Venda** e **Preço de Custo**

**Fórmula:**
```
Margem de Lucro (%) = ((Preço de Venda - Preço de Custo) / Preço de Custo) × 100
```

**Exemplo:**
- Preço de Custo: R$ 100,00
- Preço de Venda: R$ 150,00
- **Margem de Lucro calculada: 50%**

## Comportamento

### Cenários de Uso

#### Cenário 1: Definir margem e calcular preço de venda
1. Usuário preenche: **Preço de Custo** = 100
2. Usuário preenche: **Margem de Lucro** = 30
3. Sistema calcula automaticamente: **Preço de Venda** = 130

#### Cenário 2: Definir preço final e calcular margem
1. Usuário preenche: **Preço de Custo** = 100
2. Usuário preenche: **Preço de Venda** = 180
3. Sistema calcula automaticamente: **Margem de Lucro** = 80%

#### Cenário 3: Atualizar custo recalcula ambos
1. Produto tem: Custo = 100, Margem = 50%, Venda = 150
2. Usuário altera: **Preço de Custo** = 120
3. Sistema recalcula: **Preço de Venda** = 180 (mantém margem de 50%)

#### Cenário 4: Atualizar margem recalcula preço
1. Produto tem: Custo = 100, Margem = 50%, Venda = 150
2. Usuário altera: **Margem de Lucro** = 60
3. Sistema recalcula: **Preço de Venda** = 160

#### Cenário 5: Atualizar preço de venda recalcula margem
1. Produto tem: Custo = 100, Margem = 50%, Venda = 150
2. Usuário altera: **Preço de Venda** = 200
3. Sistema recalcula: **Margem de Lucro** = 100%

#### Cenário 6: Digitar apenas custo (CORRIGIDO) ✅
1. Usuário preenche: **Preço de Custo** = 100
2. Sistema **NÃO calcula** margem ou preço de venda
3. Campos permanecem vazios até o usuário preencher um deles
4. ❌ ANTES: Mostrava margem negativa incorreta
5. ✅ AGORA: Mantém campos vazios

## Validações

### Preço de Custo
- Deve ser maior que 0 para cálculos funcionarem
- Se for 0 ou vazio, cálculos não são realizados

### Margem de Lucro
- Pode ser 0 ou positiva
- Aceita valores decimais (ex: 12.5%)
- Valores negativos são permitidos (prejuízo)

### Preço de Venda
- Deve ser maior que 0 para calcular margem
- É sempre obrigatório (campo marcado com *)

## Precisão

Todos os valores calculados são arredondados para **2 casas decimais**:
```typescript
calculatedSalePrice.toFixed(2)  // Ex: 150.00
calculatedMargin.toFixed(2)     // Ex: 50.00
```

## Implementação Técnica

### Arquivos Modificados
1. `app/dashboard/produtos/[id]/page.tsx` - Edição de produtos
2. `app/dashboard/produtos/novo/page.tsx` - Criação de produtos

### Lógica de Cálculo (ATUALIZADA - v2)

A função `handleInputChange` foi corrigida para evitar cálculos incorretos quando apenas o preço de custo é preenchido.

#### Problemas Corrigidos:
❌ **Bug Anterior**: Ao digitar apenas o preço de custo, o sistema calculava uma margem negativa incorreta baseada em valores vazios ou zero.

✅ **Correção**: O sistema agora só calcula quando há valores válidos e intencionais do usuário.

### Função handleInputChange (Versão Corrigida)
```typescript
const handleInputChange = (field: keyof CreateProductRequest, value: any) => {
  const newFormData = { ...formData, [field]: value }

  // Cálculo automático de preços
  if (field === 'costPrice' || field === 'profitMargin' || field === 'salePrice') {
    const costPrice = parseFloat(field === 'costPrice' ? value : (formData.costPrice || '0'))
    const profitMargin = parseFloat(field === 'profitMargin' ? value : (formData.profitMargin || '0'))

    // ✅ REGRA 1: Calcular preço de venda APENAS se margem > 0
    if ((field === 'costPrice' || field === 'profitMargin') && profitMargin > 0) {
      if (costPrice > 0) {
        const calculatedSalePrice = costPrice * (1 + profitMargin / 100)
        newFormData.salePrice = calculatedSalePrice.toFixed(2)
      }
    }

    // ✅ REGRA 2: Calcular margem APENAS se usuário digitar preço de venda
    if (field === 'salePrice' && value && parseFloat(value) > 0) {
      if (costPrice > 0) {
        const calculatedMargin = ((parseFloat(value) - costPrice) / costPrice) * 100
        newFormData.profitMargin = calculatedMargin.toFixed(2)
      }
    }

    // ✅ REGRA 3: Recalcular margem se alterar custo E já tiver preço de venda
    if (field === 'costPrice' && formData.salePrice && parseFloat(formData.salePrice) > 0) {
      if (costPrice > 0) {
        const calculatedMargin = ((parseFloat(formData.salePrice) - costPrice) / costPrice) * 100
        newFormData.profitMargin = calculatedMargin.toFixed(2)
      }
    }
  }

  setFormData(newFormData)
}
```

### Diferenças Entre Versões

#### ❌ Versão Antiga (Com Bug):
```typescript
// Problema: Calculava preço de venda mesmo com margem = 0
if (field === 'costPrice' || field === 'profitMargin') {
  if (costPrice > 0 && profitMargin >= 0) {  // ❌ >= 0 aceita zero
    const calculatedSalePrice = costPrice * (1 + profitMargin / 100)
    newFormData.salePrice = calculatedSalePrice.toFixed(2)
  }
}

// Problema: Calculava margem ao digitar apenas custo
if (field === 'salePrice' || (field === 'costPrice' && salePrice > 0)) {
  // ❌ Executava mesmo quando salePrice era zero ou antigo
  if (costPrice > 0 && salePrice > 0) {
    const calculatedMargin = ((salePrice - costPrice) / costPrice) * 100
    newFormData.profitMargin = calculatedMargin.toFixed(2)
  }
}
```

#### ✅ Versão Nova (Corrigida):
```typescript
// Solução: Só calcula se margem > 0 (usuário digitou intencionalmente)
if ((field === 'costPrice' || field === 'profitMargin') && profitMargin > 0) {
  // ✅ Ignora se margem for zero ou vazia
}

// Solução: Só calcula ao digitar DIRETAMENTE o preço de venda
if (field === 'salePrice' && value && parseFloat(value) > 0) {
  // ✅ Só executa se usuário está editando preço de venda
}

// Solução: Recalcula margem apenas se já existe preço de venda válido
if (field === 'costPrice' && formData.salePrice && parseFloat(formData.salePrice) > 0) {
  // ✅ Só recalcula se preço de venda foi previamente definido
}
```

### Regras de Negócio Aplicadas

1. **Calcular Preço de Venda:**
   - ✅ Requer: `costPrice > 0` E `profitMargin > 0`
   - ❌ Ignora: Se margem for zero ou vazia

2. **Calcular Margem ao Digitar Preço de Venda:**
   - ✅ Requer: Usuário está digitando `salePrice` E `value > 0` E `costPrice > 0`
   - ❌ Ignora: Se for mudança indireta ou valor inválido

3. **Recalcular Margem ao Alterar Custo:**
   - ✅ Requer: `costPrice` mudou E já existe `salePrice` válido
   - ❌ Ignora: Se não houver preço de venda definido

### Fluxos de Teste

#### ✅ Teste 1: Digitar apenas Custo
```
1. Custo = 100
2. Margem = (vazio)
3. Preço Venda = (vazio)
✅ Resultado: Nenhum cálculo realizado
```

#### ✅ Teste 2: Custo + Margem
```
1. Custo = 100
2. Margem = 30
3. Preço Venda = 130 (calculado automaticamente)
✅ Resultado: Preço de venda calculado
```

#### ✅ Teste 3: Custo + Preço de Venda
```
1. Custo = 100
2. Preço Venda = 150
3. Margem = 50 (calculada automaticamente)
✅ Resultado: Margem calculada
```

#### ✅ Teste 4: Alterar Custo (já tem Preço)
```
1. Estado anterior: Custo=100, Preço=150, Margem=50
2. Alterar Custo = 120
3. Margem = 25 (recalculada baseada no preço existente)
✅ Resultado: Margem recalculada corretamente
```

#### ✅ Teste 5: Alterar Custo (sem Preço)
```
1. Estado anterior: Custo=100, Preço=(vazio), Margem=(vazio)
2. Alterar Custo = 120
3. Margem = (vazio)
✅ Resultado: Nenhum cálculo (preço não está definido)
```

## Correção de Bugs
```typescript
const handleInputChange = (field: keyof CreateProductRequest, value: any) => {
  const newFormData = { ...formData, [field]: value }

  // Cálculo automático de preços
  if (field === 'costPrice' || field === 'profitMargin' || field === 'salePrice') {
    const costPrice = parseFloat(field === 'costPrice' ? value : (formData.costPrice || '0'))
    const profitMargin = parseFloat(field === 'profitMargin' ? value : (formData.profitMargin || '0'))
    const salePrice = parseFloat(field === 'salePrice' ? value : (formData.salePrice || '0'))

    // Se preencheu custo e margem, calcular preço de venda
    if (field === 'costPrice' || field === 'profitMargin') {
      if (costPrice > 0 && profitMargin >= 0) {
        const calculatedSalePrice = costPrice * (1 + profitMargin / 100)
        newFormData.salePrice = calculatedSalePrice.toFixed(2)
      }
    }

    // Se preencheu preço de venda e custo, calcular margem
    if (field === 'salePrice' || (field === 'costPrice' && salePrice > 0)) {
      if (costPrice > 0 && salePrice > 0) {
        const calculatedMargin = ((salePrice - costPrice) / costPrice) * 100
        newFormData.profitMargin = calculatedMargin.toFixed(2)
      }
    }
  }

  setFormData(newFormData)
}
```

## Fluxo de Eventos

```
┌─────────────────────────────────────────────────────────┐
│ Usuário altera campo (costPrice, profitMargin ou       │
│ salePrice)                                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ handleInputChange é chamado                             │
│ - Cria newFormData com o novo valor                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Verifica se campo alterado é de preço                   │
│ (costPrice, profitMargin ou salePrice)                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Converte valores para float                             │
│ - Usa valor novo se campo foi alterado                 │
│ - Usa valor existente se campo não foi alterado        │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────────┐    ┌──────────────────┐
│ Alterou custo ou │    │ Alterou preço de │
│ margem?          │    │ venda ou custo?  │
│                  │    │                  │
│ ✓ Calcular       │    │ ✓ Calcular       │
│   preço de venda │    │   margem         │
└──────────────────┘    └──────────────────┘
        │                         │
        └────────────┬────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Atualizar formData com valores calculados              │
└─────────────────────────────────────────────────────────┘
```

## Testes Sugeridos

### Teste 1: Cálculo de Preço de Venda
1. Criar novo produto
2. Preencher Preço de Custo: 100
3. Preencher Margem de Lucro: 25
4. **Verificar:** Preço de Venda = 125.00

### Teste 2: Cálculo de Margem
1. Criar novo produto
2. Preencher Preço de Custo: 80
3. Preencher Preço de Venda: 120
4. **Verificar:** Margem de Lucro = 50.00

### Teste 3: Atualização de Custo
1. Editar produto existente
2. Alterar Preço de Custo de 100 para 150
3. **Verificar:** Se tinha margem de 30%, Preço de Venda atualiza para 195.00

### Teste 4: Valores Decimais
1. Preencher Preço de Custo: 99.99
2. Preencher Margem de Lucro: 33.33
3. **Verificar:** Preço de Venda = 133.32

### Teste 5: Margem Negativa (Prejuízo)
1. Preencher Preço de Custo: 100
2. Preencher Preço de Venda: 80
3. **Verificar:** Margem de Lucro = -20.00 (prejuízo de 20%)

## Benefícios

✅ **Agilidade**: Não precisa usar calculadora externa
✅ **Precisão**: Cálculos consistentes e sem erros humanos
✅ **Flexibilidade**: Funciona nos dois sentidos (custo→venda ou venda→margem)
✅ **Transparência**: Usuário vê imediatamente o impacto das mudanças
✅ **Facilidade**: Basta preencher 2 campos que o 3º é calculado

## Data
04 de novembro de 2025
