# Debug: Erro ao Exportar PDF da Folha de Pagamento

## 🐛 Problema Relatado

Quando o usuário clica em "Exportar PDF", nem chama a API e aparece o toast de erro:
```
Não foi possível exportar a folha
```

---

## 🔍 Correções Implementadas

### 1. Logs Detalhados Adicionados

#### Na função `downloadPayrollPDF` (`lib/api/payroll.ts`):
```typescript
export const downloadPayrollPDF = async (id: string): Promise<Blob> => {
  try {
    console.log('downloadPayrollPDF - iniciando download:', id)
    const companyId = getCompanyId()
    console.log('downloadPayrollPDF - companyId:', companyId)

    const response = await apiClient.get(`/payroll/${id}/pdf`, {
      responseType: 'blob',
      headers: {
        'x-company-id': companyId,
      },
    })

    console.log('downloadPayrollPDF - resposta recebida:', {
      status: response.status,
      contentType: response.headers['content-type'],
      dataType: typeof response.data,
      dataSize: response.data?.size || 0,
    })

    return response.data
  } catch (error: any) {
    console.error('downloadPayrollPDF - erro:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    })
    throw error
  }
}
```

#### Na função `downloadPayslipPDF` (`lib/api/payroll.ts`):
Similar, mas para holerites individuais.

#### Na função `downloadFile` (`lib/api/payroll.ts`):
```typescript
export const downloadFile = (blob: Blob, filename: string) => {
  try {
    console.log('downloadFile chamado:', { blobSize: blob.size, filename })
    
    if (!blob || blob.size === 0) {
      throw new Error('Blob inválido ou vazio')
    }
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    console.log('Download iniciado com sucesso')
  } catch (error) {
    console.error('Erro ao fazer download do arquivo:', error)
    throw error
  }
}
```

### 2. Validação de Blob

Adicionada validação para garantir que o blob não está vazio:
```typescript
if (!blob || blob.size === 0) {
  throw new Error('PDF vazio ou inválido')
}
```

### 3. Mensagens de Erro Detalhadas

Nos componentes de UI, agora as mensagens de erro incluem a causa:
```typescript
const errorMessage = error?.response?.data?.message || error?.message || 'Erro desconhecido'
toast({
  title: 'Erro ao baixar',
  description: `Não foi possível baixar a folha de pagamento: ${errorMessage}`,
  variant: 'destructive',
})
```

---

## 🔎 Como Debugar

### Passo 1: Abrir o Console do Navegador

1. Pressione `F12` ou `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows/Linux)
2. Vá para a aba "Console"

### Passo 2: Clicar em "Exportar PDF"

Você verá uma sequência de logs:

#### ✅ **Caso de Sucesso:**
```
Iniciando download da folha: uuid-123
downloadPayrollPDF - iniciando download: uuid-123
downloadPayrollPDF - companyId: uuid-empresa-456
downloadPayrollPDF - resposta recebida: {
  status: 200,
  contentType: "application/pdf",
  dataType: "object",
  dataSize: 12345
}
Blob recebido: Blob { size: 12345, type: "application/pdf" }
downloadFile chamado: { blobSize: 12345, filename: "folha-pagamento-2024-11.pdf" }
Download iniciado com sucesso
Download iniciado com sucesso
```

#### ❌ **Possíveis Erros e Causas:**

**Erro 1: Empresa não selecionada**
```
downloadPayrollPDF - iniciando download: uuid-123
Error: Nenhuma empresa selecionada
```
**Solução:** Usuário precisa selecionar uma empresa antes.

**Erro 2: Endpoint não encontrado (404)**
```
downloadPayrollPDF - erro: {
  message: "Request failed with status code 404",
  status: 404
}
```
**Solução:** Backend não implementou o endpoint `/payroll/:id/pdf`.

**Erro 3: Sem permissão (403)**
```
downloadPayrollPDF - erro: {
  message: "Request failed with status code 403",
  status: 403,
  response: { message: "Empresa não especificada no cabeçalho x-company-id" }
}
```
**Solução:** Problema com o header `x-company-id` ou permissões do usuário.

**Erro 4: Blob vazio**
```
Blob recebido: Blob { size: 0, type: "" }
Error: PDF vazio ou inválido
```
**Solução:** Backend retornou resposta vazia. Verificar implementação no backend.

**Erro 5: Erro de rede**
```
downloadPayrollPDF - erro: {
  message: "Network Error"
}
```
**Solução:** Verificar se o backend está rodando e acessível.

---

## 🧪 Testes a Realizar

### 1. Teste de Endpoint no Backend

Verifique se o endpoint está implementado:
```bash
curl -X GET "http://localhost:4000/payroll/{id}/pdf" \
  -H "Authorization: Bearer {token}" \
  -H "x-company-id: {company-id}" \
  --output teste.pdf
