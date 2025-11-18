# 📸 Sistema de Upload de Logo

## Visão Geral

Sistema completo para upload e gerenciamento de logos de empresas no painel administrativo.

---

## 🎯 Funcionalidades

### 1. Upload de Logo
- ✅ Seleção de arquivo com input nativo
- ✅ Preview em tempo real da imagem
- ✅ Validação de formato e tamanho
- ✅ Upload para API com FormData
- ✅ Feedback visual durante upload

### 2. Validações Implementadas

#### Formatos Aceitos
- `.jpg` / `.jpeg`
- `.png`
- `.gif`
- `.webp`

#### Tamanho Máximo
- **5 MB** por arquivo

#### Validações Client-Side
```typescript
// Validar tipo
const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
if (!validTypes.includes(file.type)) {
  // Mostrar erro
}

// Validar tamanho (5MB)
if (file.size > 5 * 1024 * 1024) {
  // Mostrar erro
}
```

---

## 🔧 Implementação Técnica

### API Function (`lib/api/auth.ts`)

```typescript
async uploadLogo(companyId: string, file: File): Promise<any> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    
    if (!selectedCompany) {
      throw new Error('Nenhuma empresa selecionada')
    }

    const formData = new FormData()
    formData.append('logo', file)

    const response = await apiClient.post(`/companies/admin/${companyId}/logo`, formData, {
      headers: {
        'x-company-id': selectedCompany.id,
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return response.data
  } catch (error: any) {
    throw error
  }
}
```

### Component States

```typescript
const [uploadingLogo, setUploadingLogo] = useState(false)
const [logoPreview, setLogoPreview] = useState<string | null>(null)
const [logoFile, setLogoFile] = useState<File | null>(null)
```

### Handler Functions

#### 1. Seleção de Arquivo
```typescript
const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  // Validações...
  
  // Criar preview
  const reader = new FileReader()
  reader.onloadend = () => {
    setLogoPreview(reader.result as string)
  }
  reader.readAsDataURL(file)
  
  setLogoFile(file)
}
```

#### 2. Upload
```typescript
const handleUploadLogo = async () => {
  if (!logoFile) return

  try {
    setUploadingLogo(true)
    
    const result = await companiesApi.uploadLogo(params.id as string, logoFile)
    
    toast({
      title: "Logo atualizada com sucesso!",
      description: "A logo da empresa foi atualizada.",
    })
    
    setLogoPreview(result.logoUrl)
    setLogoFile(null)
  } catch (error: any) {
    const { title, description } = formatApiError(error)
    
    toast({
      title,
      description,
      variant: "destructive",
    })
  } finally {
    setUploadingLogo(false)
  }
}
```

#### 3. Remover Logo
```typescript
const handleRemoveLogo = () => {
  setLogoPreview(null)
  setLogoFile(null)
}
```

---

## 🎨 UI Component

### Card de Upload

```tsx
<Card>
  <CardHeader>
    <CardTitle>Logo da Empresa</CardTitle>
    <CardDescription>
      Formatos aceitos: .jpg, .jpeg, .png, .gif, .webp (máx. 5MB)
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="flex items-start gap-6">
      {/* Preview da Logo */}
      <div className="flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed bg-muted">
        {logoPreview ? (
          <div className="relative h-full w-full">
            <img
              src={logoPreview}
              alt="Logo preview"
              className="h-full w-full rounded-lg object-contain p-2"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -right-2 -top-2 h-6 w-6"
              onClick={handleRemoveLogo}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <ImageIcon className="h-12 w-12 text-muted-foreground" />
        )}
      </div>

      {/* Upload Controls */}
      <div className="flex-1 space-y-3">
        <Input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleLogoChange}
          disabled={uploadingLogo}
        />
        
        {logoFile && (
          <Button
            type="button"
            onClick={handleUploadLogo}
            disabled={uploadingLogo}
          >
            {uploadingLogo ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Fazer Upload
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  </CardContent>
</Card>
```

---

## 📋 Fluxo de Uso

### Para o Usuário

1. **Acessar edição da empresa**
   - `/admin/empresas/[id]/editar`

2. **Selecionar arquivo**
   - Clicar no input de arquivo
   - Escolher imagem (jpg, png, gif, webp)
   - Preview aparece automaticamente

3. **Fazer upload**
   - Clicar em "Fazer Upload"
   - Aguardar confirmação
   - Logo é atualizada na API

4. **Remover logo** (opcional)
   - Clicar no "X" sobre o preview
   - Preview é limpo

### Estados Visuais

| Estado | Visual |
|--------|--------|
| **Sem logo** | Ícone de imagem placeholder |
| **Arquivo selecionado** | Preview + botão "Fazer Upload" |
| **Uploading** | Spinner + "Enviando..." |
| **Sucesso** | Toast de confirmação + URL atualizada |
| **Erro** | Toast com mensagem de erro |

---

## 🔒 Segurança

### Client-Side
- ✅ Validação de tipo MIME
- ✅ Validação de tamanho
- ✅ Restrição de extensões no input

### Server-Side (API)
- ✅ Validação de tipo de arquivo
- ✅ Validação de tamanho
- ✅ Autenticação obrigatória
- ✅ Permissão `companies.update`
- ✅ Role `admin` obrigatória

---

## 📊 Resposta da API

### Sucesso (200 OK)

```json
{
  "id": "cm2r8g9h40000vy9x1a2b3c4d",
  "razaoSocial": "Empresa Alpha Comércio Ltda",
  "nomeFantasia": "Empresa Alpha",
  "logoUrl": "http://localhost:3000/uploads/logos/logo-1730000000000-123456789.png",
  "logoFileName": "logo-1730000000000-123456789.png",
  "logoMimeType": "image/png",
  "updatedAt": "2025-10-25T15:45:00.000Z"
}
```

### Erro (400 Bad Request)

```json
{
  "message": ["Arquivo muito grande. Tamanho máximo: 5MB"],
  "error": "Bad Request",
  "statusCode": 400
}
```

---

## 🎯 Melhorias Futuras

### Possíveis Implementações

1. **Crop de Imagem**
   - Adicionar editor de crop antes do upload
   - Biblioteca: `react-image-crop`

2. **Compressão Automática**
   - Reduzir tamanho automaticamente
   - Biblioteca: `browser-image-compression`

3. **Múltiplas Imagens**
   - Galeria de logos
   - Logo padrão + variações (escura/clara)

4. **Drag & Drop**
   - Interface mais intuitiva
   - Biblioteca: `react-dropzone`

5. **Progress Bar**
   - Mostrar progresso do upload
   - Útil para arquivos grandes

---

## 📝 Notas

- O upload é **independente** do formulário principal
- Upload ocorre **imediatamente** após clicar no botão
- Não é necessário salvar o formulário depois
- A logo é persistida na API automaticamente
- O preview atualiza com a URL retornada pela API

---

## ✅ Checklist de Implementação

- [x] Função de upload na API
- [x] Validações client-side (tipo e tamanho)
- [x] Preview da imagem selecionada
- [x] Estados de loading durante upload
- [x] Tratamento de erros com toast
- [x] Botão de remover preview
- [x] Carregar logo existente ao abrir página
- [x] UI responsiva e acessível
- [x] Integração com FormData
- [x] Headers corretos (multipart/form-data)

🎉 **Sistema de upload de logo totalmente funcional!**
