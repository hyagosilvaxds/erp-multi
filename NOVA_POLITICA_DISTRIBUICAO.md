# Tela de Nova Política de Distribuição

## 📋 Visão Geral

Implementação completa da página de criação de políticas de distribuição automática, conectada à API do módulo SCP com validações inteligentes e preview em tempo real.

## 🎯 Funcionalidades Implementadas

### 1. Formulário Completo de Política

**Rota**: `/dashboard/investidores/politicas/nova`

Página para criar políticas de distribuição com:
- ✅ Seleção de projeto e investidor
- ✅ Configuração de percentual (0-100%)
- ✅ Tipo de distribuição (Proporcional/Fixo)
- ✅ Datas de início e término
- ✅ Switch para ativar/desativar
- ✅ Campo de observações
- ✅ Validações em tempo real
- ✅ Preview de resumo do projeto

### 2. Resumo em Tempo Real

Mostra informações do projeto selecionado:
- ✅ Total de políticas ativas
- ✅ Percentual já distribuído
- ✅ Percentual disponível
- ✅ Lista de investidores com políticas ativas
- ✅ Cálculo automático do total após adicionar nova política
- ✅ Indicador visual de percentual restante

### 3. Validações Inteligentes

Sistema de validações conforme documentação da API:
- ✅ Projeto e investidor obrigatórios
- ✅ Percentual entre 0 e 100
- ✅ Data de início obrigatória
- ✅ Validação de soma não exceder 100%
- ✅ Feedback visual com cores (verde/vermelho)
- ✅ Mensagens de erro detalhadas

## 📁 Arquivo Criado

### `/app/dashboard/investidores/politicas/nova/page.tsx` (~710 linhas)

#### Estrutura do Componente

```typescript
export default function NovaPoliticaPage() {
  // States principais
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [investors, setInvestors] = useState<InvestorListItem[]>([])
  const [projectSummary, setProjectSummary] = useState<PoliciesByProjectResponse | null>(null)
  
  // Form data
  const [formData, setFormData] = useState<CreateDistributionPolicyDto>({
    projectId: "",
    investorId: "",
    percentage: 0,
    type: "PROPORCIONAL",
    active: true,
    startDate: new Date().toISOString().split("T")[0],
    endDate: undefined,
    notes: "",
  })
  
  // Lifecycle
  useEffect(() => loadSelectedCompany(), [])
  useEffect(() => {
    if (selectedCompany) {
      loadProjects()
      loadInvestors()
    }
  }, [selectedCompany])
  useEffect(() => {
    if (selectedCompany && formData.projectId) {
      loadProjectSummary()
    }
  }, [selectedCompany, formData.projectId])
  
  // Functions
  loadProjects()        // Carrega lista de projetos
  loadInvestors()       // Carrega lista de investidores
  loadProjectSummary()  // Carrega resumo do projeto selecionado
  handleSubmit()        // Valida e cria política
  getRemainingPercentage() // Calcula percentual restante
  getTotalWithNew()     // Calcula total com nova política
}
```

## 🎨 Interface

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ ← Voltar                                                        │
│ Nova Política de Distribuição                                  │
│ Configure regras automáticas de distribuição de valores        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─────────────────────────┬─────────────────┐                 │
│ │ FORMULÁRIO (2 cols)     │ SIDEBAR (1 col) │                 │
│ │                         │                 │                 │
│ │ 📋 Informações Básicas  │ 📊 Resumo       │                 │
│ │ - Projeto              │ - Percentual    │                 │
│ │ - Investidor           │ - Tipo          │                 │
│ │                         │ - Status        │                 │
│ │ 🎯 [Alert: Resumo]      │ - Total após    │                 │
│ │ - Políticas ativas      │ - Restante      │                 │
│ │ - % distribuído         │                 │                 │
│ │ - % disponível          │ ℹ️ Informações   │                 │
│ │ - Lista investidores    │ - Regras        │                 │
│ │                         │ - Validações    │                 │
│ │ ⚙️ Configuração         │                 │                 │
│ │ - Percentual           │ 🎯 Ações        │                 │
│ │ - Tipo                 │ - Salvar        │                 │
│ │ - Data início          │ - Cancelar      │                 │
│ │ - Data término         │                 │                 │
│ │ - Switch ativa         │                 │                 │
│ │                         │                 │                 │
│ │ 📝 Observações          │                 │                 │
│ │ - Notas                │                 │                 │
│ └─────────────────────────┴─────────────────┘                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Cards do Formulário

