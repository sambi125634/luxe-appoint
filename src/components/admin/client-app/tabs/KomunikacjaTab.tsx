import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { DEMO_SMS_TEMPLATES, DEMO_PUSH_TEMPLATES, DEMO_EMAIL_TEMPLATES, VARIABLES, type MessageTemplate } from "../demo/templatesData";
import { toast } from "sonner";

type Channel = "sms" | "push" | "email";

export function KomunikacjaTab() {
  const [channel, setChannel] = useState<Channel>("sms");
  const [sms, setSms] = useState(DEMO_SMS_TEMPLATES);
  const [push, setPush] = useState(DEMO_PUSH_TEMPLATES);
  const [email, setEmail] = useState(DEMO_EMAIL_TEMPLATES);
  const [expanded, setExpanded] = useState<string | null>(null);

  const channels: { id: Channel; label: string }[] = [
    { id: "sms", label: "📱 SMS" },
    { id: "push", label: "🔔 Push" },
    { id: "email", label: "✉️ Email" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">💬 Centrum komunikacji</h2>
        <p className="text-sm text-muted-foreground mt-1">Wszystko co klientki dostają od Ciebie — w jednym miejscu</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-6 border-b">
        {channels.map((c) => (
          <button
            key={c.id}
            onClick={() => { setChannel(c.id); setExpanded(null); }}
            className={cn(
              "pb-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              channel === c.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Templates list */}
      <div className="space-y-3">
        {channel === "sms" && sms.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            expanded={expanded === t.id}
            onToggleExpand={() => setExpanded(expanded === t.id ? null : t.id)}
            onToggleEnabled={() => setSms(sms.map((x) => x.id === t.id ? { ...x, enabled: !x.enabled } : x))}
            onUpdateBody={(body) => setSms(sms.map((x) => x.id === t.id ? { ...x, body } : x))}
            channel="sms"
          />
        ))}
        {channel === "push" && push.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            expanded={expanded === t.id}
            onToggleExpand={() => setExpanded(expanded === t.id ? null : t.id)}
            onToggleEnabled={() => setPush(push.map((x) => x.id === t.id ? { ...x, enabled: !x.enabled } : x))}
            onUpdateBody={(body) => setPush(push.map((x) => x.id === t.id ? { ...x, body } : x))}
            channel="push"
          />
        ))}
        {channel === "email" && email.map((t) => (
          <EmailCard
            key={t.id}
            template={t}
            expanded={expanded === t.id}
            onToggleExpand={() => setExpanded(expanded === t.id ? null : t.id)}
            onToggleEnabled={() => setEmail(email.map((x) => x.id === t.id ? { ...x, enabled: !x.enabled } : x))}
            onUpdateBody={(body) => setEmail(email.map((x) => x.id === t.id ? { ...x, body } : x))}
            onUpdateSubject={(subject) => setEmail(email.map((x) => x.id === t.id ? { ...x, subject } : x))}
          />
        ))}
      </div>
    </div>
  );
}

function TemplateCard({
  template, expanded, onToggleExpand, onToggleEnabled, onUpdateBody, channel,
}: {
  template: MessageTemplate;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleEnabled: () => void;
  onUpdateBody: (body: string) => void;
  channel: "sms" | "push";
}) {
  const insertVar = (v: string) => {
    onUpdateBody(template.body + " " + v);
  };

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      <div className="flex items-center gap-3 p-3">
        <span className="text-xl">{template.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{template.name}</p>
          <p className="text-xs text-muted-foreground">
            {template.lastSentDays === null ? "Wyłączony" : template.lastSentDays === 0 ? "Ostatnio: dzisiaj" : `Ostatnio wysłany: ${template.lastSentDays} dni temu`}
          </p>
        </div>
        <Switch checked={template.enabled} onCheckedChange={onToggleEnabled} />
        <button onClick={onToggleExpand} className="p-1 hover:bg-muted rounded">
          <ChevronDown className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")} />
        </button>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t"
          >
            <div className="p-3 space-y-3">
              <Textarea
                value={template.body}
                onChange={(e) => onUpdateBody(e.target.value)}
                rows={3}
                className="text-sm"
              />
              <div className="flex flex-wrap gap-1.5">
                {VARIABLES.map((v) => (
                  <button
                    key={v}
                    onClick={() => insertVar(v)}
                    className="text-[10px] px-2 py-1 rounded-full bg-muted hover:bg-primary/10 hover:text-primary font-mono transition-colors"
                  >
                    {v}
                  </button>
                ))}
              </div>
              {/* Preview */}
              <div className="flex gap-2">
                <div className="bg-muted/60 rounded-2xl rounded-bl-sm px-3 py-2 max-w-[80%] text-xs">
                  {channel === "push" && <p className="font-semibold text-xs mb-0.5">📱 Twój Salon</p>}
                  {template.body}
                </div>
              </div>
              <button
                onClick={() => toast.success("✓ Szablon zapisany")}
                className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium"
              >
                Zapisz
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmailCard({
  template, expanded, onToggleExpand, onToggleEnabled, onUpdateBody, onUpdateSubject,
}: {
  template: typeof DEMO_EMAIL_TEMPLATES[number];
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleEnabled: () => void;
  onUpdateBody: (body: string) => void;
  onUpdateSubject: (subject: string) => void;
}) {
  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      <div className="flex items-center gap-3 p-3">
        <span className="text-xl">{template.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{template.name}</p>
          <p className="text-xs text-muted-foreground truncate">Temat: {template.subject}</p>
        </div>
        <Switch checked={template.enabled} onCheckedChange={onToggleEnabled} />
        <button onClick={onToggleExpand} className="p-1 hover:bg-muted rounded">
          <ChevronDown className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")} />
        </button>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t"
          >
            <div className="p-3 space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Temat</label>
                <Input value={template.subject} onChange={(e) => onUpdateSubject(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Treść</label>
                <Textarea value={template.body} onChange={(e) => onUpdateBody(e.target.value)} rows={6} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {VARIABLES.map((v) => (
                  <button key={v} onClick={() => onUpdateBody(template.body + " " + v)}
                    className="text-[10px] px-2 py-1 rounded-full bg-muted hover:bg-primary/10 hover:text-primary font-mono transition-colors">{v}</button>
                ))}
              </div>
              <button onClick={() => toast.success("✓ Szablon zapisany")}
                className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium">Zapisz</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}