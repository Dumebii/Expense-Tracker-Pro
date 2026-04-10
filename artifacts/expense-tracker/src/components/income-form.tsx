import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreateIncomeBodyFrequency, UpdateIncomeEntryBodyFrequency, UpdateIncomeEntryBodyStatus } from "@workspace/api-client-react";
import { useIncomeMutations } from "@/hooks/use-income";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const CURRENCIES = [
  { value: "USD", label: "USD ($)", symbol: "$" },
  { value: "EUR", label: "EUR (€)", symbol: "€" },
  { value: "GBP", label: "GBP (£)", symbol: "£" },
  { value: "NGN", label: "NGN (₦)", symbol: "₦" },
  { value: "CAD", label: "CAD (C$)", symbol: "C$" },
  { value: "AUD", label: "AUD (A$)", symbol: "A$" },
  { value: "JPY", label: "JPY (¥)", symbol: "¥" },
  { value: "CHF", label: "CHF", symbol: "CHF" },
  { value: "INR", label: "INR (₹)", symbol: "₹" },
  { value: "ZAR", label: "ZAR (R)", symbol: "R" },
];

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  currency: z.string().default("USD"),
  category: z.string().min(1, "Category is required"),
  frequency: z.enum(["monthly", "annually", "one_time"]),
  status: z.enum(["active", "cancelled"]).optional(),
  notes: z.string().nullable().optional(),
  receivedDate: z.date().nullable().optional(),
  renewalDate: z.date().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface IncomeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  income?: {
    id: number;
    name: string;
    amount: number;
    currency: string;
    category: string;
    frequency: string;
    status: string;
    notes?: string | null;
    receivedDate?: string | null;
    renewalDate?: string | null;
  };
}

export function IncomeForm({ open, onOpenChange, income }: IncomeFormProps) {
  const isEditing = !!income;
  const { createIncome, updateIncomeEntry } = useIncomeMutations();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: income?.name || "",
      amount: income?.amount || 0,
      currency: income?.currency || "USD",
      category: income?.category || "",
      frequency: (income?.frequency as any) || "monthly",
      status: (income?.status as any) || "active",
      notes: income?.notes || "",
      receivedDate: income?.receivedDate ? new Date(income.receivedDate) : undefined,
      renewalDate: income?.renewalDate ? new Date(income.renewalDate) : undefined,
    },
  });

  const frequency = form.watch("frequency");

  const onSubmit = (data: FormValues) => {
    const payload = {
      ...data,
      receivedDate: data.receivedDate ? data.receivedDate.toISOString() : null,
      renewalDate: data.renewalDate ? data.renewalDate.toISOString() : null,
    };

    if (isEditing && income) {
      updateIncomeEntry.mutate(
        {
          id: income.id,
          data: {
            ...payload,
            frequency: payload.frequency as UpdateIncomeEntryBodyFrequency,
            status: payload.status as UpdateIncomeEntryBodyStatus,
          },
        },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createIncome.mutate(
        {
          data: {
            ...payload,
            frequency: payload.frequency as CreateIncomeBodyFrequency,
          },
        },
        { onSuccess: () => onOpenChange(false) }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Income" : "Add Income"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Income Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Client Retainer, Consulting Fee" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CURRENCIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Consulting, Product" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="one_time">One Time</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isEditing && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="receivedDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Received Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {frequency !== "one_time" && (
                <FormField
                  control={form.control}
                  name="renewalDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Next Renewal</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional details here..."
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createIncome.isPending || updateIncomeEntry.isPending}>
                {isEditing ? "Save Changes" : "Add Income"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
