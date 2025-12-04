import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MessageSquare, Mail, Phone as PhoneIcon } from "lucide-react";

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

const referralSources = [
  { value: "", label: "Wybierz..." },
  { value: "google", label: "Google" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "friend", label: "Polecenie znajomej" },
  { value: "returning", label: "Byłam już wcześniej" },
  { value: "other", label: "Inne" },
];

export function ClientForm({ onUpdate, data }: ClientFormProps) {
  const handleChange = (field: keyof ClientData, value: string | boolean) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-serif font-semibold mb-2">Twoje dane</h2>
        <p className="text-muted-foreground">Podaj informacje kontaktowe do rezerwacji</p>
      </div>

      <div className="space-y-4">
        {/* Required fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Imię *</Label>
            <Input
              id="firstName"
              placeholder="Anna"
              value={data.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nazwisko *</Label>
            <Input
              id="lastName"
              placeholder="Kowalska"
              value={data.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className="h-12"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Numer telefonu *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+48 123 456 789"
            value={data.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Adres e-mail *</Label>
          <Input
            id="email"
            type="email"
            placeholder="anna.kowalska@example.com"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="h-12"
          />
        </div>

        {/* Confirmation method */}
        <div className="space-y-3 p-4 bg-muted/30 rounded-xl">
          <Label className="text-sm font-medium">Jak chcesz otrzymać potwierdzenie?</Label>
          <RadioGroup 
            value={data.confirmationMethod || 'sms'} 
            onValueChange={(value) => handleChange('confirmationMethod', value)}
            className="flex flex-wrap gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sms" id="sms" />
              <Label htmlFor="sms" className="flex items-center gap-1.5 cursor-pointer text-sm">
                <PhoneIcon className="w-4 h-4" />
                SMS
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="email" id="email-confirm" />
              <Label htmlFor="email-confirm" className="flex items-center gap-1.5 cursor-pointer text-sm">
                <Mail className="w-4 h-4" />
                E-mail
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="whatsapp" id="whatsapp" />
              <Label htmlFor="whatsapp" className="flex items-center gap-1.5 cursor-pointer text-sm">
                <MessageSquare className="w-4 h-4" />
                WhatsApp
              </Label>
            </div>
          </RadioGroup>
          <p className="text-xs text-muted-foreground">
            Domyślnie wyślemy potwierdzenie SMS na podany numer telefonu.
          </p>
        </div>

        {/* Optional: How did you find us */}
        <div className="space-y-2">
          <Label htmlFor="howDidYouFind" className="text-sm">
            Jak do nas trafiłaś? <span className="text-muted-foreground">(opcjonalnie)</span>
          </Label>
          <Select 
            value={data.howDidYouFind || ""} 
            onValueChange={(value) => handleChange('howDidYouFind', value)}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Wybierz..." />
            </SelectTrigger>
            <SelectContent>
              {referralSources.map((source) => (
                <SelectItem key={source.value} value={source.value}>
                  {source.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">
            Uwagi do wizyty <span className="text-muted-foreground">(opcjonalnie)</span>
          </Label>
          <Textarea
            id="notes"
            placeholder="Dodatkowe informacje, preferencje, alergie..."
            value={data.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="min-h-[80px] resize-none"
          />
        </div>

        {/* Consents */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="rodo"
              checked={data.acceptRodo}
              onCheckedChange={(checked) => handleChange('acceptRodo', checked as boolean)}
              className="mt-0.5"
            />
            <Label htmlFor="rodo" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
              Wyrażam zgodę na przetwarzanie moich danych osobowych w celu realizacji usługi zgodnie z polityką prywatności. *
            </Label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="marketing"
              checked={data.acceptMarketing}
              onCheckedChange={(checked) => handleChange('acceptMarketing', checked as boolean)}
              className="mt-0.5"
            />
            <Label htmlFor="marketing" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
              Chcę otrzymywać informacje o promocjach i nowościach na podany adres e-mail.
            </Label>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          * Pola wymagane
        </p>
      </div>
    </div>
  );
}
