# Sistema de Centro de Custos

## 📋 Visão Geral

Sistema completo para gerenciamento de Centros de Custo, permitindo criar estruturas hierárquicas de até 5 níveis para controle e análise de custos por departamento, projeto ou atividade.

### 🏢 Relação com Empresas

Os centros de custo são **obrigatoriamente vinculados a uma empresa** através do `companyId`, garantindo:
- ✅ Isolamento total entre empresas
- ✅ Códigos únicos dentro de cada empresa
- ✅ Hierarquias independentes por empresa
- ✅ Controle de acesso por empresa

## 🔐 Autenticação e Permissões

**Headers Obrigatórios:**
```
Authorization: Bearer {token}
x-company-id: {companyId}
```

**Permissões Necessárias:**
- `accounting.create` - Criar centros de custo
- `accounting.read` - Visualizar centros de custo
- `accounting.update` - Atualizar centros de custo
- `accounting.delete` - Deletar centros de custo

**Nota:** Usuários com role `admin` têm todas as permissões automaticamente.

---

## 📊 Estrutura do Centro de Custos

### Hierarquia
Os centros de custo podem ter até 5 níveis de hierarquia:

```
1. Departamento (Nível 1)
   └── 1.1 Sub-departamento (Nível 2)
       └── 1.1.01 Setor (Nível 3)
           └── 1.1.01.001 Projeto (Nível 4)
               └── 1.1.01.001.001 Atividade (Nível 5)
```

### Exemplo Prático
```
01 - Administrativo
├── 01.01 - Recursos Humanos
│   ├── 01.01.001 - Recrutamento
│   └── 01.01.002 - Treinamento
├── 01.02 - Financeiro
│   ├── 01.02.001 - Contas a Pagar
│   └── 01.02.002 - Contas a Receber
└── 01.03 - TI
    ├── 01.03.001 - Infraestrutura
    └── 01.03.002 - Desenvolvimento

02 - Comercial
├── 02.01 - Vendas
├── 02.02 - Marketing
└── 02.03 - Pós-venda

03 - Produção
├── 03.01 - Linha 1
├── 03.02 - Linha 2
└── 03.03 - Controle de Qualidade
```

---

## 📡 Endpoints

### 1. Criar Centro de Custos

```
POST /centro-custo
```

**Permissão:** `accounting.create`

**Body:**
```json
{
  "companyId": "uuid",
  "codigo": "01",
  "nome": "Administrativo",
  "descricao": "Departamento administrativo",
  "centroCustoPaiId": null,
  "nivel": 1,
  "responsavel": "João Silva",
  "email": "joao.silva@empresa.com",
  "ativo": true
}
```

**Campos:**
- `companyId` (string, **OBRIGATÓRIO**) - ID da empresa proprietária
- `codigo` (string, obrigatório) - Código único do centro de custo (ex: 01, 01.01, 01.01.001)
- `nome` (string, obrigatório) - Nome do centro de custo
- `descricao` (string, opcional) - Descrição detalhada
- `centroCustoPaiId` (string, opcional) - ID do centro de custo pai (null para nível 1)
- `nivel` (number, obrigatório) - Nível na hierarquia (1 a 5)
- `responsavel` (string, opcional) - Nome do responsável
- `email` (string, opcional) - Email do responsável
- `ativo` (boolean, opcional) - Se está ativo (padrão: true)

**Validações:**
- ✅ O código deve ser único **dentro da empresa**
- ✅ Se tem pai, o nível deve ser (nível do pai + 1)
- ✅ Se não tem pai, o nível deve ser 1
- ✅ O centro de custo pai deve pertencer **à mesma empresa**
- ✅ A empresa deve existir
- ✅ Máximo 5 níveis de profundidade

**⚠️ IMPORTANTE:** O `companyId` é obrigatório e garante o isolamento. Centros de custo de empresas diferentes não se misturam.

