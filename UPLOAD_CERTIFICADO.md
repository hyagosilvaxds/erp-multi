# Funcionalidade: Upload e Gerenciamento de Certificado Digital A1

## 📋 Descrição

Implementação completa para upload, visualização e remoção do certificado digital A1 (.pfx ou .p12) necessário para emissão de notas fiscais eletrônicas.

## 🔧 Implementação

### 1. API Client (`lib/api/auth.ts`)

#### 1.1. Upload de Certificado

```typescript
/**
 * Faz upload do certificado digital A1 da empresa (Admin only)
 * Requer permissão companies.update e role admin
 */
async uploadCertificate(companyId: string, file: File, senha: string): Promise<any> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    
    if (!selectedCompany) {
      throw new Error('Nenhuma empresa selecionada')
    }

    const formData = new FormData()
    formData.append('certificate', file)
    formData.append('senha', senha)

    const response = await apiClient.post(`/companies/admin/${companyId}/certificate`, formData, {
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

**Endpoint:** `POST /companies/admin/:id/certificate`

**Headers:**
- `Authorization: Bearer {token}` (via interceptor)
- `x-company-id: {companyId}`
- `Content-Type: multipart/form-data`

**Body (FormData):**
- `certificate`: File (.pfx ou .p12)
- `senha`: String (senha do certificado)

#### 1.2. Remover Certificado

```typescript
/**
 * Remove o certificado digital da empresa (Admin only)
 * Requer permissão companies.update e role admin
 */
async removeCertificate(companyId: string): Promise<any> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    
    if (!selectedCompany) {
      throw new Error('Nenhuma empresa selecionada')
    }

    const response = await apiClient.delete(`/companies/admin/${companyId}/certificate`, {
      headers: {
        'x-company-id': selectedCompany.id,
      },
    })
    
    return response.data
  } catch (error: any) {
    throw error
  }
}
```

**Endpoint:** `DELETE /companies/admin/:id/certificate`

### 2. Página de Edição (`app/admin/empresas/[id]/editar/page.tsx`)

#### 2.1. Estados Adicionados

```typescript
const [uploadingCertificate, setUploadingCertificate] = useState(false)
const [certificateFile, setCertificateFile] = useState<File | null>(null)
const [certificatePassword, setCertificatePassword] = useState("")
const [hasCertificate, setHasCertificate] = useState(false)
```

#### 2.2. Funções de Manipulação

##### Validação e Seleção de Arquivo

```typescript
const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  // Validar extensão
  const validExtensions = ['.pfx', '.p12']
  const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
  
  if (!validExtensions.includes(fileExtension)) {
    toast({ /* erro: formato inválido */ })
    return
  }

  // Validar tamanho (10MB)
  if (file.size > 10 * 1024 * 1024) {
    toast({ /* erro: arquivo muito grande */ })
    return
  }

  setCertificateFile(file)
}
```

##### Upload do Certificado

```typescript
const handleUploadCertificate = async () => {
  if (!certificateFile || !certificatePassword) {
    toast({ /* erro: dados incompletos */ })
    return
  }

  try {
    setUploadingCertificate(true)
    
    await companiesApi.uploadCertificate(params.id, certificateFile, certificatePassword)
    
    toast({ title: "Certificado enviado com sucesso!" })
    
    setHasCertificate(true)
    setCertificateFile(null)
    setCertificatePassword("")
  } catch (error) {
    // Tratamento de erro
  } finally {
    setUploadingCertificate(false)
  }
}
```

##### Remoção do Certificado

```typescript
const handleRemoveCertificate = async () => {
  try {
    setUploadingCertificate(true)
    
    await companiesApi.removeCertificate(params.id)
    
    toast({ title: "Certificado removido com sucesso!" })
    
    setHasCertificate(false)
    setCertificateFile(null)
    setCertificatePassword("")
  } catch (error) {
    // Tratamento de erro
  } finally {
    setUploadingCertificate(false)
  }
}
```

#### 2.3. Interface na Aba Fiscal

A seção de certificado foi adicionada na aba "Fiscal", após a numeração de notas fiscais.

**Quando NÃO há certificado:**
```tsx
<div className="space-y-4">
  <div className="space-y-2">
    <Label>Arquivo do Certificado (.pfx ou .p12)</Label>
    <Input
      type="file"
      accept=".pfx,.p12"
      onChange={handleCertificateChange}
    />
  </div>
  <div className="space-y-2">
    <Label>Senha do Certificado</Label>
    <Input
      type="password"
      value={certificatePassword}
      onChange={(e) => setCertificatePassword(e.target.value)}
    />
  </div>
  {certificateFile && certificatePassword && (
    <Button onClick={handleUploadCertificate}>
      Enviar Certificado
    </Button>
  )}
