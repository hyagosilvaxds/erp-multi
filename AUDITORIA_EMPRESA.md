# Funcionalidade: Auditoria de Empresa

## 📋 Descrição

Tela completa para visualização do histórico de auditoria de uma empresa, mostrando todas as ações realizadas com filtros, paginação e detalhes completos de cada alteração.

## 🔧 Implementação

### 1. API Client (`lib/api/auth.ts`)

#### 1.1. Tipos de Auditoria

```typescript
export interface AuditUser {
  id: string
  name: string
  email: string
}

export interface AuditLog {
  id: string
  companyId: string
  userId: string
  user: AuditUser
  action: string
  entityType: string
  fieldName: string | null
  oldValue: any | null
  newValue: any | null
  ipAddress: string | null
  userAgent: string | null
  description: string | null
  createdAt: string
}

export interface AuditResponse {
  data: AuditLog[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
```

#### 1.2. Função da API

```typescript
export const auditApi = {
  /**
   * Busca o histórico de auditoria de uma empresa (Admin only)
   * Requer permissão MANAGE_COMPANIES
   */
  async getCompanyAudit(companyId: string, params?: {
    page?: number
    limit?: number
    action?: string
  }): Promise<AuditResponse> {
    try {
      const queryParams = new URLSearchParams()
      if (params?.page) {
        queryParams.append('page', params.page.toString())
      }
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString())
      }
      if (params?.action) {
        queryParams.append('action', params.action)
      }

      const queryString = queryParams.toString()
      const url = `/audit/company/${companyId}${queryString ? `?${queryString}` : ''}`

      const { data } = await apiClient.get<AuditResponse>(url)
      
      return data
    } catch (error: any) {
      throw error
    }
  },
}
```

**Endpoint:** `GET /audit/company/:id`

**Query Parameters:**
- `page` (number, default: 1) - Número da página
- `limit` (number, default: 50) - Itens por página
- `action` (string, opcional) - Filtrar por tipo de ação

**Ações Disponíveis:**
- `CREATE` - Criação da empresa
- `UPDATE` - Atualização de dados
- `DELETE` - Exclusão da empresa
- `UPLOAD_LOGO` - Upload de logo
- `REMOVE_LOGO` - Remoção de logo
- `UPLOAD_CERTIFICATE` - Upload de certificado A1
- `REMOVE_CERTIFICATE` - Remoção de certificado A1
- `TOGGLE_ACTIVE` - Ativação/desativação

### 2. Página de Auditoria (`app/admin/empresas/[id]/auditoria/page.tsx`)

#### 2.1. Estados

```typescript
const [loading, setLoading] = useState(true)
const [companyName, setCompanyName] = useState("")
const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
const [currentPage, setCurrentPage] = useState(1)
const [totalPages, setTotalPages] = useState(1)
const [total, setTotal] = useState(0)
const [limit] = useState(50)
const [actionFilter, setActionFilter] = useState("all")
```

#### 2.2. Configuração de Ações

```typescript
const actionLabels: Record<string, { 
  label: string
  icon: any
  variant: "default" | "secondary" | "destructive" | "outline"
}> = {
  CREATE: { label: "Criação", icon: PlusCircle, variant: "default" },
  UPDATE: { label: "Atualização", icon: Edit, variant: "secondary" },
  DELETE: { label: "Exclusão", icon: Trash2, variant: "destructive" },
  UPLOAD_LOGO: { label: "Upload Logo", icon: Upload, variant: "outline" },
  REMOVE_LOGO: { label: "Remover Logo", icon: Trash2, variant: "outline" },
  UPLOAD_CERTIFICATE: { label: "Upload Certificado", icon: Upload, variant: "outline" },
  REMOVE_CERTIFICATE: { label: "Remover Certificado", icon: Trash2, variant: "outline" },
  TOGGLE_ACTIVE: { label: "Ativar/Desativar", icon: ToggleLeft, variant: "outline" },
}
```

#### 2.3. Funções Principais

##### Carregar Informações da Empresa

