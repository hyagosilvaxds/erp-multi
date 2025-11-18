# Sistema de Fotos de Produtos

Sistema completo para gerenciamento de fotos de produtos com suporte a upload, reordenação, definição de foto principal e exclusão.

## 📋 Funcionalidades Implementadas

### 1. API de Fotos (`lib/api/products.ts`)

#### Tipos
```typescript
// Foto do produto
interface ProductPhoto {
  id: string
  productId: string
  documentId: string
  order: number
  isPrimary: boolean
  createdAt: string
  document?: {
    id: string
    name: string
    originalName: string
    url: string
    mimeType: string
    size: number
  }
}

// Requisição para adicionar foto
interface AddProductPhotoRequest {
  documentId: string
  order?: number
  isPrimary?: boolean
}

// Requisição para reordenar fotos
interface ReorderPhotosRequest {
  photoOrders: Array<{
    id: string
    order: number
  }>
}
```

#### Métodos da API

##### 1. Adicionar Foto
```typescript
productsApi.addPhoto(productId, data)
```
- **Endpoint**: `POST /products/:id/photos`
- **Permissão**: `products.update`
- **Parâmetros**:
  - `productId` (string): ID do produto
  - `data` (AddProductPhotoRequest): Dados da foto
- **Retorna**: `Promise<ProductPhoto>`

##### 2. Remover Foto
```typescript
productsApi.removePhoto(productId, photoId)
```
- **Endpoint**: `DELETE /products/:id/photos/:photoId`
- **Permissão**: `products.update`
- **Parâmetros**:
  - `productId` (string): ID do produto
  - `photoId` (string): ID da foto
- **Retorna**: `Promise<{ message: string }>`

##### 3. Definir Foto Principal
```typescript
productsApi.setPrimaryPhoto(productId, photoId)
```
- **Endpoint**: `PATCH /products/:id/photos/:photoId/primary`
- **Permissão**: `products.update`
- **Parâmetros**:
  - `productId` (string): ID do produto
  - `photoId` (string): ID da foto
- **Retorna**: `Promise<ProductPhoto>`

##### 4. Reordenar Fotos
```typescript
productsApi.reorderPhotos(productId, data)
```
- **Endpoint**: `PATCH /products/:id/photos/reorder`
- **Permissão**: `products.update`
- **Parâmetros**:
  - `productId` (string): ID do produto
  - `data` (ReorderPhotosRequest): Nova ordem das fotos
- **Retorna**: `Promise<Array<{ id: string; order: number; isPrimary: boolean }>>`

---

### 2. Componente de Fotos (`components/products/product-photos.tsx`)

Componente React reutilizável para gerenciar fotos de produtos.

#### Props
```typescript
interface ProductPhotosProps {
  productId: string           // ID do produto
  photos: ProductPhoto[]      // Array de fotos atuais
  onPhotosChange?: () => void // Callback quando fotos mudam
  canEdit?: boolean           // Permissão para editar (padrão: true)
}
```

#### Funcionalidades do Componente

##### Upload de Fotos
- Seletor de arquivos com validação
- Formatos aceitos: JPG, PNG, GIF
- Tamanho máximo: 5MB
- Primeira foto é automaticamente definida como principal

##### Grid de Fotos
- Layout responsivo (2-4 colunas)
- Ordenação visual por número
- Badge de "Principal" na foto principal
- Bordas diferenciadas para foto principal

##### Drag & Drop
- Reordenação por arrastar e soltar
- Feedback visual durante o arrasto
- Salva automaticamente a nova ordem

##### Ações por Foto
- **Definir como Principal**: Define a foto como principal do produto
- **Remover**: Remove a foto com confirmação
- Ações aparecem ao passar o mouse (hover)

##### Estados Visuais
- Loading durante upload
- Empty state quando não há fotos
- Confirmação antes de deletar
- Toasts de sucesso/erro

---

### 3. Página de Edição (`app/dashboard/produtos/[id]/page.tsx`)

Página completa para edição de produtos com tabs.

#### Estrutura
```
/dashboard/produtos/[id]
├── Fotos (ProductPhotos component)
├── Informações Gerais
├── Preços
├── Estoque
└── Fiscal
```

