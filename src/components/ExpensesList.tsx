'use client';

import { Expense } from '@/hooks/useExpenses';
import { useState } from 'react';

interface ExpensesListProps {
  expenses: Expense[];
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Expense>) => Promise<void>;
  onCancel?: (id: string) => Promise<void>;
}

export default function ExpensesList({ expenses, onDelete, onUpdate, onCancel }: ExpensesListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const categoryColors: Record<string, string> = {
    Food: 'bg-orange-100 text-orange-800',
    Transport: 'bg-blue-100 text-blue-800',
    Entertainment: 'bg-purple-100 text-purple-800',
    Shopping: 'bg-pink-100 text-pink-800',
    Bills: 'bg-red-100 text-red-800',
    Health: 'bg-green-100 text-green-800',
    Education: 'bg-indigo-100 text-indigo-800',
    Other: 'bg-gray-100 text-gray-800',
  };

  const frequencyLabels = {
    one_time: 'One Time',
    monthly: 'Monthly',
    annually: 'Annually',
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  return (
    <div className="space-y-3">
      {expenses.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No expenses yet</p>
      ) : (
        expenses.map((expense) => (
          <div
            key={expense.id}
            className={`p-4 border rounded-lg transition-all ${
              expense.status === 'cancelled'
                ? 'bg-gray-50 border-gray-200 opacity-60'
                : 'bg-white border-gray-200 hover:shadow-md'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className={`font-semibold text-gray-900 ${expense.status === 'cancelled' ? 'line-through' : ''}`}>
                      {expense.title}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[expense.category] || categoryColors.Other}`}>
                        {expense.category}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {frequencyLabels[expense.frequency as keyof typeof frequencyLabels] || expense.frequency}
                      </span>
                      {expense.status === 'cancelled' && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          Cancelled
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(expense.date)}</p>
                    {expense.notes && <p className="text-xs text-gray-600 mt-1">Notes: {expense.notes}</p>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-lg">
                    {expense.currency} {expense.amount.toFixed(2)}
                  </p>
                </div>

                <div className="flex gap-2">
                  {expense.status !== 'cancelled' && (
                    <>
                      <button
                        onClick={() => onUpdate(expense.id, {})}
                        className="px-3 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                        title="Edit expense"
                      >
                        Edit
                      </button>
                      {onCancel && (
                        <button
                          onClick={() => onCancel(expense.id)}
                          className="px-3 py-1 text-xs border border-yellow-300 text-yellow-700 rounded hover:bg-yellow-50 transition-colors"
                          title="Cancel this expense"
                        >
                          Cancel
                        </button>
                      )}
                    </>
                  )}
                  <button
                    onClick={() => onDelete(expense.id)}
                    className="px-3 py-1 text-xs border border-red-300 text-red-700 rounded hover:bg-red-50 transition-colors"
                    title="Delete expense"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
