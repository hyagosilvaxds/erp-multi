# Módulo Jurídico - API e Documentação Completa

## 📋 Visão Geral

Implementação completa do módulo jurídico com integração à API, incluindo gerenciamento de categorias e documentos jurídicos.

**⚠️ IMPORTANTE: Autenticação**

Todas as requisições para os endpoints do módulo jurídico **requerem**:
1. Token Bearer (enviado automaticamente pelo interceptor do axios)
2. Header `x-company-id` com o ID da empresa selecionada

Os arquivos `legal-categories.ts` e `legal-documents.ts` já incluem o helper `getCompanyId()` que:
- Obtém a empresa selecionada via `authApi.getSelectedCompany()`
- Valida se existe uma empresa selecionada
- Adiciona automaticamente o header `x-company-id` em todas as requisições

---

## 🗂️ Categorias Jurídicas

### API Client: `lib/api/legal-categories.ts`

Funções disponíveis:
- `listLegalCategories()` - Lista todas as categorias
- `getLegalCategoryById(id)` - Busca categoria por ID
- `createLegalCategory(data)` - Cria nova categoria
- `updateLegalCategory(id, data)` - Atualiza categoria
- `deleteLegalCategory(id)` - Exclui categoria

**Todas as funções incluem automaticamente o header `x-company-id`.**

### Telas Implementadas

#### 1. Gestão de Categorias (`/dashboard/juridico/categorias`)

**Funcionalidades:**
- ✅ Listagem de categorias com informações detalhadas
- ✅ Cards com estatísticas:
  - Total de categorias
  - Documentos vinculados
  - Média de documentos por categoria
- ✅ Busca por nome ou descrição
- ✅ Visualização de cores e ícones personalizados
- ✅ Contador de documentos por categoria
- ✅ Status (Ativa/Inativa)
- ✅ Ações: Editar e Excluir

**Componentes:**
- `CategoryDialog` - Formulário para criar/editar categorias
- Validação de exclusão (não permite deletar categorias com documentos)

**Campos de Categoria:**
- Nome (obrigatório)
- Descrição
- Cor (seletor visual com paleta predefinida)
- Ícone (seletor com opções predefinidas)
- Status Ativo/Inativo

---

## 📄 Documentos Jurídicos

### API Client: `lib/api/legal-documents.ts`

**⚠️ Todas as funções incluem automaticamente o header `x-company-id`.**

**Tipos de Documento:**
- `CONTRATO` - Contratos em geral
- `PROCESSO_TRABALHISTA` - Processos trabalhistas
- `PROCESSO_CIVIL` - Processos cíveis
- `PROCESSO_CRIMINAL` - Processos criminais
- `OUTROS` - Outros tipos de documentos

**Status Disponíveis:**
- `ATIVO` - Documento ativo/vigente
- `PENDENTE` - Aguardando análise
- `EM_ANALISE` - Em processo de análise
- `APROVADO` - Aprovado
- `REJEITADO` - Rejeitado
- `CONCLUIDO` - Concluído
- `ARQUIVADO` - Arquivado
- `CANCELADO` - Cancelado

**Funções disponíveis:**
- `createLegalDocument(data)` - Cria documento com upload
- `listLegalDocuments(params)` - Lista com filtros e paginação
- `getLegalDocumentById(id)` - Busca documento por ID
- `updateLegalDocument(id, data)` - Atualiza documento
- `deleteLegalDocument(id)` - Soft delete
- `getLegalDocumentDownload(id)` - Info para download
- `downloadLegalDocument(documentId)` - Download do arquivo
- `getLegalDocumentStatistics()` - Estatísticas

### Telas Implementadas

#### 2. Listagem de Documentos (`/dashboard/juridico/documentos`)

**Funcionalidades:**
- ✅ Cards com estatísticas:
  - Total de documentos
  - Documentos ativos
  - Documentos vencendo (próximos 30 dias)
  - Valor total de contratos ativos
- ✅ Busca por título, referência ou descrição
- ✅ Filtros múltiplos:
  - Por tipo de documento
  - Por status
  - Por categoria
- ✅ Paginação (20 itens por página)
- ✅ Tabela completa com:
  - Título e referência
  - Tipo e categoria (com indicador visual de cor)
  - Status com badges coloridos
  - Vencimento com alertas visuais
  - Valor formatado
- ✅ Alertas automáticos:
  - Documentos vencendo em até 30 dias (amarelo)
  - Documentos vencidos (vermelho)
- ✅ Ações:
  - Visualizar detalhes
  - Baixar arquivo
  - Editar
  - Excluir (soft delete)

#### 3. Detalhes do Documento (`/dashboard/juridico/documentos/[id]`)

**Funcionalidades:**
- ✅ Visualização completa de todas as informações
- ✅ Badges de status e alertas
- ✅ Layout em 2 colunas:
  
  **Coluna Principal:**
  - Informações básicas (referência, descrição)
  - Datas (início, vencimento, término)
  - Valor formatado
  - Tags
  - Observações
  - Partes envolvidas (com detalhes completos)
  
  **Sidebar:**
  - Informações do arquivo (nome, tamanho, tipo)
  - Botão de download
  - Configurações (alerta, moeda, status)
  - Metadados do sistema (criador, datas)

