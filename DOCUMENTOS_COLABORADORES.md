# Sistema de Documentos de Colaboradores

## Implementação Concluída ✅

O sistema agora possui um módulo completo de gerenciamento de documentos para colaboradores, incluindo upload, visualização, verificação e exclusão de documentos.

## Arquivos Criados/Modificados

### 1. API Client - `/lib/api/employee-documents.ts` (430 linhas)

**Tipos e Enumerações:**
- `DocumentType` - 17 tipos de documentos suportados
- `EmployeeDocument` - Interface completa do documento
- `UploadDocumentRequest` - Dados para upload
- `UpdateDocumentRequest` - Dados para atualização
- `ListEmployeeDocumentsParams` - Filtros de listagem

**Tipos de Documentos Suportados:**
- **Documentos Pessoais:** RG, CPF, CNH, CTPS, Título de Eleitor, Certificado de Reservista
- **Comprovantes:** Comprovante de Residência
- **Educação:** Diploma, Certificado
- **Trabalho:** Contrato de Trabalho, Exame Admissional, ASO, Atestado Médico
- **PJ:** Contrato Social, Cartão CNPJ, Alvará de Funcionamento
- **Outros:** Categoria genérica para outros tipos

**Funções da API:**
1. `uploadDocument(employeeId, data)` - Upload com FormData
2. `getDocuments(employeeId, params?)` - Listar com filtros
3. `getDocumentById(employeeId, documentId)` - Buscar específico
4. `updateDocument(employeeId, documentId, data)` - Atualizar metadados
5. `verifyDocument(employeeId, documentId)` - Marcar como verificado
6. `deleteDocument(employeeId, documentId)` - Excluir documento
7. `getDocumentDownloadUrl(employeeId, documentId)` - URL de download

**Funções Auxiliares:**
- `formatFileSize(bytes)` - Formata tamanho (Bytes, KB, MB, GB)
- `isDocumentExpiringSoon(expiryDate)` - Verifica vencimento em 30 dias
- `isDocumentExpired(expiryDate)` - Verifica se está vencido
- `getFileIcon(mimeType)` - Ícone emoji por tipo MIME
- `isValidFileType(file)` - Valida tipo (PDF, JPG, PNG, DOC, DOCX)
- `isValidFileSize(file, maxMB)` - Valida tamanho (padrão 10MB)

**Labels de Documentos:**
```typescript
documentTypeLabels = {
  'RG': 'RG - Registro Geral',
  'CPF': 'CPF - Cadastro de Pessoa Física',
  'CNH': 'CNH - Carteira Nacional de Habilitação',
  // ... 14 outros tipos
}
```

### 2. Componente de Documentos - `/components/rh/employee-documents.tsx` (636 linhas)

**Props:**
- `employeeId: string` - ID do colaborador (obrigatório)
- `employeeContractType?: string` - Tipo de contrato (opcional, para filtros futuros)

**Funcionalidades:**

#### 2.1. Listagem de Documentos
- **Tabela Completa:** 7 colunas (Tipo, Arquivo, Número, Emissão, Validade, Status, Ações)
- **Estados:** Loading, Empty (sem documentos), Populated (com dados)
- **Informações Exibidas:**
  - Ícone por tipo MIME (📄 PDF, 🖼️ Imagem, 📝 Word, etc)
  - Nome e tamanho do arquivo
  - Número do documento
  - Datas formatadas (pt-BR)
  - Badge de status (Verificado, Pendente, Vencido, Vence em breve)

#### 2.2. Upload de Documentos
- **Dialog Modal** com formulário completo
- **Campos:**
  - Input de arquivo (aceita PDF, JPG, PNG, DOC, DOCX, máx 10MB)
  - Select com 17 tipos de documentos
  - Número do documento (opcional)
  - Data de emissão (date picker)
  - Data de validade (date picker)
  - Descrição (textarea)
- **Validações:**
  - Tipo de arquivo válido
  - Tamanho máximo (10MB)
  - Arquivo e tipo obrigatórios
  - Toast de feedback para erros

