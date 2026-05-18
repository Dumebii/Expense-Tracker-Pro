'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser, SignOutButton } from '@clerk/nextjs';
import { Save, LogOut, Copy, Check, Zap } from 'lucide-react';

interface Preferences {
  email: string;
  firstName: string;
  lastName: string;
  receiptEmail: string;
  currency: string;
  webhookId: string;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
      aria-label="Copy to clipboard"
    >
      {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
    </button>
  );
}

function WebhookRow({ label, url }: { label: string; url: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-700 mb-1.5">{label}</p>
      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
        <code className="flex-1 text-xs text-slate-600 break-all">{url}</code>
        <CopyButton value={url} />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { userId } = useAuth();
  const { user } = useUser();
  const [preferences, setPreferences] = useState<Preferences>({
    email: '',
    firstName: '',
    lastName: '',
    receiptEmail: '',
    currency: 'USD',
    webhookId: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!userId || !user) return;
    const u = user;

    async function fetchPreferences() {
      const email = u.emailAddresses[0]?.emailAddress || '';
      const firstName = u.firstName || '';
      const lastName = u.lastName || '';
      try {
        const response = await fetch('/api/preferences');
        if (response.ok) {
          const data = await response.json();
          setPreferences({
            email,
            firstName,
            lastName,
            receiptEmail: data.receiptEmail || data.receipt_email || email,
            currency: data.currency || 'USD',
            webhookId: data.webhookId || '',
          });
        } else {
          setPreferences({ email, firstName, lastName, receiptEmail: email, currency: 'USD', webhookId: '' });
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPreferences();
  }, [userId, user]);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptEmail: preferences.receiptEmail,
          currency: preferences.currency,
        }),
      });
      if (response.ok) {
        setMessage('Preferences saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage('Error saving preferences');
    } finally {
      setSaving(false);
    }
  };

  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const webhookUrls = preferences.webhookId
    ? {
        stripe: `${appUrl}/api/webhooks/stripe/${preferences.webhookId}`,
        dodo: `${appUrl}/api/webhooks/dodo/${preferences.webhookId}`,
        lemonsqueezy: `${appUrl}/api/webhooks/lemonsqueezy/${preferences.webhookId}`,
      }
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-2">Manage your account and preferences</p>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700">
          {message}
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Profile</h2>
        <div className="space-y-4">
          <p className="text-slate-600">Your name and login email</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
              <input
                type="text"
                disabled
                value={preferences.firstName}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                disabled
                value={preferences.lastName}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              disabled
              value={preferences.email}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
            />
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Preferences</h2>
        <div className="space-y-4 mb-6">
          <p className="text-slate-600">Receipt email and display currency</p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Receipt Email</label>
            <input
              type="email"
              value={preferences.receiptEmail}
              onChange={(e) => setPreferences({ ...preferences, receiptEmail: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="Where to send expense receipts. Defaults to your profile email."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Display Currency</label>
            <select
              value={preferences.currency}
              onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="NGN">NGN (₦)</option>
              <option value="INR">INR (₹)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="AUD">AUD (A$)</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 disabled:bg-slate-600 transition-colors"
        >
          <Save size={18} /> {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>

      {/* Integrations Section */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={20} className="text-emerald-500" />
          <h2 className="text-xl font-semibold text-slate-900">Payment Integrations</h2>
        </div>
        <p className="text-slate-500 text-sm mb-6">
          Paste one of these URLs as a webhook endpoint in your payment processor dashboard.
          Every payment received will automatically appear as income in Nchiko.
        </p>

        {webhookUrls ? (
          <div className="space-y-4">
            <WebhookRow label="Stripe" url={webhookUrls.stripe} />
            <WebhookRow label="Dodo Payments" url={webhookUrls.dodo} />
            <WebhookRow label="Lemon Squeezy" url={webhookUrls.lemonsqueezy} />

            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-700 font-medium mb-1">Setup instructions</p>
              <ul className="text-xs text-amber-600 space-y-1 list-disc list-inside">
                <li><strong>Stripe:</strong> Dashboard → Developers → Webhooks → Add endpoint. Select <code>payment_intent.succeeded</code> and <code>checkout.session.completed</code>.</li>
                <li><strong>Dodo:</strong> Dashboard → Webhooks → New webhook. Select payment and subscription events.</li>
                <li><strong>Lemon Squeezy:</strong> Settings → Webhooks → Add webhook. Select <code>order_created</code> and <code>subscription_payment_success</code>.</li>
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-slate-400 text-sm">Loading your webhook URLs…</p>
        )}
      </div>

      {/* Account Section */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Account</h2>
        <SignOutButton>
          <button className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
            <LogOut size={18} /> Sign Out
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}
