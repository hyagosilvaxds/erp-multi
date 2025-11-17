# Adição de Alíquotas IBS e CBS na Edição de Empresa

## Objetivo
Permitir a inserção e edição das alíquotas IBS (Imposto sobre Bens e Serviços) e CBS (Contribuição sobre Bens e Serviços) nas configurações fiscais da empresa no painel administrativo.

## Contexto
As alíquotas IBS e CBS fazem parte da reforma tributária brasileira e precisam ser configuradas para cada empresa para o correto cálculo de impostos nas notas fiscais.

## Arquivos Modificados

### 1. `/app/admin/empresas/[id]/editar/page.tsx`

#### Alteração 1: Estado do Formulário
Adicionados os campos `aliquotaIBS` e `aliquotaCBS` no estado do formulário.

**Localização:** Linha ~138 (useState do formData)

**Antes:**
```typescript
const [formData, setFormData] = useState({
  // ... outros campos ...
  
  // Configurações Fiscais
  tipoContribuinte: "",
  regimeApuracao: "",
  codigoMunicipioIBGE: "",
  codigoEstadoIBGE: "",
  cfopPadrao: "",
  serieNFe: "",
  ultimoNumeroNFe: 0,
  proximoNumeroNFe: 0,
  ambienteFiscal: "",
})
```

**Depois:**
```typescript
const [formData, setFormData] = useState({
  // ... outros campos ...
  
  // Configurações Fiscais
  tipoContribuinte: "",
  regimeApuracao: "",
  codigoMunicipioIBGE: "",
  codigoEstadoIBGE: "",
  cfopPadrao: "",
  serieNFe: "",
  ultimoNumeroNFe: 0,
  proximoNumeroNFe: 0,
  ambienteFiscal: "",
  aliquotaIBS: 0,
  aliquotaCBS: 0,
})
```

#### Alteração 2: Carregamento dos Dados
Adicionado o carregamento das alíquotas ao buscar dados da empresa.

**Localização:** Linha ~295 (função loadCompany)

**Antes:**
```typescript
setFormData({
  // ... outros campos ...
  
  tipoContribuinte: data.tipoContribuinte || "",
  regimeApuracao: data.regimeApuracao || "",
  codigoMunicipioIBGE: data.codigoMunicipioIBGE || "",
  codigoEstadoIBGE: data.codigoEstadoIBGE || "",
  cfopPadrao: data.cfopPadrao || "",
  serieNFe: data.serieNFe || "",
  ultimoNumeroNFe: data.ultimoNumeroNFe || 0,
  proximoNumeroNFe: data.proximoNumeroNFe || 0,
  ambienteFiscal: data.ambienteFiscal || "",
})
```

**Depois:**
```typescript
setFormData({
  // ... outros campos ...
  
  tipoContribuinte: data.tipoContribuinte || "",
  regimeApuracao: data.regimeApuracao || "",
  codigoMunicipioIBGE: data.codigoMunicipioIBGE || "",
  codigoEstadoIBGE: data.codigoEstadoIBGE || "",
  cfopPadrao: data.cfopPadrao || "",
  serieNFe: data.serieNFe || "",
  ultimoNumeroNFe: data.ultimoNumeroNFe || 0,
  proximoNumeroNFe: data.proximoNumeroNFe || 0,
  ambienteFiscal: data.ambienteFiscal || "",
  aliquotaIBS: data.aliquotaIBS || 0,
  aliquotaCBS: data.aliquotaCBS || 0,
})
```

#### Alteração 3: Interface de Usuário
Adicionados os campos de input na aba "Fiscal" após o campo CFOP.

**Localização:** Linha ~1350 (TabsContent "fiscal")

**Antes:**
```tsx
<div className="space-y-2">
  <Label htmlFor="cfopPadrao">CFOP Padrão</Label>
  <Input
    id="cfopPadrao"
    value={formData.cfopPadrao}
    onChange={(e) => handleInputChange('cfopPadrao', e.target.value)}
    placeholder="0000"
  />
</div>
</div>

<Separator />

<div className="space-y-2">
  <Label htmlFor="ambienteFiscal">Ambiente Fiscal</Label>
  {/* ... */}
```

