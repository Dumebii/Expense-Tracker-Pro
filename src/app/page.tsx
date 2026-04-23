import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect('/dashboard');

  return (
    <main className="min-h-screen bg-[#050d1a] text-white overflow-x-hidden">

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 bg-[#050d1a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <NchikoLogoMark size={32} />
            <span className="text-xl font-bold tracking-tight">Nchiko</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium transition-colors">
              Sign In
            </Link>
            <Link href="/sign-up" className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-lg transition-colors">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-24 px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-24 left-1/4 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Multi-currency · AI-powered · Real-time insights
            </div>

            <h1 className="text-5xl sm:text-7xl font-extrabold leading-tight tracking-tight mb-6">
              Know exactly{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                where every
              </span>
              <br />
              naira goes.
            </h1>

            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Nchiko is a financial command center for entrepreneurs and freelancers.
              Track income, manage expenses, generate receipts and get AI-powered
              insights — across any currency.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up" className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-lg rounded-xl transition-all shadow-lg shadow-emerald-500/20">
                Start for free →
              </Link>
              <Link href="/sign-in" className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-lg rounded-xl transition-all">
                Sign in
              </Link>
            </div>

            <p className="text-slate-500 text-sm mt-5">No credit card required.</p>
          </div>

          {/* Mini dashboard mockup */}
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-t from-[#050d1a] via-transparent to-transparent z-10 pointer-events-none" />
            <div className="bg-[#0d1f35] border border-white/10 rounded-2xl p-5 shadow-2xl">
              {/* Fake topbar */}
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-white/5">
                <NchikoLogoMark size={24} />
                <span className="text-sm font-semibold text-white">Nchiko</span>
                <div className="ml-auto flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                </div>
              </div>
              {/* Fake stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Total Income',  value: '$24,810', color: 'text-emerald-400' },
                  { label: 'Total Expenses',value: '$9,240',  color: 'text-red-400' },
                  { label: 'Net P&L',       value: '$15,570', color: 'text-emerald-400' },
                  { label: 'Annualized Net',value: '$186,840',color: 'text-blue-400' },
                ].map(s => (
                  <div key={s.label} className="bg-[#0a1628] border border-white/5 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
              {/* Fake recent transactions */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="bg-[#0a1628] border border-white/5 rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Recent Income</p>
                  {[
                    { name: 'Freelance Project', amt: '+₦750,000', date: 'Apr 22' },
                    { name: 'Monthly Retainer',  amt: '+$2,400',   date: 'Apr 18' },
                    { name: 'Consulting Fee',    amt: '+£800',     date: 'Apr 10' },
                  ].map(t => (
                    <div key={t.name} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-white">{t.name}</p>
                        <p className="text-xs text-slate-500">{t.date}</p>
                      </div>
                      <p className="text-sm font-semibold text-emerald-400">{t.amt}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-[#0a1628] border border-white/5 rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Recent Expenses</p>
                  {[
                    { name: 'Server Hosting',  amt: '-$40',    cat: 'Hosting' },
                    { name: 'Twitter Premium', amt: '-$8',     cat: 'Social Media' },
                    { name: 'Office Supplies', amt: '-₦28,000',cat: 'Utilities' },
                  ].map(t => (
                    <div key={t.name} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-white">{t.name}</p>
                        <p className="text-xs text-slate-500">{t.cat}</p>
                      </div>
                      <p className="text-sm font-semibold text-red-400">{t.amt}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Currency strip ─────────────────────────────────────────── */}
      <section className="py-10 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-slate-500 text-sm font-medium uppercase tracking-widest mb-6">
            Supports all major currencies
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { code: 'USD', symbol: '$',  name: 'US Dollar' },
              { code: 'NGN', symbol: '₦',  name: 'Naira' },
              { code: 'GBP', symbol: '£',  name: 'Pound' },
              { code: 'EUR', symbol: '€',  name: 'Euro' },
              { code: 'INR', symbol: '₹',  name: 'Rupee' },
              { code: 'JPY', symbol: '¥',  name: 'Yen' },
              { code: 'AUD', symbol: 'A$', name: 'Aus Dollar' },
            ].map(c => (
              <div key={c.code} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                <span className="text-emerald-400 font-bold text-base">{c.symbol}</span>
                <span className="text-white text-sm font-semibold">{c.code}</span>
                <span className="text-slate-500 text-xs">{c.name}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-600 text-xs mt-5">
            All amounts auto-converted to your display currency using live exchange rates.
          </p>
        </div>
      </section>

      {/* ── Features grid ──────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">What&apos;s inside</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Everything you need</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Eight powerful modules — all talking to each other, all inside one clean dashboard.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                emoji: '📊',
                title: 'Overview Dashboard',
                desc: 'See total income, expenses, net P&L, and your annualized run rate at a glance.',
                color: 'from-blue-500/10 to-blue-600/5 border-blue-500/20',
              },
              {
                emoji: '💰',
                title: 'Money In',
                desc: 'Log every income source — salary, freelance, investments — with full currency support.',
                color: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20',
              },
              {
                emoji: '💳',
                title: 'Money Out',
                desc: 'Track subscriptions, one-off costs, and recurring expenses with renewal reminders.',
                color: 'from-red-500/10 to-red-600/5 border-red-500/20',
              },
              {
                emoji: '🧾',
                title: 'Receipts',
                desc: 'Generate branded receipts instantly. Download as PDF or email directly to clients.',
                color: 'from-amber-500/10 to-amber-600/5 border-amber-500/20',
              },
              {
                emoji: '📈',
                title: 'Loss / Profit',
                desc: 'Visual category breakdowns and P&L charts to understand where money moves.',
                color: 'from-purple-500/10 to-purple-600/5 border-purple-500/20',
              },
              {
                emoji: '🤖',
                title: 'AI Advisor',
                desc: 'Ask questions about your finances. Get personalised, data-driven advice.',
                color: 'from-teal-500/10 to-teal-600/5 border-teal-500/20',
              },
              {
                emoji: '📋',
                title: 'Account Statement',
                desc: 'Generate detailed statements for any date range — useful for tax season.',
                color: 'from-indigo-500/10 to-indigo-600/5 border-indigo-500/20',
              },
              {
                emoji: '🔔',
                title: 'Renewal Reminders',
                desc: 'Get email alerts 5 days before any subscription or recurring expense renews.',
                color: 'from-orange-500/10 to-orange-600/5 border-orange-500/20',
              },
            ].map((f) => (
              <div key={f.title} className={`bg-gradient-to-br ${f.color} border rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-200`}>
                <div className="text-3xl mb-4">{f.emoji}</div>
                <h3 className="text-white font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">Simple by design</p>
            <h2 className="text-4xl font-bold text-white">Up and running in minutes</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create an account', desc: 'Sign up free. No credit card, no trial limits — just start using it immediately.' },
              { step: '02', title: 'Add your transactions', desc: 'Log income and expenses in any currency. Nchiko handles conversion to your dashboard currency in real time.' },
              { step: '03', title: 'Get the full picture', desc: 'See P&L charts, generate receipts for clients, talk to your AI advisor, and set renewal alerts.' },
            ].map((s) => (
              <div key={s.step} className="relative">
                <div className="text-7xl font-black text-white/5 absolute -top-3 -left-2 leading-none">{s.step}</div>
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4">
                    <span className="text-emerald-400 text-sm font-bold">{s.step}</span>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{s.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-8 text-center">
          {[
            { value: '7',       label: 'Currencies supported',      sub: 'USD, NGN, GBP, EUR, INR, JPY, AUD' },
            { value: '8',       label: 'Dashboard modules',          sub: 'From receipts to AI insights' },
            { value: '5 days',  label: 'Renewal alerts in advance',  sub: 'Never miss a subscription charge' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-5xl font-black text-emerald-400 mb-2">{s.value}</p>
              <p className="text-white font-semibold mb-1">{s.label}</p>
              <p className="text-slate-500 text-sm">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="relative bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent border border-emerald-500/20 rounded-3xl p-12 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-transparent pointer-events-none" />
            <div className="relative">
              <NchikoLogoMark size={52} className="mx-auto mb-6" />
              <h2 className="text-4xl font-bold text-white mb-4">
                Take control of your finances — today.
              </h2>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                Join entrepreneurs and freelancers who use Nchiko to stay on top of every naira, dollar, and pound.
              </p>
              <Link href="/sign-up" className="inline-block px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-lg rounded-xl transition-all shadow-xl shadow-emerald-500/20">
                Get started — it&apos;s free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <NchikoLogoMark size={28} />
            <span className="text-white font-semibold">Nchiko</span>
            <span className="text-slate-600 text-sm">– Financial Command Center</span>
          </div>
          <p className="text-slate-600 text-sm">
            &copy; {new Date().getFullYear()} Nchiko. Powered by{' '}
            <a href="https://ozigi.app" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
              Ozigi
            </a>
          </p>
        </div>
      </footer>

    </main>
  );
}

/* ── Shared logo mark ─────────────────────────────────────────────── */
function NchikoLogoMark({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="40" height="40" rx="10" fill="#10b981" />
      <line x1="9"  y1="30" x2="9"  y2="10" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="9"  y1="10" x2="31" y2="30" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="31" y1="30" x2="31" y2="10" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="31" cy="10" r="3.5" fill="#f0fdf4" />
    </svg>
  );
}
