import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, Loader2, Send } from "lucide-react";

const formSchema = z.object({
  first_name: z.string().min(2, "Imię musi mieć minimum 2 znaki").max(50),
  last_name: z.string().min(2, "Nazwisko musi mieć minimum 2 znaki").max(50),
  email: z.string().email("Podaj poprawny adres email"),
  phone: z.string().min(9, "Podaj poprawny numer telefonu").max(15),
  salon_name: z.string().min(2, "Nazwa salonu musi mieć minimum 2 znaki").max(100),
  city: z.string().min(2, "Miejscowość musi mieć minimum 2 znaki").max(100),
  team_size: z.string().min(1, "Wybierz wielkość zespołu"),
  website_url: z.string().url("Podaj poprawny adres URL").optional().or(z.literal("")),
  rodo_consent: z.boolean().refine((val) => val === true, {
    message: "Musisz wyrazić zgodę na przetwarzanie danych"
  })
});

type FormValues = z.infer<typeof formSchema>;

const LeadFormSection = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      salon_name: "",
      city: "",
      team_size: "",
      website_url: "",
      rodo_consent: false
    }
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from("leads").insert({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        salon_name: data.salon_name,
        city: data.city,
        team_size: data.team_size,
        website_url: data.website_url || null,
        rodo_consent: data.rodo_consent,
        status: "new"
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success("Dziękujemy za zgłoszenie!");
    } catch (error) {
      console.error("Error submitting lead:", error);
      toast.error("Wystąpił błąd. Spróbuj ponownie.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section id="lead-form" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-deep/10 via-background to-gold/10" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-xl mx-auto text-center glass-card-elevated p-12 rounded-2xl">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Dziękujemy!
            </h3>
            <p className="text-muted-foreground text-lg">
              Skontaktujemy się z Tobą w ciągu 24 godzin. W międzyczasie możesz{" "}
              <a href="/demo" className="text-gold hover:underline">
                wypróbować demo
              </a>.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="lead-form" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-deep/10 via-background to-gold/10" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Zainteresowana? Zostaw kontakt
          </h2>
          <p className="text-muted-foreground text-lg">
            Oddzwonimy w ciągu 24 godzin i pomożemy Ci skonfigurować kalendarz
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto glass-card-elevated p-8 md:p-10 rounded-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imię *</FormLabel>
                      <FormControl>
                        <Input placeholder="Anna" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nazwisko *</FormLabel>
                      <FormControl>
                        <Input placeholder="Kowalska" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="anna@salon.pl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefon *</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="500 123 456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="salon_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nazwa salonu *</FormLabel>
                      <FormControl>
                        <Input placeholder="Studio Urody Anna" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Miejscowość *</FormLabel>
                      <FormControl>
                        <Input placeholder="Warszawa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="team_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wielkość zespołu *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wybierz..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Tylko ja</SelectItem>
                          <SelectItem value="2-5">2-5 osób</SelectItem>
                          <SelectItem value="6-10">6-10 osób</SelectItem>
                          <SelectItem value="10+">Ponad 10 osób</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="website_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link do strony/Instagram</FormLabel>
                      <FormControl>
                        <Input placeholder="https://instagram.com/twojsalon" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="rodo_consent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal text-muted-foreground">
                        Wyrażam zgodę na przetwarzanie moich danych osobowych w celu kontaktu handlowego. 
                        Administratorem danych jest Beauty Funnels. *
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-gradient-to-r from-violet-deep to-burgundy hover:opacity-90 text-white py-6 text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Wysyłanie...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Wyślij zgłoszenie
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
};

export default LeadFormSection;
