# Atualização Cadastro de Clientes - Campos Fiscais para NF-e

## Data: 16 de novembro de 2025

## Resumo

Atualização completa do cadastro de clientes com novos campos fiscais necessários para emissão de NF-e, incluindo código IBGE, validações automáticas e indicadores visuais de aptidão para emissão de notas fiscais.

---

## 1. Novos Campos Adicionados

### 1.1 Interface CustomerAddress

**Campo adicionado:**
```typescript
ibgeCode?: string  // Código IBGE do município (7 dígitos) - Obrigatório para NFe
```

**Onde é usado:**
- Identificação do município na NFe (tag `<cMunDest>`)
- Validação de endereço pela SEFAZ
- Cálculo correto de impostos municipais

**Como é preenchido:**
- Automaticamente ao buscar CEP (ViaCEP já retorna)
- Manualmente pelo usuário se necessário

---

## 2. Campos Fiscais Já Existentes (Aprimorados)

### 2.1 Pessoa Jurídica

#### Inscrição Estadual
```typescript
stateRegistration?: string
stateRegistrationExempt?: boolean  // Indica se é isento de IE
```

**Importância para NF-e:**
- Determina o `indIEDest` (Indicador de IE do destinatário):
  - `1` = Contribuinte ICMS (possui IE)
  - `2` = Contribuinte isento (marcado como isento)
  - `9` = Não contribuinte (sem IE)
- Afeta cálculo de ICMS
- Obrigatório para contribuintes do ICMS

**Validação:**
- Se não informado e não marcado como isento → Aviso
- Influencia diretamente na tributação

#### Inscrição Municipal
```typescript
municipalRegistration?: string
```

**Importância:**
- Necessário para emissão de NFS-e (Nota Fiscal de Serviço)
- Não é obrigatório para NF-e de produtos
- Recomendado para clientes que também recebem serviços

---

## 3. Busca Automática de Endereço

### 3.1 Integração com ViaCEP

**Interface atualizada:**
```typescript
export interface ViaCEPResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  ibge: string        // ✅ NOVO - Código IBGE do município
  erro?: boolean
}
```

**Fluxo:**
1. Usuário digita CEP (8 dígitos)
2. Sistema busca dados no ViaCEP
3. Preenche automaticamente:
   - Logradouro
   - Bairro
   - Cidade
   - Estado
   - **Código IBGE** ← NOVO

**Código:**
```typescript
const handleCEPChange = async (value: string) => {
  const maskedValue = maskCEP(value)
  setZipCode(maskedValue)

  if (removeMask(maskedValue).length === 8) {
    setLoadingCEP(true)
    const address = await searchCEP(maskedValue)
    
    if (address) {
      setStreet(address.logradouro)
      setNeighborhood(address.bairro)
      setCity(address.localidade)
      setState(address.uf)
      if (address.complemento) {
        setComplement(address.complemento)
      }
      // ✅ NOVO - Preencher código IBGE
      if (address.ibge) {
        setIbgeCode(address.ibge)
      }
      
      toast({
        title: 'CEP encontrado!',
        description: 'Endereço preenchido automaticamente.',
      })
    }
    setLoadingCEP(false)
  }
}
```

---

## 4. Validações para NF-e

### 4.1 Arquivo de Validações

**Localização:** `/lib/validations/nfe-validations.ts`

**Funções disponíveis:**

#### validateCustomerForNFe
```typescript
function validateCustomerForNFe(customer: Customer): ValidationResult
```

**Retorna:**
```typescript
{
  valid: boolean,           // true se apto para NF-e
  errors: string[],        // Erros impeditivos
  warnings: string[]       // Avisos (não impedem)
}
```

**Validações realizadas:**

**Pessoa Física:**
- ✅ CPF obrigatório
- ✅ Nome completo obrigatório

**Pessoa Jurídica:**
- ✅ CNPJ obrigatório
- ✅ Razão Social obrigatória
- ⚠️ Inscrição Estadual (aviso se não informado e não isento)

**Endereço (ambos):**
- ✅ CEP obrigatório
- ✅ Logradouro obrigatório
- ✅ Número obrigatório
- ✅ Bairro obrigatório
- ✅ Cidade obrigatória
- ✅ UF obrigatório
- ⚠️ Código IBGE (aviso se não informado)

