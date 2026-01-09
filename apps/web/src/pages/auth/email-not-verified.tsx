import { AuthLayout } from "@/components/layout/auth-layout"
import { EmailNotVerifiedCard } from "@/components/features/auth/email-not-verified-card"

export default function EmailNotVerifiedPage() {
  return (
    <AuthLayout
      title="Email não verificado"
      description="Você precisa verificar seu email antes de continuar"
    >
      <EmailNotVerifiedCard />
    </AuthLayout>
  )
}
