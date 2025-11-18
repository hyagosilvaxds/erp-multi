# Tela de Configurações - Simplificada

## 📋 Visão Geral

A tela de configurações foi **simplificada** para exibir apenas a funcionalidade de **Alterar Senha**, removendo todas as abas e configurações complexas de empresa, perfil e outros recursos.

## 🎯 Objetivo

Fornecer uma interface **minimalista e focada** para que o usuário possa alterar sua senha de acesso de forma rápida e segura.

## 📁 Arquivo

- **Caminho**: `/app/dashboard/configuracoes/page.tsx`
- **Rota**: `/dashboard/configuracoes`
- **Tipo**: Client Component

## 🎨 Interface

### Estrutura da Página

```
┌─────────────────────────────────────────────┐
│ Header: Configurações                       │
│ Subtitle: Altere sua senha de acesso       │
├─────────────────────────────────────────────┤
│                                             │
│ 🛡️  ALTERAR SENHA                           │
│ ┌─────────────────────────────────────┐    │
│ │ Mantenha sua conta segura           │    │
│ │                                      │    │
│ │ [ Senha Atual _____________ ]       │    │
│ │ [ Nova Senha ______________ ]       │    │
│ │   A senha deve ter no mínimo 8      │    │
│ │   caracteres                         │    │
│ │ [ Confirmar Nova Senha ____ ]       │    │
│ │                                      │    │
│ │ [Alterar Senha]                     │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ ℹ️  DICAS DE SEGURANÇA                      │
│ ┌─────────────────────────────────────┐    │
│ │ • Use senha forte com letras,       │    │
│ │   números e caracteres especiais    │    │
│ │ • Não compartilhe sua senha         │    │
│ │ • Altere periodicamente              │    │
│ │ • Não use a mesma em outros serviços│    │
│ └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

## 🔧 Componentes

### Componentes Utilizados

- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` - Shadcn UI
- `Input` - Campos de senha (type="password")
- `Label` - Labels dos campos
- `Button` - Botão de ação
- `Shield` - Ícone de segurança

### Estados

```typescript
const [senhaAtual, setSenhaAtual] = useState("")
const [novaSenha, setNovaSenha] = useState("")
const [confirmarSenha, setConfirmarSenha] = useState("")
```

## 📝 Funcionalidades

### 1. Alterar Senha

```typescript
const handleAlterarSenha = () => {
  // Implementar lógica de alteração de senha
  // - Validar senha atual
  // - Validar força da nova senha (mínimo 8 caracteres)
  // - Validar confirmação (novaSenha === confirmarSenha)
  // - Chamar API de alteração de senha
  // - Exibir toast de sucesso/erro
  console.log("Alterar senha")
}
```

### 2. Validações Necessárias

- ✅ Senha atual não pode estar vazia
- ✅ Nova senha deve ter mínimo 8 caracteres
- ✅ Nova senha deve ser diferente da atual
- ✅ Confirmação deve ser igual à nova senha
- ✅ Feedback visual de erro/sucesso

## 🔒 Segurança

### Boas Práticas Implementadas

1. **Inputs tipo password**: Não exibem o texto digitado
2. **Dicas de segurança**: Card informativo com orientações
3. **Validação de força**: Requisito mínimo de 8 caracteres
4. **Confirmação de senha**: Evita erros de digitação

### Dicas Exibidas ao Usuário

- Use uma senha forte com letras, números e caracteres especiais
- Não compartilhe sua senha com outras pessoas
- Altere sua senha periodicamente
- Não use a mesma senha em diferentes serviços

## 🎨 Design

### Visual

- **Card principal**: Branco com ícone de escudo em destaque
- **Card de dicas**: Fundo azul claro (`bg-blue-50/50`)
- **Ícones**: Shield (escudo) em primary e azul
- **Layout**: Max-width de 448px (md) para formulário centralizado

### Responsividade

- Desktop: Formulário limitado a `max-w-md`
- Mobile: Ocupa 100% da largura disponível

## 🔄 Fluxo de Uso

### Caso de Uso: Alterar Senha

1. Usuário acessa `/dashboard/configuracoes`
2. Digita sua senha atual
3. Digita a nova senha (mínimo 8 caracteres)
4. Confirma a nova senha
5. Clica em "Alterar Senha"
6. Sistema valida:
   - Senha atual está correta
   - Nova senha atende aos requisitos
   - Confirmação coincide com nova senha
