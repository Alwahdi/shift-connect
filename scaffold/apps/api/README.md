# @syndeocare/api

Edge functions (Supabase/Deno) powering the SyndeoCare backend API.

## Overview

- **Runtime**: Deno (Supabase Edge Functions)
- **Recommended subdomain**: `api.syndeocare.ai`
- **Auto-deployed**: Yes, via Supabase

## Functions

| Function | Method | Description |
|----------|--------|-------------|
| `send-email-notification` | POST | Send transactional emails |
| `send-otp-email` | POST | Send OTP verification codes |
| `verify-otp` | POST | Verify OTP codes |
| `delete-account` | POST | Account deletion workflow |

## Structure

```
api/
├── functions/
│   ├── send-email-notification/
│   │   └── index.ts
│   ├── send-otp-email/
│   │   └── index.ts
│   ├── verify-otp/
│   │   └── index.ts
│   └── delete-account/
│       └── index.ts
├── _shared/                     # Shared utilities
│   ├── cors.ts                  # CORS headers
│   ├── supabase.ts              # Admin client
│   └── response.ts              # Standard responses
└── tests/
    └── *.test.ts                # Deno tests
```

## Adding a New Function

```bash
# 1. Create the function directory
mkdir -p supabase/functions/my-function

# 2. Create index.ts
cat > supabase/functions/my-function/index.ts << 'EOF'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { data } = await req.json();
    
    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
EOF

# 3. Deploy (auto-deployed in Lovable Cloud)
```

## Environment Variables (Secrets)

```bash
RESEND_API_KEY=                  # Email sending
SUPABASE_SERVICE_ROLE_KEY=       # Admin access (auto-provided)
```
