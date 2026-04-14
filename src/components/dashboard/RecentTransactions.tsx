import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  category?: string;
}

interface RecentTransactionsProps {
  title: string;
  transactions: Transaction[];
  type: 'income' | 'expense';
  currency: string;
}

export default function RecentTransactions({
  title,
  transactions,
  type,
  currency,
}: RecentTransactionsProps) {
  const href = type === 'income' ? '/dashboard/money-in' : '/dashboard/money-out';
  const displayTransactions = transactions.slice(0, 5);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <Link
          href={href}
          className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1"
        >
          View All <ArrowRight size={16} />
        </Link>
      </div>

      {displayTransactions.length === 0 ? (
        <p className="text-center text-slate-500 py-8">No {type} entries yet</p>
      ) : (
        <div className="space-y-4">
          {displayTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0"
            >
              <div>
                <p className="font-medium text-slate-900">{transaction.title}</p>
                <p className="text-sm text-slate-600">
                  {new Date(transaction.date).toLocaleDateString()}
                </p>
              </div>
              <p className={`font-semibold ${type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                {type === 'income' ? '+' : '-'} {currency} {transaction.amount.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