#### 1. Informações Básicas
```tsx
<Card>
  <CardHeader>
    <CardTitle>Informações Básicas</CardTitle>
  </CardHeader>
  <CardContent>
    <Select projectId />  // Lista de projetos
    <Select investorId /> // Lista de investidores
  </CardContent>
</Card>
```

#### 2. Alert de Resumo do Projeto (aparece quando projeto selecionado)
```tsx
<Alert>
  <Calculator icon />
  <AlertTitle>Políticas Ativas no Projeto</AlertTitle>
  <AlertDescription>
    • Total de políticas ativas: 3
    • Percentual distribuído: 75.00%
    • Percentual disponível: 25.00%
    
    Investidores com políticas ativas:
    • João Silva Santos - 40.00%
    • Tech Solutions Ltda - 35.00%
  </AlertDescription>
</Alert>
```

#### 3. Configuração da Política
```tsx
<Card>
  <CardHeader>
    <CardTitle>Configuração da Política</CardTitle>
  </CardHeader>
  <CardContent>
    <Input percentage />      // 0-100
    <Select type />           // PROPORCIONAL/FIXO
    <Input startDate />       // Date picker
    <Input endDate />         // Date picker (opcional)
    <Switch active />         // Ativa/Inativa
  </CardContent>
</Card>
```

#### 4. Observações
```tsx
<Card>
  <CardHeader>
    <CardTitle>Observações</CardTitle>
  </CardHeader>
  <CardContent>
    <Textarea notes />  // Campo opcional
  </CardContent>
</Card>
```

### Sidebar

#### 1. Card de Resumo
```tsx
<Card>
  <CardHeader>
    <CardTitle>Resumo</CardTitle>
  </CardHeader>
  <CardContent>
    • Percentual: 25.00%
    • Tipo: Proporcional
    • Status: Ativa
    ---
    • Total após adicionar: 100.00%
    • Restante após adicionar: 0.00% (verde/vermelho)
  </CardContent>
</Card>
```

#### 2. Card de Informações
```tsx
<Card>
  <CardHeader>
    <CardTitle>
      <Info icon /> Informações
    </CardTitle>
  </CardHeader>
  <CardContent>
    • Investidor não pode ter outra política ativa no mesmo projeto
    • Soma dos percentuais ativos não pode exceder 100%
    • Políticas ativas são usadas para cálculos automáticos
    • Você pode desativar sem excluir
  </CardContent>
</Card>
```

#### 3. Card de Ações
```tsx
<Card>
  <CardHeader>
    <CardTitle>Ações</CardTitle>
  </CardHeader>
  <CardContent>
    <Button type="submit">Salvar Política</Button>
    <Button variant="outline">Cancelar</Button>
  </CardContent>
</Card>
```

## 🔄 Fluxo de Uso

### Fluxo Completo de Criação

```
1. Usuário acessa /dashboard/investidores/politicas/nova
   └── loadSelectedCompany()
       └── authApi.getSelectedCompany()

2. Company carregada
   └── loadProjects()
       └── projectsApi.getAll(companyId)
   └── loadInvestors()
       └── investorsApi.getAll(companyId)

3. Usuário seleciona projeto
   └── formData.projectId atualizado
   └── useEffect dispara loadProjectSummary()
       └── distributionPoliciesApi.getByProject(companyId, projectId)
           └── Exibe alert com resumo:
               ├── Total de políticas ativas
               ├── Percentual distribuído
               ├── Percentual disponível
               └── Lista de investidores

4. Usuário preenche formulário
   ├── Seleciona investidor
   ├── Define percentual (ex: 25%)
   ├── Seleciona tipo (PROPORCIONAL)
   ├── Define data de início
   └── Mantém status "Ativa"

5. Sidebar atualiza em tempo real
   ├── Percentual: 25.00%
   ├── Total após adicionar: 100.00%
   └── Restante: 0.00% (verde se OK, vermelho se exceder)

6. Usuário clica em "Salvar Política"
   └── handleSubmit()
       ├── Validações:
       │   ├── Projeto selecionado?
       │   ├── Investidor selecionado?
       │   ├── Percentual entre 0-100?
       │   ├── Data de início preenchida?
       │   └── Soma não excede 100%?
       │
       ├── distributionPoliciesApi.create(companyId, formData)
       │   └── POST /scp/distribution-policies
       │       └── Headers: X-Company-ID
       │
       ├── Toast de sucesso
       └── router.push("/dashboard/investidores/politicas")

7. Usuário redirecionado para listagem
   └── Nova política aparece na tabela
```