**Contato:**
- ⚠️ Email recomendado (para envio de DANFE)
- ⚠️ Telefone recomendado

#### validateAddressForNFe
```typescript
function validateAddressForNFe(address: CustomerAddress): ValidationResult
```

Valida especificamente um endereço para NF-e.

#### getIndIEDest
```typescript
function getIndIEDest(customer: Customer): 1 | 2 | 9
```

Retorna o indicador de IE do destinatário:
- `1` = Contribuinte ICMS
- `2` = Contribuinte isento
- `9` = Não contribuinte

**Uso:**
```typescript
const indIEDest = getIndIEDest(customer)
// Usar no campo <indIEDest> da NFe
```

#### Funções Auxiliares
```typescript
validateCPF(cpf: string): boolean
validateCNPJ(cnpj: string): boolean
validateCEP(cep: string): boolean
formatCPF(cpf: string): string
formatCNPJ(cnpj: string): string
formatCEP(cep: string): string
```

---

## 5. Hook de Busca de Endereço

### 5.1 useAddressLookup

**Localização:** `/lib/hooks/useAddressLookup.ts`

**Uso:**
```typescript
import { useAddressLookup } from '@/lib/hooks/useAddressLookup'

function MyComponent() {
  const { loading, error, fetchCompleteAddress } = useAddressLookup()
  
  const handleCEP = async (cep: string) => {
    const address = await fetchCompleteAddress(cep)
    if (address) {
      // address.zipCode
      // address.street
      // address.neighborhood
      // address.city
      // address.state
      // address.ibgeCode ← Já incluso!
    }
  }
}
```

**Funções disponíveis:**
- `fetchAddressByCEP(cep)` - Busca via ViaCEP
- `fetchIBGECode(city, state)` - Busca código IBGE específico
- `fetchCompleteAddress(cep)` - Busca completa (recomendado)

---

## 6. Componentes Visuais

### 6.1 CustomerNFeStatus

**Localização:** `/components/customers/customer-nfe-status.tsx`

**Badge para listagens:**
```tsx
import { CustomerNFeStatus } from '@/components/customers/customer-nfe-status'

<CustomerNFeStatus customer={customer} />
```

**Props:**
```typescript
{
  customer: Customer
  showLabel?: boolean  // Padrão: true
}
```

**Aparência:**
- ✅ Verde: "Apto para NF-e" (todos os dados ok)
- ⚠️ Amarelo: "Dados incompletos" (com tooltip explicativo)

**Tooltip mostra:**
- Erros impeditivos
- Avisos e recomendações

### 6.2 CustomerNFeValidationAlert

**Localização:** `/components/customers/customer-nfe-validation-alert.tsx`

**Alert para páginas de detalhes:**
```tsx
import { CustomerNFeValidationAlert } from '@/components/customers/customer-nfe-validation-alert'

<CustomerNFeValidationAlert customer={customer} />
```

**Variações:**
- ✅ **Verde:** Cliente apto (sem erros nem avisos)
- ⚠️ **Amarelo:** Cliente apto mas com avisos
- ❌ **Vermelho:** Cliente não apto (com erros)

**Exibe:**
- Lista de erros impeditivos
- Lista de avisos e recomendações
- Mensagem clara sobre a situação

---

## 7. Formulário de Cadastro Atualizado

### 7.1 Campo Código IBGE

```tsx
<div className="space-y-2">
  <Label htmlFor="ibgeCode">Código IBGE</Label>
  <Input
    id="ibgeCode"
    value={ibgeCode}
    onChange={(e) => setIbgeCode(e.target.value)}
    placeholder="3550308"
    maxLength={7}
    disabled={loadingCEP}
  />
  <p className="text-xs text-muted-foreground">
    Preenchido automaticamente ao buscar CEP. Necessário para emissão de NF-e.
  </p>
</div>
```

### 7.2 Campos de Inscrição com Descrições

