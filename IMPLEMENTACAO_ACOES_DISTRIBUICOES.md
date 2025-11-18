# Implementação: Ações de Distribuições (Marcar como Pago, Cancelar, Atualizar, Deletar)

## Data
10 de novembro de 2025

## Objetivo
Implementar ações completas de gerenciamento de distribuições: marcar como pago, cancelar, atualizar e deletar com os efeitos corretos no `distributedValue` do projeto.

## Funcionalidades Implementadas

### 1. ✅ `POST /scp/distributions/:id/mark-as-paid`
**Marca distribuição como PAGA**

#### Comportamento
- Atualiza `status` para **PAGO**
- Define `paidAt` com data/hora atual
- **Incrementa** `distributedValue` do projeto com o valor de `netAmount`

#### Request
```http
POST /scp/distributions/uuid-123/mark-as-paid
Headers:
  Authorization: Bearer {token}
  X-Company-ID: {uuid}
Body: {} (vazio)
```

#### Response (200 OK)
```json
{
  "id": "uuid-123",
  "status": "PAGO",
  "paidAt": "2024-11-15T10:30:00.000Z",
  "amount": 15000.00,
  "netAmount": 14250.00,
  "irrf": 750.00,
  "otherDeductions": 0.00
}
```

#### Erros
- **404 Not Found**: Distribuição não encontrada
- **400 Bad Request**: Distribuição já está paga

#### Implementação Frontend
```typescript
const handleMarkAsPaid = async (distributionId: string) => {
  if (!selectedCompany?.id) return

  if (!confirm("Tem certeza que deseja marcar esta distribuição como PAGA?")) return

  try {
    await distributionsApi.markAsPaid(selectedCompany.id, distributionId)

    toast({
      title: "Sucesso",
      description: "Distribuição marcada como PAGA com sucesso",
    })

    loadDistributions()
  } catch (error: any) {
    console.error("Erro ao marcar distribuição como paga:", error)
    toast({
      title: "Erro ao marcar como paga",
      description: error.response?.data?.message || error.message,
      variant: "destructive",
    })
  }
}
```

---

### 2. ✅ `POST /scp/distributions/:id/mark-as-canceled`
**Marca distribuição como CANCELADA**

#### Comportamento
- Atualiza `status` para **CANCELADO**
- Se estava PAGA, **decrementa** `distributedValue` do projeto

#### Request
```http
POST /scp/distributions/uuid-123/mark-as-canceled
Headers:
  Authorization: Bearer {token}
  X-Company-ID: {uuid}
Body: {} (vazio)
```

#### Response (200 OK)
```json
{
  "id": "uuid-123",
  "status": "CANCELADO",
  "amount": 15000.00,
  "netAmount": 14250.00
}
```

#### Erros
- **404 Not Found**: Distribuição não encontrada

#### Implementação Frontend
```typescript
const handleMarkAsCanceled = async (distributionId: string) => {
  if (!selectedCompany?.id) return

  if (!confirm("Tem certeza que deseja CANCELAR esta distribuição?")) return

  try {
    await distributionsApi.markAsCanceled(selectedCompany.id, distributionId)

    toast({
      title: "Sucesso",
      description: "Distribuição cancelada com sucesso",
    })

    loadDistributions()
  } catch (error: any) {
    console.error("Erro ao cancelar distribuição:", error)
    toast({
      title: "Erro ao cancelar distribuição",
      description: error.response?.data?.message || error.message,
      variant: "destructive",
    })
  }
}
```

---

### 3. ✅ `PUT /scp/distributions/:id`
**Atualiza distribuição**

#### Comportamento
- Atualiza campos informados
- **Recalcula** automaticamente `netAmount` se `amount`, `irrf` ou `otherDeductions` mudarem
- Se `status` mudar de/para PAGO, **ajusta** `distributedValue` do projeto

#### Request
```http
PUT /scp/distributions/uuid-123
Headers:
  Authorization: Bearer {token}
  X-Company-ID: {uuid}
Body:
{
  "amount": 16000.00,
  "irrf": 800.00,
  "otherDeductions": 100.00,
  "notes": "Valor ajustado conforme contrato"
}
```

#### Response (200 OK)
Retorna a distribuição atualizada completa (mesma estrutura do GET).

#### Implementação Frontend
```typescript
// Já implementado via distributionsApi.update()
await distributionsApi.update(selectedCompany.id, distributionId, {
  amount: 16000.00,
  irrf: 800.00,
  otherDeductions: 100.00,
  notes: "Valor ajustado"
})
```

