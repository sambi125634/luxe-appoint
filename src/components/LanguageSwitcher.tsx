import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'default' | 'compact';
}

const LanguageSwitcher = ({ className, variant = 'default' }: LanguageSwitcherProps) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const toggleLanguage = () => {
    const newLang = currentLang === 'pl' ? 'en' : 'pl';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className={cn(
        "relative inline-flex items-center rounded-full transition-all duration-300",
        variant === 'default' 
          ? "h-8 w-16 bg-muted border border-border hover:border-primary/50" 
          : "h-7 w-14 bg-muted/50 border border-border/50",
        className
      )}
      aria-label="Toggle language"
    >
      {/* Sliding indicator */}
      <span
        className={cn(
          "absolute top-0.5 rounded-full bg-primary shadow-sm transition-all duration-300 flex items-center justify-center text-primary-foreground font-medium",
          variant === 'default' 
            ? "h-6 w-7 text-xs" 
            : "h-5 w-6 text-[10px]",
          currentLang === 'pl' ? "left-0.5" : "left-[calc(100%-1.875rem)]"
        )}
      >
        {currentLang.toUpperCase()}
      </span>
      
      {/* Labels */}
      <span 
        className={cn(
          "absolute left-2 font-medium transition-opacity",
          variant === 'default' ? "text-xs" : "text-[10px]",
          currentLang === 'pl' ? "opacity-0" : "opacity-50 text-muted-foreground"
        )}
      >
        PL
      </span>
      <span 
        className={cn(
          "absolute right-2 font-medium transition-opacity",
          variant === 'default' ? "text-xs" : "text-[10px]",
          currentLang === 'en' ? "opacity-0" : "opacity-50 text-muted-foreground"
        )}
      >
        EN
      </span>
    </button>
  );
};

export default LanguageSwitcher;
