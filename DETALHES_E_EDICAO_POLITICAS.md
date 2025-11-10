# Telas de Detalhes e Edição de Políticas de Distribuição

## 📋 Visão Geral

Implementação completa das páginas de visualização detalhada e edição de políticas de distribuição, com navegação integrada e validações conforme API.

## 🎯 Funcionalidades Implementadas

### 1. Página de Detalhes

**Rota**: `/dashboard/investidores/politicas/[id]`

Visualização completa da política com:
- ✅ Cards de estatísticas (Percentual, Status, Tipo, Data)
- ✅ Informações do Projeto
- ✅ Informações do Investidor
- ✅ Detalhes completos da política
- ✅ Informações do sistema (criação, atualização)
- ✅ Ações (Editar, Excluir)
- ✅ Dialog de confirmação para exclusão
- ✅ Recomendação de desativar ao invés de excluir

### 2. Página de Edição

**Rota**: `/dashboard/investidores/politicas/[id]/editar`

Edição de campos permitidos:
- ✅ Percentual (validado 0-100)
- ✅ Data de término (opcional)
- ✅ Status ativo/inativo (switch)
- ✅ Observações
- ✅ Preview em tempo real no sidebar
- ✅ Avisos sobre regras de negócio
- ✅ Campos não editáveis mostrados (projeto, investidor, tipo, data início)

## 📁 Arquivos Criados

### 1. `/app/dashboard/investidores/politicas/[id]/page.tsx` (~560 linhas)

#### Estrutura do Componente

```typescript
export default function DetalhesPoliticaPage() {
  // States
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [policy, setPolicy] = useState<DistributionPolicyDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  
  // Lifecycle
  useEffect(() => loadSelectedCompany(), [])
  useEffect(() => {
    if (selectedCompany && params.id) {
      loadPolicy()
    }
  }, [selectedCompany, params.id])
  
  // Functions
  loadPolicy()      // Carrega dados da política
  handleDelete()    // Exclui política com confirmação
  getStatusIcon()   // Ícone baseado no status (ativo/inativo)
}
```

#### Layout da Página de Detalhes

```
┌─────────────────────────────────────────────────────────────┐
│ ← Voltar                          [Editar] [Excluir]        │
│ Detalhes da Política ✓                                       │
│ Informações completas da política de distribuição          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌──────────┬──────────┬──────────┬──────────┐              │
│ │ % 25.00% │ ✓ Ativa  │ Propor-  │ 01/01/24 │              │
│ │ Percentual│ Status   │ cional   │ Início   │              │
│ └──────────┴──────────┴──────────┴──────────┘              │
│                                                             │
│ 📋 Projeto                                                  │
│ ├─ Nome: Solar ABC                                          │
│ └─ Código: SOLAR-001                                        │
│                                                             │
│ 👤 Investidor                                               │
│ ├─ Nome: João Silva Santos                                  │
│ ├─ Tipo: Pessoa Física                                      │
│ └─ CPF: 123.456.789-00                                      │
│                                                             │
│ 📊 Detalhes da Política                                     │
│ ├─ Percentual: 25.00%                                       │
│ ├─ Tipo: Proporcional                                       │
│ ├─ Data Início: 01/01/2024                                  │
│ ├─ Data Término: Sem data de término                        │
│ ├─ Status: Ativa ✓                                          │
│ └─ Observações: ...                                         │
│                                                             │
│ ⚙️ Informações do Sistema                                   │
│ ├─ Criado em: 10/11/2024 10:00:00                          │
│ ├─ Última atualização: 10/11/2024 10:00:00                 │
│ └─ ID: uuid...                                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Cards de Estatísticas

**1. Percentual**
```tsx
<Card>
  <CardHeader>
    <Percent icon />
    Percentual
  </CardHeader>
  <CardContent>
    25.00%
    Do valor a distribuir
  </CardContent>
</Card>
```

**2. Status**
```tsx
<Card>
  <CardHeader>
    <CheckCircle2 icon (verde) / XCircle icon (cinza) />
    Status
  </CardHeader>
  <CardContent>
    Ativa / Inativa
    Usada em cálculos / Não usada
  </CardContent>
</Card>
```

**3. Tipo**
```tsx
<Card>
  <CardHeader>
    <FileText icon />
    Tipo
  </CardHeader>
  <CardContent>
    Proporcional / Fixo
    Método de cálculo
  </CardContent>
</Card>
```

**4. Data Início**
```tsx
<Card>
  <CardHeader>
    <Calendar icon />
    Data Início
  </CardHeader>
  <CardContent>
    01/01/2024
    Início da vigência
  </CardContent>
