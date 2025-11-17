# Módulo de NF-e - Documentação Completa

## 📋 Visão Geral

Módulo completo para gerenciamento de Notas Fiscais Eletrônicas (NF-e) integrado ao sistema ERP. O módulo permite emissão, consulta, cancelamento e gerenciamento completo de NF-es com integração à SEFAZ.

## 🗂️ Estrutura de Arquivos

```
lib/api/
  └── nfe.ts                              # API Client para NF-e

app/dashboard/nfe/
  ├── page.tsx                            # Lista de NF-es (principal)
  ├── [id]/page.tsx                       # Detalhes da NF-e
  ├── [id]/edit/page.tsx                  # Edição de NF-e (rascunho)
  ├── new/page.tsx                        # Nova NF-e (manual)
  └── from-sale/
      ├── page.tsx                        # Seleção de venda
      └── [saleId]/page.tsx               # Gerar NF-e da venda
```

## 📄 API Client (`lib/api/nfe.ts`)

### Tipos e Interfaces

#### Status da NF-e
```typescript
type NFeStatus =
  | "RASCUNHO"        // Em edição
  | "VALIDADA"        // Validada localmente
  | "ASSINADA"        // Assinada digitalmente
  | "ENVIADA"         // Enviada para SEFAZ
  | "PROCESSANDO"     // Sendo processada pela SEFAZ
  | "AUTORIZADA"      // Autorizada pela SEFAZ
  | "REJEITADA"       // Rejeitada pela SEFAZ
  | "CANCELADA"       // Cancelada
  | "DENEGADA"        // Denegada pela SEFAZ
  | "INUTILIZADA"     // Numeração inutilizada
```

#### Tipos de Operação
```typescript
type NFeTipoOperacao = "ENTRADA" | "SAIDA"
type NFeFinalidade = "NORMAL" | "COMPLEMENTAR" | "AJUSTE" | "DEVOLUCAO"
type NFeModalidadeFrete = "EMITENTE" | "DESTINATARIO" | "TERCEIROS" | "SEM_FRETE"
```

#### Interface Principal
```typescript
interface NFe {
  id: string
  companyId: string
  saleId?: string
  
  // Numeração
  numero: number
  serie: number
  modelo: string
  chaveAcesso?: string
  protocolo?: string
  
  // Datas
  dataEmissao?: Date
  dataSaida?: Date
  
  // Tipo e Status
  tipoOperacao: NFeTipoOperacao
  finalidade: NFeFinalidade
  naturezaOperacao: string
  status: NFeStatus
  
  // Destinatário
  destinatarioId?: string
  destinatarioNome?: string
  destinatarioCpfCnpj?: string
  destinatarioIe?: string
  
  // Itens
  items?: NFeItem[]
  
  // Totais
  valorProdutos: number
  valorFrete: number
  valorSeguro: number
  valorDesconto: number
  valorOutrasDespesas: number
  valorTotal: number
  valorTotalTributos: number
  
  // Transporte
  modalidadeFrete: NFeModalidadeFrete
  veiculoPlaca?: string
  veiculoUf?: string
  volumeQuantidade?: number
  
  // Informações Adicionais
  informacoesComplementares?: string
  informacoesFisco?: string
  
  // Relacionamentos
  sale?: any
  company?: any
  events?: NFeEvent[]
}
```

#### Item da NF-e
```typescript
interface NFeItem {
  id: string
  numeroItem: number
  
  // Produto
  codigoProduto: string
  descricao: string
  ncm: string
  cfop: string
  unidadeComercial: string
  
  // Valores
  quantidade: number
  valorUnitario: number
  valorTotal: number
  
  // Tributos
  cstIcms: string
  origemMercadoria: string
  bcIcms?: number
  aliquotaIcms?: number
  valorIcms?: number
  
  cstIpi?: string
  valorIpi?: number
  
  cstPis: string
  valorPis?: number
  
  cstCofins: string
  valorCofins?: number
}
```

### Funções da API

#### Estatísticas
```typescript
getNFeStats(): Promise<NFeStats>
```
Retorna estatísticas gerais das NF-es:
- Total de NF-es
- NF-es autorizadas
- NF-es canceladas
- NF-es rejeitadas
- Valor total faturado

#### Listagem
```typescript
getNFes(filters?: NFeFilters): Promise<NFeListResponse>
```
Lista NF-es com filtros e paginação.

**Filtros disponíveis:**
- `status`: Filtrar por status
- `saleId`: Filtrar por venda
- `chaveAcesso`: Buscar por chave
- `search`: Busca textual (número, cliente)
- `dataInicio` / `dataFim`: Período
- `page` / `limit`: Paginação

#### CRUD Básico
```typescript
getNFeById(id: string): Promise<NFe>
createNFe(dto: CreateNFeDto): Promise<NFe>
updateNFe(id: string, dto: UpdateNFeDto): Promise<NFe>
deleteNFe(id: string): Promise<void>
```

#### Operações Fiscais
```typescript
// Emitir NF-e
emitirNFe(dto: EmitirNFeDto): Promise<NFe>

// Cancelar NF-e (até 24h após autorização)
cancelarNFe(id: string, dto: CancelarNFeDto): Promise<NFe>

// Consultar situação na SEFAZ
consultarNFe(id: string): Promise<NFe>
```

