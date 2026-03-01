# @syndeocare/admin

Standalone admin dashboard for SyndeoCare platform management.

## Overview

- **Framework**: React 18 + Vite 5
- **Recommended subdomain**: `admin.syndeocare.ai`
- **Access**: Super admins and admins only

## Features

- User management (professionals & clinics)
- Document verification workflow
- System configuration (job roles, certifications, document types)
- Analytics & reporting dashboards
- Admin permissions management
- Audit logs

## Structure

```
admin/
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx         # Admin overview
│   │   ├── Users.tsx             # User management
│   │   ├── Documents.tsx         # Document verification
│   │   ├── Configuration.tsx     # System config
│   │   ├── Analytics.tsx         # Reports
│   │   └── AuditLog.tsx          # Activity log
│   ├── components/
│   │   ├── UserDetailSheet.tsx
│   │   ├── DocumentViewer.tsx
│   │   ├── PermissionsEditor.tsx
│   │   └── AdminNotes.tsx
│   └── hooks/
│       ├── useAdminPermissions.ts
│       └── useAuditLog.ts
├── vite.config.ts
└── env.ts
```

## Authorization Model

```
super_admin → Full access (manage other admins)
admin       → Scoped by admin_permissions table:
  ├── can_verify_professionals
  ├── can_verify_clinics
  ├── can_verify_documents
  ├── can_view_analytics
  └── can_manage_admins
```
