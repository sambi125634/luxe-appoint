export function toCSV(
  data: Record<string, unknown>[],
  columns: { key: string; label: string }[]
): string {
  const header = columns.map(c => `"${c.label}"`).join(",");
  const rows = data.map(row =>
    columns.map(c => {
      const val = row[c.key];
      if (val === null || val === undefined) return "";
      if (typeof val === "string") return `"${val.replace(/"/g, '""')}"`;
      if (val instanceof Date) return `"${val.toLocaleDateString("pl-PL")}"`;
      return `"${val}"`;
    }).join(",")
  );
  return [header, ...rows].join("\n");
}

export function downloadCSV(content: string, filename: string): void {
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadJSON(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("pl-PL");
}

export function formatAmount(amount: number | null): string {
  if (amount === null || amount === undefined) return "0,00 zł";
  return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(amount);
}

export const CLIENT_COLUMNS = [
  { key: "imie", label: "Imię" },
  { key: "nazwisko", label: "Nazwisko" },
  { key: "telefon", label: "Telefon" },
  { key: "email", label: "Email" },
  { key: "data_pierwszej_wizyty", label: "Pierwsza wizyta" },
  { key: "data_ostatniej_wizyty", label: "Ostatnia wizyta" },
  { key: "liczba_wizyt", label: "Liczba wizyt" },
  { key: "laczna_wartosc_zl", label: "Łączna wartość (zł)" },
  { key: "srednia_wizyta_zl", label: "Średnia wizyta (zł)" },
  { key: "tagi", label: "Tagi CRM" },
  { key: "vip", label: "VIP" },
  { key: "problematyczna", label: "Problematyczna" },
  { key: "zgoda_rodo", label: "Zgoda RODO" },
  { key: "zgoda_marketing", label: "Zgoda marketing" },
  { key: "zrodlo", label: "Źródło" },
];

export const APPOINTMENT_COLUMNS = [
  { key: "data_wizyty", label: "Data wizyty" },
  { key: "godzina", label: "Godzina" },
  { key: "klientka", label: "Klientka" },
  { key: "telefon", label: "Telefon" },
  { key: "usluga", label: "Usługa" },
  { key: "pracownik", label: "Pracownik" },
  { key: "czas_min", label: "Czas (min)" },
  { key: "kwota_zl", label: "Kwota (zł)" },
  { key: "status", label: "Status" },
];

export const PRODUCT_COLUMNS = [
  { key: "nazwa", label: "Nazwa" },
  { key: "marka", label: "Marka" },
  { key: "kategoria", label: "Kategoria" },
  { key: "ean", label: "EAN" },
  { key: "wariant", label: "Wariant" },
  { key: "cena_zakupu_netto", label: "Cena zakupu netto (zł)" },
  { key: "cena_sprzedazy_brutto", label: "Cena sprzedaży brutto (zł)" },
  { key: "vat_procent", label: "VAT (%)" },
  { key: "stan_obecny", label: "Stan obecny" },
  { key: "stan_minimalny", label: "Stan minimalny" },
  { key: "aktywny", label: "Aktywny" },
];

export const TRANSACTION_COLUMNS = [
  { key: "data", label: "Data" },
  { key: "typ", label: "Typ" },
  { key: "kategoria", label: "Kategoria" },
  { key: "opis", label: "Opis" },
  { key: "kwota_zl", label: "Kwota (zł)" },
  { key: "metoda_platnosci", label: "Metoda płatności" },
];

const STATUS_LABELS: Record<string, string> = {
  booked: "Zarezerwowana",
  confirmed: "Potwierdzona",
  completed: "Zakończona",
  cancelled: "Anulowana",
  no_show: "No-show",
};

export function mapClientsForExport(clients: any[]): Record<string, unknown>[] {
  return clients.map(client => {
    const apts = client.appointments || [];
    const completed = apts.filter((a: any) => a.status === "completed");
    const totalSpent = completed.reduce((s: number, a: any) => s + (a.price || 0), 0);
    const sorted = [...apts].sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    return {
      imie: client.first_name,
      nazwisko: client.last_name,
      telefon: client.phone,
      email: client.email || "",
      data_pierwszej_wizyty: formatDate(sorted[0]?.start_time || null),
      data_ostatniej_wizyty: formatDate(client.last_visit_at),
      liczba_wizyt: completed.length,
      laczna_wartosc_zl: totalSpent.toFixed(2).replace(".", ","),
      srednia_wizyta_zl: completed.length > 0 ? (totalSpent / completed.length).toFixed(2).replace(".", ",") : "0,00",
      tagi: (client.tags || []).join("; "),
      vip: client.is_vip ? "TAK" : "NIE",
      problematyczna: client.is_problematic ? "TAK" : "NIE",
      zgoda_rodo: client.rodo_consent ? "TAK" : "NIE",
      zgoda_marketing: client.marketing_consent ? "TAK" : "NIE",
      zrodlo: client.source || "",
    };
  });
}

export function mapAppointmentsForExport(appointments: any[]): Record<string, unknown>[] {
  return appointments.map(apt => {
    const client = apt.clients || {};
    const service = apt.services || {};
    const staff = apt.staff_members || {};
    return {
      data_wizyty: formatDate(apt.start_time),
      godzina: apt.start_time ? new Date(apt.start_time).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }) : "",
      klientka: `${client.first_name || ""} ${client.last_name || ""}`.trim(),
      telefon: client.phone || "",
      usluga: service.name || "",
      pracownik: staff.name || "",
      czas_min: service.duration || "",
      kwota_zl: apt.price?.toFixed(2).replace(".", ",") || "0,00",
      status: STATUS_LABELS[apt.status] || apt.status,
    };
  });
}

export function mapProductsForExport(products: any[]): Record<string, unknown>[] {
  return products.map(p => ({
    nazwa: p.name,
    marka: p.brand || "",
    kategoria: p.category || "",
    ean: p.ean || "",
    wariant: p.variant || "",
    cena_zakupu_netto: p.purchase_price_net?.toFixed(2).replace(".", ",") || "",
    cena_sprzedazy_brutto: p.sale_price_gross?.toFixed(2).replace(".", ",") || "0,00",
    vat_procent: p.vat_rate ?? 23,
    stan_obecny: p.current_stock ?? 0,
    stan_minimalny: p.min_stock ?? 0,
    aktywny: p.is_active ? "TAK" : "NIE",
  }));
}

export function mapTransactionsForExport(transactions: any[]): Record<string, unknown>[] {
  return transactions.map(t => ({
    data: formatDate(t.transaction_date),
    typ: t.type || "",
    kategoria: t.category || "",
    opis: t.description || "",
    kwota_zl: t.amount?.toFixed(2).replace(".", ",") || "0,00",
    metoda_platnosci: t.payment_method || "",
  }));
}
