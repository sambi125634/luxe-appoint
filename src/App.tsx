import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useMemo, useEffect } from "react";
import Index from "./pages/Index";
import BookingPage from "./pages/BookingPage";
import AdminDashboard from "./pages/AdminDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AuthPage from "./pages/AuthPage";
import DemoPage from "./pages/DemoPage";
import InstagramLanding from "./pages/InstagramLanding";
import OnboardingPage from "./pages/OnboardingPage";
import InstallPage from "./pages/InstallPage";
import ClientApp from "./pages/ClientApp";
import JoinSalonPage from "./pages/JoinSalonPage";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();

const ADMIN_HOSTNAMES = ["admin.beauty-funnels.com"];

const isAdminSubdomain = () =>
  ADMIN_HOSTNAMES.includes(window.location.hostname);

/** On admin subdomain, force redirect root "/" to "/auth" before React renders */
const AdminRootRedirect = () => {
  useEffect(() => {
    if (window.location.pathname === "/") {
      window.location.replace("/auth");
    }
  }, []);
  return null;
};

const App = () => {
  const adminMode = useMemo(() => isAdminSubdomain(), []);

  // Hard redirect on admin subdomain root — runs before route matching
  if (adminMode && window.location.pathname === "/") {
    return (
      <QueryClientProvider client={queryClient}>
        <AdminRootRedirect />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Marketing domain routes */}
            <Route path="/" element={<Index />} />
            <Route path="/demo" element={adminMode ? <AuthPage /> : <DemoPage />} />
            
            {/* Auth & panel routes (both domains) */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/super-admin" element={<SuperAdminDashboard />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            
            {/* Client app routes */}
            <Route path="/app/*" element={<ClientApp />} />
            
            {/* Booking routes (marketing domain) */}
            <Route path="/book/:slug" element={<BookingPage />} />
            <Route path="/s/:slug" element={<BookingPage />} />
            <Route path="/i/:slug" element={<InstagramLanding />} />
            <Route path="/join/:slug" element={<JoinSalonPage />} />
            <Route path="/install" element={<InstallPage />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={adminMode ? <AuthPage /> : <NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
