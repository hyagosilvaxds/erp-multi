# Implementação - Ações Rápidas em Vendas e Tela de Edição

## Resumo
Implementação de ações rápidas na listagem de vendas (aprovar, cancelar, exportar PDF) e criação completa da tela de edição de vendas com novos endpoints da API.

## Data
10 de novembro de 2025

## Mudanças Implementadas

### 1. Novos Endpoints na API (`/lib/api/sales.ts`)

#### Endpoints Adicionados:

**1. Confirmar Venda** - `POST /sales/:id/confirm`
```typescript
confirmSale(id: string): Promise<Sale>
```
- Confirma venda (baixa estoque + cria financeiro)
- Usado quando venda já está aprovada e pronta para ser efetivada

**2. Aprovar Análise de Crédito** - `POST /sales/:id/credit-analysis/approve`
```typescript
approveCreditAnalysis(id: string, notes?: string): Promise<Sale>
```
- Aprova análise de crédito especificamente
- Usado apenas em detalhes da venda quando requer análise
- Parâmetro `notes` é opcional

**3. Rejeitar Análise de Crédito** - `POST /sales/:id/credit-analysis/reject`
```typescript
rejectCreditAnalysis(id: string, notes: string): Promise<Sale>
```
- Rejeita análise de crédito
- Parâmetro `notes` é obrigatório (motivo da reprovação)
- Cancela a venda automaticamente

**4. Alterar Status** - `PATCH /sales/:id/status`
```typescript
changeSaleStatus(id: string, status: SaleStatus): Promise<Sale>
```
- Altera status da venda manualmente
- Status permitidos: QUOTE, DRAFT, PENDING_APPROVAL, APPROVED, COMPLETED, CANCELED

#### Exports Atualizados:
```typescript
export const salesApi = {
  // ... métodos existentes
  confirm: confirmSale,
  approveCreditAnalysis: approveCreditAnalysis,
  rejectCreditAnalysis: rejectCreditAnalysis,
  changeStatus: changeSaleStatus,
  // ...
}
```

### 2. Listagem de Vendas - Ações Rápidas (`/app/dashboard/vendas/page.tsx`)

#### Novos Estados:
```typescript
const [exportingPDF, setExportingPDF] = useState<string | null>(null)
```

#### Nova Função: Exportar PDF Individual
```typescript
handleExportSalePDF(sale: Sale)
```
- Exporta PDF de uma venda específica
- Nome do arquivo: `orcamento-{code}.pdf` ou `venda-{code}.pdf`
- Exibe loading no botão durante exportação
- Download automático via Blob

#### Dropdown de Ações Atualizado:

**Ordem dos Botões:**
1. ✅ **Ver Detalhes** (sempre disponível)
2. ✅ **Exportar PDF** (sempre disponível)
   - Exibe Loader2 quando exportando
   - Desabilitado durante exportação
3. ✅ **Editar** (QUOTE ou DRAFT)
4. ✅ **Aprovar** (QUOTE, DRAFT ou PENDING_APPROVAL)
   - Texto dinâmico: "Aprovar orçamento" ou "Aprovar venda"
   - Abre dialog com análise de crédito se necessário
5. ✅ **Marcar como Concluída** (APPROVED)
6. ✅ **Cancelar** (exceto COMPLETED e CANCELED)
   - Texto dinâmico: "Cancelar orçamento" ou "Cancelar venda"

#### Dialog de Aprovação Mantido:
- Análise de crédito se método de pagamento requerer
- Radio buttons: Aprovar ou Reprovar crédito
- Campo de observações obrigatório
- Usa `salesApi.approve()` para aprovação simples

### 3. Detalhes da Venda - Análise de Crédito (`/app/dashboard/vendas/[id]/page.tsx`)

#### Método `handleApprove` Atualizado:

**Lógica de Aprovação:**
```typescript
if (requiresCreditAnalysis) {
  if (creditAnalysisStatus === "APPROVED") {
    await salesApi.approveCreditAnalysis(saleId, notes)
    // Toast: "Crédito aprovado"
  } else {
    await salesApi.rejectCreditAnalysis(saleId, notes)
    // Toast: "Crédito reprovado" (venda cancelada)
  }
} else {
  await salesApi.approve(saleId)
  // Toast: "Venda aprovada"
}
```

**Diferenças:**
- ✅ **Com Análise de Crédito**: Usa endpoints específicos (`approveCreditAnalysis` / `rejectCreditAnalysis`)
- ✅ **Sem Análise de Crédito**: Usa endpoint simples (`approve`)
- ✅ Toasts diferenciados para cada cenário
- ✅ Validação de observações obrigatórias quando requer análise

### 4. Tela de Edição de Vendas (`/app/dashboard/vendas/[id]/editar/page.tsx`)

#### ✅ Funcionalidades Implementadas:

**Carregamento Inicial:**
- Busca venda existente por ID
- Carrega clientes, métodos de pagamento e locais de estoque
- Preenche formulário com dados da venda
- Converte itens da venda para formato editável

**Validações:**
- ✅ Só permite editar vendas com status QUOTE ou DRAFT
- ✅ Exibe mensagem para vendas já aprovadas/processadas
- ✅ Cliente obrigatório
- ✅ Pelo menos 1 produto
- ✅ Local de estoque obrigatório para vendas (não para orçamentos)
- ✅ Descontos exclusivos (% OU R$, não ambos)
- ✅ Endereço completo se não usar endereço do cliente

