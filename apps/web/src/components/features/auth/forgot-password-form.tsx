"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import { CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingButton } from "@/components/ui/loading-button"
import { AlertCircle } from "lucide-react"
import { api } from "@/lib/api"

const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  // Auto-focus first input
  React.useEffect(() => {
    setFocus("email")
  }, [setFocus])

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setError(null)
      await api.post("/auth/forgot-password", data)
      setSuccess(true)
      toast.success("Email enviado com sucesso!")
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Erro ao enviar email. Tente novamente."
      setError(message)
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="rounded-full bg-primary/10 p-3">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display text-lg font-semibold">
              Email enviado!
            </h3>
            <p className="text-sm text-muted-foreground">
              Se o email existir em nossa base, você receberá instruções para
              redefinir sua senha.
            </p>
            <p className="text-xs text-muted-foreground">
              Verifique sua caixa de entrada e spam.
            </p>
          </div>
          <a
            href="/login"
            className="text-sm text-primary hover:underline"
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
      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          className="h-11 text-base"
          {...register("email", {
            onChange: () => setError(null),
          })}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
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
        Enviar link de recuperação
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

ForgotPasswordForm.displayName = "ForgotPasswordForm"
