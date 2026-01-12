"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import { Mail } from "lucide-react"
import { LoadingButton } from "@/components/ui/loading-button"
import { api } from "@/lib/api"
import { useAuthStore } from "@/stores/auth-store"
import type { AxiosErrorWithResponse } from "@/types"

interface EmailNotVerifiedCardProps {
  email?: string
}

export function EmailNotVerifiedCard({ email }: EmailNotVerifiedCardProps) {
  const user = useAuthStore((state) => state.user)
  const [resending, setResending] = React.useState(false)
  const [cooldown, setCooldown] = React.useState(0)

  // Use email prop if available, fallback to user email
  const userEmail = email || user?.email

  // Cooldown timer
  React.useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [cooldown])

  const handleResend = async () => {
    if (!userEmail) {
      toast.error("Email não encontrado. Faça login novamente.")
      return
    }

    try {
      setResending(true)
      await api.post("/auth/resend-verification", { email: userEmail })
      toast.success("Email de verificação enviado com sucesso!")
      setCooldown(60) // Start 60 second cooldown
    } catch (error: unknown) {
      const apiError = error as AxiosErrorWithResponse
      const message =
        apiError.response?.data?.message ||
        apiError.message ||
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
          <span className="font-medium text-foreground">{userEmail}</span>.
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
          disabled={cooldown > 0}
          className="w-full h-11"
          variant="outline"
        >
          {cooldown > 0
            ? `Aguarde ${cooldown}s para reenviar`
            : "Reenviar email de verificação"}
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
