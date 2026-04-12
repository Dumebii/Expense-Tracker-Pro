'use client';

import { Expense } from '@/hooks/useExpenses';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ExpenseStatsProps {
  expenses: Expense[];
}

export default function ExpenseStats({ expenses }: ExpenseStatsProps) {
  const categories = [...new Set(expenses.map(exp => exp.category))];
  const categoryData = categories.map(cat => ({
    name: cat,
    value: expenses.filter(exp => exp.category === cat).reduce((sum, exp) => sum + exp.amount, 0),
  }));

  const colors = ['#ff7c3b', '#3b82f6', '#a855f7', '#ec4899', '#ef4444', '#10b981', '#6366f1', '#6b7280'];

  return (
    <div className="space-y-6">
      <div className="bg-background border border-border rounded-lg p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Spending by Category</h3>
        {categoryData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ₹${value.toFixed(0)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">No data to display</p>
        )}
      </div>

      <div className="bg-background border border-border rounded-lg p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Category Breakdown</h3>
        <div className="space-y-3">
          {categoryData
            .sort((a, b) => b.value - a.value)
            .map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-foreground">{item.name}</span>
                </div>
                <span className="font-semibold text-foreground">₹{item.value.toFixed(2)}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
