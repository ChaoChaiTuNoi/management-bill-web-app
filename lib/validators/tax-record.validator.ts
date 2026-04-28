import { z } from "zod";
import { dateRangeWithPaginationSchema } from "./common.validator";

export const createTaxRecordSchema = z.object({
  taxType: z.string().min(2),
  billName: z.string().min(2),
  amount: z.coerce.number().positive(),
  taxDate: z.coerce.date()
});

export const updateTaxRecordSchema = createTaxRecordSchema;

export const listTaxRecordQuerySchema = dateRangeWithPaginationSchema;

export type CreateTaxRecordInput = z.infer<typeof createTaxRecordSchema>;
export type UpdateTaxRecordInput = z.infer<typeof updateTaxRecordSchema>;
