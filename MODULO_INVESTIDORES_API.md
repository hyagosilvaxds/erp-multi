# Integração do Módulo Investidores SCP com API

## Visão Geral

Este documento descreve a integração completa do módulo "Investidores SCP" com a API REST, incluindo:
- Listagem de investidores com paginação e filtros
- Cadastro de investidores (Pessoa Física e Jurídica)
- Visualização de detalhes
- Edição e exclusão

## Arquivos Criados/Modificados

### 1. API Client (`/lib/api/investors.ts`)

Cliente completo para comunicação com a API de investidores SCP.

**Principais Features:**
- Types e interfaces TypeScript completas
- Funções CRUD (Create, Read, Update, Delete)
- Helpers para formatação e exibição de dados
- Suporte a Pessoa Física e Pessoa Jurídica com tipos discriminados

**Tipos Principais:**
```typescript
- InvestorType: "PESSOA_FISICA" | "PESSOA_JURIDICA"
- InvestorStatus: "ATIVO" | "INATIVO" | "SUSPENSO" | "BLOQUEADO"
- InvestorProfile: "CONSERVADOR" | "MODERADO" | "ARROJADO"
- PessoaFisicaInvestor: Interface para PF com campos específicos
- PessoaJuridicaInvestor: Interface para PJ com campos específicos
```

**Funções Disponíveis:**
```typescript
// CRUD
investorsApi.create(companyId, data)
investorsApi.getAll(companyId, params?)
investorsApi.getById(id)
investorsApi.update(id, data)
investorsApi.delete(id)

// Helpers
investorsApi.helpers.getName(investor)
investorsApi.helpers.getDocument(investor)
investorsApi.helpers.getStatusColor(status)
investorsApi.helpers.getStatusLabel(status)
investorsApi.helpers.getTypeLabel(type)
investorsApi.helpers.getTypeAbbreviation(type)
```

### 2. Página de Listagem (`/app/dashboard/investidores/page.tsx`)

Página completamente integrada com a API mostrando lista de investidores.

**Features Implementadas:**
- ✅ Listagem paginada (10 itens por página)
- ✅ Busca por texto (nome, CPF/CNPJ, email, código)
- ✅ Filtros por tipo (PF/PJ)
- ✅ Filtros por status (Ativo, Inativo, Suspenso, Bloqueado)
- ✅ Estatísticas em cards (total investidores, ativos)
- ✅ Loading states e error handling
- ✅ Empty states com mensagens apropriadas
- ✅ Navegação para detalhes do investidor
- ✅ Botões de ação rápida (Aportes, Distribuições, Políticas)

**Estados da Página:**
```typescript
const [investors, setInvestors] = useState<InvestorListItem[]>([])
const [loading, setLoading] = useState(true)
const [searchTerm, setSearchTerm] = useState("")
const [typeFilter, setTypeFilter] = useState<string>("all")
const [statusFilter, setStatusFilter] = useState<string>("all")
const [currentPage, setCurrentPage] = useState(1)
const [totalPages, setTotalPages] = useState(1)
const [totalInvestors, setTotalInvestors] = useState(0)
```

**Debounce na Busca:**
- Search com delay de 500ms para não fazer requisições a cada tecla
- Reseta para página 1 ao buscar

**Tabela de Investidores:**
| Coluna | Descrição |
|--------|-----------|
| Código | `investorCode` - Identificação única |
| Nome/Razão Social | `fullName` (PF) ou `companyName` (PJ) |
| Tipo | Badge com PF ou PJ |
| Documento | CPF (PF) ou CNPJ (PJ) |
| Email | Email principal |
| Aportes | Badge com `_count.investments` |
| Distribuições | Badge com `_count.distributions` |
| Status | Badge colorido (Ativo, Inativo, etc) |
| Ações | Link para detalhes |

### 3. Página de Cadastro (`/app/dashboard/investidores/novo/page.tsx`)

Formulário completo para cadastro de novos investidores.

**Features Implementadas:**
- ✅ Seleção de tipo (Pessoa Física ou Jurídica)
- ✅ Formulários específicos para cada tipo
- ✅ Validações de campos obrigatórios
- ✅ Campos organizados em cards temáticos
- ✅ Layout responsivo com sidebar
- ✅ Loading states e feedback visual
- ✅ Integração completa com API

**Seções do Formulário:**

#### Pessoa Física
1. **Dados Pessoais:**
   - Nome Completo * (obrigatório)
   - CPF * (obrigatório)
   - RG
   - Data de Nascimento
   - Gênero (Masculino, Feminino, Outro)
   - Estado Civil
   - Profissão
   - Nacionalidade
   - Nome da Mãe
   - Nome do Pai
   - Renda Mensal
   - Patrimônio

