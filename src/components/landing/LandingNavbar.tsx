import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Menu, X, Calendar, LogIn, MessageCircle } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface LandingNavbarProps {
  onScrollToForm: () => void;
}

const LandingNavbar = ({ onScrollToForm }: LandingNavbarProps) => {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-10 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-background/70 backdrop-blur-2xl shadow-lg border-b border-primary/10"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-20">
          <a href="/" className="flex items-center gap-2 group">
            <Calendar className="h-6 w-6 md:h-7 md:w-7 text-gold group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-lg md:text-xl font-bold text-foreground">
              Beauty<span className="text-gold">Calendar</span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection("features")} className="relative text-muted-foreground hover:text-foreground transition-colors">
              {t("nav.features")}
              <span className="absolute -top-2 -right-8 text-[10px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full leading-none">
                {t("nav.newBadge")}
              </span>
            </button>
            <button onClick={() => scrollToSection("pricing")} className="text-muted-foreground hover:text-foreground transition-colors">
              {t("nav.pricing")}
            </button>
            <button onClick={() => scrollToSection("demo-preview")} className="text-muted-foreground hover:text-foreground transition-colors">
              {t("nav.demo")}
            </button>
            <button onClick={() => scrollToSection("faq")} className="text-muted-foreground hover:text-foreground transition-colors">
              {t("nav.faq")}
            </button>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            <a
              href="https://admin.beauty-funnels.com/auth"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              <LogIn className="w-4 h-4" />
              {t("nav.login")}
            </a>
            <Button
              onClick={onScrollToForm}
              className="relative overflow-hidden bg-gradient-to-r from-violet-deep to-burgundy hover:opacity-90 text-white shadow-glow hover:shadow-[0_0_40px_hsl(var(--primary)/0.3)] transition-all duration-500 after:absolute after:inset-0 after:translate-x-[-100%] after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent hover:after:translate-x-[100%] after:transition-transform after:duration-700"
            >
              {t("nav.cta")}
            </Button>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher variant="compact" />
            <a
              href="https://wa.me/48500000000"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-emerald-500 hover:text-emerald-400 transition-colors"
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
            <button className="text-foreground p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 px-4 border-t border-border/50 animate-fade-in bg-background/80 backdrop-blur-xl rounded-b-xl">
            <div className="flex flex-col gap-3">
              <button onClick={() => scrollToSection("features")} className="text-left text-muted-foreground hover:text-foreground py-2">
                {t("nav.features")}
              </button>
              <button onClick={() => scrollToSection("pricing")} className="text-left text-muted-foreground hover:text-foreground py-2">
                {t("nav.pricing")}
              </button>
              <button onClick={() => scrollToSection("demo-preview")} className="text-left text-muted-foreground hover:text-foreground py-2">
                {t("nav.demo")}
              </button>
              <button onClick={() => scrollToSection("faq")} className="text-left text-muted-foreground hover:text-foreground py-2">
                {t("nav.faq")}
              </button>
              <a href="https://admin.beauty-funnels.com/auth" className="flex items-center gap-1.5 text-left text-muted-foreground hover:text-foreground py-2 font-medium">
                <LogIn className="w-4 h-4" />
                {t("nav.login")}
              </a>
              <Button
                onClick={() => { onScrollToForm(); setIsMobileMenuOpen(false); }}
                className="relative overflow-hidden bg-gradient-to-r from-violet-deep to-burgundy hover:opacity-90 text-white w-full mt-2 after:absolute after:inset-0 after:translate-x-[-100%] after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent hover:after:translate-x-[100%] after:transition-transform after:duration-700"
              >
                {t("nav.cta")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default LandingNavbar;
