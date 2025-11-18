# Sistema de Plano de Contas e Contas Contábeis

## 📋 Visão Geral

Sistema completo para gerenciamento de Planos de Contas e Contas Contábeis, permitindo criar estruturas hierárquicas de contas para controle financeiro e contábil.

## 🔐 Autenticação e Permissões

**Headers Obrigatórios:**
# Sistema de Plano de Contas e Contas Contábeis

## 📋 Visão Geral

Sistema completo para gerenciamento de Planos de Contas e Contas Contábeis, permitindo criar estruturas hierárquicas de contas para controle financeiro e contábil.

### 🏢 Relação com Empresas

Os planos de contas podem ser:
- **Planos da Empresa** (`companyId` preenchido): Específicos para uma empresa
- **Planos do Sistema** (`companyId` null): Templates globais disponíveis para todas as empresas

## 🔐 Autenticação e Permissões

**Headers Obrigatórios:**
```
Authorization: Bearer {token}
x-company-id: {companyId}
```

**Permissões Necessárias:**
- `accounting.create` - Criar planos de contas e contas contábeis
- `accounting.read` - Visualizar planos de contas e contas contábeis
- `accounting.update` - Atualizar planos de contas e contas contábeis
- `accounting.delete` - Deletar planos de contas e contas contábeis

**Nota:** Usuários com role `admin` têm todas as permissões automaticamente.

---

## 📡 API - Plano de Contas

### 1. Criar Plano de Contas

**Endpoint:** `POST /plano-contas`

**Permissão:** `accounting.create`

**Body (Plano da Empresa):**
```json
{
  "companyId": "uuid-da-empresa",
  "nome": "Plano de Contas Personalizado",
  "descricao": "Plano específico da empresa",
  "tipo": "Gerencial",
  "ativo": true,
  "padrao": true
}
```

**Body (Plano do Sistema - apenas Admin):**
```json
{
  "companyId": null,
  "nome": "Plano de Contas Sistema",
  "descricao": "Plano template do sistema",
  "tipo": "Gerencial",
  "ativo": true,
  "padrao": false
}
```

**Campos:**
- `companyId` (string|null, opcional) - UUID da empresa ou null para plano do sistema
- `nome` (string, obrigatório) - Nome do plano de contas
- `descricao` (string, opcional) - Descrição detalhada
- `tipo` (enum, opcional) - `Gerencial`, `Fiscal` ou `Contabil` (padrão: `Gerencial`)
- `ativo` (boolean, opcional) - Se está ativo (padrão: `true`)
- `padrao` (boolean, opcional) - Se é o padrão da empresa/sistema (padrão: `false`)

**Resposta:**
```json
{
  "id": "uuid",
  "companyId": "uuid-da-empresa",
  "nome": "Plano de Contas Personalizado",
  "descricao": "Plano específico da empresa",
  "tipo": "Gerencial",
  "ativo": true,
  "padrao": true,
  "createdAt": "2025-10-25T10:00:00.000Z",
  "updatedAt": "2025-10-25T10:00:00.000Z",
  "contas": []
}
```

---

### 2. Listar Planos de Contas

**Endpoint:** `GET /plano-contas`

**Permissão:** `accounting.read`

**Query Parameters:**
- `companyId` (string|'null', opcional) - Filtrar por empresa ou planos do sistema
- `page` (number, opcional) - Número da página (padrão: 1)
- `limit` (number, opcional) - Itens por página (padrão: 50)
- `tipo` (string, opcional) - Filtrar por tipo (`Gerencial`, `Fiscal`, `Contabil`)
- `ativo` (boolean, opcional) - Filtrar por status ativo

**Exemplos:**
```bash
# Listar planos de uma empresa específica
GET /plano-contas?companyId=uuid-da-empresa

# Listar planos do sistema (templates)
GET /plano-contas?companyId=null

# Listar planos com filtros
GET /plano-contas?companyId=uuid&tipo=Gerencial&ativo=true
```

**Resposta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "companyId": "uuid-da-empresa",
      "nome": "Plano de Contas Padrão",
      "descricao": "Plano de contas padrão da empresa",
      "tipo": "Gerencial",
      "ativo": true,
      "padrao": true,
      "createdAt": "2025-10-25T10:00:00.000Z",
      "updatedAt": "2025-10-25T10:00:00.000Z",
      "_count": {
        "contas": 21
      }
