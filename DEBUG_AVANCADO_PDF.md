# Debug Avançado: Erro ao Exportar PDF

## 🔍 Problema

O erro aparece **imediatamente** sem fazer chamada à API. Isso indica que o erro está acontecendo **antes** da requisição HTTP.

## ✅ Logs Adicionados

Foram adicionados logs em **TODAS** as etapas possíveis:

### 1. Renderização do Componente
```
DownloadPayrollPDFButton renderizado: { payrollId: '...', monthYear: '...' }
```

### 2. Click no Botão
```
BOTÃO FOLHA CLICADO - antes de chamar handleDownload
```

### 3. Início da Função handleDownload
```
=== INÍCIO handleDownload ===
payrollId: ...
monthYear: ...
```

### 4. Antes de Chamar a API
```
Iniciando download da folha: ...
```

### 5. Chamada à API
```
downloadPayrollPDF - iniciando download: ...
downloadPayrollPDF - companyId: ...
```

### 6. Resposta da API
```
downloadPayrollPDF - resposta recebida: { status: 200, ... }
```

---

## 🧪 Como Testar AGORA

### Passo 1: Abrir Console do Navegador
Pressione `F12` ou:
- **Mac**: `Cmd + Option + I`
- **Windows/Linux**: `Ctrl + Shift + I`

### Passo 2: Ir para aba Console

### Passo 3: Limpar o Console
Clique no ícone 🚫 ou pressione `Ctrl + L`

### Passo 4: Clicar em "Baixar PDF" ou "Holerite"

### Passo 5: Analisar os Logs

---

## 📊 Interpretação dos Logs

### Cenário 1: NENHUM log aparece

**Significado**: O componente não está sendo renderizado ou o botão não está conectado.

**Ação**: Verificar se:
- A página está carregada
- O botão aparece na tela
- Não há erro de import

### Cenário 2: Aparece apenas "renderizado", mas não "CLICADO"

```
DownloadPayrollPDFButton renderizado: { ... }
```

**Significado**: O componente foi criado mas o click não está funcionando.

**Causas Possíveis**:
- Botão está `disabled`
- Evento onClick não está anexado
- Há um overlay impedindo o click

**Ação**: Verificar se o botão está habilitado (não cinza/desabilitado)

### Cenário 3: Aparece "CLICADO" mas não "=== INÍCIO ==="

```
BOTÃO FOLHA CLICADO - antes de chamar handleDownload
```

**Significado**: A função handleDownload NÃO foi chamada ou falhou antes de entrar.

**Causas Possíveis**:
- Erro no catch do onClick
- handleDownload não existe

**Ação**: Ver se há erro logo após no console

### Cenário 4: Aparece "=== INÍCIO ===" mas para antes da API

```
=== INÍCIO handleDownload ===
payrollId: ...
monthYear: ...
```

**Significado**: Entrou na função mas falhou antes de chamar `downloadPayrollPDF`

**Causas Possíveis**:
- Erro em `setLoading(true)`
- Erro antes do try

**Ação**: Ver mensagem de erro no console

### Cenário 5: Para em "downloadPayrollPDF - iniciando"

```
Iniciando download da folha: ...
downloadPayrollPDF - iniciando download: ...
(para aqui)
```

**Significado**: Falhou ao obter `companyId`

**Causa**: `authApi.getSelectedCompany()` retornou `null` ou `undefined`

**Solução**: 
```typescript
// Verificar no console:
localStorage.getItem('selectedCompany')
```

Se retornar `null`, o usuário precisa selecionar uma empresa primeiro.

### Cenário 6: Erro na API

```
downloadPayrollPDF - erro: {
  message: "Request failed with status code 404",
  status: 404
}
```

**Significado**: Chegou na API mas o endpoint não existe

**Solução**: Implementar endpoint no backend

---

## 🎯 Possíveis Causas do Erro Imediato

Se o toast aparece **SEM NENHUM LOG**, o problema é um dos seguintes:

### 1. Toast sendo mostrado de outro lugar
Procurar no código por:
```typescript
toast({
  title: 'Erro',
  description: 'Não foi possível'
})
```

### 2. Erro acontecendo na renderização
O componente pode estar falhando ao renderizar e mostrando um erro genérico.

### 3. useToast disparando automaticamente
Verificar se há um `useEffect` que está disparando o toast.

### 4. Erro acontecendo antes do try-catch
O erro está acontecendo FORA do bloco try-catch.

---

## 🔎 Comando para Buscar Outros Toasts

No código, procure por:
```bash
grep -r "Não foi possível" app/dashboard/rh/
```

Isso mostrará se há outro lugar mostrando esse toast.

---

## 📝 Próximos Passos

1. **Abra o console do navegador**
2. **Clique em "Baixar PDF"**
3. **Copie TODOS os logs que aparecem**
4. **Envie para mim os logs**

Com os logs, saberei exatamente onde está falhando! 🎯

---

## 🚨 SE NENHUM LOG APARECER

Execute isso no console do navegador:

```javascript
// Verificar se empresa está selecionada
console.log('Empresa:', localStorage.getItem('selectedCompany'))

// Verificar se authApi existe
console.log('authApi:', typeof window.authApi)

// Verificar se downloadPayrollPDF está importado
console.log('Funções importadas:', { 
  downloadPayrollPDF: typeof downloadPayrollPDF,
  downloadFile: typeof downloadFile
})
```

E me envie o resultado! 📊
