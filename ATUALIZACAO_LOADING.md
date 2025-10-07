# Atualização do Sistema de Loading

## Mudança Realizada

Removido todos os **loading skeletons** e substituído por um **componente de loading simples com spinner**.

## Componente Criado

### `/components/ui/loading.tsx`
```tsx
import { Loader2 } from "lucide-react"

export function Loading({ message = "Carregando..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
```

## Arquivos Atualizados

### Admin
- ✅ `/app/admin/empresas/loading.tsx`
- ✅ `/app/admin/roles/loading.tsx`
- ✅ `/app/admin/usuarios/loading.tsx`

### Portal e Seleção
- ✅ `/app/portal-investidor/loading.tsx`
- ✅ `/app/selecionar-empresa/loading.tsx`

### Dashboard - Documentos
- ✅ `/app/dashboard/documentos/loading.tsx`

### Dashboard - Jurídico
- ✅ `/app/dashboard/juridico/loading.tsx`
- ✅ `/app/dashboard/juridico/contratos/loading.tsx`
- ✅ `/app/dashboard/juridico/processos/loading.tsx`

### Dashboard - Financeiro
- ✅ `/app/dashboard/financeiro/loading.tsx`
- ✅ `/app/dashboard/financeiro/lancamentos/loading.tsx`
- ✅ `/app/dashboard/financeiro/contas/loading.tsx`
- ✅ `/app/dashboard/financeiro/extratos/loading.tsx`
- ✅ `/app/dashboard/financeiro/relatorios/loading.tsx`
- ✅ `/app/dashboard/financeiro/conciliacao/loading.tsx`
- ✅ `/app/dashboard/financeiro/contas-pagar-receber/loading.tsx`

### Dashboard - RH
- ✅ `/app/dashboard/rh/loading.tsx`
- ✅ `/app/dashboard/rh/colaboradores/loading.tsx`
- ✅ `/app/dashboard/rh/proventos-descontos/loading.tsx`

### Dashboard - Outros
- ✅ `/app/dashboard/investidores/loading.tsx`
- ✅ `/app/dashboard/vendas/loading.tsx`
- ✅ `/app/dashboard/relatorios/loading.tsx`

## Padrão de Uso

### Para páginas simples:
```tsx
import { Loading } from "@/components/ui/loading"

export default function LoadingPage() {
  return <Loading message="Carregando..." />
}
```

### Para páginas com DashboardLayout:
```tsx
import { Loading } from "@/components/ui/loading"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function LoadingPage() {
  return (
    <DashboardLayout>
      <Loading message="Carregando..." />
    </DashboardLayout>
  )
}
```

## Benefícios

1. ✅ **Código mais limpo**: Menos linhas de código
2. ✅ **Consistência**: Todos os loadings têm a mesma aparência
3. ✅ **Performance**: Menos componentes para renderizar
4. ✅ **Manutenção**: Um único componente para gerenciar
5. ✅ **UX melhorada**: Feedback visual claro com spinner animado

## Data da Atualização
7 de outubro de 2025
