# SPEC.md — o que o home.cloud faz

Documento **funcional**. Descreve comportamento, regras e critérios de aceite. Não descreve linguagem, orquestrador, banco ou CDN.

Para o desenho técnico: [ARCHITECTURE.md](./ARCHITECTURE.md).  
Para o porquê (papers): [FOUNDATIONS.md](./FOUNDATIONS.md).  
Para o vocabulário de superfície: [docs/taxonomy.md](./docs/taxonomy.md).

---

## 1. Visão

Uma pessoa opera uma nuvem pequena (casa, lab, um cluster) com a mesma *clareza de papéis* de um provedor grande:

- existe uma **empresa** (site, blog, conversa com o mundo);
- existe uma **plataforma** (identidade, catálogo, borda, orquestração);
- existem **produtos** (aplicações isoladas que membros usam);
- existe um **console** (a porta de operação do membro).

O membro não precisa saber onde cada peça roda. Precisa saber: *onde eu entro*, *o que é meu*, *o que é da casa*, *o que continua funcionando se o painel cair*.

home.cloud é a **fundação** desse modelo. Não é cada produto. Não é o blog.

---

## 2. Personas

### Visitante

Chega no site da empresa. Lê, assina o boletim, joga um jogo público, vê status. Não precisa de conta.

### Membro

Tem identidade na casa. Pode ser plano livre ou pago. Vê o console, abre o que a conta autoriza, eventualmente comenta no site (futuro). Não opera a plataforma.

### Operador

Staff. Vê consoles de plataforma (identidade admin, orquestração, observabilidade). Pode impersonar operação de produto quando a regra do produto permitir. Não é “cliente pagante”.

### Outro construtor

Lê este repositório para montar uma casa parecida. Não usa a nuvem Brenon. Usa o modelo.

---

## 3. Glossário

| Termo | Significado |
|-------|-------------|
| **Empresa** | Superfície pública da pessoa/marca: blog, boletim, vitrine. Login opcional. |
| **Plataforma** | Serviços compartilhados de que os produtos dependem (identidade, catálogo, borda, orquestração). |
| **Produto** | Aplicação isolada. Pode morrer sozinha. Não é “a nuvem caiu”. |
| **Console** | Porta de operação do membro. Lista o que a conta pode abrir, billing, instâncias próprias. |
| **Control plane** | Criar, alterar, apagar, listar recursos. Painel, provisionamento, checkout. |
| **Data plane** | O recurso **já existente** cumprindo sua função (o chat da instância, o quadro, o DNS respondendo). |
| **Tenant** | Recurso isolado de um membro (ex.: instância de agente com hostname próprio). |
| **Estabilidade estática** | Se o control plane falha, o que já estava no ar continua. Não se recria nada para “salvar” o que já existe. |
| **Marca de produto** | Nome curto da nuvem (no caso Brenon: BRNN), distinto do blog pessoal. |

---

## 4. Escopo funcional

### 4.1 Empresa (site)

- Conteúdo público (blog, vitrine, jogos, trilha).
- Boletim por e-mail, com confirmação e descadastro.
- Um controle discreto “ir ao console”.
- Reconhecer membro logado (nome, sair) **sem** transformar o site num access portal.
- Futuro: comentários e outras funções de comunidade para quem tem conta. Fora desta especificação de fundação.

**Não faz:** billing, provisionar tenant, listar stacks da orquestração.

### 4.2 Console

- Exige identidade. Sem sessão, inicia o login da casa.
- Visão da conta: cumprimento, plano, atalhos recentes, favoritos. Não é outdoor de produto.
- Catálogo vivo: só o que o control plane publica e a conta tem permissão de ver.
- Abrir um serviço em nova superfície (nova aba / hostname do serviço).
- Billing do **plano da casa** (não o billing de outro produto).
- Criar / listar / abrir / destruir **uma** instância de agente (quando o plano incluir), com hostname da casa.
- Sair sempre aterrissa no site público, nunca num casco vazio de console.

**Não faz:** ser o blog; ser o admin do provedor de identidade para o membro comum; fingir fatura ou instância.

**Shell único, dois hosts:** o membro entra em `console.brenon.cloud`. A API e a UI staff ficam em `control.brenon.cloud`. Mesmo idioma visual. Sem fundir git. Sem 301 neste GO.

### 4.3 Plataforma (invisível para o visitante, visível para o operador)

- Uma identidade para todos os consoles da casa.
- Um catálogo de serviços (quem vê o tile, para onde lança).
- Borda pública dos hostnames da casa.
- Orquestração dos workloads.
- Observabilidade e página de saúde.
- Provisionar e destruir tenant de produto (HaaS) a pedido do console.

