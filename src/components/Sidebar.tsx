'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignOutButton, UserButton } from '@clerk/nextjs';
import {
  Home,
  TrendingUp,
  TrendingDown,
  Receipt,
  PieChart,
  Zap,
  Settings,
  LogOut,
  LayoutIcon,
} from 'lucide-react';

const navigationItems = [
  { label: 'Overview', href: '/dashboard', icon: Home },
  { label: 'Money In', href: '/dashboard/money-in', icon: TrendingUp },
  { label: 'Money Out', href: '/dashboard/money-out', icon: TrendingDown },
  { label: 'Receipts', href: '/dashboard/receipts', icon: Receipt },
  { label: 'Loss / Profit', href: '/dashboard/loss-profit', icon: PieChart },
  { label: 'AI Advisor', href: '/dashboard/ai-advisor', icon: Zap },
  { label: 'Account Statement', href: '/dashboard/account-statement', icon: LayoutIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
            <LayoutIcon size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold">Ledger</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                active
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 space-y-3">
        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/dashboard/settings')
              ? 'bg-slate-700 text-white'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </Link>

        {/* User Profile */}
        <div className="px-4 py-3 bg-slate-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-8 h-8',
                },
              }}
            />
            <span className="text-sm text-slate-300 font-medium">Profile</span>
          </div>
        </div>

        {/* Sign Out */}
        <SignOutButton>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}