````

**Permissões Necessárias:**
- `accounting.create` - Criar planos de contas e contas contábeis
- `accounting.read` - Visualizar planos de contas e contas contábeis
- `accounting.update` - Atualizar planos de contas e contas contábeis
- `accounting.delete` - Deletar planos de contas e contas contábeis

**Nota:** Usuários com role `admin` têm todas as permissões automaticamente.

---

## 📡 API - Plano de Contas

### 1. Criar Plano de Contas

**Endpoint:** `POST /plano-contas`

**Permissão:** `accounting.create`

**Body:**
```json
{
  "nome": "Plano de Contas Comercial",
  "descricao": "Plano de contas para empresas comerciais",
  "tipo": "Gerencial",
  "ativo": true,
  "padrao": false
}
```

**Campos:**
- `nome` (string, obrigatório) - Nome do plano de contas
- `descricao` (string, opcional) - Descrição detalhada
- `tipo` (enum, opcional) - `Gerencial`, `Fiscal` ou `Contabil` (padrão: `Gerencial`)
- `ativo` (boolean, opcional) - Se está ativo (padrão: `true`)
- `padrao` (boolean, opcional) - Se é o padrão do sistema (padrão: `false`)

**Resposta:**
```json
{
  "id": "uuid",
  "nome": "Plano de Contas Comercial",
  "descricao": "Plano de contas para empresas comerciais",
  "tipo": "Gerencial",
  "ativo": true,
  "padrao": false,
  "createdAt": "2025-10-25T10:00:00.000Z",
  "updatedAt": "2025-10-25T10:00:00.000Z",
  "contas": []
}
```

---

### 2. Listar Planos de Contas

**Endpoint:** `GET /plano-contas`

**Permissão:** `accounting.read`

**Query Parameters:**
- `page` (number, opcional) - Número da página (padrão: 1)
- `limit` (number, opcional) - Itens por página (padrão: 50)
- `tipo` (string, opcional) - Filtrar por tipo (`Gerencial`, `Fiscal`, `Contabil`)
- `ativo` (boolean, opcional) - Filtrar por status ativo

**Exemplo:**
```bash
GET /plano-contas?page=1&limit=20&tipo=Gerencial&ativo=true
```

**Resposta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "nome": "Plano de Contas Padrão",
      "descricao": "Plano de contas padrão do sistema",
      "tipo": "Gerencial",
      "ativo": true,
      "padrao": true,
      "createdAt": "2025-10-25T10:00:00.000Z",
      "updatedAt": "2025-10-25T10:00:00.000Z",
      "_count": {
        "contas": 21
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 50,
    "totalPages": 1
  }
}
```

---

### 3. Buscar Plano de Contas Padrão

**Endpoint:** `GET /plano-contas/padrao`

**Permissão:** `accounting.read`

**Query Parameters:**
- `companyId` (string|'null', opcional) - UUID da empresa ou 'null' para plano do sistema

**Exemplos:**
```bash
# Buscar plano padrão de uma empresa
GET /plano-contas/padrao?companyId=uuid-da-empresa

# Buscar plano padrão do sistema
GET /plano-contas/padrao?companyId=null

