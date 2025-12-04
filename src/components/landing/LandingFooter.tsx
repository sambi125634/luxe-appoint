import { useTranslation } from "react-i18next";
import { Calendar, Heart } from "lucide-react";

const LandingFooter = () => {
  const { t } = useTranslation();

  return (
    <footer className="py-12 bg-muted/50 border-t border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-gold" />
            <span className="text-lg font-bold text-foreground">
              Beauty<span className="text-gold">Calendar</span>
            </span>
          </div>
          
          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              {t("footer.privacy")}
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              {t("footer.terms")}
            </a>
          </div>
          
          {/* Copyright */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>© 2024 Beauty Calendar.</span>
            <span className="hidden sm:inline">{t("footer.rights")}</span>
            <Heart className="w-3 h-3 text-burgundy mx-1 hidden sm:inline" />
            <span className="hidden sm:inline font-medium text-foreground">Beauty Funnels</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
