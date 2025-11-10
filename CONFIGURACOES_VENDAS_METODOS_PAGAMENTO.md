# Configurações de Vendas - Métodos de Pagamento

## 📋 Visão Geral

Tela completa de gerenciamento de **Métodos de Pagamento** com CRUD completo, templates de parcelamento customizados, análise de crédito e configurações avançadas.

## 🎯 Objetivo

Permitir que a empresa configure todos os métodos de pagamento aceitos em vendas, incluindo:
- Métodos simples (PIX, Dinheiro)
- Parcelamento padrão (Cartão de Crédito 12x)
- Parcelamento customizado (Boleto 7/21, Entrada + 2x)
- Análise de crédito
- Taxas e prazos

## 📁 Arquivos

### API Client
- **Caminho**: `/lib/api/payment-methods.ts`
- **Exporta**: `paymentMethodsApi`, tipos e helpers

### Página
- **Caminho**: `/app/dashboard/vendas/configuracoes/page.tsx`
- **Rota**: `/dashboard/vendas/configuracoes`
- **Tipo**: Client Component

## 🔧 API Client

### Tipos e Interfaces

```typescript
// Tipos de pagamento
export type PaymentMethodType = 
  | "CASH"              // Dinheiro
  | "CREDIT_CARD"       // Cartão de Crédito
  | "DEBIT_CARD"        // Cartão de Débito
  | "PIX"               // PIX
  | "BANK_SLIP"         // Boleto Bancário
  | "BANK_TRANSFER"     // Transferência Bancária
  | "CHECK"             // Cheque
  | "OTHER"             // Outro

// Template de parcela
export interface InstallmentTemplate {
  id: string
  paymentMethodId: string
  installmentNumber: number       // 1, 2, 3...
  daysToPayment: number           // Dias após a venda
  percentageOfTotal: number | null // 0-100%
  fixedAmount: number | null      // Valor fixo (R$)
  createdAt: string
  updatedAt: string
}

// Método de pagamento completo
export interface PaymentMethod {
  id: string
  companyId: string
  name: string                    // Ex: "PIX", "Cartão 12x"
  code: string                    // Ex: "PIX", "CREDIT_CARD_12X"
  type: PaymentMethodType
  active: boolean
  allowInstallments: boolean
  maxInstallments: number         // 1-48
  installmentFee: number          // 0-100% (taxa por parcela)
  requiresCreditAnalysis: boolean
  minCreditScore: number | null   // 0-1000
  daysToReceive: number | null    // Dias para receber
  transactionFee: number          // 0-100% (taxa da transação)
  createdAt: string
  updatedAt: string
  installmentTemplates: InstallmentTemplate[]
}
```

### Funções Disponíveis

| Função | Método | Endpoint | Descrição |
|--------|--------|----------|-----------|
| `getAll(filters?)` | GET | `/sales/payment-methods` | Lista todos os métodos |
| `getById(id)` | GET | `/sales/payment-methods/:id` | Busca por ID |
| `create(dto)` | POST | `/sales/payment-methods` | Cria novo método |
| `update(id, dto)` | PUT | `/sales/payment-methods/:id` | Atualiza método |
| `delete(id)` | DELETE | `/sales/payment-methods/:id` | Exclui método |
| `toggleStatus(id, active)` | PUT | `/sales/payment-methods/:id` | Ativa/Desativa |

### Exemplos de Uso

#### 1. Listar Métodos Ativos

```typescript
const activeMethods = await paymentMethodsApi.getAll({ active: true })
```

#### 2. Criar PIX Simples

```typescript
const pix = await paymentMethodsApi.create({
  name: "PIX",
  code: "PIX",
  type: "PIX",
  daysToReceive: 0,
  transactionFee: 0.5
})
```

#### 3. Criar Cartão com Parcelamento

```typescript
const creditCard = await paymentMethodsApi.create({
  name: "Cartão de Crédito",
  code: "CREDIT_CARD",
  type: "CREDIT_CARD",
  allowInstallments: true,
  maxInstallments: 12,
  installmentFee: 2.5,
  requiresCreditAnalysis: true,
  minCreditScore: 600,
  transactionFee: 3.5
})
```

#### 4. Criar Boleto 7/21 (Customizado)

