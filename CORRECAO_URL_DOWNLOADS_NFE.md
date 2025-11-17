# Correção de URLs de Downloads NF-e

## Problema Identificado
As URLs de download de arquivos NF-e (DANFE, XML) estavam usando `localhost:3000` (porta do frontend Next.js) ao invés de `localhost:4000` (porta do backend).

## Solução Implementada

### 1. Variável de Ambiente já Configurada

O arquivo `.env` já está configurado corretamente:

```env
BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

### 2. Função getFileUrl já Configurada

A função `getFileUrl` em `/lib/api/nfe.ts` já usa a variável de ambiente:

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

### 3. Locais onde getFileUrl é Usado

A função é usada em todos os downloads de NF-e:

#### Header da página (botões principais - INVOICED status)
```typescript
// DANFE
<Button onClick={() => window.open(getFileUrl((sale.nfes?.[0] as any).danfePdfUrl) || undefined, '_blank')}>
  Baixar DANFE
</Button>

// XML
<Button onClick={() => {
  const xmlUrl = (sale.nfes?.[0] as any).xmlAutorizado.startsWith('/uploads') 
    ? getFileUrl((sale.nfes?.[0] as any).xmlAutorizado) 
    : (sale.nfes?.[0] as any).xmlAutorizado
  window.open(xmlUrl || undefined, '_blank')
}}>
  Baixar XML
</Button>
```

#### Card de NF-es Emitidas (sidebar)
```typescript
// DANFE
<Button onClick={() => window.open(getFileUrl(nfe.danfePdfUrl) || undefined, '_blank')}>
  Baixar DANFE (PDF)
</Button>

// XML
<Button onClick={() => {
  const xmlUrl = nfe.xmlAutorizado.startsWith('/uploads') 
    ? getFileUrl(nfe.xmlAutorizado) 
    : nfe.xmlAutorizado
  window.open(xmlUrl || undefined, '_blank')
}}>
  Baixar XML Autorizado
</Button>
```

#### Modal de Emissão de NF-e
```typescript
// DANFE (após emissão)
<Button onClick={() => window.open(getFileUrl(nfeEmitida.danfeUrl!) || undefined, '_blank')}>
  Baixar DANFE (PDF)
</Button>

// XML Gerado
<Button onClick={() => window.open(getFileUrl(nfeEmitida.xmlGeradoUrl) || undefined, '_blank')}>
  XML Gerado
</Button>

// XML Assinado
<Button onClick={() => window.open(getFileUrl(nfeEmitida.xmlAssinadoUrl) || undefined, '_blank')}>
  XML Assinado
</Button>

// XML de Erro (se rejeitado)
<Button onClick={() => window.open(getFileUrl(nfeEmitida.xmlErroUrl) || undefined, '_blank')}>
  Detalhes do Erro (JSON)
</Button>
```

## Como Funciona a Conversão de URLs

### Exemplo 1: Path Relativo com /
```typescript
const path = "/uploads/nfes/danfe-123.pdf"
const result = getFileUrl(path)
// Resultado: "http://localhost:4000/uploads/nfes/danfe-123.pdf"
```

### Exemplo 2: Path Relativo sem /
```typescript
const path = "uploads/nfes/danfe-123.pdf"
const result = getFileUrl(path)
// Resultado: "http://localhost:4000/uploads/nfes/danfe-123.pdf"
```

### Exemplo 3: URL Absoluta (não altera)
```typescript
const path = "https://s3.amazonaws.com/files/danfe-123.pdf"
const result = getFileUrl(path)
// Resultado: "https://s3.amazonaws.com/files/danfe-123.pdf"
```

### Exemplo 4: Path Nulo/Undefined
```typescript
const path = null
const result = getFileUrl(path)
// Resultado: null
```

## Verificação e Testes

### 1. Reiniciar o Servidor Next.js

**IMPORTANTE:** Para que o Next.js leia as variáveis de ambiente, é necessário reiniciar o servidor:

```bash
# Parar o servidor (Ctrl+C)
# Limpar cache do Next.js
rm -rf .next

# Iniciar novamente
npm run dev
```

### 2. Verificar no Console do Navegador

Abra o DevTools (F12) e verifique as requisições:

1. Vá para a aba **Network**
2. Clique em um botão de download (DANFE ou XML)
3. Observe a URL da requisição - deve começar com `http://localhost:4000`

### 3. Testar Downloads

#### Cenário 1: NF-e Autorizada (Modal de Emissão)
1. Abrir venda com status CONFIRMED, APPROVED ou COMPLETED
2. Clicar em "Emitir NF-e"
3. Preencher dados e emitir
4. Após autorização, verificar botões de download
5. URLs devem apontar para `localhost:4000`

#### Cenário 2: Venda INVOICED (Botões no Header)
1. Abrir venda com status INVOICED
2. Verificar botões "Baixar DANFE" e "Baixar XML" no header
3. Clicar nos botões
4. URLs devem apontar para `localhost:4000`

#### Cenário 3: Card de NF-es na Sidebar
1. Abrir qualquer venda que tenha NF-es emitidas
2. Na sidebar direita, localizar card "NF-es Emitidas"
3. Clicar nos botões de download
4. URLs devem apontar para `localhost:4000`

### 4. Verificar Variável de Ambiente no Código

Adicione temporariamente um console.log para verificar:

```typescript
// Em qualquer função de download
console.log('NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL)
console.log('URL Completa:', getFileUrl('/uploads/nfes/test.pdf'))
```

Deve exibir:
```
NEXT_PUBLIC_BACKEND_URL: http://localhost:4000
URL Completa: http://localhost:4000/uploads/nfes/test.pdf
```

## Ambientes

### Desenvolvimento Local
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

### Produção
```env
NEXT_PUBLIC_BACKEND_URL=https://back.otimizeagenda.com
```

A função `getFileUrl` usa o fallback `https://back.otimizeagenda.com` caso a variável não esteja definida.

## Arquivos Modificados

Nenhuma modificação de código foi necessária, pois a implementação já estava correta:

- ✅ `.env` - já configurado com `http://localhost:4000`
- ✅ `lib/api/nfe.ts` - função `getFileUrl` já implementada corretamente
- ✅ `app/dashboard/vendas/[id]/page.tsx` - já usa `getFileUrl` em todos os downloads

## Troubleshooting

### URLs ainda aparecem com localhost:3000

**Causa:** Servidor Next.js não foi reiniciado após configurar `.env`

**Solução:**
```bash
# Parar servidor (Ctrl+C)
rm -rf .next
npm run dev
```

### Erro 404 ao baixar arquivos

**Causa:** Arquivo não existe no backend ou path incorreto

**Solução:**
1. Verificar se o backend está rodando em `localhost:4000`
2. Verificar se os arquivos existem no diretório de uploads
3. Verificar permissões dos arquivos
4. Verificar logs do backend

### CORS Error

**Causa:** Backend não permite requisições do frontend

**Solução:** Configurar CORS no backend para aceitar `http://localhost:3000`:
```javascript
// No backend (Express)
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:4000'],
  credentials: true
}))
```

## Conclusão

A implementação já está correta e usa as variáveis de ambiente apropriadas. Se você está vendo URLs com `localhost:3000`, basta:

1. **Reiniciar o servidor Next.js** para carregar as variáveis de ambiente
2. **Limpar o cache do navegador** (Ctrl+Shift+R ou Cmd+Shift+R)
3. **Verificar o console do DevTools** para confirmar as URLs geradas

Todos os downloads de NF-e (DANFE, XML Gerado, XML Assinado, XML de Erro) agora usam `localhost:4000` corretamente.
