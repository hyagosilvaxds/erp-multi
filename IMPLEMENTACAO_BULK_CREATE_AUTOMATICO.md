# Implementação: Bulk Create Automático de Distribuições

## Data
10 de novembro de 2025

## Objetivo
Implementar endpoint `POST /scp/distributions/bulk-create` que cria distribuições automaticamente com base nas políticas ativas de um projeto.

## Diferença entre Endpoints

### 1. `POST /scp/distributions/bulk` (Manual)
- **Uso**: Criar múltiplas distribuições com valores específicos
- **Input**: Lista completa de distribuições com todos os detalhes
- **Controle**: Total - usuário define cada distribuição individualmente
- **Caso de uso**: Distribuições customizadas, valores não proporcionais

### 2. `POST /scp/distributions/bulk-create` (Automático)
- **Uso**: Criar distribuições baseadas em políticas ativas
- **Input**: Apenas projeto, valor base e datas
- **Controle**: Automático - sistema calcula com base em políticas
- **Caso de uso**: Distribuições regulares seguindo políticas configuradas

## Arquivos Modificados

### 1. `/lib/api/distributions.ts`

#### Novas Interfaces
```typescript
// DTO para criação automática
export interface BulkCreateAutomaticDto {
  projectId: string
  baseValue: number
  competenceDate: string
  distributionDate: string
}

// Resposta do bulk-create automático
export interface BulkCreateAutomaticResponse {
  message: string
  distributions: Array<{
    id: string
    investorId: string
    amount: number
    percentage: number
    netAmount: number
    status: DistributionStatus
  }>
}
```

#### Nova Função API
```typescript
/**
 * Cria distribuições automaticamente baseadas nas políticas ativas
 */
export async function bulkCreateAutomatic(
  companyId: string,
  data: BulkCreateAutomaticDto
): Promise<BulkCreateAutomaticResponse> {
  const response = await apiClient.post<BulkCreateAutomaticResponse>(
    "/scp/distributions/bulk-create",
    data,
    {
      headers: {
        "X-Company-ID": companyId,
      },
    }
  )
  return response.data
}
```

#### Export Atualizado
```typescript
export const distributionsApi = {
  create: createDistribution,
  bulkCreate: bulkCreateDistributions,           // Manual
  bulkCreateAutomatic: bulkCreateAutomatic,      // Automático (NOVO)
  getAll: getDistributions,
  getByInvestor: getDistributionsByInvestor,
  getByProject: getDistributionsByProject,
  getById: getDistributionById,
  update: updateDistribution,
  delete: deleteDistribution,
  markAsPaid: markDistributionAsPaid,
  markAsCanceled: markDistributionAsCanceled,
  helpers: { ... }
}
```

### 2. `/app/dashboard/investidores/distribuicoes/automatica/page.tsx`

#### Antes (Usando bulk manual)
```typescript
try {
  setLoading(true)

  // Preparar distribuições conforme a nova API
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
    distributions: distributions  // Array manual
  })

  toast({
    title: "Sucesso",
    description: `${preview.length} distribuição(ões) criada(s) com sucesso`,
  })

  router.push("/dashboard/investidores/distribuicoes")
} catch (error: any) {
  console.error("Erro ao criar distribuições:", error)
  toast({
    title: "Erro ao criar distribuições",
    description: error.response?.data?.message || error.message,
    variant: "destructive",
  })
} finally {
  setLoading(false)
}
```

#### Depois (Usando bulk-create automático)
```typescript
try {
  setLoading(true)

  // Usar o endpoint bulk-create automático (baseado em políticas)
  const result = await distributionsApi.bulkCreateAutomatic(selectedCompany.id, {
    projectId: formData.projectId,
    baseValue: parseFloat(formData.baseAmount),
    competenceDate: formData.competenceDate,
    distributionDate: formData.distributionDate,
  })

  toast({
    title: "Sucesso",
    description: result.message || `${result.distributions.length} distribuição(ões) criada(s) com sucesso`,
  })

  router.push("/dashboard/investidores/distribuicoes")
} catch (error: any) {
  console.error("Erro ao criar distribuições:", error)
  toast({
    title: "Erro ao criar distribuições",
    description: error.response?.data?.message || error.message,
    variant: "destructive",
  })
} finally {
  setLoading(false)
}
```

**Vantagens da mudança:**
- ✅ Código mais simples e limpo
- ✅ Não precisa montar array de distribuições manualmente
- ✅ Backend valida políticas automaticamente
- ✅ Backend calcula valores proporcionalmente
- ✅ Mensagem de sucesso vem da API

## Documentação da API

