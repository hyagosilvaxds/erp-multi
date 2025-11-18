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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Search, Edit, Trash2, Users, Building2, ChevronDown, ChevronRight } from "lucide-react"
import { useToast } from '@/hooks/use-toast'
import { departmentsApi, type Department } from '@/lib/api/departments'
import { Spinner } from "@/components/ui/spinner"

export default function DepartamentosPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [departments, setDepartments] = useState<Department[]>([])
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState('')
  const [deleteName, setDeleteName] = useState('')
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadDepartments()
  }, [])

  useEffect(() => {
    filterDepartments()
  }, [searchTerm, departments])

  const loadDepartments = async () => {
    try {
      setLoading(true)
      const data = await departmentsApi.getAll()
      setDepartments(data)
      setFilteredDepartments(data)
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar departamentos',
        description: error.response?.data?.message || 'Não foi possível carregar os departamentos.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filterDepartments = () => {
    if (!searchTerm) {
      setFilteredDepartments(departments)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = departments.filter(dept =>
      dept.name.toLowerCase().includes(term) ||
      dept.code.toLowerCase().includes(term) ||
      dept.description?.toLowerCase().includes(term) ||
      dept.manager?.name.toLowerCase().includes(term)
    )
    setFilteredDepartments(filtered)
  }

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedDepts)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedDepts(newExpanded)
  }

  const openDeleteDialog = (id: string, name: string) => {
    setDeleteId(id)
    setDeleteName(name)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    try {
      await departmentsApi.delete(deleteId)
      toast({
        title: 'Departamento excluído',
        description: 'O departamento foi excluído com sucesso.',
      })
      loadDepartments()
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir departamento',
        description: error.response?.data?.message || 'Não foi possível excluir o departamento.',
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setDeleteId('')
      setDeleteName('')
    }
  }

  // Função para renderizar departamento hierárquico
  const renderDepartment = (dept: Department, level: number = 0) => {
    const children = filteredDepartments.filter(d => d.parentId === dept.id)
    const hasChildren = children.length > 0
    const isExpanded = expandedDepts.has(dept.id)
    const paddingLeft = `${level * 2}rem`

    return (
      <div key={dept.id}>
        <div
          className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors border-b"
          style={{ paddingLeft }}
        >
          {/* Expand/Collapse */}
          {hasChildren ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={() => toggleExpand(dept.id)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="h-6 w-6 shrink-0" />
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-semibold">{dept.code}</span>
              <span className="font-medium">{dept.name}</span>
              {level > 0 && (
                <Badge variant="outline" className="text-xs">
                  Nível {level + 1}
                </Badge>
              )}
            </div>
            {dept.description && (
              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                {dept.description}
              </p>
            )}
            {dept.manager && (
              <p className="text-xs text-muted-foreground mt-1">
                Gestor: {dept.manager.name}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{dept._count?.employees || 0}</span>
            </div>
            {hasChildren && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>{children.length}</span>
              </div>
            )}
            <Badge variant={dept.active ? 'default' : 'secondary'}>
              {dept.active ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link href={`/dashboard/rh/departamentos/${dept.id}/editar`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => openDeleteDialog(dept.id, dept.name)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && children.map(child => renderDepartment(child, level + 1))}
      </div>
    )
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

  const rootDepartments = filteredDepartments.filter(d => !d.parentId)
  const totalEmployees = departments.reduce((sum, d) => sum + (d._count?.employees || 0), 0)

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Departamentos</h1>
            <p className="text-muted-foreground">Gerencie a estrutura organizacional da empresa</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/rh/departamentos/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Departamento
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Departamentos</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departamentos Ativos</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {departments.filter(d => d.active).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Colaboradores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
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
                    placeholder="Buscar por nome, código, gestor..."
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

        {/* Hierarquia */}
        <Card>
          <CardHeader>
            <CardTitle>Estrutura Organizacional</CardTitle>
            <CardDescription>
              {filteredDepartments.length} {filteredDepartments.length === 1 ? 'departamento encontrado' : 'departamentos encontrados'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {filteredDepartments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum departamento encontrado</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm
                    ? 'Tente ajustar sua busca'
                    : 'Comece criando seu primeiro departamento'}
                </p>
                {!searchTerm && (
                  <Button asChild>
                    <Link href="/dashboard/rh/departamentos/novo">
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Primeiro Departamento
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y">
                {rootDepartments.map(dept => renderDepartment(dept))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir departamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o departamento <strong>{deleteName}</strong>?
              {departments.find(d => d.id === deleteId)?._count?.employees ? (
                <span className="block mt-2 text-destructive">
                  Este departamento possui {departments.find(d => d.id === deleteId)?._count?.employees} colaborador(es) vinculado(s).
                </span>
              ) : null}
              {departments.find(d => d.id === deleteId)?._count?.children ? (
                <span className="block mt-2 text-destructive">
                  Este departamento possui {departments.find(d => d.id === deleteId)?._count?.children} sub-departamento(s).
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
