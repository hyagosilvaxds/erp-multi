# Suporte para Colaboradores PJ (Pessoa Jurídica)

## Implementação Concluída ✅

O sistema agora suporta completamente o cadastro de colaboradores do tipo **PJ (Pessoa Jurídica)** com todas as informações da empresa.

## Alterações Realizadas

### 1. API - `/lib/api/employees.ts`

**Novos campos adicionados à interface `Employee`:**
- `companyDocument` - CNPJ da empresa
- `companyName` - Razão social
- `companyTradeName` - Nome fantasia
- `companyStateRegistration` - Inscrição estadual
- `companyMunicipalRegistration` - Inscrição municipal
- `companyEmail` - E-mail da empresa
- `companyPhone` - Telefone da empresa
- `companyZipCode` - CEP da empresa
- `companyStreet` - Logradouro
- `companyNumber` - Número
- `companyComplement` - Complemento
- `companyNeighborhood` - Bairro
- `companyCity` - Cidade
- `companyState` - Estado (UF)

**Novos campos também adicionados à interface `CreateEmployeeRequest`** para permitir o envio desses dados na criação.

### 2. Máscaras - `/lib/masks.ts`

**Importação adicionada:**
- `maskCNPJ` - Máscara para CNPJ (00.000.000/0000-00)
- `validateCNPJ` - Validação de CNPJ com algoritmo de dígitos verificadores

### 3. Formulário de Cadastro - `/app/dashboard/rh/colaboradores/novo/page.tsx`

#### 3.1. Nova Aba "Dados da Empresa"

- **Ativação condicional:** A aba só fica habilitada quando o tipo de contrato é "PJ"
- **Campos obrigatórios para PJ:** CNPJ e Razão Social (indicados com *)
- **Layout responsivo:** Grid com 2 colunas em telas médias/grandes

#### 3.2. Campos do Formulário

**Seção: Dados Básicos da Empresa**
- CNPJ * (com máscara e validação)
- Razão Social *
- Nome Fantasia
- Inscrição Estadual
- Inscrição Municipal
- E-mail da Empresa (com validação de formato)
- Telefone da Empresa (com máscara)

**Seção: Endereço da Empresa**
- CEP (com busca automática via ViaCEP)
- Logradouro (auto-preenchido)
- Número
- Complemento
- Bairro (auto-preenchido)
- Cidade (auto-preenchida)
- Estado (auto-preenchido)

#### 3.3. Novos Handlers

- `handleCompanyDocumentChange` - Aplica máscara de CNPJ
- `handleCompanyPhoneChange` - Aplica máscara de telefone
- `handleCompanyCEPChange` - Aplica máscara e busca endereço via ViaCEP

#### 3.4. Validações Implementadas

**Validações gerais (todos os tipos):**
- ✅ Campos obrigatórios básicos
- ✅ CPF válido
- ✅ E-mail válido (se preenchido)

**Validações específicas para PJ:**
- ✅ CNPJ obrigatório para PJ
- ✅ Razão Social obrigatória para PJ
- ✅ CNPJ válido (algoritmo de dígitos verificadores)
- ✅ E-mail da empresa válido (se preenchido)

#### 3.5. Mensagens de Toast

- ✅ "Dados da empresa obrigatórios" - quando PJ sem CNPJ/Razão Social
- ✅ "CNPJ inválido" - quando CNPJ não passa na validação
- ✅ "E-mail da empresa inválido" - quando e-mail tem formato incorreto
- ✅ "CEP da empresa encontrado" - quando endereço é preenchido automaticamente

## Fluxo de Uso

### Cadastro de Colaborador CLT (Padrão)
1. Preencher Dados Pessoais
2. Preencher Endereço
3. Preencher Dados Profissionais (selecionar tipo "CLT")
4. Preencher Dados Bancários
5. Salvar

### Cadastro de Colaborador PJ
1. Preencher Dados Pessoais
2. Preencher Endereço
3. Preencher Dados Profissionais (selecionar tipo "PJ") ⭐
4. **A aba "Dados da Empresa" é habilitada** ⭐
5. Preencher Dados Bancários
6. **Preencher Dados da Empresa (obrigatório)** ⭐
   - CNPJ * (com máscara automática)
   - Razão Social *
   - Demais campos opcionais
   - CEP com auto-preenchimento
7. Salvar

## Exemplo de Payload da API

```json
{
  "costCenterId": "uuid-do-centro-custo",
  "name": "Maria Consultoria LTDA",
  "cpf": "98765432100",
  "position": "Consultor Senior",
  "department": "Consultoria",
  "admissionDate": "2023-01-15",
  "contractType": "PJ",
  "salary": 15000.00,
  "companyDocument": "12345678000190",
  "companyName": "Maria Consultoria LTDA",
  "companyTradeName": "Maria Consulting",
  "companyStateRegistration": "123456789",
  "companyMunicipalRegistration": "987654",
  "companyEmail": "contato@mariaconsulting.com",
  "companyPhone": "1133334444",
  "companyZipCode": "01310100",
  "companyStreet": "Av Paulista",
  "companyNumber": "2000",
  "companyComplement": "Sala 501",
  "companyNeighborhood": "Bela Vista",
  "companyCity": "São Paulo",
  "companyState": "SP",
  "bankCode": "001",
  "bankName": "Banco do Brasil",
  "agency": "1234",
  "account": "123456-7",
  "accountType": "CORRENTE",
  "pixKey": "12345678000190",
  "notes": "Empresa especializada em consultoria de TI"
}
```