### Endpoint: `POST /scp/distributions/bulk-create`

#### Descrição
Cria distribuições automaticamente com base nas políticas ativas do projeto.

#### Headers
```
Authorization: Bearer {token}
X-Company-ID: {uuid}
```

#### Request Body
```json
{
  "projectId": "uuid",
  "baseValue": 50000.00,
  "competenceDate": "2024-10-31T23:59:59.999Z",
  "distributionDate": "2024-11-10T00:00:00.000Z"
}
```

#### Validações Aplicadas (Backend)
1. ✅ Projeto existe e pertence à empresa
2. ✅ Existem políticas ativas no projeto
3. ✅ Soma dos percentuais das políticas = 100%
4. ✅ Valor base > 0
5. ✅ Datas válidas

#### Resposta de Sucesso (200 OK)
```json
{
  "message": "3 distribuições criadas com sucesso",
  "distributions": [
    {
      "id": "uuid-1",
      "investorId": "uuid-inv-1",
      "amount": 20000.00,
      "percentage": 40.00,
      "netAmount": 20000.00,
      "status": "PENDENTE"
    },
    {
      "id": "uuid-2",
      "investorId": "uuid-inv-2",
      "amount": 17500.00,
      "percentage": 35.00,
      "netAmount": 17500.00,
      "status": "PENDENTE"
    },
    {
      "id": "uuid-3",
      "investorId": "uuid-inv-3",
      "amount": 12500.00,
      "percentage": 25.00,
      "netAmount": 12500.00,
      "status": "PENDENTE"
    }
  ]
}
```

#### Erros Possíveis

**404 Not Found - Projeto não encontrado**
```json
{
  "statusCode": 404,
  "message": "Projeto não encontrado",
  "error": "Not Found"
}
```

**400 Bad Request - Sem políticas ativas**
```json
{
  "statusCode": 400,
  "message": "Não há políticas de distribuição ativas para este projeto",
  "error": "Bad Request"
}
```

**400 Bad Request - Soma de percentuais incorreta**
```json
{
  "statusCode": 400,
  "message": "A soma dos percentuais das políticas ativas deve ser 100%. Atual: 95%",
  "error": "Bad Request"
}
```

## Fluxo de Funcionamento

### 1. Usuário Acessa Tela de Distribuição Automática
```
/dashboard/investidores/distribuicoes/automatica
```

### 2. Seleciona Projeto e Informa Dados
```typescript
{
  projectId: "projeto-solar-abc",
  baseValue: 50000.00,
  competenceDate: "2024-10",
  distributionDate: "2024-11-10"
}
```

### 3. Sistema Busca Políticas Ativas (Preview)
```typescript
// Endpoint usado para preview (já existente)
GET /scp/distribution-policies/calculate-amounts?projectId=xxx&baseValue=50000

// Resposta
[
  { investorId: "inv-1", percentage: 40, amount: 20000 },
  { investorId: "inv-2", percentage: 35, amount: 17500 },
  { investorId: "inv-3", percentage: 25, amount: 12500 }
]
```

### 4. Usuário Confirma Criação
Sistema chama endpoint bulk-create:
```typescript
POST /scp/distributions/bulk-create
{
  projectId: "projeto-solar-abc",
  baseValue: 50000.00,
  competenceDate: "2024-10-31T23:59:59.999Z",
  distributionDate: "2024-11-10T00:00:00.000Z"
}
```

### 5. Backend Processa
1. Valida projeto existe
2. Busca políticas ativas do projeto
3. Valida soma de percentuais = 100%
4. Calcula valores proporcionalmente
5. Cria distribuições em transação
6. Retorna resultado

### 6. Frontend Exibe Sucesso
```typescript
toast({
  title: "Sucesso",
  description: "3 distribuições criadas com sucesso"
})
router.push("/dashboard/investidores/distribuicoes")
```

## Comparação: Manual vs Automático

### Cenário: Distribuir R$ 50.000 para 3 investidores

#### Método Manual (`/bulk`)
```typescript
// Frontend precisa:
1. Buscar políticas ativas
2. Calcular valores manualmente
3. Montar array de distribuições
4. Enviar tudo para API

// Request
POST /scp/distributions/bulk
{
  projectId: "xxx",
  baseValue: 50000,
  competenceDate: "...",
  distributionDate: "...",
  status: "PENDENTE",
  distributions: [  // ← Frontend monta isso
    {
      investorId: "inv-1",
      amount: 20000,
      percentage: 40,
      irrf: 1000,
      otherDeductions: 0
    },
    {
      investorId: "inv-2",
      amount: 17500,
      percentage: 35,
      irrf: 875,
      otherDeductions: 0
    },
    {
      investorId: "inv-3",
      amount: 12500,
      percentage: 25,
      irrf: 625,
      otherDeductions: 0
    }
  ]
}
```