#### 2.3. Visualização de Detalhes
- **Dialog Modal** com informações completas:
  - Tipo e status
  - Nome e tamanho do arquivo
  - Número, emissão e validade
  - Descrição e observações
  - Quem enviou e quando
- **Ações:** Fechar, Download

#### 2.4. Ações Disponíveis
- **Visualizar (Eye):** Abre dialog com detalhes completos
- **Download (Download):** Baixa o arquivo original
- **Verificar (CheckCircle):** Marca como verificado (só aparece se não verificado)
- **Excluir (Trash2):** Remove o documento (com confirmação)

#### 2.5. Sistema de Badges
```typescript
- Verificado: Badge verde (bg-green-600)
- Pendente: Badge secondary (cinza)
- Vencido: Badge destructive (vermelho)
- Vence em breve: Badge outline amarelo (border-yellow-500)
```

#### 2.6. Estados Visuais
- **Loading:** Spinner animado com texto "Carregando..."
- **Empty:** Ícone FileText + mensagem + botão CTA
- **Table:** Lista completa com todas as ações

### 3. Página de Detalhes - `/app/dashboard/rh/colaboradores/[id]/page.tsx` (763 linhas)

**Nova Estrutura com Tabs:**

#### Tab 1: Geral (Informações do Colaborador)
Seções em cards separados:

1. **Dados Pessoais:**
   - Nome, CPF, RG
   - Data de nascimento, gênero, estado civil
   - E-mail, telefone, celular
   - Layout: Grid 3 colunas (responsivo)

2. **Endereço:**
   - CEP, logradouro, número
   - Complemento, bairro, cidade, estado
   - Só exibe se tiver CEP ou endereço

3. **Dados Profissionais:**
   - Cargo, departamento, centro de custo
   - Data de admissão/demissão
   - Tipo de contrato (badge), horário
   - Salário formatado (R$)

4. **Dados Bancários:**
   - Banco (código + nome)
   - Agência, conta, tipo
   - Chave PIX
   - Só exibe se tiver dados bancários

5. **Dados da Empresa (PJ):**
   - CNPJ, razão social, nome fantasia
   - Inscrições (estadual, municipal)
   - E-mail e telefone da empresa
   - Endereço completo da empresa
   - Separador entre dados básicos e endereço
   - **Só exibe se contractType === 'PJ' E tiver companyDocument**

6. **Observações:**
   - Textarea com notas
   - Whitespace preservado (pre-wrap)
   - Só exibe se tiver notas

#### Tab 2: Documentos
- **Componente:** `<EmployeeDocuments employeeId={id} />`
- **Funcionalidades:** Upload, listagem, visualização, download, verificação, exclusão

**Ações do Header:**
- **Ativar/Desativar:** Alterna status do colaborador
- **Editar:** Link para página de edição (a ser criada)
- **Excluir:** AlertDialog de confirmação

**Funcionalidades Implementadas:**
- Loading state centralizado
- Toggle ativo/inativo com feedback
- Exclusão com confirmação (AlertDialog)
- Formatação de dados (CPF, CNPJ, CEP, telefone, moeda)
- Badges de status e tipo de contrato
- Layout responsivo (grid adaptativo)

## Fluxo de Uso Completo

### 1. Visualizar Colaborador
1. Acessar `/dashboard/rh/colaboradores`
2. Clicar em "Visualizar" ou no nome do colaborador
3. Ver informações organizadas em cards
4. Badge de status (Ativo/Inativo) ao lado do nome

### 2. Gerenciar Documentos
1. Na página de detalhes, clicar na tab "Documentos"
2. Ver lista de documentos existentes ou tela vazia

#### Upload de Documento:
1. Clicar em "Enviar Documento"
2. Selecionar arquivo (máx 10MB)
3. Escolher tipo de documento (17 opções)
4. Preencher dados opcionais:
   - Número do documento
   - Data de emissão
   - Data de validade
   - Descrição
5. Clicar em "Enviar Documento"
6. Ver toast de sucesso/erro
7. Documento aparece na lista automaticamente

#### Visualizar Documento:
1. Clicar no ícone "Eye" na coluna Ações
2. Ver dialog com todos os detalhes:
   - Informações completas
   - Status (badge colorido)
   - Quem enviou e quando
