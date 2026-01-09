"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import { Mail } from "lucide-react"
import { LoadingButton } from "@/components/ui/loading-button"
import { api } from "@/lib/api"
import { useAuthStore } from "@/stores/auth-store"

export function EmailNotVerifiedCard() {
  const user = useAuthStore((state) => state.user)
  const [resending, setResending] = React.useState(false)

  const handleResend = async () => {
    if (!user?.email) {
      toast.error("Email não encontrado. Faça login novamente.")
      return
    }

    try {
      setResending(true)
      await api.post("/auth/resend-verification", { email: user.email })
      toast.success("Email de verificação enviado com sucesso!")
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Icon */}
      <div className="flex justify-center">
        <div className="rounded-full bg-primary/10 p-4">
          <Mail className="h-12 w-12 text-primary" />
        </div>
      </div>

      {/* Content */}
      <div className="text-center space-y-2">
        <h3 className="font-display text-xl font-semibold">
          Verifique seu email
        </h3>
        <p className="text-sm text-muted-foreground">
          Enviamos um link de verificação para{" "}
          <span className="font-medium text-foreground">{user?.email}</span>.
          Clique no link para ativar sua conta.
        </p>
        <p className="text-xs text-muted-foreground">
          Não se esqueça de verificar a pasta de spam.
        </p>
      </div>

      {/* Actions */}
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
          Usar outro email para fazer login
        </a>
      </div>
    </motion.div>
  )
}

EmailNotVerifiedCard.displayName = "EmailNotVerifiedCard"
