# Módulo de Distribuições - Investidores SCP

## 📋 Visão Geral

O módulo de distribuições permite gerenciar os pagamentos de lucros/dividendos aos investidores de projetos. O sistema oferece duas formas de criar distribuições:

1. **Manual**: Criação individual de distribuições
2. **Automática (Bulk)**: Criação baseada em políticas ativas

## 🎯 Funcionalidades

### Distribuições Manuais
- ✅ Criar distribuição individual
- ✅ Definir valor bruto e percentual
- ✅ Cálculo automático de IRRF (5%)
- ✅ Suporte a deduções adicionais
- ✅ Cálculo automático do valor líquido

### Distribuições Automáticas
- ✅ Criação em lote baseada em políticas
- ✅ Preview antes de criar
- ✅ Validação de soma de percentuais (100%)
- ✅ Cálculos automáticos para todos investidores

### Gerenciamento
- ✅ Listagem paginada com filtros
- ✅ Busca por investidor/projeto
- ✅ Filtro por status (PAGO, PENDENTE, CANCELADO)
- ✅ Visualização detalhada
- ✅ Edição de distribuições
- ✅ Exclusão de distribuições
- ✅ Cards de estatísticas (total pago, pendente, cancelado)

## 📡 API Endpoints

### Base URL
```
/scp/distributions
```

### 1. Criar Distribuição Manual

**POST** `/scp/distributions`

```typescript
// Request Body
{
  projectId: string         // UUID do projeto
  investorId: string        // UUID do investidor
  amount: number           // Valor bruto
  percentage: number       // Percentual (0-100)
  competenceDate: string   // Formato: YYYY-MM
  distributionDate: string // Formato: YYYY-MM-DD
  description?: string     // Opcional
  irrf?: number           // Opcional, default: 5% de amount
  otherDeductions?: number // Opcional, default: 0
}

// Response
{
  id: string
  projectId: string
  investorId: string
  amount: number
  percentage: number
  netAmount: number          // amount - irrf - otherDeductions
  competenceDate: string
  distributionDate: string
  description: string | null
  irrf: number
  otherDeductions: number
  status: "PENDENTE"         // Status inicial
  createdAt: string
  updatedAt: string
}
```

**Status Codes:**
- `201`: Criado com sucesso
- `400`: Dados inválidos
- `404`: Projeto ou investidor não encontrado
- `409`: Conflito (ex: duplicata)

---

### 2. Criar Distribuições em Lote (Bulk Create)

**POST** `/scp/distributions/bulk-create`

Cria distribuições automaticamente baseadas nas políticas ativas do projeto.

```typescript
// Request Body
{
  projectId: string         // UUID do projeto
  baseAmount: number        // Valor total a distribuir
  competenceDate: string    // Formato: YYYY-MM
  distributionDate: string  // Formato: YYYY-MM-DD
  description?: string      // Opcional
}

// Response
{
  created: number           // Quantidade criada
  distributions: Array<{
    id: string
    projectId: string
    investorId: string
    investorName: string
    amount: number
    percentage: number
    netAmount: number
    competenceDate: string
    distributionDate: string
    description: string | null
    irrf: number
    otherDeductions: number
    status: "PENDENTE"
    createdAt: string
    updatedAt: string
  }>
}
```

**Validações:**
- ✅ Projeto deve ter políticas ativas
- ✅ Soma dos percentuais deve ser 100%
- ✅ Cada investidor deve ter apenas 1 política ativa

**Status Codes:**
- `201`: Criadas com sucesso
- `400`: Soma de percentuais ≠ 100%
- `404`: Projeto não encontrado ou sem políticas ativas

---

### 3. Listar Distribuições (Paginado)

**GET** `/scp/distributions`

```typescript
// Query Parameters
{
  page?: number            // Default: 1
  limit?: number           // Default: 10, Max: 100
  status?: "PAGO" | "PENDENTE" | "CANCELADO"
  projectId?: string       // Filtrar por projeto
  investorId?: string      // Filtrar por investidor
  search?: string          // Buscar em nome/código
  startDate?: string       // YYYY-MM-DD
  endDate?: string         // YYYY-MM-DD
}

// Response
{
  data: Array<{
    id: string
    amount: number
    percentage: number
    netAmount: number
    competenceDate: string
    distributionDate: string
    status: "PAGO" | "PENDENTE" | "CANCELADO"
    project: {
      id: string
      name: string
      code: string
    }
    investor: {
      id: string
      name?: string
      companyName?: string
      type: "PESSOA_FISICA" | "PESSOA_JURIDICA"
    }
    createdAt: string
    updatedAt: string
  }>
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
```

---

### 4. Buscar Distribuições por Investidor

**GET** `/scp/distributions/by-investor/:investorId`

```typescript
// Query Parameters
{
  page?: number
  limit?: number
  status?: "PAGO" | "PENDENTE" | "CANCELADO"
  startDate?: string
  endDate?: string
}

// Response: Mesmo formato do endpoint de listagem
```

