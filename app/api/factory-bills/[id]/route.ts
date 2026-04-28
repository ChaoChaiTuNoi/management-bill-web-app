import { NextRequest, NextResponse } from "next/server";
import { FactoryBillService } from "@/lib/services/factory-bill.service";
import { handleApiError } from "@/lib/utils/http";
import { toPlainJson } from "@/lib/utils/serialize";
import { updateFactoryBillSchema } from "@/lib/validators/factory-bill.validator";

const service = new FactoryBillService();

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const json = await request.json();
    const payload = updateFactoryBillSchema.parse(json);
    const updated = await service.updateFactoryBill(id, payload);
    return NextResponse.json(toPlainJson(updated));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await service.deleteFactoryBill(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
