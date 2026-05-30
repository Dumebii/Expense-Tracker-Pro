import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import AppInstallButton from '@/components/AppInstallButton';

const TESTIMONIALS = [
  {
    quote: "I used to run three spreadsheets side by side just to know if I was profitable. Now I open Nchiko and it's just… there.",
    name: 'Adaeze O.',
    role: 'Freelance Designer, Lagos',
    initials: 'AO',
    color: 'bg-emerald-500',
  },
  {
    quote: "The AI Advisor told me my hosting costs were 23% of my total expenses. I had no idea. That single insight saved me money the same week.",
    name: 'James K.',
    role: 'Software Consultant, Nairobi',
    initials: 'JK',
    color: 'bg-blue-500',
  },
  {
    quote: "Sending a client receipt used to take me 20 minutes in Word. One click now. My clients think I'm more professional because of it.",
    name: 'Temi A.',
    role: 'Brand Strategist, Abuja',
    initials: 'TA',
    color: 'bg-violet-500',
  },
];

export default async function Home() {
  const { userId } = await auth();

  return (
    <main className="min-h-screen bg-white text-slate-900 overflow-x-hidden">

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <NchikoMark size={30} />
            <span className="text-lg font-bold tracking-tight text-slate-900">Nchiko</span>
          </div>
          <div className="flex items-center gap-3">
            {userId ? (
              <Link href="/dashboard" className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-lg transition-colors">
                Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className="px-4 py-2 text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">
                  Sign in
                </Link>
                <Link href="/sign-up" className="px-5 py-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition-colors">
                  Get started free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="pt-40 pb-28 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-600 text-xs font-semibold uppercase tracking-widest mb-10">
            Built for freelancers &amp; entrepreneurs
          </div>

          <h1 className="text-6xl sm:text-7xl font-extrabold text-slate-900 leading-[1.03] tracking-tight mb-7">
            Your finances,<br />
            <span className="text-emerald-500">finally clear.</span>
          </h1>

          <p className="text-xl text-slate-500 leading-relaxed max-w-xl mx-auto mb-12">
            Stop guessing. Nchiko gives you a calm, clear picture of what&apos;s
            coming in, what&apos;s going out, and what it means — in any currency.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {userId ? (
              <Link href="/dashboard" className="inline-flex items-center justify-center px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-base">
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/sign-up" className="inline-flex items-center justify-center px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-base">
                  Start for free →
                </Link>
                <Link href="/sign-in" className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl transition-all text-base">
                  Sign in
                </Link>
              </>
            )}
          </div>
          <p className="text-slate-400 text-sm mt-5">No credit card. No setup fee. Free to start.</p>
        </div>
      </section>

      {/* ── Currency strip ─────────────────────────────────────────── */}
      <section className="py-6 border-y border-slate-100 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-2.5">
            {[
              { code: 'USD', symbol: '$',  name: 'Dollar' },
              { code: 'NGN', symbol: '₦',  name: 'Naira' },
              { code: 'GBP', symbol: '£',  name: 'Pound' },
              { code: 'EUR', symbol: '€',  name: 'Euro' },
              { code: 'INR', symbol: '₹',  name: 'Rupee' },
              { code: 'JPY', symbol: '¥',  name: 'Yen' },
              { code: 'AUD', symbol: 'A$', name: 'Aus Dollar' },
            ].map(c => (
              <div key={c.code} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 rounded-full text-sm shadow-sm">
                <span className="text-emerald-500 font-bold text-xs">{c.symbol}</span>
                <span className="font-semibold text-slate-700 text-xs">{c.code}</span>
                <span className="text-slate-400 text-xs">{c.name}</span>
              </div>
            ))}
            <div className="flex items-center px-3.5 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-400 shadow-sm">
              + more
            </div>
          </div>
          <p className="text-center text-slate-400 text-xs mt-3">
            Every amount converted to your display currency using live exchange rates.
          </p>
        </div>
      </section>

      {/* ── The problem ────────────────────────────────────────────── */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-emerald-500 text-sm font-semibold uppercase tracking-widest mb-5">The problem</p>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
                Most founders are<br />flying blind.
              </h2>
            </div>
            <div className="space-y-6">
              <p className="text-lg text-slate-500 leading-relaxed">
                Between client payments, subscriptions, and invoices spread across
                multiple currencies, your real financial position gets blurry fast.
              </p>
              <p className="text-lg text-slate-500 leading-relaxed">
                You know money is moving. But you&apos;re not sure how much is actually
                yours — after costs, after conversions, after everything.
              </p>
              <p className="text-slate-900 font-semibold text-lg">
                That&apos;s the clarity Nchiko gives you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Outcomes ───────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16 max-w-xl">
            <p className="text-emerald-500 text-sm font-semibold uppercase tracking-widest mb-4">What changes</p>
            <h2 className="text-4xl font-extrabold text-slate-900 leading-tight">
              Three things you&apos;ll know every day.
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                number: '01',
                title: 'Your real profit.',
                desc: 'Not just revenue. After every expense, every subscription, every one-off cost — what actually landed in your pocket, converted to one currency.',
              },
              {
                number: '02',
                title: 'What\'s coming due.',
                desc: 'Subscriptions and recurring costs shown clearly, with renewal dates. No more surprise charges. No more mental overhead.',
              },
              {
                number: '03',
                title: 'What to send clients.',
                desc: 'A clean invoice or receipt, generated in one click from your real data — ready to download or email straight from your dashboard.',
              },
            ].map((item) => (
              <div key={item.number} className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
                <span className="text-emerald-400 text-sm font-bold tracking-widest">{item.number}</span>
                <h3 className="text-xl font-bold text-slate-900 mt-3 mb-3">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Multi-currency dark callout ─────────────────────────────── */}
      <section className="py-28 px-6 bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-5">Any currency. Any country.</p>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-6">
                Work in any currency.<br />See it all in one.
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Bill a client in Naira. Pay a subscription in dollars. Receive a
                retainer in pounds. Nchiko converts everything to your base currency
                in real time — no plugins, no spreadsheet gymnastics, no premium tier.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Freelance Project', amount: '+₦750,000', sub: 'Client payment', color: 'text-emerald-400' },
                { label: 'Monthly Retainer',  amount: '+$2,400',   sub: 'Recurring income', color: 'text-emerald-400' },
                { label: 'Consulting Fee',    amount: '+£800',      sub: 'One-time', color: 'text-emerald-400' },
                { label: 'Server Hosting',    amount: '-$40',       sub: 'Monthly', color: 'text-red-400' },
              ].map((row) => (
                <div key={row.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <p className="text-white text-sm font-semibold mb-0.5">{row.label}</p>
                  <p className="text-slate-500 text-xs mb-2">{row.sub}</p>
                  <p className={`text-lg font-bold ${row.color}`}>{row.amount}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── AI Advisor callout ──────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Right side first on desktop via order */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 order-2 lg:order-1">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">You</div>
                  <div className="bg-white border border-slate-200 rounded-xl rounded-tl-none px-4 py-3 text-sm text-slate-700 shadow-sm">
                    What&apos;s eating most of my budget this month?
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <div className="bg-emerald-500 rounded-xl rounded-tr-none px-4 py-3 text-sm text-white shadow-sm max-w-xs">
                    Your hosting and SaaS tools are 31% of your expenses. Cutting unused tools could save you ~$180/month.
                  </div>
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white shrink-0">AI</div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">You</div>
                  <div className="bg-white border border-slate-200 rounded-xl rounded-tl-none px-4 py-3 text-sm text-slate-700 shadow-sm">
                    How does this compare to last quarter?
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <div className="bg-emerald-500 rounded-xl rounded-tr-none px-4 py-3 text-sm text-white shadow-sm max-w-xs">
                    Down 12% from Q1. Your net profit margin improved from 58% to 67%.
                  </div>
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white shrink-0">AI</div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <p className="text-emerald-500 text-sm font-semibold uppercase tracking-widest mb-5">AI Advisor</p>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
                Ask your finances<br />a question.
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed mb-6">
                Your AI Advisor knows your actual numbers. Not generic budgeting
                tips — answers grounded in your specific transactions, categories,
                and history.
              </p>
              <p className="text-slate-500 text-lg leading-relaxed">
                Ask anything. Get a straight answer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <p className="text-emerald-500 text-sm font-semibold uppercase tracking-widest mb-3">From users</p>
            <h2 className="text-4xl font-extrabold text-slate-900">People who found their clarity.</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm flex flex-col">
                <div className="text-emerald-400 text-4xl font-serif leading-none mb-5">&ldquo;</div>
                <p className="text-slate-600 text-base leading-relaxed flex-1 mb-8">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-slate-900 font-semibold text-sm">{t.name}</p>
                    <p className="text-slate-400 text-xs">{t.role}</p>
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
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-emerald-500 text-sm font-semibold uppercase tracking-widest mb-4">Available now</p>
              <h2 className="text-4xl font-extrabold text-slate-900 mb-4">
                Nchiko in your pocket.
              </h2>
              <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                Log a payment the moment it happens. Check your numbers between
                meetings. No waiting until you&apos;re back at your desk.
              </p>
              <AppInstallButton />
              <p className="text-slate-400 text-xs mt-4">Free. No app store required. Works on Android &amp; iOS.</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-7">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">How to install</p>
              <ol className="space-y-5">
                {[
                  { n: '1', title: 'Open in Chrome or Safari', desc: 'Visit nchiko.ozigi.app on your phone\'s browser.' },
                  { n: '2', title: 'Tap Install', desc: 'Chrome will prompt you to add to your home screen. On iOS, use Share → Add to Home Screen.' },
                  { n: '3', title: 'Sign in and go', desc: 'Launch from your home screen and you\'re in. Full app, no app store.' },
                ].map((step) => (
                  <li key={step.n} className="flex gap-4">
                    <span className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-500 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {step.n}
                    </span>
                    <div>
                      <p className="text-slate-900 text-sm font-semibold mb-0.5">{step.title}</p>
                      <p className="text-slate-500 text-xs leading-relaxed">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────── */}
      <section className="py-32 px-6 bg-slate-900">
        <div className="max-w-2xl mx-auto text-center">
          <NchikoMark size={44} className="mx-auto mb-8" />
          <h2 className="text-5xl font-extrabold text-white leading-tight mb-5">
            Start with clarity.
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto leading-relaxed">
            Join entrepreneurs and freelancers who use Nchiko to know exactly
            where their money stands — in any currency.
          </p>
          <Link
            href={userId ? '/dashboard' : '/sign-up'}
            className="inline-block px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-base rounded-xl transition-all shadow-xl shadow-emerald-500/20"
          >
            {userId ? 'Go to Dashboard →' : "Get started free — no card needed"}
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 py-10 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <NchikoMark size={24} />
            <span className="text-slate-900 font-semibold text-sm">Nchiko</span>
            <span className="text-slate-400 text-sm">— Financial clarity for the way you work.</span>
          </div>
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} Nchiko. Powered by{' '}
            <a href="https://ozigi.app" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
              Ozigi
            </a>
          </p>
        </div>
      </footer>

    </main>
  );
}

/* ── Logo mark ─────────────────────────────────────────────────────── */
function NchikoMark({ size = 40, className = '' }: { size?: number; className?: string }) {
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
