'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Edit, Trash2, UserCheck, UserX, UserMinus } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import {
  employeesApi,
  type Employee,
  type ContractType,
} from '@/lib/api/employees'
import { maskCPF, maskPhone, maskCEP, maskCNPJ } from '@/lib/masks'
import { EmployeeDocuments } from '@/components/rh/employee-documents'
import { EmployeeEarnings } from '@/components/rh/employee-earnings'
import { EmployeeDeductions } from '@/components/rh/employee-deductions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

export default function ColaboradorDetalhesPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const employeeId = params.id as string

  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [dismissDialogOpen, setDismissDialogOpen] = useState(false)
  const [toggleActiveLoading, setToggleActiveLoading] = useState(false)
  const [dismissing, setDismissing] = useState(false)
  
  // Dismiss form
  const [dismissalDate, setDismissalDate] = useState('')
  const [dismissalNotes, setDismissalNotes] = useState('')

  useEffect(() => {
    loadEmployee()
  }, [employeeId])

  const loadEmployee = async () => {
    try {
      setLoading(true)
      const data = await employeesApi.getById(employeeId)
      setEmployee(data)
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar colaborador',
        description: error.response?.data?.message || 'Não foi possível carregar os dados do colaborador.',
        variant: 'destructive',
      })
      router.push('/dashboard/rh/colaboradores')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async () => {
    if (!employee) return

    try {
      setToggleActiveLoading(true)
      await employeesApi.toggleActive(employeeId)
      
      toast({
        title: employee.active ? 'Colaborador desativado' : 'Colaborador ativado',
        description: employee.active 
          ? 'O colaborador foi desativado com sucesso.' 
          : 'O colaborador foi ativado com sucesso.',
      })

      await loadEmployee()
    } catch (error: any) {
      toast({
        title: 'Erro ao alterar status',
        description: error.response?.data?.message || 'Não foi possível alterar o status do colaborador.',
        variant: 'destructive',
      })
    } finally {
      setToggleActiveLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await employeesApi.delete(employeeId)
      
      toast({
        title: 'Colaborador excluído',
        description: 'O colaborador foi excluído com sucesso.',
      })

      router.push('/dashboard/rh/colaboradores')
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir colaborador',
        description: error.response?.data?.message || 'Não foi possível excluir o colaborador.',
        variant: 'destructive',
      })
    }
  }

  const handleDismiss = async () => {
    if (!dismissalDate) {
      toast({
        title: 'Data obrigatória',
        description: 'Por favor, informe a data de demissão.',
        variant: 'destructive',
      })
      return
    }

    try {
      setDismissing(true)
      await employeesApi.dismiss(employeeId, {
        dismissalDate,
        notes: dismissalNotes || undefined,
      })
      
      toast({
        title: 'Colaborador demitido',
        description: 'O colaborador foi demitido com sucesso.',
      })

      setDismissDialogOpen(false)
      setDismissalDate('')
      setDismissalNotes('')
      await loadEmployee()
    } catch (error: any) {
      toast({
        title: 'Erro ao demitir colaborador',
        description: error.response?.data?.message || 'Não foi possível demitir o colaborador.',
        variant: 'destructive',
      })
    } finally {
      setDismissing(false)
    }
  }

  const formatSalary = (salary: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(salary))
  }

  const formatDate = (date?: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const contractTypeLabels: Record<ContractType, string> = {
    CLT: 'CLT',
    PJ: 'PJ',
    ESTAGIO: 'Estágio',
    TEMPORARIO: 'Temporário',
    AUTONOMO: 'Autônomo',
  }

  const genderLabels = {
    MALE: 'Masculino',
    FEMALE: 'Feminino',
    OTHER: 'Outro',
  }

  const maritalStatusLabels = {
    SINGLE: 'Solteiro(a)',
    MARRIED: 'Casado(a)',
    DIVORCED: 'Divorciado(a)',
    WIDOWED: 'Viúvo(a)',
    OTHER: 'Outro',
  }

  const accountTypeLabels = {
    CORRENTE: 'Conta Corrente',
    POUPANCA: 'Poupança',
    SALARIO: 'Conta Salário',
  }

  if (loading) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!employee) {
    return null
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/dashboard/rh/colaboradores">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{employee.name}</h1>
                <Badge variant={employee.active ? 'default' : 'secondary'}>
                  {employee.active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {employee.position?.name || 'Cargo não informado'} • {employee.department?.name || 'Departamento não informado'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {employee.active && !employee.dismissalDate && (
              <Button
                variant="outline"
                onClick={() => setDismissDialogOpen(true)}
                className="border-orange-500 text-orange-600 hover:bg-orange-50"
              >
                <UserMinus className="mr-2 h-4 w-4" />
                Demitir
              </Button>
            )}
            <Button
              variant={employee.active ? 'outline' : 'default'}
              onClick={handleToggleActive}
              disabled={toggleActiveLoading}
            >
              {employee.active ? (
                <>
                  <UserX className="mr-2 h-4 w-4" />
                  Desativar
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Ativar
                </>
              )}
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/dashboard/rh/colaboradores/${employeeId}/editar`}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </Button>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="geral" className="w-full">
          <TabsList>
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="proventos">Proventos</TabsTrigger>
            <TabsTrigger value="descontos">Descontos</TabsTrigger>
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="space-y-6">
            {/* Dados Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle>Dados Pessoais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome Completo</p>
                    <p className="font-medium">{employee.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CPF</p>
                    <p className="font-medium">{maskCPF(employee.cpf)}</p>
                  </div>
                  {employee.rg && (
                    <div>
                      <p className="text-sm text-muted-foreground">RG</p>
                      <p className="font-medium">{employee.rg}</p>
                    </div>
                  )}
                  {employee.birthDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                      <p className="font-medium">{formatDate(employee.birthDate)}</p>
                    </div>
                  )}
                  {employee.gender && (
                    <div>
                      <p className="text-sm text-muted-foreground">Gênero</p>
                      <p className="font-medium">{genderLabels[employee.gender]}</p>
                    </div>
                  )}
                  {employee.maritalStatus && (
                    <div>
                      <p className="text-sm text-muted-foreground">Estado Civil</p>
                      <p className="font-medium">{maritalStatusLabels[employee.maritalStatus]}</p>
                    </div>
                  )}
                  {employee.email && (
                    <div>
                      <p className="text-sm text-muted-foreground">E-mail</p>
                      <p className="font-medium">{employee.email}</p>
                    </div>
                  )}
                  {employee.phone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Telefone</p>
                      <p className="font-medium">{maskPhone(employee.phone)}</p>
                    </div>
                  )}
                  {employee.mobile && (
                    <div>
                      <p className="text-sm text-muted-foreground">Celular</p>
                      <p className="font-medium">{maskPhone(employee.mobile)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Endereço */}
            {(employee.zipCode || employee.street) && (
              <Card>
                <CardHeader>
                  <CardTitle>Endereço</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {employee.zipCode && (
                      <div>
                        <p className="text-sm text-muted-foreground">CEP</p>
                        <p className="font-medium">{maskCEP(employee.zipCode)}</p>
                      </div>
                    )}
                    {employee.street && (
                      <div>
                        <p className="text-sm text-muted-foreground">Logradouro</p>
                        <p className="font-medium">{employee.street}</p>
                      </div>
                    )}
                    {employee.number && (
                      <div>
                        <p className="text-sm text-muted-foreground">Número</p>
                        <p className="font-medium">{employee.number}</p>
                      </div>
                    )}
                    {employee.complement && (
                      <div>
                        <p className="text-sm text-muted-foreground">Complemento</p>
                        <p className="font-medium">{employee.complement}</p>
                      </div>
                    )}
                    {employee.neighborhood && (
                      <div>
                        <p className="text-sm text-muted-foreground">Bairro</p>
                        <p className="font-medium">{employee.neighborhood}</p>
                      </div>
                    )}
                    {employee.city && (
                      <div>
                        <p className="text-sm text-muted-foreground">Cidade</p>
                        <p className="font-medium">{employee.city}</p>
                      </div>
                    )}
                    {employee.state && (
                      <div>
                        <p className="text-sm text-muted-foreground">Estado</p>
                        <p className="font-medium">{employee.state}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dados Profissionais */}
            <Card>
              <CardHeader>
                <CardTitle>Dados Profissionais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Cargo</p>
                    <p className="font-medium">{employee.position?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Departamento</p>
                    <p className="font-medium">{employee.department?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Centro de Custo</p>
                    <p className="font-medium">
                      {employee.costCenter ? (
                        <>
                          {employee.costCenter.codigo && (
                            <span className="font-mono text-xs mr-2">{employee.costCenter.codigo}</span>
                          )}
                          {employee.costCenter.nome || employee.costCenter.name}
                        </>
                      ) : (
                        employee.costCenterId || '-'
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Admissão</p>
                    <p className="font-medium">{formatDate(employee.admissionDate)}</p>
                  </div>
                  {employee.dismissalDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Data de Demissão</p>
                      <p className="font-medium">{formatDate(employee.dismissalDate)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo de Contrato</p>
                    <Badge>{contractTypeLabels[employee.contractType]}</Badge>
                  </div>
                  {employee.workSchedule && (
                    <div>
                      <p className="text-sm text-muted-foreground">Carga Horária Semanal</p>
                      <p className="font-medium">{employee.workSchedule.weeklyHours}h/semana</p>
                    </div>
                  )}
                  {employee.workSchedule?.generalNotes && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">Observações do Horário</p>
                      <p className="font-medium">{employee.workSchedule.generalNotes}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Salário</p>
                    <p className="font-medium">{formatSalary(employee.salary)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Horário de Trabalho */}
            {employee.workSchedule && (
              <Card>
                <CardHeader>
                  <CardTitle>Horário de Trabalho</CardTitle>
                  <CardDescription>
                    Carga horária semanal: {employee.workSchedule.weeklyHours}h
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(employee.workSchedule).map(([day, schedule]) => {
                      if (day === 'weeklyHours' || day === 'generalNotes') return null
                      
                      const dayNames: Record<string, string> = {
                        monday: 'Segunda-feira',
                        tuesday: 'Terça-feira',
                        wednesday: 'Quarta-feira',
                        thursday: 'Quinta-feira',
                        friday: 'Sexta-feira',
                        saturday: 'Sábado',
                        sunday: 'Domingo',
                      }
                      
                      const daySchedule = schedule as { isWorkDay: boolean; startTime?: string; endTime?: string; breakStartTime?: string; breakEndTime?: string }
                      
                      return (
                        <div key={day} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div className="flex items-center gap-3 min-w-[150px]">
                            <span className="font-medium">{dayNames[day]}</span>
                            {!daySchedule.isWorkDay && (
                              <Badge variant="secondary" className="text-xs">Folga</Badge>
                            )}
                          </div>
                          {daySchedule.isWorkDay && (
                            <div className="flex gap-6 text-sm">
                              <div>
                                <span className="text-muted-foreground">Entrada:</span>{' '}
                                <span className="font-medium">{daySchedule.startTime}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Saída:</span>{' '}
                                <span className="font-medium">{daySchedule.endTime}</span>
                              </div>
                              {daySchedule.breakStartTime && daySchedule.breakEndTime && (
                                <div>
                                  <span className="text-muted-foreground">Intervalo:</span>{' '}
                                  <span className="font-medium">{daySchedule.breakStartTime} - {daySchedule.breakEndTime}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                    {employee.workSchedule.generalNotes && (
                      <div className="pt-3 mt-3 border-t">
                        <p className="text-sm text-muted-foreground mb-1">Observações:</p>
                        <p className="text-sm">{employee.workSchedule.generalNotes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dados Bancários */}
            {(employee.bankCode || employee.agency) && (
              <Card>
                <CardHeader>
                  <CardTitle>Dados Bancários</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {employee.bankCode && (
                      <div>
                        <p className="text-sm text-muted-foreground">Banco</p>
                        <p className="font-medium">{employee.bankCode} - {employee.bankName}</p>
                      </div>
                    )}
                    {employee.agency && (
                      <div>
                        <p className="text-sm text-muted-foreground">Agência</p>
                        <p className="font-medium">{employee.agency}</p>
                      </div>
                    )}
                    {employee.account && (
                      <div>
                        <p className="text-sm text-muted-foreground">Conta</p>
                        <p className="font-medium">{employee.account}</p>
                      </div>
                    )}
                    {employee.accountType && (
                      <div>
                        <p className="text-sm text-muted-foreground">Tipo de Conta</p>
                        <p className="font-medium">{accountTypeLabels[employee.accountType]}</p>
                      </div>
                    )}
                    {employee.pixKey && (
                      <div>
                        <p className="text-sm text-muted-foreground">Chave PIX</p>
                        <p className="font-medium">{employee.pixKey}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dados da Empresa (PJ) */}
            {employee.contractType === 'PJ' && employee.companyDocument && (
              <Card>
                <CardHeader>
                  <CardTitle>Dados da Empresa (PJ)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground">CNPJ</p>
                      <p className="font-medium">{maskCNPJ(employee.companyDocument)}</p>
                    </div>
                    {employee.companyName && (
                      <div>
                        <p className="text-sm text-muted-foreground">Razão Social</p>
                        <p className="font-medium">{employee.companyName}</p>
                      </div>
                    )}
                    {employee.companyTradeName && (
                      <div>
                        <p className="text-sm text-muted-foreground">Nome Fantasia</p>
                        <p className="font-medium">{employee.companyTradeName}</p>
                      </div>
                    )}
                    {employee.companyStateRegistration && (
                      <div>
                        <p className="text-sm text-muted-foreground">Inscrição Estadual</p>
                        <p className="font-medium">{employee.companyStateRegistration}</p>
                      </div>
                    )}
                    {employee.companyMunicipalRegistration && (
                      <div>
                        <p className="text-sm text-muted-foreground">Inscrição Municipal</p>
                        <p className="font-medium">{employee.companyMunicipalRegistration}</p>
                      </div>
                    )}
                    {employee.companyEmail && (
                      <div>
                        <p className="text-sm text-muted-foreground">E-mail da Empresa</p>
                        <p className="font-medium">{employee.companyEmail}</p>
                      </div>
                    )}
                    {employee.companyPhone && (
                      <div>
                        <p className="text-sm text-muted-foreground">Telefone da Empresa</p>
                        <p className="font-medium">{maskPhone(employee.companyPhone)}</p>
                      </div>
                    )}
                  </div>

                  {employee.companyStreet && (
                    <>
                      <Separator className="my-4" />
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {employee.companyZipCode && (
                          <div>
                            <p className="text-sm text-muted-foreground">CEP</p>
                            <p className="font-medium">{maskCEP(employee.companyZipCode)}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-muted-foreground">Logradouro</p>
                          <p className="font-medium">{employee.companyStreet}</p>
                        </div>
                        {employee.companyNumber && (
                          <div>
                            <p className="text-sm text-muted-foreground">Número</p>
                            <p className="font-medium">{employee.companyNumber}</p>
                          </div>
                        )}
                        {employee.companyComplement && (
                          <div>
                            <p className="text-sm text-muted-foreground">Complemento</p>
                            <p className="font-medium">{employee.companyComplement}</p>
                          </div>
                        )}
                        {employee.companyNeighborhood && (
                          <div>
                            <p className="text-sm text-muted-foreground">Bairro</p>
                            <p className="font-medium">{employee.companyNeighborhood}</p>
                          </div>
                        )}
                        {employee.companyCity && (
                          <div>
                            <p className="text-sm text-muted-foreground">Cidade</p>
                            <p className="font-medium">{employee.companyCity}</p>
                          </div>
                        )}
                        {employee.companyState && (
                          <div>
                            <p className="text-sm text-muted-foreground">Estado</p>
                            <p className="font-medium">{employee.companyState}</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Observações */}
            {employee.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Observações</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{employee.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="proventos">
            <EmployeeEarnings employeeId={employeeId} />
          </TabsContent>

          <TabsContent value="descontos">
            <EmployeeDeductions employeeId={employeeId} />
          </TabsContent>

          <TabsContent value="documentos">
            <EmployeeDocuments employeeId={employeeId} employeeContractType={employee.contractType} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o colaborador <strong>{employee.name}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dismiss Dialog */}
      <Dialog open={dismissDialogOpen} onOpenChange={setDismissDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demitir Colaborador</DialogTitle>
            <DialogDescription>
              Preencha os dados da demissão de <strong>{employee.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dismissalDate">Data de Demissão *</Label>
              <Input
                id="dismissalDate"
                type="date"
                value={dismissalDate}
                onChange={(e) => setDismissalDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dismissalNotes">Motivo/Observações</Label>
              <Textarea
                id="dismissalNotes"
                value={dismissalNotes}
                onChange={(e) => setDismissalNotes(e.target.value)}
                placeholder="Ex: Pedido de demissão, término de contrato, etc."
                rows={4}
              />
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Atenção:</strong> Ao demitir o colaborador, ele será automaticamente desativado.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDismissDialogOpen(false)} disabled={dismissing}>
              Cancelar
            </Button>
            <Button onClick={handleDismiss} disabled={dismissing} className="bg-orange-600 hover:bg-orange-700">
              {dismissing ? 'Processando...' : 'Confirmar Demissão'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
