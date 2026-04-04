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
      <span className="text-[13px] italic cursor-default" style={{ color: "rgba(245,245,247,0.2)" }}>
        {link.label} <span className="text-[10px]">(Wkrótce)</span>
      </span>
    );
  }
  return (
    <Link to={link.href} className="text-[13px] transition-colors" style={{ color: "rgba(245,245,247,0.4)" }} onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(245,245,247,0.8)")} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(245,245,247,0.4)")}>
      {link.label}
    </Link>
  );
};

export const NewLandingFooter = () => {
  return (
    <footer style={{ background: "#000", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="max-w-[1200px] mx-auto px-[max(24px,5vw)] py-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
          <div className="col-span-2">
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-bold apple-accent-gradient" style={{ fontFamily: "'Playfair Display', serif" }}>Beauty Calendar</span>
            </Link>
            <p className="text-[13px] mb-2" style={{ color: "rgba(245,245,247,0.4)" }}>System zarządzania salonem beauty.</p>
            <p className="text-[13px] mb-4" style={{ color: "rgba(245,245,247,0.3)" }}>0% prowizji · Made in Poland 🇵🇱</p>

            <div className="flex gap-3 mb-6">
              {socialLinks.map((social) => (
                <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full flex items-center justify-center transition-colors" style={{ background: "rgba(255,255,255,0.04)", color: "rgba(245,245,247,0.4)" }} aria-label={social.label}>
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            <TooltipProvider>
              <div className="space-y-2">
                <p className="text-xs font-medium flex items-center gap-1" style={{ color: "rgba(245,245,247,0.3)" }}>
                  <Smartphone className="w-3 h-3" />Pobierz aplikację
                </p>
                <div className="flex gap-2">
                  {["App Store", "Google Play"].map((store) => (
                    <Tooltip key={store}>
                      <TooltipTrigger asChild>
                        <div className="px-3 py-1.5 rounded-md text-xs cursor-not-allowed" style={{ background: "rgba(255,255,255,0.04)", color: "rgba(245,245,247,0.2)" }}>{store}</div>
                      </TooltipTrigger>
                      <TooltipContent>Wkrótce dostępne</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </TooltipProvider>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[13px]" style={{ color: "rgba(245,245,247,0.7)", fontFamily: "'Inter', sans-serif" }}>Produkt</h4>
            <ul className="space-y-2">{footerLinks.product.map((link) => <li key={link.label}><FooterLink link={link} /></li>)}</ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-[13px]" style={{ color: "rgba(245,245,247,0.7)", fontFamily: "'Inter', sans-serif" }}>Firma</h4>
            <ul className="space-y-2">{footerLinks.company.map((link) => <li key={link.label}><FooterLink link={link} /></li>)}</ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-[13px]" style={{ color: "rgba(245,245,247,0.7)", fontFamily: "'Inter', sans-serif" }}>Zasoby</h4>
            <ul className="space-y-2">{footerLinks.resources.map((link) => <li key={link.label}><FooterLink link={link} /></li>)}</ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-[13px]" style={{ color: "rgba(245,245,247,0.7)", fontFamily: "'Inter', sans-serif" }}>Legal</h4>
            <ul className="space-y-2">{footerLinks.legal.map((link) => <li key={link.label}><FooterLink link={link} /></li>)}</ul>
          </div>
        </div>

        <div className="mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[13px]" style={{ color: "rgba(245,245,247,0.2)" }}>
            © {new Date().getFullYear()} Beauty Calendar · beauty-funnels.com · Wszystkie prawa zastrzeżone
          </p>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <span className="text-[13px] flex items-center gap-1" style={{ color: "rgba(245,245,247,0.3)" }}>
              Made with <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> in Poland
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};