# Sistema de Movimentações de Estoque

## 📋 Visão Geral

Sistema completo para gerenciamento de movimentações de estoque, substituindo o antigo sistema de transferências. Implementa a nova abordagem da API que registra movimentações individuais por produto com suporte a documentos comprobatórios organizados automaticamente.

## 🏗️ Arquitetura

### Abordagem Antiga (Transferências)
```
❌ DESCONTINUADO
- Transferência entre locais como entidade principal
- Múltiplos produtos por transferência
- Sem suporte a documentos
- Sem organização automática de pastas
```

### Nova Abordagem (Movimentações)
```
✅ IMPLEMENTADO
- Movimentação individual por produto
- Tipos: ENTRY, EXIT, ADJUSTMENT, RETURN, LOSS
- Upload de documentos comprobatórios
- Organização automática: Estoque/Movimentações/YYYY/Mês
```

## 📁 Estrutura de Arquivos

```
app/dashboard/produtos/estoque/
└── movimentacoes/
    ├── page.tsx              # Lista de movimentações
    ├── loading.tsx           # Loading state
    └── nova/
        └── page.tsx          # Nova movimentação
```

## 🔄 Tipos de Movimentação

| Tipo | Efeito | Descrição | Documentos Comuns |
|------|--------|-----------|-------------------|
| `ENTRY` | ➕ Aumenta | Entrada de produtos | NF Compra, Recibo |
| `EXIT` | ➖ Diminui | Saída de produtos | NF Venda, Requisição |
| `ADJUSTMENT` | ➕➖ Ajusta | Ajuste de inventário | Termo de Ajuste |
| `RETURN` | ➕➖ Varia | Devolução | Nota de Devolução |
| `LOSS` | ➖ Diminui | Perda/Quebra | Laudo de Perda |

## 🎨 Página de Listagem

### Recursos Implementados

#### 1. Filtros Avançados
- **Produto** (obrigatório): Seleciona o produto para ver movimentações
- **Tipo**: Filtra por tipo de movimentação
- **Local**: Filtra por local de estoque
- **Período**: Data inicial e final

#### 2. Tabela de Movimentações
Colunas exibidas:
- Data/Hora (formatação pt-BR)
- Tipo (badge colorido com ícone)
- Quantidade (+/- conforme tipo)
- Estoque Anterior
- Estoque Novo
- Local (nome + código)
- Motivo
- Usuário
- Documento (link para download)

#### 3. Estados Visuais
- **Sem produto selecionado**: Instruções para selecionar
- **Sem movimentações**: Botão para criar primeira movimentação
- **Com dados**: Tabela completa

### Badges de Tipo

```tsx
ENTRY       → Verde (TrendingUp)
EXIT        → Vermelho (TrendingDown)
ADJUSTMENT  → Azul (RefreshCw)
RETURN      → Amarelo (RefreshCw)
LOSS        → Laranja (TrendingDown)
TRANSFER    → Roxo (RefreshCw) [legado]
```

## 📝 Página de Nova Movimentação

### Layout

```
┌─────────────────────────────────────────────────────┐
│ [←] Nova Movimentação de Estoque                    │
├─────────────────────────────────┬───────────────────┤
│ FORMULÁRIO (2/3)                │ RESUMO (1/3)      │
│                                 │                   │
│ ┌─ Produto e Local ────────┐   │ ┌─ Resumo ──────┐│
│ │ • Produto *               │   │ │ Produto: ...  ││
│ │ • Local *                 │   │ │ Local: ...    ││
│ └───────────────────────────┘   │ │ Tipo: ...     ││
│                                 │ │               ││
│ ┌─ Detalhes ────────────────┐   │ │ Estoque:  100 ││
│ │ • Tipo *                  │   │ │ + Mov:     50 ││
│ │ • Quantidade *            │   │ │ ───────────── ││
│ │ • Motivo                  │   │ │ Final:    150 ││
│ │ • Referência              │   │ │               ││
│ │ • Observações             │   │ │ [Registrar]   ││
│ └───────────────────────────┘   │ └───────────────┘│
│                                 │                   │
│ ┌─ Documento ───────────────┐   │                   │
│ │ [Upload opcional]         │   │                   │
│ └───────────────────────────┘   │                   │
└─────────────────────────────────┴───────────────────┘
```

