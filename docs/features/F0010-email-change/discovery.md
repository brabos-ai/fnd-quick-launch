# Discovery: Email Change

Analise tecnica do codebase para implementacao do fluxo de alteracao de e-mail.

---

## Contexto Tecnico

### Stack Relevante

- **Backend:** NestJS 10 + CQRS (CommandBus, EventBus)
- **Auth:** JWT + Passport, tokens armazenados em `auth_tokens`
- **Email:** Resend 2.0 via `ResendEmailService`
- **Frontend:** React 18 + Zustand + TanStack Query

### Padroes Identificados

- **Token-based verification:** Usado em `ForgotPasswordCommand` - gerar token, hash SHA256, emitir evento
- **Email templates:** Centralizados em `ResendEmailService.sendEmailTemplate()`
- **Rate limiting:** Via `RateLimitGuard` + decorator `@RateLimit()`
- **Session management:** `SessionRepository.revokeAllByUserId()` ja existe

---

## Analise do Codebase

### Arquivos Relacionados

- `apps/backend/src/api/modules/auth/auth.controller.ts` - Controller principal de auth
- `apps/backend/src/api/modules/auth/commands/ForgotPasswordCommand.ts` - Padrao a seguir
- `apps/backend/src/api/modules/auth/services/password.service.ts` - `generateRandomToken()`, `hashToken()`
- `apps/backend/src/shared/services/resend-email.service.ts` - Templates de email
- `libs/domain/src/entities/AuthToken.ts` - Entity de token (adicionar tipo)
- `libs/app-database/src/repositories/AuthTokenRepository.ts` - Repository de tokens
- `apps/frontend/src/components/features/settings/profile-tab.tsx` - UI de perfil (modificar)

### Features Similares

- **Password Reset:** `ForgotPasswordCommand` + `ResetPasswordCommand` - mesmo padrao de token
- **Email Verification:** `ResendVerificationCommand` + `VerifyEmailCommand` - similar mas para signup
- **Update Profile:** `UpdateProfileCommand` - endpoint existente a estender

---

## Mapeamento de Arquivos

### Criar

| Arquivo | Proposito |
|---------|-----------|
| `apps/backend/src/api/modules/auth/commands/RequestEmailChangeCommand.ts` | Solicitar troca de email |
| `apps/backend/src/api/modules/auth/commands/ConfirmEmailChangeCommand.ts` | Confirmar troca via token |
| `apps/backend/src/api/modules/auth/events/EmailChangeRequestedEvent.ts` | Evento para enviar email de confirmacao |
| `apps/backend/src/api/modules/auth/events/EmailChangedEvent.ts` | Evento para notificar email antigo |
| `apps/backend/src/api/modules/auth/events/handlers/EmailChangeRequestedEventHandler.ts` | Handler que envia email de confirmacao |
| `apps/backend/src/api/modules/auth/events/handlers/EmailChangedEventHandler.ts` | Handler que notifica email antigo |
| `apps/backend/src/api/modules/auth/dtos/RequestEmailChangeDto.ts` | DTO de entrada (newEmail, password) |
| `apps/backend/src/api/modules/auth/dtos/ConfirmEmailChangeDto.ts` | DTO de entrada (token) |
| `apps/frontend/src/pages/confirm-email-change.tsx` | Pagina de confirmacao |
| `apps/frontend/src/components/features/settings/email-change-dialog.tsx` | Dialog para solicitar troca |

### Modificar

| Arquivo | Modificacao |
|---------|-------------|
| `libs/domain/src/entities/AuthToken.ts:4` | Adicionar `'email_change'` ao union type |
| `libs/app-database/src/repositories/AuthTokenRepository.ts:28` | Adicionar `'email_change'` ao parametro type |
| `apps/backend/src/api/modules/auth/auth.controller.ts` | Adicionar endpoints `request-email-change` e `confirm-email-change` |
| `apps/backend/src/api/modules/auth/commands/index.ts` | Exportar novos commands |
| `apps/backend/src/api/modules/auth/dtos/index.ts` | Exportar novos DTOs |
| `apps/backend/src/api/modules/auth/events/index.ts` | Exportar novos eventos |
| `apps/backend/src/api/modules/auth/events/handlers/index.ts` | Registrar novos handlers |
| `apps/backend/src/api/modules/auth/auth.module.ts` | Registrar handlers no providers |
| `apps/backend/src/shared/services/resend-email.service.ts` | Adicionar templates `email-change-request` e `email-change-notification` |
| `apps/frontend/src/components/features/settings/profile-tab.tsx` | Adicionar botao de editar email |
| `apps/frontend/src/App.tsx` | Adicionar rota `/confirm-email-change` |

---

## Dependencias

### Internas

- `@fnd/domain` - AuthToken entity (modificar type)
- `@fnd/database` - AuthTokenRepository, UserRepository, SessionRepository
- `@fnd/backend` - ICommand, ICommandHandler, IEmailService

### Externas

- Nenhuma nova dependencia necessaria

---

## Premissas Tecnicas

- **[P1] Campo `type` em `auth_tokens` e string no banco:** Ja e flexivel, so entity restringe
  - Impacto se incorreta: Precisaria de migration para alterar coluna

- **[P2] `SessionRepository.revokeAllByUserId()` ja existe:** Confirmado na analise
  - Impacto se incorreta: Precisaria implementar metodo de revogacao

- **[P3] Novo email deve ser armazenado temporariamente:** Usar campo em `auth_tokens` ou metadata
  - Impacto se incorreta: Perda de informacao do novo email apos geracao do token

---

## Riscos Identificados

- **[R1] Armazenar novo email:** auth_tokens nao tem campo para dados adicionais
  - Mitigacao: Adicionar campo `metadata` JSON ou criar tabela `email_change_requests`
  - Decisao: Usar abordagem simples - armazenar newEmail em coluna adicional ou usar tabela separada leve

---

## Resumo para Planejamento

Feature de complexidade media que segue padroes ja estabelecidos no codebase (ForgotPassword, EmailVerification). A infraestrutura de tokens, envio de email e rate limiting ja existe e pode ser reutilizada.

Ponto de atencao principal: onde armazenar o `newEmail` temporariamente entre a solicitacao e a confirmacao. Opcoes: (1) adicionar campo `metadata` na tabela `auth_tokens`, (2) criar tabela simples `email_change_requests`. Recomendacao: opcao 2 por ser mais explicita e evitar poluir tabela generica.

Estimativa de arquivos: ~10 novos, ~10 modificacoes. Frontend mais simples (dialog + pagina de confirmacao). Backend segue padrao CQRS ja dominado no projeto.
