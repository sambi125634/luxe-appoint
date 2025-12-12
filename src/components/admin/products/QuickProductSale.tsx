import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ShoppingBag, User, Search, CreditCard, Banknote, Receipt } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ProductSaleSection, type CartItem } from "./ProductSaleSection";
import { toast } from "@/hooks/use-toast";

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
}

const mockClients: Client[] = [
  { id: "1", name: "Anna Kowalska", phone: "+48 500 100 200", email: "anna@example.com" },
  { id: "2", name: "Joanna Nowak", phone: "+48 500 100 201", email: "joanna@example.com" },
  { id: "3", name: "Magdalena Wiśniewska", phone: "+48 500 100 202", email: "magda@example.com" },
];

interface QuickProductSaleProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: (saleData: {
    cart: CartItem[];
    clientId?: string;
    paymentMethod: string;
    total: number;
  }) => void;
}

export function QuickProductSale({ open, onOpenChange, onComplete }: QuickProductSaleProps) {
  const { t } = useTranslation();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer">("cash");

  const filteredClients = mockClients.filter(
    (client) =>
      client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.phone.includes(clientSearch)
  );

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.sale_price_gross * item.quantity,
    0
  );

  const handleComplete = () => {
    if (cart.length === 0) {
      toast({
        title: t("products.emptyCart"),
        description: t("products.addProductsFirst"),
        variant: "destructive",
      });
      return;
    }

    onComplete?.({
      cart,
      clientId: selectedClient?.id,
      paymentMethod,
      total: cartTotal,
    });

    toast({
      title: t("products.saleCompleted"),
      description: `${t("products.total")}: ${cartTotal.toLocaleString()} zł`,
    });

    // Reset form
    setCart([]);
    setSelectedClient(null);
    setClientSearch("");
    setPaymentMethod("cash");
    onOpenChange(false);
  };

  const selectClient = (client: Client) => {
    setSelectedClient(client);
    setClientSearch(client.name);
    setShowClientDropdown(false);
  };

  const clearClient = () => {
    setSelectedClient(null);
    setClientSearch("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            {t("products.quickSale")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Client Selection (Optional) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              {t("products.client")} <span className="text-muted-foreground text-xs">({t("common.optional")})</span>
            </Label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("products.searchClient")}
                value={clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value);
                  setShowClientDropdown(true);
                  if (!e.target.value) setSelectedClient(null);
                }}
                onFocus={() => setShowClientDropdown(true)}
                className="pl-9"
              />
              {showClientDropdown && clientSearch && !selectedClient && (
                <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredClients.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                      {t("products.noClientsFound")}
                    </div>
                  ) : (
                    filteredClients.map((client) => (
                      <button
                        key={client.id}
                        type="button"
                        className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0"
                        onClick={() => selectClient(client)}
                      >
                        <p className="font-medium text-sm">{client.name}</p>
                        <p className="text-xs text-muted-foreground">{client.phone}</p>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {selectedClient && (
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg text-sm">
                <span>{selectedClient.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearClient}
                  className="h-6 text-xs"
                >
                  {t("common.change")}
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Product Selection */}
          <ProductSaleSection cart={cart} onCartChange={setCart} />

          {cart.length > 0 && (
            <>
              <Separator />

              {/* Payment Method */}
              <div className="space-y-3">
                <Label>{t("products.paymentMethod")}</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as "cash" | "card" | "transfer")}
                  className="grid grid-cols-3 gap-3"
                >
                  <div>
                    <RadioGroupItem value="cash" id="cash" className="peer sr-only" />
                    <Label
                      htmlFor="cash"
                      className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
                    >
                      <Banknote className="w-5 h-5 mb-1" />
                      <span className="text-xs">{t("products.cash")}</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="card" id="card" className="peer sr-only" />
                    <Label
                      htmlFor="card"
                      className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
                    >
                      <CreditCard className="w-5 h-5 mb-1" />
                      <span className="text-xs">{t("products.card")}</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="transfer" id="transfer" className="peer sr-only" />
                    <Label
                      htmlFor="transfer"
                      className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
                    >
                      <Receipt className="w-5 h-5 mb-1" />
                      <span className="text-xs">{t("products.transfer")}</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Total */}
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{t("products.totalToPay")}</span>
                  <span className="text-2xl font-bold text-primary">
                    {cartTotal.toLocaleString()} zł
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleComplete} disabled={cart.length === 0} className="gap-2">
            <Receipt className="w-4 h-4" />
            {t("products.completeSale")}
          </Button>
        </DialogFooter>

        {/* Click outside to close dropdowns */}
        {showClientDropdown && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowClientDropdown(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
