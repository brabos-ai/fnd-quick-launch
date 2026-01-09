import { AuthLayout } from "@/components/layout/auth-layout"
import { LoginForm } from "@/components/features/auth/login-form"

export default function LoginPage() {
  return (
    <AuthLayout
      title="Entrar na sua conta"
      description="Acesse sua conta para continuar"
    >
      <LoginForm />
    </AuthLayout>
  )
}
