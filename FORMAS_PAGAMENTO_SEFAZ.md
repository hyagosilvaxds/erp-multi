# Formas de Pagamento com Códigos SEFAZ

## Visão Geral

Implementação completa do campo obrigatório `sefazCode` para formas de pagamento personalizadas, permitindo a correta emissão de NF-e com os códigos padronizados pela SEFAZ.

## 🔑 Campo Obrigatório: `sefazCode`

O campo `sefazCode` é **obrigatório** para todas as formas de pagamento e será utilizado na tag `<tPag>` da NF-e.

### Exemplo de Criação

```typescript
await paymentMethodsApi.create({
  name: "PIX Dinâmico",
  code: "PIX_DYNAMIC",
  type: "PIX",
  sefazCode: "PIX_DINAMICO", // ⚠️ OBRIGATÓRIO
  active: true
})
```

## 📊 Tabela Completa de Códigos SEFAZ

| Enum (Backend)                          | Código | Descrição                                          | Exemplo de Uso                    |
|-----------------------------------------|--------|---------------------------------------------------|-----------------------------------|
| `DINHEIRO`                              | 01     | Dinheiro                                          | Pagamento em espécie              |
| `CHEQUE`                                | 02     | Cheque                                            | Cheque bancário                   |
| `CARTAO_CREDITO`                        | 03     | Cartão de Crédito                                 | Visa, Mastercard, Amex            |
| `CARTAO_DEBITO`                         | 04     | Cartão de Débito                                  | Débito em conta                   |
| `CREDITO_LOJA`                          | 05     | Crédito Loja                                      | Crediário próprio                 |
| `VALE_ALIMENTACAO`                      | 10     | Vale Alimentação                                  | Sodexo, Alelo Alimentação         |
| `VALE_REFEICAO`                         | 11     | Vale Refeição                                     | Ticket, VR                        |
| `VALE_PRESENTE`                         | 12     | Vale Presente                                     | Gift card                         |
| `VALE_COMBUSTIVEL`                      | 13     | Vale Combustível                                  | Ticket Car, Goodcard              |
| `DUPLICATA_MERCANTIL`                   | 14     | Duplicata Mercantil                               | Boleto faturado                   |
| `BOLETO_BANCARIO`                       | 15     | Boleto Bancário                                   | Boleto padrão                     |
| `DEPOSITO_BANCARIO`                     | 16     | Depósito Bancário                                 | Depósito identificado             |
| `PIX_DINAMICO`                          | 17     | PIX Dinâmico                                      | QR Code gerado na hora            |
| `TRANSFERENCIA`                         | 18     | Transferência / Carteira Digital                  | TED, DOC, PicPay, Mercado Pago    |
| `PROGRAMA_FIDELIDADE`                   | 19     | Programa de Fidelidade / Cashback                 | Pontos, crédito virtual           |
| `PIX_ESTATICO`                          | 20     | PIX Estático                                      | QR Code fixo, chave PIX           |
| `CREDITO_EM_LOJA`                       | 21     | Crédito em Loja (Private Label)                   | Cartão próprio da loja            |
| `PAGAMENTO_ELETRONICO_NAO_INFORMADO`    | 22     | Pagamento Eletrônico não Informado                | Outros pagamentos eletrônicos     |
| `SEM_PAGAMENTO`                         | 90     | Sem pagamento                                     | Bonificação, amostra grátis       |
| `OUTROS`                                | 99     | Outros                                            | Outras formas não listadas        |

## 🎨 Mapeamento Sugerido (Frontend → Backend)

### Mapeamento Automático por Tipo

O sistema sugere automaticamente o código SEFAZ baseado no tipo interno:

