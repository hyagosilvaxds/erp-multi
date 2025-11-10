# Implementação de Importação e Conciliação OFX

## Resumo
Implementada funcionalidade completa de importação de extratos bancários OFX na tela `/dashboard/financeiro/extratos`. A conciliação será feita na tela `/dashboard/financeiro/conciliacao`.

## Alterações Realizadas

### 1. API OFX (`/lib/api/financial.ts`)

#### Novos Tipos
```typescript
// Transação OFX
export interface OFXTransaction {
  fitId: string
  type: 'CREDIT' | 'DEBIT'
  datePosted: string
  amount: number
  name: string
  memo: string
}

// Match de transações
export interface OFXMatch {
  ofxTransactionId: string
  systemTransactionId?: string
  matchScore: number
  matchReasons: string[]
  autoMatched: boolean
}

// Resposta de importação
export interface OFXImportResponse {
  totalTransactions: number
  autoMatched: number
  needsReview: number
  alreadyImported: number
  matches: OFXMatch[]
}

// Transação similar encontrada
export interface SimilarTransaction {
  transactionId: string
  description: string
  amount: number
  transactionDate: string
  type: 'RECEITA' | 'DESPESA' | 'TRANSFERENCIA'
  categoryName?: string
  matchScore: number
  matchReasons: string[]
}

// Extrato OFX importado
export interface OFXImport {
  id: string
  companyId: string
  bankAccountId: string
  fileName: string
  fileSize: number
  bankId: string
  accountId: string
  accountType: string
  startDate: string
  endDate: string
  balance: number
  balanceDate: string
  totalTransactions: number
  importedCount: number
  duplicateCount: number
  reconciledCount: number
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR'
  importedAt: string
  bankAccount?: {
    id: string
    accountName: string
    bankName: string
    bankCode?: string
    accountNumber?: string
  }
}

// Detalhes do extrato com transações
export interface OFXImportDetail extends OFXImport {
  transactions: OFXTransaction[]
}

// Lista paginada de extratos
export interface OFXImportsResponse {
  data: OFXImport[]
  total: number
  page: number
  limit: number
  totalPages: number
}
```

#### Novas Funções da API

```typescript
export const ofxApi = {
  // Importar arquivo OFX
  async importOFX(companyId: string, bankAccountId: string, file: File): Promise<OFXImportResponse>
  
  // Buscar transações similares
  async findSimilar(companyId: string, bankAccountId: string, transaction: OFXTransaction): Promise<SimilarTransaction[]>
  
  // Conciliar manualmente
  async reconcile(companyId: string, systemTransactionId: string, ofxFitId: string): Promise<FinancialTransaction>
  
  // Listar extratos importados
  async listImports(params: {
    companyId: string
    bankAccountId?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }): Promise<OFXImportsResponse>
  
  // Buscar detalhes de um extrato
  async getImportDetails(companyId: string, id: string): Promise<OFXImportDetail>
  
  // Deletar extrato
  async deleteImport(companyId: string, id: string): Promise<void>
}
```

### 2. Tela de Extratos (`/dashboard/financeiro/extratos/page.tsx`)

#### Funcionalidades Implementadas

**Upload de Arquivo OFX:**
- Seleção de arquivo .ofx
- Seleção de conta bancária
- Validação de formato
- Upload com feedback visual
- Display de tamanho do arquivo

**Filtros:**
- Por conta bancária
- Por data inicial e final de importação
- Botão para limpar filtros
- Aplicação de filtros com loading state

**Lista de Extratos:**
- Tabela responsiva com todas as importações
- Colunas:
  - Data de importação
  - Nome e tamanho do arquivo
  - Conta bancária vinculada
  - Período do extrato (data início/fim)
  - Total de transações
  - Transações conciliadas (badge verde)
  - Transações duplicadas (badge amarelo)
  - Status (Concluído, Processando, Erro, Pendente)
  - Ações (Ver detalhes, Deletar)

