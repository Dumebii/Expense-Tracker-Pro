interface StatsCardProps {
  title: string;
  amount: number;
  currency: string;
  icon: React.ReactNode;
  subtext: string;
}

export default function StatsCard({
  title,
  amount,
  currency,
  icon,
  subtext,
}: StatsCardProps) {
  const isNegative = amount < 0;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-slate-600 text-sm font-medium">{title}</p>
        </div>
        <div className="p-2 bg-slate-100 rounded-lg">
          {icon}
        </div>
      </div>
      <p className={`text-3xl font-bold ${isNegative ? 'text-red-600' : 'text-emerald-600'}`}>
        {currency} {Math.abs(amount).toFixed(2)}
      </p>
      <p className="text-slate-600 text-sm mt-2">{subtext}</p>
    </div>
  );
}