```typescript
const boleto = await paymentMethodsApi.create({
  name: "Boleto 7/21",
  code: "BOLETO_7_21",
  type: "BANK_SLIP",
  allowInstallments: true,
  maxInstallments: 2,
  installmentTemplates: [
    {
      installmentNumber: 1,
      daysToPayment: 7,
      percentageOfTotal: 50
    },
    {
      installmentNumber: 2,
      daysToPayment: 21,
      percentageOfTotal: 50
    }
  ]
})
```

#### 5. Atualizar Taxa

```typescript
await paymentMethodsApi.update(methodId, {
  transactionFee: 1.5
})
```

#### 6. Desativar Método

```typescript
await paymentMethodsApi.toggleStatus(methodId, false)
```

## 🎨 Interface

### Estrutura da Página

```
┌─────────────────────────────────────────────┐
│ Header: Configurações de Vendas            │
│ [+ Novo Método]                             │
├─────────────────────────────────────────────┤
│                                             │
│ 💳 MÉTODOS DE PAGAMENTO                     │
│ ┌─────────────────────────────────────┐    │
│ │ Tabela:                             │    │
│ │ Nome | Tipo | Código | Parc. | Taxa│    │
│ │ PIX  | PIX  | PIX    | -     | 0.5%│    │
│ │ Cart | Créd | CREDIT | 12x   | 3.5%│    │
│ │ Bole | Bole | BOLET  | 2x    | 2%  │    │
│ │                                      │    │
│ │ [✏️ Editar] [🗑️ Excluir]              │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ ℹ️  Info: Templates de parcelamento         │
└─────────────────────────────────────────────┘
```

### Modal de Criação/Edição

```
┌─────────────────────────────────────────────┐
│ Novo/Editar Método de Pagamento            │
├─────────────────────────────────────────────┤
│                                             │
│ INFORMAÇÕES BÁSICAS                         │
│ Nome: [_____________] Código: [_______]    │
│ Tipo: [Cartão Créd.▼] [✓] Ativo           │
│                                             │
│ TAXAS E PRAZOS                              │
│ Taxa Trans: [3.5%] Dias Receb: [30]       │
│                                             │
│ [✓] PERMITIR PARCELAMENTO                   │
│ Máx Parcelas: [12] Taxa/Parc: [2.5%]      │
│                                             │
│ TEMPLATES DE PARCELAMENTO (opcional)        │
│ ┌──────────────────────────────────┐       │
│ │ Parc | Dias | %      | [🗑️]      │       │
│ │  1x  |  0   | 30%    | [🗑️]      │       │
│ │  2x  |  30  | 35%    | [🗑️]      │       │
│ │  3x  |  60  | 35%    | [🗑️]      │       │
│ │                      Total: 100% │       │
│ └──────────────────────────────────┘       │
│                                             │
│ Adicionar Template:                         │
│ Parcela [4] Dias [90] % [0]                │
│ [+ Adicionar Template]                      │
│                                             │
│ [✓] REQUER ANÁLISE DE CRÉDITO               │
│ Score Mínimo: [600]                         │
│                                             │
│ [Cancelar] [Criar/Atualizar]               │
└─────────────────────────────────────────────┘
```

## 📊 Funcionalidades

### 1. Listagem de Métodos

- ✅ Tabela com todos os métodos cadastrados
- ✅ Filtros automáticos (por empresa via header)
- ✅ Display de:
  - Nome e tipo (com badge)
  - Código (monospace)
  - Parcelamento (badge com número de parcelas ou X)
  - Taxa de transação
  - Status (Switch ativo/inativo)
- ✅ Ações: Editar e Excluir
- ✅ Estado vazio com mensagem amigável

### 2. Criar Método

- ✅ Modal com formulário completo
- ✅ Campos organizados em seções:
  - **Informações Básicas**: Nome, código, tipo, status
  - **Taxas e Prazos**: Taxa de transação, dias para receber
  - **Parcelamento**: Switch, max parcelas, taxa por parcela
  - **Templates**: Tabela + formulário de adição
  - **Análise de Crédito**: Switch, score mínimo
- ✅ Validação de campos obrigatórios
- ✅ Validação de soma de percentuais (100%)
- ✅ Preview de templates adicionados
- ✅ Feedback visual de total de percentuais

### 3. Editar Método

- ✅ Mesmo modal de criação, pré-preenchido
- ✅ Código não pode ser editado
- ✅ Templates existentes são carregados
- ✅ Permite adicionar/remover templates

### 4. Excluir Método

