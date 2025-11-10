# Gerenciamento de Documentos de Aportes/Investimentos SCP

## 📋 Visão Geral

Sistema completo de gerenciamento de documentos de aportes, permitindo upload, listagem, download e exclusão de documentos relacionados aos investimentos no módulo SCP.

## 🎯 Funcionalidades Implementadas

### 1. Upload de Documentos no Aporte
- **Modal de Upload**: Dialog com formulário completo
- **Campos**:
  - Seleção de arquivo (input file)
  - Nome do documento (obrigatório)
  - Categoria (select com 6 opções)
  - Descrição (opcional)
  - Tags (opcional, separadas por vírgula)
- **Validações**:
  - Arquivo é obrigatório
  - Nome é obrigatório
  - Categoria é obrigatória
- **Preview**: Mostra nome e tamanho do arquivo selecionado
- **Feedback**: Toast de sucesso/erro
- **Auto-nome**: Se não informado, usa o nome do arquivo

### 2. Listagem de Documentos
- **Tabela Responsiva**: Table component do shadcn/ui
- **Colunas**:
  - Nome (com descrição se disponível)
  - Categoria (badge com cor)
  - Tamanho do arquivo
  - Data de upload
  - Ações (download e excluir)
- **Estado Vazio**: Ilustração e botão CTA quando não há documentos
- **Loading**: Spinner durante carregamento

### 3. Download de Documentos
- **Botão de Download**: Ícone de download em cada linha
- **Funcionamento**:
  - Busca blob do backend
  - Cria URL temporária
  - Trigger download no navegador
  - Limpa URL após download
- **Feedback**: Toast de sucesso/erro

### 4. Exclusão de Documentos
- **Confirmação**: AlertDialog antes de excluir
- **Botão de Excluir**: Ícone de lixeira em cada linha
- **Mensagem**: Mostra nome do documento na confirmação
- **Feedback**: Toast de sucesso/erro
- **Atualização**: Recarrega lista e attachments após exclusão

## 🗂️ Categorias de Documentos

```typescript
"Comprovantes"          // Comprovantes de transferência/pagamento
"Contratos"             // Contratos de investimento
"Recibos"               // Recibos diversos
"Termos"                // Termos de adesão/ciência
"Documentos Bancários"  // Extratos, comprovantes bancários
"Outros"                // Outros documentos
```

## 📁 Estrutura de Arquivos

### Arquivos Criados

**1. `/lib/api/investment-documents.ts`** (360 linhas)
- **Tipos**:
  - `InvestmentDocument`: Interface completa do documento
  - `UploadInvestmentDocumentDto`: DTO para upload
  - `InvestmentDocumentsListResponse`: Response com paginação
  - `InvestmentDocumentsQueryParams`: Parâmetros de query
  - `InvestmentDocumentCategory`: Union type das categorias

- **Funções API**:
  - `uploadInvestmentDocument()`: Upload com multipart/form-data
  - `getInvestmentDocuments()`: Lista documentos do aporte
  - `downloadInvestmentDocument()`: Download de blob
  - `deleteInvestmentDocument()`: Exclusão de documento

- **Helpers**:
  - `getCategoryLabel()`: Label da categoria
  - `getCategoryIcon()`: Emoji da categoria
  - `formatFileSize()`: Formata bytes (KB, MB, GB)
  - `getFileExtension()`: Extrai extensão do arquivo
  - `getCategoryColor()`: Cor da categoria
  - `triggerDownload()`: Trigger download no navegador
  - `isValidFileType()`: Valida MIME type
  - `isValidFileSize()`: Valida tamanho (max 10MB)

**2. `/app/dashboard/investidores/aportes/[id]/page.tsx`** (748 linhas)
- **Página de Detalhes do Aporte** com:
  - Header com status, ações (Editar, Excluir)
  - Cards estatísticos (Status, Valor, Data, Documentos)
  - Informações do Projeto
  - Informações do Investidor
  - Detalhes do Aporte
  - Observações
  - **Seção de Documentos** (integrada)

- **Estados Gerenciados**:
  ```typescript
  investment: InvestmentDetails | null
  loading: boolean
  deleting: boolean
  documents: InvestmentDocument[]
  loadingDocuments: boolean
  uploadDialogOpen: boolean
  uploading: boolean
  selectedFile: File | null
  documentForm: {
    name: string
    description: string
    category: InvestmentDocumentCategory
    tags: string
  }
  ```

