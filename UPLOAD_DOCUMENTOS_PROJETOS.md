# Upload de Documentos em Projetos SCP

## 📋 Resumo

Sistema de upload e gerenciamento de documentos para projetos SCP implementado diretamente na página de cadastro de projetos. Permite que usuários façam upload de arquivos (PDF, Word, Excel, imagens) durante a criação do projeto, com categorização, descrição e tags.

## ✅ Implementação Completa

### 1. API Client (`/lib/api/project-documents.ts`)
- **Criado anteriormente** com todas as funções necessárias:
  - `upload()` - Upload com FormData multipart
  - `getAll()` - Listagem paginada
  - `download()` - Download de arquivos
  - `delete()` - Exclusão de documentos

### 2. Página de Cadastro de Projetos (`/app/dashboard/investidores/projetos/novo/page.tsx`)

#### Estados Adicionados
```typescript
// Upload de arquivos
const [uploadingFiles, setUploadingFiles] = useState<boolean>(false)

// Lista de documentos para upload
const [documentFiles, setDocumentFiles] = useState<Array<{
  file: File
  category: DocumentCategory
  name: string
  description: string
  tags: string
}>>([])

// Formulário de novo documento
const [newDocument, setNewDocument] = useState<{
  category: DocumentCategory
  name: string
  description: string
  tags: string
}>({
  category: "OUTRO",
  name: "",
  description: "",
  tags: "",
})
```

#### Funções Implementadas

##### handleFileSelect
Valida e adiciona arquivo à lista de upload:
- Valida tipo de arquivo (PDF, Word, Excel, Imagens)
- Valida tamanho (máx. 10MB)
- Adiciona à lista com metadados
- Limpa formulário

##### handleRemoveDocumentFile
Remove arquivo da lista antes do upload:
```typescript
const handleRemoveDocumentFile = (index: number) => {
  setDocumentFiles(prev => prev.filter((_, i) => i !== index))
}
```

##### handleSubmit (atualizado)
Fluxo completo:
1. Cria o projeto
2. Se houver documentos, faz upload de cada um
3. Exibe progresso (estado `uploadingFiles`)
4. Continua mesmo se um documento falhar
5. Redireciona ao final

```typescript
// Upload de documentos (se houver)
if (documentFiles.length > 0) {
  setUploadingFiles(true)
  
  for (const doc of documentFiles) {
    try {
      await projectDocumentsApi.upload({
        projectId: createdProject.id,
        file: doc.file,
        category: doc.category,
        name: doc.name,
        description: doc.description,
        tags: doc.tags || undefined,
      })
    } catch (error) {
      console.error("Erro ao fazer upload do documento:", doc.name, error)
      // Continuar com os próximos documentos
    }
  }
  
  setUploadingFiles(false)
}
```

#### Interface de Upload

##### Formulário de Documento
Localizado após a seção "Documentos e Anexos" (links):

**Campos**:
1. **Categoria** (obrigatório)
   - Select com 10 opções
   - CONTRATO, ESTATUTO, ATA, RELATORIO, COMPROVANTE, LICENCA, ALVARA, PROJETO_TECNICO, PLANILHA, OUTRO

2. **Nome do Documento** (opcional)
   - Input text
   - Se vazio, usa nome do arquivo

3. **Descrição** (opcional)
   - Textarea
   - Descreve o conteúdo

4. **Tags** (opcional)
   - Input text
   - Separadas por vírgula
   - Ex: "importante, financeiro, 2024"

5. **Selecionar Arquivo** (obrigatório)
   - Input file
   - Accept: `.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif`
   - Máx 10MB

##### Lista de Documentos Pendentes
Exibe arquivos selecionados antes do upload:

**Informações mostradas**:
- Ícone (FileText)
- Nome do documento
- Categoria (label)
- Tamanho formatado (ex: "2.5 MB")
- Descrição (se houver)
- Tags (badges)
- Botão remover

**Exemplo visual**:
```
📄 Contrato Social 2024
   Contrato • 2.5 MB
   Contrato social da empresa atualizado em 2024
   [importante] [financeiro] [2024]
   [🗑️]
```

##### Estado Vazio
Quando não há documentos:
```
📎
Nenhum arquivo selecionado
Preencha os campos acima e selecione um arquivo
```

#### Botão de Salvar Atualizado

Três estados visuais:

1. **Normal** (isSaving=false, uploadingFiles=false)
```
💾 Salvar Projeto (+ 3 docs)
```

2. **Salvando Projeto** (isSaving=true)
```
⏳ Salvando projeto...
```

3. **Enviando Documentos** (uploadingFiles=true)
```
⏳ Enviando documentos...
```

Botão desabilitado durante salvamento ou upload.

## 🎯 Fluxo de Uso

### Passo a Passo

1. **Usuário preenche dados do projeto**
   - Nome, código, descrição, valores, datas

2. **Usuário adiciona links (opcional)**
   - Seção "Documentos e Anexos"
   - URLs de documentos externos

3. **Usuário seleciona categoria do documento**
   - Escolhe entre 10 categorias disponíveis

4. **Usuário preenche metadados (opcional)**
   - Nome personalizado
   - Descrição detalhada
   - Tags para busca

5. **Usuário seleciona arquivo**
   - Sistema valida tipo e tamanho
   - Adiciona à lista de pendentes
   - Limpa formulário para próximo documento

6. **Usuário repete 3-5 para adicionar mais documentos**

