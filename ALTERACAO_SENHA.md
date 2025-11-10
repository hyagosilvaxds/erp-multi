# Alteração de Senha

## Visão Geral

Implementação completa da funcionalidade de alteração de senha do usuário autenticado na página `/dashboard/configuracoes`.

---

## Endpoint da API

### Change Password

```http
PATCH /auth/change-password
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "oldPassword": "senhaAntiga123",
  "newPassword": "novaSenhaSegura456"
}
```

**Response (200 OK):**
```json
{
  "message": "Senha alterada com sucesso"
}
```

**Erros Comuns:**

| Status | Mensagem | Causa |
|--------|----------|-------|
| 401 | Unauthorized | Token ausente/inválido |
| 401 | Senha antiga incorreta | Senha antiga errada |
| 400 | Nova senha deve ter no mínimo 6 caracteres | Senha curta |
| 400 | Nova senha deve ser diferente da senha antiga | Senhas iguais |

---

## Implementação Frontend

### 1. API Client (`/lib/api/auth.ts`)

Adicionada função `changePassword` no objeto `authApi`:

```typescript
/**
 * Altera a senha do usuário autenticado
 */
async changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
  try {
    const { data } = await apiClient.patch<{ message: string }>('/auth/change-password', {
      oldPassword,
      newPassword,
    })
    
    return data
  } catch (error: any) {
    const message = error.response?.data?.message
    if (Array.isArray(message)) {
      throw new Error(message.join(', '))
    }
    throw new Error(message || 'Erro ao alterar senha')
  }
}
```

**Características:**
- ✅ Usa `PATCH /auth/change-password`
- ✅ Envia `oldPassword` e `newPassword`
- ✅ Token é enviado automaticamente pelo `apiClient`
- ✅ Trata erros de array (validações do backend)
- ✅ Retorna mensagem de sucesso

---

### 2. Página de Configurações (`/app/dashboard/configuracoes/page.tsx`)

#### Estados

```typescript
const [senhaAtual, setSenhaAtual] = useState("")
const [novaSenha, setNovaSenha] = useState("")
const [confirmarSenha, setConfirmarSenha] = useState("")
const [loading, setLoading] = useState(false)
const [error, setError] = useState("")
```

#### Validações Frontend

```typescript
const validateForm = (): boolean => {
  setError("")

  // 1. Senha atual obrigatória
  if (!senhaAtual.trim()) {
    setError("A senha atual é obrigatória")
    return false
  }

  // 2. Nova senha obrigatória
  if (!novaSenha.trim()) {
    setError("A nova senha é obrigatória")
    return false
  }

  // 3. Tamanho mínimo
  if (novaSenha.length < 6) {
    setError("A nova senha deve ter no mínimo 6 caracteres")
    return false
  }

  // 4. Nova senha diferente da antiga
  if (novaSenha === senhaAtual) {
    setError("A nova senha deve ser diferente da senha atual")
    return false
  }

  // 5. Confirmação de senha
  if (novaSenha !== confirmarSenha) {
    setError("As senhas não coincidem")
    return false
  }

  return true
}
```

#### Handler de Alteração

```typescript
const handleAlterarSenha = async () => {
  if (!validateForm()) {
    return
  }

  try {
    setLoading(true)
    setError("")
    
    await authApi.changePassword(senhaAtual, novaSenha)
    
    toast({
      title: "Senha alterada com sucesso",
      description: "Sua senha foi atualizada.",
    })

    // Limpar campos após sucesso
    setSenhaAtual("")
    setNovaSenha("")
    setConfirmarSenha("")
  } catch (error: any) {
    const errorMessage = error.message || "Erro ao alterar senha"
    setError(errorMessage)
    toast({
      title: "Erro ao alterar senha",
      description: errorMessage,
      variant: "destructive",
    })
  } finally {
    setLoading(false)
  }
}
```

#### Interface do Usuário

**Componentes utilizados:**
- `Card` - Container principal
- `Input` - Campos de senha (type="password")
- `Label` - Labels dos campos
- `Button` - Botão de ação com loading state
- `Alert` - Mensagens de erro inline
- `Toast` - Notificações de sucesso/erro

