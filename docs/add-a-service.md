# Blueprint — nascer um serviço na casa

Isto é o analog de um *product account* + Service Catalog. **Não implementar daqui** até a Fase 1+ existir; o texto é o contrato do rito.

Workloads **não** entram neste git. Copiam o rito.

## 1. Classificar

Antes de qualquer container: é **plataforma** ou **produto**? Ver [taxonomy.md](./taxonomy.md).

- Plataforma → grupos staff, docs de fundação, blast radius alto.
- Produto → repo próprio, tile no catálogo só se o console deve mostrar.

Exemplo: object storage da casa (MinIO) = **plataforma**. Espaço de mídia/documentos da conta = **produto** (repo próprio, **não** este git). Não reusar o MinIO como oferta do membro. Tile **só** depois do catálogo publicar; o shell não inventa serviço. Ausência da oferta não é erro de carga.

## 2. Imagem

- Dockerfile reproduzível. Tag imutável no registry (`vX.Y.Z`, não só `latest` em produção).
- SPA: nginx com fallback para `index.html` (`platform/spa-nginx`, quando existir).
- Health na porta interna.

## 3. Stack

- Overlay da casa se precisar de Kong DNS; senão túnel no hostname.
- Alias de rede se Kong for o front máquina.
- **Sem** IP no compose como primeira opção.
- Placement combinado (`vserver` se GPU / política atual).
- Limites de memória/CPU escritos.

## 4. Borda

1. Porta publicada **ou** VIP que o túnel alcance.
2. Ingress no túnel `home-server`: hostname **explícito**, acima de `*.brenon.cloud` do HaaS, catch-all 404 por último.
3. CNAME na zona: um nome → UUID do túnel, proxied. Sem wildcard de zona.

## 5. Identidade

- Humanos no browser: OIDC nativo **ou** proxy na frente, nunca senha local como caminho feliz.
- Máquina a máquina: chave no gateway, nunca no browser.
- Site da empresa: sem proxy.

## 6. Catálogo

Se o membro deve ver tile:

- PUT no control plane com `id`, `name`, `launchUrl`, grupos, ícone, cor, `enabled`.
- Smoke `GET` catálogo com `Origin` do console.
- **Proibido** hardcode no SPA. Oferta ausente (catálogo não publicou) **não** é erro de carga — inclusive o espaço de mídia da conta.

## 7. Smoke (nessa ordem)

1. Saúde LAN.
2. `dig` público do hostname.
3. HTTPS público (título certo — porta compartilhada já mentiu).
4. WebSocket se houver, em `wss://host/...`, não porta nua.

Não declarar sucesso com LAN-only.

## 8. Falha esperada

O console / control podem estar down. O serviço **já publicado** deve continuar (data plane). Se não continuar, a dependência de runtime no control plane é o bug.

Tenant de mídia já existente: objeto já guardado e página já publicada continuam. Criar pasta, conceder, publicar ou destruir **pode** falhar — esperado. Recuperação **não** recria o tenant para “salvar” o acervo.
