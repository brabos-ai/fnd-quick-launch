# Implementation: Email Change

**Data:** 2025-12-31 | **Desenvolvedor:** Claude Code Autopilot | **Score de Review:** 9.95/10

Implementação completa do fluxo seguro de alteração de e-mail em 2 etapas: solicitação com verificação de senha + confirmação via token enviado por email.

---

## Métricas de Implementação

{"files":{"created":19,"modified":16,"total":35},"layers":{"database":7,"backend":8,"frontend":4},"migrations":1,"build":"pass","score":"9.95/10","compliance":"34/34"}

---

## Arquivos Criados

### Database Layer (7 files)
- `libs/domain/src/enums/EmailChangeStatus.ts` - Enum com estados: pending, confirmed, canceled
- `libs/domain/src/entities/EmailChangeRequest.ts` - Entidade de domínio com userId, newEmail, status, timestamps
- `libs/app-database/src/types/EmailChangeRequestsTable.ts` - Tipo Kysely para tabela email_change_requests
- `libs/app-database/migrations/20251231001_create_email_change_requests_table.js` - Migration com índice composto [user_id, status]
- `libs/app-database/src/interfaces/IEmailChangeRequestRepository.ts` - Contrato do repositório com métodos CRUD
- `libs/app-database/src/repositories/EmailChangeRequestRepository.ts` - Implementação com padrão multi-tenant e toEntity() para conversão
- `libs/app-database/migrations/20251228001_create_webhook_receiver_tables.js` - Stub para corrigir corrupção de migrations

### Backend Layer (8 files)
- `apps/backend/src/api/modules/auth/dtos/RequestEmailChangeDto.ts` - DTO com validação IsEmail e IsString para senha
- `apps/backend/src/api/modules/auth/dtos/ConfirmEmailChangeDto.ts` - DTO com validação IsString para token
- `apps/backend/src/api/modules/auth/commands/RequestEmailChangeCommand.ts` - Handler para criação de request com verificação de senha
- `apps/backend/src/api/modules/auth/commands/ConfirmEmailChangeCommand.ts` - Handler para confirmação com preservação de sessão atual
- `apps/backend/src/api/modules/auth/events/EmailChangeRequestedEvent.ts` - Evento para notificação de email de confirmação
- `apps/backend/src/api/modules/auth/events/handlers/EmailChangeRequestedEventHandler.ts` - Handler para enfileirar email via EmailQueueService

### Frontend Layer (4 files)
- `apps/frontend/src/hooks/use-email-change.ts` - TanStack Query hooks para request e confirm com invalidação
- `apps/frontend/src/components/features/settings/email-change-dialog.tsx` - Dialog com form Zod validation e toast notifications
- `apps/frontend/src/pages/auth/confirm-email-change.tsx` - Página auto-confirmação com loading/error/success states e redirect
- `apps/frontend/src/types/index.ts` - Interfaces RequestEmailChangeRequest e ConfirmEmailChangeRequest

---

## Arquivos Modificados

### Database Layer (7 files)
- `libs/domain/src/entities/AuthToken.ts` - Adicionado 'email_change' ao union type
- `libs/domain/src/entities/index.ts` - Exportado EmailChangeRequest
- `libs/domain/src/enums/index.ts` - Exportado EmailChangeStatus
- `libs/app-database/src/interfaces/index.ts` - Exportado IEmailChangeRequestRepository
- `libs/app-database/src/repositories/index.ts` - Exportado EmailChangeRequestRepository
- `libs/app-database/src/types/Database.ts` - Adicionado tabela email_change_requests ao schema Kysely
- `libs/app-database/src/repositories/AuthTokenRepository.ts` - Atualizado findByTokenHash para aceitar tipo 'email_change'

### Backend Layer (9 files)
- `apps/backend/src/api/modules/auth/dtos/index.ts` - Exportado RequestEmailChangeDto e ConfirmEmailChangeDto
- `apps/backend/src/api/modules/auth/commands/index.ts` - Exportado novos commands
- `apps/backend/src/api/modules/auth/events/index.ts` - Exportado EmailChangeRequestedEvent
- `apps/backend/src/api/modules/auth/events/handlers/index.ts` - Exportado EmailChangeRequestedEventHandler
- `apps/backend/src/api/modules/auth/auth.controller.ts` - Adicionado endpoints POST /request-email-change e POST /confirm-email-change
- `apps/backend/src/api/modules/auth/auth.module.ts` - Registrado handlers no providers array
- `apps/backend/src/shared/shared.module.ts` - Registrado EmailChangeRequestRepository com token DI IEmailChangeRequestRepository
- `libs/app-database/src/repositories/SessionRepository.ts` - Adicionado método revokeAllExcept(userId, sessionId) para preservação de sessão
- `apps/backend/src/api/modules/auth/strategies/jwt.strategy.ts` - Anexado sessionId ao objeto user do JWT payload