**Dialog de Resultado:**
Após importação bem-sucedida, exibe:
- Total de transações processadas
- Transações que precisam revisão
- Transações já importadas anteriormente
- Transações auto-conciliadas
- Alerta para ir à tela de conciliação

**Dialog de Confirmação:**
- Confirmação antes de deletar extrato
- Aviso que conciliações permanecem no sistema

#### Estados de Interface

```typescript
const [imports, setImports] = useState<OFXImport[]>([])
const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
const [loading, setLoading] = useState(false)
const [uploading, setUploading] = useState(false)
const [selectedFile, setSelectedFile] = useState<File | null>(null)
const [selectedBankAccount, setSelectedBankAccount] = useState<string>("")
const [importResult, setImportResult] = useState<OFXImportResponse | null>(null)
const [showResultDialog, setShowResultDialog] = useState(false)
const [deleteId, setDeleteId] = useState<string | null>(null)
const [showDeleteDialog, setShowDeleteDialog] = useState(false)

// Filtros
const [filterBankAccount, setFilterBankAccount] = useState<string>("")
const [filterStartDate, setFilterStartDate] = useState("")
const [filterEndDate, setFilterEndDate] = useState("")
```

#### Handlers Principais

```typescript
// Carregar contas bancárias
const loadBankAccounts = async () => {
  const accounts = await bankAccountsApi.getAll(selectedCompany.id)
  setBankAccounts(accounts)
}

// Carregar extratos
const loadImports = async () => {
  const response = await ofxApi.listImports({
    companyId: selectedCompany.id,
    bankAccountId: filterBankAccount || undefined,
    startDate: filterStartDate || undefined,
    endDate: filterEndDate || undefined,
  })
  setImports(response.data)
}

// Selecionar arquivo
const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  // Valida extensão .ofx
  // Armazena arquivo selecionado
}

// Fazer upload
const handleUpload = async () => {
  const result = await ofxApi.importOFX(
    selectedCompany.id,
    selectedBankAccount,
    selectedFile
  )
  setImportResult(result)
  setShowResultDialog(true)
  // Limpa formulário e recarrega lista
}

// Deletar extrato
const handleDelete = async () => {
  await ofxApi.deleteImport(selectedCompany.id, deleteId)
  // Recarrega lista
}

// Ir para conciliação
const handleGoToConciliation = () => {
  router.push('/dashboard/financeiro/conciliacao')
}
```

### 3. Components Utilizados

**Shadcn/UI:**
- `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription`
- `Button` (variants: default, outline, ghost, destructive)
- `Input` (type: file, date)
- `Label`
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`, `TableHead`
- `Badge` (variants: default, outline, secondary, destructive)
- `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`
- `Alert`, `AlertTitle`, `AlertDescription`

**Icons (lucide-react):**
- `Upload`, `FileText`, `Trash2`, `Eye`, `Loader2`
- `CheckCircle2`, `AlertCircle`, `Filter`, `X`

### 4. Fluxo de Uso

1. **Importar Extrato:**
   - Usuário seleciona arquivo .ofx
   - Seleciona conta bancária correspondente
   - Clica em "Importar Extrato"
   - Sistema processa e mostra resultado em dialog
   - Dialog mostra quantas transações precisam revisão
   - Botão "Ir para Conciliação" leva à tela de conciliação

2. **Visualizar Extratos:**
   - Lista todos os extratos importados
   - Filtrar por conta, período
   - Ver detalhes de cada extrato
   - Acompanhar status de conciliação

3. **Deletar Extrato:**
   - Clica no ícone de lixeira
   - Confirma exclusão em dialog
   - Extrato é removido (conciliações permanecem)

### 5. Algoritmo de Matching (Documentado)

O sistema usa algoritmo inteligente de similaridade com pontuação 0-100:

**Valor (40 pontos):**
- Valor exato: 40 pontos
- Diferença < 1%: 35 pontos
- Diferença < 5%: 25 pontos
- Diferença < 10%: 15 pontos

**Data (30 pontos):**
- Mesma data: 30 pontos
- Diferença de 1 dia: 25 pontos
- Diferença até 3 dias: 20 pontos
- Diferença até 7 dias: 10 pontos

**Descrição (30 pontos):**
- Similaridade ≥ 80%: 30 pontos
- Similaridade ≥ 60%: 20 pontos
- Similaridade ≥ 40%: 10 pontos

**Bônus:**
- Palavras em comum: até 15 pontos

**Interpretação do Score:**
- 🟢 85-100: Alta confiança
- 🟡 60-84: Média confiança
- 🟠 30-59: Baixa confiança
- 🔴 0-29: Sem match

> **Importante:** Sistema NUNCA concilia automaticamente. Todas as transações precisam confirmação manual.

### 6. Formatação e Utilitários

```typescript
// Formatar data
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR')
}

