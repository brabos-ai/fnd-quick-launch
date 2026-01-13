# 🏛️ Governança do Projeto

Este documento descreve como o FND SaaS QuickLaunch é governado e as responsabilidades de mantainers e contribuidores.

---

## 📊 Estrutura de Governança

### Roles

#### 👑 Mantainer
- **@xmaiconx** - Criador e mantainer principal
- Responsabilidades:
  - Decisões arquiteturais
  - Aprovação de breaking changes
  - Releases e versioning
  - Moderar discussões
  - Manter estabilidade do projeto

#### 👥 Colaboradores
- Comunidade de desenvolvedores
- Responsabilidades:
  - Contribuir com código, docs, testes
  - Reportar bugs
  - Sugerir features
  - Auxiliar reviews de outros PRs

---

## 📝 Processo de Decisão

### Para features simples (< 100 linhas)
1. Abrir issue descrevendo a feature
2. Aguardar feedback
3. Submeter PR
4. Merge após aprovação

### Para features médias/grandes
1. Abrir issue com discussão detalhada
2. RFC (Request for Comments) na discussão
3. Feedback de mantainer e comunidade
4. Implementação
5. Review e merge

### Para breaking changes
1. **Issue obrigatória** discutindo o impacto
2. RFC com feedback da comunidade
3. Período de deprecation (mínimo 1 versão)
4. Anúncio em release notes
5. Implementação na próxima major version

---

## 🔄 Processo de Review

### Standard Review
- [ ] Código segue style guide
- [ ] Sem linting/typecheck errors
- [ ] Funcionalidade funciona
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada

### Security Review
- [ ] Sem vulnerabilidades óbvias (OWASP)
- [ ] Input validado
- [ ] Multi-tenancy respeitado (se aplicável)
- [ ] Senhas/tokens não expostos
- [ ] Mitigação de SQL Injection, XSS, CSRF

### Performance Review
- [ ] Sem queries N+1
- [ ] Cache implementado quando necessário
- [ ] Bundle size considerado
- [ ] Impacto em mobile analisado

---

## 📦 Versioning

Seguimos **Semantic Versioning**: `MAJOR.MINOR.PATCH`

```
0.9.0
│ │ │
│ │ └─ PATCH: Bug fixes, docs, patches
│ └─── MINOR: New features, sem breaking changes
└───── MAJOR: Breaking changes, arquitetura
```

### Suporte a Versões

| Versão | Status | Suporte |
|--------|--------|---------|
| 0.9.x | ✅ Current | Full support |
| 0.8.x | ⚠️ Legacy | Critical bugs only |
| < 0.8 | ❌ EOL | Sem suporte |

---

## 🚀 Processo de Release

### Pre-Release
1. Feature freeze (no new features)
2. Bug fixes apenas
3. RC (Release Candidate) testing
4. Fix issues encontrados

### Release
1. Bump version em `package.json`
2. Update `CHANGELOG.md`
3. Commit com mensagem: `chore(release): v0.10.0`
4. Create git tag: `git tag -a v0.10.0 -m "Release v0.10.0"`
5. Push: `git push origin main && git push origin v0.10.0`
6. GitHub Actions cria release automaticamente

### Post-Release
1. Anúncio na comunidade
2. Update docs se necessário
3. Start planning próxima versão

---

## 📋 Responsabilidades

### Mantainer
- ✅ Triagem de issues
- ✅ Revisão de PRs
- ✅ Decisões arquiteturais
- ✅ Releases
- ✅ Community management
- ✅ Security patches
- ⏱️ SLA: Responder em 3 dias úteis

### Colaboradores
- ✅ Reportar bugs com detalhes
- ✅ Submeter PRs bem estruturados
- ✅ Testar antes de submeter
- ✅ Ser respeitoso na comunidade
- ✅ Help others quando possível

---

## 🤝 Código de Conduta

Veja [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

Resumo:
- ✅ Ser respeitoso
- ✅ Feedback construtivo
- ✅ Incluir todos
- ❌ Harassment ou bullying
- ❌ Discriminação
- ❌ Spam

**Violações:** Reportar para quicklaunch@brabos.ai

---

## 🔐 Segurança

### Reporting Vulnerabilities
- **NÃO** abrir issue pública
- Email: quicklaunch@brabos.ai
- Veja [SECURITY.md](SECURITY.md) para detalhes

### Security Updates
- Patches críticos: ASAP
- Patches altos: próxima minor version
- Patches médios: próxima minor version
- Patches baixos: próxima major version

---

## 📊 Métricas de Projeto

### Medidas de Sucesso
- ⭐ GitHub stars
- 👀 Contribuidores ativos
- 🐛 Issues resolvidos
- 📈 Downloads/usage
- 💬 Community engagement

### Metas para 2026
- ⭐ 500+ stars
- 👥 10+ contribuidores ativos
- 🚀 v1.0 release
- 📚 Documentação 100% completa

---

## 📞 Contato

- **GitHub Issues**: [Issues](https://github.com/xmaiconx/fnd-quick-launch/issues)
- **Discussions**: [Discussions](https://github.com/xmaiconx/fnd-quick-launch/discussions)
- **Security**: quicklaunch@brabos.ai
- **WhatsApp**: [Comunidade FND](https://chat.whatsapp.com/FGvSsWQlMV6DGBL17IWfQr)

---

*Última atualização: 2026-01-12*
