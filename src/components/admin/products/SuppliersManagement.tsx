import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Building2, Plus, Search, MoreHorizontal, Edit, Trash2, Phone, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SupplierFormModal } from "./modals/SupplierFormModal";
import { type Supplier } from "./types";
import { useSuppliers, type Supplier as DBSupplier } from "@/hooks/useSuppliers";

interface SuppliersManagementProps {
  salonId?: string;
}

// Helper to convert DB supplier to component Supplier type
const toSupplier = (s: DBSupplier): Supplier => ({
  id: s.id,
  salon_id: s.salon_id,
  name: s.name,
  contact_person: s.contact_person ?? undefined,
  email: s.email ?? undefined,
  phone: s.phone ?? undefined,
  address: s.address ?? undefined,
  payment_terms: s.payment_terms ?? undefined,
  discount_info: s.discount_info ?? undefined,
  notes: s.notes ?? undefined,
  is_active: s.is_active,
  created_at: s.created_at,
  updated_at: s.updated_at,
});

export function SuppliersManagement({ salonId }: SuppliersManagementProps) {
  const { t } = useTranslation();
  const { suppliers: dbSuppliers, isLoading, createSupplier, updateSupplier, deleteSupplier } = useSuppliers(salonId);
  const suppliers = dbSuppliers.map(toSupplier);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.contact_person?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveSupplier = (supplier: Supplier) => {
    if (editingSupplier) {
      updateSupplier.mutate({
        id: supplier.id,
        name: supplier.name,
        contact_person: supplier.contact_person,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        payment_terms: supplier.payment_terms,
        discount_info: supplier.discount_info,
        notes: supplier.notes,
        is_active: supplier.is_active,
      });
    } else if (salonId) {
      createSupplier.mutate({
        salon_id: salonId,
        name: supplier.name,
        contact_person: supplier.contact_person,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        payment_terms: supplier.payment_terms,
        discount_info: supplier.discount_info,
        notes: supplier.notes,
        is_active: supplier.is_active ?? true,
      });
    }
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  const handleDeleteSupplier = (id: string) => {
    deleteSupplier.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {t("products.suppliers")}
            </CardTitle>
            <Button onClick={() => setIsModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              {t("products.addSupplier")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("products.searchSuppliers")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 max-w-md"
              />
            </div>
          </div>

          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t("products.noSuppliers")}</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSuppliers.map((supplier) => (
                <Card key={supplier.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{supplier.name}</h3>
                        {supplier.contact_person && (
                          <p className="text-sm text-muted-foreground">{supplier.contact_person}</p>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background border">
                          <DropdownMenuItem onClick={() => { setEditingSupplier(supplier); setIsModalOpen(true); }}>
                            <Edit className="w-4 h-4 mr-2" />
                            {t("common.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteSupplier(supplier.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t("common.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-2 text-sm">
                      {supplier.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <span>{supplier.phone}</span>
                        </div>
                      )}
                      {supplier.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <span>{supplier.email}</span>
                        </div>
                      )}
                    </div>

                    {(supplier.payment_terms || supplier.discount_info) && (
                      <div className="mt-3 pt-3 border-t space-y-1">
                        {supplier.payment_terms && (
                          <Badge variant="outline" className="text-xs">
                            {supplier.payment_terms}
                          </Badge>
                        )}
                        {supplier.discount_info && (
                          <p className="text-xs text-muted-foreground">{supplier.discount_info}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <SupplierFormModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditingSupplier(null);
        }}
        supplier={editingSupplier}
        onSave={handleSaveSupplier}
      />
    </div>
  );
}
