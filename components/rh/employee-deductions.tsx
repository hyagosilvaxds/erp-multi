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
import { Plus, Edit, Trash2, Power, Minus, Percent } from "lucide-react"
import { useToast } from '@/hooks/use-toast'
import {
  employeeDeductionsApi,
  type EmployeeDeduction,
} from '@/lib/api/employee-deductions'
import { deductionTypesApi, type DeductionType } from '@/lib/api/deduction-types'

interface EmployeeDeductionsProps {
  employeeId: string
}

export function EmployeeDeductions({ employeeId }: EmployeeDeductionsProps) {
  const { toast } = useToast()

  const [deductions, setDeductions] = useState<EmployeeDeduction[]>([])
  const [deductionTypes, setDeductionTypes] = useState<DeductionType[]>([])
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
  const [deductionTypeId, setDeductionTypeId] = useState('')
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
    await Promise.all([loadDeductions(), loadDeductionTypes()])
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

  const loadDeductions = async () => {
    try {
      setLoading(true)
      const params = getFilterParams()
      console.log('🔍 Loading deductions with params:', params)
      const response = await employeeDeductionsApi.getAll(employeeId, params)
      console.log('📦 Deductions response:', response)
      console.log('📊 Deductions data:', response.data)
      setDeductions(response.data || [])
    } catch (error: any) {
      console.error('❌ Error loading deductions:', error)
      setDeductions([]) // Garante que deductions seja um array vazio em caso de erro
      toast({
        title: 'Erro ao carregar descontos',
        description: error.response?.data?.message || 'Não foi possível carregar os descontos do colaborador.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const loadDeductionTypes = async () => {
    try {
      const response = await deductionTypesApi.getAll({ active: true })
      setDeductionTypes(response.data)
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar tipos de desconto',
        description: error.response?.data?.message || 'Não foi possível carregar os tipos de desconto.',
        variant: 'destructive',
      })
    }
  }

  const openDialog = (deduction?: EmployeeDeduction) => {
    if (deduction) {
      setMode('edit')
      setEditingId(deduction.id)
      setDeductionTypeId(deduction.deductionTypeId)
      setIsRecurrent(deduction.isRecurrent)
      
      if (deduction.value) {
        setValueType('value')
        setValue(deduction.value)
        setPercentage('')
      } else if (deduction.percentage) {
        setValueType('percentage')
        setPercentage(deduction.percentage)
        setValue('')
      }
      
      setStartDate(deduction.startDate)
      setEndDate(deduction.endDate || '')
    } else {
      setMode('create')
      setEditingId('')
      setDeductionTypeId('')
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
    if (!deductionTypeId || !startDate) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha o tipo de desconto e a data de início.',
        variant: 'destructive',
      })
      return
    }

    if (valueType === 'value' && !value) {
      toast({
        title: 'Valor obrigatório',
        description: 'Preencha o valor do desconto.',
        variant: 'destructive',
      })
      return
    }

    if (valueType === 'percentage' && !percentage) {
      toast({
        title: 'Percentual obrigatório',
        description: 'Preencha o percentual do desconto.',
        variant: 'destructive',
      })
      return
    }

    try {
      const data = {
        deductionTypeId,
        isRecurrent,
        value: valueType === 'value' ? parseFloat(value) : undefined,
        percentage: valueType === 'percentage' ? parseFloat(percentage) : undefined,
        startDate,
        endDate: endDate || undefined,
      }

      if (mode === 'create') {
        await employeeDeductionsApi.create(employeeId, data)
        toast({
          title: 'Desconto adicionado',
          description: 'O desconto foi adicionado ao colaborador com sucesso.',
        })
      } else {
        await employeeDeductionsApi.update(employeeId, editingId, data)
        toast({
          title: 'Desconto atualizado',
          description: 'O desconto foi atualizado com sucesso.',
        })
      }

      setDialogOpen(false)
      loadDeductions()
    } catch (error: any) {
      toast({
        title: mode === 'create' ? 'Erro ao adicionar desconto' : 'Erro ao atualizar desconto',
        description: error.response?.data?.message || 'Não foi possível salvar o desconto.',
        variant: 'destructive',
      })
    }
  }

  const handleToggleActive = async (id: string) => {
    try {
      await employeeDeductionsApi.toggleActive(employeeId, id)
      toast({
        title: 'Status alterado',
        description: 'O status do desconto foi alterado com sucesso.',
      })
      loadDeductions()
    } catch (error: any) {
      toast({
        title: 'Erro ao alterar status',
        description: error.response?.data?.message || 'Não foi possível alterar o status do desconto.',
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
      await employeeDeductionsApi.delete(employeeId, deleteId)
      toast({
        title: 'Desconto removido',
        description: 'O desconto foi removido do colaborador com sucesso.',
      })
      setDeleteDialogOpen(false)
      loadDeductions()
    } catch (error: any) {
      toast({
        title: 'Erro ao remover desconto',
        description: error.response?.data?.message || 'Não foi possível remover o desconto.',
        variant: 'destructive',
      })
    }
  }

  const formatValue = (value?: string, percentage?: string) => {
    if (value) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(parseFloat(value))
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
            <CardTitle>Descontos</CardTitle>
            <CardDescription>Gerencie os descontos aplicados ao colaborador</CardDescription>
          </div>
          <Button onClick={() => openDialog()} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Desconto
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
        ) : !deductions || deductions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Minus className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>Nenhum desconto cadastrado</p>
            <p className="text-sm mt-1">
              {filterPeriod !== 'all' || filterActive !== 'all' || filterRecurrent !== 'all'
                ? 'Tente ajustar os filtros ou clique em "Adicionar Desconto"'
                : 'Clique em "Adicionar Desconto" para começar'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Desconto</TableHead>
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
              {deductions.map((deduction) => (
                <TableRow key={deduction.id}>
                  <TableCell className="font-mono text-sm">{deduction.deductionType.code}</TableCell>
                  <TableCell className="font-medium">{deduction.deductionType.name}</TableCell>
                  <TableCell>
                    {deduction.value ? (
                      <Badge variant="outline" className="gap-1">
                        <Minus className="h-3 w-3" />
                        Fixo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <Percent className="h-3 w-3" />
                        Percentual
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-red-600">
                    -{formatValue(deduction.value, deduction.percentage)}
                  </TableCell>
                  <TableCell>
                    {deduction.isRecurrent ? (
                      <Badge variant="secondary">Sim</Badge>
                    ) : (
                      <Badge variant="outline">Não</Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(deduction.startDate)}</TableCell>
                  <TableCell>{deduction.endDate ? formatDate(deduction.endDate) : '-'}</TableCell>
                  <TableCell>
                    {deduction.active ? (
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
                        onClick={() => handleToggleActive(deduction.id)}
                        title={deduction.active ? 'Desativar' : 'Ativar'}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDialog(deduction)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(deduction.id, deduction.deductionType.name)}
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
                {mode === 'create' ? 'Adicionar Desconto' : 'Editar Desconto'}
              </DialogTitle>
              <DialogDescription>
                {mode === 'create'
                  ? 'Adicione um novo desconto ao colaborador'
                  : 'Edite as informações do desconto'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="deductionTypeId">Tipo de Desconto *</Label>
                <Select value={deductionTypeId} onValueChange={setDeductionTypeId}>
                  <SelectTrigger id="deductionTypeId">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {deductionTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">{type.code}</span>
                          <span>{type.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isRecurrent"
                  checked={isRecurrent}
                  onCheckedChange={(checked) => setIsRecurrent(checked as boolean)}
                />
                <Label htmlFor="isRecurrent" className="cursor-pointer">
                  Desconto recorrente (todo mês)
                </Label>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Valor *</Label>
                <Select value={valueType} onValueChange={(value: 'value' | 'percentage') => setValueType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="value">Valor Fixo</SelectItem>
                    <SelectItem value="percentage">Percentual sobre Salário</SelectItem>
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
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="percentage">Percentual (%) *</Label>
                  <Input
                    id="percentage"
                    type="number"
                    step="0.01"
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                    placeholder="0.00"
                    max="100"
                  />
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data de Início *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">Data de Fim</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Deixe em branco para desconto indeterminado
                  </p>
                </div>
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
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover o desconto <strong>{deleteName}</strong>? Esta ação não pode ser desfeita.
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
      </CardContent>
    </Card>
  )
}
