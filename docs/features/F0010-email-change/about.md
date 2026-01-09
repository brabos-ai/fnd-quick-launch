# Feature: Email Change

Permitir que usuários autenticados alterem seu endereço de e-mail de forma segura, com verificação de propriedade do novo e-mail antes da troca efetiva.

**Problema:** Usuários não conseguem atualizar seu e-mail quando mudam de empresa, perdem acesso ao email antigo, ou simplesmente preferem usar outro endereço.

**Para quem:** Usuários finais autenticados do sistema.

---

## Objetivo

**Problema:** Atualmente o endpoint `PATCH /auth/me` só permite atualizar o nome (`fullName`). Não existe fluxo para alteração de e-mail, forçando usuários a criar novas contas quando precisam mudar de endereço.

**Solução:** Implementar fluxo seguro de troca de e-mail em 2 etapas: (1) usuário solicita troca informando novo email + senha atual, (2) confirma clicando em link enviado para o novo endereço.

**Valor:** Retenção de usuários que precisam trocar e-mail sem perder histórico e configurações da conta.

---

## Requisitos

### Funcionais

- **[RF01]:** Usuário autenticado pode solicitar troca de e-mail informando novo endereço e senha atual
- **[RF02]:** Sistema envia link de confirmação para o novo endereço de e-mail
- **[RF03]:** Usuário confirma troca clicando no link recebido no novo e-mail
- **[RF04]:** Sistema notifica o e-mail antigo sobre a alteração realizada (segurança)
- **[RF05]:** Solicitação pendente é cancelada se nova solicitação for feita antes da confirmação
- **[RF06]:** Frontend exibe botão de editar e-mail na página de perfil (settings)

### Nao-Funcionais

- **[RNF01]:** Token de confirmacao expira em 24 horas
- **[RNF02]:** Rate limit de 3 solicitacoes por hora por usuario
- **[RNF03]:** Ao confirmar troca, invalidar todas as sessoes exceto a atual (seguranca)

---

## Regras de Negocio

- **[RN01]:** Novo e-mail ja cadastrado por outro usuario -> rejeitar com erro "E-mail ja em uso"
- **[RN02]:** Novo e-mail igual ao atual -> rejeitar com erro "Novo e-mail deve ser diferente do atual"
- **[RN03]:** Senha informada incorreta -> rejeitar com erro "Senha incorreta"
- **[RN04]:** Token expirado ou ja usado -> rejeitar com erro "Link expirado ou invalido"
- **[RN05]:** Nova solicitacao com pendencia existente -> cancelar pendencia anterior automaticamente
- **[RN06]:** Confirmacao bem-sucedida -> novo e-mail ja nasce como verificado (`emailVerified: true`)

---

## Escopo

### Incluido

- Endpoints backend para solicitar e confirmar troca de e-mail
- Templates de e-mail (confirmacao + notificacao)
- UI no frontend para solicitar troca (pagina de perfil)
- Pagina de confirmacao no frontend
- Invalidacao de sessoes apos confirmacao

### Excluido

- Troca de e-mail pelo admin (admin ja pode editar usuarios diretamente) - fora do escopo
- Recuperacao de conta por e-mail antigo apos troca - complexidade alta, fase futura
- Historico de e-mails anteriores - nao necessario para MVP

---

## Decisoes

| Decisao | Razao | Alternativa descartada |
|---------|-------|------------------------|
| Confirmar via novo e-mail | Prova ownership do novo endereco | Confirmar via email antigo - nao garante acesso ao novo |
| Reutilizar `auth_tokens` | Infraestrutura ja existe, padrao consistente | Nova tabela - complexidade desnecessaria |
| Exigir senha atual | Protege contra sessoes comprometidas | So autenticacao - menos seguro |
| Expiracao 24h | Balanceado entre seguranca e usabilidade | 1h muito curto, 7 dias muito longo |
| Invalidar sessoes (exceto atual) | Seguranca - forca re-auth em outros devices | Manter todas - risco de sessoes antigas |

---

## Edge Cases

- **[EC01] Usuario tenta confirmar apos expiracao:** Retornar erro amigavel sugerindo nova solicitacao
- **[EC02] Mesmo link clicado duas vezes:** Segunda tentativa retorna erro "Link ja utilizado"
- **[EC03] E-mail antigo nao existe mais:** Notificacao falha silenciosamente (best-effort)
- **[EC04] Usuario solicita troca estando na mesma sessao que sera mantida:** Sessao atual permanece valida
- **[EC05] Troca durante checkout ou operacao critica:** Nao bloqueia - responsabilidade do usuario

---

## Criterios de Aceite

- [ ] `POST /auth/request-email-change` aceita `{ newEmail, password }` e retorna sucesso
- [ ] E-mail de confirmacao e enviado para o novo endereco com link valido
- [ ] `POST /auth/confirm-email-change` aceita `{ token }` e atualiza o e-mail do usuario
- [ ] E-mail de notificacao e enviado para o endereco antigo apos confirmacao
- [ ] Novo e-mail ja em uso retorna erro 400 com mensagem apropriada
- [ ] Senha incorreta retorna erro 401
- [ ] Token expirado retorna erro 400
- [ ] Sessoes antigas sao invalidadas apos confirmacao (exceto sessao atual)
- [ ] Frontend permite solicitar troca na pagina de perfil
- [ ] Frontend exibe pagina de confirmacao ao clicar no link do e-mail

---

## Spec

{"feature":"F0010-email-change","type":"new","priority":"medium","users":["authenticated-user"],"deps":["auth-module","auth_tokens-table"]}
