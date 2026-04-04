import { useState } from "react";
import { Smartphone, Check, Bell, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";

const ownerFeatures = [
  "Zarz\u0105dzaj kalendarzem jednym palcem",
  "Powiadomienia o nowych rezerwacjach",
  "Dashboard z wynikami w czasie real",
  "Szybkie blokowanie termin\u00F3w",
  "Chat z klientkami",
  "Stany magazynowe i alerty brak\u00F3w",
];

const clientFeatures = [
  "Rezerwuj wizyt\u0119 w 30 sekund",
  "Widzi TYLKO Tw\u00F3j salon \u2014 nie marketplace z konkurencj\u0105",
  "Przypomnienia przed wizyt\u0105",
  "Wirtualna karta lojalno\u015Bciowa",
  "Oceniaj i polecaj salon znajomym",
  "P\u0142atno\u015Bci BLIK jednym klikni\u0119ciem",
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

export const MobileAppSection = () => {
  const [waitlistEmail, setWaitlistEmail] = useState("");

  const handleWaitlist = () => {
    if (!waitlistEmail || !waitlistEmail.includes("@")) {
      toast.error("Podaj poprawny adres email");
      return;
    }
    toast.success("Dzi\u0119kujemy! Powiadomimy Ci\u0119 o premierze \uD83C\uDF89");
    setWaitlistEmail("");
  };

  return (
    <section className="py-20 lg:py-32 relative overflow-hidden bg-gradient-to-b from-muted/20 to-background">
      <div className="container relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <Badge variant="outline" className="mb-6 px-4 py-2 border-primary/30 bg-primary/5 text-primary">
            <Smartphone className="w-4 h-4 mr-2" />
            Wkr\u00F3tce dost\u0119pne
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Prywatna aplikacja w kieszeni Twojej klientki.
            <br />
            <span className="text-gradient-luxury">Tylko Ty. Bez konkurencji.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Twoja klientka pobiera aplikacj\u0119 Beauty Calendar i przypisuje si\u0119 do Twojego salonu. 
            Widzi tylko Ciebie \u2014 nie marketplace, nie konkurencj\u0119. To Twoja prywatna przestrze\u0144 w jej telefonie.
          </p>
        </motion.div>

        {/* Two app cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Owner app */}
          <motion.div
            custom={0}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Card className="relative overflow-hidden border-primary/20 h-full">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-3xl rounded-full" />
              <CardContent className="p-6 lg:p-8 relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Beauty Calendar Business</h3>
                    <p className="text-sm text-muted-foreground">Dla w\u0142a\u015Bcicielek i managera salonu</p>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {ownerFeatures.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="flex gap-3 mb-4">
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg opacity-60 cursor-not-allowed">
                    <div className="text-left">
                      <div className="text-[10px] text-muted-foreground">Pobierz w</div>
                      <div className="text-xs font-semibold">App Store</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg opacity-60 cursor-not-allowed">
                    <div className="text-left">
                      <div className="text-[10px] text-muted-foreground">Pobierz w</div>
                      <div className="text-xs font-semibold">Google Play</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Bell className="w-3 h-3" />
                  Dost\u0119pna Q3 2026 \u2014 zapisz si\u0119 na list\u0119
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Client app */}
          <motion.div
            custom={1}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Card className="relative overflow-hidden border-secondary/20 h-full">
              <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/10 blur-3xl rounded-full" />
              <CardContent className="p-6 lg:p-8 relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Beauty Calendar Client</h3>
                    <p className="text-sm text-muted-foreground">Prywatna aplikacja dla klientek Twojego salonu</p>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {clientFeatures.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="flex gap-3 mb-4">
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg opacity-60 cursor-not-allowed">
                    <div className="text-left">
                      <div className="text-[10px] text-muted-foreground">Pobierz w</div>
                      <div className="text-xs font-semibold">App Store</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg opacity-60 cursor-not-allowed">
                    <div className="text-left">
                      <div className="text-[10px] text-muted-foreground">Pobierz w</div>
                      <div className="text-xs font-semibold">Google Play</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Bell className="w-3 h-3" />
                  Dost\u0119pna Q4 2026 \u2014 do\u0142\u0105cz do waitlisty
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Waitlist form */}
        <motion.div
          className="max-w-xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-muted-foreground mb-4">
            B\u0105d\u017A pierwsza \u2014 do\u0142\u0105cz do listy oczekuj\u0105cych
            i dostań aplikacj\u0119 w dniu premiery za darmo.
          </p>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="twoj@email.pl"
              value={waitlistEmail}
              onChange={(e) => setWaitlistEmail(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleWaitlist} className="gap-2">
              <Bell className="w-4 h-4" />
              Powiadom mnie
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Do\u0142\u0105czy\u0142o ju\u017C <span className="font-bold text-primary">247</span> w\u0142a\u015Bcicielek salon\u00F3w
          </p>
        </motion.div>
      </div>
    </section>
  );
};