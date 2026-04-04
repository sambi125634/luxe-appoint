import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { label: "Funkcje", id: "game-changers" },
    { label: "Cennik", id: "pricing" },
    { label: "Demo", id: "demo-preview" },
    { label: "FAQ", id: "faq" },
  ];

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: isScrolled ? "rgba(0,0,0,0.72)" : "transparent",
          backdropFilter: isScrolled ? "saturate(180%) blur(20px)" : "none",
          WebkitBackdropFilter: isScrolled ? "saturate(180%) blur(20px)" : "none",
          borderBottom: isScrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
        }}
      >
        <div className="max-w-[1200px] mx-auto px-[max(24px,5vw)]">
          <div className="flex items-center justify-between h-12">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 group">
              <span className="text-sm font-bold" style={{ color: "#f5f5f7", fontFamily: "'Inter', sans-serif" }}>
                Beauty<span className="apple-accent-gradient">Calendar</span>
              </span>
            </a>

            {/* Links — desktop */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="text-[13px] transition-colors"
                  style={{ color: "rgba(245,245,247,0.6)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#f5f5f7")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(245,245,247,0.6)")}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-4">
              <LanguageSwitcher />
              <a
                href="https://admin.beauty-funnels.com/auth"
                className="text-[13px] font-medium transition-colors flex items-center gap-1.5"
                style={{ color: "rgba(245,245,247,0.6)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#f5f5f7")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(245,245,247,0.6)")}
              >
                <LogIn className="w-3.5 h-3.5" />
                Zaloguj się
              </a>
              <button
                onClick={onScrollToForm}
                className="text-[13px] font-medium px-4 py-1.5 rounded-full transition-all"
                style={{ background: "#f5f5f7", color: "#1d1d1f" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(245,245,247,0.85)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#f5f5f7")}
              >
                Zacznij za darmo
              </button>
            </div>

            {/* Mobile */}
            <div className="md:hidden flex items-center gap-2">
              <LanguageSwitcher variant="compact" />
              <a
                href="https://wa.me/48500000000"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-emerald-400"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
              <button className="p-2" style={{ color: "#f5f5f7" }} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden py-4 animate-fade-in rounded-b-xl" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className="text-left py-2 text-sm"
                    style={{ color: "rgba(245,245,247,0.6)" }}
                  >
                    {link.label}
                  </button>
                ))}
                <a href="https://admin.beauty-funnels.com/auth" className="flex items-center gap-1.5 py-2 text-sm font-medium" style={{ color: "rgba(245,245,247,0.6)" }}>
                  <LogIn className="w-4 h-4" />
                  Zaloguj się
                </a>
                <button
                  onClick={() => { onScrollToForm(); setIsMobileMenuOpen(false); }}
                  className="apple-btn-primary w-full text-sm mt-2"
                >
                  Zacznij za darmo
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
      {/* No spacer — hero is full screen with absolute positioning */}
    </>
  );
};

export default LandingNavbar;