# Endpoints de Vendas - Fluxo Correto

## Visão Geral dos Status

```
QUOTE (Orçamento) → APPROVED → COMPLETED → CANCELED (a qualquer momento)
DRAFT (Rascunho) → PENDING_APPROVAL → APPROVED → COMPLETED → CANCELED (a qualquer momento)
```

## Endpoints e Fluxos

### 1. Confirmar Orçamento (QUOTE → APPROVED)

**Endpoint**: `POST /sales/:id/confirm`

**Quando usar**: Quando o usuário clicar em "Aprovar orçamento" na listagem

**O que faz**:
- Baixa estoque dos produtos
- Cria lançamentos financeiros
- Muda status para APPROVED
- Define `confirmedAt` com data/hora atual

**Código**:
```typescript
await salesApi.confirm(saleId)
```

**Toast de sucesso**:
```
Título: "Orçamento confirmado"
Descrição: "O orçamento foi confirmado com sucesso. Estoque baixado e financeiro criado."
```

---

### 2. Aprovar Venda (PENDING_APPROVAL → APPROVED)

**Endpoint**: `POST /sales/:id/approve`

**Quando usar**: Quando o usuário clicar em "Aprovar venda" na listagem (não orçamento)

**O que faz**:
- Se requer análise de crédito:
  - Verifica resultado (APPROVED ou REJECTED)
  - Se APPROVED: muda status para APPROVED
  - Se REJECTED: cancela a venda automaticamente
- Se não requer: apenas aprova

**Código**:
```typescript
// Sem análise de crédito
await salesApi.approve(saleId)

// Com análise de crédito
await salesApi.approve(saleId, {
  creditAnalysisStatus: "APPROVED", // ou "REJECTED"
  creditAnalysisNotes: "Observações da análise..."
})
```

---

### 3. Cancelar Venda

**Endpoint**: `POST /sales/:id/cancel`

**Quando usar**: Quando o usuário clicar em "Cancelar" em qualquer venda/orçamento

**O que faz**:
- Devolve estoque (se já foi baixado)
- Cancela lançamentos financeiros
- Muda status para CANCELED
- Define `canceledAt` com data/hora atual
- Salva `cancellationReason`

**Código**:
```typescript
await salesApi.cancel(saleId, "Motivo do cancelamento...")
```

**Toast de sucesso**:
```
Título: "Venda cancelada"
Descrição: "A venda foi cancelada com sucesso. Estoque devolvido e financeiro cancelado."
```

---

## Implementação na Listagem

### Função handleApproveSale

```typescript
const handleApproveSale = async () => {
  if (!saleToApprove) return

  try {
    setActionLoading(true)
    
    // Se for orçamento (QUOTE), usar endpoint de confirmar
    if (saleToApprove.status === "QUOTE") {
      await salesApi.confirm(saleToApprove.id)
      toast({
        title: "Orçamento confirmado",
        description: "O orçamento foi confirmado com sucesso. Estoque baixado e financeiro criado.",
      })
    } else {
      // Para vendas, usar endpoint de aprovar
      const approveDto = requiresCreditAnalysis 
        ? {
            creditAnalysisStatus,
            creditAnalysisNotes,
          }
        : undefined

      await salesApi.approve(saleToApprove.id, approveDto)
      
      toast({
        title: "Venda aprovada",
        description: "A venda foi aprovada com sucesso.",
      })
    }
    
    setApproveDialogOpen(false)
    loadSales()
  } catch (error: any) {
    toast({
      title: saleToApprove.status === "QUOTE" ? "Erro ao confirmar orçamento" : "Erro ao aprovar venda",
      description: error.response?.data?.message || "Tente novamente mais tarde.",
      variant: "destructive",
    })
  } finally {
    setActionLoading(false)
  }
}
```

### Função handleCancelSale

```typescript
const handleCancelSale = async () => {
  if (!saleToCancel || !cancelReason.trim()) return

  try {
    setActionLoading(true)
    await salesApi.cancel(saleToCancel.id, cancelReason)
    
    toast({
      title: "Venda cancelada",
      description: "A venda foi cancelada com sucesso.",
    })
    
    setCancelDialogOpen(false)
    loadSales()
  } catch (error: any) {
    toast({
      title: "Erro ao cancelar venda",
      description: error.response?.data?.message || "Tente novamente mais tarde.",
      variant: "destructive",
    })
  } finally {
    setActionLoading(false)
  }
}
```

---

## Modal de Confirmação

### Para Orçamentos (QUOTE)

```tsx
<DialogHeader>
  <DialogTitle>Confirmar Orçamento</DialogTitle>
  <DialogDescription>
    Orçamento {sale.code} • Cliente: {customer.name} • Total: R$ XX,XX
  </DialogDescription>
</DialogHeader>

<div className="rounded-lg border border-green-200 bg-green-50 p-4">
  <p className="text-sm text-green-800">
    <strong>Confirmar Orçamento</strong>
    <br />
    Ao confirmar este orçamento, o estoque será baixado e o financeiro será criado automaticamente.
    Esta ação não pode ser desfeita.
  </p>
</div>

<Button onClick={handleApproveSale}>
  <CheckCircle2 className="mr-2 h-4 w-4" />
  Confirmar Orçamento
</Button>
```

