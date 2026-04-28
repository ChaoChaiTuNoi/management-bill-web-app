import { z } from "zod";
import { paginationQuerySchema } from "./common.validator";

export const createCategorySchema = z.object({
  name: z.string().min(2).max(120)
});

export const createProductSchema = z.object({
  name: z.string().min(2).max(120),
  categoryId: z.string().uuid()
});

export const updateProductSchema = createProductSchema;

export const listProductQuerySchema = paginationQuerySchema.extend({
  categoryId: z.string().uuid().optional()
});
