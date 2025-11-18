# Adaptação do Módulo NF-e para API Backend

## 📋 Resumo das Alterações

As funções e tipos do módulo NF-e foram adaptados para corresponder aos endpoints reais da API backend.

## 🔄 Mudanças Principais

### 1. Status da NF-e

**Antes:**
```typescript
"RASCUNHO" | "AUTORIZADA" | "CANCELADA" | "REJEITADA"
```

**Depois (API Backend):**
```typescript
"DRAFT" | "AUTHORIZED" | "CANCELED" | "REJECTED"
```

### 2. Interface NFe

#### Campos Atualizados:
- `serie`: `number` → `string`
- `destinatarioCpfCnpj`: Novo campo (substitui `destinatarioCnpj`)
- `customer`: Novo relacionamento adicionado
- `emitenteId`: Agora opcional

### 3. Interface NFeItem

#### Campo Renomeado:
- `numeroItem` → `numero`

### 4. DTOs Atualizados

#### Novo: CreateNFeFromSaleDto
```typescript
interface CreateNFeFromSaleDto {
  saleId: string
  serie: string
  modelo: string
  naturezaOperacao: string
  tipoOperacao: number
  finalidade: number
  modalidadeFrete: number
  informacoesComplementares?: string
  informacoesFisco?: string
  observacoes?: string
}
```

#### Atualizado: CreateNFeDto
- `serie`: `number` → `string`

### 5. NFeFilters

#### Campos Renomeados:
- `dataInicio` → `startDate`
- `dataFim` → `endDate`

#### Novo Campo:
- `destinatarioId`: Filtrar por cliente

### 6. NFeListResponse

**Estrutura Antiga:**
```typescript
{
  data: NFe[]
  total: number
  page: number
  limit: number
  totalPages: number
}
```

**Nova Estrutura (API Backend):**
```typescript
{
  data: NFe[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
```

### 7. NFeStats

**Campos Renomeados:**
- `autorizada` → `emitidas`
- `cancelada` → `canceladas`
- `rejeitada` → removido
- `rascunho` → `rascunhos`
- `valorTotal` → `valorTotalEmitidas`

**Estrutura Final:**
```typescript
{
  total: number
  emitidas: number
  canceladas: number
  rascunhos: number
  valorTotalEmitidas: number
}
```

## 🆕 Novas Funções

### createNFeFromSale()
```typescript
export async function createNFeFromSale(dto: CreateNFeFromSaleDto): Promise<NFe>
```

Cria uma NF-e a partir de uma venda existente, usando o endpoint `POST /nfe/from-sale`.

**Exportado em nfeApi:**
```typescript
nfeApi.createFromSale(dto)
```

## 📝 Atualizações nas Páginas

### Lista de NF-es (`app/dashboard/nfe/page.tsx`)

#### Estatísticas Atualizadas:
- Card "Autorizadas": `stats.autorizada` → `stats.emitidas`
- Card "Canceladas": `stats.cancelada` → `stats.canceladas`
- Card "Rejeitadas" → Card "Rascunhos": `stats.rascunhos`
- Card "Valor Total": `stats.valorTotal` → `stats.valorTotalEmitidas`

#### Filtros de Status:
```typescript
// Antes
<SelectItem value="RASCUNHO">Rascunho</SelectItem>
<SelectItem value="AUTORIZADA">Autorizada</SelectItem>
<SelectItem value="CANCELADA">Cancelada</SelectItem>
<SelectItem value="REJEITADA">Rejeitada</SelectItem>

// Depois
<SelectItem value="DRAFT">Rascunho</SelectItem>
<SelectItem value="AUTHORIZED">Autorizada</SelectItem>
<SelectItem value="CANCELED">Cancelada</SelectItem>
<SelectItem value="REJECTED">Rejeitada</SelectItem>
```

#### Tabela:
- Paginação: `response.total` → `response.meta.total`
- Destinatário: `nfe.destinatario` → `nfe.customer`
- Status: Atualizado para novos valores

#### Ações:
- Editar: `status === "RASCUNHO"` → `status === "DRAFT"`
- Download: `status === "AUTORIZADA"` → `status === "AUTHORIZED"`

### Detalhes da NF-e (`app/dashboard/nfe/[id]/page.tsx`)

#### Permissões:
```typescript
const canEmit = nfe.status === "DRAFT" || nfe.status === "VALIDADA"
const canCancel = nfe.status === "AUTHORIZED"
const canEdit = nfe.status === "DRAFT"
const canDelete = nfe.status === "DRAFT"
const canDownload = nfe.status === "AUTHORIZED"
```

