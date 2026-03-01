# @syndeocare/design-tokens

Design system tokens following the W3C Design Tokens Community Group (DTCG) specification.

## Brand Identity

| Token | Value | Purpose |
|-------|-------|---------|
| Primary | `hsl(292, 29%, 33%)` / `#663C6D` | Deep Purple — Trust, healthcare |
| Accent | `hsl(200, 30%, 47%)` / `#56849A` | Teal Blue — Calm, professional |
| Success | `hsl(160, 60%, 40%)` | Teal Green — Positive actions |
| Warning | `hsl(45, 93%, 47%)` | Amber — Alerts |
| Destructive | `hsl(0, 84%, 60%)` | Red — Destructive actions |

## Token Architecture

```
Primitives (raw values)
  └── Semantics (intent-based)
      └── Components (component-specific)
```

## Structure

```
design-tokens/
├── src/
│   ├── primitives.ts            # Raw color, spacing, typography values
│   ├── semantics.ts             # action.primary, feedback.error, etc.
│   ├── components.ts            # button.size.lg, card.padding, etc.
│   └── index.ts                 # Bundle export
├── export/
│   ├── tokens.json              # Machine-readable JSON
│   ├── tokens.css               # CSS custom properties
│   └── tokens.figma.json        # Figma-compatible export
└── package.json
```

## oklch Alternative (Tailwind v4)

```css
:root {
  --primary: oklch(0.38 0.08 310);
  --accent: oklch(0.56 0.06 230);
  --success: oklch(0.52 0.1 165);
  --background: oklch(0.98 0.005 230);
  --sidebar: oklch(0.18 0.03 300);
}
```
