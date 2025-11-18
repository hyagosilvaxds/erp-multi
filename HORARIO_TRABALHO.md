# Sistema de Horário de Trabalho - Colaboradores

## 📋 Visão Geral

O sistema de horário de trabalho permite configurar de forma detalhada a jornada semanal de cada colaborador, incluindo horários de entrada, saída, intervalos e observações específicas.

## 🏗️ Estrutura de Dados

### Interface `DaySchedule`
```typescript
interface DaySchedule {
  isWorkDay: boolean           // Se é dia de trabalho
  startTime?: string           // Horário de entrada (formato HH:mm)
  endTime?: string             // Horário de saída (formato HH:mm)
  breakStartTime?: string      // Início do intervalo (formato HH:mm)
  breakEndTime?: string        // Fim do intervalo (formato HH:mm)
}
```

### Interface `WorkSchedule`
```typescript
interface WorkSchedule {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
  weeklyHours: number          // Carga horária semanal
  generalNotes?: string        // Observações gerais sobre o horário
}
```

## 📤 Exemplo de Payload JSON

### Horário Comercial Padrão (Segunda a Sexta, 8h às 18h)
```json
{
  "workSchedule": {
    "monday": {
      "isWorkDay": true,
      "startTime": "08:00",
      "endTime": "18:00",
      "breakStartTime": "12:00",
      "breakEndTime": "13:00"
    },
    "tuesday": {
      "isWorkDay": true,
      "startTime": "08:00",
      "endTime": "18:00",
      "breakStartTime": "12:00",
      "breakEndTime": "13:00"
    },
    "wednesday": {
      "isWorkDay": true,
      "startTime": "08:00",
      "endTime": "18:00",
      "breakStartTime": "12:00",
      "breakEndTime": "13:00"
    },
    "thursday": {
      "isWorkDay": true,
      "startTime": "08:00",
      "endTime": "18:00",
      "breakStartTime": "12:00",
      "breakEndTime": "13:00"
    },
    "friday": {
      "isWorkDay": true,
      "startTime": "08:00",
      "endTime": "18:00",
      "breakStartTime": "12:00",
      "breakEndTime": "13:00"
    },
    "saturday": {
      "isWorkDay": false
    },
    "sunday": {
      "isWorkDay": false
    },
    "weeklyHours": 44,
    "generalNotes": "Jornada comercial padrão"
  }
}
```

### Horário de Turno (Segunda a Sábado, 6h às 14h)
```json
{
  "workSchedule": {
    "monday": {
      "isWorkDay": true,
      "startTime": "06:00",
      "endTime": "14:00",
      "breakStartTime": "10:00",
      "breakEndTime": "10:15"
    },
    "tuesday": {
      "isWorkDay": true,
      "startTime": "06:00",
      "endTime": "14:00",
      "breakStartTime": "10:00",
      "breakEndTime": "10:15"
    },
    "wednesday": {
      "isWorkDay": true,
      "startTime": "06:00",
      "endTime": "14:00",
      "breakStartTime": "10:00",
      "breakEndTime": "10:15"
    },
    "thursday": {
      "isWorkDay": true,
      "startTime": "06:00",
      "endTime": "14:00",
      "breakStartTime": "10:00",
      "breakEndTime": "10:15"
    },
    "friday": {
      "isWorkDay": true,
      "startTime": "06:00",
      "endTime": "14:00",
      "breakStartTime": "10:00",
      "breakEndTime": "10:15"
    },
    "saturday": {
      "isWorkDay": true,
      "startTime": "06:00",
      "endTime": "12:00"
    },
    "sunday": {
      "isWorkDay": false
    },
    "weeklyHours": 44,
    "generalNotes": "Turno da manhã - produção"
  }
}
```

### Horário Flexível (Home Office)
```json
{
  "workSchedule": {
    "monday": {
      "isWorkDay": true,
      "startTime": "09:00",
      "endTime": "18:00",
      "breakStartTime": "12:00",
      "breakEndTime": "13:00"
    },
    "tuesday": {
      "isWorkDay": true,
      "startTime": "09:00",
      "endTime": "18:00",
      "breakStartTime": "12:00",
      "breakEndTime": "13:00"
    },
    "wednesday": {
      "isWorkDay": true,
      "startTime": "09:00",
      "endTime": "18:00",
      "breakStartTime": "12:00",
      "breakEndTime": "13:00"
    },
    "thursday": {
      "isWorkDay": true,
      "startTime": "09:00",
      "endTime": "18:00",
      "breakStartTime": "12:00",
      "breakEndTime": "13:00"
    },
    "friday": {
      "isWorkDay": true,
      "startTime": "09:00",
      "endTime": "17:00",
      "breakStartTime": "12:00",
      "breakEndTime": "13:00"
    },
    "saturday": {
      "isWorkDay": false
    },
    "sunday": {
      "isWorkDay": false
    },
    "weeklyHours": 40,
    "generalNotes": "Horário flexível - regime home office"
  }
}
```

## 🎨 Interface do Usuário

### Tela de Cadastro/Edição

A interface apresenta:

1. **Checkbox por Dia**: Marca se o dia é útil ou não
2. **Campos de Horário** (quando dia útil):
   - Entrada (time input)
   - Saída (time input)
   - Início do Intervalo (time input)
   - Fim do Intervalo (time input)

3. **Campos Globais**:
   - Carga Horária Semanal (number input)
   - Observações Gerais (text input)

### Layout Visual

