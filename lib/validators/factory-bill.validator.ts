import { z } from "zod";
import { dateRangeWithPaginationSchema } from "./common.validator";

export const createFactoryBillSchema = z.object({
  productId: z.string().uuid(),
  pricePerUnit: z.coerce.number().positive(),
  totalPrice: z.coerce.number().positive(),
  weightKg: z.coerce.number().positive(),
  billDate: z.coerce.date()
});

export const updateFactoryBillSchema = createFactoryBillSchema;

export const listFactoryBillQuerySchema = dateRangeWithPaginationSchema.extend({
  categoryId: z.string().uuid().optional()
});

export type CreateFactoryBillInput = z.infer<typeof createFactoryBillSchema>;
export type ListFactoryBillQueryInput = z.infer<typeof listFactoryBillQuerySchema>;
export type UpdateFactoryBillInput = z.infer<typeof updateFactoryBillSchema>;
