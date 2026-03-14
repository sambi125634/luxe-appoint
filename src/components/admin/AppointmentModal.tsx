import { useState, useEffect } from "react";
import { Calendar, Clock, User, Scissors, Search, ShoppingBag } from "lucide-react";
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
}).filter((_, i) => i < 22); // 8:00 - 19:00

export function AppointmentModal({ 
  isOpen, 
  onClose, 
  onSave, 
  appointment,
  selectedDate,
  selectedTime,
  isDemo = false,
  preselectedClient
}: AppointmentModalProps) {
  const { t } = useTranslation();

  // Real data from DB for production mode
  const { data: dbStaff } = useStaffMembers();
  const { data: dbClients } = useClients();
  const { data: dbServices } = useServices();

  // Use real or mock data
  const staffColors = ["bg-primary", "bg-secondary", "bg-accent", "bg-chart-1"];
  const clients: Client[] = isDemo
    ? mockClients
    : (dbClients || []).map((c) => ({
        id: c.id,
        name: `${c.first_name} ${c.last_name}`,
        phone: c.phone,
        email: c.email || "",
      }));

  const services: Service[] = isDemo
    ? mockServices
    : (dbServices || []).map((s) => ({
        id: s.id,
        name: s.name,
        duration: s.duration,
        price: Number(s.price),
      }));

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
    setProductCart([]);
    setShowProducts(false);
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

  const handleSave = () => {
    if (!form.serviceId || !form.staffId || (!form.clientId && !isNewClient)) return;
    
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
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {appointment ? t('appointment.editAppointment') : t('appointment.newAppointment')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Client Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
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
                    + {t('appointment.addNewClient')}: "{clientSearch}"
                  </button>
                </div>
              )}
            </div>
            {isNewClient && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg">
                <Input
                  placeholder={t('appointment.phone')}
                  value={form.clientPhone}
                  onChange={(e) => setForm(prev => ({ ...prev, clientPhone: e.target.value }))}
                />
                <Input
                  placeholder={t('appointment.email')}
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
              {t('appointment.service')}
            </Label>
            <Select
              value={form.serviceId}
              onValueChange={(value) => setForm(prev => ({ ...prev, serviceId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('appointment.selectService')} />
              </SelectTrigger>
              <SelectContent>
                {services.map(service => (
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
              {t('appointment.specialist')}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {staffMembers.map(staff => (
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
                {t('appointment.date')}
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
                {t('appointment.time')}
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
            <Label>{t('appointment.notes')}</Label>
            <Textarea
              placeholder={t('appointment.notesPlaceholder')}
              value={form.notes}
              onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Product Sales Section */}
          <Collapsible open={showProducts} onOpenChange={setShowProducts}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full gap-2 justify-between">
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
              <ProductSaleSection cart={productCart} onCartChange={setProductCart} />
            </CollapsibleContent>
          </Collapsible>

          {/* Summary */}
          {selectedService && selectedStaff && (
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
              <p className="text-sm text-muted-foreground mb-2">{t('appointment.summary')}</p>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">{t('appointment.service')}:</span> {selectedService.name}</p>
                <p><span className="font-medium">{t('appointment.duration')}:</span> {selectedService.duration} min</p>
                <div className="flex justify-between">
                  <span className="font-medium">{t('appointment.servicePrice')}:</span>
                  <span>{selectedService.price} zł</span>
                </div>
                {productCart.length > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t('products.productsTotal')} ({productCart.length}):</span>
                    <span>{productCart.reduce((sum, item) => sum + item.product.sale_price_gross * item.quantity, 0).toLocaleString()} zł</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-base">
                  <span>{t('appointment.total')}:</span>
                  <span className="text-primary">
                    {(selectedService.price + productCart.reduce((sum, item) => sum + item.product.sale_price_gross * item.quantity, 0)).toLocaleString()} zł
                  </span>
                </div>
                <p className="pt-1"><span className="font-medium">{t('appointment.specialist')}:</span> {selectedStaff.name}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
          <Button 
            variant="luxury" 
            onClick={handleSave}
            disabled={!form.serviceId || !form.staffId || (!form.clientId && !isNewClient)}
          >
            {appointment ? t('appointment.saveChanges') : t('appointment.createAppointment')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}