**Resposta:**
```json
{
  "id": "uuid",
  "companyId": "uuid",
  "codigo": "01",
  "nome": "Administrativo",
  "descricao": "Departamento administrativo",
  "centroCustoPaiId": null,
  "centroCustoPai": null,
  "nivel": 1,
  "responsavel": "João Silva",
  "email": "joao.silva@empresa.com",
  "ativo": true,
  "createdAt": "2025-10-25T19:00:00.000Z",
  "updatedAt": "2025-10-25T19:00:00.000Z",
  "subCentros": []
}
```

---

### 2. Listar Centros de Custos

```
GET /centro-custo
```

**Permissão:** `accounting.read`

**Query Parameters:**
- `companyId` (string, **RECOMENDADO**) - Filtrar por empresa específica
- `page` (number, opcional) - Número da página (padrão: 1)
- `limit` (number, opcional) - Itens por página (padrão: 50)
- `ativo` (boolean, opcional) - Filtrar por status ativo
- `search` (string, opcional) - Buscar por código, nome ou descrição

**⚠️ IMPORTANTE:** Sempre filtre por `companyId` para garantir isolamento e performance.

**Exemplos:**
```bash
# ✅ RECOMENDADO: Centros de custo de uma empresa específica
GET /centro-custo?companyId=uuid-da-empresa

# Apenas ativos de uma empresa
GET /centro-custo?companyId=uuid&ativo=true

# Buscar por termo em uma empresa
GET /centro-custo?companyId=uuid&search=Administrativo

# Paginação customizada
GET /centro-custo?companyId=uuid&page=2&limit=20

# ⚠️ Sem companyId: retorna de todas as empresas (use apenas para admin)
GET /centro-custo
```

**Resposta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "companyId": "uuid",
      "codigo": "01",
      "nome": "Administrativo",
      "descricao": "Departamento administrativo",
      "nivel": 1,
      "responsavel": "João Silva",
      "email": "joao.silva@empresa.com",
      "ativo": true,
      "createdAt": "2025-10-25T19:00:00.000Z",
      "updatedAt": "2025-10-25T19:00:00.000Z",
      "company": {
        "id": "uuid",
        "razaoSocial": "Empresa LTDA",
        "nomeFantasia": "Empresa"
      },
      "centroCustoPai": null,
      "_count": {
        "subCentros": 3
      }
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 50,
    "totalPages": 1
  }
}
```

---

### 3. Buscar Centro de Custo por ID

```
GET /centro-custo/:id
```

**Permissão:** `accounting.read`

**Resposta:**
```json
{
  "id": "uuid",
  "companyId": "uuid",
  "codigo": "01.01",
  "nome": "Recursos Humanos",
  "descricao": "Departamento de RH",
  "centroCustoPaiId": "uuid-pai",
  "nivel": 2,
  "responsavel": "Maria Santos",
  "email": "maria.santos@empresa.com",
  "ativo": true,
  "createdAt": "2025-10-25T19:00:00.000Z",
  "updatedAt": "2025-10-25T19:00:00.000Z",
  "company": {
    "id": "uuid",
    "razaoSocial": "Empresa LTDA",
    "nomeFantasia": "Empresa"
  },
  "centroCustoPai": {
    "id": "uuid-pai",
    "codigo": "01",
    "nome": "Administrativo"
  },
  "subCentros": [
    {
      "id": "uuid-sub1",
      "codigo": "01.01.001",
      "nome": "Recrutamento",
      "nivel": 3,
      "ativo": true
    },
    {
      "id": "uuid-sub2",
      "codigo": "01.01.002",
      "nome": "Treinamento",
      "nivel": 3,
      "ativo": true
    }
  ]
}
```

---

### 4. Buscar Centros de Custo por Empresa

```
GET /centro-custo/company/:companyId
```

**Permissão:** `accounting.read`

**✅ ENDPOINT RECOMENDADO:** Retorna todos os centros de custo de uma empresa específica (lista simples, não hierárquica).

**Isolamento Garantido:** Este endpoint garante que você verá **apenas** os centros de custo da empresa especificada.

**Resposta:**
```json
[
  {
    "id": "uuid",
    "codigo": "01",
    "nome": "Administrativo",
    "descricao": "Departamento administrativo",
    "nivel": 1,
    "responsavel": "João Silva",
    "email": "joao.silva@empresa.com",
    "ativo": true,
    "centroCustoPai": null,
    "_count": {
      "subCentros": 3
    }
  },
  {
    "id": "uuid",
    "codigo": "01.01",
    "nome": "Recursos Humanos",
    "nivel": 2,
    "ativo": true,
    "centroCustoPai": {
      "id": "uuid-pai",
      "codigo": "01",
      "nome": "Administrativo"
    },
    "_count": {
      "subCentros": 2
    }
  }
]
```

---

### 5. Buscar Hierarquia de Centros de Custo

```
GET /centro-custo/company/:companyId/hierarquia
```

**Permissão:** `accounting.read`

**✅ ENDPOINT RECOMENDADO:** Retorna a estrutura hierárquica completa dos centros de custo até 5 níveis de profundidade.

**🔒 Isolamento Garantido:** Retorna **apenas** centros de custo da empresa especificada no `:companyId`.

**Query Parameters:**
- `ativo` (boolean, opcional) - Filtrar por status ativo
  - Se não informado: retorna todos (ativos e inativos)
  - Se `true`: retorna apenas ativos
  - Se `false`: retorna apenas inativos

**Exemplos:**
```bash
# ✅ Todos os centros de custo da empresa (padrão)
GET /centro-custo/company/uuid-da-empresa/hierarquia

