# deploy/analytics

Umami: analytics de uso dos produtos da casa. Classe **plataforma**
(medição compartilhada; quem abre o painel é staff). Nasceu pelo rito de
[add-a-service.md](../../docs/add-a-service.md).

Uma instância mede vários produtos; cada produto é um *website* nela.
Sem cookies e sem terceiros: o dado fica no PostgreSQL desta stack.

| Peça | Valor |
|------|-------|
| Hostname | `https://analytics.brenon.cloud` |
| Stack Portainer | `analytics`, id 203, endpoint 3 (arquivo: `stack.yml`) |
| Imagem | `ghcr.io/umami-software/umami:3.5.0` (oficial, pública, tag fixa) |
| Banco | `postgres:18.4-alpine` próprio, volume `analytics_postgres_data`, nó com label `vserver` |
| Limites | Umami 768M / 1 CPU; PostgreSQL 512M / 1 CPU |
| Origem do túnel | `http://192.168.1.104:18092` (ingress do Swarm → `sso:4180`, o oauth2-proxy). No lab a malha só responde no nó que roda a task |
| Túnel | `home-server`, hostname explícito **acima** de `*.brenon.cloud` |
| DNS | CNAME `analytics` → `<uuid do túnel>.cfargotunnel.com`, proxied |
| Catálogo | serviço `analytics` no control plane, só `brenon-admins`; e `analytics` no catálogo de identidade (`brenon-cloud-identity`) |
| Identidade | SSO da casa: provider OIDC `analytics` no Authentik, grupo `brenon-admins`, por oauth2-proxy na stack (como o Konga). Ver *Entrada* abaixo |
| Telemetria | desligada (`DISABLE_TELEMETRY`, `DISABLE_UPDATES`): nada sai do lab |

## Segredos (fora do git, `~/.hermes/secrets`, modo 600)

| Arquivo | Conteúdo |
|---------|----------|
| `portainer.token` | access token do Portainer |
| `umami-postgres.password` | senha do PostgreSQL (gerada uma vez) |
| `umami-app.secret` | `APP_SECRET` do Umami (gerado uma vez) |
| `umami-oidc.secret` | client secret do provider `analytics` no Authentik |
| `umami-sso-cookie.secret` | segredo do cookie do oauth2-proxy (gerado uma vez) |
| `umami-admin.password` | senha de máquina do `admin` do Umami (gerada por `set-admin-password.sh`) |

## Entrada

Igual aos demais serviços: quem abre `analytics.brenon.cloud` passa pelo
Authentik e precisa estar em `brenon-admins`. Não há segundo login.

| Peça | Papel |
|------|-------|
| `sso` (oauth2-proxy) | único serviço publicado. Barra tudo, menos `GET /script.js` e `POST`/`OPTIONS /api/send`, que os sites medidos chamam de qualquer visitante |
| `bridge` | o Umami self-hosted não fala OIDC. O proxy entrega a rota `/login` a esta ponte, que entra no Umami como `admin` com a senha de máquina e grava a sessão no navegador. Só é alcançável por dentro do `sso` |
| `umami` | sem porta publicada |

Todos os admins compartilham o usuário `admin` do Umami. O login local
do Umami deixa de existir para quem vem de fora: `/login` nunca chega
nele.

## Nascer ou mudar a stack

```bash
deploy/analytics/create-stack.sh            # cria (uma vez)
UPDATE=1 deploy/analytics/create-stack.sh   # reaplica o stack.yml
```

Subir de versão: trocar a tag em `stack.yml` e reaplicar. As migrations
do Umami rodam na largada do container.

## Senha do admin

Ninguém a digita. `set-admin-password.sh` gera a senha (uma vez, em
`umami-admin.password`), grava só o hash bcrypt no banco por um job
one-off do Swarm, e a `bridge` a recebe pelo ambiente da stack.

```bash
deploy/analytics/set-admin-password.sh
UPDATE=1 deploy/analytics/create-stack.sh
```

Trocar: apagar o arquivo e rodar os dois comandos. As sessões abertas
caem na troca.

## Ligar um produto

1. No painel: Settings → Websites → Add website (nome e domínio).
2. Copiar o *Website ID*.
3. No produto, carregar `https://analytics.brenon.cloud/script.js` com
   esse id. No `profitt-v2` são duas variáveis
   (`NUXT_PUBLIC_ANALYTICS_URL`, `NUXT_PUBLIC_ANALYTICS_WEBSITE_ID`);
   ver o ADR-0049 de lá para as regras de consentimento. No site
   `brenon.cloud` são `VITE_ANALYTICS_URL` e
   `VITE_ANALYTICS_WEBSITE_ID`, só no contexto production do Netlify
   (o Vite grava no build). Qualquer uma vazia e o script não carrega.
   `?nocount=1` continua desligando a contagem naquele browser. Na
   console os mesmos nomes entram como build-arg do release
   (`platform/spa-nginx`); o smoke da CI não os recebe, então a imagem
   de teste não mede.

| Produto | Website ID |
|---------|------------|
| Profitt (`profitt.brenon.cloud`) | `5231d458-7c84-49e0-927b-17c6b9455022` |
| Site (`brenon.cloud`) | `db5485ed-47f0-433d-925e-342e60f8c477` |
| Console (`console.brenon.cloud`) | `3022cb3f-2a04-45e2-ad3f-d0926a01d544` |

O id não é segredo: aparece no HTML de toda página medida.

## Smoke (DoD é o público)

```bash
curl -sSI https://analytics.brenon.cloud/script.js   # 200 application/javascript (público)
curl -sS -o /dev/null -w '%{http_code}\n' -X POST -H 'content-type: application/json' -d '{}' https://analytics.brenon.cloud/api/send   # 400: chegou no Umami, sem portão
curl -sS -o /dev/null -w '%{http_code} %{redirect_url}\n' https://analytics.brenon.cloud/   # 302 para auth.brenon.cloud
```

Pelo navegador, logado como admin: abrir pelo console e cair direto no
painel, sem tela de login.

## Se cair

Os produtos seguem iguais: o script é carregado depois da página e uma
falha nele não quebra nada. Perde-se a medição do período.

## Pendências

- Backup: dump diário do PostgreSQL para o MinIO do lab. Até lá o
  volume é a única cópia.
- O coletor à mão do control plane (`POST /api/v1/analytics/collect`)
  não é mais chamado pelo site. Aposentar o endpoint quando o fonte
  dele estiver no checkout do control plane — hoje a rota responde em
  produção e o fonte não está no branch local.
