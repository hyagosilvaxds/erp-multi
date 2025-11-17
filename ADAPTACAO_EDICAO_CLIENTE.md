# Adaptação da Tela de Edição de Cliente ✅

## 📋 Resumo

Instruções para adaptar a tela de edição de cliente (`app/dashboard/clientes/[id]/page.tsx`) para usar o mesmo layout e validações da tela de criação (`app/dashboard/clientes/novo/page.tsx`).

---

## 🎯 Objetivo

Transformar a página de edição para ter:
- ✅ Mesmo layout visual da página de criação
- ✅ Mesmas validações (CPF, CNPJ, CEP, Email, etc.)
- ✅ Mesmas máscaras de formatação
- ✅ Mesma experiência do usuário
- ✅ Busca automática de CEP
- ✅ Busca automática de código IBGE

---

## 📝 Estratégia de Implementação

### Opção 1: Arquivo Único (Recomendado)
Modificar `app/dashboard/clientes/[id]/page.tsx` para seguir a estrutura de `novo/page.tsx`:

1. **Carregar dados do cliente** no `useEffect`
2. **Popular os states** com os dados carregados
3. **Reutilizar toda a estrutura** de formulário e validação
4. **Mudar apenas**:
   - Título da página
   - Função de submit (UPDATE ao invés de CREATE)
   - Botão "Salvar Alterações" ao invés de "Cadastrar Cliente"

### Opção 2: Componente Compartilhado
Criar um componente `CustomerForm` que é usado por ambas as páginas:

```
components/customers/customer-form.tsx
  - Recebe props: mode ('create' | 'edit'), initialData?, onSubmit
  - Contém toda a lógica de formulário
  - Usado por novo/page.tsx e [id]/page.tsx
```

---

## 🔧 Mudanças Principais

### 1. Estrutura do Arquivo

**ANTES** (página de edição atual - 1445 linhas):
- Interface complexa com dialogs separados
- Lógica de edição fragmentada
- Validações básicas ou ausentes

**DEPOIS** (baseado na página de criação - 906 linhas):
- Interface unificada com Tabs
- Todas validações integradas
- Máscaras automáticas
- Busca de CEP e IBGE

### 2. States Necessários

```typescript
// Copiar TODOS os states de novo/page.tsx:
const [personType, setPersonType] = useState<PersonType>('FISICA')
const [name, setName] = useState('')
const [cpf, setCpf] = useState('')
// ... todos os outros states
```

### 3. useEffect para Carregar Dados

```typescript
useEffect(() => {
  const loadCustomer = async () => {
    if (!params.id) return
    
    try {
      setLoading(true)
      const customer = await customersApi.getById(params.id as string)
      
      // Popular todos os states
      setPersonType(customer.personType)
      setName(customer.name || '')
      setCpf(customer.cpf ? maskCPF(customer.cpf) : '')
      setEmail(customer.email || '')
      // ... todos os outros campos
      
      if (customer.address) {
        setZipCode(customer.address.zipCode ? maskCEP(customer.address.zipCode) : '')
        setStreet(customer.address.street || '')
        // ... outros campos de endereço
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o cliente',
        variant: 'destructive',
      })
      router.push('/dashboard/clientes')
    } finally {
      setLoading(false)
    }
  }
  
  loadCustomer()
}, [params.id])
```

### 4. Função de Submit

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  // MESMAS validações de novo/page.tsx
  if (personType === 'FISICA') {
    if (!name) {
      toast({ title: 'Erro', description: 'Nome é obrigatório', variant: 'destructive' })
      return
    }
    if (!cpf || !validateCPF(cpf)) {
      toast({ title: 'Erro', description: 'CPF inválido', variant: 'destructive' })
      return
    }
  } else {
    if (!companyName) {
      toast({ title: 'Erro', description: 'Razão Social é obrigatória', variant: 'destructive' })
      return
    }
    if (!cnpj || !validateCNPJ(cnpj)) {
      toast({ title: 'Erro', description: 'CNPJ inválido', variant: 'destructive' })
      return
    }
  }
  
  // Email validation
  if (email && !validateEmail(email)) {
    toast({ title: 'Erro', description: 'Email inválido', variant: 'destructive' })
    return
  }
  
  try {
    setLoading(true)
    
    // MESMA estrutura de dados de novo/page.tsx
    const data: any = {
      personType,
      active,
      email: email || undefined,
      phone: phone ? removeMask(phone) : undefined,
      mobile: mobile ? removeMask(mobile) : undefined,
      website: website || undefined,
      creditLimit: creditLimit ? parseFloat(creditLimit) : undefined,
      notes: notes || undefined,
    }
    
    // ... resto da lógica igual a novo/page.tsx
    
    // DIFERENÇA: Usar update ao invés de create
    await customersApi.update(params.id as string, data)
    
    toast({
      title: 'Sucesso',
      description: 'Cliente atualizado com sucesso',
    })
    
    router.push('/dashboard/clientes')
  } catch (error: any) {
    toast({
      title: 'Erro ao atualizar cliente',
      description: error.response?.data?.message || 'Tente novamente',
      variant: 'destructive',
    })
  } finally {
    setLoading(false)
  }
}
```

### 5. Render/JSX

**Copiar TODO o JSX de novo/page.tsx** mudando apenas:

```tsx
// ANTES (novo/page.tsx):
<h1>Novo Cliente</h1>
<Button onClick={handleSubmit}>Cadastrar Cliente</Button>