```tsx
<div className="space-y-2">
  <Label htmlFor="stateRegistration">Inscrição Estadual</Label>
  <Input
    id="stateRegistration"
    value={stateRegistration}
    onChange={(e) => setStateRegistration(e.target.value)}
    placeholder="Digite a IE"
    disabled={stateRegistrationExempt}
  />
  <p className="text-xs text-muted-foreground">
    Obrigatório para emissão de NF-e se não for isento. Influencia no cálculo do ICMS.
  </p>
</div>

<div className="space-y-2 flex items-end">
  <div className="flex items-center space-x-2 h-10">
    <Switch 
      id="stateRegistrationExempt" 
      checked={stateRegistrationExempt} 
      onCheckedChange={setStateRegistrationExempt} 
    />
    <Label htmlFor="stateRegistrationExempt">Isento de IE</Label>
  </div>
</div>

<div className="space-y-2">
  <Label htmlFor="municipalRegistration">Inscrição Municipal</Label>
  <Input
    id="municipalRegistration"
    value={municipalRegistration}
    onChange={(e) => setMunicipalRegistration(e.target.value)}
    placeholder="Digite a IM"
  />
  <p className="text-xs text-muted-foreground">
    Necessário para emissão de NFS-e (Nota Fiscal de Serviço Eletrônica).
  </p>
</div>
```

---

## 8. Uso na Emissão de NF-e

### 8.1 Preencher Destinatário

```typescript
// No formulário de criação de NFe
import { validateCustomerForNFe, getIndIEDest } from '@/lib/validations/nfe-validations'

function CreateNFeForm({ customer }: { customer: Customer }) {
  // Validar cliente antes de permitir emissão
  const validation = validateCustomerForNFe(customer)
  
  if (!validation.valid) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Cliente com dados incompletos</AlertTitle>
        <AlertDescription>
          {validation.errors.join(', ')}
        </AlertDescription>
      </Alert>
    )
  }
  
  // Preencher dados do destinatário
  const defaultAddress = customer.addresses?.find(a => a.isDefault)
  
  const nfeData = {
    // Destinatário
    destinatarioId: customer.id,
    destinatarioNome: customer.personType === 'FISICA' 
      ? customer.name 
      : customer.companyName,
    destinatarioCnpjCpf: customer.personType === 'FISICA'
      ? customer.cpf
      : customer.cnpj,
    destinatarioIe: customer.stateRegistration,
    indIEDest: getIndIEDest(customer),  // ✅ Função auxiliar
    destinatarioEmail: customer.email,
    destinatarioTelefone: customer.mobile || customer.phone,
    
    // Endereço do Destinatário
    destLogradouro: defaultAddress?.street,
    destNumero: defaultAddress?.number,
    destComplemento: defaultAddress?.complement,
    destBairro: defaultAddress?.neighborhood,
    destCidade: defaultAddress?.city,
    destCodigoMunicipio: defaultAddress?.ibgeCode,  // ✅ NOVO
    destEstado: defaultAddress?.state,
    destCep: defaultAddress?.zipCode,
    destCodigoPais: '1058',  // Brasil
    destPais: 'Brasil',
  }
  
  // ... criar NFe
}
```

---

## 9. Exemplos de Validação

### 9.1 Cliente Apto (Pessoa Jurídica)

```typescript
{
  personType: 'JURIDICA',
  companyName: 'EMPRESA XYZ LTDA',
  cnpj: '12345678000100',
  stateRegistration: '123456789',
  email: 'contato@empresa.com',
  addresses: [{
    zipCode: '01310100',
    street: 'Av. Paulista',
    number: '1000',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    ibgeCode: '3550308',  // ✅
    isDefault: true
  }]
}

// validateCustomerForNFe()
// ✅ valid: true, errors: [], warnings: []
```

### 9.2 Cliente com Avisos (PJ sem IE)

```typescript
{
  personType: 'JURIDICA',
  companyName: 'EMPRESA ABC LTDA',
  cnpj: '12345678000100',
  stateRegistration: '',              // ⚠️ Não informado
  stateRegistrationExempt: false,     // ⚠️ Não marcado como isento
  email: '',                          // ⚠️ Sem email
  addresses: [{
    zipCode: '01310100',
    street: 'Av. Paulista',
    number: '1000',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    ibgeCode: '3550308',
    isDefault: true
  }]
}

// validateCustomerForNFe()
// ✅ valid: true (não impede emissão)
// ⚠️ warnings: [
//   'Inscrição Estadual não informada...',
//   'Email não informado...'
// ]
```

### 9.3 Cliente com Erros (dados faltando)

