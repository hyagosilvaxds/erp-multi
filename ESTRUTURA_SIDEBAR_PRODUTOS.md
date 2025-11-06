# Estrutura da Sidebar - Módulo de Produtos

## 📋 Menu Atual do Módulo de Produtos

A sidebar está organizada da seguinte forma:

### 🎯 Menu Principal: **Produtos**
Ícone: `Package`

#### Submenu:

1. **Dashboard** 
   - Ícone: `LayoutDashboard`
   - Rota: `/dashboard/produtos`
   - Descrição: Visão geral com estatísticas de produtos

2. **Lista de Produtos**
   - Ícone: `Package`
   - Rota: `/dashboard/produtos/lista`
   - Descrição: Listagem completa de produtos com filtros e ações

3. **Estoque**
   - Ícone: `PackageCheck`
   - Rota: `/dashboard/produtos/estoque`
   - Descrição: Gestão de estoque e movimentações

4. **Locais de Estoque** ⭐ NOVO
   - Ícone: `MapPin`
   - Rota: `/dashboard/produtos/locais`
   - Descrição: Gerenciamento de depósitos, lojas e armazéns
   - Funcionalidades:
     - Criar locais de estoque
     - Editar informações (nome, código, endereço)
     - Marcar local padrão
     - Ativar/desativar locais
     - Visualizar estatísticas por local

5. **Transferências** ⭐ NOVO
   - Ícone: `ArrowRightLeft`
   - Rota: `/dashboard/produtos/transferencias`
   - Descrição: Transferências de estoque entre locais
   - Funcionalidades:
     - Criar novas transferências
     - Aprovar transferências pendentes
     - Concluir transferências (movimenta estoque)
     - Cancelar transferências
     - Visualizar histórico e status
     - Filtrar por status (Pendentes, Em Trânsito, Concluídas, Canceladas)

6. **Configurações**
   - Ícone: `Settings`
   - Rota: `/dashboard/produtos/configuracoes`
   - Descrição: Configurações gerais do módulo (categorias, unidades, marcas)

## 🎨 Ícones Importados

Os seguintes ícones do Lucide React estão importados e sendo utilizados:

```typescript
import {
  LayoutDashboard,    // Dashboard
  Package,            // Produtos e Lista
  PackageCheck,       // Estoque
  MapPin,            // Locais de Estoque ⭐
  ArrowRightLeft,    // Transferências ⭐
  Settings,          // Configurações
  // ... outros ícones
} from "lucide-react"
```

## 📱 Hierarquia Visual

```
📦 Produtos
  ├─ 📊 Dashboard
  ├─ 📦 Lista de Produtos
  ├─ ✅ Estoque
  ├─ 📍 Locais de Estoque        ← NOVO
  ├─ ⇄  Transferências           ← NOVO
  └─ ⚙️  Configurações
```

## 🔄 Fluxo de Trabalho Recomendado

1. **Configuração Inicial**
   - Configure Categorias, Unidades e Marcas (Configurações)
   - Crie Locais de Estoque (ex: Depósito Central, Loja 1, etc)
   - Cadastre Produtos

2. **Gestão de Estoque**
   - Visualize estoque geral (Estoque)
   - Visualize estoque por local (Locais de Estoque)
   - Faça movimentações (entradas, saídas, ajustes)

3. **Transferências**
   - Crie transferências entre locais (Transferências > Nova)
   - Aprove transferências pendentes
   - Acompanhe o status em tempo real
   - Conclua para movimentar o estoque automaticamente

## ✨ Melhorias Implementadas

### Locais de Estoque
- ✅ CRUD completo
- ✅ Código único por empresa
- ✅ Local padrão configurável
- ✅ Status ativo/inativo
- ✅ Estatísticas de produtos e movimentações

### Transferências
- ✅ Sistema completo de workflow (4 status)
- ✅ Múltiplos produtos por transferência
- ✅ Aprovação e conclusão separadas
- ✅ Movimentação automática de estoque
- ✅ Timeline de ações
- ✅ Validações de estoque disponível

## 🔐 Permissões

Todas as telas respeitam as permissões do módulo `produtos`:
- `view`: Visualizar
- `create`: Criar
- `edit`: Editar/Aprovar/Concluir
- `delete`: Deletar/Cancelar

## 📊 Resumo de Telas Criadas

| Tela | Rota | Status |
|------|------|--------|
| Listagem de Locais | `/dashboard/produtos/locais` | ✅ Completo |
| Estoque por Local (produto) | `/dashboard/produtos/[id]/locais` | ✅ Completo |
| Listagem de Transferências | `/dashboard/produtos/transferencias` | ✅ Completo |
| Nova Transferência | `/dashboard/produtos/transferencias/nova` | ✅ Completo |
| Detalhes da Transferência | `/dashboard/produtos/transferencias/[id]` | ✅ Completo |

---

**Nota**: A estrutura da sidebar está completa e funcional. Todos os itens estão corretamente ordenados e com os ícones apropriados.
