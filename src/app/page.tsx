import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Stats from '@/components/landing/Stats';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect('/dashboard');

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <CTA />
      <Footer />
    </main>
  );
}
