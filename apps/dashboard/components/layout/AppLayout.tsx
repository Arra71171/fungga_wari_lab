"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { useClerk } from "@clerk/nextjs";
import { 
  BookOpen, 
  Image as ImageIcon, 
  KanbanSquare, 
  MessageSquare, 
  LogOut,
  Settings,
  Menu,
  X
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { ThemeToggle } from "@/components/theme-toggle";

interface AppLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { name: "Stories", href: "/stories", icon: BookOpen },
  { name: "Asset Vault", href: "/assets", icon: ImageIcon },
  { name: "Team Tasks", href: "/tasks", icon: KanbanSquare },
];

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useClerk();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-background" />; // loading state
  }

  const handleSignOut = async () => {
    await signOut({ redirectUrl: "/login" });
  };

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row bg-background text-foreground antialiased selection:bg-primary/30">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="size-5 rounded-none bg-gradient-to-tr from-primary to-brand-ember" />
          <span className="font-heading font-medium">Team Portal</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-40 h-screen w-64 flex flex-col border-r border-border/40 bg-secondary/20 backdrop-blur-xl transition-transform duration-300
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="p-6 pb-2 hidden md:flex items-center gap-2">
          <div className="size-6 rounded-none bg-gradient-to-tr from-primary to-brand-ember shadow-sm shadow-brand-ember/30" />
          <h2 className="font-heading text-xl font-bold tracking-tight">
            Fungga <span className="text-primary opacity-80">Team</span>
          </h2>
        </div>

        <nav className="flex-1 space-y-1 p-4 mt-4 md:mt-6 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-none transition-all font-medium text-sm ${
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className={`size-4 ${isActive ? "text-primary" : "opacity-70"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/40 space-y-2 pb-6">
          <div className="flex items-center justify-between px-4 py-2 border border-border/50 rounded-none bg-secondary/10 mb-4">
            <span className="text-xs font-mono text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 px-4 py-3 h-auto text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            onClick={handleSignOut}
          >
            <LogOut className="size-4 opacity-70" />
            <span className="text-sm">Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-background relative z-0">
        {/* Subtle top amber glow for atmosphere */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="flex-1 p-6 md:p-10 z-10 overflow-y-auto">
          {children}
        </div>
      </main>
      
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
