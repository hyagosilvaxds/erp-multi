# Dashboard - Estatísticas em Tempo Real

## Visão Geral

Implementação completa do dashboard administrativo com estatísticas consolidadas vindas da API em tempo real.

---

## Endpoint da API

### GET /sales/dashboard/stats

```http
GET /sales/dashboard/stats HTTP/1.1
Authorization: Bearer <token>
x-company-id: <company-uuid>
```

**Resposta:**
- Vendas do mês (atual vs anterior)
- Produtos ativos (atual vs anterior)
- Clientes (atual vs anterior)
- Ticket médio (atual vs anterior)
- 4 vendas recentes confirmadas
- 4 produtos mais vendidos do mês

---

## Implementação

### 1. Interfaces TypeScript (`/lib/api/sales.ts`)

```typescript
export interface DashboardPeriod {
  currentMonth: {
    start: string
    end: string
  }
  previousMonth: {
    start: string
    end: string
  }
}

export interface DashboardMetric {
  current: number
  previous: number
  change: number
  changePercent: string
}

export interface DashboardMetrics {
  sales: DashboardMetric
  products: DashboardMetric
  customers: DashboardMetric
  averageTicket: DashboardMetric
}

export interface DashboardRecentSale {
  id: string
  code: string
  customer: {
    id: string
    name: string
    cpf: string | null
    cnpj: string | null
  }
  totalAmount: number
  installments: number
  paymentMethod: {
    id: string
    name: string
  }
  confirmedAt: string
  status: string
}

export interface DashboardTopProduct {
  product: {
    id: string
    name: string
    sku: string
    salePrice: number
    currentStock: number
  }
  quantitySold: number
  salesCount: number
}

export interface DashboardStats {
  period: DashboardPeriod
  metrics: DashboardMetrics
  recentSales: DashboardRecentSale[]
  topProducts: DashboardTopProduct[]
}
```

### 2. Função da API

```typescript
/**
 * Busca estatísticas consolidadas para o dashboard
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    if (!selectedCompany) {
      throw new Error("Nenhuma empresa selecionada")
    }

    const { data } = await apiClient.get<DashboardStats>("/sales/dashboard/stats", {
      headers: {
        "x-company-id": selectedCompany.id,
      },
    })

    return data
  } catch (error: any) {
    throw error
  }
}
```

**Exportado em:**
```typescript
export const salesApi = {
  // ...outros métodos
  getDashboardStats: getDashboardStats,
}
```

---

### 3. Página do Dashboard (`/app/dashboard/page.tsx`)

#### Estados

```typescript
const [loading, setLoading] = useState(true)
const [stats, setStats] = useState<DashboardStats | null>(null)
```

#### useEffect - Carrega Estatísticas

```typescript
useEffect(() => {
  loadDashboardStats()
}, [])

const loadDashboardStats = async () => {
  try {
    setLoading(true)
    const data = await salesApi.getDashboardStats()
    setStats(data)
  } catch (error: any) {
    toast({
      title: "Erro ao carregar estatísticas",
      description: error.message || "Tente novamente mais tarde.",
      variant: "destructive",
    })
  } finally {
    setLoading(false)
  }
}
```

#### Funções Auxiliares

```typescript
// Formata data relativa (ex: "2h atrás", "15 min atrás")
const getTimeAgo = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return "agora"
  if (diffInMinutes < 60) return `${diffInMinutes} min atrás`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h atrás`
  
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays}d atrás`
}
```

---

## Cards de Métricas

### 4 Cards Principais

```typescript
const dashboardCards = [
  {
    title: "Vendas do Mês",
    value: formatCurrency(stats.metrics.sales.current),
    change: stats.metrics.sales.changePercent,
    changeValue: stats.metrics.sales.change,
    icon: ShoppingCart,
    description: "vs. mês anterior",
  },
  {
    title: "Produtos Ativos",
    value: stats.metrics.products.current.toString(),
    change: stats.metrics.products.changePercent,
    changeValue: stats.metrics.products.change,
    icon: Package,
    description: "vs. mês anterior",
  },
  {
    title: "Clientes",
    value: stats.metrics.customers.current.toString(),
    change: stats.metrics.customers.changePercent,
    changeValue: stats.metrics.customers.change,
    icon: Users,
    description: "vs. mês anterior",
  },
  {
    title: "Ticket Médio",
    value: formatCurrency(stats.metrics.averageTicket.current),
    change: stats.metrics.averageTicket.changePercent,
    changeValue: stats.metrics.averageTicket.change,
    icon: DollarSign,
    description: "vs. mês anterior",
  },
]
```