#### Pessoa Jurídica
1. **Dados da Empresa:**
   - Razão Social * (obrigatório)
   - Nome Fantasia
   - CNPJ * (obrigatório)
   - Inscrição Estadual
   - Inscrição Municipal
   - Data de Fundação
   - Natureza Jurídica
   - Atividade Principal

2. **Representante Legal:**
   - Nome do Representante
   - CPF do Representante
   - Cargo

#### Seções Comuns (PF e PJ)
3. **Informações de Contato:**
   - E-mail * (obrigatório)
   - E-mail Alternativo
   - Celular
   - WhatsApp
   - Telefone Fixo

4. **Endereço:**
   - CEP
   - Logradouro
   - Número
   - Complemento
   - Bairro
   - Cidade
   - Estado (UF)
   - Tipo (Residencial, Comercial, Correspondência)

5. **Dados Bancários:**
   - Banco
   - Código do Banco
   - Agência + Dígito
   - Conta + Dígito
   - Tipo de Conta (Corrente, Poupança, Pagamento)
   - Tipo de Chave PIX (CPF, CNPJ, Email, Telefone, Aleatória)
   - Chave PIX

6. **Observações:**
   - Observações Públicas
   - Observações Internas

#### Sidebar
7. **Código do Investidor:**
   - Código * (obrigatório)

8. **Perfil de Investidor:**
   - Perfil de Risco (Conservador, Moderado, Arrojado)
   - Objetivo de Investimento
   - Categoria
   - ☑ Investidor Qualificado

9. **Status:**
   - Status (Ativo, Inativo, Suspenso, Bloqueado)
   - ☑ Investidor Ativo

**Validações Implementadas:**
```typescript
// Pessoa Física
if (!formData.fullName || !formData.cpf || !formData.email) {
  // Erro: campos obrigatórios
}

// Pessoa Jurídica
if (!formData.companyName || !formData.cnpj || !formData.email) {
  // Erro: campos obrigatórios
}
```

**Fluxo de Submissão:**
1. Validação dos campos obrigatórios
2. Montagem do payload baseado no tipo (PF ou PJ)
3. Conversão de valores numéricos (renda, patrimônio)
4. Envio para API via `investorsApi.create()`
5. Toast de sucesso ou erro
6. Redirecionamento para listagem em caso de sucesso

## Endpoints da API Utilizados

### `POST /scp/investors`
Cria novo investidor (PF ou PJ).

**Campos Obrigatórios:**
- PF: `type`, `fullName`, `cpf`, `email`
- PJ: `type`, `companyName`, `cnpj`, `email`

**Validações do Backend:**
- CPF único por empresa
- CNPJ único por empresa
- Email único por empresa

### `GET /scp/investors`
Lista investidores com paginação e filtros.

**Query Params:**
```typescript
{
  page?: number          // Padrão: 1
  limit?: number         // Padrão: 10
  search?: string        // Busca em fullName, companyName, cpf, cnpj, email, investorCode
  type?: InvestorType    // PESSOA_FISICA ou PESSOA_JURIDICA
  active?: boolean       // true ou false
  status?: InvestorStatus // ATIVO, INATIVO, SUSPENSO, BLOQUEADO
}
```

**Resposta:**
```typescript
{
  data: InvestorListItem[]  // Array de investidores
  meta: {
    total: number           // Total de registros
    page: number            // Página atual
    limit: number           // Itens por página
    totalPages: number      // Total de páginas
  }
}
```

### `GET /scp/investors/:id`
Busca investidor por ID com detalhes completos.

**Retorna:**
- Todos os campos do investidor
- `investments[]`: Lista de aportes
- `distributions[]`: Lista de distribuições
- `distributionPolicies[]`: Políticas de distribuição
- `totals`: Totais consolidados (investido, distribuído)

### `PUT /scp/investors/:id`
Atualiza investidor existente.

**Body:** Mesma estrutura do POST, todos campos opcionais

**Validações:**
- Se alterar CPF, verifica duplicidade
- Se alterar CNPJ, verifica duplicidade

### `DELETE /scp/investors/:id`
Exclui investidor permanentemente.

**Validações:**
- ❌ NÃO pode ter aportes (investments)
- ❌ NÃO pode ter distribuições

**Recomendação:** Use desativação (`active: false`) ao invés de exclusão para manter histórico.

## UX/UI Features

