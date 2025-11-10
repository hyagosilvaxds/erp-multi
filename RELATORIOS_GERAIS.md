# Relatórios Gerais - Dashboard Principal

## 📋 Visão Geral

Página unificada em `/dashboard/relatorios` que centraliza a exportação de relatórios de diferentes módulos do sistema: **Financeiro**, **Investidores** e **Folha de Pagamento**.

## 🎯 Objetivo

Fornecer uma interface única para o usuário exportar relatórios dos principais módulos do ERP, consumindo as APIs já implementadas em cada módulo.

## 📁 Arquivos

### Página Principal
- **Caminho**: `/app/dashboard/relatorios/page.tsx`
- **Rota**: `/dashboard/relatorios`
- **Tipo**: Client Component

## 🔧 APIs Consumidas

### 1. Relatórios Financeiros (`financialReportsApi`)

**Arquivo**: `/lib/api/financial.ts`

| Função | Descrição | Endpoint | Retorno |
|--------|-----------|----------|---------|
| `exportCashFlow()` | Exporta fluxo de caixa | `/financial/reports/cash-flow/export` | Excel |
| `exportAccountsPayable()` | Exporta contas a pagar | `/financial/reports/accounts-payable/export` | Excel |
| `exportAccountsReceivable()` | Exporta contas a receber | `/financial/reports/accounts-receivable/export` | Excel |
| `exportTransactionsByCentroCusto()` | Transações por centro de custo | `/financial/reports/transactions/by-centro-custo/export` | Excel |
| `exportTransactionsByContaContabil()` | Transações por conta contábil | `/financial/reports/transactions/by-conta-contabil/export` | Excel |

**Filtros disponíveis**:
```typescript
{
  companyId: string
  startDate?: string
  endDate?: string
  status?: string
}
```

### 2. Relatórios de Investidores (`reportsApi`)

**Arquivo**: `/lib/api/reports.ts`

| Função | Descrição | Endpoint | Retorno |
|--------|-----------|----------|---------|
| `exportInvestments()` | Exporta aportes | `/scp/reports/investments/export` | Excel |
| `exportDistributions()` | Exporta distribuições | `/scp/reports/distributions/export` | Excel |
| `exportROI()` | Exporta ROI | `/scp/reports/roi/export` | Excel |
| `exportInvestorsSummary()` | Resumo de investidores | `/scp/reports/investors/export` | Excel |

**Filtros disponíveis**:
```typescript
{
  projectId?: string
  investorId?: string
  startDate?: string
  endDate?: string
  status?: string
}
```

### 3. Relatórios de Folha de Pagamento (`payrollApi`)

**Arquivo**: `/lib/api/payroll.ts`

| Função | Descrição | Endpoint | Retorno |
|--------|-----------|----------|---------|
| `downloadPayrollPDF()` | Folha consolidada | `/payroll/:id/pdf` | PDF |
| `downloadPayslipPDF()` | Holerite individual | `/payroll/:id/items/:itemId/payslip` | PDF |
| `exportPayrollExcel()` | Exporta em Excel | `/payroll/:id/export/excel` | Excel |

**Nota**: Relatórios de folha requerem ID específico, por isso a página redireciona para a lista de folhas.

## 🎨 Interface

### Estrutura da Página

