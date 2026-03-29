import { useState } from "react";
import { Download, Users, Calendar, DollarSign, Package, Archive, ShieldAlert, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSalonId } from "@/hooks/useSalonId";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import JSZip from "jszip";
import {
  toCSV, CLIENT_COLUMNS, APPOINTMENT_COLUMNS, PRODUCT_COLUMNS, TRANSACTION_COLUMNS,
  mapClientsForExport, mapAppointmentsForExport, mapProductsForExport, mapTransactionsForExport,
} from "./exportHelpers";
import { ExportClients } from "./ExportClients";
import { ExportAppointments } from "./ExportAppointments";
import { ExportFinances } from "./ExportFinances";
import { ExportProducts } from "./ExportProducts";

export function ExportModule() {
  const { salonId } = useSalonId();
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const { data: salonData } = useQuery({
    queryKey: ["salon-export-info", salonId],
    queryFn: async () => {
      const { data } = await supabase.from("salons").select("name, slug").eq("id", salonId!).single();
      return data;
    },
    enabled: !!salonId,
  });

  const { data: counts } = useQuery({
    queryKey: ["export-counts", salonId],
    queryFn: async () => {
      const [clients, appointments, transactions, products] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact", head: true }).eq("salon_id", salonId!),
        supabase.from("appointments").select("id", { count: "exact", head: true }).eq("salon_id", salonId!),
        supabase.from("transactions").select("id", { count: "exact", head: true }).eq("salon_id", salonId!),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("salon_id", salonId!),
      ]);
      return {
        clients: clients.count ?? 0,
        appointments: appointments.count ?? 0,
        transactions: transactions.count ?? 0,
        products: products.count ?? 0,
      };
    },
    enabled: !!salonId,
  });

  const salonName = salonData?.name || "salon";

  const handleFullBackup = async () => {
    if (!salonId) return;
    setIsBackingUp(true);
    try {
      const zip = new JSZip();
      const date = new Date().toISOString().split("T")[0];
      const folder = zip.folder(`beauty_calendar_backup_${date}`)!;

      const [clientsRes, appointmentsRes, productsRes, transactionsRes] = await Promise.all([
        supabase.from("clients").select("*, appointments(id, start_time, price, status)").eq("salon_id", salonId),
        supabase.from("appointments").select("*, clients(first_name, last_name, phone), services(name, duration), staff_members(name)").eq("salon_id", salonId),
        supabase.from("products").select("*").eq("salon_id", salonId),
        supabase.from("transactions").select("*").eq("salon_id", salonId),
      ]);

      folder.file("klientki.csv", "\uFEFF" + toCSV(mapClientsForExport(clientsRes.data || []), CLIENT_COLUMNS));
      folder.file("wizyty.csv", "\uFEFF" + toCSV(mapAppointmentsForExport(appointmentsRes.data || []), APPOINTMENT_COLUMNS));
      folder.file("produkty.csv", "\uFEFF" + toCSV(mapProductsForExport(productsRes.data || []), PRODUCT_COLUMNS));
      folder.file("transakcje.csv", "\uFEFF" + toCSV(mapTransactionsForExport(transactionsRes.data || []), TRANSACTION_COLUMNS));
      folder.file("README.txt", `Backup danych Beauty Calendar\nSalon: ${salonName}\nData: ${new Date().toLocaleDateString("pl-PL")}\n\nPliki:\n- klientki.csv — baza klientek\n- wizyty.csv — historia wizyt\n- produkty.csv — katalog produktów\n- transakcje.csv — historia transakcji\n`);

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `beauty_calendar_backup_${date}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("✓ Pełny backup pobrany pomyślnie");
    } catch (err) {
      console.error(err);
      toast.error("Błąd podczas tworzenia backupu");
    } finally {
      setIsBackingUp(false);
    }
  };

  const cards = [
    {
      id: "clients",
      icon: Users,
      title: "Baza klientek",
      desc: "Eksportuj pełną bazę klientek z historią wizyt, wydatkami, tagami i zgodami RODO.",
      count: counts?.clients ?? 0,
      unit: "klientek",
      btn: "Eksportuj klientki",
    },
    {
      id: "appointments",
      icon: Calendar,
      title: "Historia wizyt",
      desc: "Wszystkie wizyty z datami, usługami, pracownikami i kwotami.",
      count: counts?.appointments ?? 0,
      unit: "wizyt",
      btn: "Eksportuj wizyty",
    },
    {
      id: "finances",
      icon: DollarSign,
      title: "Dane finansowe",
      desc: "Przychody, transakcje, rozliczenia pracowników i raporty VAT.",
      count: counts?.transactions ?? 0,
      unit: "transakcji",
      btn: "Eksportuj finanse",
    },
    {
      id: "products",
      icon: Package,
      title: "Katalog produktów",
      desc: "Stany magazynowe, ceny, historia dostaw i ruchy magazynowe.",
      count: counts?.products ?? 0,
      unit: "produktów",
      btn: "Eksportuj produkty",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
          <Download className="w-6 h-6 text-primary" />
          Eksport danych
        </h2>
        <p className="text-muted-foreground mt-1">
          Pobierz dane swojego salonu w formacie CSV lub JSON. Pliki otworzysz w Excel, Google Sheets lub dowolnym edytorze.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {cards.map(card => (
          <Card key={card.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <card.icon className="w-5 h-5 text-primary" />
                {card.title}
              </CardTitle>
              <CardDescription>{card.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Liczba rekordów: <span className="font-medium text-foreground">{card.count} {card.unit}</span>
              </p>
              <Button variant="outline" className="w-full gap-2" onClick={() => setOpenModal(card.id)}>
                <Download className="w-4 h-4" />
                {card.btn}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-primary" />
            Pełny eksport wszystkich danych
          </CardTitle>
          <CardDescription>
            Pobierz wszystkie dane salonu w jednym pliku ZIP zawierającym oddzielne pliki CSV dla każdej kategorii danych.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleFullBackup} disabled={isBackingUp} className="gap-2">
            {isBackingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isBackingUp ? "Tworzę backup..." : "Pobierz pełny backup (ZIP)"}
          </Button>
        </CardContent>
      </Card>

      <Alert>
        <ShieldAlert className="w-4 h-4" />
        <AlertTitle>Eksport danych a RODO</AlertTitle>
        <AlertDescription>
          Pobrane pliki zawierają dane osobowe klientek. Przechowuj je bezpiecznie i usuń gdy nie są potrzebne.
          Klientka ma prawo żądać kopii swoich danych — możesz ją wygenerować z jej profilu w zakładce Klienci.
        </AlertDescription>
      </Alert>

      {salonId && (
        <>
          <ExportClients open={openModal === "clients"} onOpenChange={o => !o && setOpenModal(null)} salonId={salonId} salonName={salonName} />
          <ExportAppointments open={openModal === "appointments"} onOpenChange={o => !o && setOpenModal(null)} salonId={salonId} salonName={salonName} />
          <ExportFinances open={openModal === "finances"} onOpenChange={o => !o && setOpenModal(null)} salonId={salonId} salonName={salonName} />
          <ExportProducts open={openModal === "products"} onOpenChange={o => !o && setOpenModal(null)} salonId={salonId} salonName={salonName} />
        </>
      )}
    </div>
  );
}
