# Módulo de Projetos SCP - Documentação

## Visão Geral

Este documento descreve a implementação completa do módulo de **Projetos SCP** no sistema de investidores, incluindo:
- Listagem de projetos com estatísticas
- Cadastro de novos projetos
- Integração completa com API REST
- Gestão de status e períodos

## Arquivos Criados

### 1. API Client (`/lib/api/projects.ts`)

Cliente completo para comunicação com a API de projetos SCP.

**Principais Features:**
- Types e interfaces TypeScript completas
- Funções CRUD (Create, Read, Update, Delete)
- Função de estatísticas consolidadas
- Helpers para cálculos e formatação

**Tipos Principais:**
```typescript
- ProjectStatus: "ATIVO" | "CONCLUIDO" | "CANCELADO" | "SUSPENSO"
- Project: Interface completa do projeto
- ProjectListItem: Interface resumida para listagem
- ProjectDetails: Interface com relacionamentos (aportes, distribuições, políticas)
- ProjectStats: Estatísticas de um projeto
- ProjectsStatsResponse: Resumo geral de todos os projetos
```

**Funções Disponíveis:**
```typescript
// CRUD
projectsApi.create(companyId, data)
projectsApi.getAll(companyId, params?)
projectsApi.getStats(companyId)
projectsApi.getById(id)
projectsApi.update(id, data)
projectsApi.delete(id)

// Helpers
projectsApi.helpers.getStatusColor(status)
projectsApi.helpers.getStatusLabel(status)
projectsApi.helpers.calculateROI(invested, distributed)
projectsApi.helpers.calculateInvestedPercentage(totalValue, investedValue)
projectsApi.helpers.formatCurrency(value)
```

### 2. Página de Listagem (`/app/dashboard/investidores/projetos/page.tsx`)

Página completamente integrada mostrando todos os projetos.

**Features Implementadas:**
- ✅ Listagem paginada (10 itens por página)
- ✅ Busca por texto (nome, código, descrição)
- ✅ Filtros por status (Ativo, Concluído, Cancelado, Suspenso)
- ✅ Estatísticas em cards (total projetos, investido, distribuído, ROI médio)
- ✅ Progress bar visual do percentual investido
- ✅ Contador de investidores por projeto
- ✅ Loading states e error handling
- ✅ Empty states com mensagens apropriadas
- ✅ Navegação para detalhes do projeto

**Cards de Estatísticas:**
- Total de Projetos
- Total Investido (soma de todos os projetos)
- Total Distribuído (rendimentos pagos)
- ROI Médio (retorno sobre investimento)

**Tabela de Projetos:**
| Coluna | Descrição |
|--------|-----------|
| Código | `code` - Identificação única |
| Nome do Projeto | `name` + data de início |
| Valor Total | `totalValue` - Meta do projeto |
| Investido | `investedValue` - Capital aportado |
| Distribuído | `distributedValue` - Rendimentos pagos |
| Progresso | Barra visual (investido/total) |
| Investidores | Badge com `_count.investments` |
| Status | Badge colorido |
| Ações | Link para detalhes |

### 3. Página de Cadastro (`/app/dashboard/investidores/projetos/novo/page.tsx`)

Formulário completo para cadastro de novos projetos.

**Features Implementadas:**
- ✅ Formulário organizado em seções
- ✅ Validações de campos obrigatórios
- ✅ Validação de valor total (deve ser > 0)
- ✅ Gestão de documentos/anexos
- ✅ Seleção de status
- ✅ Definição de período (início e término)
- ✅ Layout responsivo com sidebar
- ✅ Loading states e feedback visual
- ✅ Integração completa com API

**Seções do Formulário:**

#### 1. Informações Básicas
- **Nome do Projeto** * (obrigatório)
  - Ex: "Empreendimento Solar ABC"
- **Código** * (obrigatório)
  - Ex: "SOLAR-001"
  - Convertido automaticamente para maiúsculas
  - Deve ser único por empresa
- **Valor Total** * (obrigatório)
  - Valor monetário
  - Deve ser maior que zero
