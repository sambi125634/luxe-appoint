import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface ClientData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  notes: string;
  acceptRodo: boolean;
  acceptMarketing: boolean;
}

interface ClientFormProps {
  onUpdate: (data: ClientData) => void;
  data: ClientData;
}

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Imię</Label>
            <Input
              id="firstName"
              placeholder="Anna"
              value={data.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nazwisko</Label>
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
          <Label htmlFor="phone">Numer telefonu</Label>
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
          <Label htmlFor="email">Adres e-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="anna.kowalska@example.com"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Uwagi do wizyty (opcjonalnie)</Label>
          <Textarea
            id="notes"
            placeholder="Dodatkowe informacje, preferencje, alergie..."
            value={data.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </div>

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
      </div>
    </div>
  );
}