### 4.4 Produto

- Tem hostname próprio.
- Autorização própria (pode ser “qualquer conta”, “só staff”, “só dono do tenant”).
- Continua cumprindo a função **depois de provisionado**, mesmo se o console estiver fora.

---

## 5. Regras de negócio

1. **O site da empresa permanece público.** Identidade no site é opcional. Conteúdo de blog, jogo e status não pedem conta.
2. **O console exige identidade.** Sem sessão não há shell.
3. **Tiles vêm do catálogo da plataforma.** O console não inventa serviço que o catálogo não publicou.
4. **`*` no catálogo** significa “qualquer conta autenticada”, nunca um grupo de identidade chamado estrela.
5. **Staff ≠ cliente.** Grupo de operação não é plano pago. Plano pago não vira admin da casa.
6. **Uma instância de agente por conta**, quando o plano incluir. Plano livre não cria.
7. **Hostname de tenant é da casa**, com prefixo estável combinado (hoje: `agent-{nome}`). Nomes da plataforma são reservados.
8. **Destruir tenant zera tudo** que aquele tenant era (compute, volume, DNS, página, identidade daquele slug, registro). Recriar o mesmo nome não ressuscita dados.
9. **Control plane pode falhar.** Data plane já provisionado deve continuar. Falha do console não é falha do produto, a menos que o produto compartilhe a *mesma borda* e essa borda tenha caído — aí o aviso deve nomear a borda, não “o console”.
10. **Página de downtime (futuro) só fala em “plataforma”** para serviços da taxonomia de plataforma. Produto fora do ar é produto fora do ar.
11. **Logout do console** devolve a pessoa ao site público deslogada.
12. **Marca de produto** (`brnn`) não substitui o site da empresa. É linha de produto.

---

## 6. Histórias e aceite

### Visitante lê o blog

Como visitante, quero ler o blog sem conta, para conhecer a casa.  
**Aceite:** a página do artigo renderiza sem login. O boletim, se existir, é um formulário público.

### Membro abre o console

Como membro, quero um botão no site que me leva ao console, para operar o que é meu.  
**Aceite:** o destino é o hostname do console, não um caminho interno do blog. Se eu já tiver sessão na identidade da casa, não digito senha de novo. Se não tiver, vejo o login da casa.

### Membro vê só o que pode

Como membro no plano livre, não quero ver admin de identidade nem orquestração.  
**Aceite:** o catálogo filtrado pela sessão não mostra tiles de staff. Ausência de tile não é erro de carga.

### Operador vê plataforma

Como operador, quero os consoles de plataforma no mesmo shell, para não ter um favorito por ferramenta.  
**Aceite:** tiles de plataforma aparecem só para grupos de staff definidos no catálogo. Tile Control só staff, destino `https://control.brenon.cloud`. Plano pago não revela operação. **Shell único, dois hosts** — mesmo idioma visual no telefone (375 / 768 / 1280). Sem 301. Sem fundir git.

### Tenant sobrevive ao console

Como membro com instância já criada, quero conversar com ela mesmo se o painel do console estiver fora.  
**Aceite:** o hostname do tenant responde a saúde e ao chat com o console **parado**. Criar uma instância *nova* pode falhar — isso é control plane.

### Downtime honesto (futuro)

Como visitante no hostname do console quando o lab está morto, quero uma página que diga o que caiu.  
**Aceite:** a página não afirma que “todos os produtos caíram”. Separa plataforma de produto. Aponta para o site da empresa se ele estiver em outra superfície.

---

## 7. Não-objetivos desta versão da fundação

- Multi-região, três zonas de disponibilidade em casa.
- Mover o blog para o lab.
- Colocar oauth2 na frente do site da empresa.
- Relançar todos os produtos num domínio curto novo.
- Comentários no blog (vem depois, no site, com a identidade do site).
- Garantir que o console nunca caia (o contrário: o contrato *aceita* a queda até existir shell estático fora do lab).

---

## 8. Critérios de “fundação existe” (produto)

Medíveis sem apontar stack:

- [ ] Existe um documento que uma pessoa de fora lê e distingue empresa / plataforma / produto / console.
- [ ] O membro tem um hostname de console distinto do blog.
- [ ] O visitante continua no blog sem conta.
- [ ] Um tenant já criado responde com o console indisponível.
- [ ] O catálogo do membro não contém serviço que a plataforma não publicou.
