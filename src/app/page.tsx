import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Receipt,
  BarChart2,
  BrainCircuit,
  FileSpreadsheet,
  BellRing,
  type LucideIcon,
} from 'lucide-react';
import AppInstallButton from '@/components/AppInstallButton';

type FeatureCard = {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  desc: string;
  accent: string;
};

const FEATURES: FeatureCard[] = [
  { icon: LayoutDashboard, iconColor: 'text-blue-400',   accent: 'bg-blue-500/20',   title: 'Overview Dashboard',   desc: 'Total income, expenses, net P&L, and annualized run rate at a glance.' },
  { icon: TrendingUp,      iconColor: 'text-emerald-400',accent: 'bg-emerald-500/20',title: 'Money In',             desc: 'Log every income source with full currency support.' },
  { icon: TrendingDown,    iconColor: 'text-red-400',    accent: 'bg-red-500/20',    title: 'Money Out',            desc: 'Track subscriptions, one-off costs, and recurring expenses.' },
  { icon: Receipt,         iconColor: 'text-amber-400',  accent: 'bg-amber-500/20',  title: 'Receipts',             desc: 'Generate branded receipts instantly. Download as PDF or email to clients.' },
  { icon: BarChart2,       iconColor: 'text-purple-400', accent: 'bg-purple-500/20', title: 'Loss / Profit',        desc: 'Visual category breakdowns and P&L charts.' },
  { icon: BrainCircuit,    iconColor: 'text-teal-400',   accent: 'bg-teal-500/20',   title: 'AI Advisor',           desc: 'Ask questions about your finances and get data-driven answers.' },
  { icon: FileSpreadsheet, iconColor: 'text-indigo-400', accent: 'bg-indigo-500/20', title: 'Account Statement',    desc: 'Generate detailed statements for any date range.' },
  { icon: BellRing,        iconColor: 'text-orange-400', accent: 'bg-orange-500/20', title: 'Renewal Reminders',    desc: 'Email alerts 5 days before any subscription renews.' },
];

const TESTIMONIALS = [
  {
    quote: "I used to track everything in a spreadsheet. Nchiko replaced three spreadsheets and a calculator. The multi-currency support alone is worth it.",
    name: 'Adaeze O.',
    role: 'Freelance Designer, Lagos',
    initials: 'AO',
    color: 'bg-emerald-500',
  },
  {
    quote: "The AI Advisor actually knows my numbers. It told me my hosting costs were 23% of my expenses and I had no idea. That's the kind of insight I needed.",
    name: 'James K.',
    role: 'Software Consultant, Nairobi',
    initials: 'JK',
    color: 'bg-blue-500',
  },
  {
    quote: "Generating receipts for clients used to take me 20 minutes in Word. Now it's one click. My clients think I'm more professional because of it.",
    name: 'Temi A.',
    role: 'Brand Strategist, Abuja',
    initials: 'TA',
    color: 'bg-purple-500',
  },
];

