import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EmailNotificationRequest {
  type: "new_message" | "new_job" | "booking_update" | "document_status";
  recipientEmail: string;
  recipientName: string;
  data: {
    senderName?: string;
    jobTitle?: string;
    clinicName?: string;
    distance?: string;
    hourlyRate?: string;
    bookingStatus?: string;
    documentName?: string;
    documentStatus?: string;
  };
}

const getEmailTemplate = (type: string, data: any, recipientName: string) => {
  const baseStyle = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  `;

  const headerStyle = `
    background: linear-gradient(135deg, #663C6D 0%, #56849A 100%);
    color: white;
    padding: 30px;
    text-align: center;
    border-radius: 12px 12px 0 0;
  `;

  const contentStyle = `
    background: #ffffff;
    padding: 30px;
    border: 1px solid #e5e5e5;
    border-top: none;
    border-radius: 0 0 12px 12px;
  `;

  const buttonStyle = `
    display: inline-block;
    background: linear-gradient(135deg, #663C6D 0%, #56849A 100%);
    color: white;
    padding: 14px 28px;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    margin-top: 20px;
  `;

  switch (type) {
    case "new_message":
      return {
        subject: `New Message from ${data.senderName}`,
        html: `
          <div style="${baseStyle}">
            <div style="${headerStyle}">
              <h1 style="margin: 0; font-size: 24px;">New Message</h1>
            </div>
            <div style="${contentStyle}">
              <p style="font-size: 16px; color: #333;">Hi ${recipientName},</p>
              <p style="font-size: 16px; color: #333;">
                You have received a new message from <strong>${data.senderName}</strong>.
              </p>
              <a href="https://syndeocareapp.lovable.app/messages" style="${buttonStyle}">
                View Message
              </a>
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Best regards,<br>The SyndeoCare Team
              </p>
            </div>
          </div>
        `,
      };

    case "new_job":
      return {
        subject: `New Job Opportunity Near You - ${data.jobTitle}`,
        html: `
          <div style="${baseStyle}">
            <div style="${headerStyle}">
              <h1 style="margin: 0; font-size: 24px;">New Job Alert!</h1>
            </div>
            <div style="${contentStyle}">
              <p style="font-size: 16px; color: #333;">Hi ${recipientName},</p>
              <p style="font-size: 16px; color: #333;">
                A new shift has been posted near your location that matches your profile!
              </p>
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #663C6D;">${data.jobTitle}</h3>
                <p style="margin: 5px 0; color: #333;">📍 ${data.clinicName}</p>
                <p style="margin: 5px 0; color: #333;">📏 ${data.distance} away</p>
                <p style="margin: 5px 0; color: #333;">💰 $${data.hourlyRate}/hour</p>
              </div>
              <a href="https://syndeocareapp.lovable.app/shifts" style="${buttonStyle}">
                View Shift Details
              </a>
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Best regards,<br>The SyndeoCare Team
              </p>
            </div>
          </div>
        `,
      };

    case "booking_update":
      return {
        subject: `Booking Update - ${data.bookingStatus}`,
        html: `
          <div style="${baseStyle}">
            <div style="${headerStyle}">
              <h1 style="margin: 0; font-size: 24px;">Booking Update</h1>
            </div>
            <div style="${contentStyle}">
              <p style="font-size: 16px; color: #333;">Hi ${recipientName},</p>
              <p style="font-size: 16px; color: #333;">
                Your booking status has been updated to: <strong>${data.bookingStatus}</strong>
              </p>
              <a href="https://syndeocareapp.lovable.app/dashboard/professional" style="${buttonStyle}">
                View Details
              </a>
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Best regards,<br>The SyndeoCare Team
              </p>
            </div>
          </div>
        `,
      };

    case "document_status":
      return {
        subject: `Document ${data.documentStatus} - ${data.documentName}`,
        html: `
          <div style="${baseStyle}">
            <div style="${headerStyle}">
              <h1 style="margin: 0; font-size: 24px;">Document Update</h1>
            </div>
            <div style="${contentStyle}">
              <p style="font-size: 16px; color: #333;">Hi ${recipientName},</p>
              <p style="font-size: 16px; color: #333;">
                Your document <strong>${data.documentName}</strong> has been <strong>${data.documentStatus}</strong>.
              </p>
              ${data.documentStatus === "approved" 
                ? "<p style='color: #22c55e; font-weight: 600;'>✓ Your document is now verified!</p>"
                : "<p style='color: #ef4444;'>Please re-upload your document with the required corrections.</p>"
              }
              <a href="https://syndeocareapp.lovable.app/profile/professional" style="${buttonStyle}">
                View Profile
              </a>
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Best regards,<br>The SyndeoCare Team
              </p>
            </div>
          </div>
        `,
      };

    default:
      return {
        subject: "SyndeoCare Notification",
        html: `
          <div style="${baseStyle}">
            <div style="${headerStyle}">
              <h1 style="margin: 0; font-size: 24px;">Notification</h1>
            </div>
            <div style="${contentStyle}">
              <p style="font-size: 16px; color: #333;">Hi ${recipientName},</p>
              <p style="font-size: 16px; color: #333;">
                You have a new notification from SyndeoCare.
              </p>
              <a href="https://syndeocareapp.lovable.app" style="${buttonStyle}">
                Go to SyndeoCare
              </a>
            </div>
          </div>
        `,
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { type, recipientEmail, recipientName, data }: EmailNotificationRequest = await req.json();

    console.log(`Sending ${type} email to ${recipientEmail}`);

    // Check user preferences first
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user id from email
    const { data: userData, error: userError } = await supabaseClient.auth.admin.listUsers();
    const user = userData?.users?.find(u => u.email === recipientEmail);

    if (user) {
      // Check email preferences
      const { data: prefs } = await supabaseClient
        .from("user_preferences")
        .select("notifications_email, email_new_messages, email_new_jobs, email_booking_updates")
        .eq("user_id", user.id)
        .single();

      if (prefs) {
        // Check if notifications are enabled for this type
        if (!prefs.notifications_email) {
          console.log("User has disabled email notifications");
          return new Response(
            JSON.stringify({ success: false, reason: "Email notifications disabled" }),
            { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        if (type === "new_message" && !prefs.email_new_messages) {
          console.log("User has disabled new message emails");
          return new Response(
            JSON.stringify({ success: false, reason: "New message emails disabled" }),
            { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        if (type === "new_job" && !prefs.email_new_jobs) {
          console.log("User has disabled new job emails");
          return new Response(
            JSON.stringify({ success: false, reason: "New job emails disabled" }),
            { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        if (type === "booking_update" && !prefs.email_booking_updates) {
          console.log("User has disabled booking update emails");
          return new Response(
            JSON.stringify({ success: false, reason: "Booking update emails disabled" }),
            { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
      }
    }

    const template = getEmailTemplate(type, data, recipientName);

    // Send email using Resend API directly
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SyndeoCare <onboarding@resend.dev>",
        to: [recipientEmail],
        subject: template.subject,
        html: template.html,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", emailData);
      throw new Error(emailData.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ success: true, data: emailData }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending email notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