- **Descrição**
  - Textarea para detalhes do projeto

#### 2. Período do Projeto
- **Data de Início** * (obrigatório)
  - Data de início do projeto
- **Data de Término**
  - Data prevista de conclusão (opcional)

#### 3. Documentos e Anexos
- Sistema de gerenciamento de links de documentos
- Adicionar múltiplos links
- Remover links individuais
- Validação de URLs
- Empty state quando não há documentos

**Sidebar:**

#### Status do Projeto
- **Status** (seleção)
  - Ativo (padrão)
  - Concluído
  - Cancelado
  - Suspenso
- **☑ Projeto Ativo** (checkbox)

#### Informações
- Card informativo mostrando:
  - Investido: R$ 0,00 (inicial)
  - Distribuído: R$ 0,00 (inicial)
  - Disponível: R$ 0,00 (inicial)
  - Nota: valores atualizados após aportes

#### Ações
- Botão **Salvar Projeto**
- Botão **Cancelar**

**Validações Implementadas:**
```typescript
// Campos obrigatórios
if (!formData.name || !formData.code || !formData.totalValue || !formData.startDate) {
  // Erro
}

// Valor total positivo
if (Number(formData.totalValue) <= 0) {
  // Erro
}

// Código único (validado pelo backend)
```

**Fluxo de Submissão:**
1. Validação dos campos obrigatórios
2. Validação do valor total (> 0)
3. Montagem do payload
4. Envio para API via `projectsApi.create()`
5. Toast de sucesso ou erro
6. Redirecionamento para listagem em caso de sucesso

## Endpoints da API Utilizados

### `POST /scp/projects`
Cria novo projeto.

**Campos Obrigatórios:**
- `name`: Nome do projeto
- `code`: Código único
- `totalValue`: Valor total (> 0)
- `startDate`: Data de início
- `status`: Status do projeto
- `active`: Se está ativo

**Campos Opcionais:**
- `description`: Descrição detalhada
- `endDate`: Data de término prevista
- `attachments`: Array de URLs de documentos

**Validações do Backend:**
- Código único por empresa
- Valor total deve ser positivo

### `GET /scp/projects`
Lista projetos com paginação e filtros.

**Query Params:**
```typescript
{
  page?: number          // Padrão: 1
  limit?: number         // Padrão: 10
  search?: string        // Busca em name, code, description
  status?: ProjectStatus // ATIVO, CONCLUIDO, CANCELADO, SUSPENSO
  active?: boolean       // true ou false
}
```

**Resposta:**
```typescript
{
  data: ProjectListItem[]  // Array de projetos
  meta: {
    total: number          // Total de registros
    page: number           // Página atual
    limit: number          // Itens por página
    totalPages: number     // Total de páginas
  }
}
```

**Campos Retornados por Projeto:**
- Dados básicos (id, name, code, totalValue, etc)
- Valores calculados (investedValue, distributedValue)
- Contadores: `_count.investments`, `_count.distributions`, `_count.distributionPolicies`

### `GET /scp/projects/stats`
Retorna estatísticas consolidadas de todos os projetos.

**Resposta:**
```typescript
{
  projects: ProjectStats[]  // Estatísticas por projeto
  summary: {
    totalProjects: number
    totalInvested: number
    totalDistributed: number
    totalPending: number
    totalAvailable: number
    averageROI: string
  }
}
```

**Por Projeto:**
- projectId, projectName, projectCode
- totalValue, totalInvested, totalDistributed
- pendingDistributions, availableBalance
- roi (percentual)

### `GET /scp/projects/:id`
Busca projeto por ID com detalhes completos.

**Retorna:**
- Todos os campos do projeto
- `investments[]`: Lista de aportes com investidor
- `distributions[]`: Lista de distribuições com investidor
- `distributionPolicies[]`: Políticas de distribuição
- `totals`: Totais consolidados

### `PUT /scp/projects/:id`
Atualiza projeto existente.

**Body:** Mesma estrutura do POST, todos campos opcionais
- Permite atualizar status
- Permite adicionar/remover anexos
- Permite atualizar datas e valores

