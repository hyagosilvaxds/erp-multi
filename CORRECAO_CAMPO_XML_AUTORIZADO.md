# Correção: Campo XML Autorizado para xmlAutorizadoUrl

## Problema Identificado
O backend retorna o campo `xmlAutorizadoUrl` nas NF-es, mas o frontend estava verificando `xmlAutorizado` (sem "Url" no final). Isso fazia com que o botão de download de XML não aparecesse mesmo quando o arquivo estava disponível.

## Solução Implementada

### 1. Atualização nos Botões do Header (Status INVOICED)

**Antes:**
```typescript
{(sale.nfes?.[0] as any)?.xmlAutorizado && (
  <Button
    variant="outline"
    onClick={() => {
      const xmlUrl = (sale.nfes?.[0] as any).xmlAutorizado.startsWith('/uploads') 
        ? getFileUrl((sale.nfes?.[0] as any).xmlAutorizado) 
        : (sale.nfes?.[0] as any).xmlAutorizado
      window.open(xmlUrl || undefined, '_blank')
    }}
  >
    <Download className="mr-2 h-4 w-4" />
    Baixar XML
  </Button>
)}
```

**Depois:**
```typescript
{(sale.nfes?.[0] as any)?.xmlAutorizadoUrl && (
  <Button
    variant="outline"
    onClick={() => window.open(getFileUrl((sale.nfes?.[0] as any).xmlAutorizadoUrl) || undefined, '_blank')}
  >
    <Download className="mr-2 h-4 w-4" />
    Baixar XML
  </Button>
)}
```

### 2. Atualização no Card de NF-es na Sidebar

**Antes:**
```typescript
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
```

**Depois:**
```typescript
{nfe.xmlAutorizadoUrl && (
  <Button
    variant="outline"
    size="sm"
    onClick={() => window.open(getFileUrl(nfe.xmlAutorizadoUrl) || undefined, '_blank')}
    className="w-full"
  >
    <Download className="mr-2 h-3 w-3" />
    Baixar XML Autorizado
  </Button>
)}
```

## Melhorias Implementadas

### 1. Simplificação do Código
- **Removido:** Lógica condicional para verificar se começa com `/uploads`
- **Motivo:** A função `getFileUrl()` já faz essa verificação internamente
- **Benefício:** Código mais limpo e menos propenso a erros

### 2. Uso Consistente de getFileUrl()
- Todos os downloads de arquivo agora usam `getFileUrl()` diretamente
- A função trata automaticamente:
  - Caminhos relativos (`/uploads/nfes/xml-123.xml`)
  - Caminhos sem barra inicial (`uploads/nfes/xml-123.xml`)
  - URLs absolutas (`http://...` ou `https://...`)
  - Valores nulos ou undefined

### 3. Campo Correto do Backend
- **Campo antigo (incorreto):** `xmlAutorizado`
- **Campo novo (correto):** `xmlAutorizadoUrl`
- **Alinhamento:** Frontend agora usa o mesmo nome de campo que o backend retorna

## Estrutura de Dados da NF-e

### Campos Retornados pelo Backend
```typescript
interface NFe {
  id: string
  numero: string
  serie: string
  status: string
  chaveAcesso?: string
  protocoloAutorizacao?: string
  dataAutorizacao?: string
  
  // Arquivos (URLs relativas ou absolutas)
  danfePdfUrl?: string          // PDF da DANFE
  xmlAutorizadoUrl?: string     // XML autorizado pela SEFAZ (CORRETO)
  xmlGeradoUrl?: string         // XML gerado antes da assinatura
  xmlAssinadoUrl?: string       // XML assinado
  xmlErroUrl?: string           // JSON com detalhes de erro (se rejeitado)
}
```

### Como o getFileUrl() Funciona

```typescript
export const getFileUrl = (path?: string): string | null => {
  if (!path) return null
  
  const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://back.otimizeagenda.com'
  
  // Se já for uma URL completa, retorna como está
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  
  // Se começar com /, concatena direto
  if (path.startsWith('/')) {
    return `${baseURL}${path}`
  }
  
  // Senão, adiciona / antes
  return `${baseURL}/${path}`
}
```

