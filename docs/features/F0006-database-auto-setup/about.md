# Feature: Database Auto-Setup

## Summary
{"status":"implemented","scope":["script criação auto DB","hook no migrate","npm run setup","verificação conexão","cópia .env auto"],"decisions":["Script Node separado","Hook no migrate existente","Suporte local+remoto"],"blockers":[],"next":"testing"}

---

## Objetivo

**Problema:** Setup de banco requer `createdb fnd_dev` manual antes das migrations, criando barreira para onboarding de alunos

**Solução:** Scripts que detectam se banco existe, criam automaticamente se necessário, e rodam migrations

**Valor:** Aluno executa um comando e tem ambiente pronto, sem conhecimento prévio de PostgreSQL

---

## Requisitos

### Funcionais
- **[RF01]:** Script verifica se database existe conectando ao PostgreSQL default (`postgres`)
- **[RF02]:** Script cria database automaticamente se não existir via `CREATE DATABASE`
- **[RF03]:** `npm run migrate` auto-cria banco antes de rodar migrations (hook)
- **[RF04]:** `npm run setup` no root executa: cópia .env + criação DB + migrations
- **[RF05]:** Script copia `.env.example` para `.env` se `.env` não existir
- **[RF06]:** Script verifica conexão com Postgres antes de tentar criar DB

### Não-Funcionais
- **[RNF01]:** Funciona com Postgres local (Docker) e remoto (Railway, etc)
- **[RNF02]:** Mensagens de erro claras e acionáveis em português

---

## Regras de Negócio

- **[RN01]:** Se `.env` existe → não sobrescrever
- **[RN02]:** Se DB já existe → pular criação, ir direto para migrations
- **[RN03]:** Se Postgres inacessível → erro claro antes de tentar criar DB
- **[RN04]:** DATABASE_URL inválida → erro com formato esperado

---

## Escopo

### Camadas Obrigatórias

| Validado com Usuário | Camada | Incluída? |
|----------------------|--------|-----------|
| Script Node para criar DB | Backend (libs/database) | ✅ |
| Hook no migrate | Backend (scripts) | ✅ |
| npm run setup no root | Backend (root package.json) | ✅ |

### Incluído
- Script Node `setup-database.js` em `libs/database/scripts/`
- Modificação do script `migrate` para chamar setup primeiro
- Novo script `setup` no root package.json
- Cópia automática de `.env.example`
- Verificação de conexão Postgres (local ou remoto)
- Mensagens de erro claras

### Excluído
- UI/Frontend - **Impacta uso?** Não (scripts CLI)
- Criação automática de usuário PostgreSQL - **Impacta uso?** Não (usa usuário existente)
- Backup/restore de banco - **Impacta uso?** Não (fora do escopo de setup)

---

## Decisões

| Decisão | Razão | Alternativa descartada |
|---------|-------|------------------------|
| Script Node separado | Clareza, manutenibilidade, cross-platform | Modificar knexfile.js (side effects) |
| Hook no migrate existente | Menos comandos para aluno memorizar | Script separado db:setup (mais um comando) |
| Conectar ao DB `postgres` para criar target | Padrão PostgreSQL, funciona em qualquer ambiente | Try-catch migrations (menos elegante) |
| Verificação genérica de conexão | Suporta local E remoto (Railway) | Verificar Docker especificamente |

---

## Edge Cases

- **Postgres offline:** Mensagem "❌ Cannot connect to PostgreSQL. Is it running?"
- **Usuário sem permissão CREATEDB:** Mensagem "❌ User lacks CREATEDB permission"
- **DATABASE_URL malformada:** Mensagem "❌ Invalid DATABASE_URL format"
- **DB já existe:** Log informativo, prosseguir com migrations
- **Railway/remoto:** Funciona igual, conexão via DATABASE_URL

---

## Critérios de Aceite

- [x] `npm run setup` no root cria DB e roda migrations com sucesso
- [x] `npm run migrate` cria DB automaticamente se não existir
- [x] `.env` é copiado de `.env.example` se não existir
- [x] Erro claro quando Postgres não está acessível
- [x] Funciona com DATABASE_URL local (localhost)
- [x] Funciona com DATABASE_URL remoto (Railway)
- [x] Idempotente: rodar múltiplas vezes não causa erro

---

## Spec

{"feature":"F0006-database-auto-setup","type":"enhancement","priority":"high","users":["developers","students"],"deps":["knex","pg"]}

---

## Updates
[{"date":"2026-01-23","change":"Criação inicial após discovery com usuário"},{"date":"2026-01-23","change":"Implementação completa: script Node setup-database.js, hooks no migrate, npm run setup"}]

---

## Metadata
{"updated":"2026-01-23","sessions":1,"by":"feature-discovery"}
