# Tela de Relatórios de Investidores

## Data
10 de novembro de 2025

## Visão Geral
Tela completa para exportação de relatórios em formato Excel (.xlsx) relacionados ao módulo de investidores, incluindo aportes, distribuições, ROI e resumos consolidados.

## Arquivos Criados

### 1. `/lib/api/reports.ts`
**Descrição**: Client API para todos os endpoints de relatórios

**Exports**:
- `reportsApi` - Instância principal
- Types: `InvestmentStatus`, `DistributionStatus`, `ProjectStatus`, `InvestorStatus`, `InvestorType`
- Interfaces de filtros para cada tipo de relatório

**Métodos**:
```typescript
// Aportes
exportInvestments(companyId, filters?)
exportInvestmentsByInvestor(companyId, filters?)
exportInvestmentsByProject(companyId, filters?)

// Distribuições
exportDistributions(companyId, filters?)

// ROI
exportROI(companyId, filters?)

// Resumos
exportInvestorsSummary(companyId, filters?)
exportProjectsSummary(companyId, filters?)

// Helpers
downloadBlob(blob, filename)
generateFilename(reportType)
```

**Características**:
- ✅ Retorna `Blob` (arquivo binário Excel)
- ✅ `responseType: "blob"` no axios
- ✅ Construção automática de query params
- ✅ Headers com `x-company-id`
- ✅ Helper para download automático
- ✅ Gerador de nomes com data

### 2. `/app/dashboard/investidores/relatorios/page.tsx`
**Descrição**: Interface completa para exportação de relatórios

**Seções**:
1. **Relatórios de Aportes** (3 variações)
2. **Relatórios de Distribuições**
3. **Relatório de ROI**
4. **Resumos** (Investidores e Projetos)

---

## Estrutura da Tela

### 1. Relatórios de Aportes 💰
**Ícone**: `DollarSign` (azul)

**Filtros Disponíveis**:
- Projeto (select com todos os projetos)
- Investidor (select com todos os investidores)
- Status (PENDENTE | CONFIRMADO | CANCELADO)
- Data Inicial (date input)
- Data Final (date input)

**Botões de Exportação**:
```
[Aportes Geral]  [Por Investidor]  [Por Projeto]
```

**Endpoints**:
- `GET /scp/reports/investments/export` - Lista completa
- `GET /scp/reports/investments/by-investor/export` - Agrupado por investidor
- `GET /scp/reports/investments/by-project/export` - Agrupado por projeto

**Colunas Excel (Geral)**:
- Data
- Projeto
- Investidor
- CPF/CNPJ
- Valor
- Método Pagamento
- Status
- Referência
- Documento

**Recursos**:
- Total automático (fórmula SUM)
- Formatação monetária (R$)
- Cabeçalho azul
- Larguras otimizadas

---

### 2. Relatórios de Distribuições 💸
**Ícone**: `Download` (verde)

**Filtros Disponíveis**:
- Projeto
- Investidor
- Status (PENDENTE | PAGO | CANCELADO)
- Data Inicial
- Data Final

**Botão de Exportação**:
```
[Exportar Distribuições]
```

**Endpoint**:
- `GET /scp/reports/distributions/export`

**Colunas Excel**:
- Data Distribuição
- Data Competência
- Projeto
- Investidor
- CPF/CNPJ
- Valor Base
- Valor Bruto
- IRRF
- Deduções
- Valor Líquido
- Percentual %
- Status
- Método Pagamento
- Referência

**Recursos**:
- Cálculo automático de totais
- Formatação de percentual
- Cabeçalho verde
- Todas as colunas monetárias formatadas

---

### 3. Relatório de ROI 📈
**Ícone**: `TrendingUp` (laranja)

**Filtros Disponíveis**:
- Projeto
- Investidor
- Data Inicial
- Data Final

**Botão de Exportação**:
```
[Exportar ROI]
```

**Endpoint**:
- `GET /scp/reports/roi/export`

**Colunas Excel**:
- Investidor
- Projeto
- Total Investido
- Total Distribuído
- ROI (R$)
- ROI (%)

**Cálculos**:
```typescript
ROI (R$) = Total Distribuído - Total Investido
ROI (%) = (ROI / Total Investido) × 100
```

**Recursos**:
- ✅ ROI positivo: **verde**
- ✅ ROI negativo: **vermelho**
- ✅ ROI zero: preto
- ✅ Cabeçalho laranja
- ✅ Considera apenas distribuições PAGAS

