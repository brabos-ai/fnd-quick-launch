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
import { AlertCircle, Loader2 } from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { api } from "@/lib/api"

const signupSchema = z
  .object({
    fullName: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  })

type SignupFormData = z.infer<typeof signupSchema>

interface InviteInfo {
  email: string
  role: string
  expiresAt: string
}

export function SignupForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const signup = useAuthStore((state) => state.signup)
  const [error, setError] = React.useState<string | null>(null)
  const [inviteInfo, setInviteInfo] = React.useState<InviteInfo | null>(null)
  const [isLoadingInvite, setIsLoadingInvite] = React.useState(false)

  // Extract invite token from URL query string (?invite=xxx)
  const inviteToken = searchParams.get("invite")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
    setValue,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  // Fetch invite info when token is present
  React.useEffect(() => {
    if (inviteToken) {
      setIsLoadingInvite(true)
      api.get<InviteInfo>(`/auth/invite/${inviteToken}`)
        .then((response) => {
          setInviteInfo(response.data)
          setValue("email", response.data.email)
        })
        .catch((err) => {
          const message = err.response?.data?.message || "Convite inválido ou expirado"
          setError(message)
        })
        .finally(() => {
          setIsLoadingInvite(false)
        })
    }
  }, [inviteToken, setValue])

  // Auto-focus first input
  React.useEffect(() => {
    setFocus("fullName")
  }, [setFocus])

  const onSubmit = async (data: SignupFormData) => {
    try {
      setError(null)
      const result = await signup({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        inviteToken: inviteToken || undefined,
      })

      // If invite signup, user is logged in automatically (tokens returned)
      if (result?.accessToken) {
        toast.success("Conta criada com sucesso! Bem-vindo!")
        navigate("/")
      } else {
        // Normal signup - needs email verification
        toast.success("Conta criada com sucesso!")
        navigate("/email-not-verified")
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Erro ao criar conta. Tente novamente."
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
      {/* Full Name Field */}
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-sm font-medium">
          Nome completo
        </Label>
        <Input
          id="fullName"
          type="text"
          placeholder="João Silva"
          className="h-11 text-base"
          {...register("fullName", {
            onChange: () => setError(null),
          })}
        />
        {errors.fullName && (
          <p className="text-xs text-destructive">{errors.fullName.message}</p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email
        </Label>
        {isLoadingInvite ? (
          <div className="h-11 flex items-center justify-center border rounded-md bg-muted">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            className={`h-11 text-base ${inviteInfo ? "bg-muted cursor-not-allowed" : ""}`}
            disabled={!!inviteInfo}
            readOnly={!!inviteInfo}
            {...register("email", {
              onChange: () => setError(null),
            })}
          />
        )}
        {inviteInfo && (
          <p className="text-xs text-muted-foreground">
            Email do convite (não pode ser alterado)
          </p>
        )}
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

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirmar senha
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
        Criar conta
      </LoadingButton>

      {/* Links */}
      <div className="text-center">
        <a
          href="/login"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Já tem uma conta? <span className="text-primary">Entrar</span>
        </a>
      </div>
    </motion.form>
  )
}

SignupForm.displayName = "SignupForm"
