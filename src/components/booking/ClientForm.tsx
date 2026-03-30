import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MessageSquare, Mail, Phone as PhoneIcon } from "lucide-react";
import { useState } from "react";

// Validation helpers
const validateEmail = (email: string): string | null => {
  if (!email.trim()) return "Adres e-mail jest wymagany";
  if (email.length > 255) return "Adres e-mail jest zbyt długi";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return "Nieprawidłowy adres e-mail";
  return null;
};

const validatePhone = (phone: string): string | null => {
  if (!phone.trim()) return "Numer telefonu jest wymagany";
  const cleaned = phone.replace(/[\s\-()]/g, "");
  if (cleaned.length < 9 || cleaned.length > 15) return "Numer telefonu powinien mieć 9-15 cyfr";
  const phoneRegex = /^[+]?[0-9]{9,15}$/;
  if (!phoneRegex.test(cleaned)) return "Nieprawidłowy format numeru telefonu";
  return null;
};

const validateName = (name: string, label: string): string | null => {
  if (!name.trim()) return `${label} jest wymagane`;
  if (name.trim().length < 2) return `${label} musi mieć co najmniej 2 znaki`;
  if (name.length > 100) return `${label} jest zbyt długie`;
  return null;
};

export interface ClientData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  notes: string;
  acceptRodo: boolean;
  acceptMarketing: boolean;
  howDidYouFind?: string;
  confirmationMethod?: 'sms' | 'email' | 'whatsapp';
}
interface ClientFormProps {
  onUpdate: (data: ClientData) => void;
  data: ClientData;
}
const referralSources = [{
  value: "google",
  label: "Google"
}, {
  value: "instagram",
  label: "Instagram"
}, {
  value: "facebook",
  label: "Facebook"
}, {
  value: "friend",
  label: "Polecenie znajomej"
}, {
  value: "returning",
  label: "Byłam już wcześniej"
}, {
  value: "other",
  label: "Inne"
}];
export function ClientForm({
  onUpdate,
  data
}: ClientFormProps) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = {
    firstName: touched.firstName ? validateName(data.firstName, "Imię") : null,
    lastName: touched.lastName ? validateName(data.lastName, "Nazwisko") : null,
    phone: touched.phone ? validatePhone(data.phone) : null,
    email: touched.email ? validateEmail(data.email) : null,
  };

  const handleChange = (field: keyof ClientData, value: string | boolean) => {
    onUpdate({
      ...data,
      [field]: typeof value === "string" ? value : value,
    });
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  return <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-serif font-semibold mb-2">Twoje dane</h2>
        <p className="text-muted-foreground">Podaj informacje kontaktowe do rezerwacji</p>
      </div>

      <div className="space-y-4">
        {/* Required fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Imię *</Label>
            <Input id="firstName" placeholder="Anna" value={data.firstName} onChange={e => handleChange('firstName', e.target.value)} onBlur={() => handleBlur('firstName')} className={`h-12 ${errors.firstName ? 'border-destructive' : ''}`} maxLength={100} />
            {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nazwisko *</Label>
            <Input id="lastName" placeholder="Kowalska" value={data.lastName} onChange={e => handleChange('lastName', e.target.value)} onBlur={() => handleBlur('lastName')} className={`h-12 ${errors.lastName ? 'border-destructive' : ''}`} maxLength={100} />
            {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Numer telefonu *</Label>
          <Input id="phone" type="tel" placeholder="+48 123 456 789" value={data.phone} onChange={e => handleChange('phone', e.target.value)} onBlur={() => handleBlur('phone')} className={`h-12 ${errors.phone ? 'border-destructive' : ''}`} maxLength={20} />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Adres e-mail *</Label>
          <Input id="email" type="email" placeholder="anna.kowalska@example.com" value={data.email} onChange={e => handleChange('email', e.target.value)} onBlur={() => handleBlur('email')} className={`h-12 ${errors.email ? 'border-destructive' : ''}`} maxLength={255} />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>

        {/* Confirmation method */}
        

        {/* Optional: How did you find us */}
        <div className="space-y-2">
          <Label htmlFor="howDidYouFind" className="text-sm">
            Jak do nas trafiłaś? <span className="text-muted-foreground">(opcjonalnie)</span>
          </Label>
          <Select value={data.howDidYouFind || ""} onValueChange={value => handleChange('howDidYouFind', value)}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Wybierz..." />
            </SelectTrigger>
            <SelectContent>
              {referralSources.map(source => <SelectItem key={source.value} value={source.value}>
                  {source.label}
                </SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Message to salon */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            Wiadomość do salonu
            <span className="text-muted-foreground font-normal text-xs">(opcjonalnie)</span>
          </Label>
          <Textarea
            id="notes"
            placeholder="Np. mam uczulenie na lateks, proszę o paragon, preferuję ciszę podczas zabiegu..."
            value={data.notes}
            onChange={e => handleChange('notes', e.target.value)}
            className="min-h-[80px] resize-none text-sm"
            maxLength={300}
            rows={3}
          />
          <p className="text-xs text-muted-foreground text-right">
            {data.notes.length}/300
          </p>
        </div>

        {/* Consents */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-start space-x-3">
            <Checkbox id="rodo" checked={data.acceptRodo} onCheckedChange={checked => handleChange('acceptRodo', checked as boolean)} className="mt-0.5" />
            <Label htmlFor="rodo" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
              Wyrażam zgodę na przetwarzanie moich danych osobowych w celu realizacji usługi zgodnie z polityką prywatności. *
            </Label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox id="marketing" checked={data.acceptMarketing} onCheckedChange={checked => handleChange('acceptMarketing', checked as boolean)} className="mt-0.5" />
            <Label htmlFor="marketing" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
              Chcę otrzymywać informacje o promocjach i nowościach na podany adres e-mail.
            </Label>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          * Pola wymagane
        </p>
      </div>
    </div>;
}