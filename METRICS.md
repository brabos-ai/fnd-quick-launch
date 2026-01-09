# Guia de Métricas - Dashboard Manager

> **Documento para entender as métricas desenvolvidas na Feature F0007**

Explicação prática das métricas de negócio SaaS implementadas no painel do Manager. Use este guia para avaliar a feature e ensinar aos seus alunos.

---

## 📊 Visão Geral

O Dashboard de Métricas mostra a saúde do seu SaaS através de 3 páginas principais:

1. **Overview** - Visão executiva em um único lugar
2. **Financeiro** - Receita, MRR/ARR e cancelamentos
3. **Clientes** - Crescimento, retenção e contas em risco

Todas as páginas permitem filtrar por período: últimos 7, 30 ou 90 dias.

---

## 1️⃣ PAGE: Overview (Visão Geral)

### Propósito
Dashboard executivo com os 4 KPIs principais e tendências visuais. Primeira página que um Super Admin vê.

### Os 4 KPIs Principais

#### 💰 MRR (Monthly Recurring Revenue)
**Receita Mensal Recorrente**

```
Valor: R$ 45.231,89
Variação: ↑ +12.5% vs mês anterior
```

**O que significa:**
É todo o dinheiro que você recebe **todo mês** das assinaturas ativas. Se tem 100 clientes pagando R$ 500/mês cada, seu MRR é R$ 50.000.

**Por que importa:**
- Se MRR sobe → Negócio está crescendo ✨
- Se MRR cai → Tem problema de churn ou cancelamentos
- MRR é o "pulso" do seu SaaS

**Exemplo prático:**
```
Jan: MRR = R$ 40.000
Fev: MRR = R$ 45.000 (5 novos clientes de R$ 1.000/mês)
Mar: MRR = R$ 42.000 (3 clientes cancelaram)
```

**Para ensinar:** "MRR é o termômetro do negócio. Se está crescendo, tudo funciona. Se cai, tem algo errado."

---

#### 👥 Total de Contas
**Número absoluto de clientes**

```
Valor: 127 contas
Variação: ↑ +8 novas no período
```

**O que significa:**
Quantos clientes se cadastraram na sua plataforma (conta ou workspace criado).

**Por que importa:**
- Mostra crescimento da base de usuários
- Nem todas as contas viram clientes pagos
- Crescimento + receita = bom sinal

**Exemplo prático:**
```
Se tem 127 contas mas só 98 estão pagando:
127 - 98 = 29 contas em trial ou inativos
```

---

#### ✅ Assinaturas Ativas
**Contas que realmente estão pagando**

```
Valor: 98 de 127 contas (77.2%)
```

**O que significa:**
De todas as contas, quantas têm assinatura ativa (com status "active" na Stripe).

**Por que importa:**
- 77% é bom (mais de 75% é saudável)
- Mostra taxa de conversão trial → pago
- Se cair para 50%, tem problema sério

**Exemplo prático:**
```
127 contas totais:
- 98 com assinatura ativa (77%)
- 20 em trial (free)
- 9 canceladas
```

---

#### 📈 NRR (Net Revenue Retention)
**O indicador mais importante para SaaS**

```
Valor: 105.3%
Interpretação: ↑ Expansão > Churn
```

**O que significa:**
Compara a receita de hoje com a de um mês atrás, considerando:
- ✅ Clientes que ficaram e fizeram upgrade (+expansão)
- ❌ Clientes que cancelaram (-churn)
- 🆕 Clientes novos (+growth, mas não conta para NRR puro)

**Fórmula conceitual:**
```
NRR = (Receita do mês anterior + Expansão - Churn) / Receita do mês anterior × 100
```

**O que significa cada cenário:**

| NRR | Interpretação | Status |
|-----|---------------|--------|
| > 120% | Você está superacelerando (expansão >> churn) | 🚀 Excelente |
| 100-120% | Expansão compensa churn | ✅ Saudável |
| 100% | Crescimento + churn se anulam | ⚠️ Estável |
| < 100% | Está perdendo mais que ganhando | 🔴 Problema |

**Exemplo prático:**
```
Mês 1: R$ 100.000 MRR
- 3 clientes grandes cancelam: -R$ 5.000
- 10 clientes fazem upgrade: +R$ 8.000
- 5 novos clientes: +R$ 2.000

Mês 2: R$ 105.000

NRR = (100.000 - 5.000 + 8.000) / 100.000 × 100 = 103%
(Não conta os novos clientes no cálculo puro de NRR)
```

