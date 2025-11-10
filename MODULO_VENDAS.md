# Módulo de Vendas - ERP Multi

## 📋 Visão Geral

Módulo completo para gestão de vendas conectado à API REST do backend, incluindo gerenciamento de métodos de pagamento, criação de vendas, aprovação e controle de status.

**Versão:** 1.0.0  
**Status:** ✅ Implementado  
**Última Atualização:** Janeiro 2025

---

## 🎯 Funcionalidades Implementadas

### 1. Gestão de Métodos de Pagamento
- ✅ CRUD completo de métodos de pagamento// Filtros para listagem de vendas
export interface SaleFilters {
  status?: SaleStatus
  customerId?: string
  paymentMethodId?: string
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  search?: string
  page?: number
  limit?: number
}os suportados: Dinheiro, PIX, Débito, Crédito, Boleto, Transferência, Cheque, Outros
- ✅ Configuração de taxas (MDR, processamento, antecipação)
- ✅ Templates de parcelamento customizados
- ✅ Validação de percentagens (soma = 100%)
- ✅ Toggle de status (ativo/inativo) inline
- ✅ Análise de crédito configurável

### 2. Gestão de Vendas
- ✅ Listagem paginada com filtros
- ✅ 5 estados de venda: DRAFT, PENDING_APPROVAL, APPROVED, COMPLETED, CANCELED
- ✅ Busca por número, cliente ou produto
- ✅ Filtro por status
- ✅ **Filtros avançados:**
  - Data inicial e final (período)
  - Valor mínimo e máximo
  - Toggle para mostrar/ocultar
  - Botão "Limpar Filtros"
- ✅ **Aprovação de vendas com análise de crédito:**
  - Dialog modal com formulário completo
  - Radio buttons: Aprovar ou Reprovar crédito
  - Campo de observações obrigatório
  - Aprovação simples (sem análise) ou com análise
  - Reprovação automática cancela a venda
  - Validação de campos obrigatórios
- ✅ **Cancelamento de vendas:**
  - Dialog modal com motivo obrigatório
  - Validação de status (não cancela vendas concluídas)
  - Feedback via toast
- ✅ **Conclusão de vendas:**
  - Marca venda aprovada como concluída
  - Atualiza status automaticamente
- ✅ **Gerenciamento de itens (API):**
  - Adicionar item à venda (apenas DRAFT)
  - Atualizar item existente
  - Remover item da venda
  - Validação de estoque e duplicatas
- ✅ Ações contextuais por status:
  - **DRAFT**: Editar, Cancelar
  - **PENDING_APPROVAL**: Aprovar (com análise), Cancelar
  - **APPROVED**: Concluir, Cancelar
  - **COMPLETED**: Apenas visualizar
  - **CANCELED**: Apenas visualizar
- ✅ Cancelamento com motivo obrigatório
- ✅ Conclusão de vendas aprovadas
- ✅ Badges coloridos por status

---

## 📁 Estrutura de Arquivos

### API Clients
```
/lib/api/
├── sales.ts                    # Client da API de vendas (~450 linhas)
│   ├── Types: Sale, SaleItem, SaleStatus, CreateSaleDto, UpdateSaleDto, ApproveSaleDto, AddSaleItemDto
│   ├── Functions: getAll, getById, create, update, delete
│   ├── Actions: approve, cancel, complete
│   ├── Items: addItem, updateItem, removeItem
│   └── Helpers: saleStatusLabels, saleStatusColors
│
└── payment-methods.ts          # Client da API de métodos de pagamento (280 linhas)
    ├── Types: PaymentMethod, PaymentMethodType, InstallmentTemplate
    ├── Functions: getAll, getById, create, update, delete, toggleStatus
    └── Helpers: paymentMethodTypeLabels
```

### Páginas
```
/app/dashboard/vendas/
├── page.tsx                    # Listagem de vendas (~380 linhas)
│   ├── Tabela com vendas
│   ├── Filtros (status, busca)
│   ├── Paginação
│   ├── Ações (aprovar, cancelar, completar)
│   └── Dialog de cancelamento
│
└── configuracoes/
    └── page.tsx                # Configurações de métodos de pagamento (720 linhas)
        ├── Lista de métodos
        ├── Dialog de criar/editar
        ├── Seções: Info, Taxas, Parcelamento, Templates, Crédito
        └── Validação de templates
```

