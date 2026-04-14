'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentTransactions from '@/components/dashboard/RecentTransactions';

interface TransactionData {
  totalIncome: number;
  totalExpenses: number;
  netP_L: number;
  annualizedNet: number;
  recentIncome: any[];
  recentExpenses: any[];
}

export default function OverviewPage() {
  const { userId } = useAuth();
  const [data, setData] = useState<TransactionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    if (!userId) return;

    async function fetchData() {
      try {
        const response = await fetch('/api/dashboard/summary', {
          headers: { 'user-id': userId },
        });
        if (!response.ok) throw new Error('Failed to fetch');
        const result = await response.json();
        setData(result);
        setCurrency(result.currency || 'USD');
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">Overview</h1>
        <p className="text-slate-600 mt-2">Your financial command center</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Income"
          amount={data?.totalIncome || 0}
          currency={currency}
          icon={<TrendingUp className="text-emerald-500" size={20} />}
          subtext={`${currency} ${((data?.totalIncome || 0) / 12).toFixed(2)}/mo`}
        />
        <StatsCard
          title="Total Expenses"
          amount={data?.totalExpenses || 0}
          currency={currency}
          icon={<TrendingDown className="text-red-500" size={20} />}
          subtext={`${currency} ${((data?.totalExpenses || 0) / 12).toFixed(2)}/mo`}
        />
        <StatsCard
          title="Net P&L"
          amount={data?.netP_L || 0}
          currency={currency}
          icon={<DollarSign className="text-emerald-500" size={20} />}
          subtext={`${currency} ${((data?.netP_L || 0) / 12).toFixed(2)}/mo`}
        />
        <StatsCard
          title="Annualized Net"
          amount={data?.annualizedNet || 0}
          currency={currency}
          icon={<Activity className="text-blue-500" size={20} />}
          subtext="run rate"
        />
      </div>

      {/* Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactions
          title="Recent Income"
          transactions={data?.recentIncome || []}
          type="income"
          currency={currency}
        />
        <RecentTransactions
          title="Recent Expenses"
          transactions={data?.recentExpenses || []}
          type="expense"
          currency={currency}
        />
      </div>
    </div>
  );
}
