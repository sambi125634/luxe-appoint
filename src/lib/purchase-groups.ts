export type PurchaseGroup =
  | "vip_shopper"
  | "loyal"
  | "new_client"
  | "dormant"
  | "seasonal"
  | "explorer"
  | "none";

export interface PurchaseGroupConfig {
  id: PurchaseGroup;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
  tip: string;
}

export const PURCHASE_GROUPS: Record<PurchaseGroup, PurchaseGroupConfig> = {
  vip_shopper: {
    id: "vip_shopper",
    label: "VIP Shopper",
    emoji: "💎",
    color: "hsl(var(--primary))",
    bgColor: "hsl(var(--primary) / 0.1)",
    description: "Kupuje regularnie i dużo",
    tip: "Informuj jako pierwsza o nowych produktach i oferuj ekskluzywne zestawy",
  },
  loyal: {
    id: "loyal",
    label: "Stała klientka",
    emoji: "🔁",
    color: "hsl(173 58% 39%)",
    bgColor: "hsl(173 58% 39% / 0.1)",
    description: "Wraca systematycznie co miesiąc",
    tip: "Idealna do programu lojalnościowego — nagrodź ją za wierność",
  },
  new_client: {
    id: "new_client",
    label: "Nowa klientka",
    emoji: "🌱",
    color: "hsl(142 71% 45%)",
    bgColor: "hsl(142 71% 45% / 0.1)",
    description: "Niedawno zaczęła kupować",
    tip: "Pokaż bestsellery i zaproponuj zestaw powitalny — pierwsze wrażenie kluczowe",
  },
  dormant: {
    id: "dormant",
    label: "Uśpiona",
    emoji: "😴",
    color: "hsl(0 72% 51%)",
    bgColor: "hsl(0 72% 51% / 0.1)",
    description: "Nie kupiła nic od ponad 90 dni",
    tip: "Wyślij reaktywację z rabatem lub info o nowym produkcie który lubiła",
  },
  seasonal: {
    id: "seasonal",
    label: "Sezonowa",
    emoji: "🎯",
    color: "hsl(38 92% 50%)",
    bgColor: "hsl(38 92% 50% / 0.1)",
    description: "Kupuje głównie w określonych porach roku",
    tip: "Przygotuj ofertę z 3-tygodniowym wyprzedzeniem przed jej sezonem zakupów",
  },
  explorer: {
    id: "explorer",
    label: "Odkrywczyni",
    emoji: "🧪",
    color: "hsl(199 89% 48%)",
    bgColor: "hsl(199 89% 48% / 0.1)",
    description: "Testuje różne kategorie w małych ilościach",
    tip: "Pokaż zestawy próbek i bestsellery — szuka czegoś co zostanie z nią na stałe",
  },
  none: {
    id: "none",
    label: "Brak danych",
    emoji: "⚪",
    color: "hsl(var(--muted-foreground))",
    bgColor: "hsl(var(--muted) / 0.5)",
    description: "Za mało danych do klasyfikacji",
    tip: "Zaproponuj pierwszy zakup przy kolejnej wizycie",
  },
};

export const PURCHASE_GROUP_LIST = Object.values(PURCHASE_GROUPS).filter(g => g.id !== "none");

export function classifyPurchaseGroup(client: {
  totalSpent: number;
  purchaseCount: number;
  lastPurchaseDate: string | null;
  purchaseDates: string[];
  purchaseCategories: string[];
}): PurchaseGroup {
  const now = new Date();
  const { totalSpent, purchaseCount, lastPurchaseDate, purchaseDates, purchaseCategories } = client;

  if (purchaseCount === 0 || !lastPurchaseDate) return "none";

  const lastDate = new Date(lastPurchaseDate);
  const daysSinceLast = Math.floor((now.getTime() - lastDate.getTime()) / 86400000);

  // VIP: LTV > 2000 zł + min 3 visits
  if (totalSpent > 2000 && purchaseCount >= 3) return "vip_shopper";

  // Dormant: last purchase > 90 days ago
  if (daysSinceLast > 90) return "dormant";

  // New: <= 2 purchases within last 60 days
  if (purchaseCount <= 2 && daysSinceLast <= 60) return "new_client";

  // Loyal: min 5 visits in last 180 days
  const last6months = new Date(now.getTime() - 180 * 86400000);
  const recentPurchases = purchaseDates.filter(d => new Date(d) > last6months).length;
  if (recentPurchases >= 5) return "loyal";

  // Seasonal: purchases clustered in max 2 months
  if (purchaseDates.length >= 3) {
    const months = purchaseDates.map(d => new Date(d).getMonth());
    const uniqueMonths = new Set(months).size;
    if (uniqueMonths / purchaseDates.length < 0.4) return "seasonal";
  }

  // Explorer: min 3 purchases + min 3 different categories
  const uniqueCategories = new Set(purchaseCategories).size;
  if (purchaseCount >= 3 && uniqueCategories >= 3) return "explorer";

  // Default loyal if enough purchases
  if (purchaseCount >= 3) return "loyal";

  return "none";
}

export function getGroupStats(
  groups: PurchaseGroup[]
): Record<PurchaseGroup, number> {
  const stats = {} as Record<PurchaseGroup, number>;
  (Object.keys(PURCHASE_GROUPS) as PurchaseGroup[]).forEach(g => {
    stats[g] = 0;
  });
  groups.forEach(g => {
    stats[g]++;
  });
  return stats;
}
