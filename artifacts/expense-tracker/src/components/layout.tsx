import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  ArrowUpRight,
  ArrowDownRight,
  ReceiptText,
  TrendingUp,
  Bot,
  FileBarChart,
  Settings,
  WalletCards,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/user-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { user, signOut } = useUser();

  const navItems = [
    { name: "Overview", path: "/", icon: LayoutDashboard },
    { name: "Money In", path: "/money-in", icon: ArrowUpRight },
    { name: "Money Out", path: "/money-out", icon: ArrowDownRight },
    { name: "Receipts", path: "/receipts", icon: ReceiptText },
    { name: "Loss / Profit", path: "/profit-loss", icon: TrendingUp },
    { name: "AI Advisor", path: "/advisor", icon: Bot },
    { name: "Account Statement", path: "/statement", icon: FileBarChart },
  ];

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-sidebar border-b md:border-b-0 md:border-r border-sidebar-border flex-shrink-0 flex flex-col">
        <div className="p-6 flex items-center gap-3 text-sidebar-foreground">
          <div className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
            <WalletCards className="w-4 h-4" />
          </div>
          <span className="font-bold text-lg tracking-tight">Ledger</span>
        </div>
        <nav className="px-4 pb-4 space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover-elevate",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border space-y-1">
          <Link href="/settings">
            <div className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer hover-elevate",
              location === "/settings"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}>
              <Settings className="w-4 h-4" />
              Settings
            </div>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                  {initials}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="truncate font-medium text-sidebar-foreground">{user?.name}</div>
                  <div className="truncate text-xs text-sidebar-foreground/50">{user?.email}</div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-52">
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                  <User className="w-4 h-4" />
                  Profile &amp; Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={signOut}
                className="text-destructive focus:text-destructive gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
