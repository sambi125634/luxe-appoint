import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, UserCircle, Mic, CheckCircle, Sparkles, ArrowRight, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StaffData {
  id: string;
  name: string;
  staff_role: string | null;
  permissions: Record<string, boolean> | null;
}

interface SalonData {
  id: string;
  name: string;
  logo_url: string | null;
}

export default function StaffOnboardingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const staffId = searchParams.get("staff");
  const salonId = searchParams.get("salon");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [staffData, setStaffData] = useState<StaffData | null>(null);
  const [salonData, setSalonData] = useState<SalonData | null>(null);

  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [staffId, salonId]);

  const loadData = async () => {
    if (!staffId || !salonId) {
      setLoading(false);
      return;
    }

    try {
      const [staffRes, salonRes] = await Promise.all([
        supabase.from("staff_members").select("id, name, staff_role, permissions, phone").eq("id", staffId).single(),
        supabase.from("salons").select("id, name, logo_url").eq("id", salonId).single(),
      ]);

      if (staffRes.data) {
        setStaffData(staffRes.data as StaffData);
        setPhone((staffRes.data as any).phone || "");
      }
      if (salonRes.data) setSalonData(salonRes.data as SalonData);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleStep1Complete = async () => {
    if (!staffId) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Musisz być zalogowany/a");
        navigate("/auth");
        return;
      }

      // Link user to staff member
      await supabase.from("staff_members").update({
        user_id: user.id,
        phone: phone || null,
        invitation_status: "accepted",
      } as never).eq("id", staffId);

      // Ensure user has staff role
      await supabase.from("user_roles").upsert(
        { user_id: user.id, role: "staff" as any },
        { onConflict: "user_id,role" }
      );

      setStep(2);
    } catch (err) {
      console.error(err);
      toast.error("Wystąpił błąd podczas zapisywania danych");
    }
    setSaving(false);
  };

  const handleStep2Complete = () => setStep(3);

  const handleFinish = async () => {
    if (!staffId) return;
    setSaving(true);
    try {
      await supabase.from("staff_members").update({
        invitation_status: "active",
      } as never).eq("id", staffId);

      toast.success("Witaj w zespole! 🎉");
      navigate("/admin");
    } catch (err) {
      console.error(err);
      navigate("/admin");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!staffData || !salonData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <h2 className="text-lg font-semibold text-foreground mb-2">Nieprawidłowy link</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Ten link zaproszenia jest nieprawidłowy lub wygasł.
            </p>
            <Button onClick={() => navigate("/auth")}>Przejdź do logowania</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const roleName = getRoleName(staffData.staff_role);
  const permsList = staffData.permissions
    ? Object.entries(staffData.permissions).filter(([, v]) => v).map(([k]) => getPermLabel(k))
    : [];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {step > s ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={cn("w-12 h-0.5 transition-all", step > s ? "bg-primary" : "bg-muted")} />}
            </div>
          ))}
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <Card className="border-border/50">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <Avatar className="w-16 h-16 mx-auto mb-4 rounded-xl">
                  <AvatarFallback className="rounded-xl text-xl font-bold bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                    {salonData.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
                  Witaj w {salonData.name}! ✨
                </h1>
                <p className="text-muted-foreground">
                  Potwierdź swoje dane, aby rozpocząć pracę z systemem.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Imię i nazwisko</Label>
                  <Input value={staffData.name} disabled className="bg-muted/30" />
                </div>
                <div>
                  <Label>Telefon</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+48 123 456 789" />
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Twoja rola</p>
                  <Badge variant="secondary" className="text-sm">{roleName}</Badge>
                </div>
              </div>

              <Button className="w-full mt-6 gap-2" onClick={handleStep1Complete} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Dalej
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Your scope */}
        {step === 2 && (
          <Card className="border-border/50">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
                  Twój zakres pracy 📋
                </h1>
                <p className="text-muted-foreground">
                  Oto co możesz robić w systemie
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm font-semibold text-foreground mb-2">Rola: {roleName}</p>
                  {permsList.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {permsList.map((p) => (
                        <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Podstawowy dostęp do systemu</p>
                  )}
                </div>

                <p className="text-xs text-muted-foreground italic text-center">
                  Uprawnienia mogą zostać zmienione przez właścicielkę salonu w dowolnym momencie.
                </p>
              </div>

              <Button className="w-full mt-6 gap-2" onClick={handleStep2Complete}>
                <ArrowRight className="w-4 h-4" />
                Dalej
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: How to use */}
        {step === 3 && (
          <Card className="border-border/50">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
                  Jak korzystać z systemu 🚀
                </h1>
                <p className="text-muted-foreground">
                  Szybki przewodnik po najważniejszych funkcjach
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { icon: Calendar, title: "Twój kalendarz", desc: "Wszystkie wizyty są tu. Kliknij wizytę, aby zobaczyć szczegóły i notatki klientki." },
                  { icon: UserCircle, title: "Profile klientek", desc: "Przed wizytą sprawdź profil — alergeny, preferencje i historię zabiegów." },
                  { icon: Mic, title: "Notatki głosowe", desc: "Po wizycie nagraj notatkę głosem. AI przetworzy ją automatycznie." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full mt-6 gap-2" onClick={handleFinish} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Przejdź do kalendarza →
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function getRoleName(role: string | null): string {
  const map: Record<string, string> = {
    owner: "Właściciel", manager: "Manager", specialist: "Specjalista",
    receptionist: "Recepcjonista", assistant: "Asystent",
  };
  return map[role || ""] || "Specjalista";
}

function getPermLabel(key: string): string {
  const map: Record<string, string> = {
    can_view_finances: "Finanse", can_edit_services: "Edycja usług",
    can_manage_clients: "Klienci", can_view_all_calendar: "Pełny kalendarz",
    can_manage_staff: "Zespół", can_view_reports: "Raporty", can_manage_products: "Produkty",
  };
  return map[key] || key;
}