```typescript
const loadCompanyInfo = async () => {
  try {
    const data = await companiesApi.getCompanyById(params.id as string)
    setCompanyName(data.razaoSocial)
  } catch (error: any) {
    console.error('❌ Erro ao carregar empresa:', error)
  }
}
```

##### Carregar Logs de Auditoria

```typescript
const loadAuditLogs = async () => {
  try {
    setLoading(true)
    const response = await auditApi.getCompanyAudit(params.id as string, {
      page: currentPage,
      limit,
      action: actionFilter === "all" ? undefined : actionFilter,
    })

    setAuditLogs(response.data)
    setTotalPages(response.meta.totalPages)
    setTotal(response.meta.total)
  } catch (error: any) {
    // Tratamento de erro com toast
  } finally {
    setLoading(false)
  }
}
```

##### Formatação de Data

```typescript
const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  } catch {
    return dateString
  }
}
```

##### Formatação de Valores

```typescript
const formatValue = (value: any) => {
  if (value === null || value === undefined) return "-"
  if (typeof value === "object") return JSON.stringify(value, null, 2)
  return String(value)
}
```

##### Badge de Ação

```typescript
const getActionBadge = (action: string) => {
  const config = actionLabels[action] || { 
    label: action, 
    icon: FileText, 
    variant: "outline" as const 
  }
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}
```

## 🎨 Interface

### Layout

1. **Header**
   - Botão "Voltar" para detalhes da empresa
   - Ícone de histórico
   - Título "Auditoria"
   - Nome da empresa (subtitle)

2. **Card de Filtros**
   - Select com tipos de ação
   - Contador de registros encontrados

3. **Card de Histórico**
   - Tabela com logs de auditoria
   - Paginação (se necessário)
   - Estado vazio personalizado

### Colunas da Tabela

| Coluna | Descrição | Formato |
|--------|-----------|---------|
| Data/Hora | Timestamp da ação | dd/MM/yyyy às HH:mm |
| Usuário | Nome e email do usuário | Nome (bold) + email (muted) |
| Ação | Tipo de ação | Badge colorido com ícone |
| Campo | Nome do campo alterado | Code style |
| Valor Anterior | Valor antes da alteração | Truncado (max 150px) |
| Valor Novo | Valor após a alteração | Truncado (max 150px) |
| Descrição | Descrição da ação | Texto muted |

### Cores dos Badges

| Ação | Cor | Ícone |
|------|-----|-------|
| CREATE | default (azul) | PlusCircle |
| UPDATE | secondary (cinza) | Edit |
| DELETE | destructive (vermelho) | Trash2 |
| UPLOAD_LOGO | outline | Upload |
| REMOVE_LOGO | outline | Trash2 |
| UPLOAD_CERTIFICATE | outline | Upload |
| REMOVE_CERTIFICATE | outline | Trash2 |
| TOGGLE_ACTIVE | outline | ToggleLeft |

## 🎯 Funcionalidades

### 1. Listagem de Logs
- ✅ Carrega logs de auditoria da empresa
- ✅ Exibe 50 logs por página
- ✅ Atualiza automaticamente ao trocar página
- ✅ Mostra informações completas de cada ação

### 2. Filtros
- ✅ Filtro por tipo de ação
- ✅ Opção "Todas as ações" para limpar filtro
- ✅ Contador de registros encontrados
- ✅ Atualiza lista automaticamente ao filtrar

### 3. Paginação
- ✅ Navegação entre páginas
- ✅ Botões "Anterior" e "Próxima"
- ✅ Indicador de página atual e total
- ✅ Botões desabilitados nos limites
- ✅ Paginação só aparece se houver mais de 1 página

### 4. Formatação de Dados
- ✅ Datas em formato brasileiro (dd/MM/yyyy às HH:mm)
- ✅ Valores JSON formatados
- ✅ Valores nulos exibidos como "-"
- ✅ Truncamento de valores longos

### 5. Estados Visuais
- ✅ Loading spinner durante carregamento
- ✅ Estado vazio personalizado
- ✅ Badges coloridos por tipo de ação
- ✅ Ícones contextuais

## 🔗 Integração

### Navegação

