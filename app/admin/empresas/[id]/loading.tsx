export default function Loading() {
  return (
    <div className="flex h-[600px] items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Carregando configurações...</p>
      </div>
    </div>
  )
}