| Nome da Forma de Pagamento | `type` (interno) | `sefazCode` (sugerido) |
|----------------------------|------------------|------------------------|
| Dinheiro                   | `CASH`           | `DINHEIRO`             |
| Cartão de Crédito          | `CREDIT_CARD`    | `CARTAO_CREDITO`       |
| Cartão de Débito           | `DEBIT_CARD`     | `CARTAO_DEBITO`        |
| PIX Dinâmico               | `PIX`            | `PIX_DINAMICO`         |
| PIX Estático (Chave)       | `PIX`            | `PIX_ESTATICO`         |
| Boleto Bancário            | `BANK_SLIP`      | `BOLETO_BANCARIO`      |
| Transferência Bancária     | `BANK_TRANSFER`  | `TRANSFERENCIA`        |
| Cheque                     | `CHECK`          | `CHEQUE`               |
| Vale Alimentação           | `OTHER`          | `VALE_ALIMENTACAO`     |
| Vale Refeição              | `OTHER`          | `VALE_REFEICAO`        |
| Crediário                  | `OTHER`          | `CREDITO_LOJA`         |

**Nota**: O mapeamento é apenas uma sugestão. O usuário pode alterar o código SEFAZ conforme necessário.

## 🔧 Alterações Implementadas

### 1. Interfaces TypeScript (`lib/api/payment-methods.ts`)

#### Novo Tipo: `SefazPaymentCode`

```typescript
export type SefazPaymentCode = 
  | "DINHEIRO"                            // 01
  | "CHEQUE"                              // 02
  | "CARTAO_CREDITO"                      // 03
  | "CARTAO_DEBITO"                       // 04
  | "CREDITO_LOJA"                        // 05
  | "VALE_ALIMENTACAO"                    // 10
  | "VALE_REFEICAO"                       // 11
  | "VALE_PRESENTE"                       // 12
  | "VALE_COMBUSTIVEL"                    // 13
  | "DUPLICATA_MERCANTIL"                 // 14
  | "BOLETO_BANCARIO"                     // 15
  | "DEPOSITO_BANCARIO"                   // 16
  | "PIX_DINAMICO"                        // 17
  | "TRANSFERENCIA"                       // 18
  | "PROGRAMA_FIDELIDADE"                 // 19
  | "PIX_ESTATICO"                        // 20
  | "CREDITO_EM_LOJA"                     // 21
  | "PAGAMENTO_ELETRONICO_NAO_INFORMADO"  // 22
  | "SEM_PAGAMENTO"                       // 90
  | "OUTROS"                              // 99
```

#### Interface `PaymentMethod` (Atualizada)

```typescript
export interface PaymentMethod {
  id: string
  companyId: string
  name: string
  code: string
  type: PaymentMethodType
  sefazCode: SefazPaymentCode // ⚠️ OBRIGATÓRIO para emissão de NF-e
  active: boolean
  allowInstallments: boolean
  maxInstallments: number
  installmentFee: number
  requiresCreditAnalysis: boolean
  minCreditScore: number | null
  daysToReceive: number | null
  transactionFee: number
  createdAt: string
  updatedAt: string
  installmentTemplates: InstallmentTemplate[]
}
```

#### Interface `CreatePaymentMethodDto` (Atualizada)

```typescript
export interface CreatePaymentMethodDto {
  name: string
  code: string
  type: PaymentMethodType
  sefazCode: SefazPaymentCode // ⚠️ OBRIGATÓRIO
  active?: boolean
  allowInstallments?: boolean
  maxInstallments?: number
  installmentFee?: number
  requiresCreditAnalysis?: boolean
  minCreditScore?: number
  daysToReceive?: number
  transactionFee?: number
  installmentTemplates?: Array<{
    installmentNumber: number
    daysToPayment: number
    percentageOfTotal?: number
    fixedAmount?: number
  }>
}
```

### 2. Helpers e Labels

#### `sefazPaymentCodeLabels`

Objeto com descrições e códigos numéricos:

```typescript
export const sefazPaymentCodeLabels: Record<SefazPaymentCode, { code: string; description: string }> = {
  DINHEIRO: { code: "01", description: "Dinheiro" },
  CHEQUE: { code: "02", description: "Cheque" },
  CARTAO_CREDITO: { code: "03", description: "Cartão de Crédito" },
  // ... todos os códigos
}
```

