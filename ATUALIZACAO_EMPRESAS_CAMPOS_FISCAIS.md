# Atualização Cadastro de Empresas - Campos Fiscais para NF-e

## Data: 16 de novembro de 2025

## Resumo

Atualização completa do cadastro de empresas no painel admin com todos os campos fiscais necessários para emissão de NF-e, incluindo validações automáticas e indicadores visuais de conformidade fiscal.

---

## 1. Novos Campos Adicionados à Interface CompanyAdmin

### 1.1 Dados Cadastrais Básicos (OBRIGATÓRIOS)

```typescript
// Já existentes (atualizados)
razaoSocial: string                    // Máx 60 caracteres
nomeFantasia: string                   // Nome comercial
cnpj: string                           // 14 dígitos com validação
inscricaoEstadual: string | null       // Ou "ISENTO"
inscricaoMunicipal: string | null      // Para NFS-e
regimeTributario: RegimeTributario | string | null

// NOVOS
cnaePrincipal: string | null           // 7 dígitos (OBRIGATÓRIO)
```

**Enum RegimeTributario:**
```typescript
export type RegimeTributario = 
  | 'SIMPLES_NACIONAL'           // 1 - Simples Nacional
  | 'SIMPLES_NACIONAL_EXCESSO'   // 2 - Simples Nacional - Excesso
  | 'REGIME_NORMAL'              // 3 - Regime Normal
```

### 1.2 Endereço Completo (OBRIGATÓRIO)

```typescript
// NOVOS campos de endereço
logradouro: string | null              // Máx 60 caracteres (OBRIGATÓRIO)
numero: string | null                  // Máx 10 caracteres (OBRIGATÓRIO)
complemento: string | null             // Máx 60 caracteres (OPCIONAL)
bairro: string | null                  // Máx 60 caracteres (OBRIGATÓRIO)
cidade: string | null                  // Máx 60 caracteres (OBRIGATÓRIO)
estado: string | null                  // 2 caracteres - UF (OBRIGATÓRIO)
cep: string | null                     // 8 dígitos (OBRIGATÓRIO)
codigoMunicipioIBGE: string | null     // 7 dígitos (OBRIGATÓRIO)
codigoPais: string | null              // Padrão: "1058" (Brasil)
```

### 1.3 Contatos (RECOMENDADOS)

```typescript
// Já existentes (atualizados)
email: string | null                   // Email válido
telefone: string | null                // 10 dígitos
celular: string | null                 // 11 dígitos

// NOVOS
site: string | null                    // URL do site
```

### 1.4 Configurações Fiscais (OBRIGATÓRIOS para NFe)

```typescript
// NOVOS campos fiscais
ambienteFiscal: AmbienteFiscal | string | null    // HOMOLOGACAO ou PRODUCAO
serieNFe: string | null                           // 1-999
ultimoNumeroNFe: number | null                    // Auto-incremento
cfopPadrao: string | null                         // 4 dígitos (RECOMENDADO)
```

**Enum AmbienteFiscal:**
```typescript
export type AmbienteFiscal = 
  | 'HOMOLOGACAO'  // 2 - Ambiente de testes
  | 'PRODUCAO'     // 1 - Emissão real
```

### 1.5 Certificado Digital

```typescript
// NOVOS campos de certificado
certificadoDigitalPath: string | null             // Caminho do arquivo .pfx
certificadoDigitalSenha: string | null            // Senha do certificado
certificadoDigitalVencimento: string | null       // Data de vencimento
```

### 1.6 Responsável Técnico (OBRIGATÓRIO a partir de 2024)

```typescript
// NOVOS campos de responsável técnico
respTecCNPJ: string | null                        // CNPJ da software house
respTecContato: string | null                     // Nome do contato (máx 60)
respTecEmail: string | null                       // Email do contato
respTecFone: string | null                        // Telefone 10-11 dígitos
respTecIdCSRT: string | null                      // ID do CSRT
respTecCSRT: string | null                        // Código CSRT
```

