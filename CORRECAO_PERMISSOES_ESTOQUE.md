# ✅ Correção: Permissões nas Páginas de Estoque

## 🐛 Problema Identificado

1. **usePermissions sem parâmetro**: O hook `usePermissions` precisa receber o `userRole` como parâmetro
2. **Módulo errado**: Estava usando `'products'` ao invés de `'produtos'`
3. **Ações erradas**: Estava usando `'update'` ao invés de `'edit'`

## 🔧 Correções Aplicadas

### ❌ Código Anterior (Incorreto)

```tsx
const { can } = usePermissions()  // ❌ Sem parâmetro

const canCreate = can('products', 'create')  // ❌ Módulo errado
const canEdit = can('products', 'update')    // ❌ Ação errada
const canDelete = can('products', 'delete')
```

### ✅ Código Correto

```tsx
const permissions = usePermissions('company')  // ✅ Com userRole

const canCreate = permissions.can('produtos', 'create')  // ✅ Módulo correto
const canEdit = permissions.can('produtos', 'edit')      // ✅ Ação correta
const canDelete = permissions.can('produtos', 'delete')
```

## 📝 Páginas Corrigidas

### 1. ✅ Locais de Estoque
**Arquivo**: `/app/dashboard/produtos/estoque/locais/page.tsx`

```tsx
const permissions = usePermissions('company')

const canCreate = permissions.can('produtos', 'create')
const canEdit = permissions.can('produtos', 'edit')
const canDelete = permissions.can('produtos', 'delete')
```

### 2. ✅ Transferências (Listagem)
**Arquivo**: `/app/dashboard/produtos/estoque/transferencias/page.tsx`

```tsx
const permissions = usePermissions('company')

const canCreate = permissions.can('produtos', 'create')
const canView = permissions.can('produtos', 'view')
```

### 3. ✅ Detalhes da Transferência
**Arquivo**: `/app/dashboard/produtos/estoque/transferencias/[id]/page.tsx`

```tsx
const permissions = usePermissions('company')

const canManage = permissions.can('produtos', 'edit')
```

## 🎯 Permissões Corretas do Sistema

### Módulo: `produtos`
- ✅ `create` - Criar produtos, locais, transferências
- ✅ `view` - Visualizar listagens
- ✅ `edit` - Editar e gerenciar (aprovar, concluir)
- ✅ `delete` - Deletar registros

### ❌ Módulos que NÃO existem
- ❌ `products` (em inglês)
- ❌ Ação `update` (o correto é `edit`)

## 📚 Referência do Hook usePermissions

```tsx
import { usePermissions } from '@/hooks/use-permissions'

// Uso correto
const permissions = usePermissions('company')  // ou 'admin'

// Verificar permissão
const canCreate = permissions.can('produtos', 'create')

// Verificar acesso ao módulo
const canAccessModule = permissions.canAccess('produtos')

// Obter módulos acessíveis
const modules = permissions.modules
```

## ✅ Resultado

Agora os botões e ações aparecem corretamente baseados nas permissões do usuário:

- ✅ **Botão "Novo Local"** aparece para usuários com permissão `produtos.create`
- ✅ **Botão "Editar"** aparece para usuários com permissão `produtos.edit`
- ✅ **Botão "Deletar"** aparece para usuários com permissão `produtos.delete`
- ✅ **Botão "Nova Transferência"** aparece para usuários com permissão `produtos.create`
- ✅ **Ações de Aprovar/Concluir** aparecem para usuários com permissão `produtos.edit`

---

**Status**: ✅ CORRIGIDO  
**Teste**: Todas as permissões agora funcionam corretamente nas páginas de estoque.