// DEPOIS (editar):
<h1>Editar Cliente</h1>
<Button onClick={handleSubmit}>Salvar Alterações</Button>
```

---

## ✅ Checklist de Implementação

### Estrutura Base:
- [ ] Copiar imports de novo/page.tsx
- [ ] Copiar todos os states
- [ ] Adicionar useParams() e params.id
- [ ] Criar useEffect para carregar dados
- [ ] Popular states com dados do cliente

### Validações:
- [ ] Copiar todas as funções de validação
- [ ] Copiar handlers com máscaras (handleCPFChange, handleCNPJChange, etc.)
- [ ] Copiar handleCEPChange com busca automática
- [ ] Copiar função de busca de código IBGE

### Formulário:
- [ ] Copiar estrutura de Tabs
- [ ] Copiar todos os campos
- [ ] Copiar layout e organização
- [ ] Ajustar título para "Editar Cliente"
- [ ] Ajustar botão para "Salvar Alterações"

### Submit:
- [ ] Copiar função handleSubmit
- [ ] Trocar customersApi.create por .update(id, data)
- [ ] Manter todas as validações

### Testes:
- [ ] Testar carregamento de cliente
- [ ] Testar edição de pessoa física
- [ ] Testar edição de pessoa jurídica
- [ ] Testar validações (CPF, CNPJ, Email)
- [ ] Testar busca de CEP
- [ ] Testar máscaras
- [ ] Testar salvamento

---

## 🔄 Fluxo Completo

### 1. Página Carrega:
```
useEffect → customersApi.getById(id) → Popular states → Renderizar formulário
```

### 2. Usuário Edita:
```
Campos com máscaras → Validações em tempo real → States atualizados
```

### 3. Usuário Salva:
```
handleSubmit → Validações → Formatar dados → customersApi.update(id, data) → Redirect
```

---

## 📦 Arquivos Envolvidos

### Modificar:
- `app/dashboard/clientes/[id]/page.tsx` - Página de edição

### Referência (não modificar):
- `app/dashboard/clientes/novo/page.tsx` - Página de criação (modelo)

### Dependências:
- `lib/api/customers.ts` - API
- `lib/masks.ts` - Máscaras e validações
- `components/ui/*` - Componentes UI

---

## 📝 Template Simplificado

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
// ... imports iguais a novo/page.tsx

export default function EditCustomerPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)

  // 1. COPIAR TODOS OS STATES DE novo/page.tsx
  const [personType, setPersonType] = useState<PersonType>('FISICA')
  // ... todos os outros

  // 2. CARREGAR DADOS DO CLIENTE
  useEffect(() => {
    const loadCustomer = async () => {
      if (!params.id) return
      try {
        setLoading(true)
        const customer = await customersApi.getById(params.id as string)
        
        // Popular states
        setPersonType(customer.personType)
        setName(customer.name || '')
        // ... todos os campos
        
      } catch (error: any) {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar o cliente',
          variant: 'destructive',
        })
        router.push('/dashboard/clientes')
      } finally {
        setLoading(false)
      }
    }
    
    loadCustomer()
  }, [params.id])

  // 3. COPIAR TODOS OS HANDLERS DE novo/page.tsx
  const handleCPFChange = (value: string) => {
    setCpf(maskCPF(value))
  }
  // ... todos os outros

  // 4. COPIAR FUNÇÃO handleSubmit E TROCAR create POR update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Todas as validações...
    
    try {
      setLoading(true)
      const data = { /* ... mesma estrutura */ }
      
      // DIFERENÇA PRINCIPAL:
      await customersApi.update(params.id as string, data)
      
      toast({
        title: 'Sucesso',
        description: 'Cliente atualizado com sucesso',
      })
      
      router.push('/dashboard/clientes')
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar cliente',
        description: error.response?.data?.message || 'Tente novamente',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // 5. COPIAR TODO O JSX DE novo/page.tsx COM PEQUENOS AJUSTES
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header - MUDAR TÍTULO */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Editar Cliente</h1>
            <p className="text-muted-foreground">
              Atualize os dados do cliente
            </p>
          </div>
        </div>

        {/* Form - COPIAR TODO O FORM de novo/page.tsx */}
        <form onSubmit={handleSubmit}>
          {/* ... todo o conteúdo ... */}
          
          {/* Footer - MUDAR TEXTO DO BOTÃO */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
```

---

## 🎨 Resultado Esperado

### Antes (página atual):
- Interface fragmentada com dialogs
- Validações inconsistentes
- Máscaras ausentes em alguns campos
- CEP sem busca automática

### Depois (nova página):
- Interface limpa com Tabs (igual à criação)
- Todas validações aplicadas
- Todas máscaras funcionando
- CEP com busca automática
- Código IBGE automático
- Experiência consistente

---

## ⚠️ Avisos Importantes

1. **Backup**: Um backup foi criado em `page.tsx.backup`
2. **Testagem**: Teste todas as funcionalidades após a mudança
3. **Validações**: Não remova nenhuma validação
4. **Máscaras**: Garanta que todas as máscaras estejam aplicadas
5. **API**: Certifique-se que `customersApi.update()` funciona corretamente

---

## 🚀 Próximos Passos

1. Implementar a mudança conforme o template
2. Testar com cliente pessoa física
3. Testar com cliente pessoa jurídica
4. Verificar todas as validações
5. Testar busca de CEP e IBGE
6. Confirmar salvamento correto

---

**Data**: 16 de novembro de 2025
**Status**: 📋 Documentado (Aguardando Implementação)
**Backup**: ✅ Criado em `page.tsx.backup`
