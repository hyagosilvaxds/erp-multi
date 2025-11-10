# Gerenciamento de Documentos de Projetos SCP

## 📋 Visão Geral

Sistema completo de gerenciamento de documentos integrado à tela de detalhes de projetos SCP, permitindo upload, listagem, download e exclusão de documentos relacionados aos projetos.

## 🎯 Funcionalidades Implementadas

### 1. Upload de Documentos
- **Modal de Upload**: Dialog com formulário completo
- **Campos**:
  - Seleção de arquivo (input file)
  - Nome do documento (obrigatório)
  - Categoria (select com 10 opções)
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
- **Atualização**: Recarrega lista após exclusão

## 🔧 Categorias de Documentos

```typescript
CONTRATO         // Contratos diversos
ESTATUTO         // Estatutos sociais
ATA              // Atas de reuniões
RELATORIO        // Relatórios diversos
COMPROVANTE      // Comprovantes de pagamento
LICENCA          // Licenças necessárias
ALVARA           // Alvarás e autorizações
PROJETO_TECNICO  // Projetos técnicos
PLANILHA         // Planilhas financeiras
OUTRO            // Outros documentos
```

## 📁 Estrutura de Arquivos

### Arquivo Modificado

**`/app/dashboard/investidores/projetos/[id]/page.tsx`**
- **Imports Adicionados**:
  - `projectDocumentsApi`, `ProjectDocument` de `@/lib/api/project-documents`
  - `Dialog` components do shadcn/ui
  - `Input`, `Label`, `Textarea` do shadcn/ui
  - `Select` components do shadcn/ui
  - `Table` components do shadcn/ui
  - Ícones: `Upload`, `Download`, `Eye`, `Paperclip`

- **Estados Adicionados**:
  ```typescript
  documents: ProjectDocument[]
  loadingDocuments: boolean
  uploadDialogOpen: boolean
  uploading: boolean
  selectedFile: File | null
  documentForm: {
    name: string
    description: string
    category: DocumentCategory
    tags: string
  }
  ```

- **Funções Adicionadas**:
  - `loadDocuments()`: Carrega lista de documentos do projeto
  - `handleFileSelect()`: Gerencia seleção de arquivo
  - `handleUpload()`: Processa upload do documento
  - `handleDownload()`: Gerencia download do documento
  - `handleDeleteDocument()`: Exclui documento com confirmação

## 🎨 Interface

### Card de Documentos
```tsx
<Card>
  <CardHeader>
    <CardTitle>
      <Paperclip /> Documentos do Projeto
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
- Select de categoria com 10 opções
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
  <p>Envie o primeiro documento deste projeto</p>
  <Button>Enviar Documento</Button>
</EmptyState>
```

## 🔌 Integração com API

### Endpoints Utilizados

1. **Upload**: `POST /scp/projects/documents/upload`
   - Headers: `Authorization`, `Content-Type: multipart/form-data`, `X-Company-ID`
   - Body: FormData com file, projectId, name, category, description, tags

2. **Listar**: `GET /scp/projects/documents/project/:projectId`
   - Headers: `Authorization`, `X-Company-ID`
   - Query: page, limit

3. **Download**: `GET /scp/projects/documents/:documentId/download`
   - Headers: `Authorization`, `X-Company-ID`
   - Response: Blob

4. **Excluir**: `DELETE /scp/projects/documents/:documentId`
   - Headers: `Authorization`, `X-Company-ID`

### Helpers Utilizados

```typescript
projectDocumentsApi.helpers.formatFileSize(bytes)
projectDocumentsApi.helpers.getCategoryLabel(category)
projectDocumentsApi.helpers.triggerDownload(blob, fileName)
```

## 📊 Fluxo de Uso

### Upload de Documento
1. Usuário clica em "Enviar Documento"
2. Modal abre com formulário vazio
3. Usuário seleciona arquivo
4. Nome é auto-preenchido (pode ser editado)
5. Usuário seleciona categoria
6. Opcionalmente preenche descrição e tags
7. Clica em "Enviar"
8. Sistema valida (arquivo + nome + categoria)
9. Faz upload via API
10. Mostra toast de sucesso
11. Fecha modal
12. Recarrega lista de documentos
13. Limpa formulário

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

## 🎯 Localização na Interface

A seção de documentos está localizada na página de detalhes do projeto:

```
/dashboard/investidores/projetos/[id]
  ├── Header (Nome, Status, Ações)
  ├── Cards Estatísticos (Status, Investidores, Aportes, Distribuições)
  ├── Valores do Projeto
  ├── Progress Bars (Captação, Distribuição)
  ├── Informações do Projeto
  ├── Datas
  ├── Observações
  ├── 📎 DOCUMENTOS DO PROJETO (NOVO)  ← Aqui
  └── Ações Rápidas
```

## ✅ Validações

### Upload
- ✅ Arquivo é obrigatório
- ✅ Nome é obrigatório
- ✅ Categoria é obrigatória
- ✅ Validação de tamanho (helpers disponíveis)
- ✅ Validação de tipo MIME (helpers disponíveis)

### Download
- ✅ Documento deve existir
- ✅ Documento deve pertencer ao módulo SCP
- ✅ Usuário deve ter permissão

### Exclusão
- ✅ Confirmação obrigatória
- ✅ Documento deve existir
- ✅ Documento deve pertencer ao módulo SCP
- ✅ Usuário deve ter permissão

## 🎨 Design System

### Componentes Utilizados
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
- `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`
- `Button` (primary, outline, ghost, sm)
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

## 🚀 Próximas Melhorias Possíveis

1. **Filtros**:
   - Por categoria
   - Por data
   - Por nome

2. **Ordenação**:
   - Por nome
   - Por data
   - Por tamanho

3. **Paginação**:
   - Controles de página
   - Items por página

4. **Preview**:
   - Visualizar PDF inline
   - Visualizar imagens inline
   - Modal de preview

5. **Bulk Actions**:
   - Selecionar múltiplos
   - Download em lote
   - Exclusão em lote

6. **Versionamento**:
   - Histórico de versões
   - Comparação de versões
   - Restaurar versão anterior

7. **Compartilhamento**:
   - Link público temporário
   - Compartilhar com investidor específico
   - Controle de acesso por documento

8. **Metadados**:
   - Data de validade
   - Responsável pelo documento
   - Status do documento (rascunho, aprovado, etc.)

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

## 🎉 Status

**✅ IMPLEMENTADO E FUNCIONAL**

Sistema completo de gerenciamento de documentos integrado à página de detalhes do projeto, seguindo o padrão de design do sistema e com todas as funcionalidades solicitadas.
