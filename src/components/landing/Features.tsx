'use client';

import { useEffect, useRef, useState } from 'react';

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="2" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <rect x="12" y="2" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <rect x="2" y="12" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M16 12v8M12 16h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    title: 'Instant categorisation',
    description: 'Add an expense in seconds and assign it to a category. Build custom categories that match how you actually spend.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 17l4-4 3 3 4-5 4 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="2" y="2" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
    title: 'Visual analytics',
    description: 'Pie charts and breakdowns reveal exactly where your money goes — so you can make smarter decisions faster.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M11 6v5l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    title: 'Monthly summaries',
    description: 'Get a clear month-over-month view of your spending. Spot trends, track progress, and celebrate wins.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 2L3 7v8l8 5 8-5V7l-8-5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M11 12a2 2 0 100-4 2 2 0 000 4z" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
    title: 'Secured by Clerk',
    description: 'Enterprise-grade authentication with Clerk. Your financial data is encrypted and accessible only to you.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M7 5V3M15 5V3M3 10h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    title: 'Date filtering',
    description: 'Filter and search expenses by date range, category, or amount. Find any transaction in an instant.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 6h14M4 11h10M4 16h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    title: 'Works on any device',
    description: 'Responsive by design. Track expenses from your phone, tablet, or desktop — always in sync.',
  },
];

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode; title: string; description: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="group p-6 rounded-2xl border border-border bg-background hover:border-primary/40 hover:shadow-md transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms, box-shadow 0.2s, border-color 0.2s`,
      }}
    >
      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
        {icon}
      </div>
      <h3 className="font-semibold text-foreground mb-2 text-[15px]">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" className="py-24 lg:py-32">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground text-balance">
            Everything you need,<br />nothing you don&apos;t.
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto leading-relaxed">
            Built for people who want real clarity on their spending — not a bloated app full of features they&apos;ll never use.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <FeatureCard key={i} {...f} delay={i * 80} />
          ))}
        </div>
      </div>
    </section>
  );
}