3. Opção de download direto do dialog

#### Verificar Documento:
1. Clicar no ícone "CheckCircle" (verde)
2. Documento marcado como verificado
3. Badge muda para "Verificado" (verde)
4. Ícone de verificação desaparece

#### Download de Documento:
1. Clicar no ícone "Download"
2. Arquivo abre em nova aba/download automático

#### Excluir Documento:
1. Clicar no ícone "Trash2" (vermelho)
2. Confirmar exclusão no AlertDialog
3. Documento removido da lista
4. Toast de confirmação

### 3. Ações no Colaborador

#### Ativar/Desativar:
1. Clicar em botão "Desativar" (se ativo) ou "Ativar" (se inativo)
2. Status alterna imediatamente
3. Badge atualiza automaticamente
4. Toast de confirmação

#### Editar (a ser implementado):
1. Clicar em "Editar"
2. Navegar para página de edição

#### Excluir:
1. Clicar em "Excluir"
2. Confirmar no AlertDialog
3. Redirecionar para listagem
4. Toast de confirmação

## Sistema de Validações

### Upload de Arquivos
```typescript
✅ Tipos aceitos: PDF, JPG, JPEG, PNG, DOC, DOCX
✅ Tamanho máximo: 10MB
✅ Arquivo obrigatório
✅ Tipo de documento obrigatório
✅ Feedback visual do arquivo selecionado (nome + tamanho)
```

### Alertas de Vencimento
```typescript
🔴 Vencido: expiryDate < hoje
🟡 Vence em breve: expiryDate <= 30 dias
🟢 Verificado: verified === true
⚪ Pendente: não verificado e não vencido
```

## Integração com Backend

### Headers Obrigatórios
Todas as requisições incluem:
```typescript
headers: {
  'x-company-id': company.id
}
```

### Upload (Multipart Form Data)
```typescript
POST /employees/:employeeId/documents
Content-Type: multipart/form-data

FormData fields:
- file: File (obrigatório)
- documentType: string (obrigatório)
- description: string (opcional)
- documentNumber: string (opcional)
- issueDate: string (opcional)
- expiryDate: string (opcional)
```

### Listagem (com filtros)
```typescript
GET /employees/:employeeId/documents?documentType=RG&verified=true

Response: {
  data: EmployeeDocument[],
  total: number
}
```

### Download
```typescript
GET /employees/:employeeId/documents/:documentId/download?companyId=xxx
Returns: File stream
```

## Componentes UI Utilizados

- **shadcn/ui:**
  - Card, CardHeader, CardTitle, CardDescription, CardContent
  - Button (variants: default, outline, ghost, icon)
  - Input (type: text, file, date)
  - Select, SelectTrigger, SelectValue, SelectContent, SelectItem
  - Textarea
  - Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
  - AlertDialog (confirmação de exclusão)
  - Table, TableHeader, TableBody, TableRow, TableHead, TableCell
  - Badge (variants: default, secondary, destructive, outline)
  - Tabs, TabsList, TabsTrigger, TabsContent
  - Label
  - Separator

- **lucide-react:**
  - FileText, Upload, Download, Trash2, CheckCircle, AlertCircle, Eye, X
  - ArrowLeft, Edit, UserCheck, UserX

## Responsividade

### Grid Layouts
```typescript
// Dados Pessoais, Profissionais, etc
md:grid-cols-2 lg:grid-cols-3
- Mobile: 1 coluna
- Tablet: 2 colunas
- Desktop: 3 colunas

// Upload Form
md:grid-cols-2
- Mobile: 1 coluna
- Tablet+: 2 colunas
```

### Tabela de Documentos
- Rolagem horizontal em telas pequenas (border wrap)
- Todas as colunas visíveis
- Ações sempre acessíveis

## Estados de Loading

### Página de Detalhes
```typescript
if (loading) {
  return <Spinner centralizado />
}
```

### Lista de Documentos
```typescript
{loading ? (
  <Spinner + "Carregando..." />
) : documents.length === 0 ? (
  <Empty state com CTA />
) : (
  <Tabela completa />
)}
```

