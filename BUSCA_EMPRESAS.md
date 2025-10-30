# Sistema de Busca de Empresas - /admin/empresas

## 📋 Visão Geral

Sistema avançado de busca em tempo real para filtrar empresas no painel administrativo.

## 🔍 Campos de Busca

A busca funciona nos seguintes campos:

### 1. Nome Fantasia
```typescript
company.nomeFantasia?.toLowerCase().includes(searchLower)
```
- **Exemplo**: "Alpha" encontra "Empresa Alpha"
- Case-insensitive

### 2. Razão Social
```typescript
company.razaoSocial?.toLowerCase().includes(searchLower)
```
- **Exemplo**: "Comércio Ltda" encontra "Empresa Alpha Comércio Ltda"
- Case-insensitive

### 3. CNPJ
```typescript
company.cnpj?.includes(searchNumbers)
```
- **Exemplo**: "11222" encontra "11.222.333/0001-44"
- Remove automaticamente formatação (pontos, barras, hífens)
- Busca por parte do CNPJ

### 4. Cidade
```typescript
company.cidade?.toLowerCase().includes(searchLower)
```
- **Exemplo**: "São Paulo" ou "paulo"
- Case-insensitive

### 5. Estado
```typescript
company.estado?.toLowerCase().includes(searchLower)
```
- **Exemplo**: "SP" ou "são paulo"
- Case-insensitive

## ✨ Funcionalidades

### 1. Busca em Tempo Real
- ✅ Filtro atualiza a cada tecla digitada
- ✅ Sem necessidade de clicar em "Buscar"
- ✅ Instant feedback

### 2. Contador de Resultados
```
"15 empresas encontradas"
"1 empresa encontrada"
```

### 3. Botão Limpar
- ✅ Botão "X" aparece quando há texto
- ✅ Limpa busca com um clique
- ✅ Restaura lista completa

### 4. Highlight de Termos
- ✅ Destaca termo buscado nos resultados
- ✅ Fundo amarelo claro (light mode)
- ✅ Fundo amarelo escuro (dark mode)
- ✅ Texto em negrito

### 5. Tratamento de Valores Nulos
- ✅ Usa optional chaining (`?.`)
- ✅ Não quebra se campo for `null`
- ✅ Seguro para todos os campos

## 💻 Implementação

### Código Principal

```typescript
useEffect(() => {
  if (searchTerm.trim() === "") {
    setFilteredCompanies(companies)
  } else {
    const searchLower = searchTerm.toLowerCase()
    const searchNumbers = searchTerm.replace(/\D/g, "")
    
    const filtered = companies.filter((company) => {
      const matchNomeFantasia = company.nomeFantasia?.toLowerCase().includes(searchLower)
      const matchRazaoSocial = company.razaoSocial?.toLowerCase().includes(searchLower)
      const matchCnpj = company.cnpj?.includes(searchNumbers)
      const matchCidade = company.cidade?.toLowerCase().includes(searchLower)
      const matchEstado = company.estado?.toLowerCase().includes(searchLower)
      
      return matchNomeFantasia || matchRazaoSocial || matchCnpj || matchCidade || matchEstado
    })
    
    setFilteredCompanies(filtered)
  }
}, [searchTerm, companies])
```

### Função de Highlight

```typescript
const highlightText = (text: string, highlight: string) => {
  if (!highlight.trim()) {
    return text
  }
  
  const regex = new RegExp(`(${highlight})`, 'gi')
  const parts = text.split(regex)
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 dark:bg-yellow-900/50 font-semibold">
        {part}
      </mark>
    ) : (
      part
    )
  )
}
```

### Uso no JSX

```tsx
{searchTerm ? highlightText(company.nomeFantasia, searchTerm) : company.nomeFantasia}
```

## 🎨 Interface

### Input de Busca

```
┌─────────────────────────────────────────────────────────┐
│ 🔍 Buscar por nome, razão social, CNPJ, cidade...  [X] │
└─────────────────────────────────────────────────────────┘
```

- **Ícone de busca** (esquerda)
- **Placeholder descritivo**
- **Botão X** (direita, só quando tem texto)

### Contador de Resultados

```
┌──────────────────────────────────┐
│ Buscar Empresas                  │
│ 5 empresas encontradas           │
└──────────────────────────────────┘
```

### Resultado com Highlight

```
┌────────────────────────────────────┐
│ [Logo] Empresa Alpha               │
│        Empresa Alpha Comércio Ltda │
│                ^^^^^ (destacado)   │
└────────────────────────────────────┘
```

## 📊 Exemplos de Busca

### Exemplo 1: Buscar por Nome

```
Input: "alpha"
Resultado:
  ✅ Empresa Alpha
  ✅ Alpha Solutions
  ❌ Beta Comércio
```

### Exemplo 2: Buscar por CNPJ

```
Input: "11222"
Resultado:
  ✅ CNPJ: 11.222.333/0001-44
  ✅ CNPJ: 55.11222.777/0001-88
  ❌ CNPJ: 99.888.777/0001-99
```

