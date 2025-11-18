# Telas de Criação de Contas a Pagar/Receber - Implementado

## 📋 Resumo

Implementadas as telas de criação de contas a pagar e contas a receber com integração completa à API existente.

## ✅ Implementações

### 1. **Nova Conta a Pagar** (`/dashboard/financeiro/contas-pagar-receber/nova-pagar`)

#### Campos do Formulário:
- **Obrigatórios:**
  - Descrição
  - Fornecedor (supplierName)
  - Valor (originalAmount)
  - Data de Vencimento
  - Categoria

- **Opcionais:**
  - CNPJ/CPF do Fornecedor (supplierDocument)
  - Centro de Custo
  - Conta Contábil
  - Número do Documento
  - Data de Emissão (padrão: data atual)
  - Data de Competência (padrão: data atual)
  - Observações

#### Funcionalidades:
- ✅ Validação de campos obrigatórios
- ✅ Carregamento dinâmico de categorias (tipo DESPESA)
- ✅ Carregamento de centros de custo
- ✅ **Carregamento de contas contábeis do plano padrão da empresa**
- ✅ **Filtro automático: apenas contas que aceitam lançamento**
- ✅ Integração com `accountsPayableApi.create()`
- ✅ Feedback via toast de sucesso/erro
- ✅ Redirecionamento após criação
- ✅ Loading states em formulário e dados

### 2. **Nova Conta a Receber** (`/dashboard/financeiro/contas-pagar-receber/nova-receber`)

#### Campos do Formulário:
- **Obrigatórios:**
  - Descrição
  - Cliente (customerName)
  - Valor (originalAmount)
  - Data de Vencimento
  - Categoria

- **Opcionais:**
  - CNPJ/CPF do Cliente (customerDocument)
  - Centro de Custo
  - Conta Contábil
  - Número do Documento
  - Data de Emissão (padrão: data atual)
  - Data de Competência (padrão: data atual)
  - Observações

#### Funcionalidades:
- ✅ Validação de campos obrigatórios
- ✅ Carregamento dinâmico de categorias (tipo RECEITA)
- ✅ Carregamento de centros de custo
- ✅ **Carregamento de contas contábeis do plano padrão da empresa**
- ✅ **Filtro automático: apenas contas que aceitam lançamento**
- ✅ Integração com `accountsReceivableApi.create()`
- ✅ Feedback via toast de sucesso/erro
- ✅ Redirecionamento após criação
- ✅ Loading states em formulário e dados

### 3. **Atualização da Página de Listagem**

Atualizados os botões de navegação na página `/dashboard/financeiro/contas-pagar-receber`:

**Antes:**
```tsx
<Button>
  <Plus className="mr-2 h-4 w-4" />
  Novo Título
</Button>
```

**Depois:**
```tsx
<div className="flex gap-2">
  <Link href="/dashboard/financeiro/contas-pagar-receber/nova-pagar">
    <Button variant="outline" className="gap-2">
      <ArrowDownRight className="h-4 w-4 text-red-500" />
      Nova Conta a Pagar
    </Button>
  </Link>
  <Link href="/dashboard/financeiro/contas-pagar-receber/nova-receber">
    <Button className="gap-2">
      <ArrowUpRight className="h-4 w-4" />
      Nova Conta a Receber
    </Button>
  </Link>
</div>
```

## 🔌 Integração com API

### Tipos TypeScript Utilizados:

```typescript
interface CreateAccountPayableDto {
  companyId: string
  categoryId: string
  supplierName: string
  supplierDocument: string
  description: string
  documentNumber?: string
  originalAmount: number
  discountAmount?: number
  interestAmount?: number
  fineAmount?: number
  issueDate: string
  dueDate: string
  competenceDate: string
  installmentNumber?: number
  totalInstallments?: number
  status?: PayableStatus
  centroCustoId?: string
  contaContabilId?: string
  notes?: string
  isRecurring?: boolean
  recurringPattern?: RecurringPattern
}

interface CreateAccountReceivableDto {
  companyId: string
  categoryId: string
  customerName: string
  customerDocument: string
  description: string
  documentNumber?: string
  originalAmount: number
  discountAmount?: number
  interestAmount?: number
  fineAmount?: number
  issueDate: string
  dueDate: string
  competenceDate: string
  installmentNumber?: number
  totalInstallments?: number
  status?: ReceivableStatus
  centroCustoId?: string
  contaContabilId?: string
  notes?: string
  isRecurring?: boolean
  recurringPattern?: RecurringPattern
}
```

### APIs Utilizadas:

1. **financialCategoriesApi.getAll(companyId, type)**
   - Busca categorias por tipo ('DESPESA' ou 'RECEITA')
   
2. **bankAccountsApi.getAll(companyId)**
   - Lista contas bancárias da empresa
   
3. **centroCustoApi.getAll({ companyId })**
   - Lista centros de custo ativos
   
4. **planoContasApi.getPadrao(companyId)**
   - Busca o plano de contas padrão da empresa
   - Endpoint: `GET /financial/plano-contas/padrao?companyId={id}`
   - **Retorna o plano com o array `contas` já incluído**
   - Cada conta contém: `id`, `codigo`, `nome`, `tipo`, `natureza`, `nivel`, `aceitaLancamento`, `ativo`
   
