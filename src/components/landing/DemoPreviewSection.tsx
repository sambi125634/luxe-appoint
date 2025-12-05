import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, User, Settings } from "lucide-react";

const DemoPreviewSection = () => {
  const [activeTab, setActiveTab] = useState("client");
  
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-violet-deep/5 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Zobacz, jak to działa
          </h2>
          <p className="text-muted-foreground text-lg">
            Przeklikaj demo i przekonaj się, jak prosty może być idealny kalendarz
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger 
                value="client" 
                className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-deep data-[state=active]:to-burgundy data-[state=active]:text-white"
              >
                <User className="w-4 h-4" />
                Widok klientki
              </TabsTrigger>
              <TabsTrigger 
                value="admin"
                className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-deep data-[state=active]:to-burgundy data-[state=active]:text-white"
              >
                <Settings className="w-4 h-4" />
                Panel salonu
              </TabsTrigger>
            </TabsList>
            
            <div className="glass-card-elevated rounded-2xl overflow-hidden border-2 border-gold/20">
              <TabsContent value="client" className="m-0">
                <div className="bg-muted/20 p-2">
                  <div className="flex items-center gap-2 px-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-destructive/60" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                      <div className="w-3 h-3 rounded-full bg-green-500/60" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-background/50 rounded-md px-3 py-1 text-xs text-muted-foreground text-center">
                        beautycalendar.pl/book/twoj-salon
                      </div>
                    </div>
                  </div>
                </div>
                <iframe
                  src="/book/demo-salon"
                  className="w-full h-[500px] border-0"
                  title="Demo - Widok klientki"
                />
              </TabsContent>
              
              <TabsContent value="admin" className="m-0">
                <div className="bg-muted/20 p-2">
                  <div className="flex items-center gap-2 px-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-destructive/60" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                      <div className="w-3 h-3 rounded-full bg-green-500/60" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-background/50 rounded-md px-3 py-1 text-xs text-muted-foreground text-center">
                        beautycalendar.pl/admin
                      </div>
                    </div>
                  </div>
                </div>
                <iframe
                  src="/demo"
                  className="w-full h-[500px] border-0"
                  title="Demo - Panel salonu"
                />
              </TabsContent>
            </div>
          </Tabs>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-violet-deep to-burgundy hover:opacity-90 text-white px-8"
              onClick={() => window.location.href = '/book/demo-salon'}
            >
              Wypróbuj rezerwację
              <Calendar className="ml-2 w-4 h-4" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-violet-deep/30 text-foreground hover:bg-violet-deep/10 px-8"
              onClick={() => window.location.href = '/demo'}
            >
              Zobacz panel salonu
              <Settings className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoPreviewSection;