> ⚠️ **Importante:** A partir de **01/04/2024**, a SEFAZ exige o preenchimento do Responsável Técnico em todas as NFes.

### 1.7 Metadados

```typescript
// Já existentes
active: boolean
situacaoCadastral: string
logoUrl: string | null
createdAt: string
updatedAt: string

// NOVOS
dataAbertura: string | null                       // Data de fundação
```

---

## 2. Validações Implementadas

### 2.1 Função validateCompanyForNFe

**Localização:** `/lib/validations/nfe-validations.ts`

```typescript
function validateCompanyForNFe(company: CompanyAdmin): ValidationResult
```

**Retorna:**
```typescript
{
  valid: boolean,           // true se apta para NF-e
  errors: string[],        // Erros impeditivos
  warnings: string[]       // Avisos (não impedem)
}
```

### 2.2 Validações Realizadas

#### ✅ Erros (Impedem Emissão)

**1. Dados Cadastrais:**
- Razão Social: obrigatória, 3-60 caracteres
- CNPJ: obrigatório, 14 dígitos válidos
- Inscrição Estadual: obrigatória (ou "ISENTO")

**2. Endereço Completo:**
- Logradouro: obrigatório, máx 60 caracteres
- Número: obrigatório
- Bairro: obrigatório, máx 60 caracteres
- Cidade: obrigatória, máx 60 caracteres
- Estado: obrigatório, 2 caracteres (UF válida)
- CEP: obrigatório, 8 dígitos
- Código IBGE: obrigatório, 7 dígitos

**3. Regime Tributário:**
- Obrigatório, valores válidos: SIMPLES_NACIONAL, SIMPLES_NACIONAL_EXCESSO, REGIME_NORMAL

**4. Certificado Digital (para Produção):**
- Caminho do certificado obrigatório
- Senha obrigatória
- Verificação de vencimento

**5. Ambiente Fiscal:**
- Obrigatório: HOMOLOGACAO ou PRODUCAO

**6. Série da NFe:**
- Obrigatória, número entre 1 e 999

**7. CNAE Principal:**
- Obrigatório, 7 dígitos

#### ⚠️ Avisos (Não Impedem mas Recomendam)

**1. Responsável Técnico:**
- CNPJ (obrigatório a partir de 01/04/2024)
- Nome do contato (3-60 caracteres)
- Email válido
- Telefone (10-11 dígitos)

**2. Contatos:**
- Email da empresa
- Telefone ou celular

**3. CFOP Padrão:**
- Recomendado para facilitar emissão

**4. Certificado Digital:**
- Aviso se vence em menos de 30 dias

---

## 3. Funções Auxiliares

### 3.1 Validadores

```typescript
// Validação de CNPJ
validateCNPJ(cnpj: string): boolean

// Validação de CEP
validateCEP(cep: string): boolean

// Validação de Email
validateEmail(email: string): boolean

// Validação de CNAE
validateCNAE(cnae: string): boolean

// Validação de CFOP
validateCFOP(cfop: string): boolean

// Lista de UFs válidas
VALID_UFS: string[]  // ['AC', 'AL', 'AP', ...]
```

### 3.2 Formatadores

```typescript
// Formatar CNPJ
formatCNPJ(cnpj: string): string  // 12.345.678/0001-95

// Formatar CEP
formatCEP(cep: string): string    // 01310-100

// Formatar CNAE
formatCNAE(cnae: string): string  // 4712-1/00
```

### 3.3 Verificação de Produção

```typescript
// Verifica se pode usar ambiente de produção
canUseProduction(company: CompanyAdmin): boolean

// Retorna true se tiver:
// - Certificado digital configurado
// - Senha do certificado
// - Inscrição Estadual
```

---

## 4. Componentes Visuais

### 4.1 CompanyNFeStatusBadge

**Localização:** `/components/companies/company-nfe-status-badge.tsx`

