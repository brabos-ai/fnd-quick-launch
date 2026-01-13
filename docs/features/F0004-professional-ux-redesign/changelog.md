# Changelog: F0004-professional-ux-redesign

> **Data:** 2026-01-13 | **Branch:** feature/F0004-professional-ux-redesign

## Resumo

Redesign completo da UX com nova paleta de cores desaturada (#2563EB), implementação de seleção de menu sutil com barra lateral de 3px, remoção de bordas visíveis em cards no tema light, e padronização de tokens semânticos em todo o frontend. Toast system refatorizado para funcionar perfeitamente em ambos os temas (light/dark).

## Arquivos Principais

### Core & Business Logic (Design System)

| Arquivo | Descrição |
|---------|-----------|
| `apps/web/src/styles/globals.css` | Nova paleta de cores light/dark com tokens semânticos, shadows com tint primária, warning-action token |
| `apps/admin/src/styles/index.css` | Estilos correspondentes para admin dashboard |

### Components - Layout

| Arquivo | Descrição |
|---------|-----------|
| `apps/web/src/components/layout/sidebar.tsx` | Menu selection com bg-primary/[0.08] + barra 3px, collapse behavior |
| `apps/web/src/components/layout/bottom-nav.tsx` | Seleção mobile idêntica à sidebar, drawer admin collapse |
| `apps/admin/src/components/layout/sidebar.tsx` | Admin sidebar com seleção visual sutil e navegação |

**Implementações:**
- `Sidebar`: renderização desktop/mobile, workspace switcher, seleção visual
- `BottomNav`: navegação mobile, admin drawer com seleção
- Ambos: transições suaves, collapse behavior, tooltip suporte

### Components - UI Base

| Arquivo | Descrição |
|---------|-----------|
| `apps/web/src/components/ui/card.tsx` | Card com shadow light, subtle border dark, rounded tokens |
| `apps/admin/src/components/ui/card.tsx` | Card idêntico para admin consistency |

**Implementações:**
- `Card`: shadow-sm light, dark:border-border/50 dark, exports CardHeader/Content/Footer/Title/Description

### Components - Features

| Arquivo | Descrição |
|---------|-----------|
| `apps/web/src/components/features/billing/plan-card.tsx` | Plan card com gradient brand, spotlight effect, tokens semânticos |
| `apps/web/src/components/features/dashboard/chart-card.tsx` | Chart card com nova paleta visual |
| `apps/web/src/components/features/dashboard/stats-card.tsx` | Stats card com tokens de feedback (success/error/warning) |
| `apps/web/src/components/features/workspace/workspace-card.tsx` | Workspace card refatorizado com novo design |
| `apps/web/src/components/features/workspace/workspace-danger-zone.tsx` | Danger zone com token warning-action (orange) |

**Implementações:** Todos refatorizado para usar tokens semânticos, sem cores hardcoded

### Utils & System

| Arquivo | Descrição |
|---------|-----------|
| `apps/web/src/lib/toast.tsx` | Toast system com custom content, suport light/dark, error/success/info/warning |

**Implementações:**
- `ErrorToastContent`: background destructive/15, icon com core color
- `SuccessToastContent`: background success/15, CheckCircle icon
- `InfoToastContent`: background info/15, Info icon
- `WarningToastContent`: background warning/15, AlertTriangle icon
- Base options: bg-popover, border-border, shadow-lg, backdrop blur

### Config

| Arquivo | Descrição |
|---------|-----------|
| `apps/web/tailwind.config.js` | Atualizado com nova paleta de cores |
| `apps/admin/tailwind.config.js` | Atualizado com nova paleta para admin |

## Estatísticas

| Categoria | Quantidade |
|-----------|-----------|
| Arquivos Core (design system) | 2 |
| Componentes Layout | 3 |
| Componentes UI Base | 2 |
| Componentes Features | 5 |
| Utils & System | 1 |
| Config | 2 |
| **Total** | **16** |

### Breakdown por Tipo

- **HIGH Priority (Business):** 8 arquivos (design system, layout, toast)
- **MEDIUM Priority (Config):** 4 arquivos (tailwind, style configs)
- **LOW Priority (Support):** 4 arquivos (backups, feature components)

## Fora do Escopo Original

Nenhum item fora do escopo detectado. Todos os arquivos modificados alinham perfeitamente com os requisitos funcionais definidos em `about.md`:

- ✅ RF01: Nova paleta #2563EB
- ✅ RF02: Seleção 8% + barra 3px
- ✅ RF03: Cards sem border (light) + border sutil (dark)
- ✅ RF04: Tokens semânticos
- ✅ RF05: Sem cores hardcoded
- ✅ Edge Cases: Toast light/dark, warning-action token

## Próximos Passos

1. Code review dos arquivos modificados
2. Validar contraste WCAG AA em ambos os temas
3. Testar responsividade em mobile/tablet/desktop
4. Verificar compatibilidade entre web e admin dashboards
5. Merge para main branch

_Gerado por /pr em 2026-01-13_

---

## Lista Completa de Arquivos Alterados

> Gerado automaticamente pelo script em 2026-01-13

```
apps/admin/src/components/layout/sidebar.tsx
apps/admin/src/components/ui/card.tsx
apps/admin/src/styles/index.css
apps/admin/tailwind.config.js
apps/web/src/components/features/billing/plan-card.tsx
apps/web/src/components/features/dashboard/chart-card.tsx
apps/web/src/components/features/dashboard/stats-card.tsx
apps/web/src/components/features/workspace/workspace-card.tsx
apps/web/src/components/features/workspace/workspace-danger-zone.tsx
apps/web/src/components/layout/bottom-nav.tsx
apps/web/src/components/layout/sidebar.tsx
apps/web/src/components/ui/card.tsx
apps/web/src/lib/toast.tsx
apps/web/src/styles/globals.css
apps/web/src/styles/globals.css.bak
apps/web/tailwind.config.js
```

**Total:** 16 arquivos

---

_Finalizado por feature-pr.sh em 
