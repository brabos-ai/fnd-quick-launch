# Bug Fixes: F0001 - Internal Auth + Admin Panel (Tests)

Registro de correções aplicadas aos testes da feature F0001.

---

## Fix 001 - Ambiente test faltando no http-client.env.json

**Data:** 2025-12-19
**Corrigido Por:** Claude Code

### Bug
{"expected":"Ambiente `test` (porta 3099) para `npm run test:api:e2e`","actual":"Apenas ambientes `local`, `staging`, `production` existiam"}

### Root Cause
O arquivo `http-client.env.json` foi gerado sem o ambiente `test` especificado no SKILL.md de API Testing. O script `test:api:e2e` usa porta 3099 (Docker isolado), mas não havia configuração correspondente.

### Fix Applied
{"file":"tests/api/http-client.env.json","change":"Adicionado ambiente `test` com baseUrl porta 3099 e todas variáveis necessárias"}

### Status
{"resolved":true,"build":"N/A (JSON config)","regressions":"none"}

---

## Fix 002 - Assertions verificando body.user.name em vez de body.user.fullName

**Data:** 2025-12-19
**Corrigido Por:** Claude Code

### Bug
{"expected":"Assertions verificando `body.user.fullName` (conforme backend DTO)","actual":"Testes verificavam `body.user.name` que não existe na resposta"}

### Root Cause
O review.md (Issue #4) corrigiu o frontend para usar `fullName` após descobrir que o backend retorna `fullName` no `AuthResponseDto`. Os testes httpyac foram criados antes dessa correção e usavam `name`.

### Fix Applied
{"files":["01-auth-signup-signin.http"],"changes":["Linha 30: body.user.name → body.user.fullName","Linha 244: body.user.name → body.user.fullName"]}

### Status
{"resolved":true,"build":"N/A (httpyac tests)","regressions":"none"}

---

## Fix 003 - Teste de revoke session de outro usuário esperava 404 em vez de 403

**Data:** 2025-12-19
**Corrigido Por:** Claude Code

### Bug
{"expected":"403 Forbidden com mensagem de ownership","actual":"Teste esperava 404 Not Found"}

### Root Cause
O review.md (Issue #2) corrigiu o backend para verificar ownership antes de revogar sessão. Agora retorna 403 com "You can only revoke your own sessions" em vez de 404.

### Fix Applied
{"file":"02-auth-sessions.http","changes":["Linha 188: status == 404 → status == 403","Linha 189: message 'not found' → 'only revoke your own' ou 'Forbidden'"]}

### Status
{"resolved":true,"build":"N/A (httpyac tests)","regressions":"none"}

---
