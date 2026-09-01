# AGENTS.md — home.cloud

Landing zone. **Documentação primeiro.** Não implementar `apps/` até o humano concordar com [ARCHITECTURE.md](./ARCHITECTURE.md) §9.

Ler nesta ordem: [README.md](./README.md) → [SPEC.md](./SPEC.md) → [FOUNDATIONS.md](./FOUNDATIONS.md) → [ARCHITECTURE.md](./ARCHITECTURE.md).

## Regras

1. Este git não recebe workloads (Oficina, TibiaPixel, …).
2. O site da empresa (`brenon.cloud`) não mora aqui.
3. Segredos nunca entram. `~/.hermes/secrets/` no operador.
4. Console = control plane UI. Pode cair. Tenant já criado = data plane.
5. Dois clients OIDC quando o console nascer. Não um client para os dois hosts.
6. Não `--wave 9` no IdP para um app novo. `--only <slug>`.
7. Não PUT compose git do control com senha mascarada.
8. Mermaid: labels com `/` ou `()` entre aspas.

## Status

F1 lab live em `https://console.brenon.cloud/`. Fase 4 (#8 301 no site) = **GO**. Fases 5–8 depois do épico #2.
