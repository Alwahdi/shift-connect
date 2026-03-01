# @syndeocare/i18n

Internationalization package — English & Arabic with RTL support.

## Overview

- **Library**: i18next + react-i18next
- **Languages**: English (en), Arabic (ar)
- **RTL**: Full right-to-left support for Arabic
- **Detection**: Browser language auto-detection

## Structure

```
i18n/
├── src/
│   ├── index.ts                 # i18next configuration
│   ├── locales/
│   │   ├── en.json              # English translations (~1000 keys)
│   │   └── ar.json              # Arabic translations (~1000 keys)
│   ├── hooks/
│   │   └── useDirection.ts      # RTL/LTR hook
│   └── types.ts                 # Translation key types
└── package.json
```

## Translation Guidelines

### Terminology Standards

| English | Arabic | Notes |
|---------|--------|-------|
| Health Facility | المنشأة الصحية | NOT "العيادة" |
| Health Professional | المختص الصحي | NOT "المهني" |
| Shift | الوردية | Work shift |
| Booking | الحجز | Appointment |
| Dashboard | لوحة التحكم | Control panel |
| Onboarding | إعداد الحساب | Account setup |
| Verification | التحقق | Document/identity |
| YER (currency) | ر.ي | Yemeni Rial |

### Rules

1. Use consistent terminology (see table above)
2. No duplicate top-level keys
3. Nest logically: `chat.messages`, `chat.typing`, etc.
4. Use interpolation for dynamic values: `{{count}} shifts`
5. Test both LTR and RTL layouts

## Usage

```tsx
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  
  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <h1>{t("dashboard.title")}</h1>
      <p>{t("shifts.found", { count: 5 })}</p>
    </div>
  );
}
```
