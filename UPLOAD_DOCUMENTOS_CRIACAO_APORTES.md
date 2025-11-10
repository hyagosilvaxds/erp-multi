# Upload de Documentos na Criação de Aportes

## 📋 Visão Geral

Sistema de upload de documentos integrado ao formulário de criação de aportes, permitindo que o usuário anexe comprovantes, contratos e outros documentos no momento em que está registrando um novo aporte.

## 🎯 Funcionalidades Implementadas

### 1. Seleção de Arquivos
- **Input de Arquivo**: Input file estilizado com drag & drop visual
- **Múltiplos Arquivos**: Permite selecionar vários arquivos de uma vez
- **Tipos Aceitos**: PDF, Word, Excel, Imagens (JPG, PNG)
- **Limite de Tamanho**: 10MB por arquivo (validado no backend)
- **Preview**: Mostra nome e tamanho de cada arquivo selecionado

### 2. Metadados dos Documentos
Para cada arquivo selecionado, o usuário pode configurar:
- **Nome do Documento**: Editar nome exibido (padrão: nome do arquivo)
- **Categoria**: Selecionar entre 6 categorias disponíveis
- **Descrição**: Adicionar descrição opcional

### 3. Fluxo de Upload
1. Usuário preenche formulário do aporte
2. Seleciona arquivos para upload
3. Configura metadados de cada arquivo
4. Clica em "Salvar Aporte"
5. Sistema cria o aporte primeiro
6. Após sucesso, faz upload dos documentos
7. Mostra feedback de sucesso/erro
8. Redireciona para lista de aportes

### 4. Feedback Visual
- **Contador**: Mostra quantos arquivos serão enviados
- **Loading States**: Spinner durante upload
- **Mensagem Dinâmica**: "Enviando documentos..." durante upload
- **Toast**: Notificação de sucesso/erro com contador
- **Preview de Arquivos**: Cards expandidos com todos os metadados

## 📁 Modificações nos Arquivos

### Arquivo Modificado: `/app/dashboard/investidores/aportes/novo/page.tsx`

#### Imports Adicionados
```typescript
import {
  Paperclip,
  FileText,
} from "lucide-react"
import { investmentDocumentsApi, type InvestmentDocumentCategory } from "@/lib/api/investment-documents"
```

#### Estados Adicionados
```typescript
// Estados para upload de documentos
const [filesToUpload, setFilesToUpload] = useState<Array<{
  file: File
  name: string
  category: InvestmentDocumentCategory
  description: string
}>>([])
const [uploadingDocuments, setUploadingDocuments] = useState(false)
```

#### Funções Adicionadas

**1. `handleFileSelect()`**
- Processa seleção de arquivos do input
- Cria objetos com file + metadados
- Adiciona à lista de arquivos
- Limpa input para permitir nova seleção

**2. `handleRemoveFile()`**
- Remove arquivo da lista de upload
- Usa índice para identificação

**3. `handleUpdateFileMetadata()`**
- Atualiza nome, categoria ou descrição
- Usa índice + campo + valor
- Imutável: cria novo array

**4. `uploadDocuments()`**
- Recebe investmentId após criação
- Itera sobre filesToUpload
- Chama API para cada arquivo
- Conta sucessos e erros
- Mostra toast com resultado

**5. `handleSubmit()` (modificado)**
- Mantém validações existentes
- Cria aporte primeiro
- Recebe ID do aporte criado
- Chama uploadDocuments() se houver arquivos
- Aguarda conclusão antes de redirecionar

## 🎨 Interface

### Card de Upload de Documentos
```tsx
<Card>
  <CardHeader>
    <CardTitle>Documentos e Comprovantes</CardTitle>
    <CardDescription>
      Faça upload dos documentos relacionados ao aporte
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* Input de Arquivo */}
    {/* Lista de Arquivos */}
    {/* Links para Documentos (legado) */}
  </CardContent>
</Card>
```

### Input de Arquivo
- Border dashed com hover effect
- Ícone de upload centralizado
- Texto explicativo
- Tipos de arquivo aceitos
- Hidden input com label customizada

### Card de Arquivo
Para cada arquivo selecionado:
```tsx
<div className="border rounded-lg p-4">
  {/* Header com nome + botão remover */}
  <div className="flex items-start justify-between">
    <FileText icon + filename + size />
    <Button remove />
  </div>
  
  {/* Metadados editáveis */}
  <Input name />
  <Select category />
  <Textarea description />
</div>
```

### Sidebar - Informações
- Mostra contador de arquivos
- "X arquivo(s) será(ão) enviado(s) após salvar"
- Atualiza em tempo real

### Botão de Salvar
- Desabilitado durante upload
- Texto dinâmico:
  - "Salvando..." (criando aporte)
  - "Enviando documentos..." (após criar)
  - "Salvar Aporte" (padrão)

## 📊 Fluxo Detalhado

### Fluxo de Criação com Documentos