### Utilidades
```
/lib/
└── masks.ts                    # Funções de formatação
    ├── formatCurrency()        # R$ 0.000,00
    └── maskCurrency()          # Máscara para inputs
```

---

## 🔄 Fluxo de Status das Vendas

```
┌─────────────┐
│   DRAFT     │ (Orçamento)
│  Rascunho   │
└──────┬──────┘
       │ Enviar para aprovação
       ▼
┌─────────────────┐
│ PENDING_APPROVAL│
│ Aguard. Aprovação│
└────┬───────┬────┘
     │       │ Rejeitar
     │       ▼
     │  ┌──────────┐
     │  │ CANCELED │
     │  │Cancelado │
     │  └──────────┘
     │ Aprovar
     ▼
┌─────────────┐
│  APPROVED   │
│  Aprovado   │
└──────┬──────┘
       │ Marcar como concluída
       ▼
┌─────────────┐
│ COMPLETED   │
│ Concluído   │
└─────────────┘
```

**Regras:**
- Qualquer status antes de COMPLETED pode ser cancelado
- CANCELED e COMPLETED são estados finais
- Cancelamento requer motivo obrigatório

---

## 🎨 Interface - Listagem de Vendas

### Header
- **Título:** "Vendas"
- **Descrição:** "Gerencie todas as vendas da sua empresa"
- **Ações:**
  - `Configurações` - Navega para métodos de pagamento (/dashboard/vendas/configuracoes)
  - `Exportar` (desabilitado - aguarda implementação)
  - `Nova Venda` (desabilitado - aguarda formulário)

### Card de Busca
**Campos:**
- Input de busca (texto livre)
- Select de status (7 opções: Todos, DRAFT, PENDING_APPROVAL, etc.)
- Botão "Filtros Avançados" (toggle)
- Botão "Buscar"

**Filtros Avançados (expansível):**
- **Data Inicial:** Input tipo date
- **Data Final:** Input tipo date
- **Valor Mínimo:** Input tipo number (R$)
- **Valor Máximo:** Input tipo number (R$)
- **Botão "Limpar Filtros":** Remove todos os filtros aplicados

**Comportamento:**
- Busca ao pressionar Enter no input
- Filtro de status em tempo real
- Filtros avançados opcionais (collapsed por padrão)
- Reseta para página 1 ao buscar
- Limpar filtros restaura valores padrão

### Tabela de Vendas
**Colunas:**
1. **Número:** Identificador da venda (ex: VND-001)
2. **Cliente:** Nome do cliente (ou "—" se não informado)
3. **Itens:** Quantidade de produtos (ex: "3 itens")
4. **Total:** Valor formatado (R$ 0.000,00)
5. **Status:** Badge colorido
6. **Data:** Data da venda ou criação (dd/mm/aaaa)
7. **Ações:** Dropdown menu contextual

**Cores dos Badges:**
- `DRAFT`: Cinza (bg-gray-100 text-gray-800)
- `PENDING_APPROVAL`: Amarelo (bg-yellow-100 text-yellow-800)
- `APPROVED`: Azul (bg-blue-100 text-blue-800)
- `COMPLETED`: Verde (bg-green-100 text-green-800)
- `CANCELED`: Vermelho (bg-red-100 text-red-800)

### Ações Contextuais
**Menu Dropdown (3 pontos):**
```typescript
// Sempre disponível
- Ver detalhes (desabilitado - aguarda tela de detalhes)

// Se status === DRAFT
- Editar (desabilitado - aguarda formulário)
- Cancelar venda

// Se status === PENDING_APPROVAL
- Aprovar venda
- Cancelar venda

// Se status === APPROVED
- Marcar como concluída
- Cancelar venda
```

### Dialog de Cancelamento
**Campos:**
- **Título:** "Cancelar Venda"
- **Descrição:** Confirma número da venda
- **Campo:** Textarea para motivo (obrigatório)
- **Ações:**
  - `Voltar` (outline)
  - `Confirmar Cancelamento` (destructive)

