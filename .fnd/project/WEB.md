# Web App Frontend Patterns (apps/web)

**Purpose:** Main SaaS Web Application
**Port:** 3000

## Framework & Build
Framework: React 18.2.0 | Build: Vite 7.2.4 | TypeScript: 5.9.3
Path Alias: `@` → `./src`

## State Management
Library: Zustand 4.4.0 + TanStack Query 4.35.0

Stores (with persist middleware):
- `auth-store.ts`: Authentication, user, workspace management
- `ui-store.ts`: Theme, sidebar state
- `error-modal-store.ts`: Global error modal

Store Pattern:
```typescript
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null, accessToken: null, isAuthenticated: false,
      login: async (data) => { /* async actions */ },
    }),
    { name: 'fnd-quicklaunch-auth-v2', storage: createJSONStorage(() => localStorage) }
  )
)
```

TanStack Query: Global QueryClient with 5min staleTime, 10min cache

## Component Structure
```
src/
├── components/
│   ├── features/           # auth/, billing/, dashboard/, account-admin/, workspace/, sessions/
│   ├── layout/             # App shell, sidebar, header
│   ├── ui/                 # Radix UI primitives (shadcn)
│   ├── guards/             # admin, auth route guards
│   └── charts/             # Chart components
├── pages/                  # Route pages (16+)
├── stores/                 # Zustand stores
├── hooks/                  # Custom hooks
├── lib/                    # API client, utilities
├── types/                  # TypeScript types
└── styles/                 # Global CSS
```

Naming: Components (PascalCase), Hooks (camelCase with use prefix), Files (kebab-case)

## Styling
Library: Tailwind CSS 3.4.17 with CSS Variables
Config: `tailwind.config.js`
Global: `src/styles/globals.css`

Theme: HSL-based CSS variables for light/dark modes
Utility: `cn()` using clsx + tailwind-merge

## HTTP Client
Library: Axios 1.5.0
Config: `src/lib/api.ts`
Base URL: `VITE_API_URL`

Features:
- Request interceptor: Auto-adds Bearer token
- Response interceptor: Auto-unwraps API envelopes, preserves paginated responses
- Token refresh: Automatic on 401 with request queuing
- Error handling: Toast/modal based on error type

## Routing
Library: React Router DOM 6.15.0
Routes: `src/routes.tsx`
Features: Lazy loading with React.lazy + Suspense

Guards:
- `ProtectedRoute`: Requires authentication
- `AuthRoute`: Redirects authenticated users
- `AdminRoute`: Requires admin role

Pages: 16+ including auth, dashboard, admin, settings, billing

## Forms
Library: React Hook Form 7.69.0 + Zod 3.25.76

Pattern:
```typescript
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
})

const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(loginSchema),
})
```

## Custom Hooks
Location: `src/hooks/`
- `use-account-admin.ts`: TanStack Query hooks for admin operations
- `use-billing.ts`: Billing/subscription hooks
- `use-email-change.ts`: Email change flow
- `use-debounce.ts`, `use-media-query.ts`, `use-mobile.ts`

## Key Features
- Authentication: JWT with refresh, auto-refresh on 401
- Multi-Workspace: Workspace switching, role-based access
- Error Handling: Toast + modal system
- Theme: Light/Dark/System with persistence
- Responsive: Mobile-first, collapsible sidebar

## Environment Variables
Prefix: `VITE_*`
Access: `import.meta.env.VITE_*`
Variables: VITE_API_URL

## Additional Libraries
- Notifications: Sonner 1.7.4
- Date: date-fns 2.30.0
- Icons: Lucide React 0.460.0
- Animation: Framer Motion 11.12.0
- Charts: Recharts 2.10.0
- Theme: next-themes 0.4.6
