# @syndeocare/docs

Documentation site for SyndeoCare platform — for developers, admins, and integrators.

## Overview

- **Framework**: Vitepress or Docusaurus (recommended)
- **Recommended subdomain**: `docs.syndeocare.ai`
- **Content**: MDX files

## Sections

1. **Getting Started** — Quick start, setup, first steps
2. **For Professionals** — How to create a profile, find shifts, manage bookings
3. **For Clinics** — How to post shifts, manage staff, handle payments
4. **For Admins** — Verification workflow, system configuration
5. **API Reference** — Edge function documentation
6. **Self-Hosting** — Deploy your own instance
7. **Contributing** — How to contribute

## Structure

```
docs/
├── content/
│   ├── getting-started/
│   │   ├── overview.md
│   │   ├── quickstart.md
│   │   └── concepts.md
│   ├── guides/
│   │   ├── professionals.md
│   │   ├── clinics.md
│   │   └── admins.md
│   ├── api/
│   │   ├── authentication.md
│   │   ├── shifts.md
│   │   ├── bookings.md
│   │   └── messaging.md
│   ├── deployment/
│   │   ├── cloud.md
│   │   ├── self-hosting.md
│   │   └── mobile.md
│   └── contributing/
│       ├── setup.md
│       └── guidelines.md
├── public/
│   └── images/
└── config.ts
```
