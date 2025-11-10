# Página de Edição de Aportes e Confirmação Rápida

## 📋 Visão Geral

Implementação da página de edição de aportes e funcionalidade de confirmação rápida diretamente na listagem de aportes.

## 🎯 Funcionalidades Implementadas

### 1. Página de Edição de Aportes

**Rota**: `/dashboard/investidores/aportes/[id]/editar`

Página completa para edição de aportes existentes com:
- ✅ Formulário com todos os campos do aporte
- ✅ Carregamento automático dos dados do aporte
- ✅ Validações de formulário
- ✅ Sidebar com informações resumidas
- ✅ Layout responsivo (2 colunas + 1 sidebar)
- ✅ Integração com API de atualização

### 2. Confirmação Rápida na Listagem

**Local**: `/dashboard/investidores/aportes` (tabela)

Funcionalidade para confirmar aportes pendentes diretamente na listagem:
- ✅ Botão de confirmação verde (CheckCircle2)
- ✅ Aparece apenas para aportes com status PENDENTE
- ✅ Confirmação via dialog antes de executar
- ✅ Atualização automática da listagem após confirmação
- ✅ Toast de feedback (sucesso/erro)

## 📁 Arquivos Criados/Modificados

### 1. Arquivo Criado: `/app/dashboard/investidores/aportes/[id]/editar/page.tsx`

#### Estrutura do Componente

```typescript
export default function EditarAportePage() {
  // States
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [investment, setInvestment] = useState<InvestmentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [investors, setInvestors] = useState<InvestorListItem[]>([])
  const [formData, setFormData] = useState<UpdateInvestmentDto>({...})
  
  // Lifecycle
  useEffect(() => loadSelectedCompany(), [])
  useEffect(() => {
    if (selectedCompany && params.id) {
      loadInvestment()
      loadProjects()
      loadInvestors()
    }
  }, [selectedCompany, params.id])
  
  // Functions
  loadInvestment()    // Carrega dados do aporte e preenche formulário
  loadProjects()      // Carrega lista de projetos
  loadInvestors()     // Carrega lista de investidores
  handleSubmit()      // Valida e salva alterações
}
```

#### Campos Editáveis

**Card: Informações Básicas**
- Projeto (select)
- Investidor (select)

**Card: Detalhes do Aporte**
- Valor (input number)
- Data do Aporte (input date)
- Método de Pagamento (select)
- Status (select: PENDENTE, CONFIRMADO, CANCELADO)
- Número de Referência (input text)
- Número do Documento (input text)

**Card: Observações**
- Notas/Observações (textarea)

**Card: Links de Anexos (Legado)**
- URLs de documentos (array de strings)
- Adicionar/Remover URLs

#### Sidebar

**Card: Informações**
- Valor do Aporte (formatado)
- Status atual
- Método de Pagamento

**Card: Ações**
- Botão "Salvar Alterações" (primary)
- Botão "Cancelar" (outline)

#### Validações

```typescript
✅ Projeto é obrigatório
✅ Investidor é obrigatório
✅ Valor deve ser > 0
✅ Data do aporte é obrigatória
✅ Número de referência é obrigatório
✅ Status é obrigatório
✅ Método de pagamento é obrigatório
```

#### Fluxo de Edição

```
1. Usuário acessa /dashboard/investidores/aportes/[id]/editar
   └── loadSelectedCompany()
       └── authApi.getSelectedCompany()

2. Company carregada
   └── loadInvestment()
       └── investmentsApi.getById(companyId, investmentId)
           └── Preenche formData com dados atuais
   
   └── loadProjects()
       └── projectsApi.getAll(companyId)
   
   └── loadInvestors()
       └── investorsApi.getAll(companyId)

3. Usuário edita campos
   └── handleChange(field, value)
       └── Atualiza formData[field]

4. Usuário clica em "Salvar Alterações"
   └── handleSubmit()
       ├── Validações
       ├── investmentsApi.update(companyId, investmentId, formData)
       ├── Toast de sucesso
       └── router.push("/dashboard/investidores/aportes/[id]")
```

