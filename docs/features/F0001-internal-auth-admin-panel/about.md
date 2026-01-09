# Task: Autenticação Interna + Admin Panel

**Branch:** feature/F0001-internal-auth-admin-panel
**Date:** 2025-12-19

## Objetivo

Migrar o sistema de autenticação do Supabase para uma solução interna com Passport.js e criar um painel administrativo (Manager) para gestão de usuários, métricas e impersonate. O objetivo principal é simplificar o setup para alunos do FND: apenas um serviço (Railway) em vez de dois (Railway + Supabase).

A feature engloba três fases executadas em paralelo: remoção do Supabase Auth, implementação de auth próprio, e criação do admin panel como app separada no monorepo.

## Contexto de Negócio

**Por que é necessário:** Alunos do FND precisam configurar Railway (backend/banco) e Supabase (auth) separadamente. Isso aumenta complexidade, fragmenta gestão de usuários em dois dashboards, e não oferece painel admin próprio.

**Problema resolvido:** Setup complexo + ausência de ferramentas administrativas (impersonate, métricas, gestão de sessões).

**Stakeholders:** Alunos FND (setup simplificado), Super-admins (painel de gestão), Suporte (impersonate para debug).

---

## Spec (Token-Efficient)

### Escopo

{"included":["auth interno Passport.js (local+JWT)","refresh token rotation","account lockout","rate limiting Redis","device/session tracking","password reset via email","email verification","admin panel (apps/manager)","user CRUD","impersonate com auditoria","métricas básicas","gestão de sessões"]}
{"excluded":["OAuth social (Google/GitHub)","2FA/MFA","migração de usuários existentes (template novo)"]}

### Arquitetura

{"apps":{"frontend":"app usuário final SaaS","manager":"painel admin (super-admin only)","backend":"API + BFF manager"}}
{"backendModules":{"auth":"compartilhado frontend+manager","workspace":"frontend only","billing":"frontend only","manager":"BFF exclusivo admin panel"}}
{"managerBFF":["users/","metrics/","impersonate/","sessions/"]}

### Tabelas Novas

{"sessions":{"fields":["id","user_id","refresh_token_hash","ip_address","user_agent","device_name","last_activity_at","expires_at","revoked_at","created_at"]}}
{"login_attempts":{"fields":["id","email","ip_address","success","locked_until","created_at"]}}
{"auth_tokens":{"fields":["id","user_id","type","token_hash","expires_at","used_at","created_at"],"types":["password_reset","email_verification"]}}
{"impersonate_sessions":{"fields":["id","admin_user_id","target_user_id","reason","expires_at","started_at","ended_at"]}}

### Regras de Negócio

{"lockout":{"attempts":5,"duration":"15min"}}
{"rateLimiting":{"/auth/login":"5/min","/auth/signup":"3/min","/auth/forgot-password":"3/min"}}
{"refreshToken":{"rotation":true,"reuse_detection":"invalidate_all_sessions"}}
{"impersonate":{"timeout":"30min","reason":"required","banner":"always_visible"}}

### Fluxos

{"signup":"email+senha → hash bcrypt → salvar user → enviar email verificação → criar session → retornar tokens"}
{"signin":"email+senha → validar lockout → verificar hash → criar session → retornar access+refresh"}
{"refresh":"refresh_token → validar → rotation (novo token, invalida antigo) → retornar novos tokens"}
{"impersonate":"admin_id+target_id+reason → criar impersonate_session → gerar token especial → audit log"}

### Erros

{"auth_errors":[{"code":"INVALID_CREDENTIALS","msg":"Email ou senha incorretos"},{"code":"ACCOUNT_LOCKED","msg":"Conta bloqueada. Tente novamente em X minutos"},{"code":"EMAIL_NOT_VERIFIED","msg":"Verifique seu email antes de fazer login"},{"code":"TOKEN_EXPIRED","msg":"Sessão expirada. Faça login novamente"},{"code":"TOKEN_REUSED","msg":"Sessão invalidada por segurança"}]}

### Integrações

{"internal":["Resend (emails transacionais)","Redis (rate limiting, cache)","BullMQ (fila de emails)","Audit Logs (eventos de auth)"]}
{"external":"nenhuma nova"}

### Edge Cases

[{"case":"refresh token roubado","handling":"detectar reuso → invalidar todas sessões do user → forçar re-login"},{"case":"admin esquece impersonate ativo","handling":"timeout 30min automático"},{"case":"múltiplas tentativas de lockout bypass","handling":"rate limit por IP + por email"},{"case":"sessão em múltiplos devices","handling":"listar todas, permitir revogação individual ou total"}]

### Segurança

{"password":{"hash":"bcrypt","min_length":8}}
{"tokens":{"access":"JWT 15min","refresh":"opaque 7 days, stored hashed"}}
{"audit_events":["login_success","login_failure","logout","password_change","password_reset_request","password_reset_complete","session_revoked","impersonate_start","impersonate_end"]}

### Critérios de Aceite

- [ ] Login/cadastro funciona sem Supabase
- [ ] Refresh token rotation implementado e testado
- [ ] Account lockout após 5 tentativas falhas
- [ ] Rate limiting funcionando em /auth/*
- [ ] Usuário consegue ver e revogar sessões ativas
- [ ] Password reset via email funciona end-to-end
- [ ] Admin panel exibe lista de usuários com busca
- [ ] Impersonate funciona com timeout e banner
- [ ] Audit logs registram todos eventos de auth
- [ ] Variáveis do Supabase removidas do .env.example

### Arquivos a Remover

{"backend":["apps/backend/src/shared/services/supabase.service.ts","apps/backend/src/api/guards/supabase-auth.guard.ts","apps/backend/src/api/modules/auth/supabase-webhook.controller.ts","libs/backend/src/services/ISupabaseService.ts"]}
{"frontend":["apps/frontend/src/lib/supabase.ts","apps/frontend/src/hooks/use-supabase-auth.ts"]}

### Próximos Passos

O Planning Agent deve: (1) Definir ordem de implementação dos arquivos considerando dependências. (2) Especificar estrutura do apps/manager (React+Vite+Shadcn, mesma stack do frontend). (3) Detalhar endpoints do módulo manager/. (4) Definir estratégia de testes para auth flows.
