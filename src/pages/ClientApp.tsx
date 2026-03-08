import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BottomTabBar } from "@/components/client-app/BottomTabBar";
import { MySalons } from "@/components/client-app/MySalons";
import { MyBookings } from "@/components/client-app/MyBookings";
import { Favorites } from "@/components/client-app/Favorites";
import { ClientProfile } from "@/components/client-app/ClientProfile";
import { SalonProfile } from "@/components/client-app/SalonProfile";

export default function ClientApp() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth?redirect=/app");
      } else {
        setIsAuthenticated(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth?redirect=/app");
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
        <Route path="favorites" element={<Favorites />} />
        <Route path="profile" element={<ClientProfile />} />
        <Route path="salon/:salonId" element={<SalonProfile />} />
      </Routes>
      <BottomTabBar />
    </div>
  );
}