## 📊 API Endpoints Utilizados

### 1. GET /scp/projects
```typescript
projectsApi.getAll(companyId)
Headers: { X-Company-ID: companyId }
Response: ProjectsListResponse { data: [], meta: {} }
```

### 2. GET /scp/investors
```typescript
investorsApi.getAll(companyId)
Headers: { X-Company-ID: companyId }
Response: InvestorsListResponse { data: [], meta: {} }
```

### 3. GET /scp/distribution-policies/by-project/:projectId
```typescript
distributionPoliciesApi.getByProject(companyId, projectId)
Headers: { X-Company-ID: companyId }
Response: {
  project: { id, name, code },
  policies: [{ id, percentage, type, active, investor }],
  summary: {
    totalPolicies: 3,
    totalPercentage: 75.00,
    remainingPercentage: 25.00,
    isComplete: false
  }
}
```

### 4. POST /scp/distribution-policies
```typescript
distributionPoliciesApi.create(companyId, {
  projectId: "uuid",
  investorId: "uuid",
  percentage: 25.00,
  type: "PROPORCIONAL",
  active: true,
  startDate: "2024-01-01",
  endDate: null,
  notes: "..."
})
Headers: { X-Company-ID: companyId }
Response: DistributionPolicy { id, ...allFields }
```

## ✅ Validações Implementadas

### Validações de Frontend

1. **Empresa Selecionada**:
   - Se não houver, mostra tela de aviso
   - Não carrega dados

2. **Campos Obrigatórios**:
   ```typescript
   ✅ projectId: obrigatório
   ✅ investorId: obrigatório
   ✅ percentage: obrigatório, 0 < % <= 100
   ✅ startDate: obrigatório
   ```

3. **Validação de Percentual**:
   ```typescript
   if (percentage <= 0 || percentage > 100) {
     toast.error("Informe um percentual entre 0 e 100")
     return
   }
   ```

4. **Validação de Soma**:
   ```typescript
   if (projectSummary) {
     const totalWithNew = projectSummary.summary.totalPercentage + percentage
     if (totalWithNew > 100) {
       toast.error(
         `A soma dos percentuais (${totalWithNew}%) excederia 100%. 
          Restante disponível: ${remainingPercentage}%`
       )
       return
     }
   }
   ```

### Validações do Backend (documentadas)

1. **Projeto e Investidor**:
   - Devem existir
   - Devem pertencer à mesma empresa
   - Response: 404 Not Found

2. **Política Duplicada**:
   - Investidor não pode ter outra política ativa no mesmo projeto
   - Response: 400 Bad Request

3. **Soma de Percentuais**:
   - Soma dos percentuais ativos do projeto não pode exceder 100%
   - Response: 400 Bad Request

4. **Percentual Inválido**:
   - Deve estar entre 0 e 100
   - Response: 400 Bad Request

## 🎯 Funcionalidades Especiais

### 1. Preview em Tempo Real

O sidebar calcula e mostra:
```typescript
getRemainingPercentage() {
  if (!projectSummary) return 100
  return max(0, projectSummary.summary.remainingPercentage - percentage)
}

getTotalWithNew() {
  if (!projectSummary) return percentage
  return projectSummary.summary.totalPercentage + percentage
}
```

**Cores Dinâmicas**:
- Verde: Se restante >= 0
- Vermelho: Se restante < 0 (excede 100%)

### 2. Alert Inteligente de Resumo

Só aparece quando:
- ✅ Projeto está selecionado
- ✅ projectSummary foi carregado com sucesso
- ✅ Há dados para exibir

