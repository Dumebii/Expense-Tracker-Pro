import { useQueryClient, useMutation } from "@tanstack/react-query";
import {
  useCreateExpense as useGeneratedCreateExpense,
  useUpdateExpense as useGeneratedUpdateExpense,
  useDeleteExpense as useGeneratedDeleteExpense,
  useCancelExpense as useGeneratedCancelExpense,
  getListExpensesQueryKey,
  getGetExpenseSummaryQueryKey,
  getGetExpenseQueryKey,
  getListReceiptsQueryKey
} from "@workspace/api-client-react";

export function useExpensesMutations() {
  const queryClient = useQueryClient();

  const invalidateExpenseQueries = () => {
    queryClient.invalidateQueries({ queryKey: getListExpensesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetExpenseSummaryQueryKey() });
  };

  const createExpense = useGeneratedCreateExpense({
    mutation: {
      onSuccess: () => {
        invalidateExpenseQueries();
      }
    }
  });

  const updateExpense = useGeneratedUpdateExpense({
    mutation: {
      onSuccess: (data) => {
        invalidateExpenseQueries();
        queryClient.invalidateQueries({ queryKey: getGetExpenseQueryKey(data.id) });
      }
    }
  });

  const deleteExpense = useGeneratedDeleteExpense({
    mutation: {
      onSuccess: (_, variables) => {
        invalidateExpenseQueries();
        queryClient.removeQueries({ queryKey: getGetExpenseQueryKey(variables.id) });
      }
    }
  });

  const cancelExpense = useGeneratedCancelExpense({
    mutation: {
      onSuccess: (data) => {
        invalidateExpenseQueries();
        queryClient.invalidateQueries({ queryKey: getGetExpenseQueryKey(data.id) });
      }
    }
  });

  const generateReceipt = useMutation({
    mutationFn: async ({ id, emailTo }: { id: number; emailTo?: string }) => {
      const url = `/api/expenses/${id}/receipt${emailTo ? `?emailTo=${encodeURIComponent(emailTo)}` : ""}`;
      const res = await fetch(url, { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate receipt");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListReceiptsQueryKey() });
    }
  });

  return {
    createExpense,
    updateExpense,
    deleteExpense,
    cancelExpense,
    generateReceipt
  };
}