- **Funções**:
  - `loadInvestment()`: Carrega detalhes do aporte
  - `loadDocuments()`: Carrega lista de documentos
  - `handleFileSelect()`: Gerencia seleção de arquivo
  - `handleUpload()`: Processa upload do documento
  - `handleDownload()`: Gerencia download do documento
  - `handleDeleteDocument()`: Exclui documento com confirmação
  - `handleDelete()`: Exclui o aporte inteiro

## 🎨 Interface

### Card de Documentos
```tsx
<Card>
  <CardHeader>
    <CardTitle>
      <Paperclip /> Documentos do Aporte
    </CardTitle>
    <Button>
      <Upload /> Enviar Documento
    </Button>
  </CardHeader>
  <CardContent>
    {/* Tabela ou Estado Vazio */}
  </CardContent>
</Card>
```

### Modal de Upload
- Campo de arquivo com preview
- Nome do documento (auto-preenchido com nome do arquivo)
- Select de categoria com 6 opções
- Textarea para descrição
- Input para tags (separadas por vírgula)
- Botões: Cancelar e Enviar

### Tabela de Documentos
- Linha para cada documento
- Badge de categoria com cor
- Tamanho formatado (KB, MB)
- Data formatada (DD/MM/YYYY)
- Botões de ação: Download e Excluir

### Estado Vazio
```tsx
<EmptyState>
  <Paperclip icon />
  <h3>Nenhum documento cadastrado</h3>
  <p>Envie o primeiro documento deste aporte</p>
  <Button>Enviar Documento</Button>
</EmptyState>
```

## 🔌 Integração com API

### Endpoints Utilizados

1. **Upload**: `POST /scp/investments/documents/upload`
   - Headers: `Authorization`, `Content-Type: multipart/form-data`, `X-Company-ID`
   - Body: FormData com file, investmentId, name, category, description, tags

2. **Listar**: `GET /scp/investments/documents/:investmentId`
   - Headers: `Authorization`, `X-Company-ID`
   - Query: page, limit

3. **Download**: `GET /scp/investments/documents/:documentId/download`
   - Headers: `Authorization`, `X-Company-ID`
   - Response: Blob

4. **Excluir**: `DELETE /scp/investments/documents/:documentId`
   - Headers: `Authorization`, `X-Company-ID`
   - Response: 204 No Content

### Headers Obrigatórios

```typescript
{
  "Authorization": "Bearer {token}",
  "X-Company-ID": "{companyId}",
  "Content-Type": "multipart/form-data" // apenas para upload
}
```

## 📊 Fluxo de Uso

### Upload de Documento
1. Usuário está na página de detalhes do aporte
2. Clica em "Enviar Documento"
3. Modal abre com formulário vazio
4. Seleciona arquivo
5. Nome é auto-preenchido (pode ser editado)
6. Seleciona categoria
7. Opcionalmente preenche descrição e tags
8. Clica em "Enviar"
9. Sistema valida (arquivo + nome + categoria)
10. Faz upload via API
11. Mostra toast de sucesso
12. Fecha modal
13. Recarrega lista de documentos
14. Recarrega aporte (atualiza contador de attachments)
15. Limpa formulário

### Download de Documento
1. Usuário clica no botão de download
2. Sistema busca blob do backend
3. Cria URL temporária do blob
4. Trigger download no navegador
5. Limpa URL temporária
6. Mostra toast de sucesso

### Exclusão de Documento
1. Usuário clica no botão de excluir
2. AlertDialog pergunta confirmação
3. Mostra nome do documento
4. Usuário confirma
5. Sistema chama API de exclusão
6. Mostra toast de sucesso
7. Recarrega lista de documentos
8. Recarrega aporte (atualiza contador)

## 🎯 Localização na Interface

A seção de documentos está localizada na página de detalhes do aporte:

```
/dashboard/investidores/aportes/[id]
  ├── Header (Status, Ações)
  ├── Cards Estatísticos (Status, Valor, Data, Documentos)
  ├── Informações do Projeto
  ├── Informações do Investidor
  ├── Detalhes do Aporte
  ├── Observações
  ├── 📎 DOCUMENTOS DO APORTE ← AQUI
  └── (fim)
```

## ✅ Validações

### Upload
- ✅ Arquivo é obrigatório
- ✅ Nome é obrigatório
- ✅ Categoria é obrigatória
- ✅ Validação de tamanho (helpers disponíveis - max 10MB)
- ✅ Validação de tipo MIME (helpers disponíveis)

