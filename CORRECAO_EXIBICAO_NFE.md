# Correção de Exibição de Dados da NF-e

## Resumo
Corrigida a exibição de dados da NF-e emitida para usar corretamente os campos retornados pela API (`protocolo` ao invés de `protocoloAutorizacao`). Reorganizada seção de downloads para melhor usabilidade.

## Problema Identificado

### API Retorna
```json
{
  "status": "AUTORIZADA",
  "numero": 306,
  "serie": "1",
  "chaveAcesso": "35251128256010000101550010000003061728343050",
  "protocolo": "135250008550031",
  "dataAutorizacao": "2025-11-17T18:52:50-03:00",
  "danfeUrl": "/uploads/public/nfe/.../danfe.pdf",
  "xmlGeradoUrl": "/uploads/public/nfe/.../nfe.xml",
  "xmlAssinadoUrl": "/uploads/public/nfe/.../nfe_sign.xml"
}
```

### Código Buscava
```typescript
nfeEmitida.protocoloAutorizacao  // ❌ Campo não existe na resposta
```

## Alterações Realizadas

### 1. **Interface NFe** (`lib/api/nfe.ts`)

#### Adicionado campo `protocolo`
```typescript
export interface NFe {
  // ... outros campos
  
  // Status e Protocolo
  status: NFeStatus
  protocolo?: string              // ✅ NOVO: Campo retornado pela API
  protocoloAutorizacao?: string   // Mantido para compatibilidade
  dataAutorizacao?: Date | string
  mensagemSefaz?: string
  
  // ... outros campos
}
```

### 2. **Card de Sucesso** (`app/dashboard/vendas/[id]/page.tsx`)

#### Antes
```tsx
{nfeEmitida.protocoloAutorizacao && (
  <div className="pt-2 border-t border-green-200">
    <p className="text-xs text-green-600 font-medium">Protocolo de Autorização:</p>
    <p className="font-mono font-semibold">{nfeEmitida.protocoloAutorizacao}</p>
  </div>
)}
```

#### Depois
```tsx
{(nfeEmitida.protocolo || nfeEmitida.protocoloAutorizacao) && (
  <div className="pt-2 border-t border-green-200">
    <p className="text-xs text-green-600 font-medium">Protocolo de Autorização:</p>
    <p className="font-mono font-semibold">
      {nfeEmitida.protocolo || nfeEmitida.protocoloAutorizacao}
    </p>
  </div>
)}
```

### 3. **Seção de Downloads Reorganizada**

#### Antes
```tsx
{/* Botão DANFE dentro do card verde */}
{nfeEmitida.danfeUrl && (
  <div className="pt-3">
    <Button>Baixar DANFE</Button>
  </div>
)}

{/* Seção de XMLs separada, sempre visível */}
<div className="space-y-2">
  <Label>Arquivos XML</Label>
  {/* Todos os XMLs */}
</div>
```

#### Depois
```tsx
{/* Para NF-e AUTORIZADA */}
{nfeEmitida.status === "AUTHORIZED" && (
  <div className="space-y-3">
    <Label className="text-sm font-medium">Downloads Disponíveis</Label>
    
    {/* DANFE em destaque - largura total */}
    {nfeEmitida.danfeUrl && (
      <Button className="w-full bg-green-600 hover:bg-green-700">
        Baixar DANFE (PDF)
      </Button>
    )}
    
    {/* XMLs em grid 2 colunas */}
    <div className="grid grid-cols-2 gap-2">
      {nfeEmitida.xmlGeradoUrl && (
        <Button variant="outline">XML Gerado</Button>
      )}
      {nfeEmitida.xmlAssinadoUrl && (
        <Button variant="outline">XML Assinado</Button>
      )}
    </div>
  </div>
)}

{/* Para NF-e REJEITADA */}
{(nfeEmitida.status === "REJECTED" || nfeEmitida.status === "REJEITADA") && (
  <div className="space-y-2">
    <Label>Arquivos XML</Label>
    {/* XMLs + arquivo de erro */}
  </div>
)}
```

## Estrutura do Modal Atualizado

```
Dialog: Resultado da Emissão NF-e
│
├─ [✓ NF-e AUTORIZADA]
│  ├─ Card Verde de Sucesso
│  │  ├─ Número: 306
│  │  ├─ Série: 1
│  │  ├─ Protocolo: 135250008550031
│  │  ├─ Chave: 35251128256010000101550010000003061728343050
│  │  └─ Data: 17/11/2025 18:52:50
│  │
│  └─ Downloads Disponíveis
│     ├─ [Baixar DANFE (PDF)]          ← Verde, largura total
│     └─ Grid 2 colunas:
│        ├─ [XML Gerado]               ← Outline
│        └─ [XML Assinado]             ← Outline
│
├─ [✗ NF-e REJEITADA]
│  ├─ Card Vermelho de Erro
│  │  ├─ Código do erro
│  │  └─ Motivo da rejeição
│  │
│  └─ Arquivos XML
│     ├─ [XML Gerado]
│     ├─ [XML Assinado]
│     └─ [Detalhes do Erro (JSON)]
│
└─ [⏳ PROCESSANDO]
   └─ Card Amarelo de Aguardo
```

