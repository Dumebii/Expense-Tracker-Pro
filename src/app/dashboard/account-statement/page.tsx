'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Calendar } from 'lucide-react';

export default function AccountStatementPage() {
  const { userId } = useAuth();
  const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [statement, setStatement] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/account-statement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId,
        },
        body: JSON.stringify({ fromDate, toDate }),
      });
      if (response.ok) {
        const result = await response.json();
        setStatement(result);
      }
    } catch (error) {
      console.error('Error generating statement:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">Account Statement</h1>
        <p className="text-slate-600 mt-2">Full transaction history for a period</p>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 disabled:bg-slate-600 transition-colors"
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

      {/* Statement Summary */}
      {statement && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <p className="text-slate-600 text-sm font-medium">TOTAL INCOME</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">
                {statement.currency} {statement.totalIncome.toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <p className="text-slate-600 text-sm font-medium">TOTAL EXPENSES</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {statement.currency} {statement.totalExpenses.toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <p className="text-slate-600 text-sm font-medium">NET P&L</p>
              <p className={`text-3xl font-bold mt-2 ${statement.netP_L >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {statement.currency} {statement.netP_L.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Transactions</h3>
            <p className="text-slate-600 text-center py-8">
              Generated on {new Date(statement.statementDate).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {!statement && (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Generate a statement</h3>
          <p className="text-slate-600">
            Select a date range and click Generate to create an account statement for that period.
          </p>
        </div>
      )}
    </div>
  );
}
