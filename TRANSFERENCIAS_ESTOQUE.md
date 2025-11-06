# Sistema de Transferências de Estoque

Sistema completo para gerenciar transferências de produtos entre locais de estoque.

## 📦 Funcionalidades Implementadas

### 1. API Client (`lib/api/products.ts`)
- ✅ Tipos TypeScript completos para transferências
- ✅ 6 métodos da API:
  - `create`: Criar nova transferência
  - `getAll`: Listar transferências (com filtro por status)
  - `getById`: Buscar transferência por ID
  - `approve`: Aprovar transferência (PENDING → IN_TRANSIT)
  - `complete`: Concluir transferência (movimenta estoque)
  - `cancel`: Cancelar transferência

### 2. Tipos de Status
- **PENDING**: Aguardando aprovação
- **IN_TRANSIT**: Aprovada, em trânsito
- **COMPLETED**: Concluída (estoque movimentado)
- **CANCELLED**: Cancelada

### 3. Telas Implementadas

#### 3.1 Listagem (`/dashboard/produtos/transferencias`)
- ✅ Listagem em tabela com todas as transferências
- ✅ 4 cards com estatísticas por status
- ✅ Tabs para filtrar por status
- ✅ Badges coloridos indicando status
- ✅ Informações de origem, destino, quantidade de itens
- ✅ Botão para criar nova transferência
- ✅ Botão para ver detalhes

#### 3.2 Criação (`/dashboard/produtos/transferencias/nova`)
- ✅ Seleção de local de origem e destino
- ✅ Adicionar múltiplos produtos
- ✅ Quantidade para cada produto
- ✅ Observações por item e gerais
- ✅ Validações:
  - Origem ≠ Destino
  - Produtos obrigatórios
  - Quantidades > 0
- ✅ Resumo lateral com totais
- ✅ Card sticky para ações

#### 3.3 Detalhes (`/dashboard/produtos/transferencias/[id]`)
- ✅ Informações completas da transferência
- ✅ Cards de origem e destino
- ✅ Timeline com histórico de ações
- ✅ Tabela com produtos da transferência
- ✅ Badge de status com ícone
- ✅ Botões de ação baseados no status:
  - **PENDING**: Aprovar, Concluir Direto, Cancelar
  - **IN_TRANSIT**: Concluir, Cancelar
  - **COMPLETED/CANCELLED**: Apenas visualização
- ✅ Dialogs de confirmação para cada ação
- ✅ Observações gerais (se houver)

### 4. Validações Backend (Documentado)
- ✅ Origem ≠ Destino
- ✅ Estoque suficiente no local de origem
- ✅ Código automático (TRANS-000001, etc)
- ✅ Apenas PENDING pode ser aprovado
- ✅ Apenas IN_TRANSIT/PENDING pode ser concluído
- ✅ Não é possível cancelar transferências completadas

### 5. Menu Sidebar
- ✅ Adicionado item "Transferências" com ícone ArrowRightLeft
- ✅ Posicionado entre "Locais de Estoque" e "Configurações"

### 6. Recursos Adicionais
- ✅ Loading states com skeleton
- ✅ Estados vazios com mensagens
- ✅ Toasts para feedback de ações
- ✅ Permissões integradas
- ✅ Headers x-company-id em todas as requisições
- ✅ Responsivo (mobile, tablet, desktop)

## 🎨 UI/UX

### Ícones por Status
- **PENDING**: Clock (amarelo)
- **IN_TRANSIT**: Truck (azul)
- **COMPLETED**: CheckCircle2 (verde)
- **CANCELLED**: XCircle (vermelho)

### Fluxo de Ações
```
PENDING → [Aprovar] → IN_TRANSIT → [Concluir] → COMPLETED
   ↓                        ↓
[Concluir Direto]      [Cancelar]
   ↓                        ↓
COMPLETED              CANCELLED
```

## 🔐 Permissões
- **Criar/Editar**: Requer permissão `produtos.create` ou `produtos.edit`
- **Visualizar**: Requer permissão `produtos.view`

## 📱 Páginas

| Rota | Descrição |
|------|-----------|
| `/dashboard/produtos/transferencias` | Listagem com filtros e stats |
| `/dashboard/produtos/transferencias/nova` | Criar nova transferência |
| `/dashboard/produtos/transferencias/[id]` | Detalhes e ações |

## 🚀 Próximos Passos (Sugestões)

1. **Relatórios**
   - Relatório de transferências por período
   - Produtos mais transferidos
   - Performance por local

2. **Notificações**
   - Notificar responsável quando transferência criada
   - Alertas de transferências pendentes há X dias

3. **Rastreamento**
   - Adicionar campo de rastreamento (código de envio)
   - Integração com transportadoras

4. **Histórico**
   - Log completo de todas as ações
   - Auditoria de quem fez cada ação

5. **Validações Avançadas**
   - Verificar se produto precisa de lote/validade
   - Reserva de estoque ao aprovar transferência

6. **Impressão**
   - Gerar PDF da transferência
   - Etiquetas para produtos
