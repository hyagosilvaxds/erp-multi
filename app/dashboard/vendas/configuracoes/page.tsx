"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  CreditCard,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Check,
  X,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  paymentMethodsApi,
  type PaymentMethod,
  type PaymentMethodType,
  type CreatePaymentMethodDto,
  paymentMethodTypeLabels,
} from "@/lib/api/payment-methods"

export default function ConfiguracoesVendasPage() {
  const { toast } = useToast()
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState<CreatePaymentMethodDto>({
    name: "",
    code: "",
    type: "PIX",
    active: true,
    allowInstallments: false,
    maxInstallments: 1,
    installmentFee: 0,
    requiresCreditAnalysis: false,
    minCreditScore: undefined,
    daysToReceive: 0,
    transactionFee: 0,
    installmentTemplates: [],
  })

  // Installment template sendo editado
  const [currentTemplate, setCurrentTemplate] = useState({
    installmentNumber: 1,
    daysToPayment: 0,
    percentageOfTotal: 100,
    fixedAmount: undefined as number | undefined,
  })

  useEffect(() => {
    loadPaymentMethods()
  }, [])

  const loadPaymentMethods = async () => {
    try {
      setLoading(true)
      const data = await paymentMethodsApi.getAll()
      setPaymentMethods(data)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao carregar métodos de pagamento",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (method?: PaymentMethod) => {
    if (method) {
      setEditingMethod(method)
      setFormData({
        name: method.name,
        code: method.code,
        type: method.type,
        active: method.active,
        allowInstallments: method.allowInstallments,
        maxInstallments: method.maxInstallments,
        installmentFee: method.installmentFee,
        requiresCreditAnalysis: method.requiresCreditAnalysis,
        minCreditScore: method.minCreditScore || undefined,
        daysToReceive: method.daysToReceive || 0,
        transactionFee: method.transactionFee,
        installmentTemplates: method.installmentTemplates.map((t) => ({
          installmentNumber: t.installmentNumber,
          daysToPayment: t.daysToPayment,
          percentageOfTotal: t.percentageOfTotal || undefined,
          fixedAmount: t.fixedAmount || undefined,
        })),
      })
    } else {
      setEditingMethod(null)
      setFormData({
        name: "",
        code: "",
        type: "PIX",
        active: true,
        allowInstallments: false,
        maxInstallments: 1,
        installmentFee: 0,
        requiresCreditAnalysis: false,
        minCreditScore: undefined,
        daysToReceive: 0,
        transactionFee: 0,
        installmentTemplates: [],
      })
    }
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)

      // Validações
      if (!formData.name || !formData.code) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Nome e código são obrigatórios",
        })
        return
      }

      if (editingMethod) {
        await paymentMethodsApi.update(editingMethod.id, formData)
        toast({
          title: "Sucesso",
          description: "Método de pagamento atualizado com sucesso",
        })
      } else {
        await paymentMethodsApi.create(formData)
        toast({
          title: "Sucesso",
          description: "Método de pagamento criado com sucesso",
        })
      }

      setDialogOpen(false)
      loadPaymentMethods()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.response?.data?.message || error.message || "Erro ao salvar método de pagamento",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este método de pagamento?")) {
      return
    }

    try {
      await paymentMethodsApi.delete(id)
      toast({
        title: "Sucesso",
        description: "Método de pagamento excluído com sucesso",
      })
      loadPaymentMethods()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao excluir método de pagamento",
      })
    }
  }

  const handleToggleStatus = async (id: string, currentActive: boolean) => {
    try {
      // Usa o endpoint de toggle para alternar o status
      await paymentMethodsApi.toggleActive(id)
      toast({
        title: "Sucesso",
        description: `Método de pagamento ${!currentActive ? "ativado" : "desativado"} com sucesso`,
      })
      loadPaymentMethods()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao alterar status",
      })
    }
  }

  const handleAddTemplate = () => {
    setFormData({
      ...formData,
      installmentTemplates: [
        ...(formData.installmentTemplates || []),
        currentTemplate,
      ],
    })
    setCurrentTemplate({
      installmentNumber: (formData.installmentTemplates?.length || 0) + 2,
      daysToPayment: 0,
      percentageOfTotal: 0,
      fixedAmount: undefined,
    })
  }

  const handleRemoveTemplate = (index: number) => {
    const newTemplates = [...(formData.installmentTemplates || [])]
    newTemplates.splice(index, 1)
    setFormData({
      ...formData,
      installmentTemplates: newTemplates,
    })
  }

  const getTotalPercentage = () => {
    return (formData.installmentTemplates || []).reduce(
      (sum, t) => sum + (t.percentageOfTotal || 0),
      0
    )
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configurações de Vendas</h1>
            <p className="text-muted-foreground">
              Gerencie os métodos de pagamento disponíveis
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Método
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingMethod ? "Editar" : "Novo"} Método de Pagamento
                </DialogTitle>
                <DialogDescription>
                  Configure os detalhes do método de pagamento
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Informações Básicas */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Informações Básicas</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Ex: PIX, Cartão de Crédito"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="code">Código *</Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) =>
                          setFormData({ ...formData, code: e.target.value.toUpperCase() })
                        }
                        placeholder="Ex: PIX, CREDIT_CARD"
                        disabled={!!editingMethod}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo *</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value: PaymentMethodType) =>
                          setFormData({ ...formData, type: value })
                        }
                      >
                        <SelectTrigger id="type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(paymentMethodTypeLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2 pt-8">
                      <Switch
                        id="active"
                        checked={formData.active}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, active: checked })
                        }
                      />
                      <Label htmlFor="active">Ativo</Label>
                    </div>
                  </div>
                </div>

                {/* Taxas */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Taxas e Prazos</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="transactionFee">Taxa de Transação (%)</Label>
                      <Input
                        id="transactionFee"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.transactionFee}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            transactionFee: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="daysToReceive">Dias para Receber</Label>
                      <Input
                        id="daysToReceive"
                        type="number"
                        min="0"
                        value={formData.daysToReceive}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            daysToReceive: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Parcelamento */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="allowInstallments"
                      checked={formData.allowInstallments}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, allowInstallments: checked })
                      }
                    />
                    <Label htmlFor="allowInstallments" className="font-semibold">
                      Permitir Parcelamento
                    </Label>
                  </div>

                  {formData.allowInstallments && (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="maxInstallments">Máximo de Parcelas</Label>
                          <Input
                            id="maxInstallments"
                            type="number"
                            min="1"
                            max="48"
                            value={formData.maxInstallments}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                maxInstallments: parseInt(e.target.value) || 1,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="installmentFee">Taxa por Parcela (%)</Label>
                          <Input
                            id="installmentFee"
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={formData.installmentFee}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                installmentFee: parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                      </div>

                      {/* Templates de Parcelamento */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="font-semibold">
                            Templates de Parcelamento (Opcional)
                          </Label>
                          {formData.installmentTemplates && formData.installmentTemplates.length > 0 && (
                            <Badge variant={getTotalPercentage() === 100 ? "default" : "destructive"}>
                              Total: {getTotalPercentage()}%
                            </Badge>
                          )}
                        </div>

                        {formData.installmentTemplates && formData.installmentTemplates.length > 0 && (
                          <div className="rounded-lg border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Parcela</TableHead>
                                  <TableHead>Dias</TableHead>
                                  <TableHead>%</TableHead>
                                  <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {formData.installmentTemplates.map((template, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{template.installmentNumber}x</TableCell>
                                    <TableCell>{template.daysToPayment} dias</TableCell>
                                    <TableCell>{template.percentageOfTotal}%</TableCell>
                                    <TableCell>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveTemplate(index)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Adicionar Template</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                              <div className="space-y-2">
                                <Label htmlFor="templateNumber">Parcela</Label>
                                <Input
                                  id="templateNumber"
                                  type="number"
                                  min="1"
                                  value={currentTemplate.installmentNumber}
                                  onChange={(e) =>
                                    setCurrentTemplate({
                                      ...currentTemplate,
                                      installmentNumber: parseInt(e.target.value) || 1,
                                    })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="templateDays">Dias</Label>
                                <Input
                                  id="templateDays"
                                  type="number"
                                  min="0"
                                  value={currentTemplate.daysToPayment}
                                  onChange={(e) =>
                                    setCurrentTemplate({
                                      ...currentTemplate,
                                      daysToPayment: parseInt(e.target.value) || 0,
                                    })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="templatePercentage">% do Total</Label>
                                <Input
                                  id="templatePercentage"
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={currentTemplate.percentageOfTotal}
                                  onChange={(e) =>
                                    setCurrentTemplate({
                                      ...currentTemplate,
                                      percentageOfTotal: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                />
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleAddTemplate}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Adicionar Template
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  )}
                </div>

                {/* Análise de Crédito */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requiresCreditAnalysis"
                      checked={formData.requiresCreditAnalysis}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, requiresCreditAnalysis: checked })
                      }
                    />
                    <Label htmlFor="requiresCreditAnalysis" className="font-semibold">
                      Requer Análise de Crédito
                    </Label>
                  </div>

                  {formData.requiresCreditAnalysis && (
                    <div className="space-y-2">
                      <Label htmlFor="minCreditScore">Score Mínimo</Label>
                      <Input
                        id="minCreditScore"
                        type="number"
                        min="0"
                        max="1000"
                        value={formData.minCreditScore || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            minCreditScore: parseInt(e.target.value) || undefined,
                          })
                        }
                        placeholder="Ex: 600"
                      />
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingMethod ? "Atualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de Métodos */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-3">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Métodos de Pagamento</CardTitle>
                <CardDescription>
                  Configure os métodos de pagamento aceitos
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : paymentMethods.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="mx-auto h-12 w-12 mb-4 opacity-20" />
                <p>Nenhum método de pagamento cadastrado</p>
                <p className="text-sm">Clique em "Novo Método" para começar</p>
              </div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead className="text-center">Parcelamento</TableHead>
                      <TableHead className="text-center">Taxa</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentMethods.map((method) => (
                      <TableRow key={method.id}>
                        <TableCell className="font-medium">{method.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {paymentMethodTypeLabels[method.type]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs">{method.code}</code>
                        </TableCell>
                        <TableCell className="text-center">
                          {method.allowInstallments ? (
                            <Badge variant="secondary">
                              {method.maxInstallments}x
                            </Badge>
                          ) : (
                            <X className="h-4 w-4 mx-auto text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {method.transactionFee > 0
                            ? `${method.transactionFee}%`
                            : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={method.active}
                            onCheckedChange={() =>
                              handleToggleStatus(method.id, method.active)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(method)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(method.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <CreditCard className="h-5 w-5 text-blue-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">Sobre os Métodos de Pagamento</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Configure templates de parcelamento para boletos personalizados</li>
                  <li>A soma das porcentagens dos templates deve ser 100%</li>
                  <li>Taxa de transação e taxa de parcela são opcionais</li>
                  <li>Métodos inativos não aparecem nas vendas</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
