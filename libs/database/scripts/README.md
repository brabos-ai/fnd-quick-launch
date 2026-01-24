# Database Setup Script

Script Node.js que automatiza a criação do banco de dados PostgreSQL.

## Funcionalidades

- ✅ Verifica conexão com PostgreSQL
- ✅ Cria database automaticamente se não existir
- ✅ Copia `.env.example` para `.env` se necessário
- ✅ Suporta PostgreSQL local (Docker) e remoto (Railway, etc.)
- ✅ Mensagens de erro claras e acionáveis em português
- ✅ Idempotente: pode executar múltiplas vezes sem erro

## Uso

### Setup Completo (Recomendado)

No diretório root do projeto:

```bash
npm run setup
```

Este comando executa:
1. Cria database (se não existir)
2. Executa migrations
3. Executa seeds

### Apenas Criar Database

```bash
cd libs/database
npm run db:setup
```

### Migrations (com Auto-Setup)

```bash
npm run migrate
```

O comando `migrate` agora executa `db:setup` automaticamente antes das migrations.

## Variável de Ambiente

O script usa a variável `DATABASE_URL` do arquivo `.env`:

```env
DATABASE_URL=postgresql://user:password@host:port/database_name
```

### Exemplos

**Local (Docker):**
```env
DATABASE_URL=postgresql://fnd_user:fnd_pass@localhost:5432/fnd_dev
```

**Remoto (Railway):**
```env
DATABASE_URL=postgresql://postgres:password@ballast.proxy.rlwy.net:39913/railway
```

## Requisitos

- PostgreSQL rodando (local ou remoto)
- Usuário com permissão `CREATEDB`
- Variável `DATABASE_URL` configurada

## Mensagens de Erro

### ❌ Cannot connect to PostgreSQL

**Causa:** PostgreSQL não está acessível

**Solução:**
- Verifique se PostgreSQL está rodando
- Confirme host e porta na `DATABASE_URL`
- Teste conexão: `psql $DATABASE_URL`

### ❌ User lacks CREATEDB permission

**Causa:** Usuário não tem permissão para criar databases

**Solução:**
```sql
ALTER USER seu_usuario CREATEDB;
```

Ou crie o database manualmente:
```sql
CREATE DATABASE seu_database;
```

### ❌ Invalid DATABASE_URL format

**Causa:** URL mal formatada

**Solução:** Use o formato:
```
postgresql://user:password@host:port/database_name
```

## Como Funciona

1. **Cópia de .env:** Se `.env` não existe, copia de `.env.example`
2. **Parse URL:** Extrai host, porta, usuário, senha e nome do database
3. **Conexão Postgres:** Conecta ao database default `postgres`
4. **Verificação:** Checa se target database existe
5. **Criação:** Se não existe, executa `CREATE DATABASE`
6. **Idempotência:** Se já existe, pula criação

## Integração com CI/CD

O script é seguro para CI/CD:

```yaml
# .github/workflows/ci.yml
- name: Setup Database
  run: npm run setup
```

## Troubleshooting

### Banco já existe mas migrations falham

```bash
# Rollback e recria
npm run migrate:rollback
npm run migrate
```

### Forçar recriação do database

```sql
DROP DATABASE seu_database;
```

Depois:
```bash
npm run setup
```

### Verificar conexão manualmente

```bash
psql $DATABASE_URL
```

## Estrutura de Arquivos

```
libs/database/
├── scripts/
│   ├── setup-database.js  # Script principal
│   └── README.md          # Esta documentação
├── .env.example           # Template de variáveis
├── .env                   # Criado automaticamente (gitignored)
└── package.json           # Scripts npm
```
