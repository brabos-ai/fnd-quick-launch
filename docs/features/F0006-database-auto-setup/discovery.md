# Discovery: Database Auto-Setup

## Summary
{"patterns":["Node script com pg client","npm scripts chaining"],"files_create":1,"files_modify":2,"deps":["pg","dotenv"],"complexity":"low","risks":["permissões CREATEDB em ambientes restritos"]}

---

## Contexto Técnico

### Stack Relevante
- **Backend:** Node.js, pg (node-postgres), dotenv
- **ORM:** Knex para migrations (já configurado)
- **Infra:** PostgreSQL 15 (local via Docker ou remoto)

### Padrões Identificados
- **Knex migrations:** `libs/database/migrations/` - padrão estabelecido
- **Scripts npm:** Root delega para `libs/database` via `cd && npx`
- **Conexão:** `DATABASE_URL` com suporte a SSL automático

---

## Análise do Codebase

### Arquivos Relacionados
- `libs/database/knexfile.js` - config de conexão, fallback URL hardcoded
- `libs/database/package.json` - scripts migrate/seed existentes
- `libs/database/.env.example` - template com DATABASE_URL
- `package.json` (root) - scripts que delegam para libs/database

### Features Similares
- **Knex migrations:** Padrão de execução via npm scripts - `libs/database/`

---

## Mapeamento de Arquivos

### Criar
- `libs/database/scripts/setup-database.js` - script Node para verificar/criar DB

### Modificar
- `libs/database/package.json` - adicionar script `db:setup`, modificar `migrate`
- `package.json` (root) - adicionar script `setup`

---

## Prerequisites Analysis

### Dados/Modelos Necessários
| Requisito | Prerequisite | Existe? | Ação |
|-----------|--------------|---------|------|
| RF01-RF02 | Acesso ao PostgreSQL | ✅ | Via DATABASE_URL |
| RF05 | .env.example | ✅ | Já existe |

### Fluxos Dependentes
| Requisito | Fluxo Necessário | Existe? | Ação |
|-----------|------------------|---------|------|
| RF03 | npm run migrate | ✅ | Modificar para chamar setup |
| RF04 | npm run setup (root) | ❌ | Criar |

### Integrações
| Requisito | Integração | Existe? | Ação |
|-----------|------------|---------|------|
| RF01-RF02 | pg client | ✅ | Já é dependência |

### Dados Existentes
| Requisito | Dados Necessários | Populados? | Ação |
|-----------|-------------------|------------|------|
| N/A | N/A | N/A | N/A |

---

## Delivery Completeness

| Validado no Questionário | Camada Necessária | No Escopo? | Usuário consegue usar? |
|--------------------------|-------------------|------------|------------------------|
| Script criação DB | Backend (Node) | ✅ | ✅ |
| npm run migrate auto-cria | Backend (scripts) | ✅ | ✅ |
| npm run setup | Backend (scripts) | ✅ | ✅ |

**Resultado:** ✅ Feature utilizável - aluno executa `npm run setup` e tem ambiente pronto.

---

## Dependências

### Internas
- `libs/database/knexfile.js` - reutilizar parsing de DATABASE_URL

### Externas
- `pg@^8.11.0` - já instalado, usar para conexão raw
- `dotenv@^16.4.5` - já instalado, carregar .env

---

## Premissas Técnicas

- **Usuário tem permissão CREATEDB:** Se não tiver, script falha com mensagem clara
- **DATABASE_URL segue formato PostgreSQL:** `postgresql://user:pass@host:port/dbname`
- **pg disponível globalmente no projeto:** Já é dependência

---

## Riscos Identificados

- **Permissão CREATEDB:** Em alguns ambientes (Railway free tier), usuário pode não ter permissão. Mitigação: mensagem clara orientando criar DB manualmente
- **Variações de DATABASE_URL:** Diferentes formatos de URL. Mitigação: usar `pg-connection-string` já instalado

---

## Resumo para Planejamento

Complexidade baixa. Script Node único que:
1. Carrega `.env` (copia de `.env.example` se necessário)
2. Parseia `DATABASE_URL`
3. Conecta ao DB `postgres` default
4. Executa `CREATE DATABASE IF NOT EXISTS`
5. Desconecta

Modificações em package.json são triviais (adicionar/modificar scripts).

---

## Updates
[{"date":"2026-01-23","change":"Criação inicial após análise do codebase"}]

---

## Metadata
{"updated":"2026-01-23","sessions":1,"by":"feature-discovery"}
