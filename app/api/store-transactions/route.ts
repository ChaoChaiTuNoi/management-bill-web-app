import { NextRequest, NextResponse } from "next/server";
import { StoreTransactionService } from "@/lib/services/store-transaction.service";
import { handleApiError } from "@/lib/utils/http";
import { toPlainJson } from "@/lib/utils/serialize";
import {
  createStoreTransactionSchema,
  listStoreTransactionQuerySchema
} from "@/lib/validators/store-transaction.validator";

const service = new StoreTransactionService();

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const payload = createStoreTransactionSchema.parse(json);
    const created = await service.createStoreTransaction(payload);
    return NextResponse.json(toPlainJson(created), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const query = listStoreTransactionQuerySchema.parse(searchParams);
    const items = await service.listStoreTransactions(query);
    return NextResponse.json(toPlainJson(items));
  } catch (error) {
    return handleApiError(error);
  }
}