**Linhas de código necessárias:** ~20 linhas

#### Método Automático (`/bulk-create`)
```typescript
// Frontend precisa:
1. Enviar dados básicos
2. Backend faz todo o resto

// Request
POST /scp/distributions/bulk-create
{
  projectId: "xxx",
  baseValue: 50000,
  competenceDate: "...",
  distributionDate: "..."
}
```

**Linhas de código necessárias:** ~5 linhas

**Redução:** 75% menos código! 🎉

## Vantagens da Implementação

### 1. Simplicidade
- ✅ Frontend não precisa calcular valores
- ✅ Frontend não precisa montar array complexo
- ✅ Menos chance de erros de cálculo

### 2. Segurança
- ✅ Backend valida todas as políticas
- ✅ Backend garante soma = 100%
- ✅ Lógica de negócio centralizada

### 3. Manutenibilidade
- ✅ Alterações de cálculo só no backend
- ✅ Frontend mais simples e legível
- ✅ Testes mais focados

### 4. Performance
- ✅ Um único request ao invés de múltiplos
- ✅ Backend otimiza queries
- ✅ Transação única no banco

### 5. Consistência
- ✅ Sempre usa políticas mais recentes
- ✅ Cálculos padronizados
- ✅ Menos bugs de sincronização

## Casos de Uso

### Caso 1: Distribuição Trimestral Regular
```
Projeto: Solar ABC
Valor Base: R$ 100.000
Políticas Ativas:
- João Silva (40%) → R$ 40.000
- Maria Santos (35%) → R$ 35.000
- Pedro Costa (25%) → R$ 25.000

Ação: POST /bulk-create
Resultado: 3 distribuições criadas automaticamente
```

### Caso 2: Erro - Políticas Incompletas
```
Projeto: Energia XYZ
Valor Base: R$ 50.000
Políticas Ativas:
- Ana Paula (30%)
- Carlos Lima (40%)
Total: 70% ≠ 100%

Ação: POST /bulk-create
Resultado: Erro 400 - "Soma deve ser 100%. Atual: 70%"
```

### Caso 3: Erro - Sem Políticas
```
Projeto: Novo Projeto
Valor Base: R$ 75.000
Políticas Ativas: Nenhuma

Ação: POST /bulk-create
Resultado: Erro 400 - "Não há políticas ativas"
```

## Endpoints Implementados (Resumo)

### ✅ Já Existentes
- `POST /scp/distributions` - Criar distribuição individual
- `POST /scp/distributions/bulk` - Criar múltiplas (manual)
- `GET /scp/distributions` - Listar com filtros
- `GET /scp/distributions/by-investor/:id` - Por investidor
- `GET /scp/distributions/by-project/:id` - Por projeto
- `GET /scp/distributions/:id` - Detalhes
- `PUT /scp/distributions/:id` - Atualizar
- `DELETE /scp/distributions/:id` - Deletar
- `PATCH /scp/distributions/:id/mark-as-paid` - Marcar pago
- `PATCH /scp/distributions/:id/mark-as-canceled` - Cancelar

### 🆕 Novo
- `POST /scp/distributions/bulk-create` - Criar múltiplas (automático)

## Testes Recomendados

- [ ] Criar distribuições com políticas válidas (100%)
- [ ] Tentar criar sem políticas ativas (deve dar erro 400)
- [ ] Tentar criar com políticas incompletas (<100%) (deve dar erro 400)
- [ ] Tentar criar com políticas excedentes (>100%) (deve dar erro 400)
- [ ] Verificar se valores são calculados corretamente
- [ ] Verificar se todas distribuições têm status PENDENTE
- [ ] Verificar transação (rollback se alguma falhar)
- [ ] Testar com projeto inexistente (deve dar erro 404)
- [ ] Testar com empresa incorreta (deve dar erro 403)

## Status
✅ **Concluído**
- Interface `BulkCreateAutomaticDto` criada
- Interface `BulkCreateAutomaticResponse` criada
- Função `bulkCreateAutomatic()` implementada
- Export adicionado a `distributionsApi`
- Página de distribuição automática atualizada
- Zero erros de compilação
- Documentação completa

## Próximos Passos Sugeridos
1. Implementar testes unitários no backend
2. Adicionar logs de auditoria
3. Criar relatório de distribuições automáticas
4. Implementar notificações por email aos investidores
5. Dashboard com histórico de distribuições automáticas
