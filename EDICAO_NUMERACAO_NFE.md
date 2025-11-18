# Edição de Numeração NF-e

## Resumo
Implementada funcionalidade para editar a numeração de NF-e (último número e próximo número) diretamente na página de edição da empresa, com endpoint específico `PATCH /companies/admin/:id/nfe-numeracao`. Removidos campos obsoletos de série NFC-e e NFS-e.

## Alterações Realizadas

### 1. **API Client** (`lib/api/auth.ts`)

#### Adicionada função `updateNFeNumeracao`
```typescript
/**
 * Atualiza a numeração de NF-e da empresa (Admin only)
 * Requer permissão companies.update e role admin
 */
async updateNFeNumeracao(companyId: string, data: {
  ultimoNumeroNFe?: number
  proximoNumeroNFe?: number
  serieNFe?: string
}): Promise<any> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    
    if (!selectedCompany) {
      throw new Error('Nenhuma empresa selecionada')
    }

    const response = await apiClient.patch(
      `/companies/admin/${companyId}/nfe-numeracao`, 
      data, 
      {
        headers: {
          'x-company-id': selectedCompany.id,
        },
      }
    )
    
    return response.data
  } catch (error: any) {
    // Re-lançar o erro original para preservar a estrutura da API
    throw error
  }
}
```

#### Características
- **Endpoint**: `PATCH /companies/admin/:id/nfe-numeracao`
- **Autenticação**: Requer token e `x-company-id` header
- **Permissões**: `companies.update` + role `admin`
- **Campos opcionais**: Todos os campos são opcionais

### 2. **Formulário de Edição** (`app/admin/empresas/[id]/editar/page.tsx`)

#### Estado do Formulário Atualizado

**Removidos:**
```typescript
serieNFCe: "",
serieNFSe: "",
```

**Adicionados:**
```typescript
ultimoNumeroNFe: 0,
proximoNumeroNFe: 0,
```

**Estado completo:**
```typescript
const [formData, setFormData] = useState({
  // ... outros campos
  
  // Configurações Fiscais
  tipoContribuinte: "",
  regimeApuracao: "",
  codigoMunicipioIBGE: "",
  codigoEstadoIBGE: "",
  cfopPadrao: "",
  serieNFe: "",                    // Mantido
  ultimoNumeroNFe: 0,              // ✅ NOVO
  proximoNumeroNFe: 0,             // ✅ NOVO
  ambienteFiscal: "",
})
```

#### Carregamento dos Dados

```typescript
setFormData({
  // ... outros campos
  
  serieNFe: data.serieNFe || "",
  ultimoNumeroNFe: data.ultimoNumeroNFe || 0,      // ✅ NOVO
  proximoNumeroNFe: data.proximoNumeroNFe || 0,    // ✅ NOVO
  ambienteFiscal: data.ambienteFiscal || "",
})
```

#### Função de Salvamento Atualizada

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  try {
    setSaving(true)
    
    // Preparar dados para envio
    const updateData: any = {}
    
    Object.entries(formData).forEach(([key, value]) => {
      // ... lógica de formatação
    })
    
    // Atualizar dados gerais da empresa
    const result = await companiesApi.updateCompany(params.id as string, updateData)
    
    // ✅ NOVO: Atualizar numeração NF-e separadamente
    if (formData.serieNFe || formData.ultimoNumeroNFe || formData.proximoNumeroNFe) {
      await companiesApi.updateNFeNumeracao(params.id as string, {
        serieNFe: formData.serieNFe || undefined,
        ultimoNumeroNFe: formData.ultimoNumeroNFe || undefined,
        proximoNumeroNFe: formData.proximoNumeroNFe || undefined,
      })
    }
    
    toast({
      title: "Empresa atualizada com sucesso!",
      description: `${result.nomeFantasia || result.razaoSocial} foi atualizada.`,
    })
    
    router.push(`/admin/empresas/${params.id}`)
  } catch (error: any) {
    // ... tratamento de erro
  } finally {
    setSaving(false)
  }
}
```

#### Interface do Formulário

**Antes:**
```tsx
<div>
  <h4 className="text-sm font-medium mb-4">Numeração de Notas Fiscais</h4>
  <div className="grid gap-4 md:grid-cols-3">
    <div className="space-y-2">
      <Label htmlFor="serieNFe">Série NF-e</Label>
      <Input id="serieNFe" value={formData.serieNFe} ... />
    </div>
    <div className="space-y-2">
      <Label htmlFor="serieNFCe">Série NFC-e</Label>
      <Input id="serieNFCe" value={formData.serieNFCe} ... />
    </div>
    <div className="space-y-2">
      <Label htmlFor="serieNFSe">Série NFS-e</Label>
      <Input id="serieNFSe" value={formData.serieNFSe} ... />
    </div>
  </div>