- ✅ Botões de ação:
  - Voltar para listagem
  - Baixar arquivo
  - Editar documento

#### 4. Formulário de Documento (`LegalDocumentDialog`)

**Funcionalidades:**
- ✅ Upload de arquivo (apenas para novos documentos)
  - Validação de tipo (PDF, Word, Imagens)
  - Validação de tamanho (máx. 10MB)
  - Preview do arquivo selecionado
- ✅ Formulário completo com:
  
  **Informações Básicas:**
  - Tipo (obrigatório)
  - Status
  - Título (obrigatório)
  - Categoria
  - Referência/Número
  - Descrição
  
  **Datas:**
  - Data de início
  - Data de vencimento
  - Data de término
  
  **Financeiro:**
  - Valor
  - Moeda (default: BRL)
  
  **Configurações:**
  - Dias para alerta (default: 30)
  - Tags (separadas por vírgula)
  - Observações
  
  **Partes Envolvidas:**
  - Adicionar múltiplas partes
  - Nome/Razão Social
  - Papel/Função
  - CPF/CNPJ
  - Remover partes dinamicamente

- ✅ Scroll interno para formulários grandes
- ✅ Validações e mensagens de erro
- ✅ Integração com hub de documentos

---

## 🔐 Sistema de Permissões

### Arquivo: `lib/legal-permissions.ts`

**Permissões Mapeadas:**
- `legal.read` → `juridico.view`
- `legal.create` → `juridico.create`
- `legal.update` → `juridico.edit`
- `legal.delete` → `juridico.delete`

**Funções Helper:**
- `hasLegalPermission(permission, userRole?)` - Verifica permissão específica
- `canViewCategories(userRole?)` - Verifica se pode visualizar categorias
- `canCreateCategories(userRole?)` - Verifica se pode criar categorias
- `canUpdateCategories(userRole?)` - Verifica se pode editar categorias
- `canDeleteCategories(userRole?)` - Verifica se pode excluir categorias

---

## 🎨 Componentes Criados

### 1. `components/legal/category-dialog.tsx`
Diálogo para criar/editar categorias jurídicas com:
- Seletor de cores visual
- Seletor de ícones
- Switch de ativo/inativo
- Validações

### 2. `components/legal/legal-document-dialog.tsx`
Diálogo completo para upload e cadastro de documentos com:
- Upload de arquivo com preview
- Formulário extenso com scroll
- Gerenciamento de partes envolvidas
- Validações de arquivo e campos

---

## 🔗 Navegação

### Menu Lateral Atualizado

```
📊 Dashboard Jurídico
📄 Documentos (NOVO)
📄 Contratos
⚖️ Processos
📁 Categorias (NOVO)
```

---

## 📊 Estrutura de Dados

### Categoria Jurídica
```typescript
interface LegalCategory {
  id: string
  companyId: string
  name: string
  description?: string
  color?: string
  icon?: string
  active: boolean
  _count?: {
    legalDocuments: number
  }
  createdAt: string
  updatedAt: string
}
```

### Documento Jurídico
```typescript
interface LegalDocument {
  id: string
  companyId: string
  categoryId: string | null
  documentId: string
  type: LegalDocumentType
  title: string
  description?: string
  reference?: string
  parties?: LegalDocumentParty[]
  startDate?: string
  endDate?: string
  dueDate?: string
  status: LegalDocumentStatus
  value?: string
  currency: string
  notes?: string
  tags?: string[]
  alertDays: number
  active: boolean
  createdAt: string
  updatedAt: string
  document?: DocumentInfo
  category?: CategoryInfo
  createdBy?: UserInfo
}
```

---

## 🚀 Próximos Passos Sugeridos

### Funcionalidades Adicionais:

1. **Dashboard Integrado:**
   - [ ] Integrar estatísticas reais da API
   - [ ] Gráficos de distribuição de documentos
   - [ ] Alertas de documentos próximos ao vencimento

2. **Documentos:**
   - [ ] Versionamento de arquivos
   - [ ] Histórico de alterações
   - [ ] Comentários e anotações
   - [ ] Compartilhamento interno

3. **Notificações:**
   - [ ] Sistema de alertas automáticos
   - [ ] E-mail de vencimento próximo
   - [ ] Notificações in-app

4. **Relatórios:**
   - [ ] Relatório de documentos por período
   - [ ] Relatório de vencimentos
   - [ ] Exportação para PDF/Excel
   - [ ] Dashboard executivo

5. **Integração:**
   - [ ] Vincular documentos aos contratos existentes
   - [ ] Vincular documentos aos processos
   - [ ] Timeline unificada

---

## 🛠️ Tecnologias Utilizadas

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Shadcn/ui** - Componentes UI
- **Axios** - Cliente HTTP
- **date-fns** - Manipulação de datas
- **Lucide React** - Ícones

---

## 📝 Observações Técnicas

### Upload de Arquivos
- Utiliza `multipart/form-data`
- Validação de tipo e tamanho no frontend
- Integrado ao hub de documentos existente