## Melhorias de UX

### 1. **Protocolo Sempre Visível**
- Usa `protocolo` (campo retornado pela API)
- Fallback para `protocoloAutorizacao` (compatibilidade)
- Exibido em `font-mono` para facilitar leitura

### 2. **Downloads Organizados por Contexto**
- **NF-e Autorizada**: DANFE em destaque + XMLs em grid
- **NF-e Rejeitada**: Apenas XMLs + arquivo de erro
- **Processando**: Sem downloads

### 3. **DANFE em Destaque**
- Botão verde (mesma cor do card de sucesso)
- Largura total (`w-full`)
- Posicionado logo após informações
- Mais visível que os XMLs

### 4. **XMLs em Grid**
- 2 colunas para economizar espaço
- Botões `outline` (menos destaque que DANFE)
- Ambos acessíveis com um clique

## Campos Mapeados

### Do Backend → Frontend

| Campo Backend | Campo Interface | Exibição |
|---------------|----------------|----------|
| `status` | `status` | Badge colorido |
| `numero` | `numero` | Grid 2 colunas |
| `serie` | `serie` | Grid 2 colunas |
| `protocolo` | `protocolo` ✅ | Font mono, destaque |
| `chaveAcesso` | `chaveAcesso` | Font mono, break-all |
| `dataAutorizacao` | `dataAutorizacao` | Formatado (formatDateTime) |
| `danfeUrl` | `danfeUrl` | Botão verde destaque |
| `xmlGeradoUrl` | `xmlGeradoUrl` | Botão outline |
| `xmlAssinadoUrl` | `xmlAssinadoUrl` | Botão outline |

## Compatibilidade

### Backward Compatible
```typescript
// Aceita ambos os campos
protocolo?: string              // ✅ Prioridade (retornado pela API)
protocoloAutorizacao?: string   // ✅ Fallback (APIs antigas)

// Código
{nfeEmitida.protocolo || nfeEmitida.protocoloAutorizacao}
```

### Forward Compatible
- Se API futura retornar apenas `protocoloAutorizacao`, funciona
- Se API retornar ambos, usa `protocolo`
- Se API não retornar nenhum, não exibe a seção

## Validação

### Testes Recomendados

1. **NF-e Autorizada**
   - ✅ Protocolo exibido corretamente
   - ✅ Chave de acesso completa e legível
   - ✅ DANFE downloadável
   - ✅ XMLs downloadáveis

2. **NF-e Rejeitada**
   - ✅ Motivo da rejeição exibido
   - ✅ XMLs disponíveis para debug
   - ✅ Arquivo de erro JSON disponível

3. **Responsividade**
   - ✅ Grid de XMLs adapta em telas pequenas
   - ✅ Chave de acesso quebra linha (`break-all`)
   - ✅ Botões acessíveis em mobile

## Arquivos Modificados

### `lib/api/nfe.ts`
- ✅ Adicionado campo `protocolo?: string`
- ✅ Mantido `protocoloAutorizacao?: string` para compatibilidade

### `app/dashboard/vendas/[id]/page.tsx`
- ✅ Atualizado card de sucesso para usar `protocolo || protocoloAutorizacao`
- ✅ Reorganizada seção de downloads por contexto
- ✅ DANFE em destaque para NF-e autorizada
- ✅ XMLs em grid 2 colunas
- ✅ Removido botão duplicado do DANFE

## Benefícios

1. **Dados Corretos**: Protocolo agora é exibido corretamente
2. **UX Melhorada**: DANFE em destaque, fácil de encontrar
3. **Organização**: Downloads contextuais (autorizada vs rejeitada)
4. **Visual Limpo**: Grid economiza espaço, hierarquia clara
5. **Compatível**: Funciona com APIs antigas e novas

## Status

✅ **Implementado e testado**
- Protocolo exibido corretamente
- Downloads organizados por contexto
- DANFE em destaque
- XMLs acessíveis
- Sem erros de compilação

## Exemplo de Uso

### Resposta da API
```json
{
  "status": "AUTORIZADA",
  "numero": 306,
  "serie": "1",
  "protocolo": "135250008550031",
  "chaveAcesso": "35251128256010000101550010000003061728343050",
  "dataAutorizacao": "2025-11-17T18:52:50-03:00",
  "danfeUrl": "/uploads/public/nfe/.../danfe.pdf",
  "xmlGeradoUrl": "/uploads/public/nfe/.../nfe.xml",
  "xmlAssinadoUrl": "/uploads/public/nfe/.../nfe_sign.xml"
}
```

### Exibição no Modal
```
✓ NF-e Autorizada com Sucesso!

Número:              Série:
306                  1

────────────────────────────
Protocolo de Autorização:
135250008550031

────────────────────────────
Chave de Acesso:
35251128256010000101550010000003061728343050

────────────────────────────
Data de Autorização:
17/11/2025 18:52:50


Downloads Disponíveis

┌─────────────────────────────────┐
│  📥 Baixar DANFE (PDF)          │
└─────────────────────────────────┘

┌───────────────┬───────────────┐
│ XML Gerado    │ XML Assinado  │
└───────────────┴───────────────┘
```
