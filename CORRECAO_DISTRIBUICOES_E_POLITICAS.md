# Correção: Distribuições e Políticas de Distribuição

## Data
10 de novembro de 2025

## Problema Identificado
1. **Telas de distribuição não carregavam projetos e investidores** nos selects
2. **Faltava exibir dados da política de distribuição** ao selecionar um investidor
3. **API de distribuições desatualizada** em relação à documentação oficial

## Arquivos Modificados

### 1. `/lib/api/distributions.ts`
**Alterações:**
- ✅ Atualizado `BulkCreateDistributionsDto` para seguir nova documentação da API
- ✅ Adicionado `BulkDistributionItem` interface
- ✅ Atualizado `BulkCreateDistributionsResponse` com formato completo
- ✅ Corrigido endpoint de `/scp/distributions/bulk-create` para `/scp/distributions/bulk`

**Nova Interface BulkCreateDistributionsDto:**
```typescript
export interface BulkDistributionItem {
  investorId: string
  amount: number
  percentage: number
  irrf?: number
  otherDeductions?: number
  notes?: string
}

export interface BulkCreateDistributionsDto {
  projectId: string
  baseValue: number
  referenceNumber?: string
  distributionDate: string
  competenceDate: string
  paymentMethod?: "TED" | "PIX" | "DOC" | "DINHEIRO" | "CHEQUE"
  paymentDate?: string
  status?: DistributionStatus
  attachments?: string[]
  distributions: BulkDistributionItem[]
}

export interface BulkCreateDistributionsResponse {
  message: string
  count: number
  distributions: DistributionDetails[]
}
```

### 2. `/app/dashboard/investidores/distribuicoes/nova/page.tsx`
**Alterações:**
- ✅ Adicionado imports: `projectsApi`, `investorsApi`, `distributionPoliciesApi`
- ✅ Adicionado estado `investorPolicy` para armazenar política ativa
- ✅ Adicionado estado `loadingPolicy` para feedback visual
- ✅ Implementado `loadProjects()` - busca projetos ativos via API
- ✅ Implementado `loadInvestors()` - busca investidores ativos via API
- ✅ Implementado `loadInvestorPolicy()` - busca política de distribuição do investidor no projeto
- ✅ Adicionado componente `Alert` para exibir informações da política ativa
- ✅ Auto-preenchimento do percentual quando política é encontrada

**Funcionalidades Adicionadas:**
1. **Carregamento Automático**: Projetos e investidores são carregados ao selecionar empresa
2. **Busca de Política**: Quando projeto + investidor são selecionados, busca política ativa
3. **Exibição Visual**: Alert com informações da política (percentual, status)
4. **Auto-preenchimento**: Se há política ativa, percentual é preenchido automaticamente
5. **Feedback**: Loading states e mensagens de erro apropriadas

**Interface de Exibição da Política:**
```tsx
{investorPolicy && (
  <Alert>
    <Info className="h-4 w-4" />
    <AlertDescription>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium mb-2">Política de Distribuição Ativa</p>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Percentual configurado:</span>{" "}
              <span className="font-semibold">
                {distributionPoliciesApi.helpers.formatPercentage(investorPolicy.percentage)}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">Status:</span>{" "}
              <Badge variant="default" className="ml-1">Ativa</Badge>
            </p>
          </div>
        </div>
        <CheckCircle2 className="h-5 w-5 text-green-600" />
      </div>
    </AlertDescription>
  </Alert>
)}
```

### 3. `/app/dashboard/investidores/distribuicoes/automatica/page.tsx`
**Alterações:**
- ✅ Adicionado import `projectsApi`
- ✅ Implementado `loadProjects()` - busca projetos ativos via API
- ✅ Atualizado `handleSubmit()` para usar novo formato da API bulk

**Novo Formato de Envio (Bulk):**
```typescript
const distributions = preview.map(item => ({
  investorId: item.investorId,
  amount: item.amount,
  percentage: item.percentage,
  irrf: item.irrf,
  otherDeductions: 0,
  notes: formData.description || undefined
}))

await distributionsApi.bulkCreate(selectedCompany.id, {
  projectId: formData.projectId,
  baseValue: parseFloat(formData.baseAmount),
  competenceDate: formData.competenceDate,
  distributionDate: formData.distributionDate,
  status: "PENDENTE",
  distributions: distributions
})
```

## Fluxo de Funcionamento

### Distribuição Manual (Nova)
1. Usuário acessa página `/dashboard/investidores/distribuicoes/nova`
2. Sistema carrega projetos e investidores ativos
3. Usuário seleciona projeto no select (dados da API)
4. Usuário seleciona investidor no select (dados da API)
5. **Sistema busca automaticamente política de distribuição ativa**
6. Se encontrada, exibe alert com:
   - Percentual configurado
   - Status da política
   - Badge visual de "Ativa"
7. Se encontrada, auto-preenche campo de percentual
8. Usuário preenche demais campos e salva