**Para ensinar:** "Se NRR > 100%, seu negócio está acelerando. Se < 100%, está desacelerando. Essa é a métrica que VCs olham quando querem investir em você."

---

### Gráficos na Overview

#### 📈 Gráfico: Evolução do MRR
Linha/área mostrando como o MRR variou nos últimos 7/30/90 dias.

```
Crescimento esperado (por período):
- 7 dias: Pequenas variações diárias
- 30 dias: Tendência mensal (deve subir)
- 90 dias: Tendência trimestral (deve estar com slope positivo)
```

#### 🍰 Gráfico: Distribuição por Plano
Rosca mostrando quantas assinaturas cada plano tem.

```
Free: 40 contas (32%)
Pro: 45 contas (36%)
Business: 30 contas (24%)
Enterprise: 12 contas (8%)
```

**O que analisar:**
- Se Free > Pro → Conversão trial→pago fraca
- Se Enterprise < Business → Não está vendendo enterprise
- Ideal: Base sólida de Pro, crescimento em Enterprise

---

## 2️⃣ PAGE: Financeiro (3 Abas)

### Aba 1: MRR & ARR

#### 📊 O que significa MRR vs ARR

**MRR** = Monthly Recurring Revenue (receita mensal)
```
Se você recebe R$ 45.231,89 todo mês, seu MRR é R$ 45.231,89
```

**ARR** = Annual Recurring Revenue (receita anual)
```
ARR = MRR × 12
Se MRR = R$ 45.231,89, então ARR = R$ 542.782,68
```

**Por que ambos?**
- MRR é para acompanhamento mensal (dia a dia)
- ARR é para relatórios anuais e pitch para investidores
- Alguns planos são anuais → precisam de ARR

#### 📈 Crescimento MoM (Month over Month)
```
Valor: +8.3% ao mês (média dos últimos 3 meses)
```

**O que significa:**
A taxa de crescimento do MRR mês a mês.

**Exemplo prático:**
```
Jan: MRR = R$ 40.000
Fev: MRR = R$ 43.200 (crescimento de 8%)
Mar: MRR = R$ 46.656 (crescimento de 8%)
Abr: MRR = R$ 50.389 (crescimento de 8%)
```

**Meta saudável:** 5-10% ao mês é ótimo para SaaS

---

#### 🔢 O Gráfico: MRR vs ARR (Linha Dupla)

Mostra as duas linhas lado a lado:
- **Esquerda:** MRR (eixo Y esquerdo, em Reais)
- **Direita:** ARR (eixo Y direito, maior valor)

Ambas devem estar subindo em paralelo.

---

#### 🔨 O Gráfico: Breakdown de MRR (Barras Empilhadas)

**A receita vem de 4 lugares:**

```
┌──────────────────────────────────────────┐
│         MRR Breakdown (Stacked Bar)      │
├──────────────────────────────────────────┤
│ 🟢 Novo MRR    - Clientes NOVOS         │
│ 🔵 Expansão     - Upgrades (Free→Pro)   │
│ 🟡 Contração    - Downgrades (Pro→Free)│
│ 🔴 Churn        - Cancelamentos         │
└──────────────────────────────────────────┘
```

**Exemplo de um mês:**
```
Novo MRR:      R$ 3.000 (5 clientes × R$ 600/mês)
Expansão:      R$ 2.500 (10 upgrades)
Contração:     -R$ 800  (3 downgrades)
Churn:         -R$ 1.700 (cancelamentos)
─────────────────────────
MRR do mês:    +R$ 3.000 (ganho líquido)
```

**O que analisar:**
- Se Novo > Churn → Crescimento saudável
- Se Expansão está subindo → Upselling funciona
- Se Contração aparece → Tem clientes infelizes (investigar por quê)

**Para ensinar:** "Vejam só - ganhamos R$ 3.000 em novos clientes, mas perdemos R$ 1.700 em churn. O crescimento está vindo principalmente de novos, não de expansão. Precisamos melhorar a retenção!"

---

### Aba 2: Receita

#### 💵 KPI: Receita Total do Período
```
Valor: R$ 89.450,00
Transações: 45
```

**O que significa:**
Todo o dinheiro que entrou nesse período (não é o mesmo que MRR, que é só receita recorrente).

