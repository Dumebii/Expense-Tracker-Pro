'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

const MOCK_EXPENSES = [
  { label: 'Groceries', amount: '$84.20', category: 'Food', color: 'bg-emerald-100 text-emerald-700' },
  { label: 'Netflix', amount: '$15.99', category: 'Entertainment', color: 'bg-blue-100 text-blue-700' },
  { label: 'Electricity', amount: '$62.50', category: 'Utilities', color: 'bg-amber-100 text-amber-700' },
  { label: 'Gym', amount: '$45.00', category: 'Health', color: 'bg-rose-100 text-rose-700' },
];

export default function Hero() {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      card.style.transform = `perspective(800px) rotateY(${x / 40}deg) rotateX(${-y / 40}deg)`;
    };
    const handleMouseLeave = () => {
      card.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg)';
    };
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <section className="min-h-screen flex items-center pt-16">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 w-full py-24 lg:py-32">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

          {/* Left: Text */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-secondary border border-border rounded-full px-4 py-1.5 mb-8 animate-fade-up">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">Now with smart analytics</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-[1.08] tracking-tight text-balance animate-fade-up delay-100 mb-6">
              Know where your{' '}
              <span className="text-primary">money</span>{' '}
              goes.
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0 animate-fade-up delay-200 mb-10">
              Expense Tracker Pro gives you a clear picture of your spending so you can cut waste, hit savings goals, and feel in control — every single day.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start animate-fade-up delay-300">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 bg-foreground text-background px-7 py-3.5 rounded-xl font-semibold text-sm hover:bg-foreground/90 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                Start for free
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl font-semibold text-sm border border-border text-foreground hover:bg-secondary transition-all duration-200"
              >
                Log in
              </Link>
            </div>

            <p className="text-xs text-muted-foreground mt-5 animate-fade-up delay-400">
              No credit card required. Free forever for personal use.
            </p>
          </div>

          {/* Right: Mock UI Card */}
          <div className="flex-1 w-full max-w-md animate-fade-up delay-300" ref={cardRef} style={{ transition: 'transform 0.15s ease' }}>
            <div className="bg-background border border-border rounded-2xl shadow-xl p-6 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">This month</p>
                  <p className="text-3xl font-bold text-foreground mt-0.5">$1,247.69</p>
                </div>
                <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-semibold">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 9l3-3 2 2 3-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  12% less than last month
                </div>
              </div>

              {/* Bar chart mock */}
              <div className="flex items-end gap-1.5 h-16 mb-2">
                {[40, 65, 45, 80, 55, 70, 48, 90, 60, 75, 50, 85].map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t-sm transition-all duration-500 ${i === 11 ? 'bg-primary' : 'bg-muted'}`}
                    style={{ height: `${h}%`, animationDelay: `${i * 50}ms` }}
                  />
                ))}
              </div>

              {/* Expense list */}
              <div className="space-y-2.5">
                {MOCK_EXPENSES.map((exp, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-secondary/60 animate-fade-up"
                    style={{ animationDelay: `${400 + i * 80}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${exp.color}`}>
                        {exp.category}
                      </span>
                      <span className="text-sm text-foreground font-medium">{exp.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{exp.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