- ✅ Confirmação antes de excluir
- ✅ Tratamento de erro (vendas associadas)
- ✅ Atualização automática da lista

### 5. Ativar/Desativar

- ✅ Switch na tabela
- ✅ Atualização instantânea
- ✅ Feedback via toast

## 🔄 Fluxo de Uso

### Caso 1: Criar PIX Simples

1. Clicar em "Novo Método"
2. Preencher:
   - Nome: "PIX"
   - Código: "PIX"
   - Tipo: "PIX"
   - Taxa de Transação: 0.5%
   - Dias para Receber: 0
3. Clicar em "Criar"
4. Método aparece na tabela

### Caso 2: Criar Cartão 12x com Análise

1. Clicar em "Novo Método"
2. Preencher:
   - Nome: "Cartão de Crédito"
   - Código: "CREDIT_CARD"
   - Tipo: "Cartão de Crédito"
   - Taxa: 3.5%
3. Ativar "Permitir Parcelamento"
   - Max Parcelas: 12
   - Taxa/Parcela: 2.5%
4. Ativar "Requer Análise de Crédito"
   - Score Mínimo: 600
5. Clicar em "Criar"

### Caso 3: Criar Boleto 7/21

1. Clicar em "Novo Método"
2. Preencher:
   - Nome: "Boleto 7/21"
   - Código: "BOLETO_7_21"
   - Tipo: "Boleto Bancário"
3. Ativar "Permitir Parcelamento"
   - Max Parcelas: 2
4. Adicionar Templates:
   - Template 1: Parcela 1, 7 dias, 50%
   - Template 2: Parcela 2, 21 dias, 50%
5. Verificar badge "Total: 100%"
6. Clicar em "Criar"

### Caso 4: Editar Taxa de um Método

1. Clicar em "Editar" no método desejado
2. Alterar "Taxa de Transação"
3. Clicar em "Atualizar"

### Caso 5: Desativar Método

1. Clicar no Switch do método
2. Confirma desativação
3. Método não aparece mais em vendas

## 🚨 Validações e Erros

### Validações no Frontend

```typescript
// Nome e código obrigatórios
if (!formData.name || !formData.code) {
  toast({ variant: "destructive", message: "Nome e código são obrigatórios" })
  return
}

// Soma de percentuais deve ser 100%
const total = getTotalPercentage()
if (formData.installmentTemplates.length > 0 && total !== 100) {
  toast({ variant: "destructive", message: "Total deve ser 100%" })
  return
}
```

### Erros do Backend

| Status | Mensagem | Causa |
|--------|----------|-------|
| 400 | "name must be a string" | Campos inválidos |
| 404 | "Método não encontrado" | ID inexistente |
| 409 | "Já existe método com este código" | Código duplicado |
| 409 | "Soma das % deve ser 100%" | Templates inválidos |
| 409 | "15 venda(s) associada(s)" | Não pode excluir |

### Tratamento de Erros

```typescript
try {
  await paymentMethodsApi.create(formData)
  toast({ title: "Sucesso", description: "Criado com sucesso" })
} catch (error: any) {
  toast({
    variant: "destructive",
    title: "Erro",
    description: error.response?.data?.message || error.message
  })
}
```

## 🎯 Casos de Uso Avançados

### Entrada + 2 Parcelas

```json
{
  "name": "Entrada + 2x",
  "code": "ENTRADA_2X",
  "type": "BANK_SLIP",
  "allowInstallments": true,
  "maxInstallments": 3,
  "installmentTemplates": [
    { "installmentNumber": 1, "daysToPayment": 0, "percentageOfTotal": 30 },
    { "installmentNumber": 2, "daysToPayment": 30, "percentageOfTotal": 35 },
    { "installmentNumber": 3, "daysToPayment": 60, "percentageOfTotal": 35 }
  ]
}
```

### Boleto 30/60/90

```json
{
  "name": "Boleto 30/60/90",
  "code": "BOLETO_30_60_90",
  "type": "BANK_SLIP",
  "allowInstallments": true,
  "maxInstallments": 3,
  "installmentTemplates": [
    { "installmentNumber": 1, "daysToPayment": 30, "percentageOfTotal": 33.33 },
    { "installmentNumber": 2, "daysToPayment": 60, "percentageOfTotal": 33.33 },
    { "installmentNumber": 3, "daysToPayment": 90, "percentageOfTotal": 33.34 }
  ]
}
```

### Cartão Premium (Análise Rigorosa)

