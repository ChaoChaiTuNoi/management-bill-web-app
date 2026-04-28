import { NextRequest, NextResponse } from "next/server";
import { StoreTransactionService } from "@/lib/services/store-transaction.service";
import { handleApiError } from "@/lib/utils/http";
import { toPlainJson } from "@/lib/utils/serialize";
import { updateStoreTransactionSchema } from "@/lib/validators/store-transaction.validator";

const service = new StoreTransactionService();

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const json = await request.json();
    const payload = updateStoreTransactionSchema.parse(json);
    const updated = await service.updateStoreTransaction(id, payload);
    return NextResponse.json(toPlainJson(updated));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await service.deleteStoreTransaction(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
