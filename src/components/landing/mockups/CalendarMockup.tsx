const CalendarMockup = () => {
  const days = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob"];
  const hours = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00"];
  
  const appointments = [
    { day: 0, hour: 0, duration: 2, name: "Anna K.", color: "bg-violet-deep/80" },
    { day: 1, hour: 1, duration: 1, name: "Maria W.", color: "bg-burgundy/80" },
    { day: 2, hour: 0, duration: 3, name: "Ewa S.", color: "bg-gold/80" },
    { day: 2, hour: 4, duration: 2, name: "Kasia M.", color: "bg-emerald-500/80" },
    { day: 3, hour: 2, duration: 2, name: "Zofia P.", color: "bg-violet-deep/80" },
    { day: 4, hour: 0, duration: 1, name: "Maja L.", color: "bg-burgundy/80" },
    { day: 4, hour: 3, duration: 2, name: "Ola T.", color: "bg-gold/80" },
    { day: 5, hour: 1, duration: 2, name: "Iza K.", color: "bg-emerald-500/80" },
  ];

  return (
    <div className="p-4 h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Grudzień 2024</h3>
        <div className="flex gap-1">
          <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">‹</div>
          <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">›</div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass-card rounded-xl p-2 overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          <div className="w-10" />
          {days.map((day, i) => (
            <div 
              key={day} 
              className="text-center text-xs font-medium text-muted-foreground py-1 animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Time Grid */}
        <div className="relative">
          {hours.map((hour, hourIndex) => (
            <div key={hour} className="grid grid-cols-7 gap-1 h-8">
              <div className="text-xs text-muted-foreground flex items-center justify-end pr-1 w-10">
                {hour}
              </div>
              {days.map((_, dayIndex) => (
                <div 
                  key={dayIndex} 
                  className="bg-muted/30 rounded-sm border border-border/30"
                />
              ))}
            </div>
          ))}

          {/* Appointments Overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{ left: '44px' }}>
            {appointments.map((apt, i) => (
              <div
                key={i}
                className={`absolute ${apt.color} rounded-md px-1 py-0.5 text-[10px] text-white font-medium shadow-lg animate-scale-in overflow-hidden`}
                style={{
                  left: `calc(${apt.day} * (100% / 6) + 2px)`,
                  top: `${apt.hour * 32 + 2}px`,
                  width: `calc(100% / 6 - 4px)`,
                  height: `${apt.duration * 32 - 4}px`,
                  animationDelay: `${(i + 6) * 100}ms`,
                }}
              >
                {apt.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarMockup;
