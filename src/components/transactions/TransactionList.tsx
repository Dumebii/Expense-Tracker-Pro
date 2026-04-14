import { Trash2 } from 'lucide-react';

interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  frequency: string;
  status: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  type: 'income' | 'expense';
  currency: string;
  onDelete?: (id: string) => void;
}

export default function TransactionList({
  transactions,
  type,
  currency,
  onDelete,
}: TransactionListProps) {
  const frequencyLabel = (freq: string) => {
    const labels: Record<string, string> = {
      one_time: 'One Time',
      monthly: 'Monthly',
      annually: 'Annually',
    };
    return labels[freq] || freq;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 font-semibold text-slate-900">Title</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-900">Category</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-900">Amount</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-900">Frequency</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-900">Date</th>
            {onDelete && <th className="text-center py-3 px-4 font-semibold text-slate-900">Action</th>}
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-4 px-4">{transaction.title}</td>
              <td className="py-4 px-4">
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                  {transaction.category}
                </span>
              </td>
              <td className={`py-4 px-4 font-semibold ${type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                {type === 'income' ? '+' : '-'} {currency} {transaction.amount.toFixed(2)}
              </td>
              <td className="py-4 px-4 text-slate-600">{frequencyLabel(transaction.frequency)}</td>
              <td className="py-4 px-4 text-slate-600">
                {new Date(transaction.date).toLocaleDateString()}
              </td>
              {onDelete && (
                <td className="py-4 px-4 text-center">
                  <button
                    onClick={() => onDelete(transaction.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
