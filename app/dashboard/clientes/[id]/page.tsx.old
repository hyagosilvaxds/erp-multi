'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Building2, User, Mail, Phone, MapPin, Edit, Trash2, Plus, Save, X } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import {
  customersApi,
  type Customer,
  type CustomerAddress,
  type CustomerContact,
  type AddressType,
  type ContactType,
  type CreateAddressRequest,
  type CreateContactRequest,
  type Gender,
  type MaritalStatus,
  type TaxRegime,
} from '@/lib/api/customers'
import { 
  maskCPF, 
  maskCNPJ, 
  maskPhone, 
  maskCEP, 
  validateCPF, 
  validateCNPJ, 
  validateEmail,
  removeMask,
  maskCNAE,
} from '@/lib/masks'
import { Switch } from '@/components/ui/switch'

export default function CustomerDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const customerId = params.id as string

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Estados dos diálogos
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null)
  const [editingContact, setEditingContact] = useState<CustomerContact | null>(null)
  const [deleteAddressId, setDeleteAddressId] = useState<string | null>(null)
  const [deleteContactId, setDeleteContactId] = useState<string | null>(null)

  // Estados do formulário de edição completo
  const [editForm, setEditForm] = useState({
    // Pessoa Física
    name: '',
    cpf: '',
    rg: '',
    rgIssuer: '',
    rgState: '',
    birthDate: '',
    gender: '' as Gender | '',
    maritalStatus: '' as MaritalStatus | '',
    motherName: '',
    profession: '',
    nationality: '',
    
    // Pessoa Jurídica
    companyName: '',
    tradeName: '',
    cnpj: '',
    stateRegistration: '',
    stateRegistrationExempt: false,
    municipalRegistration: '',
    cnae: '',
    taxRegime: '' as TaxRegime | '',
    responsibleName: '',
    responsibleCpf: '',
    responsibleEmail: '',
    responsiblePhone: '',
    
    // Campos Comuns
    email: '',
    phone: '',
    mobile: '',
    website: '',
    creditLimit: '',
    notes: '',
  })

  // Estados do formulário de endereço
  const [addressForm, setAddressForm] = useState<CreateAddressRequest>({
    type: 'MAIN',
    zipCode: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
  })

  // Estados do formulário de contato
  const [contactForm, setContactForm] = useState<CreateContactRequest>({
    type: 'MAIN',
    name: '',
  })

  useEffect(() => {
    loadCustomer()
  }, [customerId])

  const loadCustomer = async () => {
    try {
      setLoading(true)
      const data = await customersApi.getById(customerId)
      setCustomer(data)
      setEditForm({
        // Pessoa Física
        name: data.name || '',
        cpf: data.cpf ? maskCPF(data.cpf) : '',
        rg: data.rg || '',
        rgIssuer: data.rgIssuer || '',
        rgState: data.rgState || '',
        birthDate: data.birthDate || '',
        gender: (data.gender || '') as Gender | '',
        maritalStatus: (data.maritalStatus || '') as MaritalStatus | '',
        motherName: data.motherName || '',
        profession: data.profession || '',
        nationality: data.nationality || '',
        
        // Pessoa Jurídica
        companyName: data.companyName || '',
        tradeName: data.tradeName || '',
        cnpj: data.cnpj ? maskCNPJ(data.cnpj) : '',
        stateRegistration: data.stateRegistration || '',
        stateRegistrationExempt: data.stateRegistrationExempt || false,
        municipalRegistration: data.municipalRegistration || '',
        cnae: data.cnae ? maskCNAE(data.cnae) : '',
        taxRegime: (data.taxRegime || '') as TaxRegime | '',
        responsibleName: data.responsibleName || '',
        responsibleCpf: data.responsibleCpf ? maskCPF(data.responsibleCpf) : '',
        responsibleEmail: data.responsibleEmail || '',
        responsiblePhone: data.responsiblePhone ? maskPhone(data.responsiblePhone) : '',
        
        // Campos Comuns
        email: data.email || '',
        phone: data.phone ? maskPhone(data.phone) : '',
        mobile: data.mobile ? maskPhone(data.mobile) : '',
        website: data.website || '',
        creditLimit: data.creditLimit || '',
        notes: data.notes || '',
      })
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar cliente',
        description: error.response?.data?.message || 'Não foi possível carregar os dados do cliente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async () => {
    try {
      await customersApi.toggleActive(customerId)
      toast({
        title: 'Status atualizado',
        description: `Cliente ${customer?.active ? 'desativado' : 'ativado'} com sucesso.`,
      })
      loadCustomer()
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar status',
        description: error.response?.data?.message || 'Não foi possível atualizar o status.',
        variant: 'destructive',
      })
    }
  }

  const handleUpdate = async () => {
    try {
      // Validações
      if (customer?.personType === 'FISICA') {
        if (editForm.cpf && !validateCPF(removeMask(editForm.cpf))) {
          toast({
            title: 'CPF inválido',
            description: 'Por favor, verifique o CPF informado.',
            variant: 'destructive',
          })
          return
        }
      } else {
        if (editForm.cnpj && !validateCNPJ(removeMask(editForm.cnpj))) {
          toast({
            title: 'CNPJ inválido',
            description: 'Por favor, verifique o CNPJ informado.',
            variant: 'destructive',
          })
          return
        }
        if (editForm.responsibleCpf && !validateCPF(removeMask(editForm.responsibleCpf))) {
          toast({
            title: 'CPF do responsável inválido',
            description: 'Por favor, verifique o CPF do responsável.',
            variant: 'destructive',
          })
          return
        }
      }

      if (editForm.email && !validateEmail(editForm.email)) {
        toast({
          title: 'E-mail inválido',
          description: 'Por favor, verifique o e-mail informado.',
          variant: 'destructive',
        })
        return
      }

      const updateData: any = {}

      // Pessoa Física
      if (customer?.personType === 'FISICA') {
        if (editForm.name) updateData.name = editForm.name
        if (editForm.cpf) updateData.cpf = removeMask(editForm.cpf)
        if (editForm.rg) updateData.rg = editForm.rg
        if (editForm.rgIssuer) updateData.rgIssuer = editForm.rgIssuer
        if (editForm.rgState) updateData.rgState = editForm.rgState
        if (editForm.birthDate) updateData.birthDate = editForm.birthDate
        if (editForm.gender) updateData.gender = editForm.gender
        if (editForm.maritalStatus) updateData.maritalStatus = editForm.maritalStatus
        if (editForm.motherName) updateData.motherName = editForm.motherName
        if (editForm.profession) updateData.profession = editForm.profession
        if (editForm.nationality) updateData.nationality = editForm.nationality
      }

      // Pessoa Jurídica
      if (customer?.personType === 'JURIDICA') {
        if (editForm.companyName) updateData.companyName = editForm.companyName
        if (editForm.tradeName) updateData.tradeName = editForm.tradeName
        if (editForm.cnpj) updateData.cnpj = removeMask(editForm.cnpj)
        if (editForm.stateRegistration) updateData.stateRegistration = editForm.stateRegistration
        updateData.stateRegistrationExempt = editForm.stateRegistrationExempt
        if (editForm.municipalRegistration) updateData.municipalRegistration = editForm.municipalRegistration
        if (editForm.cnae) updateData.cnae = removeMask(editForm.cnae)
        if (editForm.taxRegime) updateData.taxRegime = editForm.taxRegime
        if (editForm.responsibleName) updateData.responsibleName = editForm.responsibleName
        if (editForm.responsibleCpf) updateData.responsibleCpf = removeMask(editForm.responsibleCpf)
        if (editForm.responsibleEmail) updateData.responsibleEmail = editForm.responsibleEmail
        if (editForm.responsiblePhone) updateData.responsiblePhone = removeMask(editForm.responsiblePhone)
      }

      // Campos Comuns
      if (editForm.email) updateData.email = editForm.email
      if (editForm.phone) updateData.phone = removeMask(editForm.phone)
      if (editForm.mobile) updateData.mobile = removeMask(editForm.mobile)
      if (editForm.website) updateData.website = editForm.website
      if (editForm.creditLimit) updateData.creditLimit = parseFloat(editForm.creditLimit)
      if (editForm.notes) updateData.notes = editForm.notes

      await customersApi.update(customerId, updateData)
      toast({
        title: 'Cliente atualizado',
        description: 'Os dados do cliente foram atualizados com sucesso.',
      })
      setEditDialogOpen(false)
      loadCustomer()
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar cliente',
        description: error.response?.data?.message || 'Não foi possível atualizar o cliente.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async () => {
    try {
      await customersApi.delete(customerId)
      toast({
        title: 'Cliente deletado',
        description: 'O cliente foi deletado com sucesso.',
      })
      router.push('/dashboard/clientes')
    } catch (error: any) {
      toast({
        title: 'Erro ao deletar cliente',
        description: error.response?.data?.message || 'Não foi possível deletar o cliente.',
        variant: 'destructive',
      })
    }
  }

  // Funções de endereço
  const handleAddAddress = async () => {
    try {
      await customersApi.addAddress(customerId, addressForm)
      toast({
        title: 'Endereço adicionado',
        description: 'O endereço foi adicionado com sucesso.',
      })
      setAddressDialogOpen(false)
      resetAddressForm()
      loadCustomer()
    } catch (error: any) {
      toast({
        title: 'Erro ao adicionar endereço',
        description: error.response?.data?.message || 'Não foi possível adicionar o endereço.',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateAddress = async () => {
    if (!editingAddress) return
    try {
      await customersApi.updateAddress(customerId, editingAddress.id, addressForm)
      toast({
        title: 'Endereço atualizado',
        description: 'O endereço foi atualizado com sucesso.',
      })
      setAddressDialogOpen(false)
      setEditingAddress(null)
      resetAddressForm()
      loadCustomer()
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar endereço',
        description: error.response?.data?.message || 'Não foi possível atualizar o endereço.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteAddress = async () => {
    if (!deleteAddressId) return
    try {
      await customersApi.deleteAddress(customerId, deleteAddressId)
      toast({
        title: 'Endereço removido',
        description: 'O endereço foi removido com sucesso.',
      })
      setDeleteAddressId(null)
      loadCustomer()
    } catch (error: any) {
      toast({
        title: 'Erro ao remover endereço',
        description: error.response?.data?.message || 'Não foi possível remover o endereço.',
        variant: 'destructive',
      })
    }
  }

  // Funções de contato
  const handleAddContact = async () => {
    try {
      await customersApi.addContact(customerId, contactForm)
      toast({
        title: 'Contato adicionado',
        description: 'O contato foi adicionado com sucesso.',
      })
      setContactDialogOpen(false)
      resetContactForm()
      loadCustomer()
    } catch (error: any) {
      toast({
        title: 'Erro ao adicionar contato',
        description: error.response?.data?.message || 'Não foi possível adicionar o contato.',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateContact = async () => {
    if (!editingContact) return
    try {
      await customersApi.updateContact(customerId, editingContact.id, contactForm)
      toast({
        title: 'Contato atualizado',
        description: 'O contato foi atualizado com sucesso.',
      })
      setContactDialogOpen(false)
      setEditingContact(null)
      resetContactForm()
      loadCustomer()
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar contato',
        description: error.response?.data?.message || 'Não foi possível atualizar o contato.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteContact = async () => {
    if (!deleteContactId) return
    try {
      await customersApi.deleteContact(customerId, deleteContactId)
      toast({
        title: 'Contato removido',
        description: 'O contato foi removido com sucesso.',
      })
      setDeleteContactId(null)
      loadCustomer()
    } catch (error: any) {
      toast({
        title: 'Erro ao remover contato',
        description: error.response?.data?.message || 'Não foi possível remover o contato.',
        variant: 'destructive',
      })
    }
  }

  const resetAddressForm = () => {
    setAddressForm({
      type: 'MAIN',
      zipCode: '',
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
    })
  }

  const resetContactForm = () => {
    setContactForm({
      type: 'MAIN',
      name: '',
    })
  }

  const openEditAddress = (address: CustomerAddress) => {
    setEditingAddress(address)
    setAddressForm({
      type: address.type,
      label: address.label,
      zipCode: address.zipCode,
      street: address.street,
      number: address.number,
      complement: address.complement,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      country: address.country,
      reference: address.reference,
      isDefault: address.isDefault,
    })
    setAddressDialogOpen(true)
  }

  const openEditContact = (contact: CustomerContact) => {
    setEditingContact(contact)
    setContactForm({
      type: contact.type,
      name: contact.name,
      position: contact.position,
      department: contact.department,
      email: contact.email,
      phone: contact.phone,
      mobile: contact.mobile,
      notes: contact.notes,
      isPrimary: contact.isPrimary,
    })
    setContactDialogOpen(true)
  }

  const getCustomerName = () => {
    if (!customer) return ''
    return customer.personType === 'FISICA' ? customer.name : customer.tradeName || customer.companyName
  }

  const getCustomerDocument = () => {
    if (!customer) return ''
    if (customer.personType === 'FISICA') {
      return customer.cpf ? maskCPF(customer.cpf) : ''
    }
    return customer.cnpj ? maskCNPJ(customer.cnpj) : ''
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!customer) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-lg font-semibold">Cliente não encontrado</p>
          <Button onClick={() => router.push('/dashboard/clientes')} className="mt-4">
            Voltar para lista
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/dashboard/clientes')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {getCustomerName()}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={customer.personType === 'FISICA' ? 'default' : 'secondary'}>
                    {customer.personType === 'FISICA' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                  </Badge>
                  <Badge variant={customer.active ? 'default' : 'destructive'}>
                    {customer.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{getCustomerDocument()}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button
              variant={customer.active ? 'outline' : 'default'}
              onClick={handleToggleActive}
            >
              {customer.active ? 'Desativar' : 'Ativar'}
            </Button>
            <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Deletar
            </Button>
          </div>
        </div>

        {/* Informações Principais */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {customer.personType === 'FISICA' ? (
                <>
                  <div>
                    <Label className="text-muted-foreground">Nome Completo</Label>
                    <p className="font-medium">{customer.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">CPF</Label>
                    <p className="font-medium">{maskCPF(customer.cpf || '')}</p>
                  </div>
                  {customer.rg && (
                    <div>
                      <Label className="text-muted-foreground">RG</Label>
                      <p className="font-medium">{customer.rg}</p>
                    </div>
                  )}
                  {customer.birthDate && (
                    <div>
                      <Label className="text-muted-foreground">Data de Nascimento</Label>
                      <p className="font-medium">
                        {new Date(customer.birthDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <Label className="text-muted-foreground">Razão Social</Label>
                    <p className="font-medium">{customer.companyName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Nome Fantasia</Label>
                    <p className="font-medium">{customer.tradeName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">CNPJ</Label>
                    <p className="font-medium">{maskCNPJ(customer.cnpj || '')}</p>
                  </div>
                  {customer.stateRegistration && (
                    <div>
                      <Label className="text-muted-foreground">Inscrição Estadual</Label>
                      <p className="font-medium">{customer.stateRegistration}</p>
                    </div>
                  )}
                </>
              )}
              {customer.email && (
                <div>
                  <Label className="text-muted-foreground">E-mail</Label>
                  <p className="font-medium">{customer.email}</p>
                </div>
              )}
              {customer.phone && (
                <div>
                  <Label className="text-muted-foreground">Telefone</Label>
                  <p className="font-medium">{maskPhone(customer.phone)}</p>
                </div>
              )}
              {customer.creditLimit && (
                <div>
                  <Label className="text-muted-foreground">Limite de Crédito</Label>
                  <p className="font-medium">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(parseFloat(customer.creditLimit))}
                  </p>
                </div>
              )}
            </div>
            {customer.notes && (
              <div className="mt-4">
                <Label className="text-muted-foreground">Observações</Label>
                <p className="mt-1 text-sm">{customer.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs: Endereços e Contatos */}
        <Tabs defaultValue="addresses" className="w-full">
          <TabsList>
            <TabsTrigger value="addresses">Endereços</TabsTrigger>
            <TabsTrigger value="contacts">Contatos</TabsTrigger>
          </TabsList>

          <TabsContent value="addresses" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => {
                resetAddressForm()
                setEditingAddress(null)
                setAddressDialogOpen(true)
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Endereço
              </Button>
            </div>
            {customer.addresses && customer.addresses.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {customer.addresses.map((address) => (
                  <Card key={address.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{address.label || address.type}</CardTitle>
                          {address.isDefault && (
                            <Badge variant="outline" className="mt-1">Principal</Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditAddress(address)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteAddressId(address.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <p>
                          {address.street}, {address.number}
                          {address.complement && ` - ${address.complement}`}
                        </p>
                        <p>{address.neighborhood}</p>
                        <p>
                          {address.city} - {address.state}
                        </p>
                        <p>CEP: {maskCEP(address.zipCode)}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum endereço cadastrado</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => {
                resetContactForm()
                setEditingContact(null)
                setContactDialogOpen(true)
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Contato
              </Button>
            </div>
            {customer.contacts && customer.contacts.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {customer.contacts.map((contact) => (
                  <Card key={contact.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{contact.name}</CardTitle>
                          <CardDescription>
                            {contact.position && <span>{contact.position}</span>}
                            {contact.department && <span> - {contact.department}</span>}
                          </CardDescription>
                          {contact.isPrimary && (
                            <Badge variant="outline" className="mt-1">Principal</Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditContact(contact)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteContactId(contact.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {contact.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{contact.email}</span>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{maskPhone(contact.phone)}</span>
                          </div>
                        )}
                        {contact.mobile && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{maskPhone(contact.mobile)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <User className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum contato cadastrado</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Dialog de Edição */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Cliente</DialogTitle>
              <DialogDescription>
                Atualize as informações do cliente.
              </DialogDescription>
            </DialogHeader>
            
            {customer?.personType === 'FISICA' ? (
              // Formulário Pessoa Física
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Nome Completo *</Label>
                    <Input
                      id="edit-name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-cpf">CPF *</Label>
                    <Input
                      id="edit-cpf"
                      value={editForm.cpf}
                      onChange={(e) => setEditForm({ ...editForm, cpf: maskCPF(e.target.value) })}
                      maxLength={14}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-rg">RG</Label>
                    <Input
                      id="edit-rg"
                      value={editForm.rg}
                      onChange={(e) => setEditForm({ ...editForm, rg: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-rgIssuer">Órgão Emissor</Label>
                    <Input
                      id="edit-rgIssuer"
                      value={editForm.rgIssuer}
                      onChange={(e) => setEditForm({ ...editForm, rgIssuer: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-rgState">UF do RG</Label>
                    <Input
                      id="edit-rgState"
                      value={editForm.rgState}
                      onChange={(e) => setEditForm({ ...editForm, rgState: e.target.value.toUpperCase() })}
                      maxLength={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-birthDate">Data de Nascimento</Label>
                    <Input
                      id="edit-birthDate"
                      type="date"
                      value={editForm.birthDate}
                      onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-gender">Gênero</Label>
                    <Select
                      value={editForm.gender}
                      onValueChange={(value: Gender) => setEditForm({ ...editForm, gender: value })}
                    >
                      <SelectTrigger id="edit-gender">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Masculino</SelectItem>
                        <SelectItem value="FEMALE">Feminino</SelectItem>
                        <SelectItem value="OTHER">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-maritalStatus">Estado Civil</Label>
                    <Select
                      value={editForm.maritalStatus}
                      onValueChange={(value: MaritalStatus) => setEditForm({ ...editForm, maritalStatus: value })}
                    >
                      <SelectTrigger id="edit-maritalStatus">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SINGLE">Solteiro(a)</SelectItem>
                        <SelectItem value="MARRIED">Casado(a)</SelectItem>
                        <SelectItem value="DIVORCED">Divorciado(a)</SelectItem>
                        <SelectItem value="WIDOWED">Viúvo(a)</SelectItem>
                        <SelectItem value="OTHER">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-motherName">Nome da Mãe</Label>
                    <Input
                      id="edit-motherName"
                      value={editForm.motherName}
                      onChange={(e) => setEditForm({ ...editForm, motherName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-profession">Profissão</Label>
                    <Input
                      id="edit-profession"
                      value={editForm.profession}
                      onChange={(e) => setEditForm({ ...editForm, profession: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-nationality">Nacionalidade</Label>
                    <Input
                      id="edit-nationality"
                      value={editForm.nationality}
                      onChange={(e) => setEditForm({ ...editForm, nationality: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">E-mail</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Telefone</Label>
                    <Input
                      id="edit-phone"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: maskPhone(e.target.value) })}
                      maxLength={15}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-mobile">Celular</Label>
                    <Input
                      id="edit-mobile"
                      value={editForm.mobile}
                      onChange={(e) => setEditForm({ ...editForm, mobile: maskPhone(e.target.value) })}
                      maxLength={15}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-creditLimit">Limite de Crédito</Label>
                    <Input
                      id="edit-creditLimit"
                      type="number"
                      step="0.01"
                      value={editForm.creditLimit}
                      onChange={(e) => setEditForm({ ...editForm, creditLimit: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-notes">Observações</Label>
                  <Textarea
                    id="edit-notes"
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            ) : (
              // Formulário Pessoa Jurídica
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-companyName">Razão Social *</Label>
                    <Input
                      id="edit-companyName"
                      value={editForm.companyName}
                      onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-tradeName">Nome Fantasia</Label>
                    <Input
                      id="edit-tradeName"
                      value={editForm.tradeName}
                      onChange={(e) => setEditForm({ ...editForm, tradeName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-cnpj">CNPJ *</Label>
                    <Input
                      id="edit-cnpj"
                      value={editForm.cnpj}
                      onChange={(e) => setEditForm({ ...editForm, cnpj: maskCNPJ(e.target.value) })}
                      maxLength={18}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-stateRegistration">Inscrição Estadual</Label>
                    <Input
                      id="edit-stateRegistration"
                      value={editForm.stateRegistration}
                      onChange={(e) => setEditForm({ ...editForm, stateRegistration: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="edit-stateRegistrationExempt"
                        checked={editForm.stateRegistrationExempt}
                        onCheckedChange={(checked) => setEditForm({ ...editForm, stateRegistrationExempt: checked })}
                      />
                      <Label htmlFor="edit-stateRegistrationExempt">Isento de IE</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-municipalRegistration">Inscrição Municipal</Label>
                    <Input
                      id="edit-municipalRegistration"
                      value={editForm.municipalRegistration}
                      onChange={(e) => setEditForm({ ...editForm, municipalRegistration: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-cnae">CNAE</Label>
                    <Input
                      id="edit-cnae"
                      value={editForm.cnae}
                      onChange={(e) => setEditForm({ ...editForm, cnae: maskCNAE(e.target.value) })}
                      maxLength={9}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-taxRegime">Regime Tributário</Label>
                    <Select
                      value={editForm.taxRegime}
                      onValueChange={(value: TaxRegime) => setEditForm({ ...editForm, taxRegime: value })}
                    >
                      <SelectTrigger id="edit-taxRegime">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SIMPLES_NACIONAL">Simples Nacional</SelectItem>
                        <SelectItem value="LUCRO_PRESUMIDO">Lucro Presumido</SelectItem>
                        <SelectItem value="LUCRO_REAL">Lucro Real</SelectItem>
                        <SelectItem value="MEI">MEI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <h4 className="text-sm font-semibold">Responsável</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="edit-responsibleName">Nome do Responsável</Label>
                      <Input
                        id="edit-responsibleName"
                        value={editForm.responsibleName}
                        onChange={(e) => setEditForm({ ...editForm, responsibleName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-responsibleCpf">CPF do Responsável</Label>
                      <Input
                        id="edit-responsibleCpf"
                        value={editForm.responsibleCpf}
                        onChange={(e) => setEditForm({ ...editForm, responsibleCpf: maskCPF(e.target.value) })}
                        maxLength={14}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-responsibleEmail">E-mail do Responsável</Label>
                      <Input
                        id="edit-responsibleEmail"
                        type="email"
                        value={editForm.responsibleEmail}
                        onChange={(e) => setEditForm({ ...editForm, responsibleEmail: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-responsiblePhone">Telefone do Responsável</Label>
                      <Input
                        id="edit-responsiblePhone"
                        value={editForm.responsiblePhone}
                        onChange={(e) => setEditForm({ ...editForm, responsiblePhone: maskPhone(e.target.value) })}
                        maxLength={15}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <h4 className="text-sm font-semibold">Informações de Contato</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="edit-email-pj">E-mail</Label>
                      <Input
                        id="edit-email-pj"
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-phone-pj">Telefone</Label>
                      <Input
                        id="edit-phone-pj"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: maskPhone(e.target.value) })}
                        maxLength={15}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-mobile-pj">Celular</Label>
                      <Input
                        id="edit-mobile-pj"
                        value={editForm.mobile}
                        onChange={(e) => setEditForm({ ...editForm, mobile: maskPhone(e.target.value) })}
                        maxLength={15}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-website">Website</Label>
                      <Input
                        id="edit-website"
                        value={editForm.website}
                        onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-creditLimit-pj">Limite de Crédito</Label>
                      <Input
                        id="edit-creditLimit-pj"
                        type="number"
                        step="0.01"
                        value={editForm.creditLimit}
                        onChange={(e) => setEditForm({ ...editForm, creditLimit: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-notes-pj">Observações</Label>
                  <Textarea
                    id="edit-notes-pj"
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdate}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Endereço */}
        <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAddress ? 'Editar Endereço' : 'Adicionar Endereço'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={addressForm.type}
                  onValueChange={(value: AddressType) =>
                    setAddressForm({ ...addressForm, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MAIN">Principal</SelectItem>
                    <SelectItem value="BILLING">Cobrança</SelectItem>
                    <SelectItem value="SHIPPING">Entrega</SelectItem>
                    <SelectItem value="OTHER">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>CEP</Label>
                <Input
                  value={addressForm.zipCode}
                  onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                  placeholder="00000-000"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Logradouro</Label>
                <Input
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Número</Label>
                <Input
                  value={addressForm.number}
                  onChange={(e) => setAddressForm({ ...addressForm, number: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Complemento</Label>
                <Input
                  value={addressForm.complement || ''}
                  onChange={(e) => setAddressForm({ ...addressForm, complement: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Bairro</Label>
                <Input
                  value={addressForm.neighborhood}
                  onChange={(e) => setAddressForm({ ...addressForm, neighborhood: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Input
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  maxLength={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setAddressDialogOpen(false)
                setEditingAddress(null)
              }}>
                Cancelar
              </Button>
              <Button onClick={editingAddress ? handleUpdateAddress : handleAddAddress}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Contato */}
        <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingContact ? 'Editar Contato' : 'Adicionar Contato'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={contactForm.type}
                  onValueChange={(value: ContactType) =>
                    setContactForm({ ...contactForm, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MAIN">Principal</SelectItem>
                    <SelectItem value="FINANCIAL">Financeiro</SelectItem>
                    <SelectItem value="COMMERCIAL">Comercial</SelectItem>
                    <SelectItem value="OTHER">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Cargo</Label>
                <Input
                  value={contactForm.position || ''}
                  onChange={(e) => setContactForm({ ...contactForm, position: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Departamento</Label>
                <Input
                  value={contactForm.department || ''}
                  onChange={(e) => setContactForm({ ...contactForm, department: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={contactForm.email || ''}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={contactForm.phone || ''}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Celular</Label>
                <Input
                  value={contactForm.mobile || ''}
                  onChange={(e) => setContactForm({ ...contactForm, mobile: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setContactDialogOpen(false)
                setEditingContact(null)
              }}>
                Cancelar
              </Button>
              <Button onClick={editingContact ? handleUpdateContact : handleAddContact}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* AlertDialog de Deleção do Cliente */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso irá deletar permanentemente o cliente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Deletar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* AlertDialog de Deleção de Endereço */}
        <AlertDialog open={!!deleteAddressId} onOpenChange={(open) => !open && setDeleteAddressId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover endereço?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAddress} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* AlertDialog de Deleção de Contato */}
        <AlertDialog open={!!deleteContactId} onOpenChange={(open) => !open && setDeleteContactId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover contato?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteContact} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  )
}
