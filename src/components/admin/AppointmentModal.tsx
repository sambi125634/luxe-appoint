import { useState, useEffect } from "react";
import { Calendar, Clock, User, Scissors, Search, ShoppingBag, CalendarPlus, Check, Sparkles, Loader2 } from "lucide-react";
import { checkAppointmentConflict, formatConflictMessage } from "@/hooks/useConflictCheck";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { ProductSaleSection, type CartItem } from "./products/ProductSaleSection";
import { useStaffMembers } from "@/hooks/useStaffMembers";
import { useClients } from "@/hooks/useClients";
import { useServices } from "@/hooks/useServices";

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
  status: "confirmed" | "pending" | "cancelled";
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Omit<Appointment, "id">) => void;
  appointment?: Appointment | null;
  selectedDate?: Date;
  selectedTime?: string;
  isDemo?: boolean;
  salonId?: string;
  preselectedClient?: { id: string; name: string; phone: string; email: string };
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
}).filter((_, i) => i < 22);

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

const staffBgColors = [
  "bg-primary/20 text-primary",
  "bg-secondary/20 text-secondary",
  "bg-accent/20 text-accent-foreground",
  "bg-chart-1/20 text-chart-1",
  "bg-chart-2/20 text-chart-2",
];

export function AppointmentModal({ 
  isOpen, 
  onClose, 
  onSave, 
  appointment,
  selectedDate,
  selectedTime,
  isDemo = false,
  salonId,
  preselectedClient
}: AppointmentModalProps) {
  const { t } = useTranslation();

  const { data: dbStaff } = useStaffMembers();
  const { data: dbClients } = useClients();
  const { data: dbServices } = useServices();

  const staffColors = ["bg-primary", "bg-secondary", "bg-accent", "bg-chart-1"];
  const clients: Client[] = isDemo
    ? mockClients
    : (dbClients || []).map((c) => ({
        id: c.id,
        name: `${c.first_name} ${c.last_name}`,
        phone: c.phone,
        email: c.email || "",
      }));

  const dbServicesMapped: Service[] = (dbServices || []).map((s) => ({
    id: s.id,
    name: s.name,
    duration: s.duration,
    price: Number(s.price),
  }));
  const services: Service[] = isDemo
    ? mockServices
    : dbServicesMapped.length > 0 ? dbServicesMapped : mockServices;

  const staffMembers: Staff[] = isDemo
    ? mockStaff
    : (dbStaff || []).map((s, i) => ({
        id: s.id,
        name: s.name,
        color: staffColors[i % staffColors.length],
      }));

  const [clientSearch, setClientSearch] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [isNewClient, setIsNewClient] = useState(false);
  const [productCart, setProductCart] = useState<CartItem[]>([]);
  const [showProducts, setShowProducts] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
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
    } else if (preselectedClient) {
      setForm({
        clientId: preselectedClient.id,
        clientName: preselectedClient.name,
        clientPhone: preselectedClient.phone,
        clientEmail: preselectedClient.email,
        serviceId: "",
        staffId: "",
        date: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        time: selectedTime || "09:00",
        notes: "",
      });
      setClientSearch(preselectedClient.name);
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
    setProductCart([]);
    setShowProducts(false);
    setServiceSearch("");
    setIsSaving(false);
  }, [appointment, selectedDate, selectedTime, isOpen]);

  const filteredClients = clients.filter(client =>
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

  const selectedService = services.find(s => s.id === form.serviceId);
  const selectedStaff = staffMembers.find(s => s.id === form.staffId);

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const handleSave = async () => {
    if (!form.serviceId || !form.staffId || (!form.clientId && !isNewClient)) return;
    
    setIsSaving(true);
    try {
      // Conflict check
      if (salonId) {
        const startDate = new Date(`${form.date}T${form.time}`);
        const endDate = new Date(startDate.getTime() + (selectedService?.duration || 60) * 60000);
        const result = await checkAppointmentConflict({
          salonId,
          staffId: form.staffId,
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
          excludeId: appointment?.id,
        });
        if (result.conflict) {
          toast({
            title: "Konflikt terminów",
            description: formatConflictMessage(result),
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }
      }

      onSave({
        clientId: form.clientId || "new",
        clientName: isNewClient ? form.clientName : clients.find(c => c.id === form.clientId)?.name || "",
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
    } finally {
      setIsSaving(false);
    }
  };

  const productTotal = productCart.reduce((sum, item) => sum + item.product.sale_price_gross * item.quantity, 0);
  const grandTotal = (selectedService?.price || 0) + productTotal;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        {/* Premium Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 px-6 pt-6 pb-4 rounded-t-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <CalendarPlus className="w-5 h-5 text-primary" />
              </div>
              {appointment ? t('appointment.editAppointment') : t('appointment.newAppointment')}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="space-y-5 px-6 py-4">
          {/* Client Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              <User className="w-3.5 h-3.5 text-primary" />
              {t('appointment.client')}
            </Label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('appointment.searchClientPlaceholder')}
                value={clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value);
                  setShowClientDropdown(true);
                }}
                onFocus={() => setShowClientDropdown(true)}
                className="pl-9 rounded-xl"
              />
              {showClientDropdown && clientSearch && (
                <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {filteredClients.map(client => (
                    <button
                      key={client.id}
                      className="w-full px-4 py-3 text-left hover:bg-primary/5 transition-colors border-b border-border/30 last:border-0 flex items-center gap-3"
                      onClick={() => selectClient(client)}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {getInitials(client.name)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{client.name}</p>
                        <p className="text-xs text-muted-foreground">{client.phone}</p>
                      </div>
                    </button>
                  ))}
                  <button
                    className="w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors text-primary font-medium text-sm"
                    onClick={handleNewClient}
                  >
                    + {t('appointment.addNewClient')}: "{clientSearch}"
                  </button>
                </div>
              )}
            </div>
            {isNewClient && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-xl">
                <Input
                  placeholder={t('appointment.phone')}
                  value={form.clientPhone}
                  onChange={(e) => setForm(prev => ({ ...prev, clientPhone: e.target.value }))}
                  className="rounded-xl"
                />
                <Input
                  placeholder={t('appointment.email')}
                  value={form.clientEmail}
                  onChange={(e) => setForm(prev => ({ ...prev, clientEmail: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
            )}
          </div>

          {/* Service Selection — Cards */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              <Scissors className="w-3.5 h-3.5 text-primary" />
              {t('appointment.service')}
            </Label>
            {services.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Brak usług — dodaj je w zakładce Usługi
              </p>
            ) : (
              <>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Szukaj usługi..."
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    className="pl-9 rounded-xl mb-2"
                  />
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                {filteredServices.map(service => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, serviceId: service.id }))}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left group",
                      form.serviceId === service.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border/50 hover:border-primary/30 hover:bg-muted/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                        form.serviceId === service.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                      )}>
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{service.name}</p>
                        <p className="text-xs text-muted-foreground">{service.duration} min</p>
                      </div>
                    </div>
                    <span className={cn(
                      "text-sm font-bold tabular-nums",
                      form.serviceId === service.id ? "text-primary" : "text-foreground"
                    )}>
                      {service.price} zł
                    </span>
                  </button>
                ))}
              </div>
              </>
            )}
          </div>

          {/* Staff Selection — Avatar Cards */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              <User className="w-3.5 h-3.5 text-primary" />
              {t('appointment.specialist')}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {staffMembers.map((staff, idx) => (
                <button
                  key={staff.id}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, staffId: staff.id }))}
                  className={cn(
                    "flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left shadow-sm",
                    form.staffId === staff.id
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border/50 hover:border-primary/30"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                    staffBgColors[idx % staffBgColors.length]
                  )}>
                    {getInitials(staff.name)}
                  </div>
                  <span className="text-sm font-medium leading-tight">{staff.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                {t('appointment.date')}
              </Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <Clock className="w-3.5 h-3.5 text-primary" />
                {t('appointment.time')}
              </Label>
              <Select
                value={form.time}
                onValueChange={(value) => setForm(prev => ({ ...prev, time: value }))}
              >
                <SelectTrigger className="rounded-xl">
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
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{t('appointment.notes')}</Label>
            <Textarea
              placeholder={t('appointment.notesPlaceholder')}
              value={form.notes}
              onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="rounded-xl"
            />
          </div>

          {/* Product Sales Section */}
          <Collapsible open={showProducts} onOpenChange={setShowProducts}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full gap-2 justify-between rounded-xl">
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  {t('products.addProductsToSale')}
                </span>
                {productCart.length > 0 && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {productCart.length} {t('products.items')}
                  </span>
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <ProductSaleSection cart={productCart} onCartChange={setProductCart} salonId={salonId || (isDemo ? "demo-salon-id" : undefined)} />
            </CollapsibleContent>
          </Collapsible>

          {/* Premium Summary */}
          {selectedService && selectedStaff && (
            <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl p-5 shadow-lg">
              <p className="text-xs uppercase tracking-wider opacity-80 mb-3">{t('appointment.summary')}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-80">{t('appointment.service')}</span>
                  <span className="font-medium">{selectedService.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">{t('appointment.duration')}</span>
                  <span className="font-medium">{selectedService.duration} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">{t('appointment.specialist')}</span>
                  <span className="font-medium">{selectedStaff.name}</span>
                </div>
                {productCart.length > 0 && (
                  <div className="flex justify-between opacity-80">
                    <span>{t('products.productsTotal')} ({productCart.length})</span>
                    <span>{productTotal.toLocaleString()} zł</span>
                  </div>
                )}
                <Separator className="my-2 bg-primary-foreground/20" />
                <div className="flex justify-between font-bold text-lg">
                  <span>{t('appointment.total')}</span>
                  <span>{grandTotal.toLocaleString()} zł</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 pb-6 pt-2">
          <Button variant="outline" onClick={onClose} className="rounded-xl">{t('common.cancel')}</Button>
          <Button 
            className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl transition-all px-8 rounded-xl gap-2"
            onClick={handleSave}
            disabled={!form.serviceId || !form.staffId || (!form.clientId && !isNewClient) || isSaving}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {appointment ? t('appointment.saveChanges') : t('appointment.createAppointment')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
