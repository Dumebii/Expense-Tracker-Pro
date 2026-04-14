'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in');
    }
  }, [isLoaded, userId, router]);

  if (!isLoaded || !userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