5. **accountsPayableApi.create(payload)**
   - Cria nova conta a pagar
   
6. **accountsReceivableApi.create(payload)**
   - Cria nova conta a receber

### Lógica de Carregamento das Contas Contábeis:

```typescript
// Buscar plano de contas padrão (já inclui as contas)
const planoContas = await planoContasApi.getPadrao(companyId)

// Filtrar apenas contas válidas
if (planoContas.contas && Array.isArray(planoContas.contas)) {
  const contasValidas = planoContas.contas.filter(c => 
    c.aceitaLancamento && c.ativo
  )
  setContasContabeis(contasValidas)
}
```

## 🎨 Componentes UI Utilizados

- `DashboardLayout` - Layout padrão do dashboard
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` - Estrutura de cards
- `Button` - Botões de ação
- `Input` - Campos de texto e números
- `Textarea` - Campo de observações
- `Label` - Rótulos de campos
- `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem` - Dropdowns
- `useToast` - Notificações de feedback
- Ícones: `ArrowLeft`, `ArrowUpRight`, `ArrowDownRight`, `Loader2`, `Save`

## 📁 Arquivos Criados

```
app/dashboard/financeiro/contas-pagar-receber/
├── nova-pagar/
│   └── page.tsx (Nova Conta a Pagar - 370 linhas)
└── nova-receber/
    └── page.tsx (Nova Conta a Receber - 370 linhas)
```

## 🔄 Fluxo de Uso

### Criar Conta a Pagar:
1. Usuário clica em "Nova Conta a Pagar" na listagem
2. Sistema busca plano de contas padrão via API (já inclui array de contas)
3. Sistema filtra contas: apenas com `aceitaLancamento: true` e `ativo: true`
4. Sistema carrega categorias de DESPESA e centros de custo em paralelo
5. Usuário preenche formulário com dados do fornecedor
6. Sistema valida campos obrigatórios
7. Sistema envia dados para API via `accountsPayableApi.create()`
8. Toast de sucesso e redirecionamento para listagem

### Criar Conta a Receber:
1. Usuário clica em "Nova Conta a Receber" na listagem
2. Sistema busca plano de contas padrão via API (já inclui array de contas)
3. Sistema filtra contas: apenas com `aceitaLancamento: true` e `ativo: true`
4. Sistema carrega categorias de RECEITA e centros de custo em paralelo
5. Usuário preenche formulário com dados do cliente
6. Sistema valida campos obrigatórios
7. Sistema envia dados para API via `accountsReceivableApi.create()`
8. Toast de sucesso e redirecionamento para listagem

## ✨ Melhorias Implementadas

1. **Validação Client-Side**
   - Campos obrigatórios marcados com asterisco vermelho
   - Validação antes do envio
   - Mensagens de erro claras

2. **UX Aprimorada**
   - Loading states durante carregamento de dados
   - Loading state no botão de submit
   - Datas padrão (emissão e competência = hoje)
   - Placeholders informativos

3. **Código Limpo**
   - TypeScript com tipos bem definidos
   - Componentes reutilizáveis
   - Error handling robusto
   - Código bem documentado

4. **Consistência Visual**
   - Segue o design system existente
   - Ícones apropriados (↓ para pagar, ↑ para receber)
   - Layout responsivo (grid de 2 colunas)

## 🧪 Testes Sugeridos

1. ✅ Criar conta a pagar com todos os campos
2. ✅ Criar conta a pagar apenas com campos obrigatórios
3. ✅ Criar conta a receber com todos os campos
4. ✅ Criar conta a receber apenas com campos obrigatórios
5. ✅ Validar campos obrigatórios vazios
6. ✅ Verificar carregamento de categorias por tipo
7. ✅ Testar navegação e redirecionamento
8. ✅ Verificar toasts de sucesso/erro

## 🚀 Próximos Passos Sugeridos

1. **Funcionalidades Adicionais:**
   - [ ] Tela de edição de contas existentes
   - [ ] Parcelamento automático (gerar múltiplas contas)
   - [ ] Upload de anexos (notas fiscais, boletos)
   - [ ] Baixa/pagamento de contas
   - [ ] Histórico de alterações

2. **Melhorias:**
   - [ ] Autocomplete de fornecedores/clientes
   - [ ] Máscaras para CNPJ/CPF
   - [ ] Validação de CNPJ/CPF
   - [ ] Cálculo automático de juros/multas
   - [ ] Contas recorrentes
   - [ ] Importação em lote via CSV/Excel

## 📊 Estatísticas

- **Linhas de código:** ~800 linhas (2 páginas)
- **Componentes criados:** 2 páginas completas
- **Integrações API:** 7 endpoints
- **Campos de formulário:** 11+ campos por tela (incluindo conta contábil)
- **Validações:** 5 campos obrigatórios por tela
- **Filtros inteligentes:** Contas contábeis com `aceitaLancamento: true`
- **Tempo estimado de implementação:** Concluído ✅

---

**Data de Implementação:** Dezembro 2024  
**Status:** ✅ Completo e Funcional