**Por que é diferente de MRR:**
```
MRR = Só assinaturas recorrentes
Receita Total = Assinaturas + Pagamentos únicos (se houver)
```

---

#### 📊 Gráfico 1: Receita por Plano (Barras Horizontais)

```
Enterprise  ████████████████████████████ 45%  R$ 40.250
Pro         ███████████████████ 28%  R$ 25.050
Business    ██████████ 16%  R$ 14.312
Starter     ██ 11%  R$ 9.838
```

**O que analisar:**
- Qual plano gera mais dinheiro? (não é o que tem mais usuários!)
- Enterprise tem poucos usuários mas alto MRR per user
- Se Free > Pro → Base de paying customers fraca

---

#### 📈 Gráfico 2: Tendência de Receita (Área Empilhada)

Mostra receita ao longo do tempo, separada por plano.

```
Coluna 1: 100% do total vem de qual plano?
Coluna 2: As cores se mexem conforme a distribuição muda
```

**O que analisar:**
- Está crescendo? (linha total subindo)
- Mix de receita está mudando? (cores se movem)
- Exemplo: Se Enterprise começou com 5% e virou 20%, está crescendo bem!

---

### Aba 3: Churn

#### O que é Churn?
**Churn** = Cancelamento de clientes ou receita

Existem **2 tipos:**

---

##### 1️⃣ Logo Churn (Customer Churn)
```
Valor: 2.1% (3 contas canceladas no período)
```

**O que significa:**
Que porcentagem de contas foram canceladas?

**Exemplo:**
```
100 contas no início
3 cancelaram durante o mês
Logo Churn = 3% ← Ruim (>5% é preocupante)

Se 100 contas de R$ 100 cada vs
1 conta de R$ 300:
- 1º caso: Perder 3 clientes = 3% logo churn
- 2º caso: Perder 1 cliente = 100% logo churn (mas revenue churn é só 300/100 = 3%)
```

**Meta saudável:** < 5% ao mês

---

##### 2️⃣ Revenue Churn
```
Valor: 1.8% (R$ 1.250 em receita perdida)
```

**O que significa:**
Que porcentagem da **receita** foi perdida?

**Por que é diferente de logo churn:**
```
Exemplo:
- 2 clientes pequenos cancelam: R$ 200/mês cada (-R$ 400)
- 1 cliente grande cancela: R$ 850/mês (-R$ 850)

Logo Churn = 3 contas / 100 = 3%
Revenue Churn = R$ 1.250 / R$ 70.000 MRR = 1.78%

O logo churn é maior, mas a receita perdida do cliente grande é importante!
```

**Meta saudável:** < 3% ao mês

---

##### 3️⃣ NRR (Net Revenue Retention) - Revisado
```
Valor: 105.3%
```

**Fórmula (simplificada):**
```
NRR = [(MRR anterior - Churn + Expansion) / MRR anterior] × 100
```

Se NRR > 100%: Você está ganhando mais que perdendo (bom!)
Se NRR < 100%: Está perdendo mais que ganhando (ruim!)

---

#### 📊 Gráfico 1: Comparação de Churn (Bar + Line)

Mostra os 2 tipos lado a lado:
- **Barras** = Logo Churn (número de contas)
- **Linha** = Revenue Churn (R$ de receita)

**O que analisar:**
- Se houver divergência grande (logo churn 5%, revenue churn 2%), significa que clientes pequenos estão saindo mas clientes grandes estão ficando ✅
- Se ambos crescem juntos → Problema estrutural

---

#### 📊 Gráfico 2: Motivos de Cancelamento (Rosca)

```
Caro demais          40%  (16 contas)
Não usava            35%  (14 contas)
Mudança de empresa   15%  (6 contas)
Não deu suporte      10%  (4 contas)
```

**O que analisar:**
- "Caro demais" → Talvez preço está desalinhado
- "Não usava" → Onboarding fraco ou produto fraco
- "Mudança de empresa" → Normal, não é problema
- "Sem suporte" → Problem, precisa melhorar CS

**Para ensinar:** "Churn não é acaso. Cada cancelamento tem um motivo. Se 40% diz 'caro demais', vocês sabem exatamente o que consertar!"

---

## 3️⃣ PAGE: Clientes (3 Abas)

### Aba 1: Crescimento

#### 📊 KPI 1: Net New Accounts
```
Valor: +12 contas
Cálculo: 15 novos - 3 cancelados = +12
```