```json
{
  "name": "Cartão Premium",
  "code": "CREDIT_CARD_PREMIUM",
  "type": "CREDIT_CARD",
  "allowInstallments": true,
  "maxInstallments": 24,
  "installmentFee": 3.5,
  "requiresCreditAnalysis": true,
  "minCreditScore": 800,
  "transactionFee": 4.5
}
```

## 🔒 Segurança

### Headers Automáticos

```typescript
headers: {
  "x-company-id": selectedCompany.id,
  "Authorization": `Bearer ${token}` // Automático via apiClient
}
```

### Isolamento de Dados

- Todos os métodos são filtrados por `companyId`
- Uma empresa não pode ver/editar métodos de outra
- Validação no backend via header `x-company-id`

### Validações

- Frontend: Campos obrigatórios, tipos, ranges
- Backend: Schema validation, business rules
- Dupla validação: segurança e UX

## 📝 Helpers

### Labels Amigáveis

```typescript
export const paymentMethodTypeLabels: Record<PaymentMethodType, string> = {
  CASH: "Dinheiro",
  CREDIT_CARD: "Cartão de Crédito",
  DEBIT_CARD: "Cartão de Débito",
  PIX: "PIX",
  BANK_SLIP: "Boleto Bancário",
  BANK_TRANSFER: "Transferência Bancária",
  CHECK: "Cheque",
  OTHER: "Outro",
}
```

### Cálculo de Total

```typescript
const getTotalPercentage = () => {
  return (formData.installmentTemplates || []).reduce(
    (sum, t) => sum + (t.percentageOfTotal || 0),
    0
  )
}
```

## 🎨 Design

### Componentes Shadcn UI

- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`
- `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell`
- `Button`, `Input`, `Label`, `Select`, `Switch`
- `Badge` (variant: outline, secondary, default, destructive)

### Cores e Estados

- **Ativo**: Badge verde/default
- **Inativo**: Switch desligado
- **Total 100%**: Badge default (azul)
- **Total ≠ 100%**: Badge destructive (vermelho)
- **Loading**: Spinner centralizado

### Responsividade

```typescript
className="grid gap-4 md:grid-cols-2"  // 2 colunas em desktop
className="grid gap-4 md:grid-cols-3"  // 3 colunas em desktop
className="max-w-3xl"                   // Largura máxima do modal
className="max-h-[90vh] overflow-y-auto" // Scroll no modal
```

## 🚀 Próximas Melhorias

### 1. Templates Pré-Definidos

```typescript
const templates = {
  "PIX": { type: "PIX", transactionFee: 0.5 },
  "Boleto 7/21": { type: "BANK_SLIP", templates: [...] },
  "Cartão 12x": { type: "CREDIT_CARD", maxInstallments: 12 },
}
```

### 2. Duplicar Método

```typescript
const handleDuplicate = (method: PaymentMethod) => {
  handleOpenDialog({
    ...method,
    id: "", // Novo ID
    code: `${method.code}_COPY`,
    name: `${method.name} (Cópia)`
  })
}
```

### 3. Histórico de Alterações

- Registrar quem alterou e quando
- Log de mudanças de taxas
- Auditoria completa

### 4. Validação de Uso

- Mostrar quantas vendas usam o método
- Bloquear desativação se houver vendas pendentes
- Sugerir migração de método

### 5. Simulador de Parcelas

```typescript
const simulate = (totalValue: number, method: PaymentMethod) => {
  if (method.installmentTemplates.length > 0) {
    return method.installmentTemplates.map(t => ({
      number: t.installmentNumber,
      value: totalValue * (t.percentageOfTotal / 100),
      date: addDays(new Date(), t.daysToPayment)
    }))
  }
  // Parcelamento padrão
  const installmentValue = totalValue / method.maxInstallments
  const fee = installmentValue * (method.installmentFee / 100)
  return Array.from({ length: method.maxInstallments }, (_, i) => ({
    number: i + 1,
    value: installmentValue + fee,
    date: addDays(new Date(), 30 * (i + 1))
  }))
}
```

## 📚 Documentações Relacionadas

- `SISTEMA_VENDAS.md` - Módulo de vendas completo
- `API_SALES.md` - Documentação da API de vendas
- `CONFIGURACOES_SIMPLIFICADA.md` - Outras configurações

---

**Criado em**: 10/11/2025
**Última atualização**: 10/11/2025
**Versão**: 1.0.0