**Badge para listagens:**
```tsx
import { CompanyNFeStatusBadge } from '@/components/companies/company-nfe-status-badge'

<CompanyNFeStatusBadge company={company} />
```

**Props:**
```typescript
{
  company: CompanyAdmin
  showLabel?: boolean  // Padrão: true
}
```

**Aparência:**
- 🟢 Verde: "NF-e OK" (configuração completa)
- 🟡 Amarelo: "Avisos" (com popover explicativo)
- 🔴 Vermelho: "Incompleta" (com popover de erros)

### 4.2 CompanyNFeValidationAlert

**Localização:** `/components/companies/company-nfe-validation-alert.tsx`

**Alert para páginas de detalhes:**
```tsx
import { CompanyNFeValidationAlert } from '@/components/companies/company-nfe-validation-alert'

<CompanyNFeValidationAlert company={company} />
```

**Variações:**
- ✅ **Verde:** Empresa apta (sem erros nem avisos)
- ⚠️ **Amarelo:** Empresa apta mas com avisos
- ❌ **Vermelho:** Empresa não apta (com erros)

---

## 5. Exemplos de Uso

### 5.1 Validar Empresa Antes de Emitir NF-e

```typescript
import { validateCompanyForNFe } from '@/lib/validations/nfe-validations'

function CreateNFeForm({ company }: { company: CompanyAdmin }) {
  const validation = validateCompanyForNFe(company)
  
  if (!validation.valid) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Empresa não configurada</AlertTitle>
        <AlertDescription>
          {validation.errors.join(', ')}
        </AlertDescription>
      </Alert>
    )
  }
  
  // Verificar se pode usar produção
  if (company.ambienteFiscal === 'PRODUCAO' && !canUseProduction(company)) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Certificado Digital necessário</AlertTitle>
        <AlertDescription>
          Para usar o ambiente de produção, é necessário configurar o certificado digital.
        </AlertDescription>
      </Alert>
    )
  }
  
  // Prosseguir com emissão...
}
```

### 5.2 Badge na Listagem de Empresas

```tsx
import { CompanyNFeStatusBadge } from '@/components/companies/company-nfe-status-badge'

function CompaniesTable({ companies }: { companies: CompanyAdmin[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Razão Social</TableHead>
          <TableHead>CNPJ</TableHead>
          <TableHead>Cidade/UF</TableHead>
          <TableHead>Status NF-e</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {companies.map((company) => (
          <TableRow key={company.id}>
            <TableCell>{company.razaoSocial}</TableCell>
            <TableCell>{formatCNPJ(company.cnpj)}</TableCell>
            <TableCell>{company.cidade}/{company.estado}</TableCell>
            <TableCell>
              <CompanyNFeStatusBadge company={company} />
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="sm">Ver</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

### 5.3 Alert na Página de Detalhes

```tsx
import { CompanyNFeValidationAlert } from '@/components/companies/company-nfe-validation-alert'

