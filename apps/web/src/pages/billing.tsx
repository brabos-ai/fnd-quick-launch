"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Loader2,
  CreditCard,
  Calendar,
  CheckCircle,
  DollarSign,
} from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { PageHeader } from "@/components/layout/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  StatCard,
  PlanOverviewCard,
  PlanComparisonTable,
  BillingHistory,
  type Invoice,
} from "@/components/features/billing"
import {
  usePlans,
  useCurrentBillingInfo,
  useCreateCheckout,
  useCreatePortal,
} from "@/hooks/use-billing"
import { useAuthStore } from "@/stores/auth-store"
import type { BillingPlan } from "@/types"

interface DisplayPlan {
  id: string
  code: string
  name: string
  price: number
  features: string[]
  badge?: "popular" | "new" | "best-value" | null
  highlighted?: boolean
  ctaText?: string
  ctaVariant?: "default" | "outline" | "secondary"
}

function transformPlanToDisplay(plan: BillingPlan): DisplayPlan {
  const displayFeatures = plan.features.display?.displayFeatures || []
  const features =
    displayFeatures.length > 0
      ? displayFeatures.map((f) => f.text)
      : [
          `${plan.features.limits.workspaces === -1 ? "Ilimitados" : plan.features.limits.workspaces} workspace${plan.features.limits.workspaces !== 1 ? "s" : ""}`,
          `Até ${plan.features.limits.usersPerWorkspace === -1 ? "ilimitados" : plan.features.limits.usersPerWorkspace} usuários por workspace`,
        ]

  return {
    id: plan.code,
    code: plan.code,
    name: plan.name,
    price: plan.price?.amount || 0,
    features,
    badge: plan.features.display?.badge || null,
    highlighted: plan.features.display?.highlighted || false,
    ctaText: plan.features.display?.ctaText || "Selecionar Plano",
    ctaVariant: plan.features.display?.ctaVariant || "outline",
  }
}

export default function BillingPage() {
  const currentWorkspace = useAuthStore((state) => state.currentWorkspace)
  const [activeTab, setActiveTab] = React.useState("overview")

  const { data: plans, isLoading: plansLoading } = usePlans()
  const { data: billingInfo, isLoading: billingLoading } =
    useCurrentBillingInfo()
  const createCheckout = useCreateCheckout()
  const createPortal = useCreatePortal()

  const displayPlans: DisplayPlan[] = React.useMemo(() => {
    if (!plans) return []
    return plans
      .map(transformPlanToDisplay)
      .sort((a, b) => {
        const order = { free: 0, pro: 1, enterprise: 2 }
        return (
          (order[a.code as keyof typeof order] ?? 99) -
          (order[b.code as keyof typeof order] ?? 99)
        )
      })
  }, [plans])

  const currentPlan = React.useMemo(() => {
    if (!billingInfo) return displayPlans[0]
    return (
      displayPlans.find((p) => p.code === billingInfo.plan.code) ||
      displayPlans[0]
    )
  }, [billingInfo, displayPlans])

  const subscription = React.useMemo(() => {
    if (!billingInfo?.subscription) return undefined
    return {
      id: "current",
      status: billingInfo.subscription.status as
        | "active"
        | "canceled"
        | "past_due",
      currentPeriodEnd: billingInfo.subscription.currentPeriodEnd,
    }
  }, [billingInfo])

  const handleSelectPlan = async (plan: DisplayPlan) => {
    if (!currentWorkspace) return
    createCheckout.mutate({
      workspaceId: currentWorkspace.id,
      planCode: plan.code,
    })
  }

  const handleManageSubscription = async () => {
    if (!currentWorkspace) return
    createPortal.mutate(currentWorkspace.id)
  }

  const handleUpgrade = () => {
    setActiveTab("plans")
  }

  const isLoading = plansLoading || billingLoading
  const isMutating = createCheckout.isPending || createPortal.isPending

  // Format next billing date
  const formattedNextBilling = subscription?.currentPeriodEnd
    ? format(new Date(subscription.currentPeriodEnd), "dd 'de' MMMM 'de' yyyy", {
        locale: ptBR,
      })
    : "—"

  // Status label
  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "active":
        return "Ativa"
      case "canceled":
        return "Cancelada"
      case "past_due":
        return "Pagamento Pendente"
      default:
        return "—"
    }
  }

  const statusLabel = subscription ? getStatusLabel(subscription.status) : "—"

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price / 100) // Convert from cents to reais
  }

  // Mock invoices (seria integrado com API de invoices futuramente)
  const mockInvoices: Invoice[] = []

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const tabContentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  }

  if (isLoading) {
    return (
      <AppShell
        currentPath="/admin/billing"
        breadcrumb={["Administração", "Assinatura"]}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell
      currentPath="/admin/billing"
      breadcrumb={["Administração", "Assinatura"]}
    >
      <div className="space-y-6">
        <PageHeader
          title="Assinatura e Cobrança"
          description="Gerencie seu plano e pagamentos"
        />

        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="plans">Planos</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          {/* TAB 1: Overview */}
          <TabsContent value="overview" className="space-y-6">
            <motion.div
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Stats Cards Grid */}
              <motion.div
                className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={cardVariants}>
                  <StatCard
                    title="Plano Atual"
                    value={currentPlan?.name || "—"}
                    icon={CreditCard}
                  />
                </motion.div>
                <motion.div variants={cardVariants}>
                  <StatCard
                    title="Próxima Cobrança"
                    value={formattedNextBilling}
                    icon={Calendar}
                  />
                </motion.div>
                <motion.div variants={cardVariants}>
                  <StatCard
                    title="Status"
                    value={statusLabel}
                    icon={CheckCircle}
                    variant={subscription?.status === "active" ? "success" : "default"}
                    badge
                  />
                </motion.div>
                <motion.div variants={cardVariants}>
                  <StatCard
                    title="Gasto Mensal"
                    value={formatPrice(currentPlan?.price || 0)}
                    icon={DollarSign}
                  />
                </motion.div>
              </motion.div>

              {/* Plan Overview Card */}
              {currentPlan && (
                <PlanOverviewCard
                  plan={currentPlan}
                  subscription={subscription}
                  onUpgrade={handleUpgrade}
                  onManage={handleManageSubscription}
                  loading={isMutating}
                />
              )}
            </motion.div>
          </TabsContent>

          {/* TAB 2: Plans */}
          <TabsContent value="plans" className="space-y-6">
            <motion.div
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <PlanComparisonTable
                plans={displayPlans}
                currentPlanCode={currentPlan?.code || ""}
                onSelectPlan={handleSelectPlan}
                loading={isMutating}
              />
            </motion.div>
          </TabsContent>

          {/* TAB 3: History */}
          <TabsContent value="history">
            <motion.div
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <BillingHistory
                invoices={billingInfo?.subscription ? mockInvoices : []}
                loading={false}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
