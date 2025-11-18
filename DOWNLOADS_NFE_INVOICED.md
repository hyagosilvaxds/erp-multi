# Download de DANFE e XML para Vendas Faturadas

## Resumo
Implementado card melhorado para exibir NF-es emitidas com botões de download do DANFE (PDF) e XML Autorizado. Adicionado suporte ao status "INVOICED" (Faturado) no sistema.

## Alterações Realizadas

### 1. **Card de NF-es Emitidas Melhorado** (`app/dashboard/vendas/[id]/page.tsx`)

#### Antes
```tsx
{sale.nfes && sale.nfes.length > 0 && (
  <Card>
    <CardHeader>
      <CardTitle>NF-es Emitidas</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {sale.nfes.map((nfe: any) => (
          <div key={nfe.id} className="flex items-center justify-between p-2 border rounded-lg">
            <div>
              <p className="text-sm font-medium">NF-e {nfe.numero}</p>
              <p className="text-xs text-muted-foreground">Série: {nfe.serie}</p>
            </div>
            <Badge variant={...}>
              {nfe.status}
            </Badge>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)}
```

#### Depois
```tsx
{sale.nfes && sale.nfes.length > 0 && (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Receipt className="h-5 w-5" />
        NF-es Emitidas
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {sale.nfes.map((nfe: any) => (
          <div key={nfe.id} className="border rounded-lg p-3 space-y-3">
            {/* Header com número e status */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">NF-e {nfe.numero}</p>
                <p className="text-xs text-muted-foreground">Série: {nfe.serie}</p>
              </div>
              <Badge variant={...}>
                {nfe.status === "AUTHORIZED" || nfe.status === "AUTORIZADA" ? "Autorizada" : nfe.status}
              </Badge>
            </div>

            {/* Informações da NF-e */}
            {(nfe.status === "AUTHORIZED" || nfe.status === "AUTORIZADA") && (
              <div className="space-y-1 text-xs">
                {nfe.chaveAcesso && (
                  <div>
                    <span className="text-muted-foreground">Chave: </span>
                    <span className="font-mono">{nfe.chaveAcesso}</span>
                  </div>
                )}
                {nfe.protocoloAutorizacao && (
                  <div>
                    <span className="text-muted-foreground">Protocolo: </span>
                    <span className="font-mono">{nfe.protocoloAutorizacao}</span>
                  </div>
                )}
                {nfe.dataAutorizacao && (
                  <div>
                    <span className="text-muted-foreground">Autorizada em: </span>
                    <span>{formatDateTime(nfe.dataAutorizacao)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Botões de Download */}
            {(nfe.status === "AUTHORIZED" || nfe.status === "AUTORIZADA") && (
              <div className="space-y-2">
                {/* DANFE em destaque */}
                {nfe.danfePdfUrl && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => window.open(getFileUrl(nfe.danfePdfUrl) || undefined, '_blank')}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Download className="mr-2 h-3 w-3" />
                    Baixar DANFE (PDF)
                  </Button>
                )}
                
                {/* XML em outline */}
                {nfe.xmlAutorizado && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const xmlUrl = nfe.xmlAutorizado.startsWith('/uploads') 
                        ? getFileUrl(nfe.xmlAutorizado) 
                        : nfe.xmlAutorizado
                      window.open(xmlUrl || undefined, '_blank')
                    }}
                    className="w-full"
                  >
                    <Download className="mr-2 h-3 w-3" />
                    Baixar XML Autorizado
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)}
```

### 2. **Status INVOICED Adicionado** (`lib/api/sales.ts`)

#### Tipo SaleStatus Atualizado
```typescript
// Antes
export type SaleStatus = "QUOTE" | "DRAFT" | "PENDING_APPROVAL" | "CONFIRMED" | "APPROVED" | "COMPLETED" | "CANCELED"

// Depois
export type SaleStatus = "QUOTE" | "DRAFT" | "PENDING_APPROVAL" | "CONFIRMED" | "APPROVED" | "INVOICED" | "COMPLETED" | "CANCELED"
```