**O que significa:**
O crescimento LÍQUIDO de contas. Se ganha 15 mas perde 3, cresceu 12.

**Por que importa:**
- Mostra se o negócio está crescendo ou encolhendo
- Se for negativo (-5), significa que tem mais churn que novos clientes

---

#### 📊 KPI 2: Novos Cadastros
```
Valor: 15 contas
Variação: ↑ +25% vs período anterior
```

**O que significa:**
Quantas contas NOVAS foram criadas (não importa se viram clientes pagos).

**Por que é importante:**
- Mostra força do marketing/produto
- Se está crescendo, é bom sinal

---

#### 📊 KPI 3: Conversão Trial → Pago
```
Valor: 68% (10 de 15 converteram)
```

**O que significa:**
De todos que se cadastraram no trial, quantos viraram clientes pagos?

**Meta saudável:** > 60% é ótimo

**Exemplo prático:**
```
15 se cadastraram no trial
10 fizeram upgrade para plano pago (68%)
5 nunca pagaram (32% churn do trial)
```

**Para ensinar:** "Essa métrica mostra se o onboarding funciona. Se 68% viraram pagos, é porque o trial vence bem e o valor é claro. Se fosse 20%, teríamos problema sério."

---

#### 📈 Gráfico 1: Evolução de Contas (Área)

Mostra o número de NOVAS contas ao longo do tempo.

```
Dia 1:  5 contas novas
Dia 2:  3 contas novas
Dia 3:  7 contas novas
...
Tendência: Crescimento ou queda?
```

**O que analisar:**
- Se está subindo → Marketing/product virality funcionando
- Se está caindo → Tem algo errado (mudança de algoritmo, feedback negativo, etc.)

---

#### 📊 Gráfico 2: Aquisição vs Churn (Barras Agrupadas)

Mostra lado a lado:
- **Verde:** Contas novas
- **Vermelho:** Contas canceladas

```
Semana 1:  Novas: 7   Canceladas: 1   (Ganho: +6) ✅
Semana 2:  Novas: 4   Canceladas: 3   (Ganho: +1) ⚠️
Semana 3:  Novas: 2   Canceladas: 4   (Ganho: -2) 🔴
```

**O que analisar:**
- Linha verde deve estar acima da vermelha
- Se vermelha ultrapassar verde → Problema sério

**Para ensinar:** "Vejam o padrão - semanas 1 e 2 foram boas, mas semana 3 ficou ruim. Que houve? Lançamento da concorrência? Mudança na equipe de suporte? Investigar!"

---

### Aba 2: Retenção

#### 📊 KPI 1: Taxa de Retenção
```
Valor: 97.9%
Interpretação: ↑ Excelente (>95%)
```

**O que significa:**
De todas as contas que você tinha no mês anterior, quantas continuam pagando?

**Fórmula:**
```
Retenção = (Contas no final - Novas contas) / Contas no início × 100

Exemplo:
Início: 100 contas
Fim: 103 contas
Novos: 8 contas

Retenção = (103 - 8) / 100 × 100 = 95%
```

**O que significa cada cenário:**

| Taxa | Interpretação | Status |
|------|---------------|--------|
| > 95% | Clientes muito felizes | 🚀 Excelente |
| 90-95% | Bom, clientes ficam | ✅ Saudável |
| 85-90% | Aceitável, mas investigar | ⚠️ Atenção |
| < 85% | Problema sério | 🔴 Crítico |

**Exemplo prático:**
```
100 clientes em jan
2 cancelaram em fev
Retenção = 98%

Se 10 tivessem cancelado:
Retenção = 90%
```

**Para ensinar:** "Retenção de 97.9% significa que seu produto está grudando. Os clientes estão felizes. Manter isso é mais importante que trazer novos clientes."

---

#### 📊 KPI 2: Lifetime Value (LTV)
```
Valor: R$ 2.450
Interpretação: Cliente permanece ~12 meses
```

**O que significa:**
Quanto dinheiro um cliente TÍPICO gera durante toda a sua vida usando sua plataforma?

**Fórmula simplificada:**
```
LTV = (ARPU × Tempo médio de permanência)

Exemplo:
- ARPU (Average Revenue Per User) = R$ 200/mês
- Tempo médio = 12 meses
- LTV = R$ 200 × 12 = R$ 2.400
```

