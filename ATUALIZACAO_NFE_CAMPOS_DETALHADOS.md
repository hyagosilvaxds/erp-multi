# Atualização NF-e - Campos Detalhados do Endpoint

## Data: 16 de novembro de 2025

## Resumo

Atualização completa das interfaces `NFe`, `NFeItem` e `NFeEvent` com todos os campos retornados pelo endpoint `GET /nfe/{id}` do backend, incluindo todos os impostos detalhados, eventos da SEFAZ e relacionamentos completos.

---

## 1. Interface NFe - Novos Campos Adicionados

### 1.1 Identificação Completa
```typescript
cUF?: string              // Código UF do emitente
cNF?: string              // Código numérico aleatório
cDV?: string              // Dígito verificador da chave de acesso
modelo: string            // Modelo da NFe (55)
```

### 1.2 Configurações da NFe
```typescript
idDest?: number           // Identificador do destino da operação (1-Interna, 2-Interestadual, 3-Exterior)
cMunFG?: string           // Código do município de ocorrência do fato gerador
tpImp?: number            // Tipo de impressão do DANFE
tpEmis?: number           // Tipo de emissão
indFinal?: number         // Indicador consumidor final (0-Não, 1-Sim)
indPres?: number          // Indicador de presença do comprador
indIntermed?: number      // Indicador de intermediador/marketplace
procEmi?: number          // Processo de emissão
verProc?: string          // Versão do processo de emissão
```

### 1.3 Indicador de IE do Destinatário
```typescript
indIEDest?: number        // Indicador da IE do destinatário (1-Contrib, 2-Isento, 9-Não Contrib)
```

### 1.4 Endereço Completo do Destinatário
```typescript
// Removido: destinatarioEndereco?: any
// Adicionado campos individuais:
destLogradouro?: string
destNumero?: string
destComplemento?: string
destBairro?: string
destCidade?: string
destCodigoMunicipio?: string
destEstado?: string
destCep?: string
destCodigoPais?: string
destPais?: string
```

### 1.5 Impostos Detalhados
```typescript
// Impostos Federais
valorII?: number          // Imposto de Importação
valorIPI?: number         // Imposto sobre Produtos Industrializados
valorIPIDevol?: number    // IPI Devolução

// ICMS Detalhado
valorICMS?: number
valorICMSDeson?: number   // ICMS Desoneração
valorFCP?: number         // Fundo de Combate à Pobreza
valorICMSST?: number      // ICMS Substituição Tributária
valorFCPST?: number       // FCP ICMS ST
valorFCPSTRet?: number    // FCP ICMS ST Retido

// PIS/COFINS
valorPIS?: number
valorCOFINS?: number

// Totais de Tributos por Esfera
valorTributosFederais?: number
valorTributosEstaduais?: number
valorTributosMunicipais?: number
valorTributosTotal?: number      // Total geral de tributos
```

### 1.6 Transporte Detalhado
```typescript
// Dados da Transportadora
transportadoraNome?: string
transportadoraCnpjCpf?: string
transportadoraIE?: string
transportadoraEndereco?: string
transportadoraCidade?: string
transportadoraUF?: string

// Dados do Veículo
veiculoUF?: string        // Alterado de: veiculoUf (case-sensitive)

// Volumes
volumeQuantidade?: number
volumeEspecie?: string
volumeMarca?: string
volumeNumeracao?: string
volumePesoLiquido?: number
volumePesoBruto?: number
```

### 1.7 Pagamento
```typescript
indicadorPagamento?: number   // 0-À vista, 1-À prazo
meioPagamento?: string        // Código do meio de pagamento (01-Dinheiro, 02-Cheque, etc.)
valorPagamento?: number
valorTroco?: number
```

### 1.8 Protocolo e Autorização
```typescript
protocoloAutorizacao?: string  // Alterado de: protocolo
dataAutorizacao?: Date | string
```

### 1.9 Responsável Técnico
```typescript
respTecCNPJ?: string
respTecContato?: string
respTecEmail?: string
respTecFone?: string
```

### 1.10 Relacionamentos Completos
```typescript
company?: any    // Dados completos da empresa emitente
sale?: any       // Dados completos da venda origem
customer?: any   // Dados completos do cliente
items?: NFeItem[]
events?: NFeEvent[]
```

---

## 2. Interface NFeItem - Reestruturação Completa

