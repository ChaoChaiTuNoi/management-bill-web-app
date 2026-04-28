import { NextRequest, NextResponse } from "next/server";
import { TaxRecordService } from "@/lib/services/tax-record.service";
import { handleApiError } from "@/lib/utils/http";
import { updateTaxRecordSchema } from "@/lib/validators/tax-record.validator";
import { toPlainJson } from "@/lib/utils/serialize";

const service = new TaxRecordService();

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const json = await request.json();
    const payload = updateTaxRecordSchema.parse(json);
    const updated = await service.updateTaxRecord(id, payload);
    return NextResponse.json(toPlainJson(updated));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await service.deleteTaxRecord(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
