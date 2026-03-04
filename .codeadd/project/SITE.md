# Site (Landing Page) Patterns (apps/site)

**Purpose:** Single-page marketing site for FND SaaS QuickLaunch
**Port:** 3003

## Framework & Build
Framework: React 18.2.0 | Build: Vite 7.3.1 | TypeScript: 5.0.0

Config: `vite.config.ts`
```typescript
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: { port: 3003 },
})
```

Scripts:
- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Component Structure
Architecture: Section-based single-page layout (no routing)

```
src/
├── components/
│   ├── ui/              # shadcn primitives (accordion, badge, button, card)
│   └── sections/        # Page sections
│       ├── hero.tsx
│       ├── features.tsx
│       ├── how-it-works.tsx
│       ├── pricing.tsx
│       ├── faq.tsx
│       ├── cta.tsx
│       ├── navbar.tsx
│       └── footer.tsx
├── lib/
│   └── utils.ts         # cn() utility
├── App.tsx              # Root component
├── main.tsx             # Entry point
└── index.css            # Global styles
```

App Structure:
```tsx
function App() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
```

## Styling
Library: Tailwind CSS 3.4.x + CSS Variables
Global: `src/index.css`
Config: `tailwind.config.js`

Theme System:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --primary: 142 76% 36%;
}
.dark {
  --background: 0 0% 4%;
  --foreground: 0 0% 98%;
}
```

Utility:
```typescript
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## Animation
Library: Framer Motion 11.0.x

Patterns:
```tsx
// Entrance animation
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>

// Scroll-triggered
<motion.h2
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
>

// Staggered
{items.map((item, i) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.05 }}
  />
))}
```

## UI Components
Library: Radix UI primitives (shadcn pattern)
Location: `src/components/ui/`
Components: accordion, badge, button, card

Pattern: CVA (class-variance-authority) for variants
```typescript
const buttonVariants = cva(
  'inline-flex items-center justify-center ...',
  {
    variants: {
      variant: { default: '...', secondary: '...', outline: '...' },
      size: { default: 'h-10 px-4', sm: 'h-9 px-3', lg: 'h-12 px-8' },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)
```

## Icons
Library: lucide-react 0.400.x

Usage:
```tsx
import { Shield, CreditCard, Github, ArrowRight } from 'lucide-react'
<Shield className="h-5 w-5" />
```

## What This App Does NOT Have
- No routing (single page with anchor links)
- No state management (static content)
- No forms (external CTAs)
- No API calls (static marketing)
- No authentication

## Dependencies
Core: react, react-dom
UI: tailwindcss, @radix-ui/*, class-variance-authority, clsx, tailwind-merge
Animation: framer-motion
Icons: lucide-react
Build: vite, @vitejs/plugin-react, typescript
