import { useGetAccountStatement } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Printer, Download, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", NGN: "₦", CAD: "C$",
  AUD: "A$", JPY: "¥", CHF: "CHF", INR: "₹", ZAR: "R",
};

const formatCurrency = (amount: number, currency = "USD") => {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function Statement() {
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [fromDate, setFromDate] = useState(format(firstOfMonth, "yyyy-MM-dd"));
  const [toDate, setToDate] = useState(format(today, "yyyy-MM-dd"));

  const { data: statement, isLoading, refetch } = useGetAccountStatement(
    { from: fromDate, to: toDate },
    { query: { enabled: !!fromDate && !!toDate } }
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Account Statement</h1>
          <p className="text-muted-foreground text-sm mt-1">Full transaction history for a period</p>
        </div>
        <Button onClick={handlePrint} variant="outline" className="gap-2">
          <Printer className="w-4 h-4" />
          Print
        </Button>
      </div>

      <Card className="print:hidden">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label>From</Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-44"
              />
            </div>
            <div className="space-y-1.5">
              <Label>To</Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-44"
              />
            </div>
            <Button onClick={() => refetch()} disabled={isLoading}>Generate</Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
        </div>
      ) : statement ? (
        <div className="space-y-6">
          <div className="print:block">
            <div className="text-center py-4 print:py-8">
              <h2 className="text-xl font-bold">Account Statement</h2>
              <p className="text-muted-foreground text-sm mt-1">
                {fromDate && toDate ? `${format(new Date(fromDate), "MMM d, yyyy")} — ${format(new Date(toDate), "MMM d, yyyy")}` : "All Time"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Generated {format(new Date(statement.generatedAt), "PPpp")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Income</div>
                <div className="text-2xl font-bold text-emerald-500">{formatCurrency(statement.totalIncome)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Expenses</div>
                <div className="text-2xl font-bold text-destructive">{formatCurrency(statement.totalExpenses)}</div>
              </CardContent>
            </Card>
            <Card className={cn(statement.netPL < 0 ? "border-destructive/30" : "border-emerald-500/30")}>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Net P&L</div>
                <div className={cn("text-2xl font-bold", statement.netPL >= 0 ? "text-emerald-500" : "text-destructive")}>
                  {statement.netPL >= 0 ? "+" : ""}{formatCurrency(statement.netPL)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Transactions ({statement.entries.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {statement.entries.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No transactions in this period</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50 text-muted-foreground">
                        <th className="text-left py-2 pr-4 font-medium">Name</th>
                        <th className="text-left py-2 pr-4 font-medium">Category</th>
                        <th className="text-left py-2 pr-4 font-medium">Frequency</th>
                        <th className="text-left py-2 pr-4 font-medium">Date</th>
                        <th className="text-left py-2 pr-4 font-medium">Status</th>
                        <th className="text-right py-2 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statement.entries.map((entry) => (
                        <tr key={`${entry.type}-${entry.id}`} className="border-b border-border/20 hover:bg-sidebar-accent/30 transition-colors">
                          <td className="py-2.5 pr-4">
                            <div className="flex items-center gap-2">
                              <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0", entry.type === "income" ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive")}>
                                {entry.type === "income" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                              </div>
                              <span className="font-medium">{entry.name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 pr-4 text-muted-foreground">{entry.category}</td>
                          <td className="py-2.5 pr-4 text-muted-foreground capitalize">{entry.frequency.replace("_", " ")}</td>
                          <td className="py-2.5 pr-4 text-muted-foreground">
                            {entry.date ? format(new Date(entry.date), "MMM d, yyyy") : "—"}
                          </td>
                          <td className="py-2.5 pr-4">
                            <Badge variant={entry.status === "active" ? "default" : "secondary"} className="text-xs">
                              {entry.status}
                            </Badge>
                          </td>
                          <td className={cn("py-2.5 text-right font-bold", entry.type === "income" ? "text-emerald-500" : "text-destructive")}>
                            {entry.type === "income" ? "+" : "-"}{formatCurrency(entry.amount, entry.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-border font-semibold">
                        <td colSpan={5} className="py-3 text-muted-foreground">Net Total</td>
                        <td className={cn("py-3 text-right font-bold text-base", statement.netPL >= 0 ? "text-emerald-500" : "text-destructive")}>
                          {statement.netPL >= 0 ? "+" : ""}{formatCurrency(statement.netPL)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
