import { useGetFinancialOverview, useListExpenses, useListIncome } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useUser, CURRENCIES } from "@/context/user-context";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", NGN: "₦", CAD: "C$",
  AUD: "A$", JPY: "¥", CHF: "CHF", INR: "₹", ZAR: "R",
};

type TimeFrame = "month" | "quarter" | "half" | "year" | "all";

function getDateRange(timeframe: TimeFrame): { from?: string; to?: string } {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const to = fmt(now);

  if (timeframe === "all") return {};

  const from = new Date(now);
  if (timeframe === "month") from.setMonth(now.getMonth() - 1);
  else if (timeframe === "quarter") from.setMonth(now.getMonth() - 3);
  else if (timeframe === "half") from.setMonth(now.getMonth() - 6);
  else if (timeframe === "year") from.setFullYear(now.getFullYear() - 1);

  return { from: fmt(from), to };
}

export default function Dashboard() {
  const { user, updateProfile } = useUser();
  const displayCurrency = user?.displayCurrency || "USD";
  const symbol = CURRENCY_SYMBOLS[displayCurrency] || displayCurrency;

  const formatCurrency = (amount: number) => {
    return `${symbol}${Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatItemCurrency = (amount: number, currency = "USD") => {
    const s = CURRENCY_SYMBOLS[currency] || currency;
    return `${s}${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const [timeframe, setTimeframe] = useState<TimeFrame>("all");
  const dateRange = getDateRange(timeframe);

  const { data: overview, isLoading: isOverviewLoading } = useGetFinancialOverview(dateRange);
  const { data: expenses, isLoading: isExpensesLoading } = useListExpenses();
  const { data: incomeEntries, isLoading: isIncomeLoading } = useListIncome();

  const recentExpenses = expenses?.slice(-5).reverse() || [];
  const recentIncome = incomeEntries?.slice(-5).reverse() || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">Your financial command center</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={displayCurrency} onValueChange={(v) => updateProfile({ displayCurrency: v })}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
      </div>

      {overview?.isInRed && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-semibold">You are in the red</p>
            <p className="text-sm opacity-90">Your expenses exceed your income. Review your spending in Money Out.</p>
          </div>
        </div>
      )}

      {isOverviewLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Total Income</div>
                  <div className="text-2xl font-bold text-emerald-500">{formatCurrency(overview?.totalIncome || 0)}</div>
                  <div className="text-xs text-muted-foreground mt-1">{formatCurrency(overview?.monthlyIncome || 0)}/mo</div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Total Expenses</div>
                  <div className="text-2xl font-bold text-destructive">{formatCurrency(overview?.totalExpenses || 0)}</div>
                  <div className="text-xs text-muted-foreground mt-1">{formatCurrency(overview?.monthlyExpenses || 0)}/mo</div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Net P&L</div>
                  <div className={cn("text-2xl font-bold", (overview?.netPL || 0) >= 0 ? "text-emerald-500" : "text-destructive")}>
                    {(overview?.netPL || 0) >= 0 ? "+" : "-"}{formatCurrency(overview?.netPL || 0)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{formatCurrency(overview?.monthlyNetPL || 0)}/mo</div>
                </div>
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", (overview?.netPL || 0) >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive")}>
                  {(overview?.netPL || 0) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Annualized Net</div>
                  <div className={cn("text-2xl font-bold", (overview?.annualizedNetPL || 0) >= 0 ? "text-emerald-500" : "text-destructive")}>
                    {(overview?.annualizedNetPL || 0) >= 0 ? "+" : "-"}{formatCurrency(overview?.annualizedNetPL || 0)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">run rate</div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Income</CardTitle>
              <Link href="/money-in">
                <Button variant="ghost" size="sm" className="text-xs">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {isIncomeLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)
            ) : recentIncome.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No income entries yet</p>
            ) : (
              recentIncome.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div>
                    <div className="text-sm font-medium">{entry.name}</div>
                    <div className="text-xs text-muted-foreground">{entry.category} · {entry.frequency.replace("_", " ")}</div>
                  </div>
                  <div className="text-sm font-bold text-emerald-500">
                    +{formatItemCurrency(entry.amount, entry.currency)}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Expenses</CardTitle>
              <Link href="/money-out">
                <Button variant="ghost" size="sm" className="text-xs">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {isExpensesLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)
            ) : recentExpenses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No expenses yet</p>
            ) : (
              recentExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div>
                    <div className="text-sm font-medium">{expense.name}</div>
                    <div className="text-xs text-muted-foreground">{expense.category} · {expense.frequency.replace("_", " ")}</div>
                  </div>
                  <div className="text-sm font-bold text-destructive">
                    -{formatItemCurrency(expense.amount, expense.currency)}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {overview && (overview.expensesByCategory?.length > 0 || overview.incomeByCategory?.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Expenses by Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {overview.expensesByCategory.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{cat.category}</span>
                  <span className="text-sm font-medium text-destructive">{formatCurrency(cat.total)}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Income by Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {overview.incomeByCategory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No income data</p>
              ) : (
                overview.incomeByCategory.map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{cat.category}</span>
                    <span className="text-sm font-medium text-emerald-500">{formatCurrency(cat.total)}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
