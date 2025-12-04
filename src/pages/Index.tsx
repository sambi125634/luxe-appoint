import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Sparkles, Users, Clock, ArrowRight, Star } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Inteligentny kalendarz",
    description: "Automatyczne zarządzanie terminami z synchronizacją Google Calendar",
  },
  {
    icon: Users,
    title: "Zarządzanie zespołem",
    description: "Grafiki personelu, przypisane usługi i indywidualne kalendarze",
  },
  {
    icon: Clock,
    title: "Rezerwacje 24/7",
    description: "Klientki mogą rezerwować wizyty o każdej porze dnia i nocy",
  },
  {
    icon: Sparkles,
    title: "Elegancki widget",
    description: "Piękny formularz rezerwacji do osadzenia na Twojej stronie",
  },
];

const testimonials = [
  {
    name: "Anna Wiśniewska",
    role: "Właścicielka Luxury Beauty Spa",
    text: "Beauty Calendar całkowicie odmienił sposób, w jaki zarządzam rezerwacjami. Klientki są zachwycone!",
    rating: 5,
  },
  {
    name: "Karolina Nowak",
    role: "Kosmetolog",
    text: "Wreszcie mam pełną kontrolę nad moim grafikiem. Aplikacja jest intuicyjna i piękna.",
    rating: 5,
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-serif text-xl font-semibold">Beauty Calendar</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/demo">
              <Button variant="ghost">Demo</Button>
            </Link>
            <Link to="/admin">
              <Button variant="outline">Panel salonu</Button>
            </Link>
            <Link to="/book/demo-salon">
              <Button variant="luxury">Zarezerwuj wizytę</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-accent/20 rounded-full blur-2xl" />

        <div className="container mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            Nowa era rezerwacji w branży beauty
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 animate-slide-up">
            <span className="text-gradient-luxury">Piękne kalendarze</span>
            <br />
            <span className="text-foreground">dla pięknych salonów</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Profesjonalny system rezerwacji online dla salonów beauty i klinik medycyny estetycznej. 
            Elegancki, intuicyjny, dopasowany do Twojej marki.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Link to="/book/demo-salon">
              <Button variant="luxury" size="xl" className="gap-2">
                Zobacz demo rezerwacji
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/admin">
              <Button variant="glass" size="xl">
                Panel administracyjny
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Wszystko, czego potrzebuje Twój salon
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Kompleksowe narzędzie do zarządzania rezerwacjami, personelem i relacjami z klientkami
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="glass-card p-6 hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Zaufały nam najlepsze salony
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="glass-card-elevated p-8 animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-lg mb-6 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="glass-card-elevated p-12 text-center bg-gradient-to-r from-primary/5 to-secondary/5">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Gotowa na transformację?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Dołącz do grona salonów, które zrewolucjonizowały swoje rezerwacje z Beauty Calendar
            </p>
            <Link to="/book/demo-salon">
              <Button variant="luxury" size="xl" className="gap-2">
                Wypróbuj za darmo
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-serif font-semibold">Beauty Calendar</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Beauty Calendar. Stworzone z miłością do piękna.
          </p>
        </div>
      </footer>
    </div>
  );
}
