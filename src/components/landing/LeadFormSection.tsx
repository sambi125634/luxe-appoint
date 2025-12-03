import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function LeadFormSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    salonName: '',
    city: '',
    teamSize: '',
    websiteUrl: '',
    rodoConsent: false,
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.rodoConsent) {
      toast({
        title: "Wymagana zgoda",
        description: "Zaakceptuj zgodę na przetwarzanie danych, aby kontynuować.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('leads').insert({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        salon_name: formData.salonName,
        city: formData.city,
        team_size: formData.teamSize,
        website_url: formData.websiteUrl || null,
        rodo_consent: formData.rodoConsent,
      });

      if (error) throw error;

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się wysłać zgłoszenia. Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section id="lead-form" className="py-20 px-4 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto">
          <div className="max-w-xl mx-auto">
            <div className="glass-card-elevated p-8 md:p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-primary-foreground" />
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">
                Dziękujemy!
              </h2>
              <p className="text-muted-foreground mb-6">
                Skontaktujemy się z Tobą w ciągu 24 godzin, aby pokazać Ci Beauty Calendar na żywo 
                i pomóc w konfiguracji demo dla Twojego salonu.
              </p>
              <p className="text-sm text-muted-foreground">
                W międzyczasie sprawdź swoją skrzynkę e-mail – wyślemy Ci potwierdzenie zgłoszenia.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="lead-form" className="py-20 px-4 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Zgłoś swój salon po dostęp do demo
            </h2>
            <p className="text-muted-foreground">
              Wypełnij formularz, a my skontaktujemy się z Tobą w ciągu 24 godzin. 
              Bez spamu, bez zobowiązań.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="glass-card-elevated p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">Imię *</Label>
                <Input
                  id="firstName"
                  placeholder="Anna"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Nazwisko *</Label>
                <Input
                  id="lastName"
                  placeholder="Kowalska"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="anna@salon.pl"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Numer telefonu *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+48 600 123 456"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="salonName">Nazwa salonu *</Label>
                <Input
                  id="salonName"
                  placeholder="Beauty Studio Anna"
                  value={formData.salonName}
                  onChange={(e) => setFormData({ ...formData, salonName: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">Miasto *</Label>
                <Input
                  id="city"
                  placeholder="Warszawa"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="teamSize">Liczba osób w zespole *</Label>
                <Select
                  value={formData.teamSize}
                  onValueChange={(value) => setFormData({ ...formData, teamSize: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Tylko ja</SelectItem>
                    <SelectItem value="2-3">2-3 osoby</SelectItem>
                    <SelectItem value="4-6">4-6 osób</SelectItem>
                    <SelectItem value="7-10">7-10 osób</SelectItem>
                    <SelectItem value="11+">Ponad 10 osób</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Strona / Instagram (opcjonalnie)</Label>
                <Input
                  id="websiteUrl"
                  placeholder="instagram.com/twojsalon"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-6 flex items-start gap-3">
              <Checkbox
                id="rodoConsent"
                checked={formData.rodoConsent}
                onCheckedChange={(checked) => setFormData({ ...formData, rodoConsent: checked === true })}
              />
              <Label htmlFor="rodoConsent" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                Wyrażam zgodę na przetwarzanie moich danych osobowych w celu kontaktu w sprawie Beauty Calendar. 
                Administratorem danych jest Beauty Calendar. Masz prawo do wglądu, poprawiania i usunięcia swoich danych.
              </Label>
            </div>

            <Button 
              type="submit" 
              variant="luxury" 
              size="xl" 
              className="w-full mt-8"
              disabled={isSubmitting || !formData.teamSize}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Wysyłanie...
                </>
              ) : (
                'Chcę zobaczyć demo'
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}