**Validações:**
- Motivo não pode estar vazio
- Botão desabilitado durante carregamento
- Loader animado enquanto processa

### Paginação
**Localização:** Rodapé da tabela

**Elementos:**
- Texto: "Página X de Y"
- Botão "Anterior" (desabilitado na página 1)
- Botão "Próxima" (desabilitado na última página)

**Configuração:**
- 10 itens por página
- Navegação via state (React)

---

## 🔌 API Endpoints Consumidos

### Vendas

#### GET /sales
**Descrição:** Lista vendas com filtros e paginação

**Query Params:**
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 10, máx: 100)
- `status`: Filtro de status (opcional)
- `customerId`: Filtro por cliente (UUID, opcional)
- `paymentMethodId`: Filtro por método de pagamento (UUID, opcional)
- `startDate`: Data inicial (YYYY-MM-DD, opcional)
- `endDate`: Data final (YYYY-MM-DD, opcional)
- `minAmount`: Valor mínimo (number, opcional)
- `maxAmount`: Valor máximo (number, opcional)
- `search`: Busca textual (opcional)

**Exemplos de URLs:**
```
GET /sales
GET /sales?page=2&limit=20
GET /sales?status=APPROVED
GET /sales?startDate=2024-01-01&endDate=2024-12-31
GET /sales?minAmount=1000&maxAmount=5000
GET /sales?status=APPROVED&startDate=2024-11-01
GET /sales?customerId=uuid&status=COMPLETED
```

**Response:**
```typescript
{
  data: Sale[],
  total: number,
  page: number,
  limit: number,
  totalPages: number
}
```

#### POST /sales/:id/approve
**Descrição:** Aprova uma venda pendente

**Path Params:**
- `id`: ID da venda

**Response:**
```typescript
Sale // com status atualizado para APPROVED
```

#### POST /sales/:id/cancel
**Descrição:** Cancela uma venda

**Path Params:**
- `id`: ID da venda

**Body:**
```typescript
{
  reason: string // Motivo do cancelamento
}
```

**Response:**
```typescript
Sale // com status atualizado para CANCELED
```

#### POST /sales/:id/complete
**Descrição:** Marca venda como concluída

**Path Params:**
- `id`: ID da venda

**Response:**
```typescript
Sale // com status atualizado para COMPLETED
```

### Métodos de Pagamento

#### GET /payment-methods
**Descrição:** Lista todos os métodos de pagamento

**Response:**
```typescript
PaymentMethod[]
```

#### POST /payment-methods
**Descrição:** Cria novo método de pagamento

**Body:**
```typescript
{
  name: string,
  type: PaymentMethodType,
  active: boolean,
  maxInstallments?: number,
  mdrRate?: number,
  processingFee?: number,
  anticipationRate?: number,
  requiresCreditAnalysis?: boolean,
  templates?: InstallmentTemplate[]
}
```

#### PATCH /payment-methods/:id/toggle-active
**Descrição:** Ativa/desativa método de pagamento

**Path Params:**
- `id`: ID do método

**Response:**
```typescript
PaymentMethod // com active invertido
```

---

## 📊 Tipos TypeScript

### Sales API

```typescript
// Status da venda
export type SaleStatus = 
  | "DRAFT"           // Orçamento/Rascunho
  | "PENDING_APPROVAL" // Aguardando aprovação
  | "APPROVED"        // Aprovada
  | "COMPLETED"       // Concluída
  | "CANCELED"        // Cancelada

// Venda completa
export interface Sale {
  id: string
  companyId: string
  customerId: string
  paymentMethodId: string
  saleNumber: string
  status: SaleStatus
  subtotal: number
  discount: number
  shipping: number
  totalAmount: number
  installments: number
  notes?: string
  saleDate?: string
  deliveryDate?: string
  canceledAt?: string
  cancelReason?: string
  approvedAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
  
  // Relações
  customer?: {
    id: string
    name: string
    email: string
    document?: string
    cpfCnpj?: string
    phone?: string
  }
  paymentMethod?: {
    id: string
    name: string
    code: string
    type: string
    allowInstallments?: boolean
    maxInstallments?: number
  }
}
  items?: SaleItem[]
}

// Item da venda
export interface SaleItem {
  id: string
  saleId: string
  productId: string
  quantity: number
  unitPrice: number
  subtotal: number
  discount: number
  totalPrice: number
  createdAt: string
  updatedAt: string
  
  // Relação
  product?: {
    id: string
    name: string
    sku: string
    price?: number
    stockQuantity?: number
  }
}

// DTO para criar venda
export interface CreateSaleDto {
  customerId: string
  paymentMethodId: string
  items: {
    productId: string
    quantity: number
    unitPrice: number
    discount?: number
  }[]
  installments?: number
  discount?: number
  shipping?: number
  notes?: string
  saleDate?: string
  deliveryDate?: string
}

// Filtros de listagem
export interface SaleFilters {
  status?: SaleStatus
  customerId?: string
  startDate?: string
  endDate?: string
  search?: string
  page?: number
  limit?: number
}
```