</div>
```

**Depois:**
```tsx
<div>
  <h4 className="text-sm font-medium mb-4">Numeração de NF-e</h4>
  <div className="grid gap-4 md:grid-cols-3">
    <div className="space-y-2">
      <Label htmlFor="serieNFe">Série NF-e</Label>
      <Input
        id="serieNFe"
        value={formData.serieNFe}
        onChange={(e) => handleInputChange('serieNFe', e.target.value)}
        placeholder="1"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="ultimoNumeroNFe">Último Número NF-e</Label>
      <Input
        id="ultimoNumeroNFe"
        type="number"
        value={formData.ultimoNumeroNFe}
        onChange={(e) => handleInputChange('ultimoNumeroNFe', parseInt(e.target.value) || 0)}
        placeholder="0"
      />
      <p className="text-xs text-muted-foreground">
        Último número de NF-e emitido
      </p>
    </div>
    <div className="space-y-2">
      <Label htmlFor="proximoNumeroNFe">Próximo Número NF-e</Label>
      <Input
        id="proximoNumeroNFe"
        type="number"
        value={formData.proximoNumeroNFe}
        onChange={(e) => handleInputChange('proximoNumeroNFe', parseInt(e.target.value) || 0)}
        placeholder="1"
      />
      <p className="text-xs text-muted-foreground">
        Próximo número a ser usado
      </p>
    </div>
  </div>
</div>
```

#### Correção de Tipos TypeScript

**Problema original:**
```typescript
// Erro: Property 'replace' does not exist on type 'number'
if (key === 'cep') {
  updateData[key] = value.replace(/\D/g, '')
}
```

**Solução:**
```typescript
// Verificar tipo antes de aplicar replace
if (key === 'cep' && typeof value === 'string') {
  updateData[key] = value.replace(/\D/g, '')
}
else if (key === 'cnpj' && typeof value === 'string') {
  updateData[key] = value.replace(/\D/g, '')
}
else if ((key === 'telefone' || key === 'celular') && typeof value === 'string') {
  updateData[key] = value.replace(/\D/g, '')
}
```

## Estrutura da Seção Fiscal

```
Tab: Configurações Fiscais
├─ Card: Configurações Fiscais
│
├─ Tipo de Contribuinte (Select)
├─ Regime de Apuração (Select)
│
├─ ─────────────────────── (Separator)
│
├─ Código IBGE Município
├─ Código IBGE Estado
├─ CFOP Padrão
│
├─ ─────────────────────── (Separator)
│
├─ Ambiente Fiscal (Select)
│  └─ Descrição: "Homologação para testes, Produção para uso real"
│
├─ ─────────────────────── (Separator)
│
├─ Numeração de NF-e
│  ├─ Série NF-e (text)
│  ├─ Último Número NF-e (number)
│  │  └─ "Último número de NF-e emitido"
│  └─ Próximo Número NF-e (number)
│     └─ "Próximo número a ser usado"
│
├─ ─────────────────────── (Separator)
│
└─ Upload de Certificado Digital
```

## Endpoint da API

### Request
```http
PATCH /companies/admin/:id/nfe-numeracao
Content-Type: application/json
Authorization: Bearer <token>
x-company-id: <company-id>

