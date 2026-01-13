# FND Template Backend

Backend da aplicação FND Template - Sistema de gestão para profissionais de saúde.

## Estrutura

```
src/
├── api/           # API REST (BFF)
│   ├── modules/   # Módulos do NestJS
│   ├── app.module.ts
│   └── main.ts
├── workers/       # Processamento assíncrono
│   ├── email.worker.ts
│   ├── worker.module.ts
│   └── main.ts
├── shared/        # Código compartilhado
│   └── services/  # Implementações de infraestrutura
└── index.ts       # Entry point
```

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia API + Workers (padrão)
npm run dev:api      # Inicia apenas a API (debug)
npm run dev:workers  # Inicia apenas os Workers (debug)

# Produção
npm run build        # Compila o projeto
npm run start        # Inicia API + Workers
npm run start:api    # Inicia apenas a API
npm run start:workers # Inicia apenas os Workers
```

## Configuração

1. Copie `.env.example` para `.env`
2. Configure as variáveis de ambiente
3. Inicie os serviços com Docker Compose

## API Endpoints

### Autenticação (v1)

- `POST /api/v1/auth/signup` - Registro de usuário
- `POST /api/v1/auth/signin` - Login
- `POST /api/v1/auth/confirm-email` - Confirmar email

### Health Check

- `GET /api/v1` - Status da aplicação

## Arquitetura

- **Modo Híbrido**: API + Workers no mesmo processo (padrão)
- **API**: NestJS com versionamento (/api/v1/)
- **Workers**: Processamento assíncrono com BullMQ + Redis
- **Filas**: Nomes centralizados em constantes tipadas
- **Logs**: Winston com estrutura padronizada
- **Email**: Resend com templates
- **Auth**: JWT com Passport.js

## Constantes de Filas

```typescript
import { QUEUE_NAMES } from '../shared/constants';

// Uso correto
await jobQueue.add(QUEUE_NAMES.SEND_EMAIL, data);
await jobQueue.process(QUEUE_NAMES.SEND_EMAIL_TEMPLATE, handler);
```