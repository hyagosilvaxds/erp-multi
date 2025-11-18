'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit, Trash2, Power, DollarSign, Percent } from "lucide-react"
import { useToast } from '@/hooks/use-toast'
import {
  employeeEarningsApi,
  type EmployeeEarning,
} from '@/lib/api/employee-earnings'
import { earningTypesApi, type EarningType } from '@/lib/api/earning-types'

interface EmployeeEarningsProps {
  employeeId: string
}

export function EmployeeEarnings({ employeeId }: EmployeeEarningsProps) {
  const { toast } = useToast()

  const [earnings, setEarnings] = useState<EmployeeEarning[]>([])
  const [earningTypes, setEarningTypes] = useState<EarningType[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [editingId, setEditingId] = useState('')
  const [deleteId, setDeleteId] = useState('')
  const [deleteName, setDeleteName] = useState('')

  // Filtros
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'current' | 'previous' | 'custom'>('all')
  const [filterMonth, setFilterMonth] = useState<string>('')
  const [filterYear, setFilterYear] = useState<string>('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')
  const [filterRecurrent, setFilterRecurrent] = useState<'all' | 'recurrent' | 'one-time'>('all')

  // Form
  const [earningTypeId, setEarningTypeId] = useState('')
  const [isRecurrent, setIsRecurrent] = useState(false)
  const [valueType, setValueType] = useState<'value' | 'percentage'>('value')
  const [value, setValue] = useState('')
  const [percentage, setPercentage] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    loadData()
  }, [employeeId, filterPeriod, filterMonth, filterYear, filterActive, filterRecurrent])

  const loadData = async () => {
    await Promise.all([loadEarnings(), loadEarningTypes()])
  }

  const getFilterParams = () => {
    const params: any = {}
    
    // Filtro de período
    if (filterPeriod === 'current') {
      const now = new Date()
      params.month = now.getMonth() + 1
      params.year = now.getFullYear()
    } else if (filterPeriod === 'previous') {
      const now = new Date()
      const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth()
      const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
      params.month = prevMonth
      params.year = prevYear
    } else if (filterPeriod === 'custom' && filterMonth && filterYear) {
      params.month = parseInt(filterMonth)
      params.year = parseInt(filterYear)
    }
    
    // Filtro de status ativo
    if (filterActive === 'active') {
      params.active = true
    } else if (filterActive === 'inactive') {
      params.active = false
    }
    
    // Filtro de recorrente
    if (filterRecurrent === 'recurrent') {
      params.isRecurrent = true
    } else if (filterRecurrent === 'one-time') {
      params.isRecurrent = false
    }
    
    return params
  }

  const loadEarnings = async () => {
    try {
      setLoading(true)
      const params = getFilterParams()
      console.log('🔍 Loading earnings with params:', params)
      const response = await employeeEarningsApi.getAll(employeeId, params)
      console.log('📦 Earnings response:', response)
      console.log('📊 Earnings data:', response.data)
      setEarnings(response.data || [])
    } catch (error: any) {
      console.error('❌ Error loading earnings:', error)
      setEarnings([]) // Garante que earnings seja um array vazio em caso de erro
      toast({
        title: 'Erro ao carregar proventos',
        description: error.response?.data?.message || 'Não foi possível carregar os proventos do colaborador.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const loadEarningTypes = async () => {
    try {
      const response = await earningTypesApi.getAll({ active: true })
      setEarningTypes(response.data)
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar tipos de provento',
        description: error.response?.data?.message || 'Não foi possível carregar os tipos de provento.',
        variant: 'destructive',
      })
    }
  }

  const openDialog = (earning?: EmployeeEarning) => {
    if (earning) {
      setMode('edit')
      setEditingId(earning.id)
      setEarningTypeId(earning.earningTypeId)
      setIsRecurrent(earning.isRecurrent)
      
      if (earning.value) {
        setValueType('value')
        setValue(earning.value)
        setPercentage('')
      } else if (earning.percentage) {
        setValueType('percentage')
        setPercentage(earning.percentage)
        setValue('')
      }
      
      setStartDate(earning.startDate)
      setEndDate(earning.endDate || '')
    } else {
      setMode('create')
      setEditingId('')
      setEarningTypeId('')
      setIsRecurrent(false)
      setValueType('value')
      setValue('')
      setPercentage('')
      setStartDate('')
      setEndDate('')
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!earningTypeId || !startDate) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Tipo de Provento e Data de Início são obrigatórios.',
        variant: 'destructive',
      })
      return
    }

    if (valueType === 'value' && !value) {
      toast({
        title: 'Valor obrigatório',
        description: 'Informe o valor do provento.',
        variant: 'destructive',
      })
      return
    }

    if (valueType === 'percentage' && !percentage) {
      toast({
        title: 'Percentual obrigatório',
        description: 'Informe o percentual do provento.',
        variant: 'destructive',
      })
      return
    }

    try {
      const data = {
        earningTypeId,
        isRecurrent,
        value: valueType === 'value' ? parseFloat(value) : undefined,
        percentage: valueType === 'percentage' ? parseFloat(percentage) : undefined,
        startDate,
        endDate: endDate || undefined,
      }

      if (mode === 'create') {
        await employeeEarningsApi.create(employeeId, data)
        toast({
          title: 'Provento adicionado',
          description: 'O provento foi adicionado ao colaborador com sucesso.',
        })
      } else {
        await employeeEarningsApi.update(employeeId, editingId, data)
        toast({
          title: 'Provento atualizado',
          description: 'O provento foi atualizado com sucesso.',
        })
      }

      setDialogOpen(false)
      loadEarnings()
    } catch (error: any) {
      toast({
        title: mode === 'create' ? 'Erro ao adicionar provento' : 'Erro ao atualizar provento',
        description: error.response?.data?.message || 'Não foi possível salvar o provento.',
        variant: 'destructive',
      })
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await employeeEarningsApi.toggleActive(employeeId, id)
      toast({
        title: currentStatus ? 'Provento desativado' : 'Provento ativado',
        description: `O provento foi ${currentStatus ? 'desativado' : 'ativado'} com sucesso.`,
      })
      loadEarnings()
    } catch (error: any) {
      toast({
        title: 'Erro ao alterar status',
        description: error.response?.data?.message || 'Não foi possível alterar o status do provento.',
        variant: 'destructive',
      })
    }
  }

  const openDeleteDialog = (id: string, name: string) => {
    setDeleteId(id)
    setDeleteName(name)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    try {
      await employeeEarningsApi.delete(employeeId, deleteId)
      toast({
        title: 'Provento removido',
        description: 'O provento foi removido do colaborador com sucesso.',
      })
      setDeleteDialogOpen(false)
      loadEarnings()
    } catch (error: any) {
      toast({
        title: 'Erro ao remover provento',
        description: error.response?.data?.message || 'Não foi possível remover o provento.',
        variant: 'destructive',
      })
    }
  }

  const formatValue = (value: string | undefined, percentage: string | undefined) => {
    if (value) {
      const numValue = parseFloat(value)
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(numValue)
    }
    if (percentage) {
      return `${percentage}%`
    }
    return '-'
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Proventos</CardTitle>
            <CardDescription>Gerencie os proventos adicionais do colaborador</CardDescription>
          </div>
          <Button onClick={() => openDialog()} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Provento
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="grid gap-4 md:grid-cols-4 p-4 border rounded-lg bg-muted/30">
          <div className="space-y-2">
            <Label htmlFor="filterPeriod">Período</Label>
            <Select value={filterPeriod} onValueChange={(value: any) => setFilterPeriod(value)}>
              <SelectTrigger id="filterPeriod">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Períodos</SelectItem>
                <SelectItem value="current">Mês Atual</SelectItem>
                <SelectItem value="previous">Mês Anterior</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filterPeriod === 'custom' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="filterMonth">Mês</Label>
                <Select value={filterMonth} onValueChange={setFilterMonth}>
                  <SelectTrigger id="filterMonth">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Janeiro</SelectItem>
                    <SelectItem value="2">Fevereiro</SelectItem>
                    <SelectItem value="3">Março</SelectItem>
                    <SelectItem value="4">Abril</SelectItem>
                    <SelectItem value="5">Maio</SelectItem>
                    <SelectItem value="6">Junho</SelectItem>
                    <SelectItem value="7">Julho</SelectItem>
                    <SelectItem value="8">Agosto</SelectItem>
                    <SelectItem value="9">Setembro</SelectItem>
                    <SelectItem value="10">Outubro</SelectItem>
                    <SelectItem value="11">Novembro</SelectItem>
                    <SelectItem value="12">Dezembro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filterYear">Ano</Label>
                <Input
                  id="filterYear"
                  type="number"
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  placeholder="2025"
                  min="2000"
                  max="2100"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="filterActive">Status</Label>
            <Select value={filterActive} onValueChange={(value: any) => setFilterActive(value)}>
              <SelectTrigger id="filterActive">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Apenas Ativos</SelectItem>
                <SelectItem value="inactive">Apenas Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filterRecurrent">Tipo</Label>
            <Select value={filterRecurrent} onValueChange={(value: any) => setFilterRecurrent(value)}>
              <SelectTrigger id="filterRecurrent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="recurrent">Recorrentes</SelectItem>
                <SelectItem value="one-time">Pontuais</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Conteúdo */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Carregando...</p>
          </div>
        ) : !earnings || earnings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>Nenhum provento adicional cadastrado</p>
            <p className="text-sm mt-1">
              {filterPeriod !== 'all' || filterActive !== 'all' || filterRecurrent !== 'all'
                ? 'Tente ajustar os filtros ou clique em "Adicionar Provento"'
                : 'Clique em "Adicionar Provento" para começar'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Provento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Recorrente</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Fim</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {earnings.map((earning) => (
                <TableRow key={earning.id}>
                  <TableCell className="font-mono text-sm">{earning.earningType.code}</TableCell>
                  <TableCell className="font-medium">{earning.earningType.name}</TableCell>
                  <TableCell>
                    {earning.value ? (
                      <Badge variant="outline" className="gap-1">
                        <DollarSign className="h-3 w-3" />
                        Fixo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <Percent className="h-3 w-3" />
                        Percentual
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatValue(earning.value, earning.percentage)}
                  </TableCell>
                  <TableCell>
                    {earning.isRecurrent ? (
                      <Badge variant="secondary">Sim</Badge>
                    ) : (
                      <Badge variant="outline">Não</Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(earning.startDate)}</TableCell>
                  <TableCell>{earning.endDate ? formatDate(earning.endDate) : '-'}</TableCell>
                  <TableCell>
                    {earning.active ? (
                      <Badge variant="default">Ativo</Badge>
                    ) : (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(earning.id, earning.active)}
                        title={earning.active ? 'Desativar' : 'Ativar'}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDialog(earning)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(earning.id, earning.earningType.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Dialog Criar/Editar */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {mode === 'create' ? 'Adicionar Provento' : 'Editar Provento'}
              </DialogTitle>
              <DialogDescription>
                {mode === 'create'
                  ? 'Adicione um novo provento ao colaborador'
                  : 'Atualize as informações do provento'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="earning-type">Tipo de Provento *</Label>
                <Select value={earningTypeId} onValueChange={setEarningTypeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de provento" />
                  </SelectTrigger>
                  <SelectContent>
                    {earningTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">{type.code}</span>
                          <span>{type.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Valor *</Label>
                <Select value={valueType} onValueChange={(v: any) => setValueType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="value">Valor Fixo</SelectItem>
                    <SelectItem value="percentage">Percentual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {valueType === 'value' ? (
                <div className="space-y-2">
                  <Label htmlFor="value">Valor (R$) *</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="percentage">Percentual (%) *</Label>
                  <Input
                    id="percentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0.00"
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Data de Início *</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">Data de Fim</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="recurrent"
                  checked={isRecurrent}
                  onCheckedChange={(checked) => setIsRecurrent(checked as boolean)}
                />
                <label
                  htmlFor="recurrent"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Provento recorrente (será aplicado mensalmente)
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {mode === 'create' ? 'Adicionar' : 'Salvar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Confirmar Exclusão */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover o provento <strong>{deleteName}</strong> deste colaborador?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