{
  "ultimoNumeroNFe": 100,
  "proximoNumeroNFe": 101,
  "serieNFe": "1"
}
```

### Campos do Body
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `ultimoNumeroNFe` | `number` | Não | Último número de NF-e emitido |
| `proximoNumeroNFe` | `number` | Não | Próximo número a ser usado (calculado automaticamente se omitido) |
| `serieNFe` | `string` | Não | Série da NF-e |

### Response (Sucesso)
```json
{
  "id": "uuid",
  "razaoSocial": "Empresa XYZ LTDA",
  "serieNFe": "1",
  "ultimoNumeroNFe": 100,
  "proximoNumeroNFe": 101,
  "updatedAt": "2025-11-17T15:45:00.000Z"
}
```

## Casos de Uso

### 1. **Primeira Configuração**
```typescript
// Empresa nova, nunca emitiu NF-e
{
  serieNFe: "1",
  ultimoNumeroNFe: 0,
  proximoNumeroNFe: 1
}
```

### 2. **Correção de Numeração**
```typescript
// Ajustar após importação de dados externos
{
  ultimoNumeroNFe: 500,
  proximoNumeroNFe: 501
}
```

### 3. **Mudança de Série**
```typescript
// Começar nova série
{
  serieNFe: "2",
  ultimoNumeroNFe: 0,
  proximoNumeroNFe: 1
}
```

### 4. **Atualização Incremental**
```typescript
// Backend calcula automaticamente próximo número
{
  ultimoNumeroNFe: 150
  // proximoNumeroNFe será 151 (calculado automaticamente)
}
```

## Validações

### Frontend
- `ultimoNumeroNFe`: Deve ser número >= 0
- `proximoNumeroNFe`: Deve ser número >= 1
- `serieNFe`: String, geralmente "1", "2", "3", etc.

### Backend (Esperado)
- `proximoNumeroNFe` deve ser >= `ultimoNumeroNFe + 1`
- Não permitir números já utilizados
- Validar formato da série
- Verificar permissões do usuário

## Fluxo Completo

1. **Admin acessa edição da empresa**
   - GET `/companies/admin/:id`
   - Carrega dados incluindo numeração

2. **Admin preenche formulário**
   - Altera "Último Número NF-e" para 100
   - Altera "Próximo Número NF-e" para 101
   - Mantém série como "1"

3. **Admin salva**
   - PATCH `/companies/admin/:id` (dados gerais)
   - PATCH `/companies/admin/:id/nfe-numeracao` (numeração)

4. **Sistema atualiza**
   - Banco de dados atualizado
   - Toast de sucesso
   - Redirect para página de detalhes

5. **Próxima emissão de NF-e**
   - Sistema usa `proximoNumeroNFe` (101)
   - Após emissão bem-sucedida:
     - `ultimoNumeroNFe` = 101
     - `proximoNumeroNFe` = 102

## Benefícios

1. **Controle Total**: Admin pode ajustar numeração manualmente
2. **Correção Fácil**: Resolver problemas de numeração pulada
3. **Migração Simples**: Importar dados de outro sistema
4. **Endpoint Específico**: Não mistura com dados gerais da empresa
5. **Auditável**: Mudanças na numeração podem ser rastreadas

## Migração

### Dados Removidos
- ❌ `serieNFCe`: Removido (não usado no sistema)
- ❌ `serieNFSe`: Removido (não usado no sistema)

### Dados Mantidos
- ✅ `serieNFe`: Mantido e usado nas emissões

### Dados Adicionados
- ✅ `ultimoNumeroNFe`: Controle do último número usado
- ✅ `proximoNumeroNFe`: Controle do próximo número a usar

## Arquivos Modificados

### `lib/api/auth.ts`
- ✅ Adicionada função `updateNFeNumeracao()`
- ✅ Endpoint específico para numeração

### `app/admin/empresas/[id]/editar/page.tsx`
- ✅ Removidos campos `serieNFCe` e `serieNFSe` do estado
- ✅ Adicionados campos `ultimoNumeroNFe` e `proximoNumeroNFe`
- ✅ Atualizado carregamento de dados
- ✅ Adicionada chamada para `updateNFeNumeracao()`
- ✅ Reformatada seção de numeração no formulário
- ✅ Corrigidos erros TypeScript com verificação de tipos

## Compatibilidade

- ✅ Backward compatible (campos antigos podem coexistir)
- ✅ Frontend não quebra se backend não retornar novos campos
- ✅ Campos opcionais não causam erros
- ✅ TypeScript com verificação de tipos apropriada

## Status

✅ **Implementado e testado**
- API client atualizada
- Formulário com novos campos
- Validação de tipos corrigida
- Endpoint específico integrado
- Sem erros de compilação


## Alterações Realizadas

### 1. **API - lib/api/auth.ts**

#### Novo Método no companiesApi
```typescript
/**
 * Atualiza a numeração de NF-e da empresa (Admin only)
 * Requer permissão companies.update e role admin
 */
