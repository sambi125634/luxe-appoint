import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const SECTIONS = [
  {
    title: "1. Administrator danych",
    body: "Administratorem Twoich danych osobowych jest salon, w którym dokonujesz rezerwacji, działający za pośrednictwem platformy Beauty Calendar. Dane kontaktowe administratora są dostępne na profilu salonu w aplikacji.",
  },
  {
    title: "2. Jakie dane zbieramy",
    body: "Zbieramy następujące dane: imię i nazwisko, adres e-mail, numer telefonu, historię wizyt i rezerwacji, preferencje dotyczące usług, dane dotyczące programu lojalnościowego oraz informacje o urządzeniu (w celu wysyłania powiadomień push).",
  },
  {
    title: "3. Cel przetwarzania danych",
    body: "Twoje dane przetwarzamy w celu: realizacji usług rezerwacji wizyt, komunikacji dotyczącej wizyt (potwierdzenia, przypomnienia), obsługi programu lojalnościowego i kuponów rabatowych, personalizacji doświadczeń w aplikacji oraz wysyłania powiadomień push (za Twoją zgodą).",
  },
  {
    title: "4. Podstawa prawna",
    body: "Przetwarzanie danych odbywa się na podstawie art. 6 ust. 1 lit. b RODO (niezbędność do wykonania umowy — świadczenie usług rezerwacji), art. 6 ust. 1 lit. a RODO (zgoda — powiadomienia push, marketing) oraz art. 6 ust. 1 lit. f RODO (prawnie uzasadniony interes — analityka, bezpieczeństwo).",
  },
  {
    title: "5. Czas przechowywania danych",
    body: "Dane przechowujemy do momentu usunięcia konta przez użytkownika lub cofnięcia zgody na przetwarzanie. Po złożeniu wniosku o usunięcie danych, zostaną one usunięte w ciągu 30 dni roboczych. Dane niezbędne do celów rachunkowych mogą być przechowywane przez okres wymagany przepisami prawa.",
  },
  {
    title: "6. Twoje prawa",
    body: "Zgodnie z RODO przysługuje Ci prawo do: dostępu do swoich danych, sprostowania nieprawidłowych danych, usunięcia danych (prawo do bycia zapomnianym), ograniczenia przetwarzania, przenoszenia danych do innego administratora, sprzeciwu wobec przetwarzania oraz cofnięcia zgody w dowolnym momencie.",
  },
  {
    title: "7. Kontakt w sprawie danych",
    body: "W sprawach dotyczących ochrony danych osobowych prosimy o kontakt na adres: kontakt@beauty-funnels.com. Masz również prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (PUODO).",
  },
  {
    title: "8. Pliki cookie i technologie śledzenia",
    body: "Aplikacja wykorzystuje wyłącznie niezbędne cookies sesyjne do obsługi uwierzytelniania (Supabase Auth) oraz localStorage do przechowywania preferencji użytkownika (tryb ciemny, stan powiadomień). Nie stosujemy cookies marketingowych ani śledzących.",
  },
];

export function PrivacyPolicy() {
  const navigate = useNavigate();

  const deletionRequest = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Brak zalogowanego użytkownika");

      const { error } = await supabase.from("deletion_requests").insert({
        user_id: user.id,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Wniosek przyjęty. Dane zostaną usunięte w ciągu 30 dni.");
    },
    onError: () => {
      toast.error("Nie udało się złożyć wniosku. Spróbuj ponownie.");
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/40 px-4 py-3">
        <div className="flex items-center gap-3 max-w-[600px] mx-auto">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">Polityka Prywatności</h1>
        </div>
      </div>

      <div className="px-4 py-6 max-w-[600px] mx-auto pb-24">
        <p className="text-xs text-muted-foreground mb-6">
          Ostatnia aktualizacja: 11 kwietnia 2026
        </p>

        <div className="space-y-6">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="text-sm font-bold text-foreground mb-2">{section.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>

        {/* Delete account section */}
        <div className="mt-10 p-4 border border-destructive/20 rounded-2xl bg-destructive/5">
          <h2 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-destructive" />
            Usuń moje konto i dane
          </h2>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            Zgodnie z art. 17 RODO masz prawo do usunięcia swoich danych osobowych.
            Po złożeniu wniosku, Twoje dane zostaną nieodwracalnie usunięte w ciągu 30 dni roboczych.
          </p>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive/10">
                Złóż wniosek o usunięcie danych
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Czy na pewno chcesz usunąć konto?</AlertDialogTitle>
                <AlertDialogDescription>
                  Ta operacja jest nieodwracalna. Wszystkie Twoje dane, historia wizyt,
                  punkty lojalnościowe i kupony zostaną trwale usunięte w ciągu 30 dni.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Anuluj</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => deletionRequest.mutate()}
                  disabled={deletionRequest.isPending}
                >
                  {deletionRequest.isPending ? "Wysyłanie..." : "Potwierdź usunięcie"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