export default async function Home() {
  const { userId } = await auth();

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
            {userId ? (
              <Link href="/dashboard" className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-lg transition-colors">
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium transition-colors">
                  Sign In
                </Link>
                <Link href="/sign-up" className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-lg transition-colors">
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/30 via-transparent to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

            {/* Left — copy */}
            <div className="flex-1 lg:max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-8">
                Multi-currency · AI-powered
              </div>

              <h1 className="text-5xl sm:text-6xl font-extrabold leading-[1.05] tracking-tight mb-6">
                Know exactly<br />
                <span className="text-emerald-400">where every</span><br />
                CENT goes.
              </h1>

              <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-md">
                Nchiko is a financial command center for entrepreneurs and freelancers.
                Track income, expenses, receipts, and get AI-powered insights — in any currency.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                {userId ? (
                  <Link href="/dashboard" className="inline-flex items-center justify-center px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20">
                    Go to Dashboard →
                  </Link>
                ) : (
                  <>
                    <Link href="/sign-up" className="inline-flex items-center justify-center px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20">
                      Start for free →
                    </Link>
                    <Link href="/sign-in" className="inline-flex items-center justify-center px-7 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all">
                      Sign in
                    </Link>
                  </>
                )}
              </div>
              <p className="text-slate-600 text-sm mt-4">No credit card required.</p>
            </div>

            {/* Right — dashboard mockup */}
            <div className="flex-1 w-full lg:max-w-2xl">
              <div className="relative">
                <div className="absolute -inset-4 bg-emerald-500/5 rounded-3xl blur-2xl" />
                <div className="relative bg-[#0d1f35] border border-white/10 rounded-2xl p-5 shadow-2xl">
                  <div className="flex items-center gap-2 mb-5 pb-4 border-b border-white/5">
                    <NchikoLogoMark size={22} />
                    <span className="text-sm font-semibold text-white">Nchiko</span>
                    <div className="ml-auto flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/60" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {[
                      { label: 'Total Income',   value: '$24,810', color: 'text-emerald-400' },
                      { label: 'Total Expenses', value: '$9,240',  color: 'text-red-400' },
                      { label: 'Net P&L',        value: '$15,570', color: 'text-emerald-400' },
                      { label: 'Annualized Net', value: '$186,840',color: 'text-blue-400' },
                    ].map(s => (
                      <div key={s.label} className="bg-[#0a1628] border border-white/5 rounded-xl p-3">
                        <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                        <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                      </div>
                    ))}
                  </div>
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
                        { name: 'Server Hosting',  amt: '-$40',     cat: 'Hosting' },
                        { name: 'Twitter Premium', amt: '-$8',      cat: 'Social Media' },
                        { name: 'Office Supplies', amt: '-₦28,000', cat: 'Utilities' },
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
          </div>
        </div>
      </section>

      {/* ── Currency strip ─────────────────────────────────────────── */}
      <section className="py-8 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-3">
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
                <span className="text-emerald-400 font-bold">{c.symbol}</span>
                <span className="text-white text-sm font-semibold">{c.code}</span>
                <span className="text-slate-500 text-xs">{c.name}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-600 text-xs mt-4">
            All amounts auto-converted to your display currency using live exchange rates.
          </p>
        </div>
      </section>

      {/* ── Editorial split — "You run the business" ───────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            {/* Left — headline */}
            <div className="flex-1">
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-6">
                You run the business.<br />
                <span className="text-emerald-400">We&apos;ll track the money.</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-md">
                Spreadsheets weren&apos;t built for freelancers juggling multiple currencies,
                clients, and subscriptions. Nchiko was.
              </p>
              <Link
                href={userId ? '/dashboard' : '/sign-up'}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all"
              >
                {userId ? 'Open Dashboard' : 'Get started free'}
              </Link>
            </div>

            {/* Right — feature list */}
            <div className="flex-1 space-y-8">
              {[
                {
                  title: 'Multi-currency by default',
                  desc: 'Log in NGN, USD, GBP, or EUR. Live exchange rates convert everything to your base currency — no plugins, no premium tier.',
                  color: 'bg-emerald-500/20 text-emerald-400',
                  icon: TrendingUp,
                },
                {
                  title: 'AI that knows your books',
                  desc: "Ask your AI Advisor questions about your actual transactions. Not generic budgeting tips — answers grounded in your specific numbers.",
                  color: 'bg-teal-500/20 text-teal-400',
                  icon: BrainCircuit,
                },
                {
                  title: 'Client-ready in seconds',
                  desc: 'Generate a professional receipt from your real data. Download as PDF or email it to the client directly from the dashboard.',
                  color: 'bg-indigo-500/20 text-indigo-400',
                  icon: Receipt,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-5">
                    <div className={`w-11 h-11 rounded-xl ${item.color} flex items-center justify-center shrink-0 mt-0.5`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-1">{item.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features grid ──────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">What&apos;s inside</p>
            <h2 className="text-4xl font-bold text-white">Eight modules.<br />One dashboard.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-[#0a1628] border border-white/8 rounded-2xl p-5 hover:-translate-y-1 transition-transform duration-200">
                  <div className={`w-9 h-9 rounded-lg ${f.accent} flex items-center justify-center mb-4`}>
                    <Icon size={18} className={f.iconColor} />
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-1.5">{f.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">Simple by design</p>
            <h2 className="text-4xl font-bold text-white">Up and running<br />in minutes.</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create your account', desc: 'Sign up free. No credit card, no trial limits — start using it immediately.' },
              { step: '02', title: 'Add your transactions', desc: 'Log income and expenses in any currency. Nchiko converts everything in real time.' },
              { step: '03', title: 'Get the full picture', desc: 'P&L charts, AI insights, client receipts, renewal alerts — all in one place.' },
            ].map((s) => (
              <div key={s.step} className="border-t-2 border-emerald-500/30 pt-6">
                <span className="text-emerald-500/50 text-sm font-bold tracking-widest">{s.step}</span>
                <h3 className="text-white font-semibold text-xl mt-3 mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">From users</p>
            <h2 className="text-4xl font-bold text-white">What people are<br />saying about Nchiko.</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="flex flex-col">
                <div className="text-emerald-400 text-4xl font-serif leading-none mb-6">&ldquo;</div>
                <p className="text-slate-300 text-base leading-relaxed flex-1 mb-8">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-slate-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Get the App ────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-4">Mobile app</p>
              <h2 className="text-4xl font-bold text-white mb-4">
                Nchiko in your pocket.
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Log a payment the moment it happens. No waiting until you&apos;re back at your desk.
              </p>
              <AppInstallButton />
              <p className="text-slate-600 text-xs mt-4">Free. No app store required.</p>
            </div>

            <div className="w-full lg:w-72 shrink-0">
              <div className="bg-[#0d1f35] border border-white/10 rounded-2xl p-6">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5">How to install</p>
                <ol className="space-y-5">
                  {[
                    { n: '1', title: 'Tap Install below', desc: 'Chrome will prompt you to add Nchiko to your home screen.' },
                    { n: '2', title: 'Confirm the install', desc: 'Tap Add — the app icon appears on your home screen instantly.' },
                    { n: '3', title: 'Open and sign in', desc: 'Launch Nchiko from your home screen and sign in to your account.' },
                  ].map((step) => (
                    <li key={step.n} className="flex gap-4">
                      <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {step.n}
                      </span>
                      <div>
                        <p className="text-white text-sm font-semibold mb-0.5">{step.title}</p>
                        <p className="text-slate-400 text-xs leading-relaxed">{step.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <NchikoLogoMark size={48} className="mx-auto mb-6" />
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Take control of your<br />finances — today.
          </h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Join entrepreneurs and freelancers who use Nchiko to stay on top of every naira, dollar, and pound.
          </p>
          <Link
            href={userId ? '/dashboard' : '/sign-up'}
            className="inline-block px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-lg rounded-xl transition-all shadow-xl shadow-emerald-500/20"
          >
            {userId ? 'Go to Dashboard →' : "Get started — it's free"}
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <NchikoLogoMark size={26} />
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

/* ── Logo mark ────────────────────────────────────────────────────── */
function NchikoLogoMark({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="40" height="40" rx="10" fill="#10b981" />
      <line x1="9"  y1="30" x2="9"  y2="10" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="9"  y1="10" x2="31" y2="30" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="31" y1="30" x2="31" y2="10" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="31" cy="10" r="3.5" fill="#f0fdf4" />
    </svg>
  );
}
