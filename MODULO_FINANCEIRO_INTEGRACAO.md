# 📊 Módulo Financeiro - Integração com API

## 🎯 Resumo das Implementações

Este documento descreve todas as atualizações realizadas no módulo financeiro do ERP, incluindo integração com a API backend.

---

## 📁 Estrutura de Arquivos Criados/Atualizados

### 1. API Client (`lib/api/financial.ts`)

#### ✅ Contas Bancárias

**Tipos TypeScript:**
- `AccountType`: 'CORRENTE' | 'POUPANCA' | 'SALARIO'
- `BankAccount`: Interface completa da conta bancária
- `CreateBankAccountDto`: DTO para criação
- `UpdateBankAccountDto`: DTO para atualização
- `BankAccountBalance`: Interface para consulta de saldo

**Funções da API:**
```typescript
bankAccountsApi.getAll(companyId: string)
bankAccountsApi.create(dados: CreateBankAccountDto)
bankAccountsApi.getById(id: string, companyId: string)
bankAccountsApi.getBalance(id: string, companyId: string)
bankAccountsApi.update(id: string, companyId: string, dados: UpdateBankAccountDto)
bankAccountsApi.delete(id: string, companyId: string)
```

#### ✅ Categorias Financeiras

**Tipos TypeScript:**
- `CategoryType`: 'RECEITA' | 'DESPESA'
- `FinancialCategory`: Interface completa da categoria
- `CreateFinancialCategoryDto`: DTO para criação
- `UpdateFinancialCategoryDto`: DTO para atualização

**Funções da API:**
```typescript
financialCategoriesApi.getAll(companyId: string, type?: CategoryType)
financialCategoriesApi.create(dados: CreateFinancialCategoryDto)
financialCategoriesApi.getById(id: string, companyId: string)
financialCategoriesApi.update(id: string, companyId: string, dados: UpdateFinancialCategoryDto)
financialCategoriesApi.delete(id: string, companyId: string)
```

#### ✅ Lançamentos Financeiros

**Tipos TypeScript:**
- `TransactionType`: 'DINHEIRO' | 'TRANSFERENCIA' | 'BOLETO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX' | 'CHEQUE' | 'OUTROS'
- `FinancialTransaction`: Interface completa do lançamento
- `CreateFinancialTransactionDto`: DTO para criação
- `UpdateFinancialTransactionDto`: DTO para atualização
- `TransactionFilters`: Interface para filtros de busca

**Funções da API:**
```typescript
financialTransactionsApi.getAll(filters: TransactionFilters)
financialTransactionsApi.create(dados: CreateFinancialTransactionDto)
financialTransactionsApi.getById(id: string, companyId: string)
financialTransactionsApi.update(id: string, companyId: string, dados: UpdateFinancialTransactionDto)
financialTransactionsApi.reconcile(id: string, companyId: string)
financialTransactionsApi.delete(id: string, companyId: string)
```

**⚠️ Notas Importantes:**
- O saldo da conta bancária é atualizado automaticamente ao criar um lançamento
- O saldo é recalculado automaticamente ao atualizar um lançamento
- O saldo é revertido automaticamente ao deletar um lançamento

---

### 2. Páginas de Contas Bancárias

#### ✅ `/app/dashboard/financeiro/contas/page.tsx`
**Funcionalidades:**
- ✅ Lista todas as contas bancárias da empresa
- ✅ Exibe saldo total consolidado
- ✅ Mostra número de contas ativas
- ✅ Exibe quantidade de bancos diferentes
- ✅ Toggle para mostrar/ocultar saldos
- ✅ Badges para status (Ativa/Inativa, Principal)
- ✅ Botões para editar e excluir
- ✅ Loading state durante carregamento
- ✅ Tratamento de erros com toasts
- ✅ Confirmação antes de excluir

**Integração com API:**
- `bankAccountsApi.getAll()` - Carrega lista de contas
- `bankAccountsApi.delete()` - Exclui conta

#### ✅ `/app/dashboard/financeiro/contas/nova/page.tsx`
**Funcionalidades:**
- ✅ Formulário completo de cadastro
- ✅ Seleção de banco com código
- ✅ Campos de agência, conta e dígitos
- ✅ Tipos de conta (Corrente, Poupança, Salário)
- ✅ Campo de nome da conta
- ✅ Campo de chave PIX
- ✅ Saldo inicial
- ✅ Observações (textarea)
- ✅ Switch para conta principal
- ✅ Switch para conta ativa
- ✅ Loading state durante salvamento
- ✅ Validações de campos obrigatórios
- ✅ Tratamento de erros

**Integração com API:**
- `bankAccountsApi.create()` - Cria nova conta

#### ✅ `/app/dashboard/financeiro/contas/[id]/page.tsx`
**Funcionalidades:**
- ✅ Carrega dados da conta existente
- ✅ Exibe informações fixas (não editáveis) em destaque
- ✅ Campos editáveis: nome, PIX, observações, status
- ✅ Mostra saldo inicial e atual
- ✅ Loading state durante carregamento e salvamento
- ✅ Tratamento de erros
- ✅ Redirecionamento após salvar

**Integração com API:**
- `bankAccountsApi.getById()` - Carrega dados da conta
- `bankAccountsApi.update()` - Atualiza conta

---

### 3. Páginas de Categorias Financeiras

#### 📋 `/app/dashboard/financeiro/categorias/page.tsx`
**Status:** ⚠️ Arquivo já existe (precisa verificar se está integrado)

