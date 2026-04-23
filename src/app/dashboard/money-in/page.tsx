'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Plus, Tag, Calendar, MoreVertical, Pencil, Trash2, Loader2 } from 'lucide-react';
import AddTransactionModal, { TransactionFormData } from '@/components/transactions/AddTransactionModal';
import { CURRENCY_SYMBOLS, convertAmount } from '@/lib/currency';

interface Income {
  id: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  frequency: string;
  status: string;
  description?: string;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function getNextRenewalDate(dateStr: string, frequency: string): Date | null {
  if (frequency === 'one_time') return null;
  const start = new Date(dateStr + 'T12:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const next = new Date(start);
  if (frequency === 'monthly') {
    while (next <= now) next.setMonth(next.getMonth() + 1);
  } else if (frequency === 'annually') {
    while (next <= now) next.setFullYear(next.getFullYear() + 1);
  }
  return next;
}

function formatRenewalDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatAmount(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency + ' ';
  return `${symbol}${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const FREQ_LABELS: Record<string, string> = {
  one_time: 'One Time',
  monthly: 'Monthly',
  annually: 'Annually',
};

// ─── component ───────────────────────────────────────────────────────────────

export default function MoneyInPage() {
  const [income, setIncome] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCurrency, setDisplayCurrency] = useState('USD');
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Filters
  const [freqFilter, setFreqFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // ── fetch ────────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const [incRes, ratesRes] = await Promise.all([
        fetch('/api/income'),
        fetch('/api/rates'),
      ]);
      if (incRes.ok) {
        const result = await incRes.json();
        setIncome(result.income || []);
        setDisplayCurrency(result.currency || 'USD');
      }
      if (ratesRes.ok) {
        const { rates: r } = await ratesRes.json();
        setRates(r);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── handlers ─────────────────────────────────────────────────────────────────
  const handleAdd = async (data: Record<string, unknown>) => {
    const res = await fetch('/api/income', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      setIncome((prev) => [created, ...prev]);
      setIsAddOpen(false);
    }
  };

  const handleEdit = async (id: string, data: Record<string, unknown>) => {
    const res = await fetch(`/api/income/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setIncome((prev) => prev.map((i) => (i.id === id ? updated : i)));
      setEditingIncome(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this income entry? This cannot be undone.')) return;
    const res = await fetch(`/api/income/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setIncome((prev) => prev.filter((i) => i.id !== id));
    }
    setOpenMenuId(null);
  };

  // ── stats ─────────────────────────────────────────────────────────────────────
  const monthlyTotal = income
    .filter((i) => i.frequency === 'monthly')
    .reduce((sum, i) => sum + convertAmount(i.amount, i.currency || 'USD', displayCurrency, rates), 0);

  const annualTotal = income
    .filter((i) => i.frequency === 'annually')
    .reduce((sum, i) => sum + convertAmount(i.amount, i.currency || 'USD', displayCurrency, rates), 0);

  const oneTimeTotal = income
    .filter((i) => i.frequency === 'one_time')
    .reduce((sum, i) => sum + convertAmount(i.amount, i.currency || 'USD', displayCurrency, rates), 0);

  // Annualized = recurring extrapolated to a year + one-time amounts
  const annualizedTotal = monthlyTotal * 12 + annualTotal + oneTimeTotal;

  // ── filters ───────────────────────────────────────────────────────────────────
  const uniqueCategories = [...new Set(income.map((i) => i.category))].sort();

  const filtered = income.filter((i) => {
    if (freqFilter !== 'all' && i.frequency !== freqFilter) return false;
    if (categoryFilter !== 'all' && i.category !== categoryFilter) return false;
    return true;
  });

  const selectClass =
    'px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer';

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Money In</h1>
          <p className="text-slate-600 mt-2">All your income sources and revenue</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus size={18} /> Add Income
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'MONTHLY', value: monthlyTotal, sub: `${formatAmount(monthlyTotal / 12, displayCurrency)}/mo` },
          { label: 'ANNUAL', value: annualTotal, sub: `${formatAmount(annualTotal / 12, displayCurrency)}/mo` },
          { label: 'ANNUALIZED TOTAL', value: annualizedTotal, sub: 'run rate' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-500 text-xs font-semibold tracking-wider">{label}</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">{formatAmount(value, displayCurrency)}</p>
            <p className="text-slate-500 text-sm mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select value={freqFilter} onChange={(e) => setFreqFilter(e.target.value)} className={selectClass}>
          <option value="all">All Frequency</option>
          <option value="one_time">One Time</option>
          <option value="monthly">Monthly</option>
          <option value="annually">Annually</option>
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={selectClass}>
          <option value="all">All Categories</option>
          {uniqueCategories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-slate-200">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-slate-400" size={28} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500 text-lg font-medium">No income entries yet</p>
            <p className="text-slate-400 text-sm mt-1">Click &ldquo;Add Income&rdquo; to get started.</p>
          </div>
        ) : (
          <div ref={menuRef}>
            {filtered.map((item, idx) => {
              const nextRenewal = getNextRenewalDate(item.date, item.frequency);
              const converted = convertAmount(item.amount, item.currency || 'USD', displayCurrency, rates);
              const showConverted = (item.currency || 'USD') !== displayCurrency;

              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors group ${
                    idx < filtered.length - 1 ? 'border-b border-slate-100' : ''
                  } ${idx === 0 ? 'rounded-t-xl' : ''} ${idx === filtered.length - 1 ? 'rounded-b-xl' : ''}`}
                >
                  {/* Left */}
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 truncate">{item.title}</span>
                      <span className="shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                        {item.status ?? 'active'}
                      </span>
                    </div>
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Tag size={12} className="shrink-0" />
                        {item.category}
                      </span>
                      <span>{FREQ_LABELS[item.frequency] ?? item.frequency}</span>
                      {nextRenewal && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="shrink-0" />
                          Next {formatRenewalDate(nextRenewal)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">
                        +{formatAmount(item.amount, item.currency || 'USD')}
                      </p>
                      {showConverted && (
                        <p className="text-xs text-slate-400">≈ {formatAmount(converted, displayCurrency)}</p>
                      )}
                    </div>

                    {/* Action menu */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                        aria-label="More actions"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {openMenuId === item.id && (
                        <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-xl shadow-xl z-20 w-40 py-1 overflow-hidden">
                          <button
                            onClick={() => {
                              setEditingIncome(item);
                              setOpenMenuId(null);
                            }}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Pencil size={14} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add modal */}
      <AddTransactionModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAdd}
        type="income"
      />

      {/* Edit modal */}
      {editingIncome && (
        <AddTransactionModal
          isOpen={!!editingIncome}
          onClose={() => setEditingIncome(null)}
          onEdit={handleEdit}
          type="income"
          initialData={editingIncome as TransactionFormData}
        />
      )}
    </div>
  );
}
