# Atualização - Detalhes e Listagem de Vendas

## Resumo
Atualização completa da tela de detalhes e listagem de vendas para exibir corretamente todos os dados retornados pela API, incluindo suporte para orçamentos (QUOTE) e vendas.

## Data
10 de novembro de 2025

## Mudanças Implementadas

### 1. Atualização da Interface `Sale` (`/lib/api/sales.ts`)

#### Novos Campos da API:
- **`code`**: Código único da venda (VDA-000001) ao invés de `saleNumber`
- **`discountAmount`** e **`discountPercent`**: Descontos separados
- **`shippingCost`**: Custo de frete (ao invés de `shipping`)
- **`otherCharges`** e **`otherChargesDesc`**: Outras despesas com descrição
- **`installmentValue`**: Valor de cada parcela
- **`creditAnalysisRequired`**, **`creditScore`**: Campos de análise de crédito
- **`useCustomerAddress`**: Flag para usar endereço do cliente
- **`deliveryAddress`**: Objeto completo com endereço de entrega
- **`internalNotes`**: Observações internas separadas
- **`quoteDate`**: Data do orçamento (para status QUOTE)
- **`validUntil`**: Validade do orçamento
- **`confirmedAt`**: Data de confirmação
- **`cancellationReason`**: Motivo do cancelamento (ao invés de `cancelReason`)

#### Novo Status:
- **`QUOTE`**: Orçamento (adicionado ao tipo `SaleStatus`)

#### Interface `SaleItem` Atualizada:
- **`stockLocationId`**: ID do local de estoque
- **`productCode`**, **`productName`**, **`productUnit`**: Dados do produto
- **`total`**: Total do item (ao invés de apenas `totalPrice`)
- **`notes`**: Observações do item
- **`stockLocation`**: Objeto completo com dados do local de estoque

#### Labels e Cores Atualizados:
```typescript
QUOTE: "Orçamento" (bg-blue-100)
DRAFT: "Rascunho" (bg-gray-100)
PENDING_APPROVAL: "Aguardando Aprovação" (bg-yellow-100)
APPROVED: "Aprovado" (bg-green-100)
COMPLETED: "Concluído" (bg-emerald-100)
CANCELED: "Cancelado" (bg-red-100)
```

### 2. Tela de Detalhes da Venda (`/app/dashboard/vendas/[id]/page.tsx`)

#### Header:
- ✅ Exibe `code` (VDA-000001) ao invés de `saleNumber`
- ✅ Detecta se é "Orçamento" (QUOTE) ou "Venda" baseado no status

#### Informações do Cliente:
- ✅ Suporte para CPF (`cpf`), CNPJ (`cnpj`) ou campo legado (`cpfCnpj`)
- ✅ Prioriza `mobile` sobre `phone`

#### Itens da Venda:
- ✅ Exibe `productName` se disponível, senão `product.name`
- ✅ Mostra SKU ou `productCode` como fallback
- ✅ Exibe **observações do item** (`notes`) se houver
- ✅ Mostra **local de estoque** (`stockLocation.name`) se disponível
- ✅ Usa `total` ou `totalPrice` como fallback

#### Resumo Financeiro:
- ✅ **Desconto**: Mostra `discountAmount` ou `discount`, com percentual se `discountPercent > 0`
- ✅ **Frete**: Mostra `shippingCost` ou `shipping` (apenas se > 0)
- ✅ **Outras Despesas**: Nova seção com `otherCharges` e descrição `otherChargesDesc` (apenas se > 0)
- ✅ Exibe percentual de desconto entre parênteses

#### Pagamento:
- ✅ Exibe parcelas apenas se `installments > 1`
- ✅ Usa `installmentValue` se disponível, senão calcula
- ✅ Mostra aviso se `paymentMethod.requiresCreditAnalysis === true`

#### Datas:
- ✅ **Data do Orçamento**: Exibe `quoteDate` se status for QUOTE
- ✅ **Válido Até**: Exibe `validUntil` se status for QUOTE
- ✅ **Data da Venda**: Exibe `saleDate` se disponível
- ✅ **Confirmado em**: Nova seção com `confirmedAt`
- ✅ Mantém datas de aprovação e conclusão

#### Novas Seções:
1. **Observações Internas**:
   - Exibe `internalNotes` separadamente das observações públicas
   - Estilo diferenciado com `text-muted-foreground`

2. **Endereço de Entrega**:
   - Exibe `deliveryAddress` completo se `!useCustomerAddress`
   - Mostra rua, número, complemento, bairro, cidade/estado, CEP

