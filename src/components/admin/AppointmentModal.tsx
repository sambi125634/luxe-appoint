import { useState, useEffect } from "react";
import { Calendar, Clock, User, Scissors, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
}

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface Staff {
  id: string;
  name: string;
  color: string;
}

interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  serviceId: string;
  serviceName: string;
  staffId: string;
  staffName: string;
  date: string;
  time: string;
  duration: number;
  notes: string;
  status: "confirmed" | "pending" | "cancelled" | "no-show" | "completed";
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Omit<Appointment, "id">) => void;
  appointment?: Appointment | null;
  selectedDate?: Date;
  selectedTime?: string;
}

const mockClients: Client[] = [
  { id: "1", name: "Anna Kowalska", phone: "+48 500 100 200", email: "anna@example.com" },
  { id: "2", name: "Joanna Nowak", phone: "+48 500 100 201", email: "joanna@example.com" },
  { id: "3", name: "Magdalena Wiśniewska", phone: "+48 500 100 202", email: "magda@example.com" },
  { id: "4", name: "Katarzyna Dąbrowska", phone: "+48 500 100 203", email: "kasia@example.com" },
  { id: "5", name: "Agnieszka Lewandowska", phone: "+48 500 100 204", email: "aga@example.com" },
];

const mockServices: Service[] = [
  { id: "1", name: "Peeling kawitacyjny", duration: 60, price: 150 },
  { id: "2", name: "Mezoterapia igłowa", duration: 45, price: 350 },
  { id: "3", name: "Masaż relaksacyjny", duration: 90, price: 200 },
  { id: "4", name: "Depilacja laserowa - nogi", duration: 60, price: 400 },
  { id: "5", name: "Manicure hybrydowy", duration: 75, price: 120 },
  { id: "6", name: "Stylizacja brwi", duration: 45, price: 80 },
];

const mockStaff: Staff[] = [
  { id: "1", name: "Maria Nowakowska", color: "bg-primary" },
  { id: "2", name: "Karolina Wiśniewska", color: "bg-secondary" },
  { id: "3", name: "Joanna Lewandowska", color: "bg-accent" },
  { id: "4", name: "Anna Kowalczyk", color: "bg-chart-1" },
];

