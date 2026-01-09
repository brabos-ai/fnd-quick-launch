"use client"

import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingButton } from "@/components/ui/loading-button"
import { api } from "@/lib/api"

type VerificationStatus = "loading" | "success" | "error"

export function VerifyEmailStatus() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")

  const [status, setStatus] = React.useState<VerificationStatus>("loading")
  const [error, setError] = React.useState<string | null>(null)
  const [resending, setResending] = React.useState(false)
  const hasVerified = React.useRef(false)

  // Auto-verify on mount
  React.useEffect(() => {
    const verifyEmail = async () => {
      if (!token || hasVerified.current) {
        if (!token && !hasVerified.current) {
          setStatus("error")
          setError("Token não encontrado")
        }
        return
      }

      hasVerified.current = true

      try {
        await api.post("/auth/verify-email", { token })
        setStatus("success")
        toast.success("Email verificado com sucesso!")

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login")
        }, 3000)
      } catch (err: any) {
        setStatus("error")
        const message =
          err.response?.data?.message ||
          err.message ||
          "Erro ao verificar email. Token pode estar inválido ou expirado."
        setError(message)
      }
    }

    verifyEmail()
  }, [token, navigate])

  const handleResend = async () => {
    if (!token) return

    try {
      setResending(true)
      // Extract email from error or ask user to go to login
      await api.post("/auth/resend-verification", { email: "" })
      toast.success("Email de verificação reenviado!")
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Erro ao reenviar email. Tente novamente."
      toast.error(message)
    } finally {
      setResending(false)
    }
  }

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
            Verificando email...
          </h3>
          <p className="text-sm text-muted-foreground">
            Por favor, aguarde enquanto verificamos seu email.
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
            Email verificado!
          </h3>
          <p className="text-sm text-muted-foreground">
            Seu email foi verificado com sucesso. Você será redirecionado para
            o login em instantes.
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
            Erro ao verificar email
          </h3>
        </div>
      </div>

      <Alert variant="destructive">
        <AlertDescription>
          {error || "Não foi possível verificar seu email. O token pode estar inválido ou expirado."}
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <LoadingButton
          onClick={handleResend}
          loading={resending}
          className="w-full h-11"
          variant="outline"
        >
          Reenviar email de verificação
        </LoadingButton>
        <a
          href="/login"
          className="block text-center text-sm text-muted-foreground hover:text-foreground"
        >
          Voltar ao login
        </a>
      </div>
    </motion.div>
  )
}

VerifyEmailStatus.displayName = "VerifyEmailStatus"