### Campos do Formulário

#### Produto e Local
- **Produto** (obrigatório): Lista produtos com `manageStock = true`
- **Local** (obrigatório): Lista locais ativos, mostra estoque atual

#### Detalhes
- **Tipo** (obrigatório): Dropdown com descrição de cada tipo
- **Quantidade** (obrigatório): Número > 0
- **Motivo**: Texto livre (ex: "Compra fornecedor X")
- **Referência**: Texto livre (ex: "NF 12345")
- **Observações**: Textarea para notas adicionais

#### Documento (Opcional)
- Upload de PDF, JPG, PNG, XML
- Será organizado em: `Estoque/Movimentações/2025/Novembro`
- Preview do arquivo após upload
- Botão para remover

### Validações

#### Campos Obrigatórios
```typescript
✓ Produto selecionado
✓ Local selecionado
✓ Quantidade > 0
```

#### Validação de Estoque
Para tipos EXIT e LOSS:
```typescript
if (quantidade > estoque_disponivel) {
  erro: "Estoque insuficiente"
}
```

### Card de Resumo

Exibe em tempo real:
- Produto selecionado
- Local selecionado
- Tipo de movimentação
- **Estoque Atual**: Quantidade disponível no local
- **Movimentação**: +/- quantidade informada
- **Estoque Final**: Cálculo do resultado

#### Cálculo do Estoque Final

```typescript
ENTRY ou RETURN:    final = atual + quantidade
EXIT ou LOSS:       final = atual - quantidade
ADJUSTMENT:         final = quantidade (novo total)
```

## 🔌 Integração com API

### Tipos e Interfaces

```typescript
// Tipo de movimentação
type StockMovementType = 
  | 'ENTRY' 
  | 'EXIT' 
  | 'ADJUSTMENT' 
  | 'RETURN' 
  | 'LOSS' 
  | 'TRANSFER'

// Request para criar movimentação
interface CreateStockMovementRequest {
  type: StockMovementType
  quantity: number
  locationId: string
  documentId?: string
  reason?: string
  notes?: string
  reference?: string
}

// Movimentação completa
interface StockMovement {
  id: string
  companyId: string
  productId: string
  type: StockMovementType
  quantity: number
  previousStock: number
  newStock: number
  locationId: string
  location?: {
    id: string
    name: string
    code: string
  }
  documentId?: string
  document?: {
    id: string
    fileName: string
    fileUrl: string
    title?: string
    type?: string
    tags?: string[]
    fileSize: number
    mimeType: string
    folder?: {
      id: string
      name: string
      parentId?: string
      parent?: {
        name: string
        parent?: {
          name: string
          parent?: {
            name: string
          }
        }
      }
    }
    uploadedBy?: {
      id: string
      name: string
      email: string
    }
    createdAt: string
  }
  reason?: string
  notes?: string
  reference?: string
  userId: string
  user?: {
    id: string
    name: string
    email: string
  }
  createdAt: string
}

// Parâmetros para listar
interface ListStockMovementsParams {
  type?: StockMovementType
  locationId?: string
  startDate?: string  // ISO 8601
  endDate?: string    // ISO 8601
  page?: number
  limit?: number
}
```

### Métodos da API

```typescript
// Criar movimentação
productsApi.addStockMovement(
  productId: string,
  data: CreateStockMovementRequest
): Promise<StockMovement>

// Listar movimentações de um produto
productsApi.getStockMovements(
  productId: string,
  params?: ListStockMovementsParams
): Promise<ListStockMovementsResponse>
```

### Exemplo de Uso

```typescript
// Criar entrada de 50 unidades
const movement = await productsApi.addStockMovement(
  'product-uuid',
  {
    type: 'ENTRY',
    quantity: 50,
    locationId: 'location-uuid',
    documentId: 'doc-uuid',  // opcional
    reason: 'Compra fornecedor X',
    reference: 'NF 12345'
  }
)

// Listar movimentações do último mês
const { data, total } = await productsApi.getStockMovements(
  'product-uuid',
  {
    startDate: '2025-10-01',
    endDate: '2025-10-31',
    page: 1,
    limit: 50
  }
)
```

