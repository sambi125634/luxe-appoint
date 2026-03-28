import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StaffPermissions {
  can_view_finances: boolean;
  can_edit_services: boolean;
  can_manage_clients: boolean;
  can_view_all_calendar: boolean;
  can_manage_staff: boolean;
  can_view_reports: boolean;
  can_manage_products: boolean;
  can_manage_marketing: boolean;
}

const DEFAULT_PERMISSIONS: StaffPermissions = {
  can_view_finances: false,
  can_edit_services: false,
  can_manage_clients: true,
  can_view_all_calendar: false,
  can_manage_staff: false,
  can_view_reports: false,
  can_manage_products: false,
  can_manage_marketing: false,
};

const OWNER_PERMISSIONS: StaffPermissions = {
  can_view_finances: true,
  can_edit_services: true,
  can_manage_clients: true,
  can_view_all_calendar: true,
  can_manage_staff: true,
  can_view_reports: true,
  can_manage_products: true,
  can_manage_marketing: true,
};

export function useStaffPermissions() {
  const query = useQuery({
    queryKey: ["staff-permissions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { permissions: DEFAULT_PERMISSIONS, staffId: null, isOwner: false };

      // Check if user is salon owner
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (roleData?.role === "salon_owner" || roleData?.role === "super_admin") {
        return { permissions: OWNER_PERMISSIONS, staffId: null, isOwner: true };
      }

      // Staff member — get permissions from staff_members table
      const { data: staffMember } = await supabase
        .from("staff_members")
        .select("id, permissions, staff_role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!staffMember) {
        return { permissions: DEFAULT_PERMISSIONS, staffId: null, isOwner: false };
      }

      const dbPerms = (staffMember.permissions as Record<string, boolean>) || {};
      const merged: StaffPermissions = { ...DEFAULT_PERMISSIONS, ...dbPerms };

      return { permissions: merged, staffId: staffMember.id, isOwner: false };
    },
  });

  return {
    permissions: query.data?.permissions ?? OWNER_PERMISSIONS,
    staffId: query.data?.staffId ?? null,
    isOwner: query.data?.isOwner ?? true,
    isLoading: query.isLoading,
  };
}
