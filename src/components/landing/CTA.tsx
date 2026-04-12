'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function CTA() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-24" id="how-it-works">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div
          ref={ref}
          className="bg-foreground rounded-3xl px-8 py-16 lg:py-20 text-center relative overflow-hidden"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          {/* Subtle grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'linear-gradient(hsl(var(--background)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--background)) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative z-10">
            <p className="text-sm font-medium text-primary uppercase tracking-widest mb-4">Get started today</p>
            <h2 className="text-4xl lg:text-5xl font-bold text-background text-balance mb-6">
              Your finances deserve<br />your attention.
            </h2>
            <p className="text-background/70 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Stop guessing where your money went. Start tracking in under two minutes — no credit card, no setup fees.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 bg-background text-foreground px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-secondary transition-all duration-200 hover:shadow-lg"
              >
                Create free account
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-semibold text-sm border border-background/30 text-background hover:bg-background/10 transition-all duration-200"
              >
                Already have an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
