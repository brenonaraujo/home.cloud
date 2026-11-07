# ADR-0004 — Design kit bc-ui sobre Tailwind

**Status:** accepted  
**Date:** 2026-11-06  
**Context:** a revisão de UX/UI e acessibilidade do console ([#44](https://github.com/brenonaraujo/home.cloud/issues/44)) encontrou três "marcas" numa jornada (logo e Authentik em verde-limão, console em azul, FAB do Hermes em laranja), tokens CSS declarados e nunca usados, padrões copiados dezenas de vezes (painel 26×, eyebrow 18×, botão secundário 16×) e texto informativo abaixo de 4,5:1.

**Decision:**
- O console tem um design kit próprio, **bc-ui**, em `apps/console/src/components/bc/`. Sem biblioteca de componentes externa e sem trocar a stack (Vue 3 + Tailwind, ADR-0002).
- Tokens vivem em CSS variables (`src/style.css`) e são expostos ao Tailwind em `tailwind.config.js`: `brand` (escala a partir do verde do logo, `#76b900` = 500), `info/success/warning/danger`, `surface`, `line`, `fg`, raios `control/card/overlay`, tipos `eyebrow/page-title/section-title`, durações `fast/base`.
- O accent do console passa a ser a cor da marca. Azul vira só `info`; laranja sai do FAB.
- Foco tem um estilo único em `:focus-visible`. Menus, diálogos e abas seguem os padrões do WAI-ARIA APG (`useMenu`, `useFocusTrap`, `BcTabs`).
- Telas não usam cor, raio ou tamanho de fonte "solto". Um teste (`test/design-kit.test.mjs`) falha se aparecer texto < 12px, `gray-500/600/700` em texto ou paleta crua (`blue-*`, `gray-*`, `amber-*`…) em `.vue`.
- A rota `/_kit` mostra todos os componentes e estados e só existe em `import.meta.env.DEV`.

**Consequences:**
- O teste antigo que fixava `--color-primary: #3b82f6` passa a fixar `#76b900`; a decisão "não ter uma segunda paleta lime" continua valendo: lime é a **única** paleta de accent.
- O tema do Authentik precisa usar a mesma escala `brand` para a jornada ficar com uma marca só. Isso mora fora deste app (customização do Authentik) e é acompanhado na issue.
- Componentes novos entram em `src/components/bc/`, aparecem em `/_kit` e são documentados em [docs/design-kit.md](../design-kit.md).
