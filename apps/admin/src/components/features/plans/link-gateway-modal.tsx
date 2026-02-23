import { useState } from 'react'
import { CheckCircle, XCircle, Loader2, Activity } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingButton } from '@/components/ui/loading-button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useGatewayProducts, useGatewayPrices, useGatewayHealth, useLinkGateway } from '@/hooks/use-gateways'
import type { PlanPrice, PaymentProvider, GatewayHealthResult } from '@/types'

const PAYMENT_PROVIDERS: { value: PaymentProvider; label: string }[] = [
  { value: 'stripe', label: 'Stripe' },
  { value: 'mercadopago', label: 'Mercado Pago' },
  { value: 'pagseguro', label: 'PagSeguro' },
  { value: 'asaas', label: 'Asaas' },
  { value: 'pagarme', label: 'Pagar.me' },
]

type Step = 1 | 2 | 3

interface LinkGatewayModalProps {
  planId: string
  planPrices: PlanPrice[]
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function LinkGatewayModal({
  planId,
  planPrices,
  open,
  onClose,
  onSuccess,
}: LinkGatewayModalProps) {
  const [step, setStep] = useState<Step>(1)
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | ''>('')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [priceMapping, setPriceMapping] = useState<Record<string, string>>({})
  const [healthResult, setHealthResult] = useState<GatewayHealthResult | null>(null)

  const { data: products, isLoading: isLoadingProducts } = useGatewayProducts(
    selectedProvider as PaymentProvider,
    step >= 2 && !!selectedProvider
  )

  const { data: prices, isLoading: isLoadingPrices } = useGatewayPrices(
    selectedProvider as PaymentProvider,
    selectedProductId
  )

  const healthMutation = useGatewayHealth()
  const linkMutation = useLinkGateway()

  const handleClose = () => {
    setStep(1)
    setSelectedProvider('')
    setSelectedProductId('')
    setPriceMapping({})
    setHealthResult(null)
    onClose()
  }

  const handleCheckHealth = async () => {
    if (!selectedProvider) return
    const result = await healthMutation.mutateAsync(selectedProvider as PaymentProvider)
    setHealthResult(result)
  }

  const handleNextStep1 = () => {
    if (!selectedProvider) return
    setStep(2)
  }

  const handleNextStep2 = () => {
    if (!selectedProductId) return
    setStep(3)
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
      setSelectedProductId('')
    } else if (step === 3) {
      setStep(2)
      setPriceMapping({})
    }
  }

  const handleSubmit = async () => {
    if (!selectedProvider || !selectedProductId) return

    const providerPriceIds = Object.entries(priceMapping)
      .filter(([, providerPriceId]) => !!providerPriceId)
      .map(([planPriceId, providerPriceId]) => ({ planPriceId, providerPriceId }))

    try {
      await linkMutation.mutateAsync({
        planId,
        data: {
          provider: selectedProvider as PaymentProvider,
          providerProductId: selectedProductId,
          providerPriceIds: providerPriceIds.length > 0 ? providerPriceIds : undefined,
        },
      })
      handleClose()
      onSuccess()
    } catch {
      // Error already handled by mutation onError (toast)
    }
  }

  const formatPrice = (amount: number, currency: string, interval: string) => {
    const value = (amount / 100).toFixed(2)
    return `${currency.toUpperCase()} ${value} / ${interval}`
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Vincular Gateway de Pagamento</DialogTitle>
          <DialogDescription>
            {step === 1 && 'Selecione o provedor de pagamento e verifique a conexao.'}
            {step === 2 && 'Selecione o produto no gateway para vincular a este plano.'}
            {step === 3 && 'Mapeie os precos do plano aos precos do gateway (opcional).'}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className={step === 1 ? 'text-primary font-semibold' : ''}>1. Provedor</span>
          <span>→</span>
          <span className={step === 2 ? 'text-primary font-semibold' : ''}>2. Produto</span>
          <span>→</span>
          <span className={step === 3 ? 'text-primary font-semibold' : ''}>3. Precos</span>
        </div>

        {/* Step 1: Provider Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="provider">Provedor *</Label>
              <Select
                value={selectedProvider}
                onValueChange={(value) => {
                  setSelectedProvider(value as PaymentProvider)
                  setHealthResult(null)
                }}
              >
                <SelectTrigger id="provider">
                  <SelectValue placeholder="Selecione um provedor" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_PROVIDERS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProvider && (
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCheckHealth}
                  disabled={healthMutation.isPending}
                >
                  {healthMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Activity className="mr-2 h-4 w-4" />
                  )}
                  Verificar Conexao
                </Button>

                {healthResult && (
                  <div className="flex items-center gap-1 text-sm">
                    {healthResult.healthy ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-green-600">OK ({healthResult.latencyMs}ms)</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-red-600">Falha</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Product Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label>
                Provedor:{' '}
                <Badge variant="secondary">
                  {PAYMENT_PROVIDERS.find((p) => p.value === selectedProvider)?.label}
                </Badge>
              </Label>
            </div>
            <div>
              <Label htmlFor="product">Produto *</Label>
              {isLoadingProducts ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                        {product.description && ` - ${product.description}`}
                        {!product.active && ' (inativo)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {!isLoadingProducts && (!products || products.length === 0) && (
                <p className="text-xs text-muted-foreground mt-1">
                  Nenhum produto encontrado neste gateway.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Price Mapping */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <Label>
                Produto:{' '}
                <span className="font-mono text-sm">
                  {products?.find((p) => p.id === selectedProductId)?.name ?? selectedProductId}
                </span>
              </Label>
            </div>

            {planPrices.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Este plano nao possui precos cadastrados. O produto sera vinculado sem mapeamento de precos.
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Mapeie cada preco do plano a um preco do gateway (opcional).
                </p>

                {isLoadingPrices ? (
                  <div className="space-y-2">
                    {planPrices.map((pp) => (
                      <Skeleton key={pp.id} className="h-10 w-full" />
                    ))}
                  </div>
                ) : (
                  planPrices.map((planPrice) => (
                    <div key={planPrice.id} className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        {planPrice.interval === 'monthly' ? 'Mensal' : 'Anual'} —{' '}
                        {planPrice.currency.toUpperCase()} {(planPrice.amount / 100).toFixed(2)}
                      </Label>
                      <Select
                        value={priceMapping[planPrice.id] ?? ''}
                        onValueChange={(value) =>
                          setPriceMapping((prev) => ({ ...prev, [planPrice.id]: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Nao mapear (opcional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {prices?.map((gPrice) => (
                            <SelectItem key={gPrice.id} value={gPrice.id}>
                              {gPrice.id} — {formatPrice(gPrice.unitAmount, gPrice.currency, gPrice.interval)}
                              {!gPrice.active && ' (inativo)'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={handleBack}>
                Voltar
              </Button>
            )}
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
          </div>

          <div>
            {step === 1 && (
              <Button onClick={handleNextStep1} disabled={!selectedProvider}>
                Proximo
              </Button>
            )}
            {step === 2 && (
              <Button onClick={handleNextStep2} disabled={!selectedProductId}>
                Proximo
              </Button>
            )}
            {step === 3 && (
              <LoadingButton
                loading={linkMutation.isPending}
                onClick={handleSubmit}
                disabled={!selectedProductId}
              >
                Vincular
              </LoadingButton>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