**Renderização:**
```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {dashboardCards.map((stat) => {
    const Icon = stat.icon
    const isPositive = stat.changeValue >= 0
    
    return (
      <Card key={stat.title}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stat.value}</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className={`flex items-center gap-0.5 font-medium ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {stat.change}
            </span>
            <span>{stat.description}</span>
          </div>
        </CardContent>
      </Card>
    )
  })}
</div>
```

**Features:**
- ✅ Valor atual em destaque
- ✅ Variação percentual com cor dinâmica (verde/vermelho)
- ✅ Ícone de seta para cima/baixo
- ✅ Comparação com mês anterior

---

## Vendas Recentes

### Card com Últimas 4 Vendas

```tsx
<Card className="lg:col-span-2">
  <CardHeader>
    <div className="flex items-center justify-between">
      <div>
        <CardTitle>Vendas Recentes</CardTitle>
        <CardDescription>Últimas vendas confirmadas</CardDescription>
      </div>
      <Button asChild variant="outline" size="sm">
        <Link href="/dashboard/vendas">Ver todas</Link>
      </Button>
    </div>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {stats.recentSales.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Nenhuma venda confirmada ainda
        </p>
      ) : (
        stats.recentSales.map((sale) => (
          <div key={sale.id} className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{sale.customer.name}</p>
                <p className="text-sm text-muted-foreground">
                  {sale.code} • {sale.paymentMethod.name}
                  {sale.installments > 1 && ` • ${sale.installments}x`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-foreground">{formatCurrency(sale.totalAmount)}</p>
              <p className="text-sm text-muted-foreground">{getTimeAgo(sale.confirmedAt)}</p>
            </div>
          </div>
        ))
      )}
    </div>
  </CardContent>
</Card>
```

**Informações Exibidas:**
- Nome do cliente
- Código da venda (VEN-2025-0042)
- Método de pagamento
- Número de parcelas (se > 1)
- Valor total
- Tempo relativo ("2h atrás", "15 min atrás")

**Features:**
- ✅ Estado vazio ("Nenhuma venda confirmada ainda")
- ✅ Limite de 4 vendas mais recentes
- ✅ Botão "Ver todas" para página de vendas
- ✅ Formato de tempo relativo

---

## Produtos em Destaque

### Card com Top 4 Produtos

```tsx
<Card>
  <CardHeader>
    <CardTitle>Produtos em Destaque</CardTitle>
    <CardDescription>Mais vendidos do mês</CardDescription>
  </CardHeader>
  <CardContent className="space-y-6">
    {stats.topProducts.length === 0 ? (
      <p className="text-center text-muted-foreground py-8">
        Nenhum produto vendido ainda
      </p>
    ) : (
      stats.topProducts.map((item, index) => {
        const maxQuantity = Math.max(...stats.topProducts.map(p => p.quantitySold))
        const progressPercentage = (item.quantitySold / maxQuantity) * 100
        
        return (
          <div key={item.product.id} className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <p className="text-sm font-medium text-foreground">{item.product.name}</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.quantitySold} unidades • {item.salesCount} vendas
                </p>
              </div>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )
      })
    )}
  </CardContent>
</Card>
```

**Informações Exibidas:**
- Ranking (1, 2, 3, 4)
- Nome do produto
- Quantidade vendida (unidades)
- Número de vendas
- Progress bar relativo ao produto mais vendido

**Features:**
- ✅ Estado vazio ("Nenhum produto vendido ainda")
- ✅ Ranking visual com círculo numerado
- ✅ Progress bar proporcional
- ✅ Top 4 produtos do mês

---

## Loading States

### Skeleton Loader

```tsx
if (loading) {
  return (
    <DashboardLayout userRole="company">
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </DashboardLayout>
  )
}
```

### Estado de Erro

```tsx
if (!stats) {
  return (
    <DashboardLayout userRole="company">
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Não foi possível carregar as estatísticas</p>
      </div>
    </DashboardLayout>
  )
}
```

---

## Ações Rápidas

Card adicional com botões de acesso rápido:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Ações Rápidas</CardTitle>
    <CardDescription>Acesse rapidamente as funcionalidades mais usadas</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="grid gap-4 md:grid-cols-4">
      <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
        <Link href="/dashboard/vendas/nova">
          <ShoppingCart className="h-6 w-6" />
          <span>Nova Venda</span>
        </Link>
      </Button>
      <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
        <Link href="/dashboard/produtos/novo">
          <Package className="h-6 w-6" />
          <span>Novo Produto</span>
        </Link>
      </Button>
      <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
        <Link href="/dashboard/clientes/novo">
          <Users className="h-6 w-6" />
          <span>Novo Cliente</span>
        </Link>
      </Button>
      <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
        <Link href="/dashboard/relatorios">
          <TrendingUp className="h-6 w-6" />
          <span>Relatórios</span>
        </Link>
      </Button>
    </div>
  </CardContent>
</Card>
```

