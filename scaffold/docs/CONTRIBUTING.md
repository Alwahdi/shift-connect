# Contributing to SyndeoCare

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Install dependencies: `pnpm install`
4. Create a branch: `git checkout -b feature/my-feature`
5. Make changes and commit
6. Push and open a Pull Request

## Branch Naming

```
feature/  — New features
fix/      — Bug fixes
docs/     — Documentation
refactor/ — Code refactoring
test/     — Test additions
chore/    — Build, CI, tooling
```

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add shift invitation notifications
fix: resolve chat scroll on mobile
docs: update API reference
refactor: extract booking logic to hook
test: add unit tests for auth flow
chore: update dependencies
```

## Code Style

- **TypeScript**: Strict-ish (no `any` where possible)
- **React**: Functional components + hooks only
- **Styling**: Tailwind CSS + design tokens (never hardcoded colors)
- **State**: TanStack Query for server, React context for client
- **i18n**: Every user-facing string must be translated (en + ar)

## Pull Request Checklist

- [ ] Code follows project style
- [ ] Types are correct
- [ ] Translations added for both languages
- [ ] RTL layout works for Arabic
- [ ] RLS policies added for new tables
- [ ] Tests pass
- [ ] No console.log statements
- [ ] Responsive design (mobile + desktop)
