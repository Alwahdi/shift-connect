import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface VerifyOTPRequest {
  email: string;
  code: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code }: VerifyOTPRequest = await req.json();

    if (!email || !code) {
      throw new Error("Email and code are required");
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the verification code
    const { data: verificationCode, error: fetchError } = await supabase
      .from("email_verification_codes")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("code", code)
      .single();

    if (fetchError || !verificationCode) {
      // Increment attempts counter for this email if code exists but doesn't match
      const { data: existingCodes } = await supabase
        .from("email_verification_codes")
        .select("id, attempts")
        .eq("email", email.toLowerCase())
        .order("created_at", { ascending: false })
        .limit(1);

      if (existingCodes && existingCodes.length > 0) {
        const currentAttempts = existingCodes[0].attempts || 0;
        
        // Check if max attempts reached (5 attempts)
        if (currentAttempts >= 4) {
          // Delete the code after max attempts
          await supabase
            .from("email_verification_codes")
            .delete()
            .eq("id", existingCodes[0].id);
          
          return new Response(
            JSON.stringify({ 
              error: "Too many failed attempts. Please request a new code.",
              maxAttemptsReached: true 
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            }
          );
        }

        // Increment attempts
        await supabase
          .from("email_verification_codes")
          .update({ attempts: currentAttempts + 1 })
          .eq("id", existingCodes[0].id);
      }

      return new Response(
        JSON.stringify({ error: "Invalid verification code" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if already verified
    if (verificationCode.verified) {
      return new Response(
        JSON.stringify({ error: "Code already used" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if expired
    const expiresAt = new Date(verificationCode.expires_at);
    if (expiresAt < new Date()) {
      // Delete expired code
      await supabase
        .from("email_verification_codes")
        .delete()
        .eq("id", verificationCode.id);

      return new Response(
        JSON.stringify({ error: "Verification code has expired. Please request a new one." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Mark as verified
    await supabase
      .from("email_verification_codes")
      .update({ verified: true })
      .eq("id", verificationCode.id);

    // Clean up - delete the code after successful verification
    await supabase
      .from("email_verification_codes")
      .delete()
      .eq("id", verificationCode.id);

    console.log("OTP verified successfully for:", email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email verified successfully",
        email: email.toLowerCase()
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in verify-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