# ✅ Apenas ativos da empresa
GET /centro-custo/company/uuid-da-empresa/hierarquia?ativo=true

# ✅ Apenas inativos da empresa
GET /centro-custo/company/uuid-da-empresa/hierarquia?ativo=false
```

Retorna a estrutura hierárquica completa até 5 níveis de profundidade.

**Resposta:**
```json
{
  "company": {
    "id": "uuid",
    "razaoSocial": "Empresa LTDA",
    "nomeFantasia": "Empresa"
  },
  "centrosCusto": [
    {
      "id": "uuid",
      "codigo": "01",
      "nome": "Administrativo",
      "descricao": "Departamento administrativo",
      "nivel": 1,
      "responsavel": "João Silva",
      "email": "joao.silva@empresa.com",
      "ativo": true,
      "subCentros": [
        {
          "id": "uuid",
          "codigo": "01.01",
          "nome": "Recursos Humanos",
          "nivel": 2,
          "ativo": true,
          "subCentros": [
            {
              "id": "uuid",
              "codigo": "01.01.001",
              "nome": "Recrutamento",
              "nivel": 3,
              "ativo": true,
              "subCentros": []
            },
            {
              "id": "uuid",
              "codigo": "01.01.002",
              "nome": "Treinamento",
              "nivel": 3,
              "ativo": true,
              "subCentros": []
            }
          ]
        },
        {
          "id": "uuid",
          "codigo": "01.02",
          "nome": "Financeiro",
          "nivel": 2,
          "ativo": true,
          "subCentros": []
        }
      ]
    },
    {
      "id": "uuid",
      "codigo": "02",
      "nome": "Comercial",
      "nivel": 1,
      "ativo": true,
      "subCentros": []
    }
  ]
}
```

---

### 6. Atualizar Centro de Custos

```
PATCH /centro-custo/:id
```

**Permissão:** `accounting.update`

**Body:** (todos os campos opcionais)
```json
{
  "codigo": "01.01",
  "nome": "Recursos Humanos Atualizado",
  "descricao": "Nova descrição",
  "responsavel": "Carlos Souza",
  "email": "carlos.souza@empresa.com",
  "ativo": true
}
```

**Validações:**
- Se alterar o código, não pode duplicar código existente na empresa
- Se alterar o pai, o nível deve ser (nível do novo pai + 1)
- Não pode definir a si mesmo como pai

**Resposta:**
```json
{
  "id": "uuid",
  "codigo": "01.01",
  "nome": "Recursos Humanos Atualizado",
  "descricao": "Nova descrição",
  "nivel": 2,
  "responsavel": "Carlos Souza",
  "email": "carlos.souza@empresa.com",
  "ativo": true,
  "updatedAt": "2025-10-25T20:00:00.000Z"
}
```

---

### 7. Ativar/Desativar Centro de Custos

```
PATCH /centro-custo/:id/toggle-active
```

**Permissão:** `accounting.update`

Alterna o status ativo/inativo do centro de custo.

**Resposta:**
```json
{
  "id": "uuid",
  "codigo": "01.01",
  "nome": "Recursos Humanos",
  "ativo": false,
  "updatedAt": "2025-10-25T20:00:00.000Z"
}
```

---

### 8. Deletar Centro de Custos

```
DELETE /centro-custo/:id
```

**Permissão:** `accounting.delete`

**Validações:**
- Não é possível excluir um centro de custo que possui sub-centros
- Primeiro exclua os sub-centros ou mova-os para outro pai

**Resposta:**
```json
{
  "message": "Centro de custo removido com sucesso"
}
```
      "codigo": "01",
      "nome": "Administrativo",
      "nivel": 1,
      "responsavel": "João Silva",
      "ativo": true,
      "subCentros": [
        {
          "id": "uuid-2",
          "codigo": "01.01",
          "nome": "Recursos Humanos",
          "nivel": 2,
          "responsavel": "Maria Santos",
          "ativo": true,
          "subCentros": [
            {
              "id": "uuid-3",
              "codigo": "01.01.001",
              "nome": "Recrutamento",
              "nivel": 3,
              "ativo": true,
              "subCentros": []
            }
          ]
        }
      ]
    },
    {
      "id": "uuid-4",
      "codigo": "02",
      "nome": "Comercial",
      "nivel": 1,
      "responsavel": "Pedro Costa",
      "ativo": true,
      "subCentros": []
    }
  ]
}
```

