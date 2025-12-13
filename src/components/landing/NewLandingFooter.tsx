import { Link } from "react-router-dom";
import { Instagram, Facebook, Linkedin, Youtube, Heart } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const footerLinks = {
  product: [
    { label: "Funkcje", href: "#features" },
    { label: "Cennik", href: "#pricing" },
    { label: "Demo", href: "/demo" },
    { label: "Roadmap", href: "#" },
  ],
  company: [
    { label: "O nas", href: "#" },
    { label: "Kariera", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Kontakt", href: "#" },
  ],
  resources: [
    { label: "Centrum pomocy", href: "#" },
    { label: "API Documentation", href: "#" },
    { label: "Status systemu", href: "#" },
    { label: "Changelog", href: "#" },
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

export const NewLandingFooter = () => {
  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="font-serif text-2xl font-bold text-gradient-luxury">
                Beauty Calendar
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Pierwszy kalendarz rezerwacji z AI dla salonów beauty.
            </p>
            
            {/* Social links */}
            <div className="flex gap-3">
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
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Produkt</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Firma</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Zasoby</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 Beauty Calendar by Beauty Funnels. Wszystkie prawa zastrzeżone.
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
