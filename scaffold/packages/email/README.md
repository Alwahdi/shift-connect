# @syndeocare/email

Email templates and sending utilities for SyndeoCare.

## Overview

- **Provider**: Resend (recommended) or SMTP
- **Templates**: React Email components
- **Types**: Transactional only (no marketing)

## Structure

```
email/
├── src/
│   ├── templates/
│   │   ├── welcome.tsx          # Welcome email
│   │   ├── otp.tsx              # OTP verification
│   │   ├── booking-confirmed.tsx
│   │   ├── booking-cancelled.tsx
│   │   ├── shift-invitation.tsx
│   │   ├── document-approved.tsx
│   │   ├── document-rejected.tsx
│   │   └── password-reset.tsx
│   ├── send.ts                  # Send email utility
│   └── config.ts                # Email configuration
└── package.json
```

## Template Example

```tsx
// templates/otp.tsx
import { Html, Head, Body, Container, Text } from "@react-email/components";

interface OTPEmailProps {
  code: string;
  name: string;
  language: "en" | "ar";
}

export function OTPEmail({ code, name, language }: OTPEmailProps) {
  const isRTL = language === "ar";
  return (
    <Html lang={language} dir={isRTL ? "rtl" : "ltr"}>
      <Head />
      <Body>
        <Container>
          <Text>{isRTL ? `مرحباً ${name}` : `Hello ${name}`}</Text>
          <Text style={{ fontSize: 32, fontWeight: "bold" }}>{code}</Text>
          <Text>
            {isRTL 
              ? "هذا الرمز صالح لمدة 10 دقائق" 
              : "This code is valid for 10 minutes"}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
```