---

## 💼 Casos de Uso

### 1. Criar Hierarquia Inicial

```typescript
// 1. Criar departamento principal
const admin = await centroCustoApi.create({
  companyId: "uuid-empresa",
  codigo: "01",
  nome: "Administrativo",
  nivel: 1,
  responsavel: "João Silva"
})

// 2. Criar subdepartamento
const rh = await centroCustoApi.create({
  companyId: "uuid-empresa",
  codigo: "01.01",
  nome: "Recursos Humanos",
  centroCustoPaiId: admin.id,
  nivel: 2,
  responsavel: "Maria Santos"
})

// 3. Criar setor
await centroCustoApi.create({
  companyId: "uuid-empresa",
  codigo: "01.01.001",
  nome: "Recrutamento",
  centroCustoPaiId: rh.id,
  nivel: 3,
  responsavel: "Carlos Oliveira"
})
```

### 2. Listar Centros da Empresa

```typescript
// ✅ RECOMENDADO: Buscar todos os centros da empresa
const centros = await centroCustoApi.getByCompany("uuid-empresa")

console.log(`Total: ${centros.length} centros`)
console.log(centros)
```

### 3. Buscar Hierarquia Completa

```typescript
// ✅ RECOMENDADO: Obter árvore hierárquica
const hierarquia = await centroCustoApi.getHierarquia("uuid-empresa", true)

console.log(hierarquia.company.razaoSocial)
console.log(hierarquia.centrosCusto) // Árvore completa com subCentros
```

### 4. Atualizar Responsável

```typescript
await centroCustoApi.update("uuid-centro", {
  responsavel: "Novo Responsável",
  email: "novo@empresa.com"
})
```

### 5. Ativar/Desativar Centro

