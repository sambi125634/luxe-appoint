import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Linkedin, Youtube, Heart, Smartphone } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com/beautycalendar", label: "Instagram" },
  { icon: Facebook, href: "https://facebook.com/beautycalendar", label: "Facebook" },
  { icon: Linkedin, href: "https://linkedin.com/company/beautycalendar", label: "LinkedIn" },
  { icon: Youtube, href: "https://youtube.com/@beautycalendar", label: "YouTube" },
];

export const NewLandingFooter = () => {
  const { t } = useTranslation();

  const footerLinks = {
    product: [
      { label: t("landing.footer.features"), href: "#features" },
      { label: t("landing.footer.pricing"), href: "#pricing" },
      { label: t("landing.footer.demo"), href: "#demo-preview" },
      { label: t("landing.footer.roadmap"), href: "#", soon: true },
    ],
    company: [
      { label: t("landing.footer.about"), href: "#" },
      { label: t("landing.footer.contact"), href: "#" },
      { label: t("landing.footer.careers"), href: "#", soon: true },
      { label: t("landing.footer.blog"), href: "#", soon: true },
    ],
    resources: [
      { label: t("landing.footer.helpCenter"), href: "#" },
      { label: t("landing.footer.systemStatus"), href: "#" },
      { label: t("landing.footer.api"), href: "#", soon: true },
      { label: t("landing.footer.changelog"), href: "#", soon: true },
    ],
    legal: [
      { label: t("landing.footer.terms"), href: "#" },
      { label: t("landing.footer.privacy"), href: "#" },
      { label: t("landing.footer.gdpr"), href: "#" },
      { label: t("landing.footer.cookies"), href: "#" },
    ],
  };

  const FooterLink = ({ link }: { link: { label: string; href: string; soon?: boolean } }) => {
    if (link.soon) {
      return (
        <span className="text-sm text-muted-foreground/50 italic cursor-default">
          {link.label} <span className="text-[10px]">({t("landing.footer.comingSoon")})</span>
        </span>
      );
    }
    return (
      <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        {link.label}
      </Link>
    );
  };

  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container py-10 md:py-16 px-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 md:gap-8 lg:gap-12">
          <div className="col-span-2">
            <Link to="/" className="inline-block mb-3 md:mb-4">
              <span className="font-serif text-xl md:text-2xl font-bold text-gradient-luxury">Beauty Calendar</span>
            </Link>
            <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">{t("landing.footer.tagline")}</p>
            <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">{t("landing.footer.tagline2")}</p>

            <div className="flex gap-2 md:gap-3 mb-4 md:mb-6">
              {socialLinks.map((social) => (
                <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors" aria-label={social.label}>
                  <social.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </a>
              ))}
            </div>

            <TooltipProvider>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Smartphone className="w-3 h-3" />{t("landing.footer.downloadApp")}
                </p>
                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="px-3 py-1.5 bg-muted rounded-md text-xs text-muted-foreground/50 cursor-not-allowed">App Store</div>
                    </TooltipTrigger>
                    <TooltipContent>{t("landing.footer.comingSoonAvailable")}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="px-3 py-1.5 bg-muted rounded-md text-xs text-muted-foreground/50 cursor-not-allowed">Google Play</div>
                    </TooltipTrigger>
                    <TooltipContent>{t("landing.footer.comingSoonAvailable")}</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </TooltipProvider>
          </div>

          <div>
            <h4 className="font-semibold text-sm md:text-base mb-3 md:mb-4">{t("landing.footer.product")}</h4>
            <ul className="space-y-2">{footerLinks.product.map((link) => <li key={link.label}><FooterLink link={link} /></li>)}</ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm md:text-base mb-3 md:mb-4">{t("landing.footer.company")}</h4>
            <ul className="space-y-2">{footerLinks.company.map((link) => <li key={link.label}><FooterLink link={link} /></li>)}</ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm md:text-base mb-3 md:mb-4">{t("landing.footer.resources")}</h4>
            <ul className="space-y-2">{footerLinks.resources.map((link) => <li key={link.label}><FooterLink link={link} /></li>)}</ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm md:text-base mb-3 md:mb-4">{t("landing.footer.legal")}</h4>
            <ul className="space-y-2">{footerLinks.legal.map((link) => <li key={link.label}><FooterLink link={link} /></li>)}</ul>
          </div>
        </div>

        <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
          <p className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} Beauty Calendar · beauty-funnels.com
          </p>
          <div className="flex items-center gap-3 md:gap-4">
            <LanguageSwitcher />
            <span className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
              {t("landing.footer.madeWith")} <Heart className="w-3.5 h-3.5 md:w-4 md:h-4 text-rose-500 fill-rose-500" /> {t("landing.footer.inPoland")}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