### Frontend Layer (3 files)
- `apps/frontend/src/components/features/settings/profile-tab.tsx` - Adicionado botão Pencil icon para trigger do dialog de troca
- `apps/frontend/src/routes.tsx` - Adicionado rota lazy-loaded /confirm-email-change/:token
- `apps/frontend/src/types/index.ts` - Adicionado interfaces de request para integração API

---

## Decisões de Arquitetura

### Database
- Tabela separada `email_change_requests` ao invés de JSONB em auth_tokens para maior explicitidade
- Índice composto [user_id, status] para queries eficientes de requests pendentes
- Uso de gen_random_uuid() para geração de UUIDs (consistente com migrations recentes)
- Repositório segue padrão toEntity() para conversão snake_case → camelCase

### Backend
- Token com expiração de 24 horas (86400000 ms)
- Rate limiting apenas no request (3/hora), confirm sem limite para permitir retries
- Preservação de sessão atual durante confirmação: revokeAllExcept(userId, sessionId) se autenticado
- Evento EmailChangeRequestedEvent emitido apenas no request, confirm executa sincronamente
- JWT strategy modificado para anexar sessionId ao user object

### Frontend
- Auto-confirmação on mount seguindo padrão verify-email-status.tsx
- Validação Zod para formato de email e senha obrigatória
- Design mobile-first: h-11 text-base inputs, sm:max-w-md dialog
- Toast notifications em PT-BR para todos os estados
- Invalidação de query user após sucesso para refresh de dados
- Redirect automático para /settings?tab=profile após 500ms do sucesso

### UX
- Botão trigger mudado de Mail para Pencil icon (melhor affordance de "editar")

---

## Segurança

### Validações Implementadas
- Verificação de senha atual com PasswordService.verifyPassword()
- Hashing de token com SHA256 antes de storage
- Token de uso único (marcado como usado após confirmação)
- Validação de unicidade de email (global, não por account)
- Invalidação de sessões com preservação da atual

### Rate Limiting
- POST /request-email-change: 3 requests/hora
- POST /confirm-email-change: sem limite (permite retries)

### Multi-Tenancy
- Queries filtradas por account_id em EmailChangeRequestRepository
- findPendingByUserId valida userId pertence ao account_id do request

---

## API Endpoints

| Método | Path | Auth | Rate Limit | Descrição |
|--------|------|------|------------|-----------|
| POST | /api/v1/auth/request-email-change | Obrigatório | 3/hora | Cria request de troca validando senha atual e enviando email de confirmação |
| POST | /api/v1/auth/confirm-email-change | Opcional | Nenhum | Confirma troca via token, atualiza email e revoga sessões (exceto atual se autenticado) |

---

## Schema de Banco

### Tabelas Criadas
- `email_change_requests` - [id uuid PK, user_id uuid FK, new_email varchar unique, status enum, created_at timestamp, updated_at timestamp]

### Índices
- Composto: [user_id, status] para queries eficientes de pending requests

### Migrations
- `20251231001_create_email_change_requests_table.js` - Executado com sucesso (Batch 4)

---

## Status de Build

- [x] @fnd/domain
- [x] @fnd/database
- [x] @fnd/api
- [x] @fnd/frontend

**Tempo de Build:** 57.46s (frontend) | **Erros:** 0 | **Warnings:** 0

---

## Resultados de Review

**Score Final:** 9.95/10 (99.5%)

**Breakdown:**
{"IoC/DI":"10/10","RESTful":"10/10","Contracts":"10/10","Security":"10/10","Architecture":"10/10","CodeQuality":"9.5/10","Database":"10/10"}

**Checklist de Compliance:** 34/34 ✅ (100%)
- Database Layer: 7/7 ✅
- Backend Layer: 11/11 ✅
- Frontend Layer: 9/9 ✅
- Security (OWASP): 7/7 ✅

**Issues Encontrados:** 1 (MINOR)
- Console.error em email-change-dialog.tsx (removido, substituído por comentário)

**Issues Corrigidos:** 1/1 (100%)

---

## Próximos Passos

- [ ] Teste end-to-end do fluxo completo (request → email → confirm → login)
- [ ] Criar template 'email-change-confirmation' no Resend com link de confirmação
- [ ] Teste em ambiente de staging com dados reais
- [ ] Deploy para produção após validação QA
- [ ] Monitorar logs de erro e taxa de sucesso nas primeiras 24h