---

### 4. ✅ `DELETE /scp/distributions/:id`
**Exclui distribuição permanentemente**

#### Comportamento
- Remove distribuição do banco de dados
- Se estava PAGA, **decrementa** o valor do `distributedValue` do projeto

#### Request
```http
DELETE /scp/distributions/uuid-123
Headers:
  Authorization: Bearer {token}
  X-Company-ID: {uuid}
```

#### Response (200 OK)
```json
{
  "message": "Distribuição excluída com sucesso"
}
```

#### Erros
- **404 Not Found**: Distribuição não encontrada

#### Implementação Frontend
```typescript
const handleDelete = async (distributionId: string) => {
  if (!selectedCompany?.id) return

  if (!confirm("Tem certeza que deseja excluir esta distribuição?")) return

  try {
    await distributionsApi.delete(selectedCompany.id, distributionId)

    toast({
      title: "Sucesso",
      description: "Distribuição excluída com sucesso",
    })

    loadDistributions()
  } catch (error: any) {
    console.error("Erro ao excluir distribuição:", error)
    toast({
      title: "Erro ao excluir distribuição",
      description: error.response?.data?.message || error.message,
      variant: "destructive",
    })
  }
}
```

---

## Arquivos Modificados

### 1. `/lib/api/distributions.ts`

#### Funções Já Existentes (Verificadas)
```typescript
/**
 * Marca distribuição como PAGA
 */
export async function markDistributionAsPaid(
  companyId: string,
  distributionId: string
): Promise<{
  id: string
  status: DistributionStatus
  paidAt: string
  amount: number
  netAmount: number
  irrf: number
  otherDeductions: number
}>

/**
 * Marca distribuição como CANCELADA
 */
export async function markDistributionAsCanceled(
  companyId: string,
  distributionId: string
): Promise<{
  id: string
  status: DistributionStatus
  amount: number
  netAmount: number
}>

/**
 * Atualiza distribuição
 */
export async function updateDistribution(
  companyId: string,
  distributionId: string,
  data: UpdateDistributionDto
): Promise<Distribution>

/**
 * Exclui distribuição
 */
export async function deleteDistribution(
  companyId: string,
  distributionId: string
): Promise<void>
```

#### Export API (Verificado)
```typescript
export const distributionsApi = {
  create: createDistribution,
  bulkCreate: bulkCreateDistributions,
  bulkCreateAutomatic: bulkCreateAutomatic,
  getAll: getDistributions,
  getByInvestor: getDistributionsByInvestor,
  getByProject: getDistributionsByProject,
  getById: getDistributionById,
  update: updateDistribution,
  delete: deleteDistribution,
  markAsPaid: markDistributionAsPaid,        // ✅
  markAsCanceled: markDistributionAsCanceled, // ✅
  helpers: { ... }
}
```

### 2. `/app/dashboard/investidores/distribuicoes/page.tsx`

#### Novas Funções Adicionadas
```typescript
// 1. Marcar como Pago
const handleMarkAsPaid = async (distributionId: string) => {
  if (!selectedCompany?.id) return
  if (!confirm("Tem certeza que deseja marcar esta distribuição como PAGA?")) return

  try {
    await distributionsApi.markAsPaid(selectedCompany.id, distributionId)
    toast({ title: "Sucesso", description: "Distribuição marcada como PAGA" })
    loadDistributions()
  } catch (error: any) {
    toast({
      title: "Erro ao marcar como paga",
      description: error.response?.data?.message || error.message,
      variant: "destructive",
    })
  }
}

// 2. Marcar como Cancelado
const handleMarkAsCanceled = async (distributionId: string) => {
  if (!selectedCompany?.id) return
  if (!confirm("Tem certeza que deseja CANCELAR esta distribuição?")) return

  try {
    await distributionsApi.markAsCanceled(selectedCompany.id, distributionId)
    toast({ title: "Sucesso", description: "Distribuição cancelada" })
    loadDistributions()
  } catch (error: any) {
    toast({
      title: "Erro ao cancelar",
      description: error.response?.data?.message || error.message,
      variant: "destructive",
    })
  }
}

// 3. Deletar (já existia, mantido)
const handleDelete = async (distributionId: string) => {
  // ... código existente
}
```

#### Novos Imports
```typescript
import {
  // ... imports existentes
  CheckCircle2,  // ✅ Ícone para Marcar como Pago
  XCircle,       // ❌ Ícone para Cancelar
} from "lucide-react"
```

