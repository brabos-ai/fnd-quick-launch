# Feature: Log Providers

Sistema agnóstico de log transport que permite enviar logs estruturados para múltiplos providers externos (Axiom, Seq, OpenObserve) via configuração de ambiente, mantendo console/stdout como fallback padrão.

**O QUE:** Transports modulares para Winston que enviam logs para providers de observabilidade externos.

**POR QUE:** Logs estruturados do Winston (F0011) só vão para console. Não há forma fácil de visualizar, buscar e correlacionar logs em ferramentas externas.

**PARA QUEM:** Desenvolvedores configurando o template, alunos aprendendo observability, sistemas de APM recebendo logs.

---

## Objetivo

**Problema:** Após F0011, temos logs estruturados com correlation ID, mas visualização é limitada ao console do Railway. Elastic+Kibana é complexo demais para template de ensino.

**Solução:** Winston Transports agnósticos que enviam logs para providers leves (Axiom, Seq, OpenObserve) via variáveis de ambiente especializadas por provider.

**Valor:** Alunos podem visualizar logs em ferramentas profissionais com 5 minutos de setup (criar conta + configurar variáveis).

---

## Requisitos

### Funcionais

- **[RF01]:** Sistema detecta provider configurado via variável LOG_PROVIDER (axiom|seq|openobserve)
- **[RF02]:** Sistema carrega configuração específica do provider selecionado (AXIOM_*, SEQ_*, OPENOBSERVE_*)
- **[RF03]:** Sistema adiciona transport do provider ao Winston Logger sem modificar callers existentes
- **[RF04]:** Sistema mantém transport Console sempre ativo independente de provider externo
- **[RF05]:** Sistema envia logs em formato JSON estruturado com todos os campos do LogContext
- **[RF06]:** Sistema propaga requestId (correlation ID) para o provider externo
- **[RF07]:** Sistema loga warning no startup quando provider configurado mas credenciais ausentes

### Não-Funcionais

- **[RNF01]:** Envio de logs não deve bloquear thread principal (async/buffered)
- **[RNF02]:** Falha de envio para provider externo não deve impactar aplicação
- **[RNF03]:** Overhead de serialização menor que 1ms por log entry
- **[RNF04]:** Documentação de setup para cada provider no README

---

## Regras de Negócio

- **[RN01]:** LOG_PROVIDER não definido → usar apenas Console transport (comportamento atual)
- **[RN02]:** LOG_PROVIDER definido mas credenciais faltando → warning no startup + fallback para console
- **[RN03]:** Provider externo fora do ar → logar erro uma vez + continuar com console
- **[RN04]:** Múltiplos providers simultâneos → não suportado (apenas um provider externo por vez)
- **[RN05]:** Console transport → sempre ativo para debugging local e captura do Railway

---

## Escopo

### Incluído

- Transport para Axiom (HTTP API)
- Transport para Seq (HTTP API)
- Transport para OpenObserve (HTTP API)
- Factory para seleção de transport baseado em variável de ambiente
- Variáveis de ambiente especializadas por provider no .env.example
- Documentação de setup para cada provider no README
- Logging de status no startup (provider ativo, fallback, erros)

### Excluído

- Múltiplos providers simultâneos - complexidade desnecessária para template
- UI para configuração de providers - apenas variáveis de ambiente
- Retry com backoff - simplicidade > resiliência para ensino
- Buffer local para retry - idem acima
- Providers adicionais (Datadog, New Relic, etc) - pode ser feature futura

---

## Decisões

| Decisão | Razão | Alternativa descartada |
|---------|-------|------------------------|
| Variáveis especializadas (AXIOM_*, SEQ_*) | Clareza e documentação por provider | Variáveis genéricas (LOG_PROVIDER_URL) - confuso |
| Console sempre ativo | Debug local + Railway captura | Console opcional - perderia logs em falha |
| Um provider por vez | Simplicidade para ensino | Múltiplos - complexidade desnecessária |
| HTTP push (não SDK) | Menos dependências, mais controle | SDKs oficiais - deps pesadas para cada provider |
| Axiom como default recomendado | Free tier 500GB/mês, UI excelente | Seq - requer self-host para free |

---

## Edge Cases

- **Provider configurado mas URL inválida:** Warning no startup, fallback para console apenas
- **Token inválido/expirado:** Logar erro uma vez no startup, continuar com console
- **Provider fora do ar em runtime:** Não bloquear, continuar com console, logar erro periodicamente (throttled)
- **Payload muito grande:** Truncar campos grandes (stack traces > 10KB) antes de enviar
- **Rate limit do provider:** Respeitar headers, reduzir frequência temporariamente

---

## Critérios de Aceite

- [ ] Sem LOG_PROVIDER definido, aplicação usa apenas Console (comportamento atual preservado)
- [ ] Com LOG_PROVIDER=axiom e credenciais válidas, logs aparecem no Axiom dashboard
- [ ] Com LOG_PROVIDER=seq e credenciais válidas, logs aparecem no Seq UI
- [ ] Com LOG_PROVIDER=openobserve e credenciais válidas, logs aparecem no OpenObserve
- [ ] requestId (correlation ID) aparece nos logs do provider externo
- [ ] Console continua recebendo logs mesmo com provider externo ativo
- [ ] Startup loga mensagem indicando provider ativo ou fallback
- [ ] Falha de conexão com provider não crasha a aplicação
- [ ] .env.example contém todas as variáveis documentadas por provider
- [ ] README contém guia de setup para Axiom (provider recomendado)

---

## Spec

{"feature":"F0012-log-providers","type":"enhancement","priority":"medium","users":["developers","students","apm-systems"],"deps":["F0011-correlation-id-tracking","winston"],"impact":"infrastructure","scope":["backend","logging"],"providers":["axiom","seq","openobserve"]}
