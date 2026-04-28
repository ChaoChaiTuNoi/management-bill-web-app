import { TransactionType } from "@prisma/client";
import { FactoryBillRepository } from "@/lib/repositories/factory-bill.repository";
import { StoreTransactionRepository } from "@/lib/repositories/store-transaction.repository";
import { TaxRecordRepository } from "@/lib/repositories/tax-record.repository";
import { DashboardSummary } from "@/types/domain";

const factoryRepo = new FactoryBillRepository();
const storeRepo = new StoreTransactionRepository();
const taxRepo = new TaxRecordRepository();

export class DashboardService {
  async getSummary(params: { startDate?: Date; endDate?: Date }): Promise<DashboardSummary> {
    const { startDate, endDate } = params;

    const [totalFactoryIncome, totalStoreIncome, totalExpense, totalTax] = await Promise.all([
      factoryRepo.sumTotalPriceByDateRange(startDate, endDate),
      storeRepo.sumByType(startDate, endDate, TransactionType.INCOME),
      storeRepo.sumByType(startDate, endDate, TransactionType.EXPENSE),
      taxRepo.sumAmountByDateRange(startDate, endDate)
    ]);

    return {
      totalFactoryIncome,
      totalStoreIncome,
      totalExpense,
      totalTax
    };
  }
}
