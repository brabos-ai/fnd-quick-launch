# FND SaaS QuickLaunch - Frontend V2

Complete rebuild of the frontend application for F0002-frontend-v2-rebuild feature.

## Overview

Production-grade, mobile-first frontend built with:
- React 18.2 + TypeScript
- Vite 7.x (fast builds, HMR)
- Tailwind CSS v3 (utility-first, responsive)
- shadcn/ui (Radix UI primitives)
- Framer Motion (animations)
- Recharts (data visualization)
- TanStack Query v4 (server state)
- TanStack Table v8 (advanced tables)
- React Router v6 (routing)
- Zustand v4 (client state)
- React Hook Form v7 + Zod (forms)

## Design System

Based on `docs/design-system/foundations.md`:
- **Colors**: Emerald primary (#10B981), Indigo accent (#6366F1)
- **Fonts**: Plus Jakarta Sans (display), DM Sans (body), JetBrains Mono (mono)
- **Breakpoints**: mobile (320px-767px), tablet (768px-1023px md:), desktop (1024px-1279px lg:), wide (1280px+ xl:)
- **Dark Mode**: Primary experience (default)
- **Border Radius**: 0.75rem (12px)

## Getting Started

```bash
# Development server (port 3000)
npm run dev -w @fnd/web_v2

# Build for production
npm run build -w @fnd/web_v2

# Preview production build
npm run preview -w @fnd/web_v2

# Type check
npm run typecheck -w @fnd/web_v2
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn primitives (button, card, input, etc.)
│   ├── layout/          # Layout components (AppShell, Sidebar, Header, etc.)
│   ├── features/        # Feature-specific components
│   └── charts/          # Chart wrappers (Recharts)
├── hooks/               # Custom React hooks
├── lib/
│   └── utils.ts         # Utility functions (cn, etc.)
├── pages/               # Route pages
├── stores/              # Zustand stores
├── styles/
│   └── globals.css      # Tailwind + design tokens
├── types/               # TypeScript type definitions
├── App.tsx              # Root component
├── main.tsx             # Entry point
└── vite-env.d.ts        # Vite types
```

## Installing shadcn/ui Components

This project is configured for shadcn/ui. To add components:

```bash
# From the frontend_v2 directory
cd apps/frontend_v2

# Add specific components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add input
npx shadcn@latest add label
# etc.
```

Components will be added to `src/components/ui/`.

## Path Aliases

The project uses `@/*` for imports:

```tsx
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
```

## Mobile-First Development

All components MUST be mobile-first:

```tsx
// CORRECT: Mobile-first
<div className="p-4 md:p-6 lg:p-8">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// INCORRECT: Desktop-first
<div className="p-8 sm:p-4">
```

## Design Tokens

All colors use CSS variables for theme support:

```tsx
// Use semantic colors
<div className="bg-background text-foreground">
<div className="bg-card text-card-foreground">
<div className="bg-primary text-primary-foreground">

// Avoid hardcoded colors
<div className="bg-emerald-500"> // Don't do this
```

## Animation Guidelines

Use subtle, purposeful animations:

```tsx
import { motion } from 'framer-motion'

// Fade in
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>

// Hover states
<Button className="transition-colors hover:bg-accent">
```

## Accessibility Checklist

- [ ] Contrast ratio 4.5:1 for text, 3:1 for UI
- [ ] Touch targets 44x44px minimum (h-11)
- [ ] Focus visible on all interactive elements
- [ ] Labels on all form inputs
- [ ] Alt text on all images
- [ ] Keyboard navigation support
- [ ] Screen reader announcements
- [ ] Reduced motion support

## Next Steps

1. Install shadcn components as needed
2. Implement layout components (AppShell, Sidebar, Header)
3. Create auth pages (login, signup, etc.)
4. Build dashboard with stats and charts
5. Add workspace management
6. Implement billing page

## References

- Design System: `docs/design-system/foundations.md`
- Design Spec: `docs/features/F0002-frontend-v2-rebuild/design.md`
- UX Skill: `.claude/skills/ux-design/SKILL.md`
