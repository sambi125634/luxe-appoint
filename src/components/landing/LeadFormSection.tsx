import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowRight, CheckCircle, Loader2, Send, Check, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { appleEaseArray } from "@/components/ui/AnimatedSection";

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
      first_name: "", last_name: "", phone: "", salon_name: "",
      city: "", team_size: "", website_url: "", rodo_consent: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("leads").insert({
        first_name: data.first_name, last_name: data.last_name, email,
        phone: data.phone, salon_name: data.salon_name, city: data.city,
        team_size: data.team_size, website_url: data.website_url || null,
        rodo_consent: data.rodo_consent, status: "new",
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
      <section id="lead-form" className="landing-section-dark landing-section-spacing">
        <div className="max-w-xl mx-auto text-center landing-card-dark p-12">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(34,197,94,0.08)" }}>
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-bold mb-4" style={{ color: "#1d1d1f", fontFamily: "'Inter', sans-serif" }}>
            {t("leadForm.success")}
          </h3>
          <p style={{ color: "#6e6e73" }}>
            <a href="/demo" className="text-[#8b5cf6] hover:underline">{t("demo.viewSalonPanel")}</a>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="lead-form" className="landing-section-dark landing-section-spacing relative overflow-hidden" style={{ background: "linear-gradient(180deg, #faf9f7, #f5f0ff, #faf9f7)" }}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#8b5cf6]/5 blur-[150px]" />

      <div className="max-w-2xl mx-auto px-[max(24px,5vw)] relative z-10">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: appleEaseArray }}
              className="text-center landing-card-dark p-8 md:p-12"
            >
              <h2 className="headline-section mb-2" style={{ color: "#1d1d1f" }}>
                Zacznij za darmo.
                <br />
                <span className="apple-accent-gradient">Bez karty kredytowej.</span>
              </h2>
              <p className="subheadline mb-8" style={{ color: "#6e6e73" }}>
                Gotowe w 5 minut. Import z Booksy jednym kliknięciem.
              </p>

              <div className="flex gap-2 max-w-md mx-auto mb-6">
                <Input
                  type="email"
                  placeholder="twoj@email.pl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-12 bg-white border-black/10 text-[#1d1d1f] placeholder:text-[#c7c7cc]"
                />
                <button
                  className="apple-btn-primary h-12 px-6 flex items-center gap-2 whitespace-nowrap text-sm"
                  onClick={() => setStep(2)}
                  disabled={!email || !email.includes("@")}
                >
                  Dalej
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap justify-center gap-4 text-sm" style={{ color: "#86868b" }}>
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
              transition={{ duration: 0.3, ease: appleEaseArray }}
              className="landing-card-dark p-8 md:p-10"
            >
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "rgba(139,92,246,0.1)", color: "#8b5cf6" }}>2</div>
                  <span className="text-sm" style={{ color: "#86868b" }}>z 2 — jeszcze chwila!</span>
                </div>
                <p className="text-sm" style={{ color: "#86868b" }}>
                  Email: <strong style={{ color: "#1d1d1f" }}>{email}</strong>
                  <button onClick={() => setStep(1)} className="ml-2 text-[#8b5cf6] hover:underline text-xs">zmień</button>
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="first_name" render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: "#6e6e73" }}>{t("leadForm.firstName")} *</FormLabel>
                        <FormControl><Input placeholder="Anna" {...field} className="bg-white border-black/10 text-[#1d1d1f] placeholder:text-[#c7c7cc]" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: "#6e6e73" }}>{t("leadForm.phone")} *</FormLabel>
                        <FormControl><Input type="tel" placeholder="500 123 456" {...field} className="bg-white border-black/10 text-[#1d1d1f] placeholder:text-[#c7c7cc]" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="salon_name" render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: "#6e6e73" }}>{t("leadForm.salonName")} *</FormLabel>
                        <FormControl><Input placeholder="Studio Urody Anna" {...field} className="bg-white border-black/10 text-[#1d1d1f] placeholder:text-[#c7c7cc]" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="city" render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: "#6e6e73" }}>{t("leadForm.city")} *</FormLabel>
                        <FormControl><Input placeholder="Warszawa" {...field} className="bg-white border-black/10 text-[#1d1d1f] placeholder:text-[#c7c7cc]" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="team_size" render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: "#6e6e73" }}>{t("leadForm.teamSize")} *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="bg-white border-black/10 text-[#1d1d1f]"><SelectValue placeholder="Wybierz wielkość zespołu" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="1">{t("leadForm.teamSizeOptions.solo")}</SelectItem>
                          <SelectItem value="2-5">{t("leadForm.teamSizeOptions.small")}</SelectItem>
                          <SelectItem value="6-10">{t("leadForm.teamSizeOptions.medium")}</SelectItem>
                          <SelectItem value="10+">{t("leadForm.teamSizeOptions.large")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="rodo_consent" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal" style={{ color: "#86868b" }}>{t("leadForm.consent")} *</FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )} />

                  <button
                    type="submit"
                    className="apple-btn-primary w-full flex items-center justify-center gap-2 text-base py-4"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <><Loader2 className="h-5 w-5 animate-spin" />{t("common.loading")}</>
                    ) : (
                      <><Send className="h-5 w-5" />{t("leadForm.submit")}</>
                    )}
                  </button>
                </form>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default LeadFormSection;
