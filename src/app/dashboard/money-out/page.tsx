'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Plus, Tag, Calendar, MoreVertical, Pencil, FileText, XCircle, Trash2, Loader2 } from 'lucide-react';
import AddTransactionModal, { TransactionFormData } from '@/components/transactions/AddTransactionModal';
import { CURRENCY_SYMBOLS, convertAmount } from '@/lib/currency';

interface Expense {
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

export default function MoneyOutPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCurrency, setDisplayCurrency] = useState('USD');
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });

  // Modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Action dropdown
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Filters
  const [freqFilter, setFreqFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // ── fetch data ──────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const [expRes, ratesRes] = await Promise.all([
        fetch('/api/expenses'),
        fetch('/api/rates'),
      ]);
      if (expRes.ok) {
        const result = await expRes.json();
        setExpenses(result.expenses || []);
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

  // ── handlers ────────────────────────────────────────────────────────────────
  const handleAdd = async (data: Record<string, unknown>) => {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      setExpenses((prev) => [created, ...prev]);
      setIsAddOpen(false);
    }
  };

  const handleEdit = async (id: string, data: Record<string, unknown>) => {
    const res = await fetch(`/api/expenses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)));
      setEditingExpense(null);
    }
  };

  const handleCancel = async (id: string) => {
    const res = await fetch(`/api/expenses/${id}/cancel`, { method: 'PATCH' });
    if (res.ok) {
      const updated = await res.json();
      setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)));
    }
    setOpenMenuId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense? This cannot be undone.')) return;
    const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    }
    setOpenMenuId(null);
  };

  const handleGenerateReceipt = (id: string) => {
    window.open(`/api/receipts/${id}/view`, '_blank');
    setOpenMenuId(null);
  };

  // ── stats ────────────────────────────────────────────────────────────────────
  const activeExpenses = expenses.filter((e) => e.status === 'active');

  const monthlyTotal = activeExpenses
    .filter((e) => e.frequency === 'monthly')
    .reduce((sum, e) => sum + convertAmount(e.amount, e.currency || 'USD', displayCurrency, rates), 0);

  const annualTotal = activeExpenses
    .filter((e) => e.frequency === 'annually')
    .reduce((sum, e) => sum + convertAmount(e.amount, e.currency || 'USD', displayCurrency, rates), 0);

  const oneTimeTotal = activeExpenses
    .filter((e) => e.frequency === 'one_time')
    .reduce((sum, e) => sum + convertAmount(e.amount, e.currency || 'USD', displayCurrency, rates), 0);

  // Annualized = recurring extrapolated to a year + one-time charges
  const annualizedTotal = monthlyTotal * 12 + annualTotal + oneTimeTotal;

  // ── filter ───────────────────────────────────────────────────────────────────
  const uniqueCategories = [...new Set(expenses.map((e) => e.category))].sort();

  const filtered = expenses.filter((e) => {
    if (freqFilter !== 'all' && e.frequency !== freqFilter) return false;
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
    return true;
  });

  const selectClass =
    'px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer';

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Money Out</h1>
          <p className="text-slate-600 mt-2">All your expenses and costs</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus size={18} /> Add Expense
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
            <p className="text-3xl font-bold text-red-600 mt-2">{formatAmount(value, displayCurrency)}</p>
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
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
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
            <p className="text-slate-500 text-lg font-medium">No expenses yet</p>
            <p className="text-slate-400 text-sm mt-1">Click &ldquo;Add Expense&rdquo; to get started.</p>
          </div>
        ) : (
          <div ref={menuRef}>
            {filtered.map((expense, idx) => {
              const nextRenewal = getNextRenewalDate(expense.date, expense.frequency);
              const converted = convertAmount(expense.amount, expense.currency || 'USD', displayCurrency, rates);
              const showConverted = (expense.currency || 'USD') !== displayCurrency;
              const isActive = expense.status === 'active';

              return (
                <div
                  key={expense.id}
                  className={`flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors group ${
                    idx < filtered.length - 1 ? 'border-b border-slate-100' : ''
                  } ${idx === 0 ? 'rounded-t-xl' : ''} ${idx === filtered.length - 1 ? 'rounded-b-xl' : ''}`}
                >
                  {/* Left */}
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 truncate">{expense.title}</span>
                      <span
                        className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isActive
                            ? 'bg-slate-800 text-white'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {expense.status}
                      </span>
                    </div>
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Tag size={12} className="shrink-0" />
                        {expense.category}
                      </span>
                      <span>{FREQ_LABELS[expense.frequency] ?? expense.frequency}</span>
                      {nextRenewal && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="shrink-0" />
                          Renews {formatRenewalDate(nextRenewal)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="font-bold text-slate-900">
                        {formatAmount(expense.amount, expense.currency || 'USD')}
                      </p>
                      {showConverted && (
                        <p className="text-xs text-slate-400">≈ {formatAmount(converted, displayCurrency)}</p>
                      )}
                    </div>

                    {/* Action menu */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === expense.id ? null : expense.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                        aria-label="More actions"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {openMenuId === expense.id && (
                        <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-xl shadow-xl z-20 w-48 py-1 overflow-hidden">
                          <button
                            onClick={() => {
                              setEditingExpense(expense);
                              setOpenMenuId(null);
                            }}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Pencil size={14} /> Edit
                          </button>
                          <button
                            onClick={() => handleGenerateReceipt(expense.id)}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
                          >
                            <FileText size={14} /> Generate Receipt
                          </button>
                          {isActive && (
                            <button
                              onClick={() => handleCancel(expense.id)}
                              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-500 hover:bg-slate-50 transition-colors"
                            >
                              <XCircle size={14} /> Cancel
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(expense.id)}
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
        type="expense"
      />

      {/* Edit modal */}
      {editingExpense && (
        <AddTransactionModal
          isOpen={!!editingExpense}
          onClose={() => setEditingExpense(null)}
          onEdit={handleEdit}
          type="expense"
          initialData={editingExpense as TransactionFormData}
        />
      )}
    </div>
  );
}
