import { NextRequest, NextResponse } from "next/server";
import { MasterDataService } from "@/lib/services/master-data.service";
import { handleApiError } from "@/lib/utils/http";
import { toPlainJson } from "@/lib/utils/serialize";
import { updateProductSchema } from "@/lib/validators/master-data.validator";

const service = new MasterDataService();

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const json = await request.json();
    const payload = updateProductSchema.parse(json);
    const updated = await service.updateProduct(id, payload);
    return NextResponse.json(toPlainJson(updated));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await service.deleteProduct(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
