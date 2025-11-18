# Telas Implementadas - Módulo Investidores SCP

## 📋 Visão Geral

Este documento lista todas as telas implementadas no módulo de Investidores SCP, organizadas por funcionalidade.

---

## 🏠 Dashboard

### `/dashboard/investidores`
**Status:** ✅ Implementado

**Descrição:** Dashboard principal do módulo de investidores

**Funcionalidades:**
- Visão geral de métricas
- Cards com estatísticas
- Acesso rápido aos submódulos

---

## 👥 Investidores

### `/dashboard/investidores/novo`
**Status:** ✅ Implementado

**Descrição:** Cadastro de novos investidores

**Funcionalidades:**
- Cadastro de Pessoa Física ou Jurídica
- Formulário completo com validações
- Upload de documentos
- Dados bancários

**Tipo:** Criação

---

## 💼 Projetos

### `/dashboard/investidores/projetos`
**Status:** ✅ Implementado

**Descrição:** Listagem de projetos SCP

**Funcionalidades:**
- Lista paginada de projetos
- Filtros por status
- Busca por nome/código
- Cards de estatísticas
- Ações: visualizar, editar, excluir

**API:** `GET /scp/projects`

---

### `/dashboard/investidores/projetos/novo`
**Status:** ✅ Implementado

**Descrição:** Cadastro de novos projetos

**Funcionalidades:**
- Formulário completo
- Informações básicas (nome, código, descrição)
- Valores (total, retorno esperado)
- Datas (início, fim previsto)
- Upload múltiplo de documentos com categorias
- Status inicial: PLANEJAMENTO

**API:** `POST /scp/projects`

**Tipo:** Criação

---

## 💰 Aportes/Investimentos

### `/dashboard/investidores/aportes`
**Status:** ✅ Implementado

**Descrição:** Listagem de aportes/investimentos

**Funcionalidades:**
- Lista paginada (10 itens/página)
- 4 cards de estatísticas (total, confirmados, pendentes, valor médio)
- Filtros: status, projeto, investidor, busca
- Tabela com 9 colunas
- Ações: visualizar, editar, excluir

**API:** `GET /scp/investments`

---

### `/dashboard/investidores/aportes/novo`
**Status:** ✅ Implementado

**Descrição:** Cadastro de novos aportes

**Funcionalidades:**
- Seleção de projeto e investidor
- Valor do aporte
- Método de pagamento (6 opções)
- Status (PENDENTE, CONFIRMADO, CANCELADO)
- Datas (aporte, vencimento)
- Número de referência
- Upload de comprovantes
- Observações

**API:** `POST /scp/investments`

**Tipo:** Criação

---

## 📊 Políticas de Distribuição

### `/dashboard/investidores/politicas`
**Status:** ✅ Implementado

**Descrição:** Listagem de políticas de distribuição

**Funcionalidades:**
- Lista paginada
- 4 cards de estatísticas (total, ativas, inativas, % médio)
- Filtros: status (ativa/inativa), projeto, busca
- Tabela com 7 colunas
- Validação: soma ≤ 100% por projeto
- Ações: visualizar, editar, ativar/desativar, excluir

**API:** `GET /scp/distribution-policies`

---

### `/dashboard/investidores/politicas/nova`
**Status:** 🔄 Pendente

**Descrição:** Cadastro de novas políticas

**Funcionalidades:**
- Seleção de projeto
- Seleção de investidor
- Definição de percentual (0-100%)
- Tipo: PROPORCIONAL ou FIXO
- Data de início
- Data de fim (opcional)
- Status inicial: ATIVO
- Validação: soma ≤ 100% por projeto

**API:** `POST /scp/distribution-policies`

**Tipo:** Criação

---

## 💸 Distribuições

### `/dashboard/investidores/distribuicoes`
**Status:** ✅ Implementado

**Descrição:** Listagem de distribuições de lucros