**Por que importa:**
```
Se LTV = R$ 2.400 e CAC (custo de aquisição) = R$ 500:
LTV/CAC = 4.8x (excelente!)

Regra de ouro: LTV deve ser 3x o CAC
```

**Para ensinar:** "Se você gasta R$ 500 para trazer um cliente que gera R$ 2.400, a conta bate. Cada real gasto em marketing retorna 4.8 reais em receita."

---

#### 📈 Gráfico 1: Taxa de Retenção ao Longo do Tempo

Linha mostrando como a retenção varia mês a mês.

```
Jan: 96%
Fev: 97%
Mar: 97.5%
Abr: 97.9%

Tendência: Subindo = Melhor ✅
```

**O que analisar:**
- Se está caindo → Tem churn crescendo, investigar
- Se está estável → Bom, produto é sticky
- Se está subindo → Ótimo, melhorias estão funcionando

---

#### 📊 Gráfico 2: Retenção por Cohort (Barras Horizontais)

Mostra como clientes retidos variam conforme o tempo.

```
Cohort Jan (clientes de jan):
├── Mês 1 (fev): 98% continuam ████████
├── Mês 3 (abr): 92% continuam ██████████
├── Mês 6 (jul): 85% continuam ████████
└── Mês 12 (jan+1): 73% continuam ████

Cohort Feb (clientes de fev):
├── Mês 1 (mar): 97% continuam
├── Mês 3 (mai): 91% continuam
├── Mês 6 (ago): 84% continuam
└── Mês 12 (fev+1): 72% continuam
```

**O que analisar:**
- **Todos os cohorts caem com o tempo:** Normal! Alguns clientes sempre saem
- **Todos os cohorts caem juntos:** Bom, significa que a retenção é consistente
- **Alguns cohorts caem mais:** Investigar o que mudou naquele período

**Padrão esperado:**
```
Mês 1: 95% (alguns desistem logo)
Mês 3: 85% (clientes indecisos já saíram)
Mês 6: 75% (os que ficaram até aqui geralmente ficam)
Mês 12: 65% (core de clientes loyal)
```

**Para ensinar:** "Vejam só - dos clientes de janeiro, 98% ficaram em fevereiro, mas só 73% ficaram um ano depois. Isso é NORMAL. O importante é que todos os cohorts seguem o mesmo padrão - significa que você tem um produto consistente."

---

### Aba 3: Em Risco ⚠️

#### O que é "Em Risco"?

Contas que podem cancelar nos próximos dias/semanas.

**2 categorias:**

##### 1️⃣ Past Due (Pagamento Atrasado)
```
Exemplo: Empresa ABC
├── Status: Past Due há 5 dias
├── MRR: R$ 299/mês
└── Risco: Cancelamento em 7+ dias se não resolver
```

**O que significa:**
O cartão foi rejeitado. Stripe está tentando cobrar novamente, mas falhou.

**Por que é risco:**
- Em 7 dias, Stripe para de tentar
- Se não resolver, conta é cancelada automaticamente
- AÇÃO URGENTE: Customer Success deve entrar em contato HOJE

**Cenários:**
```
- Cartão expirou? → Pedir para atualizar
- Fundos insuficientes? → Ajudar com plano menor
- Fraude? → Contato com Stripe
```

---

##### 2️⃣ Dormant (Dormentes)
```
Exemplo: Empresa XYZ
├── Último login: 21 dias atrás
├── MRR: R$ 599/mês
└── Risco: Cancelamento quando lembrar da cobrança
```

**O que significa:**
Usuário não faz login há 14+ dias.

**Por que é risco:**
- Esqueceu que paga? Pode cancelar quando vir a cobrança
- Problema com produto? Procurando alternativa?
- Está ocupado e vai esquecendo?

**AÇÃO:** Customer Success deve fazer contato educado ("Ó, não via você!")

---

#### 📊 KPI: Sumário de Risco

```
Total em Risco: 5 contas (3.9% do total)
├── Past Due: 2 contas
│   └── Risco immediato (5+ dias sem pagar)
└── Dormant: 3 contas
    └── Risco médio (14+ dias sem login)
```

**Meta saudável:**
- Total em risco < 5% é bom
- Se > 10%, tem problema estrutural

---

#### 📋 Gráfico: Lista de Contas em Risco

