import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Menu, X, Calendar } from "lucide-react";
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-background/90 backdrop-blur-lg shadow-lg border-b border-border/50" 
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <Calendar className="h-7 w-7 text-gold" />
            <span className="text-xl font-bold text-foreground">
              Beauty<span className="text-gold">Calendar</span>
            </span>
          </a>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection("features")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("nav.features")}
            </button>
            <button 
              onClick={() => scrollToSection("pricing")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Cennik
            </button>
            <button 
              onClick={() => scrollToSection("demo-preview")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("nav.demo")}
            </button>
            <button 
              onClick={() => scrollToSection("faq")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("nav.faq")}
            </button>
          </div>
          
          {/* CTA + Language Switcher */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            <a
              href="https://admin.beauty-funnels.com/auth"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Panel klienta
            </a>
            <Button 
              onClick={onScrollToForm}
              className="bg-gradient-to-r from-violet-deep to-burgundy hover:opacity-90 text-white"
            >
              {t("nav.bookDemo")}
            </Button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher variant="compact" />
            <button 
              className="text-foreground p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => scrollToSection("features")}
                className="text-left text-muted-foreground hover:text-foreground py-2"
              >
                {t("nav.features")}
              </button>
              <button 
                onClick={() => scrollToSection("pricing")}
                className="text-left text-muted-foreground hover:text-foreground py-2"
              >
                Cennik
              </button>
              <button 
                onClick={() => scrollToSection("demo-preview")}
                className="text-left text-muted-foreground hover:text-foreground py-2"
              >
                {t("nav.demo")}
              </button>
              <button 
                onClick={() => scrollToSection("faq")}
                className="text-left text-muted-foreground hover:text-foreground py-2"
              >
                {t("nav.faq")}
              </button>
              <a
                href="https://admin.beauty-funnels.com/auth"
                className="text-left text-muted-foreground hover:text-foreground py-2 font-medium"
              >
                Panel klienta
              </a>
              <Button 
                onClick={() => {
                  onScrollToForm();
                  setIsMobileMenuOpen(false);
                }}
                className="bg-gradient-to-r from-violet-deep to-burgundy hover:opacity-90 text-white w-full mt-2"
              >
                {t("nav.bookDemo")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default LandingNavbar;
