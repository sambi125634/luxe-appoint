import { Link } from "react-router-dom";
import { Instagram, Facebook, Linkedin, Youtube, Heart, Smartphone } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const footerLinks = {
  product: [
    { label: "Funkcje", href: "#features" },
    { label: "Cennik", href: "#pricing" },
    { label: "Demo", href: "#demo-preview" },
    { label: "Roadmap", href: "#", soon: true },
  ],
  company: [
    { label: "O nas", href: "#" },
    { label: "Kontakt", href: "#" },
    { label: "Kariera", href: "#", soon: true },
    { label: "Blog", href: "#", soon: true },
  ],
  resources: [
    { label: "Centrum pomocy", href: "#" },
    { label: "Status systemu", href: "#" },
    { label: "API", href: "#", soon: true },
    { label: "Changelog", href: "#", soon: true },
  ],
  legal: [
    { label: "Regulamin", href: "#" },
    { label: "Polityka prywatności", href: "#" },
    { label: "RODO", href: "#" },
    { label: "Cookies", href: "#" },
  ],
};

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com/beautycalendar", label: "Instagram" },
  { icon: Facebook, href: "https://facebook.com/beautycalendar", label: "Facebook" },
  { icon: Linkedin, href: "https://linkedin.com/company/beautycalendar", label: "LinkedIn" },
  { icon: Youtube, href: "https://youtube.com/@beautycalendar", label: "YouTube" },
];

const FooterLink = ({ link }: { link: { label: string; href: string; soon?: boolean } }) => {
  if (link.soon) {
    return (
      <span className="text-sm text-muted-foreground/50 italic cursor-default">
        {link.label} <span className="text-[10px]">(Wkrótce)</span>
      </span>
    );
  }
  return (
    <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
      {link.label}
    </Link>
  );
};

export const NewLandingFooter = () => {
  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container py-10 md:py-16 px-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 md:gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="inline-block mb-3 md:mb-4">
              <span className="font-serif text-xl md:text-2xl font-bold text-gradient-luxury">Beauty Calendar</span>
            </Link>
            <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">System zarządzania salonem beauty.</p>
            <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">0% prowizji · Made in Poland 🇵🇱</p>

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
                  <Smartphone className="w-3 h-3" />Pobierz aplikację
                </p>
                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="px-3 py-1.5 bg-muted rounded-md text-xs text-muted-foreground/50 cursor-not-allowed">App Store</div>
                    </TooltipTrigger>
                    <TooltipContent>Wkrótce dostępne</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="px-3 py-1.5 bg-muted rounded-md text-xs text-muted-foreground/50 cursor-not-allowed">Google Play</div>
                    </TooltipTrigger>
                    <TooltipContent>Wkrótce dostępne</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </TooltipProvider>
          </div>

          <div>
            <h4 className="font-semibold text-sm md:text-base mb-3 md:mb-4">Produkt</h4>
            <ul className="space-y-2">{footerLinks.product.map((link) => <li key={link.label}><FooterLink link={link} /></li>)}</ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm md:text-base mb-3 md:mb-4">Firma</h4>
            <ul className="space-y-2">{footerLinks.company.map((link) => <li key={link.label}><FooterLink link={link} /></li>)}</ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm md:text-base mb-3 md:mb-4">Zasoby</h4>
            <ul className="space-y-2">{footerLinks.resources.map((link) => <li key={link.label}><FooterLink link={link} /></li>)}</ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm md:text-base mb-3 md:mb-4">Legal</h4>
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
              Made with <Heart className="w-3.5 h-3.5 md:w-4 md:h-4 text-rose-500 fill-rose-500" /> in Poland
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
