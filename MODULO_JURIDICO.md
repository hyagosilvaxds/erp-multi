# Módulo Jurídico - Documentação

## 📋 Visão Geral

O módulo jurídico foi criado para gerenciar contratos e processos judiciais da empresa, oferecendo controle completo sobre documentos legais, prazos, valores e responsáveis.

## 🎯 Funcionalidades Implementadas

### 1. Dashboard Jurídico (`/dashboard/juridico`)

**Tela principal** com visão geral do departamento jurídico:

#### Indicadores (Cards):
- **Contratos Ativos**: Total de contratos vigentes
- **Processos em Andamento**: Quantidade de processos ativos
- **Contratos a Vencer**: Contratos que vencem nos próximos 30 dias
- **Processos Ganhos**: Decisões favoráveis

#### Seções:
- **Contratos Recentes**: Lista dos últimos contratos cadastrados e contratos próximos ao vencimento
  - Badge de status (Ativo, A Vencer, Vencido)
  - Alertas visuais para contratos com menos de 60 dias para vencer
  - Informações de valor, vencimento e dias restantes

- **Processos em Andamento**: Últimas movimentações processuais
  - Badge de status (Em Andamento, Aguardando Sentença, Em Recurso, etc.)
  - Badge de risco (Baixo, Médio, Alto)
  - Informações de vara, movimentação e data

- **Gráficos de Distribuição**:
  - Contratos por tipo (Prestação de Serviços, Fornecimento, Locação, Outros)
  - Processos por tipo (Trabalhista, Cível, Tributário, Outros)

---

### 2. Gestão de Contratos

#### 2.1. Listagem de Contratos (`/dashboard/juridico/contratos`)

**Funcionalidades**:
- ✅ Busca por número, parte ou tipo
- ✅ Filtros por status (Todos, Ativos, A Vencer, Vencidos)
- ✅ Filtro por tipo de contrato
- ✅ Tabela completa com informações detalhadas:
  - Número do contrato
  - Tipo e categoria
  - Parte contratada (com CNPJ)
  - Valor total e mensal
  - Data de vencimento e dias restantes
  - Status com indicadores visuais
  - Responsável pelo contrato

**Ações disponíveis**:
- Visualizar detalhes
- Editar contrato
- Baixar PDF
- Excluir contrato

#### 2.2. Cadastro de Contratos (`/dashboard/juridico/contratos/novo`)

**Formulário completo dividido em seções**:

##### Informações Básicas:
- Número do contrato
- Tipo (Prestação de Serviços, Fornecimento, Locação, Parceria, NDA, etc.)
- Categoria
- Objeto do contrato
- Descrição detalhada

##### Parte Contratada:
- Razão Social / Nome
- CNPJ / CPF
- E-mail e telefone
- Endereço completo
- Representante legal e cargo

##### Valores e Condições Financeiras:
- Valor total
- Valor mensal (se aplicável)
- Forma de pagamento (Boleto, Transferência, PIX, Cartão, Depósito)
- Dia de vencimento
- Condições de pagamento
- Observações financeiras

##### Vigência e Prazos:
- Data de início
- Data de vencimento
- Prazo em meses
- Prazo de rescisão
- Renovação automática (switch)
- Cláusulas de renovação

##### Responsável e Gestão:
- Responsável pelo contrato
- Departamento
- Observações de gestão
- Tags para categorização

##### Documentos:
- Upload do contrato em PDF
- Upload de documentos anexos (propostas, aditivos, etc.)

---

### 3. Gestão de Processos

#### 3.1. Listagem de Processos (`/dashboard/juridico/processos`)

**Cards de Resumo**:
- Total de processos
- Valor total provisionado
- Processos de alto risco
- Processos onde a empresa é ré (polo passivo)

**Funcionalidades**:
- ✅ Busca por número, parte, tipo ou ação
- ✅ Filtro por status (Em Andamento, Aguardando Sentença, Em Recurso, Acordo, etc.)
- ✅ Filtro por tipo (Trabalhista, Cível, Tributário, Consumidor)
- ✅ Filtro por risco (Baixo, Médio, Alto)
- ✅ Tabela detalhada com:
  - Número CNJ e tipo de ação
  - Tipo de processo e polo (Ativo/Passivo)
  - Parte contrária
  - Vara e comarca
  - Valor da causa e valor provisionado
  - Status do processo
  - Classificação de risco
  - Última movimentação e data
  - Responsável

**Ações disponíveis**:
- Visualizar detalhes
- Editar processo
- Ver andamentos
- Excluir processo

#### 3.2. Cadastro de Processos (`/dashboard/juridico/processos/novo`)

**Formulário completo dividido em seções**:

##### Informações Básicas do Processo:
- Número do processo (formato CNJ)
- Tipo (Trabalhista, Cível, Tributário, Consumidor, etc.)
- Tipo de ação específica
- Polo (Ativo - Autor / Passivo - Réu)
- Objeto do processo

##### Parte Contrária:
- Nome / Razão social
- CPF / CNPJ
- Advogado da parte
- OAB
- Endereço

##### Tribunal e Vara:
- Tribunal (TRT, TJSP, TRF, STJ, STF, TST)
- Vara
- Comarca e UF
- Juiz/Desembargador
- Data de distribuição

##### Valores e Análise de Risco:
- Valor da causa
- Valor provisionado (perda estimada)
- Valor de condenação (se houver sentença)
- Probabilidade de perda (Remota, Possível, Provável, Certa)
- Classificação de risco (Baixo, Médio, Alto)
- Fundamentação da análise de risco

##### Status e Andamento:
- Status atual
- Fase processual (Inicial, Citação, Contestação, Instrução, Sentença, etc.)
- Última movimentação
- Próximas ações e prazos

