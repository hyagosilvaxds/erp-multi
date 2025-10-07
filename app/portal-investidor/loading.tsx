import { Loading } from "@/components/ui/loading"

export default function LoadingPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Loading message="Carregando portal do investidor..." />
    </div>
  )
}

