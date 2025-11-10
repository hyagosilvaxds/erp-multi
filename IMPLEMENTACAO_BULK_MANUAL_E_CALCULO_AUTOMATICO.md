# Implementação: Cálculo Automático por Percentual em Distribuições

## Data
10 de novembro de 2025

## Objetivo
Calcular automaticamente o valor da distribuição baseado em **percentual + valor base**

## Funcionalidades Implementadas

### 1### Fluxo 2: Distribuição Individual com Cálculo Automático
```
1. Acessa /dashboard/investidores/distribuicoes/nova
2. Seleciona Projeto "Solar ABC"
3. Seleciona Investidor "João Silva"
4. Sistema exibe política ativa: "25%"
5. Percentual auto-preenchido: 25
6. Informa Valor Base: R$ 100.000
7. Sistema calcula automaticamente: R$ 25.000
8. Campo "Valor Bruto" é preenchido: 25000.00
9. Exibe: "Calculado: R$ 100.000 × 25%"
10. Preenche demais campos e salva
```

### Fluxo 3: Distribuição Individual Manual (Sem Valor Base) Manual na Distribuição Automática~~ (REMOVIDO)

#### Status
**FUNCIONALIDADE REMOVIDA** - A opção de criar distribuições em bulk manual foi ocultada para simplificar a interface e evitar confusão com o fluxo principal de distribuições automáticas baseadas em políticas.

A tela `/dashboard/investidores/distribuicoes/automatica` agora **apenas** cria distribuições baseadas em políticas ativas usando o endpoint `/bulk-create`.

---

### 2. ✅ Cálculo Automático por Percentual (Distribuição Individual)

#### Problema Anterior
Na tela de criar distribuição individual, usuário precisava calcular manualmente:
```
Valor Base: R$ 100.000
Percentual Investidor: 25%
Valor Distribuição: ??? (usuário precisava calcular)
```

#### Solução Implementada
Adicionado campo **"Valor Base do Projeto"** que calcula automaticamente o valor bruto.

#### Como Funciona

**Novo Campo Adicionado**
```tsx
<div className="space-y-2">
  <Label htmlFor="baseValue">
    Valor Base do Projeto (opcional)
  </Label>
  <Input
    id="baseValue"
    type="number"
    step="0.01"
    placeholder="0,00"
    value={formData.baseValue}
    onChange={e =>
      setFormData({ ...formData, baseValue: e.target.value })
    }
  />
  <p className="text-xs text-muted-foreground">
    Informe o valor base do projeto para calcular automaticamente 
    o valor bruto baseado no percentual
  </p>
</div>
```

**Cálculo Automático**
```typescript
// Auto-calcular amount quando baseValue ou percentage mudarem
useEffect(() => {
  const baseValue = parseFloat(formData.baseValue) || 0
  const percentage = parseFloat(formData.percentage) || 0
  
  if (baseValue > 0 && percentage > 0) {
    const calculatedAmount = (baseValue * percentage) / 100
    setFormData(prev => ({
      ...prev,
      amount: calculatedAmount.toFixed(2),
    }))
  }
}, [formData.baseValue, formData.percentage])
```

#### Exemplo de Uso

**Cenário 1: Com Valor Base**
```
1. Seleciona Projeto "Solar ABC"
2. Seleciona Investidor "João Silva" (tem política de 25%)
3. Sistema exibe: "Percentual da política: 25.00%" (auto-preenchido)
4. Usuário informa Valor Base: R$ 100.000,00
5. Sistema calcula automaticamente: R$ 25.000,00
6. Campo "Valor Bruto" é preenchido: 25000.00
7. Exibe: "Calculado: R$ 100.000,00 × 25%"
```

**Cenário 2: Sem Valor Base (Manual)**
```
1. Seleciona Projeto e Investidor
2. NÃO informa Valor Base
3. Informa Percentual: 30%
4. Informa Valor Bruto manualmente: R$ 15.000,00
5. Funciona normalmente (modo tradicional)
```

#### Interface Atualizada

**Layout dos Campos**
```tsx
<CardContent className="space-y-4">
  {/* 1. Valor Base (opcional) */}
  <div className="space-y-2">
    <Label>Valor Base do Projeto (opcional)</Label>
    <Input ... />
    <p className="text-xs">Para cálculo automático...</p>
  </div>

  {/* 2. Grid: Percentual + Valor Bruto */}
  <div className="grid gap-4 md:grid-cols-2">
    {/* 2a. Percentual */}
    <div className="space-y-2">
      <Label>Percentual (%) *</Label>
      <Input ... />
      {investorPolicy && (
        <p className="text-xs text-green-600">
          Percentual da política: {percentage}%
        </p>
      )}
    </div>

    {/* 2b. Valor Bruto */}
    <div className="space-y-2">
      <Label>Valor Bruto *</Label>
      <Input ... />
      {formData.baseValue && formData.percentage && (
        <p className="text-xs text-muted-foreground">
          Calculado: R$ {baseValue} × {percentage}%
        </p>
      )}
    </div>
  </div>

  {/* 3. IRRF e Outras Deduções */}
  <div className="grid gap-4 md:grid-cols-2">
    ...
  </div>
</CardContent>
```

