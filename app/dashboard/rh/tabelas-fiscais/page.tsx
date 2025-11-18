'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Plus, Edit, Trash2, Calculator } from "lucide-react"
import Link from "next/link"
import { useToast } from '@/hooks/use-toast'
import {
  inssTablesApi,
  fgtsTablesApi,
  irrfTablesApi,
  type INSSTable,
  type FGTSTable,
  type IRRFTable,
} from '@/lib/api/tax-tables'

export default function TabelasFiscaisPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState('inss')
  
  // INSS
  const [inssTables, setInssTables] = useState<INSSTable[]>([])
  const [loadingInss, setLoadingInss] = useState(true)
  
  // FGTS
  const [fgtsTables, setFgtsTables] = useState<FGTSTable[]>([])
  const [loadingFgts, setLoadingFgts] = useState(true)
  
  // IRRF
  const [irrfTables, setIrrfTables] = useState<IRRFTable[]>([])
  const [loadingIrrf, setLoadingIrrf] = useState(true)

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'inss' | 'fgts' | 'irrf'>('inss')
  const [deleteId, setDeleteId] = useState<string>('')

  useEffect(() => {
    loadInssTables()
    loadFgtsTables()
    loadIrrfTables()
  }, [])

  const loadInssTables = async () => {
    try {
      setLoadingInss(true)
      const data = await inssTablesApi.getAll()
      setInssTables(data)
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar tabelas de INSS',
        description: error.response?.data?.message || 'Não foi possível carregar as tabelas.',
        variant: 'destructive',
      })
    } finally {
      setLoadingInss(false)
    }
  }

  const loadFgtsTables = async () => {
    try {
      setLoadingFgts(true)
      const data = await fgtsTablesApi.getAll()
      setFgtsTables(data)
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar tabelas de FGTS',
        description: error.response?.data?.message || 'Não foi possível carregar as tabelas.',
        variant: 'destructive',
      })
    } finally {
      setLoadingFgts(false)
    }
  }

  const loadIrrfTables = async () => {
    try {
      setLoadingIrrf(true)
      const data = await irrfTablesApi.getAll()
      setIrrfTables(data)
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar tabelas de IRRF',
        description: error.response?.data?.message || 'Não foi possível carregar as tabelas.',
        variant: 'destructive',
      })
    } finally {
      setLoadingIrrf(false)
    }
  }

  const handleDelete = async () => {
    try {
      if (deleteType === 'inss') {
        await inssTablesApi.delete(deleteId)
        await loadInssTables()
        toast({
          title: 'Tabela excluída',
          description: 'A tabela de INSS foi excluída com sucesso.',
        })
      } else if (deleteType === 'fgts') {
        await fgtsTablesApi.delete(deleteId)
        await loadFgtsTables()
        toast({
          title: 'Tabela excluída',
          description: 'A tabela de FGTS foi excluída com sucesso.',
        })
      } else {
        await irrfTablesApi.delete(deleteId)
        await loadIrrfTables()
        toast({
          title: 'Tabela excluída',
          description: 'A tabela de IRRF foi excluída com sucesso.',
        })
      }
      setDeleteDialogOpen(false)
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir tabela',
        description: error.response?.data?.message || 'Não foi possível excluir a tabela.',
        variant: 'destructive',
      })
    }
  }

  const formatMonth = (month: number) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    return months[month - 1] || month
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tabelas Fiscais</h1>
            <p className="text-muted-foreground">
              Configure as alíquotas e faixas de INSS, FGTS e IRRF para cálculo da folha
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="inss">INSS</TabsTrigger>
            <TabsTrigger value="fgts">FGTS</TabsTrigger>
            <TabsTrigger value="irrf">IRRF</TabsTrigger>
          </TabsList>

          {/* INSS Tab */}
          <TabsContent value="inss" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Tabelas de INSS</CardTitle>
                    <CardDescription>
                      Faixas progressivas e alíquotas de INSS (empregado e empregador)
                    </CardDescription>
                  </div>
                  <Link href="/dashboard/rh/tabelas-fiscais/inss/nova">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Tabela
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loadingInss ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Carregando tabelas...
                  </div>
                ) : inssTables.length === 0 ? (
                  <div className="text-center py-8">
                    <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Nenhuma tabela de INSS cadastrada
                    </p>
                    <Link href="/dashboard/rh/tabelas-fiscais/inss/nova">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Cadastrar Primeira Tabela
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Referência</TableHead>
                        <TableHead>Faixas</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Criação</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inssTables.map((table) => (
                        <TableRow key={table.id}>
                          <TableCell className="font-medium">
                            {table.year}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {table.ranges?.length || 0} faixas configuradas
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={table.active ? "default" : "secondary"}>
                              {table.active ? 'Ativa' : 'Inativa'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(table.createdAt).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Link href={`/dashboard/rh/tabelas-fiscais/inss/${table.id}/editar`}>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setDeleteType('inss')
                                  setDeleteId(table.id)
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
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

          {/* FGTS Tab */}
          <TabsContent value="fgts" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Tabelas de FGTS</CardTitle>
                    <CardDescription>
                      Alíquotas mensais e de rescisão por cargo
                    </CardDescription>
                  </div>
                  <Link href="/dashboard/rh/tabelas-fiscais/fgts/nova">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Tabela
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loadingFgts ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Carregando tabelas...
                  </div>
                ) : fgtsTables.length === 0 ? (
                  <div className="text-center py-8">
                    <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Nenhuma tabela de FGTS cadastrada
                    </p>
                    <Link href="/dashboard/rh/tabelas-fiscais/fgts/nova">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Cadastrar Primeira Tabela
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Referência</TableHead>
                        <TableHead>Cargos</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Criação</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fgtsTables.map((table) => (
                        <TableRow key={table.id}>
                          <TableCell className="font-medium">
                            {table.year}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {table.rates?.length || 0} cargos configurados
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={table.active ? "default" : "secondary"}>
                              {table.active ? 'Ativa' : 'Inativa'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(table.createdAt).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Link href={`/dashboard/rh/tabelas-fiscais/fgts/${table.id}/editar`}>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setDeleteType('fgts')
                                  setDeleteId(table.id)
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
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

          {/* IRRF Tab */}
          <TabsContent value="irrf" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Tabelas de IRRF</CardTitle>
                    <CardDescription>
                      Faixas progressivas, alíquotas e deduções de Imposto de Renda
                    </CardDescription>
                  </div>
                  <Link href="/dashboard/rh/tabelas-fiscais/irrf/nova">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Tabela
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loadingIrrf ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Carregando tabelas...
                  </div>
                ) : irrfTables.length === 0 ? (
                  <div className="text-center py-8">
                    <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Nenhuma tabela de IRRF cadastrada
                    </p>
                    <Link href="/dashboard/rh/tabelas-fiscais/irrf/nova">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Cadastrar Primeira Tabela
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Referência</TableHead>
                        <TableHead>Faixas</TableHead>
                        <TableHead>Dedução Dependente</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Criação</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {irrfTables.map((table) => (
                        <TableRow key={table.id}>
                          <TableCell className="font-medium">
                            {table.year}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {table.ranges?.length || 0} faixas configuradas
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              R$ {Number(table.dependentDeduction || 0).toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={table.active ? "default" : "secondary"}>
                              {table.active ? 'Ativa' : 'Inativa'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(table.createdAt).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Link href={`/dashboard/rh/tabelas-fiscais/irrf/${table.id}/editar`}>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setDeleteType('irrf')
                                  setDeleteId(table.id)
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta tabela fiscal? 
                Esta ação não pode ser desfeita e pode afetar cálculos existentes.
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