```
┌─────────────────────────────────────────────┐
│ Header: Relatórios & Exportações           │
├─────────────────────────────────────────────┤
│                                             │
│ 📊 RELATÓRIOS FINANCEIROS                   │
│ ┌─────────────────────────────────────┐    │
│ │ Filtros: Data Início | Data Fim     │    │
│ │          Status                      │    │
│ └─────────────────────────────────────┘    │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│ │Fluxo │ │A     │ │A     │ │Por   │ ...   │
│ │Caixa │ │Pagar │ │Receb.│ │Centro│       │
│ └──────┘ └──────┘ └──────┘ └──────┘       │
│                                             │
│ 💰 RELATÓRIOS DE INVESTIDORES               │
│ ┌─────────────────────────────────────┐    │
│ │ Filtros: [Combobox Projeto]         │    │
│ │          [Combobox Investidor]      │    │
│ │          Data Início | Data Fim     │    │
│ └─────────────────────────────────────┘    │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│ │Aportes│ │Distrib│ │ROI  │ │Resumo│       │
│ └──────┘ └──────┘ └──────┘ └──────┘       │
│                                             │
│ 👥 RELATÓRIOS DE FOLHA DE PAGAMENTO         │
│ ┌─────────────────────────────────────┐    │
│ │ Filtros: Mês | Ano | Status          │    │
│ └─────────────────────────────────────┘    │
│ ┌──────┐ ┌──────┐                          │
│ │Lista │ │PDF   │ (desabilitado)           │
│ │Folhas│ │Folha │                          │
│ └──────┘ └──────┘                          │
│                                             │
│ ℹ️  Info: Formatos Disponíveis              │
└─────────────────────────────────────────────┘
```

### Componentes Utilizados

- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` - Shadcn UI
- `Button` - Com estados de loading (Loader2)
- `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem` - Filtros simples
- `Command`, `CommandInput`, `CommandEmpty`, `CommandGroup`, `CommandItem` - Busca com filtro
- `Popover`, `PopoverTrigger`, `PopoverContent` - Combobox de seleção
- `Input` - Campos de data
- `Label` - Labels dos filtros
- `useToast` - Feedback visual

### Combobox com Busca (Projetos e Investidores)

Os filtros de **Projeto** e **Investidor** utilizam o componente **Command** do Shadcn UI, que permite:

- ✅ **Busca em tempo real** - Digite para filtrar
- ✅ **Seleção clara** - Ícone de check no item selecionado
- ✅ **Opção "Todos"** - Limpar filtro
- ✅ **Scroll** - Lista rolável com max-height
- ✅ **Informação adicional** - Código do projeto, CPF/CNPJ do investidor

```typescript
// Exemplo: Combobox de Projetos
<Popover open={openProject} onOpenChange={setOpenProject}>
  <PopoverTrigger asChild>
    <Button variant="outline" role="combobox">
      {investorFilters.projectId
        ? projects.find((p) => p.id === investorFilters.projectId)?.name
        : "Selecionar projeto..."}
      <ChevronsUpDown className="ml-2 h-4 w-4" />
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-[300px] p-0">
    <Command>
      <CommandInput placeholder="Buscar projeto..." />
      <CommandEmpty>Nenhum projeto encontrado.</CommandEmpty>
      <CommandGroup className="max-h-64 overflow-auto">
        {/* Items */}
      </CommandGroup>
    </Command>
  </PopoverContent>
