import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileModuleWrapperProps {
  title: string;
  children: React.ReactNode;
}

export function MobileModuleWrapper({ title, children }: MobileModuleWrapperProps) {
  const navigate = useNavigate();

  return (
    <div className="pb-20 max-w-lg mx-auto">
      {/* Back header */}
      <div className="px-4 pt-2 pb-3 sticky top-0 z-20 bg-background/95 backdrop-blur-xl flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => navigate("/m/more")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-serif font-bold truncate">{title}</h1>
      </div>
      <div className="px-4 overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
