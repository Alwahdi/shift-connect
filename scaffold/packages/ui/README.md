# @syndeocare/ui

Shared UI component library built on shadcn/ui + Tailwind CSS.

## Overview

This package contains all reusable UI components, design tokens, and styling utilities shared across SyndeoCare apps.

## Structure

```
ui/
├── src/
│   ├── components/              # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── toast.tsx
│   │   └── ...                  # 50+ components
│   ├── primitives/              # Custom primitives
│   │   ├── empty-state.tsx
│   │   ├── loading-button.tsx
│   │   ├── password-input.tsx
│   │   ├── role-selector.tsx
│   │   ├── skeleton-cards.tsx
│   │   └── verification-badge.tsx
│   ├── styles/
│   │   ├── globals.css          # CSS variables & tokens
│   │   └── tailwind.config.ts   # Shared Tailwind config
│   └── lib/
│       └── utils.ts             # cn() and utilities
├── package.json
├── tsconfig.json
└── index.ts                     # Barrel exports
```

## Usage

```tsx
import { Button, Card, Input } from "@syndeocare/ui";
import { cn } from "@syndeocare/ui/lib/utils";

export function MyComponent() {
  return (
    <Card>
      <Input placeholder="Search..." />
      <Button variant="default">Submit</Button>
    </Card>
  );
}
```

## Design Tokens

All colors use HSL CSS variables for theming:

```css
:root {
  --primary: 292 29% 33%;        /* Deep Purple #663C6D */
  --accent: 200 30% 47%;         /* Teal Blue #56849A */
  --success: 160 60% 40%;        /* Teal Green */
  --background: 200 20% 98%;     /* Cool White */
}
```

## Storybook

```bash
pnpm storybook     # Start Storybook on :6006
pnpm build:sb      # Build static Storybook
```
