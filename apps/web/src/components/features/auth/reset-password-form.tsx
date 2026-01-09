"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useNavigate, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingButton } from "@/components/ui/loading-button"
import { AlertCircle } from "lucide-react"
import { api } from "@/lib/api"

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  })

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export function ResetPasswordForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")

  const [error, setError] = React.useState<string | null>(null)
  const [tokenInvalid, setTokenInvalid] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  // Auto-focus first input
  React.useEffect(() => {
    setFocus("password")
  }, [setFocus])

  // Check if token exists
  React.useEffect(() => {
    if (!token) {
      setTokenInvalid(true)
      setError("Token inválido ou expirado")
    }
  }, [token])

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError("Token não encontrado")
      return
    }

    try {
      setError(null)
      await api.post("/auth/reset-password", {
        token,
        password: data.password,
      })
      toast.success("Senha redefinida com sucesso!")
      navigate("/login")
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Erro ao redefinir senha. Tente novamente."

      // Check if token is invalid or expired
      if (
        message.includes("inválido") ||
        message.includes("expirado") ||
        err.response?.status === 400
      ) {
        setTokenInvalid(true)
      }

      setError(message)
    }
  }

  if (tokenInvalid) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "Token inválido ou expirado. Solicite um novo link de recuperação."}
          </AlertDescription>
        </Alert>
        <div className="space-y-2 text-center">
          <a
            href="/forgot-password"
            className="block text-sm text-primary hover:underline"
          >
            Solicitar novo link
          </a>
          <a
            href="/login"
            className="block text-sm text-muted-foreground hover:text-foreground"
          >
            Voltar ao login
          </a>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          Nova senha
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          className="h-11 text-base"
          {...register("password", {
            onChange: () => setError(null),
          })}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirmar nova senha
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          className="h-11 text-base"
          {...register("confirmPassword", {
            onChange: () => setError(null),
          })}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <LoadingButton
        type="submit"
        loading={isSubmitting}
        className="w-full h-11"
      >
        Redefinir senha
      </LoadingButton>

      {/* Links */}
      <div className="text-center">
        <a
          href="/login"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Voltar ao login
        </a>
      </div>
    </motion.form>
  )
}

ResetPasswordForm.displayName = "ResetPasswordForm"
