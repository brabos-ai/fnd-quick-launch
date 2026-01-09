# API Tests - F0001: Internal Auth + Admin Panel

## Quick Start (Recomendado)

**Um comando faz tudo automaticamente:**

```bash
npm run test:api:e2e
```

Isso vai:
1. Subir PostgreSQL + Redis isolados (portas 5433/6380)
2. Rodar migrations automaticamente
3. Criar super admin de teste
4. Iniciar o backend
5. Executar todos os testes
6. Limpar tudo no final

### Opções

```bash
# Modo verbose (ver logs detalhados)
npm run test:api:e2e:verbose

# Manter containers rodando após testes (útil para debug)
npm run test:api:e2e:keep
```

### Requisitos
- Docker Desktop rodando
- Node.js 18+
- Dependências instaladas (`npm install`)

---

## Setup Manual (Alternativo)

Use o setup manual apenas se precisar de controle granular.

### 1. Prerequisites
```bash
# Ensure services are running
npm run dev                    # Or separate: npm run dev:backend
docker-compose -f infra/docker-compose.yml up -d  # PostgreSQL + Redis

# Run migrations
npm run migrate:latest

# Start workers (in separate terminals)
npm run worker:email
npm run worker:audit
```

### 2. Setup Super Admin
```sql
-- Execute in PostgreSQL
INSERT INTO users (id, email, name, password_hash, status, email_verified, account_id)
VALUES (
  gen_random_uuid(),
  'admin@fnd.dev',
  'Super Admin',
  '$2a$10$YourBcryptHashHere',  -- Hash of 'SuperAdmin123!'
  'active',
  true,
  (SELECT id FROM accounts LIMIT 1)
);
```

Or use bcrypt to generate hash:
```bash
node -e "console.log(require('bcryptjs').hashSync('SuperAdmin123!', 10))"
```

### 3. Configure Environment
Set in `.env`:
```env
SUPER_ADMIN_EMAIL=admin@fnd.dev
```

### 4. Run Tests
```bash
# All tests
npm run test:api

# Or specific file
npx httpyac send docs/features/F0001-internal-auth-admin-panel/tests/api/00-setup.http --all -e local
```

---

## Test Files

| Order | File | Scenarios | Purpose |
|-------|------|-----------|---------|
| 1 | `00-setup.http` | 3 | Health checks, super admin auth |
| 2 | `01-auth-signup-signin.http` | 25 | Signup, signin, lockout |
| 3 | `02-auth-sessions.http` | 18 | Session management |
| 4 | `03-auth-password-reset.http` | 15 | Password reset flow |
| 5 | `04-auth-email-verification.http` | 20 | Email verification |
| 6 | `05-manager-users.http` | 30 | User management (admin) |
| 7 | `06-manager-impersonate.http` | 25 | Impersonation (admin) |
| 8 | `07-manager-metrics.http` | 20+ | Metrics dashboard (admin) |

**Total:** 150+ test scenarios

---

## Endpoints Tested

### Auth (11 endpoints)
- POST `/auth/signup` - Create account
- POST `/auth/signin` - Sign in
- POST `/auth/refresh` - Refresh token
- POST `/auth/logout` - Logout
- POST `/auth/forgot-password` - Request reset
- POST `/auth/reset-password` - Reset password
- POST `/auth/verify-email` - Verify email
- POST `/auth/resend-verification` - Resend verification
- GET `/auth/me` - Current user
- GET `/auth/sessions` - List sessions
- DELETE `/auth/sessions/:id` - Revoke session

### Manager (6 endpoints)
- GET `/manager/users` - List users (admin)
- GET `/manager/users/:id` - User details (admin)
- PATCH `/manager/users/:id/status` - Update status (admin)
- POST `/manager/impersonate` - Start impersonate (admin)
- DELETE `/manager/impersonate` - End impersonate (admin)
- GET `/manager/metrics` - Metrics (admin)

---

## Common Issues

### 401 Unauthorized
Run `00-setup.http` first to authenticate

### 429 Rate Limited
Clear Redis: `redis-cli FLUSHALL`

### Email not sent
1. Check email worker is running
2. Check `RESEND_API_KEY` in `.env`
3. Check worker logs

### Account locked
Wait 15 minutes or clear from database:
```sql
DELETE FROM login_attempts WHERE email = 'test@example.com';
```

---

## Manual Token Extraction

Some tests require tokens from emails/database:

### Password Reset Token
```sql
SELECT token FROM auth_tokens
WHERE type = 'password_reset'
  AND user_id = (SELECT id FROM users WHERE email = 'test@example.com')
  AND used_at IS NULL
  AND expires_at > NOW()
ORDER BY created_at DESC
LIMIT 1;
```

### Email Verification Token
```sql
SELECT token FROM auth_tokens
WHERE type = 'email_verification'
  AND user_id = (SELECT id FROM users WHERE email = 'test@example.com')
  AND used_at IS NULL
  AND expires_at > NOW()
ORDER BY created_at DESC
LIMIT 1;
```

---

## Cleanup

```sql
-- Delete test data
DELETE FROM users WHERE email LIKE '%@example.com';
DELETE FROM login_attempts WHERE email LIKE '%@example.com';

-- Or keep super admin only
DELETE FROM users WHERE email != 'admin@fnd.dev';
```

```bash
# Clear Redis cache
redis-cli FLUSHALL
```

---

## VS Code Integration

### Extensions
1. [httpyac](https://marketplace.visualstudio.com/items?itemName=anweber.vscode-httpyac) - Recommended
2. [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) - Alternative

### Usage
1. Open any `.http` file
2. Click "Send Request" above test
3. View response in side panel
4. Use `Ctrl+Alt+R` to send request

---

## Full Documentation

See `test-plan.md` for:
- Complete test scenarios
- Expected results
- CI/CD integration
- Troubleshooting guide
- Maintenance procedures

---

**Created:** 2025-12-19
**Feature:** F0001-internal-auth-admin-panel
**Status:** Ready for use
