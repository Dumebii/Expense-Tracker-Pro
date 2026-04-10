import { useListIncome, useGetIncomeSummary, ListIncomeFrequency, ListIncomeStatus } from "@workspace/api-client-react";
import { useIncomeMutations } from "@/hooks/use-income";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Calendar, Tag, MoreHorizontal, Ban, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IncomeForm } from "@/components/income-form";
import { cn } from "@/lib/utils";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", NGN: "₦", CAD: "C$",
  AUD: "A$", JPY: "¥", CHF: "CHF", INR: "₹", ZAR: "R",
};

const formatCurrency = (amount: number, currency = "USD") => {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function MoneyIn() {
  const [frequencyFilter, setFrequencyFilter] = useState<ListIncomeFrequency | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ListIncomeStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data: summary, isLoading: isSummaryLoading } = useGetIncomeSummary();
  const { data: incomeEntries, isLoading: isIncomeLoading } = useListIncome({
    frequency: frequencyFilter !== "all" ? frequencyFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
  });

  const { cancelIncomeEntry, deleteIncomeEntry } = useIncomeMutations();
  const { toast } = useToast();

  const [incomeToDelete, setIncomeToDelete] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [incomeToEdit, setIncomeToEdit] = useState<any>(null);

  const handleDelete = (id: number) => {
    deleteIncomeEntry.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Income entry deleted" });
          setIncomeToDelete(null);
        },
        onError: () => {
          toast({ title: "Failed to delete income entry", variant: "destructive" });
        },
      }
    );
  };

  const handleCancel = (id: number) => {
    cancelIncomeEntry.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Income entry cancelled" });
        },
        onError: () => {
          toast({ title: "Failed to cancel income entry", variant: "destructive" });
        },
      }
    );
  };

  const categories = Array.from(new Set(incomeEntries?.map((i) => i.category) || []));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Money In</h1>
          <p className="text-muted-foreground text-sm mt-1">All your income sources and revenue</p>
        </div>
        <Button
          onClick={() => {
            setIncomeToEdit(null);
            setIsFormOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Income
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {isSummaryLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
        ) : (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Monthly</div>
                <div className="text-2xl font-bold text-emerald-500">{formatCurrency(summary?.totalMonthly || 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Annual</div>
                <div className="text-2xl font-bold text-emerald-500">{formatCurrency(summary?.totalAnnually || 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Annualized Total</div>
                <div className="text-2xl font-bold text-emerald-500">{formatCurrency(summary?.totalAllAnnualized || 0)}</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={frequencyFilter} onValueChange={(v) => setFrequencyFilter(v as any)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Frequency</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="annually">Annually</SelectItem>
            <SelectItem value="one_time">One Time</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {isIncomeLoading ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
        ) : incomeEntries?.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-4xl mb-3">—</div>
            <p className="font-medium">No income entries found</p>
            <p className="text-sm mt-1">Add your first income source to get started.</p>
          </div>
        ) : (
          incomeEntries?.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card hover:border-border transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{entry.name}</span>
                  <Badge
                    variant={entry.status === "active" ? "default" : "secondary"}
                    className="text-xs shrink-0"
                  >
                    {entry.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {entry.category}
                  </span>
                  <span className="capitalize">{entry.frequency.replace("_", " ")}</span>
                  {entry.receivedDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Received {format(new Date(entry.receivedDate), "MMM d, yyyy")}
                    </span>
                  )}
                </div>
              </div>
              <div className={cn("font-bold text-lg shrink-0 text-emerald-500", entry.status === "cancelled" && "line-through text-muted-foreground")}>
                +{formatCurrency(entry.amount, entry.currency)}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => { setIncomeToEdit(entry); setIsFormOpen(true); }}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  {entry.status === "active" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleCancel(entry.id)} className="text-amber-600">
                        <Ban className="w-4 h-4 mr-2" />
                        Cancel
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setIncomeToDelete(entry.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        )}
      </div>

      <IncomeForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        income={incomeToEdit}
      />

      <AlertDialog open={incomeToDelete !== null} onOpenChange={(o) => !o && setIncomeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this income entry?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => incomeToDelete && handleDelete(incomeToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
