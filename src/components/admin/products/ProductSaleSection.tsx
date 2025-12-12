import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Package, Plus, Minus, X, Search, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type Product } from "./types";
import { useProducts, type Product as DBProduct } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface ProductSaleSectionProps {
  cart: CartItem[];
  onCartChange: (cart: CartItem[]) => void;
  salonId?: string;
  className?: string;
}

// Helper to convert DB product to component Product type
const toProduct = (p: DBProduct): Product => ({
  id: p.id,
  salon_id: p.salon_id,
  supplier_id: p.supplier_id ?? undefined,
  name: p.name,
  brand: p.brand ?? undefined,
  category: p.category,
  sku: p.sku ?? undefined,
  ean: p.ean ?? undefined,
  variant: p.variant ?? undefined,
  sale_price_gross: p.sale_price_gross,
  purchase_price_net: p.purchase_price_net ?? undefined,
  vat_rate: p.vat_rate,
  min_stock: p.min_stock,
  current_stock: p.current_stock,
  is_active: p.is_active,
  is_for_internal_use: p.is_for_internal_use,
  image_url: p.image_url ?? undefined,
  description: p.description ?? undefined,
  created_at: p.created_at,
  updated_at: p.updated_at,
});

export function ProductSaleSection({ cart, onCartChange, salonId, className }: ProductSaleSectionProps) {
  const { t } = useTranslation();
  const { products: dbProducts, isLoading } = useProducts(salonId);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProductPicker, setShowProductPicker] = useState(false);

  const activeProducts = dbProducts
    .map(toProduct)
    .filter((p) => p.is_active && !p.is_for_internal_use && p.current_stock > 0);

  const filteredProducts = activeProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.current_stock) {
        onCartChange(
          cart.map((item) =>
            item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          )
        );
      }
    } else {
      onCartChange([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    const item = cart.find((i) => i.product.id === productId);
    if (!item) return;

    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
      onCartChange(cart.filter((i) => i.product.id !== productId));
    } else if (newQuantity <= item.product.current_stock) {
      onCartChange(
        cart.map((i) => (i.product.id === productId ? { ...i, quantity: newQuantity } : i))
      );
    }
  };

  const removeFromCart = (productId: string) => {
    onCartChange(cart.filter((i) => i.product.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.sale_price_gross * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Package className="w-4 h-4 text-primary" />
          {t("products.addProducts")}
        </label>
        {cartItemCount > 0 && (
          <Badge variant="secondary" className="gap-1">
            <ShoppingBag className="w-3 h-3" />
            {cartItemCount} {t("products.items")} • {cartTotal.toLocaleString()} zł
          </Badge>
        )}
      </div>

      {/* Product Search & Add */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t("products.searchToAdd")}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowProductPicker(true);
          }}
          onFocus={() => setShowProductPicker(true)}
          className="pl-9"
        />

        {showProductPicker && searchQuery && (
          <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
            <ScrollArea className="max-h-48">
              {isLoading ? (
                <div className="px-4 py-3 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                  {t("products.noProductsFound")}
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const inCart = cart.find((i) => i.product.id === product.id);
                  return (
                    <button
                      key={product.id}
                      type="button"
                      className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0 flex items-center justify-between"
                      onClick={() => {
                        addToCart(product);
                        setSearchQuery("");
                        setShowProductPicker(false);
                      }}
                    >
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.brand && `${product.brand} • `}
                          {product.sale_price_gross} zł
                          {product.current_stock <= 3 && (
                            <span className="text-yellow-600 ml-2">
                              ({t("products.only")} {product.current_stock} {t("products.left")})
                            </span>
                          )}
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

      {/* Cart Items */}
      {cart.length > 0 && (
        <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
          {cart.map((item) => (
            <div
              key={item.product.id}
              className="flex items-center justify-between gap-3 py-2 border-b border-border/50 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.product.sale_price_gross} zł × {item.quantity} ={" "}
                  <span className="font-medium text-foreground">
                    {(item.product.sale_price_gross * item.quantity).toLocaleString()} zł
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => updateQuantity(item.product.id, -1)}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => updateQuantity(item.product.id, 1)}
                  disabled={item.quantity >= item.product.current_stock}
                >
                  <Plus className="w-3 h-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => removeFromCart(item.product.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}

          <div className="pt-2 flex items-center justify-between font-medium">
            <span className="text-sm">{t("products.productsTotal")}</span>
            <span>{cartTotal.toLocaleString()} zł</span>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showProductPicker && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProductPicker(false)}
        />
      )}
    </div>
  );
}
