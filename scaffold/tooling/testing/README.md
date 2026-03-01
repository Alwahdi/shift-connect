# @syndeocare/testing

Shared testing utilities and configuration for SyndeoCare.

## Test Stack

| Tool | Purpose |
|------|---------|
| **Vitest** | Unit & integration tests |
| **Testing Library** | React component tests |
| **Playwright** | End-to-end tests |
| **MSW** | API mocking |

## Structure

```
testing/
├── src/
│   ├── setup.ts                 # Test setup (vi globals, mocks)
│   ├── render.tsx               # Custom render with providers
│   ├── mocks/
│   │   ├── supabase.ts          # Supabase client mock
│   │   ├── auth.ts              # Auth context mock
│   │   └── handlers.ts          # MSW request handlers
│   ├── fixtures/
│   │   ├── users.ts             # Test user data
│   │   ├── shifts.ts            # Test shift data
│   │   └── bookings.ts          # Test booking data
│   └── utils.ts                 # Test helpers
├── vitest.config.ts
└── playwright.config.ts
```

## Custom Render

```tsx
// render.tsx — wraps components with all providers
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "@syndeocare/auth";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

export function renderWithProviders(ui: React.ReactElement, options = {}) {
  return render(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AuthProvider>{children}</AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    ),
    ...options,
  });
}
```

## Running Tests

```bash
pnpm test              # Run all unit tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage report
pnpm test:e2e          # Run Playwright E2E
pnpm test:e2e:ui       # Playwright UI mode
```
