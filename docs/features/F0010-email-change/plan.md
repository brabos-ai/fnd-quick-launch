# F0010 - Email Change - Plano Técnico

**Feature:** Alteração Segura de Email
**Status:** Planejamento
**Criado:** 2025-12-31

---

## Visão Geral

Implementar fluxo seguro de alteração de email em 2 etapas:
1. Usuário solicita troca informando novo email + senha atual
2. Confirma clicando em link enviado para o novo endereço

**Padrão de referência:** ForgotPassword (Command → Event → Handler)

---

## Decisões Técnicas

### 1. Armazenamento Temporário
- **Criar tabela separada** `email_change_requests` (mais explícito que JSONB em `auth_tokens`)
- Associar com `user_id` + `new_email` + `status`

### 2. Infraestrutura de Tokens
- **Reutilizar** `auth_tokens` table para validação (adicionar tipo `email_change`)
- Token expira em 24h
- Token de uso único (marcado como `used_at` após confirmação)

### 3. Segurança
- **Exigir senha atual** na solicitação (protege sessões comprometidas)
- **Rate limit:** 3 solicitações/hora via `@RateLimit()`
- **Invalidar sessões** ao confirmar (exceto sessão atual via req.sessionId)
- **Novo email nasce verificado:** `emailVerified: true`

### 4. Regras de Negócio
- Novo email já em uso → `ConflictException` "Email já cadastrado"
- Novo email igual ao atual → `BadRequestException`
- Senha incorreta → `UnauthorizedException`
- Token expirado/usado → `BadRequestException`
- Nova solicitação com pendência → cancelar anterior (`status: 'canceled'`)

---

## Camada de Database

### Arquivos a Criar/Modificar

| Tipo | Arquivo | Ação |
|------|---------|------|
| **Entity** | `libs/domain/src/entities/EmailChangeRequest.ts` | Criar |
| **Entity** | `libs/domain/src/entities/AuthToken.ts` | Modificar (adicionar 'email_change' ao union type) |
| **Enum** | `libs/domain/src/enums/EmailChangeStatus.ts` | Criar |
| **Migration** | `libs/app-database/migrations/YYYYMMDDNNN_create_email_change_requests_table.js` | Criar |
| **Kysely Type** | `libs/app-database/src/types/EmailChangeRequestsTable.ts` | Criar |
| **Kysely Type** | `libs/app-database/src/types/Database.ts` | Modificar (adicionar `email_change_requests`) |
| **Interface** | `libs/app-database/src/interfaces/IEmailChangeRequestRepository.ts` | Criar |
| **Repository** | `libs/app-database/src/repositories/EmailChangeRequestRepository.ts` | Criar |
| **Barrel** | `libs/domain/src/entities/index.ts` | Modificar (export EmailChangeRequest) |
| **Barrel** | `libs/domain/src/enums/index.ts` | Modificar (export EmailChangeStatus) |
| **Barrel** | `libs/app-database/src/interfaces/index.ts` | Modificar (export IEmailChangeRequestRepository) |
| **Barrel** | `libs/app-database/src/repositories/index.ts` | Modificar (export EmailChangeRequestRepository) |

**Total:** 7 novos arquivos, 6 modificações

### Schema

#### EmailChangeRequest Entity
```typescript
interface EmailChangeRequest {
  id: string;
  userId: string;
  newEmail: string;
  status: EmailChangeStatus; // 'pending' | 'confirmed' | 'canceled'
  createdAt: Date;
  updatedAt: Date;
}
```

#### Migration
```javascript
// Table: email_change_requests
t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
t.string('new_email').notNullable()
t.string('status').notNullable().defaultTo('pending') // pending, confirmed, canceled
t.timestamp('created_at').defaultTo(knex.fn.now())
t.timestamp('updated_at').defaultTo(knex.fn.now())
t.index('user_id')
t.index(['user_id', 'status'])
```

#### Repository Methods
```typescript
interface IEmailChangeRequestRepository {
  findById(id: string): Promise<EmailChangeRequest | null>;
  findPendingByUserId(userId: string): Promise<EmailChangeRequest | null>;
  create(data: Omit<EmailChangeRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailChangeRequest>;
  update(id: string, data: Partial<EmailChangeRequest>): Promise<EmailChangeRequest>;
  cancelPendingByUserId(userId: string): Promise<void>;
}
```

---

## Camada de Backend

### Arquivos a Criar/Modificar