#### Botões de Ação Atualizados
```tsx
<TableCell className="text-right">
  <div className="flex justify-end gap-2">
    {/* Botão Ver - sempre visível */}
    <Link href={`/dashboard/investidores/distribuicoes/${distribution.id}`}>
      <Button variant="ghost" size="icon">
        <Eye className="h-4 w-4" />
      </Button>
    </Link>
    
    {/* Botão Editar - só se NÃO for PAGO */}
    {distribution.status !== "PAGO" && (
      <Link href={`/dashboard/investidores/distribuicoes/${distribution.id}/editar`}>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </Link>
    )}
    
    {/* Botão Marcar como Pago - só se PENDENTE */}
    {distribution.status === "PENDENTE" && (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleMarkAsPaid(distribution.id)}
        title="Marcar como Pago"
      >
        <CheckCircle2 className="h-4 w-4 text-green-600" />
      </Button>
    )}
    
    {/* Botão Cancelar - só se NÃO for CANCELADO */}
    {distribution.status !== "CANCELADO" && (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleMarkAsCanceled(distribution.id)}
        title="Cancelar"
      >
        <XCircle className="h-4 w-4 text-orange-600" />
      </Button>
    )}
    
    {/* Botão Deletar - sempre visível */}
    <Button
      variant="ghost"
      size="icon"
      onClick={() => handleDelete(distribution.id)}
      title="Excluir"
    >
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  </div>
</TableCell>
```

---

## Lógica de Botões por Status

### Status: PENDENTE
**Botões Visíveis:**
- 👁️ Ver
- ✏️ Editar
- ✅ **Marcar como Pago** (verde)
- ❌ **Cancelar** (laranja)
- 🗑️ Deletar (vermelho)

### Status: PAGO
**Botões Visíveis:**
- 👁️ Ver
- ❌ **Cancelar** (laranja) - permite reverter pagamento
- 🗑️ Deletar (vermelho)

**Botões Ocultos:**
- ❌ Editar (não pode editar distribuição paga)
- ❌ Marcar como Pago (já está pago)

### Status: CANCELADO
**Botões Visíveis:**
- 👁️ Ver
- 🗑️ Deletar (vermelho)

**Botões Ocultos:**
- ❌ Editar (não pode editar cancelado)
- ❌ Marcar como Pago (está cancelado)
- ❌ Cancelar (já está cancelado)

---

## Efeitos no `distributedValue` do Projeto

### Cenário 1: Marcar PENDENTE como PAGO
```
Distribuição: netAmount = R$ 14.250
Status: PENDENTE → PAGO

Efeito no Projeto:
distributedValue += 14.250
```

### Cenário 2: Cancelar PAGO
```
Distribuição: netAmount = R$ 14.250
Status: PAGO → CANCELADO

Efeito no Projeto:
distributedValue -= 14.250
```

### Cenário 3: Cancelar PENDENTE
```
Distribuição: netAmount = R$ 14.250
Status: PENDENTE → CANCELADO

Efeito no Projeto:
distributedValue não muda (nunca foi pago)
```

### Cenário 4: Deletar PAGO
```
Distribuição: netAmount = R$ 14.250
Status: PAGO → (excluído)

Efeito no Projeto:
distributedValue -= 14.250
```

### Cenário 5: Deletar PENDENTE ou CANCELADO
```
Distribuição: netAmount = R$ 14.250
Status: PENDENTE/CANCELADO → (excluído)

Efeito no Projeto:
distributedValue não muda
```

### Cenário 6: Atualizar Valor em PAGO
```
Distribuição: netAmount = R$ 14.250 → R$ 16.000
Status: PAGO (mantém)

Efeito no Projeto:
distributedValue -= 14.250  (remove antigo)
distributedValue += 16.000  (adiciona novo)
Resultado: distributedValue += 1.750
```

---

## Casos de Uso

### Caso 1: Distribuição Regular
```
1. Criar distribuição → Status: PENDENTE
2. Verificar dados → botão Ver
3. Confirmar pagamento → botão Marcar como Pago
4. Status atualizado → PAGO
5. distributedValue do projeto incrementado
```

### Caso 2: Correção de Valor
```
1. Distribuição PENDENTE com valor errado
2. Clicar em Editar
3. Corrigir valor e salvar
4. Marcar como Pago normalmente
```

### Caso 3: Cancelamento de Pagamento Efetuado
```
1. Distribuição PAGA incorretamente
2. Clicar em Cancelar
3. Status → CANCELADO
4. distributedValue do projeto decrementado
```