</Card>
```

#### Dialog de Exclusão

```tsx
<AlertDialog>
  <AlertDialogTrigger>
    <Button variant="destructive">
      <Trash2 /> Excluir
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
      <AlertDialogDescription>
        Tem certeza que deseja excluir esta política?
        Esta ação não pode ser desfeita.
        
        Recomendação: Considere desativar ao invés de excluir
        para manter o histórico.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>
        Excluir
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### 2. `/app/dashboard/investidores/politicas/[id]/editar/page.tsx` (~570 linhas)

#### Estrutura do Componente

```typescript
export default function EditarPoliticaPage() {
  // States
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [policy, setPolicy] = useState<DistributionPolicyDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // Form data (campos editáveis)
  const [formData, setFormData] = useState<UpdateDistributionPolicyDto>({
    percentage: 0,
    active: true,
    endDate: undefined,
    notes: "",
  })
  
  // Lifecycle
  useEffect(() => loadSelectedCompany(), [])
  useEffect(() => {
    if (selectedCompany && params.id) {
      loadPolicy()
    }
  }, [selectedCompany, params.id])
  
  // Functions
  loadPolicy()      // Carrega dados e preenche formulário
  handleSubmit()    // Valida e atualiza política
  handleChange()    // Atualiza campo do formulário
}
```

#### Layout da Página de Edição

```
┌─────────────────────────────────────────────────────────────┐
│ ← Voltar                                                    │
│ Editar Política de Distribuição                            │
│ Atualize as configurações da política                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌────────────────────────┬──────────────┐                  │
│ │ FORMULÁRIO (2 cols)    │ SIDEBAR      │                  │
│ │                        │              │                  │
│ │ 📋 Informações         │ 📊 Resumo    │                  │
│ │    (não editáveis)     │ - % 25.00%   │                  │
│ │ • Projeto: Solar ABC   │ - Ativa ✓    │                  │
│ │ • Investidor: João     │ - Término    │                  │
│ │ • Tipo: Proporcional   │              │                  │
│ │ • Início: 01/01/24     │ ℹ️ Avisos     │                  │
│ │                        │ - Regras     │                  │
│ │ ⚙️ Campos Editáveis    │              │                  │
│ │ • Percentual: [25.00]  │ 🎯 Ações     │                  │
│ │ • Data término: [...]  │ - Salvar     │                  │
│ │ • [✓] Ativa           │ - Cancelar   │                  │
│ │                        │              │                  │
│ │ 📝 Observações         │              │                  │
│ │ [textarea]             │              │                  │
│ └────────────────────────┴──────────────┘                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Campos da Edição

**Campos NÃO Editáveis** (mostrados como informação):
- Projeto (nome e código)
- Investidor (nome e tipo)
- Tipo de distribuição (Proporcional/Fixo)
- Data de início

**Campos Editáveis**:
- ✅ Percentual (0-100)
- ✅ Data de término (opcional)
- ✅ Status ativo/inativo (switch)
- ✅ Observações (textarea)

#### Sidebar da Edição

**Card: Resumo**
```tsx
<Card>
  <CardHeader>Resumo</CardHeader>
  <CardContent>
    • Percentual Atual: 25.00%
    • Status: Ativa (badge)
    • Data de Término: 31/12/2024
  </CardContent>
</Card>
```

**Card: Avisos**
```tsx
<Card>
  <CardHeader>
    <Info icon /> Avisos
  </CardHeader>
  <CardContent>
    • Projeto e investidor não podem ser alterados
    • Soma total do projeto não pode exceder 100%
    • Desative ao invés de excluir para manter histórico
    • Políticas ativas são usadas em cálculos automáticos
  </CardContent>
</Card>
```

**Card: Ações**
```tsx
<Card>
  <CardHeader>Ações</CardHeader>
  <CardContent>
    <Button type="submit">Salvar Alterações</Button>
    <Button variant="outline">Cancelar</Button>
  </CardContent>
</Card>
```

## 🔄 Fluxos de Uso

### Fluxo 1: Visualizar Detalhes

```
1. Usuário clica em política na listagem
2. Navegação para /dashboard/investidores/politicas/[id]
3. Sistema carrega:
   └── GET /scp/distribution-policies/:id
4. Página renderizada com:
   ├── 4 cards de estatísticas
   ├── Informações do projeto
   ├── Informações do investidor
   ├── Detalhes da política
   └── Informações do sistema
5. Ações disponíveis:
   ├── Editar → /politicas/[id]/editar
   └── Excluir → Dialog de confirmação
```

### Fluxo 2: Editar Política

```
1. Usuário clica em "Editar" na página de detalhes
2. Navegação para /dashboard/investidores/politicas/[id]/editar
3. Sistema carrega política:
   └── GET /scp/distribution-policies/:id
