import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Sparkles, Mail, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { normalizePolishPhone } from "@/lib/phone-validation";
import { motion, AnimatePresence } from "framer-motion";

type AuthMode = "login" | "signup" | "forgot";

const signupSchema = z.object({
  firstName: z.string().trim().min(2, "Imię musi mieć min. 2 znaki").max(50),
  lastName: z.string().trim().min(2, "Nazwisko musi mieć min. 2 znaki").max(50),
  phone: z.string().trim().refine(
    (v) => normalizePolishPhone(v) !== null,
    "Podaj poprawny polski numer telefonu"
  ),
  email: z.string().trim().email("Podaj poprawny adres e-mail"),
  password: z.string().min(8, "Hasło musi mieć min. 8 znaków"),
  confirmPassword: z.string(),
  consent: z.literal(true, { errorMap: () => ({ message: "Musisz zaakceptować regulamin" }) }),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Hasła nie są identyczne",
  path: ["confirmPassword"],
});

const loginSchema = z.object({
  email: z.string().trim().email("Podaj poprawny adres e-mail"),
  password: z.string().min(1, "Wpisz hasło"),
});

export default function ClientAuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/app";

  const [mode, setMode] = useState<AuthMode>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [consent, setConsent] = useState(false);

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState("");

  // Field errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && mounted) {
        navigate(redirectTo);
      }
      if (mounted) setCheckingSession(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && mounted) {
        navigate(redirectTo);
      }
      if (mounted) setCheckingSession(false);
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, [navigate, redirectTo]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword,
    });
    if (error) {
      toast.error("Nieprawidłowy e-mail lub hasło");
    } else {
      toast.success("Zalogowano pomyślnie! 🌸");
    }
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = signupSchema.safeParse({
      firstName, lastName, phone, email: signupEmail,
      password: signupPassword, confirmPassword, consent,
    });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const normalizedPhone = normalizePolishPhone(phone)!;

    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email: signupEmail.trim(),
      password: signupPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/app/auth?redirect=${encodeURIComponent(redirectTo)}`,
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: normalizedPhone,
        },
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("Ten adres e-mail jest już zarejestrowany. Zaloguj się.");
        setMode("login");
        setLoginEmail(signupEmail);
      } else {
        toast.error("Nie udało się utworzyć konta. Spróbuj ponownie.");
      }
    } else {
      setConfirmationEmail(signupEmail);
      setShowEmailConfirmation(true);
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setErrors({ forgotEmail: "Wpisz adres e-mail" });
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error("Nie udało się wysłać linku. Sprawdź adres e-mail.");
    } else {
      toast.success("Link do resetu hasła został wysłany! 📧");
      setMode("login");
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
        <Card className="w-full max-w-[400px] border-border/50 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-xl">Sprawdź skrzynkę e-mail</CardTitle>
            <CardDescription className="text-base">
              Wysłaliśmy link aktywacyjny na <strong>{confirmationEmail}</strong>. 
              Kliknij link w wiadomości, aby aktywować konto.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground text-center">
              Nie widzisz wiadomości? Sprawdź folder spam.
            </div>
            <Button variant="outline" className="w-full" onClick={() => {
              setShowEmailConfirmation(false);
              setMode("login");
            }}>
              Wróć do logowania
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const FieldError = ({ field }: { field: string }) =>
    errors[field] ? (
      <p className="text-xs text-destructive mt-1">{errors[field]}</p>
    ) : null;

  const PasswordInput = ({
    id, value, onChange, show, onToggle, placeholder = "••••••••", disabled = false,
  }: {
    id: string; value: string; onChange: (v: string) => void;
    show: boolean; onToggle: () => void; placeholder?: string; disabled?: boolean;
  }) => (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        disabled={disabled}
        className="pr-10"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        tabIndex={-1}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-[400px] border-border/50 shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">Beauty Calendar</span>
          </div>
          <CardTitle className="text-xl">
            {mode === "forgot" ? "Resetuj hasło" : "Witaj! 🌸"}
          </CardTitle>
          <CardDescription>
            {mode === "forgot"
              ? "Podaj e-mail, a wyślemy Ci link do resetu"
              : mode === "login"
                ? "Zaloguj się do swojego konta"
                : "Utwórz konto i rezerwuj wizyty"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {mode === "forgot" ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Adres e-mail</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="twoj@email.pl"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <FieldError field="forgotEmail" />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Wysyłanie...</>
                    ) : "Wyślij link resetujący"}
                  </Button>
                  <button
                    type="button"
                    className="w-full text-sm text-muted-foreground hover:text-primary transition-colors text-center"
                    onClick={() => { setMode("login"); setErrors({}); }}
                  >
                    ← Wróć do logowania
                  </button>
                </form>
              ) : mode === "login" ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Adres e-mail</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="twoj@email.pl"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <FieldError field="email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Hasło</Label>
                    <PasswordInput
                      id="login-password"
                      value={loginPassword}
                      onChange={setLoginPassword}
                      show={showLoginPassword}
                      onToggle={() => setShowLoginPassword(!showLoginPassword)}
                      disabled={isLoading}
                    />
                    <FieldError field="password" />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Logowanie...</>
                    ) : "Zaloguj się"}
                  </Button>
                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-primary underline transition-colors"
                      onClick={() => { setMode("forgot"); setErrors({}); setForgotEmail(loginEmail); }}
                    >
                      Zapomniałam hasła?
                    </button>
                    <button
                      type="button"
                      className="text-primary font-medium hover:underline transition-colors"
                      onClick={() => { setMode("signup"); setErrors({}); }}
                    >
                      Utwórz konto
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-first">Imię</Label>
                      <Input
                        id="signup-first"
                        placeholder="Anna"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                      <FieldError field="firstName" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-last">Nazwisko</Label>
                      <Input
                        id="signup-last"
                        placeholder="Kowalska"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                      <FieldError field="lastName" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-phone">Numer telefonu</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="+48 500 600 700"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <FieldError field="phone" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email">Adres e-mail</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="twoj@email.pl"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <FieldError field="email" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-password">Hasło (min. 8 znaków)</Label>
                    <PasswordInput
                      id="signup-password"
                      value={signupPassword}
                      onChange={setSignupPassword}
                      show={showSignupPassword}
                      onToggle={() => setShowSignupPassword(!showSignupPassword)}
                      disabled={isLoading}
                    />
                    <FieldError field="password" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-confirm">Powtórz hasło</Label>
                    <PasswordInput
                      id="signup-confirm"
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      show={showConfirmPassword}
                      onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    />
                    <FieldError field="confirmPassword" />
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="consent"
                      checked={consent}
                      onCheckedChange={(v) => setConsent(v === true)}
                      disabled={isLoading}
                      className="mt-0.5"
                    />
                    <label htmlFor="consent" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                      Akceptuję{" "}
                      <a href="/app/privacy" target="_blank" className="underline text-primary hover:text-primary/80">
                        Regulamin i Politykę Prywatności
                      </a>
                      . Wyrażam zgodę na przetwarzanie danych osobowych zgodnie z RODO.
                    </label>
                  </div>
                  <FieldError field="consent" />
                  <Button type="submit" className="w-full" disabled={isLoading || !consent}>
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Tworzenie konta...</>
                    ) : "Zarejestruj się 🌸"}
                  </Button>
                  <div className="text-center">
                    <button
                      type="button"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      onClick={() => { setMode("login"); setErrors({}); }}
                    >
                      Masz już konto? <span className="text-primary font-medium underline">Zaloguj się</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
