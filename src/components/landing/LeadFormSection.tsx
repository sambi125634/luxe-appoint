import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
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
import { ArrowRight, CheckCircle, Loader2, Send, Check, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LeadFormSection = () => {
  const { t } = useTranslation();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");

  const formSchema = z.object({
    first_name: z.string().min(2).max(50),
    last_name: z.string().min(2).max(50),
    phone: z.string().min(9).max(15),
    salon_name: z.string().min(2).max(100),
    city: z.string().min(2).max(100),
    team_size: z.string().min(1),
    website_url: z.string().url().optional().or(z.literal("")),
    rodo_consent: z.boolean().refine((val) => val === true),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      salon_name: "",
      city: "",
      team_size: "",
      website_url: "",
      rodo_consent: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("leads").insert({
        first_name: data.first_name,
        last_name: data.last_name,
        email: email,
        phone: data.phone,
        salon_name: data.salon_name,
        city: data.city,
        team_size: data.team_size,
        website_url: data.website_url || null,
        rodo_consent: data.rodo_consent,
        status: "new",
      });
      if (error) throw error;
      setIsSubmitted(true);
      toast.success(t("leadForm.success"));
    } catch (error) {
      console.error("Error submitting lead:", error);
      toast.error(t("settings.error"));
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
              {t("leadForm.success")}
            </h3>
            <p className="text-muted-foreground text-lg">
              <a href="/demo" className="text-gold hover:underline">
                {t("demo.viewSalonPanel")}
              </a>
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
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center glass-card-elevated p-8 md:p-12 rounded-2xl"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Zacznij za darmo.
                  <br />
                  <span className="text-gradient-luxury">Bez karty kredytowej.</span>
                </h2>
                <p className="text-muted-foreground text-lg mb-8">
                  Gotowe w 5 minut. Import z Booksy jednym kliknięciem.
                </p>

                <div className="flex gap-2 max-w-md mx-auto mb-6">
                  <Input
                    type="email"
                    placeholder="twoj@email.pl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 h-12"
                  />
                  <Button
                    size="lg"
                    className="h-12 px-6 gap-2 whitespace-nowrap"
                    onClick={() => setStep(2)}
                    disabled={!email || !email.includes("@")}
                  >
                    Dalej
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                  {["Bez karty", "Anuluj kiedy chcesz", "Setup 5 min"].map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      {item}
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="glass-card-elevated p-8 md:p-10 rounded-2xl"
              >
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">2</div>
                    <span className="text-sm text-muted-foreground">z 2 — jeszcze chwila!</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Email: <strong className="text-foreground">{email}</strong>
                    <button onClick={() => setStep(1)} className="ml-2 text-primary hover:underline text-xs">zmień</button>
                  </p>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("leadForm.firstName")} *</FormLabel>
                            <FormControl>
                              <Input placeholder="Anna" {...field} />
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
                            <FormLabel>{t("leadForm.phone")} *</FormLabel>
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
                            <FormLabel>{t("leadForm.salonName")} *</FormLabel>
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
                            <FormLabel>{t("leadForm.city")} *</FormLabel>
                            <FormControl>
                              <Input placeholder="Warszawa" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="team_size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("leadForm.teamSize")} *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Wybierz wielkość zespołu" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">{t("leadForm.teamSizeOptions.solo")}</SelectItem>
                              <SelectItem value="2-5">{t("leadForm.teamSizeOptions.small")}</SelectItem>
                              <SelectItem value="6-10">{t("leadForm.teamSizeOptions.medium")}</SelectItem>
                              <SelectItem value="10+">{t("leadForm.teamSizeOptions.large")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                              {t("leadForm.consent")} *
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
                          {t("common.loading")}
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5" />
                          {t("leadForm.submit")}
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default LeadFormSection;
