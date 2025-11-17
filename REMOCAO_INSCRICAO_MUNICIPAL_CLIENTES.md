# Remoção do Campo Inscrição Municipal - Clientes ✅

## 📋 Resumo

Removido o campo "Inscrição Municipal" da criação de clientes conforme solicitado.

---

## 🔧 Alterações Realizadas

### Arquivo: `app/dashboard/clientes/novo/page.tsx`

#### 1. **Estado Removido**
```typescript
// ANTES
const [municipalRegistration, setMunicipalRegistration] = useState('')

// DEPOIS
// ❌ Linha removida
```

#### 2. **Campo do Formulário Removido**
```tsx
// ANTES
<div className="space-y-2">
  <Label htmlFor="municipalRegistration">Inscrição Municipal</Label>
  <Input
    id="municipalRegistration"
    value={municipalRegistration}
    onChange={(e) => setMunicipalRegistration(e.target.value)}
    placeholder="Digite a IM"
  />
  <p className="text-xs text-muted-foreground">
    Necessário para emissão de NFS-e (Nota Fiscal de Serviço Eletrônica).
  </p>
</div>

// DEPOIS
// ❌ Campo completamente removido
```

#### 3. **Envio na API Removido**
```typescript
// ANTES
data.municipalRegistration = municipalRegistration || undefined

// DEPOIS
// ❌ Linha removida
```

---

## ✅ Verificações

- ✅ Estado `municipalRegistration` removido
- ✅ Campo do formulário removido da interface
- ✅ Remoção do envio para a API
- ✅ Nenhum erro de compilação TypeScript
- ✅ Listagem de clientes verificada (não exibe o campo)
- ✅ Página de edição verificada (não possui o campo)

---

## 📝 Nota

O campo **Inscrição Municipal** foi completamente removido apenas da **criação de novos clientes**. 

- A API ainda pode receber e armazenar este campo se enviado por outras fontes
- Clientes existentes que já possuem inscrição municipal continuam com o dado no banco
- Este campo era descrito como "Necessário para emissão de NFS-e (Nota Fiscal de Serviço Eletrônica)"

Se necessário remover completamente o campo do sistema (incluindo banco de dados e API), será necessário:
1. Criar migration no banco de dados
2. Atualizar interfaces/types da API
3. Remover do schema Prisma (se aplicável)

---

**Data da Alteração**: 16 de novembro de 2025
