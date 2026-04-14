'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Plus } from 'lucide-react';
import TransactionList from '@/components/transactions/TransactionList';
import AddTransactionModal from '@/components/transactions/AddTransactionModal';

interface Income {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  frequency: string;
  status: string;
}

export default function MoneyInPage() {
  const { userId } = useAuth();
  const [income, setIncome] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    if (!userId) return;

    async function fetchData() {
      try {
        const response = await fetch('/api/income', {
          headers: { 'user-id': userId },
        });
        if (!response.ok) throw new Error('Failed to fetch');
        const result = await response.json();
        setIncome(result.income || []);
        setCurrency(result.currency || 'USD');
      } catch (error) {
        console.error('Error fetching income:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId]);

  const handleAddIncome = async (data: any) => {
    try {
      const response = await fetch('/api/income', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId!,
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const newIncome = await response.json();
        setIncome([newIncome, ...income]);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding income:', error);
    }
  };

  const monthlyIncome = income
    .filter(i => i.frequency === 'monthly')
    .reduce((sum, i) => sum + i.amount, 0);
  const annualIncome = income
    .filter(i => i.frequency === 'annually')
    .reduce((sum, i) => sum + i.amount, 0) + (monthlyIncome * 12);

  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">Money In</h1>
        <p className="text-slate-600 mt-2">All your income sources and revenue</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-slate-600 text-sm font-medium">MONTHLY</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{currency} {monthlyIncome.toFixed(2)}</p>
          <p className="text-slate-600 text-sm mt-1">{currency} {(monthlyIncome / 12).toFixed(2)}/mo</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-slate-600 text-sm font-medium">ANNUAL</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{currency} {annualIncome.toFixed(2)}</p>
          <p className="text-slate-600 text-sm mt-1">{currency} {(annualIncome / 12).toFixed(2)}/mo</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-slate-600 text-sm font-medium">ANNUALIZED TOTAL</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{currency} {annualIncome.toFixed(2)}</p>
          <p className="text-slate-600 text-sm mt-1">run rate</p>
        </div>
      </div>

      {/* Add Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="mb-6 flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
      >
        <Plus size={20} /> Add Income
      </button>

      {/* Income List */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        {loading ? (
          <p className="text-center text-slate-600 py-8">Loading...</p>
        ) : income.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">No income entries yet</p>
            <p className="text-slate-500">Add your first income source to get started.</p>
          </div>
        ) : (
          <TransactionList transactions={income} type="income" currency={currency} />
        )}
      </div>

      {/* Add Income Modal */}
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddIncome}
        type="income"
      />
    </div>
  );
}