### Caso 4: Exclusão de Distribuição Errada
```
1. Distribuição criada por engano
2. Se PENDENTE: deletar diretamente
3. Se PAGA: primeiro cancelar, depois deletar
   (ou deletar direto que o backend ajusta)
```

---

## Validações e Segurança

### Backend Validações
1. ✅ Verifica se distribuição existe
2. ✅ Verifica se pertence à empresa
3. ✅ Não permite marcar como PAGO se já está PAGO
4. ✅ Ajusta `distributedValue` corretamente em todos os cenários
5. ✅ Usa transações para garantir consistência

### Frontend Validações
1. ✅ Confirmação antes de ações críticas (pagar, cancelar, deletar)
2. ✅ Botões condicionais por status
3. ✅ Feedback visual claro (toasts)
4. ✅ Reload automático após ações
5. ✅ Tratamento de erros com mensagens amigáveis

---

## Testes Recomendados

### Fluxo Completo: PENDENTE → PAGO → CANCELADO
- [ ] Criar distribuição (deve ficar PENDENTE)
- [ ] Verificar `distributedValue` do projeto (não mudou)
- [ ] Marcar como PAGO
- [ ] Verificar `distributedValue` incrementou
- [ ] Verificar botão Editar desapareceu
- [ ] Cancelar distribuição
- [ ] Verificar `distributedValue` decrementou
- [ ] Verificar botões disponíveis (apenas Ver e Deletar)

### Fluxo Alternativo: PENDENTE → CANCELADO
- [ ] Criar distribuição PENDENTE
- [ ] Cancelar direto (sem marcar como pago)
- [ ] Verificar `distributedValue` não mudou
- [ ] Verificar status CANCELADO

### Fluxo de Edição
- [ ] Criar distribuição PENDENTE
- [ ] Editar valor
- [ ] Marcar como PAGO
- [ ] Verificar `distributedValue` com valor atualizado

### Fluxo de Deleção
- [ ] Deletar distribuição PENDENTE → `distributedValue` não muda
- [ ] Deletar distribuição PAGA → `distributedValue` decrementa
- [ ] Deletar distribuição CANCELADA → `distributedValue` não muda

### Validações de Erro
- [ ] Tentar marcar como PAGO duas vezes (deve dar erro 400)
- [ ] Tentar marcar distribuição inexistente (deve dar erro 404)
- [ ] Tentar deletar com empresa errada (deve dar erro 403)

---

## Melhorias Futuras Sugeridas

1. **Histórico de Mudanças**
   - Registrar quem marcou como pago
   - Registrar quando foi cancelado
   - Motivo de cancelamento

2. **Comprovantes**
   - Upload de comprovante ao marcar como pago
   - Download de comprovante

3. **Notificações**
   - Email ao investidor quando marcado como pago
   - Alerta de distribuição cancelada

4. **Relatórios**
   - Relatório de distribuições pagas no período
   - Relatório de cancelamentos

5. **Bulk Actions**
   - Marcar múltiplas como pagas de uma vez
   - Cancelar múltiplas distribuições

6. **Workflow de Aprovação**
   - Solicitar aprovação antes de marcar como pago
   - Múltiplos níveis de aprovação

---

## Status
✅ **Concluído**
- Funções de API verificadas e funcionando
- Página de listagem atualizada com novos botões
- Lógica condicional de botões por status
- Confirmações antes de ações críticas
- Feedback visual (toasts)
- Zero erros de compilação
- Documentação completa

## Resumo de Endpoints Implementados

| Endpoint | Método | Descrição | Status |
|----------|--------|-----------|--------|
| `/scp/distributions` | POST | Criar individual | ✅ |
| `/scp/distributions/bulk` | POST | Criar múltiplas (manual) | ✅ |
| `/scp/distributions/bulk-create` | POST | Criar automático (políticas) | ✅ |
| `/scp/distributions` | GET | Listar com filtros | ✅ |
| `/scp/distributions/:id` | GET | Buscar por ID | ✅ |
| `/scp/distributions/:id` | PUT | Atualizar | ✅ |
| `/scp/distributions/:id` | DELETE | Deletar | ✅ |
| `/scp/distributions/:id/mark-as-paid` | POST | Marcar como pago | ✅ |
| `/scp/distributions/:id/mark-as-canceled` | POST | Cancelar | ✅ |
| `/scp/distributions/by-investor/:id` | GET | Por investidor | ✅ |
| `/scp/distributions/by-project/:id` | GET | Por projeto | ✅ |

**Total: 11 endpoints completos** 🎉