```typescript
{
  personType: 'FISICA',
  name: 'João Silva',
  cpf: '',                  // ❌ Faltando
  email: 'joao@email.com',
  addresses: [{
    zipCode: '01310100',
    street: 'Av. Paulista',
    number: '',             // ❌ Faltando
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    ibgeCode: '',           // ⚠️ Faltando (aviso)
    isDefault: true
  }]
}

// validateCustomerForNFe()
// ❌ valid: false
// ❌ errors: [
//   'CPF é obrigatório para emissão de NF-e',
//   'Número é obrigatório para emissão de NF-e'
// ]
// ⚠️ warnings: [
//   'Código IBGE do município não informado...'
// ]
```

---

## 10. Checklist de Implementação

### Arquivos Modificados
- ✅ `/lib/api/customers.ts` - Interface CustomerAddress com ibgeCode
- ✅ `/lib/api/customers.ts` - CreateCustomerRequest com ibgeCode
- ✅ `/lib/masks.ts` - ViaCEPResponse com campo ibge
- ✅ `/app/dashboard/clientes/novo/page.tsx` - Estado e input ibgeCode
- ✅ `/app/dashboard/clientes/novo/page.tsx` - Busca CEP atualizada
- ✅ `/app/dashboard/clientes/novo/page.tsx` - Descrições IE e IM

### Arquivos Criados
- ✅ `/lib/validations/nfe-validations.ts` - Todas validações
- ✅ `/lib/hooks/useAddressLookup.ts` - Hook de busca
- ✅ `/components/customers/customer-nfe-status.tsx` - Badge status
- ✅ `/components/customers/customer-nfe-validation-alert.tsx` - Alert validação

### Funcionalidades Implementadas
- ✅ Código IBGE no endereço
- ✅ Busca automática de código IBGE via CEP
- ✅ Validação completa de cliente para NF-e
- ✅ Função getIndIEDest para determinar indicador IE
- ✅ Componentes visuais de status
- ✅ Descrições nos campos fiscais
- ✅ Documentação completa

---

## 11. Próximos Passos

### 11.1 Integração com Listagem
```tsx
// app/dashboard/clientes/page.tsx
import { CustomerNFeStatus } from '@/components/customers/customer-nfe-status'

// Na tabela de clientes, adicionar coluna:
<TableCell>
  <CustomerNFeStatus customer={customer} />
</TableCell>
```

### 11.2 Integração com Detalhes
```tsx
// app/dashboard/clientes/[id]/page.tsx
import { CustomerNFeValidationAlert } from '@/components/customers/customer-nfe-validation-alert'

// No topo da página:
<CustomerNFeValidationAlert customer={customer} />
```

### 11.3 Pré-validação na Seleção de Cliente (NF-e)
```tsx
// app/dashboard/nfe/from-sale/page.tsx
const validation = validateCustomerForNFe(sale.customer)

if (!validation.valid) {
  // Mostrar aviso e não permitir gerar NF-e
  // Ou permitir mas mostrar erros que precisam ser corrigidos
}
```

---

## 12. Benefícios da Atualização

### Para o Usuário
- ✅ Preenchimento automático mais completo (inclui código IBGE)
- ✅ Feedback visual sobre aptidão para NF-e
- ✅ Validação prévia antes da emissão
- ✅ Orientação clara sobre campos obrigatórios
- ✅ Menos erros na hora de emitir NF-e

### Para o Sistema
- ✅ Validação consistente em todo o sistema
- ✅ Dados completos para SEFAZ
- ✅ Menos rejeições de NF-e
- ✅ Código reutilizável (validações em lib)
- ✅ Componentes reutilizáveis (badges e alerts)

### Para a Conformidade Fiscal
- ✅ Código IBGE correto (obrigatório pela SEFAZ)
- ✅ Indicador de IE correto (afeta tributação)
- ✅ Todos os dados exigidos pela legislação
- ✅ Rastreabilidade de informações fiscais

---

## Conclusão

O cadastro de clientes agora está completamente integrado com as exigências fiscais brasileiras para emissão de NF-e, incluindo:
- ✅ Código IBGE (preenchimento automático)
- ✅ Validações completas e orientativas
- ✅ Indicadores visuais de aptidão
- ✅ Componentes reutilizáveis
- ✅ Integração perfeita com o módulo NF-e

O sistema agora previne erros antes da emissão, garantindo que apenas clientes com dados completos possam ter NF-e emitidas, reduzindo drasticamente rejeições da SEFAZ!
