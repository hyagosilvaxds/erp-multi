'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  DollarSign,
  Users,
  AlertCircle,
  Trash2,
  Calculator,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'
import {
  getPayrollById,
  calculatePayroll,
  approvePayroll,
  markPayrollAsPaid,
  deletePayroll,
  type Payroll,
} from '@/lib/api/payroll'

const STATUS_CONFIG = {
  DRAFT: { label: 'Rascunho', color: 'bg-gray-500' },
  CALCULATED: { label: 'Calculada', color: 'bg-blue-500' },
  APPROVED: { label: 'Aprovada', color: 'bg-green-500' },
  PAID: { label: 'Paga', color: 'bg-purple-500' },
}

const TYPE_CONFIG = {
  MONTHLY: 'Mensal',
  WEEKLY: 'Semanal',
  DAILY: 'Diária',
  ADVANCE: 'Adiantamento',
}

export default function PayrollDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [payroll, setPayroll] = useState<Payroll | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    loadPayroll()
  }, [params.id])

  const loadPayroll = async () => {
    try {
      setLoading(true)
      const data = await getPayrollById(params.id)
      setPayroll(data)
    } catch (error) {
      console.error('Erro ao carregar folha:', error)
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar a folha de pagamento',
        variant: 'destructive',
      })
      router.push('/dashboard/rh/folha-pagamento')
    } finally {
      setLoading(false)
    }
  }

  const handleCalculate = async () => {
    if (!payroll) return
    
    setActionLoading(true)
    try {
      await calculatePayroll(payroll.id)
      toast({
        title: 'Folha calculada',
        description: 'A folha foi calculada com sucesso',
      })
      await loadPayroll()
    } catch (error) {
      console.error('Erro ao calcular:', error)
      toast({
        title: 'Erro ao calcular',
        description: 'Não foi possível calcular a folha',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!payroll) return
    
    setActionLoading(true)
    try {
      await approvePayroll(payroll.id)
      toast({
        title: 'Folha aprovada',
        description: 'A folha foi aprovada com sucesso',
      })
      await loadPayroll()
    } catch (error) {
      console.error('Erro ao aprovar:', error)
      toast({
        title: 'Erro ao aprovar',
        description: 'Não foi possível aprovar a folha',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleMarkAsPaid = async () => {
    if (!payroll) return
    
    setActionLoading(true)
    try {
      await markPayrollAsPaid(payroll.id)
      toast({
        title: 'Folha marcada como paga',
        description: 'A folha foi marcada como paga com sucesso',
      })
      await loadPayroll()
    } catch (error) {
      console.error('Erro ao marcar como paga:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível marcar a folha como paga',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!payroll) return
    
    setActionLoading(true)
    try {
      await deletePayroll(payroll.id)
      toast({
        title: 'Folha excluída',
        description: 'A folha foi excluída com sucesso',
      })
      router.push('/dashboard/rh/folha-pagamento')
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir a folha',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
      setDeleteDialogOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Carregando folha de pagamento...</p>
        </div>
      </div>
    )
  }

  if (!payroll) return null

  const monthYear = `${payroll.referenceYear}-${String(payroll.referenceMonth).padStart(2, '0')}`
  const monthName = format(new Date(payroll.referenceYear, payroll.referenceMonth - 1), 'MMMM yyyy', {
    locale: ptBR,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              Folha de Pagamento - {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
            </h1>
            <p className="text-muted-foreground">
              {TYPE_CONFIG[payroll.type]} • {payroll.items?.length || 0} colaboradores
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={STATUS_CONFIG[payroll.status].color}>
            {STATUS_CONFIG[payroll.status].label}
          </Badge>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proventos</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(Number(payroll.totalEarnings))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Descontos</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(Number(payroll.totalDeductions))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Líquido</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(Number(payroll.netAmount))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Colaboradores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payroll.items?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Informações e Ações */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Folha</CardTitle>
          <CardDescription>Detalhes e ações disponíveis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Período:</span>
                <span>
                  {format(new Date(payroll.startDate), 'dd/MM/yyyy', { locale: ptBR })} até{' '}
                  {format(new Date(payroll.endDate), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Data de Pagamento:</span>
                <span>{format(new Date(payroll.paymentDate), 'dd/MM/yyyy', { locale: ptBR })}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Criado em:</span>{' '}
                {format(new Date(payroll.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </div>
              {payroll.approvedAt && (
                <div className="text-sm">
                  <span className="font-medium">Aprovado em:</span>{' '}
                  {format(new Date(payroll.approvedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-2">
            {payroll.status === 'DRAFT' && (
              <>
                <Button onClick={handleCalculate} disabled={actionLoading}>
                  <Calculator className="mr-2 h-4 w-4" />
                  Calcular Folha
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={actionLoading}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              </>
            )}

            {payroll.status === 'CALCULATED' && (
              <>
                <Button onClick={handleApprove} disabled={actionLoading}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Aprovar Folha
                </Button>
              </>
            )}

            {payroll.status === 'APPROVED' && (
              <>
                <Button onClick={handleMarkAsPaid} disabled={actionLoading}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Marcar como Paga
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Colaboradores */}
      {payroll.items && payroll.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Colaboradores</CardTitle>
            <CardDescription>
              Lista detalhada de todos os colaboradores nesta folha
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead className="text-right">Proventos</TableHead>
                  <TableHead className="text-right">Descontos</TableHead>
                  <TableHead className="text-right">Líquido</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payroll.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.employee.name}</TableCell>
                    <TableCell>{item.employee.cpf}</TableCell>
                    <TableCell>{item.employee.position?.name || '-'}</TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatCurrency(Number(item.totalEarnings))}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {formatCurrency(Number(item.totalDeductions))}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(Number(item.netAmount))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta folha de pagamento? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
