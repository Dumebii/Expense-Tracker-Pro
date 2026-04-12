'use client';

import { Expense } from '@/hooks/useExpenses';
import { useState } from 'react';
import { format } from 'date-fns';

interface ExpensesListProps {
  expenses: Expense[];
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Expense>) => Promise<void>;
}

export default function ExpensesList({ expenses, onDelete, onUpdate }: ExpensesListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Expense>>({});

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

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setEditForm(expense);
  };

  const handleSave = async () => {
    if (editingId) {
      await onUpdate(editingId, editForm);
      setEditingId(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors"
        >
          {editingId === expense.id ? (
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={editForm.title || ''}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full px-3 py-1 border border-border rounded bg-background text-foreground"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={editForm.amount || ''}
                  onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
                  className="flex-1 px-3 py-1 border border-border rounded bg-background text-foreground"
                />
                <input
                  type="date"
                  value={editForm.date || ''}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  className="flex-1 px-3 py-1 border border-border rounded bg-background text-foreground"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 px-3 py-1 border border-border text-foreground rounded text-sm hover:bg-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{expense.title}</p>
                    <p className="text-sm text-muted-foreground">{format(new Date(expense.date), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[expense.category] || categoryColors.Other}`}>
                {expense.category}
              </span>
              <div className="flex items-center gap-4 ml-4">
                <p className="font-bold text-foreground min-w-fit">₹{expense.amount.toFixed(2)}</p>
                <button
                  onClick={() => handleEdit(expense)}
                  className="px-3 py-1 text-sm border border-border text-foreground rounded hover:bg-secondary transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(expense.id)}
                  className="px-3 py-1 text-sm border border-destructive text-destructive rounded hover:bg-destructive/10 transition-colors"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
