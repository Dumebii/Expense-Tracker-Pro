import { useGetFinancialOverview, useGetExpenseSummary, useGetIncomeSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { cn } from "@/lib/utils";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

type TimeFrame = "month" | "quarter" | "half" | "year" | "all";

function getDateRange(timeframe: TimeFrame): { from?: string; to?: string } {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  if (timeframe === "all") return {};
  const from = new Date(now);
  if (timeframe === "month") from.setMonth(now.getMonth() - 1);
  else if (timeframe === "quarter") from.setMonth(now.getMonth() - 3);
  else if (timeframe === "half") from.setMonth(now.getMonth() - 6);
  else if (timeframe === "year") from.setFullYear(now.getFullYear() - 1);
  return { from: fmt(from), to: fmt(now) };
}

export default function ProfitLoss() {
  const [timeframe, setTimeframe] = useState<TimeFrame>("all");
  const dateRange = getDateRange(timeframe);

  const { data: overview, isLoading } = useGetFinancialOverview(dateRange);

  const incomeTotal = overview?.totalIncome || 0;
  const expensesTotal = overview?.totalExpenses || 0;
  const netPL = overview?.netPL || 0;
  const isInRed = overview?.isInRed || false;

  const maxBar = Math.max(incomeTotal, expensesTotal, 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profit & Loss</h1>
          <p className="text-muted-foreground text-sm mt-1">Income vs expenses breakdown</p>
        </div>
        <Select value={timeframe} onValueChange={(v) => setTimeframe(v as TimeFrame)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">Last 3 Months</SelectItem>
            <SelectItem value="half">Last 6 Months</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isInRed && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-semibold">Expenses exceed income</p>
            <p className="text-sm opacity-90">You are spending {formatCurrency(Math.abs(netPL))} more than you earn in this period.</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Total Income</div>
              <div className="text-2xl font-bold text-emerald-500">{formatCurrency(incomeTotal)}</div>
              <div className="text-xs text-muted-foreground mt-1">{formatCurrency(overview?.monthlyIncome || 0)}/mo</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Total Expenses</div>
              <div className="text-2xl font-bold text-destructive">{formatCurrency(expensesTotal)}</div>
              <div className="text-xs text-muted-foreground mt-1">{formatCurrency(overview?.monthlyExpenses || 0)}/mo</div>
            </CardContent>
          </Card>
          <Card className={cn(isInRed ? "border-destructive/30" : "border-emerald-500/30")}>
            <CardContent className="p-5">
              <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Net P&L</div>
              <div className={cn("text-2xl font-bold flex items-center gap-2", isInRed ? "text-destructive" : "text-emerald-500")}>
                {isInRed ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                {netPL >= 0 ? "+" : ""}{formatCurrency(netPL)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{formatCurrency(overview?.annualizedNetPL || 0)}/yr run rate</div>
            </CardContent>
          </Card>
        </div>
      )}

      {!isLoading && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Visual Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium">Income</span>
                  <span className="text-emerald-500 font-bold">{formatCurrency(incomeTotal)}</span>
                </div>
                <div className="h-4 rounded-full bg-border/30 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${(incomeTotal / maxBar) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium">Expenses</span>
                  <span className="text-destructive font-bold">{formatCurrency(expensesTotal)}</span>
                </div>
                <div className="h-4 rounded-full bg-border/30 overflow-hidden">
                  <div
                    className="h-full bg-destructive rounded-full transition-all duration-500"
                    style={{ width: `${(expensesTotal / maxBar) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Income by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 rounded" />)}</div>
            ) : (overview?.incomeByCategory?.length || 0) === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No income recorded</p>
            ) : (
              <div className="space-y-3">
                {overview?.incomeByCategory.map((cat) => (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{cat.category}</span>
                      <span className="font-medium text-emerald-500">{formatCurrency(cat.total)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-border/30">
                      <div
                        className="h-full bg-emerald-500/60 rounded-full"
                        style={{ width: `${(cat.total / incomeTotal) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 rounded" />)}</div>
            ) : (overview?.expensesByCategory?.length || 0) === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No expenses recorded</p>
            ) : (
              <div className="space-y-3">
                {overview?.expensesByCategory.map((cat) => (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{cat.category}</span>
                      <span className="font-medium text-destructive">{formatCurrency(cat.total)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-border/30">
                      <div
                        className="h-full bg-destructive/60 rounded-full"
                        style={{ width: `${(cat.total / expensesTotal) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
