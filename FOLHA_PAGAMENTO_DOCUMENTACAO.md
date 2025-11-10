# Folha de Pagamento - Documentação Completa

## 📋 Visão Geral

Sistema completo de gestão de folha de pagamento com cálculo automático de proventos, descontos, INSS, IRRF e FGTS, incluindo geração de holerites individuais e folhas consolidadas em PDF.

---

## 🔐 Permissões

| Permissão | Descrição |
|-----------|-----------|
| `payroll.create` | Criar folhas de pagamento |
| `payroll.read` | Visualizar folhas e holerites |
| `payroll.update` | Editar e ajustar folhas |
| `payroll.delete` | Excluir folhas em rascunho |
| `payroll.approve` | Aprovar folhas calculadas |
| `payroll.pay` | Marcar folhas como pagas |

---

## 📁 Estrutura de Arquivos

```
lib/api/
  └── payroll.ts                    # API client completa

components/payroll/
  └── download-helpers.tsx          # Componentes de download de PDF

app/dashboard/rh/folha-pagamento/
  ├── page.tsx                      # Listagem de folhas
  ├── [id]/page.tsx                 # Detalhes da folha
  └── nova/page.tsx                 # Criar nova folha (criar)
```

---

## 🔄 Fluxo de Status

```
DRAFT (Rascunho)
  ↓ calcular
CALCULATED (Calculada)
  ↓ aprovar
APPROVED (Aprovada)
  ↓ marcar como paga
PAID (Paga)
```

**Regras:**
- Apenas folhas em `DRAFT` podem ser excluídas
- Apenas folhas em `DRAFT` podem ter dados editados
- Apenas folhas em `CALCULATED` podem ser aprovadas
- Apenas folhas em `APPROVED` podem ser marcadas como pagas

---

## 🎯 API Endpoints

### 1. Listar Folhas de Pagamento

```typescript
GET /payroll
```

**Parâmetros de Query:**
```typescript
{
  page?: number           // Página (padrão: 1)
  limit?: number          // Itens por página (padrão: 10, máx: 100)
  status?: PayrollStatus  // DRAFT | CALCULATED | APPROVED | PAID
  type?: PayrollType      // MONTHLY | WEEKLY | DAILY | ADVANCE
  referenceMonth?: number // 1-12
  referenceYear?: number  // Ex: 2024
  search?: string         // Buscar por descrição
}
```

**Resposta:**
```typescript
{
  data: PayrollListItem[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
```

### 2. Criar Nova Folha

```typescript
POST /payroll
```

**Body:**
```typescript
{
  referenceMonth: number    // 1-12
  referenceYear: number     // Ex: 2024
  type: PayrollType         // MONTHLY | WEEKLY | DAILY | ADVANCE
  startDate: string         // ISO 8601
  endDate: string           // ISO 8601
  paymentDate: string       // ISO 8601 (>= endDate)
}
```

### 3. Buscar Folha por ID

```typescript
GET /payroll/:id
```

**Resposta:** Retorna objeto `Payroll` completo com itens e relacionamentos.

### 4. Atualizar Folha

```typescript
PATCH /payroll/:id
```

**Body:**
```typescript
{
  paymentDate?: string  // Nova data de pagamento
  notes?: string        // Observações
}
```

**Restrição:** Apenas folhas em status `DRAFT`.

### 5. Calcular Folha

```typescript
POST /payroll/:id/calculate
```

**Ação:** Calcula automaticamente todos os colaboradores ativos:
- Adiciona salário base
- Adiciona proventos configurados
- Calcula INSS (tabela progressiva)
- Calcula IRRF (tabela progressiva)
- Calcula FGTS (8%)
- Aplica descontos configurados
- Muda status para `CALCULATED`

### 6. Adicionar/Ajustar Item

```typescript
POST /payroll/:id/items
```

**Body:**
```typescript
{
  employeeId: string
  workDays: number        // 1-31
  earnings?: Array<{
    name: string
    value: number
  }>
  deductions?: Array<{
    name: string
    value: number
  }>
  notes?: string
}
```

### 7. Aprovar Folha

```typescript
POST /payroll/:id/approve
```

**Restrição:** Apenas folhas em status `CALCULATED`.

### 8. Marcar Como Paga

```typescript
POST /payroll/:id/pay
```

**Restrição:** Apenas folhas em status `APPROVED`.

### 9. Excluir Folha

```typescript
DELETE /payroll/:id
```

**Restrição:** Apenas folhas em status `DRAFT`.

### 10. Estatísticas

```typescript
GET /payroll/stats?referenceMonth=11&referenceYear=2024
```

