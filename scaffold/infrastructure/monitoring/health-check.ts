/**
 * ============================================================================
 * SyndeoCare — Health Check Edge Function
 * ============================================================================
 * 
 * Deploy as a Supabase Edge Function for uptime monitoring.
 * 
 * Usage: GET /functions/v1/health-check
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  checks: {
    database: boolean;
    auth: boolean;
    storage: boolean;
  };
  latency: {
    database_ms: number;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const startTime = Date.now();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // Check database connectivity
  let dbHealthy = false;
  let dbLatency = 0;
  try {
    const dbStart = Date.now();
    const { error } = await supabase.from("profiles").select("id").limit(1);
    dbLatency = Date.now() - dbStart;
    dbHealthy = !error;
  } catch {
    dbHealthy = false;
  }

  // Check auth service
  let authHealthy = false;
  try {
    const { error } = await supabase.auth.getSession();
    authHealthy = !error;
  } catch {
    authHealthy = false;
  }

  // Check storage
  let storageHealthy = false;
  try {
    const { error } = await supabase.storage.listBuckets();
    storageHealthy = !error;
  } catch {
    storageHealthy = false;
  }

  const allHealthy = dbHealthy && authHealthy && storageHealthy;
  const someHealthy = dbHealthy || authHealthy || storageHealthy;

  const health: HealthStatus = {
    status: allHealthy ? "healthy" : someHealthy ? "degraded" : "unhealthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    checks: {
      database: dbHealthy,
      auth: authHealthy,
      storage: storageHealthy,
    },
    latency: {
      database_ms: dbLatency,
    },
  };

  return new Response(JSON.stringify(health), {
    status: allHealthy ? 200 : 503,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
