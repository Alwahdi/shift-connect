# SyndeoCare — Operations Runbook

## Common Issues & Solutions

### 1. Users Can't Sign Up

**Symptoms**: Sign-up form submits but user doesn't receive email
**Check**:
1. Check email service (Resend) status
2. Check edge function logs: `send-otp-email`
3. Verify RESEND_API_KEY is configured
4. Check email_verification_codes table for entries

**Fix**:
```sql
-- Check recent OTP codes
SELECT * FROM email_verification_codes 
ORDER BY created_at DESC LIMIT 10;

-- Clean expired codes
SELECT cleanup_expired_verification_codes();
```

### 2. Chat Messages Not Updating in Real-time

**Symptoms**: Users need to refresh to see new messages
**Check**:
1. Verify Realtime is enabled for messages table
2. Check browser console for WebSocket errors
3. Verify RLS policies allow reading messages

**Fix**:
```sql
-- Ensure realtime is enabled
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
```

### 3. Shift Search Returns No Results

**Symptoms**: Professional sees no shifts despite existing data
**Check**:
1. Verify PostGIS extension is enabled
2. Check user's location coordinates
3. Verify `find_shifts_within_distance` function exists
4. Check shift dates (might all be in the past)

**Fix**:
```sql
-- Check future shifts exist
SELECT COUNT(*) FROM shifts WHERE shift_date >= CURRENT_DATE;

-- Test distance function
SELECT * FROM find_shifts_within_distance(15.3694, 44.1910, 100);
```

### 4. Document Upload Fails

**Symptoms**: File upload shows error
**Check**:
1. Verify storage bucket exists
2. Check storage policies
3. Check file size (max 10MB)
4. Verify file type is allowed

**Fix**:
```sql
-- Check storage buckets
SELECT * FROM storage.buckets;

-- Check storage policies
SELECT * FROM pg_policies WHERE tablename = 'objects';
```

### 5. High Database Latency

**Symptoms**: Pages load slowly, queries timeout
**Check**:
1. Check active connections
2. Look for missing indexes
3. Check for large table scans

**Fix**:
```sql
-- Check slow queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 seconds'
AND state != 'idle';

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_shifts_date ON shifts(shift_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
```

## Monitoring

### Health Check

```bash
curl https://<project>.supabase.co/functions/v1/health-check
```

### Database Size

```sql
SELECT pg_size_pretty(pg_database_size('postgres'));
```

### Active Users (Last 24h)

```sql
SELECT COUNT(DISTINCT user_id) 
FROM auth.sessions 
WHERE created_at > now() - interval '24 hours';
```

## Contacts

| Role | Contact |
|------|---------|
| Platform Lead | admin@syndeocare.ai |
| Database Admin | dba@syndeocare.ai |
| On-Call Engineer | oncall@syndeocare.ai |
