import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateExpense as useGeneratedCreateExpense,
  useUpdateExpense as useGeneratedUpdateExpense,
  useDeleteExpense as useGeneratedDeleteExpense,
  useCancelExpense as useGeneratedCancelExpense,
  useGenerateReceipt as useGeneratedGenerateReceipt,
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

  const generateReceipt = useGeneratedGenerateReceipt({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListReceiptsQueryKey() });
      }
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