**Resposta:**
```typescript
{
  totalPayrolls: number
  totalEmployees: number
  totalEarnings: string
  totalDeductions: string
  totalNetAmount: string
  averageNetAmount: string
  byStatus: {
    DRAFT: number
    CALCULATED: number
    APPROVED: number
    PAID: number
  }
  byType: {
    MONTHLY: number
    WEEKLY: number
    DAILY: number
    ADVANCE: number
  }
}
```

### 11. Baixar Holerite em PDF

```typescript
GET /payroll/:id/items/:itemId/payslip
```

**Response:** Blob (application/pdf)

**Conteúdo do PDF:**
- Dados da empresa
- Dados do colaborador
- Período de referência
- Tabela de proventos
- Tabela de descontos
- Valor líquido destacado
- Linhas de assinatura

### 12. Baixar Folha Consolidada em PDF

```typescript
GET /payroll/:id/pdf
```

**Response:** Blob (application/pdf)

**Conteúdo do PDF:**
- Dados da empresa
- Informações gerais (período, tipo, status)
- Tabela completa com todos os colaboradores
- Totalizadores (proventos, descontos, líquido)
- Informações de auditoria

---

## 🎨 Componentes de Interface

### DownloadPayrollPDFButton

Botão para baixar folha consolidada em PDF.

```tsx
import { DownloadPayrollPDFButton } from '@/components/payroll/download-helpers'

<DownloadPayrollPDFButton 
  payrollId="uuid-da-folha"
  monthYear="2024-11"
  variant="outline"
  size="sm"
/>
```

### DownloadPayslipButton

Botão para baixar holerite individual em PDF.

```tsx
import { DownloadPayslipButton } from '@/components/payroll/download-helpers'

<DownloadPayslipButton 
  payrollId="uuid-da-folha"
  itemId="uuid-do-item"
  employeeName="João Silva"
  monthYear="2024-11"
  variant="ghost"
  size="sm"
/>
```

### usePayrollDownload Hook

Hook customizado para gerenciar downloads programaticamente.

```tsx
import { usePayrollDownload } from '@/components/payroll/download-helpers'

function MyComponent() {
  const { loading, downloadPayroll, downloadPayslip } = usePayrollDownload()

  const handleDownloadPayroll = async () => {
    const success = await downloadPayroll('payroll-id', '2024-11')
    if (success) {
      console.log('Download concluído!')
    }
  }

  const handleDownloadPayslip = async () => {
    const success = await downloadPayslip(
      'payroll-id',
      'item-id',
      'João Silva',
      '2024-11'
    )
  }

  return (
    <button onClick={handleDownloadPayroll} disabled={loading}>
      {loading ? 'Baixando...' : 'Baixar PDF'}
    </button>
  )
}
```

---

## 💻 Uso da API Client

### Funções Disponíveis

```typescript
import { payrollApi } from '@/lib/api/payroll'

// Listar folhas
const { data, meta } = await payrollApi.getAll({ 
  page: 1, 
  limit: 10,
  status: 'CALCULATED'
})

// Buscar por ID
const payroll = await payrollApi.getById('uuid')

// Criar nova folha
const newPayroll = await payrollApi.create({
  referenceMonth: 11,
  referenceYear: 2024,
  type: 'MONTHLY',
  startDate: '2024-11-01',
  endDate: '2024-11-30',
  paymentDate: '2024-12-05'
})

// Atualizar folha
await payrollApi.update('uuid', {
  paymentDate: '2024-12-10',
  notes: 'Ajuste de data'
})

// Calcular folha
await payrollApi.calculate('uuid')

// Adicionar/ajustar item
await payrollApi.createOrUpdateItem('payroll-uuid', {
  employeeId: 'employee-uuid',
  workDays: 28,
  earnings: [
    { name: 'Hora Extra', value: 500 }
  ],
  deductions: [
    { name: 'Vale Transporte', value: 150 }
  ]
})

// Aprovar folha
await payrollApi.approve('uuid')

// Marcar como paga
await payrollApi.markAsPaid('uuid')

// Excluir folha
await payrollApi.delete('uuid')

// Obter estatísticas
const stats = await payrollApi.getStats(11, 2024)

// Baixar PDF da folha
const pdfBlob = await payrollApi.downloadPDF('uuid')
payrollApi.downloadFile(pdfBlob, 'folha-2024-11.pdf')

// Baixar holerite
const payslipBlob = await payrollApi.downloadPayslip('payroll-uuid', 'item-uuid')
payrollApi.downloadFile(payslipBlob, 'holerite-joao-silva.pdf')
```

---

## 📊 Tipos TypeScript

### PayrollStatus

```typescript
type PayrollStatus = 'DRAFT' | 'CALCULATED' | 'APPROVED' | 'PAID'
```

