# FOUNDATIONS.md — papers da AWS viram invariantes

Não vamos “rodar AWS em casa”. Copiamos **invariantes** que a AWS documentou porque valem em qualquer nuvem — inclusive um lab de uma pessoa.

Bibliografia completa: [docs/papers.md](./docs/papers.md).

---

## 1. Os seis pilares (Well-Architected)

Usamos a linguagem. Não fingimos a barra de um hyperscaler.

| Pilar | O que prometemos neste lab |
|-------|----------------------------|
| Excelência operacional | Um jeito só de nascer hostname. Logs como stream. Status visível. Playbook quando a plataforma cai. |
| Segurança | Um IdP. Deny-by-default nos grupos. Site público sem proxy. Segredos fora do git. |
| Confiabilidade | Control plane ≠ data plane. Tenant existente não depende do console. Quotas do lab escritas (RAM, um túnel, um CNAME por slug). |
| Performance | Console é shell. Blog não mora no mesmo saco do Swarm. |
| Custo | Um lab, um túnel, site da empresa fora do lab. Sem fingir três AZs. |
| Sustentabilidade | Não replicar região. Estabilidade estática por honestidade, não por hardware. |

**Trade-off explícito:** custo e simplicidade > 99.99%. O console no lab **vai cair**. Isso não é regressão até existir shell estático fora do lab.

---

## 2. Control plane vs data plane

Da [Fault Isolation Boundaries](https://docs.aws.amazon.com/whitepapers/latest/aws-fault-isolation-boundaries/control-planes-and-data-planes.html) e do [Builders’ Library](https://aws.amazon.com/builders-library/static-stability-using-availability-zones/):

> Control plane cria, altera, apaga, lista. É orquestração complicada.  
> Data plane é a função do recurso já existente. É de propósito mais simples.  
> A meta de disponibilidade do data plane é **mais alta**.

| Ação | Plano |
|------|--------|
| Abrir o console, ver catálogo, Checkout, criar/apagar tenant | Control |
| Chat numa instância já criada, Draw já logado, DNS respondendo, container running | Data |
| Atualizar policy de DNS / criar CNAME novo | Control da borda |
| Resolver um CNAME que já existe | Data da borda |

[REL11-BP04](https://docs.aws.amazon.com/wellarchitected/2022-03-31/framework/rel_withstand_component_failures_avoid_control_plane.html): recuperação **não** chama o control plane. Se o lab treme, não é “abre o Portainer e recria o tenant”.

Detalhe aplicado: [docs/control-data-plane.md](./docs/control-data-plane.md).

---

## 3. Estabilidade estática

Do mesmo artigo do Builders’ Library:

> O sistema continua fazendo o que já fazia, mesmo se a dependência que *atualiza* o estado estiver morta. Pode não ver coisa nova. Não desfaz o que já funcionava.

Aplicação:

- Matar o console não mata `agent-alice`.
- Matar o control plane não mata o túnel nem o Kong já roteado.
- Se o **túnel** morre, isso é data plane de *borda*: some tudo que passa por ele. O blog na empresa (outra superfície) pode viver. A página de downtime futura tem que nomear a borda, não “o console”.

Não temos AZs. A analogia de “capacidade já provisionada” aqui é: **não dependa de criar stack na hora do incidente**.

---

## 4. Contas, OUs, landing zone

De [Organizing your AWS environment](https://docs.aws.amazon.com/whitepapers/latest/organizing-your-aws-environment/organizing-your-aws-environment.html) e Control Tower / SRA:

- Uma **conta** AWS é fronteira forte de IAM e fatura.
- **OUs fundacionais** (Security, Infrastructure) ≠ **OUs de workload**.
- A conta de management **não** roda produto.

No lab não há contas AWS. A fronteira é:

- um **hostname** público;
- uma **stack** na orquestração;
- **grupos** na identidade;
- um **repositório** de workload (não este).

Landing zone = este repositório + identidade + catálogo + blueprint `docs/add-a-service.md`.

Mapeamento: [docs/landing-zone.md](./docs/landing-zone.md).

---

## 5. Quotas são fundação

Reliability Foundations: quotas e topologia de rede *antes* do workload.

Quotas deste lab (não inventar outras):

- Um túnel Cloudflare (`home-server`) para quase toda a casa.
- **Sem** CNAME curinga de zona. Um registro por slug de tenant.
- Disco/RAM/CPU do agente: anunciados no plano (Basic 2 GB / 1 CPU / 5 GB; Pro 4 GB / 2 CPU / 20 GB). Disco de volume **não** é cota dura no orquestrador hoje — o anúncio é contrato de produto, não enforcement.
- Um node com GPU (rótulo `vserver`) para o que precisa GPU; o manager não é esse node.

Estourar quota não é “escala automática”. É recusar no control plane com mensagem clara.

---

## 6. Excelência operacional

Do pilar OE: o ambiente inteiro como código; observação que vira ação; humanos no caminho só quando o risco pede.

Aqui, hoje:

- Identidade as-code (aplicar um app, não reescrever todos os secrets).
- Catálogo vivo (PUT de serviço, não tile hardcoded no shell).
- Status (Uptime Kuma) como fonte da página de downtime futura.
- Playbook visível = `apps/status` (ainda não implementado).

O que *não* faremos no nome de OE: um segundo orquestrador “só para o console” no dia 1. O console nasce no lab, no rito dos outros apps. CF no front é fase posterior, de propósito.

---

## 7. O que recusamos dos papers

| Tentação | Por que não |
|----------|-------------|
| Três AZs no porão | Não temos três falhas independentes. Mentir no diagrama ensina errado. |
| Conta AWS de verdade como metáfora de billing | Stripe + grupos de plano já existem. Não duplicar. |
| IAM Identity Center clone | Authentik já é o IdP. Um. |
| Service Catalog da AWS | O catálogo Go em `control` já é o analog. |
| Multi-região | Um lab. Borda Cloudflare não é região nossa. |

A fundação é **honesta sobre escala 1**. O valor para outra pessoa é o *corte de responsabilidades*, não o hardware.