### Download
- ✅ Documento deve existir
- ✅ Documento deve pertencer ao módulo SCP
- ✅ Usuário deve ter permissão
- ✅ Header X-Company-ID obrigatório

### Exclusão
- ✅ Confirmação obrigatória
- ✅ Documento deve existir
- ✅ Documento deve pertencer ao módulo SCP
- ✅ Usuário deve ter permissão
- ✅ Arquivo físico é removido do disco
- ✅ Array attachments é atualizado

## 🎨 Design System

### Componentes Utilizados
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
- `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`
- `Button` (primary, outline, ghost, sm, destructive)
- `Input` (text, file)
- `Label`
- `Textarea`
- `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`
- `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell`
- `Badge` (outline)
- `AlertDialog` (confirmação de exclusão)
- `Loader2` (spinner)
- Ícones do `lucide-react`

### Cores e Estados
- **Loading**: Spinner cinza centralizado
- **Empty State**: Ícone opaco, texto muted
- **Upload**: Botão primário
- **Download**: Botão ghost
- **Delete**: Botão ghost, modal destructive
- **Badge**: Variant outline
- **Status Colors**: Verde (Confirmado), Amarelo (Pendente), Vermelho (Cancelado)

## 🔗 Vinculação de Documentos

### Tags Automáticas
Cada documento recebe automaticamente:
- `SCP` - Módulo
- `Aporte` ou `Investimento` - Tipo
- `{PROJECT_CODE}` - Código do projeto (ex: "SOLAR-001")
- `{INVESTMENT_ID}` - UUID do aporte
- `{CPF}` ou `{CNPJ}` - Documento do investidor
- `{CATEGORY}` - Categoria escolhida
- Tags customizadas do usuário

### Campo Reference
Formato: `SCP-APT-{PROJECT_CODE}-{INVESTMENT_ID_SHORT}`

Exemplo: `SCP-APT-SOLAR-001-a1b2c3d4`

### Array Attachments
O campo `attachments` do Investment é atualizado automaticamente:
```json
{
  "attachments": [
    "/documents/uuid-doc-1",
    "/documents/uuid-doc-2",
    "/documents/uuid-doc-3"
  ]
}
```

## 🚀 Próximas Melhorias Possíveis

1. **Upload na Criação**:
   - Permitir upload de documentos ao criar novo aporte
   - Formulário de criação com seção de anexos

2. **Filtros**:
   - Por categoria
   - Por data
   - Por nome

3. **Ordenação**:
   - Por nome
   - Por data
   - Por tamanho

4. **Paginação**:
   - Controles de página
   - Items por página

5. **Preview**:
   - Visualizar PDF inline
   - Visualizar imagens inline
   - Modal de preview

6. **Bulk Actions**:
   - Selecionar múltiplos
   - Download em lote (ZIP)
   - Exclusão em lote

7. **Versionamento**:
   - Histórico de versões
   - Comparação de versões
   - Restaurar versão anterior

8. **Compartilhamento**:
   - Link público temporário
   - Compartilhar com investidor específico
   - Controle de acesso por documento

9. **Notificações**:
   - Email ao investidor quando documento é adicionado
   - Notificações no sistema

## 📝 Observações

- ✅ Todos os erros TypeScript resolvidos
- ✅ Usa helpers da API para formatação
- ✅ Headers X-Company-ID enviados corretamente
- ✅ Feedback visual em todas operações
- ✅ Confirmação antes de exclusão
- ✅ Limpeza de formulário após upload
- ✅ Recarregamento automático após operações
- ✅ Tratamento de erros em todas funções
- ✅ Loading states em todas operações assíncronas
- ✅ Responsivo e acessível
- ✅ Integrado à página de detalhes
- ✅ Counter de documentos nos cards

## 🎉 Status

**✅ IMPLEMENTADO E FUNCIONAL**

Sistema completo de gerenciamento de documentos integrado à página de detalhes do aporte, seguindo o padrão de design do sistema e com todas as funcionalidades solicitadas.

## 📊 Estatísticas

- **1 novo arquivo API**: `/lib/api/investment-documents.ts` (360 linhas)
- **1 nova página**: `/app/dashboard/investidores/aportes/[id]/page.tsx` (748 linhas)
- **Total**: 1108 linhas de código
- **4 endpoints**: Upload, Listar, Download, Excluir
- **8 helpers**: Formatação, validação, triggers
- **6 categorias**: Comprovantes, Contratos, Recibos, Termos, Documentos Bancários, Outros
