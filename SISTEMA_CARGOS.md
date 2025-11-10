# Sistema de Gerenciamento de Cargos (Positions)

## 📋 Visão Geral

Sistema completo para gerenciar cargos na empresa, incluindo criação, edição, listagem e exclusão de cargos com suas respectivas faixas salariais e informações do CBO.

## 🗂️ Estrutura de Arquivos

```
lib/api/
  └── positions.ts              # API client para cargos

app/dashboard/rh/cargos/
  ├── page.tsx                  # Lista de cargos
  ├── novo/
  │   └── page.tsx              # Criar novo cargo
  └── [id]/
      └── editar/
          └── page.tsx          # Editar cargo
```

## 🔌 API Endpoints

### 1. Listar Cargos
```typescript
GET /positions?active=true
Header: x-company-id

Response: Position[]
```

### 2. Buscar Cargo por ID
```typescript
GET /positions/{id}
Header: x-company-id

Response: Position (com array de employees)
```

### 3. Criar Cargo
```typescript
POST /positions
Header: x-company-id
Body: CreatePositionData

Response: Position
```

### 4. Atualizar Cargo
```typescript
PATCH /positions/{id}
Header: x-company-id
Body: UpdatePositionData

Response: Position
```

### 5. Excluir Cargo
```typescript
DELETE /positions/{id}
Header: x-company-id

Response: void
Erro: 400 se houver colaboradores vinculados
```

## 📊 Interface de Dados

### Position
```typescript
interface Position {
  id: string
  companyId: string
  code: string                    // Código único (ex: DEV-SR)
  name: string                    // Nome do cargo
  description?: string            // Descrição detalhada
  minSalary?: number             // Salário mínimo da faixa
  maxSalary?: number             // Salário máximo da faixa
  cbo?: string                   // Código Brasileiro de Ocupações
  active: boolean                // Status ativo/inativo
  _count?: {
    employees: number            // Quantidade de colaboradores
  }
  employees?: Array<{           // Lista de colaboradores (somente em getById)
    id: string
    name: string
    email: string
    salary: number
    admissionDate: string
    active: boolean
  }>
  createdAt: string
  updatedAt: string
}
```

### CreatePositionData
```typescript
interface CreatePositionData {
  code: string                   // Obrigatório
  name: string                   // Obrigatório
  description?: string
  minSalary?: number
  maxSalary?: number
  cbo?: string
  active?: boolean               // Padrão: true
}
```

### UpdatePositionData
```typescript
interface UpdatePositionData {
  code?: string
  name?: string
  description?: string
  minSalary?: number
  maxSalary?: number
  cbo?: string
  active?: boolean
}
```

## 🎨 Funcionalidades das Páginas

### Lista de Cargos (`/dashboard/rh/cargos`)

**Cards de Estatísticas:**
- Total de cargos
- Cargos ativos
- Total de colaboradores

**Filtros:**
- Busca por nome, código, descrição ou CBO
- Botão limpar filtros

**Tabela:**
- Código (fonte monoespaçada)
- Nome + descrição resumida
- CBO
- Faixa salarial (min/max)
- Quantidade de colaboradores
- Status (badge ativo/inativo)
- Ações: Editar, Excluir

**Empty State:**
- Mensagem quando não há cargos
- Botão "Criar Primeiro Cargo"

**Exclusão:**
- AlertDialog de confirmação
- Aviso se houver colaboradores vinculados
- Erro 400 bloqueando exclusão se houver vínculos

### Criar Cargo (`/dashboard/rh/cargos/novo`)

**Seções do Formulário:**

1. **Dados Básicos:**
   - Código * (único)
   - Nome *
   - Descrição (textarea)

2. **Faixa Salarial:**
   - Salário mínimo (R$)
   - Salário máximo (R$)

3. **CBO:**
   - Código Brasileiro de Ocupações
   - Link informativo

4. **Status:**
   - Switch ativo/inativo
   - Explicação sobre visibilidade

**Validações:**
- Código e nome obrigatórios
- Conversão de valores monetários
- Trim de strings

### Editar Cargo (`/dashboard/rh/cargos/[id]/editar`)

**Recursos Adicionais:**

1. **Badge de Status:**
   - Exibe status atual no header

2. **Card Informativo:**
   - Alerta se houver colaboradores vinculados
   - Aviso sobre impacto das alterações

3. **Lista de Colaboradores:**
   - Card separado mostrando todos os colaboradores
   - Nome, email, salário, status
   - Só aparece se houver colaboradores

4. **Mesmo Formulário:**
   - Todos os campos da criação
   - Pré-preenchidos com dados atuais

## 🎯 Fluxo de Uso

### Criar um Cargo:
1. Acesse `/dashboard/rh/cargos`
2. Clique em "Novo Cargo"
3. Preencha código e nome (obrigatórios)
4. Adicione descrição, faixa salarial e CBO (opcionais)
5. Defina se estará ativo
6. Clique em "Salvar Cargo"

### Editar um Cargo:
1. Na lista, clique no ícone de editar
2. Atualize os campos desejados
3. Veja lista de colaboradores afetados (se houver)
4. Clique em "Salvar Alterações"

### Excluir um Cargo:
1. Na lista, clique no ícone de lixeira
2. Confirme a exclusão no dialog
3. ⚠️ Não é possível excluir se houver colaboradores vinculados
4. Reatribua os colaboradores primeiro

## 🔐 Permissões Necessárias

- `positions.create` - Criar cargos
- `positions.read` - Visualizar cargos
- `positions.update` - Editar cargos
- `positions.delete` - Excluir cargos

## 📝 Notas Importantes

1. **Código Único:**
   - O código deve ser único por empresa
   - Backend valida duplicação

2. **CBO:**
   - Código oficial do Ministério do Trabalho
   - Usado para eSocial e relatórios
   - Formato: ####-##

3. **Faixa Salarial:**
   - Valores opcionais
   - Servem como referência
   - Não impedem salários fora da faixa

4. **Status Ativo/Inativo:**
   - Cargos inativos não aparecem em seleções
   - Colaboradores existentes mantêm o cargo
   - Não é possível ativar/desativar em lote

5. **Exclusão:**
   - Soft delete ou hard delete (depende do backend)
   - Bloqueada se houver colaboradores
   - Precisa reatribuir colaboradores primeiro

## 🚀 Rotas Criadas

```
/dashboard/rh/cargos                    # Lista
/dashboard/rh/cargos/novo              # Criar
/dashboard/rh/cargos/[id]/editar       # Editar
```

## 🎨 Componentes Utilizados

- DashboardLayout
- Card, CardHeader, CardTitle, CardDescription, CardContent
- Button, Input, Label, Textarea
- Badge, Switch
- Table (Header, Body, Row, Cell, Head)
- AlertDialog
- Spinner
- Toast (notificações)

## ✅ Próximos Passos Sugeridos

1. **Adicionar ao Sidebar:**
   - Link para `/dashboard/rh/cargos` no menu RH

2. **Integrar com Colaboradores:**
   - Dropdown de cargos no cadastro de colaborador
   - Usar dados do cargo (faixa salarial) como sugestão

3. **Relatórios:**
   - Distribuição de colaboradores por cargo
   - Média salarial por cargo vs faixa definida
   - Cargos sem colaboradores

4. **Histórico:**
   - Rastrear mudanças de cargo dos colaboradores
   - Auditoria de alterações nos cargos

5. **Importação em Lote:**
   - Upload CSV/Excel de cargos
   - Template para download
