import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200">
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
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Expenses', value: '$0', color: 'bg-emerald-100 text-emerald-700' },
            { label: 'This Month', value: '$0', color: 'bg-blue-100 text-blue-700' },
            { label: 'Budget Left', value: '$0', color: 'bg-purple-100 text-purple-700' },
          ].map((stat, idx) => (
            <div key={idx} className={`p-6 rounded-lg ${stat.color}`}>
              <p className="text-sm font-medium mb-2">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to your Dashboard</h2>
          <p className="text-gray-600 mb-8">
            Start tracking your expenses by adding your first expense. Your spending analysis will appear here.
          </p>
          <button className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
            Add Your First Expense
          </button>
        </div>

        {/* Coming Soon Features */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Features Coming Soon</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Expense Tracker', desc: 'Add and categorize your expenses' },
              { title: 'Analytics', desc: 'View spending patterns and insights' },
              { title: 'Budget Management', desc: 'Set and track your budgets' },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