### `DELETE /scp/projects/:id`
Exclui projeto permanentemente.

**Validações:**
- ❌ NÃO pode ter aportes (investments)
- ❌ NÃO pode ter distribuições

**Recomendação:** Use desativação (`active: false`) ao invés de exclusão.

## UX/UI Features

### Cards de Estatísticas
- **Total de Projetos:** Contador total
- **Total Investido:** Soma de todos os aportes
- **Total Distribuído:** Soma de rendimentos pagos
- **ROI Médio:** Percentual médio de retorno

### Tabela de Projetos
- **Progress Bar:** Visualização do percentual investido
- **Badges:** Status coloridos e contador de investidores
- **Formatação:** Valores em moeda brasileira (R$)
- **Data:** Formato brasileiro (dd/mm/yyyy)

### Loading States
- Skeleton loader enquanto carrega dados
- Spinner no botão durante submissão
- Mensagem "Salvando..." com animação

### Empty States
- Listagem vazia: "Nenhum projeto encontrado"
- Busca sem resultados: "Tente ajustar os filtros"
- Sem anexos: "Nenhum documento adicionado"
- Ícones ilustrativos e botão CTA

### Error Handling
- Toast notifications para erros
- Mensagens amigáveis extraídas da API
- Fallback para mensagens genéricas

### Validação de Empresa
- Verifica se empresa está selecionada
- Mostra mensagem apropriada se não estiver
- Previne requisições sem empresa

### Gestão de Anexos
- Adicionar URLs de documentos
- Visualizar lista de documentos
- Remover documentos individualmente
- Links abrem em nova aba

## Cálculos e Helpers

### ROI (Return on Investment)
```typescript
ROI = (Distribuído / Investido) × 100
```

### Percentual Investido
```typescript
Percentual = (Investido / Valor Total) × 100
```

### Disponível
```typescript
Disponível = Investido - Distribuído - Pendente
```

## Status do Projeto

| Status | Descrição | Badge Color |
|--------|-----------|-------------|
| ATIVO | Projeto em andamento | Verde (default) |
| CONCLUIDO | Projeto finalizado | Cinza (secondary) |
| CANCELADO | Projeto cancelado | Vermelho (destructive) |
| SUSPENSO | Temporariamente suspenso | Outline |

## Próximos Passos

### Páginas a Implementar:
1. **Detalhes do Projeto (`/projetos/[id]/page.tsx`)**
   - Visualização completa dos dados
   - Lista de aportes por investidor
   - Lista de distribuições realizadas
   - Políticas de distribuição ativas
   - Gráficos e métricas
   - Botões de edição e exclusão

2. **Edição do Projeto (`/projetos/[id]/editar/page.tsx`)**
   - Mesma estrutura do cadastro
   - Campos pré-preenchidos
   - Atualização via `PUT /scp/projects/:id`

3. **Dashboard de Projetos**
   - Visão consolidada
   - Gráficos de evolução
   - Top projetos por ROI
   - Projetos por status

### Melhorias Sugeridas:
- [ ] Upload real de arquivos (não apenas URLs)
- [ ] Preview de documentos PDF
- [ ] Galeria de imagens do projeto
- [ ] Timeline de eventos do projeto
- [ ] Comparativo entre projetos
- [ ] Alertas de datas de vencimento
- [ ] Relatórios em PDF/Excel
- [ ] Dashboard com gráficos
- [ ] Mapa de localização dos projetos
- [ ] Integração com calendário

### Integrações Necessárias:
- [ ] Vincular com módulo de Aportes
- [ ] Vincular com módulo de Distribuições
- [ ] Vincular com módulo de Políticas
- [ ] Notificações de marcos do projeto
- [ ] Sincronização com investidores

## Exemplos de Uso

### Criar Projeto
```typescript
const payload = {
  name: "Empreendimento Solar ABC",
  code: "SOLAR-001",
  description: "Projeto de energia solar fotovoltaica com capacidade de 5MW",
  totalValue: 5000000.00,
  startDate: "2024-01-01T00:00:00.000Z",
  endDate: "2025-12-31T23:59:59.999Z",
  status: "ATIVO",
  active: true,
  attachments: ["https://example.com/docs/contrato.pdf"]
}

await projectsApi.create(companyId, payload)
```