---

### 4. Resumo de Investidores 👥
**Ícone**: `Users` (roxo)

**Filtros Disponíveis**:
- Tipo (PESSOA_FISICA | PESSOA_JURIDICA)
- Status (ATIVO | INATIVO | SUSPENSO | BLOQUEADO)
- Categoria (text input)

**Botão de Exportação**:
```
[Exportar Resumo]
```

**Endpoint**:
- `GET /scp/reports/investors/export`

**Colunas Excel**:
- Nome/Razão Social
- CPF/CNPJ
- Tipo
- Email
- Telefone
- Status
- Qtd Aportes
- Total Investido
- Qtd Distribuições
- Total Recebido
- ROI (R$)

**Recursos**:
- Consolidação completa do investidor
- ROI calculado automaticamente
- Cores para ROI positivo/negativo
- Contadores de aportes e distribuições
- Ideal para análise de carteira

---

### 5. Resumo de Projetos 📁
**Ícone**: `FolderKanban` (teal)

**Filtros Disponíveis**:
- Status (PLANEJAMENTO | EM_CAPTACAO | ATIVO | CONCLUIDO | CANCELADO | SUSPENSO)
- Data Início
- Data Fim

**Botão de Exportação**:
```
[Exportar Resumo]
```

**Endpoint**:
- `GET /scp/reports/projects/export`

**Colunas Excel**:
- Código
- Nome
- Status
- Data Início
- Data Fim
- Valor Total
- Valor Investido
- % Investido
- Distribuído
- Qtd Aportes
- Qtd Distribuições

**Cálculos**:
```typescript
% Investido = (Valor Investido / Valor Total) × 100
```

**Recursos**:
- % de captação por projeto
- Totais de investimento e distribuição
- Contadores de aportes e distribuições
- Cabeçalho verde
- Ideal para análise de performance

---

## Funcionalidades Implementadas

### Carregamento de Dados
```typescript
useEffect(() => {
  loadSelectedCompany()
}, [])

useEffect(() => {
  if (selectedCompany) {
    loadProjects()
    loadInvestors()
  }
}, [selectedCompany])
```

**Carrega**:
- ✅ Empresa selecionada (via `authApi`)
- ✅ Lista de projetos (via `projectsApi`)
- ✅ Lista de investidores (via `investorsApi`)

### Estados de Loading
Cada botão tem seu próprio estado de loading:
```typescript
const [loading, setLoading] = useState<string | null>(null)

// Uso:
disabled={loading === "investments"}
disabled={loading === "distributions"}
disabled={loading === "roi"}
// etc...
```

**Benefícios**:
- Apenas o botão clicado mostra loading
- Outros botões permanecem habilitados
- UX mais responsiva

### Filtros Independentes
Cada tipo de relatório tem seus próprios filtros:
```typescript
const [investmentFilters, setInvestmentFilters] = useState({...})
const [distributionFilters, setDistributionFilters] = useState({...})
const [roiFilters, setRoiFilters] = useState({...})
const [investorReportFilters, setInvestorReportFilters] = useState({...})
const [projectReportFilters, setProjectReportFilters] = useState({...})
```

**Vantagens**:
- Filtros não interferem entre si
- Usuário pode configurar múltiplos relatórios
- Histórico de filtros preservado

### Download Automático
```typescript
const blob = await reportsApi.exportInvestments(companyId, filters)
reportsApi.downloadBlob(blob, reportsApi.generateFilename("aportes"))
```

**Fluxo**:
1. API retorna `Blob` (arquivo binário)
2. Helper cria URL temporária
3. Cria elemento `<a>` dinamicamente
4. Dispara download
5. Remove URL temporária

**Nome do Arquivo**:
```
aportes_2025-11-10.xlsx
distribuicoes_2025-11-10.xlsx
roi_2025-11-10.xlsx
resumo_investidores_2025-11-10.xlsx
resumo_projetos_2025-11-10.xlsx
```

### Tratamento de Erros
```typescript
try {
  setLoading("investments")
  const blob = await reportsApi.exportInvestments(...)
  reportsApi.downloadBlob(...)
  toast({ title: "Sucesso" })
} catch (error: any) {
  toast({
    title: "Erro ao exportar relatório",
    description: error.response?.data?.message || error.message,
    variant: "destructive",
  })
} finally {
  setLoading(null)
}
```

---

## Layout e Design