```typescript
// Alternar status ativo/inativo
const centroAtualizado = await centroCustoApi.toggleActive("uuid-centro")
console.log(`Novo status: ${centroAtualizado.ativo ? 'Ativo' : 'Inativo'}`)
```

---

## 🎯 Boas Práticas
  nivel: 3,
  responsavel: "Carlos Oliveira"
})
```

### 2. Listar Centros da Empresa

```typescript
// Buscar todos os centros ativos
const response = await centroCustoApi.getAll({
  companyId: "uuid-empresa",
  ativo: true
})

console.log(`Total: ${response.meta.total} centros`)
console.log(response.data)
```

### 3. Buscar Hierarquia Completa

```typescript
// Obter árvore hierárquica
const hierarquia = await centroCustoApi.getHierarquia("uuid-empresa", true)

console.log(hierarquia.company.razaoSocial)
console.log(hierarquia.centros) // Árvore completa com subCentros
```

### 4. Atualizar Responsável

```typescript
await centroCustoApi.update("uuid-centro", {
  responsavel: "Novo Responsável",
  email: "novo@empresa.com"
})
```

---

## 🎯 Boas Práticas

### Códigos
- ✅ Use formato hierárquico (01, 01.01, 01.01.001)
- ✅ Mantenha consistência no padrão
- ✅ Reserve espaço para crescimento (01, 02, 03... não 1, 2, 3)

### Estrutura
- ✅ Máximo 5 níveis para não complicar
- ✅ Nível 1: Departamentos principais
- ✅ Nível 2-3: Subdepartamentos e setores
- ✅ Nível 4-5: Projetos e atividades específicas

### Gestão
- ✅ Defina responsáveis para accountability
- ✅ Desative ao invés de deletar (mantém histórico)
- ✅ Revise periodicamente a estrutura
- ✅ Use descrições claras e objetivas

### Performance
- ✅ Sempre filtre por `companyId`
- ✅ Use paginação em listagens grandes
- ✅ Cache hierarquias completas quando possível

---

## 🔗 Integração com Outros Módulos

### Lançamentos Contábeis
Os centros de custo serão usados em lançamentos para:
- Rastrear custos por departamento
- Análise de rentabilidade por centro
- Relatórios gerenciais detalhados

### Orçamento
- Definir orçamentos por centro de custo
- Comparar realizado vs orçado
- Alertas de estouro

### Relatórios
- DRE por centro de custo
- Análise de custos hierárquica
- Dashboard gerencial

---

## 📚 Referências da API Client

### TypeScript

```typescript
import { centroCustoApi, type CentroCusto } from '@/lib/api/financial'

// Criar
const centro = await centroCustoApi.create({
  companyId: "uuid",
  codigo: "01",
  nome: "Administrativo",
  nivel: 1
})

// ✅ Listar (Lista simples - RECOMENDADO)
const centros = await centroCustoApi.getByCompany("uuid-empresa")

// Listar com filtros (alternativa)
const response = await centroCustoApi.getAll({
  companyId: "uuid",
  ativo: true
})

// Buscar por ID
const centro = await centroCustoApi.getById("uuid")

// ✅ Hierarquia (Árvore completa - RECOMENDADO)
const hierarquia = await centroCustoApi.getHierarquia("uuid-empresa")

// Hierarquia apenas ativos
const hierarquiaAtivos = await centroCustoApi.getHierarquia("uuid-empresa", true)

// Atualizar
await centroCustoApi.update("uuid", { 
  nome: "Novo Nome",
  responsavel: "Novo Responsável"
})

// ✅ Toggle Active (Ativar/Desativar)
await centroCustoApi.toggleActive("uuid")

// Deletar
await centroCustoApi.delete("uuid")
```

---

## 🚀 Próximos Passos

1. ✅ Implementar validações no backend
2. ✅ Criar interface de gerenciamento
3. ⏳ Integrar com lançamentos contábeis
4. ⏳ Criar relatórios por centro de custo
5. ⏳ Implementar sistema de orçamento
6. ⏳ Dashboard de análise de custos