### 2. Arquivo Modificado: `/app/dashboard/investidores/aportes/page.tsx`

#### Imports Adicionados

```typescript
import { CheckCircle2 } from "lucide-react"
```

#### Função Adicionada: `handleConfirm()`

```typescript
const handleConfirm = async (investmentId: string, currentStatus: InvestmentStatus) => {
  if (!selectedCompany?.id) return

  // Se já está confirmado, mostra mensagem
  if (currentStatus === "CONFIRMADO") {
    toast({
      title: "Informação",
      description: "Este aporte já está confirmado",
    })
    return
  }

  if (!confirm("Tem certeza que deseja confirmar este aporte?")) return

  try {
    await investmentsApi.update(selectedCompany.id, investmentId, {
      status: "CONFIRMADO",
    })

    toast({
      title: "Sucesso",
      description: "Aporte confirmado com sucesso",
    })

    loadInvestments()
  } catch (error: any) {
    console.error("Erro ao confirmar aporte:", error)
    toast({
      title: "Erro ao confirmar aporte",
      description: error.response?.data?.message || error.message,
      variant: "destructive",
    })
  }
}
```

#### Botão de Confirmação na Tabela

**Antes:**
```tsx
<div className="flex justify-end gap-2">
  <Link href={`/dashboard/investidores/aportes/${investment.id}`}>
    <Button variant="ghost" size="icon">
      <Eye className="h-4 w-4" />
    </Button>
  </Link>
  <Link href={`/dashboard/investidores/aportes/${investment.id}/editar`}>
    <Button variant="ghost" size="icon">
      <Edit className="h-4 w-4" />
    </Button>
  </Link>
  <Button variant="ghost" size="icon" onClick={() => handleDelete(investment.id)}>
    <Trash2 className="h-4 w-4" />
  </Button>
</div>
```

**Depois:**
```tsx
<div className="flex justify-end gap-2">
  {/* Botão Confirmar - apenas para status PENDENTE */}
  {investment.status === "PENDENTE" && (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => handleConfirm(investment.id, investment.status)}
      title="Confirmar aporte"
    >
      <CheckCircle2 className="h-4 w-4 text-green-600" />
    </Button>
  )}
  <Link href={`/dashboard/investidores/aportes/${investment.id}`}>
    <Button variant="ghost" size="icon" title="Ver detalhes">
      <Eye className="h-4 w-4" />
    </Button>
  </Link>
  <Link href={`/dashboard/investidores/aportes/${investment.id}/editar`}>
    <Button variant="ghost" size="icon" title="Editar">
      <Edit className="h-4 w-4" />
    </Button>
  </Link>
  <Button
    variant="ghost"
    size="icon"
    onClick={() => handleDelete(investment.id)}
    title="Excluir"
  >
    <Trash2 className="h-4 w-4" />
  </Button>
</div>
```

## 🎨 Interface

### Página de Edição

#### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ ← Voltar                                                        │
│ Editar Aporte                                                   │
│ Atualize as informações do aporte                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─────────────────────────┬─────────────────┐                 │
│ │ FORMULÁRIO (2 cols)     │ SIDEBAR (1 col) │                 │
│ │                         │                 │                 │
│ │ 📋 Informações Básicas  │ 📊 Informações  │                 │
│ │ - Projeto              │ - Valor         │                 │
│ │ - Investidor           │ - Status        │                 │
│ │                         │ - Método        │                 │
│ │ 💰 Detalhes do Aporte   │                 │                 │
│ │ - Valor                │ 🎯 Ações        │                 │
│ │ - Data                 │ - Salvar        │                 │
│ │ - Método               │ - Cancelar      │                 │
│ │ - Status               │                 │                 │
│ │ - Nº Referência        │                 │                 │
│ │ - Nº Documento         │                 │                 │
│ │                         │                 │                 │
│ │ 📝 Observações          │                 │                 │
│ │ - Notas                │                 │                 │
│ │                         │                 │                 │
│ │ 📎 Links de Anexos      │                 │                 │
│ │ - URLs                 │                 │                 │
│ └─────────────────────────┴─────────────────┘                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Listagem com Botão de Confirmar

