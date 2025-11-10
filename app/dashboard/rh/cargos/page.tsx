"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Plus, Search, Edit, Trash2, Users, Briefcase } from "lucide-react"
import { useToast } from '@/hooks/use-toast'
import { positionsApi, type Position } from '@/lib/api/positions'
import { Spinner } from "@/components/ui/spinner"

export default function CargosPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [positions, setPositions] = useState<Position[]>([])
  const [filteredPositions, setFilteredPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState('')
  const [deleteName, setDeleteName] = useState('')

  useEffect(() => {
    loadPositions()
  }, [])

  useEffect(() => {
    filterPositions()
  }, [searchTerm, positions])

  const loadPositions = async () => {
    try {
      setLoading(true)
      const data = await positionsApi.getAll()
      setPositions(data)
      setFilteredPositions(data)
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar cargos',
        description: error.response?.data?.message || 'Não foi possível carregar os cargos.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filterPositions = () => {
    if (!searchTerm) {
      setFilteredPositions(positions)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = positions.filter(position =>
      position.name.toLowerCase().includes(term) ||
      position.code.toLowerCase().includes(term) ||
      position.description?.toLowerCase().includes(term) ||
      position.cbo?.toLowerCase().includes(term)
    )
    setFilteredPositions(filtered)
  }

  const openDeleteDialog = (id: string, name: string) => {
    setDeleteId(id)
    setDeleteName(name)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    try {
      await positionsApi.delete(deleteId)
      toast({
        title: 'Cargo excluído',
        description: 'O cargo foi excluído com sucesso.',
      })
      loadPositions()
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir cargo',
        description: error.response?.data?.message || 'Não foi possível excluir o cargo.',
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setDeleteId('')
      setDeleteName('')
    }
  }

  if (loading) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex h-[50vh] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Cargos</h1>
            <p className="text-muted-foreground">Gerencie os cargos da sua empresa</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/rh/cargos/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Cargo
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Cargos</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{positions.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cargos Ativos</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {positions.filter(p => p.active).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Colaboradores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {positions.reduce((sum, p) => sum + (p._count?.employees || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, código, CBO..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Limpar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Cargos</CardTitle>
            <CardDescription>
              {filteredPositions.length} {filteredPositions.length === 1 ? 'cargo encontrado' : 'cargos encontrados'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredPositions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum cargo encontrado</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm
                    ? 'Tente ajustar sua busca'
                    : 'Comece criando seu primeiro cargo'}
                </p>
                {!searchTerm && (
                  <Button asChild>
                    <Link href="/dashboard/rh/cargos/novo">
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Primeiro Cargo
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>CBO</TableHead>
                    <TableHead>Faixa Salarial</TableHead>
                    <TableHead>Colaboradores</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPositions.map((position) => (
                    <TableRow key={position.id}>
                      <TableCell>
                        <span className="font-mono font-medium">{position.code}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{position.name}</p>
                          {position.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {position.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {position.cbo ? (
                          <span className="font-mono text-sm">{position.cbo}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {position.minSalary || position.maxSalary ? (
                          <div className="text-sm">
                            {position.minSalary && (
                              <div>
                                Min: {position.minSalary.toLocaleString('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                })}
                              </div>
                            )}
                            {position.maxSalary && (
                              <div>
                                Max: {position.maxSalary.toLocaleString('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                })}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{position._count?.employees || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={position.active ? 'default' : 'secondary'}>
                          {position.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                          >
                            <Link href={`/dashboard/rh/cargos/${position.id}/editar`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(position.id, position.name)}
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
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cargo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cargo <strong>{deleteName}</strong>?
              {positions.find(p => p.id === deleteId)?._count?.employees ? (
                <span className="block mt-2 text-destructive">
                  Este cargo possui {positions.find(p => p.id === deleteId)?._count?.employees} colaborador(es) vinculado(s).
                  Você precisará reatribuir os colaboradores antes de excluir.
                </span>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
