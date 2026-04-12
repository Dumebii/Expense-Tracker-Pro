'use client';

import { useEffect, useRef, useState } from 'react';

const STATS = [
  { value: 10000, suffix: '+', label: 'Expenses tracked' },
  { value: 98, suffix: '%', label: 'Uptime guaranteed' },
  { value: 2, suffix: 'min', label: 'Average setup time' },
  { value: 100, suffix: '%', label: 'Free for personal use' },
];

function useCountUp(target: number, duration = 1200, started: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);
  return count;
}

function StatItem({ value, suffix, label, started }: { value: number; suffix: string; label: string; started: boolean }) {
  const count = useCountUp(value, 1400, started);
  return (
    <div className="text-center">
      <p className="text-4xl font-bold text-foreground tabular-nums">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-sm text-muted-foreground mt-1.5">{label}</p>
    </div>
  );
}

export default function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="border-y border-border bg-secondary/40">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
          {STATS.map((stat, i) => (
            <StatItem key={i} {...stat} started={started} />
          ))}
        </div>
      </div>
    </section>
  );
}
