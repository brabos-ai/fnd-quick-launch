import { AuthLayout } from "@/components/layout/auth-layout"
import { SignupForm } from "@/components/features/auth/signup-form"

export default function SignupPage() {
  return (
    <AuthLayout
      title="Criar sua conta"
      description="Comece grátis, sem cartão de crédito"
    >
      <SignupForm />
    </AuthLayout>
  )
}
