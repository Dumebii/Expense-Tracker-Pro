'use client';

import { useEffect, useState } from 'react';
import {
  FileText,
  X,
  Plus,
  Loader2,
  Send,
  Eye,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { CURRENCY_SYMBOLS } from '@/lib/currency';

interface Income {
  id: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  frequency: string;
  description?: string;
}

interface InvoiceFields {
  billedToName: string;
  billedToEmail: string;
  billedToAddress: string;
  paymentDetails: string;
  paymentTerms: string;
  notes: string;
}

interface ModalState {
  income: Income;
}

const TERMS_OPTIONS = [
  'Due on receipt',
  'Net 7',
  'Net 14',
  'Net 30',
  'Net 60',
];

const EMPTY_FIELDS: InvoiceFields = {
  billedToName: '',
  billedToEmail: '',
  billedToAddress: '',
  paymentDetails: '',
  paymentTerms: '',
  notes: '',
};

export default function InvoicesPage() {
  const [income, setIncome] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [fields, setFields] = useState<InvoiceFields>(EMPTY_FIELDS);

  // Email sending state
  const [emails, setEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [sending, setSending] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetch('/api/income')
      .then((r) => r.json())
      .then((data) => setIncome(data.income || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openModal = (item: Income) => {
    setModal({ income: item });
    setFields(EMPTY_FIELDS);
    setEmails([]);
    setEmailInput('');
    setSendResult(null);
  };

  const closeModal = () => {
    setModal(null);
    setEmails([]);
    setEmailInput('');
    setSendResult(null);
  };

  const setField = (key: keyof InvoiceFields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  // ── Email chip helpers ────────────────────────────────────────────
  const addEmail = () => {
    const trimmed = emailInput.trim().toLowerCase();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!isValid || emails.includes(trimmed)) { setEmailInput(''); return; }
    setEmails([...emails, trimmed]);
    setEmailInput('');
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addEmail(); }
  };

  // ── Preview (open HTML in new tab via Blob URL) ───────────────────
  const handlePreview = async () => {
    if (!modal) return;
    setPreviewing(true);
    try {
      const res = await fetch(`/api/income/${modal.income.id}/invoice/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      if (!res.ok) throw new Error('Failed');
      const html = await res.text();
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      // Revoke after a short delay so the tab has time to load
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch {
      setSendResult({ success: false, message: 'Failed to generate invoice preview.' });
    } finally {
      setPreviewing(false);
    }
  };

  // ── Send ──────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!modal || emails.length === 0) return;
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch(`/api/income/${modal.income.id}/invoice/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails, ...fields }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSendResult({ success: false, message: data.error || 'Failed to send invoice.' });
      } else {
        setSendResult({
          success: true,
          message: `Invoice sent to ${data.sent} email${data.sent !== 1 ? 's' : ''} successfully.`,
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

  const FREQ_LABELS: Record<string, string> = {
    one_time: 'One Time', monthly: 'Monthly', annually: 'Annually',
  };

  const inputClass =
    'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 placeholder:text-slate-400';
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5';

  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">Invoices</h1>
        <p className="text-slate-600 mt-2">
          Generate and send invoices for your income entries.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-slate-400" size={32} />
        </div>
      ) : income.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No income entries yet</h3>
          <p className="text-slate-600">
            Add income entries from the Money In page to generate invoices.
          </p>
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
                {income.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-medium text-slate-900">{item.title}</div>
                      {item.description && (
                        <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-5 font-semibold text-emerald-600">
                      {formatAmount(item.amount, item.currency)}
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-600 text-sm">
                      {new Date(item.date).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-5 text-slate-600 text-sm">
                      {FREQ_LABELS[item.frequency] ?? item.frequency}
                    </td>
                    <td className="py-4 px-5 text-center">
                      <button
                        onClick={() => openModal(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition-colors"
                      >
                        <FileText size={13} />
                        Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Invoice Modal ─────────────────────────────────────────── */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Generate Invoice</h2>
                <p className="text-sm text-slate-500 mt-0.5 truncate max-w-[380px]">
                  {modal.income.title} &mdash; {formatAmount(modal.income.amount, modal.income.currency)}
                </p>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

              {/* Bill To */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                  Bill To <span className="font-normal normal-case tracking-normal text-slate-400">(optional)</span>
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Client Name</label>
                    <input
                      type="text"
                      value={fields.billedToName}
                      onChange={(e) => setField('billedToName', e.target.value)}
                      placeholder="Acme Corp"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Client Email</label>
                    <input
                      type="email"
                      value={fields.billedToEmail}
                      onChange={(e) => setField('billedToEmail', e.target.value)}
                      placeholder="billing@acme.com"
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Address</label>
                    <textarea
                      value={fields.billedToAddress}
                      onChange={(e) => setField('billedToAddress', e.target.value)}
                      placeholder="123 Main St, City, Country"
                      rows={2}
                      className={inputClass + ' resize-none'}
                    />
                  </div>
                </div>
              </div>

              {/* Payment & Terms */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                  Payment <span className="font-normal normal-case tracking-normal text-slate-400">(optional)</span>
                </p>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Payment Terms</label>
                    <select
                      value={fields.paymentTerms}
                      onChange={(e) => setField('paymentTerms', e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select terms…</option>
                      {TERMS_OPTIONS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                      <option value="custom">Custom…</option>
                    </select>
                    {fields.paymentTerms === 'custom' && (
                      <input
                        type="text"
                        placeholder="e.g. 50% upfront, 50% on delivery"
                        className={inputClass + ' mt-2'}
                        onChange={(e) => setField('paymentTerms', e.target.value)}
                      />
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Payment Details</label>
                    <textarea
                      value={fields.paymentDetails}
                      onChange={(e) => setField('paymentDetails', e.target.value)}
                      placeholder={`Bank: First Bank Nigeria\nAccount: 0123456789\nOr pay via: paystack.me/yourlink`}
                      rows={3}
                      className={inputClass + ' resize-none'}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                  Notes <span className="font-normal normal-case tracking-normal text-slate-400">(optional)</span>
                </p>
                <textarea
                  value={fields.notes}
                  onChange={(e) => setField('notes', e.target.value)}
                  placeholder="Thank you for your business. Please include the invoice number in your payment reference."
                  rows={2}
                  className={inputClass + ' resize-none'}
                />
              </div>

              {/* Send To */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                  Send to <span className="font-normal normal-case tracking-normal text-slate-400">(optional — leave blank to just preview)</span>
                </p>
                {emails.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {emails.map((email) => (
                      <span
                        key={email}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium"
                      >
                        {email}
                        <button
                          onClick={() => setEmails(emails.filter((e) => e !== email))}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X size={13} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={handleEmailKeyDown}
                    placeholder="client@example.com"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={addEmail}
                    disabled={!emailInput.trim()}
                    className="flex items-center gap-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 disabled:opacity-40 transition-colors shrink-0"
                  >
                    <Plus size={15} />
                    Add
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1.5">Press Enter or comma to add multiple emails.</p>
              </div>

              {/* Send result */}
              {sendResult && (
                <div
                  className={`flex items-start gap-2.5 p-3 rounded-lg text-sm ${
                    sendResult.success
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  {sendResult.success
                    ? <CheckCircle size={16} className="shrink-0 mt-0.5" />
                    : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
                  {sendResult.message}
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="flex gap-3 px-6 py-4 border-t border-slate-200 shrink-0">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm transition-colors"
              >
                {sendResult?.success ? 'Close' : 'Cancel'}
              </button>
              <button
                onClick={handlePreview}
                disabled={previewing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-slate-900 text-slate-900 font-semibold rounded-lg hover:bg-slate-50 disabled:opacity-50 text-sm transition-colors"
              >
                {previewing ? (
                  <><Loader2 size={15} className="animate-spin" /> Generating…</>
                ) : (
                  <><Eye size={15} /> Preview &amp; Download</>
                )}
              </button>
              <button
                onClick={handleSend}
                disabled={emails.length === 0 || sending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 disabled:bg-slate-400 text-sm transition-colors"
              >
                {sending ? (
                  <><Loader2 size={15} className="animate-spin" /> Sending…</>
                ) : (
                  <><Send size={15} /> Send Invoice</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