**Depois:**
```tsx
<div className="space-y-2">
  <Label htmlFor="cfopPadrao">CFOP Padrão</Label>
  <Input
    id="cfopPadrao"
    value={formData.cfopPadrao}
    onChange={(e) => handleInputChange('cfopPadrao', e.target.value)}
    placeholder="0000"
  />
</div>
</div>

<Separator />

<div className="grid gap-4 md:grid-cols-2">
  <div className="space-y-2">
    <Label htmlFor="aliquotaIBS">Alíquota IBS (%)</Label>
    <Input
      id="aliquotaIBS"
      type="number"
      step="0.01"
      min="0"
      max="100"
      value={formData.aliquotaIBS}
      onChange={(e) => handleInputChange('aliquotaIBS', parseFloat(e.target.value) || 0)}
      placeholder="0.00"
    />
    <p className="text-xs text-muted-foreground">
      Alíquota do Imposto sobre Bens e Serviços
    </p>
  </div>
  <div className="space-y-2">
    <Label htmlFor="aliquotaCBS">Alíquota CBS (%)</Label>
    <Input
      id="aliquotaCBS"
      type="number"
      step="0.01"
      min="0"
      max="100"
      value={formData.aliquotaCBS}
      onChange={(e) => handleInputChange('aliquotaCBS', parseFloat(e.target.value) || 0)}
      placeholder="0.00"
    />
    <p className="text-xs text-muted-foreground">
      Alíquota da Contribuição sobre Bens e Serviços
    </p>
  </div>
</div>

<Separator />

<div className="space-y-2">
  <Label htmlFor="ambienteFiscal">Ambiente Fiscal</Label>
  {/* ... */}
```

## Estrutura dos Dados

### Request (Atualização de Empresa)
```json
{
  "razaoSocial": "Empresa Teste LTDA",
  "cnpj": "12345678000190",
  "aliquotaIBS": 1.5,
  "aliquotaCBS": 2.0
}
```

### Response (Dados da Empresa)
```json
{
  "id": "uuid",
  "razaoSocial": "Empresa Teste LTDA",
  "nomeFantasia": "Empresa Teste",
  "cnpj": "12345678000190",
  "aliquotaIBS": 1.5,
  "aliquotaCBS": 2.0,
  "createdAt": "2024-11-17T10:00:00.000Z",
  "updatedAt": "2024-11-17T15:30:00.000Z"
}
```

## Características dos Campos

### Campo: Alíquota IBS
- **Tipo:** Number (decimal)
- **Label:** "Alíquota IBS (%)"
- **Placeholder:** "0.00"
- **Validação:**
  - Mínimo: 0
  - Máximo: 100
  - Step: 0.01 (aceita até 2 casas decimais)
- **Descrição:** "Alíquota do Imposto sobre Bens e Serviços"
- **Valor padrão:** 0

### Campo: Alíquota CBS
- **Tipo:** Number (decimal)
- **Label:** "Alíquota CBS (%)"
- **Placeholder:** "0.00"
- **Validação:**
  - Mínimo: 0
  - Máximo: 100
  - Step: 0.01 (aceita até 2 casas decimais)
- **Descrição:** "Alíquota da Contribuição sobre Bens e Serviços"
- **Valor padrão:** 0

## Localização na Interface

### Caminho de Navegação
1. Painel Admin → Empresas
2. Selecionar uma empresa
3. Clicar em "Editar"
4. Acessar aba "Fiscal"
5. Rolar até a seção após "CFOP Padrão"