## 🎯 Fluxo de Uso

### 1. Visualizar Movimentações
```
1. Acessar /dashboard/produtos/estoque/movimentacoes
2. Selecionar produto nos filtros
3. Ver histórico de movimentações
4. Filtrar por tipo, local ou período
5. Exportar dados (futuro)
```

### 2. Criar Movimentação
```
1. Clicar em "Nova Movimentação"
2. Selecionar produto e local
3. Escolher tipo de movimentação
4. Informar quantidade e detalhes
5. (Opcional) Anexar documento
6. Conferir resumo no card lateral
7. Clicar em "Registrar Movimentação"
```

### 3. Comportamento do Sistema
```
Backend realiza automaticamente:
1. ✓ Valida produto e local
2. ✓ Verifica estoque disponível (EXIT/LOSS)
3. ✓ Move documento para pasta correta (se fornecido)
4. ✓ Atualiza ProductStockByLocation
5. ✓ Atualiza Product.currentStock
6. ✓ Cria registro em ProductStockMovement
7. ✓ Registra em AuditLog
```

## 📊 Melhorias Futuras

### Página de Listagem
- [ ] Exportação para Excel/PDF
- [ ] Gráficos de movimentações por período
- [ ] Filtro por usuário que criou
- [ ] Busca por referência/motivo
- [ ] Visualização de detalhes em modal

### Página de Criação
- [ ] Upload de múltiplos documentos
- [ ] Sugestão de quantidade baseada em histórico
- [ ] Validação de preço (custo médio)
- [ ] Campos personalizados por tipo
- [ ] Template de motivos recorrentes

### API Integration
- [x] ~~Implementar documentsApi.upload()~~ ✅ Já implementado
- [x] ~~Download de documentos~~ ✅ Implementado com componente
- [ ] Webhook para notificações
- [ ] Integração com ERP externo
- [ ] Importação em lote (CSV/Excel)

## 📥 Sistema de Documentos

### Endpoints Disponíveis

#### 1. Buscar Documento por ID
```typescript
GET /documents/:id

documentsApi.getById(id: string)
```

**Response:** Documento completo com todas as informações

#### 2. Download de Documento
```typescript
GET /documents/:id/download

// Opção 1: Obter blob
documentsApi.download(id: string): Promise<Blob>

// Opção 2: Download direto (helper)
documentsApi.downloadFile(id: string, fileName?: string): Promise<void>
```

### Componente de Download

```typescript
import { DocumentDownloadButton } from '@/components/documents/download-button'

// Na tabela de movimentações
<TableCell>
  {movement.document ? (
    <DocumentDownloadButton
      documentId={movement.document.id}
      fileName={movement.document.fileName}
    />
  ) : (
    '-'
  )}
</TableCell>
```

**Variantes do Componente:**

```typescript
// Botão simples (usado na tabela)
<DocumentDownloadButton 
  documentId={doc.id} 
  fileName={doc.fileName}
/>

// Card completo com informações
<DocumentDownloadButton 
  documentId={doc.id}
  variant="card"
  document={{
    fileName: doc.fileName,
    fileSize: doc.fileSize,
    mimeType: doc.mimeType,
    uploadedBy: doc.uploadedBy,
    createdAt: doc.createdAt,
  }}
/>
```

**Recursos:**
- ✅ Download automático via helper function
- ✅ Indicador de loading durante download
- ✅ Toast de feedback (sucesso/erro)
- ✅ Formatação de tamanho de arquivo (KB/MB)
- ✅ Badge com tipo de arquivo (PDF, Imagem, etc)
- ✅ Informações de quem fez upload

### Upload de Documentos

**Campo `context` - Organização Automática:**

Ao fazer upload de documentos para movimentações de estoque, use o campo `context` para organização automática:

```typescript
const result = await documentsApi.upload({
  file,
  name: `Movimentação - ${file.name}`,
  documentType: 'nota_fiscal_entrada', // ou outro tipo
  tags: 'movimentacao,estoque,entrada',
  context: 'stock_movement', // Organização automática
})
```

**Organização de pastas por `context`:**
- `context: 'stock_movement'` → Pasta: `Estoque/Movimentações/YYYY/MêsNome/`
- `context: 'stock_transfer'` → Pasta: `Estoque/Transferências/YYYY/MêsNome/`
- Sem `context` → Documento fica na raiz (sem pasta)

