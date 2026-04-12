import { useState, useEffect } from 'react';

export interface Expense {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  description: string | null;
  frequency: 'monthly' | 'annually' | 'one_time';
  currency: string;
  status: 'active' | 'cancelled';
  renewal_date: string | null;
  purchase_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = async (filters?: { category?: string; frequency?: string; status?: string }) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.frequency) params.append('frequency', filters.frequency);
      if (filters?.status) params.append('status', filters.status);

      const response = await fetch(`/api/expenses?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch expenses');
      const data = await response.json();
      setExpenses(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const addExpense = async (expense: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      });
      if (!response.ok) throw new Error('Failed to add expense');
      const newExpense = await response.json();
      setExpenses([newExpense, ...expenses]);
      return newExpense;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      throw err;
    }
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update expense');
      const updated = await response.json();
      setExpenses(expenses.map(e => e.id === id ? updated : e));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      throw err;
    }
  };

  const cancelExpense = async (id: string) => {
    try {
      const response = await fetch(`/api/expenses/${id}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (!response.ok) throw new Error('Failed to cancel expense');
      const updated = await response.json();
      setExpenses(expenses.map(e => e.id === id ? updated : e));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      throw err;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete expense');
      setExpenses(expenses.filter(e => e.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      throw err;
    }
  };

  const generateReceipt = async (id: string, emailTo?: string) => {
    try {
      const url = new URL(`/api/expenses/${id}/receipt`, window.location.origin);
      if (emailTo) url.searchParams.append('emailTo', emailTo);

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to generate receipt');
      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      throw err;
    }
  };

  return {
    expenses,
    loading,
    error,
    fetchExpenses,
    addExpense,
    updateExpense,
    cancelExpense,
    deleteExpense,
    generateReceipt,
  };
}
