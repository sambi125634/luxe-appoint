import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Eye, Pencil } from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: number;
}

/**
 * Lightweight markdown editor — no external deps.
 * Renders a minimal preview (headings, paragraphs, lists, bold/italic, links).
 */
function renderMarkdown(md: string): string {
  if (!md) return "<p class='text-muted-foreground italic'>Brak treści. Zacznij pisać, aby zobaczyć podgląd.</p>";
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const lines = md.split("\n");
  const html: string[] = [];
  let inList = false;
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^### /.test(line)) {
      if (inList) { html.push("</ul>"); inList = false; }
      html.push(`<h3 class="text-lg font-semibold mt-4 mb-2">${escape(line.slice(4))}</h3>`);
    } else if (/^## /.test(line)) {
      if (inList) { html.push("</ul>"); inList = false; }
      html.push(`<h2 class="text-xl font-bold mt-6 mb-3">${escape(line.slice(3))}</h2>`);
    } else if (/^# /.test(line)) {
      if (inList) { html.push("</ul>"); inList = false; }
      html.push(`<h1 class="text-2xl font-bold mt-6 mb-4">${escape(line.slice(2))}</h1>`);
    } else if (/^[-*] /.test(line)) {
      if (!inList) { html.push("<ul class='list-disc pl-6 space-y-1 my-2'>"); inList = true; }
      html.push(`<li>${formatInline(escape(line.slice(2)))}</li>`);
    } else if (line.trim() === "") {
      if (inList) { html.push("</ul>"); inList = false; }
      html.push("<br />");
    } else {
      if (inList) { html.push("</ul>"); inList = false; }
      html.push(`<p class="leading-relaxed my-2">${formatInline(escape(line))}</p>`);
    }
  }
  if (inList) html.push("</ul>");
  return html.join("\n");
}

function formatInline(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-primary underline">$1</a>');
}

export function MarkdownEditor({ value, onChange, placeholder, minHeight = 320 }: MarkdownEditorProps) {
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as "edit" | "preview")} className="w-full">
      <TabsList className="grid w-full grid-cols-2 max-w-[280px]">
        <TabsTrigger value="edit" className="gap-2"><Pencil className="w-3.5 h-3.5" /> Edycja</TabsTrigger>
        <TabsTrigger value="preview" className="gap-2"><Eye className="w-3.5 h-3.5" /> Podgląd</TabsTrigger>
      </TabsList>
      <TabsContent value="edit" className="mt-3">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Wpisz treść w formacie Markdown (np. # Nagłówek, **pogrubienie**, - lista)"}
          style={{ minHeight }}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Obsługiwane: <code>#</code> nagłówki, <code>**pogrubienie**</code>, <code>*kursywa*</code>, <code>- listy</code>, <code>[link](url)</code>
        </p>
      </TabsContent>
      <TabsContent value="preview" className="mt-3">
        <div
          className="border rounded-lg p-6 bg-card prose-sm max-w-none"
          style={{ minHeight }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
        />
      </TabsContent>
    </Tabs>
  );
}

export { renderMarkdown };