4. Formulário preenchido com dados atuais
5. Campos não editáveis mostrados como info
6. Usuário edita campos permitidos:
   ├── Percentual (ex: 25% → 30%)
   ├── Data término (adiciona/remove)
   ├── Status (Ativa → Inativa)
   └── Observações
7. Sidebar atualiza preview em tempo real
8. Usuário clica em "Salvar Alterações"
9. Sistema valida:
   ├── Percentual entre 0-100?
   └── Outros campos opcionais OK
10. Sistema atualiza:
    └── PUT /scp/distribution-policies/:id
11. Toast de sucesso
12. Redirecionamento para página de detalhes
```

### Fluxo 3: Excluir Política

```
1. Usuário na página de detalhes
2. Clica em "Excluir"
3. Dialog de confirmação abre
4. Mensagem de aviso:
   "Tem certeza? Ação irreversível.
    Recomendação: Desative ao invés de excluir"
5. Usuário pode:
   ├── Cancelar → Dialog fecha
   └── Confirmar excluir
6. Sistema exclui:
   └── DELETE /scp/distribution-policies/:id
7. Toast de sucesso
8. Redirecionamento para listagem
```

## 📊 API Endpoints Utilizados

### Página de Detalhes

**GET /scp/distribution-policies/:id**
```typescript
distributionPoliciesApi.getById(companyId, policyId)
Headers: { X-Company-ID: companyId }
Response: DistributionPolicyDetails {
  id, companyId, projectId, investorId,
  percentage, type, active,
  startDate, endDate, notes,
  createdAt, updatedAt,
  project: { id, name, code },
  investor: { id, type, fullName, companyName, cpf, cnpj }
}
```

**DELETE /scp/distribution-policies/:id**
```typescript
distributionPoliciesApi.delete(companyId, policyId)
Headers: { X-Company-ID: companyId }
Response: { message: "Política excluída com sucesso" }
```

### Página de Edição

**GET /scp/distribution-policies/:id**
```typescript
// Mesmo endpoint de detalhes para carregar dados
distributionPoliciesApi.getById(companyId, policyId)
```

**PUT /scp/distribution-policies/:id**
```typescript
distributionPoliciesApi.update(companyId, policyId, {
  percentage: 30.00,
  active: false,
  endDate: "2024-12-31",
  notes: "Atualizado conforme novo acordo"
})
Headers: { X-Company-ID: companyId }
Response: DistributionPolicyDetails (atualizada)
```

## ✅ Validações Implementadas

### Página de Detalhes

1. **Empresa Selecionada**:
   - Se não houver, mostra tela de aviso
   - Não carrega dados

2. **ID da Política**:
   - Validado via params.id
   - Se falhar, mostra erro e redireciona

3. **Loading States**:
   - Spinner durante carregamento
   - Desabilita botões durante operações

4. **Confirmação de Exclusão**:
   - Dialog obrigatório
   - Mensagem de aviso
   - Recomendação de desativar

### Página de Edição

1. **Validação de Percentual**:
   ```typescript
   if (!percentage || percentage <= 0 || percentage > 100) {
     toast.error("Informe um percentual entre 0 e 100")
     return
   }
   ```

2. **Campos Não Editáveis**:
   - Projeto: mostrado como info, não editável
   - Investidor: mostrado como info, não editável
   - Tipo: mostrado como info, não editável
   - Data início: mostrado como info, não editável

3. **Campos Opcionais**:
   - endDate: pode ser undefined
   - notes: pode ser vazio

4. **Backend Validation** (documentado):
   - Se percentual mudar, valida soma total do projeto ≤ 100%
   - Response: 400 Bad Request se exceder

## 🎨 Features Especiais

### 1. Ícones Dinâmicos de Status

```typescript
const getStatusIcon = (active: boolean) => {
  return active ? (
    <CheckCircle2 className="h-5 w-5 text-green-600" />
  ) : (
    <XCircle className="h-5 w-5 text-gray-400" />
  )
}
```

Usado em:
- Header da página (ao lado do título)
- Card de status
- Detalhes da política

### 2. Badges Coloridos

```typescript
// Status
<Badge variant={active ? "default" : "secondary"}>
  {active ? "Ativa" : "Inativa"}
</Badge>

// Tipo de Pessoa
<Badge variant="outline">
  {type === "PESSOA_FISICA" ? "Pessoa Física" : "Pessoa Jurídica"}
</Badge>
```

### 3. Formatação de Datas

```typescript
// Data simples
distributionPoliciesApi.helpers.formatDate(date)
// Output: "01/01/2024"

