import { supabase } from "@/integrations/supabase/client";

interface ConflictCheckParams {
  salonId: string;
  staffId: string;
  startTime: string;
  endTime: string;
  excludeId?: string;
}

interface ConflictResult {
  conflict: boolean;
  conflictingAppointment?: {
    id: string;
    start_time: string;
    end_time: string;
    services?: { name: string };
  };
}

export async function checkAppointmentConflict(params: ConflictCheckParams): Promise<ConflictResult> {
  const { data, error } = await supabase.functions.invoke("check-appointment-conflict", {
    body: params,
  });

  if (error) {
    console.error("Conflict check failed:", error);
    // Fail open — allow booking if check fails, to not block users
    return { conflict: false };
  }

  return data as ConflictResult;
}

export function formatConflictMessage(result: ConflictResult): string {
  if (!result.conflict || !result.conflictingAppointment) {
    return "";
  }
  const appt = result.conflictingAppointment;
  const time = new Date(appt.start_time).toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const serviceName = appt.services?.name || "inna wizyta";
  return `Ten termin jest już zajęty (${serviceName} o ${time}). Wybierz inny termin.`;
}
