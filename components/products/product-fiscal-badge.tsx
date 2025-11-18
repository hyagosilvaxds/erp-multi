'use client'

import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { validateProductForNFe, type Product } from '@/lib/validations/nfe-validations'
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

interface ProductFiscalBadgeProps {
  product: Product
  showLabel?: boolean
}

export function ProductFiscalBadge({ 
  product, 
  showLabel = true 
}: ProductFiscalBadgeProps) {
  const validation = validateProductForNFe(product)

  // Produto OK - sem erros nem avisos
  if (validation.valid && validation.warnings.length === 0) {
    return (
      <Badge variant="default" className="bg-green-600 hover:bg-green-700">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        {showLabel && 'Fiscal OK'}
      </Badge>
    )
  }

  // Produto OK mas com avisos
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
              Produto apto para NF-e mas com recomendações:
            </p>
            <ul className="text-sm space-y-1">
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

  // Produto com erros - não apto
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge 
          variant="destructive" 
          className="cursor-pointer"
        >
          <XCircle className="h-3 w-3 mr-1" />
          {showLabel && 'Incompleto'}
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2 text-red-600">
            <XCircle className="h-4 w-4" />
            Dados Fiscais Incompletos
          </h4>
          <p className="text-xs text-muted-foreground">
            Este produto não pode ser usado em NF-e:
          </p>
          <ul className="text-sm space-y-1">
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
              <ul className="text-sm space-y-1">
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