### Exemplos de Conversão

#### Exemplo 1: Caminho Relativo com /
```typescript
const path = "/uploads/nfes/xml-autorizado-123.xml"
const url = getFileUrl(path)
// Resultado: "http://localhost:4000/uploads/nfes/xml-autorizado-123.xml"
```

#### Exemplo 2: Caminho Relativo sem /
```typescript
const path = "uploads/nfes/xml-autorizado-123.xml"
const url = getFileUrl(path)
// Resultado: "http://localhost:4000/uploads/nfes/xml-autorizado-123.xml"
```

#### Exemplo 3: URL Absoluta (S3, etc)
```typescript
const path = "https://s3.amazonaws.com/bucket/nfes/xml-123.xml"
const url = getFileUrl(path)
// Resultado: "https://s3.amazonaws.com/bucket/nfes/xml-123.xml" (não altera)
```

## Locais Atualizados

### Arquivo: app/dashboard/vendas/[id]/page.tsx

#### 1. Botões do Header (linha ~475)
- **Contexto:** Botões principais quando venda tem status INVOICED
- **Campo atualizado:** `xmlAutorizado` → `xmlAutorizadoUrl`
- **Simplificado:** Removida lógica condicional, usando apenas `getFileUrl()`

#### 2. Card de NF-es na Sidebar (linha ~972)
- **Contexto:** Card que lista todas as NF-es emitidas para a venda
- **Campo atualizado:** `nfe.xmlAutorizado` → `nfe.xmlAutorizadoUrl`
- **Simplificado:** Removida lógica condicional, usando apenas `getFileUrl()`

## Impacto e Benefícios

### ✅ Correções
1. **Botão de XML agora aparece corretamente** quando o backend retorna `xmlAutorizadoUrl`
2. **Alinhamento com o backend:** Frontend usa os mesmos nomes de campos
3. **Download funciona com localhost:4000** (backend) ao invés de localhost:3000 (frontend)

### ✅ Melhorias de Código
1. **Código mais limpo:** Removida lógica condicional desnecessária
2. **Menos duplicação:** Função `getFileUrl()` centraliza a lógica de conversão
3. **Mais robusto:** Trata todos os casos (relativo, absoluto, com/sem barra)

### ✅ Manutenibilidade
1. **Único ponto de mudança:** Alterações na URL base só precisam ser feitas no `.env`
2. **Consistência:** Todos os downloads seguem o mesmo padrão
3. **Testabilidade:** Função `getFileUrl()` pode ser testada isoladamente

## Teste da Funcionalidade

### Cenário 1: Venda com Status INVOICED
1. Abrir uma venda que já foi faturada (status INVOICED)
2. No header da página, verificar botões "Baixar DANFE" e "Baixar XML"
3. Clicar em "Baixar XML"
4. Verificar que a URL abre corretamente: `http://localhost:4000/uploads/nfes/...`

### Cenário 2: Card de NF-es na Sidebar
1. Abrir qualquer venda que tenha NF-es emitidas
2. Na sidebar direita, localizar o card "NF-es Emitidas"
3. Para cada NF-e autorizada, verificar botões "Baixar DANFE" e "Baixar XML Autorizado"
4. Clicar em "Baixar XML Autorizado"
5. Verificar que a URL abre corretamente: `http://localhost:4000/uploads/nfes/...`

### Cenário 3: Modal de Emissão (não alterado)
1. O modal de emissão já estava usando os campos corretos
2. Não houve alterações nessa parte do código
3. Downloads continuam funcionando normalmente após emissão

## Verificação de Erros

### TypeScript
```bash
# Nenhum erro de compilação TypeScript
✅ No errors found in app/dashboard/vendas/[id]/page.tsx
```

