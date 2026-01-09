# Plan: F0001-internal-auth-admin-panel

## Overview

Migrar autenticação do Supabase para sistema interno com Passport.js (local + JWT) e criar painel administrativo em `apps/manager`. O objetivo é simplificar setup para alunos FND: um serviço (Railway) ao invés de dois (Railway + Supabase).

Escopo inclui: auth completo (signup, signin, refresh, reset password, email verification), segurança robusta (lockout, rate limiting, token rotation), gestão de sessões (device tracking, revogação), e admin panel (user CRUD, impersonate, métricas).

---

## Database

### Entities
| Entity | Table | Key Fields | Reference |
|--------|-------|------------|-----------|
| Session | sessions | id, user_id, refresh_token_hash, ip_address, expires_at, revoked_at | Similar: `libs/domain/src/entities/AuditLog.ts` |
| LoginAttempt | login_attempts | id, email, ip_address, success, locked_until | Similar: `libs/domain/src/entities/AuditLog.ts` |
| AuthToken | auth_tokens | id, user_id, type, token_hash, expires_at, used_at | Similar: `libs/domain/src/entities/WebhookEvent.ts` |
| ImpersonateSession | impersonate_sessions | id, admin_user_id, target_user_id, reason, expires_at, started_at, ended_at | Similar: `libs/domain/src/entities/AuditLog.ts` |

### Migration
- Create: sessions, login_attempts, auth_tokens, impersonate_sessions tables
- Add indexes: sessions(user_id), login_attempts(email, ip_address), auth_tokens(user_id, type)
- Modify: users table - add password_hash, email_verified; remove auth_user_id
- Reference: `libs/app-database/migrations/20250101001_create_initial_schema.js`

### Repository Methods
| Repository | Key Methods |
|------------|-------------|
| SessionRepository | create, findByUserId, findByRefreshTokenHash, revokeById, revokeAllByUserId |
| LoginAttemptRepository | create, countRecentByEmail |
| AuthTokenRepository | create, findByTokenHash, markAsUsed |
| ImpersonateSessionRepository | create, findActiveByAdminId, endSession |

Reference: `libs/app-database/src/repositories/UserRepository.ts`

---

## Backend

### Endpoints (19 total)
| Method | Path | Purpose |
|--------|------|---------|
| POST | /api/v1/auth/signup | Create account, user, workspace, send verification |
| POST | /api/v1/auth/signin | Validate credentials, check lockout, create session |
| POST | /api/v1/auth/refresh | Rotate refresh token, return new tokens |
| POST | /api/v1/auth/logout | Revoke current session |
| POST | /api/v1/auth/forgot-password | Generate reset token, send email |
| POST | /api/v1/auth/reset-password | Validate token, update password |
| POST | /api/v1/auth/verify-email | Mark email as verified |
| GET | /api/v1/auth/me | Return current user profile |
| GET | /api/v1/auth/sessions | List all sessions for current user |
| DELETE | /api/v1/auth/sessions/:id | Revoke specific session |
| GET | /api/v1/manager/users | List users with search/filter (admin) |
| GET | /api/v1/manager/users/:id | Get user details (admin) |
| PATCH | /api/v1/manager/users/:id/status | Activate/deactivate user (admin) |
| POST | /api/v1/manager/impersonate | Start impersonate session (admin) |
| DELETE | /api/v1/manager/impersonate | End impersonate session |
| GET | /api/v1/manager/metrics | Basic auth metrics (admin) |

### Commands & Events
| Command | Actions |
|---------|---------|
| SignUpCommand | Hash password, create account+workspace+user, emit AccountCreatedEvent |
| SignInCommand | Validate credentials, check lockout, create session |
| RefreshTokenCommand | Validate token, detect reuse, rotate |
| ImpersonateCommand | Create impersonate session, emit event |

| Event | Consumers |
|-------|-----------|
| AccountCreatedEvent | EmailWorker, AuditWorker |
| LoginSuccessEvent, LoginFailureEvent | AuditWorker |
| PasswordResetRequestedEvent, PasswordChangedEvent | EmailWorker, AuditWorker |
| ImpersonateStartedEvent, ImpersonateEndedEvent | AuditWorker |

### Module Structure
{"auth":["dtos/","commands/handlers/","events/handlers/","services/(password,token,rate-limit)","strategies/(local,jwt)","guards/(jwt-auth,local-auth,rate-limit)","auth.controller.ts","auth.module.ts"]}
{"manager":["dtos/","commands/handlers/","manager.controller.ts","manager.module.ts"]}

Reference: `apps/backend/src/api/modules/workspace/`, `apps/backend/src/api/modules/auth/`

---

## Frontend

### Apps
| App | Purpose |
|-----|---------|
| frontend | End-user SaaS - update auth to use internal endpoints |
| manager | Admin panel (new) - super-admin only |

### Pages
| Route | Component | Purpose |
|-------|-----------|---------|
| /login, /signup | Update | Use /auth/* instead of Supabase |
| /auth/verify-email | New | Handle email verification token |
| /settings/sessions | New | List and revoke active sessions |
| /manager/login | New | Super-admin login |
| /manager/users | New | Search, filter, view all users |
| /manager/users/:id | New | User details, sessions, status |
| /manager/metrics | New | Dashboard with auth metrics |

### Components
| Component | Purpose |
|-----------|---------|
| ImpersonateBanner | Persistent banner when impersonating |
| SessionCard | Session info with revoke action |
| UserStatusBadge, MetricsCard | Manager UI components |

### Hooks & State
| Hook/Store | Purpose |
|------------|---------|
| useAuth() | Replaces useSupabaseAuth |
| useSessions() | List, revoke sessions |
| useManagerUsers(), useImpersonate() | Manager operations |
| authStore | Update: add refreshToken, impersonateData |
| managerStore | New: filters, selected user |

Reference: `apps/frontend/src/pages/login.tsx`, `apps/frontend/src/hooks/use-auth.ts`

---

## Main Flow

1. User → POST /auth/signup → Create account, send verification email
2. User → Click email link → GET /auth/verify-email → Mark verified
3. User → POST /auth/signin → Validate, create session, return tokens
4. Client → Store tokens, attach access token to requests
5. Access expires → POST /auth/refresh → Rotate tokens
6. Admin → POST /manager/impersonate → Get special token with 30min timeout

## Implementation Order

1. **Database**: Migration (4 tables), modify users table
2. **Backend - Core**: Entities, Repositories, Password/Token services
3. **Backend - Auth**: Passport strategies, Guards, DTOs, Commands, Controller
4. **Backend - Manager**: DTOs, Commands, Controller
5. **Frontend - Auth**: Update hooks/store, update pages
6. **Frontend - Manager**: New app structure, pages, components
7. **Cleanup**: Remove Supabase files (see about.md)

## Quick Reference
| Pattern | Example File |
|---------|--------------|
| Entity | `libs/domain/src/entities/User.ts` |
| Repository | `libs/app-database/src/repositories/UserRepository.ts` |
| Controller | `apps/backend/src/api/modules/workspace/workspace.controller.ts` |
| Command | `apps/backend/src/api/modules/workspace/commands/CreateWorkspaceCommand.ts` |
| Guard | `apps/backend/src/api/guards/jwt-auth.guard.ts` (a criar) |
| Frontend Hook | `apps/frontend/src/hooks/use-auth.ts` |
| Frontend Store | `apps/frontend/src/stores/auth-store.ts` |