**Funcionalidades esperadas:**
- Lista todas as categorias (receitas e despesas)
- Tabs para filtrar por tipo
- Cards de resumo (total, receitas, despesas)
- Badges de status e tipo
- Indicador visual com cores e ícones
- Botões para editar e excluir
- Suporte para subcategorias

#### 📋 `/app/dashboard/financeiro/categorias/nova/page.tsx`
**Status:** ⚠️ Arquivo já existe (precisa verificar se está integrado)

**Funcionalidades esperadas:**
- Formulário de cadastro de categoria
- Seleção de tipo (Receita/Despesa)
- Campo de nome e descrição
- Seletor de cor
- Seletor de ícone
- Categoria pai (para subcategorias)
- Switch para ativa/inativa

#### 📋 `/app/dashboard/financeiro/categorias/[id]/page.tsx`
**Status:** ⚠️ Arquivo já existe (precisa verificar se está integrado)

**Funcionalidades esperadas:**
- Edição de categoria existente
- Mesmos campos do formulário de criação
- Validações

---

## 🔄 Próximos Passos

### 1. Verificar Páginas de Categorias
- [ ] Verificar se `/dashboard/financeiro/categorias/page.tsx` está integrado com a API
- [ ] Verificar se `/dashboard/financeiro/categorias/nova/page.tsx` está integrado com a API
- [ ] Verificar se `/dashboard/financeiro/categorias/[id]/page.tsx` está integrado com a API

### 2. Atualizar Dashboard Principal
- [ ] Integrar `/dashboard/financeiro/page.tsx` com API de contas bancárias
- [ ] Buscar saldo em tempo real das contas
- [ ] Listar contas a pagar/receber da semana via API

### 3. Criar Páginas de Lançamentos
- [ ] Criar `/dashboard/financeiro/lancamentos/page.tsx` (listagem)
- [ ] Criar `/dashboard/financeiro/lancamentos/novo/page.tsx` (criação)
- [ ] Criar `/dashboard/financeiro/lancamentos/[id]/page.tsx` (edição)

### 4. Melhorias e Otimizações
- [ ] Adicionar paginação nas listagens
- [ ] Implementar busca/filtros avançados
- [ ] Adicionar gráficos e relatórios
- [ ] Implementar exportação de dados (CSV/PDF)
- [ ] Adicionar validações de permissões

---

## 📝 Observações Técnicas

### Autenticação e Empresa Selecionada
Todas as chamadas de API utilizam:
```typescript
const selectedCompany = authApi.getSelectedCompany()
```

E enviam o header:
```typescript
headers: {
  'x-company-id': selectedCompany.id,
}
```

### Tratamento de Erros
Padrão de tratamento de erros:
```typescript
try {
  // chamada API
} catch (error: any) {
  console.error("Erro:", error)
  toast({
    title: "Erro",
    description: error.response?.data?.message || error.message,
    variant: "destructive",
  })
}
```

### Loading States
Todas as páginas implementam:
- Loading inicial ao carregar dados
- Loading durante salvamento/exclusão
- Desabilitação de botões durante operações

### Validações
- Campos obrigatórios marcados com `*`
- Validação no submit do formulário
- Mensagens de erro descritivas
- Confirmação antes de excluir

---

## 🎨 Componentes UI Utilizados

- `DashboardLayout` - Layout padrão
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
- `Button` - Com variantes e estados de loading
- `Input`, `Textarea`, `Label`
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`
- `Switch` - Para toggles
- `Badge` - Para status e tipos
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- `useToast` - Para notificações

---

## 📚 Documentação da API Backend

### Base URL
```
http://localhost:4000
```

### Headers Necessários
```
Authorization: Bearer {token}
x-company-id: {companyId}
```

### Endpoints Implementados

#### Contas Bancárias
- `GET /financial/bank-accounts?companyId={id}`
- `POST /financial/bank-accounts`
- `GET /financial/bank-accounts/:id?companyId={id}`
- `GET /financial/bank-accounts/:id/balance?companyId={id}`
- `PATCH /financial/bank-accounts/:id?companyId={id}`
- `DELETE /financial/bank-accounts/:id?companyId={id}`

#### Categorias Financeiras
- `GET /financial/categories?companyId={id}&type={type}`
- `POST /financial/categories`
- `GET /financial/categories/:id?companyId={id}`
- `PATCH /financial/categories/:id?companyId={id}`
- `DELETE /financial/categories/:id?companyId={id}`

#### Lançamentos Financeiros
- `GET /financial/transactions?companyId={id}&type={type}&...`
- `POST /financial/transactions`
- `GET /financial/transactions/:id?companyId={id}`
- `PATCH /financial/transactions/:id?companyId={id}`
- `PATCH /financial/transactions/:id/reconcile?companyId={id}`
- `DELETE /financial/transactions/:id?companyId={id}`

---

## ✅ Checklist de Implementação

### Contas Bancárias
- [x] Tipos TypeScript
- [x] Funções de API
- [x] Página de listagem
- [x] Página de criação
- [x] Página de edição
- [x] Tratamento de erros
- [x] Loading states
- [x] Validações

### Categorias Financeiras
- [x] Tipos TypeScript
- [x] Funções de API
- [ ] Verificar página de listagem
- [ ] Verificar página de criação
- [ ] Verificar página de edição

### Lançamentos Financeiros
- [x] Tipos TypeScript
- [x] Funções de API
- [ ] Página de listagem
- [ ] Página de criação
- [ ] Página de edição

### Dashboard
- [ ] Integração com API
- [ ] Saldos em tempo real
- [ ] Contas a pagar/receber

---

**Data da última atualização:** 10 de novembro de 2025
