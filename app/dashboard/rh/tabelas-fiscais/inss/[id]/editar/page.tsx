'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useToast } from '@/hooks/use-toast'
import { inssTablesApi, type INSSBracket } from '@/lib/api/tax-tables'

export default function EditarINSSPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const tableId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [referenceYear, setReferenceYear] = useState<number>(new Date().getFullYear())
  const [active, setActive] = useState(true)
  const [brackets, setBrackets] = useState<INSSBracket[]>([])

  useEffect(() => {
    loadTable()
  }, [tableId])

  const loadTable = async () => {
    try {
      setLoading(true)
      const table = await inssTablesApi.getById(tableId)
      setReferenceYear(table.year)
      setActive(table.active)
      
      // Converter ranges para brackets
      const bracketsFromRanges = table.ranges.map(range => ({
        upTo: range.maxValue,
        employeeRate: range.employeeRate,
        employerRate: range.employerRate,
      }))
      
      setBrackets(bracketsFromRanges)
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar tabela',
        description: error.response?.data?.message || 'Não foi possível carregar a tabela.',
        variant: 'destructive',
      })
      router.push('/dashboard/rh/tabelas-fiscais')
    } finally {
      setLoading(false)
    }
  }

  const handleAddBracket = () => {
    setBrackets([...brackets, { upTo: 0, employeeRate: 0, employerRate: 0 }])
  }

  const handleRemoveBracket = (index: number) => {
    setBrackets(brackets.filter((_, i) => i !== index))
  }

  const handleBracketChange = (index: number, field: keyof INSSBracket, value: number) => {
    const newBrackets = [...brackets]
    newBrackets[index] = { ...newBrackets[index], [field]: value }
    setBrackets(newBrackets)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (brackets.length === 0) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Adicione pelo menos uma faixa de INSS.',
        variant: 'destructive',
      })
      return
    }

    for (const bracket of brackets) {
      if (!bracket.upTo || !bracket.employeeRate || !bracket.employerRate) {
        toast({
          title: 'Campos obrigatórios',
          description: 'Preencha todos os campos das faixas.',
          variant: 'destructive',
        })
        return
      }
    }

    try {
      setSaving(true)

      await inssTablesApi.update(tableId, {
        active,
        brackets,
      })

      toast({
        title: 'Tabela atualizada',
        description: 'A tabela de INSS foi atualizada com sucesso.',
      })

      router.push('/dashboard/rh/tabelas-fiscais')
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar tabela',
        description: error.response?.data?.message || 'Não foi possível atualizar a tabela.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ]

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i)

  if (loading) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-lg">Carregando tabela...</div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="company">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/rh/tabelas-fiscais">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Editar Tabela de INSS</h1>
              <p className="text-muted-foreground">
                Atualize as faixas e alíquotas de INSS para empregado e empregador
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informações da Tabela</CardTitle>
              <CardDescription>
                Ano de referência e status da tabela (ano não pode ser alterado)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Ano de Referência</Label>
                  <Input value={referenceYear} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="active">Status</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="active"
                      checked={active}
                      onCheckedChange={setActive}
                    />
                    <Label htmlFor="active" className="font-normal">
                      {active ? 'Ativa' : 'Inativa'}
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Faixas de INSS</CardTitle>
                  <CardDescription>
                    Configure as faixas progressivas e alíquotas
                  </CardDescription>
                </div>
                <Button type="button" variant="outline" onClick={handleAddBracket}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Faixa
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {brackets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma faixa adicionada. Clique em "Adicionar Faixa" para começar.
                </div>
              ) : (
                brackets.map((bracket, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label>Até (R$) *</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={bracket.upTo}
                              onChange={(e) => handleBracketChange(index, 'upTo', parseFloat(e.target.value))}
                              placeholder="0.00"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Alíquota Empregado (%) *</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={bracket.employeeRate}
                              onChange={(e) => handleBracketChange(index, 'employeeRate', parseFloat(e.target.value))}
                              placeholder="0.00"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Alíquota Empregador (%) *</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={bracket.employerRate}
                              onChange={(e) => handleBracketChange(index, 'employerRate', parseFloat(e.target.value))}
                              placeholder="0.00"
                              required
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveBracket(index)}
                          className="mt-8"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href="/dashboard/rh/tabelas-fiscais">
              <Button type="button" variant="outline" disabled={saving}>
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </form>
    </DashboardLayout>
  )
}