```

Se retornar um PDF válido, o backend está OK.

### 2. Teste no Frontend

1. Abra o console do navegador
2. Clique em "Exportar PDF"
3. Analise os logs para identificar onde está falhando

### 3. Teste de Permissões

Verifique se o usuário tem a permissão `payroll.read`:
```typescript
// No console do navegador
localStorage.getItem('permissions')
```

---

## 📋 Checklist de Verificação

- [ ] **Backend está rodando?** (`http://localhost:4000`)
- [ ] **Endpoint `/payroll/:id/pdf` está implementado?**
- [ ] **Usuário tem empresa selecionada?**
- [ ] **Usuário tem permissão `payroll.read`?**
- [ ] **Token de autenticação é válido?**
- [ ] **Header `x-company-id` está sendo enviado?**
- [ ] **Backend retorna um blob válido?** (Content-Type: application/pdf)

---

## 🔧 Soluções Rápidas

### Se o endpoint não existe no backend:

O frontend está pronto, mas o backend precisa implementar:

```typescript
// Backend: GET /payroll/:id/pdf
router.get('/payroll/:id/pdf', async (req, res) => {
  const { id } = req.params
  const companyId = req.headers['x-company-id']
  
  // 1. Buscar folha de pagamento
  const payroll = await prisma.payroll.findUnique({
    where: { id, companyId },
    include: {
      items: {
        include: {
          employee: {
            include: { position: true }
          }
        }
      },
      company: true
    }
  })
  
  // 2. Gerar PDF (usando biblioteca como pdfkit, puppeteer, etc.)
  const pdfBuffer = await generatePayrollPDF(payroll)
  
  // 3. Retornar como blob
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="folha-${id}.pdf"`)
  res.send(pdfBuffer)
})
```

### Se o erro é de permissão:

Adicionar permissão ao usuário no banco de dados:
```sql
-- Dar permissão de leitura de folha de pagamento
INSERT INTO permissions (userId, permission) 
VALUES ('user-id', 'payroll.read');
```

### Se o blob está vazio:

Verificar no backend se está retornando corretamente:
```typescript
console.log('PDF gerado - tamanho:', pdfBuffer.length, 'bytes')
```

---

## 📝 Logs Esperados (Sequência Completa)

```
1. Componente: Iniciando download da folha: {id}
2. API: downloadPayrollPDF - iniciando download: {id}
3. API: downloadPayrollPDF - companyId: {companyId}
4. [Requisição HTTP para o backend]
5. API: downloadPayrollPDF - resposta recebida: { status: 200, ... }
6. Componente: Blob recebido: Blob { size: X }
7. API: downloadFile chamado: { blobSize: X, filename: "..." }
8. API: Download iniciado com sucesso
9. Componente: Download iniciado com sucesso
10. [Navegador exibe diálogo de download]
```

---

## 🎯 Próximos Passos

1. **Teste com logs:** Clicar em "Exportar PDF" e verificar console
2. **Identificar ponto de falha:** Ver qual log não aparece
3. **Implementar backend:** Se necessário, criar endpoint de PDF
4. **Testar permissões:** Verificar se usuário tem acesso
5. **Validar resposta:** Garantir que backend retorna PDF válido

---

## 💡 Dica Importante

O erro "Não foi possível exportar a folha" pode ter várias causas. Com os logs detalhados adicionados, você conseguirá identificar exatamente onde está falhando:

- Se **nenhum log aparecer**: Problema no evento de click
- Se **parar em getCompanyId**: Empresa não selecionada
- Se **falhar na requisição HTTP**: Backend não implementado ou inacessível
- Se **blob for vazio**: Backend não está gerando o PDF corretamente
- Se **erro em downloadFile**: Problema no navegador ou blob inválido

---

**Agora teste novamente e veja os logs no console!** 🚀