**Na mobile:** Cards com informações
```
┌─────────────────────┐
│ Empresa ABC         │
│ Past Due - 5 dias   │
│ MRR: R$ 299/mês     │
│ [Ver Detalhes →]    │
└─────────────────────┘
```

**Na desktop:** Tabela com colunas
```
| Empresa | Tipo      | Dias | MRR     | Último Login | Ação |
|---------|-----------|------|---------|--------------|------|
| ABC     | past_due  | 5    | R$ 299  | 17/12        | →    |
| XYZ     | dormant   | 21   | R$ 599  | 01/12        | →    |
```

**O que analisar:**
- **Quantas "past_due"?** Problema de cobrança (alto impacto, ação imediata)
- **Quantas "dormant"?** Problema de produto/engagement (médio impacto, educação)
- **MRR grande em risco?** Prioridade: foco nos clientes que geram mais receita
- **Tendência crescendo?** Algo está errado no produto ou suporte

**Para ensinar:** "Essas 5 contas são o meu TMV: Target de Melhorias em Valor. Se conseguirem reativar só 2, já são R$ 900/mês de receita salva. Esse é o trabalho que não aparece, mas salva o SaaS."

---

## 📊 Como Usar Este Dashboard

### Para Você (Como Fundador)

**Reunião Semanal:**
```
1. Overview → Olha MRR, NRR e a tendência
2. Financeiro → Tab de Churn → Investigar logo/revenue churn
3. Clientes → Tab Em Risco → Prioridades de CS
```

**Reunião Mensal:**
```
1. Overview → MRR cresceu? Quanto?
2. Financeiro → MRR Breakdown → De onde veio o crescimento? (novo, expansão)
3. Clientes → Retenção → Está estável ou caindo?
```

**Pitch para Investidor:**
```
Mostre:
- NRR > 100% (expansão > churn)
- MRR crescimento consistente
- Retenção > 90%
- Logo churn < 5%
```

---

### Para Ensinar seus Alunos

**Aula 1: Entender o Negócio**
```
"SaaS tem dinâmica diferente. Não é vender 100 produtos e pronto.
É trazer 1 cliente, manter 1 cliente, fazer 1 cliente pagar mais.
Essas métricas mostram isso."
```

**Aula 2: Analisar Saúde**
```
"Abram a Overview. MRR está subindo?
NRR está > 100%?
Se sim, negócio está crescendo.
Se não, tem problema."
```

**Aula 3: Investigar Problemas**
```
"Logo churn está 8%? Muito! Isso significa 1 de cada 12 clientes sai.
Vão no tab Churn, veem os motivos, e vocês sabem exatamente o que consertar."
```

**Aula 4: Customer Success**
```
"Veem essas 5 contas em risco? Um bom CS entra em contato hoje,
salva 2 delas, economiza R$ 900/mês. Isso é mais eficiente que marketing."
```

---

## 🎯 Resumo: Métricas Críticas por Métrica

| Métrica | O que é | Meta Saudável | Ação se Ruim |
|---------|---------|---------------|--------------|
| **MRR** | Receita mensal | Crescimento constante | Investigar churn |
| **NRR** | Retenção + expansão | > 100% | Cortar churn |
| **Logo Churn** | % contas canceladas | < 5% / mês | CS + Product |
| **Revenue Churn** | % receita perdida | < 3% / mês | Investigar clientes grandes |
| **Retenção** | % contas que ficam | > 90% | Melhorar produto |
| **LTV** | Valor total do cliente | LTV/CAC > 3 | Aumentar preço ou tempo |
| **Contas em Risco** | Prestes a cancelar | < 5% | CS intervention |

---

## 🚀 Próximas Ações

1. **Acessar o Dashboard:**
   - Navegar para `/manager` (Super Admin)
   - Ir em "Metrics" na sidebar
   - Escolher Overview, Financeiro ou Clientes

2. **Filtrar Dados:**
   - Usar presets: 7d, 30d, 90d
   - Ou selecionar data custom

3. **Analisar Tendências:**
   - Compare período com período
   - Veja o gráfico, não só os números
   - Procure padrões e anomalias

4. **Tomar Ação:**
   - MRR caindo? → Foco em retenção/churn
   - Retenção baixa? → Melhorar onboarding
   - Contas em risco? → CS entrar em contato

---

**Documento criado em:** 2025-12-22
**Feature:** F0007-manager-metrics-dashboard
**Referência:** `docs/features/F0007-manager-metrics-dashboard/`