**Seções do Formulário:**

1. **Informações Básicas:**
   - Status (QUOTE ou PENDING_APPROVAL)
   - Cliente (select)
   - Válido Até (apenas para orçamentos)

2. **Produtos:**
   - Tabela de itens adicionados
   - Mostra: Nome, SKU, Quantidade, Preço, Desconto, Total
   - Exibe local de estoque e observações do item
   - Botão remover por item
   - Dialog para adicionar novos produtos

3. **Observações:**
   - Observações públicas (visível para cliente)
   - Observações internas (uso interno)

4. **Endereço de Entrega:**
   - Checkbox: "Usar endereço do cliente"
   - Formulário completo de endereço (se não usar do cliente)
   - 7 campos: Rua, Número, Complemento, Bairro, Cidade, Estado, CEP

5. **Resumo Financeiro:**
   - Subtotal automático
   - Desconto (% ou R$, exclusivos)
   - Frete
   - Outras Despesas (com descrição)
   - Total calculado automaticamente

6. **Forma de Pagamento:**
   - Select de método de pagamento
   - Parcelas (se permitir parcelamento)
   - Mostra valor de cada parcela

**Dialog de Adicionar Produto:**
- ✅ Busca por nome, SKU ou código
- ✅ Lista de resultados com estoque disponível
- ✅ Seleção de produto
- ✅ Formulário detalhado:
  - Quantidade (obrigatória)
  - Preço unitário (automático, não editável)
  - Desconto (opcional)
  - Local de estoque (obrigatório para vendas)
  - Observações (opcional)
- ✅ Cálculo automático do total do item
- ✅ Botão para trocar de produto

**Botões de Ação:**
- ✅ **Cancelar**: Volta para detalhes sem salvar
- ✅ **Salvar Alterações**: Atualiza venda via API

#### Fluxo de Edição:
```
1. Usuário clica em "Editar" na listagem ou detalhes
2. Sistema verifica se venda pode ser editada (QUOTE ou DRAFT)
3. Carrega dados da venda e preenche formulário
4. Usuário modifica campos desejados
5. Pode adicionar/remover produtos
6. Pode alterar valores, descontos, frete
7. Clica em "Salvar Alterações"
8. Sistema valida e envia para API
9. Redireciona para detalhes da venda atualizada
```

### 5. Diferenças entre Aprovar e Confirmar

**❓ Quando usar cada endpoint:**

| Ação | Endpoint | Quando Usar |
|------|----------|-------------|
| **Aprovar** | `POST /sales/:id/approve` | Aprovar orçamento/venda sem análise de crédito |
| **Aprovar Crédito** | `POST /sales/:id/credit-analysis/approve` | Aprovar análise de crédito (em detalhes) |
| **Rejeitar Crédito** | `POST /sales/:id/credit-analysis/reject` | Reprovar análise de crédito (cancela venda) |
| **Confirmar** | `POST /sales/:id/confirm` | Confirmar venda aprovada (baixa estoque + financeiro) |
| **Cancelar** | `POST /sales/:id/cancel` | Cancelar venda (disponível na listagem e detalhes) |

**Fluxo Completo:**
```
1. QUOTE (Orçamento)
   ↓ Aprovar (listagem ou detalhes)
   
2. PENDING_APPROVAL (Aguardando Aprovação)
   ↓ Aprovar com análise de crédito (se necessário)
   
3. APPROVED (Aprovado)
   ↓ Confirmar (baixa estoque + cria financeiro)
   
4. COMPLETED (Concluído)
```

## Estrutura de Arquivos

### Novos Arquivos:
- ✅ `/app/dashboard/vendas/[id]/editar/page.tsx` - Tela de edição completa

### Arquivos Modificados:
- ✅ `/lib/api/sales.ts` - 4 novos endpoints
- ✅ `/app/dashboard/vendas/page.tsx` - Ações rápidas na listagem
- ✅ `/app/dashboard/vendas/[id]/page.tsx` - Análise de crédito com endpoints específicos

## Testes Recomendados

### 1. Listagem de Vendas:
- ✅ Exportar PDF de orçamento e venda
- ✅ Aprovar orçamento diretamente
- ✅ Aprovar venda com análise de crédito
- ✅ Cancelar com motivo
- ✅ Editar apenas QUOTE e DRAFT

### 2. Detalhes da Venda:
- ✅ Aprovar sem análise de crédito
- ✅ Aprovar com análise de crédito (APPROVED)
- ✅ Rejeitar análise de crédito (REJECTED → CANCELED)
- ✅ Cancelar venda com motivo
- ✅ Confirmar venda aprovada

### 3. Edição de Vendas:
- ✅ Carregar dados existentes
- ✅ Editar cliente e status
- ✅ Adicionar/remover produtos
- ✅ Alterar descontos e frete
- ✅ Editar endereço de entrega
- ✅ Salvar alterações
- ✅ Bloquear edição de vendas processadas

## Status
✅ **Implementado e Validado**
- Zero erros de compilação
- Novos endpoints integrados
- Ações rápidas na listagem funcionais
- Tela de edição completa
- Análise de crédito com endpoints corretos
- Diferenciação clara entre Aprovar e Confirmar
