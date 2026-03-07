import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useMemo } from "react";
import Index from "./pages/Index";
import BookingPage from "./pages/BookingPage";
import AdminDashboard from "./pages/AdminDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AuthPage from "./pages/AuthPage";
import DemoPage from "./pages/DemoPage";
import InstagramLanding from "./pages/InstagramLanding";
import OnboardingPage from "./pages/OnboardingPage";
import InstallPage from "./pages/InstallPage";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();

const ADMIN_HOSTNAMES = ["admin.beauty-funnels.com"];

const isAdminSubdomain = () =>
  ADMIN_HOSTNAMES.includes(window.location.hostname);

const App = () => {
  const adminMode = useMemo(() => isAdminSubdomain(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={adminMode ? <AuthPage /> : <Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/book/:slug" element={<BookingPage />} />
            <Route path="/s/:slug" element={<BookingPage />} />
            <Route path="/i/:slug" element={<InstagramLanding />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/super-admin" element={<SuperAdminDashboard />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/install" element={<InstallPage />} />
            <Route path="/demo" element={adminMode ? <AuthPage /> : <DemoPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
