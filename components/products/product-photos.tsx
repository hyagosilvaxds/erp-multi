"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Upload, X, Star, GripVertical, Image as ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { productsApi, type ProductPhoto } from "@/lib/api/products"
import Image from "next/image"

interface ProductPhotosProps {
  productId: string
  photos: ProductPhoto[]
  onPhotosChange?: () => void
  canEdit?: boolean
}

export function ProductPhotos({
  productId,
  photos: initialPhotos,
  onPhotosChange,
  canEdit = true,
}: ProductPhotosProps) {
  const { toast } = useToast()
  const [photos, setPhotos] = useState<ProductPhoto[]>(initialPhotos)
  const [uploading, setUploading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [photoToDelete, setPhotoToDelete] = useState<ProductPhoto | null>(null)
  const [draggedItem, setDraggedItem] = useState<number | null>(null)

  // Ordenar fotos por ordem
  const sortedPhotos = [...photos].sort((a, b) => a.order - b.order)

  // Função para fazer upload de documento (precisa ser implementada no hub de documentos)
  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true)

      // TODO: Implementar upload de documento para o hub
      // Por enquanto, vamos simular o documentId
      toast({
        title: "Upload em desenvolvimento",
        description: "A funcionalidade de upload de documentos será implementada em breve",
        variant: "destructive",
      })

      // Quando o upload estiver implementado, descomentar:
      /*
      const formData = new FormData()
      formData.append('file', file)
      
      // Upload do arquivo para o hub de documentos
      const uploadResponse = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      })
      
      const document = await uploadResponse.json()
      
      // Adicionar foto ao produto
      const isPrimary = photos.length === 0 // Primeira foto é principal
      const photo = await productsApi.addPhoto(productId, {
        documentId: document.id,
        isPrimary,
      })
      
      setPhotos([...photos, photo])
      onPhotosChange?.()
      
      toast({
        title: "Foto adicionada",
        description: "A foto foi adicionada ao produto com sucesso",
      })
      */
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar foto",
        description: error.response?.data?.message || "Tente novamente mais tarde",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione uma imagem",
          variant: "destructive",
        })
        return
      }

      // Validar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O tamanho máximo é 5MB",
          variant: "destructive",
        })
        return
      }

      handleFileUpload(file)
    }
  }

  const handleDeletePhoto = async (photo: ProductPhoto) => {
    try {
      await productsApi.removePhoto(productId, photo.id)
      setPhotos(photos.filter((p) => p.id !== photo.id))
      onPhotosChange?.()
      
      toast({
        title: "Foto removida",
        description: "A foto foi removida com sucesso",
      })
      
      setDeleteDialogOpen(false)
      setPhotoToDelete(null)
    } catch (error: any) {
      toast({
        title: "Erro ao remover foto",
        description: error.response?.data?.message || "Tente novamente mais tarde",
        variant: "destructive",
      })
    }
  }

  const handleSetPrimary = async (photo: ProductPhoto) => {
    if (photo.isPrimary) return

    try {
      const updatedPhoto = await productsApi.setPrimaryPhoto(productId, photo.id)
      
      // Atualizar fotos localmente
      setPhotos(
        photos.map((p) => ({
          ...p,
          isPrimary: p.id === photo.id,
        }))
      )
      onPhotosChange?.()
      
      toast({
        title: "Foto principal definida",
        description: "Esta foto agora é a principal do produto",
      })
    } catch (error: any) {
      toast({
        title: "Erro ao definir foto principal",
        description: error.response?.data?.message || "Tente novamente mais tarde",
        variant: "destructive",
      })
    }
  }

  const handleDragStart = (index: number) => {
    setDraggedItem(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    
    if (draggedItem === null || draggedItem === index) return

    const newPhotos = [...sortedPhotos]
    const draggedPhoto = newPhotos[draggedItem]
    newPhotos.splice(draggedItem, 1)
    newPhotos.splice(index, 0, draggedPhoto)

    setPhotos(newPhotos)
    setDraggedItem(index)
  }

  const handleDragEnd = async () => {
    if (draggedItem === null) return

    try {
      // Criar array de ordens atualizadas
      const photoOrders = sortedPhotos.map((photo, index) => ({
        id: photo.id,
        order: index,
      }))

      await productsApi.reorderPhotos(productId, { photoOrders })
      onPhotosChange?.()
      
      toast({
        title: "Ordem atualizada",
        description: "A ordem das fotos foi atualizada com sucesso",
      })
    } catch (error: any) {
      toast({
        title: "Erro ao reordenar fotos",
        description: error.response?.data?.message || "Tente novamente mais tarde",
        variant: "destructive",
      })
      
      // Reverter para ordem original em caso de erro
      setPhotos(initialPhotos)
    } finally {
      setDraggedItem(null)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Fotos do Produto</CardTitle>
          <CardDescription>
            Adicione e gerencie as fotos do produto. A primeira foto será a principal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Upload Button */}
            {canEdit && (
              <div>
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploading}
                />
                <label htmlFor="photo-upload">
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={uploading}
                    asChild
                  >
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      {uploading ? "Enviando..." : "Adicionar Foto"}
                    </span>
                  </Button>
                </label>
                <p className="text-xs text-muted-foreground mt-2">
                  Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB
                </p>
              </div>
            )}

            {/* Photos Grid */}
            {sortedPhotos.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma foto adicionada ainda
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sortedPhotos.map((photo, index) => (
                  <div
                    key={photo.id}
                    draggable={canEdit}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`
                      relative group rounded-lg overflow-hidden border-2
                      ${photo.isPrimary ? 'border-primary' : 'border-border'}
                      ${canEdit ? 'cursor-move' : ''}
                      ${draggedItem === index ? 'opacity-50' : ''}
                    `}
                  >
                    {/* Image */}
                    <div className="aspect-square relative bg-muted">
                      {photo.document?.url ? (
                        <Image
                          src={photo.document.url}
                          alt={photo.document.originalName || "Foto do produto"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Drag Handle */}
                    {canEdit && (
                      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-background/80 backdrop-blur rounded p-1">
                          <GripVertical className="h-4 w-4" />
                        </div>
                      </div>
                    )}

                    {/* Primary Badge */}
                    {photo.isPrimary && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="default" className="gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          Principal
                        </Badge>
                      </div>
                    )}

                    {/* Actions */}
                    {canEdit && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-1">
                          {!photo.isPrimary && (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="flex-1 h-8 text-xs"
                              onClick={() => handleSetPrimary(photo)}
                            >
                              <Star className="h-3 w-3 mr-1" />
                              Principal
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setPhotoToDelete(photo)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Order Number */}
                    <div className="absolute bottom-2 left-2 text-xs bg-background/80 backdrop-blur px-2 py-1 rounded">
                      #{index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover foto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A foto será removida permanentemente do produto.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPhotoToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => photoToDelete && handleDeletePhoto(photoToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