**Uso**:
```typescript
sefazPaymentCodeLabels["PIX_DINAMICO"].code        // "17"
sefazPaymentCodeLabels["PIX_DINAMICO"].description // "PIX Dinâmico (QR Code gerado na hora)"
```

#### `suggestedSefazCodeByType`

Mapeamento automático de tipo → código SEFAZ:

```typescript
export const suggestedSefazCodeByType: Record<PaymentMethodType, SefazPaymentCode> = {
  CASH: "DINHEIRO",
  CREDIT_CARD: "CARTAO_CREDITO",
  DEBIT_CARD: "CARTAO_DEBITO",
  PIX: "PIX_DINAMICO",
  BANK_SLIP: "BOLETO_BANCARIO",
  BANK_TRANSFER: "TRANSFERENCIA",
  CHECK: "CHEQUE",
  OTHER: "OUTROS",
}
```

**Uso**:
```typescript
const suggestedCode = suggestedSefazCodeByType["PIX"] // "PIX_DINAMICO"
```

### 3. Página de Configurações (`app/dashboard/vendas/configuracoes/page.tsx`)

#### Campo no Formulário

Novo campo **Código SEFAZ** adicionado entre "Tipo" e "Ativo":

```tsx
<div className="space-y-2">
  <Label htmlFor="sefazCode">
    Código SEFAZ * 
    <span className="ml-1 text-xs text-amber-600">(Obrigatório para NF-e)</span>
  </Label>
  <Select
    value={formData.sefazCode}
    onValueChange={(value: SefazPaymentCode) =>
      setFormData({ ...formData, sefazCode: value })
    }
  >
    <SelectTrigger id="sefazCode">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {Object.entries(sefazPaymentCodeLabels).map(([key, { code, description }]) => (
        <SelectItem key={key} value={key}>
          <span className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              {code}
            </Badge>
            {description}
          </span>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
  <p className="text-xs text-muted-foreground">
    Código utilizado na emissão de NF-e conforme tabela SEFAZ
  </p>
</div>
```

#### Preenchimento Automático

Quando o usuário seleciona o **Tipo**, o **Código SEFAZ** é sugerido automaticamente:

```typescript
<Select
  value={formData.type}
  onValueChange={(value: PaymentMethodType) => {
    // Quando mudar o tipo, sugere automaticamente o código SEFAZ
    const suggestedCode = suggestedSefazCodeByType[value]
    setFormData({ 
      ...formData, 
      type: value,
      sefazCode: suggestedCode 
    })
  }}
>
```

**Exemplo de Fluxo**:
1. Usuário seleciona tipo: `PIX`
2. Sistema preenche automaticamente: `sefazCode = "PIX_DINAMICO"`
3. Usuário pode alterar manualmente para `PIX_ESTATICO` se preferir

#### Coluna na Tabela

Nova coluna **Código SEFAZ** exibindo código e descrição:

```tsx
<TableCell>
  <Badge variant="secondary" className="font-mono text-xs">
    {sefazPaymentCodeLabels[method.sefazCode]?.code || method.sefazCode}
  </Badge>
  <span className="ml-2 text-xs text-muted-foreground">
    {sefazPaymentCodeLabels[method.sefazCode]?.description || '—'}
  </span>
</TableCell>
```

**Exemplo de Exibição**:
```
┌─────────────────────┬──────────────────┐
│ Código SEFAZ        │                  │
├─────────────────────┼──────────────────┤
│ [17] PIX Dinâmico (QR Code gerado na hora) │
└─────────────────────┴──────────────────┘
```

#### Alerta Informativo

Banner explicativo no formulário:

```tsx
<div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
  <p className="text-sm text-blue-800">
    <strong>ℹ️ Dica:</strong> O código SEFAZ é preenchido automaticamente 
    ao selecionar o tipo, mas você pode alterá-lo conforme necessário. 
    Este código será usado na tag <code>tPag</code> da NF-e.
  </p>
</div>
```

## 📝 Exemplos de Uso

### Exemplo 1: Criar Forma de Pagamento PIX Dinâmico

