# 🚀 Guia de Configuração do Repositório GitHub

Este guia fornece as **melhores práticas** para configurar seu repositório público no GitHub com proteções de branch, CI/CD, segurança e governança de código.

---

## 📋 Índice

1. [Branch Protection Rules](#branch-protection-rules)
2. [GitHub Actions Workflows](#github-actions-workflows)
3. [Segurança & Secrets](#segurança--secrets)
4. [Configurações Gerais](#configurações-gerais)
5. [Community Standards](#community-standards)
6. [Monitoramento & Alertas](#monitoramento--alertas)

---

## 🔒 Branch Protection Rules

### ✅ O que implementar na `main` branch

**Link:** Settings → Branches → Branch protection rules → Add rule

#### 1. Configuração Básica

```
Branch name pattern: main
```

Habilitar os seguintes checks:

- ✅ **Require a pull request before merging**
  - Require approvals: **2** (pelo menos 2 reviews)
  - Dismiss stale pull request approvals: **ON**
  - Require review from code owners: **ON**

- ✅ **Require status checks to pass before merging**
  - Require branches to be up to date: **ON**
  - Status checks that must pass:
    - `quality` (do workflow CI)
    - (futuro: `test`, `security-scan`)

- ✅ **Restrict who can push to matching branches**
  - Allow force pushes: **OFF**
  - Allow deletions: **OFF**

- ✅ **Require signed commits**
  - ON (melhora a segurança)

---

### Configurar Code Owners

**Arquivo:** `.github/CODEOWNERS`

```bash
# Criar arquivo
touch .github/CODEOWNERS
```

**Conteúdo:**

```
# Global owner for everything
* @xmaiconx

# Backend
apps/server/ @xmaiconx
libs/database/ @xmaiconx
libs/contracts/ @xmaiconx

# Frontend
apps/web/ @xmaiconx
apps/admin/ @xmaiconx

# Landing page
apps/site/ @xmaiconx

# Config & CI/CD
.github/ @xmaiconx
turbo.json @xmaiconx
```

Depois no GitHub: **Branch protection rule** → ✅ **Require review from code owners**

---

## 🔄 GitHub Actions Workflows

### ✅ Melhorias no CI Existente

**Arquivo:** `.github/workflows/ci.yml`

**Adicionar:**

1. **Dependência entre jobs**
2. **Cache inteligente**
3. **Upload de artifacts**
4. **Node 20 (LTS mais recente)**
5. **npm audit**

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  quality:
    name: Code Quality
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20.x]  # Usar LTS mais recente

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
          cache-dependency-path: '**/package-lock.json'

      - name: Install dependencies
        run: npm ci

      - name: Security audit
        run: npm audit --audit-level=moderate

      - name: Type check
        run: npm run typecheck

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build
        env:
          VITE_API_URL: http://localhost:3001

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: build-artifacts
          path: |
            apps/*/dist
            apps/*/build

  test:
    name: Tests
    runs-on: ubuntu-latest
    needs: quality

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test -- --coverage || true  # Comentar se não tiver testes

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unittests
          fail_ci_if_error: false
```

---

### ✨ Novo Workflow: Security Scanning

**Arquivo:** `.github/workflows/security.yml`

```yaml
name: Security Scan

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    # Rodar todo dia às 2 AM UTC
    - cron: '0 2 * * *'

jobs:
  dependencies:
    name: Check Dependencies
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: npm audit (fail on critical)
        run: npm audit --audit-level=critical

      - name: Check for outdated packages
        run: npm outdated || true

  codeql:
    name: CodeQL Analysis
    runs-on: ubuntu-latest

    permissions:
      security-events: write

    steps:
      - uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: javascript

      - name: Autobuild
        uses: github/codeql-action/autobuild@v2

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2

  secret-scanning:
    name: Check for Secrets
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: TruffleHog Scan
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
          head: HEAD
```

---

### ✨ Novo Workflow: Release & Changelog

**Arquivo:** `.github/workflows/release.yml`

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  create-release:
    name: Create GitHub Release
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Get previous tag
        id: previous_tag
        run: |
          PREVIOUS_TAG=$(git tag --sort=-version:refname --list 'v*' | head -2 | tail -1)
          echo "PREVIOUS_TAG=$PREVIOUS_TAG" >> $GITHUB_OUTPUT

      - name: Generate changelog
        id: changelog
        run: |
          {
            echo 'CHANGELOG<<EOF'
            git log ${{ steps.previous_tag.outputs.PREVIOUS_TAG }}..HEAD --pretty=format:"- %s (%h)"
            echo 'EOF'
          } >> $GITHUB_OUTPUT

      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          body: ${{ steps.changelog.outputs.CHANGELOG }}
          draft: false
          prerelease: false
```

---

## 🔐 Segurança & Secrets

### Configurar Dependabot

**Link:** Settings → Code security → Dependabot

Habilitar:
- ✅ **Dependabot alerts**
- ✅ **Dependabot security updates**
- ✅ **Dependabot version updates**

**Arquivo:** `.github/dependabot.yml`

```yaml
version: 2
updates:
  # npm
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
      day: 'monday'
      time: '03:00'
    open-pull-requests-limit: 5
    rebase-strategy: 'auto'
    allow:
      - dependency-type: 'production'
      - dependency-type: 'development'
    reviewers:
      - 'xmaiconx'
    labels:
      - 'dependencies'
      - 'dependencies/npm'

  # GitHub Actions
  - package-ecosystem: 'github-actions'
    directory: '/'
    schedule:
      interval: 'weekly'
      day: 'monday'
      time: '03:00'
    reviewers:
      - 'xmaiconx'
    labels:
      - 'dependencies'
      - 'dependencies/github-actions'
```

---

### Configurar Secrets Management

**Link:** Settings → Secrets and variables → Actions

Para usar em workflows:

```yaml
- name: Deploy to Production
  env:
    STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    JWT_SECRET: ${{ secrets.JWT_SECRET }}
  run: ./deploy.sh
```

**Secrets necessários (criar vazio, preencher depois):**
- `STRIPE_SECRET_KEY`
- `DATABASE_URL` (PostgreSQL)
- `JWT_SECRET`
- `REDIS_URL`
- `RESEND_API_KEY`
- `NPM_TOKEN` (se publicar pacotes privados)

---

### .gitignore Completo

**Verificar:** `.gitignore`

```
# Environment
.env
.env.local
.env.*.local
.env.production

# Dependencies
node_modules/

# Build outputs
dist/
build/
.next/
out/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*

# Testing
coverage/
.nyc_output/

# Turbo
.turbo/
.turbo-cache/

# OS
Thumbs.db
.DS_Store
```

---

## ⚙️ Configurações Gerais

### Settings → General

- ✅ **Template repository**: OFF (não é template)
- ✅ **Default branch**: `main`
- ✅ **Pull Requests**:
  - Auto-delete head branches: **ON**
  - Allow squash merging: **ON** (mantém histórico limpo)
  - Allow rebase merging: **ON**
  - Allow auto-merge: **ON**

### Settings → Code Security

- ✅ **Private vulnerability reporting**: ON
- ✅ **Dependabot alerts**: ON
- ✅ **Secret scanning**: ON (se for enterprise)
- ✅ **Push protection**: ON

### Settings → Code and Analysis

- ✅ **Code scanning**: Usar CodeQL (veja workflow acima)
- ✅ **Secret scanning**: ON

---

## 👥 Community Standards

### Checklist: Settings → General → Social Preview

- ✅ Ter descrição clara do projeto
- ✅ Ter logo/imagem social (existe: `.github/assets/social-preview.png`)
- ✅ Ter website URL
- ✅ Ter topics (tags) relevantes

### Arquivo: `GOVERNANCE.md`

**Criar:** `GOVERNANCE.md`

```markdown
# Governança do Projeto

## Estrutura

- **Mantainer**: [@xmaiconx](https://github.com/xmaiconx) - Decisões principais
- **Colaboradores**: Comunidade de contribuidores

## Decisões de Breaking Changes

Qualquer breaking change requer:
1. Issue discutindo a mudança
2. RFC (Request for Comments) com feedback
3. Deprecation notice por uma versão
4. Anúncio na release

## Suporte a Versões

| Versão | Status |
|--------|--------|
| 0.9.x | ✅ Atual |
| 0.8.x | ⚠️ Críticos apenas |
| < 0.8 | ❌ EOL |

---

Veja [CONTRIBUTING.md](CONTRIBUTING.md) para como contribuir.
```

---

### Arquivo: `VISION.md`

**Criar:** `VISION.md`

```markdown
# Visão do Projeto

## Missão

Empoerar não-técnicos a construir SaaS profissionais com qualidade, segurança e escalabilidade.

## Princípios

1. **Developer Experience First**: Código limpo, bem documentado
2. **Security by Default**: Segurança integrada, não adicional
3. **Production Ready**: Pronto para produção desde o template
4. **Minimal Dependencies**: Apenas o necessário
5. **Community Driven**: Construído com feedback da comunidade

## Roadmap

- v0.9 (atual): Foundation sólida
- v1.0: Release final com todas as features
- v2.0: Extensibilidade avançada

---

Participe da discussão em [Discussions](https://github.com/xmaiconx/fnd-quick-launch/discussions).
```

---

## 📊 Monitoramento & Alertas

### Configurar Notificações

**Link:** Settings → Notifications

- Habilitar notificações para:
  - Pull request reviews
  - Dependabot alerts
  - Security alerts
  - Discussions mentions

### Adicionar Badges no README.md

```markdown
# FND SaaS QuickLaunch

[![CI Status](https://github.com/xmaiconx/fnd-quick-launch/workflows/CI/badge.svg)](https://github.com/xmaiconx/fnd-quick-launch/actions/workflows/ci.yml)
[![Security Scan](https://github.com/xmaiconx/fnd-quick-launch/workflows/Security%20Scan/badge.svg)](https://github.com/xmaiconx/fnd-quick-launch/actions/workflows/security.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/xmaiconx/fnd-quick-launch?style=social)](https://github.com/xmaiconx/fnd-quick-launch)
```

---

## 📋 Checklist de Implementação

### Fase 1: Configuração Essencial (HOJE)

- [ ] Configurar **Branch Protection Rules** na `main`
  - [ ] Requer 2 approvals
  - [ ] Requer status checks (CI)
  - [ ] Requer signed commits
  - [ ] Dismiss stale reviews

- [ ] Criar `.github/CODEOWNERS`

- [ ] Melhorar `.github/workflows/ci.yml`
  - [ ] Adicionar npm audit
  - [ ] Node 20.x
  - [ ] Upload artifacts

- [ ] Criar `.github/dependabot.yml`

- [ ] Verificar `.gitignore` está completo

### Fase 2: Segurança Avançada (PRÓXIMA SEMANA)

- [ ] Criar `.github/workflows/security.yml`
  - [ ] npm audit task
  - [ ] CodeQL scanning
  - [ ] Secret scanning

- [ ] Criar `.github/workflows/release.yml`

- [ ] Configurar Dependabot alerts

- [ ] Configurar Code Scanning (CodeQL)

- [ ] Adicionar Governance.md

### Fase 3: Community (DEPOIS)

- [ ] Criar Discussion templates
- [ ] Setup GitHub Pages para documentação
- [ ] Configurar Discussions para Q&A
- [ ] Community health check no GitHub

---

## 🔧 Configurações Recomendadas

### Merge Strategy

Recomendação: **Squash and merge** (padrão)

**Benefícios:**
- Histórico limpo na main
- Cada PR = 1 commit
- Fácil de reverter

**Configurar:**
- Settings → General → Allow squash merging ✅
- Settings → General → Allow rebase merging ✅
- Settings → General → Allow auto-merge ✅

### Labels

**Criar labels:**

```
- type/bug (vermelho)
- type/feature (verde)
- type/docs (azul)
- type/chore (cinza)
- priority/critical (vermelho escuro)
- priority/high (laranja)
- priority/medium (amarelo)
- priority/low (verde)
- status/blocked (vermelho)
- status/in-progress (azul)
- status/ready-to-merge (verde)
- help-wanted
- good-first-issue
- dependencies
```

---

## 📚 Documentação Essencial

Verificar que todos existem:

- ✅ `README.md` - Visão geral
- ✅ `CONTRIBUTING.md` - Como contribuir
- ✅ `CODE_OF_CONDUCT.md` - Código de conduta
- ✅ `SECURITY.md` - Política de segurança
- ✅ `LICENSE` - MIT
- ✅ `CHANGELOG.md` - Histórico de mudanças
- ⏳ `GOVERNANCE.md` - (criar)
- ⏳ `VISION.md` - (criar)

---

## 🎯 Próximas Ações

1. **Hoje:**
   - [ ] Configurar branch protection
   - [ ] Criar CODEOWNERS
   - [ ] Atualizar CI workflow

2. **Esta semana:**
   - [ ] Criar security.yml workflow
   - [ ] Configurar Dependabot
   - [ ] Criar GOVERNANCE.md

3. **Próximas semanas:**
   - [ ] Implementar testes
   - [ ] Codebase coverage reporting
   - [ ] GitHub Pages documentation

---

## 📞 Suporte

Para dúvidas sobre configuração do GitHub:
- 📖 [GitHub Docs - Branch protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- 📖 [GitHub Actions Best Practices](https://docs.github.com/en/actions/guides)
- 📖 [GitHub Security Best Practices](https://docs.github.com/en/code-security)

---

*Última atualização: 2026-01-12*
