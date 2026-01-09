# @fnd/contracts

**Contratos e Interfaces de Serviços**

Esta biblioteca contém todas as **interfaces** (contratos) que definem os comportamentos esperados dos serviços da aplicação, seguindo os princípios de **Inversão de Dependência** (SOLID).

---

## Propósito

Centralizar as definições de contratos para:
- **Desacoplar** implementações concretas das suas abstrações
- **Facilitar testes** com mocks e stubs
- **Permitir múltiplas implementações** da mesma interface
- **Documentar** os comportamentos esperados dos serviços

---

## Estrutura

```
src/
├── billing/          # Contratos de billing (IPlanService)
├── cqrs/             # Contratos CQRS (ICommand, IEvent, IQuery, etc)
├── features/         # Contratos de feature flags (IFeatureFlags)
├── messaging/        # Contratos de mensageria (IEventBroker, IJobQueue, etc)
├── payment/          # Contratos de pagamento (IPaymentGateway)
├── scheduling/       # Contratos de agendamento (IScheduler)
├── services/         # Contratos de serviços gerais (IEmailService, ILoggerService, etc)
├── webhooks/         # Contratos de webhooks (IWebhookService)
└── index.ts          # Barrel export
```

---

## Regras

### ✅ PODE conter

- **Interfaces de serviços** (`IEmailService`, `ILoggerService`, etc)
- **Interfaces de gateways** (`IPaymentGateway`, `IEventBroker`, etc)
- **Interfaces CQRS** (`ICommand`, `IEvent`, `IQuery`, `ICommandHandler`, etc)
- **Types auxiliares** específicos dos contratos (ex: `JobOptions`, `QueueOptions`)
- **Enums** relacionados exclusivamente aos contratos (ex: `QueuePriority`)

### ❌ NÃO PODE conter

- **Implementações concretas** de serviços (vão em `apps/server/src/shared/services`)
- **Entidades de domínio** (vão em `@fnd/domain`)
- **Regras de negócio** (vão em `@fnd/domain`)
- **Lógica de aplicação** (fica em `apps/server/src/api`)
- **Código específico de frameworks** (NestJS, Express, etc)
- **Dependências externas** além de `@fnd/domain` (se necessário)

---

## Convenções

### Nomenclatura
- **Interfaces de serviços:** Prefixo `I` + nome descritivo + sufixo `Service`
  - ✅ `IEmailService`, `ILoggerService`, `ICacheService`
  - ❌ `EmailService`, `Logger`, `Cache`

- **Interfaces de gateways:** Prefixo `I` + nome descritivo + sufixo do tipo
  - ✅ `IPaymentGateway`, `IEventBroker`, `IJobQueue`
  - ❌ `PaymentService`, `EventService`

- **Interfaces CQRS:** Prefixo `I` + padrão CQRS
  - ✅ `ICommand`, `ICommandHandler`, `IEvent`, `IQuery`
  - ❌ `Command`, `Handler`

### Organização
- **1 interface por arquivo** (princípio de responsabilidade única)
- **Barrel exports** em `index.ts` para facilitar imports
- **Agrupar por domínio funcional** (billing, messaging, services, etc)

---

## Dependências

### Permitidas
- `@fnd/domain` - Para usar entidades de domínio em assinaturas de métodos

### Proibidas
- Qualquer outra dependência externa
- Importar de `apps/*`
- Importar implementações concretas

---

## Exemplos

### ✅ Correto

```typescript
// src/services/IEmailService.ts
export interface IEmailService {
  send(to: string, subject: string, body: string): Promise<void>;
  sendTemplate(templateId: string, to: string, data: Record<string, any>): Promise<void>;
}
```

```typescript
// src/billing/IPlanService.ts
import { Plan, PlanFeatures } from '@fnd/domain';

export interface IPlanService {
  getPlanFeatures(planId: string): Promise<PlanFeatures>;
  validateFeatureAccess(accountId: string, feature: string): Promise<boolean>;
}
```

### ❌ Incorreto

```typescript
// ❌ Implementação concreta (deveria estar em apps/server/src/shared/services)
export class EmailService implements IEmailService {
  async send(to: string, subject: string, body: string): Promise<void> {
    // implementação...
  }
}
```

```typescript
// ❌ Regra de negócio (deveria estar em @fnd/domain)
export interface IUserService {
  validateEmail(email: string): boolean; // ❌ validação é regra de negócio
}
```

---

## Uso

### Em apps/server

```typescript
import { IEmailService, ILoggerService } from '@fnd/contracts';

export class NotificationService {
  constructor(
    @Inject('IEmailService') private emailService: IEmailService,
    @Inject('ILoggerService') private logger: ILoggerService,
  ) {}
}
```

### Em testes

```typescript
import { IEmailService } from '@fnd/contracts';

const mockEmailService: IEmailService = {
  send: jest.fn(),
  sendTemplate: jest.fn(),
};
```

---

## Princípios

1. **Inversão de Dependência:** Dependa de abstrações, não de implementações
2. **Interface Segregation:** Interfaces pequenas e focadas
3. **Open/Closed:** Aberto para extensão, fechado para modificação
4. **Substituição de Liskov:** Implementações devem respeitar o contrato
5. **Dependency Injection:** Sempre injetar via IoC container

---

**Package:** `@fnd/contracts`
**Usado por:** `@fnd/server`, `@fnd/database`
**Depende de:** `@fnd/domain`
