import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ScrollClient from '@/components/ScrollClient';

export default async function Home() {
  const { userId } = await auth();
  
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
              ₹
            </div>
            <span className="text-xl font-semibold text-gray-900">Expense Tracker Pro</span>
          </div>
          <div className="flex gap-3">
            <ScrollClient id="features" className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Features
            </ScrollClient>
            <Link href="/sign-in" className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Sign In
            </Link>
            <Link href="/sign-up" className="px-6 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 font-medium transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Stop wondering where your money goes
          </h1>
          <p className="text-2xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Every expense tracked. Every category clear. Take control of your finances with a tool that actually listens to what matters to you.
          </p>
          <Link href="/sign-up" className="inline-block px-8 py-4 bg-emerald-600 text-white text-lg font-semibold rounded-full hover:bg-emerald-700 transition-colors">
            Start Tracking Free
          </Link>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                The Money Puzzle
              </h2>
              <ul className="space-y-4 text-gray-700 text-lg">
                <li className="flex gap-4">
                  <span className="text-2xl">💳</span>
                  <span>You swipe cards everywhere but never remember what you spent</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-2xl">📊</span>
                  <span>Bank apps show numbers, not insights</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-2xl">🤷</span>
                  <span>By month&apos;s end, your budget is a mystery</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-2xl">😰</span>
                  <span>Spreadsheets are painful. Money feels chaotic.</span>
                </li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="mt-8 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-3 bg-gray-200 rounded w-2/5"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Meet Expense Tracker Pro
            </h2>
            <p className="text-xl text-gray-600">
              The clarity you&apos;ve been looking for
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '⚡',
                title: 'Add in Seconds',
                desc: 'One tap. One swipe. That&apos;s it. Categorize expenses so fast you&apos;ll actually do it.',
              },
              {
                icon: '📊',
                title: 'See the Picture',
                desc: 'Beautiful charts show where your money actually goes. No confusion. Just clarity.',
              },
              {
                icon: '🎯',
                title: 'Stay on Track',
                desc: 'Set budgets for each category and get gentle nudges before you overspend.',
              },
              {
                icon: '📱',
                title: 'Anywhere, Anytime',
                desc: 'Mobile-first design means you can track expenses on the go, from anywhere.',
              },
              {
                icon: '🔒',
                title: 'Your Data, Your Rules',
                desc: 'Bank-level encryption. Your financial data is yours and yours alone.',
              },
              {
                icon: '📈',
                title: 'Understand Trends',
                desc: 'Monthly reports help you spot patterns and make smarter spending decisions.',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-8 bg-gray-50 rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-emerald-600 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { stat: '50K+', label: 'Active Users' },
              { stat: '$2.4B', label: 'Expenses Tracked' },
              { stat: '98%', label: 'User Satisfaction' },
              { stat: '24/7', label: 'Support' },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="text-4xl font-bold mb-2">{item.stat}</div>
                <div className="text-emerald-100">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to take control?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Join thousands of people who stopped guessing and started tracking. Your financial clarity starts today.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/sign-up" className="inline-block px-8 py-4 bg-emerald-600 text-white text-lg font-semibold rounded-full hover:bg-emerald-700 transition-colors">
              Start Free Today
            </Link>
            <ScrollClient id="features" className="px-8 py-4 border-2 border-gray-300 text-gray-900 text-lg font-semibold rounded-full hover:border-emerald-600 hover:text-emerald-600 transition-colors">
              Learn More
            </ScrollClient>
          </div>
          <p className="text-gray-600 mt-6">
            No credit card required. No commitment. Just the freedom to understand your finances.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><ScrollClient id="features" className="hover:text-white transition-colors">Features</ScrollClient></li>
                <li><button className="hover:text-white transition-colors">Pricing</button></li>
                <li><button className="hover:text-white transition-colors">Security</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><button className="hover:text-white transition-colors">About</button></li>
                <li><button className="hover:text-white transition-colors">Blog</button></li>
                <li><button className="hover:text-white transition-colors">Careers</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><button className="hover:text-white transition-colors">Privacy</button></li>
                <li><button className="hover:text-white transition-colors">Terms</button></li>
                <li><button className="hover:text-white transition-colors">Cookie Policy</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-sm">
                <li><button className="hover:text-white transition-colors">Twitter</button></li>
                <li><button className="hover:text-white transition-colors">LinkedIn</button></li>
                <li><button className="hover:text-white transition-colors">Facebook</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 Expense Tracker Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
