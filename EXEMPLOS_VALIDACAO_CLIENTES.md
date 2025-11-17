# 💡 Exemplos Práticos - Validação de Clientes para NF-e

## Cenários Reais de Uso

---

## 1️⃣ Validar Cliente Antes de Emitir NF-e

### Cenário
Usuário está criando uma NF-e a partir de uma venda e precisa validar se o cliente tem todos os dados.

### Código
```typescript
import { validateCustomerForNFe } from '@/lib/validations/nfe-validations'

function CreateNFeFromSale({ sale }: { sale: Sale }) {
  const customer = sale.customer
  const validation = validateCustomerForNFe(customer)

  // Se cliente não está apto, mostrar erros
  if (!validation.valid) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Cliente com dados incompletos</AlertTitle>
        <AlertDescription>
          <p className="mb-2">
            Não é possível emitir NF-e para este cliente. Corrija os seguintes problemas:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            {validation.errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
          <Button 
            className="mt-4" 
            onClick={() => router.push(`/dashboard/clientes/${customer.id}`)}
          >
            Editar Cliente
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  // Se tem avisos, mostrar mas permitir continuar
  if (validation.warnings.length > 0) {
    return (
      <Alert className="border-amber-500 bg-amber-50 mb-4">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Avisos</AlertTitle>
        <AlertDescription className="text-amber-700">
          <ul className="list-disc pl-5">
            {validation.warnings.map((warning, i) => (
              <li key={i}>{warning}</li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    )
  }

  // Cliente ok, mostrar formulário de NF-e
  return <NFeForm customer={customer} sale={sale} />
}
```

---

## 2️⃣ Mostrar Status na Lista de Clientes

### Cenário
Na listagem de clientes, mostrar badge indicando se está apto para NF-e.

### Código
```typescript
import { CustomerNFeStatus } from '@/components/customers/customer-nfe-status'

function CustomersTable({ customers }: { customers: Customer[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome/Razão Social</TableHead>
          <TableHead>Documento</TableHead>
          <TableHead>Cidade</TableHead>
          <TableHead>Status NF-e</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell>
              {customer.personType === 'FISICA' 
                ? customer.name 
                : customer.companyName
              }
            </TableCell>
            <TableCell>
              {customer.personType === 'FISICA' 
                ? formatCPF(customer.cpf || '') 
                : formatCNPJ(customer.cnpj || '')
              }
            </TableCell>
            <TableCell>
              {customer.addresses?.find(a => a.isDefault)?.city || '-'}
            </TableCell>
            <TableCell>
              {/* Badge de status para NF-e */}
              <CustomerNFeStatus customer={customer} />
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="sm">Ver</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

---

## 3️⃣ Alert na Página de Detalhes

### Cenário
Na página de detalhes do cliente, mostrar alert grande com validação completa.

### Código
```typescript
import { CustomerNFeValidationAlert } from '@/components/customers/customer-nfe-validation-alert'

export default function CustomerDetailsPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const [customer, setCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    async function loadCustomer() {
      const data = await customersApi.getById(params.id)
      setCustomer(data)
    }
    loadCustomer()
  }, [params.id])

  if (!customer) return <Loading />

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {customer.personType === 'FISICA' 
              ? customer.name 
              : customer.companyName
            }
          </h1>
          <Button>Editar Cliente</Button>
        </div>

        {/* Alert de validação para NF-e */}
        <CustomerNFeValidationAlert customer={customer} />

        {/* Resto da página... */}
        <Card>
          <CardHeader>
            <CardTitle>Dados Cadastrais</CardTitle>
          </CardHeader>
          <CardContent>
            {/* ... */}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
```

---

## 4️⃣ Preencher Destinatário da NF-e

### Cenário
Ao criar NF-e, usar dados do cliente validado para preencher destinatário automaticamente.

### Código
```typescript
import { validateCustomerForNFe, getIndIEDest } from '@/lib/validations/nfe-validations'

