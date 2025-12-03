import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Smartphone, User, Clock, CheckCircle } from "lucide-react";

export function DemoPreviewSection() {
  const [activeView, setActiveView] = useState<'client' | 'admin'>('client');

  return (
    <section id="demo-section" className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Podgląd systemu
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Zobacz, jak wygląda Beauty Calendar z perspektywy Twojej klientki i z Twojego panelu administracyjnego.
          </p>
          
          {/* Toggle buttons */}
          <div className="inline-flex gap-2 p-1 bg-muted rounded-full">
            <Button
              variant={activeView === 'client' ? 'luxury' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('client')}
              className="rounded-full"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Widok klientki
            </Button>
            <Button
              variant={activeView === 'admin' ? 'luxury' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('admin')}
              className="rounded-full"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Panel salonu
            </Button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          {activeView === 'client' ? (
            <ClientViewMockup />
          ) : (
            <AdminViewMockup />
          )}
        </div>
      </div>
    </section>
  );
}

function ClientViewMockup() {
  return (
    <div className="glass-card-elevated p-8 animate-fade-in">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Step 1 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
            <span className="font-medium">Wybór usługi</span>
          </div>
          <div className="bg-card rounded-xl p-4 space-y-3">
            {[
              { name: 'Mezoterapia twarzy', price: '450 zł', time: '60 min', active: true },
              { name: 'Peeling kawitacyjny', price: '180 zł', time: '45 min', active: false },
              { name: 'Oczyszczanie manualne', price: '220 zł', time: '75 min', active: false },
            ].map((service, i) => (
              <div 
                key={i} 
                className={`p-3 rounded-lg border-2 transition-colors cursor-pointer ${
                  service.active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                }`}
              >
                <div className="font-medium text-sm">{service.name}</div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{service.time}</span>
                  <span className="font-semibold text-foreground">{service.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold">2</div>
            <span className="font-medium">Wybór terminu</span>
          </div>
          <div className="bg-card rounded-xl p-4">
            <div className="text-sm font-medium mb-3">Grudzień 2024</div>
            <div className="grid grid-cols-7 gap-1 text-xs text-center mb-4">
              {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map(d => (
                <div key={d} className="text-muted-foreground py-1">{d}</div>
              ))}
              {Array.from({ length: 7 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`py-2 rounded ${i === 2 ? 'bg-primary text-primary-foreground' : i < 2 ? 'text-muted-foreground' : 'hover:bg-muted cursor-pointer'}`}
                >
                  {i + 2}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Dostępne godziny:</div>
              <div className="flex flex-wrap gap-2">
                {['10:00', '11:30', '14:00', '15:30'].map((time, i) => (
                  <span key={time} className={`px-3 py-1 rounded-full text-xs ${i === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-primary/10 cursor-pointer'}`}>
                    {time}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold">3</div>
            <span className="font-medium">Dane kontaktowe</span>
          </div>
          <div className="bg-card rounded-xl p-4 space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Imię i nazwisko</label>
              <div className="mt-1 px-3 py-2 bg-muted rounded-lg text-sm">Anna Kowalska</div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Telefon</label>
              <div className="mt-1 px-3 py-2 bg-muted rounded-lg text-sm">+48 600 123 456</div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">E-mail</label>
              <div className="mt-1 px-3 py-2 bg-muted rounded-lg text-sm">anna@example.com</div>
            </div>
            <Button variant="luxury" className="w-full mt-2" size="sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              Potwierdź rezerwację
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminViewMockup() {
  const appointments = [
    { time: '09:00', name: 'Marta Wiśniewska', service: 'Mezoterapia', staff: 'Anna', status: 'confirmed' },
    { time: '10:30', name: 'Karolina Nowak', service: 'Peeling', staff: 'Anna', status: 'pending' },
    { time: '11:00', name: 'Ewa Kowalczyk', service: 'Depilacja', staff: 'Magda', status: 'confirmed' },
    { time: '12:00', name: 'Joanna Wójcik', service: 'Manicure', staff: 'Kasia', status: 'confirmed' },
    { time: '14:00', name: 'Agnieszka Zielińska', service: 'Brwi', staff: 'Magda', status: 'noshow' },
  ];

  return (
    <div className="glass-card-elevated p-8 animate-fade-in">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main calendar */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-semibold">Kalendarz tygodniowy</h3>
            <div className="flex gap-2">
              {['Anna', 'Magda', 'Kasia'].map((name) => (
                <span key={name} className="px-3 py-1 bg-muted rounded-full text-xs">{name}</span>
              ))}
            </div>
          </div>
          
          <div className="bg-card rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-6 gap-px bg-border">
              <div className="bg-muted p-2 text-xs text-muted-foreground" />
              {['Pon 2', 'Wt 3', 'Śr 4', 'Czw 5', 'Pt 6'].map(day => (
                <div key={day} className="bg-muted p-2 text-xs text-center font-medium">{day}</div>
              ))}
            </div>
            
            {/* Time slots */}
            <div className="divide-y divide-border">
              {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00'].map((time, i) => (
                <div key={time} className="grid grid-cols-6 gap-px bg-border min-h-[48px]">
                  <div className="bg-background p-2 text-xs text-muted-foreground">{time}</div>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="bg-background p-1">
                      {((i === 0 && j === 0) || (i === 1 && j === 1) || (i === 2 && j === 2) || (i === 3 && j === 0) || (i === 5 && j === 3)) && (
                        <div className={`text-xs p-1 rounded ${
                          i === 5 ? 'bg-destructive/20 text-destructive' : 
                          i === 1 ? 'bg-accent/20 text-accent-foreground' : 
                          'bg-primary/20 text-primary'
                        }`}>
                          <div className="font-medium truncate">
                            {i === 0 ? 'Marta W.' : i === 1 ? 'Karolina N.' : i === 2 ? 'Ewa K.' : i === 3 ? 'Joanna W.' : 'Agnieszka Z.'}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats sidebar */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl p-4">
            <h4 className="font-medium text-sm mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Dzisiejsze wizyty
            </h4>
            <div className="space-y-2">
              {appointments.slice(0, 4).map((apt, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-12">{apt.time}</span>
                    <span className="font-medium truncate max-w-[100px]">{apt.name}</span>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${
                    apt.status === 'confirmed' ? 'bg-green-500' : 
                    apt.status === 'pending' ? 'bg-accent' : 'bg-destructive'
                  }`} />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card rounded-xl p-4 text-center">
              <div className="text-2xl font-serif font-bold text-primary">12</div>
              <div className="text-xs text-muted-foreground">Wizyty dziś</div>
            </div>
            <div className="bg-card rounded-xl p-4 text-center">
              <div className="text-2xl font-serif font-bold text-accent">87%</div>
              <div className="text-xs text-muted-foreground">Obłożenie</div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-secondary" />
              Top usługi
            </h4>
            <div className="space-y-2">
              {['Mezoterapia', 'Depilacja', 'Manicure'].map((service, i) => (
                <div key={service} className="flex items-center justify-between text-xs">
                  <span>{service}</span>
                  <span className="text-muted-foreground">{12 - i * 3} wizyt</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}