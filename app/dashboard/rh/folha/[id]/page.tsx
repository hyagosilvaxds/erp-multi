"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  ArrowLeft, 
  Calculator, 
  CheckCircle, 
  DollarSign, 
  Download, 
  FileText, 
  Trash2,
  Calendar,
  Users,
  TrendingUp,
  TrendingDown
} from "lucide-react"
import { useToast } from '@/hooks/use-toast'
import {
  payrollApi,
  type Payroll,
  type PayrollStatus,
  type PayrollType,
} from '@/lib/api/payroll'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const statusLabels: Record<PayrollStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  DRAFT: { label: 'Rascunho', variant: 'secondary' },
  CALCULATED: { label: 'Calculada', variant: 'default' },
  APPROVED: { label: 'Aprovada', variant: 'default' },
  PAID: { label: 'Paga', variant: 'outline' },
}

const typeLabels: Record<PayrollType, string> = {
  MONTHLY: 'Mensal',
  DAILY: 'Diária',
  WEEKLY: 'Semanal',
  ADVANCE: 'Adiantamento',
}

const monthLabels = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export default function PayrollDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const payrollId = params.id as string

  const [payroll, setPayroll] = useState<Payroll | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteItemId, setDeleteItemId] = useState('')
  const [deleteEmployeeName, setDeleteEmployeeName] = useState('')
  const [exportingPayslip, setExportingPayslip] = useState<string | null>(null)

  useEffect(() => {
    loadPayroll()
  }, [payrollId])

  const loadPayroll = async () => {
    try {
      setLoading(true)
      const data = await payrollApi.getById(payrollId)
      setPayroll(data)
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar folha',
        description: error.response?.data?.message || 'Não foi possível carregar a folha de pagamento.',
        variant: 'destructive',
      })
      router.push('/dashboard/rh/folha')
    } finally {
      setLoading(false)
    }
  }

  const handleCalculate = async () => {
    if (!payroll) return
    
    try {
      setProcessing(true)
      const result = await payrollApi.calculate(payroll.id)
      
      toast({
        title: 'Folha calculada',
        description: result.message,
      })
      
      loadPayroll()
    } catch (error: any) {
      toast({
        title: 'Erro ao calcular folha',
        description: error.response?.data?.message || 'Não foi possível calcular a folha.',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleApprove = async () => {
    if (!payroll) return
    
    try {
      setProcessing(true)
      const result = await payrollApi.approve(payroll.id)
      toast({
        title: 'Folha aprovada',
        description: result.message,
      })
      loadPayroll()
    } catch (error: any) {
      toast({
        title: 'Erro ao aprovar folha',
        description: error.response?.data?.message || 'Não foi possível aprovar a folha.',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleMarkAsPaid = async () => {
    if (!payroll) return
    
    try {
      setProcessing(true)
      const result = await payrollApi.markAsPaid(payroll.id)
      toast({
        title: 'Folha marcada como paga',
        description: result.message,
      })
      loadPayroll()
    } catch (error: any) {
      toast({
        title: 'Erro ao marcar como paga',
        description: error.response?.data?.message || 'Não foi possível marcar a folha como paga.',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleExportPDF = async () => {
    if (!payroll) return
    
    try {
      setProcessing(true)
      const blob = await payrollApi.exportPDF(payroll.id)
      const name = `Folha_${monthLabels[payroll.referenceMonth - 1]}_${payroll.referenceYear}`
      payrollApi.downloadFile(blob, `${name}.pdf`)
      toast({
        title: 'Exportado com sucesso',
        description: 'Folha de pagamento exportada em PDF.',
      })
    } catch (error: any) {
      toast({
        title: 'Erro ao exportar',
        description: error.response?.data?.message || 'Não foi possível exportar a folha.',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleExportExcel = async () => {
    if (!payroll) return
    
    try {
      setProcessing(true)
      const blob = await payrollApi.exportExcel(payroll.id)
      const name = `Folha_${monthLabels[payroll.referenceMonth - 1]}_${payroll.referenceYear}`
      payrollApi.downloadFile(blob, `${name}.xlsx`)
      toast({
        title: 'Exportado com sucesso',
        description: 'Folha de pagamento exportada em Excel.',
      })
    } catch (error: any) {
      toast({
        title: 'Erro ao exportar',
        description: error.response?.data?.message || 'Não foi possível exportar a folha.',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleGeneratePayslip = async (employeeId: string, employeeName: string) => {
    if (!payroll) return
    
    try {
      setExportingPayslip(employeeId)
      const blob = await payrollApi.generatePayslip(payroll.id, employeeId)
      payrollApi.downloadFile(blob, `Holerite_${employeeName.replace(/\s+/g, '_')}.pdf`)
      toast({
        title: 'Holerite gerado',
        description: `Holerite de ${employeeName} gerado com sucesso.`,
      })
    } catch (error: any) {
      toast({
        title: 'Erro ao gerar holerite',
        description: error.response?.data?.message || 'Não foi possível gerar o holerite.',
        variant: 'destructive',
      })
    } finally {
      setExportingPayslip(null)
    }
  }

  const openDeleteItemDialog = (itemId: string, employeeName: string) => {
    setDeleteItemId(itemId)
    setDeleteEmployeeName(employeeName)
    setDeleteDialogOpen(true)
  }

  const handleDeleteItem = async () => {
    if (!payroll) return
    
    try {
      await payrollApi.deleteItem(payroll.id, deleteItemId)
      toast({
        title: 'Item removido',
        description: 'O item foi removido da folha de pagamento.',
      })
      setDeleteDialogOpen(false)
      loadPayroll()
    } catch (error: any) {
      toast({
        title: 'Erro ao remover item',
        description: error.response?.data?.message || 'Não foi possível remover o item.',
        variant: 'destructive',
      })
    }
  }

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  }

  if (loading) {
    return (
      <DashboardLayout module="rh">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando folha de pagamento...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!payroll) {
    return (
      <DashboardLayout module="rh">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-muted-foreground">Folha de pagamento não encontrada.</p>
            <Button onClick={() => router.push('/dashboard/rh/folha')} className="mt-4">
              Voltar para listagem
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout module="rh">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push('/dashboard/rh/folha')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {typeLabels[payroll.type]} - {monthLabels[payroll.referenceMonth - 1]}/{payroll.referenceYear}
              </h1>
              <p className="text-muted-foreground">
                {payroll.company?.razaoSocial || 'Empresa'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={statusLabels[payroll.status].variant}>
              {statusLabels[payroll.status].label}
            </Badge>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Proventos</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(payroll.totalEarnings)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Descontos</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(payroll.totalDeductions)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Líquido</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(payroll.netAmount)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Colaboradores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {payroll.itemsCount || payroll.items?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações da Folha */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Folha</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Período</p>
              <p className="font-medium">
                {formatDate(payroll.startDate)} até {formatDate(payroll.endDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data de Pagamento</p>
              <p className="font-medium">{formatDate(payroll.paymentDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Criado por</p>
              <p className="font-medium">{payroll.createdBy?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Criado em</p>
              <p className="font-medium">{formatDate(payroll.createdAt)}</p>
            </div>
            {payroll.approvedBy && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Aprovado por</p>
                  <p className="font-medium">{payroll.approvedBy.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Aprovado em</p>
                  <p className="font-medium">{payroll.approvedAt ? formatDate(payroll.approvedAt) : 'N/A'}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Ações */}
        <Card>
          <CardHeader>
            <CardTitle>Ações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {payroll.status === 'DRAFT' && (
                <Button
                  onClick={handleCalculate}
                  disabled={processing}
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  Calcular Folha
                </Button>
              )}

              {payroll.status === 'CALCULATED' && (
                <Button
                  onClick={handleApprove}
                  disabled={processing}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Aprovar Folha
                </Button>
              )}

              {payroll.status === 'APPROVED' && (
                <Button
                  onClick={handleMarkAsPaid}
                  disabled={processing}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Marcar como Paga
                </Button>
              )}

              {payroll.status !== 'DRAFT' && (
                <>
                 

                  <Button
                    variant="outline"
                    onClick={handleExportExcel}
                    disabled={processing}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Excel
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Itens */}
        <Card>
          <CardHeader>
            <CardTitle>Colaboradores ({payroll.items?.length || 0})</CardTitle>
            <CardDescription>
              Lista de colaboradores incluídos nesta folha de pagamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!payroll.items || payroll.items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum colaborador adicionado a esta folha ainda.</p>
                {payroll.status === 'DRAFT' && (
                  <p className="text-sm mt-2">
                    Clique em "Calcular Folha" para adicionar automaticamente os colaboradores ativos.
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Colaborador</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead className="text-right">Dias Trab.</TableHead>
                      <TableHead className="text-right">Proventos</TableHead>
                      <TableHead className="text-right">Descontos</TableHead>
                      <TableHead className="text-right">Líquido</TableHead>
                     
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payroll.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.employee.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.employee.cpf}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.employee.position?.name || 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.workDays}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          {formatCurrency(item.totalEarnings)}
                        </TableCell>
                        <TableCell className="text-right text-red-600">
                          {formatCurrency(item.totalDeductions)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(item.netAmount)}
                        </TableCell>
                        
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{deleteEmployeeName}</strong> desta folha de pagamento?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
