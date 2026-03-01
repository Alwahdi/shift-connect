# SyndeoCare — Security Best Practices

## Principles

1. **Zero Trust**: Every request is authenticated and authorized
2. **Least Privilege**: Users only access what they need
3. **Defense in Depth**: Multiple layers of protection
4. **Secure by Default**: New tables get RLS automatically

## Authentication

- ✅ Email verification required (no auto-confirm)
- ✅ OTP codes expire after 10 minutes
- ✅ Maximum 3 OTP attempts before lockout
- ✅ Passwords stored as bcrypt hashes (Supabase Auth)
- ✅ JWT tokens with short expiry
- ❌ Never store tokens in localStorage (use httpOnly cookies in production)
- ❌ Never expose service role key to client

## Row Level Security (RLS)

Every table MUST have RLS enabled. No exceptions.

```sql
-- Template for new tables
ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users access own data"
ON public.new_table
FOR ALL
USING (auth.uid() = user_id);
```

## Environment Variables

| Variable | Visibility | Notes |
|----------|-----------|-------|
| SUPABASE_URL | Client (VITE_) | Public, safe to expose |
| SUPABASE_ANON_KEY | Client (VITE_) | Public, safe to expose |
| SUPABASE_SERVICE_ROLE_KEY | Server only | NEVER expose to client |
| RESEND_API_KEY | Server only | Edge functions only |

## Checklist for New Features

- [ ] RLS policies on all new tables
- [ ] Input validation (Zod schemas)
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (React auto-escapes)
- [ ] CSRF protection (SameSite cookies)
- [ ] Rate limiting on sensitive endpoints
- [ ] Audit logging for admin actions
- [ ] File upload validation (type, size)
- [ ] CORS properly configured

## Incident Response

1. **Detect**: Monitor error rates, auth failures, unusual patterns
2. **Contain**: Disable affected features / revoke compromised tokens
3. **Investigate**: Check auth logs, database logs, edge function logs
4. **Fix**: Patch vulnerability, update RLS policies
5. **Document**: Post-incident report, update runbook