const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minutes = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${minutes}`;
}).filter((_, i) => i < 22); // 8:00 - 19:00

export function AppointmentModal({ 
  isOpen, 
  onClose, 
  onSave, 
  appointment,
  selectedDate,
  selectedTime 
}: AppointmentModalProps) {
  const [clientSearch, setClientSearch] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [isNewClient, setIsNewClient] = useState(false);
  
  const [form, setForm] = useState({
    clientId: "",
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    serviceId: "",
    staffId: "",
    date: "",
    time: "",
    notes: "",
  });

  useEffect(() => {
    if (appointment) {
      setForm({
        clientId: appointment.clientId,
        clientName: appointment.clientName,
        clientPhone: "",
        clientEmail: "",
        serviceId: appointment.serviceId,
        staffId: appointment.staffId,
        date: appointment.date,
        time: appointment.time,
        notes: appointment.notes,
      });
      setClientSearch(appointment.clientName);
    } else {
      setForm({
        clientId: "",
        clientName: "",
        clientPhone: "",
        clientEmail: "",
        serviceId: "",
        staffId: "",
        date: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        time: selectedTime || "09:00",
        notes: "",
      });
      setClientSearch("");
    }
    setIsNewClient(false);
  }, [appointment, selectedDate, selectedTime, isOpen]);

  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    client.phone.includes(clientSearch) ||
    client.email.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const selectClient = (client: Client) => {
    setForm(prev => ({
      ...prev,
      clientId: client.id,
      clientName: client.name,
      clientPhone: client.phone,
      clientEmail: client.email,
    }));
    setClientSearch(client.name);
    setShowClientDropdown(false);
    setIsNewClient(false);
  };

  const handleNewClient = () => {
    setIsNewClient(true);
    setForm(prev => ({
      ...prev,
      clientId: "",
      clientName: clientSearch,
    }));
    setShowClientDropdown(false);
  };

  const selectedService = mockServices.find(s => s.id === form.serviceId);
  const selectedStaff = mockStaff.find(s => s.id === form.staffId);

  const handleSave = () => {
    if (!form.serviceId || !form.staffId || (!form.clientId && !isNewClient)) return;
    
    onSave({
      clientId: form.clientId || "new",
      clientName: isNewClient ? form.clientName : mockClients.find(c => c.id === form.clientId)?.name || "",
      serviceId: form.serviceId,
      serviceName: selectedService?.name || "",
      staffId: form.staffId,
      staffName: selectedStaff?.name || "",
      date: form.date,
      time: form.time,
      duration: selectedService?.duration || 60,
      notes: form.notes,
      status: "confirmed",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {appointment ? "Edytuj wizytę" : "Nowa wizyta"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Client Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Klient
            </Label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Szukaj klienta po imieniu, telefonie lub email..."
                value={clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value);
                  setShowClientDropdown(true);
                }}
                onFocus={() => setShowClientDropdown(true)}
                className="pl-9"
              />
              {showClientDropdown && clientSearch && (
                <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredClients.map(client => (
                    <button
                      key={client.id}
                      className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0"
                      onClick={() => selectClient(client)}
                    >
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.phone} • {client.email}</p>
                    </button>
                  ))}
                  <button
                    className="w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors text-primary font-medium"
                    onClick={handleNewClient}
                  >
                    + Dodaj nowego klienta: "{clientSearch}"
                  </button>
                </div>
              )}
            </div>
            {isNewClient && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg">
                <Input
                  placeholder="Telefon"
                  value={form.clientPhone}
                  onChange={(e) => setForm(prev => ({ ...prev, clientPhone: e.target.value }))}
                />
                <Input
                  placeholder="Email"
                  value={form.clientEmail}
                  onChange={(e) => setForm(prev => ({ ...prev, clientEmail: e.target.value }))}
                />
              </div>
            )}
          </div>

          {/* Service Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-primary" />
              Usługa
            </Label>
            <Select
              value={form.serviceId}
              onValueChange={(value) => setForm(prev => ({ ...prev, serviceId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz usługę" />
              </SelectTrigger>
              <SelectContent>
                {mockServices.map(service => (
                  <SelectItem key={service.id} value={service.id}>
                    <div className="flex items-center justify-between w-full gap-4">
                      <span>{service.name}</span>
                      <span className="text-muted-foreground text-sm">
                        {service.duration} min • {service.price} zł
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Staff Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Specjalista
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {mockStaff.map(staff => (
                <button
                  key={staff.id}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, staffId: staff.id }))}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left",
                    form.staffId === staff.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className={cn("w-3 h-3 rounded-full", staff.color)} />
                  <span className="text-sm font-medium">{staff.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Data
              </Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Godzina
              </Label>
              <Select
                value={form.time}
                onValueChange={(value) => setForm(prev => ({ ...prev, time: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notatki</Label>
            <Textarea
              placeholder="Dodatkowe informacje o wizycie..."
              value={form.notes}
              onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Summary */}
          {selectedService && selectedStaff && (
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
              <p className="text-sm text-muted-foreground mb-2">Podsumowanie</p>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Usługa:</span> {selectedService.name}</p>
                <p><span className="font-medium">Czas trwania:</span> {selectedService.duration} min</p>
                <p><span className="font-medium">Cena:</span> {selectedService.price} zł</p>
                <p><span className="font-medium">Specjalista:</span> {selectedStaff.name}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Anuluj</Button>
          <Button 
            variant="luxury" 
            onClick={handleSave}
            disabled={!form.serviceId || !form.staffId || (!form.clientId && !isNewClient)}
          >
            {appointment ? "Zapisz zmiany" : "Utwórz wizytę"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
