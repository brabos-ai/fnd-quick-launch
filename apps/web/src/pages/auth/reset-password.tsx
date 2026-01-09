import { AuthLayout } from "@/components/layout/auth-layout"
import { ResetPasswordForm } from "@/components/features/auth/reset-password-form"

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Redefinir senha"
      description="Digite sua nova senha"
    >
      <ResetPasswordForm />
    </AuthLayout>
  )
}
