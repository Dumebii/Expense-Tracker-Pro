'use client';

import { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { CURRENCIES } from '@/lib/currency';

export interface TransactionFormData {
  id: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  frequency: string;
  description?: string;
  billed_to_name?: string;
  billed_to_email?: string;
}

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd?: (data: Record<string, unknown>) => void;
  onEdit?: (id: string, data: Record<string, unknown>) => void;
  type: 'income' | 'expense';
  initialData?: TransactionFormData;
}

const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transport',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Marketing',
  'Hosting',
  'Development',
  'Social Media',
  'Registrations',
  'Subscriptions',
  'Other',
];

const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investment',
  'Bonus',
  'Business',
  'Marketing',
  'Other',
];

const FREQUENCIES = [
  { value: 'one_time', label: 'One Time' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annually', label: 'Annually' },
];

const CATEGORY_MAP: Record<'income' | 'expense', string[]> = {
  income: INCOME_CATEGORIES,
  expense: EXPENSE_CATEGORIES,
};

/** Returns 'Other' if the value isn't in the predefined list, otherwise the value itself. */
function resolveCategory(value: string | undefined, list: string[]): string {
  if (!value) return list[0];
  return list.includes(value) ? value : 'Other';
}

/** Returns the custom text if category is not in the predefined list, otherwise ''. */
function resolveCustomCategory(value: string | undefined, list: string[]): string {
  if (!value) return '';
  return list.includes(value) ? '' : value;
}

export default function AddTransactionModal({
  isOpen,
  onClose,
  onAdd,
  onEdit,
  type,
  initialData,
}: AddTransactionModalProps) {
  const isEditMode = !!initialData;
  const categories = CATEGORY_MAP[type];

  const blankForm = () => ({
    title: '',
    amount: '',
    currency: 'USD',
    category: categories[0],
    date: new Date().toISOString().split('T')[0],
    frequency: 'one_time',
    description: '',
    billed_to_name: '',
    billed_to_email: '',
  });

  const dataToForm = (d: TransactionFormData) => ({
    title: d.title,
    amount: String(d.amount),
    currency: d.currency ?? 'USD',
    category: resolveCategory(d.category, categories),
    date: d.date,
    frequency: d.frequency,
    description: d.description ?? '',
    billed_to_name: d.billed_to_name ?? '',
    billed_to_email: d.billed_to_email ?? '',
  });

  const [formData, setFormData] = useState(isEditMode ? dataToForm(initialData!) : blankForm());
  const [customCategory, setCustomCategory] = useState(
    isEditMode ? resolveCustomCategory(initialData?.category, categories) : ''
  );
  const [showBilledTo, setShowBilledTo] = useState(
    !!(initialData?.billed_to_name || initialData?.billed_to_email)
  );

  // Sync form when modal opens with new data
  useEffect(() => {
    if (!isOpen) return;
    if (isEditMode && initialData) {
      setFormData(dataToForm(initialData));
      setCustomCategory(resolveCustomCategory(initialData.category, categories));
      setShowBilledTo(!!(initialData.billed_to_name || initialData.billed_to_email));
    } else {
      setFormData(blankForm());
      setCustomCategory('');
      setShowBilledTo(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData?.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalCategory =
      formData.category === 'Other'
        ? customCategory.trim() || 'Other'
        : formData.category;

    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
      category: finalCategory,
    };

    if (isEditMode && initialData && onEdit) {
      onEdit(initialData.id, payload);
    } else if (onAdd) {
      onAdd(payload);
      setFormData(blankForm());
      setCustomCategory('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            {isEditMode ? 'Edit' : 'Add'} {type === 'income' ? 'Income' : 'Expense'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="e.g. Netflix, Office Rent"
            />
          </div>

          {/* Amount + Currency */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="0.00"
              />
            </div>
            <div className="w-36">
              <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {formData.category === 'Other' && (
              <input
                type="text"
                required
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Specify category…"
                className="mt-2 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description <span className="text-slate-400">(optional)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="Additional notes…"
              rows={3}
            />
          </div>

          {/* Billed To — expense only, optional */}
          {type === 'expense' && (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setShowBilledTo((v) => !v)}
                className="flex items-center justify-between w-full px-4 py-3 bg-slate-50 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <span>Billed To <span className="text-slate-400 font-normal">(optional)</span></span>
                {showBilledTo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {showBilledTo && (
                <div className="px-4 pb-4 pt-3 space-y-3">
                  <p className="text-xs text-slate-500">
                    Add the client or recipient this expense should be billed to. This appears on the receipt.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Client Name</label>
                    <input
                      type="text"
                      value={formData.billed_to_name}
                      onChange={(e) => setFormData({ ...formData, billed_to_name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                      placeholder="e.g. Acme Corporation"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Client Email</label>
                    <input
                      type="email"
                      value={formData.billed_to_email}
                      onChange={(e) => setFormData({ ...formData, billed_to_email: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                      placeholder="client@example.com"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
            >
              {isEditMode ? 'Save Changes' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