# Sem companyId: usa a empresa do header x-company-id
GET /plano-contas/padrao
```

**Resposta:**
```json
{
  "id": "uuid",
  "companyId": "uuid-da-empresa",
  "nome": "Plano de Contas Padrão",
  "descricao": "Plano de contas padrão da empresa",
  "tipo": "Gerencial",
  "ativo": true,
  "padrao": true,
  "createdAt": "2025-10-25T10:00:00.000Z",
  "updatedAt": "2025-10-25T10:00:00.000Z",
  "contas": [
    {
      "id": "uuid",
      "codigo": "1",
      "nome": "ATIVO",
      "tipo": "Ativo",
      "natureza": "Devedora",
      "nivel": 1,
      "contaPaiId": null,
      "aceitaLancamento": false,
      "ativo": true
    }
  ]
}
```

---

### 4. Buscar Plano de Contas por ID

**Endpoint:** `GET /plano-contas/:id`

**Permissão:** `accounting.read`

**Resposta:**
```json
{
  "id": "uuid",
  "nome": "Plano de Contas Comercial",
  "descricao": "Plano de contas para empresas comerciais",
  "tipo": "Gerencial",
  "ativo": true,
  "padrao": false,
  "createdAt": "2025-10-25T10:00:00.000Z",
  "updatedAt": "2025-10-25T10:00:00.000Z",
  "contas": [
    {
      "id": "uuid",
      "codigo": "1.1",
      "nome": "Ativo Circulante",
      "tipo": "Ativo",
      "natureza": "Devedora",
      "nivel": 2,
      "contaPaiId": "uuid-conta-pai",
      "aceitaLancamento": false,
      "ativo": true,
      "subContas": []
    }
  ]
}
```

---

### 5. Buscar Hierarquia de Contas

**Endpoint:** `GET /plano-contas/:id/hierarquia`

**Permissão:** `accounting.read`

**Query Parameters:**
- `ativo` (boolean, opcional) - Filtrar apenas contas ativas

**Exemplos:**
```bash
# Hierarquia completa
GET /plano-contas/:id/hierarquia

