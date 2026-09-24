import { Link, useLocation } from "wouter";
import { Show, useClerk, useUser } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Database, BookOpen, Settings, LogOut, Menu, Newspaper, ClipboardList, MonitorCog } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useGetUserProfile } from "@workspace/api-client-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useUser();
  const { data: profile } = useGetUserProfile({ query: { enabled: !!user } });

  const navItems = [
    { href: "/modules", label: "Training Modules", icon: Database },
    { href: "/quick-reference", label: "Quick Reference", icon: BookOpen },
    { href: "/practice-test", label: "Practice Test", icon: ClipboardList },
    { href: "/simulator", label: "Workday Simulator", icon: MonitorCog },
    { href: "/blog", label: "Guides", icon: Newspaper },
  ];

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground dark">
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center px-4 md:px-8 mx-auto">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Database className="h-6 w-6 text-primary" />
              <span className="hidden font-bold sm:inline-block tracking-tight text-lg text-primary-foreground">
                DBA FORGE
              </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition-colors hover:text-foreground/80 ${
                    location.startsWith(item.href) ? "text-foreground" : "text-foreground/60"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0 border-r-border/40 bg-card">
              <div className="px-7">
                <Link href="/" onClick={closeMenu} className="flex items-center space-x-2">
                  <Database className="h-6 w-6 text-primary" />
                  <span className="font-bold text-lg text-primary-foreground tracking-tight">DBA FORGE</span>
                </Link>
              </div>
              <div className="flex flex-col space-y-3 mt-8 px-7">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className={`flex items-center text-sm font-medium ${
                      location.startsWith(item.href) ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              {/* Search or command palette placeholder */}
            </div>
            <nav className="flex items-center space-x-2">
              <Show when="signed-in">
                {profile?.isPremium && (
                  <div className="hidden md:flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mr-2">
                    PRO
                  </div>
                )}
                <Link href="/settings">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Settings</span>
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => signOut()} className="text-muted-foreground hover:text-foreground">
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Sign out</span>
                </Button>
              </Show>
              <Show when="signed-out">
                <div className="flex gap-2">
                  <Link href="/sign-in">
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground">Sign In</Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button variant="default" className="bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
                      Start Forging
                    </Button>
                  </Link>
                </div>
              </Show>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col w-full">{children}</main>
    </div>
  );
}
