# Integração de Busca de Produtos - Tela de Nova Venda

## 📋 Resumo da Implementação

Foi implementada a integração completa com a API de produtos na tela de nova venda, substituindo os produtos mockados por busca real no banco de dados.

**Data:** 10 de novembro de 2025  
**Arquivo:** `/app/dashboard/vendas/nova/page.tsx`  
**Status:** ✅ Implementado e Funcional

---

## 🎯 Funcionalidades Implementadas

### 1. Busca em Tempo Real com Debounce

**Como funciona:**
- O usuário digita no campo de busca (mínimo 2 caracteres)
- Após 500ms sem digitar, uma busca é disparada automaticamente
- A API retorna até 20 produtos ativos que correspondem ao termo
- Busca por: nome, SKU ou código de barras

**Tecnologia:**
```typescript
useEffect(() => {
  if (searchProduct.length < 2) {
    setSearchResults([])
    return
  }

  const timer = setTimeout(() => {
    searchProducts(searchProduct)
  }, 500)

  return () => clearTimeout(timer)
}, [searchProduct])
```

### 2. Função de Busca

```typescript
const searchProducts = async (query: string) => {
  try {
    setLoadingProducts(true)
    const response = await productsApi.getAll({
      search: query,
      active: true,
      limit: 20,
      sortBy: 'name',
      sortOrder: 'asc'
    })
    setSearchResults(response.products)
  } catch (error: any) {
    toast({
      title: "Erro ao buscar produtos",
      description: error.response?.data?.message || "Tente novamente mais tarde.",
      variant: "destructive",
    })
    setSearchResults([])
  } finally {
    setLoadingProducts(false)
  }
}
```

**Parâmetros de busca:**
- `search`: termo de busca
- `active`: true (apenas produtos ativos)
- `limit`: 20 (máximo de resultados)
- `sortBy`: 'name' (ordenar por nome)
- `sortOrder`: 'asc' (ordem crescente)

### 3. Lista de Resultados

**Interface visual:**
- Exibe até 20 produtos encontrados
- Card clicável para cada produto
- Informações mostradas:
  - Nome do produto
  - SKU e código de barras
  - Estoque disponível (se gerencia estoque)
  - Preço de venda
  - Categoria
- Scroll automático se mais de 10 resultados
- Altura máxima: 300px

**Exemplo de item:**
```
┌────────────────────────────────────────────┐
│ Notebook Dell Inspiron 15         R$ 2.999,90 │
│ SKU: NB-DELL-001 • Código: 7891234567890     │
│ Estoque: 15 un                    Eletrônicos │
└────────────────────────────────────────────┘
```

### 4. Seleção e Detalhes do Produto

**Ao clicar em um produto:**
1. A lista desaparece
2. Um card detalhado é exibido com:
   - Nome e descrição completa
   - SKU e código de barras
   - Estoque disponível (com unidade de medida)
   - Categoria
   - Preço de venda em destaque
3. Botão "Trocar" para voltar à busca
4. Preço unitário é preenchido automaticamente

**Card de produto selecionado:**
```
┌─────────────────────────────────────────┐
│ Notebook Dell Inspiron 15      [Trocar] │
│ Notebook com processador Intel i5...    │
│                                          │
│ SKU: NB-DELL-001    Código: 78912...    │
│ Estoque: 15 un      Categoria: Eletr... │
│                                          │
│ Preço de venda                           │
│ R$ 2.999,90                              │
└─────────────────────────────────────────┘
```

### 5. Validação de Estoque

**Validações implementadas:**

1. **Produtos com gestão de estoque:**
   - Campo quantidade tem max = estoque disponível
   - Ao tentar adicionar, valida se há estoque suficiente
   - Mensagem clara se estoque insuficiente

2. **Produtos sem gestão de estoque:**
   - Sem limite de quantidade
   - Permite adicionar qualquer quantidade

