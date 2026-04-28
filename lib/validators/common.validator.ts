import { z } from "zod";

export const dateRangeQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional()
});

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().min(0).optional()
});

export const dateRangeWithPaginationSchema = dateRangeQuerySchema.merge(paginationQuerySchema);