#### Exibição de Dados:
- Destinatário: `nfe.destinatario` → `nfe.customer`
- CPF/CNPJ: `destinatarioCpfCnpj`
- Itens: `item.numeroItem` → `item.numero`

### Helpers

#### nfeStatusLabels
```typescript
{
  DRAFT: "Rascunho",
  AUTHORIZED: "Autorizada",
  CANCELED: "Cancelada",
  REJECTED: "Rejeitada",
  // ...
}
```

#### nfeStatusColors
```typescript
{
  DRAFT: "bg-gray-100 text-gray-800",
  AUTHORIZED: "bg-green-100 text-green-800",
  CANCELED: "bg-gray-100 text-gray-800",
  REJECTED: "bg-red-100 text-red-800",
  // ...
}
```

#### getStatusIcon (páginas)
```typescript
case "AUTHORIZED": return <CheckCircle />
case "CANCELED": return <XCircle />
case "REJECTED": return <AlertCircle />
```

## 🔗 Endpoints Mapeados

| Função | Método | Endpoint | DTO |
|--------|--------|----------|-----|
| `getNFeStats()` | GET | `/nfe/stats` | - |
| `getNFes()` | GET | `/nfe` | NFeFilters |
| `getNFeById()` | GET | `/nfe/:id` | - |
| `createNFe()` | POST | `/nfe` | CreateNFeDto |
| `createNFeFromSale()` | POST | `/nfe/from-sale` | CreateNFeFromSaleDto |
| `updateNFe()` | PUT | `/nfe/:id` | UpdateNFeDto |
| `deleteNFe()` | DELETE | `/nfe/:id` | - |
| `emitirNFe()` | POST | `/nfe/emitir` | EmitirNFeDto |
| `cancelarNFe()` | POST | `/nfe/:id/cancelar` | CancelarNFeDto |
| `downloadNFeXML()` | GET | `/nfe/:id/xml` | - |
| `downloadNFePDF()` | GET | `/nfe/:id/pdf` | - |
| `consultarNFe()` | POST | `/nfe/:id/consultar` | - |

## 📊 Fluxo de Criação da NF-e

### Opção 1: Manual
```
Nova NF-e → Preencher dados → POST /nfe → DRAFT
```

### Opção 2: Da Venda
```
Selecionar venda → POST /nfe/from-sale → DRAFT (com dados pré-preenchidos)
```

### Opção 3: Emissão
```
DRAFT → POST /nfe/emitir → AUTHORIZED
```

## ✅ Compatibilidade

### Backend Esperado
- ✅ Status: `DRAFT`, `AUTHORIZED`, `CANCELED`, `REJECTED`
- ✅ Response de listagem com `meta` object
- ✅ Estatísticas com nomes corretos
- ✅ Relacionamento `customer` na NFe
- ✅ Campo `numero` nos itens (não `numeroItem`)
- ✅ Campo `destinatarioCnpjCpf` (não separado)

### Frontend Adaptado
- ✅ Todos os status atualizados
- ✅ Filtros usando novos status
- ✅ Paginação usando `response.meta`
- ✅ Exibição de dados do `customer`
- ✅ Labels e cores atualizados
- ✅ Nova função `createFromSale`

## 🔧 Testes Necessários

1. ✅ Compilação TypeScript sem erros
2. ⏳ Integração com backend real
3. ⏳ Listagem com filtros e paginação
4. ⏳ Estatísticas no dashboard
5. ⏳ Criação de NF-e manual
6. ⏳ Criação de NF-e da venda
7. ⏳ Emissão de NF-e
8. ⏳ Cancelamento de NF-e
9. ⏳ Downloads (XML e PDF)
10. ⏳ Exibição de detalhes completos

## 📝 Próximos Passos

1. Testar integração com backend real
2. Implementar página de criação manual (wizard)
3. Implementar página de gerar da venda específica
4. Implementar página de edição
5. Adicionar validações de formulário
6. Adicionar testes unitários
7. Adicionar tratamento de erros específicos
8. Implementar loading states mais detalhados

## 🎯 Status

- ✅ **API Client:** Totalmente adaptado
- ✅ **Interfaces TypeScript:** Atualizadas
- ✅ **Página de Listagem:** Adaptada
- ✅ **Página de Detalhes:** Adaptada
- ✅ **Labels e Cores:** Atualizados
- ⏳ **Testes de Integração:** Pendente
- ⏳ **Páginas de Criação:** Pendente

---

**Data da Adaptação:** 16/11/2025
**Status:** ✅ Pronto para testes de integração
**Compilação:** ✅ Sem erros TypeScript