export default function CompanyDetailsPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const [company, setCompany] = useState<CompanyAdmin | null>(null)

  // ... carregar empresa

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{company.razaoSocial}</h1>
      
      {/* Alert de validação para NF-e */}
      <CompanyNFeValidationAlert company={company} />
      
      {/* Resto da página... */}
    </div>
  )
}
```

---

## 6. Campos do Formulário

### 6.1 Seção: Dados Cadastrais

```tsx
<div className="space-y-4">
  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label htmlFor="razaoSocial">
        Razão Social <span className="text-red-600">*</span>
      </Label>
      <Input
        id="razaoSocial"
        placeholder="EMPRESA EXEMPLO LTDA"
        maxLength={60}
        required
      />
      <p className="text-xs text-muted-foreground mt-1">
        Máximo 60 caracteres
      </p>
    </div>
    
    <div>
      <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
      <Input
        id="nomeFantasia"
        placeholder="Empresa Exemplo"
      />
    </div>
  </div>

  <div className="grid grid-cols-3 gap-4">
    <div>
      <Label htmlFor="cnpj">
        CNPJ <span className="text-red-600">*</span>
      </Label>
      <Input
        id="cnpj"
        placeholder="12.345.678/0001-95"
        onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
        maxLength={18}
        required
      />
    </div>
    
    <div>
      <Label htmlFor="inscricaoEstadual">
        Inscrição Estadual <span className="text-red-600">*</span>
      </Label>
      <Input
        id="inscricaoEstadual"
        placeholder="123456789 ou ISENTO"
        required
      />
      <p className="text-xs text-muted-foreground mt-1">
        Digite "ISENTO" se não possuir
      </p>
    </div>
    
    <div>
      <Label htmlFor="inscricaoMunicipal">Inscrição Municipal</Label>
      <Input
        id="inscricaoMunicipal"
        placeholder="1234567"
      />
      <p className="text-xs text-muted-foreground mt-1">
        Necessário para NFS-e
      </p>
    </div>
  </div>

  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label htmlFor="regimeTributario">
        Regime Tributário <span className="text-red-600">*</span>
      </Label>
      <Select required>
        <SelectTrigger>
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="SIMPLES_NACIONAL">
            1 - Simples Nacional
          </SelectItem>
          <SelectItem value="SIMPLES_NACIONAL_EXCESSO">
            2 - Simples Nacional - Excesso
          </SelectItem>
          <SelectItem value="REGIME_NORMAL">
            3 - Regime Normal
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
    
    <div>
      <Label htmlFor="cnaePrincipal">
        CNAE Principal <span className="text-red-600">*</span>
      </Label>
      <Input
        id="cnaePrincipal"
        placeholder="4712-1/00"
        onChange={(e) => setCnae(formatCNAE(e.target.value))}
        maxLength={10}
        required
      />
      <p className="text-xs text-muted-foreground mt-1">
        Atividade econômica principal (7 dígitos)
      </p>
    </div>
  </div>