#### Ações por Status

**Status PENDENTE** (4 botões):
```
[✓ Confirmar] [👁 Ver] [✏ Editar] [🗑 Excluir]
  (verde)     (ghost)   (ghost)    (ghost)
```

**Status CONFIRMADO** (3 botões):
```
[👁 Ver] [✏ Editar] [🗑 Excluir]
(ghost)  (ghost)    (ghost)
```

**Status CANCELADO** (3 botões):
```
[👁 Ver] [✏ Editar] [🗑 Excluir]
(ghost)  (ghost)    (ghost)
```

## 🔄 Fluxos de Uso

### Fluxo 1: Editar Aporte Completo

```
1. Usuário clica em "Editar" na listagem
2. Navegação para /dashboard/investidores/aportes/[id]/editar
3. Sistema carrega:
   - Dados do aporte
   - Lista de projetos
   - Lista de investidores
4. Formulário preenchido com dados atuais
5. Usuário edita campos desejados
6. Clica em "Salvar Alterações"
7. Sistema valida e envia PUT request
8. Toast de sucesso
9. Navegação para página de detalhes
```

### Fluxo 2: Confirmar Aporte Rapidamente

```
1. Usuário visualiza listagem de aportes
2. Identifica aporte PENDENTE
3. Clica no botão verde de confirmar (✓)
4. Dialog de confirmação aparece
5. Usuário clica em "OK"
6. Sistema envia PATCH request
   └── { status: "CONFIRMADO" }
7. Toast de sucesso
8. Listagem recarrega automaticamente
9. Botão de confirmar desaparece (status mudou)
10. Stats são recalculados
```

## 📊 API Endpoints Utilizados

### Página de Edição

**1. GET /scp/investments/:id**
```typescript
investmentsApi.getById(companyId, investmentId)
Headers: {
  Authorization: Bearer {token}
  X-Company-ID: {companyId}
}
Response: InvestmentDetails
```

**2. PUT /scp/investments/:id**
```typescript
investmentsApi.update(companyId, investmentId, data)
Headers: {
  Authorization: Bearer {token}
  X-Company-ID: {companyId}
}
Body: UpdateInvestmentDto
```

**3. GET /scp/projects**
```typescript
projectsApi.getAll(companyId)
Headers: {
  Authorization: Bearer {token}
  X-Company-ID: {companyId}
}
Response: ProjectsListResponse
```

**4. GET /scp/investors**
```typescript
investorsApi.getAll(companyId)
Headers: {
  Authorization: Bearer {token}
  X-Company-ID: {companyId}
}
Response: InvestorsListResponse
```

### Confirmação Rápida

**PATCH /scp/investments/:id**
```typescript
investmentsApi.update(companyId, investmentId, { status: "CONFIRMADO" })
Headers: {
  Authorization: Bearer {token}
  X-Company-ID: {companyId}
}
Body: { status: "CONFIRMADO" }
```

## ✅ Validações e Regras de Negócio

### Página de Edição

1. **Empresa Selecionada**:
   - Se não houver empresa selecionada, mostra mensagem
   - Não carrega dados

2. **Carregamento do Aporte**:
   - Se falhar, mostra toast de erro
   - Redireciona para listagem

3. **Validações de Campo**:
   - Projeto: obrigatório
   - Investidor: obrigatório
   - Valor: obrigatório e > 0
   - Data: obrigatória
   - Número de Referência: obrigatório
   - Status: obrigatório
   - Método de Pagamento: obrigatório

4. **Salvamento**:
   - Desabilita botão durante salvamento
   - Mostra "Salvando..." no botão
   - Toast de sucesso/erro
   - Redireciona para detalhes em caso de sucesso

### Confirmação Rápida

1. **Visibilidade do Botão**:
   - Apenas para aportes com status PENDENTE
   - Ícone verde para destaque visual

2. **Confirmação**:
   - Dialog nativo de confirmação
   - Usuário pode cancelar