**Tipos de documento recomendados para movimentações:**

| Tipo de Movimentação | `documentType` Sugerido |
|---------------------|------------------------|
| ENTRY (Entrada) | `nota_fiscal_entrada`, `recibo` |
| EXIT (Saída) | `nota_fiscal_saida` |
| ADJUSTMENT (Ajuste) | `termo_ajuste` |
| RETURN (Devolução) | `nota_devolucao` |
| LOSS (Perda) | `laudo_perda` |
| TRANSFER | `guia_transferencia` |
- ✅ Indicador de loading durante download
- ✅ Toast de feedback (sucesso/erro)
- ✅ Formatação de tamanho de arquivo (KB/MB)
- ✅ Badge com tipo de arquivo (PDF, Imagem, etc)
- ✅ Informações de quem fez upload

## 🔒 Permissões

```typescript
// Visualizar movimentações
can('produtos', 'view')

// Criar movimentações
can('produtos', 'edit')
```

## 📝 Arquivos Modificados

### Novos Arquivos
- `/app/dashboard/produtos/estoque/movimentacoes/page.tsx` - Listagem
- `/app/dashboard/produtos/estoque/movimentacoes/nova/page.tsx` - Criação
- `/app/dashboard/produtos/estoque/movimentacoes/loading.tsx` - Loading

### Arquivos Atualizados
- `/lib/api/products.ts`:
  * Adicionado `StockMovement` interface completa com documento
  * Adicionado `CreateStockMovementRequest` atualizado
  * Adicionado `ListStockMovementsParams`
  * Adicionado `ListStockMovementsResponse`
  * Adicionado método `getStockMovements()`
- `/lib/api/documents.ts`:
  * Adicionado método `downloadFile()` helper
  * Suporte completo a download de documentos
- `/components/documents/download-button.tsx`:
  * Novo componente para download de documentos
  * Variantes: button e card
  * Feedback visual e loading states
- `/app/dashboard/produtos/estoque/movimentacoes/page.tsx`:
  * Integrado botão de download na tabela
  * Substituído link simples por componente interativo

## 🎨 Design System

### Cores por Tipo
```css
ENTRY:      bg-green-100 text-green-800
EXIT:       bg-red-100 text-red-800
ADJUSTMENT: bg-blue-100 text-blue-800
RETURN:     bg-yellow-100 text-yellow-800
LOSS:       bg-orange-100 text-orange-800
TRANSFER:   bg-purple-100 text-purple-800
```

### Ícones
- Lucide Icons: TrendingUp, TrendingDown, RefreshCw, Package
- Tamanho padrão: w-4 h-4

### Formatação
- Datas: `toLocaleString('pt-BR')` com hora
- Números: `toLocaleString('pt-BR')`
- Quantidade: Prefixo +/- conforme tipo

## ✅ Status de Implementação

### ✅ Concluído
- [x] Interface de listagem de movimentações
- [x] Filtros avançados (produto, tipo, local, período)
- [x] Tabela com todas as colunas necessárias
- [x] Estados visuais (vazio, carregando, com dados)
- [x] Formulário de nova movimentação
- [x] Card de resumo com cálculo em tempo real
- [x] Validações de formulário
- [x] Sistema de download de documentos
- [x] Componente de download reutilizável
- [x] Feedback visual completo (toasts, loading)
- [x] Validação de estoque insuficiente
- [x] Integração com API (addStockMovement, getStockMovements)
- [x] Tipos e interfaces TypeScript completos
- [x] Loading states
- [x] Feedback visual (toasts)
- [x] Formatação pt-BR

### 🚧 Pendente
- [ ] Upload de documentos (documentsApi)
- [ ] Visualização de detalhes da movimentação
- [ ] Exportação de relatórios
- [ ] Gráficos e estatísticas

## 📚 Referências

- Documentação da API: Ver SISTEMA_MOVIMENTACOES_ESTOQUE.md (parte 1)
- Fluxo de upload: Ver diagrama de sequência na documentação
- Permissões: Ver SISTEMA_PERMISSOES_INTEGRACOES.md
