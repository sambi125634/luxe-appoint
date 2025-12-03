import { useState } from "react";
import { Clock, ChevronRight, Sparkles, Star, Play, ImageIcon, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Service {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  description: string;
  benefits?: string[];
  image?: string;
  video?: string;
  popular?: boolean;
}

interface ServiceSelectionProps {
  onSelect: (service: Service) => void;
  selectedService: Service | null;
}

const categories = [
  { id: "all", name: "Wszystkie", icon: "✨" },
  { id: "twarz", name: "Twarz", icon: "🧖‍♀️" },
  { id: "cialo", name: "Ciało", icon: "💆‍♀️" },
  { id: "depilacja", name: "Depilacja", icon: "✂️" },
  { id: "brwi", name: "Brwi i rzęsy", icon: "👁️" },
];

const durationFilters = [
  { id: "all", name: "Dowolny czas" },
  { id: "short", name: "Do 30 min" },
  { id: "medium", name: "30-60 min" },
  { id: "long", name: "60+ min" },
];

const services: Service[] = [
  { 
    id: "1", 
    name: "Peeling kawitacyjny", 
    category: "twarz", 
    duration: 45, 
    price: 150, 
    description: "Głębokie oczyszczanie skóry twarzy",
    benefits: ["Oczyszcza pory", "Wygładza skórę", "Redukuje zaskórniki"],
    popular: true,
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=300&fit=crop"
  },
  { 
    id: "2", 
    name: "Mezoterapia igłowa", 
    category: "twarz", 
    duration: 60, 
    price: 350, 
    description: "Odmładzanie i intensywne nawilżanie skóry od wewnątrz",
    benefits: ["Nawilża głębokie warstwy skóry", "Redukuje zmarszczki", "Poprawia koloryt"],
    popular: true,
    image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400&h=300&fit=crop"
  },
  { 
    id: "3", 
    name: "Mikrodermabrazja", 
    category: "twarz", 
    duration: 50, 
    price: 180, 
    description: "Mechaniczny peeling diamentowy dla gładkiej skóry",
    benefits: ["Usuwa martwy naskórek", "Stymuluje kolagen", "Wyrównuje koloryt"],
    image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&h=300&fit=crop"
  },
  { 
    id: "4", 
    name: "Masaż relaksacyjny", 
    category: "cialo", 
    duration: 60, 
    price: 200, 
    description: "Pełny masaż ciała aromatycznymi olejkami",
    benefits: ["Redukuje stres", "Rozluźnia mięśnie", "Poprawia krążenie"],
    popular: true,
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop"
  },
  { 
    id: "5", 
    name: "Masaż gorącymi kamieniami", 
    category: "cialo", 
    duration: 75, 
    price: 280, 
    description: "Luksusowa terapia ciepłem i dotykiem",
    benefits: ["Głęboki relaks", "Łagodzi napięcia", "Detoks organizmu"],
    image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=400&h=300&fit=crop"
  },
  { 
    id: "6", 
    name: "Depilacja woskowa nogi", 
    category: "depilacja", 
    duration: 45, 
    price: 120, 
    description: "Pełne nogi naturalnym woskiem miodowym",
    benefits: ["Gładka skóra do 4 tygodni", "Osłabia włoski", "Delikatna dla skóry"],
    image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=300&fit=crop"
  },
  { 
    id: "7", 
    name: "Depilacja laserowa bikini", 
    category: "depilacja", 
    duration: 30, 
    price: 250, 
    description: "Trwałe usuwanie owłosienia laserem diodowym",
    benefits: ["Trwałe efekty", "Bezbolesna metoda", "Gładka skóra na lata"],
    popular: true,
    image: "https://images.unsplash.com/photo-1598531195855-2ab6ed0fc53a?w=400&h=300&fit=crop"
  },
  { 
    id: "8", 
    name: "Stylizacja brwi", 
    category: "brwi", 
    duration: 40, 
    price: 100, 
    description: "Profesjonalna regulacja i henna brwi",
    benefits: ["Idealny kształt", "Wyraziste spojrzenie", "Efekt do 6 tygodni"],
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop"
  },
  { 
    id: "9", 
    name: "Przedłużanie rzęs 1:1", 
    category: "brwi", 
    duration: 120, 
    price: 350, 
    description: "Klasyczna metoda przedłużania dla naturalnego efektu",
    benefits: ["Naturalny wygląd", "Trwałość 3-4 tygodnie", "Nie wymaga tuszu"],
    image: "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=400&h=300&fit=crop"
  },
];

export function ServiceSelection({ onSelect, selectedService }: ServiceSelectionProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeDuration, setActiveDuration] = useState("all");
  const [previewService, setPreviewService] = useState<Service | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredServices = services.filter(s => {
    const categoryMatch = activeCategory === "all" || s.category === activeCategory;
    let durationMatch = true;
    if (activeDuration === "short") durationMatch = s.duration <= 30;
    if (activeDuration === "medium") durationMatch = s.duration > 30 && s.duration <= 60;
    if (activeDuration === "long") durationMatch = s.duration > 60;
    return categoryMatch && durationMatch;
  });

  const popularServices = filteredServices.filter(s => s.popular);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-serif font-semibold mb-2">Wybierz usługę</h2>
        <p className="text-muted-foreground">Odkryj nasze zabiegi i wybierz idealny dla siebie</p>
      </div>

      {/* Category filters - Netflix style tiles */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2",
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground shadow-soft scale-105"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:scale-102"
            )}
          >
            <span>{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Duration filter toggle */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2 text-muted-foreground"
        >
          <Filter className="w-4 h-4" />
          Filtruj po czasie
        </Button>
        {showFilters && (
          <div className="flex gap-2 animate-fade-in">
            {durationFilters.map(filter => (
              <Badge
                key={filter.id}
                variant={activeDuration === filter.id ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => setActiveDuration(filter.id)}
              >
                {filter.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Popular services highlight */}
      {popularServices.length > 0 && activeCategory === "all" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Star className="w-4 h-4 text-amber-500" />
            Popularne zabiegi
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {popularServices.slice(0, 2).map((service) => (
              <button
                key={service.id}
                onClick={() => onSelect(service)}
                className={cn(
                  "relative overflow-hidden rounded-xl border transition-all duration-300 text-left",
                  selectedService?.id === service.id
                    ? "border-primary shadow-glow ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50 hover:shadow-md"
                )}
              >
                {service.image && (
                  <div className="h-24 w-full overflow-hidden">
                    <img 
                      src={service.image} 
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{service.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {service.duration} min
                        <span className="font-semibold text-primary">{service.price} zł</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      Hit
                    </Badge>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Services grid */}
      <div className="grid gap-3">
        {filteredServices.map((service, index) => (
          <button
            key={service.id}
            onClick={() => onSelect(service)}
            className={cn(
              "group w-full text-left rounded-xl border transition-all duration-300",
              "animate-fade-in",
              selectedService?.id === service.id
                ? "border-primary bg-primary/5 shadow-glow ring-2 ring-primary/20"
                : "border-border bg-card hover:border-primary/50 hover:shadow-soft"
            )}
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <div className="flex">
              {/* Image thumbnail */}
              {service.image && (
                <div className="relative w-24 sm:w-32 flex-shrink-0 overflow-hidden rounded-l-xl">
                  <img 
                    src={service.image} 
                    alt={service.name}
                    className="w-full h-full object-cover aspect-square"
                  />
                  {service.video && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {service.name}
                      </h3>
                      {service.popular && (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 text-xs">
                          Hit
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                      {service.description}
                    </p>
                    
                    {/* Benefits preview */}
                    {service.benefits && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {service.benefits.slice(0, 2).map((benefit, i) => (
                          <span key={i} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            ✓ {benefit}
                          </span>
                        ))}
                        {service.benefits.length > 2 && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setPreviewService(service); }}
                            className="text-xs text-primary hover:underline"
                          >
                            +{service.benefits.length - 2} więcej
                          </button>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {service.duration} min
                      </span>
                      <span className="font-bold text-primary text-lg">
                        {service.price} zł
                      </span>
                    </div>
                  </div>
                  
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0",
                    selectedService?.id === service.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  )}>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">Brak usług w tej kategorii</p>
          <p className="text-sm">Spróbuj wybrać inną kategorię lub filtr</p>
        </div>
      )}

      {/* Service preview dialog */}
      <Dialog open={!!previewService} onOpenChange={() => setPreviewService(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">{previewService?.name}</DialogTitle>
          </DialogHeader>
          {previewService?.image && (
            <img 
              src={previewService.image} 
              alt={previewService.name}
              className="w-full h-48 object-cover rounded-lg"
            />
          )}
          <p className="text-muted-foreground">{previewService?.description}</p>
          {previewService?.benefits && (
            <div className="space-y-2">
              <p className="font-medium text-sm">Korzyści:</p>
              <ul className="space-y-1">
                {previewService.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {previewService?.duration} min
            </div>
            <span className="text-xl font-bold text-primary">{previewService?.price} zł</span>
          </div>
          <Button 
            className="w-full" 
            onClick={() => { 
              if (previewService) onSelect(previewService); 
              setPreviewService(null); 
            }}
          >
            Wybierz tę usługę
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
