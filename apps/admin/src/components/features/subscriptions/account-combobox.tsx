import { useState, useEffect, useRef } from 'react'
import { Search, Building2, Check, AlertCircle, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAccountSearch } from '@/hooks/use-accounts'
import { cn } from '@/lib/utils'
import type { AccountSearchItem } from '@/types'

interface AccountComboboxProps {
  value: AccountSearchItem | null
  onChange: (account: AccountSearchItem | null) => void
  placeholder?: string
  disabled?: boolean
}

export function AccountCombobox({
  value,
  onChange,
  placeholder = 'Buscar por nome ou email...',
  disabled = false,
}: AccountComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data: accounts, isLoading, isFetching } = useAccountSearch(debouncedSearch)

  const handleSelect = (account: AccountSearchItem) => {
    onChange(account)
    setSearch('')
    setOpen(false)
  }

  const handleClear = () => {
    onChange(null)
    setSearch('')
  }

  const showLoading = isLoading || isFetching

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          {value ? (
            <div
              className={cn(
                'flex items-center gap-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:bg-accent/50 transition-colors',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              onClick={() => !disabled && setOpen(true)}
            >
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{value.name}</div>
                <div className="text-xs text-muted-foreground truncate">{value.ownerEmail}</div>
              </div>
              {value.hasActiveSubscription && (
                <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded shrink-0">
                  Assinatura ativa
                </span>
              )}
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClear()
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              )}
            </div>
          ) : (
            <div
              className={cn(
                'flex items-center gap-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:bg-accent/50 transition-colors',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              onClick={() => !disabled && setOpen(true)}
            >
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{placeholder}</span>
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Digite pelo menos 2 caracteres..."
              className="pl-9 pr-8"
              autoFocus
            />
            {showLoading && (
              <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground animate-spin" />
            )}
          </div>
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          {search.length < 2 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Digite pelo menos 2 caracteres para buscar
            </div>
          ) : showLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Buscando...
            </div>
          ) : !accounts || accounts.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Nenhuma conta encontrada
            </div>
          ) : (
            <div className="py-1">
              {accounts.map((account) => (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => handleSelect(account)}
                  className={cn(
                    'flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-accent transition-colors text-left',
                    value?.id === account.id && 'bg-accent'
                  )}
                >
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{account.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{account.ownerEmail}</div>
                  </div>
                  {account.hasActiveSubscription && (
                    <div className="flex items-center gap-1 text-xs text-yellow-500 shrink-0">
                      <AlertCircle className="h-3 w-3" />
                      <span>Ativa</span>
                    </div>
                  )}
                  {value?.id === account.id && (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
