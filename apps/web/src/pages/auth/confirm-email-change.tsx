"use client"

import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AuthLayout } from "@/components/layout/auth-layout"
import { useConfirmEmailChange } from "@/hooks/use-email-change"

type ConfirmationStatus = "loading" | "success" | "error"

function ConfirmEmailChangeContent() {
  const navigate = useNavigate()
  const { token } = useParams<{ token: string }>()

  const [status, setStatus] = React.useState<ConfirmationStatus>("loading")
  const [error, setError] = React.useState<string | null>(null)
  const confirmEmailChange = useConfirmEmailChange()
  const hasConfirmed = React.useRef(false)

  // Auto-confirm on mount
  React.useEffect(() => {
    const confirmChange = async () => {
      if (!token || hasConfirmed.current) {
        if (!token && !hasConfirmed.current) {
          setStatus("error")
          setError("Token não encontrado na URL")
        }
        return
      }

      hasConfirmed.current = true

      try {
        await confirmEmailChange.mutateAsync({ token })
        setStatus("success")
        // Navigation is handled by the hook
      } catch (err: any) {
        setStatus("error")
        const message =
          err.response?.data?.message ||
          err.message ||
          "Erro ao confirmar alteração de email. Token pode estar inválido ou expirado."
        setError(message)
      }
    }

    confirmChange()
  }, [token, confirmEmailChange])

  // Loading state
  if (status === "loading") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center text-center space-y-4"
      >
        <div className="rounded-full bg-primary/10 p-3">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
        <div className="space-y-2">
          <h3 className="font-display text-lg font-semibold">
            Confirmando alteração de email...
          </h3>
          <p className="text-sm text-muted-foreground">
            Por favor, aguarde enquanto processamos a alteração.
          </p>
        </div>
      </motion.div>
    )
  }

  // Success state
  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center text-center space-y-4"
      >
        <div className="rounded-full bg-primary/10 p-3">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="font-display text-lg font-semibold text-primary">
            Email atualizado com sucesso!
          </h3>
          <p className="text-sm text-muted-foreground">
            Seu email foi alterado. Você será redirecionado para suas configurações.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Redirecionando...</span>
        </div>
      </motion.div>
    )
  }

  // Error state
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="rounded-full bg-destructive/10 p-3">
          <XCircle className="h-10 w-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h3 className="font-display text-lg font-semibold text-destructive">
            Erro ao confirmar alteração
          </h3>
        </div>
      </div>

      <Alert variant="destructive">
        <AlertDescription>
          {error || "Não foi possível confirmar a alteração de email. O token pode estar inválido ou expirado."}
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground text-center">
          Você pode solicitar uma nova alteração de email nas configurações.
        </p>
        <Button
          onClick={() => navigate('/settings?tab=profile')}
          className="w-full h-11"
          variant="default"
        >
          Ir para configurações
        </Button>
        <button
          onClick={() => navigate('/')}
          className="block w-full text-center text-sm text-muted-foreground hover:text-foreground py-2"
        >
          Voltar ao início
        </button>
      </div>
    </motion.div>
  )
}

export default function ConfirmEmailChangePage() {
  return (
    <AuthLayout
      title="Confirmar alteração de email"
      description="Aguarde enquanto confirmamos a alteração do seu email"
    >
      <ConfirmEmailChangeContent />
    </AuthLayout>
  )
}
