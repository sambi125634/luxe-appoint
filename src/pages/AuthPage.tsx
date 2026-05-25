import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Sparkles, Mail } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { normalizePolishPhone } from "@/lib/phone-validation";

async function resolveRedirect(userId: string): Promise<string> {
  try {
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    const role = roleData?.role;

    if (role === "super_admin") return "/super-admin";

    if (role === "salon_owner") {
      const { data: salon } = await supabase
        .from("salons")
        .select("id, onboarding_completed")
        .eq("owner_id", userId)
        .maybeSingle();

      if (!salon || !salon.onboarding_completed) return "/onboarding";
      return "/admin";
    }

    if (role === "staff") return "/admin";
    if (role === "client") return "/app";
  } catch (err) {
    console.error("Error resolving redirect:", err);
  }

  // No role found = new user, send to onboarding
  return "/onboarding";
}

export default function AuthPage() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [rodoConsent, setRodoConsent] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);

  const loginSchema = z.object({
    email: z.string().trim().email(t("auth.loginError")),
    password: z.string().min(6, t("auth.loginError")),
  });

  const signupSchema = z.object({
    email: z.string().trim().email(t("auth.signupError")),
    password: z.string().min(6, t("auth.signupError")),
    firstName: z.string().trim().min(2, t("auth.signupError")).max(50),
    lastName: z.string().trim().min(2, t("auth.signupError")).max(50),
    phone: z.string().trim().refine(
      (v) => normalizePolishPhone(v) !== null,
      "Podaj poprawny polski numer telefonu (9 cyfr)"
    ),
  });

  useEffect(() => {
    let mounted = true;

    const handleSession = async (session: { user: { id: string } } | null) => {
      if (session && mounted) {
        const redirect = await resolveRedirect(session.user.id);
        if (mounted) navigate(redirect);
      }
      if (mounted) setCheckingSession(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        handleSession(session);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword,
    });
    if (error) {
      toast.error(t("auth.loginError"));
    } else {
      toast.success(t("auth.loginSuccess"));
    }
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = signupSchema.safeParse({ email: signupEmail, password: signupPassword, firstName, lastName, phone: signupPhone });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }
    setIsLoading(true);
    const redirectUrl = `${window.location.origin}/auth`;
    const normalizedPhone = normalizePolishPhone(signupPhone) ?? signupPhone.trim();
    const { error } = await supabase.auth.signUp({
      email: signupEmail.trim(),
      password: signupPassword,
      options: {
        emailRedirectTo: redirectUrl,
        data: { first_name: firstName.trim(), last_name: lastName.trim(), phone: normalizedPhone },
      },
    });
    if (error) {
      toast.error(t("auth.signupError"));
    } else {
      setShowEmailConfirmation(true);
    }
    setIsLoading(false);
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (showEmailConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <Card className="w-full max-w-md border-border/50 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="font-serif text-xl">Sprawdź swoją skrzynkę email</CardTitle>
            <CardDescription className="text-base">
              Wysłaliśmy link aktywacyjny na adres <strong>{signupEmail}</strong>. Kliknij link w wiadomości, aby aktywować konto.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground text-center">
              Nie widzisz wiadomości? Sprawdź folder spam lub poczekaj kilka minut.
            </div>
            <Button variant="outline" className="w-full" onClick={() => setShowEmailConfirmation(false)}>
              Wróć do logowania
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md border-border/50 shadow-xl relative">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher variant="compact" />
        </div>
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <span className="font-serif text-2xl font-bold text-foreground">Beauty Calendar</span>
          </div>
          <CardTitle className="font-serif text-xl">{t("auth.welcome")}</CardTitle>
          <CardDescription>{t("auth.loginOrSignup")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">{t("auth.login")}</TabsTrigger>
              <TabsTrigger value="signup">{t("auth.signup")}</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">{t("auth.email")}</Label>
                  <Input id="login-email" type="email" placeholder="twoj@email.pl" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">{t("auth.password")}</Label>
                  <Input id="login-password" type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required disabled={isLoading} />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("auth.loggingIn")}</>) : t("auth.loginButton")}
                </Button>
                <div className="text-center mt-2">
                  <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-primary underline transition-colors"
                    onClick={async () => {
                      if (!loginEmail.trim()) {
                        toast.error("Wpisz adres e-mail, aby zresetować hasło");
                        return;
                      }
                      setIsLoading(true);
                      const { error } = await supabase.auth.resetPasswordForEmail(loginEmail.trim(), {
                        redirectTo: `${window.location.origin}/reset-password`,
                      });
                      if (error) {
                        toast.error("Nie udało się wysłać linku resetującego");
                      } else {
                        toast.success("Link do resetu hasła został wysłany na Twój e-mail");
                      }
                      setIsLoading(false);
                    }}
                    disabled={isLoading}
                  >
                    Zapomniałam hasła
                  </button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">{t("auth.firstName")}</Label>
                    <Input id="first-name" placeholder="Anna" value={firstName} onChange={(e) => setFirstName(e.target.value)} required disabled={isLoading} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">{t("auth.lastName")}</Label>
                    <Input id="last-name" placeholder="Kowalska" value={lastName} onChange={(e) => setLastName(e.target.value)} required disabled={isLoading} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Telefon</Label>
                  <Input id="signup-phone" type="tel" placeholder="+48 500 600 700" value={signupPhone} onChange={(e) => setSignupPhone(e.target.value)} required disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">{t("auth.email")}</Label>
                  <Input id="signup-email" type="email" placeholder="twoj@email.pl" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">{t("auth.password")}</Label>
                  <Input id="signup-password" type="password" placeholder="••••••••" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required disabled={isLoading} />
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox id="rodo-consent" checked={rodoConsent} onCheckedChange={(v) => setRodoConsent(v === true)} disabled={isLoading} className="mt-0.5" />
                  <label htmlFor="rodo-consent" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                    Akceptuję{" "}
                    <a href="/regulamin" target="_blank" className="underline text-primary hover:text-primary/80">Regulamin</a>{" "}
                    i{" "}
                    <a href="/polityka-prywatnosci" target="_blank" className="underline text-primary hover:text-primary/80">Politykę Prywatności</a>.
                    Wyrażam zgodę na przetwarzanie moich danych osobowych zgodnie z RODO.
                  </label>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading || !rodoConsent}>
                  {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("auth.signingUp")}</>) : t("auth.signupButton")}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