```typescript
await paymentMethodsApi.create({
  name: "PIX",
  code: "PIX",
  type: "PIX",
  sefazCode: "PIX_DINAMICO",
  active: true,
  allowInstallments: false,
  maxInstallments: 1,
  transactionFee: 0,
  daysToReceive: 0,
})
```

### Exemplo 2: Criar Forma de Pagamento Cartão de Crédito Parcelado

```typescript
await paymentMethodsApi.create({
  name: "Cartão de Crédito",
  code: "CREDIT_CARD",
  type: "CREDIT_CARD",
  sefazCode: "CARTAO_CREDITO",
  active: true,
  allowInstallments: true,
  maxInstallments: 12,
  installmentFee: 2.5, // 2.5% por parcela
  transactionFee: 3.99, // Taxa da operadora
  daysToReceive: 30,
})
```

### Exemplo 3: Criar Vale Alimentação

```typescript
await paymentMethodsApi.create({
  name: "Vale Alimentação (Sodexo)",
  code: "VALE_ALIMENTACAO",
  type: "OTHER",
  sefazCode: "VALE_ALIMENTACAO",
  active: true,
  allowInstallments: false,
  transactionFee: 4.5, // Taxa da operadora de vale
  daysToReceive: 2,
})
```

### Exemplo 4: Criar Crediário Próprio

```typescript
await paymentMethodsApi.create({
  name: "Crediário da Loja",
  code: "STORE_CREDIT",
  type: "OTHER",
  sefazCode: "CREDITO_LOJA",
  active: true,
  allowInstallments: true,
  maxInstallments: 6,
  installmentFee: 0, // Sem juros
  requiresCreditAnalysis: true,
  minCreditScore: 600,
  daysToReceive: 30,
})
```

### Exemplo 5: Criar PIX Estático (Chave PIX Fixa)

```typescript
await paymentMethodsApi.create({
  name: "PIX (Chave Fixa)",
  code: "PIX_STATIC",
  type: "PIX",
  sefazCode: "PIX_ESTATICO",
  active: true,
  allowInstallments: false,
  transactionFee: 0,
  daysToReceive: 0,
})
```

## 🔄 Fluxo de Uso na Interface

### Criar Nova Forma de Pagamento

```mermaid
graph TD
    A[Usuário clica em "Novo Método"] --> B[Preenche Nome]
    B --> C[Preenche Código]
    C --> D[Seleciona Tipo ex: PIX]
    D --> E[Sistema sugere sefazCode: PIX_DINAMICO]
    E --> F{Código correto?}
    F -->|Sim| G[Configura demais campos]
    F -->|Não| H[Altera manualmente para PIX_ESTATICO]
    H --> G
    G --> I[Clica em "Criar"]
    I --> J[POST /sales/payment-methods]
    J --> K[Forma de pagamento criada]
```

### Editar Forma de Pagamento Existente

```mermaid
graph TD
    A[Usuário clica em "Editar"] --> B[Formulário carrega dados]
    B --> C[sefazCode já preenchido]
    C --> D{Alterar código?}
    D -->|Sim| E[Seleciona novo código]
    D -->|Não| F[Altera outros campos]
    E --> F
    F --> G[Clica em "Atualizar"]
    G --> H[PUT /sales/payment-methods/:id]
    H --> I[Forma de pagamento atualizada]
```

## 🧪 Validações

### Frontend

1. **Campo Obrigatório**: `sefazCode` é obrigatório em `CreatePaymentMethodDto`
2. **Tipo Restrito**: Apenas valores do enum `SefazPaymentCode` são aceitos
3. **Sugestão Automática**: Sistema sugere código ao selecionar tipo
4. **Visualização**: Código e descrição exibidos na tabela

### Backend (Esperado)

1. **Validação de Enum**: Verificar se `sefazCode` é um valor válido
2. **Obrigatoriedade**: Rejeitar criação sem `sefazCode`
3. **Persistência**: Armazenar código no banco de dados
4. **NF-e**: Usar `sefazCode` na tag `<tPag>` ao emitir nota