**Features:**
- ✅ Loading state no botão durante requisição
- ✅ Campos desabilitados durante loading
- ✅ Alert de erro inline acima do formulário
- ✅ Toast de sucesso/erro
- ✅ Limpa campos após sucesso
- ✅ Enter para submeter
- ✅ Ícones visuais (Shield, Loader2, CheckCircle2, AlertCircle)
- ✅ Card informativo com dicas de segurança

---

## Fluxo de Uso

### 1. Usuário Preenche Formulário

```
┌─────────────────────────────────┐
│  Senha Atual *                  │
│  ┌───────────────────────────┐  │
│  │ ••••••••••                │  │
│  └───────────────────────────┘  │
│                                 │
│  Nova Senha *                   │
│  ┌───────────────────────────┐  │
│  │ ••••••••••                │  │
│  └───────────────────────────┘  │
│  A senha deve ter no mínimo     │
│  6 caracteres                   │
│                                 │
│  Confirmar Nova Senha *         │
│  ┌───────────────────────────┐  │
│  │ ••••••••••                │  │
│  └───────────────────────────┘  │
│                                 │
│  [ ✓ Alterar Senha ]            │
└─────────────────────────────────┘
```

### 2. Validações Frontend

```typescript
✅ Senha atual preenchida
✅ Nova senha preenchida
✅ Nova senha >= 6 caracteres
✅ Nova senha ≠ senha atual
✅ Nova senha === confirmação
```

### 3. Requisição à API

```typescript
PATCH /auth/change-password
{
  "oldPassword": "antigaSenha123",
  "newPassword": "novaSenha456"
}
```

### 4. Tratamento de Resposta

**Sucesso:**
```typescript
✅ Toast: "Senha alterada com sucesso"
✅ Campos limpos
✅ Formulário resetado
```

**Erro:**
```typescript
❌ Alert inline com mensagem de erro
❌ Toast destrutivo com erro
❌ Campos mantidos (usuário pode corrigir)
```

---

## Validações Backend

O backend valida:

1. **Token**: Usuário autenticado (401 se inválido)
2. **Senha Antiga**: Correta (401 se incorreta)
3. **Nova Senha**: 
   - Mínimo 6 caracteres (400 se menor)
   - Diferente da antiga (400 se igual)

---

## Mensagens de Erro

### Frontend (Validações)

| Erro | Mensagem |
|------|----------|
| Senha atual vazia | "A senha atual é obrigatória" |
| Nova senha vazia | "A nova senha é obrigatória" |
| Senha < 6 caracteres | "A nova senha deve ter no mínimo 6 caracteres" |
| Senhas iguais | "A nova senha deve ser diferente da senha atual" |
| Confirmação diferente | "As senhas não coincidem" |

### Backend (Erros da API)

| Status | Mensagem |
|--------|----------|
| 401 | "Unauthorized" |
| 401 | "Senha antiga incorreta" |
| 400 | "Nova senha deve ter no mínimo 6 caracteres" |
| 400 | "Nova senha deve ser diferente da senha antiga" |

---

## Exemplo de Uso

### 1. Usuário acessa `/dashboard/configuracoes`

### 2. Preenche formulário:
- Senha Atual: `senha123`
- Nova Senha: `novaSenha456!`
- Confirmar: `novaSenha456!`

### 3. Clica em "Alterar Senha"

### 4. Frontend valida:
- ✅ Todos os campos preenchidos
- ✅ Nova senha tem 14 caracteres (>= 6)
- ✅ Nova senha diferente da antiga
- ✅ Confirmação correta

### 5. Envia requisição:
```http
PATCH /auth/change-password
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "oldPassword": "senha123",
  "newPassword": "novaSenha456!"
}
```

### 6. Backend valida:
- ✅ Token válido
- ✅ Senha antiga correta
- ✅ Nova senha >= 6 caracteres
- ✅ Nova senha diferente da antiga

### 7. Resposta:
```json
{
  "message": "Senha alterada com sucesso"
}
```

