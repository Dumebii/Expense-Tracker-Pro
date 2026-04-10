import { useGetExpenseSummary, useListExpenses, ListExpensesFrequency, ListExpensesStatus } from "@workspace/api-client-react";
import { useExpensesMutations } from "@/hooks/use-expenses";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ArrowUpRight, Calendar, CreditCard, Layers, Tag, MoreHorizontal, FileText, Ban, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
import { ExpenseForm } from "@/components/expense-form";
import { cn } from "@/lib/utils";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export default function Dashboard() {
  const [frequencyFilter, setFrequencyFilter] = useState<ListExpensesFrequency | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ListExpensesStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data: summary, isLoading: isSummaryLoading } = useGetExpenseSummary();
  
  const { data: expenses, isLoading: isExpensesLoading } = useListExpenses({
    frequency: frequencyFilter !== "all" ? frequencyFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
  });
  
  const { cancelExpense, deleteExpense, generateReceipt } = useExpensesMutations();
  const { toast } = useToast();

  const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<any>(null);

  const handleGenerateReceipt = (id: number) => {
    generateReceipt.mutate({ id }, {
      onSuccess: (res) => {
        toast({
          title: "Receipt Generated",
          description: `Receipt generated and emailed to ${res.receipt.emailedTo}`,
        });
      },
      onError: () => {
        toast({
          title: "Failed to generate receipt",
          variant: "destructive"
        });
      }
    });
  };

  const handleEdit = (expense: any) => {
    setExpenseToEdit(expense);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setExpenseToEdit(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
          <p className="text-muted-foreground mt-1">Your financial command center.</p>
        </div>
        <Button className="shrink-0 group" onClick={handleAddNew}>
          <Plus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
          Add Expense
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Monthly Spend"
          amount={summary?.totalMonthly}
          isLoading={isSummaryLoading}
          icon={Calendar}
        />
        <SummaryCard
          title="Annual Spend"
          amount={summary?.totalAnnually}
          isLoading={isSummaryLoading}
          icon={Layers}
        />
        <SummaryCard
          title="One-Time (YTD)"
          amount={summary?.totalOneTime}
          isLoading={isSummaryLoading}
          icon={CreditCard}
        />
        <SummaryCard
          title="Annualized Run Rate"
          amount={summary?.totalAllAnnualized}
          isLoading={isSummaryLoading}
          icon={ArrowUpRight}
          highlight
        />
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Recent Expenses</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={frequencyFilter} onValueChange={(v: any) => setFrequencyFilter(v)}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Frequencies</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="annually">Annually</SelectItem>
                <SelectItem value="one_time">One Time</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {summary?.byCategory.map((c) => (
                  <SelectItem key={c.category} value={c.category}>{c.category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="border-border/50 shadow-sm overflow-hidden">
          <div className="divide-y divide-border/50">
            {isExpensesLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="w-32 h-4" />
                      <Skeleton className="w-24 h-3" />
                    </div>
                  </div>
                  <Skeleton className="w-20 h-6" />
                </div>
              ))
            ) : expenses?.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-1">No expenses found</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-6">
                  {frequencyFilter !== 'all' || statusFilter !== 'all' || categoryFilter !== 'all' 
                    ? "Try adjusting your filters to see more results."
                    : "Add your first expense to start tracking your company's spending."}
                </p>
                {frequencyFilter === 'all' && statusFilter === 'all' && categoryFilter === 'all' && (
                  <Button variant="outline" onClick={handleAddNew}>Add Expense</Button>
                )}
              </div>
            ) : (
              expenses?.map((expense, index) => (
                <div 
                  key={expense.id} 
                  className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between group animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={cn("font-medium text-foreground", expense.status === 'cancelled' && "line-through text-muted-foreground")}>
                          {expense.name}
                        </span>
                        {expense.status === "cancelled" && (
                          <Badge variant="secondary" className="bg-destructive/10 text-destructive text-xs py-0 h-5">Cancelled</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="capitalize">{expense.frequency.replace('_', '-')}</span>
                        <span>•</span>
                        <span>{expense.category}</span>
                        {expense.renewalDate && expense.status === 'active' && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-primary/80">
                              <RefreshCw className="w-3 h-3" />
                              Renews {format(new Date(expense.renewalDate), "MMM d, yyyy")}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className={cn("font-semibold text-foreground", expense.status === 'cancelled' && "text-muted-foreground")}>
                        {formatCurrency(expense.amount)}
                      </span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleEdit(expense)}>Edit Expense</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleGenerateReceipt(expense.id)}>
                          <FileText className="w-4 h-4 mr-2" />
                          Generate Receipt
                        </DropdownMenuItem>
                        {expense.status === 'active' && (
                          <DropdownMenuItem onClick={() => cancelExpense.mutate({ id: expense.id })}>
                            <Ban className="w-4 h-4 mr-2 text-destructive" />
                            Cancel Subscription
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setExpenseToDelete(expense.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <AlertDialog open={!!expenseToDelete} onOpenChange={(open) => !open && setExpenseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the expense record from your books.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={() => {
                if (expenseToDelete) {
                  deleteExpense.mutate({ id: expenseToDelete });
                  setExpenseToDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ExpenseForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen}
        expense={expenseToEdit}
      />
    </div>
  );
}

function SummaryCard({ title, amount, isLoading, icon: Icon, highlight = false }: any) {
  return (
    <Card className={cn(
      "overflow-hidden relative border",
      highlight ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border/50 shadow-sm"
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className={cn("text-sm font-medium", highlight ? "text-primary-foreground/80" : "text-muted-foreground")}>
            {title}
          </span>
          <div className={cn("p-2 rounded-md", highlight ? "bg-primary-foreground/10" : "bg-muted")}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          {isLoading ? (
            <Skeleton className={cn("h-8 w-24", highlight ? "bg-primary-foreground/20" : "")} />
          ) : (
            <div className="text-2xl font-bold tracking-tight">
              {formatCurrency(amount || 0)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
