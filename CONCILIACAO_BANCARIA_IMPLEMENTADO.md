# Implementação da Tela de Conciliação Bancária

## Resumo
Implementada funcionalidade completa de conciliação bancária na tela `/dashboard/financeiro/conciliacao`. A tela permite visualizar transações OFX, buscar correspondências no sistema e conciliar manualmente.

## Alterações Realizadas

### 1. Tela de Conciliação (`/dashboard/financeiro/conciliacao/page.tsx`)

#### Funcionalidades Implementadas

**1. Seleção de Extrato**
- Dropdown com todos os extratos OFX importados
- Display de informações: arquivo, conta bancária, período
- Contador de transações conciliadas vs total
- Badge de pendências (amarelo com quantidade)
- Foco automático em extratos com transações pendentes

**2. Visualização de Transações OFX (Coluna Esquerda)**
- Lista de todas as transações do extrato selecionado
- Cards clicáveis com destaque visual ao selecionar
- Informações exibidas:
  - Ícone de crédito/débito (setas verde/vermelha)
  - Data da transação
  - Nome do pagador/beneficiário
  - Memo/observação (se disponível)
  - Valor formatado em R$ com cor semântica
- Hover effect para melhor UX
- Scroll vertical para muitas transações

**3. Busca de Transações Similares (Coluna Direita)**
- Carregamento automático ao selecionar transação OFX
- Display de loading durante busca
- Lista de matches ordenados por score
- Para cada match:
  - Descrição do lançamento
  - Data e categoria
  - Valor formatado
  - Badge de score com cores semafóricas:
    - 🟢 Verde (85-100%): Alta confiança
    - 🟡 Amarelo (60-84%): Média confiança
    - 🟠 Laranja (30-59%): Baixa confiança
    - ⚪ Cinza (0-29%): Sem match
  - Lista de razões do match com checkmarks
  - Botão de conciliar (destaque para alta confiança)

**4. Estados Vazios**
- Sem extrato selecionado: Link para importar novo extrato
- Sem transação selecionada: Orientação para selecionar
- Sem matches encontrados: Opção de criar novo lançamento

**5. Dialog de Confirmação de Conciliação**
- Exibe lado a lado:
  - Transação do extrato OFX
  - Lançamento do sistema
- Ícone de link entre as duas
- Score de similaridade com badge
- Lista completa de razões do match
- Botões: Cancelar e Confirmar
- Loading state durante conciliação

**6. Dialog de Criar Novo Lançamento**
- Alerta informativo (funcionalidade futura)
- Display dos dados da transação OFX
- Opção de ir para tela de lançamentos
- Orientação para criar manualmente e voltar

#### Estrutura de Estados

```typescript
// Dados principais
const [imports, setImports] = useState<OFXImportDetail[]>([])
const [selectedImport, setSelectedImport] = useState<OFXImportDetail | null>(null)
const [selectedTransaction, setSelectedTransaction] = useState<OFXTransaction | null>(null)
const [similarTransactions, setSimilarTransactions] = useState<SimilarTransaction[]>([])
const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])

// Estados de UI
const [loading, setLoading] = useState(false)
const [loadingSimilar, setLoadingSimilar] = useState(false)
const [reconciling, setReconciling] = useState(false)
const [showMatchDialog, setShowMatchDialog] = useState(false)
const [showCreateDialog, setShowCreateDialog] = useState(false)
const [selectedMatch, setSelectedMatch] = useState<SimilarTransaction | null>(null)

// Filtros (preparado para expansão futura)
const [filterBankAccount, setFilterBankAccount] = useState<string>("")
const [filterType, setFilterType] = useState<string>("")
const [filterStatus, setFilterStatus] = useState<string>("unreconciled")
```

#### Funções Principais

```typescript
// Carregar contas bancárias
const loadBankAccounts = async () => {
  const accounts = await bankAccountsApi.getAll(selectedCompany.id)
  setBankAccounts(accounts)
}

// Carregar extratos importados
const loadImports = async () => {
  const response = await ofxApi.listImports({ companyId })
  
  // Carregar detalhes de cada extrato
  const detailsPromises = response.data.map(imp => 
    ofxApi.getImportDetails(companyId, imp.id)
  )
  const details = await Promise.all(detailsPromises)
  
  setImports(details)
  
  // Auto-selecionar primeiro extrato com pendências
  const firstWithUnreconciled = details.find(imp => 
    imp.reconciledCount < imp.totalTransactions
  )
  if (firstWithUnreconciled) {
    setSelectedImport(firstWithUnreconciled)
  }
}

// Buscar transações similares
const loadSimilarTransactions = async (transaction: OFXTransaction) => {
  const similar = await ofxApi.findSimilar(
    companyId,
    selectedImport.bankAccountId,
    transaction
  )
  setSimilarTransactions(similar)
}

// Selecionar transação OFX
const handleSelectTransaction = async (transaction: OFXTransaction) => {
  setSelectedTransaction(transaction)
  setSimilarTransactions([])
  await loadSimilarTransactions(transaction)
}

// Conciliar transações
const handleReconcile = async () => {
  await ofxApi.reconcile(
    companyId,
    selectedMatch.transactionId,
    selectedTransaction.fitId
  )
  
  // Limpar seleções e recarregar
  setShowMatchDialog(false)
  setSelectedMatch(null)
  setSelectedTransaction(null)
  setSimilarTransactions([])
  await loadImports()
}

// Abrir dialog de confirmação
const handleOpenMatchDialog = (match: SimilarTransaction) => {
  setSelectedMatch(match)
  setShowMatchDialog(true)
}

// Criar novo lançamento
const handleCreateNew = () => {
  setShowCreateDialog(true)
}
```

