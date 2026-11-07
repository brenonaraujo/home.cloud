# Design kit bc-ui

Kit de interface do console (`apps/console`). Decisão em [ADR-0004](./adr/0004-design-kit-bc-ui.md); origem em [#44](https://github.com/brenonaraujo/home.cloud/issues/44).

Ver ao vivo: `npm run dev` em `apps/console` e abrir `/_kit` (só existe em desenvolvimento).

## Tokens

Definidos como CSS variables em `src/style.css` e expostos ao Tailwind em `tailwind.config.js`.

### Cor

| Token | Valor | Uso |
|---|---|---|
| `brand-500` | `#76b900` | Accent: botão primário, item ativo, badge do plano. Texto sobre ele é `fg-inverse` (8,35:1). |
| `brand-300` / `brand-400` | `#b4e020` / `#95cf12` | Texto e ícones de destaque sobre superfícies escuras; anel de foco (`brand-400`). |
| `info` · `success` · `warning` · `danger` | escalas `sky` · `emerald` · `amber` · `red` | Só semântica: alertas, status, ações destrutivas. Azul não é accent. |
| `surface` | `#030712` | Fundo da página. |
| `surface-raised` | `#111827` | Painéis e cards. |
| `surface-overlay` | `#1f2937` | Menus, popovers, listas suspensas. |
| `surface-sunken` | preto a 30% | Poços (campo com prefixo, bloco de aviso). |
| `line` | branco a 10% | Divisórias decorativas. |
| `line-strong` | `#6b7280` | Borda de controle (≥ 3:1, WCAG 1.4.11). |
| `fg` | `#f9fafb` | Texto principal. |
| `fg-muted` | `#9ca3af` | Texto secundário (≥ 5,78:1 em qualquer superfície). |
| `fg-subtle` | `#8b93a1` | Dicas, hosts, eyebrows (≥ 4,74:1 em qualquer superfície). |

Contraste medido e travado em teste (`test/design-kit.test.mjs`).

### Forma, tipo e movimento

| Token | Valor |
|---|---|
| `rounded-control` · `rounded-card` · `rounded-overlay` | 6 · 8 · 12 px |
| `text-eyebrow` (+ `.text-eyebrow-label`) | 12 px, caixa alta, `fg-subtle` |
| `text-page-title` · `text-section-title` | 30 px · 18 px, semibold |
| `duration-fast` · `duration-base` | 150 · 200 ms; `prefers-reduced-motion` zera as transições |
| `min-h-target` · `min-w-target` | 44 px (alvo de toque) |
| foco | `outline: 2px brand-400` em `:focus-visible`, para todo controle |

## Componentes (`src/components/bc/`)

| Componente | Para quê |
|---|---|
| `BcButton` | `primary · secondary · ghost · danger · danger-ghost`, `sm · md`, `loading`, `icon-only`. Vira `<a>` com `href` e `router-link` com `to`. Com `target="_blank"` põe ícone ↗ e "(abre em nova aba)" para leitor de tela. |
| `BcPanel` | Painel com título, subtítulo e slot `action`. `flush` para listas; `tone="danger"` para zona de perigo. |
| `BcPageHeader` | Breadcrumb + eyebrow + título + subtítulo + slot `actions`. O `document.title` vem da rota (`meta.titleKey`) ou de `usePageTitle()`. |
| `BcServiceCard` · `BcServiceRow` | Card de serviço (card inteiro clicável, ações no rodapé) e linha de lista. |
| `BcField` + `BcInput` · `BcSelect` · `BcTextarea` · `BcCheckbox` | Rótulo, dica, erro (`role="alert"`) e nota; `BcInput` aceita `prefix` (`agent-`). |
| `BcAlert` | `info · success · warning · danger`; `role="status"` ou `alert`. |
| `BcBadge` · `BcStatus` | Badge por tom; status de instância (ponto + texto): Iniciando · Ativa · Parada · Erro. |
| `BcEmptyState` | Ícone, título, texto e ações. Usado no 404. |
| `BcSkeleton` · `BcSplash` | Carregamento de bloco; tela de boot/autenticação com logo. |
| `BcMenu` + `BcMenuItem` | Menu button (setas, Home/End, Esc devolve o foco). |
| `BcDialog` | Modal com trap de foco, Esc e retorno do foco. |
| `BcTabs` | Abas com setas/Home/End e `aria-controls`. |
| `BcDescriptionList` | Pares rótulo/valor. |
| `BcCopy` | Valor em mono com botão copiar e anúncio "Copiado". |

Composables: `usePlan()` (id, rótulo, cota, pago), `useMenu()`, `useFocusTrap()`, `usePageTitle()`, `useAnnouncer()` (região `aria-live` do shell).

## Regras

**Faça**
- Use `Bc*` para botão, painel, campo, alerta, badge, empty state, menu e diálogo.
- Uma ação primária por contexto. O resto é secundária ou vai para "Mais ações".
- Ações destrutivas ficam numa zona de perigo, no fim da página, com `BcDialog` e confirmação digitada quando apagam dados.
- Toda copy nova em `en` **e** `pt` (ADR-0001). Dinheiro em BRL sempre `pt-BR` (`R$ 29,90`).
- Texto voltado ao cliente: nada de paths, nomes de grupo ou instruções técnicas soltas; isso vai em "Detalhes técnicos" ou só para staff.

**Não faça**
- Paleta crua (`blue-600`, `gray-500`, `amber-300`…) ou `text-[10px]`/`text-[11px]` em telas. O teste do kit falha.
- `rounded-md/lg/xl` direto: use `rounded-control/card/overlay`.
- Cor como único sinal (lido/não lido, plano atual): sempre texto junto.
- Tirar o `outline` de foco sem pôr outro indicador visível.
