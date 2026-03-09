import { useState, useMemo, useEffect } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles, Calendar, Clock, UserCheck, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookingProgress } from "./BookingProgress";
import { ServiceSelection } from "./ServiceSelection";
import { StaffSelection } from "./StaffSelection";
import { DateTimeSelection } from "./DateTimeSelection";
import { ClientForm, ClientData } from "./ClientForm";
import { BookingConfirmation } from "./BookingConfirmation";
import { PaymentStep } from "./PaymentStep";
import { SakuraBackground } from "./SakuraBackground";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { BookingWidget as WidgetConfig } from "@/components/admin/widgets/types";
import { supabase } from "@/integrations/supabase/client";

const defaultSteps = ["Usługa", "Specjalista", "Termin", "Dane"];

// Map step IDs to component names
const stepIdToName: Record<string, string> = {
  intro: "Wprowadzenie",
  services: "Usługa",
  staff: "Specjalista",
  datetime: "Termin",
  form: "Dane",
  payment: "Płatność",
};

interface BookingWidgetProps {
  widgetConfig?: WidgetConfig | null;
  salonId?: string;
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

interface PrepaymentConfig {
  enabled: boolean;
  type: 'full' | 'fixed' | 'percentage';
  amount: number;
  requireForHighRisk: boolean;
  requireForNewClients: boolean;
}

interface SalonSettings {
  booking?: {
    prepayment?: PrepaymentConfig;
  };
  integrations?: {
    przelewy24?: {
      enabled: boolean;
    };
  };
}

// Recommendations mapping
const serviceRecommendations: Record<string, { id: string; name: string; price: number; duration: number }[]> = {
  "1": [
    { id: "2", name: "Mezoterapia igłowa", price: 350, duration: 60 },
    { id: "3", name: "Mikrodermabrazja", price: 180, duration: 50 },
  ],
  "2": [
    { id: "1", name: "Peeling kawitacyjny", price: 150, duration: 45 },
  ],
  "4": [
    { id: "5", name: "Masaż gorącymi kamieniami", price: 280, duration: 75 },
  ],
  "6": [
    { id: "7", name: "Depilacja laserowa bikini", price: 250, duration: 30 },
  ],
  "8": [
    { id: "9", name: "Przedłużanie rzęs 1:1", price: 350, duration: 120 },
  ],
};

export function BookingWidget({ widgetConfig, salonId: propSalonId }: BookingWidgetProps) {
  const [salonSettings, setSalonSettings] = useState<SalonSettings | null>(null);
  const [createdAppointmentId, setCreatedAppointmentId] = useState<string | null>(null);
  
  // Check if this is demo mode (demo-salon slug or no real salon)
  const isDemo = widgetConfig?.slug === 'demo-salon' || widgetConfig?.slug === 'main' || !widgetConfig;
  
  // Use salon ID from props, or fallback for demo
  const salonId = propSalonId || "demo";
  
  useEffect(() => {
    // In demo mode, use mock settings with prepayment enabled for demonstration
    if (isDemo) {
      setSalonSettings({
        booking: {
          prepayment: {
            enabled: true,
            type: 'percentage',
            amount: 30,
            requireForHighRisk: true,
            requireForNewClients: false,
          }
        },
        integrations: {
          przelewy24: {
            enabled: true,
          }
        }
      });
      return;
    }
    
    const fetchSalonSettings = async () => {
      const { data } = await supabase
        .from("salons")
        .select("settings")
        .eq("id", salonId)
        .maybeSingle();
      
      if (data?.settings) {
        setSalonSettings(data.settings as unknown as SalonSettings);
      }
    };
    fetchSalonSettings();
  }, [salonId, isDemo]);

  // Check if payment step should be enabled
  const isPaymentEnabled = useMemo(() => {
    const prepayment = salonSettings?.booking?.prepayment;
    const p24 = salonSettings?.integrations?.przelewy24;
    return prepayment?.enabled && p24?.enabled;
  }, [salonSettings]);

  const prepaymentConfig = salonSettings?.booking?.prepayment || {
    enabled: false,
    type: 'fixed' as const,
    amount: 50,
    requireForHighRisk: false,
    requireForNewClients: false,
  };

  // Build dynamic steps from widget configuration
  const { steps, stepMapping } = useMemo(() => {
    if (!widgetConfig?.steps) {
      const baseMapping = ["intro", "services", "staff", "datetime", "form"];
      const baseSteps = defaultSteps;
      
      // Add payment step if enabled
      if (isPaymentEnabled) {
        return {
          steps: [...baseSteps, "Płatność"],
          stepMapping: [...baseMapping, "payment"],
        };
      }
      
      return { steps: baseSteps, stepMapping: baseMapping };
    }
    
    const enabledSteps = widgetConfig.steps
      .filter(s => s.enabled && s.id !== "summary")
      .sort((a, b) => a.order - b.order);
    
    const stepNames = enabledSteps
      .filter(s => s.id !== "intro")
      .map(s => stepIdToName[s.id] || s.name);
    
    const mapping = enabledSteps.map(s => s.id);
    
    // Add payment step if enabled and not already in steps
    if (isPaymentEnabled && !mapping.includes("payment")) {
      return {
        steps: [...stepNames, "Płatność"],
        stepMapping: [...mapping, "payment"],
      };
    }
    
    return { steps: stepNames, stepMapping: mapping };
  }, [widgetConfig?.steps, isPaymentEnabled]);

  const hasIntro = stepMapping.includes("intro");
  const [currentStep, setCurrentStep] = useState(hasIntro ? 0 : 1);
  const [previousStep, setPreviousStep] = useState(hasIntro ? 0 : 1);
  const [isTransitioning, setIsTransitioning] = useState(false);

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
        return true;
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
      case "payment":
        return true;
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

  // Determine last step based on payment enabled
  const lastStepId = isPaymentEnabled ? "payment" : "form";
  const isLastStep = currentStepId === lastStepId;
  const isFormStep = currentStepId === "form";
  const isPaymentStep = currentStepId === "payment";

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
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

  // Create appointment and proceed to payment or confirm
  const handleFormSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return;
    
    setIsSubmitting(true);
    
    // In demo mode, skip database operations and go directly to payment/confirmation
    if (isDemo) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate brief delay
      setCreatedAppointmentId("demo-appointment-" + Date.now());
      
      if (isPaymentEnabled) {
        handleNext();
      } else {
        setIsConfirmed(true);
        toast({
          title: "Rezerwacja potwierdzona! (Demo)",
          description: "W prawdziwym systemie otrzymasz email z potwierdzeniem.",
        });
      }
      setIsSubmitting(false);
      return;
    }
    