### Para Vendas (PENDING_APPROVAL)

```tsx
<DialogHeader>
  <DialogTitle>Aprovar Venda</DialogTitle>
  <DialogDescription>
    Venda {sale.code} • Cliente: {customer.name} • Total: R$ XX,XX
  </DialogDescription>
</DialogHeader>

{requiresCreditAnalysis ? (
  // Campos de análise de crédito (APPROVED ou REJECTED)
  // + Campo de observações obrigatório
) : (
  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
    <p className="text-sm text-blue-800">
      <strong>Aprovação Simples</strong>
      <br />
      Esta venda não requer análise de crédito. Confirme para aprovar.
    </p>
  </div>
)}

<Button onClick={handleApproveSale}>
  <CheckCircle2 className="mr-2 h-4 w-4" />
  Aprovar Venda
</Button>
```

---

## Regras de Negócio

### Quando usar /confirm (Confirmar)
- ✅ Status atual é QUOTE
- ✅ Usuário clicou em "Aprovar orçamento"
- ✅ Baixa estoque e cria financeiro automaticamente

### Quando usar /approve (Aprovar)
- ✅ Status atual é PENDING_APPROVAL
- ✅ Usuário clicou em "Aprovar venda"
- ✅ Se requer análise de crédito, valida antes de aprovar
- ✅ Não baixa estoque (já foi baixado na criação ou confirmação)

### Quando usar /cancel (Cancelar)
- ✅ Qualquer status (exceto COMPLETED)
- ✅ Usuário clicou em "Cancelar"
- ✅ Devolve estoque se já foi baixado
- ✅ Cancela financeiro se já foi criado
- ✅ Requer motivo do cancelamento

---

## Diferenças Importantes

| Ação | Endpoint | Baixa Estoque | Cria Financeiro | Status Origem | Status Destino |
|------|----------|---------------|-----------------|---------------|----------------|
| Confirmar Orçamento | /confirm | ✅ Sim | ✅ Sim | QUOTE | APPROVED |
| Aprovar Venda | /approve | ❌ Não | ❌ Não | PENDING_APPROVAL | APPROVED |
| Cancelar | /cancel | ↩️ Devolve | ❌ Cancela | Qualquer | CANCELED |

---

## Validações

### Confirmar Orçamento
- Orçamento deve estar no status QUOTE
- Todos os produtos devem ter estoque disponível
- Método de pagamento deve estar ativo

### Aprovar Venda
- Venda deve estar no status PENDING_APPROVAL
- Se requer análise de crédito: observações são obrigatórias
- Se análise REJECTED: venda é cancelada automaticamente

### Cancelar Venda
- Motivo do cancelamento é obrigatório
- Venda não pode estar COMPLETED (concluída)
- Se tem financeiro: parcelas ainda não pagas são canceladas
- Se tem estoque baixado: quantidades são devolvidas

---

## Exemplos de Uso na Interface

### Dropdown de Ações (Listagem)

```tsx
<DropdownMenuItem onClick={() => openApproveDialog(sale)}>
  <CheckCircle2 className="mr-2 h-4 w-4" />
  {sale.status === "QUOTE" ? "Confirmar Orçamento" : "Aprovar Venda"}
</DropdownMenuItem>

<DropdownMenuItem onClick={() => openCancelDialog(sale)}>
  <XCircle className="mr-2 h-4 w-4" />
  {sale.status === "QUOTE" ? "Cancelar Orçamento" : "Cancelar Venda"}
</DropdownMenuItem>
```

### Badges de Status

```tsx
{sale.status === "QUOTE" && <Badge variant="secondary">Orçamento</Badge>}
{sale.status === "PENDING_APPROVAL" && <Badge variant="warning">Pendente</Badge>}
{sale.status === "APPROVED" && <Badge variant="success">Aprovada</Badge>}
{sale.status === "COMPLETED" && <Badge variant="info">Concluída</Badge>}
{sale.status === "CANCELED" && <Badge variant="destructive">Cancelada</Badge>}
```

---

## Notas Importantes

1. **Orçamento vs Venda**: Orçamento usa `/confirm`, Venda usa `/approve`
2. **Estoque**: Só é baixado uma vez (no confirm ou na criação com status PENDING_APPROVAL)
3. **Financeiro**: Criado no confirm ou na criação da venda
4. **Cancelamento**: Sempre usa `/cancel`, independente do status
5. **Análise de Crédito**: Só para vendas parceladas, nunca para orçamentos
6. **Toast Messages**: Devem refletir se é orçamento ou venda
7. **Validações**: Backend valida todas as regras de negócio
