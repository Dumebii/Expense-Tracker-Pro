'use client';

import { Expense } from '@/hooks/useExpenses';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useState, useEffect } from 'react';

interface ExpenseStatsProps {
  expenses: Expense[];
}

interface Summary {
  totalMonthly: number;
  totalAnnually: number;
  totalOneTime: number;
  totalAllAnnualized: number;
  byCategory: Array<{ category: string; total: number; count: number }>;
  activeCount: number;
  cancelledCount: number;
}

export default function ExpenseStats({ expenses }: ExpenseStatsProps) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch('/api/expenses/summary');
        if (response.ok) {
          const data = await response.json();
          setSummary(data);
        }
      } catch (error) {
        console.error('Failed to fetch summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [expenses]);

  const categories = [...new Set(expenses.map((exp) => exp.category))];
  const categoryData = categories.map((cat) => ({
    name: cat,
    value: expenses
      .filter((exp) => exp.category === cat && exp.status === 'active')
      .reduce((sum, exp) => sum + exp.amount, 0),
  }));

  const colors = ['#ff7c3b', '#3b82f6', '#a855f7', '#ec4899', '#ef4444', '#10b981', '#6366f1', '#6b7280'];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Summary</h3>
        {loading ? (
          <p className="text-gray-500 text-center py-4">Loading...</p>
        ) : summary ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-600">Monthly</span>
              <span className="font-semibold text-gray-900">${summary.totalMonthly.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-600">Annually</span>
              <span className="font-semibold text-gray-900">${summary.totalAnnually.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-600">One-Time</span>
              <span className="font-semibold text-gray-900">${summary.totalOneTime.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 bg-emerald-50 p-3 rounded border border-emerald-200">
              <span className="text-emerald-900 font-semibold">Total (Annualized)</span>
              <span className="font-bold text-emerald-900">${summary.totalAllAnnualized.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <p className="text-xs text-blue-600">Active</p>
                <p className="text-lg font-bold text-blue-900">{summary.activeCount}</p>
              </div>
              <div className="bg-red-50 p-3 rounded border border-red-200">
                <p className="text-xs text-red-600">Cancelled</p>
                <p className="text-lg font-bold text-red-900">{summary.cancelledCount}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Pie Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Spending by Category</h3>
        {categoryData.length > 0 && categoryData.some((cat) => cat.value > 0) ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData.filter((cat) => cat.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: $${value.toFixed(0)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No active expenses to display</p>
        )}
      </div>

      {/* Category Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Category Breakdown</h3>
        {summary && summary.byCategory.length > 0 ? (
          <div className="space-y-3">
            {summary.byCategory
              .sort((a, b) => b.total - a.total)
              .map((item, index) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{item.category}</p>
                      <p className="text-xs text-gray-500">{item.count} expense(s)</p>
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900">${item.total.toFixed(2)}</span>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No category data available</p>
        )}
      </div>
    </div>
  );
}
