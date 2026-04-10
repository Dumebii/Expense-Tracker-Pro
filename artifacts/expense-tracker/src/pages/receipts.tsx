import { useListReceipts } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { FileText, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export default function Receipts() {
  const { data: receipts, isLoading } = useListReceipts();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Receipts</h1>
        <p className="text-muted-foreground mt-1">Generated receipts for your business expenses.</p>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="divide-y divide-border/50">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="w-32 h-4" />
                    <Skeleton className="w-48 h-3" />
                  </div>
                </div>
                <div className="space-y-2 text-right">
                  <Skeleton className="w-20 h-5 ml-auto" />
                  <Skeleton className="w-24 h-3 ml-auto" />
                </div>
              </div>
            ))
          ) : receipts?.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">No receipts generated</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                You haven't generated any receipts yet. Go to your dashboard to generate receipts for your expenses.
              </p>
            </div>
          ) : (
            receipts?.map((receipt) => (
              <div key={receipt.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{receipt.expenseName}</span>
                      <Badge variant="secondary" className="text-xs py-0 h-5 font-mono">{receipt.receiptNumber}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Send className="w-3 h-3" />
                        Sent to {receipt.emailedTo}
                      </span>
                      <span>•</span>
                      <span>{format(new Date(receipt.generatedAt), "MMM d, yyyy h:mm a")}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-foreground">{formatCurrency(receipt.expenseAmount)}</div>
                  <div className="text-xs text-muted-foreground mt-1">{receipt.expenseCategory} • {receipt.expenseFrequency.replace('_', '-')}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
