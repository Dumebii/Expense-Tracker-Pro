'use client';

import { useEffect, useState } from 'react';
import { Bell, X, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

interface RenewalItem {
  id: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  frequency: string;
  renewalDate: string;
  daysUntil: number;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', NGN: '₦', INR: '₹', JPY: '¥', AUD: 'A$',
};

function formatAmount(amount: number, currency: string) {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency + ' ';
  return `${symbol}${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function urgencyColor(days: number) {
  if (days === 0) return 'bg-red-50 border-red-300 text-red-800';
  if (days <= 2) return 'bg-red-50 border-red-200 text-red-700';
  if (days <= 4) return 'bg-orange-50 border-orange-200 text-orange-700';
  return 'bg-amber-50 border-amber-200 text-amber-700';
}

function urgencyBadge(days: number) {
  if (days === 0) return { label: 'Today', cls: 'bg-red-100 text-red-700' };
  if (days === 1) return { label: 'Tomorrow', cls: 'bg-red-100 text-red-700' };
  return { label: `${days} days`, cls: days <= 3 ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700' };
}

const DISMISSED_KEY = 'nchiko_renewal_dismissed';

export default function RenewalAlertBanner() {
  const [items, setItems] = useState<RenewalItem[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]');
    setDismissed(stored);

    fetch('/api/upcoming-renewals')
      .then((r) => r.json())
      .then((data) => {
        setItems(data.upcoming || []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const dismiss = (id: string) => {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
  };

  const visible = items.filter((i) => !dismissed.includes(i.id));
  if (!loaded || visible.length === 0) return null;

  const primary = visible[0];
  const rest = visible.slice(1);
  const bannerColor = urgencyColor(primary.daysUntil);
  const badge = urgencyBadge(primary.daysUntil);

  return (
    <div className={`border rounded-xl mx-6 mt-5 overflow-hidden shadow-sm ${bannerColor}`}>
      {/* Primary alert row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Bell size={16} className="shrink-0 opacity-70" />
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-sm">{primary.title}</span>
          <span className="text-sm opacity-80"> renews for </span>
          <span className="font-semibold text-sm">{formatAmount(primary.amount, primary.currency)}</span>
          <span className={`ml-2 inline-block text-xs font-bold px-2 py-0.5 rounded-full ${badge.cls}`}>
            {badge.label}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Link
            href="/dashboard/money-out"
            className="text-xs font-semibold underline underline-offset-2 opacity-70 hover:opacity-100 transition-opacity"
          >
            View
          </Link>
          {rest.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs font-medium opacity-60 hover:opacity-100 ml-3 transition-opacity"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {rest.length} more
            </button>
          )}
          <button
            onClick={() => dismiss(primary.id)}
            className="ml-2 opacity-50 hover:opacity-80 transition-opacity"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Expanded list */}
      {expanded && rest.length > 0 && (
        <div className="border-t border-current/10 divide-y divide-current/10">
          {rest.map((item) => {
            const b = urgencyBadge(item.daysUntil);
            return (
              <div key={item.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="flex-1 min-w-0 text-sm">
                  <span className="font-medium">{item.title}</span>
                  <span className="opacity-70"> — {formatAmount(item.amount, item.currency)}</span>
                  <span className={`ml-2 inline-block text-xs font-bold px-2 py-0.5 rounded-full ${b.cls}`}>
                    {b.label}
                  </span>
                </div>
                <button onClick={() => dismiss(item.id)} className="opacity-40 hover:opacity-70 transition-opacity">
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