3. **Motivo do Cancelamento**:
   - Suporte para `cancellationReason` ou `cancelReason` (legado)

#### Botões de Ação:
- ✅ **Editar**: Habilitado para QUOTE ou DRAFT
- ✅ **Aprovar**: Habilitado para QUOTE, DRAFT ou PENDING_APPROVAL
- ✅ **Excluir**: Habilitado para QUOTE ou DRAFT
- ✅ **Exportar PDF**: Nome do arquivo baseado em `code` e status (orcamento-XXX ou venda-XXX)

### 3. Tela de Listagem de Vendas (`/app/dashboard/vendas/page.tsx`)

#### Filtro de Status:
- ✅ Adicionada opção **"Orçamento"** (QUOTE) no select

#### Tabela de Vendas:
- ✅ Coluna "Número": Exibe `code` ao invés de `saleNumber`
- ✅ Coluna "Data": Prioriza `quoteDate` > `saleDate` > `createdAt`

#### Ações do Dropdown:
- ✅ **Editar**: Habilitado para QUOTE ou DRAFT
- ✅ **Aprovar**: Habilitado para QUOTE, DRAFT ou PENDING_APPROVAL
- ✅ Texto dinâmico: "Aprovar orçamento" (QUOTE) ou "Aprovar venda" (outros status)
- ✅ **Cancelar**: Texto dinâmico: "Cancelar orçamento" (QUOTE) ou "Cancelar venda"
- ✅ Desabilitado para COMPLETED e CANCELED

## Compatibilidade com API Legada

Todos os campos foram mantidos com fallbacks para garantir compatibilidade:

```typescript
// Exemplo: Código da venda
sale.code || sale.saleNumber

// Exemplo: Desconto
sale.discountAmount || sale.discount || 0

// Exemplo: Frete
sale.shippingCost || sale.shipping || 0

// Exemplo: Total do item
item.total || item.totalPrice || 0

// Exemplo: Motivo do cancelamento
sale.cancellationReason || sale.cancelReason
```

## Estrutura da API

### Detalhes de Venda (GET /sales/:id):
```json
{
  "code": "VDA-000001",
  "status": "QUOTE",
  "subtotal": 200,
  "discountAmount": 2,
  "discountPercent": 0,
  "shippingCost": 134,
  "otherCharges": 10,
  "otherChargesDesc": "Taxa de manuseio",
  "totalAmount": 342,
  "installmentValue": 114,
  "useCustomerAddress": true,
  "deliveryAddress": null,
  "notes": "Observações públicas",
  "internalNotes": "Observações internas",
  "quoteDate": "2025-11-10T21:06:15.033Z",
  "validUntil": "2025-11-15T23:59:59.999Z",
  "items": [
    {
      "productName": "Produto A",
      "productCode": "PROD-001",
      "quantity": 1,
      "unitPrice": 200,
      "discount": 0,
      "total": 200,
      "notes": "Item com prazo de entrega estendido",
      "stockLocation": {
        "name": "Estoque Principal",
        "code": "EST-01"
      }
    }
  ]
}
```

## Testes Recomendados

1. ✅ **Orçamentos (QUOTE)**:
   - Visualizar detalhes
   - Verificar data do orçamento e validade
   - Aprovar orçamento
   - Exportar PDF como "orcamento-XXX.pdf"

2. ✅ **Vendas Normais**:
   - Visualizar todos os campos (descontos, frete, outras despesas)
   - Verificar observações separadas (públicas + internas)
   - Verificar endereço de entrega customizado
   - Exportar PDF como "venda-XXX.pdf"

3. ✅ **Itens**:
   - Verificar local de estoque
   - Verificar observações do item
   - Verificar SKU e código do produto

4. ✅ **Listagem**:
   - Filtrar por status QUOTE
   - Verificar código correto (VDA-000001)
   - Verificar data correta (quoteDate/saleDate/createdAt)
   - Aprovar/Cancelar com textos dinâmicos

## Arquivos Modificados

1. `/lib/api/sales.ts` - Interface `Sale` e `SaleItem` atualizada
2. `/app/dashboard/vendas/[id]/page.tsx` - Tela de detalhes atualizada
3. `/app/dashboard/vendas/page.tsx` - Listagem atualizada

## Status
✅ **Implementado e Validado**
- Zero erros de compilação
- Compatibilidade com API legada mantida
- Suporte completo para orçamentos e vendas
- Todos os campos da API exibidos corretamente