**Código de validação:**
```typescript
if (selectedProduct.manageStock) {
  const currentStock = selectedProduct.currentStock || 0
  if (productQuantity > currentStock) {
    toast({
      title: "Estoque insuficiente",
      description: `Disponível em estoque: ${currentStock} unidades.`,
      variant: "destructive",
    })
    return
  }
}
```

### 6. Preenchimento Automático

**Ao selecionar um produto:**
- ✅ Campo "Preço Unitário" preenchido com `salePrice`
- ✅ Quantidade iniciada em 1
- ✅ Desconto zerado
- ✅ Máximo de quantidade ajustado ao estoque

**Função:**
```typescript
const handleSelectProduct = (product: ApiProduct) => {
  setSelectedProduct(product)
  const price = parseFloat(product.salePrice) || 0
  setProductPrice(price)
  setProductQuantity(1)
  setProductDiscount(0)
}
```

### 7. Estados de Loading

**Indicadores visuais:**
- Spinner no campo de busca durante a busca
- Estado de loading para busca de produtos
- Mensagens contextuais:
  - "Digite pelo menos 2 caracteres para buscar"
  - "Nenhum produto encontrado"
  - "Resultados (X)" onde X é a quantidade

### 8. Feedback ao Usuário

**Toast notifications:**
- ✅ Produto adicionado com sucesso
- ❌ Erro ao buscar produtos
- ❌ Estoque insuficiente
- ❌ Produto já adicionado
- ❌ Validações de quantidade/preço

### 9. Limpeza de Estados

**Ao adicionar produto:**
- Dialog é fechado
- Produto selecionado é limpo
- Busca é resetada
- Resultados são limpos
- Campos voltam aos valores padrão

**Ao fechar dialog:**
- Todos os estados são preservados
- Permite retomar de onde parou

---

## 🔧 Mudanças Técnicas

### 1. Imports Adicionados

```typescript
import { productsApi, Product as ApiProduct } from "@/lib/api/products"
```

### 2. Tipos Removidos

Removida a interface local `Product` que estava mockada:
```typescript
// REMOVIDO ❌
interface Product {
  id: string
  name: string
  sku: string
  price: number
  stockQuantity: number
}
```

Agora usa `ApiProduct` da API real.

### 3. Estados Adicionados

```typescript
const [searchResults, setSearchResults] = useState<ApiProduct[]>([])
const [loadingProducts, setLoadingProducts] = useState(false)
```

### 4. Campos da API de Produtos Utilizados

```typescript
interface Product {
  // Identificação
  id: string
  name: string
  description?: string
  sku?: string
  barcode?: string
  
  // Preços
  salePrice: string  // ← Usado para preenchimento automático
  
  // Estoque
  manageStock: boolean  // ← Usado para validação
  currentStock?: number  // ← Usado para validação
  
  // Relações
  category?: Category  // ← Exibido nos resultados
  unit?: Unit  // ← Usado para exibir unidade de medida
  
  // Status
  active: boolean  // ← Filtrado na busca
}
```

---

## 🎨 Interface do Dialog

### Estrutura

```
┌─ Adicionar Produto ────────────────────────┐
│                                            │
│ [🔍 Digite o nome, SKU...]  [⟳ loading]   │
│ Digite pelo menos 2 caracteres para buscar │
│                                            │
│ ┌─ Resultados (3) ──────────────────────┐ │
│ │ [Produto 1 com detalhes]              │ │
│ │ [Produto 2 com detalhes]              │ │
│ │ [Produto 3 com detalhes]              │ │
│ └───────────────────────────────────────┘ │
│                                            │
│        OU (após seleção)                   │
│                                            │
│ ┌─ Produto Selecionado ──────────[Trocar]┐│
│ │ Nome, descrição, SKU, estoque, etc.   ││
│ └───────────────────────────────────────┘ │
│                                            │
│ [Quantidade]  [Preço Unitário]            │
│ [Desconto]    [Total: R$ XXX]             │
│                                            │
│          [Cancelar]  [Adicionar]          │
└────────────────────────────────────────────┘
```

