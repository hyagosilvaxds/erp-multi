"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Eye, Calculator, Trash2, CheckCircle, DollarSign, FileText, Download, BarChart3 } from "lucide-react"
import { useToast } from '@/hooks/use-toast'
import {
  payrollApi,
  type Payroll,
  type PayrollStatus,
  type PayrollType,
} from '@/lib/api/payroll'

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

export default function FolhaPagamentoPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [payrolls, setPayrolls] = useState<Payroll[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [calculating, setCalculating] = useState(false)
  const [exportingId, setExportingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState('')
  const [deleteName, setDeleteName] = useState('')

  // Filtros
  const [filterMonth, setFilterMonth] = useState<string>('')
  const [filterYear, setFilterYear] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')

  // Form criar folha
  const [referenceMonth, setReferenceMonth] = useState('')
  const [referenceYear, setReferenceYear] = useState('')
  const [payrollType, setPayrollType] = useState<PayrollType>('MONTHLY')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [paymentDate, setPaymentDate] = useState('')

  useEffect(() => {
    loadPayrolls()
  }, [filterMonth, filterYear, filterStatus])

  const loadPayrolls = async () => {
    try {
      setLoading(true)
      const response = await payrollApi.getAll({
        referenceMonth: filterMonth ? parseInt(filterMonth) : undefined,
        referenceYear: filterYear ? parseInt(filterYear) : undefined,
        status: filterStatus && filterStatus !== '' ? (filterStatus as PayrollStatus) : undefined,
      })
      setPayrolls(response.data)
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar folhas',
        description: error.response?.data?.message || 'Não foi possível carregar as folhas de pagamento.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const openCreateDialog = () => {
    const now = new Date()
    setReferenceMonth((now.getMonth() + 1).toString())
    setReferenceYear(now.getFullYear().toString())
    setPayrollType('MONTHLY')
    
    // Primeiro dia do mês
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    setStartDate(firstDay.toISOString().split('T')[0])
    
    // Último dia do mês
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    setEndDate(lastDay.toISOString().split('T')[0])
    
    // 5º dia útil do próximo mês (simplificado)
    const paymentDay = new Date(now.getFullYear(), now.getMonth() + 1, 5)
    setPaymentDate(paymentDay.toISOString().split('T')[0])
    
    setCreateDialogOpen(true)
  }

  const handleCreatePayroll = async () => {
    if (!referenceMonth || !referenceYear || !startDate || !endDate || !paymentDate) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos.',
        variant: 'destructive',
      })
      return
    }

    try {
      const payroll = await payrollApi.create({
        referenceMonth: parseInt(referenceMonth),
        referenceYear: parseInt(referenceYear),
        type: payrollType,
        startDate,
        endDate,
        paymentDate,
      })

      toast({
        title: 'Folha criada',
        description: 'Folha de pagamento criada com sucesso.',
      })

      setCreateDialogOpen(false)
      router.push(`/dashboard/rh/folha/${payroll.id}`)
    } catch (error: any) {
      toast({
        title: 'Erro ao criar folha',
        description: error.response?.data?.message || 'Não foi possível criar a folha de pagamento.',
        variant: 'destructive',
      })
    }
  }

  const handleCalculate = async (id: string) => {
    try {
      setCalculating(true)
      const result = await payrollApi.calculate(id)
      
      toast({
        title: 'Folha calculada',
        description: result.message,
      })
      
      loadPayrolls()
    } catch (error: any) {
      toast({
        title: 'Erro ao calcular folha',
        description: error.response?.data?.message || 'Não foi possível calcular a folha.',
        variant: 'destructive',
      })
    } finally {
      setCalculating(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const result = await payrollApi.approve(id)
      toast({
        title: 'Folha aprovada',
        description: result.message,
      })
      loadPayrolls()
    } catch (error: any) {
      toast({
        title: 'Erro ao aprovar folha',
        description: error.response?.data?.message || 'Não foi possível aprovar a folha.',
        variant: 'destructive',
      })
    }
  }

  const handleMarkAsPaid = async (id: string) => {
    try {
      const result = await payrollApi.markAsPaid(id)
      toast({
        title: 'Folha marcada como paga',
        description: result.message,
      })
      loadPayrolls()
    } catch (error: any) {
      toast({
        title: 'Erro ao marcar como paga',
        description: error.response?.data?.message || 'Não foi possível marcar a folha como paga.',
        variant: 'destructive',
      })
    }
  }

  const handleExportPDF = async (id: string, name: string) => {
    try {
      setExportingId(id)
      const blob = await payrollApi.exportPDF(id)
      payrollApi.downloadFile(blob, `Folha_${name}.pdf`)
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
      setExportingId(null)
    }
  }

  const handleExportExcel = async (id: string, name: string) => {
    try {
      setExportingId(id)
      const blob = await payrollApi.exportExcel(id)
      payrollApi.downloadFile(blob, `Folha_${name}.xlsx`)
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
      setExportingId(null)
    }
  }

  const openDeleteDialog = (id: string, name: string) => {
    setDeleteId(id)
    setDeleteName(name)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    try {
      await payrollApi.delete(deleteId)
      toast({
        title: 'Folha excluída',
        description: 'A folha de pagamento foi excluída.',
      })
      setDeleteDialogOpen(false)
      loadPayrolls()
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir folha',
        description: error.response?.data?.message || 'Não foi possível excluir a folha.',
        variant: 'destructive',
      })
    }
  }

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Folha de Pagamento</h1>
            <p className="text-muted-foreground">Gerencie as folhas de pagamento da empresa</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/rh/folha/estatisticas">
                <BarChart3 className="mr-2 h-4 w-4" />
                Estatísticas
              </Link>
            </Button>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Folha
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Mês</Label>
                <Select value={filterMonth || undefined} onValueChange={setFilterMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os meses" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthLabels.map((month, index) => (
                      <SelectItem key={index} value={(index + 1).toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ano</Label>
                <Select value={filterYear || undefined} onValueChange={setFilterYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os anos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filterStatus || undefined} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Rascunho</SelectItem>
                    <SelectItem value="CALCULATED">Calculada</SelectItem>
                    <SelectItem value="APPROVED">Aprovada</SelectItem>
                    <SelectItem value="PAID">Paga</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" className="w-full" onClick={() => {
                  setFilterMonth('')
                  setFilterYear('')
                  setFilterStatus('')
                }}>
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Folhas */}
        <Card>
          <CardHeader>
            <CardTitle>Folhas de Pagamento</CardTitle>
            <CardDescription>Histórico de folhas criadas</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Carregando...</p>
              </div>
            ) : payrolls.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                <p className="mt-4 text-muted-foreground">Nenhuma folha de pagamento encontrada</p>
                <Button className="mt-4" onClick={openCreateDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeira Folha
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referência</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Pagamento</TableHead>
                    <TableHead className="text-right">Proventos</TableHead>
                    <TableHead className="text-right">Descontos</TableHead>
                    <TableHead className="text-right">Líquido</TableHead>
                    <TableHead className="text-right">Colaboradores</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrolls.map((payroll) => {
                    const payrollName = `${monthLabels[payroll.referenceMonth - 1]}_${payroll.referenceYear}`
                    return (
                      <TableRow key={payroll.id}>
                        <TableCell className="font-medium">
                          {monthLabels[payroll.referenceMonth - 1]} {payroll.referenceYear}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{typeLabels[payroll.type]}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusLabels[payroll.status].variant}>
                            {statusLabels[payroll.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(payroll.paymentDate)}</TableCell>
                        <TableCell className="text-right text-green-600">
                          {formatCurrency(payroll.totalEarnings)}
                        </TableCell>
                        <TableCell className="text-right text-red-600">
                          {formatCurrency(payroll.totalDeductions)}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(payroll.netAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {payroll.itemsCount || 0}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {payroll.status === 'DRAFT' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCalculate(payroll.id)}
                                disabled={calculating}
                                title="Calcular"
                              >
                                <Calculator className="h-4 w-4" />
                              </Button>
                            )}
                            {payroll.status === 'CALCULATED' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleApprove(payroll.id)}
                                title="Aprovar"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {payroll.status === 'APPROVED' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleMarkAsPaid(payroll.id)}
                                title="Marcar como Paga"
                              >
                                <DollarSign className="h-4 w-4" />
                              </Button>
                            )}
                            {(payroll.status === 'CALCULATED' || payroll.status === 'APPROVED' || payroll.status === 'PAID') && (
                              <>
                                
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleExportExcel(payroll.id, payrollName)}
                                  disabled={exportingId === payroll.id}
                                  title="Exportar Excel"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                            >
                              <Link href={`/dashboard/rh/folha/${payroll.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            {payroll.status === 'DRAFT' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteDialog(payroll.id, `${monthLabels[payroll.referenceMonth - 1]}/${payroll.referenceYear}`)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialog Criar Folha */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Folha de Pagamento</DialogTitle>
              <DialogDescription>
                Crie uma nova folha de pagamento para sua empresa
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="month">Mês de Referência *</Label>
                  <Select value={referenceMonth} onValueChange={setReferenceMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {monthLabels.map((month, index) => (
                        <SelectItem key={index} value={(index + 1).toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Ano de Referência *</Label>
                  <Select value={referenceYear} onValueChange={setReferenceYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Folha *</Label>
                <Select value={payrollType} onValueChange={(value: PayrollType) => setPayrollType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Mensal</SelectItem>
                    <SelectItem value="WEEKLY">Semanal</SelectItem>
                    <SelectItem value="DAILY">Diária</SelectItem>
                    <SelectItem value="ADVANCE">Adiantamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data Início *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">Data Fim *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentDate">Data de Pagamento *</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreatePayroll}>
                Criar Folha
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Excluir */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir a folha de pagamento <strong>{deleteName}</strong>?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  )
}
