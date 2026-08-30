# platform/

Blueprints reutilizáveis da fundação. Não são produtos.

Quando existir código:

- `spa-nginx/` — Dockerfile canônico SPA → nginx (console Fase 1–2)
- `oauth2-proxy/` — padrão já usado em Draw, control, vserver
- `swarm/stack.template.yml` — sem IP como primeira opção
- `tunnel/` — publicar hostname no túnel + CNAME

Até lá, o rito está em [docs/add-a-service.md](../docs/add-a-service.md).
