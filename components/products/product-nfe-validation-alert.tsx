'use client'

import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { validateProductForNFe, type Product } from '@/lib/validations/nfe-validations'

interface ProductNFeValidationAlertProps {
  product: Product
}

export function ProductNFeValidationAlert({ 
  product 
}: ProductNFeValidationAlertProps) {
  const validation = validateProductForNFe(product)

  // Produto OK - sem erros nem avisos
  if (validation.valid && validation.warnings.length === 0) {
    return (
      <Alert className="border-green-500 bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Produto apto para NF-e</AlertTitle>
        <AlertDescription className="text-green-700">
          Este produto possui todos os dados fiscais necessários para emissão de Nota Fiscal Eletrônica.
        </AlertDescription>
      </Alert>
    )
  }

  // Produto com erros
  if (!validation.valid) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Dados fiscais incompletos</AlertTitle>
        <AlertDescription>
          <p className="mb-2">
            Este produto não pode ser usado em NF-e. Corrija os seguintes problemas:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            {validation.errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
          {validation.warnings.length > 0 && (
            <>
              <p className="mt-3 mb-2 font-semibold">Avisos:</p>
              <ul className="list-disc pl-5 space-y-1">
                {validation.warnings.map((warning, i) => (
                  <li key={i}>{warning}</li>
                ))}
              </ul>
            </>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  // Só tem avisos
  return (
    <Alert className="border-amber-500 bg-amber-50">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Avisos sobre dados fiscais</AlertTitle>
      <AlertDescription className="text-amber-700">
        <p className="mb-2">
          Produto apto para NF-e, mas considere os seguintes avisos:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          {validation.warnings.map((warning, i) => (
            <li key={i}>{warning}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}
