# Middleware de Proteção de Rotas

## 📋 Visão Geral

O middleware (`middleware.ts`) protege automaticamente todas as rotas da aplicação, garantindo que apenas usuários autenticados possam acessar áreas restritas.

## 🔒 Como Funciona

### 1. Verificação de Token

O middleware verifica se existe um token JWT nos **cookies** da requisição:

```typescript
const token = request.cookies.get('token')?.value
```

### 2. Rotas Públicas

Apenas estas rotas são acessíveis sem autenticação:

- `/login` - Página de login

### 3. Rotas Protegidas

Todas as outras rotas principais requerem autenticação:

- `/admin` - Painel administrativo
- `/dashboard` - Dashboard do usuário
- `/selecionar-empresa` - Seleção de empresa
- `/portal-investidor` - Portal do investidor

## 🔄 Fluxo de Redirecionamento

### Usuário NÃO autenticado (sem token):

```
┌─────────────────────────────────────────────────────┐
│ Tenta acessar: /dashboard, /admin, etc.            │
│                                                     │
│ Middleware detecta: Sem token                       │
│                                                     │
│ Ação: Redireciona para /login?redirect=/dashboard  │
│       (salva URL original para retornar depois)     │
└─────────────────────────────────────────────────────┘
```

### Usuário autenticado (com token):

```
┌─────────────────────────────────────────────────────┐
│ Tenta acessar: /login                               │
│                                                     │
│ Middleware detecta: Tem token                       │
│                                                     │
│ Ação: Redireciona para /dashboard                   │
│       (já está logado, não precisa de login)        │
└─────────────────────────────────────────────────────┘
```

### Acesso à raiz `/`:

```
┌─────────────────────────────────────────────────────┐
│ Sem token → Redireciona para /login                 │
│ Com token → Redireciona para /dashboard             │
└─────────────────────────────────────────────────────┘
```

## 🎯 Parâmetro de Redirect

Quando o middleware redireciona para login, ele adiciona a URL original como parâmetro:

```
/dashboard → /login?redirect=/dashboard
```

Após o login bem-sucedido, o usuário é automaticamente redirecionado de volta:

```typescript
// No LoginForm
const redirectUrl = searchParams.get('redirect')
if (redirectUrl) {
  router.push(redirectUrl)
}
```

## 🛠️ Configuração

### Adicionar Nova Rota Pública

```typescript
const publicRoutes = [
  '/login',
  '/cadastro',        // ← Adicione aqui
  '/recuperar-senha', // ← Adicione aqui
]
```

### Adicionar Nova Rota Protegida

```typescript
const protectedRoutes = [
  '/admin',
  '/dashboard',
  '/selecionar-empresa',
  '/portal-investidor',
  '/minha-nova-rota', // ← Adicione aqui
]
```

## 🔍 Arquivos Ignorados

O middleware NÃO é executado para:

- `/api/*` - Rotas de API
- `/_next/static/*` - Arquivos estáticos do Next.js
- `/_next/image/*` - Otimização de imagens
- `favicon.ico` - Favicon
- Arquivos públicos (`.png`, `.jpg`, `.svg`, etc.)

## 💾 Armazenamento do Token

O sistema usa **dois lugares** para armazenar o token:

### 1. localStorage (Cliente)

```typescript
localStorage.setItem('token', token)
```

**Uso**: Requisições AJAX no lado do cliente

### 2. Cookies (Servidor + Cliente)

```typescript
document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
```

**Uso**: Middleware do Next.js (server-side)

**Configurações**:
- `path=/` - Disponível em todas as rotas
- `max-age=604800` - Expira em 7 dias
- `SameSite=Lax` - Proteção contra CSRF

## 🔐 Segurança

### Proteções Implementadas:

1. ✅ **SameSite=Lax**: Previne ataques CSRF
2. ✅ **Verificação no Servidor**: Middleware roda no servidor
3. ✅ **Expiração de Token**: Cookie expira em 7 dias
4. ✅ **Limpeza Completa**: Logout remove localStorage + cookie
5. ✅ **Redirecionamento Automático**: Token inválido → login

## 🧪 Testando

### Teste 1: Acesso sem login

```bash
# Abra o navegador em modo anônimo
# Tente acessar: http://localhost:3000/dashboard
# Resultado: Deve redirecionar para /login
```

### Teste 2: Login e acesso

```bash
# Faça login em: http://localhost:3000/login
# Tente acessar: http://localhost:3000/dashboard
# Resultado: Deve acessar normalmente
```

### Teste 3: Logout

```bash
# Clique em "Sair"
# Tente acessar: http://localhost:3000/dashboard
# Resultado: Deve redirecionar para /login
```

### Teste 4: Redirect após login

```bash
# Sem login, acesse: http://localhost:3000/admin
# Resultado: Redireciona para /login?redirect=/admin
# Faça login
# Resultado: Volta para /admin automaticamente
```

## 🚨 Troubleshooting

### Problema: Loop de redirecionamento

**Causa**: Token existe mas está inválido/expirado

**Solução**:
```javascript
// Limpar tudo manualmente no console do navegador
localStorage.clear()
document.cookie = 'token=; path=/; max-age=0'
location.reload()
```

### Problema: Não redireciona após login

**Causa**: Cookie não está sendo setado

**Verificar**:
```javascript
// Console do navegador
console.log(document.cookie)
// Deve mostrar: token=eyJhbG...
```

### Problema: Middleware não funciona

**Verificar**:
1. Arquivo `middleware.ts` está na raiz do projeto
2. Não está dentro de `/app` ou `/pages`
3. Exporta `config` com `matcher` correto

## 📚 Referências

- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [SameSite Cookies](https://web.dev/samesite-cookies-explained/)
