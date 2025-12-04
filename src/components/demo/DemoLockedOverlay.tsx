import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DemoLockedOverlayProps {
  children: ReactNode;
  feature: string;
}

export function DemoLockedOverlay({ children, feature }: DemoLockedOverlayProps) {
  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="blur-sm pointer-events-none select-none opacity-60">
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="glass-card-elevated p-8 text-center max-w-md animate-scale-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          
          <h3 className="font-serif text-2xl font-semibold mb-2">
            {feature}
          </h3>
          
          <p className="text-muted-foreground mb-6">
            Ta funkcja jest dostępna tylko dla zarejestrowanych użytkowników. 
            Zarejestruj się, aby odblokować pełny dostęp do Beauty Calendar.
          </p>

          <div className="space-y-3">
            <Link to="/" className="block">
              <Button variant="luxury" className="w-full gap-2">
                <Sparkles className="w-4 h-4" />
                Zarejestruj się za darmo
              </Button>
            </Link>
            
            <p className="text-xs text-muted-foreground">
              14 dni bezpłatnego okresu próbnego • Bez karty kredytowej
            </p>
          </div>

          {/* Feature preview hints */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm font-medium mb-3">Co odblokujesz:</p>
            <ul className="text-sm text-muted-foreground space-y-2 text-left">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Szczegółowe statystyki i raporty
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Integracja z Google Calendar
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Powiadomienia SMS i email
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Widget do osadzenia na stronie
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
