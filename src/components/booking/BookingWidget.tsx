import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingProgress } from "./BookingProgress";
import { ServiceSelection } from "./ServiceSelection";
import { StaffSelection } from "./StaffSelection";
import { DateTimeSelection } from "./DateTimeSelection";
import { ClientForm, ClientData } from "./ClientForm";
import { BookingSummary } from "./BookingSummary";
import { BookingConfirmation } from "./BookingConfirmation";
import { toast } from "@/hooks/use-toast";

const steps = ["Usługa", "Specjalista", "Termin", "Dane", "Podsumowanie"];

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

export function BookingWidget() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientData, setClientData] = useState<ClientData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    notes: "",
    acceptRodo: false,
    acceptMarketing: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedService !== null;
      case 2:
        return true; // Staff can be null (any)
      case 3:
        return selectedDate !== null && selectedTime !== null;
      case 4:
        return (
          clientData.firstName.trim() !== "" &&
          clientData.lastName.trim() !== "" &&
          clientData.phone.trim() !== "" &&
          clientData.email.trim() !== "" &&
          clientData.acceptRodo
        );
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 5 && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    // Simulate API call
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

  return (
    <div className="w-full max-w-2xl mx-auto">
      <BookingProgress currentStep={currentStep} steps={steps} />

      <div className="mt-8">
        {currentStep === 1 && (
          <ServiceSelection
            onSelect={setSelectedService}
            selectedService={selectedService}
          />
        )}
        {currentStep === 2 && (
          <StaffSelection
            onSelect={setSelectedStaff}
            selectedStaff={selectedStaff}
          />
        )}
        {currentStep === 3 && (
          <DateTimeSelection
            onSelect={handleDateTimeSelect}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
          />
        )}
        {currentStep === 4 && (
          <ClientForm onUpdate={setClientData} data={clientData} />
        )}
        {currentStep === 5 && (
          <BookingSummary
            service={selectedService}
            staff={selectedStaff}
            date={selectedDate}
            time={selectedTime}
            client={clientData}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
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