### PayrollType

```typescript
type PayrollType = 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'ADVANCE'
```

### Payroll (Completo)

```typescript
interface Payroll {
  id: string
  companyId: string
  referenceMonth: number
  referenceYear: number
  type: PayrollType
  status: PayrollStatus
  startDate: string
  endDate: string
  paymentDate: string
  totalEarnings: string
  totalDeductions: string
  netAmount: string
  notes?: string
  createdById: string
  approvedById?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
  company?: {
    id: string
    razaoSocial: string
    cnpj: string
  }
  items?: PayrollItem[]
  createdBy?: {
    id: string
    name: string
  }
  approvedBy?: {
    id: string
    name: string
  }
}
```

### PayrollItem

```typescript
interface PayrollItem {
  id: string
  payrollId: string
  employeeId: string
  workDays: number
  totalEarnings: string
  totalDeductions: string
  netAmount: string
  earnings: Array<{
    name: string
    value: string
  }>
  deductions: Array<{
    name: string
    value: string
  }>
  notes?: string
  employee: {
    id: string
    name: string
    cpf: string
    admissionDate: string
    position?: {
      id: string
      name: string
    }
  }
  createdAt: string
  updatedAt: string
}
```

---

## 🧪 Exemplos de Uso

### Criar e Processar uma Folha Completa

```typescript
// 1. Criar folha
const payroll = await payrollApi.create({
  referenceMonth: 11,
  referenceYear: 2024,
  type: 'MONTHLY',
  startDate: '2024-11-01',
  endDate: '2024-11-30',
  paymentDate: '2024-12-05'
})

// 2. Calcular automaticamente
await payrollApi.calculate(payroll.id)

// 3. Ajustar item específico (se necessário)
await payrollApi.createOrUpdateItem(payroll.id, {
  employeeId: 'employee-uuid',
  workDays: 28,
  earnings: [{ name: 'Bônus Especial', value: 1000 }]
})

// 4. Aprovar folha
await payrollApi.approve(payroll.id)

// 5. Baixar PDF
const blob = await payrollApi.downloadPDF(payroll.id)
payrollApi.downloadFile(blob, 'folha-2024-11.pdf')

// 6. Marcar como paga
await payrollApi.markAsPaid(payroll.id)
```

### Baixar Holerite Programaticamente

```typescript
const handleDownloadPayslip = async (
  payrollId: string,
  itemId: string,
  employeeName: string
) => {
  try {
    const blob = await payrollApi.downloadPayslip(payrollId, itemId)
    
    // Sanitizar nome para filename
    const sanitizedName = employeeName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase()
    
    const date = new Date().toISOString().slice(0, 7)
    payrollApi.downloadFile(blob, `holerite-${sanitizedName}-${date}.pdf`)
    
    console.log('Holerite baixado com sucesso!')
  } catch (error) {
    console.error('Erro ao baixar holerite:', error)
  }
}
```

---

## ✅ Funcionalidades Implementadas

- ✅ Listagem de folhas com filtros avançados
- ✅ Criação de folhas de pagamento
- ✅ Visualização detalhada de folhas
- ✅ Cálculo automático de colaboradores
- ✅ Ajuste manual de itens
- ✅ Aprovação de folhas
- ✅ Marcação como paga
- ✅ Exclusão de folhas em rascunho
- ✅ Estatísticas consolidadas
- ✅ Download de folha consolidada em PDF
- ✅ Download de holerites individuais em PDF
- ✅ Componentes reutilizáveis de download
- ✅ Hook customizado para downloads
- ✅ Integração completa com x-company-id
- ✅ Tratamento de erros e feedback visual
- ✅ Interface responsiva e intuitiva

---

## 🎯 Próximos Passos (Sugestões)

1. **Criar Página de Nova Folha** (`/nova/page.tsx`)
2. **Adicionar Histórico de Alterações** (audit log)
3. **Relatórios Customizados** (comparativos, tendências)
4. **Exportação para Excel** (complementar ao PDF)
5. **Envio de Holerites por Email** (automação)
6. **Recálculo Parcial** (recalcular apenas itens específicos)
7. **Templates de Proventos/Descontos** (por cargo/departamento)
8. **Dashboard Analítico** (gráficos e métricas)

---

## 📝 Observações Importantes

- Todas as requisições incluem automaticamente o header `x-company-id`
- Datas devem estar no formato ISO 8601
- Valores monetários são strings com precisão decimal
- PDFs são gerados no backend e retornados como Blob
- Folhas são soft deleted (não removidas fisicamente)
- Cálculos seguem tabelas fiscais vigentes (INSS, IRRF, FGTS)
