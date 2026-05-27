import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { renderMarkdown } from "@/components/admin/settings/MarkdownEditor";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

interface LegalDocumentPageProps {
  docType: "terms" | "privacy" | "cookies";
}

const DOC_TITLES = {
  terms: "Regulamin",
  privacy: "Polityka prywatności",
  cookies: "Polityka cookies",
};

export default function LegalDocumentPage({ docType }: LegalDocumentPageProps) {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["public-legal-doc", slug, docType],
    queryFn: async () => {
      if (!slug) return null;
      const { data: salon } = await supabase
        .from("salons")
        .select("id, name")
        .eq("slug", slug)
        .maybeSingle();
      if (!salon) return null;

      const { data: doc } = await supabase
        .from("salon_legal_documents")
        .select("content_md, published_at, is_published")
        .eq("salon_id", salon.id)
        .eq("doc_type", docType)
        .eq("is_published", true)
        .maybeSingle();

      return { salon, doc };
    },
  });

  useEffect(() => {
    document.title = `${DOC_TITLES[docType]} – ${data?.salon?.name || "Beauty Calendar"}`;
  }, [data, docType]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data?.salon) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">Salon nie znaleziony</h1>
          <p className="text-muted-foreground">Sprawdź poprawność adresu.</p>
        </div>
      </div>
    );
  }

  if (!data.doc) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">{DOC_TITLES[docType]}</h1>
          <p className="text-muted-foreground">
            Salon <strong>{data.salon.name}</strong> nie opublikował jeszcze tego dokumentu.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <article className="max-w-3xl mx-auto bg-card rounded-2xl p-8 md:p-12 shadow-sm border">
        <header className="mb-8 pb-6 border-b">
          <div className="text-sm text-muted-foreground mb-1">{data.salon.name}</div>
          <h1 className="text-3xl font-bold tracking-tight">{DOC_TITLES[docType]}</h1>
          {data.doc.published_at && (
            <p className="text-xs text-muted-foreground mt-2">
              Obowiązuje od: {new Date(data.doc.published_at).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
        </header>
        <div
          className="prose prose-sm md:prose-base max-w-none"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(data.doc.content_md) }}
        />
      </article>
    </div>
  );
}