async function createNFeFromCustomer(
  customer: Customer, 
  items: NFeItem[]
) {
  // 1. Validar cliente
  const validation = validateCustomerForNFe(customer)
  if (!validation.valid) {
    throw new Error('Cliente com dados incompletos')
  }

  // 2. Pegar endereço padrão
  const address = customer.addresses?.find(a => a.isDefault)
  if (!address) {
    throw new Error('Cliente sem endereço padrão')
  }

  // 3. Determinar indicador de IE
  const indIEDest = getIndIEDest(customer)

  // 4. Montar dados da NFe
  const nfeData = {
    // Tipo de operação
    tipoOperacao: 1, // Saída
    finalidade: 1,   // Normal
    naturezaOperacao: 'VENDA',

    // DESTINATÁRIO
    destinatarioId: customer.id,
    destinatarioNome: customer.personType === 'FISICA' 
      ? customer.name 
      : customer.companyName,
    destinatarioCnpjCpf: customer.personType === 'FISICA' 
      ? customer.cpf 
      : customer.cnpj,
    destinatarioIe: customer.stateRegistration || undefined,
    indIEDest: indIEDest,  // ✅ 1, 2 ou 9
    destinatarioEmail: customer.email,
    destinatarioTelefone: customer.mobile || customer.phone,

    // ENDEREÇO DO DESTINATÁRIO
    destLogradouro: address.street,
    destNumero: address.number,
    destComplemento: address.complement,
    destBairro: address.neighborhood,
    destCidade: address.city,
    destCodigoMunicipio: address.ibgeCode,  // ✅ Código IBGE
    destEstado: address.state,
    destCep: address.zipCode,
    destCodigoPais: '1058',  // Brasil
    destPais: 'Brasil',

    // ITENS
    items: items,

    // TOTAIS (calcular dos itens)
    valorProdutos: items.reduce((sum, item) => sum + item.valorProduto, 0),
    valorTotal: items.reduce((sum, item) => sum + item.valorProduto, 0),
    // ... outros totais
  }

  // 5. Criar NFe
  const nfe = await nfeApi.createNFe(nfeData)
  return nfe
}
```

---

## 5️⃣ Buscar CEP com Código IBGE

### Cenário
No formulário de cadastro, buscar CEP e preencher automaticamente incluindo código IBGE.

### Código
```typescript
import { useAddressLookup } from '@/lib/hooks/useAddressLookup'

