import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateIncome as useGeneratedCreateIncome,
  useUpdateIncomeEntry as useGeneratedUpdateIncomeEntry,
  useDeleteIncomeEntry as useGeneratedDeleteIncomeEntry,
  useCancelIncomeEntry as useGeneratedCancelIncomeEntry,
  getListIncomeQueryKey,
  getGetIncomeSummaryQueryKey,
  getGetIncomeEntryQueryKey,
  getGetFinancialOverviewQueryKey,
} from "@workspace/api-client-react";

export function useIncomeMutations() {
  const queryClient = useQueryClient();

  const invalidateIncomeQueries = () => {
    queryClient.invalidateQueries({ queryKey: getListIncomeQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetIncomeSummaryQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetFinancialOverviewQueryKey() });
  };

  const createIncome = useGeneratedCreateIncome({
    mutation: {
      onSuccess: () => {
        invalidateIncomeQueries();
      },
    },
  });

  const updateIncomeEntry = useGeneratedUpdateIncomeEntry({
    mutation: {
      onSuccess: (data) => {
        invalidateIncomeQueries();
        queryClient.invalidateQueries({ queryKey: getGetIncomeEntryQueryKey(data.id) });
      },
    },
  });

  const deleteIncomeEntry = useGeneratedDeleteIncomeEntry({
    mutation: {
      onSuccess: (_, variables) => {
        invalidateIncomeQueries();
        queryClient.removeQueries({ queryKey: getGetIncomeEntryQueryKey(variables.id) });
      },
    },
  });

  const cancelIncomeEntry = useGeneratedCancelIncomeEntry({
    mutation: {
      onSuccess: (data) => {
        invalidateIncomeQueries();
        queryClient.invalidateQueries({ queryKey: getGetIncomeEntryQueryKey(data.id) });
      },
    },
  });

  return {
    createIncome,
    updateIncomeEntry,
    deleteIncomeEntry,
    cancelIncomeEntry,
  };
}
