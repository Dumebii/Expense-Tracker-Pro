'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignOutButton, UserButton } from '@clerk/nextjs';
import {
  Home,
  TrendingUp,
  TrendingDown,
  Receipt,
  FileText,
  PieChart,
  Zap,
  Settings,
  LogOut,
  LayoutIcon,
  X,
} from 'lucide-react';

const navigationItems = [
  { label: 'Overview',          href: '/dashboard',                  icon: Home },
  { label: 'Money In',          href: '/dashboard/money-in',         icon: TrendingUp },
  { label: 'Money Out',         href: '/dashboard/money-out',        icon: TrendingDown },
  { label: 'Invoices',          href: '/dashboard/invoices',         icon: FileText },
  { label: 'Receipts',          href: '/dashboard/receipts',         icon: Receipt },
  { label: 'Loss / Profit',     href: '/dashboard/loss-profit',      icon: PieChart },
  { label: 'AI Advisor',        href: '/dashboard/ai-advisor',       icon: Zap },
  { label: 'Account Statement', href: '/dashboard/account-statement',icon: LayoutIcon },
];

function NchikoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#10b981"/>
      <line x1="9"  y1="30" x2="9"  y2="10" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="9"  y1="10" x2="31" y2="30" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="31" y1="30" x2="31" y2="10" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
      <circle cx="31" cy="10" r="3.5" fill="#f0fdf4"/>
    </svg>
  );
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <div
      className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col
        transform transition-transform duration-200 ease-in-out
        md:static md:translate-x-0 md:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* Logo */}
      <div className="p-6 border-b border-slate-700/60 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group" onClick={onClose}>
          <NchikoMark size={40} />
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-none">Nchiko</h1>
            <p className="text-[10px] text-slate-400 mt-0.5 tracking-widest uppercase">Finance</p>
          </div>
        </Link>
        <button
          onClick={onClose}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                active
                  ? 'bg-emerald-600/20 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={18} className={active ? 'text-emerald-400' : ''} />
              <span className="text-sm font-medium">{item.label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/60 space-y-2">
        <Link
          href="/dashboard/settings"
          onClick={onClose}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
            isActive('/dashboard/settings')
              ? 'bg-emerald-600/20 text-emerald-400'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Settings size={18} />
          Settings
        </Link>

        {/* User Profile */}
        <div className="px-4 py-2.5 bg-slate-800 rounded-lg flex items-center gap-2">
          <UserButton appearance={{ elements: { avatarBox: 'w-7 h-7' } }} />
          <span className="text-xs text-slate-400 font-medium">My Account</span>
        </div>

        <SignOutButton>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium">
            <LogOut size={18} />
            Sign Out
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}
