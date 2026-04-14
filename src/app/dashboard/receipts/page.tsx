'use client';

import { Receipt } from 'lucide-react';

export default function ReceiptsPage() {
  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">Receipts</h1>
        <p className="text-slate-600 mt-2">Generated receipts for your business expenses.</p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
        <Receipt className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">No receipts generated</h3>
        <p className="text-slate-600">
          You haven&apos;t generated any receipts yet. Go to your dashboard to generate receipts for your expenses.
        </p>
      </div>
    </div>
  );
}