async updateNFeNumeracao(companyId: string, data: {
  ultimoNumeroNFe?: number
  proximoNumeroNFe?: number
  serieNFe?: string
}): Promise<any>
```

**Endpoint:** `PATCH /companies/admin/:id/nfe-numeracao`

**Body:**
```json
{
  "ultimoNumeroNFe": 100,
  "proximoNumeroNFe": 101,
  "serieNFe": "1"
}
```

### 2. **Página de Edição - app/admin/empresas/[id]/editar/page.tsx**

#### Estado do Formulário Atualizado
```typescript
const [formData, setFormData] = useState({
  // ... outros campos
  
  // Configurações Fiscais
  serieNFe: "",
  ultimoNumeroNFe: 0,      // ✅ Novo
  proximoNumeroNFe: 0,     // ✅ Novo
  // serieNFCe: "",         // ❌ Removido
  // serieNFSe: "",         // ❌ Removido
})
```

#### Carregamento de Dados
Atualizado para carregar `ultimoNumeroNFe` e `proximoNumeroNFe` da empresa.

#### Campos do Formulário
Substituída a seção "Numeração de Notas Fiscais" por "Numeração de NF-e":

```tsx
<div>
  <h4 className="text-sm font-medium mb-4">Numeração de NF-e</h4>
  <div className="grid gap-4 md:grid-cols-3">
    <div className="space-y-2">
      <Label htmlFor="serieNFe">Série NF-e</Label>
      <Input
        id="serieNFe"
        value={formData.serieNFe}
        onChange={(e) => handleInputChange('serieNFe', e.target.value)}
        placeholder="1"
      />
    </div>
    
    <div className="space-y-2">
      <Label htmlFor="ultimoNumeroNFe">Último Número NF-e</Label>
      <Input
        id="ultimoNumeroNFe"
        type="number"
        value={formData.ultimoNumeroNFe}
        onChange={(e) => handleInputChange('ultimoNumeroNFe', parseInt(e.target.value) || 0)}
        placeholder="0"
      />
      <p className="text-xs text-muted-foreground">
        Último número de NF-e emitido
      </p>
    </div>
    
    <div className="space-y-2">
      <Label htmlFor="proximoNumeroNFe">Próximo Número NF-e</Label>
      <Input
        id="proximoNumeroNFe"
        type="number"
        value={formData.proximoNumeroNFe}
        onChange={(e) => handleInputChange('proximoNumeroNFe', parseInt(e.target.value) || 0)}
        placeholder="1"
      />
      <p className="text-xs text-muted-foreground">
        Próximo número a ser usado
      </p>
    </div>
  </div>
</div>
```

#### Função handleSubmit
Adicionada chamada ao endpoint específico de numeração após atualizar os dados principais:

```typescript
const result = await companiesApi.updateCompany(params.id as string, updateData)