// Formatar tamanho de arquivo
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Badge de status
const getStatusBadge = (status: string) => {
  const variants = {
    COMPLETED: { variant: "default", label: "Concluído" },
    PROCESSING: { variant: "secondary", label: "Processando" },
    ERROR: { variant: "destructive", label: "Erro" },
    PENDING: { variant: "outline", label: "Pendente" },
  }
  // Retorna Badge com variant e label corretos
}
```

### 7. Tratamento de Erros

- Try-catch em todas as operações assíncronas
- Toast com mensagens amigáveis
- Logging de erros no console
- Estados de loading para feedback visual
- Validações antes de submissões

### 8. Responsividade

- Grid responsivo (3 colunas em desktop, 1 em mobile)
- Tabela com overflow-x-auto
- Botões com tamanho adaptável
- Cards com layout flexível

## Próximos Passos

### Tela de Conciliação (`/dashboard/financeiro/conciliacao`)

Será criada na próxima etapa com:

1. **Lista de Transações OFX Não Conciliadas:**
   - Filtros por conta, período, tipo
   - Exibição de dados da transação OFX
   - Score de similaridade com transações do sistema

2. **Busca de Transações Similares:**
   - Lista de matches sugeridos
   - Score visual (cores semafóricas)
   - Razões do match exibidas

3. **Conciliação Manual:**
   - Seleção de transação do sistema
   - Confirmação de conciliação
   - Feedback visual após conciliar

4. **Criação de Nova Transação:**
   - Se não houver match
   - Formulário pré-preenchido com dados OFX
   - Salvar e conciliar automaticamente

## Testes Recomendados

### Funcionalidades
1. ✅ Upload de arquivo OFX
2. ✅ Validação de formato de arquivo
3. ✅ Listagem de extratos importados
4. ✅ Filtros de busca
5. ✅ Visualização de detalhes
6. ✅ Exclusão de extrato
7. ✅ Dialog de resultado
8. ✅ Navegação para conciliação

### Edge Cases
1. Arquivo muito grande
2. Arquivo corrompido
3. Conta bancária inexistente
4. Extrato já importado
5. Erro no servidor
6. Sem contas bancárias cadastradas

## Notas Técnicas

### Multi-tenancy
- Todas as requisições incluem `x-company-id` header
- Empresa obtida via `authApi.getSelectedCompany()`

### Upload de Arquivos
- Usa FormData para multipart/form-data
- Content-Type automático pelo axios
- Arquivo validado no client antes do upload

### Performance
- Carregamento lazy de dados
- Estados de loading separados
- Recarregamento seletivo após operações

### Segurança
- Validação de tipo de arquivo
- Headers multi-tenant
- Confirmação antes de deletar

## Conclusão

A funcionalidade de importação OFX está completamente implementada e pronta para uso. A tela permite importar extratos, visualizar histórico, aplicar filtros e gerenciar importações. A próxima etapa é implementar a tela de conciliação para completar o fluxo.