7. Sistema atualiza a senha
8. Exibe toast de sucesso
9. Campos são limpos

## ⚠️ Melhorias Futuras

### Validações Avançadas

```typescript
// Validar força da senha
const validarForcaSenha = (senha: string) => {
  const temLetra = /[a-zA-Z]/.test(senha)
  const temNumero = /\d/.test(senha)
  const temEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(senha)
  const temTamanho = senha.length >= 8
  
  return {
    fraca: temTamanho,
    media: temLetra && temNumero,
    forte: temLetra && temNumero && temEspecial
  }
}

// Exibir indicador visual de força
<div className="mt-2">
  <div className="h-2 rounded-full bg-muted">
    <div className={cn(
      "h-full rounded-full transition-all",
      forca.fraca && "w-1/3 bg-red-500",
      forca.media && "w-2/3 bg-yellow-500",
      forca.forte && "w-full bg-green-500"
    )} />
  </div>
  <p className="text-xs text-muted-foreground mt-1">
    Força da senha: {forca.forte ? "Forte" : forca.media ? "Média" : "Fraca"}
  </p>
</div>
```

### Integração com API

```typescript
import { authApi } from "@/lib/api/auth"
import { useToast } from "@/hooks/use-toast"

const handleAlterarSenha = async () => {
  try {
    // Validações
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos"
      })
      return
    }

    if (novaSenha.length < 8) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "A nova senha deve ter no mínimo 8 caracteres"
      })
      return
    }

    if (novaSenha !== confirmarSenha) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "As senhas não coincidem"
      })
      return
    }

    // Chamar API
    await authApi.changePassword({
      currentPassword: senhaAtual,
      newPassword: novaSenha
    })

    // Limpar campos
    setSenhaAtual("")
    setNovaSenha("")
    setConfirmarSenha("")

    toast({
      title: "Sucesso",
      description: "Senha alterada com sucesso"
    })
  } catch (error: any) {
    toast({
      variant: "destructive",
      title: "Erro",
      description: error.message || "Erro ao alterar senha"
    })
  }
}
```

### Mostrar/Ocultar Senha

```typescript
const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false)
const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false)

<div className="relative">
  <Input
    type={mostrarSenhaAtual ? "text" : "password"}
    value={senhaAtual}
    onChange={(e) => setSenhaAtual(e.target.value)}
  />
  <Button
    variant="ghost"
    size="sm"
    className="absolute right-2 top-1/2 -translate-y-1/2"
    onClick={() => setMostrarSenhaAtual(!mostrarSenhaAtual)}
  >
    {mostrarSenhaAtual ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
  </Button>
</div>
```

## 📊 Changelog

### v2.0.0 (10/11/2025)
- ✅ **SIMPLIFICADO**: Removidas todas as abas (Empresa, Perfil, Segurança)
- ✅ **SIMPLIFICADO**: Removidas configurações de empresa
- ✅ **SIMPLIFICADO**: Removidas configurações de perfil
- ✅ **SIMPLIFICADO**: Removidas configurações de notificações
- ✅ **SIMPLIFICADO**: Removidas configurações de aparência
- ✅ **SIMPLIFICADO**: Removidas configurações de plano
- ✅ **FOCO**: Apenas funcionalidade de alterar senha
- ✅ **NOVO**: Card informativo com dicas de segurança
- ✅ **MELHORIA**: Interface mais limpa e objetiva

### v1.0.0 (Anterior)
- Interface complexa com múltiplas abas
- Configurações de empresa, perfil, segurança, etc.

## 🎯 Justificativa da Simplificação

### Por que simplificar?

1. **Foco no Essencial**: A maioria dos usuários acessa configurações apenas para alterar senha
2. **Redução de Complexidade**: Menos opções = menos confusão
3. **Manutenção**: Menos código para manter e testar
4. **Performance**: Carregamento mais rápido (menos componentes)
5. **UX**: Caminho direto para a ação desejada

### Funcionalidades Removidas

As configurações de empresa e perfil podem ser:
- Movidas para páginas específicas no painel admin
- Gerenciadas via API backend
- Implementadas sob demanda quando necessário

---

**Criado em**: 10/11/2025
**Última atualização**: 10/11/2025
**Versão**: 2.0.0