### Payment Methods API

```typescript
// Tipos de método de pagamento
export type PaymentMethodType = 
  | "CASH"            // Dinheiro
  | "PIX"             // PIX
  | "DEBIT_CARD"      // Cartão de Débito
  | "CREDIT_CARD"     // Cartão de Crédito
  | "BANK_SLIP"       // Boleto
  | "BANK_TRANSFER"   // Transferência
  | "CHECK"           // Cheque
  | "OTHER"           // Outros

// Método de pagamento
export interface PaymentMethod {
  id: string
  companyId: string
  name: string
  type: PaymentMethodType
  active: boolean
  maxInstallments: number
  mdrRate?: number
  processingFee?: number
  anticipationRate?: number
  requiresCreditAnalysis: boolean
  createdAt: string
  updatedAt: string
  
  // Relação
  templates?: InstallmentTemplate[]
}

// Template de parcelamento
export interface InstallmentTemplate {
  id: string
  paymentMethodId: string
  installmentNumber: number
  percentage: number
  daysToPayment: number
  active: boolean
}
```

---

## 🛠️ Helpers e Utilidades

### Labels de Status (PT-BR)
```typescript
export const saleStatusLabels: Record<SaleStatus, string> = {
  DRAFT: "Orçamento",
  PENDING_APPROVAL: "Aguardando Aprovação",
  APPROVED: "Aprovado",
  COMPLETED: "Concluído",
  CANCELED: "Cancelado",
}
```

### Cores de Status (Tailwind)
```typescript
export const saleStatusColors: Record<SaleStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  PENDING_APPROVAL: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELED: "bg-red-100 text-red-800",
}
```

### Labels de Tipos de Pagamento
```typescript
export const paymentMethodTypeLabels: Record<PaymentMethodType, string> = {
  CASH: "Dinheiro",
  PIX: "PIX",
  DEBIT_CARD: "Cartão de Débito",
  CREDIT_CARD: "Cartão de Crédito",
  BANK_SLIP: "Boleto Bancário",
  BANK_TRANSFER: "Transferência Bancária",
  CHECK: "Cheque",
  OTHER: "Outros",
}
```

### Formatação de Moeda
```typescript
// Formata número para moeda brasileira
formatCurrency(1500) // "R$ 1.500,00"
formatCurrency("2350.50") // "R$ 2.350,50"

// Aplica máscara em input
maskCurrency("150000") // "R$ 1.500,00"
```

---

## 🎯 Estados de Loading

### Global
- **`loading`**: Carregamento inicial da listagem
- **`actionLoading`**: Ações (aprovar, cancelar, completar)

### Comportamentos
1. **Durante loading:**
   - Exibe spinner centralizado
   - Oculta tabela
   - Paginação desabilitada

2. **Durante actionLoading:**
   - Botões de ação desabilitados
   - Menu dropdown desabilitado
   - Loader animado em botões de confirmação

3. **Lista vazia:**
   - Mensagem: "Nenhuma venda encontrada."
   - Sugestão: "Tente ajustar os filtros ou crie uma nova venda."

---

## 🔐 Autenticação e Permissões

### Headers Automáticos
```typescript
// Todos os requests incluem automaticamente:
{
  "Authorization": `Bearer ${token}`,
  "x-company-id": selectedCompany.id
}
```

