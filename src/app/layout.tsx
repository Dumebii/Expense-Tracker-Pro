import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Ledger - Financial Command Center',
  description: 'Your financial command center. Track income and expenses, monitor P&L, and get AI-powered financial advice.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable}`}>
        <body className="bg-slate-50 text-slate-900">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
