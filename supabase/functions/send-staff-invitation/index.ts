import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { staffMemberId, salonId } = await req.json();

    if (!staffMemberId || !salonId) {
      return new Response(JSON.stringify({ error: "Missing staffMemberId or salonId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get staff member details
    const { data: staff, error: staffError } = await supabase
      .from("staff_members")
      .select("name, invitation_email, staff_role, permissions")
      .eq("id", staffMemberId)
      .single();

    if (staffError || !staff) {
      return new Response(JSON.stringify({ error: "Staff member not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get salon details
    const { data: salon } = await supabase
      .from("salons")
      .select("name, slug, owner_id")
      .eq("id", salonId)
      .single();

    if (!salon) {
      return new Response(JSON.stringify({ error: "Salon not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get owner name
    const { data: ownerProfile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", salon.owner_id)
      .single();

    const ownerName = ownerProfile
      ? `${ownerProfile.first_name || ""} ${ownerProfile.last_name || ""}`.trim()
      : "Właścicielka";

    const firstName = staff.name.split(" ")[0];
    const roleName = getRoleName(staff.staff_role);
    const permissions = staff.permissions as Record<string, boolean> | null;
    const permissionsList = permissions
      ? Object.entries(permissions)
          .filter(([, v]) => v)
          .map(([k]) => getPermissionLabel(k))
          .join(", ")
      : "Podstawowy dostęp";

    // Build activation link — points to auth page with staff invitation context
    const baseUrl = Deno.env.get("SITE_URL") || `https://luxe-appoint.lovable.app`;
    const activationLink = `${baseUrl}/auth?invite=staff&salon=${salonId}&staff=${staffMemberId}`;

    // Send email via Resend
    if (!resendApiKey) {
      console.log("RESEND_API_KEY not set, skipping email send. Link:", activationLink);
      return new Response(JSON.stringify({ success: true, link: activationLink, emailSent: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; padding: 40px 30px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #1a1a1a; margin-bottom: 8px;">
          Witaj w Beauty Calendar! ✨
        </h1>
        <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 24px;">
          Cześć <strong>${firstName}</strong>!
        </p>
        <p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
          <strong>${ownerName}</strong> zaprasza Cię do zarządzania salonem 
          <strong>${salon.name}</strong> przez Beauty Calendar.
        </p>
        <p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 8px;">
          Kliknij poniższy przycisk, aby założyć konto i zapoznać się z systemem:
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${activationLink}" 
             style="display: inline-block; background: linear-gradient(135deg, #C9A96E, #B8943D); color: #fff; text-decoration: none; 
                    padding: 14px 36px; border-radius: 12px; font-size: 16px; font-weight: 600;">
            Dołącz do zespołu →
          </a>
        </div>
        <div style="background: #f8f8f8; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <p style="font-size: 14px; color: #777; margin: 0 0 8px;">
            <strong>Twoja rola:</strong> ${roleName}
          </p>
          <p style="font-size: 14px; color: #777; margin: 0;">
            <strong>Uprawnienia:</strong> ${permissionsList}
          </p>
        </div>
        <p style="font-size: 13px; color: #999; line-height: 1.5;">
          Link wygasa po 7 dniach. Jeśli nie spodziewałeś/aś się tej wiadomości, zignoruj ją.
        </p>
      </div>
    `;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${salon.name} <notifications@beautyfunnel.pl>`,
        to: [staff.invitation_email],
        subject: `${salon.name} zaprasza Cię do Beauty Calendar`,
        html: emailHtml,
      }),
    });

    const emailResult = await emailRes.json();

    if (!emailRes.ok) {
      console.error("Resend error:", emailResult);
      return new Response(JSON.stringify({ success: false, error: "Email send failed", details: emailResult }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, emailSent: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getRoleName(role: string | null): string {
  switch (role) {
    case "owner": return "Właściciel";
    case "manager": return "Manager";
    case "specialist": return "Specjalista";
    case "receptionist": return "Recepcjonista";
    case "assistant": return "Asystent";
    default: return "Specjalista";
  }
}

function getPermissionLabel(key: string): string {
  const map: Record<string, string> = {
    can_view_finances: "Finanse",
    can_edit_services: "Edycja usług",
    can_manage_clients: "Klienci",
    can_view_all_calendar: "Pełny kalendarz",
    can_manage_staff: "Zarządzanie zespołem",
    can_view_reports: "Raporty",
    can_manage_products: "Produkty",
  };
  return map[key] || key;
}