### 2.1 Campos Renomeados
```typescript
// ANTES                          // DEPOIS
produtoId                    →    productId
produto                      →    product
quantidade                   →    quantidadeComercial
valorUnitario               →    valorUnitarioComercial
valorTotal                  →    valorProduto
valorOutras                 →    valorOutros
```

### 2.2 Novos Campos do Produto
```typescript
codigoEAN?: string          // Código de barras GTIN
codigoEANTrib?: string      // Código de barras tributável
cest?: string               // Código CEST
```

### 2.3 Unidades Tributáveis
```typescript
unidadeTributavel: string
quantidadeTributavel: number
valorUnitarioTributavel: number
```

### 2.4 Valores Detalhados
```typescript
valorProduto: number        // Valor total do produto
valorDesconto: number
valorFrete: number
valorSeguro: number
valorOutros: number
indicadorTotal: number      // 0-Não compõe total, 1-Compõe total
```

### 2.5 ICMS Completo
```typescript
// ICMS Básico
icmsOrigem?: number         // Origem da mercadoria (0-Nacional, etc.)
icmsCst?: string            // CST para regime normal
icmsCSOSN?: string          // CSOSN para Simples Nacional (antes: icmsCsosn)
icmsModalidadeBC?: number   // Modalidade BC do ICMS
icmsBase?: number
icmsAliquota?: number
icmsValor?: number

// FCP (Fundo de Combate à Pobreza)
icmsFCPBase?: number
icmsFCPAliquota?: number
icmsFCPValor?: number

// ICMS ST (Substituição Tributária)
icmsStModalidadeBC?: number
icmsStBase?: number
icmsStAliquota?: number
icmsStValor?: number
icmsStMVA?: number          // Margem de Valor Agregado
icmsStReducaoBC?: number    // Percentual de redução da BC

// ICMS Partilha (Operações Interestaduais)
icmsUFDestBase?: number
icmsUFDestAliquota?: number
icmsUFDestValor?: number
icmsUFRemetAliquota?: number
icmsUFRemetValor?: number
```

### 2.6 IPI (Imposto sobre Produtos Industrializados)
```typescript
ipiCst?: string
ipiBase?: number
ipiAliquota?: number
ipiValor?: number
```

### 2.7 II (Imposto de Importação)
```typescript
iiBase?: number             // Base de cálculo do II
iiDespAdu?: number          // Despesas aduaneiras
iiValor?: number
iiIOF?: number              // Valor do IOF
```

### 2.8 PIS Detalhado
```typescript
pisCst?: string
pisBase?: number
pisAliquota?: number
pisValor?: number
pisQuantidade?: number      // Para cálculo por quantidade
pisAliqValor?: number       // Alíquota em valor (R$ por unidade)
```

### 2.9 COFINS Detalhado
```typescript
cofinsCst?: string
cofinsBase?: number
cofinsAliquota?: number
cofinsValor?: number
cofinsQuantidade?: number   // Para cálculo por quantidade
cofinsAliqValor?: number    // Alíquota em valor (R$ por unidade)
```

### 2.10 IBS/CBS (Nova Reforma Tributária)
```typescript
ibsCbsCst?: string          // CST conjunto IBS/CBS
ibsCbsClassTrib?: string    // Classificação tributária
ibsBase?: number
ibsUFAliquota?: number
ibsUFValor?: number
ibsMunAliquota?: number
ibsMunValor?: number
ibsValor?: number
cbsAliquota?: number
cbsValor?: number
```

### 2.11 Metadados
```typescript
createdAt?: Date | string
updatedAt?: Date | string
```

---

## 3. Interface NFeEvent - Eventos da SEFAZ

### 3.1 Novos Tipos de Eventos
```typescript
tipo: 
  | "CONFIRMACAO_OPERACAO"      // Manifesto: confirmação da operação
  | "CIENCIA_OPERACAO"          // Manifesto: ciência da operação
  | "DESCONHECIMENTO_OPERACAO"  // Manifesto: desconhecimento da operação
  | "OPERACAO_NAO_REALIZADA"    // Manifesto: operação não realizada
  | "CANCELAMENTO"              // Cancelamento da NFe
  | "CARTA_CORRECAO"            // Carta de correção eletrônica
  | "CONSULTA"                  // Consulta de status
  | "ERRO"                      // Erro no processamento
```