### Loading States
- Skeleton loader enquanto carrega dados
- Spinner no botão durante submissão
- Mensagem "Salvando..." com animação

### Empty States
- Listagem vazia: "Nenhum investidor encontrado"
- Busca sem resultados: "Tente ajustar os filtros"
- Ícones ilustrativos e botão CTA

### Error Handling
- Toast notifications para erros
- Mensagens amigáveis extraídas da API
- Fallback para mensagens genéricas

### Validação de Empresa
- Verifica se empresa está selecionada
- Mostra mensagem apropriada se não estiver
- Previne requisições sem empresa

### Responsividade
- Grid adaptativo (1 coluna mobile, 2-3 desktop)
- Sidebar empilha em telas menores
- Tabela com scroll horizontal se necessário

## Próximos Passos

### Páginas a Implementar:
1. **Detalhes do Investidor (`/investidores/[id]/page.tsx`)**
   - Visualização completa dos dados
   - Lista de aportes
   - Lista de distribuições
   - Políticas de distribuição
   - Botões de edição e exclusão

2. **Edição do Investidor (`/investidores/[id]/editar/page.tsx`)**
   - Mesma estrutura do cadastro
   - Campos pré-preenchidos
   - Atualização via `PUT /scp/investors/:id`

3. **Aportes (`/investidores/aportes/**`)**
   - Integrar com API de aportes
   - Vincular a investidores

4. **Distribuições (`/investidores/distribuicoes/**`)**
   - Integrar com API de distribuições
   - Cálculos baseados em políticas

5. **Políticas de Distribuição (`/investidores/politicas/**`)**
   - Definir percentuais por investidor
   - Configurar tipos de distribuição

### Melhorias Sugeridas:
- [ ] Máscaras para CPF, CNPJ, telefone, CEP
- [ ] Integração com ViaCEP para busca de endereço
- [ ] Upload de documentos (contrato SCP)
- [ ] Histórico de alterações
- [ ] Exportação para Excel/PDF
- [ ] Gráficos e dashboards de investimentos
- [ ] Notificações por email
- [ ] Assinatura digital de contratos

## Exemplos de Uso

### Criar Investidor Pessoa Física
```typescript
const payload = {
  type: "PESSOA_FISICA",
  fullName: "João Silva Santos",
  cpf: "123.456.789-00",
  email: "joao.silva@email.com",
  mobilePhone: "(11) 98765-4321",
  investorCode: "INV-PF-001",
  investorProfile: "MODERADO",
  status: "ATIVO",
  active: true,
  isAccreditedInvestor: false,
}

await investorsApi.create(companyId, payload)
```

### Listar com Filtros
```typescript
const investors = await investorsApi.getAll(companyId, {
  page: 1,
  limit: 10,
  search: "joão",
  type: "PESSOA_FISICA",
  status: "ATIVO"
})
```

### Atualizar Status
```typescript
await investorsApi.update(investorId, {
  status: "INATIVO",
  statusReason: "Cliente solicitou",
  active: false
})
```

## Considerações de Segurança

1. **Autenticação:** Todas as requisições exigem empresa selecionada
2. **Validação:** Backend valida unicidade de CPF/CNPJ/Email
3. **Soft Delete:** Recomenda-se desativar ao invés de excluir
4. **Dados Sensíveis:** CPF/CNPJ/Contas bancárias devem ter proteção adicional
5. **LGPD:** Implementar termos de aceite e política de privacidade

## Performance

- **Paginação:** Máximo de 10 itens por página
- **Debounce:** 500ms na busca para evitar requisições excessivas
- **Lazy Loading:** Carrega dados apenas quando necessário
- **Cache:** Considera implementar cache local para melhor UX

## Testes Recomendados

### Testes Funcionais:
- [ ] Cadastro de PF com campos obrigatórios
- [ ] Cadastro de PJ com campos obrigatórios
- [ ] Validação de CPF duplicado
- [ ] Validação de CNPJ duplicado
- [ ] Validação de email duplicado
- [ ] Busca por nome/documento
- [ ] Filtros de tipo e status
- [ ] Paginação funcionando
- [ ] Edição de investidor
- [ ] Tentativa de exclusão com vínculos

### Testes de UX:
- [ ] Loading states visíveis
- [ ] Mensagens de erro compreensíveis
- [ ] Formulário responsivo
- [ ] Validação em tempo real
- [ ] Feedback visual de sucesso/erro

---

**Data de Implementação:** 10 de novembro de 2025  
**Versão da API:** v1  
**Status:** ✅ Integração Completa - Listagem e Cadastro
