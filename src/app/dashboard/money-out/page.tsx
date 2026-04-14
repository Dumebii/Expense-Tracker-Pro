'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Plus } from 'lucide-react';
import TransactionList from '@/components/transactions/TransactionList';
import AddTransactionModal from '@/components/transactions/AddTransactionModal';

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  frequency: string;
  status: string;
}

export default function MoneyOutPage() {
  const { userId } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    if (!userId) return;

    async function fetchData() {
      try {
        const response = await fetch('/api/expenses', {
          headers: { 'user-id': userId },
        });
        if (!response.ok) throw new Error('Failed to fetch');
        const result = await response.json();
        setExpenses(result.expenses || []);
        setCurrency(result.currency || 'USD');
      } catch (error) {
        console.error('Error fetching expenses:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId]);

  const handleAddExpense = async (data: any) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId!,
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const newExpense = await response.json();
        setExpenses([newExpense, ...expenses]);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const monthlyExpenses = expenses
    .filter(e => e.frequency === 'monthly')
    .reduce((sum, e) => sum + e.amount, 0);
  const annualExpenses = expenses
    .filter(e => e.frequency === 'annually')
    .reduce((sum, e) => sum + e.amount, 0) + (monthlyExpenses * 12);

  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">Money Out</h1>
        <p className="text-slate-600 mt-2">All your expenses and costs</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-slate-600 text-sm font-medium">MONTHLY</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{currency} {monthlyExpenses.toFixed(2)}</p>
          <p className="text-slate-600 text-sm mt-1">{currency} {(monthlyExpenses / 12).toFixed(2)}/mo</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-slate-600 text-sm font-medium">ANNUAL</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{currency} {annualExpenses.toFixed(2)}</p>
          <p className="text-slate-600 text-sm mt-1">{currency} {(annualExpenses / 12).toFixed(2)}/mo</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-slate-600 text-sm font-medium">ANNUALIZED TOTAL</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{currency} {annualExpenses.toFixed(2)}</p>
          <p className="text-slate-600 text-sm mt-1">run rate</p>
        </div>
      </div>

      {/* Add Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="mb-6 flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
      >
        <Plus size={20} /> Add Expense
      </button>

      {/* Expenses List */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        {loading ? (
          <p className="text-center text-slate-600 py-8">Loading...</p>
        ) : expenses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">No expense entries yet</p>
            <p className="text-slate-500">Add your first expense to get started.</p>
          </div>
        ) : (
          <TransactionList transactions={expenses} type="expense" currency={currency} />
        )}
      </div>

      {/* Add Expense Modal */}
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddExpense}
        type="expense"
      />
    </div>
  );
}