### Organização Visual
```
┌─────────────────────────────────────┐
│ 📊 Relatórios de Investidores       │
│ Exporte relatórios em Excel...      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 💰 Relatórios de Aportes            │
│ ┌─────────────────────────────────┐ │
│ │ 🔍 Filtros                      │ │
│ │ [Projeto] [Investidor] [Status] │ │
│ │ [Data Inicial] [Data Final]     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Aportes Geral] [Por Inv] [Por Proj]│
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 💸 Relatórios de Distribuições      │
│ ┌─────────────────────────────────┐ │
│ │ 🔍 Filtros                      │ │
│ │ [Projeto] [Investidor] [Status] │ │
│ │ [Data Inicial] [Data Final]     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Exportar Distribuições]            │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 📈 Relatório de ROI                 │
│ ┌─────────────────────────────────┐ │
│ │ 🔍 Filtros                      │ │
│ │ [Projeto] [Investidor]          │ │
│ │ [Data Inicial] [Data Final]     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Exportar ROI]                      │
└─────────────────────────────────────┘

┌──────────────────┬──────────────────┐
│ 👥 Resumo Invest │ 📁 Resumo Proj   │
│ [Tipo] [Status]  │ [Status] [Datas] │
│ [Exportar]       │ [Exportar]       │
└──────────────────┴──────────────────┘
```

### Cores por Tipo de Relatório
- **Aportes**: Azul (`text-blue-600`)
- **Distribuições**: Verde (`text-green-600`)
- **ROI**: Laranja (`text-orange-600`)
- **Resumo Investidores**: Roxo (`text-purple-600`)
- **Resumo Projetos**: Teal (`text-teal-600`)

### Grid Responsivo
```tsx
// Filtros
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

// Botões de Aportes
<div className="grid gap-4 md:grid-cols-3">

// Resumos
<div className="grid gap-6 md:grid-cols-2">
```

**Comportamento**:
- Mobile: 1 coluna
- Tablet (md): 2 colunas
- Desktop (lg): 3 colunas

---

## Exemplos de Uso

### Exemplo 1: Exportar Aportes do Ano
```
1. Acessa /dashboard/investidores/relatorios
2. Seção "Relatórios de Aportes"
3. Configura filtros:
   - Projeto: (todos)
   - Investidor: (todos)
   - Status: CONFIRMADO
   - Data Inicial: 2025-01-01
   - Data Final: 2025-12-31
4. Clica "Aportes Geral"
5. Download automático: aportes_2025-11-10.xlsx
```

### Exemplo 2: ROI de um Investidor Específico
```
1. Seção "Relatório de ROI"
2. Configura filtros:
   - Projeto: (todos)
   - Investidor: João Silva
   - Data Inicial: (vazio)
   - Data Final: (vazio)
3. Clica "Exportar ROI"
4. Download: roi_2025-11-10.xlsx
5. Excel mostra ROI de João em todos os projetos
```

### Exemplo 3: Resumo de Investidores Ativos PF
```
1. Seção "Resumo de Investidores"
2. Configura filtros:
   - Tipo: PESSOA_FISICA
   - Status: ATIVO
   - Categoria: (vazio)
3. Clica "Exportar Resumo"
4. Download: resumo_investidores_2025-11-10.xlsx
5. Excel lista todos PF ativos com totais
```

---

## Validações e Tratamentos

### Empresa Não Selecionada
```tsx
if (!selectedCompany) {
  return (
    <div className="text-center">
      <AlertCircle />
      <h3>Nenhuma empresa selecionada</h3>
      <p>Selecione uma empresa para continuar</p>
    </div>
  )
}
```

### Filtros Opcionais
Todos os filtros são **opcionais**. Se não preenchidos:
- Backend retorna **todos os registros**
- Útil para relatórios gerais

### Loading States
```tsx
{loading === "investments" ? (
  <>
    <Loader2 className="animate-spin" />
    Exportando...
  </>
) : (
  <>
    <FileSpreadsheet />
    Aportes Geral
  </>
)}
```

### Toast de Feedback
```typescript
// Sucesso
toast({
  title: "Sucesso",
  description: "Relatório de aportes exportado com sucesso",
})

// Erro
toast({
  title: "Erro ao exportar relatório",
  description: error.message,
  variant: "destructive",
})
```

---

## Integrações