### Paginação
- Implementada no frontend
- Preparada para paginação server-side
- 20 itens por página (configurável)

### Filtros
- Múltiplos filtros simultâneos
- Busca em tempo real
- Preservação de estado entre navegações

### Soft Delete
- Documentos são marcados como inativos
- Arquivos permanecem no hub
- Possibilidade de recuperação futura

### Permissões
- Sistema totalmente integrado
- Verificação em múltiplos níveis
- Compatível com roles existentes

---

## 📧 Integração com API

### Base URL
```
http://localhost:4000 (desenvolvimento)
```

### Headers Necessários
```
Authorization: Bearer {token}
x-company-id: {companyId}
```

### Endpoints Utilizados

**Categorias:**
- `GET /legal/categories` - Listar
- `GET /legal/categories/:id` - Buscar
- `POST /legal/categories` - Criar
- `PATCH /legal/categories/:id` - Atualizar
- `DELETE /legal/categories/:id` - Excluir

**Documentos:**
- `GET /legal/documents` - Listar com filtros
- `GET /legal/documents/statistics` - Estatísticas
- `GET /legal/documents/:id` - Buscar
- `GET /legal/documents/:id/download` - Info de download
- `POST /legal/documents` - Criar com upload
- `PATCH /legal/documents/:id` - Atualizar
- `DELETE /legal/documents/:id` - Soft delete

**Hub de Documentos:**
- `GET /documents/:documentId/download` - Download do arquivo

---

## ✅ Checklist de Implementação

- [x] API client para categorias
- [x] Tela de gestão de categorias
- [x] Formulário de categoria
- [x] API client para documentos
- [x] Tela de listagem de documentos
- [x] Formulário de upload/cadastro
- [x] Tela de detalhes do documento
- [x] Sistema de permissões mapeado
- [x] Integração no menu lateral
- [x] Componentes UI completos
- [x] Validações e tratamento de erros
- [x] Responsividade
- [x] Dashboard integrado com API
- [x] Documentação

---

## 🎯 Dashboard Jurídico

### Implementação Completa

O dashboard foi totalmente integrado com a API e apresenta:

#### **Cards de Estatísticas:**
- ✅ Total de Documentos (da API)
- ✅ Documentos Ativos (filtrado por status)
- ✅ Vencendo em Breve (calculado pela API)
- ✅ Documentos Concluídos (filtrado por status)

#### **Seção de Alertas:**
- ✅ Card destacado para documentos vencendo nos próximos 30 dias
- ✅ Contagem de dias restantes
- ✅ Link direto para cada documento
- ✅ Badge de tipo de documento
- ✅ Design com cores de alerta (amarelo)

#### **Documentos Recentes:**
- ✅ Lista dos últimos 10 documentos cadastrados
- ✅ Indicador visual de categoria (com cor)
- ✅ Badges de tipo e status
- ✅ Alerta visual para documentos próximos ao vencimento
- ✅ Exibição de valor quando disponível
- ✅ Link para detalhes do documento
- ✅ Estado vazio com call-to-action

#### **Gráficos de Distribuição:**
- ✅ **Documentos por Tipo:**
  - Contrato
  - Processo Trabalhista
  - Processo Civil
  - Processo Criminal
  - Outros
  - Barras de progresso com percentuais
  
- ✅ **Documentos por Status:**
  - Ativo, Pendente, Em Análise, etc.
  - Badges coloridos por status
  - Barras de progresso com percentuais

#### **Seção de Categorias:**
- ✅ Lista de categorias ativas
- ✅ Contador de documentos por categoria
- ✅ Indicador de cor visual
- ✅ Link para filtrar documentos por categoria
- ✅ Limite de 10 categorias exibidas

#### **Estados de Loading:**
- ✅ Skeletons para todos os componentes
- ✅ Tratamento de erros com toast
- ✅ Estado vazio com mensagens amigáveis

#### **Navegação Rápida:**
- ✅ Botão "Ver Documentos"
- ✅ Botão "Categorias"
- ✅ Links contextuais em cada seção

### Diferenças da Versão Anterior

**Removido:**
- ❌ Dados estáticos (contratos e processos mockados)
- ❌ Gráficos de "Contratos por Tipo"
- ❌ Gráficos de "Processos por Tipo"
- ❌ Seção de "Contratos Recentes" (substituída por Documentos Recentes)
- ❌ Seção de "Processos em Andamento"

**Adicionado:**
- ✅ Integração completa com API
- ✅ Estatísticas reais do endpoint `/legal/documents/statistics`
- ✅ Lista de documentos recentes da API
- ✅ Alertas de vencimento dinâmicos
- ✅ Distribuição por tipo e status (dados reais)
- ✅ Seção de categorias com links
- ✅ Loading states e tratamento de erros
- ✅ Estado vazio com call-to-action

---

## 🎯 Status

✅ **IMPLEMENTAÇÃO COMPLETA E FUNCIONAL**

Todas as telas, APIs e componentes estão prontos para uso. O dashboard está totalmente integrado com a API e exibe dados reais assim que o backend estiver disponível.
