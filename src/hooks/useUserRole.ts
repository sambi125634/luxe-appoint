import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserRoleData {
  role: AppRole | null;
  userId: string | null;
  salonId: string | null;
  salonName: string | null;
  onboardingCompleted: boolean;
}

export function useUserRole() {
  const query = useQuery<UserRoleData>({
    queryKey: ["user-role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { role: null, userId: null, salonId: null, salonName: null, onboardingCompleted: false };

      // Get role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      const role = roleData?.role ?? null;

      // Get salon info
      let salonId: string | null = null;
      let salonName: string | null = null;
      let onboardingCompleted = false;

      if (role === "salon_owner") {
        const { data: salon } = await supabase
          .from("salons")
          .select("id, name, onboarding_completed")
          .eq("owner_id", user.id)
          .maybeSingle();

        if (salon) {
          salonId = salon.id;
          salonName = salon.name;
          onboardingCompleted = salon.onboarding_completed;
        }
      } else if (role === "staff") {
        const { data: staffMember } = await supabase
          .from("staff_members")
          .select("salon_id, salons:salon_id(id, name)")
          .eq("user_id", user.id)
          .maybeSingle();

        if (staffMember) {
          salonId = staffMember.salon_id;
          const salonData = staffMember.salons as unknown as { id: string; name: string } | null;
          salonName = salonData?.name ?? null;
          onboardingCompleted = true;
        }
      } else if (role === "super_admin") {
        onboardingCompleted = true;
      }

      return { role, userId: user.id, salonId, salonName, onboardingCompleted };
    },
  });

  return {
    role: query.data?.role ?? null,
    userId: query.data?.userId ?? null,
    salonId: query.data?.salonId ?? null,
    salonName: query.data?.salonName ?? null,
    onboardingCompleted: query.data?.onboardingCompleted ?? false,
    isLoading: query.isLoading,
    error: query.error,
  };
}