## Interface Visual

### TabsList
```
[Dados Pessoais] [Endereço] [Dados Profissionais] [Dados Bancários] [Dados da Empresa *]
                                                                      ↑ Desabilitada se não for PJ
```

### Aba "Dados da Empresa" (quando PJ)

```
┌─────────────────────────────────────────────────────────────────┐
│ ℹ️ Preencha os dados da empresa para colaboradores com tipo de  │
│    contrato PJ (Pessoa Jurídica).                               │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────┬──────────────────────────┐
│ CNPJ da Empresa *        │ Razão Social *           │
│ 12.345.678/0001-90       │ Maria Consultoria LTDA   │
├──────────────────────────┼──────────────────────────┤
│ Nome Fantasia            │ Inscrição Estadual       │
│ Maria Consulting         │ 123456789                │
├──────────────────────────┼──────────────────────────┤
│ Inscrição Municipal      │ E-mail da Empresa        │
│ 987654                   │ contato@empresa.com      │
├──────────────────────────┼──────────────────────────┤
│ Telefone da Empresa      │                          │
│ (11) 3333-4444          │                          │
└──────────────────────────┴──────────────────────────┘

Endereço da Empresa
────────────────────────────────────────────────────────

┌──────────────────────────┬──────────────────────────┐
│ CEP                      │ Logradouro               │
│ 01310-100 [Auto-fill]    │ Av Paulista              │
├──────────────────────────┼──────────────────────────┤
│ Número                   │ Complemento              │
│ 2000                     │ Sala 501                 │
├──────────────────────────┼──────────────────────────┤
│ Bairro                   │ Cidade                   │
│ Bela Vista               │ São Paulo                │
├──────────────────────────┼──────────────────────────┤
│ Estado                   │                          │
│ SP                       │                          │
└──────────────────────────┴──────────────────────────┘
```

## Tecnologias Utilizadas

- **React Hooks:** useState, useEffect
- **Next.js 14:** App Router, Client Components
- **TypeScript:** Tipagem forte para todos os campos
- **Máscaras:** maskCNPJ, maskPhone, maskCEP
- **Validações:** validateCNPJ, validateEmail
- **API Externa:** ViaCEP para busca automática de endereço
- **UI Components:** shadcn/ui (Tabs, Input, Label, Select, Button)
- **Toast Notifications:** Feedback visual para todas as ações

## Próximos Passos Sugeridos

1. ✅ Cadastro de colaboradores PJ - **CONCLUÍDO**
2. 🔄 Visualização de dados da empresa na página de detalhes do colaborador
3. 🔄 Edição de dados da empresa em colaboradores PJ existentes
4. 🔄 Relatórios específicos para colaboradores PJ
5. 🔄 Filtros por tipo de contrato na listagem
6. 🔄 Dashboard com estatísticas separadas CLT vs PJ

## Observações Importantes

- A aba "Dados da Empresa" só aparece **habilitada** quando o tipo de contrato selecionado é "PJ"
- Se o usuário mudar o tipo de contrato de "PJ" para outro tipo, a aba será **desabilitada**
- Os dados da empresa são **opcionais** para outros tipos de contrato (CLT, Estágio, etc)
- O CNPJ e Razão Social são **obrigatórios** apenas quando o tipo de contrato é "PJ"
- A busca automática de CEP funciona tanto para o endereço do colaborador quanto para o endereço da empresa
- Todas as máscaras são removidas antes do envio para a API (apenas números são enviados)
- O sistema valida o CNPJ usando o algoritmo oficial de dígitos verificadores

## Testes Recomendados

### Teste 1: Cadastro PJ Completo
1. Acessar `/dashboard/rh/colaboradores/novo`
2. Preencher dados pessoais
3. Selecionar tipo de contrato "PJ" na aba Dados Profissionais
4. Verificar que a aba "Dados da Empresa" foi habilitada
5. Preencher CNPJ e Razão Social (obrigatórios)
6. Preencher CEP e verificar auto-preenchimento
7. Salvar e verificar sucesso

### Teste 2: Validação de CNPJ
1. Tentar salvar colaborador PJ sem CNPJ → Deve exibir erro
2. Inserir CNPJ inválido (ex: 11111111111111) → Deve exibir erro
3. Inserir CNPJ válido → Deve permitir salvar

### Teste 3: Mudança de Tipo de Contrato
1. Selecionar tipo "PJ" → Aba da empresa habilitada
2. Preencher dados da empresa
3. Mudar para tipo "CLT" → Aba da empresa desabilitada
4. Voltar para "PJ" → Aba habilitada novamente (dados preservados)

### Teste 4: CEP da Empresa
1. Selecionar tipo "PJ"
2. Na aba Dados da Empresa, inserir CEP válido
3. Verificar que logradouro, bairro, cidade e estado são preenchidos automaticamente
4. Inserir CEP inválido → Deve exibir mensagem de erro

---

**Data de Implementação:** 8 de novembro de 2025  
**Módulo:** RH - Colaboradores  
**Status:** ✅ Implementado e Funcional