---

## Estrutura Visual

```
┌─────────────────────────────────────────────────────────┐
│  Dashboard                                              │
│  Bem-vindo de volta! Aqui está o resumo do seu negócio │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────┐│
│  │ Vendas Mês │ │ Produtos   │ │ Clientes   │ │Ticket││
│  │ R$ 125k    │ │    48      │ │    128     │ │R$ 2,5││
│  │ ↑ +27.55%  │ │ ↑ +6.67%   │ │ ↑ +11.30%  │ │↑+13.6││
│  └────────────┘ └────────────┘ └────────────┘ └──────┘│
│                                                         │
│  ┌─────────────────────────────┐ ┌──────────────────┐  │
│  │ Vendas Recentes             │ │ Produtos Destaque│  │
│  │                             │ │                  │  │
│  │ 🛒 João Silva               │ │ 1⃣ Notebook Dell │  │
│  │    VEN-2025-0042            │ │    25 unidades   │  │
│  │    R$ 3.500,00   2h atrás   │ │    ████████████  │  │
│  │                             │ │                  │  │
│  │ 🛒 Maria Santos             │ │ 2⃣ Mouse Logitech│  │
│  │    VEN-2025-0041            │ │    18 unidades   │  │
│  │    R$ 8.500,00   9h atrás   │ │    ██████████    │  │
│  │                             │ │                  │  │
│  │ [Ver todas]                 │ │                  │  │
│  └─────────────────────────────┘ └──────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Ações Rápidas                                   │   │
│  │                                                 │   │
│  │ [🛒 Nova Venda] [📦 Novo Produto]              │   │
│  │ [👥 Novo Cliente] [📊 Relatórios]              │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Dados Reais vs Mock

### Antes (Mock)
```typescript
const stats = [
  {
    title: "Vendas do Mês",
    value: "R$ 45.2k", // ❌ Hardcoded
    change: "+20.1%",   // ❌ Hardcoded
  }
]
```

### Depois (API Real)
```typescript
const [stats, setStats] = useState<DashboardStats | null>(null)

// Carrega da API
const data = await salesApi.getDashboardStats()
setStats(data)

// Usa dados reais
value: formatCurrency(stats.metrics.sales.current) // ✅ Dinâmico
change: stats.metrics.sales.changePercent          // ✅ Dinâmico
```

---

## Cálculos de Métricas

### Backend Calcula:

1. **Vendas do Mês**:
   ```sql
   SUM(totalAmount) WHERE status = 'CONFIRMED' 
   AND confirmedAt BETWEEN currentMonth.start AND currentMonth.end
   ```

2. **Produtos Ativos**:
   ```sql
   COUNT(*) WHERE active = true AND currentStock > 0
   ```

3. **Clientes**:
   ```sql
   COUNT(*) WHERE active = true
   ```

4. **Ticket Médio**:
   ```typescript
   averageTicket = totalSales / numberOfSales
   ```

5. **Variação**:
   ```typescript
   change = ((current - previous) / previous) * 100
   changePercent = `${change > 0 ? '+' : ''}${change.toFixed(2)}%`
   ```

---

## Features Implementadas

- [x] Carrega estatísticas da API em tempo real
- [x] Loading state com spinner
- [x] Tratamento de erro com toast
- [x] 4 cards de métricas com variação
- [x] Cor dinâmica (verde para positivo, vermelho para negativo)
- [x] Seta para cima/baixo baseada na variação
- [x] Vendas recentes (últimas 4 confirmadas)
- [x] Tempo relativo ("2h atrás", "15 min atrás")
- [x] Produtos mais vendidos (top 4 do mês)
- [x] Progress bar proporcional
- [x] Estados vazios ("Nenhuma venda confirmada")
- [x] Botões de ação rápida
- [x] Responsivo (grid adapta-se ao tamanho da tela)
- [x] TypeScript com tipos completos
- [x] Formatação de moeda brasileira
- [x] Header com x-company-id automático

---

## Status

✅ **IMPLEMENTADO E FUNCIONAL**

O dashboard agora exibe dados reais da API em tempo real, com métricas consolidadas, vendas recentes e produtos mais vendidos do mês.