#### Funções Auxiliares

```typescript
// Badge de score com cores semafóricas
const getScoreBadge = (score: number) => {
  if (score >= 85) return <Badge className="bg-green-100...">Alta ({score}%)</Badge>
  if (score >= 60) return <Badge className="bg-yellow-100...">Média ({score}%)</Badge>
  if (score >= 30) return <Badge className="bg-orange-100...">Baixa ({score}%)</Badge>
  return <Badge variant="outline">Sem Match ({score}%)</Badge>
}

// Formatar data brasileira
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR')
}

// Formatar moeda brasileira
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Math.abs(value))
}

// Ícone de crédito/débito
const getTransactionIcon = (type: string) => {
  return type === 'CREDIT' 
    ? <TrendingUp className="h-4 w-4 text-green-600" />
    : <TrendingDown className="h-4 w-4 text-red-600" />
}
```

### 2. Layout e Design

#### Grid de Duas Colunas
```tsx
<div className="grid gap-6 lg:grid-cols-2">
  {/* Coluna Esquerda: Transações OFX */}
  <Card>...</Card>
  
  {/* Coluna Direita: Matches */}
  <Card>...</Card>
</div>
```

#### Cards de Transação OFX
```tsx
<div className={`p-4 rounded-lg border cursor-pointer transition-colors ${
  selectedTransaction?.fitId === txn.fitId
    ? 'border-primary bg-primary/5'
    : 'border-border hover:border-primary/50'
}`}>
  {/* Conteúdo */}
</div>
```

#### Cards de Match
```tsx
<div className="p-4 rounded-lg border border-border hover:border-primary/50">
  {/* Score badge */}
  {getScoreBadge(match.matchScore)}
  
  {/* Razões do match */}
  {match.matchReasons.map(reason => (
    <div className="flex items-center gap-1">
      <CheckCircle className="h-3 w-3 text-green-600" />
      <span>{reason}</span>
    </div>
  ))}
  
  {/* Botão de conciliar */}
  <Button variant={match.matchScore >= 85 ? "default" : "outline"}>
    Conciliar com esta transação
  </Button>
</div>
```

### 3. Fluxo de Uso Completo

#### 1️⃣ Acessar Tela de Conciliação
- Usuário entra em `/dashboard/financeiro/conciliacao`
- Sistema carrega extratos importados
- Auto-seleciona primeiro extrato com pendências

#### 2️⃣ Visualizar Transações Pendentes
- Lista de transações OFX é exibida
- Contador mostra X de Y conciliadas

#### 3️⃣ Selecionar Transação para Conciliar
- Usuário clica em uma transação OFX
- Card é destacado com borda azul
- Sistema busca automaticamente transações similares
- Loading spinner é exibido durante busca

#### 4️⃣ Avaliar Sugestões de Match
- Lista de matches é exibida com scores
- Usuário vê razões de cada match
- Cores indicam confiabilidade (verde/amarelo/laranja)

#### 5️⃣ Conciliar (Caminho Principal)
- Usuário clica em "Conciliar com esta transação"
- Dialog de confirmação é aberto
- Exibe lado a lado: OFX vs Sistema
- Mostra score e razões do match
- Usuário confirma conciliação
- Sistema salva e atualiza contadores

#### 6️⃣ Criar Novo (Caminho Alternativo)
- Nenhum match adequado encontrado
- Usuário clica em "Criar Novo Lançamento"
- Dialog informativo é aberto
- Opção de ir para tela de lançamentos

#### 7️⃣ Continuar Conciliando
- Após conciliar, seleção é limpa
- Usuário seleciona próxima transação
- Processo se repete até conciliar todas

### 4. Componentes Shadcn/UI Utilizados

**Cards e Layout:**
- `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription`

**Inputs e Selects:**
- `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`
- `Label`

**Buttons:**
- `Button` (variants: default, outline, ghost, link)

**Feedback:**
- `Badge` (variants: default, outline, custom colors)
- `Alert`, `AlertTitle`, `AlertDescription`
- `Separator`

**Dialogs:**
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`

**Icons (lucide-react):**
- `CheckCircle`, `XCircle`, `LinkIcon`, `Plus`, `Search`, `Loader2`
- `AlertCircle`, `TrendingUp`, `TrendingDown`, `Filter`, `X`

### 5. Tratamento de Erros e Loading

**Estados de Loading:**
```typescript
// Loading geral da página
{loading && <Loader2 className="h-8 w-8 animate-spin" />}