## 📋 Checklist de Implementação

### ✅ Concluído

- [x] Adicionar tipo `SefazPaymentCode` com todos os códigos
- [x] Atualizar interface `PaymentMethod` com campo `sefazCode`
- [x] Atualizar interface `CreatePaymentMethodDto` com campo obrigatório
- [x] Criar helper `sefazPaymentCodeLabels` com códigos e descrições
- [x] Criar helper `suggestedSefazCodeByType` para mapeamento automático
- [x] Adicionar campo no formulário de criação/edição
- [x] Implementar preenchimento automático ao selecionar tipo
- [x] Adicionar coluna na tabela de listagem
- [x] Adicionar alerta informativo no formulário
- [x] Validar TypeScript sem erros
- [x] Documentação completa com exemplos

### 🔜 Próximos Passos

- [ ] Testar criação de formas de pagamento com diferentes códigos
- [ ] Validar integração com emissão de NF-e
- [ ] Adicionar testes unitários para helpers
- [ ] Criar seed de formas de pagamento padrão com códigos SEFAZ

## 🎯 Integração com NF-e

### Uso do Código SEFAZ na Emissão

Quando uma venda for emitida como NF-e, o código SEFAZ será usado:

```typescript
// Em lib/api/nfe.ts ou no backend
const nfePayment = {
  tPag: sefazPaymentCodeLabels[sale.paymentMethod.sefazCode].code, // "17"
  vPag: sale.totalAmount,
  // ... outros campos
}
```

### Exemplo de XML da NF-e

```xml
<pag>
  <detPag>
    <indPag>0</indPag> <!-- À vista -->
    <tPag>17</tPag>    <!-- PIX Dinâmico -->
    <vPag>100.00</vPag>
  </detPag>
</pag>
```

## 🔍 Referências

- **Manual de Orientação do Contribuinte NF-e** (Versão 7.0+)
- **Nota Técnica NT2020.006** - Inclusão de novos meios de pagamento
- **Nota Técnica NT2021.004** - Ajustes em formas de pagamento

## 🎨 Screenshots Esperados

### Formulário de Criação
```
┌────────────────────────────────────────────┐
│ Tipo *                                     │
│ ┌──────────────────────────────────────┐  │
│ │ PIX                                ▼ │  │
│ └──────────────────────────────────────┘  │
│                                            │
│ Código SEFAZ * (Obrigatório para NF-e)    │
│ ┌──────────────────────────────────────┐  │
│ │ [17] PIX Dinâmico (QR Code...)    ▼ │  │
│ └──────────────────────────────────────┘  │
│ Código utilizado na emissão de NF-e      │
│ conforme tabela SEFAZ                     │
│                                            │
│ ℹ️ Dica: O código SEFAZ é preenchido     │
│ automaticamente ao selecionar o tipo...   │
└────────────────────────────────────────────┘
```

### Tabela de Listagem
```
┌────────────┬────────┬──────┬────────────────┬─────┐
│ Nome       │ Tipo   │ Cód. │ Código SEFAZ   │ ... │
├────────────┼────────┼──────┼────────────────┼─────┤
│ PIX        │ [PIX]  │ PIX  │ [17] PIX Din...│ ✓   │
│ Cartão...  │ [CC]   │ CC   │ [03] Cartão... │ ✓   │
│ Boleto     │ [SLIP] │ BOL  │ [15] Boleto... │ ✓   │
└────────────┴────────┴──────┴────────────────┴─────┘
```

## 📚 Conclusão

A implementação do campo `sefazCode` garante que todas as formas de pagamento criadas no sistema estejam em conformidade com os requisitos da SEFAZ para emissão de NF-e. 

O sistema agora:
- ✅ Exige código SEFAZ obrigatório
- ✅ Sugere código automaticamente baseado no tipo
- ✅ Permite customização manual quando necessário
- ✅ Exibe códigos e descrições de forma clara
- ✅ Está pronto para integração com módulo de NF-e

**Resultado**: Formas de pagamento totalmente compatíveis com NF-e! 🎉