**Fonte:** `apiClient` do `/lib/api/client.ts`

### Seleção de Empresa
- Empresa atual obtida via `authApi.getSelectedCompany()`
- Se não houver empresa selecionada, redirect automático
- Validação em todas as chamadas de API

---

## 📱 Responsividade

### Layout da Página
- **Container:** `space-y-6` (24px entre seções)
- **Header:** Flex responsivo com wrap automático
- **Cards:** Full width em mobile, grid em desktop

### Tabela
- **Desktop:** Todas as colunas visíveis
- **Mobile:** Scroll horizontal automático
- **Ações:** Menu dropdown compacto (3 pontos)

### Dialog
- **Desktop:** Largura máxima 500px
- **Mobile:** Full screen com padding
- **Textarea:** 4 linhas visíveis

---

## 🚀 Próximos Passos (Pendentes)

### 1. Formulário de Criação de Vendas
**Prioridade:** Alta

**Funcionalidades:**
- [ ] Select de cliente (busca com API de clientes)
- [ ] Select de método de pagamento (lista carregada)
- [ ] Tabela de itens (adicionar produtos)
- [ ] Campos: desconto, frete, observações
- [ ] Cálculo automático: subtotal, total
- [ ] Validações: estoque, parcelas máximas
- [ ] Salvar como rascunho ou enviar para aprovação

**Arquivos:**
- `/app/dashboard/vendas/nova/page.tsx` (novo)
- Ou dialog modal na página principal

### 2. Tela de Detalhes
**Prioridade:** Alta

**Funcionalidades:**
- [ ] Cabeçalho: número, status, datas
- [ ] Dados do cliente e pagamento
- [ ] Lista de itens (read-only)
- [ ] Timeline de aprovações/cancelamentos
- [ ] Ações contextuais por status
- [ ] Botão de imprimir/exportar

**Arquivos:**
- `/app/dashboard/vendas/[id]/page.tsx` (novo)

### 3. Exportação de Relatórios
**Prioridade:** Média

**Funcionalidades:**
- [ ] Exportar lista filtrada para Excel
- [ ] Exportar detalhes de venda para PDF
- [ ] Relatório de vendas por período
- [ ] Relatório de vendas por cliente
- [ ] Relatório de comissões

**Arquivos:**
- `/lib/api/sales.ts` (adicionar função export)
- Usar biblioteca `xlsx` ou `jspdf`

### 4. APIs Complementares
**Prioridade:** Alta (para formulário de criação)

**Verificar se existem:**
- [ ] API de clientes (customers)
- [ ] API de produtos (products)
- [ ] API de estoque (stock)

**Se não existirem, criar clients:**
- `/lib/api/customers.ts` ✅ (já existe)
- `/lib/api/products.ts` (verificar)
- `/lib/api/stock.ts` (verificar)

### 5. Integrações Futuras
**Prioridade:** Baixa

**Ideias:**
- [ ] Envio de orçamento por email/WhatsApp
- [ ] Assinatura digital de contratos
- [ ] Integração com gateways de pagamento
- [ ] Emissão de NF-e automática
- [ ] Comissões de vendedores

---

## 🐛 Troubleshooting

### Erro: "Property 'getSales' does not exist"
**Causa:** Nome da função no salesApi estava incorreto

**Solução:** Usar `salesApi.getAll()` (exportado no objeto API)

### Erro: "Property 'pagination' does not exist"
**Causa:** Estrutura da resposta estava plana

**Solução:** Acessar `response.totalPages` diretamente (não `response.pagination.totalPages`)

### Erro: "formatCurrency is not a function"
**Causa:** Função não existia em `/lib/masks.ts`

**Solução:** Adicionada função `formatCurrency()` e `maskCurrency()`

### Lista sempre vazia
**Verificar:**
1. Empresa está selecionada? (`authApi.getSelectedCompany()`)
2. Header `x-company-id` está sendo enviado?
3. Backend tem vendas cadastradas para essa empresa?
4. Token de autenticação é válido?

