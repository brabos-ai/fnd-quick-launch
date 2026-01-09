"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingButton } from "@/components/ui/loading-button"
import { AlertCircle } from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const [error, setError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // Auto-focus first input
  React.useEffect(() => {
    setFocus("email")
  }, [setFocus])

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null)
      await login(data)
      toast.success("Login realizado com sucesso!")
      navigate("/")
    } catch (err: any) {
      // Check if it's an email not verified error
      if (err.errorCode === "EMAIL_NOT_VERIFIED") {
        navigate("/email-not-verified")
        return
      }

      const message =
        err.response?.data?.message ||
        err.message ||
        "Erro ao fazer login. Verifique suas credenciais."
      setError(message)
    }
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

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          Senha
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
        Entrar
      </LoadingButton>

      {/* Links */}
      <div className="space-y-2 text-center">
        <a
          href="/forgot-password"
          className="block text-sm text-primary hover:underline"
        >
          Esqueci minha senha
        </a>
        <a
          href="/signup"
          className="block text-sm text-muted-foreground hover:text-foreground"
        >
          Não tem uma conta? <span className="text-primary">Criar conta</span>
        </a>
      </div>
    </motion.form>
  )
}

LoginForm.displayName = "LoginForm"