### APIs Utilizadas
```typescript
import { authApi } from "@/lib/api/auth"           // Empresa selecionada
import { reportsApi } from "@/lib/api/reports"     // Exportações
import { projectsApi } from "@/lib/api/projects"   // Lista de projetos
import { investorsApi } from "@/lib/api/investors" // Lista de investidores
```

### Dependências de Componentes
```typescript
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, ... } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
```

### Ícones Lucide
```typescript
import {
  FileSpreadsheet,  // Exportar
  Download,         // Distribuições
  Loader2,          // Loading
  Filter,           // Filtros
  TrendingUp,       // ROI
  Users,            // Investidores
  FolderKanban,     // Projetos
  DollarSign,       // Aportes
  BarChart3,        // (não usado)
  AlertCircle,      // Alertas
} from "lucide-react"
```

---

## Melhorias Futuras Sugeridas

### 1. Preview Antes de Exportar
- Mostrar tabela com primeiros 10 registros
- Botão "Visualizar" antes de exportar
- Validar se há dados antes do download

### 2. Exportação em Outros Formatos
- PDF (para impressão)
- CSV (para importação)
- JSON (para APIs)

### 3. Filtros Avançados
- Múltiplos projetos (multi-select)
- Múltiplos investidores
- Ranges de valores
- Tags/categorias

### 4. Relatórios Salvos
- Salvar configurações de filtros
- Reutilizar relatórios frequentes
- Agendar exportações automáticas

### 5. Gráficos Inline
- Preview visual antes de exportar
- Gráficos de ROI
- Tendências de captação

### 6. Histórico de Exportações
- Ver relatórios já exportados
- Re-download de relatórios anteriores
- Comparação entre períodos

### 7. Email com Relatório
- Enviar relatório por email
- Agendar envios periódicos
- Compartilhar com equipe

---

## Testes Recomendados

### Aportes
- [ ] Exportar sem filtros (todos os aportes)
- [ ] Filtrar por projeto específico
- [ ] Filtrar por investidor específico
- [ ] Filtrar por período (startDate + endDate)
- [ ] Filtrar por status (PENDENTE, CONFIRMADO, CANCELADO)
- [ ] Exportar agrupado por investidor
- [ ] Exportar agrupado por projeto
- [ ] Verificar formatação monetária no Excel
- [ ] Verificar fórmulas de totais

### Distribuições
- [ ] Exportar todas as distribuições
- [ ] Filtrar apenas PAGAS
- [ ] Filtrar apenas PENDENTES
- [ ] Verificar cálculo de IRRF
- [ ] Verificar valor líquido
- [ ] Verificar formatação de percentual

### ROI
- [ ] Exportar ROI geral
- [ ] Filtrar por investidor
- [ ] Filtrar por projeto
- [ ] Verificar cores (verde/vermelho)
- [ ] Verificar cálculo de percentual
- [ ] Considerar apenas distribuições PAGAS

### Resumos
- [ ] Resumo de investidores PF
- [ ] Resumo de investidores PJ
- [ ] Filtrar por status (ATIVO, INATIVO)
- [ ] Resumo de projetos ATIVOS
- [ ] Resumo de projetos CONCLUIDOS
- [ ] Verificar totalizadores

### UX
- [ ] Loading individual por botão
- [ ] Toast de sucesso
- [ ] Toast de erro
- [ ] Download automático
- [ ] Nome de arquivo com data
- [ ] Filtros independentes entre seções

---

## Status
✅ **Concluído**
- API de relatórios completa (7 endpoints)
- Tela de relatórios implementada
- 7 tipos diferentes de relatórios
- Filtros independentes
- Download automático
- Loading states
- Tratamento de erros
- Design responsivo
- Zero erros de compilação

## Resumo

### Endpoints Implementados
1. ✅ `GET /scp/reports/investments/export`
2. ✅ `GET /scp/reports/investments/by-investor/export`
3. ✅ `GET /scp/reports/investments/by-project/export`
4. ✅ `GET /scp/reports/distributions/export`
5. ✅ `GET /scp/reports/roi/export`
6. ✅ `GET /scp/reports/investors/export`
7. ✅ `GET /scp/reports/projects/export`

### Funcionalidades
- ✅ Exportação em formato Excel (.xlsx)
- ✅ Filtros personalizáveis por relatório
- ✅ Download automático com nome inteligente
- ✅ Loading independente por botão
- ✅ Feedback visual (toast)
- ✅ Integração com projetos e investidores
- ✅ Design responsivo e intuitivo
- ✅ Cores distintas por tipo de relatório