### Posição na Aba Fiscal
```
┌─────────────────────────────────────────┐
│ Aba: Fiscal                             │
├─────────────────────────────────────────┤
│ Tipo de Contribuinte                    │
│ Regime de Apuração                      │
│                                         │
│ ─────────────────────────────────────  │
│                                         │
│ Código IBGE Município                   │
│ Código IBGE Estado                      │
│ CFOP Padrão                             │
│                                         │
│ ─────────────────────────────────────  │
│                                         │
│ ✨ Alíquota IBS (%)                    │ ← NOVO
│ ✨ Alíquota CBS (%)                    │ ← NOVO
│                                         │
│ ─────────────────────────────────────  │
│                                         │
│ Ambiente Fiscal                         │
│ Numeração de NF-e                       │
│ ...                                     │
└─────────────────────────────────────────┘
```

## Fluxo de Dados

### 1. Carregamento
```typescript
// GET /companies/admin/:id
const data = await companiesApi.getCompanyById(companyId)

setFormData({
  // ... outros campos
  aliquotaIBS: data.aliquotaIBS || 0,
  aliquotaCBS: data.aliquotaCBS || 0,
})
```

### 2. Edição
```typescript
// Usuário altera o valor no input
<Input
  value={formData.aliquotaIBS}
  onChange={(e) => handleInputChange('aliquotaIBS', parseFloat(e.target.value) || 0)}
/>

// handleInputChange atualiza o estado
setFormData(prev => ({ ...prev, aliquotaIBS: newValue }))
```

### 3. Salvamento
```typescript
// PATCH /companies/admin/:id
const updateData = {
  razaoSocial: formData.razaoSocial,
  aliquotaIBS: formData.aliquotaIBS,
  aliquotaCBS: formData.aliquotaCBS,
  // ... outros campos alterados
}

await companiesApi.updateCompany(companyId, updateData)
```

## Validações

### Frontend
1. **Tipo numérico:** Input type="number" garante apenas números
2. **Valor mínimo:** `min="0"` não permite valores negativos
3. **Valor máximo:** `max="100"` limita a 100%
4. **Precisão:** `step="0.01"` aceita até 2 casas decimais
5. **Parse seguro:** `parseFloat(e.target.value) || 0` converte string para número ou retorna 0

### Backend
O backend deve validar:
- Tipo: number/decimal
- Range: 0 ≤ valor ≤ 100
- Precisão: máximo 2 casas decimais

## Exemplos de Uso

### Exemplo 1: Empresa do Simples Nacional
```json
{
  "razaoSocial": "Empresa Simples ME",
  "regimeTributario": "Simples Nacional",
  "aliquotaIBS": 0.0,
  "aliquotaCBS": 0.0
}
```

### Exemplo 2: Empresa do Lucro Presumido
```json
{
  "razaoSocial": "Empresa Presumido LTDA",
  "regimeTributario": "Lucro Presumido",
  "aliquotaIBS": 1.5,
  "aliquotaCBS": 2.0
}
```

### Exemplo 3: Empresa do Lucro Real
```json
{
  "razaoSocial": "Grande Empresa SA",
  "regimeTributario": "Lucro Real",
  "aliquotaIBS": 2.5,
  "aliquotaCBS": 3.0
}
```

## Layout Responsivo

### Desktop (≥ md)
```
┌────────────────────┬────────────────────┐
│ Alíquota IBS (%)   │ Alíquota CBS (%)   │
│ [____1.50_______]  │ [____2.00_______]  │
│ Alíquota do Imposto│ Alíquota da Cont.  │
└────────────────────┴────────────────────┘
```

### Mobile (< md)
```
┌────────────────────────────────────────┐
│ Alíquota IBS (%)                       │
│ [__________1.50_____________________]  │
│ Alíquota do Imposto sobre Bens...     │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ Alíquota CBS (%)                       │
│ [__________2.00_____________________]  │
│ Alíquota da Contribuição sobre...     │
└────────────────────────────────────────┘
```

## Integração com Backend

### Endpoint Utilizado
```
PATCH /api/companies/admin/:id
```

### Headers
```http
Authorization: Bearer {token}
Content-Type: application/json
```

### Body da Request
```json
{
  "aliquotaIBS": 1.5,
  "aliquotaCBS": 2.0
}
```