#### Downloads
```typescript
// Baixar XML da NF-e
downloadNFeXML(id: string): Promise<Blob>

// Baixar PDF (DANFE)
downloadNFePDF(id: string): Promise<Blob>
```

### Helpers

```typescript
// Labels de status em português
nfeStatusLabels: Record<NFeStatus, string>

// Cores para badges de status
nfeStatusColors: Record<NFeStatus, string>

// Formatar chave de acesso (44 dígitos com espaços)
formatChaveAcesso(chave: string): string
```

## 📱 Páginas

### 1. Lista de NF-es (`/dashboard/nfe`)

**Componentes:**
- Cards de estatísticas (5 cards):
  - Total de NF-es
  - Autorizadas
  - Canceladas
  - Rejeitadas
  - Valor Total
- Filtros de busca
- Tabela com paginação
- Ações rápidas (visualizar, baixar XML/DANFE)

**Recursos:**
- Busca por número, chave ou cliente
- Filtro por status
- Paginação (20 itens por página)
- Dropdown com ações contextuais
- Badges coloridas por status
- Clique na linha para ver detalhes

**Botões de Ação:**
- "Nova NF-e": Criar manualmente
- "Gerar da Venda": Selecionar venda para gerar NF-e

### 2. Detalhes da NF-e (`/dashboard/nfe/[id]`)

**Layout de 2 Colunas:**

**Coluna Principal (esquerda):**
- Informações Gerais
  - Número, série, modelo
  - Chave de acesso (formatada)
  - Protocolo de autorização
  - Mensagem da SEFAZ
- Destinatário
  - Nome/Razão Social
  - CPF/CNPJ
  - Inscrição Estadual
  - Endereço completo
- Produtos/Serviços
  - Tabela com todos os itens
  - Código, NCM, CFOP
  - Quantidades e valores
- Transporte (se aplicável)
  - Modalidade do frete
  - Transportadora
  - Veículo (placa e UF)
  - Volumes
- Informações Adicionais
  - Informações complementares
  - Informações ao fisco
  - Observações

**Coluna Lateral (direita):**
- Resumo Financeiro
  - Valor dos produtos
  - Frete, seguro, desconto
  - Outras despesas
  - Valor total
  - Total de tributos
- Datas
  - Data de emissão
  - Data de saída
  - Criação e última atualização
- Histórico de Eventos
  - Timeline de eventos
  - Emissão, cancelamento, etc.
  - Protocolos e horários

**Ações Disponíveis:**
- **Rascunho**: Editar, Excluir, Emitir
- **Autorizada**: Baixar XML, Baixar DANFE, Cancelar (até 24h)
- **Outras**: Apenas visualização

**Dialogs:**
- Cancelamento: Requer justificativa (mín. 15 caracteres)
- Exclusão: Confirmação simples

### 3. Seleção de Venda (`/dashboard/nfe/from-sale`)

**Recursos:**
- Lista vendas aprovadas sem NF-e
- Busca por código ou cliente
- Informações da venda (data, cliente, valor)
- Botão "Gerar NF-e" para cada venda
- Paginação

### 4. Gerar NF-e da Venda (`/dashboard/nfe/from-sale/[saleId]`)

**Fluxo:**
1. Carrega dados da venda
2. Pré-preenche informações fiscais
3. Permite ajustes nos dados
4. Configura tributos dos produtos
5. Gera NF-e com um clique

**Campos Auto-preenchidos:**
- Destinatário (dados do cliente)
- Produtos (itens da venda)
- Valores (totais da venda)
- Transporte (se configurado)
- Pagamento (forma da venda)

**Campos Editáveis:**
- Natureza da operação
- Série da NF-e
- CFOP dos produtos
- Tributos (ICMS, IPI, PIS, COFINS)
- Informações adicionais

### 5. Nova NF-e (`/dashboard/nfe/new`)

**Formulário em Etapas (Wizard):**

**Etapa 1: Dados Gerais**
- Série
- Natureza da operação
- Tipo de operação (Entrada/Saída)
- Finalidade (Normal/Complementar/Ajuste/Devolução)

**Etapa 2: Destinatário**
- Buscar cliente cadastrado
- Ou preencher manualmente:
  - Nome/Razão Social
  - CPF/CNPJ
  - Inscrição Estadual
  - Endereço completo

**Etapa 3: Produtos**
- Buscar produtos do estoque
- Adicionar itens manualmente
- Para cada item:
  - Código, descrição, NCM
  - Quantidade e valor unitário
  - CFOP
  - Tributos (ICMS, IPI, PIS, COFINS)
  - CST de cada tributo
- Tabela com itens adicionados
- Cálculo automático dos totais

**Etapa 4: Transporte**
- Modalidade do frete
- Transportadora (se aplicável)
- Veículo (placa e UF)
- Volume:
  - Quantidade
  - Espécie
  - Marca
  - Numeração
  - Peso bruto e líquido

**Etapa 5: Pagamento**
- Forma de pagamento
- Meio de pagamento