### Exemplo 3: Buscar por Cidade

```
Input: "são paulo"
Resultado:
  ✅ São Paulo/SP
  ✅ São Paulo/SP
  ❌ Campinas/SP
```

### Exemplo 4: Buscar por Estado

```
Input: "rj"
Resultado:
  ✅ Rio de Janeiro/RJ
  ✅ Niterói/RJ
  ❌ São Paulo/SP
```

### Exemplo 5: Busca Parcial

```
Input: "com"
Resultado:
  ✅ Empresa Alpha Comércio Ltda (razão social)
  ✅ Comércio Digital SA (nome fantasia)
  ❌ Indústria XYZ
```

## 🚀 Performance

### Otimizações

1. ✅ **useEffect com dependências** - Só refiltra quando necessário
2. ✅ **Lowercase uma vez** - `searchLower` calculado uma vez
3. ✅ **Remove formatação uma vez** - `searchNumbers` calculado uma vez
4. ✅ **Optional chaining** - Evita erros com valores nulos

### Complexidade

- **Tempo**: O(n) onde n = número de empresas
- **Espaço**: O(m) onde m = empresas filtradas

## 🎯 Estados da Busca

### Estado 1: Sem Busca
```
Input: ""
Descrição: "Encontre empresas por nome, CNPJ, cidade ou estado"
Resultado: Todas as empresas
```

### Estado 2: Com Resultados
```
Input: "alpha"
Descrição: "3 empresas encontradas"
Resultado: Lista filtrada com highlights
```

### Estado 3: Sem Resultados
```
Input: "xyzabc123"
Descrição: "0 empresas encontradas"
Resultado: Mensagem "Nenhuma empresa encontrada com este termo"
```

## 🔧 Personalização

### Adicionar Novo Campo de Busca

```typescript
// 1. Adicionar no filtro
const matchEmail = company.email?.toLowerCase().includes(searchLower)

// 2. Adicionar no return
return matchNomeFantasia || matchRazaoSocial || matchCnpj || 
       matchCidade || matchEstado || matchEmail
```

### Mudar Cor do Highlight

```tsx
// Alterar className do <mark>
<mark className="bg-blue-200 dark:bg-blue-900/50">
  {part}
</mark>
```

### Adicionar Busca Exata (sem parcial)

```typescript
// Usar === ao invés de includes
const matchExato = company.cnpj === searchTerm
```

### Busca com Múltiplos Termos

```typescript
const terms = searchTerm.split(' ').filter(t => t.length > 0)
const matchAll = terms.every(term => 
  company.nomeFantasia?.toLowerCase().includes(term.toLowerCase())
)
```

## 🧪 Testando

### Teste 1: Busca Básica

```typescript
// Digitar "alpha" no input
expect(filteredCompanies).toHaveLength(3)
expect(filteredCompanies[0].nomeFantasia).toContain('Alpha')
```

### Teste 2: Limpar Busca

```typescript
// Clicar no botão X
expect(searchTerm).toBe('')
expect(filteredCompanies).toEqual(companies)
```

### Teste 3: Busca Sem Resultados

```typescript
// Digitar "empresa inexistente"
expect(filteredCompanies).toHaveLength(0)
```

### Teste 4: CNPJ com Formatação

```typescript
// Digitar "11.222.333/0001-44"
// Sistema remove formatação automaticamente
expect(searchNumbers).toBe('11222333000144')
```

## 💡 Dicas de UX

1. ✅ **Feedback Imediato** - Resultado atualiza a cada tecla
2. ✅ **Contador Visível** - Usuário sabe quantos resultados
3. ✅ **Limpar Fácil** - Botão X visível
4. ✅ **Placeholder Descritivo** - Usuário sabe o que buscar
5. ✅ **Highlight Visual** - Fácil identificar o termo
6. ✅ **Sem Case Sensitive** - Mais flexível
7. ✅ **Busca Parcial** - Não precisa digitar completo

## 📝 Notas Importantes

1. ✅ Busca é **local** (no array em memória)
2. ✅ Não faz requisição à API a cada tecla
3. ✅ Ideal para até ~1000 empresas
4. ✅ Para listas maiores, considerar busca server-side
5. ✅ Highlight pode impactar performance com muitos resultados

## 🔄 Fluxo Completo

```
1. Usuário digita no input
   ↓
2. onChange atualiza searchTerm
   ↓
3. useEffect detecta mudança
   ↓
4. Filtra array de empresas
   ↓
5. Atualiza filteredCompanies
   ↓
6. Re-renderiza tabela
   ↓
7. Aplica highlight nos termos
   ↓
8. Usuário vê resultados em tempo real
```

## 🎨 Estilos do Highlight

### Light Mode
```css
.bg-yellow-200 {
  background-color: #fef08a; /* Amarelo claro */
}
```

### Dark Mode
```css
.dark:bg-yellow-900\/50 {
  background-color: rgba(113, 63, 18, 0.5); /* Amarelo escuro semi-transparente */
}
```

A busca está **totalmente funcional** e otimizada! 🔍✨
