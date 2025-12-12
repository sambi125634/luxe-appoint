import { Copy, ExternalLink, Palette, Settings } from "lucide-react";

const WidgetsMockup = () => {
  const widgets = [
    { name: "Główny kalendarz", slug: "/s/twoj-salon", visits: "1,234", color: "from-violet-deep to-burgundy" },
    { name: "Black Friday -20%", slug: "/s/black-friday", visits: "456", color: "from-burgundy to-gold" },
    { name: "Pakiet VIP", slug: "/s/vip-package", visits: "89", color: "from-gold to-emerald-500" },
  ];

  return (
    <div className="p-4 h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Twoje widgety</h3>
        <button className="px-3 py-1 text-xs bg-gradient-to-r from-violet-deep to-burgundy text-white rounded-lg animate-pulse">
          + Nowy widget
        </button>
      </div>

      {/* Widget Cards */}
      <div className="space-y-3">
        {widgets.map((widget, i) => (
          <div 
            key={i} 
            className="glass-card rounded-xl p-3 animate-fade-in"
            style={{ animationDelay: `${i * 150}ms` }}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className={`text-sm font-semibold bg-gradient-to-r ${widget.color} bg-clip-text text-transparent`}>
                  {widget.name}
                </div>
                <div className="text-xs text-muted-foreground font-mono">{widget.slug}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-foreground">{widget.visits}</div>
                <div className="text-xs text-muted-foreground">wizyt</div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-muted/50 hover:bg-muted rounded-lg text-xs text-foreground transition-colors">
                <Copy className="w-3 h-3" />
                Embed
              </button>
              <button className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-muted/50 hover:bg-muted rounded-lg text-xs text-foreground transition-colors">
                <Palette className="w-3 h-3" />
                Styl
              </button>
              <button className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-muted/50 hover:bg-muted rounded-lg text-xs text-foreground transition-colors">
                <Settings className="w-3 h-3" />
                Edytuj
              </button>
              <button className="px-2 py-1.5 bg-violet-deep/20 hover:bg-violet-deep/30 rounded-lg text-xs text-violet-deep transition-colors">
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Embed Code Preview */}
      <div 
        className="glass-card rounded-xl p-3 mt-3 animate-fade-in"
        style={{ animationDelay: '450ms' }}
      >
        <div className="text-xs text-muted-foreground mb-1">Kod embed:</div>
        <div className="bg-muted/50 rounded-lg p-2 font-mono text-[10px] text-foreground/70 overflow-hidden">
          {'<iframe src="beautycalendar.pl/s/twoj-salon" ...'}
        </div>
      </div>
    </div>
  );
};

export default WidgetsMockup;