#### Features
- Carregamento automático do produto
- Navegação por tabs
- Integração com sistema de permissões
- Botão voltar para lista
- Header com nome do produto e SKU

---

## 🔧 Integração

### Na Lista de Produtos

O link de edição já foi atualizado:

```tsx
<Link href={`/dashboard/produtos/${product.id}`}>
  <Edit className="mr-2 h-4 w-4" />
  Editar
</Link>
```

### Como Usar o Componente

```tsx
import { ProductPhotos } from "@/components/products/product-photos"

// Em qualquer página
<ProductPhotos
  productId={product.id}
  photos={product.photos || []}
  onPhotosChange={() => {
    // Recarregar produto ou atualizar estado
    loadProduct()
  }}
  canEdit={can('produtos', 'edit')}
/>
```

---

## 📝 Regras de Negócio

### Foto Principal
- Apenas uma foto pode ser principal por vez
- Ao definir uma foto como principal, as outras são desmarcadas automaticamente
- A primeira foto adicionada é automaticamente definida como principal

### Ordenação
- As fotos são ordenadas por `order` (crescente)
- A reordenação por drag & drop atualiza automaticamente
- O número da ordem é exibido no canto inferior esquerdo de cada foto

### Validação de Upload
- Apenas imagens são aceitas
- Tamanho máximo: 5MB
- Validação no frontend antes do upload

---

## 🚀 Próximos Passos

### Funcionalidades Pendentes

1. **Upload de Documentos**
   - Implementar endpoint de upload no hub de documentos
   - Integrar com o componente ProductPhotos
   - Adicionar upload de múltiplos arquivos

2. **Otimizações**
   - Miniaturas (thumbnails) para performance
   - Lazy loading de imagens
   - Cache de imagens

3. **Features Adicionais**
   - Zoom ao clicar na imagem
   - Galeria em fullscreen
   - Crop/edição básica de imagem
   - Upload via drag & drop na área de fotos

4. **Integração**
   - Exibir foto principal na listagem de produtos
   - Carregar fotos nas páginas de visualização
   - Sincronizar fotos em produtos variantes

---

## 📚 Exemplos de Uso

### Adicionar Foto Manualmente
```typescript
const photo = await productsApi.addPhoto(productId, {
  documentId: 'uuid-do-documento',
  isPrimary: true
})
```

### Remover Foto
```typescript
await productsApi.removePhoto(productId, photoId)
```

### Definir Foto Principal
```typescript
await productsApi.setPrimaryPhoto(productId, photoId)
```

### Reordenar Fotos
```typescript
await productsApi.reorderPhotos(productId, {
  photoOrders: [
    { id: 'foto-1', order: 0 },
    { id: 'foto-2', order: 1 },
    { id: 'foto-3', order: 2 }
  ]
})
```

---

## ✅ Checklist de Implementação

- [x] Tipos TypeScript para fotos
- [x] API methods (add, remove, setPrimary, reorder)
- [x] Componente ProductPhotos
- [x] Página de edição com tabs
- [x] Integração com lista de produtos
- [x] Sistema de permissões
- [x] Drag & drop para reordenação
- [x] Validação de arquivos
- [x] Confirmação de exclusão
- [x] Feedback visual (toasts)
- [x] Empty states
- [x] Loading states
- [ ] Upload de documentos (hub)
- [ ] Preview de imagens
- [ ] Galeria fullscreen

---

## 🎨 UI/UX

### Componentes Utilizados
- `Card` - Container principal
- `Button` - Ações e upload
- `Badge` - Indicador de foto principal
- `AlertDialog` - Confirmação de exclusão
- `Toast` - Feedback de ações
- `Image` (Next.js) - Otimização de imagens

### Ícones (lucide-react)
- `Upload` - Botão de adicionar foto
- `X` - Remover foto
- `Star` - Foto principal
- `GripVertical` - Handle de drag
- `ImageIcon` - Empty state

### Comportamentos
- Hover mostra ações
- Drag visual com opacidade
- Bordas coloridas para foto principal
- Grid responsivo
- Transições suaves