Mostra:
- Total de políticas ativas
- Percentual já distribuído
- Percentual disponível
- Lista de investidores com suas políticas

### 3. Loading States

```typescript
• loadingProjects: Spinner no select de projetos
• loadingInvestors: Spinner no select de investidores
• loadingProjectSummary: Loading silencioso do resumo
• isSaving: Desabilita botão e mostra "Salvando..."
```

### 4. Campos Opcionais

```typescript
• endDate: Pode ser undefined (política sem data de término)
• notes: Pode ser vazio (observações opcionais)
```

Sistema envia `undefined` se campos opcionais estiverem vazios.

## 🎨 UX/UI Features

### 1. Feedback Visual

- ✅ Badges coloridos para status (Ativa/Inativa)
- ✅ Alert com ícone Calculator para resumo
- ✅ Cores dinâmicas (verde/vermelho) para percentuais
- ✅ Formatação de percentuais (25.00%)
- ✅ Toast de sucesso/erro
- ✅ Loading spinners

### 2. Informações Contextuais

- ✅ Descrições em todos os campos
- ✅ Placeholders informativos
- ✅ Card de "Informações" com regras
- ✅ Alert de resumo do projeto
- ✅ Preview do total e restante

### 3. Layout Responsivo

- ✅ 2 colunas + 1 sidebar em desktop
- ✅ Empilhamento vertical em mobile
- ✅ Grid adaptativo nos campos

### 4. Navegação

- ✅ Botão "Voltar" para listagem
- ✅ Botão "Cancelar" no sidebar
- ✅ Redirecionamento automático após salvar

## 🚀 Melhorias Futuras Possíveis

### 1. Preview de Distribuição

Adicionar botão "Calcular Preview" que:
- Solicita valor base
- Chama `/calculate-amounts/:projectId`
- Mostra quanto cada investidor receberia
- Inclui a nova política no cálculo

### 2. Validação Assíncrona

Verificar em tempo real:
- Se investidor já tem política ativa no projeto
- Se soma excederia 100%
- Feedback imediato sem esperar submit

### 3. Histórico de Políticas

Mostrar no alert:
- Políticas inativas do projeto
- Histórico de alterações
- Timeline de políticas

### 4. Duplicar Política

Botão para:
- Copiar política de outro investidor
- Ajustar apenas o investidor e percentual
- Economizar tempo em políticas similares

### 5. Templates

Criar templates de políticas:
- Ex: "Distribuir igualmente entre 4 investidores" (25% cada)
- Ex: "Distribuição majoritária" (51% + 49%)
- Aplicar template com 1 clique

### 6. Validação de Conflitos

Avisar se:
- Investidor tem política em outro projeto
- Datas se sobrepõem
- Sugerir ajustes

## 📊 Estatísticas

### Página Criada
- **Arquivo**: `/app/dashboard/investidores/politicas/nova/page.tsx`
- **Linhas**: ~710 linhas
- **Imports**: 18
- **States**: 8
- **useEffects**: 3
- **Functions**: 7
- **Cards**: 6 (4 formulário + 2 sidebar)

### API Integration
- **Endpoints Usados**: 4
  1. GET /scp/projects
  2. GET /scp/investors
  3. GET /scp/distribution-policies/by-project/:id
  4. POST /scp/distribution-policies
- **Validações**: 5 no frontend + 4 no backend
- **Headers**: X-Company-ID em todas requests

### Features Implementados
- ✅ Formulário completo
- ✅ Validações inteligentes
- ✅ Preview em tempo real
- ✅ Alert de resumo do projeto
- ✅ Cálculos automáticos
- ✅ Feedback visual
- ✅ Loading states
- ✅ Layout responsivo
- ✅ Integração completa com API

## ✅ Status

**✅ IMPLEMENTADO E FUNCIONAL**

Página de criação de políticas de distribuição 100% conectada à API com:
- ✅ Formulário completo e validado
- ✅ Preview em tempo real do percentual
- ✅ Alert inteligente com resumo do projeto
- ✅ Validações conforme documentação da API
- ✅ Feedback visual e UX polida
- ✅ Zero erros de compilação

Sistema pronto para uso em produção! 🚀