```
┌─────────────────────────────────────────────────────────────┐
│ Horário de Trabalho                                         │
│ Configure o horário de trabalho semanal do colaborador      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ☑ Segunda-feira                                             │
│    Entrada: [08:00] Saída: [18:00]                         │
│    Início Intervalo: [12:00] Fim Intervalo: [13:00]        │
│                                                              │
│ ☑ Terça-feira                                               │
│    Entrada: [08:00] Saída: [18:00]                         │
│    Início Intervalo: [12:00] Fim Intervalo: [13:00]        │
│                                                              │
│ ... (demais dias)                                           │
│                                                              │
│ ☐ Sábado                                                    │
│                                                              │
│ ☐ Domingo                                                   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ Carga Horária Semanal: [44]                                │
│ Observações Gerais: [Jornada comercial padrão]             │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Integração com APIs

### Criação de Colaborador
```typescript
// POST /employees
const newEmployee = {
  name: "João Silva",
  cpf: "12345678900",
  // ... outros campos
  workSchedule: {
    monday: { isWorkDay: true, startTime: "08:00", endTime: "18:00", breakStartTime: "12:00", breakEndTime: "13:00" },
    tuesday: { isWorkDay: true, startTime: "08:00", endTime: "18:00", breakStartTime: "12:00", breakEndTime: "13:00" },
    // ... demais dias
    weeklyHours: 44,
    generalNotes: "Jornada comercial padrão"
  }
}
```

### Atualização de Colaborador
```typescript
// PATCH /employees/:id
const updates = {
  workSchedule: {
    // ... novo horário
  }
}
```

### Leitura de Colaborador
```typescript
// GET /employees/:id
const employee = await employeesApi.getById(id)
console.log(employee.workSchedule)
// {
//   monday: { isWorkDay: true, startTime: "08:00", ... },
//   ...
// }
```

## ✅ Validações Implementadas

1. **Checkbox de Dia Útil**: Quando desmarcado, limpa os campos de horário
2. **Formato de Hora**: Input type="time" garante formato HH:mm
3. **Carga Horária**: Aceita decimais (ex: 44, 40, 36.5)
4. **Dados Opcionais**: WorkSchedule é opcional no Employee

## 📊 Casos de Uso

### 1. Cálculo de Horas Trabalhadas
```typescript
function calcularHorasDiarias(day: DaySchedule): number {
  if (!day.isWorkDay || !day.startTime || !day.endTime) return 0
  
  const [startH, startM] = day.startTime.split(':').map(Number)
  const [endH, endM] = day.endTime.split(':').map(Number)
  
  let horasTrabalhadas = (endH * 60 + endM) - (startH * 60 + startM)
  
  // Subtrai intervalo se existir
  if (day.breakStartTime && day.breakEndTime) {
    const [breakStartH, breakStartM] = day.breakStartTime.split(':').map(Number)
    const [breakEndH, breakEndM] = day.breakEndTime.split(':').map(Number)
    const intervalo = (breakEndH * 60 + breakEndM) - (breakStartH * 60 + breakStartM)
    horasTrabalhadas -= intervalo
  }
  
  return horasTrabalhadas / 60 // Retorna em horas
}

function calcularHorasSemanais(schedule: WorkSchedule): number {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
  return days.reduce((total, day) => total + calcularHorasDiarias(schedule[day]), 0)
}
```

### 2. Verificar Dia de Trabalho
```typescript
function isDiaUtil(schedule: WorkSchedule, diaSemana: string): boolean {
  return schedule[diaSemana as keyof WorkSchedule]?.isWorkDay || false
}
```

### 3. Gerar Resumo do Horário
```typescript
function gerarResumoHorario(schedule: WorkSchedule): string {
  const diasUteis = Object.entries(schedule)
    .filter(([key, value]) => key !== 'weeklyHours' && key !== 'generalNotes' && value.isWorkDay)
    .map(([key]) => key)
  
  if (diasUteis.length === 0) return "Sem dias de trabalho configurados"
  
  // Exemplo: "Segunda a Sexta, 08:00-18:00 (44h semanais)"
  const primeiroHorario = schedule[diasUteis[0] as keyof WorkSchedule] as DaySchedule
  return `${diasUteis.length} dias/semana, ${primeiroHorario.startTime}-${primeiroHorario.endTime} (${schedule.weeklyHours}h semanais)`
}
```

## 🎯 Benefícios

1. **Flexibilidade**: Permite configurar horários diferentes para cada dia
2. **Detalhamento**: Captura horários de entrada, saída e intervalos
3. **Conformidade**: Facilita verificação de carga horária legal
4. **Ponto Eletrônico**: Base para sistemas de controle de ponto
5. **Relatórios**: Dados estruturados para relatórios de RH
6. **Escalas**: Suporta diferentes tipos de jornada (comercial, turno, flexível)

## 🚀 Próximos Passos (Sugestões)

1. **Banco de Horas**: Calcular saldo de horas extras/devidas
2. **Escalas Rotativas**: Templates de horários que alternam semanalmente
3. **Exceções**: Horários especiais para datas específicas
4. **DSR**: Cálculo automático de descanso semanal remunerado
5. **Relatório de Jornada**: Exportar horários de toda equipe
6. **Validação CLT**: Alertas para cargas horárias não conformes
7. **Integração Ponto**: Importar batidas de ponto eletrônico

## 📝 Observações Importantes

- O campo `workSchedule` é **opcional** no cadastro de colaborador
- Valores padrão são pré-preenchidos no formulário (44h, Segunda-Sexta 8-18h)
- A carga horária semanal (`weeklyHours`) deve ser preenchida manualmente
- O campo `generalNotes` permite observações livres sobre o horário
- Dias não úteis não exibem campos de horário (apenas checkbox)