##### Responsáveis:
- Responsável interno e OAB
- Escritório externo (se houver)
- Advogado externo e OAB
- Contato do advogado externo

##### Documentos:
- Upload da petição inicial
- Upload de outros documentos (contestação, provas, sentenças, recursos)

##### Observações:
- Observações gerais
- Tags para categorização

---

## 🎨 Elementos Visuais

### Badges e Indicadores:

**Status de Contratos**:
- 🟢 **Ativo**: Badge verde
- 🔴 **A Vencer**: Badge vermelho com ícone de relógio
- 🔴 **Vencido**: Badge vermelho

**Status de Processos**:
- 🟢 **Em Andamento**: Badge verde
- 🟡 **Aguardando Sentença**: Badge amarelo
- ⚪ **Em Recurso**: Badge outline
- 🟢 **Acordo**: Badge verde
- 🔴 **Sentença Desfavorável**: Badge vermelho
- 🟡 **Arquivado**: Badge amarelo

**Classificação de Risco**:
- 🟢 **Baixo**: Badge verde
- 🟡 **Médio**: Badge amarelo
- 🔴 **Alto**: Badge vermelho

**Polo Processual**:
- 🔵 **Polo Ativo**: Badge azul (empresa é autora)
- 🟠 **Polo Passivo**: Badge laranja (empresa é ré)

---

## 🔗 Navegação

### Estrutura de Rotas:

```
/dashboard/juridico
├── /                              # Dashboard principal
├── /contratos                     # Listagem de contratos
│   ├── /novo                      # Cadastro de novo contrato
│   ├── /[id]                      # Detalhes do contrato (a implementar)
│   └── /[id]/editar              # Edição do contrato (a implementar)
└── /processos                     # Listagem de processos
    ├── /novo                      # Cadastro de novo processo
    ├── /[id]                      # Detalhes do processo (a implementar)
    └── /[id]/editar              # Edição do processo (a implementar)
```

### Menu Lateral (Sidebar):

O menu jurídico já está integrado no sidebar com o ícone de balança (Scale):

```
📊 Dashboard
📄 Contratos
⚖️ Processos
```

---

## 📊 Dados de Exemplo

### Contratos de Exemplo:
- Prestação de Serviços com Tech Solutions (R$ 45.000)
- Fornecimento com Materiais ABC (R$ 120.000) - A vencer em 28 dias
- Locação com Imobiliária Prime (R$ 8.500/mês)
- Consultoria XYZ (R$ 2.000/mês)
- Fornecimento vencido com Distribuidora Mega
- Parceria com Empresa Beta

### Processos de Exemplo:
- **Trabalhista**: Reclamação de João da Silva (Risco Médio - R$ 45k)
- **Cível**: Cobrança vs Empresa XYZ (Risco Baixo - R$ 85k)
- **Tributário**: Mandado de Segurança vs União (Risco Alto - R$ 250k)
- **Trabalhista**: Horas Extras de Maria Oliveira (Risco Médio)
- **Cível**: Rescisão Contratual - Acordo homologado
- **Trabalhista**: Acidente de Trabalho - Sentença desfavorável (Risco Alto - R$ 350k)

---

## 🚀 Próximos Passos (Sugestões)

### Funcionalidades Adicionais:

1. **Telas de Detalhes**:
   - [ ] Página de visualização detalhada de contrato
   - [ ] Página de visualização detalhada de processo
   - [ ] Timeline de movimentações do processo

2. **Edição**:
   - [ ] Página de edição de contrato
   - [ ] Página de edição de processo

3. **Alertas e Notificações**:
   - [ ] Sistema de alertas para contratos a vencer
   - [ ] Notificações de prazos processuais
   - [ ] Dashboard de prazos urgentes

4. **Relatórios**:
   - [ ] Relatório de contratos por período
   - [ ] Relatório de processos por tipo/status
   - [ ] Relatório de provisionamento
   - [ ] Exportação para PDF/Excel

5. **Integrações**:
   - [ ] Integração com API do PJe (Processo Judicial Eletrônico)
   - [ ] Integração com e-SAJ
   - [ ] Integração com sistemas de assinatura digital
   - [ ] OCR para extração de dados de petições

6. **Gestão de Prazos**:
   - [ ] Calendário jurídico com prazos
   - [ ] Cálculo automático de prazos processuais
   - [ ] Lembretes e alertas de prazo

7. **Documentos**:
   - [ ] Biblioteca de modelos de contratos
   - [ ] Sistema de versionamento de documentos
   - [ ] Histórico de alterações

8. **Dashboard Avançado**:
   - [ ] Gráficos de evolução de processos
   - [ ] Análise de taxa de sucesso
   - [ ] KPIs jurídicos

---

## 🛠️ Tecnologias Utilizadas

- **Next.js 14**: Framework React com App Router
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização
- **Shadcn/ui**: Componentes de UI
- **Lucide React**: Ícones
- **date-fns**: Manipulação de datas

---

## 📝 Observações

- ✅ Todas as telas foram criadas com design responsivo
- ✅ Formulários completos com validação básica
- ✅ Dados mockados para demonstração
- ✅ Interface intuitiva e moderna
- ✅ Badges e indicadores visuais para facilitar identificação
- ✅ Integrado ao layout do dashboard existente
- ⚠️ Backend ainda não implementado (dados estáticos)
- ⚠️ Páginas de detalhes e edição individuais ainda não criadas
- ⚠️ Sistema de upload de arquivos precisa de backend

---

## 📧 Suporte

Para dúvidas ou sugestões sobre o módulo jurídico, entre em contato com a equipe de desenvolvimento.

**Data de criação**: Outubro de 2024
**Última atualização**: Outubro de 2024
