'use client';

import { useUser, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useExpenses } from '@/hooks/useExpenses';
import { useState } from 'react';
import AddExpenseModal from '@/components/AddExpenseModal';
import ExpensesList from '@/components/ExpensesList';
import ExpenseStats from '@/components/ExpenseStats';

export default function Dashboard() {
  const { user } = useUser();
  const { expenses, loading, addExpense, updateExpense, deleteExpense, fetchExpenses } = useExpenses();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const categories = [...new Set(expenses.map(exp => exp.category))];
  const categoryTotals = categories.map(cat => ({
    category: cat,
    total: expenses.filter(exp => exp.category === cat).reduce((sum, exp) => sum + exp.amount, 0),
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">₹</span>
            </div>
            <h1 className="text-xl font-bold text-foreground hidden sm:block">Expense Tracker Pro</h1>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {user?.firstName || 'User'}!</span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-background border border-border rounded-lg p-6">
            <p className="text-muted-foreground text-sm mb-2">Total Expenses</p>
            <p className="text-3xl font-bold text-foreground">₹{totalExpenses.toFixed(2)}</p>
          </div>
          <div className="bg-background border border-border rounded-lg p-6">
            <p className="text-muted-foreground text-sm mb-2">Transactions</p>
            <p className="text-3xl font-bold text-foreground">{expenses.length}</p>
          </div>
          <div className="bg-background border border-border rounded-lg p-6">
            <p className="text-muted-foreground text-sm mb-2">Categories</p>
            <p className="text-3xl font-bold text-foreground">{categories.length}</p>
          </div>
        </div>

        {/* Add Expense Button */}
        <div className="mb-8">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
          >
            + Add Expense
          </button>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Expenses List */}
          <div className="lg:col-span-2">
            <div className="bg-background border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold text-foreground mb-6">Recent Expenses</h2>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : expenses.length === 0 ? (
                <p className="text-muted-foreground">No expenses yet. Add your first expense to get started!</p>
              ) : (
                <ExpensesList
                  expenses={expenses}
                  onDelete={deleteExpense}
                  onUpdate={updateExpense}
                />
              )}
            </div>
          </div>

          {/* Analytics Sidebar */}
          <div className="lg:col-span-1">
            <ExpenseStats expenses={expenses} />
          </div>
        </div>
      </main>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={async (expense) => {
          await addExpense(expense);
          setIsAddModalOpen(false);
        }}
      />
    </div>
  );
}
