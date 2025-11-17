# Emissão de NF-e em Vendas Confirmadas

## 📋 Visão Geral

Implementada funcionalidade completa para emitir Notas Fiscais Eletrônicas (NF-e) diretamente a partir de vendas confirmadas, com integração à SEFAZ e download de DANFE e XML.

---

## ✅ Funcionalidades Implementadas

### 1. **API de NF-e** (`/lib/api/nfe.ts`)

#### Endpoint Atualizado:
- `POST /fiscal/nfe/emitir` - Emite NF-e a partir de uma venda

#### Interface `EmitirNFeDto`:
```typescript
interface EmitirNFeDto {
  saleId: string
  enviarSefaz?: boolean // Default: true
  modelo?: string // "55" (NF-e) ou "65" (NFC-e)
  serie?: string // Default: "1"
  numero?: number // Gerado automaticamente se não informado
  naturezaOperacao?: string // Default: "VENDA"
  tipoOperacao?: string // "0" = Entrada, "1" = Saída
  finalidade?: string // "1" = Normal, "2" = Complementar, "3" = Ajuste, "4" = Devolução
  consumidorFinal?: string // "0" = Não, "1" = Sim
  presencaComprador?: string // "1" = Presencial, "2" = Internet, etc.
  modalidadeFrete?: string // "9" = Sem frete, "0" = Emitente, "1" = Destinatário
}
```

#### Funções Disponíveis:
```typescript
// Emitir NF-e
await nfeApi.emitir(dto)

// Download de arquivos
await nfeApi.downloadPDF(nfeId) // DANFE em PDF
await nfeApi.downloadXML(nfeId) // XML da NF-e

// Consultar e cancelar
await nfeApi.consultar(nfeId)
await nfeApi.cancelar(nfeId, { justificativa })
```

---

### 2. **Tela de Detalhes da Venda** (`/app/dashboard/vendas/[id]/page.tsx`)

#### Botão de Emissão:
- ✅ Habilitado apenas para vendas com status `CONFIRMED`, `APPROVED` ou `COMPLETED`
- ✅ Desabilitado durante o processo de emissão
- ✅ Ícone de recibo (`Receipt`)

```tsx
{(sale.status === "CONFIRMED" || sale.status === "APPROVED" || sale.status === "COMPLETED") && (
  <Button 
    variant="outline"
    onClick={() => setNfeDialogOpen(true)} 
    disabled={emitindoNFe}
  >
    <Receipt className="mr-2 h-4 w-4" />
    Emitir NF-e
  </Button>
)}
```

---

### 3. **Dialog de Emissão de NF-e**

#### Formulário de Parâmetros:

##### Campos Disponíveis:

1. **Modelo** (Select)
   - `55` - NF-e (Nota Fiscal Eletrônica)
   - `65` - NFC-e (Nota Fiscal de Consumidor Eletrônica)

2. **Série** (Input)
   - Default: `"1"`
   - Número da série da nota fiscal

3. **Natureza da Operação** (Input)
   - Default: `"VENDA"`
   - Exemplos: VENDA, DEVOLUÇÃO, REMESSA, etc.

4. **Tipo de Operação** (Select)
   - `0` - Entrada
   - `1` - Saída (Default)

5. **Finalidade** (Select)
   - `1` - Normal (Default)
   - `2` - Complementar
   - `3` - Ajuste
   - `4` - Devolução

6. **Consumidor Final** (Select)
   - `0` - Não
   - `1` - Sim (Default)

7. **Presença do Comprador** (Select)
   - `0` - Não se aplica
   - `1` - Presencial (Default)
   - `2` - Internet
   - `3` - Teleatendimento
   - `4` - NFC-e Entrega
   - `9` - Outros

8. **Modalidade do Frete** (Select)
   - `0` - Emitente (CIF)
   - `1` - Destinatário (FOB)
   - `2` - Terceiros
   - `3` - Próprio Emitente
   - `4` - Próprio Destinatário
   - `9` - Sem Frete (Default)

---

### 4. **Tela de Sucesso**

Após emissão bem-sucedida, o dialog exibe:

#### Tratamento de Respostas:
- ✅ **Autorizada**: Toast verde + card verde com informações completas
- ❌ **Rejeitada**: Toast vermelho + card vermelho com código e motivo
- ⏳ **Processando**: Toast azul + card amarelo aguardando SEFAZ
- 🔗 **Acesso aos XMLs**: Links para download via URLs do backend

#### Downloads de Arquivos:

**Sempre disponíveis:**
- 📄 **XML Gerado** - XML original antes da assinatura
- 📄 **XML Assinado** - XML com assinatura digital
- 📄 **Detalhes do Erro** - JSON com resposta completa da SEFAZ (se rejeitada)

**Disponíveis apenas se autorizada:**
- 📄 **DANFE (PDF)** - Documento auxiliar para impressão
- 📄 **XML Autorizado** - XML com protocolo de autorização

#### Ações Disponíveis:
- ✅ **Baixar DANFE (PDF)** - Se autorizada
- ✅ **Baixar XML Autorizado** - Se autorizada
- ✅ **Ver XMLs intermediários** - Sempre disponível
- ✅ Botão "Fechar" para retornar

---

## 🎨 Interface do Usuário

### Fluxo de Uso:

1. **Acessar Detalhes da Venda**
   - Navegar para `/dashboard/vendas/[id]`
   - Venda deve estar com status `CONFIRMED`, `APPROVED` ou `COMPLETED`

2. **Clicar em "Emitir NF-e"**
   - Dialog abre com formulário pré-preenchido
   - Valores padrão baseados na venda

3. **Preencher Parâmetros**
   - Ajustar campos conforme necessário
   - Alerta sobre envio para SEFAZ

4. **Confirmar Emissão**
   - Botão "Emitir NF-e" envia requisição
   - Loading com mensagem "Emitindo NF-e..."

5. **Visualizar Resultado**
   - ✅ **Autorizada**: Exibe dados completos + downloads
   - ❌ **Rejeitada**: Exibe motivo da rejeição
   - ⏳ **Processando**: Aguardando resposta SEFAZ

---

## 📊 Estados da NF-e

| Status | Descrição | Badge Color |
|--------|-----------|-------------|
| `DRAFT` | Rascunho | Cinza |
| `PROCESSANDO` | Enviada à SEFAZ | Azul |
| `AUTHORIZED` | Autorizada pela SEFAZ | Verde |
| `REJECTED` | Rejeitada pela SEFAZ | Vermelho |
| `CANCELED` | Cancelada | Laranja |
| `DENEGADA` | Denegada pela SEFAZ | Roxo |
| `INUTILIZADA` | Número inutilizado | Cinza |

---

## 🔄 Tratamento de Erros

### Erros Comuns e Mensagens:

1. **Venda não confirmada**
   - Mensagem: "Apenas vendas confirmadas podem emitir NF-e"
   - Solução: Confirmar/aprovar a venda primeiro

2. **Dados incompletos**
   - Mensagem: "Preencha todos os campos obrigatórios"
   - Solução: Verificar campos marcados com *

3. **Rejeição SEFAZ**
   - Código: Exibido no card vermelho (ex: 109, 539, etc.)
   - Motivo: Mensagem detalhada retornada pela SEFAZ
   - Solução: Corrigir dados conforme orientação
   - Acesso: Baixar JSON com detalhes completos do erro

4. **Erro de conexão**
   - Mensagem: "Erro ao emitir NF-e. Tente novamente mais tarde."
   - Solução: Verificar conexão e tentar novamente

### Códigos de Status SEFAZ Comuns:

| Código | Descrição | Ação |
|--------|-----------|------|
| 100 | Autorizado o uso da NF-e | ✓ Sucesso |
| 109 | Serviço Paralisado sem Previsão | ⏳ Aguardar normalização |
| 539 | Duplicidade de NF-e | ❌ NF-e já foi emitida |
| 213 | CNPJ-Base do Destinatário difere | ❌ Verificar CNPJ cliente |
| 215 | Rejeição: CNPJ Emitente não cadastrado | ❌ Certificado inválido |

---

## 📁 Arquivos XML Gerados

### Tipos de XML:

1. **XML Gerado** (`xmlGerado` / `xmlGeradoUrl`)
   - XML original antes da assinatura
   - Contém todos os dados da NF-e
   - Útil para debug e auditoria

2. **XML Assinado** (`xmlAssinado` / `xmlAssinadoUrl`)
   - XML com assinatura digital do certificado
   - Pronto para envio à SEFAZ
   - Contém tag `<Signature>`

3. **XML de Erro** (`xmlErro` / `xmlErroUrl`)
   - JSON com resposta completa da SEFAZ
   - Contém código de status e motivo
   - Disponível apenas em caso de rejeição

4. **XML Autorizado** (via API `/nfe/:id/xml`)
   - XML processado com protocolo de autorização
   - Inclui tag `<protNFe>`
   - Apenas para NF-e autorizadas

