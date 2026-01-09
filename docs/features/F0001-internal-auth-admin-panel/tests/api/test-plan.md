# API Test Plan - F0001: Internal Auth + Admin Panel

## Overview

Comprehensive httpyac-based API test suite for the internal authentication system and admin panel. This test plan covers all 17 endpoints across auth and manager modules.

**Total Test Files:** 8
**Total Test Scenarios:** 150+
**Estimated Execution Time:** 5-10 minutes (with delays)

---

## Test Files

| File | Endpoints | Scenarios | Purpose |
|------|-----------|-----------|---------|
| `00-setup.http` | 2 | 3 | Health checks and super admin authentication |
| `01-auth-signup-signin.http` | 3 | 25 | User signup, signin, profile, account lockout |
| `02-auth-sessions.http` | 4 | 18 | Session management, multi-device, revocation |
| `03-auth-password-reset.http` | 2 | 15 | Password reset flow, token validation |
| `04-auth-email-verification.http` | 2 | 20 | Email verification, resend verification |
| `05-manager-users.http` | 3 | 30 | User management, search, filter, status updates |
| `06-manager-impersonate.http` | 2 | 25 | Admin impersonation, session management |
| `07-manager-metrics.http` | 1+ | 20+ | Auth metrics dashboard |

---

## Endpoints Covered

### Auth Endpoints (11 endpoints)

| Method | Path | Auth | Description | Test File |
|--------|------|------|-------------|-----------|
| POST | `/auth/signup` | None | Create new account | 01 |
| POST | `/auth/signin` | None | Sign in with credentials | 01 |
| POST | `/auth/refresh` | None | Refresh access token | 02 |
| POST | `/auth/logout` | JWT | Revoke current session | 02 |
| POST | `/auth/forgot-password` | None | Request password reset | 03 |
| POST | `/auth/reset-password` | None | Reset password with token | 03 |
| POST | `/auth/verify-email` | None | Verify email with token | 04 |
| POST | `/auth/resend-verification` | None | Resend verification email | 04 |
| GET | `/auth/me` | JWT | Get current user profile | 01 |
| GET | `/auth/sessions` | JWT | List all user sessions | 02 |
| DELETE | `/auth/sessions/:id` | JWT | Revoke specific session | 02 |

### Manager Endpoints (6 endpoints)

| Method | Path | Auth | Description | Test File |
|--------|------|------|-------------|-----------|
| GET | `/manager/users` | Admin | List all users (paginated, searchable) | 05 |
| GET | `/manager/users/:id` | Admin | Get user details | 05 |
| PATCH | `/manager/users/:id/status` | Admin | Update user status | 05 |
| POST | `/manager/impersonate` | Admin | Start impersonation session | 06 |
| DELETE | `/manager/impersonate` | Admin | End impersonation session | 06 |
| GET | `/manager/metrics` | Admin | Get auth metrics | 07 |

---

## Test Scenarios

### Happy Path Tests

#### Authentication
- [x] Sign up with valid credentials
- [x] Sign in with valid credentials
- [x] Get current user profile
- [x] Refresh access token
- [x] Logout (revoke session)
- [x] Request password reset
- [x] Reset password with valid token
- [x] Verify email with valid token
- [x] Resend verification email

#### Session Management
- [x] List all active sessions
- [x] Create multiple sessions (different devices)
- [x] Revoke specific session
- [x] Logout all sessions

#### Manager - Users
- [x] List all users
- [x] Get user details
- [x] Update user status (activate/deactivate)
- [x] Search users by email/name
- [x] Filter users by status/verification
- [x] Paginate user list

#### Manager - Impersonation
- [x] Start impersonation session
- [x] Access resources as impersonated user
- [x] End impersonation session

#### Manager - Metrics
- [x] Get dashboard metrics
- [x] Get time series data
- [x] Get failed login statistics
- [x] Get active sessions breakdown

### Validation Tests

#### Input Validation
- [x] Invalid email format
- [x] Weak password
- [x] Missing required fields
- [x] Invalid data types
- [x] Malformed tokens
- [x] Invalid UUIDs

#### Business Rules
- [x] Duplicate email signup
- [x] Account lockout after 5 failed attempts
- [x] Deactivated user cannot sign in
- [x] Revoked session cannot be used
- [x] Expired token rejection
- [x] Token reuse prevention

### Security Tests

