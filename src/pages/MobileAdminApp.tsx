import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { MobileAdminBottomBar } from "@/components/mobile-admin/MobileAdminBottomBar";
import { MobileDashboard } from "@/components/mobile-admin/MobileDashboard";
import { MobileCalendar } from "@/components/mobile-admin/MobileCalendar";
import { MobileClients } from "@/components/mobile-admin/MobileClients";
import { MobileNotifications } from "@/components/mobile-admin/MobileNotifications";
import { MobileMoreMenu } from "@/components/mobile-admin/MobileMoreMenu";

export default function MobileAdminApp() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { role, isLoading: roleLoading, onboardingCompleted } = useUserRole();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth?redirect=/m");
      } else {
        setIsAuthenticated(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth?redirect=/m");
      } else {
        setIsAuthenticated(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Redirect to onboarding if needed
  useEffect(() => {
    if (!roleLoading && role === "salon_owner" && !onboardingCompleted) {
      navigate("/onboarding");
    }
  }, [roleLoading, role, onboardingCompleted, navigate]);

  if (!isAuthenticated || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route index element={<MobileDashboard />} />
        <Route path="calendar" element={<MobileCalendar />} />
        <Route path="clients" element={<MobileClients />} />
        <Route path="notifications" element={<MobileNotifications />} />
        <Route path="more" element={<MobileMoreMenu />} />
      </Routes>
      <MobileAdminBottomBar />
    </div>
  );
}
