import { useState, useMemo } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles, Calendar, Clock, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookingProgress } from "./BookingProgress";
import { ServiceSelection } from "./ServiceSelection";
import { StaffSelection } from "./StaffSelection";
import { DateTimeSelection } from "./DateTimeSelection";
import { ClientForm, ClientData } from "./ClientForm";
import { BookingConfirmation } from "./BookingConfirmation";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { BookingWidget as WidgetConfig, WidgetStep, defaultWidgetSteps, defaultWidgetTheme } from "@/components/admin/widgets/types";

const defaultSteps = ["Usługa", "Specjalista", "Termin", "Dane"];

// Map step IDs to component names
const stepIdToName: Record<string, string> = {
  intro: "Wprowadzenie",
  services: "Usługa",
  staff: "Specjalista",
  datetime: "Termin",
  form: "Dane",
};

interface BookingWidgetProps {
  widgetConfig?: WidgetConfig | null;
}

interface Service {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  description: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  rating: number;
}

// Recommendations mapping
const serviceRecommendations: Record<string, { id: string; name: string; price: number; duration: number }[]> = {
  "1": [ // Peeling kawitacyjny
    { id: "2", name: "Mezoterapia igłowa", price: 350, duration: 60 },
    { id: "3", name: "Mikrodermabrazja", price: 180, duration: 50 },
  ],
  "2": [ // Mezoterapia
    { id: "1", name: "Peeling kawitacyjny", price: 150, duration: 45 },
  ],
  "4": [ // Masaż relaksacyjny
    { id: "5", name: "Masaż gorącymi kamieniami", price: 280, duration: 75 },
  ],
  "6": [ // Depilacja woskowa
    { id: "7", name: "Depilacja laserowa bikini", price: 250, duration: 30 },
  ],
  "8": [ // Stylizacja brwi
    { id: "9", name: "Przedłużanie rzęs 1:1", price: 350, duration: 120 },
  ],
};