### Variáveis de Ambiente
```env
# Arquivo .env já configurado
BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

### Runtime
- Função `getFileUrl()` trata valores `null` ou `undefined` retornando `null`
- Operador `||` garante que `undefined` seja tratado antes de passar para `window.open()`
- Parâmetro `'_blank'` garante que o download abre em nova aba

## Campos Relacionados

### NF-e Completa (Resposta do Backend)
```json
{
  "id": "uuid",
  "numero": "12345",
  "serie": "1",
  "status": "AUTORIZADA",
  "chaveAcesso": "35240912345678901234550010000123451000123456",
  "protocoloAutorizacao": "135240123456789",
  "dataAutorizacao": "2024-11-17T10:30:00.000Z",
  
  "danfePdfUrl": "/uploads/nfes/danfe-12345.pdf",
  "xmlAutorizadoUrl": "/uploads/nfes/xml-autorizado-12345.xml",
  "xmlGeradoUrl": "/uploads/nfes/xml-gerado-12345.xml",
  "xmlAssinadoUrl": "/uploads/nfes/xml-assinado-12345.xml"
}
```

### Sale com NF-es (Resposta de GET /sales/:id)
```json
{
  "id": "uuid",
  "code": "VENDA-2024-0001",
  "status": "INVOICED",
  "nfes": [
    {
      "id": "uuid",
      "numero": "12345",
      "serie": "1",
      "status": "AUTORIZADA",
      "chaveAcesso": "35240912345678901234550010000123451000123456",
      "protocoloAutorizacao": "135240123456789",
      "dataAutorizacao": "2024-11-17T10:30:00.000Z",
      "danfePdfUrl": "/uploads/nfes/danfe-12345.pdf",
      "xmlAutorizadoUrl": "/uploads/nfes/xml-autorizado-12345.xml"
    }
  ]
}
```

## Comparação: Antes vs Depois

### Antes (Incorreto)
```typescript
// ❌ Campo errado + lógica condicional desnecessária
{(sale.nfes?.[0] as any)?.xmlAutorizado && (
  <Button onClick={() => {
    const xmlUrl = (sale.nfes?.[0] as any).xmlAutorizado.startsWith('/uploads') 
      ? getFileUrl((sale.nfes?.[0] as any).xmlAutorizado) 
      : (sale.nfes?.[0] as any).xmlAutorizado
    window.open(xmlUrl || undefined, '_blank')
  }}>
    Baixar XML
  </Button>
)}
```

**Problemas:**
- Campo `xmlAutorizado` não existe na resposta do backend
- Lógica condicional `.startsWith('/uploads')` é redundante
- Código verboso e difícil de manter
- Botão nunca aparecia porque o campo não existia

### Depois (Correto)
```typescript
// ✅ Campo correto + código simplificado
{(sale.nfes?.[0] as any)?.xmlAutorizadoUrl && (
  <Button onClick={() => window.open(getFileUrl((sale.nfes?.[0] as any).xmlAutorizadoUrl) || undefined, '_blank')}>
    Baixar XML
  </Button>
)}
```

**Benefícios:**
- Campo `xmlAutorizadoUrl` corresponde ao retornado pelo backend
- `getFileUrl()` centraliza toda a lógica de conversão
- Código limpo e fácil de entender
- Botão aparece corretamente quando há XML disponível

## Conclusão

A atualização de `xmlAutorizado` para `xmlAutorizadoUrl` resolve o problema de compatibilidade entre frontend e backend, garantindo que:

1. ✅ O botão de download de XML aparece quando o arquivo está disponível
2. ✅ A URL gerada aponta para o backend correto (`localhost:4000`)
3. ✅ O código é mais limpo e manutenível
4. ✅ A função `getFileUrl()` é usada de forma consistente em todo o código

**Nenhuma alteração adicional é necessária.** Basta reiniciar o servidor Next.js para garantir que as variáveis de ambiente sejam carregadas:

```bash
# Parar servidor (Ctrl+C)
rm -rf .next
npm run dev
```
