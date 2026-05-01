import { TransactionType } from "@prisma/client";
import { z } from "zod";
import { dateRangeWithPaginationSchema } from "./common.validator";

export const createStoreTransactionSchema = z.object({
  productId: z.string().uuid(),
  pricePerUnit: z.coerce.number().positive(),
  totalPrice: z.coerce.number().positive(),
  weightKg: z.coerce.number().positive(),
  transactionType: z.nativeEnum(TransactionType),
  billDate: z.coerce.date()
});

export const updateStoreTransactionSchema = createStoreTransactionSchema;

export const listStoreTransactionQuerySchema = dateRangeWithPaginationSchema.extend({
  transactionType: z.nativeEnum(TransactionType).optional(),
  categoryId: z.string().uuid().optional(),
  search: z.string().trim().min(1).max(100).optional(),
  sortBy: z.enum(["billDate", "totalPrice", "productName"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional()
});

export type CreateStoreTransactionInput = z.infer<typeof createStoreTransactionSchema>;
export type UpdateStoreTransactionInput = z.infer<typeof updateStoreTransactionSchema>;
