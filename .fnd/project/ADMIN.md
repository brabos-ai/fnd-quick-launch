# Admin App Frontend Patterns (apps/admin)

**Purpose:** Super Admin Manager Dashboard
**Port:** 3002

## Framework & Build
Framework: React 18.2.0 | Build: Vite 7.2.4 | TypeScript: 5.9.3

Config: `vite.config.ts`
```typescript
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: { port: 3002, proxy: { '/api': { target: 'http://localhost:3001', changeOrigin: true } } },
})
```

## State Management
Library: Zustand 4.4.0 + TanStack Query 4.35.0
Stores: `apps/admin/src/stores/*.ts`

Zustand Pattern (with persistence):
```typescript
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      login: async (data) => { /* async actions */ },
      logout: () => { get().clearAuth() },
    }),
    { name: 'fnd-manager-auth', storage: createJSONStorage(() => localStorage) }
  )
)
```

TanStack Query:
```typescript
export function useUsers(search?: string, status?: string) {
  return useQuery({
    queryKey: ['manager', 'users', search, status],
    queryFn: async () => {
      const response = await api.get<UserListItem[]>(`/manager/users?${params}`)
      return response.data
    },
  })
}
```

Stores: auth-store.ts, ui-store.ts, manager-store.ts

## Component Structure
```
src/
├── components/
│   ├── features/          # manager/, metrics/, plans/, subscriptions/
│   ├── guards/            # protected-route.tsx
│   ├── layout/            # shell, sidebar, header
│   └── ui/                # shadcn primitives
├── hooks/                 # TanStack Query hooks
├── lib/                   # api.ts, utils.ts
├── pages/                 # Route pages
├── stores/                # Zustand stores
├── styles/                # Global CSS
└── types/                 # TypeScript definitions
```

Naming: Components (PascalCase), Files (kebab-case), Hooks (camelCase with use prefix)

## Styling
Library: Tailwind CSS 3.4.17 + CSS Variables (shadcn pattern)
Global: `apps/admin/src/styles/index.css`

Theme System:
```css
:root { --background: 0 0% 98%; --primary: 217 91% 60%; }
.dark { --background: 224 71% 4%; --primary: 217 91% 65%; }
```

Utility:
```typescript
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## HTTP Client
Library: Axios 1.5.0
Config: `apps/admin/src/lib/api.ts`
Base URL: `VITE_API_URL` (default: `http://localhost:3001/api/v1`)

Features:
- Request interceptor: Adds Bearer token
- Response interceptor: Auto-unwraps API envelope, token refresh on 401
- Queue handling during refresh

## Routing
Library: React Router DOM 6.15.0
Routes: `apps/admin/src/App.tsx`

Structure:
```tsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/" element={<ProtectedRoute><ManagerShell /></ProtectedRoute>}>
    <Route path="users" element={<UsersPage />} />
    <Route path="users/:id" element={<UserDetailsPage />} />
    <Route path="metrics/*" element={<MetricsPages />} />
    <Route path="plans" element={<PlansPage />} />
    <Route path="subscriptions" element={<SubscriptionsPage />} />
  </Route>
</Routes>
```

## Forms
Library: React Hook Form 7.69.0 + Zod 3.25.76

Pattern:
```tsx
const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
})
```

## Environment Variables
Prefix: `VITE_`
Access: `import.meta.env.VITE_*`
Variables: VITE_API_URL

## Charts
Library: Recharts 2.15.4
Components: mrr-area-chart, donut-chart, dual-axis-line-chart, horizontal-bar-chart

## UI Library
Pattern: shadcn/ui (Radix UI + Tailwind)
Components: Button, Input, Dialog, Dropdown, Popover, Tooltip, Tabs, Card, Badge

## Additional Libraries
- Notifications: Sonner 1.7.4
- Date: date-fns 2.30.0
- Icons: Lucide React 0.460.0
- Animation: Framer Motion 11.12.0
