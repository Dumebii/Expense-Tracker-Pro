import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutIcon } from 'lucide-react';

export default async function Home() {
  const { userId } = await auth();
  
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
              <LayoutIcon size={20} />
            </div>
            <span className="text-xl font-semibold text-slate-900">Ledger</span>
          </div>
          <div className="flex gap-3">
            <Link href="/sign-in" className="px-4 py-2 text-slate-700 hover:text-slate-900 font-medium transition-colors">
              Sign In
            </Link>
            <Link href="/sign-up" className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Your Financial Command Center
          </h1>
          <p className="text-2xl text-slate-600 mb-12 max-w-2xl mx-auto">
            Track income and expenses, monitor profit & loss, and get AI-powered financial advice all in one place.
          </p>
          <Link href="/sign-up" className="inline-block px-8 py-4 bg-slate-900 text-white text-lg font-semibold rounded-lg hover:bg-slate-800 transition-colors">
            Start Free
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-50 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 text-center mb-16">
            Everything You Need
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '💰',
                title: 'Income Tracking',
                desc: 'Track all your income sources with frequency support (one-time, monthly, annual).',
              },
              {
                icon: '📊',
                title: 'Expense Management',
                desc: 'Categorize and monitor expenses with detailed analytics and trends.',
              },
              {
                icon: '📈',
                title: 'Profit & Loss',
                desc: 'Visual breakdown of your financial health with category-based insights.',
              },
              {
                icon: '🧾',
                title: 'Receipts',
                desc: 'Generate and organize receipts for all your business expenses.',
              },
              {
                icon: '📋',
                title: 'Statements',
                desc: 'Generate detailed account statements for any date range.',
              },
              {
                icon: '🤖',
                title: 'AI Advisor',
                desc: 'Get personalized financial advice powered by AI.',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-6 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-all"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">
            Ready to take control?
          </h2>
          <p className="text-xl text-slate-600 mb-10">
            Get started with Ledger today and get complete visibility into your finances.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/sign-up" className="inline-block px-8 py-4 bg-slate-900 text-white text-lg font-semibold rounded-lg hover:bg-slate-800 transition-colors">
              Start Free
            </Link>
            <Link href="/sign-in" className="inline-block px-8 py-4 border-2 border-slate-300 text-slate-900 text-lg font-semibold rounded-lg hover:border-slate-900 transition-colors">
              Sign In
            </Link>
          </div>
          <p className="text-slate-600 mt-6">
            No credit card required. Start tracking immediately.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 rounded bg-emerald-500"></div>
            <span className="text-white font-semibold">Ledger</span>
          </div>
          <p className="text-sm">&copy; 2026 Ledger. Your Financial Command Center.</p>
        </div>
      </footer>
    </main>
  );
}
