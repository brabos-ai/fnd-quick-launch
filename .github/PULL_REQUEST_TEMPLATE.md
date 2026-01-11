## Descrição

<!-- Descreva de forma clara e objetiva o que este PR faz -->

Fixes #(issue)

## Tipo de Mudança

<!-- Marque com [x] o que se aplica -->

- [ ] 🐛 Bug fix (mudança que corrige um problema)
- [ ] ✨ Nova funcionalidade (mudança que adiciona uma funcionalidade)
- [ ] 💥 Breaking change (mudança que quebra compatibilidade com versões anteriores)
- [ ] 📝 Documentação (mudanças apenas na documentação)
- [ ] ♻️ Refatoração (mudança que não adiciona funcionalidade nem corrige bugs)
- [ ] ⚡ Performance (mudança que melhora performance)
- [ ] ✅ Testes (adição ou correção de testes)
- [ ] 🔧 Chore (mudanças em configuração, build, etc.)

## Como Foi Testado?

<!-- Descreva como você testou suas mudanças -->

- [ ] Testado localmente
- [ ] Testei em diferentes navegadores (especificar quais)
- [ ] Testei em diferentes tamanhos de tela
- [ ] Adicionei testes automatizados

**Detalhes dos testes:**

## Checklist de Qualidade

<!-- Marque [x] em todos os itens aplicáveis -->

### Código
- [ ] Meu código segue o style guide do projeto
- [ ] Removi comentários desnecessários e código comentado
- [ ] Executei `npm run typecheck` sem erros
- [ ] Executei `npm run lint` sem erros
- [ ] Executei `npm run build` com sucesso

### Funcionalidade
- [ ] Testei a funcionalidade completamente
- [ ] Verifiquei que não introduzi regressões
- [ ] As mensagens de erro são claras e úteis
- [ ] A funcionalidade funciona para diferentes níveis de permissão (se aplicável)

### Segurança
- [ ] Validei todas as entradas do usuário
- [ ] Não expus dados sensíveis em logs ou respostas
- [ ] Implementei autorização apropriada (se aplicável)
- [ ] Não introduzi vulnerabilidades SQL Injection, XSS, CSRF, etc.

### Performance
- [ ] Não introduzi queries N+1
- [ ] Considerei o impacto em bancos com grande volume de dados
- [ ] Implementei paginação onde necessário

### Database
- [ ] Criei migrations para mudanças no banco (se aplicável)
- [ ] Testei as migrations (up e down)
- [ ] Adicionei índices apropriados

### Documentação
- [ ] Atualizei a documentação relevante
- [ ] Adicionei comentários em código complexo (quando necessário)
- [ ] Atualizei o CHANGELOG.md (se aplicável)

## Screenshots (se aplicável)

<!-- Adicione screenshots ou GIFs para mudanças visuais -->

**Antes:**

**Depois:**

## Impacto

<!-- Descreva o impacto desta mudança -->

- **Compatibilidade:** Esta mudança é compatível com versões anteriores?
- **Dependências:** Adiciona/atualiza dependências?
- **Migrations:** Requer execução de migrations?
- **Env Variables:** Requer novas variáveis de ambiente?

## Notas Adicionais

<!-- Qualquer informação adicional relevante para os revisores -->

## Checklist do Revisor

<!-- Para ser preenchido pelo revisor -->

- [ ] O código está claro e legível
- [ ] A solução está alinhada com a arquitetura do projeto
- [ ] Os testes são adequados
- [ ] A documentação está atualizada
- [ ] Não há problemas de segurança óbvios
- [ ] O PR está pronto para merge