---

### 5. Buscar Distribuições por Projeto

**GET** `/scp/distributions/by-project/:projectId`

```typescript
// Query Parameters
{
  page?: number
  limit?: number
  status?: "PAGO" | "PENDENTE" | "CANCELADO"
  startDate?: string
  endDate?: string
}

// Response: Mesmo formato do endpoint de listagem
```

---

### 6. Buscar Distribuição por ID

**GET** `/scp/distributions/:id`

```typescript
// Response
{
  id: string
  amount: number
  percentage: number
  netAmount: number
  competenceDate: string
  distributionDate: string
  description: string | null
  irrf: number
  otherDeductions: number
  status: "PAGO" | "PENDENTE" | "CANCELADO"
  paymentDate: string | null
  paymentMethod: string | null
  project: {
    id: string
    name: string
    code: string
    status: string
    expectedReturn: number
    investedValue: number
    distributedValue: number
  }
  investor: {
    id: string
    name?: string
    companyName?: string
    cpf?: string
    cnpj?: string
    email: string
    phone: string
    type: "PESSOA_FISICA" | "PESSOA_JURIDICA"
  }
  createdBy: {
    id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}
```

---

### 7. Atualizar Distribuição

**PUT** `/scp/distributions/:id`

```typescript
// Request Body (todos opcionais)
{
  amount?: number
  percentage?: number
  competenceDate?: string
  distributionDate?: string
  description?: string
  irrf?: number
  otherDeductions?: number
  status?: "PAGO" | "PENDENTE" | "CANCELADO"
  paymentDate?: string      // Obrigatório se status = PAGO
  paymentMethod?: string    // Obrigatório se status = PAGO
}

// Response: Mesmo formato do GET /:id
```

**Efeito Colateral:**
- Se status mudar para `PAGO`: incrementa `distributedValue` do projeto
- Se status mudar de `PAGO` para outro: decrementa `distributedValue`

---

### 8. Excluir Distribuição

**DELETE** `/scp/distributions/:id`

```typescript
// Response
{
  message: "Distribuição excluída com sucesso"
}
```

**Status Codes:**
- `200`: Excluída com sucesso
- `404`: Distribuição não encontrada
- `409`: Não pode excluir (ex: já paga)

---

## 📊 Status de Distribuição

| Status | Descrição | Cor | Ações Permitidas |
|--------|-----------|-----|------------------|
| **PENDENTE** | Aguardando pagamento | Amarelo | Editar, Excluir, Marcar como Pago |
| **PAGO** | Pagamento realizado | Verde | Visualizar, Cancelar |
| **CANCELADO** | Distribuição cancelada | Vermelho | Visualizar |

---

## 💰 Cálculos Automáticos

### 1. IRRF (Imposto de Renda Retido na Fonte)
```typescript
// Default: 5% do valor bruto
irrf = amount * 0.05

// Pode ser customizado no cadastro manual
```

### 2. Valor Líquido
```typescript
netAmount = amount - irrf - otherDeductions

// Exemplo:
// amount = R$ 10.000,00
// irrf = R$ 500,00 (5%)
// otherDeductions = R$ 100,00
// netAmount = R$ 9.400,00
```

### 3. Distribuição Automática
```typescript
// Baseado nas políticas ativas:
// Política 1: Investidor A = 35%
// Política 2: Investidor B = 25%
// Política 3: Investidor C = 40%
// Total = 100% ✅

// Se baseAmount = R$ 150.000,00:
// Investidor A recebe: R$ 52.500,00 (35%)
// Investidor B recebe: R$ 37.500,00 (25%)
// Investidor C recebe: R$ 60.000,00 (40%)
```

---

## 🗂️ Estrutura de Arquivos

```
/lib/api/
  └── distributions.ts          # API client (460+ linhas)
      ├── Types & Interfaces
      ├── DTOs
      ├── API Functions (8)
      └── Helper Functions (12)

/app/dashboard/investidores/distribuicoes/
  ├── page.tsx                  # Listagem (500+ linhas)
  ├── nova/
  │   └── page.tsx             # Cadastro manual (500+ linhas)
  └── automatica/
      └── page.tsx             # Distribuição automática (450+ linhas)
```

---

## 🎨 Helpers Disponíveis

```typescript
// Em distributionsApi.helpers:

// Status
getStatusLabel(status)         // "Pago", "Pendente", "Cancelado"
getStatusColor(status)         // "green", "yellow", "red"

// Cálculos
calculateNetAmount(amount, irrf, otherDeductions)
calculateIRRF(amount, rate = 0.05)

// Formatação
formatCurrency(value)          // R$ 1.234,56
formatPercentage(value)        // 35,00%
formatDate(date)               // 15/03/2024
formatDateTime(date)           // 15/03/2024 às 14:30
formatCompetence(date)         // 03/2024

// Investidor
getInvestorName(investor)      // Nome completo ou razão social
getInvestorDocument(investor)  // CPF ou CNPJ formatado

// UI
getAmountColor(status)         // Cor baseada no status
```

