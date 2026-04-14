'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Save, LogOut } from 'lucide-react';
import { SignOutButton } from '@clerk/nextjs';

interface Preferences {
  email: string;
  firstName: string;
  lastName: string;
  receiptEmail: string;
  currency: string;
}

export default function SettingsPage() {
  const { userId, user } = useAuth();
  const [preferences, setPreferences] = useState<Preferences>({
    email: '',
    firstName: '',
    lastName: '',
    receiptEmail: '',
    currency: 'USD',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!userId || !user) return;

    async function fetchPreferences() {
      try {
        const response = await fetch('/api/preferences', {
          headers: { 'user-id': userId },
        });
        if (response.ok) {
          const data = await response.json();
          setPreferences({
            email: user.emailAddresses[0]?.emailAddress || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            receiptEmail: data.receiptEmail || user.emailAddresses[0]?.emailAddress || '',
            currency: data.currency || 'USD',
          });
        } else {
          setPreferences({
            email: user.emailAddresses[0]?.emailAddress || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            receiptEmail: user.emailAddresses[0]?.emailAddress || '',
            currency: 'USD',
          });
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
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId,
        },
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">Settings</h1>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                disabled
                value={preferences.firstName}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                disabled
                value={preferences.lastName}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
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
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Receipt Email
            </label>
            <input
              type="email"
              value={preferences.receiptEmail}
              onChange={(e) =>
                setPreferences({ ...preferences, receiptEmail: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="Where to send expense receipts. Defaults to your profile email."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Display Currency
            </label>
            <select
              value={preferences.currency}
              onChange={(e) =>
                setPreferences({ ...preferences, currency: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
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