**Etapa 6: Revisão**
- Preview completo da NF-e
- Todos os dados para conferência
- Botão "Salvar Rascunho"
- Botão "Emitir NF-e"

## 🎨 Componentes Visuais

### Badges de Status
```tsx
<Badge className={nfeStatusColors[status]}>
  {getStatusIcon(status)}
  {nfeStatusLabels[status]}
</Badge>
```

**Cores:**
- Rascunho: Cinza
- Validada: Azul
- Autorizada: Verde
- Rejeitada/Denegada: Vermelho
- Cancelada: Cinza escuro
- Processando: Laranja

### Ícones por Status
- Autorizada: ✅ CheckCircle (verde)
- Cancelada: ❌ XCircle (cinza)
- Rejeitada: ⚠️ AlertCircle (vermelho)
- Denegada: 🚫 FileX (vermelho)
- Outros: 📄 FileText (azul)

### Cards de Estatísticas
```tsx
<Card>
  <CardHeader>
    <CardTitle>Label</CardTitle>
    <Icon />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">Valor</div>
    <p className="text-xs text-muted-foreground">Descrição</p>
  </CardContent>
</Card>
```

## 🔐 Regras de Negócio

### Emissão
1. Apenas NF-es em "Rascunho" ou "Validada" podem ser emitidas
2. Requer certificado digital A1 válido
3. Todos os campos obrigatórios devem estar preenchidos
4. Produtos devem ter NCM e CFOP válidos
5. Tributos devem estar calculados

### Cancelamento
1. Apenas NF-es "Autorizadas" podem ser canceladas
2. Prazo: até 24 horas após autorização
3. Justificativa obrigatória (mínimo 15 caracteres)
4. Protocolo de cancelamento é registrado na SEFAZ
5. Ação irreversível

### Edição
1. Apenas "Rascunhos" podem ser editados
2. NF-es autorizadas não podem ser alteradas
3. Para corrigir, usar Carta de Correção ou NF-e complementar

### Exclusão
1. Apenas "Rascunhos" podem ser excluídos
2. Ação irreversível
3. Não afeta numeração (número volta para pool)

## 📊 Fluxos de Trabalho

### Fluxo 1: Criar NF-e Manual
```
Nova NF-e → Preencher dados → Salvar rascunho → Emitir → Aguardar SEFAZ → Autorizada
```

### Fluxo 2: Gerar da Venda
```
Selecionar venda → Pré-visualizar → Ajustar dados → Emitir → Autorizada
```

### Fluxo 3: Cancelamento
```
NF-e Autorizada → Cancelar (até 24h) → Justificar → Enviar SEFAZ → Cancelada
```

### Fluxo 4: Consulta
```
NF-e Processando → Consultar SEFAZ → Atualizar status → Autorizada/Rejeitada
```

## 🔔 Mensagens e Feedback

### Toast de Sucesso
```typescript
toast({
  title: "NF-e emitida com sucesso",
  description: "A NF-e foi autorizada pela SEFAZ.",
})
```

### Toast de Erro
```typescript
toast({
  title: "Erro ao emitir NF-e",
  description: error.response?.data?.message || "Tente novamente.",
  variant: "destructive",
})
```

### Loading States
- Lista: Spinner centralizado
- Ações: Botão desabilitado com spinner
- Detalhes: Skeleton ou spinner

## 📝 Validações

### Frontend
- Campos obrigatórios não vazios
- CPF/CNPJ válidos
- NCM com 8 dígitos
- CFOP com 4 dígitos
- Valores numéricos positivos
- Justificativa de cancelamento ≥ 15 caracteres

### Backend (esperado)
- Certificado digital válido
- Sequência numérica correta
- Cálculo de tributos validado
- Destinatário válido
- Produtos com cadastro completo

## 🚀 Melhorias Futuras

1. **Carta de Correção (CC-e)**
   - Corrigir erros após autorização
   - Campos permitidos pela SEFAZ

2. **Contingência**
   - Emissão offline (FS-IA)
   - Sincronização posterior

3. **Inutilização**
   - Inutilizar numeração não utilizada
   - Manter sequência

4. **Manifestação do Destinatário**
   - Confirmar operação
   - Desconhecimento
   - Operação não realizada

5. **Importação XML**
   - Upload de XML de fornecedores
   - Escrituração automática

6. **Dashboard Fiscal**
   - Gráficos de faturamento
   - Análise de tributos
   - Relatórios gerenciais

7. **Integração Contábil**
   - Exportar para contabilidade
   - Lançamentos automáticos

8. **Multi-série**
   - Gerenciar múltiplas séries
   - Separação por filial/operação

## 📚 Recursos Adicionais

### Documentação SEFAZ
- Layout NF-e 4.0
- Tabelas de códigos
- Webservices disponíveis

### Certificado Digital
- Formato A1 (arquivo .pfx)
- Validade mínima 1 mês
- Senha de acesso

### Requisitos Técnicos
- Node.js ≥ 18
- Next.js 14+
- TypeScript
- Axios para HTTP
- Shadcn/ui para componentes

---

**Desenvolvido com ❤️ para gestão fiscal eficiente**