</div>
```

**Quando há certificado instalado:**
```tsx
<div className="flex items-center justify-between p-4 border rounded-lg">
  <div className="flex items-center gap-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
      <FileText className="h-5 w-5 text-green-600" />
    </div>
    <div>
      <p className="text-sm font-medium">Certificado instalado</p>
      <p className="text-xs text-muted-foreground">Certificado digital configurado</p>
    </div>
  </div>
  <Button
    variant="destructive"
    size="sm"
    onClick={handleRemoveCertificate}
  >
    Remover
  </Button>
</div>
```

## 🎯 Fluxo de Funcionamento

### Upload de Certificado

1. **Seleção de Arquivo**
   - Usuário clica em "Escolher arquivo"
   - Sistema valida extensão (.pfx ou .p12)
   - Sistema valida tamanho (máx. 10MB)
   - Arquivo selecionado armazenado em `certificateFile`

2. **Inserção de Senha**
   - Usuário digita senha do certificado
   - Input tipo password (oculta caracteres)
   - Valor armazenado em `certificatePassword`

3. **Envio**
   - Botão "Enviar Certificado" aparece quando ambos os campos estão preenchidos
   - Clique no botão chama `handleUploadCertificate`
   - FormData criado com arquivo e senha
   - POST para `/companies/admin/:id/certificate`
   - Toast de sucesso exibido
   - Interface muda para modo "certificado instalado"

### Remoção de Certificado

1. **Interface de Certificado Instalado**
   - Badge verde com ícone de documento
   - Texto "Certificado instalado"
   - Botão vermelho "Remover"

2. **Confirmação e Remoção**
   - Clique no botão "Remover"
   - DELETE para `/companies/admin/:id/certificate`
   - Toast de sucesso
   - Interface volta para modo "upload"

## 🔐 Segurança

### Validações Client-Side

1. **Extensão do Arquivo**
   - Apenas `.pfx` ou `.p12` aceitos
   - Validação por extensão do nome do arquivo

2. **Tamanho do Arquivo**
   - Máximo: 10MB
   - Validação antes do upload

3. **Senha Obrigatória**
   - Campo de senha required
   - Botão de upload desabilitado sem senha

### Segurança no Backend

1. **Autenticação**
   - Token JWT obrigatório
   - Role "admin" requerido
   - Permissão "MANAGE_COMPANIES"

2. **Armazenamento**
   - Certificado armazenado de forma segura
   - Senha criptografada
   - Campos NUNCA retornados na API

3. **Validações Server-Side**
   - Tipo MIME validado
   - Tamanho do arquivo verificado
   - Estrutura do certificado validada

## ✅ Validações e Erros

### Erros de Upload

| Código | Mensagem | Causa |
|--------|----------|-------|
| 400 | "Apenas arquivos .pfx ou .p12 são permitidos" | Extensão inválida |
| 413 | "Arquivo muito grande. Tamanho máximo: 10MB" | Arquivo > 10MB |
| 400 | "Dados incompletos" | Falta arquivo ou senha |
| 403 | "Você não tem permissão para gerenciar empresas" | Sem permissão |
| 404 | "Empresa não encontrada" | ID inválido |

### Tratamento de Erros

Todos os erros são tratados com:
- `formatApiError()` para formatar mensagens da API
- Toast com variante "destructive" (vermelho)
- Estado de loading resetado no `finally`

## 🎨 Interface

### Localização
- **Aba:** Fiscal
- **Posição:** Após seção "Numeração de Notas Fiscais"
- **Antes de:** Fechamento do Card

### Estados Visuais

#### 1. Modo Upload (Sem Certificado)
- 📄 Input de arquivo com accept=".pfx,.p12"
- 🔒 Input de senha (type="password")
- 📤 Botão "Enviar Certificado" (aparece quando ambos preenchidos)

#### 2. Modo Instalado (Com Certificado)
- ✅ Badge verde com ícone
- 📝 Texto informativo "Certificado instalado"
- 🗑️ Botão vermelho "Remover"

#### 3. Estado de Loading
- 🔄 Spinner no botão
- ⏸️ Inputs desabilitados
- "Enviando..." ou "Removendo..." no botão

## 📱 UX/UI

### Feedback Visual

✅ **Upload Bem-Sucedido:**
- Toast verde: "Certificado enviado com sucesso!"
- Descrição: "O certificado digital foi armazenado com segurança."
- Interface muda para modo "instalado"

✅ **Remoção Bem-Sucedida:**
- Toast verde: "Certificado removido com sucesso!"
- Interface volta para modo "upload"

❌ **Erros:**
- Toast vermelho com título e descrição do erro
- Mantém dados preenchidos (exceto em caso de sucesso)

### Acessibilidade

- Labels claros em todos os inputs
- Texto de ajuda explicativo
- Estados disabled durante operações
- Cores com contraste adequado

## 🧪 Casos de Teste

### Teste 1: Upload Completo
```
1. Acesse aba Fiscal da edição de empresa
2. Clique em "Escolher arquivo"
3. Selecione arquivo .pfx válido (< 10MB)
4. Digite senha do certificado
5. Clique em "Enviar Certificado"
✅ Certificado deve ser enviado
✅ Toast de sucesso deve aparecer
✅ Interface deve mudar para "instalado"
```

### Teste 2: Validação de Extensão
```
1. Selecione arquivo .txt ou .pdf
✅ Toast de erro "Formato inválido"
✅ Arquivo não deve ser aceito
```

### Teste 3: Validação de Tamanho
```
1. Selecione arquivo .pfx > 10MB
✅ Toast de erro "Arquivo muito grande"
✅ Arquivo não deve ser aceito
```

### Teste 4: Senha Obrigatória
```
1. Selecione arquivo válido
2. Não preencha senha
✅ Botão "Enviar" não deve aparecer
```

### Teste 5: Remoção
```
1. Com certificado instalado
2. Clique em "Remover"
✅ Certificado deve ser removido do servidor
✅ Toast de sucesso
✅ Interface volta para modo upload
```

### Teste 6: Erro de Permissão
```
1. Usuário sem permissão tenta fazer upload
✅ API retorna 403
✅ Toast de erro exibido
✅ Certificado não é salvo
```

## 🔄 Integração

### Com Outras Funcionalidades

1. **Logo da Empresa**
   - Ambas na mesma página de edição
   - Estados de loading separados
   - Não interferem entre si

2. **Dados Fiscais**
   - Certificado necessário para emissão de NFe
   - Complementa configurações fiscais
   - Ambiente (Homologação/Produção) relacionado

3. **Validação de Formulário**
   - Upload independente do formulário principal
   - Não bloqueia salvamento dos outros dados
   - Pode ser feito antes ou depois de salvar

## 📝 Observações Importantes

### Segurança
⚠️ **CRÍTICO:** Os campos `certificadoDigitalPath` e `certificadoDigitalSenha` NUNCA são retornados pela API

### Detecção de Certificado Existente
- Backend deve retornar campo `hasCertificate: boolean` na resposta do GET
- Frontend usa esse campo para definir estado inicial
- Não expõe dados sensíveis

### Limitações
- Apenas certificados A1 (.pfx, .p12)
- Máximo 10MB por arquivo
- Um certificado por empresa
- Upload substitui certificado anterior

### Melhorias Futuras
- [ ] Exibir data de validade do certificado
- [ ] Alerta quando certificado próximo do vencimento
- [ ] Confirmação antes de remover
- [ ] Upload de certificado A3 (USB token)
- [ ] Histórico de certificados utilizados
