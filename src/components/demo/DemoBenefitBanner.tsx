import { 
  Lightbulb, 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Scissors, 
  UserCheck, 
  Palette,
  CalendarOff,
  BarChart3,
  Settings,
  MessageSquare,
  GitBranch,
  Receipt,
  CheckCircle2,
  type LucideIcon
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface BenefitConfig {
  icon: LucideIcon;
  color: string;
  features: string[];
}

const benefitConfigs: Record<string, BenefitConfig> = {
  home: {
    icon: LayoutDashboard,
    color: "from-blue-500 to-blue-600",
    features: ["todayAppointments", "estimatedRevenue", "alerts"],
  },
  calendar: {
    icon: Calendar,
    color: "from-violet-500 to-violet-600",
    features: ["dragDrop", "weekView", "quickBlocks"],
  },
  clients: {
    icon: Users,
    color: "from-emerald-500 to-emerald-600",
    features: ["visitHistory", "vipTags", "preferences"],
  },
  services: {
    icon: Scissors,
    color: "from-amber-500 to-amber-600",
    features: ["categories", "csvImport", "multimedia"],
  },
  staff: {
    icon: UserCheck,
    color: "from-rose-500 to-rose-600",
    features: ["workSchedule", "assignedServices", "calendarColors"],
  },
  widgets: {
    icon: Palette,
    color: "from-purple-500 to-purple-600",
    features: ["customWidgets", "embedCode", "promotions"],
  },
  timeOff: {
    icon: CalendarOff,
    color: "from-cyan-500 to-cyan-600",
    features: ["vacations", "sickLeave", "autoBlock"],
  },
  stats: {
    icon: BarChart3,
    color: "from-indigo-500 to-indigo-600",
    features: ["topServices", "topStaff", "trends"],
  },
  settings: {
    icon: Settings,
    color: "from-slate-500 to-slate-600",
    features: ["branding", "workingHours", "notifications"],
  },
  conversations: {
    icon: MessageSquare,
    color: "from-green-500 to-green-600",
    features: ["allMessages", "smsEmail", "unified"],
  },
  pipeline: {
    icon: GitBranch,
    color: "from-orange-500 to-orange-600",
    features: ["clientJourney", "returnTracking", "attention"],
  },
  accounting: {
    icon: Receipt,
    color: "from-red-500 to-red-600",
    features: ["dailyReports", "commissions", "vatReady"],
  },
  products: {
    icon: Scissors,
    color: "from-teal-500 to-teal-600",
    features: ["stockAlerts", "suppliers", "salesReports"],
  },
};

interface DemoBenefitBannerProps {
  benefitKey: string;
}

export function DemoBenefitBanner({ benefitKey }: DemoBenefitBannerProps) {
  const { t } = useTranslation();
  
  const config = benefitConfigs[benefitKey] || {
    icon: Lightbulb,
    color: "from-primary to-primary/70",
    features: [],
  };
  
  const Icon = config.icon;
  
  return (
    <div className="mb-6 p-5 bg-gradient-to-r from-card to-muted/30 border border-border rounded-2xl animate-fade-in shadow-soft">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg",
          `bg-gradient-to-br ${config.color}`
        )}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-primary" />
            <p className="font-semibold text-sm text-primary">
              {t("demo.benefits.forYou")}
            </p>
          </div>
          
          <p className="text-foreground leading-relaxed mb-3">
            {t(`demo.benefits.${benefitKey}`)}
          </p>
          
          {/* Feature tags */}
          {config.features.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {config.features.map((feature, index) => (
                <span 
                  key={feature}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
                    "bg-primary/10 text-primary",
                    "animate-fade-in"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {t(`demo.benefits.features.${benefitKey}.${feature}`)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