// Data e hora completa
new Date(createdAt).toLocaleString("pt-BR")
// Output: "10/11/2024 10:00:00"
```

### 4. Preview em Tempo Real (Edição)

Sidebar atualiza automaticamente quando:
- Percentual muda
- Status muda
- Data de término muda

### 5. Recomendação de Desativar

Em 2 lugares:
1. Dialog de exclusão (detalhes)
2. Card de avisos (edição)

Texto: "Considere desativar ao invés de excluir para manter histórico"

## 🎯 UX/UI Features

### Página de Detalhes

1. **Organização Visual**:
   - ✅ Cards de stats no topo (fácil visualização)
   - ✅ Informações agrupadas logicamente
   - ✅ Ícones para cada seção
   - ✅ Separadores entre seções

2. **Feedback Visual**:
   - ✅ Ícones de status coloridos (verde/cinza)
   - ✅ Badges para informações categóricas
   - ✅ Loading spinner centralizado
   - ✅ Toast de sucesso/erro

3. **Navegação**:
   - ✅ Botão "Voltar" para listagem
   - ✅ Botões de ação no header
   - ✅ Redirecionamento automático após ações

4. **Informações Completas**:
   - ✅ Todas as informações da política
   - ✅ Dados do projeto relacionado
   - ✅ Dados do investidor relacionado
   - ✅ Metadados do sistema

### Página de Edição

1. **Campos Não Editáveis**:
   - ✅ Mostrados com fundo diferente (bg-muted)
   - ✅ Claramente separados dos editáveis
   - ✅ Explicação de por que não podem ser editados

2. **Preview em Tempo Real**:
   - ✅ Sidebar atualiza conforme usuário edita
   - ✅ Percentual formatado
   - ✅ Status com badge colorido
   - ✅ Data formatada

3. **Avisos Contextuais**:
   - ✅ Card de avisos no sidebar
   - ✅ Descrições em campos
   - ✅ Feedback de validação

4. **Layout Responsivo**:
   - ✅ 2 colunas + sidebar em desktop
   - ✅ Empilhamento em mobile
   - ✅ Cards adaptativos

## 🚀 Melhorias Futuras Possíveis

### Página de Detalhes

1. **Histórico de Alterações**:
   - Log de todas as edições
   - Quem editou, quando, o que mudou
   - Timeline visual

2. **Distribuições Relacionadas**:
   - Listar distribuições feitas usando esta política
   - Total distribuído baseado nesta política
   - Link para cada distribuição

3. **Análise de Uso**:
   - Quantas vezes foi usada
   - Valor total distribuído
   - Gráfico de uso ao longo do tempo

4. **Comparação**:
   - Comparar com outras políticas do projeto
   - Ver todas políticas do investidor
   - Análise de percentuais

### Página de Edição

1. **Validação Assíncrona**:
   - Verificar em tempo real se soma excede 100%
   - Mostrar percentual disponível ao editar
   - Feedback imediato

2. **Histórico de Valores**:
   - Mostrar valor anterior vs novo
   - Highlight das mudanças
   - Confirmação de alterações críticas

3. **Duplicar Política**:
   - Botão para criar nova baseada nesta
   - Já com mesmos valores
   - Trocar apenas investidor

4. **Desativar Temporariamente**:
   - Opção "Pausar até [data]"
   - Reativar automaticamente
   - Notificação de reativação

## 📊 Estatísticas

### Página de Detalhes
- **Arquivo**: `/app/dashboard/investidores/politicas/[id]/page.tsx`
- **Linhas**: ~560 linhas
- **Imports**: 15
- **States**: 4
- **Functions**: 3
- **Cards**: 7 (4 stats + 3 info)
- **Endpoints**: 2 (GET, DELETE)

### Página de Edição
- **Arquivo**: `/app/dashboard/investidores/politicas/[id]/editar/page.tsx`
- **Linhas**: ~570 linhas
- **Imports**: 15
- **States**: 5
- **Functions**: 3
- **Cards**: 6 (3 form + 3 sidebar)
- **Endpoints**: 2 (GET, PUT)

### Total
- **Arquivos Criados**: 2
- **Linhas Totais**: ~1130 linhas
- **Endpoints Únicos**: 3 (GET, PUT, DELETE)
- **Features**: 20+
- **Zero Erros de Compilação**: ✅

## ✅ Status

**✅ IMPLEMENTADO E FUNCIONAL**

Ambas páginas implementadas com sucesso:
1. ✅ Página de detalhes completa com todas informações
2. ✅ Página de edição com campos permitidos
3. ✅ Validações conforme documentação da API
4. ✅ Navegação integrada entre páginas
5. ✅ Dialog de confirmação para exclusão
6. ✅ Preview em tempo real na edição
7. ✅ Feedback visual e UX polida
8. ✅ Layout responsivo
9. ✅ Loading states
10. ✅ Tratamento de erros

Sistema completo pronto para uso em produção! 🚀