### Responsividade

- Dialog ocupa 90% da altura da tela
- Overflow automático se conteúdo grande
- Grid de campos responsivo (2 colunas em telas grandes)
- Lista de resultados com scroll independente

---

## 📊 Fluxo de Uso

### Caso 1: Busca e Seleção Normal

```
1. Usuário clica em "Adicionar Produto"
   ↓
2. Dialog abre com campo de busca vazio
   ↓
3. Usuário digita "notebook" (mín. 2 chars)
   ↓
4. Após 500ms, busca automática é disparada
   ↓
5. API retorna lista de notebooks
   ↓
6. Usuário clica em um produto
   ↓
7. Card detalhado é exibido
   ↓
8. Preço é preenchido automaticamente
   ↓
9. Usuário ajusta quantidade se necessário
   ↓
10. Clica em "Adicionar"
    ↓
11. Validações executadas (estoque, duplicata)
    ↓
12. Produto adicionado à lista
    ↓
13. Toast de sucesso exibido
    ↓
14. Dialog fecha automaticamente
```

### Caso 2: Trocar Produto

```
1. Produto já selecionado
   ↓
2. Usuário clica em "Trocar"
   ↓
3. Card some, campo de busca aparece
   ↓
4. Usuário faz nova busca
   ↓
5. Seleciona outro produto
```

### Caso 3: Estoque Insuficiente

```
1. Produto selecionado (estoque: 5 un)
   ↓
2. Usuário tenta adicionar 10 unidades
   ↓
3. Clica em "Adicionar"
   ↓
4. Validação detecta estoque insuficiente
   ↓
5. Toast vermelho: "Disponível em estoque: 5 unidades"
   ↓
6. Dialog permanece aberto
   ↓
7. Usuário ajusta quantidade
```

### Caso 4: Produto Já Adicionado

```
1. Produto X já está na lista
   ↓
2. Usuário tenta adicionar produto X novamente
   ↓
3. Validação detecta duplicata
   ↓
4. Toast: "Este produto já está na lista"
   ↓
5. Dialog permanece aberto
```

---

## ✅ Validações Implementadas

### No Dialog

1. ✅ Produto selecionado é obrigatório
2. ✅ Quantidade > 0
3. ✅ Quantidade ≤ estoque (se gerencia estoque)
4. ✅ Preço > 0
5. ✅ Produto não duplicado na lista

### No Formulário Principal

1. ✅ Cliente obrigatório
2. ✅ Método de pagamento obrigatório
3. ✅ Pelo menos 1 item na lista
4. ✅ Todos os itens com quantidade/preço válidos

---

## 🚀 Performance

### Otimizações

1. **Debounce de 500ms**
   - Evita requisições desnecessárias
   - Aguarda usuário terminar de digitar
   - Cancela timer anterior se novo caractere digitado

2. **Limite de 20 resultados**
   - Evita carregar centenas de produtos
   - Response rápido da API
   - Scroll suave na lista

3. **Cleanup de useEffect**
   - Timer cancelado ao desmontar componente
   - Evita memory leaks
   - useEffect otimizado

4. **Lazy loading de dados**
   - Produtos só carregados quando necessário
   - Não carrega todos os produtos ao abrir tela
   - Busca apenas produtos ativos

---

## 🔄 Integração com API

### Endpoint Utilizado

```
GET /api/products?search={query}&active=true&limit=20&sortBy=name&sortOrder=asc
```

### Headers Automáticos

```typescript
{
  'Authorization': `Bearer ${token}`,
  'x-company-id': companyId
}
```

### Response Esperado

```typescript
{
  products: Product[],
  total: number,
  page: number,
  limit: number,
  totalPages: number
}
```

### Tratamento de Erros

```typescript
try {
  // Busca produtos
} catch (error: any) {
  // Toast com mensagem de erro
  // Limpa resultados
  // Mantém dialog aberto
}
```