7. **Usuário visualiza lista de documentos pendentes**
   - Pode remover qualquer documento

8. **Usuário clica em "Salvar Projeto"**
   - Sistema cria projeto
   - Sistema faz upload de cada documento
   - Exibe progresso visual
   - Redireciona ao final

## 🔒 Validações

### Cliente (Frontend)
- **Tipo de arquivo**: PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG, GIF
- **Tamanho**: Máximo 10MB por arquivo
- **Campos obrigatórios**: Categoria e Arquivo

### Servidor (Backend - esperado)
- Mesmas validações de tipo e tamanho
- Organização em pastas: `SCP > Projetos > [Code-Name] > [Category]`
- Relacionamento com projeto e empresa
- Registro de quem fez upload

## 📊 Categorias de Documentos

| Categoria | Label | Uso |
|-----------|-------|-----|
| CONTRATO | Contrato | Contratos sociais, de prestação de serviço |
| ESTATUTO | Estatuto | Estatutos sociais, regimentos |
| ATA | Ata de Reunião | Atas de assembleias, reuniões |
| RELATORIO | Relatório | Relatórios financeiros, de progresso |
| COMPROVANTE | Comprovante | Comprovantes de pagamento, transferência |
| LICENCA | Licença | Licenças de operação, uso |
| ALVARA | Alvará | Alvarás de funcionamento, construção |
| PROJETO_TECNICO | Projeto Técnico | Projetos de engenharia, arquitetura |
| PLANILHA | Planilha | Planilhas de custo, orçamento |
| OUTRO | Outro | Documentos diversos |

## 🎨 Componentes UI Utilizados

- **Card** - Container de seções
- **Input** - Campos de texto e file
- **Button** - Ações (adicionar, remover, salvar)
- **Select** - Dropdown de categorias
- **Textarea** - Descrição longa
- **Badge** - Tags visuais
- **Icons** - FileText, Upload, Trash2, Loader2, Save

## 🔄 Melhorias Futuras Sugeridas

### Curto Prazo
- [ ] Drag & drop de arquivos
- [ ] Preview de imagens antes do upload
- [ ] Upload múltiplo simultâneo
- [ ] Barra de progresso por arquivo

### Médio Prazo
- [ ] Edição de documentos após upload
- [ ] Visualizador de PDF in-app
- [ ] Assinatura digital de documentos
- [ ] Versionamento de arquivos

### Longo Prazo
- [ ] OCR para documentos escaneados
- [ ] Busca por conteúdo dentro dos PDFs
- [ ] Integração com armazenamento na nuvem
- [ ] Compartilhamento seguro com investidores

## 🐛 Tratamento de Erros

### Erros de Validação
- Tipo de arquivo inválido → Toast vermelho
- Arquivo muito grande → Toast vermelho
- Campos obrigatórios vazios → Toast laranja

### Erros de Upload
- Falha ao criar projeto → Para processo, mostra erro
- Falha ao fazer upload de documento → Continua com próximos, log no console
- Erro de rede → Toast de erro genérico

### Estados de Loading
- `isSaving` - Durante criação do projeto
- `uploadingFiles` - Durante upload de documentos
- Ambos desabilitam botões e mostram feedback visual

## 📝 Exemplo de Uso Completo

```typescript
// 1. Usuário preenche projeto
formData = {
  code: "PROJ-001",
  name: "Construção Shopping Center",
  totalValue: 5000000,
  startDate: "2024-01-01",
  // ...
}

// 2. Usuário adiciona documentos
documentFiles = [
  {
    file: File { name: "contrato-social.pdf", size: 2500000 },
    category: "CONTRATO",
    name: "Contrato Social 2024",
    description: "Contrato social da empresa atualizado",
    tags: "importante, juridico"
  },
  {
    file: File { name: "orcamento.xlsx", size: 850000 },
    category: "PLANILHA",
    name: "Orçamento Detalhado",
    description: "Planilha com custos e projeções",
    tags: "financeiro, planejamento"
  }
]

// 3. Sistema processa
// - Cria projeto → ID: "proj-123"
// - Upload contrato-social.pdf → doc-456
// - Upload orcamento.xlsx → doc-789
// - Redireciona → /dashboard/investidores/projetos
```

## 🎯 Integração com Sistema

### Arquivos Modificados
1. `/app/dashboard/investidores/projetos/novo/page.tsx`
   - Adicionados estados para documentos
   - Implementadas funções de validação e upload
   - Criada seção de UI para upload
   - Atualizado botão de salvar

### Arquivos Utilizados (já existentes)
1. `/lib/api/project-documents.ts` - API client
2. `/lib/api/projects.ts` - Criação de projetos
3. `/components/ui/*` - Componentes de UI

### Endpoints da API
- `POST /api/scp/projects` - Criar projeto
- `POST /api/scp/projects/documents/upload` - Upload documento
- Autenticação: Bearer token (headers)
- Company: X-Company-ID header

## ✨ Conclusão

O sistema de upload de documentos está **totalmente implementado** na página de cadastro de projetos. Usuários podem:
- ✅ Adicionar múltiplos documentos durante criação
- ✅ Categorizar e descrever cada documento
- ✅ Visualizar lista antes do envio
- ✅ Remover documentos da lista
- ✅ Ver progresso do upload
- ✅ Validação completa (tipo e tamanho)

Próximo passo sugerido: **Criar página de visualização e gerenciamento de documentos de um projeto existente** (listagem, download, exclusão, edição).