| Tipo | Arquivo | Ação |
|------|---------|------|
| **DTO** | `apps/backend/src/api/modules/auth/dtos/RequestEmailChangeDto.ts` | Criar |
| **DTO** | `apps/backend/src/api/modules/auth/dtos/ConfirmEmailChangeDto.ts` | Criar |
| **DTO** | `apps/backend/src/api/modules/auth/dtos/index.ts` | Modificar (export novos DTOs) |
| **Command** | `apps/backend/src/api/modules/auth/commands/RequestEmailChangeCommand.ts` | Criar |
| **Command** | `apps/backend/src/api/modules/auth/commands/ConfirmEmailChangeCommand.ts` | Criar |
| **Command** | `apps/backend/src/api/modules/auth/commands/index.ts` | Modificar (export novos Commands) |
| **Event** | `apps/backend/src/api/modules/auth/events/EmailChangeRequestedEvent.ts` | Criar |
| **Event Handler** | `apps/backend/src/api/modules/auth/events/handlers/EmailChangeRequestedHandler.ts` | Criar |
| **Controller** | `apps/backend/src/api/modules/auth/auth.controller.ts` | Modificar (adicionar 2 endpoints) |
| **Module** | `apps/backend/src/api/modules/auth/auth.module.ts` | Modificar (registrar handlers + repositories) |
| **Shared Module** | `apps/backend/src/shared/shared.module.ts` | Modificar (registrar EmailChangeRequestRepository) |

**Total:** 8 novos arquivos, 5 modificações

### DTOs

```typescript
// RequestEmailChangeDto
class RequestEmailChangeDto {
  @IsEmail() newEmail: string;
  @IsString() currentPassword: string;
}

// ConfirmEmailChangeDto
class ConfirmEmailChangeDto {
  @IsString() token: string;
}
```

### Commands

#### RequestEmailChangeCommand
```typescript
class RequestEmailChangeCommand {
  constructor(
    public readonly userId: string,
    public readonly newEmail: string,
    public readonly currentPassword: string,
  ) {}
}
```

**Handler responsabilidades:**
1. Validar senha atual (via `PasswordService.comparePassword()`)
2. Verificar se `newEmail !== currentEmail`
3. Verificar se `newEmail` já existe (via `UserRepository.findByEmail()`)
4. Cancelar solicitação pendente (`EmailChangeRequestRepository.cancelPendingByUserId()`)
5. Criar novo request (`EmailChangeRequestRepository.create()`)
6. Gerar token (`PasswordService.generateRandomToken()` + `hashToken()`)
7. Salvar token em `auth_tokens` com type `email_change`
8. Emitir `EmailChangeRequestedEvent`

#### ConfirmEmailChangeCommand
```typescript
class ConfirmEmailChangeCommand {
  constructor(
    public readonly token: string,
    public readonly sessionId: string, // para preservar sessão atual
  ) {}
}
```

**Handler responsabilidades:**
1. Validar token em `AuthTokenRepository.findByTokenHash(hash, 'email_change')`
2. Buscar request pendente (`EmailChangeRequestRepository.findPendingByUserId(userId)`)
3. Atualizar email no User (`UserRepository.update(userId, { email: newEmail, emailVerified: true })`)
4. Marcar request como confirmado (`EmailChangeRequestRepository.update(requestId, { status: 'confirmed' })`)
5. Marcar token como usado (`AuthTokenRepository.markAsUsed()`)
6. Invalidar sessões exceto atual (`SessionRepository` - criar método `revokeAllExcept(userId, sessionId)`)
7. **NÃO emitir eventos** (execução síncrona completa)

### Events

```typescript
class EmailChangeRequestedEvent {
  constructor(
    public readonly aggregateId: string, // userId
    public readonly payload: {
      userId: string;
      newEmail: string;
      changeToken: string; // plaintext token para email
    },
  ) {}
}
```

**Handler:** Enfileirar email com link de confirmação via `IQueueService`

### Endpoints

```typescript
// POST /auth/request-email-change
@UseGuards(JwtAuthGuard, RateLimitGuard)
@RateLimit({ limit: 3, windowSeconds: 3600 }) // 3/hora
async requestEmailChange(@Req() req, @Body() dto: RequestEmailChangeDto) {
  await commandBus.execute(
    new RequestEmailChangeCommand(req.user.id, dto.newEmail, dto.currentPassword)
  );
  return { message: 'Verification link sent to new email address.' };
}

// POST /auth/confirm-email-change
async confirmEmailChange(@Body() dto: ConfirmEmailChangeDto) {
  // sessionId pode vir do token JWT se autenticado, senão null
  const sessionId = req.user?.sessionId || null;
  await commandBus.execute(new ConfirmEmailChangeCommand(dto.token, sessionId));
  return { message: 'Email updated successfully.' };
}
```