### Listar com Filtros
```typescript
const projects = await projectsApi.getAll(companyId, {
  page: 1,
  limit: 10,
  search: "solar",
  status: "ATIVO"
})
```

### Obter Estatísticas
```typescript
const stats = await projectsApi.getStats(companyId)
console.log(stats.summary.totalProjects)
console.log(stats.summary.averageROI)
```

### Calcular ROI
```typescript
const roi = projectsApi.helpers.calculateROI(
  3000000,  // investido
  450000    // distribuído
)
// Retorna: "15.00"
```

## Considerações de Segurança

1. **Autenticação:** Todas as requisições exigem empresa selecionada
2. **Validação:** Backend valida unicidade do código por empresa
3. **Soft Delete:** Recomenda-se desativar ao invés de excluir
4. **Valores Financeiros:** Sempre validar no backend
5. **Anexos:** Validar URLs e tipos de arquivo permitidos

## Performance

- **Paginação:** Máximo de 10 itens por página
- **Debounce:** 500ms na busca para evitar requisições excessivas
- **Lazy Loading:** Stats carregadas separadamente
- **Cálculos:** ROI e percentuais calculados no cliente

## Testes Recomendados

### Testes Funcionais:
- [ ] Cadastro com campos obrigatórios
- [ ] Validação de código duplicado
- [ ] Validação de valor total positivo
- [ ] Adicionar/remover anexos
- [ ] Busca por nome/código
- [ ] Filtros de status
- [ ] Paginação funcionando
- [ ] Estatísticas corretas
- [ ] Progress bar visual
- [ ] Tentativa de exclusão com vínculos

### Testes de Cálculo:
- [ ] ROI calculado corretamente
- [ ] Percentual investido correto
- [ ] Formatação de moeda
- [ ] Progress bar com valores extremos (0%, 100%, >100%)

### Testes de UX:
- [ ] Loading states visíveis
- [ ] Mensagens de erro compreensíveis
- [ ] Formulário responsivo
- [ ] Validação em tempo real
- [ ] Feedback visual de sucesso/erro

## Estrutura de Arquivos

```
app/dashboard/investidores/projetos/
├── page.tsx                    # Listagem de projetos
├── novo/
│   └── page.tsx               # Criar novo projeto
├── [id]/
│   ├── page.tsx               # Detalhes do projeto (a implementar)
│   └── editar/
│       └── page.tsx           # Editar projeto (a implementar)

lib/api/
└── projects.ts                 # API client de projetos
```

---

**Data de Implementação:** 10 de novembro de 2025  
**Versão da API:** v1  
**Status:** ✅ Integração Completa - Listagem e Cadastro

## Integração com Outros Módulos

### Investidores
- Projetos podem ter múltiplos investidores
- Cada investidor pode ter aportes em vários projetos
- Relação many-to-many via tabela de aportes

### Aportes (Investments)
- Aportes são vinculados a um projeto e um investidor
- Somam o valor investido do projeto
- Permitem rastrear quem investiu quanto e quando

### Distribuições
- Distribuições são geradas por projeto
- Distribuídas aos investidores proporcionalmente
- Impactam o ROI do projeto

### Políticas de Distribuição
- Definem como distribuir rendimentos
- Por percentual fixo ou proporcional
- Vinculadas a projeto e investidor

## Métricas e KPIs

O sistema calcula automaticamente:

1. **Por Projeto:**
   - Valor Total
   - Valor Investido
   - Valor Distribuído
   - Pendente de Distribuição
   - Saldo Disponível
   - ROI (%)
   - Número de Investidores

2. **Consolidado:**
   - Total de Projetos
   - Total Investido (todos os projetos)
   - Total Distribuído
   - Total Pendente
   - Total Disponível
   - ROI Médio

Estas métricas são essenciais para:
- Análise de performance
- Decisões de investimento
- Relatórios gerenciais
- Transparência com investidores