# Apenas contas ativas
GET /plano-contas/:id/hierarquia?ativo=true
```

Retorna a estrutura hierárquica completa das contas até 5 níveis de profundidade.

**Resposta:**
```json
{
  "planoContas": {
    "id": "uuid",
    "nome": "Plano de Contas Padrão",
    "tipo": "Gerencial"
  },
  "contas": [
    {
      "id": "uuid",
      "codigo": "1",
      "nome": "ATIVO",
      "tipo": "Ativo",
      "natureza": "Devedora",
      "nivel": 1,
      "subContas": [
        {
          "id": "uuid",
          "codigo": "1.1",
          "nome": "Ativo Circulante",
          "tipo": "Ativo",
          "natureza": "Devedora",
          "nivel": 2,
          "subContas": [
            {
              "id": "uuid",
              "codigo": "1.1.01",
              "nome": "Disponível",
              "tipo": "Ativo",
              "natureza": "Devedora",
              "nivel": 3,
              "subContas": [
                {
                  "id": "uuid",
                  "codigo": "1.1.01.001",
                  "nome": "Caixa Geral",
                  "tipo": "Ativo",
                  "natureza": "Devedora",
                  "nivel": 4,
                  "aceitaLancamento": true,
                  "subContas": []
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

---

### 6. Atualizar Plano de Contas

**Endpoint:** `PATCH /plano-contas/:id`

**Permissão:** `accounting.update`

**Body:** (todos os campos opcionais)
```json
{
  "nome": "Plano de Contas Industrial",
  "descricao": "Plano de contas atualizado para indústrias",
  "tipo": "Fiscal",
  "ativo": true,
  "padrao": false
}
```

**Resposta:** Retorna o plano de contas atualizado.

---

### 7. Duplicar Plano de Contas

**Endpoint:** `POST /plano-contas/:id/duplicar`

**Permissão:** `accounting.create`

Cria uma cópia completa do plano de contas, incluindo todas as contas e sua hierarquia.

**Body:**
```json
{
  "nome": "Plano de Contas Comercial - Cópia",
  "descricao": "Cópia do plano de contas comercial"
}
```

**Resposta:** Retorna o novo plano de contas criado com todas as contas duplicadas.

---

### 8. Excluir Plano de Contas

**Endpoint:** `DELETE /plano-contas/:id`

**Permissão:** `accounting.delete`

**Regra:** Não é possível excluir um plano de contas que possui contas cadastradas.

**Resposta:**
```json
{
  "message": "Plano de contas removido com sucesso"
}
```

---

## 📡 API - Contas Contábeis

### 1. Criar Conta Contábil

**Endpoint:** `POST /plano-contas/:planoContasId/contas`

**Permissão:** `accounting.create`

**Body:**
```json
{
  "codigo": "1.1.01.001",
  "nome": "Caixa Geral",
  "tipo": "Ativo",
  "natureza": "Devedora",
  "nivel": 4,
  "contaPaiId": "uuid-conta-pai",
  "aceitaLancamento": true,
  "ativo": true
}
```

**Campos:**
- `codigo` (string, obrigatório) - Código único da conta no plano
- `nome` (string, obrigatório) - Nome descritivo da conta
- `tipo` (enum, obrigatório) - `Ativo`, `Passivo`, `Receita`, `Despesa`, `Patrimônio Líquido`
- `natureza` (enum, obrigatório) - `Devedora` ou `Credora`
- `nivel` (number, obrigatório) - Nível hierárquico (1, 2, 3, 4...)
- `contaPaiId` (string, opcional) - ID da conta pai
- `aceitaLancamento` (boolean, opcional) - Se aceita lançamentos diretos (padrão: `true`)
- `ativo` (boolean, opcional) - Se está ativa (padrão: `true`)

**Validações:**
- Código deve ser único dentro do plano de contas
- Se tiver conta pai, o nível deve ser `nivel_pai + 1`
- Conta pai deve pertencer ao mesmo plano de contas

**Resposta:**
```json
{
  "id": "uuid",
  "planoContasId": "uuid",
  "codigo": "1.1.01.001",
  "nome": "Caixa Geral",
  "tipo": "Ativo",
  "natureza": "Devedora",
  "nivel": 4,
  "contaPaiId": "uuid-conta-pai",
  "aceitaLancamento": true,
  "ativo": true,
  "createdAt": "2025-10-25T10:00:00.000Z",
  "updatedAt": "2025-10-25T10:00:00.000Z",
  "contaPai": {
    "id": "uuid",
    "codigo": "1.1.01",
    "nome": "Disponível",
    "tipo": "Ativo",
    "nivel": 3
  },
  "subContas": []
}
```

---

### 2. Listar Contas Contábeis

**Endpoint:** `GET /plano-contas/:planoContasId/contas`

**Permissão:** `accounting.read`

**Query Parameters:**
- `page` (number, opcional) - Número da página (padrão: 1)
- `limit` (number, opcional) - Itens por página (padrão: 100)
- `tipo` (string, opcional) - Filtrar por tipo
- `nivel` (number, opcional) - Filtrar por nível
- `contaPaiId` (string, opcional) - Filtrar por conta pai
- `search` (string, opcional) - Buscar por código ou nome

**Exemplo:**
```bash
GET /plano-contas/uuid/contas?tipo=Ativo&nivel=4&search=caixa
```

**Resposta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "planoContasId": "uuid",
      "codigo": "1.1.01.001",
      "nome": "Caixa Geral",
      "tipo": "Ativo",
      "natureza": "Devedora",
      "nivel": 4,
      "contaPaiId": "uuid-conta-pai",
      "aceitaLancamento": true,
      "ativo": true,
      "createdAt": "2025-10-25T10:00:00.000Z",
      "updatedAt": "2025-10-25T10:00:00.000Z",
      "contaPai": {
        "id": "uuid",
        "codigo": "1.1.01",
        "nome": "Disponível"
      },
      "_count": {
        "subContas": 0
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 100,
    "totalPages": 1
  }
}
```

---

### 3. Buscar Conta Contábil por ID

**Endpoint:** `GET /plano-contas/contas/:id`

**Permissão:** `accounting.read`

**Resposta:**
```json
{
  "id": "uuid",
  "planoContasId": "uuid",
  "codigo": "1.1.01.001",
  "nome": "Caixa Geral",
  "tipo": "Ativo",
  "natureza": "Devedora",
  "nivel": 4,
  "contaPaiId": "uuid-conta-pai",
  "aceitaLancamento": true,
  "ativo": true,
  "createdAt": "2025-10-25T10:00:00.000Z",
  "updatedAt": "2025-10-25T10:00:00.000Z",
  "planoContas": {
    "id": "uuid",
    "nome": "Plano de Contas Padrão",
    "tipo": "Gerencial"
  },
  "contaPai": {
    "id": "uuid",
    "codigo": "1.1.01",
    "nome": "Disponível"
  },
  "subContas": []
}
```

---

### 4. Atualizar Conta Contábil

**Endpoint:** `PATCH /plano-contas/contas/:id`

**Permissão:** `accounting.update`

**Body:** (todos os campos opcionais)
```json
{
  "codigo": "1.1.01.002",
  "nome": "Caixa Matriz",
  "tipo": "Ativo",
  "natureza": "Devedora",
  "nivel": 4,
  "contaPaiId": "uuid-novo-pai",
  "aceitaLancamento": true,
  "ativo": true
}
```

**Validações:**
- Se alterar o código, ele deve continuar único no plano de contas
- Se alterar conta pai, ela deve pertencer ao mesmo plano de contas

**Resposta:** Retorna a conta contábil atualizada.

---

### 5. Excluir Conta Contábil

**Endpoint:** `DELETE /plano-contas/contas/:id`

**Permissão:** `accounting.delete`

**Regra:** Não é possível excluir uma conta que possui subcontas.

**Resposta:**
```json
{
  "message": "Conta contábil removida com sucesso"
}
```

---

## 📊 Tipos e Classificações

### Tipos de Plano de Contas

| Tipo | Descrição | Uso |
|------|-----------|-----|
| **Gerencial** | Controle interno e gestão | Relatórios gerenciais, análises internas |
| **Fiscal** | Obrigações fiscais | Declarações, impostos, obrigações acessórias |
| **Contabil** | Escrituração oficial | Livros contábeis, balanços oficiais |

### Tipos de Conta Contábil

| Tipo | Descrição | Exemplos |
|------|-----------|----------|
| **Ativo** | Bens e direitos da empresa | Caixa, Bancos, Estoque, Imóveis |
| **Passivo** | Obrigações e dívidas | Fornecedores, Empréstimos, Salários a Pagar |
| **Receita** | Ganhos e faturamento | Vendas, Juros Ativos, Receitas de Serviços |
| **Despesa** | Custos e gastos | Salários, Aluguel, Energia, Material de Consumo |
| **Patrimônio Líquido** | Capital e reservas | Capital Social, Lucros Acumulados, Reservas |

### Natureza da Conta

| Natureza | Aumenta com | Diminui com | Tipos de Conta |
|----------|-------------|-------------|----------------|
| **Devedora** | Débito | Crédito | Ativo, Despesa |
| **Credora** | Crédito | Débito | Passivo, Receita, Patrimônio Líquido |

---

## 🎨 Estrutura Hierárquica

### Níveis de Conta

```
Nível 1: 1 - ATIVO
Nível 2: 1.1 - Ativo Circulante
Nível 3: 1.1.01 - Disponível
Nível 4: 1.1.01.001 - Caixa Geral
Nível 5: 1.1.01.001.01 - Caixa Matriz
```

### Regras de Hierarquia

#### 1. Contas Sintéticas (Níveis 1-3)
- **Característica:** Agrupam outras contas
- **Lançamentos:** NÃO aceitam lançamentos diretos
- **Função:** Organização e totalização
- **Exemplos:**
  - `1 - ATIVO` (Nível 1)
  - `1.1 - Ativo Circulante` (Nível 2)
  - `1.1.01 - Disponível` (Nível 3)

#### 2. Contas Analíticas (Níveis 4+)
- **Característica:** Contas finais da hierarquia
- **Lançamentos:** ACEITAM lançamentos diretos
- **Função:** Registro de operações
- **Exemplos:**
  - `1.1.01.001 - Caixa Geral` (Nível 4)
  - `1.1.01.002 - Banco Itaú C/C` (Nível 4)
  - `1.1.01.001.01 - Caixa Matriz` (Nível 5)

### Validações de Hierarquia

1. **Conta Pai:**
   - Deve pertencer ao mesmo plano de contas
   - Deve ter nível menor que a conta filha
   - Nível da filha = Nível do pai + 1

2. **Exclusão:**
   - Não é possível excluir conta com subcontas
   - Não é possível excluir plano com contas

3. **Código:**
   - Deve ser único dentro do plano de contas
   - Sugestão: seguir padrão numérico hierárquico

---

## 🔧 Implementação Frontend

### API Client (`lib/api/financial.ts`)

#### Plano de Contas
```typescript
planoContasApi.create(data)
planoContasApi.getAll(params)
planoContasApi.getPadrao()
planoContasApi.getById(id)
planoContasApi.getHierarquia(id)
planoContasApi.update(id, dados)
planoContasApi.duplicar(id, dados)
planoContasApi.delete(id)
```

#### Contas Contábeis
```typescript
contasContabeisApi.create(planoContasId, data)
contasContabeisApi.getAll(planoContasId, params)
contasContabeisApi.getById(id)
contasContabeisApi.update(id, dados)
contasContabeisApi.delete(id)
```

### Importação

```typescript
import { planoContasApi, contasContabeisApi } from "@/lib/api/financial"
import type { PlanoContas, ContaContabil } from "@/lib/api/financial"
```

### Páginas Criadas

1. **Listar Planos de Contas:** `/admin/plano-contas`
2. **Criar Plano de Contas:** `/admin/plano-contas/novo`
3. **Ver Hierarquia:** `/admin/plano-contas/[id]`
4. **Editar Plano:** `/admin/plano-contas/[id]/editar`
5. **Duplicar Plano:** `/admin/plano-contas/[id]/duplicar`
6. **Criar Conta:** `/admin/plano-contas/[id]/contas/nova`
7. **Editar Conta:** `/admin/plano-contas/contas/[contaId]/editar`

---

## 📝 Exemplos de Uso

### Exemplo 1: Criar Plano de Contas Completo

```typescript
// 1. Criar plano
const plano = await planoContasApi.create({
  nome: "Plano Comercial",
  tipo: "Gerencial"
})

// 2. Criar conta raiz
const ativo = await contasContabeisApi.create(plano.id, {
  codigo: "1",
  nome: "ATIVO",
  tipo: "Ativo",
  natureza: "Devedora",
  nivel: 1,
  aceitaLancamento: false
})

// 3. Criar subconta
const ativoCirculante = await contasContabeisApi.create(plano.id, {
  codigo: "1.1",
  nome: "Ativo Circulante",
  tipo: "Ativo",
  natureza: "Devedora",
  nivel: 2,
  contaPaiId: ativo.id,
  aceitaLancamento: false
})

// 4. Criar conta analítica
const caixa = await contasContabeisApi.create(plano.id, {
  codigo: "1.1.01.001",
  nome: "Caixa Geral",
  tipo: "Ativo",
  natureza: "Devedora",
  nivel: 4,
  contaPaiId: disponivel.id,
  aceitaLancamento: true
})
```

### Exemplo 2: Buscar Hierarquia

```typescript
const { planoContas, contas } = await planoContasApi.getHierarquia(planoId)

// contas vem em estrutura hierárquica com subContas
contas.forEach(nivel1 => {
  console.log(nivel1.nome) // ATIVO
  nivel1.subContas.forEach(nivel2 => {
    console.log('  ' + nivel2.nome) // Ativo Circulante
    nivel2.subContas.forEach(nivel3 => {
      console.log('    ' + nivel3.nome) // Disponível
    })
  })
})
```

### Exemplo 3: Filtrar Contas

```typescript
// Buscar todas as contas analíticas de Ativo
const contas = await contasContabeisApi.getAll(planoId, {
  tipo: "Ativo",
  nivel: 4,
  search: "caixa"
})
```

---

## ✅ Checklist de Implementação

### Backend (API)
- ✅ CRUD de Plano de Contas
- ✅ CRUD de Contas Contábeis
- ✅ Hierarquia de contas (5 níveis)
- ✅ Validações de código único
- ✅ Validações de hierarquia
- ✅ Filtros e busca
- ✅ Paginação
- ✅ Permissões

### Frontend (Client)
- ✅ API Client completa
- ✅ Tipos TypeScript
- ✅ Página de listagem de planos
- ✅ Página de criação de plano
- ✅ Página de edição de plano
- ✅ Página de hierarquia
- ✅ Página de criação de conta
- ✅ Página de edição de conta
- ✅ Duplicar plano
- ⏳ Exclusão com confirmação
- ⏳ Visualização em árvore
- ⏳ Drag & drop para reorganizar

---

## 🚀 Próximas Melhorias

1. **Importação/Exportação:**
   - Importar plano de Excel/CSV
   - Exportar para Excel/CSV

2. **Relatórios:**
   - Balancete analítico
   - Balancete sintético
   - DRE (Demonstração do Resultado)

3. **Validações Avançadas:**
   - Validar código seguindo padrão
   - Sugerir próximo código disponível
   - Validar natureza vs tipo de conta

4. **Interface:**
   - Componente TreeView para hierarquia
   - Drag & drop para mover contas
   - Busca avançada com múltiplos filtros
   - Visualização gráfica da estrutura

5. **Integrações:**
   - Vincular com centro de custos
   - Integrar com lançamentos contábeis
   - Relatórios consolidados
