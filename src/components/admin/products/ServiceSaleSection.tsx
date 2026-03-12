import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Scissors, Plus, Minus, X, Search, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface ServiceCartItem {
  service: DemoService;
  quantity: number;
}

interface DemoService {
  id: string;
  name: string;
  price: number;
  category: string;
}

const DEMO_SERVICES: DemoService[] = [
  { id: "s1", name: "Manicure hybrydowy", price: 120, category: "Manicure" },
  { id: "s2", name: "Pedicure klasyczny", price: 100, category: "Pedicure" },
  { id: "s3", name: "Mezoterapia igłowa", price: 250, category: "Kosmetologia" },
  { id: "s4", name: "Strzyżenie damskie", price: 80, category: "Fryzjerstwo" },
  { id: "s5", name: "Koloryzacja", price: 200, category: "Fryzjerstwo" },
  { id: "s6", name: "Masaż relaksacyjny 60min", price: 150, category: "Masaż" },
  { id: "s7", name: "Mikrodermabrazja", price: 180, category: "Kosmetologia" },
  { id: "s8", name: "Henna brwi i rzęs", price: 60, category: "Brwi i rzęsy" },
  { id: "s9", name: "Przedłużanie rzęs 1:1", price: 200, category: "Brwi i rzęsy" },
  { id: "s10", name: "Depilacja woskiem nogi", price: 90, category: "Depilacja" },
];

interface ServiceSaleSectionProps {
  cart: ServiceCartItem[];
  onCartChange: (cart: ServiceCartItem[]) => void;
  className?: string;
}

export function ServiceSaleSection({ cart, onCartChange, className }: ServiceSaleSectionProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const filteredServices = DEMO_SERVICES.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (service: DemoService) => {
    const existing = cart.find((item) => item.service.id === service.id);
    if (existing) {
      onCartChange(
        cart.map((item) =>
          item.service.id === service.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      onCartChange([...cart, { service, quantity: 1 }]);
    }
  };

  const updateQuantity = (serviceId: string, delta: number) => {
    const item = cart.find((i) => i.service.id === serviceId);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      onCartChange(cart.filter((i) => i.service.id !== serviceId));
    } else {
      onCartChange(
        cart.map((i) => (i.service.id === serviceId ? { ...i, quantity: newQty } : i))
      );
    }
  };

  const removeFromCart = (serviceId: string) => {
    onCartChange(cart.filter((i) => i.service.id !== serviceId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.service.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Scissors className="w-4 h-4 text-primary" />
          Dodaj usługi
        </label>
        {cartItemCount > 0 && (
          <Badge variant="secondary" className="gap-1">
            <ShoppingBag className="w-3 h-3" />
            {cartItemCount} szt. • {cartTotal.toLocaleString()} zł
          </Badge>
        )}
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Szukaj usługi do dodania..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowPicker(true);
          }}
          onFocus={() => setShowPicker(true)}
          className="pl-9"
        />

        {showPicker && (
          <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
            <ScrollArea className="max-h-48">
              {filteredServices.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                  Nie znaleziono usług
                </div>
              ) : (
                filteredServices.map((service) => {
                  const inCart = cart.find((i) => i.service.id === service.id);
                  return (
                    <button
                      key={service.id}
                      type="button"
                      className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0 flex items-center justify-between"
                      onClick={() => {
                        addToCart(service);
                        setSearchQuery("");
                        setShowPicker(false);
                      }}
                    >
                      <div>
                        <p className="font-medium text-sm">{service.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {service.category} • {service.price} zł
                        </p>
                      </div>
                      {inCart ? (
                        <Badge variant="secondary" className="text-xs">
                          {inCart.quantity}x
                        </Badge>
                      ) : (
                        <Plus className="w-4 h-4 text-primary" />
                      )}
                    </button>
                  );
                })
              )}
            </ScrollArea>
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
          {cart.map((item) => (
            <div
              key={item.service.id}
              className="flex items-center justify-between gap-3 py-2 border-b border-border/50 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.service.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.service.price} zł × {item.quantity} ={" "}
                  <span className="font-medium text-foreground">
                    {(item.service.price * item.quantity).toLocaleString()} zł
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => updateQuantity(item.service.id, -1)}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => updateQuantity(item.service.id, 1)}
                >
                  <Plus className="w-3 h-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => removeFromCart(item.service.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}

          <div className="pt-2 flex items-center justify-between font-medium">
            <span className="text-sm">Suma usług</span>
            <span>{cartTotal.toLocaleString()} zł</span>
          </div>
        </div>
      )}

      {showPicker && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