**Na página de detalhes da empresa:**
```tsx
<Button 
  variant="outline"
  onClick={() => router.push(`/admin/empresas/${params.id}/auditoria`)}
>
  <History className="mr-2 h-4 w-4" />
  Auditoria
</Button>
```

**Na página de auditoria (voltar):**
```tsx
<Button
  variant="ghost"
  size="icon"
  onClick={() => router.push(`/admin/empresas/${params.id}`)}
>
  <ArrowLeft className="h-4 w-4" />
</Button>
```

## 🔐 Segurança

### Permissões
- Requer autenticação JWT
- Requer role "admin"
- Requer permissão `MANAGE_COMPANIES`

### Dados Sensíveis
- Senhas e tokens nunca são exibidos
- Valores sensíveis são mascarados
- IP e User-Agent opcionais

## 📱 Responsividade

### Desktop
- Tabela com todas as colunas visíveis
- Layout horizontal otimizado
- Scroll horizontal se necessário

### Mobile
- Tabela responsiva com scroll horizontal
- Botões de paginação compactos
- Filtros em linha única

## 🧪 Casos de Uso

### 1. Ver Histórico Completo
```
1. Acesse detalhes da empresa
2. Clique no botão "Auditoria"
3. ✅ Visualize todos os logs de auditoria
4. ✅ Navegue entre as páginas
```

### 2. Filtrar por Tipo de Ação
```
1. Na página de auditoria
2. Selecione tipo de ação no filtro
3. ✅ Lista atualiza automaticamente
4. ✅ Contador mostra total filtrado
```

### 3. Ver Detalhes de Alteração
```
1. Localize log de UPDATE
2. Veja campo alterado
3. Compare valor anterior e novo
4. ✅ Identifique exatamente o que mudou
```

### 4. Rastrear Usuário Responsável
```
1. Cada log mostra usuário
2. Nome e email exibidos
3. ✅ Identifique quem fez cada ação
```

### 5. Ver Timestamp Exato
```
1. Cada log tem data/hora
2. Formato brasileiro legível
3. ✅ Saiba quando cada ação ocorreu
```

## 📊 Informações Exibidas

### Para cada Log
- ✅ **Data/Hora:** Timestamp formatado em português
- ✅ **Usuário:** Nome e email de quem realizou
- ✅ **Ação:** Badge colorido com tipo de ação
- ✅ **Campo:** Nome do campo alterado (se aplicável)
- ✅ **Valor Anterior:** Estado antes da alteração
- ✅ **Valor Novo:** Estado após a alteração
- ✅ **Descrição:** Texto explicativo da ação

### Metadados
- ✅ **Total de Registros:** Quantidade total de logs
- ✅ **Página Atual:** Indicador de paginação
- ✅ **Total de Páginas:** Para navegação

## 🎨 Estados da Interface

### 1. Carregando
```
┌─────────────────────────────┐
│                             │
│     ⟳ (spinner)            │
│     Carregando...          │
│                             │
└─────────────────────────────┘
```

### 2. Lista com Dados
```
┌─────────────────────────────┐
│ Data/Hora | Usuário | Ação  │
├─────────────────────────────┤
│ 25/10/25  | João   | Update │
│ 24/10/25  | Maria  | Create │
└─────────────────────────────┘
    ← Anterior | Próxima →
```

### 3. Sem Resultados
```
┌─────────────────────────────┐
│                             │
│       📋 (ícone)           │
│  Nenhum registro           │
│  encontrado                │
│                             │
└─────────────────────────────┘
```

## 📝 Observações

### Tipos de Valores
- **Texto:** Exibido diretamente
- **Número:** Convertido para string
- **Objeto:** JSON stringificado
- **Null/Undefined:** Exibido como "-"

### Limitações
- Máximo 50 logs por página
- Valores truncados se muito longos
- Scroll horizontal em telas pequenas

### Melhorias Futuras
- [ ] Exportar logs para CSV/Excel
- [ ] Filtro por período (data início/fim)
- [ ] Filtro por usuário
- [ ] Busca por texto nos valores
- [ ] Modal com detalhes completos do log
- [ ] Comparação visual de valores (diff)
- [ ] Agrupamento por data
- [ ] Timeline visual
