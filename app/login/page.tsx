import { LoginForm } from "@/components/auth/login-form"
import { Building2 } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left Side - Login Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Building2 className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">ERP Multi</h1>
              <p className="text-sm text-muted-foreground">Sistema Multi-Empresa</p>
            </div>
          </Link>

          {/* Welcome Text */}
          <div className="mb-8">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground">Bem-vindo de volta</h2>
            <p className="mt-2 text-pretty text-muted-foreground">Entre com suas credenciais para acessar o sistema</p>
          </div>

          {/* Login Form */}
          <LoginForm />

          {/* Footer Links
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Não tem uma conta?{" "}
              <Link href="/cadastro" className="font-medium text-primary hover:underline">
                Cadastre-se
              </Link>
            </p>
          </div> */}
        </div>
      </div>

      {/* Right Side - Hero Image/Graphics */}
      <div className="relative hidden lg:block lg:w-1/2">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-background" />
        <div className="relative flex h-full flex-col items-center justify-center p-12">
          <div className="max-w-lg space-y-6 text-center">
            <div className="mx-auto mb-8 grid h-32 w-32 place-items-center rounded-2xl bg-primary/10 backdrop-blur-sm">
              <Building2 className="h-16 w-16 text-primary" />
            </div>
            <h3 className="text-balance text-3xl font-bold text-foreground">
              Gerencie múltiplas empresas em um só lugar
            </h3>
            <p className="text-pretty text-lg text-muted-foreground">
              Controle completo de vendas, estoque, clientes e relatórios com nossa plataforma integrada
            </p>
            {/*}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-xs text-muted-foreground">Empresas</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="text-2xl font-bold text-primary">10k+</div>
                <div className="text-xs text-muted-foreground">Usuários</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="text-2xl font-bold text-primary">99.9%</div>
                <div className="text-xs text-muted-foreground">Uptime</div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  )
}