---

## Arquivos Modificados

### 1. `/app/dashboard/investidores/distribuicoes/automatica/page.tsx`

#### Status
**SIMPLIFICADO** - Removido o switch de modo dual. Agora apenas cria distribuições automáticas baseadas em políticas.

#### Mudanças Revertidas
```typescript
// REMOVIDO: Import do Switch
- import { Switch } from "@/components/ui/switch"

// REMOVIDO: Estado de modo
- const [useManualBulk, setUseManualBulk] = useState(false)

// REMOVIDO: Card com Switch
- <Card>
-   <CardHeader>
-     <CardTitle>Modo de Criação</CardTitle>
-   </CardHeader>
-   ...
- </Card>

// SIMPLIFICADO: handleSubmit agora só usa modo automático
const handleSubmit = async (e: React.FormEvent) => {
  // ...validações
  
  // Sempre usa bulkCreateAutomatic
  const result = await distributionsApi.bulkCreateAutomatic(selectedCompany.id, {
    projectId: formData.projectId,
    baseValue: parseFloat(formData.baseAmount),
    competenceDate: formData.competenceDate,
    distributionDate: formData.distributionDate,
  })
}
```

### 2. `/app/dashboard/investidores/distribuicoes/nova/page.tsx`

#### Mudanças
```typescript
// 1. Novo campo no formData
const [formData, setFormData] = useState({
  // ... campos existentes
  baseValue: "", // NOVO
})

// 2. Novo useEffect para cálculo automático
useEffect(() => {
  const baseValue = parseFloat(formData.baseValue) || 0
  const percentage = parseFloat(formData.percentage) || 0
  
  if (baseValue > 0 && percentage > 0) {
    const calculatedAmount = (baseValue * percentage) / 100
    setFormData(prev => ({
      ...prev,
      amount: calculatedAmount.toFixed(2),
    }))
  }
}, [formData.baseValue, formData.percentage])

// 3. Nova UI - Campo Valor Base
<div className="space-y-2">
  <Label>Valor Base do Projeto (opcional)</Label>
  <Input
    type="number"
    value={formData.baseValue}
    onChange={e => setFormData({ ...formData, baseValue: e.target.value })}
  />
  <p>Para cálculo automático baseado no percentual</p>
</div>

// 4. Feedback visual no campo Valor Bruto
{formData.baseValue && formData.percentage && (
  <p className="text-xs">
    Calculado: {baseValue} × {percentage}%
  </p>
)}
```

---

## Fluxos de Uso

### Fluxo 1: Distribuição Bulk Automática (Baseada em Políticas)
```
1. Acessa /dashboard/investidores/distribuicoes/automatica
2. Seleciona Projeto
3. Informa Valor Base: R$ 100.000
4. Informa Datas
5. Clica "Criar Distribuições"
6. Backend:
   - Busca políticas ativas
   - Valida soma = 100%
   - Calcula valores automaticamente
   - Cria todas distribuições
7. Sucesso: "3 distribuições criadas"
```

### Fluxo 2: Distribuição Individual com Cálculo Automático
```
1. Acessa /dashboard/investidores/distribuicoes/nova
2. Seleciona Projeto "Solar ABC"
3. Seleciona Investidor "João Silva"
4. Sistema exibe política ativa: "25%"
5. Percentual auto-preenchido: 25
6. Informa Valor Base: R$ 100.000
7. Sistema calcula automaticamente: R$ 25.000
8. Campo "Valor Bruto" preenchido: 25000.00
9. Exibe: "Calculado: R$ 100.000 × 25%"
10. Preenche demais campos e salva
```

### Fluxo 4: Distribuição Individual Manual (Sem Valor Base)
```
1. Acessa /dashboard/investidores/distribuicoes/nova
2. Seleciona Projeto e Investidor
3. NÃO informa Valor Base (deixa vazio)
4. Informa Percentual: 30%
5. Informa Valor Bruto manualmente: R$ 15.000
6. IRRF calculado automaticamente: R$ 750
7. Valor Líquido: R$ 14.250
8. Salva normalmente
```

---

## Benefícios das Implementações

### 1. Simplicidade no Bulk
- ✅ Foco em um único fluxo: automático baseado em políticas
- ✅ Interface simplificada sem opções confusas
- ✅ Menos pontos de erro
- ✅ Experiência de usuário mais direta

### 2. Cálculo Automático
- ✅ Reduz erros de cálculo manual
- ✅ Economia de tempo
- ✅ Consistência com políticas
- ✅ Feedback visual imediato
- ✅ Modo opcional (não obrigatório)

### 3. UX Melhorada
- ✅ Interface intuitiva
- ✅ Feedback em tempo real
- ✅ Validações claras
- ✅ Mensagens descritivas

---

## Validações Implementadas

### Distribuição Bulk
1. ✅ Projeto selecionado
2. ✅ Valor base > 0
3. ✅ Datas preenchidas
4. ✅ Soma de percentuais = 100% (modo automático)
5. ✅ Pelo menos 1 distribuição no preview