3. **Validação de Status**:
   - Se já confirmado, mostra toast informativo
   - Não faz requisição desnecessária

4. **Atualização da Interface**:
   - Recarrega listagem após confirmação
   - Stats são recalculados
   - Botão desaparece (status mudou)

## 🎯 UX/UI Improvements

### Página de Edição

1. **Loading States**:
   - ✅ Loading spinner enquanto carrega aporte
   - ✅ "Salvando..." no botão durante submit
   - ✅ Desabilita botão durante salvamento

2. **Feedback Visual**:
   - ✅ Valores formatados na sidebar
   - ✅ Preview do valor em formato de moeda
   - ✅ Status com badge colorido
   - ✅ Toast de sucesso/erro

3. **Navegação**:
   - ✅ Botão "Voltar" para página de detalhes
   - ✅ Botão "Cancelar" no sidebar
   - ✅ Redirecionamento automático após salvar

4. **Layout Responsivo**:
   - ✅ 2 colunas + 1 sidebar em desktop
   - ✅ Empilhamento vertical em mobile
   - ✅ Campos organizados em grids

### Confirmação Rápida

1. **Identificação Visual**:
   - ✅ Ícone CheckCircle2 verde
   - ✅ Título "Confirmar aporte" no hover
   - ✅ Aparece apenas para PENDENTE

2. **Feedback Imediato**:
   - ✅ Dialog de confirmação
   - ✅ Toast de sucesso
   - ✅ Recarregamento automático
   - ✅ Botão desaparece após confirmar

3. **Prevenção de Erros**:
   - ✅ Validação de status antes de confirmar
   - ✅ Mensagem se já confirmado
   - ✅ Confirmação obrigatória

## 🚀 Melhorias Futuras Possíveis

### Página de Edição

1. **Histórico de Alterações**:
   - Log de todas as edições
   - Quem editou, quando, o que mudou

2. **Validação Assíncrona**:
   - Verificar se projeto/investidor existe
   - Validar número de referência único

3. **Auto-Save**:
   - Salvar rascunho automaticamente
   - Recuperar em caso de fechamento acidental

4. **Upload de Documentos**:
   - Permitir upload direto na edição
   - Não apenas URLs

5. **Preview de Mudanças**:
   - Mostrar diff do que mudou
   - Confirmar antes de salvar

### Confirmação Rápida

1. **Confirmação em Lote**:
   - Checkbox para selecionar múltiplos
   - Botão "Confirmar Selecionados"

2. **Confirmação com Observação**:
   - Modal com campo de observação
   - Adicionar nota ao confirmar

3. **Notificação por Email**:
   - Enviar email ao investidor
   - Informar que aporte foi confirmado

4. **Atalho de Teclado**:
   - Pressionar "C" para confirmar
   - Navegar com setas + Enter

5. **Confirmação Automática**:
   - Regra: após X dias
   - Webhook de pagamento confirmado

## 📊 Estatísticas

### Página de Edição
- **Arquivo Criado**: 1 (`/app/dashboard/investidores/aportes/[id]/editar/page.tsx`)
- **Linhas de Código**: ~660 linhas
- **Imports**: 13
- **States**: 8
- **Functions**: 7 (loadSelectedCompany, loadInvestment, loadProjects, loadInvestors, handleChange, handleAddAttachment, handleRemoveAttachment, handleSubmit)
- **Cards**: 6 (Informações Básicas, Detalhes, Observações, Anexos, Informações, Ações)

### Confirmação Rápida
- **Arquivo Modificado**: 1 (`/app/dashboard/investidores/aportes/page.tsx`)
- **Imports Adicionados**: 1 (CheckCircle2)
- **Funções Adicionadas**: 1 (handleConfirm)
- **Linhas Adicionadas**: ~30 linhas
- **Botão Condicional**: Aparece apenas para status PENDENTE

## ✅ Status

**✅ IMPLEMENTADO E FUNCIONAL**

Ambas funcionalidades implementadas com sucesso:
1. ✅ Página de edição completa de aportes
2. ✅ Confirmação rápida na listagem

Sistema pronto para uso em produção! 🚀