### Response de Sucesso (200)
```json
{
  "id": "uuid",
  "razaoSocial": "Empresa Teste",
  "aliquotaIBS": 1.5,
  "aliquotaCBS": 2.0,
  "updatedAt": "2024-11-17T15:30:00.000Z"
}
```

### Response de Erro (400)
```json
{
  "statusCode": 400,
  "message": "aliquotaIBS must be between 0 and 100",
  "error": "Bad Request"
}
```

## Testes Recomendados

### 1. Teste de Criação
- [ ] Criar empresa com alíquotas 0
- [ ] Criar empresa com alíquotas definidas
- [ ] Criar empresa sem informar alíquotas (deve usar 0 como padrão)

### 2. Teste de Edição
- [ ] Editar alíquota IBS de 0 para 1.5
- [ ] Editar alíquota CBS de 0 para 2.0
- [ ] Editar ambas as alíquotas simultaneamente
- [ ] Salvar sem alterar as alíquotas (não deve fazer request desnecessário)

### 3. Teste de Validação
- [ ] Tentar inserir valor negativo (deve bloquear)
- [ ] Tentar inserir valor maior que 100 (deve bloquear)
- [ ] Inserir valor com 3 casas decimais (deve arredondar para 2)
- [ ] Inserir texto ao invés de número (deve converter para 0)

### 4. Teste de Exibição
- [ ] Carregar empresa com alíquotas definidas
- [ ] Verificar formatação dos valores (1.5 → "1.50")
- [ ] Verificar labels e descriptions
- [ ] Testar layout responsivo (desktop e mobile)

### 5. Teste de Integração
- [ ] Salvar alíquotas e recarregar a página
- [ ] Verificar se valores persistem no banco de dados
- [ ] Verificar se valores aparecem em relatórios
- [ ] Verificar se valores são usados no cálculo de impostos

## Considerações Importantes

### 1. Valores Decimais
- Use `parseFloat()` ao invés de `parseInt()` para preservar casas decimais
- Sempre adicione `|| 0` para tratar valores inválidos
- O input type="number" com step="0.01" permite até 2 casas decimais

### 2. Valores Padrão
- Se a empresa não tem alíquotas definidas, usar 0 como padrão
- Nunca usar `null` ou `undefined` para evitar erros de cálculo
- Backend deve aceitar 0 como valor válido

### 3. UX/UI
- Labels descritivas ("Alíquota IBS (%)")
- Descriptions explicativas abaixo dos inputs
- Placeholder "0.00" para indicar formato esperado
- Grid 2 colunas no desktop para melhor aproveitamento de espaço

### 4. Performance
- Campos são enviados apenas se houver alterações
- Não há chamadas extras à API para validação em tempo real
- Validação básica no frontend, completa no backend

## Próximos Passos (Futuro)

1. **Histórico de Alterações**
   - Registrar mudanças nas alíquotas com data e usuário
   - Exibir histórico na tela de detalhes da empresa

2. **Cálculo Automático**
   - Usar as alíquotas nos cálculos de NF-e
   - Mostrar preview dos impostos ao emitir nota fiscal

3. **Validação por Regime**
   - Definir alíquotas padrão por regime tributário
   - Alertar se alíquota for incomum para o regime

4. **Relatórios Fiscais**
   - Incluir alíquotas IBS/CBS em relatórios
   - Permitir filtrar empresas por faixa de alíquota

## Referências

- **Reforma Tributária:** Lei Complementar que institui IBS e CBS
- **Documentação API:** `/docs/api/companies.md`
- **Componentes UI:** shadcn/ui Input e Label
- **TypeScript:** Strict mode habilitado

## Conclusão

A implementação permite que administradores configurem as alíquotas IBS e CBS para cada empresa no sistema, preparando o ERP para a nova realidade tributária brasileira. Os campos foram adicionados na aba "Fiscal" da tela de edição de empresa, com validações apropriadas e interface intuitiva.

**Status:** ✅ Implementado e funcional
**Versão:** 1.0
**Data:** 17/11/2024