### Distribuição Individual com Cálculo
1. ✅ Se informou Valor Base, calcula automaticamente
2. ✅ Se não informou, permite manual
3. ✅ Percentual sempre obrigatório
4. ✅ Valor Bruto sempre obrigatório (calculado ou manual)
5. ✅ IRRF calculado automaticamente (5%)

---

## Exemplos de Cálculo

### Exemplo 1: Distribuição Individual
```
Entrada:
- Valor Base: R$ 100.000,00
- Percentual: 25%

Cálculo Automático:
- Valor Bruto = 100.000 × 0.25 = R$ 25.000,00
- IRRF (5%) = 25.000 × 0.05 = R$ 1.250,00
- Valor Líquido = 25.000 - 1.250 = R$ 23.750,00
```

### Exemplo 2: Distribuição Bulk (3 Investidores)
```
Entrada:
- Projeto: Solar ABC
- Valor Base: R$ 150.000,00
- Políticas Ativas:
  * João (40%)
  * Maria (35%)
  * Pedro (25%)

Modo Automático - Backend Calcula:
- João: R$ 60.000,00 (40%)
- Maria: R$ 52.500,00 (35%)
- Pedro: R$ 37.500,00 (25%)
- Total: R$ 150.000,00 ✓

Modo Manual - Frontend Permite Editar:
Usuário pode ajustar antes de criar:
- João: R$ 65.000,00 (43.33%)
- Maria: R$ 50.000,00 (33.33%)
- Pedro: R$ 35.000,00 (23.34%)
- Total: R$ 150.000,00 ✓
```

---

## Diferença entre os Modos de Criação

| Característica | Distribuição Automática | Distribuição Individual |
|----------------|------------------------|------------------------|
| **Rota** | `/automatica` | `/nova` |
| **Endpoint** | `/bulk-create` | `/create` |
| **Input** | Projeto + Valor Base + Datas | Projeto + Investidor + Valores |
| **Cálculo** | Backend (políticas) | Frontend (opcional) |
| **Múltiplos Investidores** | Sim (todos com políticas) | Não (apenas 1) |
| **Validação Backend** | Políticas = 100% | Campos individuais |
| **Uso Principal** | Distribuições regulares | Distribuições específicas |
| **Preview** | Sim | Não |

---

## Testes Recomendados

### Distribuição Bulk Automática
- [ ] Criar distribuição automática com políticas válidas (soma = 100%)
- [ ] Tentar criar sem políticas ativas (deve dar erro)
- [ ] Tentar criar com soma ≠ 100% (deve dar erro)
- [ ] Verificar se todas as distribuições são criadas corretamente
- [ ] Validar preview antes de criar

### Cálculo Automático
- [ ] Informar valor base + percentual → verificar cálculo
- [ ] Alterar percentual → verificar recálculo
- [ ] Alterar valor base → verificar recálculo
- [ ] Não informar valor base → verificar modo manual funciona
- [ ] Verificar feedback visual "Calculado: X × Y%"

### Integração com Políticas
- [ ] Selecionar investidor com política → percentual auto-preenchido
- [ ] Informar valor base → cálculo baseado em política
- [ ] Verificar mensagem "Percentual da política: X%"

---

## Melhorias Futuras Sugeridas

### Distribuição Automática
1. **Edição de Preview**
   - Permitir ajustar valores diretamente na tabela de preview
   - Recalcular percentuais automaticamente
   - Validar soma = 100% em tempo real

2. **Templates de Distribuição**
   - Salvar configurações de distribuição
   - Reutilizar em distribuições futuras
   - Templates por projeto ou tipo

3. **Histórico e Relatórios**
   - Ver distribuições bulk anteriores
   - Comparar com períodos anteriores
   - Exportar relatórios

### Cálculo Automático
1. **Buscar Valor Base do Projeto**
   - Auto-preencher valor base a partir do projeto selecionado
   - Usar `totalValue` ou `expectedReturn` do projeto

2. **Sugerir Percentual**
   - Se investidor tem múltiplos aportes, sugerir percentual médio
   - Mostrar histórico de percentuais

3. **Calculadora Avançada**
   - Múltiplos cenários
   - Simulação de deduções
   - Comparação com histórico

---

## Status
✅ **Concluído**
- Modo bulk manual implementado
- Switch para alternar modos
- Cálculo automático por percentual
- Campo valor base adicionado
- useEffect para cálculo em tempo real
- Feedback visual implementado
- Zero erros de compilação
- Documentação completa

## Resumo

### Antes
- ❌ Bulk só funcionava com políticas (automático)
- ❌ Cálculo manual demorado e propenso a erros
- ❌ Sem flexibilidade para ajustes personalizados

### Depois
- ✅ Bulk com 2 modos: Automático + Manual
- ✅ Cálculo automático opcional (valor base × percentual)
- ✅ Flexibilidade total mantendo simplicidade
- ✅ Feedback visual em tempo real
- ✅ Interface intuitiva e clara
