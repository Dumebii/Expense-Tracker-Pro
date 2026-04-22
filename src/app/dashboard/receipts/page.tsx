'use client';

import { useEffect, useState } from 'react';
import { Download, Send, X, Plus, Loader2, Receipt, CheckCircle, AlertCircle } from 'lucide-react';
import { CURRENCY_SYMBOLS } from '@/lib/currency';

interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  frequency: string;
  description?: string;
  status: string;
}

interface SendModalState {
  expenseId: string;
  expenseTitle: string;
}

export default function ReceiptsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendModal, setSendModal] = useState<SendModalState | null>(null);
  const [emails, setEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetch('/api/receipts')
      .then((r) => r.json())
      .then((data) => setExpenses(data.expenses || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = (expense: Expense) => {
    window.open(`/api/receipts/${expense.id}/view`, '_blank');
  };

  const openSendModal = (expense: Expense) => {
    setSendModal({ expenseId: expense.id, expenseTitle: expense.title });
    setEmails([]);
    setEmailInput('');
    setSendResult(null);
  };

  const closeSendModal = () => {
    setSendModal(null);
    setEmails([]);
    setEmailInput('');
    setSendResult(null);
  };

  const addEmail = () => {
    const trimmed = emailInput.trim().toLowerCase();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!isValid || emails.includes(trimmed)) {
      setEmailInput('');
      return;
    }
    setEmails([...emails, trimmed]);
    setEmailInput('');
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addEmail();
    }
  };

  const removeEmail = (email: string) => {
    setEmails(emails.filter((e) => e !== email));
  };

  const handleSend = async () => {
    if (!sendModal || emails.length === 0) return;
    setSending(true);
    setSendResult(null);

    try {
      const res = await fetch(`/api/receipts/${sendModal.expenseId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSendResult({ success: false, message: data.error || 'Failed to send receipt.' });
      } else {
        setSendResult({
          success: true,
          message: `Receipt sent to ${data.sent} email${data.sent !== 1 ? 's' : ''} successfully.`,
        });
        setEmails([]);
      }
    } catch {
      setSendResult({ success: false, message: 'Network error. Please try again.' });
    } finally {
      setSending(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    const symbol = CURRENCY_SYMBOLS[currency] ?? currency + ' ';
    return `${symbol}${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const frequencyLabel = (freq: string) => {
    const map: Record<string, string> = { one_time: 'One Time', monthly: 'Monthly', annually: 'Annually' };
    return map[freq] || freq;
  };

  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">Receipts</h1>
        <p className="text-slate-600 mt-2">Download or send receipts for your expenses.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-slate-400" size={32} />
        </div>
      ) : expenses.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <Receipt className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No expenses yet</h3>
          <p className="text-slate-600">Add expenses from the Money Out page to generate receipts.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-5 font-semibold text-slate-700 text-sm">Description</th>
                  <th className="text-left py-3 px-5 font-semibold text-slate-700 text-sm">Amount</th>
                  <th className="text-left py-3 px-5 font-semibold text-slate-700 text-sm">Category</th>
                  <th className="text-left py-3 px-5 font-semibold text-slate-700 text-sm">Date</th>
                  <th className="text-left py-3 px-5 font-semibold text-slate-700 text-sm">Frequency</th>
                  <th className="text-center py-3 px-5 font-semibold text-slate-700 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-medium text-slate-900">{expense.title}</div>
                      {expense.description && (
                        <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">
                          {expense.description}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-5 font-semibold text-red-600">
                      {formatAmount(expense.amount, expense.currency)}
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                        {expense.category}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-600 text-sm">
                      {new Date(expense.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-5 text-slate-600 text-sm">{frequencyLabel(expense.frequency)}</td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDownload(expense)}
                          title="Download / Print Receipt"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition-colors"
                        >
                          <Download size={13} />
                          Download
                        </button>
                        <button
                          onClick={() => openSendModal(expense)}
                          title="Send Receipt by Email"
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <Send size={13} />
                          Send
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Send Receipt Modal */}
      {sendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Send Receipt</h2>
                <p className="text-sm text-slate-500 mt-0.5 truncate max-w-[300px]">
                  {sendModal.expenseTitle}
                </p>
              </div>
              <button onClick={closeSendModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Recipient Email(s)
                </label>

                {/* Email chips */}
                {emails.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {emails.map((email) => (
                      <span
                        key={email}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium"
                      >
                        {email}
                        <button
                          onClick={() => removeEmail(email)}
                          className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <X size={13} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Email input */}
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={handleEmailKeyDown}
                    placeholder="Enter email address"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <button
                    type="button"
                    onClick={addEmail}
                    disabled={!emailInput.trim()}
                    className="flex items-center gap-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 disabled:opacity-40 transition-colors"
                  >
                    <Plus size={15} />
                    Add
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1.5">
                  Press Enter or comma to add multiple emails.
                </p>
              </div>

              {/* Send result feedback */}
              {sendResult && (
                <div
                  className={`flex items-start gap-2.5 p-3 rounded-lg text-sm ${
                    sendResult.success
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  {sendResult.success ? (
                    <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  )}
                  {sendResult.message}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-slate-200">
              <button
                onClick={closeSendModal}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm transition-colors"
              >
                {sendResult?.success ? 'Close' : 'Cancel'}
              </button>
              <button
                onClick={handleSend}
                disabled={emails.length === 0 || sending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 disabled:bg-slate-400 text-sm transition-colors"
              >
                {sending ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    Send Receipt
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
