import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSalonId } from "@/hooks/useSalonId";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Shield, Cookie, Save, ExternalLink, Trash2, AlertCircle, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";
import { MarkdownEditor } from "./MarkdownEditor";

interface LegalSettingsProps {
  isDemo?: boolean;
}

type DocType = "terms" | "privacy" | "cookies";

const DEFAULT_TEMPLATES: Record<DocType, string> = {
  terms: `# Regulamin świadczenia usług

## §1. Postanowienia ogólne

1. Niniejszy regulamin określa zasady świadczenia usług kosmetycznych w salonie.
2. Korzystanie z usług oznacza akceptację regulaminu.

## §2. Rezerwacja wizyt

1. Rezerwacja możliwa jest online, telefonicznie lub osobiście.
2. Rezerwacja jest wiążąca po jej potwierdzeniu.
3. Anulowanie wizyty wymaga zgłoszenia minimum 24h przed jej terminem.

## §3. Płatności

1. Akceptowane formy płatności: gotówka, karta, BLIK, przelew online.
2. W przypadku rezerwacji z przedpłatą, brak płatności w 15 min od rezerwacji powoduje jej anulowanie.

## §4. Reklamacje

1. Reklamacje można składać w terminie 14 dni od wykonania usługi.
2. Reklamacja powinna być złożona na piśmie lub drogą elektroniczną.

## §5. Postanowienia końcowe

1. Regulamin wchodzi w życie z dniem publikacji.
2. Salon zastrzega sobie prawo do zmiany regulaminu.`,
  privacy: `# Polityka prywatności

## 1. Administrator danych

Administratorem danych osobowych jest **[Nazwa salonu]** z siedzibą w **[adres]**.

## 2. Zakres przetwarzanych danych

Przetwarzamy następujące dane:
- Imię i nazwisko
- Numer telefonu
- Adres email
- Historia wizyt
- Preferencje zabiegowe

## 3. Cel przetwarzania

Dane przetwarzane są w celu:
- Realizacji rezerwacji
- Wysyłki przypomnień o wizytach
- Marketingu własnych usług (za zgodą)
- Realizacji obowiązków prawnych

## 4. Twoje prawa

Masz prawo do:
- **Dostępu** do swoich danych
- **Sprostowania** danych
- **Usunięcia** danych (RODO art. 17)
- **Ograniczenia** przetwarzania
- **Przenoszenia** danych
- Wniesienia **sprzeciwu**

## 5. Okres przechowywania

Dane przechowujemy przez 5 lat od ostatniej wizyty lub do momentu wniesienia żądania usunięcia.

## 6. Kontakt

W sprawach RODO: **[email kontaktowy]**`,
  cookies: `# Polityka cookies

## Czym są pliki cookies?

Cookies to małe pliki tekstowe zapisywane na urządzeniu użytkownika.

## Jakie cookies wykorzystujemy?

### Niezbędne (zawsze aktywne)
Umożliwiają działanie systemu rezerwacji i logowania.

### Analityczne
Pomagają nam zrozumieć, jak klientki korzystają z naszej strony.

### Marketingowe
Umożliwiają wyświetlanie spersonalizowanych reklam (Meta Pixel).

## Jak zmienić ustawienia?

Możesz zarządzać cookies w ustawieniach swojej przeglądarki.`,
};

const DOC_CONFIG: Record<DocType, { label: string; icon: typeof FileText; route: string }> = {
  terms: { label: "Regulamin", icon: FileText, route: "/terms" },
  privacy: { label: "Polityka prywatności", icon: Shield, route: "/privacy" },
  cookies: { label: "Polityka cookies", icon: Cookie, route: "/cookies" },
};