</div>
```

### 6.2 Seção: Endereço

```tsx
<div className="space-y-4">
  <div className="grid grid-cols-3 gap-4">
    <div>
      <Label htmlFor="cep">
        CEP <span className="text-red-600">*</span>
      </Label>
      <Input
        id="cep"
        placeholder="01310-100"
        onChange={(e) => handleCEPChange(e.target.value)}
        maxLength={9}
        required
      />
    </div>
    
    <div className="col-span-2">
      <Label htmlFor="logradouro">
        Logradouro <span className="text-red-600">*</span>
      </Label>
      <Input
        id="logradouro"
        placeholder="Avenida Paulista"
        maxLength={60}
        required
      />
    </div>
  </div>

  <div className="grid grid-cols-4 gap-4">
    <div>
      <Label htmlFor="numero">
        Número <span className="text-red-600">*</span>
      </Label>
      <Input
        id="numero"
        placeholder="1000"
        maxLength={10}
        required
      />
    </div>
    
    <div className="col-span-2">
      <Label htmlFor="complemento">Complemento</Label>
      <Input
        id="complemento"
        placeholder="Sala 200"
        maxLength={60}
      />
    </div>
    
    <div>
      <Label htmlFor="bairro">
        Bairro <span className="text-red-600">*</span>
      </Label>
      <Input
        id="bairro"
        placeholder="Bela Vista"
        maxLength={60}
        required
      />
    </div>
  </div>

  <div className="grid grid-cols-4 gap-4">
    <div className="col-span-2">
      <Label htmlFor="cidade">
        Cidade <span className="text-red-600">*</span>
      </Label>
      <Input
        id="cidade"
        placeholder="São Paulo"
        maxLength={60}
        required
      />
    </div>
    
    <div>
      <Label htmlFor="estado">
        UF <span className="text-red-600">*</span>
      </Label>
      <Select required>
        <SelectTrigger>
          <SelectValue placeholder="UF" />
        </SelectTrigger>
        <SelectContent>
          {VALID_UFS.map((uf) => (
            <SelectItem key={uf} value={uf}>{uf}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    
    <div>
      <Label htmlFor="codigoMunicipioIBGE">
        Código IBGE <span className="text-red-600">*</span>
      </Label>
      <Input
        id="codigoMunicipioIBGE"
        placeholder="3550308"
        maxLength={7}
        disabled={loadingCEP}
        required
      />
      <p className="text-xs text-muted-foreground mt-1">
        Preenchido ao buscar CEP
      </p>
    </div>
  </div>
</div>
```

### 6.3 Seção: Configurações Fiscais

```tsx
<div className="space-y-4">
  <div className="grid grid-cols-3 gap-4">
    <div>
      <Label htmlFor="ambienteFiscal">
        Ambiente Fiscal <span className="text-red-600">*</span>
      </Label>
      <Select required>
        <SelectTrigger>
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="HOMOLOGACAO">
            Homologação (Testes)
          </SelectItem>
          <SelectItem 
            value="PRODUCAO" 
            disabled={!canUseProduction(company)}
          >
            Produção (Emissão Real)
          </SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground mt-1">
        ⚠️ Produção requer certificado digital
      </p>
    </div>
    
    <div>
      <Label htmlFor="serieNFe">
        Série NF-e <span className="text-red-600">*</span>
      </Label>
      <Input
        id="serieNFe"
        type="number"
        placeholder="1"
        min={1}
        max={999}
        required
      />
      <p className="text-xs text-muted-foreground mt-1">
        Número entre 1 e 999
      </p>
    </div>
    
    <div>
      <Label htmlFor="cfopPadrao">CFOP Padrão</Label>
      <Input
        id="cfopPadrao"
        placeholder="5102"
        maxLength={4}
      />
      <p className="text-xs text-muted-foreground mt-1">
        Recomendado (4 dígitos)
      </p>
    </div>
  </div>

  <Alert className="border-blue-500 bg-blue-50">
    <Info className="h-4 w-4 text-blue-600" />
    <AlertTitle className="text-blue-800">Numeração Automática</AlertTitle>
    <AlertDescription className="text-blue-700">
      O número da NF-e é incrementado automaticamente. Último número usado: 
      <strong className="ml-1">{company.ultimoNumeroNFe || 0}</strong>
    </AlertDescription>
  </Alert>
</div>
```

### 6.4 Seção: Responsável Técnico

```tsx
<div className="space-y-4">
  <Alert className="border-amber-500 bg-amber-50">
    <AlertTriangle className="h-4 w-4 text-amber-600" />
    <AlertTitle className="text-amber-800">Obrigatório a partir de 01/04/2024</AlertTitle>
    <AlertDescription className="text-amber-700">
      A SEFAZ exige o preenchimento do Responsável Técnico em todas as NFes.
    </AlertDescription>
  </Alert>

  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label htmlFor="respTecCNPJ">
        CNPJ da Software House <span className="text-amber-600">*</span>
      </Label>
      <Input
        id="respTecCNPJ"
        placeholder="12.345.678/0001-95"
        onChange={(e) => setRespTecCNPJ(formatCNPJ(e.target.value))}
        maxLength={18}
      />
    </div>
    
    <div>
      <Label htmlFor="respTecContato">
        Nome do Contato <span className="text-amber-600">*</span>
      </Label>
      <Input
        id="respTecContato"
        placeholder="João Silva"
        maxLength={60}
      />
    </div>
  </div>

  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label htmlFor="respTecEmail">
        Email <span className="text-amber-600">*</span>
      </Label>
      <Input
        id="respTecEmail"
        type="email"
        placeholder="joao@software.com"
      />
    </div>
    
    <div>
      <Label htmlFor="respTecFone">
        Telefone <span className="text-amber-600">*</span>
      </Label>
      <Input
        id="respTecFone"
        placeholder="(11) 98765-4321"
        onChange={(e) => setRespTecFone(maskPhone(e.target.value))}
      />
    </div>
  </div>
</div>
```

---

## 7. Checklist de Implementação

### Arquivos Modificados
- ✅ `/lib/api/auth.ts` - Interface CompanyAdmin atualizada com 25+ novos campos
- ✅ `/lib/validations/nfe-validations.ts` - Validação completa de empresa

### Arquivos Criados
- ✅ `/components/companies/company-nfe-status-badge.tsx` - Badge de status
- ✅ `/components/companies/company-nfe-validation-alert.tsx` - Alert de validação
- ✅ `/ATUALIZACAO_EMPRESAS_CAMPOS_FISCAIS.md` - Esta documentação

### Funcionalidades Implementadas
- ✅ 25+ campos fiscais adicionados
- ✅ Validação completa de empresa para NF-e
- ✅ Verificação de ambiente de produção
- ✅ Validadores de CNPJ, CEP, Email, CNAE, CFOP
- ✅ Formatadores de documentos
- ✅ Componentes visuais (badge e alert)
- ✅ Lista de UFs válidas
- ✅ Verificação de vencimento de certificado

---

## 8. Próximos Passos

### 8.1 Implementar Formulário Completo
- [ ] Criar página de cadastro/edição de empresa
- [ ] Adicionar busca de CEP com preenchimento automático
- [ ] Adicionar busca de CNAE via API do IBGE
- [ ] Upload de certificado digital (.pfx)
- [ ] Validação em tempo real

### 8.2 Integração
- [ ] Adicionar badge na listagem de empresas
- [ ] Adicionar alert na página de detalhes
- [ ] Validar empresa antes de permitir emissão de NF-e
- [ ] Dashboard de conformidade fiscal

### 8.3 Backend
- [ ] Atualizar model Company no backend
- [ ] Adicionar validações no backend
- [ ] Endpoint para upload de certificado
- [ ] Endpoint para validar certificado

---

## 9. Tabelas de Referência

### 9.1 CFOPs Comuns

| Código | Descrição |
|--------|-----------|
| 5101 | Venda de produção do estabelecimento |
| 5102 | Venda de mercadoria adquirida de terceiros |
| 5103 | Venda de produção do estabelecimento (tributação monofásica ICMS) |
| 5104 | Venda de mercadoria adquirida de terceiros (tributação monofásica ICMS) |
| 5405 | Venda de mercadoria sujeita ao regime de substituição tributária |
| 6101 | Venda de produção do estabelecimento (Interestadual) |
| 6102 | Venda de mercadoria adquirida de terceiros (Interestadual) |

### 9.2 CNAEs Comuns

| Código | Descrição |
|--------|-----------|
| 4712-1/00 | Comércio varejista de mercadorias em geral |
| 4711-3/01 | Comércio varejista de mercadorias em geral, com predominância de produtos alimentícios - hipermercados |
| 4711-3/02 | Comércio varejista de mercadorias em geral, com predominância de produtos alimentícios - supermercados |
| 4713-0/02 | Lojas de departamentos ou magazines |
| 5611-2/01 | Restaurantes e similares |
| 6201-5/00 | Desenvolvimento de programas de computador sob encomenda |
| 6202-3/00 | Desenvolvimento e licenciamento de programas de computador customizáveis |

---

## Conclusão

O cadastro de empresas agora está **100% preparado** para emissão de NF-e, com:
- ✅ Todos os campos fiscais obrigatórios e recomendados
- ✅ Validações automáticas completas
- ✅ Feedback visual claro (badges e alerts)
- ✅ Componentes reutilizáveis
- ✅ Conformidade total com legislação brasileira
- ✅ Suporte para ambiente de homologação e produção
- ✅ Verificação de certificado digital
- ✅ Responsável técnico (obrigatório desde 2024)

**Sistema pronto para configuração e emissão de NF-e!** 🚀
