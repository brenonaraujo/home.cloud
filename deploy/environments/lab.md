# Lab Brenon — inventory (sem segredos)

Referência para quem opera **esta** casa. Um clone didático substitui os valores.

| Peça | Valor |
|------|--------|
| Zona | `brenon.cloud` |
| Túnel | `home-server` UUID `5ea9935b-fac5-4161-a6b0-6c1afaf4bce3` |
| DNS do túnel | `{uuid}.cfargotunnel.com` proxied |
| Swarm / Portainer | endpoint lab; manager na LAN |
| Node GPU | label `vserver` |
| IdP | `https://auth.brenon.cloud` |
| Control | `https://control.brenon.cloud` |
| Site empresa | `https://brenon.cloud` (Netlify) |
| Kong | `https://api.brenon.cloud` |
| HaaS edge | Traefik publicado no manager; hosts `agent-{nome}.brenon.cloud` |
| Segredos | fora do git (`~/.hermes/secrets` no operador) |

Não há CNAME curinga de zona. Um registro por slug de tenant.

Tokens, senhas e `DATABASE_URL` **não** pertencem a este arquivo.
