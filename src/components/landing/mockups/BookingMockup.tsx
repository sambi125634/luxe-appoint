import { Check, Clock, Star } from "lucide-react";

const BookingMockup = () => {
  const services = [
    { name: "Manicure hybrydowy", price: "120 zł", duration: "60 min", popular: true },
    { name: "Pedicure klasyczny", price: "150 zł", duration: "75 min", popular: false },
    { name: "Brwi + rzęsy", price: "180 zł", duration: "90 min", popular: true },
  ];

  return (
    <div className="p-4 h-full bg-background">
      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {[1, 2, 3, 4].map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div 
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium animate-scale-in ${
                step === 1 
                  ? "bg-gradient-to-r from-rose-deep to-terra text-white" 
                  : "bg-muted text-muted-foreground"
              }`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {step === 1 ? <Check className="w-3 h-3" /> : step}
            </div>
            {step < 4 && <div className="w-8 h-0.5 bg-muted rounded" />}
          </div>
        ))}
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-foreground text-center mb-3">Wybierz usługę</h3>

      {/* Services */}
      <div className="space-y-2">
        {services.map((service, i) => (
          <div 
            key={i}
            className={`glass-card rounded-xl p-3 cursor-pointer transition-all animate-fade-in hover:border-rose-deep/50 ${
              i === 0 ? "border-2 border-rose-deep ring-2 ring-rose-deep/20" : "border border-border/50"
            }`}
            style={{ animationDelay: `${(i + 4) * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{service.name}</span>
                  {service.popular && (
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-gold/20 rounded text-[10px] text-gold font-medium">
                      <Star className="w-2.5 h-2.5 fill-gold" />
                      Popular
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {service.duration}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-foreground">{service.price}</div>
              </div>
            </div>
            {i === 0 && (
              <div className="absolute -right-1 -top-1 w-4 h-4 bg-rose-deep rounded-full flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <button 
        className="w-full mt-4 py-2.5 bg-gradient-to-r from-rose-deep to-terra text-white rounded-xl text-sm font-medium shadow-lg shadow-rose-deep/25 animate-fade-in"
        style={{ animationDelay: '700ms' }}
      >
        Dalej →
      </button>
    </div>
  );
};

export default BookingMockup;