function CustomerAddressForm() {
  const [zipCode, setZipCode] = useState('')
  const [street, setStreet] = useState('')
  const [number, setNumber] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [ibgeCode, setIbgeCode] = useState('')

  const { loading, error, fetchCompleteAddress } = useAddressLookup()

  const handleCEPBlur = async () => {
    if (zipCode.replace(/\D/g, '').length !== 8) return

    const address = await fetchCompleteAddress(zipCode)
    
    if (address) {
      setStreet(address.street)
      setNeighborhood(address.neighborhood)
      setCity(address.city)
      setState(address.state)
      setIbgeCode(address.ibgeCode)  // ✅ Preenchido automaticamente

      toast({
        title: 'CEP encontrado!',
        description: 'Endereço e código IBGE preenchidos automaticamente.',
      })
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="zipCode">CEP</Label>
        <Input
          id="zipCode"
          value={zipCode}
          onChange={(e) => setZipCode(maskCEP(e.target.value))}
          onBlur={handleCEPBlur}
          placeholder="00000-000"
          maxLength={9}
          disabled={loading}
        />
        {loading && <p className="text-xs text-muted-foreground">Buscando...</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      <div>
        <Label htmlFor="street">Logradouro</Label>
        <Input
          id="street"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          placeholder="Rua, Avenida, etc."
        />
      </div>

      {/* ... outros campos ... */}

      <div>
        <Label htmlFor="ibgeCode">Código IBGE</Label>
        <Input
          id="ibgeCode"
          value={ibgeCode}
          onChange={(e) => setIbgeCode(e.target.value)}
          placeholder="3550308"
          maxLength={7}
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground">
          ✅ Preenchido automaticamente ao buscar CEP
        </p>
      </div>
    </div>
  )
}
```

---

## 6️⃣ Filtrar Clientes Aptos para NF-e

### Cenário
Criar uma lista apenas com clientes aptos para emissão de NF-e.

### Código
```typescript
import { validateCustomerForNFe } from '@/lib/validations/nfe-validations'

function AptCustomersForNFe({ customers }: { customers: Customer[] }) {
  // Filtrar apenas clientes válidos
  const aptCustomers = customers.filter((customer) => {
    const validation = validateCustomerForNFe(customer)
    return validation.valid
  })

  // Separar os com avisos
  const customersWithWarnings = aptCustomers.filter((customer) => {
    const validation = validateCustomerForNFe(customer)
    return validation.warnings.length > 0
  })

  // Perfeitos (sem avisos)
  const perfectCustomers = aptCustomers.filter((customer) => {
    const validation = validateCustomerForNFe(customer)
    return validation.warnings.length === 0
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Clientes Perfeitos ({perfectCustomers.length})
          </CardTitle>
          <CardDescription>
            Sem erros nem avisos - prontos para NF-e
          </CardDescription>
        </CardHeader>
        <CardContent>
          {perfectCustomers.map((customer) => (
            <div key={customer.id} className="border-b py-2">
              {customer.personType === 'FISICA' 
                ? customer.name 
                : customer.companyName
              }
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Clientes com Avisos ({customersWithWarnings.length})
          </CardTitle>
          <CardDescription>
            Aptos mas com dados recomendados faltando
          </CardDescription>
        </CardHeader>
        <CardContent>
          {customersWithWarnings.map((customer) => (
            <div key={customer.id} className="border-b py-2">
              {customer.personType === 'FISICA' 
                ? customer.name 
                : customer.companyName
              }
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            Clientes Não Aptos ({customers.length - aptCustomers.length})
          </CardTitle>
          <CardDescription>
            Com erros impeditivos - não podem emitir NF-e
          </CardDescription>
        </CardHeader>
        <CardContent>
          {customers
            .filter((c) => !validateCustomerForNFe(c).valid)
            .map((customer) => {
              const validation = validateCustomerForNFe(customer)
              return (
                <div key={customer.id} className="border-b py-2">
                  <p className="font-medium">
                    {customer.personType === 'FISICA' 
                      ? customer.name 
                      : customer.companyName
                    }
                  </p>
                  <ul className="text-xs text-red-600 list-disc pl-5">
                    {validation.errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )
            })}
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 7️⃣ Dashboard de Qualidade de Dados

### Cenário
Criar dashboard mostrando estatísticas de qualidade dos dados dos clientes.

### Código
```typescript
import { validateCustomerForNFe } from '@/lib/validations/nfe-validations'

function CustomerDataQualityDashboard({ customers }: { customers: Customer[] }) {
  const stats = customers.reduce(
    (acc, customer) => {
      const validation = validateCustomerForNFe(customer)
      
      if (validation.valid) {
        if (validation.warnings.length === 0) {
          acc.perfect++
        } else {
          acc.withWarnings++
        }
      } else {
        acc.invalid++
      }
      
      return acc
    },
    { perfect: 0, withWarnings: 0, invalid: 0 }
  )

  const total = customers.length
  const aptPercentage = ((stats.perfect + stats.withWarnings) / total) * 100
  const perfectPercentage = (stats.perfect / total) * 100

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Total de Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{total}</p>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            Perfeitos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-600">{stats.perfect}</p>
          <p className="text-xs text-green-700">
            {perfectPercentage.toFixed(1)}% do total
          </p>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            Com Avisos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-amber-600">
            {stats.withWarnings}
          </p>
          <p className="text-xs text-amber-700">
            {((stats.withWarnings / total) * 100).toFixed(1)}% do total
          </p>
        </CardContent>
      </Card>

      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-600" />
            Não Aptos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-red-600">{stats.invalid}</p>
          <p className="text-xs text-red-700">
            {((stats.invalid / total) * 100).toFixed(1)}% do total
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-4">
        <CardHeader>
          <CardTitle>Taxa de Aptidão para NF-e</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Clientes aptos para emissão de NF-e</span>
              <span className="font-bold">{aptPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={aptPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {stats.perfect + stats.withWarnings} de {total} clientes podem emitir NF-e
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 8️⃣ Sugestão de Correção em Tempo Real

### Cenário
Ao preencher formulário, mostrar quais campos ainda faltam para ficar apto.

### Código
```typescript
import { validateCustomerForNFe } from '@/lib/validations/nfe-validations'

function CustomerFormWithValidation() {
  const [formData, setFormData] = useState<Partial<Customer>>({
    personType: 'JURIDICA',
    companyName: '',
    cnpj: '',
    // ...
  })

  const validation = validateCustomerForNFe(formData as Customer)
  const missingFields = validation.errors.length + validation.warnings.length

  return (
    <form className="space-y-6">
      {/* Indicador de progresso */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Aptidão para NF-e
          </CardTitle>
        </CardHeader>
        <CardContent>
          {validation.valid ? (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">
                Cliente apto!
              </AlertTitle>
              <AlertDescription className="text-green-700">
                Todos os dados obrigatórios foram preenchidos.
                {validation.warnings.length > 0 && (
                  <p className="mt-2">
                    {validation.warnings.length} campo(s) recomendado(s) faltando.
                  </p>
                )}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                {validation.errors.length} campo(s) obrigatório(s) faltando
              </AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {validation.errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Campos do formulário */}
      {/* ... */}
    </form>
  )
}
```

---

## 📌 Resumo dos Imports

```typescript
// Validações
import {
  validateCustomerForNFe,
  validateAddressForNFe,
  getIndIEDest,
  validateCPF,
  validateCNPJ,
  validateCEP,
  formatCPF,
  formatCNPJ,
  formatCEP,
} from '@/lib/validations/nfe-validations'

// Hook
import { useAddressLookup } from '@/lib/hooks/useAddressLookup'

// Componentes
import { CustomerNFeStatus } from '@/components/customers/customer-nfe-status'
import { CustomerNFeValidationAlert } from '@/components/customers/customer-nfe-validation-alert'

// Tipos
import type { Customer, CustomerAddress } from '@/lib/api/customers'
import type { ValidationResult } from '@/lib/validations/nfe-validations'
```

---

## 🎯 Dicas de Implementação

1. **Sempre validar antes de emitir NF-e**
2. **Mostrar badges nas listagens** para feedback visual rápido
3. **Usar alerts nas páginas de detalhes** para informação completa
4. **Permitir edição rápida** com botão direto para formulário
5. **Criar dashboard de qualidade** para gestão dos dados
6. **Validar em tempo real** no formulário para melhor UX

---

Esses exemplos cobrem os casos de uso mais comuns e podem ser adaptados conforme necessário! 🚀