**Funcionalidades:**
- Lista paginada (10 itens/página)
- 4 cards de estatísticas (total, pago, pendente, cancelado)
- Filtros: status, projeto, investidor, busca
- Tabela com 9 colunas
- Status com badges coloridos
- Ações: visualizar, editar, excluir

**API:** `GET /scp/distributions`

---

### `/dashboard/investidores/distribuicoes/nova`
**Status:** ✅ Implementado

**Descrição:** Cadastro manual de distribuição

**Funcionalidades:**
- Seleção de projeto e investidor
- Valor bruto e percentual
- Cálculo automático de IRRF (5%)
- Outras deduções
- Preview do valor líquido em tempo real
- Competência (MM/YYYY)
- Data de distribuição
- Observações
- Status inicial: PENDENTE

**API:** `POST /scp/distributions`

**Tipo:** Criação

---

### `/dashboard/investidores/distribuicoes/automatica`
**Status:** ✅ Implementado

**Descrição:** Criação automática de distribuições (Bulk Create)

**Funcionalidades:**
- Seleção de projeto (com políticas ativas)
- Valor base total para distribuir
- Preview com cálculos por investidor
- Validação visual: soma = 100%
- Tabela de preview com:
  - Investidor
  - Percentual
  - Valor bruto
  - IRRF
  - Valor líquido
- Totalizadores
- Criação em lote

**API:** `POST /scp/distributions/bulk-create`

**Tipo:** Criação em Lote

---

### `/dashboard/investidores/distribuicoes/[id]`
**Status:** ✅ Implementado

**Descrição:** Visualização detalhada de distribuição

**Funcionalidades:**
- Card de status com valores (bruto, deduções, líquido)
- Informações do projeto
- Informações do investidor
- Detalhamento completo de valores
- Datas (competência, distribuição, pagamento)
- Observações
- Ações disponíveis:
  - **PENDENTE**: Marcar como Pago, Editar, Cancelar, Excluir
  - **PAGO**: Cancelar, Excluir
  - **CANCELADO**: Excluir

**API:** `GET /scp/distributions/:id`

**Tipo:** Visualização

---

### `/dashboard/investidores/distribuicoes/[id]/editar`
**Status:** ✅ Implementado

**Descrição:** Edição de distribuição

**Funcionalidades:**
- Exibição read-only: projeto e investidor
- Edição de valores:
  - Valor bruto
  - IRRF
  - Outras deduções
- Preview do valor líquido atualizado
- Edição de observações
- Recálculo automático do netAmount
- **Restrição:** Apenas distribuições PENDENTES podem ser editadas

**API:** `PUT /scp/distributions/:id`

**Tipo:** Edição

---

## 🎯 Ações Especiais

### Marcar como PAGO
**Status:** ✅ Implementado

**Local:** Página de detalhes (`/distribuicoes/[id]`)

**Funcionalidades:**
- Botão "Marcar como Pago"
- Confirmação de ação
- Atualiza status para PAGO
- Define paidAt para data/hora atual
- **Efeito:** Incrementa distributedValue do projeto

**API:** `POST /scp/distributions/:id/mark-as-paid`

**Disponível:** Apenas para status PENDENTE

---

### Marcar como CANCELADO
**Status:** ✅ Implementado

**Local:** Página de detalhes (`/distribuicoes/[id]`)

**Funcionalidades:**
- Botão "Cancelar"
- Confirmação de ação
- Atualiza status para CANCELADO
- **Efeito:** Se estava PAGA, decrementa distributedValue do projeto

**API:** `POST /scp/distributions/:id/mark-as-canceled`

**Disponível:** Para qualquer status exceto CANCELADO

---

## 📊 Resumo por Status