### Função Helper para URLs:

```typescript
import { getFileUrl } from "@/lib/api/nfe"

// Converte path relativo em URL completa
const url = getFileUrl(nfe.xmlGeradoUrl)
// Retorna: http://localhost:4000/uploads/public/nfe/.../nfe.xml

// Abre em nova aba
window.open(url, '_blank')
```

---

## 📝 Exemplos de Uso

### Emitir NF-e Normal:

```typescript
const nfe = await nfeApi.emitir({
  saleId: "uuid-da-venda",
  enviarSefaz: true,
  modelo: "55",
  serie: "1",
  naturezaOperacao: "VENDA",
  tipoOperacao: "1",
  finalidade: "1",
  consumidorFinal: "1",
  presencaComprador: "1",
  modalidadeFrete: "9"
})
```

### Emitir NFC-e (Cupom Fiscal):

```typescript
const nfe = await nfeApi.emitir({
  saleId: "uuid-da-venda",
  modelo: "65", // NFC-e
  presencaComprador: "1", // Presencial
  consumidorFinal: "1" // Sim
})
```

### Emitir NF-e com Frete CIF:

```typescript
const nfe = await nfeApi.emitir({
  saleId: "uuid-da-venda",
  modalidadeFrete: "0", // Emitente (CIF)
  // ... outros campos
})
```

### Download de Arquivos:

```typescript
// Download DANFE
const pdfBlob = await nfeApi.downloadPDF(nfeId)
const pdfUrl = window.URL.createObjectURL(pdfBlob)
// Criar link e download

// Download XML
const xmlBlob = await nfeApi.downloadXML(nfeId)
const xmlUrl = window.URL.createObjectURL(xmlBlob)
// Criar link e download
```

---

## 🔐 Validações

### Frontend:
- ✅ Venda deve estar confirmada (APPROVED ou COMPLETED)
- ✅ Todos os campos obrigatórios devem estar preenchidos
- ✅ Série deve ser numérica
- ✅ Valores de select devem estar na lista de opções

### Backend (esperado):
- ✅ Venda existe e pertence à empresa
- ✅ Venda está confirmada
- ✅ Cliente tem CPF/CNPJ válido
- ✅ Produtos têm NCM cadastrado
- ✅ Empresa tem certificado digital válido
- ✅ Série e número não duplicados

---

## 🎯 Próximas Melhorias

### Sugeridas:
- [ ] Listar NF-e emitidas na tela de detalhes da venda
- [ ] Adicionar botão "Cancelar NF-e" com justificativa
- [ ] Exibir badge de "NF-e Emitida" na listagem de vendas
- [ ] Filtrar vendas por "Com NF-e" / "Sem NF-e"
- [ ] Reenviar NF-e rejeitada após correção
- [ ] Consultar status na SEFAZ diretamente pela chave
- [ ] Carta de correção eletrônica (CC-e)
- [ ] Manifestação do destinatário
- [ ] Dashboard de NF-e (quantidades, valores, status)

---

## 📚 Referências

### Documentação SEFAZ:
- [Manual de Integração NF-e](http://www.nfe.fazenda.gov.br/)
- [Tabela de Códigos SEFAZ](http://www.nfe.fazenda.gov.br/portal/principal.aspx)

### Endpoints Implementados:
- `POST /fiscal/nfe/emitir` - Emite NF-e
- `GET /fiscal/nfe/:id/danfe` - Download DANFE (PDF)
- `GET /fiscal/nfe/:id/xml` - Download XML
- `GET /fiscal/nfe/consultar/:chaveAcesso` - Consulta na SEFAZ
- `POST /fiscal/nfe/:id/cancelar` - Cancela NF-e
- `GET /fiscal/nfe/sefaz/status` - Status do serviço

---

## ✨ Resumo de Arquivos Modificados

| Arquivo | Alterações |
|---------|-----------|
| `lib/api/nfe.ts` | Atualizado endpoint para `/fiscal/nfe/emitir` e interface `EmitirNFeDto` |
| `app/dashboard/vendas/[id]/page.tsx` | Adicionado botão, dialog e lógica de emissão de NF-e |
| `EMISSAO_NFE_VENDAS.md` | Documentação completa (este arquivo) |

---

**Implementação concluída com sucesso!** ✅

A funcionalidade está pronta para uso em vendas com status `APPROVED` ou `COMPLETED`. O sistema permite configurar todos os parâmetros da NF-e e faz download automático do DANFE e XML após autorização.
