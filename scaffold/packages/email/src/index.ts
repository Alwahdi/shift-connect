/**
 * @syndeocare/email — Email Templates & Sending
 *
 * Provides HTML email templates and a sending interface.
 * Uses Resend API from edge functions.
 */

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

const DEFAULT_FROM = "SyndeoCare <noreply@syndeocare.ai>";

/**
 * Send an email via Resend API.
 * Only call from edge functions (requires RESEND_API_KEY secret).
 */
export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; error?: string }> {
  const apiKey = typeof Deno !== "undefined" ? Deno.env.get("RESEND_API_KEY") : undefined;

  if (!apiKey) {
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: payload.from || DEFAULT_FROM,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      return { success: false, error: `Resend error: ${res.status} ${body}` };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ── Templates ───────────────────────────────────────────────────────────────

export function otpEmailTemplate(code: string, expiryMinutes: number): string {
  return `
<!DOCTYPE html>
<html dir="ltr" lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family: 'Cairo', Arial, sans-serif; background: #f8fafc; padding: 40px 0;">
  <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #663C6D; font-size: 24px; margin: 0;">SyndeoCare</h1>
      <p style="color: #64748b; margin-top: 8px;">Healthcare Staffing Platform</p>
    </div>
    <h2 style="color: #2D1F33; font-size: 20px; text-align: center;">Verification Code</h2>
    <div style="background: #f1f5f9; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #663C6D;">${code}</span>
    </div>
    <p style="color: #64748b; text-align: center; font-size: 14px;">
      This code expires in ${expiryMinutes} minutes.<br/>
      If you didn't request this, please ignore this email.
    </p>
  </div>
</body>
</html>`;
}

export function welcomeEmailTemplate(name: string, role: string): string {
  const roleLabel = role === "clinic" ? "Health Facility" : "Healthcare Professional";
  return `
<!DOCTYPE html>
<html dir="ltr" lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family: 'Cairo', Arial, sans-serif; background: #f8fafc; padding: 40px 0;">
  <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #663C6D; font-size: 24px; margin: 0;">SyndeoCare</h1>
    </div>
    <h2 style="color: #2D1F33; text-align: center;">Welcome, ${name}! 🎉</h2>
    <p style="color: #374151; text-align: center;">
      Your account has been created as a <strong>${roleLabel}</strong>.
    </p>
    <p style="color: #64748b; text-align: center; font-size: 14px;">
      Complete your profile to get started on the platform.
    </p>
    <div style="text-align: center; margin-top: 24px;">
      <a href="https://app.syndeocare.ai/dashboard" style="background: #663C6D; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
        Go to Dashboard
      </a>
    </div>
  </div>
</body>
</html>`;
}