</Popover>
```

## 🔄 Fluxo de Exportação

### 1. Carregamento Inicial de Dados

Ao carregar a página, são buscados automaticamente:
- **Projetos**: Lista de todos os projetos da empresa (limit: 100)
- **Investidores**: Lista de todos os investidores da empresa (limit: 100)

```typescript
useEffect(() => {
  const loadInitialData = async () => {
    try {
      const company = authApi.getSelectedCompany()
      if (!company) return

      const [projectsData, investorsData] = await Promise.all([
        projectsApi.getAll(company.id, { limit: 100 }),
        investorsApi.getAll(company.id, { limit: 100 }),
      ])

      setProjects(projectsData.data)
      setInvestors(investorsData.data)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoadingData(false)
    }
  }

  loadInitialData()
}, [])
```

### 2. Configuração de Filtros

```typescript
// Exemplo: Filtros de Investidores
const [investorFilters, setInvestorFilters] = useState({
  projectId: "",    // Selecionado via Combobox
  investorId: "",   // Selecionado via Combobox
  startDate: "",    // Input date
  endDate: "",      // Input date
  status: "",       // Select
})
```

### 3. Chamada da API
```typescript
const handleExportCashFlow = async () => {
  try {
    setLoadingFinancial("cashflow")
    const companyId = getCompanyId()
    
    const blob = await financialReportsApi.exportCashFlow({
      companyId,
      startDate: financialFilters.startDate || undefined,
      endDate: financialFilters.endDate || undefined,
      status: financialFilters.status || undefined,
    })

    // Download automático
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `fluxo-caixa_${new Date().toISOString().split("T")[0]}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    toast({ title: "Sucesso", description: "Relatório exportado" })
  } catch (error: any) {
    toast({ variant: "destructive", title: "Erro", description: error.message })
  } finally {
    setLoadingFinancial(null)
  }
}
```

### 3. Estados de Loading

Cada seção tem seu próprio estado de loading para não bloquear outras exportações:

```typescript
const [loadingFinancial, setLoadingFinancial] = useState<string | null>(null)
const [loadingInvestors, setLoadingInvestors] = useState<string | null>(null)
const [loadingPayroll, setLoadingPayroll] = useState<string | null>(null)
const [loadingData, setLoadingData] = useState(true) // Loading inicial
```

### 4. Estados dos Popovers (Combobox)

```typescript
const [openProject, setOpenProject] = useState(false)
const [openInvestor, setOpenInvestor] = useState(false)
```

## 📦 Formato dos Arquivos

### Nomenclatura Automática

```typescript
// Financeiros
`fluxo-caixa_${YYYY-MM-DD}.xlsx`
`contas-pagar_${YYYY-MM-DD}.xlsx`
`contas-receber_${YYYY-MM-DD}.xlsx`
`transacoes-centro-custo_${YYYY-MM-DD}.xlsx`
`transacoes-conta-contabil_${YYYY-MM-DD}.xlsx`

// Investidores (usa helper do reportsApi)
`aportes_${YYYY-MM-DD}.xlsx`
`distribuicoes_${YYYY-MM-DD}.xlsx`
`roi_${YYYY-MM-DD}.xlsx`
`resumo-investidores_${YYYY-MM-DD}.xlsx`
```

## 🎯 Casos de Uso

### Caso 1: Exportar Fluxo de Caixa do Último Trimestre

1. Acesse `/dashboard/relatorios`
2. Em **Relatórios Financeiros**:
   - Defina Data Início: `2025-01-01`
   - Defina Data Fim: `2025-03-31`
   - Clique em "Fluxo de Caixa"
3. Arquivo `fluxo-caixa_2025-11-10.xlsx` será baixado

### Caso 2: Exportar Aportes de um Projeto Específico

1. Acesse `/dashboard/relatorios`
2. Em **Relatórios de Investidores**:
   - Clique no combobox "Projeto"
   - Digite o nome do projeto ou navegue pela lista
   - Selecione o projeto desejado
   - Clique em "Aportes"
3. Arquivo `aportes_2025-11-10.xlsx` será baixado

### Caso 2.1: Buscar Investidor por Nome

1. Em **Relatórios de Investidores**:
   - Clique no combobox "Investidor"
   - Digite o nome ou CPF/CNPJ
   - A lista filtrará em tempo real
   - Selecione o investidor
   - Escolha o tipo de relatório
2. Arquivo será exportado com o filtro aplicado

### Caso 3: Exportar Folha de Pagamento

1. Acesse `/dashboard/relatorios`
2. Em **Relatórios de Folha de Pagamento**:
   - Leia a nota: "Para exportar folhas específicas..."
   - Clique no link (ou navegue para lista de folhas)
   - Na lista, selecione a folha desejada
   - Use os botões de ação (PDF/Excel)

## 🔒 Segurança

### Validação de Empresa
```typescript
const getCompanyId = () => {
  const company = authApi.getSelectedCompany()
  if (!company) {
    toast({
      variant: "destructive",
      title: "Erro",
      description: "Nenhuma empresa selecionada",
    })
    throw new Error("No company selected")
  }
  return company.id
}
```

Todas as requisições incluem:
- Header `x-company-id` para isolamento de dados
- Token de autenticação (via `apiClient`)

## 🎨 UX/UI

### Estados Visuais

1. **Normal**: Botão com ícone `Download`
2. **Loading**: Ícone muda para `Loader2` com animação de spin
3. **Desabilitado**: Botão cinza com cursor not-allowed

### Feedback ao Usuário

- **Sucesso**: Toast verde com mensagem de confirmação
- **Erro**: Toast vermelho com descrição do erro
- **Info**: Cards com notas explicativas

### Responsividade

```typescript
// Grid adaptativo
className="grid gap-3 md:grid-cols-2 lg:grid-cols-3"
className="grid gap-4 md:grid-cols-3"
className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
```

## 🔗 Links para Páginas Detalhadas

~~No final da página, há links para relatórios com interfaces mais complexas:~~

**REMOVIDO**: O card "Outros Relatórios" foi removido para simplificar a interface.

Os usuários podem acessar relatórios específicos através do menu lateral:
- DRE via menu Relatórios
- Balanço Patrimonial via menu Relatórios
- Relatórios SCP Detalhados via menu Investidores

---

## 📊 Changelog

### v1.1.0 (10/11/2025)
- ✅ **NOVO**: Combobox com busca para seleção de projetos
- ✅ **NOVO**: Combobox com busca para seleção de investidores
- ✅ **NOVO**: Carregamento automático de projetos e investidores
- ✅ **NOVO**: Display de CPF/CNPJ no combobox de investidores
- ✅ **NOVO**: Display de código do projeto no combobox
- ✅ **REMOVIDO**: Card "Outros Relatórios"
- ✅ **MELHORIA**: UX aprimorada com busca em tempo real

### v1.0.0 (10/11/2025)
- ✅ Implementação inicial
- ✅ 5 relatórios financeiros
- ✅ 4 relatórios de investidores
- ✅ Interface de folha de pagamento
- ✅ Filtros por data e status

## 🚀 Próximas Melhorias

1. **Filtros Avançados**:
   - ✅ Seleção de projetos via combobox com busca (IMPLEMENTADO)
   - ✅ Seleção de investidores via combobox com busca (IMPLEMENTADO)
   - Cache de últimos filtros utilizados
   - Paginação para listas grandes (>100 itens)

2. **Histórico de Exportações**:
   - Listar últimas exportações realizadas
   - Permitir re-download

3. **Agendamento**:
   - Exportação automática mensal
   - Envio por email

4. **Personalização**:
   - Escolher colunas visíveis
   - Templates personalizados

## 📝 Notas Técnicas

### Performance

- **Lazy Loading**: Componente renderiza apenas quando necessário
- **Download Assíncrono**: Não bloqueia UI durante exportação
- **Blob API**: Gerenciamento eficiente de memória com `revokeObjectURL`
- **Carregamento Paralelo**: Projetos e investidores carregados simultaneamente com `Promise.all`
- **Limit de 100 itens**: Evita sobrecarga inicial (pode ser ajustado conforme necessidade)

### Busca com Filtro

O componente **Command** do Shadcn UI oferece:
- Busca case-insensitive
- Filtro automático por `value` do CommandItem
- Renderização otimizada com virtualização
- Scroll suave para listas grandes

### Compatibilidade

- **Navegadores**: Chrome, Firefox, Safari, Edge (últimas versões)
- **Formato**: Excel (.xlsx) - compatível com Microsoft Excel, Google Sheets, LibreOffice
- **PDF**: Gerado server-side com formatação completa

### Tratamento de Erros

```typescript
try {
  // Chamada API
} catch (error: any) {
  console.error("Erro ao exportar:", error)
  toast({
    variant: "destructive",
    title: "Erro",
    description: error.message || "Erro ao exportar relatório",
  })
} finally {
  setLoadingFinancial(null) // Sempre limpa loading
}
```

## 📚 Documentações Relacionadas

- `TELA_RELATORIOS_INVESTIDORES.md` - Relatórios detalhados de investidores
- `API_COMPANIES_ADMIN.md` - Sistema de empresas
- `FOLHA_PAGAMENTO_DOCUMENTACAO.md` - Módulo de folha de pagamento
- `CENTRO_CUSTOS_DOCUMENTACAO.md` - Centros de custo
- `PLANO_CONTAS_DOCUMENTACAO.md` - Plano de contas contábil

---

**Criado em**: 10/11/2025
**Última atualização**: 10/11/2025
**Versão**: 1.1.0