### Distribuição Automática (Bulk)
1. Usuário acessa página `/dashboard/investidores/distribuicoes/automatica`
2. Sistema carrega projetos ativos
3. Usuário seleciona projeto
4. Usuário informa valor base
5. Sistema calcula preview com base nas políticas ativas
6. Usuário confirma
7. Sistema envia todas distribuições em um único request bulk

## Validações Implementadas

### Distribuição Manual
- ✅ Projeto selecionado (obrigatório)
- ✅ Investidor selecionado (obrigatório)
- ✅ Valor > 0 (obrigatório)
- ✅ Percentual entre 0 e 100 (obrigatório)
- ✅ Data de competência (obrigatório)
- ✅ Data de distribuição (obrigatório)
- ✅ IRRF calculado automaticamente (5%) se não informado

### Distribuição Automática
- ✅ Projeto selecionado (obrigatório)
- ✅ Valor base > 0 (obrigatório)
- ✅ Data de competência (obrigatório)
- ✅ Data de distribuição (obrigatório)
- ✅ Soma de percentuais = 100%
- ✅ Pelo menos 1 distribuição no preview

## Integração com API

### Endpoints Utilizados

#### Projetos
```
GET /scp/projects
Headers: { X-Company-ID: uuid }
Query: { page: 1, limit: 100, active: true }
```

#### Investidores
```
GET /scp/investors
Headers: { X-Company-ID: uuid }
Query: { page: 1, limit: 100, active: true }
```

#### Políticas de Distribuição
```
GET /scp/distribution-policies/by-project/:projectId
Headers: { X-Company-ID: uuid }
Retorna: { policies: [...], summary: {...} }
```

#### Distribuição Manual
```
POST /scp/distributions
Headers: { X-Company-ID: uuid }
Body: CreateDistributionDto
```

#### Distribuição Bulk
```
POST /scp/distributions/bulk
Headers: { X-Company-ID: uuid }
Body: BulkCreateDistributionsDto (com array distributions)
```

## Melhorias de UX

1. **Loading States**: 
   - Skeleton/spinner durante carregamento de projetos
   - Skeleton/spinner durante carregamento de investidores
   - Spinner durante busca de política
   
2. **Feedback Visual**:
   - Alert verde com ícone CheckCircle2 quando política encontrada
   - Badge "Ativa" destacando status
   - Percentual em negrito para destaque
   
3. **Auto-preenchimento Inteligente**:
   - Percentual preenchido automaticamente se há política
   - IRRF calculado automaticamente (5% do valor bruto)
   - Valor líquido atualizado em tempo real

4. **Mensagens Descritivas**:
   - Erros detalhados da API
   - Confirmação de sucesso com número de distribuições criadas
   - Alertas de validação claros

## Casos de Uso

### Caso 1: Distribuição Manual com Política Ativa
```
1. Seleciona Projeto "Empreendimento XYZ"
2. Seleciona Investidor "João Silva"
3. Sistema exibe: "Política de Distribuição Ativa - Percentual: 25.00%"
4. Campo percentual automaticamente preenchido com 25.00
5. Preenche valor bruto: R$ 100.000,00
6. IRRF calculado: R$ 5.000,00
7. Valor líquido: R$ 95.000,00
8. Salva distribuição
```

### Caso 2: Distribuição Manual sem Política
```
1. Seleciona Projeto "Empreendimento ABC"
2. Seleciona Investidor "Maria Santos"
3. Nenhuma política ativa encontrada (sem alert)
4. Preenche percentual manualmente: 30.00
5. Preenche demais campos e salva
```

### Caso 3: Distribuição Automática (Múltiplos Investidores)
```
1. Seleciona Projeto "Empreendimento XYZ"
2. Informa valor base: R$ 500.000,00
3. Sistema calcula preview:
   - João Silva (25%): R$ 125.000,00
   - Maria Santos (35%): R$ 175.000,00
   - Pedro Costa (40%): R$ 200.000,00
4. Validação: 25 + 35 + 40 = 100% ✓
5. Confirma criação
6. Sistema cria 3 distribuições em uma transação
```

## Testes Recomendados

- [ ] Carregar projetos na página de distribuição manual
- [ ] Carregar investidores na página de distribuição manual
- [ ] Selecionar projeto + investidor e verificar exibição de política
- [ ] Criar distribuição manual com política ativa
- [ ] Criar distribuição manual sem política ativa
- [ ] Carregar projetos na página de distribuição automática
- [ ] Criar distribuições em bulk (múltiplos investidores)
- [ ] Validar soma de percentuais = 100%
- [ ] Testar cálculo automático de IRRF
- [ ] Testar cálculo de valor líquido em tempo real

## Status
✅ **Concluído**
- API de distribuições atualizada
- Carregamento de projetos implementado
- Carregamento de investidores implementado
- Exibição de política de distribuição implementada
- Auto-preenchimento de percentual implementado
- Distribuição bulk corrigida
- Zero erros de compilação
