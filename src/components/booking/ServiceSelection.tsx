import { useState } from "react";
import { Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  description: string;
}

interface ServiceSelectionProps {
  onSelect: (service: Service) => void;
  selectedService: Service | null;
}

const categories = [
  { id: "all", name: "Wszystkie" },
  { id: "twarz", name: "Twarz" },
  { id: "cialo", name: "Ciało" },
  { id: "depilacja", name: "Depilacja" },
  { id: "brwi", name: "Brwi i rzęsy" },
];

const services: Service[] = [
  { id: "1", name: "Peeling kawitacyjny", category: "twarz", duration: 45, price: 150, description: "Głębokie oczyszczanie skóry twarzy" },
  { id: "2", name: "Mezoterapia igłowa", category: "twarz", duration: 60, price: 350, description: "Odmładzanie i nawilżanie skóry" },
  { id: "3", name: "Mikrodermabrazja", category: "twarz", duration: 50, price: 180, description: "Mechaniczny peeling diamentowy" },
  { id: "4", name: "Masaż relaksacyjny", category: "cialo", duration: 60, price: 200, description: "Pełny masaż ciała olejkami" },
  { id: "5", name: "Masaż gorącymi kamieniami", category: "cialo", duration: 75, price: 280, description: "Terapia ciepłem i dotykiem" },
  { id: "6", name: "Depilacja woskowa nogi", category: "depilacja", duration: 45, price: 120, description: "Pełne nogi woskiem miodowym" },
  { id: "7", name: "Depilacja laserowa bikini", category: "depilacja", duration: 30, price: 250, description: "Trwałe usuwanie owłosienia" },
  { id: "8", name: "Stylizacja brwi", category: "brwi", duration: 40, price: 100, description: "Regulacja i henna" },
  { id: "9", name: "Przedłużanie rzęs 1:1", category: "brwi", duration: 120, price: 350, description: "Klasyczna metoda przedłużania" },
];

export function ServiceSelection({ onSelect, selectedService }: ServiceSelectionProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredServices = activeCategory === "all" 
    ? services 
    : services.filter(s => s.category === activeCategory);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-serif font-semibold mb-2">Wybierz usługę</h2>
        <p className="text-muted-foreground">Przeglądaj nasze usługi i wybierz tę, która Cię interesuje</p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground shadow-soft"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Services grid */}
      <div className="grid gap-4">
        {filteredServices.map((service, index) => (
          <button
            key={service.id}
            onClick={() => onSelect(service)}
            className={cn(
              "group w-full text-left p-5 rounded-xl border transition-all duration-300",
              "animate-fade-in",
              selectedService?.id === service.id
                ? "border-primary bg-primary/5 shadow-glow"
                : "border-border bg-card hover:border-primary/50 hover:shadow-soft"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                  {service.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {service.description}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {service.duration} min
                  </span>
                  <span className="font-semibold text-accent">
                    {service.price} zł
                  </span>
                </div>
              </div>
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                selectedService?.id === service.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
              )}>
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
