'use client'

import { useState } from 'react'
import { Download, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { documentsApi } from '@/lib/api/documents'

interface DocumentDownloadButtonProps {
  documentId: string
  fileName?: string
  variant?: 'button' | 'card'
  document?: {
    fileName: string
    fileSize: number
    mimeType: string
    uploadedBy?: {
      name: string
    }
    createdAt: string
  }
}

export function DocumentDownloadButton({
  documentId,
  fileName,
  variant = 'button',
  document,
}: DocumentDownloadButtonProps) {
  const [downloading, setDownloading] = useState(false)
  const { toast } = useToast()

  const handleDownload = async () => {
    try {
      setDownloading(true)
      await documentsApi.downloadFile(documentId, fileName || document?.fileName)
      
      toast({
        title: 'Download iniciado',
        description: 'O arquivo está sendo baixado.',
      })
    } catch (error: any) {
      console.error('Erro ao fazer download:', error)
      toast({
        title: 'Erro ao baixar arquivo',
        description: error.response?.data?.message || 'Não foi possível baixar o arquivo.',
        variant: 'destructive',
      })
    } finally {
      setDownloading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileTypeLabel = (mimeType: string): string => {
    if (mimeType.includes('pdf')) return 'PDF'
    if (mimeType.includes('image')) return 'Imagem'
    if (mimeType.includes('word')) return 'Word'
    if (mimeType.includes('excel')) return 'Excel'
    if (mimeType.includes('zip')) return 'ZIP'
    return 'Arquivo'
  }

  if (variant === 'card' && document) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documento Anexado
          </CardTitle>
          <CardDescription>Arquivo relacionado à transferência</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-start gap-3 flex-1">
              <FileText className="w-8 h-8 text-muted-foreground mt-1" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{document.fileName}</p>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Badge variant="secondary" className="text-xs">
                    {getFileTypeLabel(document.mimeType)}
                  </Badge>
                  <span>{formatFileSize(document.fileSize)}</span>
                </div>
                {document.uploadedBy && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Enviado por {document.uploadedBy.name}
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={handleDownload}
              disabled={downloading}
              variant="outline"
              size="sm"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Baixando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={downloading}
      variant="outline"
      size="sm"
    >
      {downloading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Baixando...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Baixar
        </>
      )}
    </Button>
  )
}
