/**
 * Edge Function Shared: CORS Headers
 *
 * All edge functions must include these headers
 * for browser requests to succeed.
 */
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Handle CORS preflight request.
 * Use at the top of every edge function:
 *
 * ```ts
 * if (req.method === "OPTIONS") {
 *   return handleCors();
 * }
 * ```
 */
export function handleCors(): Response {
  return new Response(null, { headers: corsHeaders });
}
