import { useState, useEffect } from "react";
import { LayoutDashboard, Calendar, Puzzle, Sparkles } from "lucide-react";
import DashboardMockup from "./mockups/DashboardMockup";
import CalendarMockup from "./mockups/CalendarMockup";
import WidgetsMockup from "./mockups/WidgetsMockup";
import BookingMockup from "./mockups/BookingMockup";

const screens = [
  { 
    id: "dashboard", 
    label: "Dashboard", 
    icon: LayoutDashboard, 
    component: DashboardMockup,
    gradient: "from-rose-deep to-terra"
  },
  { 
    id: "calendar", 
    label: "Kalendarz", 
    icon: Calendar, 
    component: CalendarMockup,
    gradient: "from-burgundy to-gold"
  },
  { 
    id: "widgets", 
    label: "Widgety", 
    icon: Puzzle, 
    component: WidgetsMockup,
    gradient: "from-gold to-emerald-500"
  },
  { 
    id: "booking", 
    label: "Rezerwacja", 
    icon: Sparkles, 
    component: BookingMockup,
    gradient: "from-emerald-500 to-rose-deep"
  },
];

const AnimatedMockup = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % screens.length);
        setIsAnimating(false);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const handleScreenClick = (index: number) => {
    if (index === activeIndex) return;
    setIsPaused(true);
    setIsAnimating(true);
    setTimeout(() => {
      setActiveIndex(index);
      setIsAnimating(false);
      // Resume auto-play after 8 seconds
      setTimeout(() => setIsPaused(false), 8000);
    }, 300);
  };

  const ActiveComponent = screens[activeIndex].component;

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Laptop Frame */}
      <div className="relative mx-auto max-w-4xl">
        {/* Screen Bezel */}
        <div className="relative bg-gradient-to-b from-zinc-700 to-zinc-800 rounded-t-2xl p-3 shadow-2xl">
          {/* Camera */}
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-zinc-600" />
          
          {/* Screen */}
          <div className="relative bg-background rounded-lg overflow-hidden aspect-[16/10] shadow-inner">
            {/* Browser Chrome */}
            <div className="bg-muted/50 border-b border-border/50 px-3 py-2 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 mx-8">
                <div className="bg-background/80 rounded-md px-3 py-1 text-xs text-muted-foreground text-center max-w-xs mx-auto">
                  beautycalendar.pl/admin
                </div>
              </div>
            </div>

            {/* App Content */}
            <div className="flex h-[calc(100%-36px)]">
              {/* Sidebar */}
              <div className="w-14 bg-muted/30 border-r border-border/30 p-2 flex flex-col gap-1">
                {screens.map((screen, index) => (
                  <button
                    key={screen.id}
                    onClick={() => handleScreenClick(index)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      index === activeIndex
                        ? `bg-gradient-to-r ${screen.gradient} text-white shadow-lg`
                        : "text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <screen.icon className="w-5 h-5" />
                  </button>
                ))}
              </div>

              {/* Main Content */}
              <div className="flex-1 relative overflow-hidden">
                <div
                  className={`absolute inset-0 transition-all duration-300 ease-out ${
                    isAnimating
                      ? "opacity-0 translate-x-4"
                      : "opacity-100 translate-x-0"
                  }`}
                >
                  <ActiveComponent />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Laptop Base */}
        <div className="relative">
          <div className="bg-gradient-to-b from-zinc-700 to-zinc-800 h-4 rounded-b-lg mx-12" />
          <div className="bg-gradient-to-b from-zinc-600 to-zinc-700 h-2 rounded-b-xl mx-4 shadow-xl" />
        </div>

        {/* Reflection */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-gradient-to-t from-transparent to-foreground/5 blur-xl" />
      </div>

      {/* Screen Indicators */}
      <div className="flex items-center justify-center gap-3 mt-8">
        {screens.map((screen, index) => (
          <button
            key={screen.id}
            onClick={() => handleScreenClick(index)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
              index === activeIndex
                ? `bg-gradient-to-r ${screen.gradient} text-white shadow-lg shadow-rose-deep/20`
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            <screen.icon className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">{screen.label}</span>
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="flex justify-center mt-4">
        <div className="flex gap-1.5">
          {screens.map((_, index) => (
            <div
              key={index}
              className="h-1 rounded-full overflow-hidden bg-muted/50"
              style={{ width: "40px" }}
            >
              <div
                className={`h-full bg-gradient-to-r from-rose-deep to-terra transition-all duration-300 ${
                  index === activeIndex ? "animate-progress" : index < activeIndex ? "w-full" : "w-0"
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnimatedMockup;
