# Toast Redesign - Sistema de Notificacoes User-Friendly

## Problema

O sistema de toast padrao do Sonner exibia mensagens tecnicas e pouco amigaveis para o usuario:

```json
{
  "statusCode": 429,
  "message": "Too many requests",
  "errorCode": "UNKNOWN_ERROR",
  "displayType": "toast"
}
```

## Solucao

Criamos um sistema de toast customizado que:
1. Mapeia codigos de erro para mensagens amigaveis em portugues
2. Exibe toasts visuais elegantes e pixel-perfect
3. Detecta automaticamente erros de rede e timeout
4. Mantém compatibilidade com a API do Sonner

---

## Arquivos Criados/Modificados

### Frontend

#### 1. `apps/frontend/src/lib/error-messages.ts` (NOVO)

Mapeamento de codigos de erro para mensagens user-friendly:

```typescript
export interface ErrorMessageConfig {
  title: string
  description?: string
  icon: 'AlertCircle' | 'WifiOff' | 'Clock' | 'ShieldX' | 'Lock' | 'Search' | 'AlertTriangle' | 'RefreshCw' | 'Server'
  action?: {
    label: string
    onClick?: () => void
  }
}

export const ERROR_CODE_MESSAGES: Record<string, ErrorMessageConfig> = {
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: {
    title: 'Muitas tentativas',
    description: 'Aguarde alguns segundos antes de tentar novamente.',
    icon: 'Clock',
  },

  // Authentication
  UNAUTHORIZED: {
    title: 'Sessao expirada',
    description: 'Faca login novamente para continuar.',
    icon: 'Lock',
  },

  // ... outros mapeamentos
}

export const STATUS_CODE_TO_ERROR_CODE: Record<number, string> = {
  400: 'VALIDATION_ERROR',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'UNPROCESSABLE_ENTITY',
  429: 'RATE_LIMIT_EXCEEDED',
  500: 'INTERNAL_SERVER_ERROR',
  502: 'BAD_GATEWAY',
  503: 'SERVICE_UNAVAILABLE',
  504: 'GATEWAY_TIMEOUT',
}

export function getErrorMessage(
  errorCode?: string,
  statusCode?: number,
  fallbackMessage?: string
): ErrorMessageConfig { /* ... */ }

export function isNetworkError(error: unknown): boolean { /* ... */ }
export function isTimeoutError(error: unknown): boolean { /* ... */ }
```

#### 2. `apps/frontend/src/lib/toast.tsx` (NOVO)

Toast customizado que wrapa o Sonner:

```tsx
import { toast as sonnerToast } from 'sonner'
import type { ExternalToast } from 'sonner'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { getErrorMessage, isNetworkError, isTimeoutError } from './error-messages'
import type { ErrorMessageConfig } from './error-messages'
import type { ErrorResponse } from '@/types'

// Toast options com estilo customizado
const baseToastOptions: ExternalToast = {
  className:
    'bg-zinc-900/95 backdrop-blur-sm border border-zinc-800/80 shadow-lg rounded-lg !py-3 !px-4',
  duration: 5000,
}

// Componente de conteudo do toast
function SuccessToastContent({ message, description, onDismiss }) {
  return (
    <div className={`flex ${description ? 'items-start' : 'items-center'} gap-3`}>
      <div className="flex-shrink-0">
        <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        </div>
      </div>
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-[13px] font-medium text-zinc-100 leading-tight">{message}</p>
        {description && (
          <p className="text-[12px] text-zinc-400 mt-1 leading-normal">
            {description}
          </p>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-0.5 -mr-1 text-zinc-500 hover:text-zinc-300 transition-colors rounded"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

// API publica do toast
export const toast = {
  error: (error: unknown, options?: ExternalToast) => {
    // Detecta erros de rede/timeout automaticamente
    if (isNetworkError(error)) {
      const config = getErrorMessage('NETWORK_ERROR')
      return sonnerToast.custom(/* ... */)
    }

    // Parse do erro e resolucao de mensagem amigavel
    const { errorCode, statusCode, message } = parseError(error)
    const config = getErrorMessage(errorCode, statusCode, message)

    return sonnerToast.custom(
      (id) => <ErrorToastContent config={config} onDismiss={() => sonnerToast.dismiss(id)} />,
      { ...baseToastOptions, ...options }
    )
  },

  success: (message: string, description?: string, options?: ExternalToast) => {
    return sonnerToast.custom(
      (id) => <SuccessToastContent message={message} description={description} onDismiss={() => sonnerToast.dismiss(id)} />,
      { ...baseToastOptions, duration: 3000, ...options }
    )
  },

  info: (message, description?, options?) => { /* ... */ },
  warning: (message, description?, options?) => { /* ... */ },
  loading: (message, options?) => { /* ... */ },
  dismiss: (id?) => sonnerToast.dismiss(id),
  promise: sonnerToast.promise,
}

export default toast
```

#### 3. `apps/frontend/src/App.tsx` (MODIFICADO)

Configuracao do Toaster para suportar toasts customizados:

```tsx
<Toaster
  position="top-right"
  toastOptions={{
    unstyled: true,
    classNames: {
      toast: 'w-full max-w-[380px]',
    },
  }}
  gap={12}
/>
```

#### 4. Substituir imports em todos os componentes

De:
```typescript
import { toast } from 'sonner'
```

Para:
```typescript
import { toast } from '@/lib/toast'
```

#### 5. `apps/frontend/src/lib/api.ts` (MODIFICADO)

Passar o erro completo para o toast:

```typescript
// Antes
toast.error(message)

// Depois
toast.error(error)  // O toast resolve a mensagem automaticamente
```

---

### Backend

#### 1. `apps/backend/src/api/guards/rate-limit.guard.ts` (MODIFICADO)

Lancar erro estruturado ao inves de generico:

```typescript
// Antes
throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS);

// Depois
throw new HttpException(
  {
    statusCode: HttpStatus.TOO_MANY_REQUESTS,
    message: 'Muitas tentativas. Por favor, aguarde um momento.',
    errorCode: 'RATE_LIMIT_EXCEEDED',
    displayType: 'toast',
  },
  HttpStatus.TOO_MANY_REQUESTS,
);
```

#### 2. `apps/backend/src/api/filters/http-exception.filter.ts` (MODIFICADO)

Adicionar mapeamentos para novos status codes:

```typescript
const STATUS_TO_DISPLAY_TYPE: Record<number, DisplayType> = {
  400: 'toast',
  401: 'page',
  403: 'modal',
  404: 'inline',
  429: 'toast',  // NOVO
  500: 'toast'
};

private getErrorCode(status: number): string {
  const errorCodes: Record<number, string> = {
    400: 'VALIDATION_ERROR',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'UNPROCESSABLE_ENTITY',  // NOVO
    429: 'RATE_LIMIT_EXCEEDED',   // NOVO
    500: 'INTERNAL_SERVER_ERROR',
    502: 'BAD_GATEWAY',           // NOVO
    503: 'SERVICE_UNAVAILABLE',   // NOVO
    504: 'GATEWAY_TIMEOUT'        // NOVO
  };
  return errorCodes[status] || 'UNKNOWN_ERROR';
}
```

---

## Estilos do Toast

### Cores por tipo

| Tipo    | Background Icon      | Cor Icon          | Cor Texto   |
|---------|---------------------|-------------------|-------------|
| Success | `bg-emerald-500/15` | `text-emerald-400`| `text-zinc-100` |
| Error   | `bg-red-500/15`     | `text-red-400`    | `text-zinc-100` |
| Warning | `bg-amber-500/15`   | `text-amber-400`  | `text-zinc-100` |
| Info    | `bg-blue-500/15`    | `text-blue-400`   | `text-zinc-100` |

### Dimensoes

- Container: `py-3 px-4`, `rounded-lg`
- Icone container: `w-6 h-6`, `rounded-full`
- Icone: `w-3.5 h-3.5`
- Titulo: `text-[13px] font-medium`
- Descricao: `text-[12px] text-zinc-400`
- Botao fechar: `w-3.5 h-3.5`

### Comportamento

- Alinhamento: `items-center` (sem descricao) ou `items-start` (com descricao)
- Duracao sucesso: 3000ms
- Duracao erro/info/warning: 5000ms
- Duracao loading: Infinity

---

## Uso

```typescript
import { toast } from '@/lib/toast'

// Sucesso
toast.success('Operacao realizada com sucesso!')
toast.success('Dados salvos', 'Suas alteracoes foram salvas.')

// Erro (aceita Error, AxiosError, string, ou objeto de erro)
toast.error(error)  // Resolve automaticamente a mensagem
toast.error('Algo deu errado')

// Info
toast.info('Nova atualizacao disponivel')

// Warning
toast.warning('Atencao', 'Esta acao nao pode ser desfeita.')

// Loading
const toastId = toast.loading('Processando...')
toast.dismiss(toastId)

// Promise
toast.promise(asyncFunction(), {
  loading: 'Carregando...',
  success: 'Concluido!',
  error: 'Falhou!'
})
```

---

## Checklist de Implementacao

- [ ] Criar `apps/frontend/src/lib/error-messages.ts`
- [ ] Criar `apps/frontend/src/lib/toast.tsx`
- [ ] Atualizar `apps/frontend/src/App.tsx` (Toaster config)
- [ ] Atualizar `apps/frontend/src/lib/api.ts` (import e uso)
- [ ] Substituir `import { toast } from 'sonner'` por `import { toast } from '@/lib/toast'` em todos os arquivos
- [ ] Atualizar `apps/backend/src/api/guards/rate-limit.guard.ts`
- [ ] Atualizar `apps/backend/src/api/filters/http-exception.filter.ts`
- [ ] Testar todos os cenarios de erro

---

## Resultado

**Antes:**
```
Too many requests
errorCode: UNKNOWN_ERROR
```

**Depois:**
Toast elegante com:
- Icone de relogio em fundo vermelho suave
- Titulo: "Muitas tentativas"
- Descricao: "Aguarde alguns segundos antes de tentar novamente."
- Botao X para fechar