| Funcionalidade | Listagem | Cadastro | Edição | Visualização | Ações Especiais |
|---------------|----------|----------|--------|--------------|-----------------|
| **Investidores** | ❌ | ✅ | ❌ | ❌ | - |
| **Projetos** | ✅ | ✅ | ❌ | ❌ | Upload docs |
| **Aportes** | ✅ | ✅ | ❌ | ❌ | Upload comprovantes |
| **Políticas** | ✅ | 🔄 | ❌ | ❌ | Ativar/Desativar |
| **Distribuições** | ✅ | ✅ | ✅ | ✅ | Pago/Cancelado |
| **Dist. Automática** | - | ✅ | - | - | Bulk create |

**Legenda:**
- ✅ Implementado
- 🔄 Pendente
- ❌ Não implementado

---

## 🗂️ Navegação no Sidebar

### Menu: Investidores SCP

```
📊 Dashboard                    (/dashboard/investidores)
👥 Investidores                 (/dashboard/investidores/novo)
💼 Projetos                     (/dashboard/investidores/projetos)
💰 Aportes                      (/dashboard/investidores/aportes)
📊 Políticas                    (/dashboard/investidores/politicas)
💸 Distribuições                (/dashboard/investidores/distribuicoes)
```

---

## 📈 Métricas de Implementação

### Por Funcionalidade

**Distribuições:**
- ✅ 4 telas implementadas
- ✅ 10 endpoints API integrados
- ✅ 2 ações especiais
- ✅ 3 modos de criação (manual, bulk, edição)

**Aportes:**
- ✅ 2 telas implementadas
- ✅ 7 endpoints API integrados
- ✅ 6 métodos de pagamento

**Políticas:**
- ✅ 1 tela implementada
- ✅ 7 endpoints API integrados
- 🔄 1 tela pendente (cadastro)

**Projetos:**
- ✅ 2 telas implementadas
- ✅ Upload de documentos
- ❌ Edição pendente

---

## 🎯 Total Implementado

- ✅ **9 telas completas**
- ✅ **3 API clients completos**
- ✅ **24+ endpoints integrados**
- ✅ **40+ helper functions**
- ✅ **Zero erros de compilação**

---

## 🔜 Próximas Implementações

### Alta Prioridade
1. **Políticas - Cadastro** (`/politicas/nova`)
2. **Projetos - Edição** (`/projetos/[id]/editar`)
3. **Aportes - Visualização** (`/aportes/[id]`)
4. **Aportes - Edição** (`/aportes/[id]/editar`)

### Média Prioridade
5. **Investidores - Listagem** (`/investidores`)
6. **Investidores - Edição** (`/investidores/[id]/editar`)
7. **Políticas - Edição** (`/politicas/[id]/editar`)
8. **Projetos - Visualização** (`/projetos/[id]`)

### Baixa Prioridade (Melhorias)
9. Exportar relatórios (PDF/Excel)
10. Dashboard com gráficos
11. Notificações automáticas
12. Histórico de alterações
13. Auditoria completa

---

## 📝 Observações Técnicas

### Padrão de Desenvolvimento
Todas as telas seguem o mesmo padrão:
1. **Estado**: useState para dados e loading
2. **Efeitos**: useEffect para carregar dados
3. **Validações**: Client-side completas
4. **Feedback**: Toast para sucesso/erro
5. **Navegação**: useRouter do Next.js
6. **Layout**: DashboardLayout consistente
7. **UI**: shadcn/ui components

### Helpers Reutilizáveis
- `formatCurrency()` - R$ 1.234,56
- `formatPercentage()` - 35,00%
- `formatDate()` - 15/03/2024
- `formatDateTime()` - 15/03/2024 às 14:30
- `formatCompetence()` - 03/2024
- `calculateNetAmount()` - amount - irrf - deductions
- `calculateIRRF()` - amount * 0.05
- `getStatusLabel()` - Labels pt-BR
- `getStatusColor()` - Cores por status

### TypeScript
- ✅ Interfaces completas
- ✅ Types rigorosamente definidos
- ✅ DTOs para API
- ✅ Zero erros de compilação

---

**Última Atualização:** 10 de novembro de 2025  
**Versão:** 2.0.0  
**Módulo:** Investidores SCP Completo
