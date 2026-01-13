# @fnd/domain

**Entidades, Tipos e Regras de Domínio**

Esta biblioteca contém o **coração do negócio**: entidades de domínio, enums, tipos, regras de negócio e erros de domínio. É a camada mais pura da aplicação, **independente de frameworks e infraestrutura**.

---

## Propósito

Centralizar todo o **conhecimento do negócio** em um único lugar:
- **Modelar** as entidades centrais do sistema (User, Account, Plan, etc)
- **Definir** regras de negócio e invariantes
- **Isolar** a lógica de domínio de detalhes técnicos
- **Compartilhar** tipos entre todas as camadas da aplicação

---

## Estrutura

```
src/
├── entities/         # Entidades de domínio (User, Account, Plan, etc)
├── enums/            # Enumerações (EntityStatus, UserRole, etc)
├── types/            # Types e interfaces de domínio (PlanFeatures, etc)
├── authorization/    # Regras de autorização (PermissionMatrix, etc)
├── errors/           # Erros de domínio (DomainError, ValidationError, etc)
└── index.ts          # Barrel export
```

---

## Regras

### ✅ PODE conter

- **Entidades de domínio** (`User`, `Account`, `Plan`, `Subscription`, etc)
- **Value Objects** (objetos imutáveis que representam valores do domínio)
- **Enums de negócio** (`EntityStatus`, `UserRole`, `PlanType`, etc)
- **Types e interfaces** de domínio (`PlanFeatures`, `SubscriptionData`, etc)
- **Regras de negócio puras** (validações, cálculos, invariantes)
- **Erros de domínio** (`DomainError`, `ValidationError`, etc)
- **Constantes de negócio** (limites, configurações de regras)

### ❌ NÃO PODE conter

- **Lógica de infraestrutura** (banco de dados, HTTP, filas, etc)
- **Frameworks** (NestJS, Express, Kysely, etc)
- **Implementações de serviços** (vão em `apps/server/src/shared/services`)
- **Contratos/Interfaces** de serviços técnicos (vão em `@fnd/contracts`)
- **DTOs de API** (vão em `apps/server/src/api/modules/*/dtos`)
- **Queries ou comandos CQRS** (vão em `apps/server/src/api/modules/*/commands`)
- **Dependências externas** (sem npm packages além de tipos básicos)

---

## Convenções

### Nomenclatura
- **Entidades:** PascalCase, singular, nome do conceito de negócio
  - ✅ `User`, `Account`, `Plan`, `Subscription`
  - ❌ `UserEntity`, `AccountModel`, `users`

- **Enums:** PascalCase, descritivo
  - ✅ `EntityStatus`, `UserRole`, `PlanType`
  - ❌ `Status`, `Role`, `Type`

- **Types:** PascalCase, descritivo do propósito
  - ✅ `PlanFeatures`, `SubscriptionData`, `PermissionMatrix`
  - ❌ `Features`, `Data`, `Matrix`

### Organização
- **1 entidade por arquivo**
- **Agrupar enums relacionados** em um único arquivo quando fizer sentido
- **Barrel exports** em `index.ts` para facilitar imports
- **Sem lógica de infraestrutura** (zero imports de frameworks)

---

## Dependências

### Permitidas
- **NENHUMA dependência externa** (zero npm packages)
- Apenas tipos nativos do TypeScript

### Proibidas
- Qualquer package npm externo
- Importar de `@fnd/contracts`
- Importar de `@fnd/database`
- Importar de `apps/*`

---

## Exemplos

### ✅ Correto

```typescript
// src/entities/User.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: EntityStatus;
  emailVerified: boolean;
  accountId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

```typescript
// src/enums/EntityStatus.ts
export enum EntityStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  ARCHIVED = 'archived',
}
```

```typescript
// src/types/PlanFeatures.ts
export interface PlanFeatures {
  maxUsers: number;
  maxProjects: number;
  storage: number; // in MB
  aiCredits: number;
  customDomain: boolean;
  prioritySupport: boolean;
}
```

```typescript
// src/authorization/PermissionMatrix.ts
import { UserRole } from '../enums';

export const PermissionMatrix: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: ['*'],
  [UserRole.MEMBER]: ['read:workspace', 'write:workspace'],
  [UserRole.VIEWER]: ['read:workspace'],
};
```

### ❌ Incorreto

```typescript
// ❌ Importando framework
import { Injectable } from '@nestjs/common';

export class User {
  // ...
}
```

```typescript
// ❌ Lógica de infraestrutura
import { Kysely } from 'kysely';

export interface User {
  save(db: Kysely<any>): Promise<void>; // ❌ não deve conhecer banco
}
```

```typescript
// ❌ Importando de @fnd/contracts
import { IEmailService } from '@fnd/contracts';

export class User {
  sendEmail(service: IEmailService) {} // ❌ entidade não deve conhecer serviços
}
```

---

## Uso

### Em @fnd/database

```typescript
import { User, EntityStatus } from '@fnd/domain';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}
```

### Em @fnd/server

```typescript
import { User, UserRole, PlanFeatures } from '@fnd/domain';

export class UserService {
  async createUser(data: Partial<User>): Promise<User> {
    // implementação...
  }
}
```

### Em @fnd/contracts

```typescript
import { Plan, PlanFeatures } from '@fnd/domain';

export interface IPlanService {
  getPlanFeatures(planId: string): Promise<PlanFeatures>;
}
```

---

## Princípios

1. **Domain-Driven Design (DDD):** O domínio é o centro da aplicação
2. **Pureza:** Zero dependências externas, apenas TypeScript puro
3. **Imutabilidade:** Preferir tipos readonly quando possível
4. **Ubiquitous Language:** Usar a linguagem do negócio
5. **Independência:** Não conhecer detalhes de infraestrutura ou frameworks

---

## Modelagem de Entidades

### Interface vs Class

**Preferir interfaces** para entidades simples (data objects):
```typescript
export interface User {
  id: string;
  email: string;
  // ...
}
```

**Usar classes** quando houver:
- Regras de negócio complexas
- Métodos de validação
- Cálculos de domínio

```typescript
export class Subscription {
  constructor(
    public readonly planId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
  ) {
    if (endDate <= startDate) {
      throw new DomainError('End date must be after start date');
    }
  }

  isActive(): boolean {
    const now = new Date();
    return now >= this.startDate && now <= this.endDate;
  }
}
```

---

## Value Objects

Value Objects são objetos imutáveis que representam valores:

```typescript
// src/types/Email.ts
export class Email {
  private constructor(private readonly value: string) {}

  static create(email: string): Email {
    if (!this.isValid(email)) {
      throw new DomainError('Invalid email format');
    }
    return new Email(email.toLowerCase());
  }

  static isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  toString(): string {
    return this.value;
  }
}
```

---

## Erros de Domínio

Criar erros específicos para problemas de negócio:

```typescript
// src/errors/DomainError.ts
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

// src/errors/ValidationError.ts
export class ValidationError extends DomainError {
  constructor(field: string, message: string) {
    super(`Validation failed for ${field}: ${message}`);
    this.name = 'ValidationError';
  }
}
```

---

**Package:** `@fnd/domain`
**Usado por:** `@fnd/contracts`, `@fnd/database`, `@fnd/server`
**Depende de:** NADA (zero dependências)
