import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BottomTabBar } from "@/components/client-app/BottomTabBar";
import { MySalons } from "@/components/client-app/MySalons";
import { MyBookings } from "@/components/client-app/MyBookings";
import { ForYou } from "@/components/client-app/ForYou";
import { Activity } from "@/components/client-app/Activity";
import { ClientProfile } from "@/components/client-app/ClientProfile";
import { SalonProfile } from "@/components/client-app/SalonProfile";
import { ReferFriend } from "@/components/client-app/ReferFriend";
import { Favorites } from "@/components/client-app/Favorites";
import { PushNotificationPrompt } from "@/components/client-app/PushNotificationPrompt";
import { PrivacyPolicy } from "@/components/client-app/PrivacyPolicy";
import { TermsOfService } from "@/components/client-app/TermsOfService";

export default function ClientApp() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/app/auth?redirect=/app");
      } else {
        setIsAuthenticated(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/app/auth?redirect=/app");
      } else {
        setIsAuthenticated(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route index element={<MySalons />} />
        <Route path="bookings" element={<MyBookings />} />
        <Route path="for-you" element={<ForYou />} />
        <Route path="activity" element={<Activity />} />
        <Route path="profile" element={<ClientProfile />} />
        <Route path="profile/favorites" element={<Favorites />} />
        <Route path="profile/referrals" element={<ReferFriend />} />
        <Route path="salon/:salonId" element={<SalonProfile />} />
        <Route path="privacy" element={<PrivacyPolicy />} />
        <Route path="terms" element={<TermsOfService />} />
      </Routes>
      <BottomTabBar />
      <PushNotificationPrompt />
    </div>
  );
}
