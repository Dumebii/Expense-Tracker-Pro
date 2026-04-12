import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect('/dashboard');

  return (
    <main className="min-h-screen flex flex-col">
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold">Expense Tracker Pro</h1>
          <div className="flex gap-4">
            <Link href="/sign-in" className="px-4 py-2 hover:text-gray-600">
              Sign In
            </Link>
            <Link href="/sign-up" className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="flex-1 flex items-center justify-center px-4 text-center">
        <div>
          <h2 className="text-5xl font-bold mb-4">Take Control of Your Finances</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl">
            Track every expense, analyze spending patterns, and reach your financial goals with Expense Tracker Pro.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/sign-up" className="px-8 py-3 bg-emerald-600 text-white rounded hover:bg-emerald-700">
              Start Tracking Free
            </Link>
            <Link href="#features" className="px-8 py-3 border border-gray-300 rounded hover:bg-gray-50">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <section id="features" className="bg-gray-50 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Why Choose Expense Tracker Pro?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Easy Tracking', desc: 'Quickly add and categorize expenses' },
              { title: 'Smart Analytics', desc: 'Visualize spending with charts' },
              { title: 'Budget Management', desc: 'Set and track spending limits' },
            ].map((f, i) => (
              <div key={i} className="bg-white p-6 rounded border border-gray-200">
                <h4 className="font-semibold mb-2">{f.title}</h4>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t bg-gray-50 py-8 text-center text-gray-600">
        <p>&copy; 2024 Expense Tracker Pro. All rights reserved.</p>
      </footer>
    </main>
  );
}