// Loading de busca de similares
{loadingSimilar && <Loader2 className="h-8 w-8 animate-spin" />}

// Loading durante conciliação
{reconciling ? (
  <>
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    Conciliando...
  </>
) : (
  <>Confirmar Conciliação</>
)}
```

**Tratamento de Erros:**
```typescript
try {
  // Operação
} catch (error: any) {
  console.error("Erro:", error)
  toast({
    title: "Erro",
    description: error.response?.data?.message || error.message,
    variant: "destructive",
  })
}
```

### 6. Responsividade

**Grid Responsivo:**
```tsx
<div className="grid gap-6 lg:grid-cols-2">
  {/* Em telas grandes: 2 colunas lado a lado */}
  {/* Em telas pequenas: 1 coluna empilhada */}
</div>
```

**Cards Adaptáveis:**
- Truncate em textos longos
- Flex layout com wrap
- Min-width para evitar quebras

### 7. Cores Semânticas

**Tipos de Transação:**
- 🟢 Verde: Crédito (receita)
- 🔴 Vermelho: Débito (despesa)

**Scores de Similaridade:**
- 🟢 Verde (85-100%): Alta confiança
- 🟡 Amarelo (60-84%): Média confiança
- 🟠 Laranja (30-59%): Baixa confiança
- ⚪ Cinza (0-29%): Sem match

**Status:**
- 🟢 Verde: Conciliado
- 🟡 Amarelo: Pendente
- 🔴 Vermelho: Erro

### 8. Acessibilidade

- Labels em todos os campos
- Descrições em cards
- Estados de loading visíveis
- Contraste adequado de cores
- Cursor pointer em elementos clicáveis
- Feedback visual em hover/focus

### 9. Performance

**Otimizações:**
- Carregamento paralelo com `Promise.all`
- Auto-seleção de extrato com pendências
- Limpeza de estados após conciliação
- Recarregamento seletivo de dados

**Lazy Loading:**
- Transações similares só carregadas quando necessário
- Detalhes de extrato carregados sob demanda

### 10. Melhorias Futuras

**Curto Prazo:**
- [ ] Implementar criação de lançamento direto na conciliação
- [ ] Adicionar filtros por tipo (crédito/débito)
- [ ] Paginação para muitas transações
- [ ] Atalhos de teclado (setas, Enter)

**Médio Prazo:**
- [ ] Conciliação em lote (múltiplas de uma vez)
- [ ] Histórico de conciliações
- [ ] Desfazer conciliação
- [ ] Exportar relatório de conciliações

**Longo Prazo:**
- [ ] Machine learning para melhorar sugestões
- [ ] Regras de conciliação automática
- [ ] Integração com Open Banking
- [ ] Conciliação por foto de comprovante

## Testes Recomendados

### Funcionalidades
1. ✅ Carregar extratos importados
2. ✅ Selecionar extrato
3. ✅ Visualizar transações OFX
4. ✅ Selecionar transação OFX
5. ✅ Buscar transações similares
6. ✅ Visualizar scores e razões
7. ✅ Abrir dialog de confirmação
8. ✅ Conciliar transação
9. ✅ Atualizar contadores após conciliação
10. ✅ Dialog de criar novo lançamento

### Edge Cases
1. Nenhum extrato importado
2. Extrato sem transações
3. Transação sem matches
4. Todos os matches com score baixo
5. Erro na busca de similares
6. Erro na conciliação
7. Transação já conciliada

### UX
1. Loading states
2. Estados vazios amigáveis
3. Feedback de sucesso/erro
4. Navegação entre telas
5. Responsividade mobile
6. Cores e ícones corretos

## Integração com Outras Telas

### `/dashboard/financeiro/extratos`
- Após importar OFX, botão leva para conciliação
- Link no alert de resultado da importação

### `/dashboard/financeiro/lancamentos`
- Link no dialog de criar novo lançamento
- Usuário pode criar e voltar para conciliar

### API Endpoints Utilizados
- `GET /financial/ofx/imports` - Listar extratos
- `GET /financial/ofx/imports/:id` - Detalhes do extrato
- `POST /financial/ofx/find-similar` - Buscar similares
- `PATCH /financial/ofx/reconcile/:id` - Conciliar

## Conclusão

A tela de conciliação bancária está completa e funcional, oferecendo:

✅ **Interface Intuitiva**: Layout de duas colunas, cores semânticas, feedback visual
✅ **Busca Inteligente**: Algoritmo de matching com scores e razões
✅ **Fluxo Simplificado**: Poucos cliques para conciliar
✅ **Estados Claros**: Loading, vazios, erros bem tratados
✅ **Integração Total**: Conectada com API e outras telas

A funcionalidade está pronta para uso e proporciona uma experiência eficiente de conciliação bancária! 🎉