---

## Camada de Frontend

### Arquivos a Criar/Modificar

| Tipo | Arquivo | Ação |
|------|---------|------|
| **Type** | `apps/frontend/src/types/index.ts` | Modificar (adicionar RequestEmailChangeRequest, ConfirmEmailChangeRequest) |
| **Hook** | `apps/frontend/src/hooks/use-email-change.ts` | Criar |
| **Component** | `apps/frontend/src/components/features/settings/email-change-dialog.tsx` | Criar |
| **Page** | `apps/frontend/src/pages/confirm-email-change.tsx` | Criar |
| **Component** | `apps/frontend/src/components/features/settings/profile-tab.tsx` | Modificar (adicionar botão "Alterar Email") |
| **Routes** | `apps/frontend/src/routes.tsx` | Modificar (adicionar rota `/confirm-email-change/:token`) |

**Total:** 4 novos arquivos, 3 modificações

### Types
```typescript
interface RequestEmailChangeRequest {
  newEmail: string;
  currentPassword: string;
}

interface ConfirmEmailChangeRequest {
  token: string;
}
```

### Hook
```typescript
// use-email-change.ts
export function useRequestEmailChange() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RequestEmailChangeRequest) =>
      api.post('/auth/request-email-change', data),
    onSuccess: () => {
      toast.success('Link de verificação enviado para o novo email.');
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

export function useConfirmEmailChange() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: ConfirmEmailChangeRequest) =>
      api.post('/auth/confirm-email-change', data),
    onSuccess: () => {
      toast.success('Email atualizado com sucesso!');
      navigate('/settings?tab=profile');
    },
  });
}
```

### Components

#### EmailChangeDialog
- Dialog com formulário:
  - Input: Novo email
  - Input: Senha atual (type="password")
  - Botão: "Enviar link de verificação"
- Validação via Zod (email + min 6 chars password)
- Chama `useRequestEmailChange()`

#### ProfileTab (modificação)
- Adicionar botão "Alterar Email" ao lado do campo email atual
- Abrir `EmailChangeDialog` ao clicar

### Pages

#### ConfirmEmailChangePage
- Recebe token via `useParams()`
- Auto-executa `useConfirmEmailChange()` no mount
- Exibe loading spinner durante confirmação
- Redireciona para `/settings?tab=profile` após sucesso
- Exibe erro se token inválido/expirado

---

## Ordem de Implementação

### 1. Database Layer (fundação)
1. Criar `EmailChangeStatus` enum
2. Criar `EmailChangeRequest` entity
3. Modificar `AuthToken` entity (adicionar 'email_change')
4. Criar migration `create_email_change_requests_table`
5. Criar `EmailChangeRequestsTable` Kysely type
6. Modificar `Database.ts` (adicionar tabela)
7. Criar `IEmailChangeRequestRepository`
8. Criar `EmailChangeRequestRepository`
9. Atualizar barrel exports
10. **Rodar:** `npm run migrate:latest` + `npm run build -w @fnd/database -w @fnd/domain`

### 2. Backend Layer (lógica de negócio)
1. Criar DTOs (Request + Confirm)
2. Criar `RequestEmailChangeCommand` + Handler
3. Criar `EmailChangeRequestedEvent` + Handler
4. Criar `ConfirmEmailChangeCommand` + Handler
5. Adicionar endpoints no `AuthController`
6. Registrar handlers + repositories no `AuthModule` + `SharedModule`
7. **Criar método** `SessionRepository.revokeAllExcept(userId, sessionId)` (se necessário)
8. **Testar:** Endpoints via Postman/Insomnia

### 3. Frontend Layer (interface)
1. Criar types (espelhar DTOs)
2. Criar hook `use-email-change`
3. Criar `EmailChangeDialog`
4. Modificar `ProfileTab` (adicionar botão)
5. Criar `ConfirmEmailChangePage`
6. Adicionar rota no `routes.tsx`
7. **Testar:** Fluxo completo end-to-end

---

## Checklist de Verificação