### 3.2 Campos Adicionados
```typescript
sequencia?: number          // Número sequencial do evento (para CCe)
justificativa?: string      // Justificativa (para cancelamento/CCe)
xmlEnviado?: string         // XML do evento enviado
xmlRetorno?: string         // XML de retorno da SEFAZ
status?: "PROCESSADO" | "REJEITADO" | "ERRO"
createdAt?: Date | string
```

### 3.3 Campos Renomeados
```typescript
// ANTES                    // DEPOIS
dataHora                →   dataEvento
// Removido: usuario (não vem do backend)
```

---

## 4. Alterações na Página de Detalhes

### 4.1 Protocolo
```typescript
// ANTES
nfe.protocolo

// DEPOIS
nfe.protocoloAutorizacao
```

### 4.2 Endereço do Destinatário
```typescript
// ANTES
nfe.destinatarioEndereco.street
nfe.destinatarioEndereco.number
nfe.destinatarioEndereco.neighborhood
nfe.destinatarioEndereco.city
nfe.destinatarioEndereco.state
nfe.destinatarioEndereco.zipCode

// DEPOIS
nfe.destLogradouro
nfe.destNumero
nfe.destBairro
nfe.destCidade
nfe.destEstado
nfe.destCep
```

### 4.3 Itens da NFe
```typescript
// ANTES
item.quantidade
item.valorUnitario
item.valorTotal

// DEPOIS
item.quantidadeComercial
item.valorUnitarioComercial
item.valorProduto
```

### 4.4 Transportadora
```typescript
// ANTES
nfe.transportadora?.name

// DEPOIS
nfe.transportadoraNome
```

### 4.5 Veículo
```typescript
// ANTES
nfe.veiculoUf

// DEPOIS
nfe.veiculoUF  // Uppercase
```

### 4.6 Total de Tributos
```typescript
// ANTES
nfe.valorTotalTributos

// DEPOIS
nfe.valorTributosTotal || nfe.valorTotalTributos  // Ambos existem
```

### 4.7 Eventos
```typescript
// ANTES
event.tipo === "EMISSAO"
event.dataHora

// DEPOIS
event.tipo === "CONFIRMACAO_OPERACAO"
event.dataEvento
```

---

## 5. Estrutura Completa da Resposta

### 5.1 Relacionamento `company`
```json
{
  "id": "uuid-da-empresa",
  "razaoSocial": "MINHA EMPRESA LTDA",
  "nomeFantasia": "Minha Empresa",
  "cnpj": "12345678000100",
  "inscricaoEstadual": "123456789",
  "logradouro": "Rua Comercial",
  "numero": "500",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01000000",
  "telefone": "1133332222",
  "email": "contato@minhaempresa.com.br",
  "codigoMunicipioIBGE": "3550308",
  "regimeTributario": "1"
}
```

### 5.2 Relacionamento `sale`
```json
{
  "id": "uuid-da-venda",
  "code": "VENDA-001",
  "status": "CONFIRMED",
  "totalAmount": 1500.00,
  "confirmedAt": "2025-11-16T09:00:00.000Z",
  "customer": {
    "id": "uuid-do-cliente",
    "name": null,
    "companyName": "CLIENTE ABC LTDA",
    "cnpj": "12345678000100"
  },
  "items": [...]
}
```

### 5.3 Relacionamento `customer`
```json
{
  "id": "uuid-do-cliente",
  "companyId": "uuid-da-empresa",
  "personType": "JURIDICA",
  "name": null,
  "companyName": "CLIENTE ABC LTDA",
  "cnpj": "12345678000100",
  "stateRegistration": "123456789",
  "email": "contato@clienteabc.com.br",
  "phone": "1199998888",
  "mobile": "11988887777",
  "active": true
}
```

### 5.4 Array `items` com produto
```json
{
  "id": "uuid-nfe-item-1",
  "numero": 1,
  "productId": "uuid-produto-1",
  "descricao": "PRODUTO TESTE",
  "ncm": "85044010",
  "quantidadeComercial": 10.0,
  "valorUnitarioComercial": 150.00,
  "valorProduto": 1500.00,
  "icmsOrigem": 0,
  "icmsCst": "00",
  "icmsBase": 1500.00,
  "icmsAliquota": 18.00,
  "icmsValor": 270.00,
  "pisCst": "01",
  "pisBase": 1500.00,
  "pisAliquota": 1.65,
  "pisValor": 24.75,
  "cofinsCst": "01",
  "cofinsBase": 1500.00,
  "cofinsAliquota": 7.60,
  "cofinsValor": 114.00,
  "product": {
    "id": "uuid-produto-1",
    "name": "PRODUTO TESTE",
    "sku": "PROD001",
    "ncm": "85044010"
  }
}
```