```
1. Usuário preenche formulário
   ├── Projeto
   ├── Investidor
   ├── Valor
   ├── Data
   ├── Status
   └── Método de Pagamento

2. Usuário clica em "Selecionar arquivos"
   ├── Input file abre
   ├── Seleciona 3 arquivos
   └── Arquivos adicionados à lista

3. Para cada arquivo, usuário configura:
   ├── Nome: "Comprovante de TED"
   ├── Categoria: "Comprovantes"
   └── Descrição: "Transferência de R$ 50.000"

4. Usuário clica em "Salvar Aporte"
   ├── setIsSaving(true)
   ├── Validações do formulário
   ├── POST /scp/investments (cria aporte)
   │   └── Retorna: { id: "uuid-investment" }
   │
   ├── setUploadingDocuments(true)
   ├── Para cada arquivo em filesToUpload:
   │   ├── POST /scp/investments/documents/upload
   │   │   ├── Headers: Authorization, X-Company-ID
   │   │   ├── Body: FormData
   │   │   │   ├── file: binary
   │   │   │   ├── investmentId: "uuid-investment"
   │   │   │   ├── name: "Comprovante de TED"
   │   │   │   ├── category: "Comprovantes"
   │   │   │   └── description: "..."
   │   │   └── Resultado: success/error
   │   └── Incrementa contador
   │
   ├── setUploadingDocuments(false)
   ├── Toast: "3 documento(s) enviado(s) com sucesso"
   └── router.push("/dashboard/investidores/aportes")

5. Página de listagem carregada
   └── Novo aporte aparece com 3 documentos
```

## ✅ Validações

### Frontend
- ✅ Tipos de arquivo aceitos (.pdf, .doc, .docx, .xls, .xlsx, .jpg, .jpeg, .png)
- ✅ Nome do documento é obrigatório (já preenchido)
- ✅ Categoria é obrigatória (padrão: "Comprovantes")
- ✅ Descrição é opcional
- ✅ Validações do formulário de aporte mantidas

### Backend (esperado)
- ✅ Tamanho máximo: 10MB por arquivo
- ✅ MIME type validation
- ✅ Header X-Company-ID obrigatório
- ✅ InvestmentId deve existir
- ✅ Usuário deve ter permissão

## 🔄 Tratamento de Erros

### Cenários de Erro

**1. Erro ao Criar Aporte**
```typescript
- Upload NÃO é iniciado
- Toast: "Erro ao criar aporte: {mensagem}"
- Usuário permanece na página
- Arquivos permanecem selecionados
- Usuário pode corrigir e tentar novamente
```

**2. Erro ao Upload de Documento(s)**
```typescript
- Aporte JÁ FOI CRIADO (sucesso)
- Alguns uploads falham
- Toast: "X documento(s) enviado(s) com sucesso. Y falhou(aram)"
- Redireciona para lista de aportes
- Usuário pode adicionar documentos manualmente depois
```

**3. Erro em Todos os Uploads**
```typescript
- Aporte criado com sucesso
- Nenhum documento foi enviado
- Toast: "Erro ao enviar documentos: Falha ao enviar X documento(s)"
- Redireciona para lista de aportes
- Usuário pode adicionar documentos na página de detalhes
```

## 🎯 Categorias Disponíveis

1. 🧾 **Comprovantes** (padrão)
2. 📄 **Contratos**
3. 🧾 **Recibos**
4. 📋 **Termos**
5. 🏦 **Documentos Bancários**
6. 📎 **Outros**

## 🚀 Melhorias Futuras Possíveis

1. **Drag & Drop**:
   - Arrastar e soltar arquivos na área
   - Implementar onDrop handler

2. **Validação de Tamanho no Frontend**:
   - Validar 10MB antes de adicionar
   - Mostrar mensagem de erro

3. **Preview de Imagens**:
   - Miniatura para JPG/PNG
   - Modal de preview

4. **Progresso de Upload**:
   - Barra de progresso por arquivo
   - Percentual de conclusão
   - Upload paralelo

5. **Upload em Background**:
   - Permitir navegação durante upload
   - Notificação quando concluir
   - Fila de uploads

6. **Validação de Tipo**:
   - Verificar MIME type no frontend
   - Prevenir arquivos inválidos

7. **Compressão**:
   - Comprimir imagens grandes
   - Reduzir tamanho antes de enviar

8. **Upload Opcional**:
   - Checkbox "Adicionar documentos depois"
   - Skip upload e criar apenas aporte

## 📝 Observações Importantes

### ✅ Vantagens da Implementação

1. **UX Melhorada**: Upload integrado ao fluxo de criação
2. **Validação Antecipada**: Configura metadados antes de enviar
3. **Feedback Claro**: Toast mostra sucessos e falhas
4. **Fallback Robusto**: Se upload falha, aporte já foi criado
5. **Flexibilidade**: Pode adicionar documentos depois também

### ⚠️ Considerações

1. **Aporte Criado Primeiro**: Mesmo se todos uploads falharem, aporte existe
2. **Sem Rollback**: Se upload falha, não deleta o aporte
3. **Upload Sequencial**: Um por vez (pode ser lento com muitos arquivos)
4. **Sem Cache**: Se usuário sai da página, perde arquivos selecionados
5. **Limite de Tamanho**: 10MB validado no backend, não no frontend

### 🔗 Compatibilidade

- ✅ Mantém sistema de links (attachments array) para compatibilidade
- ✅ Funciona com backend existente
- ✅ Não quebra fluxo atual
- ✅ Adiciona funcionalidade sem remover existente

## 🎉 Status

**✅ IMPLEMENTADO E FUNCIONAL**

Sistema de upload de documentos integrado ao formulário de criação de aportes, com:
- Upload de múltiplos arquivos
- Edição de metadados
- Feedback visual
- Tratamento de erros
- Compatibilidade com sistema existente

## 📊 Estatísticas

- **Arquivo Modificado**: 1 (`/app/dashboard/investidores/aportes/novo/page.tsx`)
- **Linhas Adicionadas**: ~200 linhas
- **Novas Funções**: 4 (handleFileSelect, handleRemoveFile, handleUpdateFileMetadata, uploadDocuments)
- **Novos Estados**: 2 (filesToUpload, uploadingDocuments)
- **Imports Adicionados**: 3 (Paperclip, FileText, investmentDocumentsApi)
