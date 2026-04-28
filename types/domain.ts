export type DateRange = {
  startDate?: Date;
  endDate?: Date;
};

export type DashboardSummary = {
  totalFactoryIncome: number;
  totalStoreIncome: number;
  totalExpense: number;
  totalTax: number;
};

export type PaginationParams = {
  limit?: number;
  offset?: number;
};
