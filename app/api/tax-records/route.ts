import { NextRequest, NextResponse } from "next/server";
import { TaxRecordService } from "@/lib/services/tax-record.service";
import { handleApiError } from "@/lib/utils/http";
import { toPlainJson } from "@/lib/utils/serialize";
import { createTaxRecordSchema, listTaxRecordQuerySchema } from "@/lib/validators/tax-record.validator";

const service = new TaxRecordService();

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const payload = createTaxRecordSchema.parse(json);
    const created = await service.createTaxRecord(payload);
    return NextResponse.json(toPlainJson(created), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const query = listTaxRecordQuerySchema.parse(searchParams);
    const items = await service.listTaxRecords(query);
    return NextResponse.json(toPlainJson(items));
  } catch (error) {
    return handleApiError(error);
  }
}
