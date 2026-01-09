# Discovery: Autenticação Interna + Admin Panel

**Branch:** feature/F0001-internal-auth-admin-panel
**Date:** 2025-12-19

## Análise Inicial

### Histórico de Commits

```
554c7e5 .
3a8d249 chore: add .worktrees/ to gitignore
ad75f02 .
97e824d feat(api-testing): add httpyac-based API testing infrastructure
1466f48 .
e4f35af .
b9eb149 .
0a7ac24 .
fe55dd4 feat(commands-to-skills): migrate commands to skills architecture
95f4560 .
```

**Observações:** Commits recentes focam em infraestrutura de testes (httpyac) e reorganização de comandos para skills. Não há commits relacionados a auth recentemente, indicando estabilidade do sistema atual.

### Arquivos Relacionados

**Funcionalidades similares identificadas:**
- `apps/backend/src/api/modules/auth/` - Módulo de auth atual (Supabase-based)
- `apps/backend/src/api/guards/` - Guards de autenticação existentes
- `apps/backend/src/shared/services/supabase.service.ts` - Serviço Supabase a ser removido

**Padrões identificados:**
- CQRS: Commands para escrita, Repositories para leitura
- Multi-tenancy: Filtro por account_id em todas queries
- Guards: Decorators `@UseGuards()` para proteção de rotas
- Audit: Sistema de logs existente via BullMQ

---

## Spec (Token-Efficient)

### Questionário Estratégico

{"scope":[{"q":"Objetivo principal?","a":"Migrar Supabase → Passport.js + criar admin panel"},{"q":"Usuários?","a":"Usuários finais, super-admins, sistemas externos (Stripe)"},{"q":"Problema?","a":"Setup complexo (2 serviços) + sem painel admin"}]}

{"rules":[{"q":"Validações?","a":"Email único, senha forte, lockout 5 tentativas, rate limit"},{"q":"Rate limiting?","a":"/auth/login 5/min, /auth/signup 3/min, /auth/forgot-password 3/min"},{"q":"Dependências?","a":"Audit logs, Redis, Resend, BullMQ (todos existentes)"},{"q":"Impersonate?","a":"Timeout 30min, motivo obrigatório, banner fixo"}]}

{"data":[{"q":"Tabelas novas?","a":"sessions, login_attempts, auth_tokens, impersonate_sessions"},{"q":"Integrações externas?","a":"Nenhuma nova, apenas Resend existente"},{"q":"Processamento async?","a":"Emails via BullMQ, audit logs via fila existente"}]}

{"edge_cases":[{"q":"Refresh token roubado?","a":"Detectar reuso → invalidar todas sessões"},{"q":"Migração de dados?","a":"Não aplicável (template novo, sem usuários)"},{"q":"Performance?","a":"Volume baixo, cache Redis para rate limiting"}]}

{"ux":[{"q":"Stack manager?","a":"React+Vite+Shadcn (mesma do frontend)"},{"q":"Loading/erro?","a":"Padrão do sistema (skeleton + toast)"}]}

### Decisões Tomadas

{"d1":{"topic":"Remover Supabase Auth","context":"Simplificar setup para alunos FND","decision":"Migrar para Passport.js com JWT próprio","impact":"Remoção de 6 arquivos, criação de módulo auth interno","rationale":"Um serviço só (Railway) é mais simples que dois (Railway+Supabase)"}}

{"d2":{"topic":"Admin Panel como app separada","context":"Separar concerns admin vs usuário final","decision":"Criar apps/manager com BFF próprio no backend","impact":"Nova app no monorepo, módulo manager/ no backend","rationale":"Segurança (endpoints isolados), deploy independente, código limpo"}}

{"d3":{"topic":"OAuth social","context":"Google/GitHub login são comuns em SaaS","decision":"Excluir desta fase","impact":"Usuários só podem fazer login com email/senha","rationale":"Adicionar complexidade apenas quando necessário (YAGNI)"}}