---

## 📈 Cards de Estatísticas

A página de listagem exibe 4 cards principais:

1. **Total de Distribuições**: Quantidade total registrada
2. **Valor Pago**: Soma dos valores líquidos pagos
3. **Valor Pendente**: Soma dos valores líquidos pendentes
4. **Valor Cancelado**: Soma dos valores cancelados

---

## 🔄 Fluxo de Trabalho

### Distribuição Manual
1. Acessar "Nova Distribuição"
2. Selecionar projeto e investidor
3. Informar valor bruto e percentual
4. Sistema calcula IRRF automaticamente
5. Informar competência e data de distribuição
6. Salvar com status PENDENTE
7. Posteriormente marcar como PAGO

### Distribuição Automática
1. Acessar "Distribuição Automática"
2. Selecionar projeto (com políticas ativas)
3. Informar valor base total
4. Sistema exibe preview com cálculos
5. Validar soma = 100%
6. Confirmar criação em lote
7. Distribuições criadas com status PENDENTE

---

## ⚠️ Validações Importantes

### Manual
- ✅ Valor bruto > 0
- ✅ Percentual entre 0 e 100
- ✅ Competência no formato MM/YYYY
- ✅ Projeto e investidor devem existir

### Automática
- ✅ Projeto deve ter políticas ativas
- ✅ Soma dos percentuais = 100%
- ✅ Apenas 1 política ativa por investidor
- ✅ Valor base > 0

---

## 🔗 Integração com Outros Módulos

### Projetos
- Distribuição PAGA incrementa `distributedValue`
- Usado para calcular ROI real

### Políticas de Distribuição
- Bulk create usa políticas ativas
- Percentuais definem divisão do valor

### Investidores
- Cada distribuição pertence a 1 investidor
- Histórico completo por investidor

---

## 🎯 Próximos Passos

- [ ] Página de visualização detalhada (`/distribuicoes/[id]`)
- [ ] Página de edição (`/distribuicoes/[id]/editar`)
- [ ] Marcar como PAGO em lote
- [ ] Exportar relatórios (PDF/Excel)
- [ ] Dashboard de distribuições
- [ ] Gráficos de evolução
- [ ] Notificações automáticas
- [ ] Integração com pagamentos

---

## 📝 Exemplo de Uso

```typescript
import { distributionsApi } from "@/lib/api/distributions"

// 1. Criar distribuição manual
const newDistribution = await distributionsApi.create(companyId, {
  projectId: "uuid-projeto",
  investorId: "uuid-investidor",
  amount: 10000,
  percentage: 35,
  competenceDate: "2024-03",
  distributionDate: "2024-04-05",
  description: "Distribuição mensal de lucros"
})

// 2. Criar em lote
const bulkResult = await distributionsApi.bulkCreate(companyId, {
  projectId: "uuid-projeto",
  baseAmount: 150000,
  competenceDate: "2024-03",
  distributionDate: "2024-04-05"
})
console.log(`${bulkResult.created} distribuições criadas`)

// 3. Listar com filtros
const { data, meta } = await distributionsApi.getAll(companyId, {
  page: 1,
  limit: 10,
  status: "PENDENTE",
  search: "João"
})

// 4. Buscar por investidor
const investorDists = await distributionsApi.getByInvestor(
  companyId,
  "uuid-investidor",
  { status: "PAGO" }
)

// 5. Atualizar (marcar como pago)
await distributionsApi.update(companyId, distributionId, {
  status: "PAGO",
  paymentDate: "2024-04-10",
  paymentMethod: "PIX"
})

// 6. Excluir
await distributionsApi.delete(companyId, distributionId)

// 7. Usar helpers
const statusLabel = distributionsApi.helpers.getStatusLabel("PAGO")
const formattedValue = distributionsApi.helpers.formatCurrency(10000)
const netAmount = distributionsApi.helpers.calculateNetAmount(10000, 500, 100)
```

---

## 🎨 UI Components Usados

- `Card` / `CardHeader` / `CardContent` - Cards de conteúdo
- `Button` - Ações (criar, editar, excluir)
- `Input` - Campos de texto e números
- `Select` - Dropdowns (projeto, investidor, status)
- `Table` - Listagem de distribuições
- `Badge` - Status visual
- `Label` - Labels de formulários
- `Textarea` - Descrições
- `Alert` - Validações e erros

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar este documento
2. Consultar código-fonte em `/lib/api/distributions.ts`
3. Revisar validações no backend
4. Contatar equipe de desenvolvimento

---

**Versão:** 1.0.0  
**Última Atualização:** 2024  
**Autor:** Sistema ERP Multi