export function BookingWidget({ widgetConfig }: BookingWidgetProps) {
  // Build dynamic steps from widget configuration
  const { steps, stepMapping } = useMemo(() => {
    if (!widgetConfig?.steps) {
      return { 
        steps: defaultSteps, 
        stepMapping: ["intro", "services", "staff", "datetime", "form"] 
      };
    }
    
    const enabledSteps = widgetConfig.steps
      .filter(s => s.enabled && s.id !== "summary") // Exclude summary step
      .sort((a, b) => a.order - b.order);
    
    // Build step names array (excluding intro which is step 0)
    const stepNames = enabledSteps
      .filter(s => s.id !== "intro")
      .map(s => stepIdToName[s.id] || s.name);
    
    // Build step ID mapping for navigation
    const mapping = enabledSteps.map(s => s.id);
    
    return { steps: stepNames, stepMapping: mapping };
  }, [widgetConfig?.steps]);

  const hasIntro = stepMapping.includes("intro");
  const [currentStep, setCurrentStep] = useState(hasIntro ? 0 : 1);
  const [previousStep, setPreviousStep] = useState(hasIntro ? 0 : 1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Get current step ID based on currentStep index
  const getCurrentStepId = (stepIndex: number): string => {
    if (hasIntro) {
      return stepMapping[stepIndex] || "intro";
    }
    return stepMapping[stepIndex - 1] || "services";
  };

  const currentStepId = getCurrentStepId(currentStep);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [clientData, setClientData] = useState<ClientData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    notes: "",
    acceptRodo: false,
    acceptMarketing: false,
    confirmationMethod: 'sms',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const changeStep = (newStep: number) => {
    setPreviousStep(currentStep);
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(newStep);
      setIsTransitioning(false);
    }, 150);
  };

  const canProceed = () => {
    switch (currentStepId) {
      case "intro":
        return true;
      case "services":
        return selectedService !== null;
      case "staff":
        return true; // Staff can be null (any)
      case "datetime":
        return selectedDate !== null && selectedTime !== null;
      case "form":
        return (
          clientData.firstName.trim() !== "" &&
          clientData.lastName.trim() !== "" &&
          clientData.phone.trim() !== "" &&
          clientData.email.trim() !== "" &&
          clientData.acceptRodo
        );
      default:
        return false;
    }
  };

  const getNextStepIndex = () => {
    const currentIndex = stepMapping.indexOf(currentStepId);
    return currentIndex + 1 < stepMapping.length ? currentIndex + 1 : currentIndex;
  };

  const getPrevStepIndex = () => {
    const currentIndex = stepMapping.indexOf(currentStepId);
    return currentIndex > 0 ? currentIndex - 1 : 0;
  };

  const isLastStep = currentStepId === "form";

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    // Show recommendations if available
    if (serviceRecommendations[service.id]) {
      setShowRecommendations(true);
    }
  };

  const handleNext = () => {
    if (!isLastStep && canProceed()) {
      setShowRecommendations(false);
      const nextIndex = getNextStepIndex();
      changeStep(hasIntro ? nextIndex : nextIndex + 1);
    }
  };

  const handleBack = () => {
    const currentIndex = stepMapping.indexOf(currentStepId);
    if (currentIndex > 0) {
      setShowRecommendations(false);
      const prevIndex = getPrevStepIndex();
      changeStep(hasIntro ? prevIndex : prevIndex + 1);
    }
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsConfirmed(true);
    toast({
      title: "Rezerwacja potwierdzona!",
      description: "Otrzymasz wkrótce SMS z potwierdzeniem wizyty.",
    });
  };

  const handleDateTimeSelect = (date: Date, time: string) => {
    setSelectedDate(date);
    if (time) {
      setSelectedTime(time);
    }
  };

  const handleStartBooking = () => {
    changeStep(1);
  };

  const transitionDirection = currentStep > previousStep ? 'forward' : 'backward';

  if (isConfirmed) {
    return (
      <BookingConfirmation
        service={selectedService}
        staff={selectedStaff}
        date={selectedDate}
        time={selectedTime}
        clientName={`${clientData.firstName} ${clientData.lastName}`}
      />
    );
  }

  // Intro screen
  if (currentStepId === "intro") {
    return (
      <div className="w-full max-w-2xl mx-auto animate-fade-in">
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mx-auto mb-6 shadow-glow">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-serif font-bold mb-3">
            {widgetConfig?.theme?.headerText || "Zarezerwuj wizytę"}
          </h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Rezerwacja online w 3 prostych krokach. Wybierz usługę, termin i gotowe!
          </p>

          {/* Steps preview */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="flex flex-col items-center p-4 rounded-xl bg-card border border-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">1. Wybierz usługę</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-card border border-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">2. Wybierz termin</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-card border border-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                <UserCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">3. Potwierdź</span>
            </div>
          </div>

          <Button 
            variant="luxury" 
            size="lg" 
            onClick={handleStartBooking}
            className="gap-2 px-8"
          >
            Zacznij rezerwację
            <ArrowRight className="w-4 h-4" />
          </Button>

          <p className="text-xs text-muted-foreground mt-6">
            🕐 Zajmie Ci to tylko 2 minuty
          </p>
        </div>
      </div>
    );
  }

  const recommendations = selectedService ? serviceRecommendations[selectedService.id] : [];

  // Calculate progress step index for BookingProgress
  const progressStepIndex = stepMapping.indexOf(currentStepId);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <BookingProgress currentStep={progressStepIndex} steps={steps} />

      <div className={cn(
        "mt-8 transition-all duration-300",
        isTransitioning 
          ? "opacity-0 translate-x-4" 
          : "opacity-100 translate-x-0"
      )}>
        {currentStepId === "services" && (
          <>
            <ServiceSelection
              onSelect={handleServiceSelect}
              selectedService={selectedService}
              onProceed={handleNext}
            />
            
            {/* Recommendations */}
            {showRecommendations && recommendations && recommendations.length > 0 && (
              <div className="mt-6 p-4 bg-secondary/5 border border-secondary/20 rounded-xl animate-fade-in">
                <p className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-secondary" />
                  Często łączone z tym zabiegiem:
                </p>
                <div className="flex flex-wrap gap-2">
                  {recommendations.map((rec) => (
                    <Badge 
                      key={rec.id}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/20 transition-colors py-2 px-3"
                      onClick={() => {
                        toast({
                          title: "Dodaj następnym razem",
                          description: `${rec.name} możesz dodać przy kolejnej wizycie.`,
                        });
                      }}
                    >
                      {rec.name} 
                      <span className="ml-2 text-xs opacity-70">+{rec.price} zł</span>
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Kliknij, aby dodać do listy życzeń na przyszłość
                </p>
              </div>
            )}
          </>
        )}
        {currentStepId === "staff" && (
          <StaffSelection
            onSelect={setSelectedStaff}
            selectedStaff={selectedStaff}
            onProceed={handleNext}
          />
        )}
        {currentStepId === "datetime" && (
          <DateTimeSelection
            onSelect={handleDateTimeSelect}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            serviceDuration={selectedService?.duration}
            onProceed={handleNext}
          />
        )}
        {currentStepId === "form" && (
          <ClientForm onUpdate={setClientData} data={clientData} />
        )}
      </div>

      {/* Selected service summary - sticky on mobile */}
      {selectedService && currentStepId !== "services" && (
        <div className="fixed bottom-20 left-4 right-4 sm:static sm:mt-4 z-10">
          <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-3 shadow-lg sm:shadow-none flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{selectedService.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  {selectedService.duration} min
                  {selectedDate && selectedTime && (
                    <span className="ml-2">• {selectedTime}</span>
                  )}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary">{selectedService.price} zł</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className={cn(
        "flex items-center justify-between mt-8 pt-6 border-t border-border",
        selectedService && currentStepId !== "services" && "mb-24 sm:mb-0"
      )}>
        <Button
          variant="ghost"
          onClick={handleBack}
          className="gap-2"
          disabled={stepMapping.indexOf(currentStepId) === 0}
        >
          <ArrowLeft className="w-4 h-4" />
          Wstecz
        </Button>

        {!isLastStep ? (
          <Button
            variant="luxury"
            size="lg"
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
            size="lg"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                Potwierdzanie...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Potwierdź rezerwację
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
