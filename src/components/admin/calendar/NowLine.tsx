import { useState, useEffect } from "react";

interface NowLineProps {
  dayStartHour: number;
  slotHeight: number;
}

export function NowLine({ dayStartHour, slotHeight }: NowLineProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const minutesSinceStart = (now.getHours() - dayStartHour) * 60 + now.getMinutes();
  if (minutesSinceStart < 0 || minutesSinceStart > 14 * 60) return null;

  const top = (minutesSinceStart / 30) * slotHeight;

  return (
    <div
      className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
      style={{ top }}
    >
      <div className="w-2.5 h-2.5 rounded-full bg-destructive -ml-1 shrink-0" />
      <div className="flex-1 h-[2px] bg-destructive" />
    </div>
  );
}
