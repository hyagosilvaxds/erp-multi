'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Search, Edit, Trash2, Power, DollarSign, TrendingDown } from "lucide-react"
import { useToast } from '@/hooks/use-toast'
import {
  earningTypesApi,
  type EarningType,
} from '@/lib/api/earning-types'
import {
  deductionTypesApi,
  type DeductionType,
} from '@/lib/api/deduction-types'

export default function ProventosDescontosPage() {
  const { toast } = useToast()

  // Estados gerais
  const [activeTab, setActiveTab] = useState('earnings')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'earning' | 'deduction' | null>(null)
  const [deleteId, setDeleteId] = useState('')
  const [deleteName, setDeleteName] = useState('')

  // Estados para Proventos
  const [earnings, setEarnings] = useState<EarningType[]>([])
  const [loadingEarnings, setLoadingEarnings] = useState(true)
  const [earningDialogOpen, setEarningDialogOpen] = useState(false)
  const [earningMode, setEarningMode] = useState<'create' | 'edit'>('create')
  const [editingEarningId, setEditingEarningId] = useState('')
  const [earningSearchTerm, setEarningSearchTerm] = useState('')
  const [earningStatusFilter, setEarningStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Form Proventos
  const [earningCode, setEarningCode] = useState('')
  const [earningName, setEarningName] = useState('')
  const [earningDescription, setEarningDescription] = useState('')
  const [earningIsRecurrent, setEarningIsRecurrent] = useState(false)
  const [earningIsPercentage, setEarningIsPercentage] = useState(false)
  const [earningBaseValue, setEarningBaseValue] = useState('')
  const [earningHasINSS, setEarningHasINSS] = useState(false)
  const [earningHasFGTS, setEarningHasFGTS] = useState(false)
  const [earningHasIRRF, setEarningHasIRRF] = useState(false)

  // Estados para Descontos
  const [deductions, setDeductions] = useState<DeductionType[]>([])
  const [loadingDeductions, setLoadingDeductions] = useState(true)
  const [deductionDialogOpen, setDeductionDialogOpen] = useState(false)
  const [deductionMode, setDeductionMode] = useState<'create' | 'edit'>('create')
  const [editingDeductionId, setEditingDeductionId] = useState('')
  const [deductionSearchTerm, setDeductionSearchTerm] = useState('')
  const [deductionStatusFilter, setDeductionStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Form Descontos
  const [deductionCode, setDeductionCode] = useState('')
  const [deductionName, setDeductionName] = useState('')
  const [deductionDescription, setDeductionDescription] = useState('')
  const [deductionIsRecurrent, setDeductionIsRecurrent] = useState(false)
  const [deductionIsPercentage, setDeductionIsPercentage] = useState(false)
  const [deductionBaseValue, setDeductionBaseValue] = useState('')

  useEffect(() => {
    loadEarnings()
  }, [earningSearchTerm, earningStatusFilter])

  useEffect(() => {
    loadDeductions()
  }, [deductionSearchTerm, deductionStatusFilter])

  // Funções Proventos
  const loadEarnings = async () => {
    try {
      setLoadingEarnings(true)
      const response = await earningTypesApi.getAll({
        search: earningSearchTerm || undefined,
        active: earningStatusFilter === 'all' ? undefined : earningStatusFilter === 'active',
      })
      setEarnings(response.data)
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar proventos',
        description: error.response?.data?.message || 'Não foi possível carregar os tipos de provento.',
        variant: 'destructive',
      })
    } finally {
      setLoadingEarnings(false)
    }
  }

  const openEarningDialog = (earning?: EarningType) => {
    if (earning) {
      setEarningMode('edit')
      setEditingEarningId(earning.id)
      setEarningCode(earning.code)
      setEarningName(earning.name)
      setEarningDescription(earning.description || '')
      setEarningIsRecurrent(earning.isRecurrent)
      setEarningIsPercentage(earning.isPercentage)
      setEarningBaseValue(earning.baseValue?.toString() || '')
      setEarningHasINSS(earning.hasINSS)
      setEarningHasFGTS(earning.hasFGTS)
      setEarningHasIRRF(earning.hasIRRF)
    } else {
      setEarningMode('create')
      setEditingEarningId('')
      setEarningCode('')
      setEarningName('')
      setEarningDescription('')
      setEarningIsRecurrent(false)
      setEarningIsPercentage(false)
      setEarningBaseValue('')
      setEarningHasINSS(false)
      setEarningHasFGTS(false)
      setEarningHasIRRF(false)
    }
    setEarningDialogOpen(true)
  }

  const handleSaveEarning = async () => {
    if (!earningCode || !earningName) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Código e Nome são obrigatórios.',
        variant: 'destructive',
      })
      return
    }

    try {
      const data = {
        code: earningCode.toUpperCase(),
        name: earningName,
        description: earningDescription || undefined,
        isRecurrent: earningIsRecurrent,
        isPercentage: earningIsPercentage,
        baseValue: earningBaseValue ? parseFloat(earningBaseValue) : undefined,
        hasINSS: earningHasINSS,
        hasFGTS: earningHasFGTS,
        hasIRRF: earningHasIRRF,
      }

      if (earningMode === 'create') {
        await earningTypesApi.create(data)
        toast({
          title: 'Provento criado',
          description: 'O tipo de provento foi criado com sucesso.',
        })
      } else {
        await earningTypesApi.update(editingEarningId, data)
        toast({
          title: 'Provento atualizado',
          description: 'O tipo de provento foi atualizado com sucesso.',
        })
      }

      setEarningDialogOpen(false)
      loadEarnings()
    } catch (error: any) {
      toast({
        title: earningMode === 'create' ? 'Erro ao criar provento' : 'Erro ao atualizar provento',
        description: error.response?.data?.message || 'Não foi possível salvar o tipo de provento.',
        variant: 'destructive',
      })
    }
  }

  const handleToggleEarning = async (id: string, currentStatus: boolean) => {
    try {
      await earningTypesApi.toggleActive(id)
      toast({
        title: currentStatus ? 'Provento desativado' : 'Provento ativado',
        description: `O tipo de provento foi ${currentStatus ? 'desativado' : 'ativado'} com sucesso.`,
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

  // Funções Descontos
  const loadDeductions = async () => {
    try {
      setLoadingDeductions(true)
      const response = await deductionTypesApi.getAll({
        search: deductionSearchTerm || undefined,
        active: deductionStatusFilter === 'all' ? undefined : deductionStatusFilter === 'active',
      })
      setDeductions(response.data)
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar descontos',
        description: error.response?.data?.message || 'Não foi possível carregar os tipos de desconto.',
        variant: 'destructive',
      })
    } finally {
      setLoadingDeductions(false)
    }
  }

  const openDeductionDialog = (deduction?: DeductionType) => {
    if (deduction) {
      setDeductionMode('edit')
      setEditingDeductionId(deduction.id)
      setDeductionCode(deduction.code)
      setDeductionName(deduction.name)
      setDeductionDescription(deduction.description || '')
      setDeductionIsRecurrent(deduction.isRecurrent)
      setDeductionIsPercentage(deduction.isPercentage)
      setDeductionBaseValue(deduction.baseValue?.toString() || '')
    } else {
      setDeductionMode('create')
      setEditingDeductionId('')
      setDeductionCode('')
      setDeductionName('')
      setDeductionDescription('')
      setDeductionIsRecurrent(false)
      setDeductionIsPercentage(false)
      setDeductionBaseValue('')
    }
    setDeductionDialogOpen(true)
  }

  const handleSaveDeduction = async () => {
    if (!deductionCode || !deductionName) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Código e Nome são obrigatórios.',
        variant: 'destructive',
      })
      return
    }

    try {
      const data = {
        code: deductionCode.toUpperCase(),
        name: deductionName,
        description: deductionDescription || undefined,
        isRecurrent: deductionIsRecurrent,
        isPercentage: deductionIsPercentage,
        baseValue: deductionBaseValue ? parseFloat(deductionBaseValue) : undefined,
      }

      if (deductionMode === 'create') {
        await deductionTypesApi.create(data)
        toast({
          title: 'Desconto criado',
          description: 'O tipo de desconto foi criado com sucesso.',
        })
      } else {
        await deductionTypesApi.update(editingDeductionId, data)
        toast({
          title: 'Desconto atualizado',
          description: 'O tipo de desconto foi atualizado com sucesso.',
        })
      }

      setDeductionDialogOpen(false)
      loadDeductions()
    } catch (error: any) {
      toast({
        title: deductionMode === 'create' ? 'Erro ao criar desconto' : 'Erro ao atualizar desconto',
        description: error.response?.data?.message || 'Não foi possível salvar o tipo de desconto.',
        variant: 'destructive',
      })
    }
  }

  const handleToggleDeduction = async (id: string, currentStatus: boolean) => {
    try {
      await deductionTypesApi.toggleActive(id)
      toast({
        title: currentStatus ? 'Desconto desativado' : 'Desconto ativado',
        description: `O tipo de desconto foi ${currentStatus ? 'desativado' : 'ativado'} com sucesso.`,
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

  // Funções de Exclusão
  const openDeleteDialog = (type: 'earning' | 'deduction', id: string, name: string) => {
    setDeleteType(type)
    setDeleteId(id)
    setDeleteName(name)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    try {
      if (deleteType === 'earning') {
        await earningTypesApi.delete(deleteId)
        toast({
          title: 'Provento excluído',
          description: 'O tipo de provento foi excluído com sucesso.',
        })
        loadEarnings()
      } else {
        await deductionTypesApi.delete(deleteId)
        toast({
          title: 'Desconto excluído',
          description: 'O tipo de desconto foi excluído com sucesso.',
        })
        loadDeductions()
      }
      setDeleteDialogOpen(false)
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir',
        description: error.response?.data?.message || 'Não foi possível excluir o item.',
        variant: 'destructive',
      })
    }
  }

  const formatValue = (value: string | number | undefined, isPercentage: boolean) => {
    if (value === undefined) return '-'
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(numValue)) return '-'
    if (isPercentage) return `${numValue}%`
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue)
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Proventos e Descontos</h1>
          <p className="text-muted-foreground">Gerencie os tipos de proventos e descontos para cálculo de folha</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="earnings" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Proventos
            </TabsTrigger>
            <TabsTrigger value="deductions" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Descontos
            </TabsTrigger>
          </TabsList>

          {/* Tab Proventos */}
          <TabsContent value="earnings" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Tipos de Provento</CardTitle>
                    <CardDescription>Gerencie os tipos de provento para cálculo de folha</CardDescription>
                  </div>
                  <Button onClick={() => openEarningDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Provento
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filtros */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por código ou nome..."
                      value={earningSearchTerm}
                      onChange={(e) => setEarningSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={earningStatusFilter} onValueChange={(value: any) => setEarningStatusFilter(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativos</SelectItem>
                      <SelectItem value="inactive">Inativos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tabela */}
                {loadingEarnings ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Carregando...</p>
                  </div>
                ) : earnings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhum tipo de provento encontrado</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Valor Base</TableHead>
                        <TableHead>Recorrente</TableHead>
                        <TableHead>Encargos</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {earnings.map((earning) => (
                        <TableRow key={earning.id}>
                          <TableCell className="font-mono">{earning.code}</TableCell>
                          <TableCell className="font-medium">{earning.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {earning.isPercentage ? 'Percentual' : 'Fixo'}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatValue(earning.baseValue, earning.isPercentage)}</TableCell>
                          <TableCell>
                            {earning.isRecurrent ? (
                              <Badge variant="secondary">Sim</Badge>
                            ) : (
                              <Badge variant="outline">Não</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {earning.hasINSS && <Badge variant="secondary" className="text-xs">INSS</Badge>}
                              {earning.hasFGTS && <Badge variant="secondary" className="text-xs">FGTS</Badge>}
                              {earning.hasIRRF && <Badge variant="secondary" className="text-xs">IRRF</Badge>}
                              {!earning.hasINSS && !earning.hasFGTS && !earning.hasIRRF && (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </div>
                          </TableCell>
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
                                onClick={() => handleToggleEarning(earning.id, earning.active)}
                                title={earning.active ? 'Desativar' : 'Ativar'}
                              >
                                <Power className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEarningDialog(earning)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteDialog('earning', earning.id, earning.name)}
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Descontos */}
          <TabsContent value="deductions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Tipos de Desconto</CardTitle>
                    <CardDescription>Gerencie os tipos de desconto para cálculo de folha</CardDescription>
                  </div>
                  <Button onClick={() => openDeductionDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Desconto
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filtros */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por código ou nome..."
                      value={deductionSearchTerm}
                      onChange={(e) => setDeductionSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={deductionStatusFilter} onValueChange={(value: any) => setDeductionStatusFilter(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativos</SelectItem>
                      <SelectItem value="inactive">Inativos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tabela */}
                {loadingDeductions ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Carregando...</p>
                  </div>
                ) : deductions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhum tipo de desconto encontrado</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Valor Base</TableHead>
                        <TableHead>Recorrente</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deductions.map((deduction) => (
                        <TableRow key={deduction.id}>
                          <TableCell className="font-mono">{deduction.code}</TableCell>
                          <TableCell className="font-medium">{deduction.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {deduction.isPercentage ? 'Percentual' : 'Fixo'}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatValue(deduction.baseValue, deduction.isPercentage)}</TableCell>
                          <TableCell>
                            {deduction.isRecurrent ? (
                              <Badge variant="secondary">Sim</Badge>
                            ) : (
                              <Badge variant="outline">Não</Badge>
                            )}
                          </TableCell>
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
                                onClick={() => handleToggleDeduction(deduction.id, deduction.active)}
                                title={deduction.active ? 'Desativar' : 'Ativar'}
                              >
                                <Power className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeductionDialog(deduction)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteDialog('deduction', deduction.id, deduction.name)}
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog Provento */}
        <Dialog open={earningDialogOpen} onOpenChange={setEarningDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {earningMode === 'create' ? 'Novo Tipo de Provento' : 'Editar Tipo de Provento'}
              </DialogTitle>
              <DialogDescription>
                {earningMode === 'create'
                  ? 'Crie um novo tipo de provento para cálculo de folha'
                  : 'Atualize as informações do tipo de provento'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="earning-code">Código *</Label>
                  <Input
                    id="earning-code"
                    placeholder="Ex: SAL, HE, COM"
                    value={earningCode}
                    onChange={(e) => setEarningCode(e.target.value.toUpperCase())}
                    maxLength={20}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="earning-name">Nome *</Label>
                  <Input
                    id="earning-name"
                    placeholder="Ex: Salário Base"
                    value={earningName}
                    onChange={(e) => setEarningName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="earning-description">Descrição</Label>
                <Textarea
                  id="earning-description"
                  placeholder="Descrição do tipo de provento"
                  value={earningDescription}
                  onChange={(e) => setEarningDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="earning-base-value">Valor Base</Label>
                  <Input
                    id="earning-base-value"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={earningBaseValue}
                    onChange={(e) => setEarningBaseValue(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3 border-t pt-4">
                <Label>Configurações</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="earning-recurrent"
                    checked={earningIsRecurrent}
                    onCheckedChange={(checked) => setEarningIsRecurrent(checked as boolean)}
                  />
                  <label
                    htmlFor="earning-recurrent"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Provento recorrente
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="earning-percentage"
                    checked={earningIsPercentage}
                    onCheckedChange={(checked) => setEarningIsPercentage(checked as boolean)}
                  />
                  <label
                    htmlFor="earning-percentage"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Valor em percentual
                  </label>
                </div>
              </div>

              <div className="space-y-3 border-t pt-4">
                <Label>Incidência de Encargos</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="earning-inss"
                    checked={earningHasINSS}
                    onCheckedChange={(checked) => setEarningHasINSS(checked as boolean)}
                  />
                  <label
                    htmlFor="earning-inss"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Tem incidência de INSS
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="earning-fgts"
                    checked={earningHasFGTS}
                    onCheckedChange={(checked) => setEarningHasFGTS(checked as boolean)}
                  />
                  <label
                    htmlFor="earning-fgts"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Tem incidência de FGTS
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="earning-irrf"
                    checked={earningHasIRRF}
                    onCheckedChange={(checked) => setEarningHasIRRF(checked as boolean)}
                  />
                  <label
                    htmlFor="earning-irrf"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Tem incidência de IRRF
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEarningDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEarning}>
                {earningMode === 'create' ? 'Criar Provento' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Desconto */}
        <Dialog open={deductionDialogOpen} onOpenChange={setDeductionDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {deductionMode === 'create' ? 'Novo Tipo de Desconto' : 'Editar Tipo de Desconto'}
              </DialogTitle>
              <DialogDescription>
                {deductionMode === 'create'
                  ? 'Crie um novo tipo de desconto para cálculo de folha'
                  : 'Atualize as informações do tipo de desconto'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deduction-code">Código *</Label>
                  <Input
                    id="deduction-code"
                    placeholder="Ex: INSS, IRRF, VA"
                    value={deductionCode}
                    onChange={(e) => setDeductionCode(e.target.value.toUpperCase())}
                    maxLength={20}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deduction-name">Nome *</Label>
                  <Input
                    id="deduction-name"
                    placeholder="Ex: INSS"
                    value={deductionName}
                    onChange={(e) => setDeductionName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deduction-description">Descrição</Label>
                <Textarea
                  id="deduction-description"
                  placeholder="Descrição do tipo de desconto"
                  value={deductionDescription}
                  onChange={(e) => setDeductionDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deduction-base-value">Valor Base</Label>
                  <Input
                    id="deduction-base-value"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={deductionBaseValue}
                    onChange={(e) => setDeductionBaseValue(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3 border-t pt-4">
                <Label>Configurações</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="deduction-recurrent"
                    checked={deductionIsRecurrent}
                    onCheckedChange={(checked) => setDeductionIsRecurrent(checked as boolean)}
                  />
                  <label
                    htmlFor="deduction-recurrent"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Desconto recorrente
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="deduction-percentage"
                    checked={deductionIsPercentage}
                    onCheckedChange={(checked) => setDeductionIsPercentage(checked as boolean)}
                  />
                  <label
                    htmlFor="deduction-percentage"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Valor em percentual
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDeductionDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveDeduction}>
                {deductionMode === 'create' ? 'Criar Desconto' : 'Salvar Alterações'}
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
                Tem certeza que deseja excluir <strong>{deleteName}</strong>?
                Esta ação não pode ser desfeita.
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
    </DashboardLayout>
  )
}