---

## 📝 Notas Técnicas

### 1. Type Safety

Todos os tipos são importados da API:
- ✅ `Product` da API de produtos
- ✅ `Customer` da API de clientes
- ✅ `CreateSaleDto` da API de vendas

### 2. Componentes Reutilizáveis

Usa componentes do Shadcn UI:
- Dialog
- Input
- Label
- Button
- Card

### 3. Acessibilidade

- ✅ Labels em todos os campos
- ✅ Placeholders descritivos
- ✅ Feedback visual (loading, erros)
- ✅ Navegação por teclado funcional
- ✅ Botões com textos claros

### 4. Responsividade

- Mobile: 1 coluna
- Tablet: 2 colunas
- Desktop: 2-3 colunas
- Dialog adapta-se à tela

---

## 🎯 Próximas Melhorias (Opcionais)

### 1. Busca Avançada
- [ ] Filtrar por categoria
- [ ] Filtrar por faixa de preço
- [ ] Filtrar por disponibilidade
- [ ] Ordenar resultados

### 2. Scanner de Código de Barras
- [ ] Integração com câmera
- [ ] Busca direta por código de barras
- [ ] Adição rápida sem dialog

### 3. Histórico de Produtos
- [ ] Produtos mais vendidos
- [ ] Últimos produtos adicionados
- [ ] Sugestões baseadas no cliente

### 4. Imagens dos Produtos
- [ ] Exibir foto do produto nos resultados
- [ ] Preview maior ao selecionar
- [ ] Galeria de fotos

### 5. Descontos Automáticos
- [ ] Aplicar desconto por quantidade
- [ ] Aplicar desconto por cliente
- [ ] Regras de promoção

---

## 🧪 Como Testar

### 1. Busca Básica

```
1. Abrir "Nova Venda"
2. Clicar em "Adicionar Produto"
3. Digite "note" no campo de busca
4. Aguardar 500ms
5. Verificar lista de notebooks
```

### 2. Validação de Estoque

```
1. Buscar produto com estoque baixo (ex: 2 unidades)
2. Selecionar produto
3. Tentar adicionar quantidade > estoque
4. Verificar mensagem de erro
```

### 3. Produto Duplicado

```
1. Adicionar produto X à lista
2. Tentar adicionar produto X novamente
3. Verificar mensagem "já adicionado"
```

### 4. Performance

```
1. Digitar rapidamente "abcdefg"
2. Verificar que apenas 1 requisição é feita
3. Confirmar debounce funcionando
```

### 5. Trocar Produto

```
1. Selecionar produto A
2. Clicar em "Trocar"
3. Buscar e selecionar produto B
4. Verificar que dados de B são carregados
```

---

## 📋 Checklist de Implementação

- [x] Importar API de produtos
- [x] Remover interface mockada
- [x] Adicionar estados (searchResults, loadingProducts)
- [x] Implementar função searchProducts()
- [x] Adicionar useEffect com debounce
- [x] Criar lista de resultados no dialog
- [x] Implementar seleção de produto
- [x] Atualizar card de produto selecionado
- [x] Corrigir validação de estoque
- [x] Adicionar campo "Trocar"
- [x] Implementar estados de loading
- [x] Adicionar feedback de erro
- [x] Testar validações
- [x] Verificar tipos TypeScript
- [x] Criar documentação

---

## 🎉 Resultado Final

✅ **Busca de produtos 100% funcional**
✅ **Integrada com API real**
✅ **Validações completas**
✅ **UX/UI intuitiva**
✅ **Performance otimizada**
✅ **Zero erros de compilação**
✅ **Type-safe com TypeScript**

---

**Desenvolvedor:** GitHub Copilot  
**Data:** 10 de novembro de 2025  
**Status:** ✅ Implementação Completa  
**Arquivo:** `/app/dashboard/vendas/nova/page.tsx`