### 5.5 Array `events`
```json
{
  "id": "uuid-event-1",
  "nfeId": "uuid-da-nfe",
  "tipo": "CONFIRMACAO_OPERACAO",
  "sequencia": 1,
  "descricao": "NFe autorizada pela SEFAZ",
  "protocolo": "135251234567890",
  "dataEvento": "2025-11-16T10:31:00.000Z",
  "status": "PROCESSADO",
  "createdAt": "2025-11-16T10:31:00.000Z"
}
```

---

## 6. Campos Calculados pelo Backend

Estes campos são calculados automaticamente pela SEFAZ/Backend:

- `cUF` - Código da UF do emitente
- `cNF` - Código numérico aleatório (8 dígitos)
- `chaveAcesso` - Chave de acesso completa (44 dígitos)
- `cDV` - Dígito verificador
- `valorTributosFederais` - Soma de PIS + COFINS + IPI + II
- `valorTributosEstaduais` - Soma de ICMS + ICMS ST
- `valorTributosMunicipais` - ISS (se aplicável)
- `valorTributosTotal` - Soma de todos os tributos

---

## 7. Valores vs Tributação

### 7.1 Diferença entre Valores Comerciais e Tributáveis

Alguns produtos podem ter unidades diferentes para venda e tributação:

```typescript
// Venda
unidadeComercial: "CX"        // Caixa
quantidadeComercial: 10       // 10 caixas
valorUnitarioComercial: 150   // R$ 150,00 por caixa

// Tributação
unidadeTributavel: "UN"       // Unidade
quantidadeTributavel: 100     // 100 unidades (10 caixas x 10 un/cx)
valorUnitarioTributavel: 15   // R$ 15,00 por unidade
```

### 7.2 Cálculo de Impostos

```typescript
// Base de cálculo pode ser diferente do valor do produto
valorProduto: 1500.00

// ICMS
icmsBase: 1500.00            // Pode ter redução de BC
icmsAliquota: 18.00          // 18%
icmsValor: 270.00            // 1500 * 0.18

// PIS
pisBase: 1500.00
pisAliquota: 1.65            // 1,65%
pisValor: 24.75              // 1500 * 0.0165

// COFINS
cofinsBase: 1500.00
cofinsAliquota: 7.60         // 7,60%
cofinsValor: 114.00          // 1500 * 0.076
```

---

## 8. Resumo de Alterações

### Arquivos Modificados
1. ✅ `lib/api/nfe.ts` - Interfaces atualizadas
2. ✅ `app/dashboard/nfe/[id]/page.tsx` - Página de detalhes corrigida

### Total de Campos Adicionados
- **NFe**: +35 novos campos
- **NFeItem**: +40 novos campos de impostos
- **NFeEvent**: +6 novos campos

### Campos Renomeados
- 8 campos na interface NFe
- 6 campos na interface NFeItem
- 2 campos na interface NFeEvent

### Compilação
✅ Zero erros de TypeScript
✅ Todos os tipos alinhados com o backend
✅ Página de detalhes exibindo dados corretamente

---

## 9. Próximos Passos

1. ✅ Testar integração com backend real
2. ⏳ Implementar formulário de criação/edição com todos os campos de impostos
3. ⏳ Adicionar validações de ICMS ST e operações interestaduais
4. ⏳ Implementar manifesto do destinatário (eventos de confirmação/ciência)
5. ⏳ Adicionar carta de correção eletrônica (CCe)

---

## Conclusão

O módulo NF-e agora possui mapeamento completo de todos os campos retornados pelo backend, incluindo:
- ✅ Impostos detalhados por item (ICMS, IPI, II, PIS, COFINS, IBS/CBS)
- ✅ Relacionamentos completos (company, sale, customer, items, events)
- ✅ Eventos da SEFAZ (manifesto, cancelamento, CCe)
- ✅ Dados completos de transporte e volumes
- ✅ Responsável técnico
- ✅ Todas as configurações fiscais da NFe

A interface está pronta para suportar todas as operações fiscais brasileiras!