{"d4":{"topic":"2FA/MFA","context":"Segurança extra para contas sensíveis","decision":"Excluir desta fase","impact":"Sem autenticação de dois fatores","rationale":"Pode ser adicionado depois sem breaking changes"}}

{"d5":{"topic":"Implementação sequencial vs paralela","context":"3 fases distintas identificadas","decision":"Executar todas as fases em paralelo","impact":"Maior velocidade de entrega","rationale":"Fases são independentes o suficiente para paralelização"}}

### Premissas

[{"assumption":"Template não tem usuários em produção","justification":"É template base, alunos iniciam projetos do zero","impact_if_wrong":"Precisaria criar migração de senhas do Supabase"}]
[{"assumption":"Redis já está configurado e funcionando","justification":"Listado em CLAUDE.md como parte do stack","impact_if_wrong":"Precisaria adicionar setup do Redis"}]
[{"assumption":"Resend está configurado para emails","justification":"Já usado para outros emails transacionais","impact_if_wrong":"Precisaria configurar provider de email"}]

### Edge Cases

[{"case":"Refresh token roubado e reutilizado","likelihood":"Medium","handling":"Detectar token já usado → invalidar TODAS sessões do user → forçar re-login em todos devices"}]
[{"case":"Admin esquece que está em modo impersonate","likelihood":"High","handling":"Timeout automático de 30min + banner fixo sempre visível"}]
[{"case":"Ataque de força bruta em login","likelihood":"High","handling":"Rate limit por IP (5/min) + lockout por email (5 tentativas = 15min bloqueio)"}]
[{"case":"Usuário tenta login de múltiplos devices","likelihood":"High","handling":"Permitir múltiplas sessões, listar todas, permitir revogação individual"}]

### Fora do Escopo

[{"item":"OAuth social (Google, GitHub)","reason":"Adiciona complexidade, pode ser implementado depois"}]
[{"item":"2FA/MFA","reason":"Segurança avançada, não essencial para MVP"}]
[{"item":"Migração de usuários existentes","reason":"Template novo, sem base de usuários"}]

### Referências

{"codebase":["apps/backend/src/api/modules/auth/ - módulo auth atual","apps/backend/src/api/guards/supabase-auth.guard.ts - guard a substituir","apps/backend/src/shared/services/supabase.service.ts - serviço a remover","libs/backend/src/services/ISupabaseService.ts - interface a remover"]}
{"docs":["docs/brainstorm/2025-12-19-auth-interno-admin-panel.md - documento de brainstorm original","CLAUDE.md - especificação técnica do projeto"]}

---

## Resumo para Planning

A feature migra autenticação do Supabase para sistema interno com Passport.js (estratégias local + JWT) e cria um painel administrativo separado em `apps/manager`. O objetivo é simplificar o setup para alunos do FND, reduzindo de dois serviços (Railway + Supabase) para apenas um (Railway).

O escopo inclui: auth completo (signup, signin, refresh, logout, reset password), segurança robusta (lockout, rate limiting, token rotation), gestão de sessões (device tracking, revogação), e admin panel (user CRUD, impersonate, métricas básicas).

**Requisitos Críticos:**
- Passport.js com estratégias local (email/senha) e JWT
- Refresh token rotation com detecção de reuso
- Rate limiting via Redis nos endpoints de auth
- Admin panel isolado com BFF próprio
- Impersonate com timeout e auditoria

**Restrições Técnicas:**
- Manter compatibilidade com multi-tenancy existente (account_id)
- Usar infraestrutura existente (Redis, BullMQ, Resend)
- Seguir padrões CQRS já estabelecidos
- Manager usa mesma stack do frontend (React+Vite+Shadcn)

**Foco do Planning:**
Definir ordem de implementação considerando dependências entre arquivos. Priorizar: (1) migrations das novas tabelas, (2) serviços core de auth, (3) endpoints, (4) guards, (5) frontend auth, (6) apps/manager.