### 8. Frontend:
- ✅ Toast de sucesso
- ✅ Campos limpos
- ✅ Pronto para nova alteração

---

## Segurança

### 1. **Validação de Senha Antiga**
- Backend verifica se a senha antiga está correta
- Previne alteração sem conhecer a senha atual

### 2. **Tamanho Mínimo**
- Senha deve ter no mínimo 6 caracteres
- Validado no frontend E backend

### 3. **Senha Diferente**
- Nova senha deve ser diferente da antiga
- Validado no frontend E backend

### 4. **Autenticação**
- Requer token válido
- Apenas usuário autenticado pode alterar

### 5. **Confirmação**
- Usuário deve digitar nova senha duas vezes
- Previne erros de digitação

---

## Dicas de Segurança (Exibidas na UI)

- ✅ Use uma senha forte com letras, números e caracteres especiais
- ✅ Não compartilhe sua senha com outras pessoas
- ✅ Altere sua senha periodicamente
- ✅ Não use a mesma senha em diferentes serviços
- ✅ A senha deve ter no mínimo 6 caracteres
- ✅ A nova senha deve ser diferente da senha antiga

---

## Acessibilidade

- ✅ Labels com `htmlFor` correto
- ✅ Campos obrigatórios marcados com `*`
- ✅ Placeholder descritivo
- ✅ Mensagens de erro claras
- ✅ Loading states visuais
- ✅ Feedback de sucesso/erro
- ✅ Enter para submeter
- ✅ Campos desabilitados durante loading

---

## Melhorias Futuras

1. **Força da Senha**
   - Indicador visual de força da senha
   - Sugestões de senha forte

2. **Requisitos Mais Rigorosos**
   - Mínimo 8 caracteres
   - Pelo menos 1 letra maiúscula
   - Pelo menos 1 número
   - Pelo menos 1 caractere especial

3. **Histórico de Senhas**
   - Não permitir senhas usadas recentemente
   - Guardar hash das últimas N senhas

4. **2FA / MFA**
   - Autenticação de dois fatores
   - Código via SMS/Email ao alterar senha

5. **Auditoria**
   - Log de alterações de senha
   - Notificar usuário por email

6. **Recuperação de Senha**
   - Esqueci minha senha
   - Reset via email

---

## Testes

### Teste 1: Alterar Senha com Sucesso
```
1. Preencher senha atual correta
2. Preencher nova senha válida (>= 6 chars, diferente)
3. Confirmar nova senha
4. Clicar em "Alterar Senha"
✅ Sucesso: Toast "Senha alterada com sucesso"
✅ Campos limpos
```

### Teste 2: Senha Atual Incorreta
```
1. Preencher senha atual INCORRETA
2. Preencher nova senha válida
3. Confirmar nova senha
4. Clicar em "Alterar Senha"
❌ Erro: "Senha antiga incorreta"
```

### Teste 3: Nova Senha Curta
```
1. Preencher senha atual correta
2. Preencher nova senha com < 6 caracteres
3. Confirmar nova senha
4. Clicar em "Alterar Senha"
❌ Erro: "A nova senha deve ter no mínimo 6 caracteres"
```

### Teste 4: Senhas Iguais
```
1. Preencher senha atual correta
2. Preencher nova senha IGUAL à atual
3. Confirmar nova senha
4. Clicar em "Alterar Senha"
❌ Erro: "A nova senha deve ser diferente da senha atual"
```

### Teste 5: Confirmação Diferente
```
1. Preencher senha atual correta
2. Preencher nova senha válida
3. Confirmar com senha DIFERENTE
4. Clicar em "Alterar Senha"
❌ Erro: "As senhas não coincidem"
```

---

## Status

✅ **Implementado e Funcional**

- [x] Endpoint da API integrado
- [x] Validações frontend
- [x] Validações backend
- [x] Interface amigável
- [x] Loading states
- [x] Mensagens de erro
- [x] Toast de sucesso
- [x] Limpar campos após sucesso
- [x] Enter para submeter
- [x] Campos desabilitados durante loading
- [x] Card informativo com dicas
- [x] Documentação completa