#### Authentication & Authorization
- [x] Unauthenticated access to protected endpoints
- [x] Invalid JWT token
- [x] Expired JWT token
- [x] Non-admin access to manager endpoints
- [x] Cross-tenant isolation (cannot revoke other user's sessions)
- [x] Cannot impersonate self

#### Rate Limiting
- [x] Multiple failed login attempts
- [x] Password reset rate limiting
- [x] Email verification resend rate limiting

### Edge Cases

#### Session Management
- [x] Revoke non-existent session
- [x] Revoke already revoked session
- [x] Multiple concurrent sessions
- [x] Session expiration

#### Password Reset
- [x] Reset for non-existent email (email enumeration prevention)
- [x] Invalid reset token
- [x] Expired reset token
- [x] Token reuse

#### Email Verification
- [x] Verify already verified email
- [x] Invalid verification token
- [x] Expired verification token

#### Manager Operations
- [x] Get non-existent user details
- [x] Update status with invalid value
- [x] Impersonate non-existent user
- [x] Multiple concurrent impersonations

### Worker Integration Tests

#### Email Worker
- [x] Welcome email sent on signup
- [x] Verification email sent on signup
- [x] Password reset email sent
- [x] Verification resend email sent

#### Audit Worker
- [x] Signup event logged
- [x] Login success event logged
- [x] Login failure event logged
- [x] User status change logged
- [x] Impersonation start/end logged

---

## Prerequisites

### Database Setup
1. Run migrations: `npm run migrate:latest`
2. Database must be clean (no existing test users)
3. Create super admin user in database:
   ```sql
   INSERT INTO users (id, email, name, password_hash, status, email_verified)
   VALUES (
     gen_random_uuid(),
     'admin@fnd.dev',
     'Super Admin',
     '$2a$10$<bcrypt_hash>', -- Hash of 'SuperAdmin123!'
     'active',
     true
   );
   ```
4. Set `SUPER_ADMIN_EMAIL=admin@fnd.dev` in `.env`

### Service Setup
1. Backend API running on `http://localhost:3001`
2. PostgreSQL running on port 5432
3. Redis running on port 6379
4. Email worker running (`npm run worker:email`)
5. Audit worker running (`npm run worker:audit`)

### Environment Configuration
1. Copy `.env.example` to `.env`
2. Set required environment variables:
   - `DATABASE_URL`
   - `REDIS_URL`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `SUPER_ADMIN_EMAIL`
   - `RESEND_API_KEY` (for email tests)

### httpyac Installation
```bash
npm install httpyac --save-dev
```

---

## Running Tests

### Run All Tests
```bash
npm run test:api
# Or
npx httpyac send docs/features/F0001-internal-auth-admin-panel/tests/api/*.http --all -e local
```

### Run Specific Test File
```bash
npx httpyac send docs/features/F0001-internal-auth-admin-panel/tests/api/01-auth-signup-signin.http --all -e local
```

### Run with Verbose Output
```bash
npx httpyac send docs/features/F0001-internal-auth-admin-panel/tests/api/*.http --all -e local -v
```

### Run and Generate JUnit Report
```bash
npx httpyac send docs/features/F0001-internal-auth-admin-panel/tests/api/*.http --all -e local --junit > test-results.xml
```

### Run in Specific Environment
```bash
# Local
npx httpyac send docs/features/F0001-internal-auth-admin-panel/tests/api/*.http --all -e local

# Staging
npx httpyac send docs/features/F0001-internal-auth-admin-panel/tests/api/*.http --all -e staging
```

### Run in VS Code
1. Install [REST Client extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) or [httpyac extension](https://marketplace.visualstudio.com/items?itemName=anweber.vscode-httpyac)
2. Open any `.http` file
3. Click "Send Request" above each test
4. Or use keyboard shortcut: `Ctrl+Alt+R` (Windows/Linux) or `Cmd+Alt+R` (Mac)

---

## Test Execution Order

### Recommended Order
1. **00-setup.http** - Setup and health checks (REQUIRED FIRST)
2. **01-auth-signup-signin.http** - Create test users
3. **02-auth-sessions.http** - Test session management
4. **03-auth-password-reset.http** - Test password reset
5. **04-auth-email-verification.http** - Test email verification
6. **05-manager-users.http** - Test user management
7. **06-manager-impersonate.http** - Test impersonation
8. **07-manager-metrics.http** - Test metrics (run last to get accurate counts)

### Dependencies
- **All tests depend on:** `00-setup.http` (provides super admin token)
- **02-07 depend on:** `01-auth-signup-signin.http` (creates test users)
- **07 (metrics) should run last:** To get accurate counts after other tests

---

## Known Issues & Limitations

### Token Extraction Challenges
Some tests require extracting tokens from emails or database:
- **Password reset tokens:** Sent via email
- **Email verification tokens:** Sent via email

**Solutions:**
1. **Development Environment:** Create dev-only endpoint to retrieve tokens
   ```
   GET /auth/dev/reset-tokens/:email
   GET /auth/dev/verification-tokens/:email
   ```
2. **Email Service Mock:** Use email service mock/spy to capture tokens
3. **Database Query:** Query `auth_tokens` table directly in test setup

### Manual Steps Required
Some tests are commented out and require manual token insertion:
- Password reset with valid token (test file 03)
- Email verification with valid token (test file 04)
- Token reuse tests (require capturing valid token first)

**Recommendation:** For full automation, implement dev-only token retrieval endpoints.

### Rate Limiting
- Tests may trigger rate limiting on repeated runs
- Wait between test runs or clear rate limit cache (Redis)
- Adjust rate limit settings for testing environment

### Account Lockout
- Failed login tests trigger account lockout (15 minutes default)
- Tests assume configurable/short lockout period in dev
- May need to wait or reset lockout in database

### Email Worker Delays
- Tests use `{{$sleep}}` to wait for async workers
- Default delays: 1-2 seconds
- Increase if tests fail due to timing issues
- Ensure workers are running

---

## Cleanup

### Manual Cleanup (if needed)
```sql
-- Delete test users
DELETE FROM users WHERE email LIKE '%@example.com';
DELETE FROM users WHERE email LIKE '%test%';

-- Delete login attempts
DELETE FROM login_attempts WHERE email LIKE '%@example.com';

-- Delete sessions
DELETE FROM sessions WHERE user_id NOT IN (SELECT id FROM users);

-- Delete auth tokens
DELETE FROM auth_tokens WHERE user_id NOT IN (SELECT id FROM users);

-- Delete impersonate sessions
DELETE FROM impersonate_sessions;

-- Reset Redis cache
FLUSHALL
```

### Automated Cleanup Script
Create `scripts/cleanup-test-data.sql`:
```sql
-- Add cleanup queries above
```

Run:
```bash
psql $DATABASE_URL -f scripts/cleanup-test-data.sql
redis-cli FLUSHALL
```

---

## Expected Results

### Success Criteria
- All HTTP 2xx responses for happy path tests
- All HTTP 4xx responses for validation/error tests
- All HTTP 401/403 responses for auth/authorization tests
- No 5xx server errors
- Response times < 2000ms for most endpoints
- Response times < 500ms for simple queries
- All assertions pass

### Metrics After Full Test Run
After running all tests, metrics should show:
- **Total Users:** 15-20 (depending on test execution)
- **Today's Signups:** 15-20
- **Active Sessions:** 5-10
- **Failed Login Attempts:** 5+ (from lockout tests)
- **Locked Accounts:** 0-1 (depending on timing)

---

## Troubleshooting

### Tests Failing

#### 401 Unauthorized
- **Cause:** Token expired or invalid
- **Solution:** Re-run `00-setup.http` to get fresh tokens

#### 429 Rate Limited
- **Cause:** Too many requests
- **Solution:** Wait or clear Redis cache

#### 500 Server Error
- **Cause:** Backend error, database connection, worker not running
- **Solution:** Check backend logs, database connection, worker status

#### Timeout
- **Cause:** Slow database query, worker not processing
- **Solution:** Check database indexes, ensure workers are running

### Variables Not Found
- **Cause:** Tests run out of order
- **Solution:** Run `00-setup.http` first, ensure file dependencies are met

### Email Not Sent
- **Cause:** Email worker not running, invalid API key
- **Solution:** Start worker, check `RESEND_API_KEY` in `.env`

### Token Extraction Failed
- **Cause:** Email not sent, token format changed
- **Solution:** Check email logs, query database directly for token

---

## CI/CD Integration

### GitHub Actions Example
```yaml
name: API Tests

on: [push, pull_request]

jobs:
  api-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Run migrations
        run: npm run migrate:latest

      - name: Start backend
        run: npm run dev:backend &
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/test
          REDIS_URL: redis://localhost:6379

      - name: Wait for backend
        run: npx wait-on http://localhost:3001/health

      - name: Run API tests
        run: npm run test:api

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results.xml
```

---

## Maintenance

### Adding New Tests
1. Create new test in appropriate file
2. Follow naming convention: `### [CATEGORY]: [Description]`
3. Use `# @name` for requests that need variable capture
4. Add assertions for status code and response structure
5. Update test plan with new scenario

### Updating Endpoints
1. Update corresponding test file
2. Update endpoint table in this document
3. Update test count
4. Re-run tests to verify

### Environment Changes
1. Update `http-client.env.json`
2. Update prerequisites section
3. Update CI/CD configuration

---

## References

- **httpyac Documentation:** https://httpyac.github.io/
- **httpyac Patterns:** `.claude/skills/api-testing/httpyac-patterns.md`
- **Feature Plan:** `docs/features/F0001-internal-auth-admin-panel/plan.md`
- **Implementation:** `docs/features/F0001-internal-auth-admin-panel/implementation.md`
- **CLAUDE.md:** Project documentation and patterns

---

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review backend logs: `apps/backend/logs/`
3. Check worker logs: `apps/backend/logs/workers/`
4. Review test file comments and notes
5. Consult httpyac documentation

---

**Last Updated:** 2025-12-19
**Version:** 1.0.0
**Status:** Ready for use once implementation is complete
