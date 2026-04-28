import { TransactionType } from "@prisma/client";
import { AppError } from "@/lib/utils/http";
import { MasterDataRepository } from "@/lib/repositories/master-data.repository";
import { StoreTransactionRepository } from "@/lib/repositories/store-transaction.repository";
import { CreateStoreTransactionInput, UpdateStoreTransactionInput } from "@/lib/validators/store-transaction.validator";

const masterDataRepository = new MasterDataRepository();
const storeTransactionRepository = new StoreTransactionRepository();

export class StoreTransactionService {
  async createStoreTransaction(payload: CreateStoreTransactionInput) {
    const product = await masterDataRepository.findProductById(payload.productId);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    return storeTransactionRepository.create(payload);
  }

  async listStoreTransactions(query: {
    startDate?: Date;
    endDate?: Date;
    transactionType?: TransactionType;
    categoryId?: string;
    limit?: number;
    offset?: number;
  }) {
    return storeTransactionRepository.findAll(query);
  }

  async updateStoreTransaction(id: string, payload: UpdateStoreTransactionInput) {
    const product = await masterDataRepository.findProductById(payload.productId);
    if (!product) {
      throw new AppError("Product not found", 404);
    }
    return storeTransactionRepository.updateById(id, payload);
  }

  async deleteStoreTransaction(id: string) {
    return storeTransactionRepository.deleteById(id);
  }
}
