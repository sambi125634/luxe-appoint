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
import { CheckCircle, Loader2, Send } from "lucide-react";

const LeadFormSection = () => {
  const { t } = useTranslation();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formSchema = z.object({
    first_name: z.string().min(2).max(50),
    last_name: z.string().min(2).max(50),
    email: z.string().email(),
    phone: z.string().min(9).max(15),
    salon_name: z.string().min(2).max(100),
    city: z.string().min(2).max(100),
    team_size: z.string().min(1),
    website_url: z.string().url().optional().or(z.literal("")),
    rodo_consent: z.boolean().refine((val) => val === true)
  });

  type FormValues = z.infer<typeof formSchema>;

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
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("leadForm.title")}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t("leadForm.subtitle")}
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
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("leadForm.lastName")} *</FormLabel>
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
                      <FormLabel>{t("leadForm.email")} *</FormLabel>
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
              
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="team_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("leadForm.teamSize")} *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("common.search")} />
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
                  name="website_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("leadForm.website")}</FormLabel>
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
        </div>
      </div>
    </section>
  );
};

export default LeadFormSection;