function LegalDocumentEditor({ docType, salonId, slug, isDemo }: { docType: DocType; salonId: string | null; slug: string | null; isDemo: boolean }) {
  const qc = useQueryClient();
  const cfg = DOC_CONFIG[docType];

  const { data: doc, isLoading } = useQuery({
    queryKey: ["legal-doc", salonId, docType],
    queryFn: async () => {
      if (!salonId) return null;
      const { data, error } = await supabase
        .from("salon_legal_documents")
        .select("*")
        .eq("salon_id", salonId)
        .eq("doc_type", docType)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!salonId && !isDemo,
  });

  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    if (doc) {
      setContent(doc.content_md || DEFAULT_TEMPLATES[docType]);
      setIsPublished(!!doc.is_published);
    } else if (!isLoading) {
      setContent(DEFAULT_TEMPLATES[docType]);
      setIsPublished(false);
    }
  }, [doc, isLoading, docType]);

  const saveMutation = useMutation({
    mutationFn: async (publish: boolean) => {
      if (!salonId) throw new Error("Brak salonu");
      const payload = {
        salon_id: salonId,
        doc_type: docType,
        content_md: content,
        is_published: publish,
        published_at: publish ? new Date().toISOString() : null,
        version: (doc?.version || 0) + 1,
      };
      const { error } = await supabase
        .from("salon_legal_documents")
        .upsert(payload, { onConflict: "salon_id,doc_type" });
      if (error) throw error;
    },
    onSuccess: (_, publish) => {
      toast.success(publish ? "Opublikowano dokument" : "Zapisano szkic");
      qc.invalidateQueries({ queryKey: ["legal-doc", salonId, docType] });
    },
    onError: (e: any) => toast.error("Błąd zapisu: " + e.message),
  });

  const publicUrl = slug ? `${window.location.origin}${cfg.route}/${slug}` : null;

  const copyUrl = async () => {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    toast.success("Skopiowano link");
  };

  if (isLoading && !isDemo) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {isPublished ? (
            <Badge className="gap-1"><CheckCircle2 className="w-3 h-3" /> Opublikowany</Badge>
          ) : (
            <Badge variant="outline">Szkic</Badge>
          )}
          {doc?.version && doc.version > 0 && <span className="text-xs text-muted-foreground">v{doc.version}</span>}
        </div>
        {isPublished && publicUrl && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={copyUrl} className="gap-1.5">
              <Copy className="w-3.5 h-3.5" /> Skopiuj link
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={publicUrl} target="_blank" rel="noopener" className="gap-1.5 inline-flex items-center">
                <ExternalLink className="w-3.5 h-3.5" /> Otwórz
              </a>
            </Button>
          </div>
        )}
      </div>

      <MarkdownEditor value={content} onChange={setContent} minHeight={400} />

      <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
        <div className="flex items-center gap-3">
          <Switch checked={isPublished} onCheckedChange={setIsPublished} disabled={isDemo} />
          <div>
            <Label className="text-sm">Publikuj publicznie</Label>
            <p className="text-xs text-muted-foreground">Po publikacji dokument będzie dostępny pod adresem {publicUrl || "/[link]/{slug}"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => saveMutation.mutate(false)} disabled={isDemo || saveMutation.isPending}>
            Zapisz szkic
          </Button>
          <Button onClick={() => saveMutation.mutate(isPublished)} disabled={isDemo || saveMutation.isPending} className="gap-2">
            <Save className="w-4 h-4" />
            {saveMutation.isPending ? "Zapisywanie..." : isPublished ? "Opublikuj" : "Zapisz"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function DeletionRequestsList({ salonId, isDemo }: { salonId: string | null; isDemo: boolean }) {
  const { data: requests, isLoading } = useQuery({
    queryKey: ["deletion-requests", salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data, error } = await (supabase as any)
        .from("deletion_requests")
        .select("*")
        .eq("salon_id", salonId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!salonId && !isDemo,
  });

  if (isLoading) return <Skeleton className="h-32 w-full" />;

  if (!requests || requests.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        Brak aktywnych wniosków o usunięcie danych.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {requests.map((r: any) => (
        <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border">
          <div>
            <div className="font-medium text-sm">{r.email || r.user_id || "Anonim"}</div>
            <div className="text-xs text-muted-foreground">
              Złożono: {new Date(r.created_at).toLocaleDateString("pl-PL")}
              {r.reason && ` · Powód: ${r.reason}`}
            </div>
          </div>
          <Badge variant={r.status === "completed" ? "default" : r.status === "pending" ? "outline" : "secondary"}>
            {r.status === "pending" ? "Oczekuje" : r.status === "completed" ? "Zrealizowano" : r.status}
          </Badge>
        </div>
      ))}
    </div>
  );
}

export function LegalSettings({ isDemo }: LegalSettingsProps) {
  const { salonId } = useSalonId();
  const [tab, setTab] = useState<DocType>("terms");

  const { data: salon } = useQuery({
    queryKey: ["legal-salon-slug", salonId],
    queryFn: async () => {
      if (!salonId) return null;
      const { data, error } = await supabase.from("salons").select("slug").eq("id", salonId).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!salonId && !isDemo,
  });

  const slug = isDemo ? "demo-salon" : salon?.slug || null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Prawne i Konto</h2>
        <p className="text-muted-foreground mt-1">
          Regulamin, polityka prywatności i cookies. Wymagane przez RODO oraz przepisy o świadczeniu usług drogą elektroniczną.
        </p>
      </div>

      {isDemo && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Tryb demo — zmiany nie są zapisywane.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Dokumenty prawne</CardTitle>
          <CardDescription>Edytor Markdown z podglądem na żywo. Po publikacji dokumenty są dostępne pod publicznymi adresami.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as DocType)}>
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              {(Object.entries(DOC_CONFIG) as [DocType, typeof DOC_CONFIG[DocType]][]).map(([key, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <TabsTrigger key={key} value={key} className="gap-1.5">
                    <Icon className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{cfg.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            {(Object.keys(DOC_CONFIG) as DocType[]).map((key) => (
              <TabsContent key={key} value={key} className="mt-6">
                <LegalDocumentEditor docType={key} salonId={salonId} slug={slug} isDemo={!!isDemo} />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Trash2 className="w-5 h-5" /> Wnioski o usunięcie danych (RODO)</CardTitle>
          <CardDescription>
            Lista wniosków od klientek o usunięcie danych. Zgodnie z RODO masz <strong>30 dni</strong> na realizację.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeletionRequestsList salonId={salonId} isDemo={!!isDemo} />
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> Strefa niebezpieczna
          </CardTitle>
          <CardDescription>Trwałe usunięcie salonu i wszystkich danych. Tej operacji nie można cofnąć.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" disabled className="gap-2">
            <Trash2 className="w-4 h-4" /> Usuń salon (kontakt do wsparcia)
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Aby usunąć salon, skontaktuj się ze wsparciem. Wymaga to weryfikacji właściciela.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}