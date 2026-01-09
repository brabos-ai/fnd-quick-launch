import { AuthLayout } from "@/components/layout/auth-layout"
import { ForgotPasswordForm } from "@/components/features/auth/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Esqueci minha senha"
      description="Digite seu email para receber instruções"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