### Database
- [ ] Enum `EmailChangeStatus` criado e exportado
- [ ] Entity `EmailChangeRequest` criada e exportada
- [ ] `AuthToken.type` inclui `'email_change'`
- [ ] Migration executada sem erros
- [ ] Repository filtra por `user_id` (multi-tenancy)
- [ ] Método `cancelPendingByUserId()` funciona
- [ ] Build de `@fnd/database` e `@fnd/domain` passa

### Backend
- [ ] DTOs validam corretamente (email, password)
- [ ] `RequestEmailChangeCommand`: valida senha atual
- [ ] `RequestEmailChangeCommand`: rejeita email duplicado/igual
- [ ] `RequestEmailChangeCommand`: cancela solicitação anterior
- [ ] `RequestEmailChangeCommand`: emite evento
- [ ] `ConfirmEmailChangeCommand`: valida token
- [ ] `ConfirmEmailChangeCommand`: atualiza email + `emailVerified: true`
- [ ] `ConfirmEmailChangeCommand`: invalida sessões exceto atual
- [ ] Rate limit de 3/hora aplicado
- [ ] Endpoints retornam status corretos (200, 400, 401, 409)
- [ ] Event handler enfileira email

### Frontend
- [ ] Types espelham DTOs corretamente
- [ ] Hook `useRequestEmailChange` invalida queries
- [ ] Dialog valida formulário (Zod)
- [ ] Dialog exibe erros do backend (toast)
- [ ] Botão "Alterar Email" visível no ProfileTab
- [ ] Página de confirmação auto-executa no mount
- [ ] Página exibe loading/erro/sucesso
- [ ] Rota `/confirm-email-change/:token` registrada
- [ ] Redirecionamento após sucesso funciona

### Segurança
- [ ] Senha atual exigida na solicitação
- [ ] Token expira em 24h
- [ ] Token de uso único (marcado `used_at`)
- [ ] Sessões invalidadas (exceto atual)
- [ ] Rate limit ativo (3/hora)
- [ ] Novo email nasce `emailVerified: true`
- [ ] Multi-tenancy respeitado (queries filtram por `user_id`)

### Integração
- [ ] Fluxo completo testado end-to-end
- [ ] Email de confirmação enviado e recebido
- [ ] Link no email funciona
- [ ] Email atualizado no banco
- [ ] Usuário consegue fazer login com novo email
- [ ] Sessões antigas invalidadas
- [ ] Erro tratado se email já em uso
- [ ] Erro tratado se senha incorreta
- [ ] Erro tratado se token expirado

---

## Estimativa de Esforço

| Camada | Arquivos | Complexidade | Tempo |
|--------|----------|--------------|-------|
| Database | 13 arquivos | Baixa | 1h |
| Backend | 13 arquivos | Média | 2.5h |
| Frontend | 7 arquivos | Baixa | 1.5h |
| Testes + Ajustes | - | - | 1h |
| **TOTAL** | **33 arquivos** | - | **6h** |

---

## Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Invalidar sessão atual por acidente | Alto | Passar `sessionId` no ConfirmCommand e excluir do revoke |
| Email não chegar | Alto | Validar integração com Resend, adicionar logs |
| Race condition (múltiplas solicitações) | Médio | Rate limit + cancelar pendentes antes de criar nova |
| Token vazado | Médio | Expiração 24h + uso único + hash SHA256 |

---

## Dependências Externas

- **PasswordService:** Métodos `generateRandomToken()`, `hashToken()`, `comparePassword()` (já existem)
- **SessionRepository:** Método `revokeAllExcept()` (CRIAR se não existir, ou usar `revokeAllByUserId()` + filtro manual)
- **IQueueService:** Para enfileirar email (já existe)
- **Resend:** Para enviar email (já configurado)

---

## Notas de Implementação

1. **SessionId na confirmação:** Se usuário não estiver autenticado ao clicar no link, `sessionId` será `null` e todas as sessões serão revogadas. Considerar adicionar claim `sessionId` no JWT ou extrair do refresh token.

2. **Email já em uso cross-tenant:** Validação deve ser global, não apenas por `account_id`.

3. **Logs de auditoria:** Considerar criar evento `EmailChangedEvent` para auditoria após confirmação (opcional, fora do escopo inicial).

4. **Cancelamento manual:** Não implementado nesta versão. Usuário pode criar nova solicitação que cancela a anterior automaticamente.

5. **Frontend: sessão atual:** Se usuário estiver autenticado ao confirmar, preservar token JWT atual (recarregar `auth-store` após confirmação).
