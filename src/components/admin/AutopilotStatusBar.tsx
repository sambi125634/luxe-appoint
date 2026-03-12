import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Bot, Pause, Play, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AutopilotActionLog } from "./AutopilotActionLog";
import {
  useDemoAutopilotStats,
  useDemoAutopilotActions,
} from "@/hooks/useAutopilot";
import { MOCK_TODAY_STATS } from "@/lib/autopilot-engine";

interface AutopilotStatusBarProps {
  isDemo?: boolean;
}

export function AutopilotStatusBar({ isDemo = false }: AutopilotStatusBarProps) {
  const { t } = useTranslation();
  const [logOpen, setLogOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const { todayStats } = useDemoAutopilotStats();
  const demoActions = useDemoAutopilotActions();

  const stats = isDemo ? todayStats : MOCK_TODAY_STATS;

  if (isPaused) {
    return (
      <>
        <div className="h-10 flex items-center justify-center gap-3 px-4 text-sm text-white"
          style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #4a4a6a 100%)" }}
        >
          <Pause className="w-4 h-4" />
          <span className="font-medium">{t('autopilot.paused')}</span>
          <span className="opacity-70">·</span>
          <span className="opacity-70">{t('autopilot.allPaused')}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs text-white hover:text-white hover:bg-white/20 ml-2 gap-1"
            onClick={() => setIsPaused(false)}
          >
            <Play className="w-3 h-3" />
            {t('autopilot.resume')}
          </Button>
        </div>
        <AutopilotActionLog
          open={logOpen}
          onOpenChange={setLogOpen}
          actions={isDemo ? demoActions : []}
          isDemo={isDemo}
        />
      </>
    );
  }

  return (
    <>
      <div
        className="h-10 flex items-center justify-center gap-3 px-4 text-sm text-white"
        style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #E91E8C 100%)" }}
      >
        <Bot className="w-4 h-4 flex-shrink-0" />
        <span className="font-medium hidden sm:inline">{t('autopilot.active')}</span>
        <span className="opacity-70 hidden sm:inline">·</span>
        <span className="hidden sm:inline">
          {t('autopilot.todayActions', { count: stats.actions_today })}
        </span>
        <span className="opacity-70">·</span>
        <span>
          {t('autopilot.recovered')} <strong>{stats.revenue_today} zł</strong>
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs text-white hover:text-white hover:bg-white/20 gap-1"
          onClick={() => setLogOpen(true)}
        >
          {t('autopilot.viewActions')}
          <ChevronRight className="w-3 h-3" />
        </Button>

        {isDemo && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs text-white/60 hover:text-white hover:bg-white/20 ml-auto hidden md:flex gap-1"
            onClick={() => setIsPaused(true)}
          >
            <Pause className="w-3 h-3" />
            {t('autopilot.pause')}
          </Button>
        )}
      </div>

      <AutopilotActionLog
        open={logOpen}
        onOpenChange={setLogOpen}
        actions={isDemo ? demoActions : []}
        isDemo={isDemo}
      />
    </>
  );
}
