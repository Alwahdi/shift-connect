import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface OTPRequest {
  email: string;
  type: "signup" | "login" | "reset";
}

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, type }: OTPRequest = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check rate limiting - max 1 OTP per minute per email
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const { data: recentCodes } = await supabase
      .from("email_verification_codes")
      .select("id")
      .eq("email", email.toLowerCase())
      .gte("created_at", oneMinuteAgo);

    if (recentCodes && recentCodes.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: "Please wait 1 minute before requesting another code",
          retryAfter: 60 
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Delete any existing codes for this email
    await supabase
      .from("email_verification_codes")
      .delete()
      .eq("email", email.toLowerCase());

    // Store OTP in database
    const { error: insertError } = await supabase
      .from("email_verification_codes")
      .insert({
        email: email.toLowerCase(),
        code,
        expires_at: expiresAt.toISOString(),
        verified: false,
        attempts: 0,
      });

    if (insertError) {
      console.error("Error storing OTP:", insertError);
      throw new Error("Failed to generate verification code");
    }

    // Get email subject based on type
    const subjects: Record<string, string> = {
      signup: "Verify your SyndeoCare account",
      login: "Your SyndeoCare login code",
      reset: "Reset your SyndeoCare password",
    };

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 16px; text-align: center; margin-bottom: 24px;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">SyndeoCare</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Healthcare Staffing Platform</p>
          </div>
          
          <div style="background: #f8fafc; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
            <h2 style="margin: 0 0 16px 0; color: #1e293b; font-size: 20px;">Your Verification Code</h2>
            <p style="margin: 0 0 16px 0; color: #64748b;">
              ${type === "signup" ? "Welcome to SyndeoCare! Use the code below to verify your email address." : 
                type === "login" ? "Use the code below to sign in to your account." :
                "Use the code below to reset your password."}
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; border: 2px dashed #e2e8f0;">
              <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #10b981;">${code}</span>
            </div>
            
            <p style="margin: 16px 0 0 0; color: #94a3b8; font-size: 14px; text-align: center;">
              This code expires in 15 minutes.
            </p>
          </div>
          
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            If you didn't request this code, you can safely ignore this email.
          </p>
        </body>
      </html>
    `;

    // Send email via Resend API using fetch
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SyndeoCare <onboarding@resend.dev>",
        to: [email],
        subject: subjects[type] || "Your verification code",
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json();
      console.error("Resend API error:", errorData);
      throw new Error("Failed to send verification email");
    }

    const emailResponse = await resendResponse.json();
    console.log("OTP email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Verification code sent",
        expiresAt: expiresAt.toISOString()
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-otp-email function:", error);
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
