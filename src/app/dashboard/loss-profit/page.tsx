'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PLData {
  totalIncome: number;
  totalExpenses: number;
  netP_L: number;
  byCategory: any[];
  currency: string;
}

export default function LossProfitPage() {
  const { userId } = useAuth();
  const [data, setData] = useState<PLData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    async function fetchData() {
      try {
        const response = await fetch('/api/dashboard/loss-profit', {
          headers: { 'user-id': userId },
        });
        if (!response.ok) throw new Error('Failed to fetch');
        const result = await response.json();
        setData(result);
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

  const chartData = [
    { name: 'Income', value: data?.totalIncome || 0 },
    { name: 'Expenses', value: data?.totalExpenses || 0 },
  ];

  const COLORS = ['#10b981', '#ef4444'];

  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">Profit & Loss</h1>
        <p className="text-slate-600 mt-2">Income vs expenses breakdown</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-slate-600 text-sm font-medium">TOTAL INCOME</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">
            {data?.currency} {(data?.totalIncome || 0).toFixed(2)}
          </p>
          <p className="text-slate-600 text-sm mt-1">{data?.currency} {((data?.totalIncome || 0) / 12).toFixed(2)}/mo</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-slate-600 text-sm font-medium">TOTAL EXPENSES</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {data?.currency} {(data?.totalExpenses || 0).toFixed(2)}
          </p>
          <p className="text-slate-600 text-sm mt-1">{data?.currency} {((data?.totalExpenses || 0) / 12).toFixed(2)}/mo</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-slate-600 text-sm font-medium">NET P&L</p>
          <p className={`text-3xl font-bold mt-2 ${(data?.netP_L || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {data?.currency} {(data?.netP_L || 0).toFixed(2)}
          </p>
          <p className="text-slate-600 text-sm mt-1">{data?.currency} {((data?.netP_L || 0) / 12).toFixed(2)}/mo run rate</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Visual Breakdown */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Visual Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">By Category</h3>
          {(data?.byCategory || []).length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-slate-600">
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data?.byCategory || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(data?.byCategory || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Income & Expense Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Income by Category</h3>
          <p className="text-slate-600 text-center py-8">No income recorded</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Expenses by Category</h3>
          <p className="text-slate-600 text-center py-8">No expenses recorded</p>
        </div>
      </div>
    </div>
  );
}
