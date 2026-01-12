# Política de Segurança

## Versões Suportadas

Atualmente, damos suporte às seguintes versões do FND SaaS QuickLaunch:

| Versão | Suportada          |
| ------ | ------------------ |
| 0.9.x  | :white_check_mark: |

## Reportando uma Vulnerabilidade

A segurança do FND SaaS QuickLaunch é prioridade. Se você descobriu uma vulnerabilidade de segurança, por favor, siga estas diretrizes:

### Como Reportar

**NÃO** abra uma issue pública para vulnerabilidades de segurança.

Envie um email para **quicklaunch@brabos.ai** com:

1. **Descrição detalhada da vulnerabilidade**
   - Tipo de vulnerabilidade (ex: SQL Injection, XSS, CSRF, etc.)
   - Localização do código afetado
   - Potencial impacto

2. **Passos para reproduzir**
   - Guia passo a passo de como explorar a vulnerabilidade
   - Ambiente de teste usado

3. **Proof of Concept** (se possível)
   - Código ou screenshots demonstrando a vulnerabilidade
   - Logs ou requisições HTTP relevantes

4. **Seu contato**
   - Nome/pseudônimo para crédito (opcional)
   - Email para comunicação

### O Que Esperar

- **Confirmação inicial**: Dentro de 48 horas
- **Avaliação completa**: Dentro de 7 dias
- **Correção e divulgação**: Dependendo da severidade, geralmente dentro de 30 dias

### Política de Divulgação Responsável

Pedimos que você:

- Nos dê tempo razoável para corrigir a vulnerabilidade antes de divulgá-la publicamente
- Não explore a vulnerabilidade além do necessário para demonstrá-la
- Não acesse ou modifique dados de terceiros

Em troca, nós:

- Responderemos prontamente à sua comunicação
- Manteremos você informado sobre o progresso da correção
- Daremos crédito público pelo discovery (se você desejar)

## Segurança do Template

O FND SaaS QuickLaunch implementa diversas práticas de segurança por padrão:

### Autenticação & Autorização
- JWT com refresh tokens
- Rate limiting em endpoints sensíveis
- Hashing de senhas com bcrypt
- Política de senha forte

### Proteção de Dados
- Validação de entrada em todos os endpoints (Zod)
- Prepared statements (Kysely) para prevenir SQL Injection
- Sanitização de dados em logs de auditoria
- Criptografia de dados sensíveis em repouso

### Infraestrutura
- CORS configurado adequadamente
- Helmet.js para headers de segurança
- Rate limiting global
- Proteção contra CSRF

### Multi-tenancy
- Isolamento estrito de workspaces
- Validação de permissões em cada operação
- Prevenção de IDOR (Insecure Direct Object Reference)

## Escopo

Esta política cobre vulnerabilidades no código do FND SaaS QuickLaunch. **Não** cobre:

- Vulnerabilidades em dependências de terceiros (reporte diretamente aos mantenedores)
- Problemas de configuração específicos da sua implantação
- Ataques de engenharia social

## Atualizações de Segurança

Patches de segurança são lançados o mais rápido possível e documentados no [CHANGELOG.md](CHANGELOG.md) com o prefixo `[SECURITY]`.

Recomendamos que você:

- Mantenha sua instância atualizada com a versão mais recente
- Assine as [releases do GitHub](https://github.com/xmaiconx/fnd-quick-launch/releases) para ser notificado
- Revise o CHANGELOG.md regularmente

## Contato

Para questões gerais sobre segurança (não vulnerabilidades específicas), abra uma [issue](https://github.com/xmaiconx/fnd-quick-launch/issues) ou entre em contato através de **quicklaunch@brabos.ai**.

---

**Agradecemos sua ajuda em manter o FND SaaS QuickLaunch seguro!**