    try {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const startTime = new Date(selectedDate);
      startTime.setHours(hours, minutes, 0, 0);
      const endTime = new Date(startTime.getTime() + selectedService.duration * 60 * 1000);

      // Create or find client
      const { data: existingClient } = await supabase
        .from("clients")
        .select("id")
        .eq("salon_id", salonId)
        .eq("phone", clientData.phone)
        .maybeSingle();

      let clientId = existingClient?.id;
      if (!clientId) {
        const { data: newClient, error: clientError } = await supabase
          .from("clients")
          .insert({
            salon_id: salonId,
            first_name: clientData.firstName,
            last_name: clientData.lastName,
            phone: clientData.phone,
            email: clientData.email,
            rodo_consent: clientData.acceptRodo,
            marketing_consent: clientData.acceptMarketing,
          })
          .select("id")
          .single();
        if (clientError) throw clientError;
        clientId = newClient.id;
      }

      // Create appointment with pending payment status if payment enabled
      const appointmentData: any = {
        salon_id: salonId,
        client_id: clientId,
        service_id: selectedService.id,
        staff_id: selectedStaff?.id || "00000000-0000-0000-0000-000000000020",
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        price: selectedService.price,
        notes: clientData.notes,
        status: "booked",
      };

      if (isPaymentEnabled) {
        appointmentData.payment_status = "pending";
      }

      const { data: appointment, error: appointmentError } = await supabase
        .from("appointments")
        .insert(appointmentData)
        .select("id")
        .single();

      if (appointmentError) throw appointmentError;

      setCreatedAppointmentId(appointment.id);

      if (isPaymentEnabled) {
        // Move to payment step
        handleNext();
      } else {
        // No payment - confirm directly
        await sendConfirmationNotifications(appointment.id);
        setIsConfirmed(true);
        toast({
          title: "Rezerwacja potwierdzona!",
          description: "Otrzymasz wkrótce email z potwierdzeniem wizyty.",
        });
      }
    } catch (error: any) {
      console.error("Booking error:", error);
      toast({
        title: "Błąd rezerwacji",
        description: "Nie udało się utworzyć rezerwacji. Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendConfirmationNotifications = async (appointmentId: string) => {
    try {
      await supabase.functions.invoke("send-booking-confirmation", {
        body: { appointmentId },
      });
      await supabase.functions.invoke("send-sms-smsapi", {
        body: { appointmentId, type: "confirmation" },
      });
    } catch (notificationError) {
      console.error("Notification sending failed:", notificationError);
    }
  };

  const handlePaymentComplete = () => {
    setIsConfirmed(true);
    toast({
      title: "Płatność przyjęta!",
      description: "Twoja rezerwacja została potwierdzona.",
    });
  };

  const handleSkipPayment = async () => {
    if (createdAppointmentId) {
      // Update appointment to not require payment
      await supabase
        .from("appointments")
        .update({ payment_status: "not_required" })
        .eq("id", createdAppointmentId);
      
      await sendConfirmationNotifications(createdAppointmentId);
    }
    setIsConfirmed(true);
    toast({
      title: "Rezerwacja potwierdzona!",
      description: "Zapłacisz na miejscu w salonie.",
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

  // Intro screen with Sakura animation
  if (currentStepId === "intro") {
    return (
      <div className="relative min-h-[100dvh] w-full overflow-hidden">
        <SakuraBackground />
        
        <div className="relative z-20 min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-md mx-auto">
            <div 
              className="flex justify-center mb-6 animate-fade-in"
              style={{ animationDelay: '0.2s' }}
            >
              <Badge 
                variant="secondary" 
                className="px-4 py-1.5 text-xs font-medium bg-white/80 dark:bg-black/40 backdrop-blur-md border-pink-200/50 dark:border-pink-800/50 shadow-lg"
              >
                <Heart className="w-3 h-3 mr-1.5 text-pink-500 fill-pink-500" />
                Rezerwacja online 24/7
              </Badge>
            </div>

            <div 
              className="flex justify-center mb-8 animate-fade-in"
              style={{ animationDelay: '0.4s' }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-violet-500 rounded-full blur-2xl opacity-40 scale-150 animate-pulse" />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-pink-400 via-rose-400 to-violet-500 flex items-center justify-center shadow-2xl">
                  <Sparkles className="w-12 h-12 text-white drop-shadow-lg" />
                </div>
              </div>
            </div>

            <div 
              className="text-center mb-8 animate-fade-in"
              style={{ animationDelay: '0.6s' }}
            >
              <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-4 bg-gradient-to-r from-gray-900 via-pink-900 to-violet-900 dark:from-white dark:via-pink-100 dark:to-violet-100 bg-clip-text text-transparent leading-tight">
                {widgetConfig?.theme?.headerText || "Zarezerwuj wizytę"}
              </h1>
              <p className="text-lg text-muted-foreground/80 max-w-sm mx-auto leading-relaxed">
                Twój moment relaksu czeka. Zarezerwuj w kilka chwil.
              </p>
            </div>

            <div 
              className="flex justify-center gap-8 mb-10 animate-fade-in"
              style={{ animationDelay: '0.8s' }}
            >
              {[
                { icon: Sparkles, label: "Usługa" },
                { icon: Calendar, label: "Termin" },
                { icon: UserCheck, label: "Gotowe" },
              ].map((step, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-sm border border-white/50 dark:border-white/20 flex items-center justify-center shadow-lg transition-transform hover:scale-110 hover:-rotate-3">
                    <step.icon className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{step.label}</span>
                </div>
              ))}
            </div>

            <div 
              className="flex flex-col items-center gap-6 animate-fade-in"
              style={{ animationDelay: '1s' }}
            >
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-pink-500 via-rose-500 to-violet-500 rounded-3xl opacity-30 blur-2xl group-hover:opacity-50 transition-all duration-500 animate-pulse" />
                <div className="absolute -inset-2 bg-gradient-to-r from-violet-500 via-pink-500 to-rose-500 rounded-3xl opacity-20 blur-xl group-hover:opacity-40 transition-all duration-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
                
                <Button 
                  onClick={handleStartBooking}
                  className="relative overflow-hidden px-16 py-10 text-xl sm:text-2xl font-bold rounded-3xl bg-gradient-to-r from-pink-500 via-rose-500 to-violet-500 hover:from-pink-400 hover:via-rose-400 hover:to-violet-400 text-white shadow-2xl shadow-pink-500/40 transition-all duration-500 hover:scale-110 hover:shadow-pink-500/60 border-2 border-white/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                  
                  <div className="absolute top-3 left-4 w-2 h-2 bg-white/60 rounded-full animate-pulse" />
                  <div className="absolute bottom-4 right-5 w-1.5 h-1.5 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                  <div className="absolute top-5 right-8 w-1 h-1 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
                  
                  <span className="relative z-10 flex items-center gap-4">
                    <Sparkles className="w-7 h-7 animate-pulse" />
                    Zacznij rezerwację
                    <ArrowRight className="w-7 h-7 group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                </Button>
              </div>
              
              <p className="text-base text-muted-foreground/80 flex items-center gap-2 font-medium">
                <Clock className="w-5 h-5" />
                Zajmie Ci to tylko 2 minuty
              </p>
            </div>

            <div 
              className="mt-12 flex justify-center gap-6 text-xs text-muted-foreground/60 animate-fade-in"
              style={{ animationDelay: '1.2s' }}
            >
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                Bezpłatne
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                Bez zobowiązań
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                SMS przypomnienie
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const recommendations = selectedService ? serviceRecommendations[selectedService.id] : [];
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
        {currentStepId === "payment" && selectedService && (
          <PaymentStep
            appointmentId={createdAppointmentId || "demo-appointment"}
            servicePrice={selectedService.price}
            serviceName={selectedService.name}
            clientEmail={clientData.email}
            clientName={`${clientData.firstName} ${clientData.lastName}`}
            salonId={salonId}
            prepaymentConfig={prepaymentConfig}
            onPaymentComplete={handlePaymentComplete}
            onSkip={handleSkipPayment}
            isDemo={isDemo}
          />
        )}
      </div>

      {/* Selected service summary - sticky on mobile */}
      {selectedService && currentStepId !== "services" && currentStepId !== "payment" && (
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

      {/* Navigation - hide on payment step (payment has its own buttons) */}
      {currentStepId !== "payment" && (
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

          {!isFormStep ? (
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
              onClick={handleFormSubmit}
              disabled={!canProceed() || isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  {isPaymentEnabled ? "Przechodzę do płatności..." : "Potwierdzanie..."}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {isPaymentEnabled ? "Przejdź do płatności" : "Potwierdź rezerwację"}
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