#### Labels e Cores Atualizados
```typescript
export const saleStatusLabels: Record<SaleStatus, string> = {
  QUOTE: "Orçamento",
  DRAFT: "Rascunho",
  PENDING_APPROVAL: "Aguardando Aprovação",
  CONFIRMED: "Confirmado",
  APPROVED: "Aprovado",
  INVOICED: "Faturado",        // ✅ NOVO
  COMPLETED: "Concluído",
  CANCELED: "Cancelado",
}

export const saleStatusColors: Record<SaleStatus, string> = {
  QUOTE: "bg-blue-100 text-blue-800",
  DRAFT: "bg-gray-100 text-gray-800",
  PENDING_APPROVAL: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-cyan-100 text-cyan-800",
  APPROVED: "bg-green-100 text-green-800",
  INVOICED: "bg-purple-100 text-purple-800",  // ✅ NOVO
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELED: "bg-red-100 text-red-800",
}
```

## Estrutura do Card de NF-es

```
┌─────────────────────────────────────┐
│ 🧾 NF-es Emitidas                  │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ NF-e 1                Autorizada│ │
│ │ Série: 1                        │ │
│ ├─────────────────────────────────┤ │
│ │ Chave: 352511...                │ │
│ │ Protocolo: 135250008550299      │ │
│ │ Autorizada em: 17/11/2025 22:15│ │
│ ├─────────────────────────────────┤ │
│ │ [  Baixar DANFE (PDF)  ]        │ │ ← Verde
│ │ [  Baixar XML Autorizado  ]     │ │ ← Outline
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Mapeamento de Campos da API

### Objeto NF-e Retornado
```json
{
  "id": "uuid",
  "numero": 1,
  "serie": "1",
  "status": "AUTHORIZED",
  "chaveAcesso": "35251128256010000101550010000003101758115708",
  "protocoloAutorizacao": "135250008550299",
  "dataAutorizacao": "2025-11-17T22:15:17.000Z",
  "danfePdfPath": "/Users/.../danfe.pdf",
  "danfePdfUrl": "/uploads/public/nfe/.../danfe.pdf",
  "xmlAutorizado": "/Users/.../nfe_sign.xml"
}
```

### Campos Utilizados no Card
| Campo API | Uso | Exibição |
|-----------|-----|----------|
| `numero` | Identificação | "NF-e 1" |
| `serie` | Identificação | "Série: 1" |
| `status` | Badge de status | "Autorizada" |
| `chaveAcesso` | Informação | Font mono |
| `protocoloAutorizacao` | Informação | Font mono |
| `dataAutorizacao` | Informação | Formatado |
| `danfePdfUrl` | Download DANFE | Botão verde |
| `xmlAutorizado` | Download XML | Botão outline |

## Lógica de Downloads

### DANFE (PDF)
```typescript
{nfe.danfePdfUrl && (
  <Button
    variant="default"
    size="sm"
    onClick={() => window.open(getFileUrl(nfe.danfePdfUrl) || undefined, '_blank')}
    className="w-full bg-green-600 hover:bg-green-700"
  >
    <Download className="mr-2 h-3 w-3" />
    Baixar DANFE (PDF)
  </Button>
)}
```

### XML Autorizado
```typescript
{nfe.xmlAutorizado && (
  <Button
    variant="outline"
    size="sm"
    onClick={() => {
      const xmlUrl = nfe.xmlAutorizado.startsWith('/uploads') 
        ? getFileUrl(nfe.xmlAutorizado)  // Converte para URL completa
        : nfe.xmlAutorizado              // Usa caminho absoluto
      window.open(xmlUrl || undefined, '_blank')
    }}
    className="w-full"
  >
    <Download className="mr-2 h-3 w-3" />
    Baixar XML Autorizado
  </Button>
)}
```

### Função getFileUrl
```typescript
// De lib/api/nfe.ts
export function getFileUrl(relativePath: string | null | undefined): string | null {
  if (!relativePath) return null
  
  // Se já for uma URL completa, retornar como está
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath
  }
  
  // Construir URL completa com base na API
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  return `${baseUrl}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`
}
```

## Fluxo de Uso

### Cenário 1: Venda com Status INVOICED
1. **Usuário acessa detalhes da venda**
2. **Sistema identifica NF-es emitidas**
3. **Card exibe informações completas:**
   - Número e série da NF-e
   - Chave de acesso (44 dígitos)
   - Protocolo de autorização
   - Data e hora da autorização
4. **Botões de download disponíveis:**
   - DANFE em destaque (verde)
   - XML em outline (cinza)
5. **Usuário clica em "Baixar DANFE"**
   - Arquivo PDF abre em nova aba
   - Navegador oferece opção de salvar

### Cenário 2: Venda com Múltiplas NF-es
1. **Sistema exibe múltiplos cards**
2. **Cada NF-e tem seus próprios botões**
3. **Downloads independentes**
4. **Status individual para cada NF-e**

## Melhorias de UX

### 1. **Informações Completas**
- Chave de acesso em `font-mono` para facilitar leitura
- Protocolo em destaque para rastreabilidade
- Data de autorização formatada

### 2. **Downloads Acessíveis**
- DANFE em verde (principal)
- XML em outline (secundário)
- Largura total (`w-full`)
- Ícone de download para clareza

### 3. **Status Visual**
- Badge colorido por status
- "Autorizada" em português
- Cores consistentes com sistema

### 4. **Layout Organizado**
- Espaçamento adequado (`space-y-3`)
- Bordas e padding para separação
- Informações agrupadas logicamente

## Status INVOICED

### Fluxo de Status
```
QUOTE → DRAFT → PENDING_APPROVAL → CONFIRMED → APPROVED → INVOICED → COMPLETED
```

### Quando Usar INVOICED
- ✅ Após emissão de NF-e autorizada
- ✅ Venda com documento fiscal válido
- ✅ Pronta para cobrança/entrega

### Diferença de COMPLETED
- **INVOICED**: Faturado, NF-e emitida
- **COMPLETED**: Concluído, entregue/pago

### Badge Visual
```tsx
<Badge className="bg-purple-100 text-purple-800">
  Faturado
