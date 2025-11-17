'use client'

import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { validateCompanyForNFe } from '@/lib/validations/nfe-validations'
import type { CompanyAdmin } from '@/lib/api/auth'
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

interface CompanyNFeStatusBadgeProps {
  company: CompanyAdmin
  showLabel?: boolean
}

export function CompanyNFeStatusBadge({ 
  company, 
  showLabel = true 
}: CompanyNFeStatusBadgeProps) {
  const validation = validateCompanyForNFe(company)

  // Empresa OK - sem erros nem avisos
  if (validation.valid && validation.warnings.length === 0) {
    return (
      <Badge variant="default" className="bg-green-600 hover:bg-green-700">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        {showLabel && 'NF-e OK'}
      </Badge>
    )
  }

  // Empresa OK mas com avisos
  if (validation.valid && validation.warnings.length > 0) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Badge 
            variant="default" 
            className="bg-amber-600 hover:bg-amber-700 cursor-pointer"
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            {showLabel && 'Avisos'}
          </Badge>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Avisos Fiscais
            </h4>
            <p className="text-xs text-muted-foreground">
              Empresa apta para NF-e mas com recomendações:
            </p>
            <ul className="text-sm space-y-1 max-h-60 overflow-y-auto">
              {validation.warnings.map((warning, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  // Empresa com erros - não apta
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge 
          variant="destructive" 
          className="cursor-pointer"
        >
          <XCircle className="h-3 w-3 mr-1" />
          {showLabel && 'Incompleta'}
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2 text-red-600">
            <XCircle className="h-4 w-4" />
            Configuração Fiscal Incompleta
          </h4>
          <p className="text-xs text-muted-foreground">
            Esta empresa não pode emitir NF-e:
          </p>
          <ul className="text-sm space-y-1 max-h-60 overflow-y-auto">
            {validation.errors.map((error, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">•</span>
                <span className="text-red-600">{error}</span>
              </li>
            ))}
          </ul>
          {validation.warnings.length > 0 && (
            <>
              <p className="text-xs text-muted-foreground mt-3">
                Avisos adicionais:
              </p>
              <ul className="text-sm space-y-1 max-h-40 overflow-y-auto">
                {validation.warnings.map((warning, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
