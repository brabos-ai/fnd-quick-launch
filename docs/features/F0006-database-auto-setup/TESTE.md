# Testes Manuais - F0006 Database Auto-Setup

## Cenários de Teste

### 1. Setup Completo (Novo Projeto)

**Pré-condições:**
- PostgreSQL rodando
- Sem `.env` no `libs/database`
- Database não existe

**Passos:**
```bash
# 1. Remover .env (se existir)
rm libs/database/.env

# 2. Executar setup
npm run setup
```

**Resultado Esperado:**
- ✅ `.env` copiado de `.env.example`
- ✅ Mensagem: "Database 'fnd_dev' created successfully!"
- ✅ Migrations executadas
- ✅ Seeds executadas
- ✅ Exit code 0

---

### 2. Setup Idempotente (Database Já Existe)

**Pré-condições:**
- PostgreSQL rodando
- `.env` existe
- Database já existe

**Passos:**
```bash
npm run setup
```

**Resultado Esperado:**
- ✅ Mensagem: "Database 'fnd_dev' already exists"
- ✅ Mensagem: "Skipping creation, proceeding with migrations..."
- ✅ Migrations executadas (pode mostrar "Already up to date")
- ✅ Exit code 0

---

### 3. Migrate com Auto-Setup

**Pré-condições:**
- PostgreSQL rodando
- Database pode ou não existir

**Passos:**
```bash
npm run migrate
```

**Resultado Esperado:**
- ✅ Script `db:setup` executado automaticamente
- ✅ Database criado se não existir
- ✅ Migrations executadas
- ✅ Exit code 0

---

### 4. Erro: PostgreSQL Offline

**Pré-condições:**
- PostgreSQL **não** rodando

**Passos:**
```bash
cd libs/database
npm run db:setup
```

**Resultado Esperado:**
- ❌ Mensagem: "Cannot connect to PostgreSQL server"
- ❌ Mensagem: "Is PostgreSQL running?"
- ❌ Exit code 1

---

### 5. Erro: DATABASE_URL Inválida

**Pré-condições:**
- `.env` com DATABASE_URL malformada

**Modificar `.env`:**
```env
DATABASE_URL=invalid-url
```

**Passos:**
```bash
cd libs/database
npm run db:setup
```

**Resultado Esperado:**
- ❌ Mensagem: "Invalid DATABASE_URL format"
- ❌ Mensagem mostrando formato esperado
- ❌ Exit code 1

---

### 6. Erro: Usuário Sem Permissão CREATEDB

**Pré-condições:**
- PostgreSQL rodando
- Usuário sem permissão CREATEDB

**Setup:**
```sql
-- No PostgreSQL
CREATE USER test_user WITH PASSWORD 'test123';
-- NÃO dar permissão CREATEDB
```

**Modificar `.env`:**
```env
DATABASE_URL=postgresql://test_user:test123@localhost:5432/test_db
```

**Passos:**
```bash
cd libs/database
npm run db:setup
```

**Resultado Esperado:**
- ❌ Mensagem: "User lacks CREATEDB permission"
- ❌ Mensagem orientando criar DB manualmente
- ❌ Exit code 1

---

### 7. Conexão Remota (Railway/Cloud)

**Pré-condições:**
- DATABASE_URL apontando para serviço remoto (Railway, Render, etc.)

**Modificar `.env`:**
```env
DATABASE_URL=postgresql://postgres:senha@ballast.proxy.rlwy.net:39913/railway
```

**Passos:**
```bash
cd libs/database
npm run db:setup
```

**Resultado Esperado:**
- ✅ Conecta ao serviço remoto
- ✅ Verifica/cria database normalmente
- ✅ Exit code 0

---

### 8. Cópia Automática de .env

**Pré-condições:**
- `.env` **não** existe
- `.env.example` existe

**Passos:**
```bash
# Remover .env
rm libs/database/.env

# Executar setup
cd libs/database
npm run db:setup
```

**Resultado Esperado:**
- ✅ Mensagem: "Copied .env.example to .env"
- ✅ Arquivo `.env` criado
- ✅ Conteúdo idêntico ao `.env.example`

---

## Checklist de Critérios de Aceite

Com base no `about.md`:

- [ ] `npm run setup` no root cria DB e roda migrations com sucesso
- [ ] `npm run migrate` cria DB automaticamente se não existir
- [ ] `.env` é copiado de `.env.example` se não existir
- [ ] Erro claro quando Postgres não está acessível
- [ ] Funciona com DATABASE_URL local (localhost)
- [ ] Funciona com DATABASE_URL remoto (Railway)
- [ ] Idempotente: rodar múltiplas vezes não causa erro

---

## Comandos de Cleanup (Para Reteste)

```bash
# Remover database
psql -U postgres -h localhost -c "DROP DATABASE IF EXISTS fnd_dev;"

# Remover .env
rm libs/database/.env

# Resetar para estado inicial
psql -U postgres -h localhost -c "DROP DATABASE IF EXISTS fnd_dev;"
rm libs/database/.env
```

---

## Testes Automatizados (Futuro)

```javascript
// libs/database/scripts/__tests__/setup-database.test.js
describe('Database Auto-Setup', () => {
  it('should create database if not exists', async () => {
    // Test implementation
  });

  it('should skip creation if database exists', async () => {
    // Test implementation
  });

  it('should copy .env.example to .env if needed', () => {
    // Test implementation
  });

  it('should fail with clear message when Postgres is offline', async () => {
    // Test implementation
  });
});
```