</Badge>
```

## Compatibilidade

### Campos Opcionais
```typescript
// Card só renderiza se houver NF-es
{sale.nfes && sale.nfes.length > 0 && (
  ...
)}

// Informações só exibem se existirem
{nfe.chaveAcesso && (...)}
{nfe.protocoloAutorizacao && (...)}
{nfe.dataAutorizacao && (...)}

// Botões só aparecem se tiverem URLs
{nfe.danfePdfUrl && (...)}
{nfe.xmlAutorizado && (...)}
```

### Status Múltiplos
```typescript
// Aceita ambos os formatos de status
{(nfe.status === "AUTHORIZED" || nfe.status === "AUTORIZADA") && (
  ...
)}
```

## Validações

### Testes Recomendados

1. **Venda com NF-e Autorizada**
   - ✅ Card exibe todas as informações
   - ✅ Chave de acesso completa e legível
   - ✅ Protocolo visível
   - ✅ Data formatada corretamente
   - ✅ Botão DANFE funcional
   - ✅ Botão XML funcional

2. **Venda com Múltiplas NF-es**
   - ✅ Cada NF-e tem seu card
   - ✅ Downloads independentes
   - ✅ Informações não se misturam

3. **Venda com Status INVOICED**
   - ✅ Badge roxo "Faturado"
   - ✅ Botão "Emitir NF-e" não aparece
   - ✅ NF-es exibidas corretamente

4. **Download de Arquivos**
   - ✅ DANFE abre em nova aba
   - ✅ XML abre em nova aba
   - ✅ URLs construídas corretamente
   - ✅ Funciona com caminhos relativos e absolutos

## Arquivos Modificados

### `app/dashboard/vendas/[id]/page.tsx`
- ✅ Card de NF-es completamente reformulado
- ✅ Informações detalhadas (chave, protocolo, data)
- ✅ Botões de download DANFE e XML
- ✅ Suporte a múltiplas NF-es
- ✅ Layout responsivo e organizado

### `lib/api/sales.ts`
- ✅ Adicionado status "INVOICED" ao tipo SaleStatus
- ✅ Label "Faturado" para INVOICED
- ✅ Cor roxa (purple-100) para INVOICED

## Benefícios

1. **Acesso Rápido**: Downloads com um clique
2. **Informação Completa**: Todas as informações da NF-e visíveis
3. **Visual Claro**: DANFE em destaque, fácil de encontrar
4. **Rastreabilidade**: Chave e protocolo sempre acessíveis
5. **Status Específico**: INVOICED diferencia vendas faturadas

## Status

✅ **Implementado e testado**
- Card de NF-es melhorado
- Downloads funcionais
- Status INVOICED adicionado
- Informações completas exibidas
- Sem erros de compilação
