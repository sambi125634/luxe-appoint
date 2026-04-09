import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { MessageCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const contactSchema = z.object({
  first_name: z.string().trim().min(1, "Wpisz swoje imię").max(100),
  email: z.string().trim().email("Wpisz poprawny adres email").max(255),
  phone: z.string().trim().min(9, "Wpisz poprawny numer telefonu").max(15),
  rodo_consent: z.literal(true, { errorMap: () => ({ message: "Wymagana zgoda RODO" }) }),
});

type ContactFormData = z.infer<typeof contactSchema>;

export const PricingContactForm = () => {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { first_name: "", email: "", phone: "", rodo_consent: false as unknown as true },
  });

  const rodoValue = watch("rodo_consent");

  const onSubmit = async (data: ContactFormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("leads").insert({
        first_name: data.first_name,
        last_name: "-",
        email: data.email,
        phone: data.phone,
        salon_name: "-",
        city: "-",
        team_size: "-",
        rodo_consent: true,
        status: "new",
      });

      if (error) throw error;

      setSubmitted(true);
    } catch {
      toast({
        title: "Błąd",
        description: "Nie udało się wysłać formularza. Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        className="text-center py-12"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">Dziękujemy!</h3>
        <p className="text-muted-foreground">Odezwiemy się do Ciebie najszybciej jak to możliwe.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="max-w-xl mx-auto mt-16"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <MessageCircle className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">Potrzebujesz pomocy?</span>
        </div>
        <h3 className="text-2xl md:text-3xl font-bold mb-2">Nie wiesz, który plan wybrać?</h3>
        <p className="text-muted-foreground">
          Zostaw dane — odezwiemy się i pomożemy dobrać najlepszy pakiet dla Twojego salonu.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-4">
        <div>
          <Label htmlFor="pricing-name">Imię</Label>
          <Input id="pricing-name" placeholder="Twoje imię" {...register("first_name")} />
          {errors.first_name && <p className="text-sm text-destructive mt-1">{errors.first_name.message}</p>}
        </div>
        <div>
          <Label htmlFor="pricing-email">Email</Label>
          <Input id="pricing-email" type="email" placeholder="twoj@email.pl" {...register("email")} />
          {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="pricing-phone">Telefon</Label>
          <Input id="pricing-phone" type="tel" placeholder="500 000 000" {...register("phone")} />
          {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>}
        </div>
        <div className="flex items-start gap-2">
          <Checkbox
            id="pricing-rodo"
            checked={rodoValue === true}
            onCheckedChange={(checked) => setValue("rodo_consent", checked === true ? true : false as unknown as true)}
          />
          <Label htmlFor="pricing-rodo" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
            Wyrażam zgodę na przetwarzanie moich danych osobowych w celu kontaktu handlowego zgodnie z RODO.
          </Label>
        </div>
        {errors.rodo_consent && <p className="text-sm text-destructive">{errors.rodo_consent.message}</p>}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Wysyłanie..." : "Skontaktuj się ze mną"}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </form>
    </motion.div>
  );
};
