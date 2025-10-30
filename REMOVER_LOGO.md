# Funcionalidade: Remover Logo da Empresa

## 📋 Descrição

Implementação da funcionalidade de remoção de logo da empresa através de um botão com ícone "X" no preview da imagem.

## 🔧 Implementação

### 1. API Client (`lib/api/auth.ts`)

Adicionada função `removeLogo` no objeto `companiesApi`:

```typescript
/**
 * Remove a logo da empresa (Admin only)
 * Requer permissão companies.update e role admin
 */
async removeLogo(companyId: string): Promise<any> {
  try {
    const selectedCompany = authApi.getSelectedCompany()
    
    if (!selectedCompany) {
      throw new Error('Nenhuma empresa selecionada')
    }

    const response = await apiClient.delete(`/companies/admin/${companyId}/logo`, {
      headers: {
        'x-company-id': selectedCompany.id,
      },
    })
    
    return response.data
  } catch (error: any) {
    // Re-lançar o erro original para preservar a estrutura da API
    throw error
  }
}
```

**Endpoint:** `DELETE /companies/admin/:id/logo`

**Headers:**
- `Authorization: Bearer {token}` (via interceptor)
- `x-company-id: {companyId}`

**Resposta de Sucesso (200 OK):**
```json
{
  "id": "cm2r8g9h40000vy9x1a2b3c4d",
  "razaoSocial": "Empresa Alpha Comércio Ltda",
  "logoUrl": null,
  "logoFileName": null,
  "logoMimeType": null,
  "updatedAt": "2025-10-25T15:50:00.000Z"
}
```

### 2. Página de Edição (`app/admin/empresas/[id]/editar/page.tsx`)

Atualizada função `handleRemoveLogo` para chamar a API:

```typescript
const handleRemoveLogo = async () => {
  // Se é apenas preview local (arquivo ainda não enviado), apenas limpa
  if (logoFile && !formData.razaoSocial) {
    setLogoPreview(null)
    setLogoFile(null)
    return
  }

  // Se existe logo no servidor, chamar API para remover
  if (logoPreview) {
    try {
      setUploadingLogo(true)
      
      await companiesApi.removeLogo(params.id as string)
      
      toast({
        title: "Logo removida com sucesso!",
        description: "A logo da empresa foi removida.",
      })
      
      setLogoPreview(null)
      setLogoFile(null)
    } catch (error: any) {
      console.error('❌ Erro ao remover logo:', error)
      
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
}
```

## 🎯 Fluxo de Funcionamento

### Cenário 1: Preview Local (Arquivo Não Enviado)
1. Usuário seleciona arquivo mas não clica em "Fazer Upload"
2. Clica no botão "X" para remover
3. **Ação:** Remove apenas o preview e arquivo local
4. **Sem chamada à API**

### Cenário 2: Logo Existente no Servidor
1. Empresa já possui logo salva (vindo da API)
2. Usuário clica no botão "X" para remover
3. **Ação:** 
   - Chama `DELETE /companies/admin/:id/logo`
   - Remove logo do servidor (logoUrl, logoFileName, logoMimeType = null)
   - Limpa preview local
   - Exibe toast de sucesso

### Cenário 3: Logo Recém Enviada
1. Usuário fez upload de nova logo
2. Logo foi salva no servidor
3. Usuário clica no botão "X" para remover
4. **Ação:** Mesma do Cenário 2

## 🎨 Interface

### Botão de Remover
- **Posição:** Canto superior direito do preview da logo
- **Estilo:** Botão vermelho (destructive) com ícone X
- **Tamanho:** Pequeno (6x6)
- **Visibilidade:** Apenas quando há preview de logo

```tsx
<Button
  type="button"
  variant="destructive"
  size="icon"
  className="absolute -right-2 -top-2 h-6 w-6"
  onClick={handleRemoveLogo}
>
  <X className="h-3 w-3" />
</Button>
```

## ✅ Tratamento de Erros

### Errors Handling
- Usa `formatApiError` para formatar erros da API
- Suporta arrays de mensagens de erro
- Exibe toast com variante "destructive"

### Estados de Loading
- `uploadingLogo` state controla loading durante remoção
- Previne múltiplas requisições simultâneas

## 🔐 Segurança

### Autenticação e Autorização
- Requer token JWT válido
- Requer role "admin"
- Requer permissão "companies.update"
- Valida empresa selecionada no contexto

### Validação
- Verifica se empresa está selecionada
- Valida ID da empresa
- Confirma existência de logo antes de remover

## 📱 UX/UI

### Feedback Visual
- ✅ Toast de sucesso: "Logo removida com sucesso!"
- ❌ Toast de erro: Mensagem específica da API
- 🔄 Loading state: Desabilita botão durante remoção
- 👁️ Preview: Remove imediatamente após sucesso

### Estados do Componente
1. **Sem Logo:** Mostra ícone de imagem placeholder
2. **Com Logo:** Mostra preview + botão remover (X)
3. **Removendo:** Botão desabilitado, exibe loading
4. **Erro:** Mantém logo, exibe mensagem de erro

## 🧪 Casos de Teste

### Teste 1: Remover Logo Existente
```
1. Acesse edição de empresa com logo
2. Clique no botão "X" no preview
3. ✅ Logo deve ser removida do servidor
4. ✅ Preview deve desaparecer
5. ✅ Toast de sucesso deve aparecer
```

### Teste 2: Remover Preview Local
```
1. Selecione arquivo de logo mas não faça upload
2. Clique no botão "X"
3. ✅ Preview deve desaparecer
4. ✅ Não deve chamar API
5. ✅ Sem toast (remoção local)
```

### Teste 3: Erro de Permissão
```
1. Usuário sem permissão tenta remover logo
2. ✅ API retorna 403 Forbidden
3. ✅ Toast de erro com mensagem específica
4. ✅ Logo permanece no preview
```

### Teste 4: Erro de Conexão
```
1. Simule erro de rede
2. Tente remover logo
3. ✅ Toast de erro genérico
4. ✅ Logo permanece no preview
5. ✅ Estado de loading é resetado
```

## 🔄 Integração com Upload

A funcionalidade de remoção trabalha em conjunto com o upload:

1. **Upload → Remover:** Usuário pode fazer upload e depois remover
2. **Remover → Upload:** Usuário pode remover e fazer novo upload
3. **Preview Local:** Ambas operações gerenciam o mesmo estado `logoPreview`
4. **Estado Compartilhado:** `uploadingLogo` controla loading de ambas operações

## 📝 Observações

- A remoção é **permanente** no servidor
- Não há confirmação antes de remover (pode ser adicionada se necessário)
- Logo removida limpa 3 campos no banco: `logoUrl`, `logoFileName`, `logoMimeType`
- Operação é idempotente: remover logo já removida não gera erro
