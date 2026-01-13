import { AuthLayout } from "@/components/layout/auth-layout"
import { VerifyEmailStatus } from "@/components/features/auth/verify-email-status"

export default function VerifyEmailPage() {
  return (
    <AuthLayout
      title="Verificando email"
      description="Aguarde enquanto verificamos seu email"
    >
      <VerifyEmailStatus />
    </AuthLayout>
  )
}
