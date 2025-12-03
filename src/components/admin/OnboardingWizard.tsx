import { useState } from "react";
import { Check, Building2, Scissors, Users, Link2, Sparkles, ArrowRight, ArrowLeft, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface OnboardingWizardProps {
  onComplete: () => void;
}

interface SalonData {
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string;
}

interface ServiceData {
  id: string;
  name: string;
  duration: number;
  price: number;
  category: string;
}

interface StaffData {
  id: string;
  name: string;
  role: string;
  email: string;
}

const steps = [
  { id: 1, title: "Dane salonu", icon: Building2 },
  { id: 2, title: "Usługi", icon: Scissors },
  { id: 3, title: "Zespół", icon: Users },
  { id: 4, title: "Link rezerwacji", icon: Link2 },
  { id: 5, title: "Gotowe!", icon: Sparkles },
];

const defaultCategories = ["Twarz", "Ciało", "Włosy", "Depilacja", "Paznokcie"];

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [salonData, setSalonData] = useState<SalonData>({
    name: "",
    address: "",
    phone: "",
    email: "",
    description: "",
  });
  const [services, setServices] = useState<ServiceData[]>([]);
  const [staff, setStaff] = useState<StaffData[]>([]);
  const [bookingSlug, setBookingSlug] = useState("");

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[ąàáâãäå]/g, "a")
      .replace(/[ćçč]/g, "c")
      .replace(/[ęèéêë]/g, "e")
      .replace(/[ìíîï]/g, "i")
      .replace(/[łľ]/g, "l")
      .replace(/[ńñň]/g, "n")
      .replace(/[óòôõö]/g, "o")
      .replace(/[śšş]/g, "s")
      .replace(/[ùúûü]/g, "u")
      .replace(/[ýÿ]/g, "y")
      .replace(/[źżž]/g, "z")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleSalonDataChange = (field: keyof SalonData, value: string) => {
    setSalonData(prev => ({ ...prev, [field]: value }));
    if (field === "name") {
      setBookingSlug(generateSlug(value));
    }
  };

  const addService = () => {
    setServices(prev => [...prev, {
      id: crypto.randomUUID(),
      name: "",
      duration: 60,
      price: 0,
      category: defaultCategories[0],
    }]);
  };

  const updateService = (id: string, field: keyof ServiceData, value: string | number) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const addStaff = () => {
    setStaff(prev => [...prev, {
      id: crypto.randomUUID(),
      name: "",
      role: "Specjalista",
      email: "",
    }]);
  };

  const updateStaff = (id: string, field: keyof StaffData, value: string) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeStaff = (id: string) => {
    setStaff(prev => prev.filter(s => s.id !== id));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return salonData.name.trim() !== "" && salonData.phone.trim() !== "";
      case 2:
        return services.length > 0 && services.every(s => s.name.trim() !== "" && s.price > 0);
      case 3:
        return staff.length > 0 && staff.every(s => s.name.trim() !== "");
      case 4:
        return bookingSlug.trim() !== "";
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    toast.success("Salon został skonfigurowany! Możesz teraz przyjmować rezerwacje.");
    onComplete();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="font-serif text-2xl font-semibold mb-2">Opowiedz nam o swoim salonie</h2>
              <p className="text-muted-foreground">Te informacje pojawią się na Twojej stronie rezerwacji</p>
            </div>
            
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nazwa salonu *</Label>
                <Input
                  id="name"
                  placeholder="np. Beauty Studio Anna"
                  value={salonData.name}
                  onChange={(e) => handleSalonDataChange("name", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Adres</Label>
                <Input
                  id="address"
                  placeholder="np. ul. Kwiatowa 15, 00-001 Warszawa"
                  value={salonData.address}
                  onChange={(e) => handleSalonDataChange("address", e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon *</Label>
                  <Input
                    id="phone"
                    placeholder="np. +48 123 456 789"
                    value={salonData.phone}
                    onChange={(e) => handleSalonDataChange("phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="np. kontakt@salon.pl"
                    value={salonData.email}
                    onChange={(e) => handleSalonDataChange("email", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Krótki opis (opcjonalnie)</Label>
                <Textarea
                  id="description"
                  placeholder="Kilka słów o Twoim salonie..."
                  value={salonData.description}
                  onChange={(e) => handleSalonDataChange("description", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="font-serif text-2xl font-semibold mb-2">Dodaj swoje usługi</h2>
              <p className="text-muted-foreground">Klientki będą wybierać spośród tych zabiegów</p>
            </div>
            
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.id} className="glass-card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 grid gap-3">
                      <Input
                        placeholder="Nazwa usługi"
                        value={service.name}
                        onChange={(e) => updateService(service.id, "name", e.target.value)}
                      />
                      <div className="grid grid-cols-3 gap-3">
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={service.category}
                          onChange={(e) => updateService(service.id, "category", e.target.value)}
                        >
                          {defaultCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <Input
                          type="number"
                          placeholder="Czas (min)"
                          value={service.duration}
                          onChange={(e) => updateService(service.id, "duration", parseInt(e.target.value) || 0)}
                        />
                        <Input
                          type="number"
                          placeholder="Cena (PLN)"
                          value={service.price || ""}
                          onChange={(e) => updateService(service.id, "price", parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeService(service.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button
                variant="outline"
                className="w-full border-dashed"
                onClick={addService}
              >
                <Plus className="w-4 h-4 mr-2" />
                Dodaj usługę
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="font-serif text-2xl font-semibold mb-2">Przedstaw swój zespół</h2>
              <p className="text-muted-foreground">Klientki będą mogły wybrać preferowaną osobę</p>
            </div>
            
            <div className="space-y-4">
              {staff.map((member) => (
                <div key={member.id} className="glass-card p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <Input
                        placeholder="Imię i nazwisko"
                        value={member.name}
                        onChange={(e) => updateStaff(member.id, "name", e.target.value)}
                      />
                      <Input
                        placeholder="Stanowisko"
                        value={member.role}
                        onChange={(e) => updateStaff(member.id, "role", e.target.value)}
                      />
                      <Input
                        type="email"
                        placeholder="E-mail (opcjonalnie)"
                        value={member.email}
                        onChange={(e) => updateStaff(member.id, "email", e.target.value)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeStaff(member.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button
                variant="outline"
                className="w-full border-dashed"
                onClick={addStaff}
              >
                <Plus className="w-4 h-4 mr-2" />
                Dodaj członka zespołu
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="font-serif text-2xl font-semibold mb-2">Twój link do rezerwacji</h2>
              <p className="text-muted-foreground">Udostępnij go klientkom na stronie i w social mediach</p>
            </div>
            
            <div className="glass-card p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slug">Adres strony rezerwacji</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">beautycalendar.pl/s/</span>
                  <Input
                    id="slug"
                    value={bookingSlug}
                    onChange={(e) => setBookingSlug(generateSlug(e.target.value))}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Podgląd linku:</p>
                <p className="font-medium text-primary break-all">
                  beautycalendar.pl/s/{bookingSlug || "twoj-salon"}
                </p>
              </div>
            </div>
            
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-medium">Kod do osadzenia na stronie</h3>
              <div className="p-3 bg-muted/50 rounded-lg font-mono text-xs overflow-x-auto">
                {`<iframe src="https://beautycalendar.pl/s/${bookingSlug || "twoj-salon"}" width="100%" height="700" frameborder="0"></iframe>`}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(`<iframe src="https://beautycalendar.pl/s/${bookingSlug}" width="100%" height="700" frameborder="0"></iframe>`);
                  toast.success("Skopiowano kod do schowka!");
                }}
              >
                Kopiuj kod
              </Button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="text-center space-y-8 py-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-primary-foreground" />
            </div>
            
            <div>
              <h2 className="font-serif text-3xl font-semibold mb-4">Gratulacje! 🎉</h2>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Twój salon <span className="font-semibold text-foreground">{salonData.name}</span> jest gotowy do przyjmowania rezerwacji online.
              </p>
            </div>
            
            <div className="glass-card p-6 max-w-sm mx-auto">
              <p className="text-sm text-muted-foreground mb-3">Twój link do rezerwacji:</p>
              <p className="font-medium text-primary text-lg mb-4">
                beautycalendar.pl/s/{bookingSlug}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(`https://beautycalendar.pl/s/${bookingSlug}`);
                  toast.success("Skopiowano link!");
                }}
              >
                Kopiuj link
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto text-center">
              <div className="glass-card p-4">
                <p className="text-2xl font-semibold text-primary">{services.length}</p>
                <p className="text-sm text-muted-foreground">usług</p>
              </div>
              <div className="glass-card p-4">
                <p className="text-2xl font-semibold text-primary">{staff.length}</p>
                <p className="text-sm text-muted-foreground">specjalistów</p>
              </div>
              <div className="glass-card p-4">
                <p className="text-2xl font-semibold text-primary">24/7</p>
                <p className="text-sm text-muted-foreground">rezerwacje</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={cn(
                  "flex items-center gap-2",
                  currentStep >= step.id ? "text-primary" : "text-muted-foreground"
                )}>
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    currentStep > step.id 
                      ? "bg-primary text-primary-foreground" 
                      : currentStep === step.id 
                        ? "bg-primary/10 border-2 border-primary" 
                        : "bg-muted"
                  )}>
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "w-8 sm:w-16 h-0.5 mx-2",
                    currentStep > step.id ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm sticky bottom-0">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Wstecz
          </Button>
          
          {currentStep < 5 ? (
            <Button
              variant="luxury"
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-2"
            >
              Dalej
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="luxury"
              onClick={handleComplete}
              className="gap-2"
            >
              Przejdź do panelu
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