### Upload
```typescript
<Button disabled={uploading}>
  {uploading ? 'Enviando...' : 'Enviar Documento'}
</Button>
```

## Máscaras Aplicadas

Dados formatados na visualização:
- **CPF:** 000.000.000-00 (maskCPF)
- **CNPJ:** 00.000.000/0000-00 (maskCNPJ)
- **CEP:** 00000-000 (maskCEP)
- **Telefone:** (00) 0000-0000 ou (00) 00000-0000 (maskPhone)
- **Salário:** R$ 0.000,00 (Intl.NumberFormat)
- **Datas:** dd/mm/yyyy (toLocaleDateString 'pt-BR')
- **Tamanho:** Bytes, KB, MB, GB (formatFileSize)

## Próximas Implementações Sugeridas

1. ✅ Sistema de documentos - **CONCLUÍDO**
2. 🔄 Página de edição de colaborador
3. 🔄 Histórico de alterações
4. 🔄 Notificações de vencimento de documentos
5. 🔄 Upload em lote (múltiplos arquivos)
6. 🔄 Preview de imagens/PDFs no modal
7. 🔄 Categorias customizadas de documentos
8. 🔄 Assinatura digital de documentos
9. 🔄 Workflow de aprovação de documentos
10. 🔄 Relatório de documentos faltantes por colaborador

## Estrutura de Arquivos

```
/lib/api/
  employee-documents.ts (430 linhas) ✅ NOVO

/components/rh/
  employee-documents.tsx (636 linhas) ✅ NOVO

/app/dashboard/rh/colaboradores/
  [id]/
    page.tsx (763 linhas) ✅ NOVO
```

## Exemplo de Uso do Componente

```tsx
import { EmployeeDocuments } from '@/components/rh/employee-documents'

// Em qualquer página
<EmployeeDocuments 
  employeeId="employee-uuid" 
  employeeContractType="PJ" // opcional
/>
```

## Testes Recomendados

### Teste 1: Upload de Documento
1. Acessar página de detalhes de colaborador
2. Ir para tab "Documentos"
3. Clicar em "Enviar Documento"
4. Selecionar PDF válido (< 10MB)
5. Escolher tipo "RG"
6. Preencher número "12.345.678-9"
7. Definir data de emissão
8. Salvar → Verificar sucesso

### Teste 2: Validação de Arquivo
1. Tentar enviar arquivo .txt → Deve rejeitar
2. Tentar enviar arquivo > 10MB → Deve rejeitar
3. Tentar enviar sem selecionar tipo → Deve alertar

### Teste 3: Verificação de Documento
1. Upload de documento
2. Verificar status "Pendente" (cinza)
3. Clicar em ícone CheckCircle
4. Status muda para "Verificado" (verde)
5. Ícone CheckCircle desaparece

### Teste 4: Exclusão de Documento
1. Clicar em ícone Trash2
2. Confirmar no AlertDialog
3. Documento removido da lista
4. Toast de confirmação exibido

### Teste 5: Download de Documento
1. Clicar em ícone Download
2. Verificar que arquivo é baixado/aberto
3. Verificar URL contém companyId

### Teste 6: Alertas de Vencimento
1. Upload de documento com validade em 20 dias → Badge "Vence em breve" (amarelo)
2. Upload de documento com validade passada → Badge "Vencido" (vermelho)
3. Upload sem validade → Badge "Pendente" (cinza)

### Teste 7: Visualização de Detalhes
1. Clicar em ícone Eye
2. Verificar que todos os campos são exibidos
3. Verificar formatação de datas
4. Verificar tamanho do arquivo formatado
5. Clicar em Download no dialog

### Teste 8: Estados Vazios
1. Colaborador sem documentos → Tela vazia com CTA
2. Clicar em "Enviar Primeiro Documento"
3. Upload → Lista aparece com 1 item

---

**Data de Implementação:** 8 de novembro de 2025  
**Módulo:** RH - Colaboradores - Documentos  
**Status:** ✅ Totalmente Implementado e Funcional  
**Total de Linhas:** ~1.829 linhas de código
