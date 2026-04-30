import { useState } from "react";
import { useGetQuickReference } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Database, HardDrive, Shield, Activity, Terminal, Printer } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function QuickReference() {
  const { data: sections, isLoading } = useGetQuickReference();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSections = sections?.map(section => {
    const query = searchQuery.toLowerCase();
    if (section.title.toLowerCase().includes(query)) return section;
    
    const filteredCards = section.cards.filter(card => 
      card.title.toLowerCase().includes(query) || 
      card.description.toLowerCase().includes(query) ||
      card.syntax.toLowerCase().includes(query)
    );
    
    if (filteredCards.length > 0) {
      return { ...section, cards: filteredCards };
    }
    
    return null;
  }).filter(Boolean) as typeof sections;

  const renderIcon = (iconName: string) => {
    switch(iconName) {
      case 'database': return <Database className="h-5 w-5" />;
      case 'hard-drive': return <HardDrive className="h-5 w-5" />;
      case 'shield': return <Shield className="h-5 w-5" />;
      case 'activity': return <Activity className="h-5 w-5" />;
      default: return <Terminal className="h-5 w-5" />;
    }
  };

  return (
    <div className="container max-w-screen-xl px-4 py-8 mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">DBA Quick Reference</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Essential syntax, diagnostic queries, and cheat sheets for production emergencies.
            No login required.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto shrink-0">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search syntax, commands, topics..." 
              className="pl-10 h-12 bg-card border-border/50 focus-visible:border-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="h-12 px-4 border-border/50 shrink-0 gap-2"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">PDF</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-8">
          <Skeleton className="h-12 w-full max-w-md" />
          <div className="grid gap-6 md:grid-cols-2">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-64 w-full" />)}
          </div>
        </div>
      ) : (
        <Tabs defaultValue={filteredSections?.[0]?.id} className="w-full">
          <ScrollArea className="w-full pb-4">
            <TabsList className="inline-flex h-12 items-center justify-start rounded-lg bg-card/50 p-1 mb-8 w-max">
              {filteredSections?.map(section => (
                <TabsTrigger 
                  key={section.id} 
                  value={section.id}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow"
                >
                  {renderIcon(section.icon)}
                  <span className="ml-2">{section.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>

          {filteredSections?.map(section => (
            <TabsContent key={section.id} value={section.id} className="mt-0 focus-visible:outline-none">
              <div className="grid gap-6 md:grid-cols-2">
                {section.cards.map(card => (
                  <Card key={card.id} className="overflow-hidden border-border/50 bg-card/50 hover:bg-card/80 hover:border-primary/30 transition-colors">
                    <CardHeader className="pb-3 border-b border-border/40 bg-card">
                      <CardTitle className="text-lg">{card.title}</CardTitle>
                      <CardDescription className="text-foreground/70">{card.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="bg-black text-green-400 font-mono text-sm p-4 overflow-x-auto relative group">
                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-white" onClick={() => navigator.clipboard.writeText(card.syntax)}>
                            Copy
                          </Button>
                        </div>
                        <pre className="whitespace-pre-wrap word-break"><code>{card.syntax}</code></pre>
                      </div>
                      {card.example && (
                        <div className="p-4 border-t border-border/40 bg-muted/20 text-sm text-muted-foreground">
                          <strong className="text-foreground font-medium block mb-1">Example usage:</strong>
                          {card.example}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
          
          {filteredSections?.length === 0 && (
            <div className="text-center py-24 bg-card/30 rounded-xl border border-border/40 border-dashed">
              <Terminal className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-medium text-foreground">No reference found</h3>
              <p className="text-muted-foreground mt-2">Try adjusting your search terms.</p>
            </div>
          )}
        </Tabs>
      )}
    </div>
  );
}

// Small workaround for ScrollArea
function ScrollArea({ children, className }: any) {
  return <div className={`overflow-x-auto ${className}`}>{children}</div>;
}