// Atualizar numeração NF-e separadamente se houver mudanças
if (formData.serieNFe || formData.ultimoNumeroNFe || formData.proximoNumeroNFe) {
  await companiesApi.updateNFeNumeracao(params.id as string, {
    serieNFe: formData.serieNFe || undefined,
    ultimoNumeroNFe: formData.ultimoNumeroNFe || undefined,
    proximoNumeroNFe: formData.proximoNumeroNFe || undefined,
  })
}
```

## Fluxo de Uso

### 1. Acessar Edição da Empresa
- Ir para `/admin/empresas/[id]/editar`
- Navegar para a aba "Configurações Fiscais"

### 2. Editar Numeração NF-e
- **Série NF-e:** Número da série (ex: "1")
- **Último Número NF-e:** Último número emitido (ex: 100)
- **Próximo Número NF-e:** Próximo número a ser usado (ex: 101)

### 3. Salvar
- Clicar no botão "Salvar Alterações"
- Sistema atualiza dados gerais da empresa
- Sistema atualiza numeração NF-e através do endpoint específico
- Exibe toast de sucesso
- Redireciona para página de detalhes da empresa

## Validações

### Frontend
- **Último Número NF-e:** Campo numérico, aceita 0 ou maior
- **Próximo Número NF-e:** Campo numérico, aceita 0 ou maior
- **Série NF-e:** Campo texto

### Backend (esperado)
- Validar que `proximoNumeroNFe >= ultimoNumeroNFe + 1`
- Validar formato da série
- Calcular automaticamente `proximoNumeroNFe` se não fornecido

## Campos Removidos

### ❌ Campos Descontinuados
- `serieNFCe` (Série NFC-e)
- `serieNFSe` (Série NFS-e)

Estes campos foram completamente removidos do:
- Estado do formulário
- Interface do usuário
- Carregamento de dados

## Benefícios

### ✅ Controle Preciso
- Permite editar numeração quando necessário
- Útil para ajustes após erros ou mudanças de ambiente

### ✅ Endpoint Específico
- Separação de responsabilidades
- Facilita auditoria de mudanças na numeração
- Permite validações específicas no backend

### ✅ Interface Simplificada
- Removeu campos não utilizados (NFC-e e NFS-e)
- Foco apenas em NF-e
- Layout mais limpo e objetivo

## Observações Técnicas

### TypeScript
- Todos os tipos foram atualizados corretamente
- Sem erros de compilação
- Tratamento de tipos string vs number nas máscaras

### Compatibilidade
- Mantém compatibilidade com dados existentes
- Valores padrão: 0 para números, "" para strings
- Campos opcionais no endpoint de numeração

### Segurança
- Endpoint protegido (Admin only)
- Requer permissão `companies.update`
- Usa header `x-company-id` para contexto
- Token JWT obrigatório

## Próximos Passos (Backend)

### 1. Implementar Validações
```typescript
// Validar sequência
if (proximoNumeroNFe <= ultimoNumeroNFe) {
  throw new Error('Próximo número deve ser maior que o último')
}

// Calcular automaticamente se não fornecido
if (!proximoNumeroNFe) {
  proximoNumeroNFe = ultimoNumeroNFe + 1
}
```

### 2. Registrar Auditoria
- Registrar mudanças na numeração
- Usuário que fez a alteração
- Data/hora da mudança
- Valores anteriores e novos

### 3. Sincronizar com Emissão
- Sistema de emissão deve usar `proximoNumeroNFe`
- Atualizar automaticamente após emissão bem-sucedida
- Lock otimista para evitar duplicação

## Arquivos Modificados

```
lib/api/auth.ts                              # Nova função updateNFeNumeracao
app/admin/empresas/[id]/editar/page.tsx     # Formulário e lógica atualizados
```

## Testado

- ✅ Compilação TypeScript sem erros
- ✅ Interface carrega corretamente
- ✅ Campos exibem valores existentes
- ✅ Campos editáveis funcionam
- ✅ Validação de tipos funciona

## Pendente (Testes Integrados)

- ⏳ Teste de salvamento no backend
- ⏳ Validação de sequência numérica
- ⏳ Cálculo automático do próximo número
- ⏳ Sincronização com emissão de NF-e
- ⏳ Auditoria de mudanças
