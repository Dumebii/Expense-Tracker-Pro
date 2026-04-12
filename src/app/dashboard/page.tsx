'use client';

import { useEffect, useState } from 'react';
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { useExpenses } from '@/hooks/useExpenses';
import AddExpenseModal from '@/components/AddExpenseModal';
import ExpensesList from '@/components/ExpensesList';
import ExpenseStats from '@/components/ExpenseStats';

export default function DashboardPage() {
  const { expenses, loading, addExpense, updateExpense, deleteExpense, cancelExpense, generateReceipt } = useExpenses();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };
    loadUser();
  }, []);

  const activeExpenses = expenses.filter((exp) => exp.status === 'active');
  const totalExpenses = activeExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const thisMonthExpenses = activeExpenses
    .filter((exp) => {
      const expDate = new Date(exp.date);
      const now = new Date();
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
              ₹
            </div>
            <span className="text-xl font-semibold text-gray-900">Expense Tracker Pro</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user?.firstName || 'User'}</span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-emerald-100 text-emerald-700 p-6 rounded-lg">
            <p className="text-sm font-medium mb-2">Total Expenses</p>
            <p className="text-3xl font-bold">₹{totalExpenses.toFixed(2)}</p>
          </div>
          <div className="bg-blue-100 text-blue-700 p-6 rounded-lg">
            <p className="text-sm font-medium mb-2">This Month</p>
            <p className="text-3xl font-bold">₹{thisMonthExpenses.toFixed(2)}</p>
          </div>
          <div className="bg-purple-100 text-purple-700 p-6 rounded-lg">
            <p className="text-sm font-medium mb-2">Total Transactions</p>
            <p className="text-3xl font-bold">{expenses.length}</p>
          </div>
        </div>

        {/* Add Button */}
        <div className="mb-8">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
          >
            + Add Expense
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Expenses List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Expenses</h2>
              {loading ? (
                <p className="text-gray-500 text-center py-8">Loading expenses...</p>
              ) : expenses.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No expenses yet. Add your first expense to get started!</p>
              ) : (
                <ExpensesList 
                  expenses={expenses} 
                  onDelete={deleteExpense} 
                  onUpdate={updateExpense}
                  onCancel={cancelExpense}
                />
              )}
            </div>
          </div>

          {/* Analytics Sidebar */}
          <div className="lg:col-span-1">
            <ExpenseStats expenses={expenses} />
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={async (expense) => {
          await addExpense(expense);
          setIsAddModalOpen(false);
        }}
      />
    </main>
  );
}
