import { Link } from "react-router-dom";
import { Instagram, Facebook, Linkedin, Youtube, Heart, Smartphone } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const footerLinks = {
  product: [
    { label: "Funkcje", href: "#features" },
    { label: "Cennik", href: "#pricing" },
    { label: "Demo", href: "/demo" },
    { label: "Roadmap", href: "#", soon: true },
  ],
  company: [
    { label: "O nas", href: "#" },
    { label: "Kariera", href: "#", soon: true },
    { label: "Blog", href: "#", soon: true },
    { label: "Kontakt", href: "#" },
  ],
  resources: [
    { label: "Centrum pomocy", href: "#" },
    { label: "API Documentation", href: "#", soon: true },
    { label: "Status systemu", href: "#" },
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
    <Link
      to={link.href}
      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      {link.label}
    </Link>
  );
};

export const NewLandingFooter = () => {
  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2">
            <Link to="/" className="inline-block mb-4">
              <span className="font-serif text-2xl font-bold text-gradient-luxury">
                Beauty Calendar
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-2">
              System zarządzania salonem beauty.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              163 funkcje · 0% prowizji · Made in Poland 🇵🇱
            </p>

            {/* Social links */}
            <div className="flex gap-3 mb-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            {/* App download - coming soon */}
            <TooltipProvider>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Smartphone className="w-3 h-3" />
                  Pobierz aplikację
                </p>
                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="px-3 py-1.5 bg-muted rounded-md text-xs text-muted-foreground/50 cursor-not-allowed">
                        App Store
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Wkrótce dostępne</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="px-3 py-1.5 bg-muted rounded-md text-xs text-muted-foreground/50 cursor-not-allowed">
                        Google Play
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Wkrótce dostępne</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </TooltipProvider>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Produkt</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.label}><FooterLink link={link} /></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Firma</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}><FooterLink link={link} /></li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Zasoby</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.label}><FooterLink link={link} /></li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}><FooterLink link={link} /></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Beauty Calendar · beauty-funnels.com · Wszystkie prawa zastrzeżone
          </p>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> in Poland
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};