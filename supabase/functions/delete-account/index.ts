import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user's token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;

    // Delete user data in order (respecting foreign key constraints)
    // 1. Delete messages (no FK constraint issues)
    await supabaseClient.from("messages").delete().eq("sender_id", userId);

    // 2. Delete notifications
    await supabaseClient.from("notifications").delete().eq("user_id", userId);

    // 3. Delete user preferences
    await supabaseClient.from("user_preferences").delete().eq("user_id", userId);

    // 4. Delete admin notes created by this user
    await supabaseClient.from("admin_notes").delete().eq("admin_id", userId);

    // 5. Delete admin permissions
    await supabaseClient.from("admin_permissions").delete().eq("user_id", userId);

    // 6. Delete documents
    await supabaseClient.from("documents").delete().eq("user_id", userId);

    // 7. Get profile/clinic ID for cleanup
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    const { data: clinic } = await supabaseClient
      .from("clinics")
      .select("id")
      .eq("user_id", userId)
      .single();

    // 8. Delete ratings (both as reviewer and reviewee)
    if (profile) {
      await supabaseClient.from("ratings").delete().eq("reviewer_id", profile.id);
      await supabaseClient.from("ratings").delete().eq("reviewee_id", profile.id);
    }
    if (clinic) {
      await supabaseClient.from("ratings").delete().eq("reviewer_id", clinic.id);
      await supabaseClient.from("ratings").delete().eq("reviewee_id", clinic.id);
    }

    // 9. Delete bookings
    if (profile) {
      await supabaseClient.from("bookings").delete().eq("professional_id", profile.id);
    }
    if (clinic) {
      await supabaseClient.from("bookings").delete().eq("clinic_id", clinic.id);
    }

    // 10. Delete conversations
    if (profile) {
      await supabaseClient.from("conversations").delete().eq("professional_id", profile.id);
    }
    if (clinic) {
      await supabaseClient.from("conversations").delete().eq("clinic_id", clinic.id);
    }

    // 11. Delete shifts (clinic only)
    if (clinic) {
      await supabaseClient.from("shifts").delete().eq("clinic_id", clinic.id);
    }

    // 12. Delete availability (professional only)
    if (profile) {
      await supabaseClient.from("availability").delete().eq("profile_id", profile.id);
    }

    // 13. Delete profile
    await supabaseClient.from("profiles").delete().eq("user_id", userId);

    // 14. Delete clinic
    await supabaseClient.from("clinics").delete().eq("user_id", userId);

    // 15. Delete user roles
    await supabaseClient.from("user_roles").delete().eq("user_id", userId);

    // 16. Finally, delete the auth user
    const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error("Error deleting auth user:", deleteError);
      return new Response(
        JSON.stringify({ error: "Failed to delete user account" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Account deleted successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in delete-account function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