### Ações não funcionam
**Verificar:**
1. Status da venda permite a ação?
2. `actionLoading` está travando botões?
3. Toast de erro está aparecendo?
4. Verificar console do navegador

---

## 📚 Referências

### Documentações Relacionadas
- `API_COMPANIES_ADMIN.md` - Gestão de empresas
- `AUTENTICACAO.md` - Sistema de autenticação
- `SISTEMA_PERMISSOES_INTEGRACOES.md` - Controle de acesso

### Componentes UI Utilizados
- `Card`, `CardHeader`, `CardTitle`, `CardContent` - Containers
- `Button` - Ações
- `Input` - Campo de busca
- `Select` - Filtro de status
- `Table` - Listagem de vendas
- `Badge` - Status coloridos
- `DropdownMenu` - Menu de ações
- `Dialog` - Modal de cancelamento
- `Textarea` - Motivo de cancelamento
- `Label` - Labels de formulário

### Ícones Lucide
- `Search` - Busca
- `Plus` - Nova venda
- `Download` - Exportar
- `MoreVertical` - Menu (3 pontos)
- `Eye` - Ver detalhes
- `Edit` - Editar
- `CheckCircle2` - Aprovar/Completar
- `XCircle` - Cancelar
- `Loader2` - Loading

---

## ✅ Checklist de Implementação

### API Clients
- [x] `/lib/api/sales.ts` criado
- [x] Tipos TypeScript completos
- [x] Funções CRUD (getAll, getById, create, update, delete)
- [x] Funções de ações (approve, cancel, complete)
- [x] Helpers (labels, colors)
- [x] Tratamento de erros
- [x] Headers automáticos (auth, company)

- [x] `/lib/api/payment-methods.ts` criado
- [x] Tipos TypeScript completos
- [x] Funções CRUD completas
- [x] Toggle de status
- [x] Helpers de labels

### Utilidades
- [x] `formatCurrency()` adicionado a `/lib/masks.ts`
- [x] `maskCurrency()` adicionado a `/lib/masks.ts`

### Interface de Vendas
- [x] `/app/dashboard/vendas/page.tsx` atualizado
- [x] Conversão para "use client"
- [x] Estados (loading, actionLoading, sales, filters)
- [x] Carregamento inicial com useEffect
- [x] Busca com filtros
- [x] Paginação funcional
- [x] Tabela com todas as colunas
- [x] Badges de status coloridos
- [x] Menu de ações contextual
- [x] Dialog de cancelamento
- [x] Toast de feedback
- [x] Validações de formulário

### Interface de Métodos de Pagamento
- [x] `/app/dashboard/vendas/configuracoes/page.tsx` criado
- [x] Lista de métodos
- [x] Dialog de criar/editar
- [x] Formulário completo (8 seções)
- [x] Validação de templates
- [x] Toggle inline de status
- [x] CRUD completo

### Testes
- [x] Compilação sem erros
- [ ] Teste manual de listagem (aguarda backend)
- [ ] Teste manual de aprovação (aguarda backend)
- [ ] Teste manual de cancelamento (aguarda backend)
- [ ] Teste manual de conclusão (aguarda backend)
- [ ] Teste de paginação (aguarda backend)
- [ ] Teste de filtros (aguarda backend)
- [ ] Teste de busca (aguarda backend)

### Documentação
- [x] `MODULO_VENDAS.md` criado
- [x] Tipos TypeScript documentados
- [x] Endpoints documentados
- [x] Fluxo de status documentado
- [x] Troubleshooting documentado
- [x] Próximos passos listados

---

## 📝 Notas de Desenvolvimento

### Performance
- Paginação implementada (10 itens/página)
- Carregamento lazy de relações (customer, paymentMethod, items)
- Debounce na busca recomendado (implementar)

### Segurança
- Validação de empresa no backend (x-company-id)
- Motivo obrigatório para cancelamento
- Ações sensíveis requerem confirmação

### UX
- Loading states claros
- Feedback via toast
- Estados vazios tratados
- Ações desabilitadas durante loading
- Cores semânticas (verde = sucesso, vermelho = erro, etc.)

---

**Desenvolvedor:** GitHub Copilot  
**Data:** Janeiro 2025  
**Versão do Documento:** 1.0.0
