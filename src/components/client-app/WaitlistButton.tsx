import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WaitlistModal } from "./WaitlistModal";

interface WaitlistButtonProps {
  salonId: string;
  serviceId?: string;
}

export function WaitlistButton({ salonId, serviceId }: WaitlistButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        className="w-full border-primary/30 text-primary hover:bg-primary/5"
        onClick={() => setOpen(true)}
      >
        <Bell className="h-4 w-4 mr-2" />
        Powiadom mnie gdy zwolni się termin 🔔
      </Button>

      <WaitlistModal
        open={open}
        onClose={() => setOpen(false)}
        salonId={salonId}
        preSelectedServiceId={serviceId}
      />
    </>
  );
}
